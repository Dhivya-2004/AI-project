/**
 * Mock AI service for resume analysis, job matching, and other AI features.
 * Replace with real OpenAI API calls when an API key is available.
 */

export interface ResumeAnalysis {
  atsScore: number;
  extractedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  experience: { years: number; level: string };
  education: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  email?: string;
  phone?: string;
}

export interface JobMatch {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  salary: string;
  description: string;
}

export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tip: string;
}

const TECH_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Java", "C++", "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker",
  "Kubernetes", "AWS", "Azure", "GCP", "Git", "CI/CD", "GraphQL",
  "REST APIs", "Microservices", "Machine Learning", "TensorFlow", "PyTorch",
  "Data Analysis", "Tableau", "Excel", "Figma", "UI/UX Design",
  "Agile", "Scrum", "Project Management", "Communication", "Leadership",
];

const SUGGESTIONS = [
  "Add quantifiable achievements to your experience section (e.g., 'Increased performance by 40%')",
  "Include a professional summary at the top of your resume",
  "Use action verbs to start each bullet point (e.g., 'Developed', 'Led', 'Optimized')",
  "Tailor your skills section to match the job description keywords",
  "Add links to your GitHub, portfolio, or LinkedIn profile",
  "Ensure consistent formatting throughout the document",
  "Include relevant certifications and online courses",
  "Keep resume to 1-2 pages maximum",
  "Use a clean, ATS-friendly template without complex graphics",
  "Spell-check and grammar-check your entire resume",
];

function extractSkillsFromText(text: string): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  for (const skill of TECH_SKILLS) {
    if (lowerText.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }
  // Add some random skills to simulate more extraction
  const extras = TECH_SKILLS.filter(s => !found.includes(s)).slice(0, 3);
  return [...found, ...extras].slice(0, 12);
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  // Check if real OpenAI API key is available
  if (process.env.OPENAI_API_KEY) {
    return await analyzeWithOpenAI(resumeText);
  }

  // Mock analysis
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

  const extractedSkills = extractSkillsFromText(resumeText);
  const allSkills = TECH_SKILLS.filter(s => !extractedSkills.includes(s));
  const missingSkills = allSkills.slice(0, 6);

  // Calculate mock ATS score based on content richness
  const wordCount = resumeText.split(" ").length;
  const baseScore = Math.min(45 + Math.floor(wordCount / 20), 75);
  const skillBonus = Math.min(extractedSkills.length * 2, 20);
  const atsScore = Math.min(baseScore + skillBonus, 95);

  const shuffled = [...SUGGESTIONS].sort(() => Math.random() - 0.5);

  // Extract email and phone using RegExp
  const emailMatch = resumeText.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const phoneMatch = resumeText.match(/(\+91[- ]?)?[6-9]\d{9}/) || resumeText.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);

  return {
    atsScore,
    extractedSkills,
    missingSkills,
    suggestions: shuffled.slice(0, 5),
    experience: {
      years: Math.floor(Math.random() * 8) + 1,
      level: atsScore > 75 ? "Senior" : atsScore > 60 ? "Mid-level" : "Junior",
    },
    education: "Bachelor's degree detected",
    summary: "Your resume shows strong technical skills with room for improvement in presentation and ATS optimization.",
    strengths: [
      "Strong technical skill set",
      "Relevant work experience",
      "Good educational background",
    ],
    improvements: [
      "Add more quantifiable achievements",
      "Optimize for ATS keywords",
      "Strengthen professional summary",
    ],
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
  };
}

