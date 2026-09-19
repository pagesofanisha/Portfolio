/**
 * Portfolio Profile Configuration
 * Update this file to easily modify your portfolio details without touching core HTML/CSS.
 */

export const profileConfig = {
  personal: {
    name: "Anisha Vanjinathan",
    preferredName: "Anisha",
    role: "Full-Stack Developer & Aspiring EdTech Founder",
    greeting: "Hey, I'm Anisha Vanjinathan",
    tagline: "B.Tech CSBS 2nd Year @ SRM IST Ramapuram • Freelance Engineer • Future Founder",
    heroQuote: "Great technology should feel effortless. Bridging computer science and business strategy to build high-impact digital products and the next generation of EdTech.",
    email: "anisha8020@gmail.com",
    location: "Chennai, Tamil Nadu, India",
    heroImage: "/uploads/photo_1789806319224.jpg",
    education: {
      institution: "SRM Institute of Science and Technology, Ramapuram",
      degree: "B.Tech in Computer Science and Business Systems (CSBS)",
      year: "2nd Year Undergraduate (Class of 2028)",
      focus: "Full-Stack Web Dev, UI/UX Engineering, Data Structures, Business Analytics"
    },
    socials: {
      github: "https://github.com/pagesofanisha",
      linkedin: "https://www.linkedin.com/in/anishaaaaaaaaa",
      twitter: "https://x.com",
      instagram: "https://www.instagram.com/pages_of_anisha/?hl=en"
    }
  },

  pillars: [
    { number: "01", title: "CSBS Engineering", subtitle: "SRM IST Ramapuram" },
    { number: "02", title: "Freelance Solutions", subtitle: "Web Apps & MVPs" },
    { number: "03", title: "UI/UX & Product Design", subtitle: "Framer & Figma" },
    { number: "04", title: "EdTech Startup Lab", subtitle: "Building the Future" }
  ],

  techStack: [
    { name: "React.js", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "TypeScript", category: "Languages" },
    { name: "Node.js", category: "Backend" },
    { name: "Python", category: "Backend / AI" },
    { name: "Tailwind CSS", category: "Design" },
    { name: "Figma", category: "UI/UX" },
    { name: "PostgreSQL / MongoDB", category: "Database" },
    { name: "Git / GitHub", category: "Tools" }
  ],

  stats: [
    { value: "2nd", label: "Year B.Tech CSBS" },
    { value: "15+", label: "Projects Completed" },
    { value: "100%", label: "Client Satisfaction" },
    { value: "1", label: "EdTech Startup in Stealth" }
  ],

  aboutTabs: [
    {
      id: "student",
      title: "College Student",
      badge: "SRM IST Ramapuram",
      description: "Currently pursuing B.Tech in Computer Science and Business Systems (CSBS) in my 2nd year. I combine analytical computing fundamentals with business insights, turning theoretical concepts into real, working applications through active hackathons and campus initiatives."
    },
    {
      id: "freelancer",
      title: "Freelance Engineer",
      badge: "Global Clients & Startups",
      description: "Helping brands, creators, and early-stage companies bring their digital vision to life. I specialize in rapid MVP engineering, ultra-responsive modern websites, and interactive interfaces that convert visitors into loyal customers."
    },
    {
      id: "founder",
      title: "Future Founder",
      badge: "EdTech Visionary",
      description: "Passionate about transforming education. I am actively researching and prototyping an AI-assisted peer learning platform tailored for engineering students to bridge university theory with industry-ready skills."
    }
  ],

  projects: [
    {
      id: "skillpulse",
      title: "SkillPulse AI - EdTech Platform",
      category: "startup",
      categoryLabel: "Startup Prototype",
      year: "2026",
      tagline: "AI-driven personalized learning roadmap and peer study rooms for engineering students.",
      description: "My flagship startup project. SkillPulse analyzes a college student's curriculum and current skillset to generate real-time roadmaps, interactive coding challenges, and peer-to-peer accountability rooms.",
      tags: ["React", "Node.js", "AI / LLM API", "Tailwind CSS", "PostgreSQL"],
      image: "assets/project-edtech.svg",
      featured: true,
      liveUrl: "#",
      githubUrl: "#"
    },
    {
      id: "lumina-mvp",
      title: "Lumina Brand Storefront",
      category: "freelance",
      categoryLabel: "Freelance Client",
      year: "2025",
      tagline: "Ultra-fast headless e-commerce experience with seamless mobile checkout.",
      description: "Delivered a high-conversion e-commerce web platform for a boutique lifestyle brand, featuring dynamic catalog filtering, instant cart drawer, and 98+ PageSpeed performance.",
      tags: ["Next.js", "TypeScript", "Stripe API", "Framer Motion"],
      image: "assets/project-ecommerce.svg",
      featured: true,
      liveUrl: "#",
      githubUrl: "#"
    },
    {
      id: "campussync",
      title: "CampusSync - SRM Student Hub",
      category: "college",
      categoryLabel: "College & Hackathon",
      year: "2025",
      tagline: "A collaborative student portal for hackathon team-finding, notes, and events.",
      description: "Built for SRM IST Ramapuram students to easily discover hackathon partners based on skill tags, share verified lecture notes, and track internal department events in real time.",
      tags: ["React", "Express.js", "MongoDB", "Tailwind"],
      image: "assets/project-campus.svg",
      featured: true,
      liveUrl: "#",
      githubUrl: "#"
    },
    {
      id: "codecraft-ui",
      title: "CodeCraft Design System",
      category: "freelance",
      categoryLabel: "Freelance Design",
      year: "2025",
      tagline: "Comprehensive Figma & Web design kit for interactive learning tools.",
      description: "Designed and developed a 40+ component design system used by online education creators, featuring accessible dark-mode variants, code editors, and animated reward badges.",
      tags: ["Figma", "UI/UX", "Tailwind CSS", "Storybook"],
      image: "assets/project-design.svg",
      featured: false,
      liveUrl: "#",
      githubUrl: "#"
    },
    {
      id: "evaluator-ai",
      title: "CSBS AutoGrader & Evaluator",
      category: "college",
      categoryLabel: "College Project",
      year: "2025",
      tagline: "Automated business logic and code review engine for CSBS coursework.",
      description: "Created an intelligent test runner and code analyzer to assist students in evaluating assignment logic against test cases with actionable debugging suggestions.",
      tags: ["Python", "FastAPI", "Docker", "Algorithms"],
      image: "assets/project-evaluator.svg",
      featured: false,
      liveUrl: "#",
      githubUrl: "#"
    },
    {
      id: "zenith-landing",
      title: "Zenith Studio Showcase",
      category: "freelance",
      categoryLabel: "Freelance Client",
      year: "2025",
      tagline: "Award-worthy dark aesthetic portfolio for a creative agency.",
      description: "Designed and implemented a fluid, responsive landing page featuring smooth micro-interactions, scroll-driven storytelling, and responsive layouts across all mobile screens.",
      tags: ["HTML5", "Modern CSS", "JavaScript", "GSAP"],
      image: "assets/project-agency.svg",
      featured: false,
      liveUrl: "#",
      githubUrl: "#"
    }
  ],

  services: [
    {
      number: "01",
      title: "Full-Stack Web Development",
      description: "Modern, responsive, blazing-fast web applications built with React, Next.js, and Node.js. Clean code architecture designed to scale with your business.",
      deliverables: ["Responsive Web Apps", "API Integration", "Database Architecture", "Performance Optimization"]
    },
    {
      number: "02",
      title: "Startup MVP in 14 Days",
      description: "Fast-track your startup idea from concept to launch. I build lean, high-fidelity prototypes and clickable MVPs ready for initial customers or investor demos.",
      deliverables: ["Product Scoping", "Rapid Prototyping", "User Auth & Payments", "Production Deployment"]
    },
    {
      number: "03",
      title: "UI/UX & Framer Design",
      description: "Visually stunning, conversion-focused digital designs. I craft intuitive user interfaces, custom landing pages, and interactive design systems in Figma and code.",
      deliverables: ["Landing Page Design", "Mobile-First UX", "Design Systems", "Interactive Prototypes"]
    },
    {
      number: "04",
      title: "CSBS Tech & Business Strategy",
      description: "Leveraging my Computer Science & Business Systems background to help early founders evaluate technical feasibility, product market fit, and tech stack choices.",
      deliverables: ["Tech Stack Selection", "System Architecture", "Product Roadmap", "College Tech Consulting"]
    }
  ],

  startupLab: {
    badge: "Stealth Venture in Incubation",
    headline: "Reimagining How Students Learn, Build, and Launch",
    subheadline: "An EdTech platform born inside SRM IST, dedicated to bridging the gap between college curriculum and industry readiness.",
    problem: "Most engineering students struggle to transition from academic textbook theory to building actual production software and landing freelance clients or tech jobs.",
    solution: "We're crafting an AI-guided, project-centric learning ecosystem with real-world sprints, instant code feedback, and peer collaboration rooms.",
    cta: "Join the Early Access Waitlist"
  }
};

