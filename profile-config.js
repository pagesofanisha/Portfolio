export const profileConfig = {
  theme: {
    primaryColor: '#38bdf8',
    primaryHover: '#0ea5e9',
    accentColor: '#6366f1',
    bgMain: '#06080e',
    bgSurface: '#0d111b'
  },
  personal: {
    name: 'Anisha Vanjinathan',
    preferredName: 'Anisha',
    role: 'AI App Developer, Brand Marketer & Creative Strategist',
    institution: 'SRM IST Ramapuram, Chennai',
    degree: 'B.Tech in Computer Science and Business Systems (CSBS)',
    year: '2nd Year Undergraduate',
    email: 'anisha8020@gmail.com',
    phone: '+91 8668177527',
    location: 'Chennai, India',
    greeting: "Hello, I'm",
    headlineMain: 'Anisha Vanjinathan',
    headlineSub: 'AI App Developer, Brand Marketer & Creative Strategist',
    tagline: 'Bridging CS & Business Systems through AI-driven apps, Shopify development, storytelling, thumbnail editing and designs, and high-impact digital content.',
    ctaPrimaryText: 'Work With Me',
    ctaPrimaryLink: '#contact',
    ctaSecondaryText: 'Connect on LinkedIn',
    ctaSecondaryLink: 'https://www.linkedin.com/in/anishaaaaaaaaa',
    heroImage: 'https://atbxlkehmwjvzymqjimw.supabase.co/storage/v1/object/public/future-events/portfolio_uploads/default_portrait_anisha.jpg',
    socials: {
      linkedin: 'https://www.linkedin.com/in/anishaaaaaaaaa',
      github: 'https://github.com/pagesofanisha',
      instagram: 'https://www.instagram.com/pages_of_anisha/?hl=en',
      email: 'mailto:anisha8020@gmail.com'
    }
  },
  about: {
    badge: 'ABOUT ME',
    headline: 'Building Solutions That Make an Impact',
    bio: `I am a 2nd-year B.Tech CSBS (Computer Science & Business Systems) student at SRM IST Ramapuram, Chennai, operating at the intersection of technology, marketing, and creative arts.

As an adaptive developer and storyteller, I build AI-powered applications, construct high-converting Shopify stores, and craft strategic content for brands. My foundation in computer science, paired with business acumen and a natural aptitude for public speaking, allows me to take ideas from root-cause analysis to complete digital execution. Whether hosting seminars, pitching at hackathons, or creating visual arts like detailed Mandala artwork, I bring determination, speed, and creative clarity to every project.`,
    resumeLink: '#',
    stats: [
      { value: '2nd Year', label: 'B.Tech CSBS @ SRM IST' },
      { value: 'Available', label: 'For Freelance & Projects' },
      { value: '2nd Prize', label: 'Hackathon Award Winner' },
      { value: '50+', label: 'Creative & Tech Works' }
    ],
    cardInfo: {
      location: 'Chennai, India',
      email: 'anisha8020@gmail.com',
      phone: '+91 8668177527',
      university: 'SRM IST Ramapuram',
      languages: 'English, Tamil',
      focus: 'AI Apps, E-Commerce, Brand Growth'
    }
  },
  services: [
    {
      id: 'ai-dev',
      number: '01',
      title: 'AI App & Web Development',
      description: 'Rapid prototyping and production web apps leveraging modern frameworks, AI-assisted workflows (ChatGPT, LLMs), Python, and clean responsive front-end code.',
      deliverables: ['Interactive Web Applications', 'AI Workflow Automation', 'Modern Responsive Layouts', 'Rapid Hackathon & MVP Sprints']
    },
    {
      id: 'shopify',
      number: '02',
      title: 'Shopify & Brand E-Commerce',
      description: 'High-converting custom Shopify stores, theme customizations, brand landing pages, and frictionless mobile user journeys designed to scale sales.',
      deliverables: ['Custom Shopify Store Setup', 'Theme Customization & Code', 'Conversion Rate Optimization', 'Catalog & Checkout Flow']
    },
    {
      id: 'content',
      number: '03',
      title: 'Content Strategy & Scriptwriting',
      description: 'High-retention short-form video hooks, Instagram Reels scripting, brand storytelling, and copywriting tailored for direct-to-consumer businesses.',
      deliverables: ['Instagram Reels & Shorts Scripts', 'Personal Branding Strategy', 'High-Converting Copywriting', 'Audience Hook Architecture']
    },
    {
      id: 'design-art',
      number: '04',
      title: 'Graphic Design & Mandala Art',
      description: 'Click-worthy YouTube & Instagram thumbnail designs, video editing & photo retouching, paired with intricate, hand-crafted geometric Mandala artwork.',
      deliverables: ['YouTube & Reels Thumbnails', 'Video Editing & Color Polish', 'Geometric Mandala Artworks', 'Visual Branding Collaterals']
    }
  ],
  projectDomains: [
    { key: 'college', title: 'College & Hackathons', badge: '🏛️ Academic & Competitions', description: 'Hackathons, campus systems, and technical university engineering projects.' },
    { key: 'freelancer', title: 'Freelancer & Client Work', badge: '💼 Commercial & Brands', description: 'Paid client engagements, Shopify stores, and creative brand marketing solutions.' },
    { key: 'startup', title: 'Startup & Ventures', badge: '🚀 Innovation & MVPs', description: 'Early-stage venture prototypes and AI-driven products in incubation.' },
    { key: 'softskills', title: 'Soft Skills, Events & Arts', badge: '🎭 Speaking & Creative Arts', description: 'Technical seminar hosting, hackathon pitches, and fine Mandala artwork.' }
  ],
  projects: [
    {
      id: 'proj-campus-digital-twin',
      domain: 'college',
      title: 'Digital Twin Campus System',
      role: 'Lead Front-End Developer & AI Implementer',
      recognition: '🏆 2nd Prize Winner – SRM IST College Hackathon',
      tech: ['HTML/CSS/JS', 'VS Code', 'ChatGPT (AI-Assisted)', 'Responsive UI'],
      image: 'assets/project-campus.svg',
      description: 'Designed and built 50% of the front-end architecture for a digital twin concept designed to visualize and manage campus environments. Leveraged AI prompts and rapid prototyping tools to build functional interfaces under tight competition constraints.',
      liveUrl: '#',
      githubUrl: 'https://github.com/pagesofanisha'
    },
    {
      id: 'proj-portfolio-website',
      domain: 'college',
      title: 'Personal Fullstack Portfolio Website',
      role: 'Solo Creator (Design & Full-Stack Development)',
      recognition: '✨ Production Deployment',
      tech: ['Node.js', 'Express', 'Vite', 'Antigravity', 'Custom CMS API'],
      image: 'assets/project-design.svg',
      description: 'End-to-end design and deployment of a responsive, multi-purpose digital portfolio site with an integrated real-time editable backend CMS, custom image uploader, and domain-based project manager.',
      liveUrl: '#',
      githubUrl: 'https://github.com/pagesofanisha'
    },
    {
      id: 'proj-ishall-skincare',
      domain: 'freelancer',
      title: 'Content Strategy & Scriptwriting — Ishall Natural Skincare',
      role: 'Content Strategist & Scriptwriter (1-Month Engagement)',
      recognition: '📈 Established Brand (7+ Years)',
      tech: ['Instagram Reels', 'Short-Form Video Hooks', 'Copywriting', 'Brand Storytelling'],
      image: 'assets/project-agency.svg',
      description: 'Authored original Instagram reel scripts and marketing copy tailored to an established skincare brand running for over 7 years. Focused on personal branding, product storytelling, and engaging short-form video hooks to enhance target audience reach and interaction.',
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 'proj-ecommerce-solutions',
      domain: 'freelancer',
      title: 'E-Commerce & Brand Solutions',
      role: 'Shopify Developer & Creative Content Lead',
      recognition: '💼 Available for Freelance',
      tech: ['Shopify Setup', 'Theme Customization', 'Thumbnail Design', 'Video Editing'],
      image: 'assets/project-ecommerce.svg',
      description: 'Custom Shopify store setup, theme customization, and brand website creation. End-to-end content production: Scriptwriting, video editing, photo retouching, and custom YouTube/Instagram thumbnail designs.',
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 'proj-skillpulse-ai',
      domain: 'startup',
      title: 'SkillPulse AI — EdTech Ecosystem',
      role: 'Founder & Product Architect',
      recognition: '💡 Incubating Startup Lab',
      tech: ['React', 'Node.js', 'AI / LLMs', 'Tailwind CSS', 'System Design'],
      image: 'assets/project-edtech.svg',
      description: 'Incubating an AI-powered peer learning ecosystem to bridge the gap between college lectures and real-world skills. Features syllabus-to-industry mapping, daily coding challenges, and collaborative study pods.',
      liveUrl: '#',
      githubUrl: 'https://github.com/pagesofanisha'
    },
    {
      id: 'proj-tech-seminars',
      domain: 'softskills',
      title: 'Campus Technical Seminars & Pitching',
      role: 'Keynote Speaker & Hackathon Pitch Lead',
      recognition: '🎤 Public Speaking & PR',
      tech: ['Public Speaking', 'Pitch Decks', 'Seminar Hosting', 'Root-Cause Analysis'],
      image: 'assets/project-evaluator.svg',
      description: 'Experienced speaker and host for campus seminars and hackathon demonstrations at SRM IST Ramapuram. Translates complex technical architectures into compelling, easy-to-understand executive pitches.',
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 'proj-mandala-art',
      domain: 'softskills',
      title: 'Mandala Fine Art & Visual Creations',
      role: 'Visual Artist & Mandala Designer',
      recognition: '🎨 Visual Arts Showcase',
      tech: ['Mandala Illustration', 'Geometric Art', 'Fine Line Work', 'Creative Design'],
      image: 'assets/project-design.svg',
      description: 'Hand-crafted, intricate Mandala artwork requiring supreme patience, geometric precision, and focus. Demonstrates creative clarity, aesthetic discipline, and craftsmanship.',
      liveUrl: 'https://www.instagram.com/pages_of_anisha/?hl=en',
      githubUrl: '#'
    }
  ],
  skillsMatrix: [
    {
      category: 'Development & AI',
      icon: '💻',
      skills: ['Python', 'C', 'C++', 'Front-End Web Dev', 'AI-assisted App Building', 'VS Code', 'HTML/CSS/JS', 'Git & GitHub']
    },
    {
      category: 'E-Commerce & Web',
      icon: '🛍️',
      skills: ['Shopify Store Creation', 'Brand Site Design', 'Layout Customization', 'Responsive UX', 'Product Catalog Strategy']
    },
    {
      category: 'Marketing & Content',
      icon: '📈',
      skills: ['Scriptwriting (Reels/Shorts)', 'Copywriting', 'Thumbnail Design', 'Video & Photo Editing', 'Brand Storytelling']
    },
    {
      category: 'Communication & Arts',
      icon: '🎨',
      skills: ['Public Speaking', 'Seminar Hosting', 'Public Relations', 'Mandala Art', 'Creative Writing']
    },
    {
      category: 'Soft Skills',
      icon: '🧠',
      skills: ['Root-Cause Analysis', 'Problem Solving', 'Adaptability', 'Logical Thinking', 'Critical Thinking']
    }
  ],
  education: [
    {
      degree: 'B.Tech in Computer Science and Business Systems (CSBS)',
      institution: 'SRM Institute of Science and Technology, Ramapuram, Chennai',
      period: '2024 – Present (2nd Year Undergraduate)',
      status: 'Currently Enrolled • 2nd Year',
      highlights: 'Interdisciplinary program integrating core computer science (algorithms, systems, software engineering) with modern business analytics and strategy.'
    },
    {
      degree: '12th Standard CBSE Board Examination',
      institution: 'Vivekananda Vidyashram CBSE School, Thiruvarur',
      period: 'Passed in 2025',
      status: 'Academic Score: 85%',
      highlights: 'Higher secondary education focusing on mathematics, science, and foundational computer sciences.'
    },
    {
      degree: '10th Standard CBSE Board Examination',
      institution: 'Vivekananda Vidyashram CBSE School, Thiruvarur',
      period: 'Passed in 2023',
      status: 'Academic Score: 95%',
      highlights: 'Distinction honors with 95% overall score in secondary school CBSE examinations.'
    }
  ],
  linkedInHeadlines: [
    {
      id: 'opt-1',
      label: 'Option 1 (Balanced Professional)',
      badge: 'Recommended',
      text: 'CSBS Student @ SRM IST | AI App Developer | E-Commerce & Shopify Builder | Scriptwriter & Brand Marketer | Public Speaker'
    },
    {
      id: 'opt-2',
      label: 'Option 2 (Freelance & Client Focused)',
      badge: 'Freelance',
      text: 'Freelance Content Strategist & Shopify Developer | B.Tech CSBS @ SRM IST | AI Integration & Video Editing'
    },
    {
      id: 'opt-3',
      label: 'Option 3 (Startup & Clubs Focused)',
      badge: 'Innovation',
      text: 'CSBS @ SRM IST | Hackathon Winner | AI App Development | Growth Marketing & Public Speaking'
    }
  ]
};