async function analyzeWithOpenAI(resumeText: string): Promise<ResumeAnalysis> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert ATS (Applicant Tracking System) and resume analyzer. 
        Analyze the given resume and return a JSON response with the following structure:
        {
          "atsScore": number (0-100),
          "extractedSkills": string[],
          "missingSkills": string[] (common skills not found),
          "suggestions": string[] (5 improvement suggestions),
          "experience": { "years": number, "level": "Junior|Mid-level|Senior" },
          "education": string,
          "summary": string,
          "strengths": string[],
          "improvements": string[]
        }`,
      },
      { role: "user", content: `Analyze this resume:\n\n${resumeText}` },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function getJobRecommendations(skills: string[]): Promise<JobMatch[]> {
  if (process.env.OPENAI_API_KEY) {
    return await getJobsWithOpenAI(skills);
  }

  await new Promise(resolve => setTimeout(resolve, 800));

  const jobTitles = [
    "Senior Frontend Developer", "Full Stack Engineer", "React Developer",
    "Software Engineer", "Backend Developer", "DevOps Engineer",
    "Data Engineer", "ML Engineer", "Product Manager", "UX Designer",
  ];

  const companies = [
    "TechCorp Inc.", "InnovateLab", "DataDriven Co.", "CloudFirst",
    "StartupHub", "DigitalWave", "FutureTech", "CodeCraft", "NetSolutions", "ByteWorks",
  ];

  return jobTitles.slice(0, 6).map((title, i) => {
    const matchedCount = Math.floor(Math.random() * 4) + 3;
    const matched = skills.slice(0, matchedCount);
    const missing = TECH_SKILLS.filter(s => !skills.includes(s)).slice(0, 3);
    const matchScore = Math.floor(60 + Math.random() * 35);

    return {
      title,
      company: companies[i],
      location: ["Remote", "New York, NY", "San Francisco, CA", "Austin, TX", "Seattle, WA", "Chicago, IL"][i % 6],
      matchScore,
      matchedSkills: matched,
      missingSkills: missing,
      salary: `$${80 + Math.floor(Math.random() * 80)}k - $${140 + Math.floor(Math.random() * 60)}k`,
      description: `We are looking for a talented ${title} to join our growing team. You will work on exciting projects using modern technologies.`,
    };
  });
}

async function getJobsWithOpenAI(skills: string[]): Promise<JobMatch[]> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Generate 6 realistic job recommendations as JSON array based on the provided skills. Each job: { title, company, location, matchScore (60-99), matchedSkills, missingSkills, salary, description }",
      },
      { role: "user", content: `Skills: ${skills.join(", ")}` },
    ],
    response_format: { type: "json_object" },
  });

  const data = JSON.parse(response.choices[0].message.content || "{}");
  return data.jobs || [];
}

export async function generateInterviewQuestions(
  position: string,
  skills: string[]
): Promise<InterviewQuestion[]> {
  if (process.env.OPENAI_API_KEY) {
    return await getInterviewQuestionsWithOpenAI(position, skills);
  }

  await new Promise(resolve => setTimeout(resolve, 600));

  return [
    {
      question: `Tell me about your experience with ${skills[0] || "your primary technology"}?`,
      category: "Technical",
      difficulty: "Medium",
      tip: "Give specific examples of projects you built and problems you solved.",
    },
    {
      question: "Describe a challenging problem you solved and how you approached it.",
      category: "Problem Solving",
      difficulty: "Medium",
      tip: "Use the STAR method: Situation, Task, Action, Result.",
    },
    {
      question: "How do you stay up-to-date with the latest trends in your field?",
      category: "Behavioral",
      difficulty: "Easy",
      tip: "Mention specific resources: blogs, conferences, open-source contributions.",
    },
    {
      question: `How would you optimize a slow ${skills[1] || "application"} for better performance?`,
      category: "Technical",
      difficulty: "Hard",
      tip: "Discuss profiling tools, caching strategies, and architectural improvements.",
    },
    {
      question: "Describe your experience working in a team environment.",
      category: "Behavioral",
      difficulty: "Easy",
      tip: "Highlight collaboration, communication, and conflict resolution examples.",
    },
    {
      question: `Walk me through how you would design a scalable ${position} system.`,
      category: "System Design",
      difficulty: "Hard",
      tip: "Think about scalability, reliability, maintainability, and trade-offs.",
    },
  ];
}

async function getInterviewQuestionsWithOpenAI(
  position: string,
  skills: string[]
): Promise<InterviewQuestion[]> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Generate 6 interview questions as JSON. Each: { question, category, difficulty (Easy/Medium/Hard), tip }",
      },
      {
        role: "user",
        content: `Position: ${position}, Skills: ${skills.join(", ")}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const data = JSON.parse(response.choices[0].message.content || "{}");
  return data.questions || [];
}

export async function generateCoverLetter(
  name: string,
  position: string,
  company: string,
  skills: string[],
  experience: string
): Promise<string> {
  if (process.env.OPENAI_API_KEY) {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Write a professional, compelling cover letter.",
        },
        {
          role: "user",
          content: `Name: ${name}, Position: ${position}, Company: ${company}, Skills: ${skills.join(", ")}, Experience: ${experience}`,
        },
      ],
    });
    return response.choices[0].message.content || "";
  }

  await new Promise(resolve => setTimeout(resolve, 800));

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${position} position at ${company}. With my expertise in ${skills.slice(0, 3).join(", ")}, I am confident that I would be a valuable addition to your team.

${experience ? `Throughout my career, ${experience}. ` : ""}I have consistently demonstrated my ability to deliver high-quality solutions while collaborating effectively with cross-functional teams.

What excites me most about ${company} is the opportunity to work on innovative projects that make a real impact. My technical skills in ${skills.slice(0, 5).join(", ")} align perfectly with the requirements of this role, and I am eager to bring my expertise to your organization.

I am particularly drawn to ${company}'s reputation for excellence and innovation. I believe my background and passion for technology make me an ideal candidate for this position.

I would welcome the opportunity to discuss how my skills and experience can contribute to ${company}'s continued success. Thank you for considering my application.

Best regards,
${name}`;
}

export async function generateSkillRoadmap(
  currentSkills: string[],
  targetRole: string
): Promise<{ phase: string; skills: string[]; duration: string; resources: string[] }[]> {
  await new Promise(resolve => setTimeout(resolve, 600));

  return [
    {
      phase: "Foundation (Month 1-2)",
      skills: ["Data Structures & Algorithms", "System Design Basics", "Git & Version Control"],
      duration: "2 months",
      resources: ["LeetCode", "System Design Primer", "GitHub Learning Lab"],
    },
    {
      phase: "Core Skills (Month 3-4)",
      skills: currentSkills.slice(0, 2).concat(["REST API Design", "Database Optimization"]),
      duration: "2 months",
      resources: ["Official Documentation", "Udemy Courses", "freeCodeCamp"],
    },
    {
      phase: "Advanced Topics (Month 5-6)",
      skills: ["Cloud Deployment", "CI/CD Pipelines", "Performance Optimization", "Security Best Practices"],
      duration: "2 months",
      resources: ["AWS/Azure Documentation", "DevOps Roadmap", "OWASP Guidelines"],
    },
    {
      phase: "Specialization (Month 7-8)",
      skills: [`${targetRole} Frameworks`, "Industry Projects", "Open Source Contribution"],
      duration: "2 months",
      resources: ["GitHub", "Dev.to", "Tech Conferences"],
    },
  ];
}
