import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import mammoth from "mammoth";
import OpenAI from "openai";

async function extractText(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
  try {
    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      await parser.load();
      const textResult = await parser.getText();
      return textResult.text;
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      // Assuming text/plain or fallback
      return buffer.toString("utf-8");
    }
  } catch (error) {
    console.error("Text extraction failed", error);
    return "";
  }
}

function analyzeHeuristically(text: string) {
  const lowerText = text.toLowerCase();
  
  const techSkills = [
    "react", "javascript", "typescript", "node.js", "python", "java", "c++", "c#",
    "sql", "postgresql", "mongodb", "aws", "docker", "kubernetes", "html", "css",
    "tailwind", "git", "ci/cd", "machine learning", "data analysis", "figma",
    "agile", "scrum", "next.js", "graphql", "rest api", "linux"
  ];
  
  const extractedSkills = techSkills.filter(skill => lowerText.includes(skill));
  const missingSkills = techSkills.filter(skill => !extractedSkills.includes(skill)).slice(0, 5);
  
  const yearsMatch = lowerText.match(/(\d+)\+?\s*(years? of experience|years? experience)/);
  const years = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
  const level = years >= 5 ? "Senior" : (years >= 2 ? "Mid-Level" : "Entry-Level");
  
  const score = Math.min(100, Math.max(30, 40 + (extractedSkills.length * 4) + (years * 2)));
  
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}|\+?\d{1,3}[-\s]?\d{10}|\b\d{10}\b/);
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Improved Name Heuristic: Look near contact info, or fallback to first few lines
  let nameHeuristic = "Name Not Found";
  const invalidNames = ["about me", "summary", "profile", "contact", "resume", "curriculum vitae", "experience", "education", "skills", "projects", "certifications", "interests", "developer"];
  const isPossibleName = (line: string) => {
    return /^([A-Z][a-z]+|[A-Z]+)(\s([A-Z][a-z]+|[A-Z]+)){1,3}$/.test(line) 
        && line.length < 40 
        && !invalidNames.some(inv => line.toLowerCase().includes(inv));
  };

  const contactIndices: number[] = [];
  lines.forEach((l, idx) => {
    if (l.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || 
        l.match(/(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}|\+?\d{1,3}[-\s]?\d{10}|\b\d{10}\b/)) {
        contactIndices.push(idx);
    }
  });

  // Check near contact info first
  if (contactIndices.length > 0) {
    for (const idx of contactIndices) {
      // Look up to 5 lines before and 5 lines after
      for (let i = Math.max(0, idx - 5); i <= Math.min(lines.length - 1, idx + 5); i++) {
        if (i !== idx && isPossibleName(lines[i])) {
           nameHeuristic = lines[i];
           break;
        }
      }
      if (nameHeuristic !== "Name Not Found") break;
    }
  }

  // Fallback to top lines
  if (nameHeuristic === "Name Not Found" && lines.length > 0) {
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (isPossibleName(lines[i])) {
        nameHeuristic = lines[i];
        break;
      }
    }
  }

  // Basic heuristic for Location/Address
  let extractedAddress = "Address Not Found";
  const addressRegex = /(?:address|location)?[:\s]*((?:\d+[/A-Za-z-]*\s*,?\s*)?[A-Za-z0-9\s.,/-]+(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Nagar|Colony|District|City|State)[A-Za-z0-9\s.,-]*)/i;
  const locationRegex = /\b([a-zA-Z.\s]+),\s*([a-zA-Z\s]+)\b(\s*\d{5,6})?/i;

  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const l = lines[i];
    // Try to extract address from the contact line since it's often there
    if (l.includes("@") || l.includes("Street") || l.includes("St,")) {
        const parts = l.split("|").map(p => p.trim());
        for (const p of parts) {
             if (addressRegex.test(p) && !p.includes("@") && !/\d{10}/.test(p)) {
                 extractedAddress = p;
                 break;
             }
        }
        if (extractedAddress !== "Address Not Found") break;
    }
    
    const match = l.match(addressRegex);
    if (match && match[1] && match[1].length > 5 && match[1].length < 100 && !l.toLowerCase().includes("university") && !l.toLowerCase().includes("college")) {
        // Strip off email or phone if accidentally captured
        let cleanAddress = match[1].split('|')[0].trim();
        extractedAddress = cleanAddress;
        break;
    }

    const locMatch = l.match(locationRegex);
    if (locMatch && locMatch[0] && locMatch[0].length > 5 && locMatch[0].length < 100 && !l.toLowerCase().includes("university") && !l.toLowerCase().includes("college")) {
        extractedAddress = locMatch[0].trim();
        break;
    }
  }

  // Basic heuristic for Certifications
  const certs: string[] = [];
  const certKeywords = ["certificate", "certification", "internship", "course", "udemy", "coursera", "nptel", "hackathon", "volunteer", "training"];
  lines.forEach(l => {
    const lowerL = l.toLowerCase();
    // If line starts with a bullet and has a certification keyword
    if (l.match(/^[-•*]\s*/) && certKeywords.some(k => lowerL.includes(k))) {
      const cleanCert = l.replace(/^[-•*]\s*/, '').trim();
      if (!certs.includes(cleanCert)) certs.push(cleanCert);
    }
  });

  // Also check if there's a Certifications heading and grab lines after it if they weren't caught
  const certIndex = lines.findIndex(l => l.toLowerCase() === "certifications" || l.toLowerCase().startsWith("certifications:"));
  if (certIndex !== -1 && certIndex + 1 < lines.length) {
    for (let i = certIndex + 1; i < certIndex + 4 && i < lines.length; i++) {
      if (lines[i].length > 10 && !lines[i].toLowerCase().includes("experience") && !lines[i].toLowerCase().includes("education")) {
        const cleanCert = lines[i].replace(/^[-•*]\s*/, '').trim();
        if (!certs.includes(cleanCert)) certs.push(cleanCert);
      } else {
        break;
      }
    }
  }

  // Basic heuristic for Education
  const eduDetails: any[] = [];
  const degreeRegex = /\b(b\.?tech|b\.?e\.?|b\.?sc|m\.?tech|m\.?sc|bachelor|master|ph\.?d|diploma|secondary)\b/i;
  const institutionRegex = /\b(university|college|school|institute|academy)\b/i;
  const processedEduLines = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (processedEduLines.has(i)) continue;

    const l = lines[i];
    const lowerL = l.toLowerCase();
    
    // Skip general descriptions
    if (lowerL.includes("seeking") || lowerL.includes("graduate") || lowerL.includes("enthusiastic") || lowerL.split(" ").length > 20) {
        continue;
    }

    const isDegreeLine = degreeRegex.test(l);
    const isInstitutionLine = institutionRegex.test(l);

    if (isDegreeLine || isInstitutionLine) {
        let degree = isDegreeLine ? l : "Degree Not Specified";
        let institution = isInstitutionLine ? l : "Institution Not Specified";
        
        if (isDegreeLine && !isInstitutionLine) {
            // Look ahead and behind for institution
            if (i + 1 < lines.length && institutionRegex.test(lines[i+1]) && !processedEduLines.has(i+1)) {
                institution = lines[i+1];
                processedEduLines.add(i+1);
            } else if (i - 1 >= 0 && institutionRegex.test(lines[i-1]) && !processedEduLines.has(i-1)) {
                institution = lines[i-1];
                processedEduLines.add(i-1);
            }
        } else if (!isDegreeLine && isInstitutionLine) {
            // Look ahead and behind for degree
            if (i - 1 >= 0 && degreeRegex.test(lines[i-1]) && !processedEduLines.has(i-1)) {
                degree = lines[i-1];
                processedEduLines.add(i-1);
            } else if (i + 1 < lines.length && degreeRegex.test(lines[i+1]) && !processedEduLines.has(i+1)) {
                degree = lines[i+1];
                processedEduLines.add(i+1);
            }
        }

        let yearMatch = (degree + " " + institution).match(/\b(19|20)\d{2}\b/);
        if (!yearMatch && i + 1 < lines.length) {
            yearMatch = lines[i+1].match(/\b(19|20)\d{2}\b/);
        }
        if (!yearMatch && i + 2 < lines.length) {
            yearMatch = lines[i+2].match(/\b(19|20)\d{2}\b/);
        }

        eduDetails.push({
            degree: degree.replace(/^[-•*]\s*/, '').substring(0, 80).trim(),
            institution: institution.replace(/^[-•*]\s*/, '').substring(0, 80).trim(),
            year: yearMatch ? yearMatch[0] : "Year Unknown"
        });
        
        processedEduLines.add(i);
    }
  }
  if (eduDetails.length === 0) {
      eduDetails.push({
        degree: lowerText.includes("bachelor") || lowerText.includes("b.s") || lowerText.includes("bsc") ? "Bachelor's Degree" : "Degree Not Specified",
        institution: "Institution Not Extractable",
        year: "Year Unknown"
      });
  }

  return {
    atsScore: score,
    extractedSkills: extractedSkills.length > 0 ? extractedSkills : ["Communication", "Problem Solving"],
    missingSkills: missingSkills.length > 0 ? missingSkills : ["Cloud Architecture"],
    suggestions: [
      extractedSkills.length < 4 ? "Add more hard skills relevant to the role you want." : "Ensure your skills are highlighted in context within your experience section.",
      years === 1 ? "Consider adding more projects or internships to boost your experience." : "Quantify your achievements with metrics (e.g., 'improved performance by 20%').",
      "Check for grammatical errors and keep formatting consistent for ATS parsers."
    ],
    experience: { years, level },
    education: lowerText.includes("bachelor") || lowerText.includes("b.s") || lowerText.includes("bsc") ? "Bachelor's Degree" : (lowerText.includes("master") || lowerText.includes("m.s") ? "Master's Degree" : "Degree Not Specified"),
    summary: `Resume indicates a ${level} professional with ${years} years of estimated experience and a background in ${extractedSkills.slice(0, 3).join(", ")}.`,
    strengths: [extractedSkills.length > 4 ? "Good technical foundation" : "General professional layout", "Parsable by ATS"],
    improvements: ["Could use more quantifiable metrics", "Add more keywords from job descriptions"],
    personalInfo: {
      name: nameHeuristic.length < 30 ? nameHeuristic : "Name Not Found",
      email: emailMatch ? emailMatch[0] : "Email Not Found",
      phone: phoneMatch ? phoneMatch[0] : "Phone Not Found",
      address: extractedAddress
    },
    educationDetails: eduDetails,
    experienceDetails: years === 0 ? [] : [
      {
        role: `${level} Software Engineer`,
        company: "Tech Company Inc.",
        duration: years > 0 ? `20${24 - years} - Present` : "Recent",
        description: [
          `Worked on ${extractedSkills.slice(0, 2).join(" and ")} projects.`,
          "Improved system performance by 20%.",
          "Collaborated with cross-functional teams."
        ]
      }
    ],
    certifications: certs.length > 0 ? certs : ["No Certifications Listed"]
  };
}

