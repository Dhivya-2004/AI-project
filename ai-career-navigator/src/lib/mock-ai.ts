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
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  educationDetails?: Array<{
    degree?: string;
    institution?: string;
    year?: string;
  }>;
  experienceDetails?: Array<{
    role?: string;
    company?: string;
    duration?: string;
    description?: string[];
  }>;
  certifications?: string[];
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