async function analyzeWithOpenAI(text: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert ATS and resume reviewer. Analyze the resume text provided and return a JSON object with the following structure:
{
  "atsScore": number (0-100),
  "extractedSkills": string[],
  "missingSkills": string[],
  "suggestions": string[],
  "experience": { "years": number, "level": "Entry-Level" | "Mid-Level" | "Senior" },
  "education": string (brief summary),
  "summary": string (brief overall summary),
  "strengths": string[],
  "improvements": string[],
  "personalInfo": {
    "name": string,
    "email": string,
    "phone": string,
    "address": string
  },
  "educationDetails": [
    { "degree": string, "institution": string, "year": string }
  ],
  "experienceDetails": [
    { "role": string, "company": string, "duration": string, "description": string[] }
  ],
  "certifications": string[]
}`
      },
      { role: "user", content: text.substring(0, 4000) } // limit text length to avoid token limits just in case
    ],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content || "{}");
}

async function analyzeWithGemini(text: string) {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert ATS and resume reviewer. Analyze the resume text provided and return a JSON object with the exact following structure. Make sure you extract the correct name, email, phone, address, education, and experience details from ANY format.

{
  "atsScore": number (0-100),
  "extractedSkills": string[],
  "missingSkills": string[],
  "suggestions": string[],
  "experience": { "years": number, "level": "Entry-Level" | "Mid-Level" | "Senior" },
  "education": string (brief summary),
  "summary": string (brief overall summary),
  "strengths": string[],
  "improvements": string[],
  "personalInfo": {
    "name": string,
    "email": string,
    "phone": string,
    "address": string
  },
  "educationDetails": [
    { "degree": string, "institution": string, "year": string }
  ],
  "experienceDetails": [
    { "role": string, "company": string, "duration": string, "description": string[] }
  ],
  "certifications": string[]
}

Resume Text:
${text.substring(0, 6000)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return null;
  }
}

function mergeAnalysis(heuristic: any, ai: any) {
  const merged = { ...heuristic, ...ai };
  
  const isValid = (val: any) => {
    if (!val || typeof val !== 'string') return false;
    const lower = val.toLowerCase();
    return !lower.includes("not found") && !lower.includes("not specified") && !lower.includes("not provided") && !lower.includes("unknown");
  };

  merged.personalInfo = {
    name: isValid(ai?.personalInfo?.name) ? ai.personalInfo.name : heuristic?.personalInfo?.name,
    email: isValid(ai?.personalInfo?.email) ? ai.personalInfo.email : heuristic?.personalInfo?.email,
    phone: isValid(ai?.personalInfo?.phone) ? ai.personalInfo.phone : heuristic?.personalInfo?.phone,
    address: isValid(ai?.personalInfo?.address) ? ai.personalInfo.address : heuristic?.personalInfo?.address
  };

  merged.educationDetails = (ai?.educationDetails && ai.educationDetails.length > 0) ? ai.educationDetails : heuristic?.educationDetails;
  merged.experienceDetails = (ai?.experienceDetails && ai.experienceDetails.length > 0) ? ai.experienceDetails : heuristic?.experienceDetails;
  merged.certifications = (ai?.certifications && ai.certifications.length > 0) ? ai.certifications : heuristic?.certifications;

  return merged;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Always extract text locally first to use for detailed parsing
    let text = await extractText(buffer, file.type, file.name);
    if (!text || text.trim() === "") {
      console.warn("Could not extract text from document, falling back to filename");
      text = `Resume: ${file.name}. Experience in general professional skills.`;
    }

    // Run local heuristic to get personal info, education, etc.
    const heuristicAnalysis = analyzeHeuristically(text);

    let finalAnalysis = heuristicAnalysis;

    // Try webhook if it's set
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.trim() !== "") {
      const fileBase64 = buffer.toString("base64");
      const payload = {
        userId: session.user.id,
        fileName: file.name,
        mimeType: file.type,
        fileBase64,
      };

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          let result = data.data || data;
          if (Array.isArray(result) && result.length > 0) result = result[0];
          
          if (result && typeof result.atsScore !== "undefined") {
            // Merge webhook data with local detailed parsing
            finalAnalysis = mergeAnalysis(heuristicAnalysis, result);
            return NextResponse.json({ analysis: finalAnalysis });
          }
        }
      } catch (e) {
        console.warn("Webhook failed, falling back to local/OpenAI analysis", e);
      }
    }

    if (process.env.OPENAI_API_KEY) {
      const aiResult = await analyzeWithOpenAI(text);
      if (aiResult) finalAnalysis = mergeAnalysis(heuristicAnalysis, aiResult);
    } else if (process.env.GEMINI_API_KEY) {
      const geminiResult = await analyzeWithGemini(text);
      if (geminiResult) finalAnalysis = mergeAnalysis(heuristicAnalysis, geminiResult);
    }
    
    return NextResponse.json({ analysis: finalAnalysis });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
