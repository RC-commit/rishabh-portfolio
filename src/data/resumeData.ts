// ============================================================
// RESUME DATA — Single source of truth for all portfolio content
// ============================================================

interface Metric {
  label: string;
  value: string;
  icon: string;
  prefix?: string;
  suffix?: string;
  numericValue?: number;
}

export interface Skill {
  name: string;
  category: string;
  level: number;
  iconPath?: string;
  featured?: boolean;
}

interface ImpactMetric {
  value: string;
  label: string;
}

export interface Role {
  title: string;
  company: string;
  period: string;
  location: string;
  achievements: string[];
  skills: string[];
  impactMetrics: ImpactMetric[];
}

interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  category?: string;
  tags: string[];
  metrics: Record<string, string>;
  color: string;
  role?: string;
  challenge?: string;
  approach?: string;
  differently?: string;
  whyItMatters?: string;
  seoTitle?: string;
  seoDescription?: string;
  shareText?: string;
  links?: ProjectLink[];
  displayMetrics?: string[];
}

interface Education {
  degree: string;
  field: string;
  institution: string;
  location: string;
  period: string;
  details?: string[];
}

// ============================================================
// PROFILE
// ============================================================

export const PROFILE = {
  name: 'Rishabh Chaturvedi',

  title: 'Lead Software Engineer',

  tagline:
    'Engineering leader designing and scaling distributed backend systems, cloud platforms, and AI-native developer tooling across global product lines.',

  summary:
    'Engineering leader with 8+ years of experience designing, building, and scaling distributed backend systems, cloud infrastructure, and developer platforms serving millions of users. Experienced in architecture, platform reliability, performance optimization, cloud migration, and technical leadership. Led engineering teams, mentored 20+ engineers, reduced infrastructure costs by 61%, improved API latency, and delivered mission-critical systems across multiple countries. Currently focused on AI-native platforms, LLM-powered products, multi-agent systems, and developer tooling.',

  location: 'Thane, MH',

  phone: '+91-7045579215',

  email: 'rishabh.j.chaturvedi@gmail.com',

  website: 'https://rishabhchaturvedi.dev',

  github: 'https://github.com/RC-commit',

  linkedin: 'https://linkedin.com/in/rishabhjchaturvedi',

  resumeUrl:
    'https://drive.google.com/file/d/116mvX_o0PsIYgVDEZiMitJteM9_aeB_B/view',
} as const;

// ============================================================
// EDUCATION
// ============================================================

export const EDUCATION: Education[] = [
  {
    degree: 'Bachelor of Engineering',
    field: 'Computer Science Engineering',
    institution: 'Smt. Indira Gandhi College of Engineering',
    location: 'Mumbai, India',
    period: 'Aug 2014 - May 2018',
    details: [
      'Graduated with a Bachelor of Engineering in Computer Science Engineering (affiliated with the University of Mumbai).',
      'Core Coursework: Data Structures & Algorithms, Database Management Systems (DBMS), Operating Systems, Software Engineering, Object-Oriented Programming, and Web Technologies.',
      'Final Year Capstone Project: Humanoid Robot — co-designed and developed an interactive robotic system focusing on motion control, sensor integration (ultrasonic, infrared), microcontrollers (Arduino/Raspberry Pi), and speech recognition.',
      'Active member of the Computer Society of India (CSI) student chapter, hosting coding workshops and engineering hackathons.'
    ]
  },
];

// ============================================================
// ACADEMIC PROJECTS
// ============================================================

export const ACADEMIC_PROJECTS = [
  {
    title: 'Humanoid Robot',
    description:
      'Designed and developed a humanoid robotics project during final year engineering focused on motion control, automation, sensors, and human-machine interaction.',
    technologies: [
      'Embedded Systems',
      'Automation',
      'Sensors',
      'Robotics',
    ],
  },
];

// ============================================================
// KEY METRICS
// ============================================================

export const KEY_METRICS: Metric[] = [
  {
    label: 'Years Experience',
    value: '8+',
    icon: '⏱',
    numericValue: 8,
    suffix: '+',
  },

  {
    label: 'API Response Time',
    value: '340×',
    icon: '⚙',
    numericValue: 340,
    suffix: '×',
  },

  {
    label: 'Infra Cost Reduced',
    value: '61%',
    icon: '📉',
    prefix: '↓',
    numericValue: 61,
    suffix: '%',
  },

  {
    label: 'Search Performance',
    value: '6×',
    icon: '⚡',
    numericValue: 6,
    suffix: '×',
  },

  {
    label: 'Deployments Accelerated',
    value: '70%',
    icon: '🚀',
    prefix: '↑',
    numericValue: 70,
    suffix: '%',
  },

  {
    label: 'Engineers Mentored',
    value: '20+',
    icon: '🧠',
    numericValue: 20,
    suffix: '+',
  },
];

// ============================================================
// SPECIALIZATIONS
// ============================================================

export const SPECIALIZATIONS = [
  'Engineering Leadership',
  'Distributed Systems',
  'Backend Architecture',
  'Platform Engineering',
  'Cloud Infrastructure',
  'Search Optimization',
  'DevOps & CI/CD',
  'Scalable APIs',
  'Event-Driven Systems',
  'System Design',
  'Performance Engineering',
  'Applied AI Systems',
  'LLM Application Architecture',
  'Microservices',
  'Infrastructure as Code',
];

// ============================================================
// SKILLS
// ============================================================

export const SKILLS: Skill[] = [
  // Leadership

  {
    name: 'Team Leadership',
    category: 'Leadership',
    level: 0.9,
    featured: true,
  },

  {
    name: 'Technical Mentoring',
    category: 'Leadership',
    level: 0.9,
  },

  {
    name: 'Cross-functional Collaboration',
    category: 'Leadership',
    level: 0.85,
  },

  // Languages
  {
    name: 'Ruby',
    category: 'Languages',
    level: 0.95,
    featured: true,
    iconPath: 'ruby/ruby-original.svg',
  },

  {
    name: 'Python',
    category: 'Languages',
    level: 0.85,
    featured: true,
    iconPath: 'python/python-original.svg',
  },

  {
    name: 'JavaScript',
    category: 'Languages',
    level: 0.9,
    featured: true,
    iconPath: 'javascript/javascript-original.svg',
  },

  {
    name: 'TypeScript',
    category: 'Languages',
    level: 0.85,
    featured: true,
    iconPath: 'typescript/typescript-original.svg',
  },

  {
    name: 'Golang',
    category: 'Languages',
    level: 0.6,
  },

  {
    name: 'SQL',
    category: 'Languages',
    level: 0.85,
  },

  // AI & ML

  {
    name: 'LLM Integration',
    category: 'AI',
    level: 0.85,
  },

  {
    name: 'PyTorch / TensorFlow',
    category: 'AI',
    level: 0.6,
  },

  {
    name: 'LLM Application Architecture',
    category: 'AI',
    level: 0.85,
  },

  {
    name: 'Multi-Agent Systems',
    category: 'AI',
    level: 0.8,
  },

  {
    name: 'Tool-Using AI',
    category: 'AI',
    level: 0.85,
  },

  {
    name: 'AI-Native Developer Tooling',
    category: 'AI',
    level: 0.85,
  },

  // Frameworks

  {
    name: 'Rails',
    category: 'Frameworks',
    level: 0.95,
    featured: true,
    iconPath: 'rails/rails-plain.svg',
  },

  {
    name: 'Django',
    category: 'Frameworks',
    level: 0.75,
  },

  {
    name: 'React',
    category: 'Frameworks',
    level: 0.9,
    featured: true,
    iconPath: 'react/react-original.svg',
  },

  {
    name: 'Node.js',
    category: 'Frameworks',
    level: 0.8,
    featured: true,
    iconPath: 'nodejs/nodejs-original.svg',
  },

  // Architecture

  {
    name: 'System Design',
    category: 'Architecture',
    level: 0.9,
  },

  {
    name: 'Distributed Systems',
    category: 'Architecture',
    level: 0.85,
  },

  {
    name: 'Microservices',
    category: 'Architecture',
    level: 0.85,
  },

  {
    name: 'Scalable APIs',
    category: 'Architecture',
    level: 0.9,
  },

  // Cloud & DevOps

  {
    name: 'AWS',
    category: 'Cloud',
    level: 0.85,
    featured: true,
    iconPath:
      'amazonwebservices/amazonwebservices-original-wordmark.svg',
  },

  {
    name: 'Azure',
    category: 'Cloud',
    level: 0.85,
  },

  {
    name: 'Heroku',
    category: 'Cloud',
    level: 0.8,
  },

  {
    name: 'Docker',
    category: 'DevOps',
    level: 0.9,
    featured: true,
    iconPath: 'docker/docker-original.svg',
  },

  {
    name: 'Kubernetes',
    category: 'DevOps',
    level: 0.8,
    featured: true,
    iconPath: 'kubernetes/kubernetes-plain.svg',
  },

  {
    name: 'CI/CD',
    category: 'DevOps',
    level: 0.9,
  },

  {
    name: 'Azure DevOps',
    category: 'DevOps',
    level: 0.85,
  },

  {
    name: 'Terraform',
    category: 'DevOps',
    level: 0.7,
  },

  {
    name: 'Linux',
    category: 'DevOps',
    level: 0.85,
  },

  {
    name: 'Nginx',
    category: 'DevOps',
    level: 0.8,
  },

  // Databases

  {
    name: 'PostgreSQL',
    category: 'Databases',
    level: 0.9,
    featured: true,
    iconPath: 'postgresql/postgresql-original.svg',
  },

  {
    name: 'MongoDB',
    category: 'Databases',
    level: 0.75,
    featured: true,
    iconPath: 'mongodb/mongodb-original.svg',
  },

  {
    name: 'Redis',
    category: 'Databases',
    level: 0.9,
    featured: true,
    iconPath: 'redis/redis-original.svg',
  },

  {
    name: 'Vector DBs',
    category: 'Databases',
    level: 0.75,
  },

  // Events

  {
    name: 'Kafka',
    category: 'Events',
    level: 0.8,
    featured: true,
    iconPath: 'apachekafka/apachekafka-original.svg',
  },

  {
    name: 'RabbitMQ',
    category: 'Events',
    level: 0.75,
  },

  {
    name: 'Sidekiq',
    category: 'Events',
    level: 0.85,
  },

  // Search

  {
    name: 'ElasticSearch',
    category: 'Search',
    level: 0.9,
    featured: true,
    iconPath: 'elasticsearch/elasticsearch-original.svg',
  },

  // API & Auth

  {
    name: 'REST',
    category: 'API',
    level: 0.95,
  },

  {
    name: 'GraphQL',
    category: 'API',
    level: 0.8,
    featured: true,
    iconPath: 'graphql/graphql-plain.svg',
  },

  {
    name: 'OAuth2',
    category: 'Auth',
    level: 0.8,
  },

  {
    name: 'JWT',
    category: 'Auth',
    level: 0.8,
  },

  {
    name: 'WebSockets',
    category: 'Realtime',
    level: 0.75,
  },

  // Monitoring & Performance

  {
    name: 'New Relic',
    category: 'Monitoring',
    level: 0.85,
  },

  {
    name: 'Rollbar',
    category: 'Monitoring',
    level: 0.8,
  },

  {
    name: 'Observability',
    category: 'Monitoring',
    level: 0.8,
  },

  {
    name: 'Load Testing',
    category: 'Performance',
    level: 0.75,
  },

  {
    name: 'Performance Optimization',
    category: 'Performance',
    level: 0.9,
  },

  // Tools

  {
    name: 'GitHub',
    category: 'Tools',
    level: 0.9,
    featured: true,
    iconPath: 'github/github-original.svg',
  },

  {
    name: 'Bitbucket',
    category: 'Tools',
    level: 0.8,
  },

  {
    name: 'Postman',
    category: 'Tools',
    level: 0.85,
  },
];

// ============================================================
// CAREER
// ============================================================

export const CAREER: Role[] = [
  {
    title: 'Senior Software Engineer',

    company: 'Blackstraw Technologies Pvt Ltd',

    period: 'July 2022 - Present',

    location: 'India',

    impactMetrics: [
      { value: '3M+', label: 'Active Users' },

      { value: 'E2E', label: 'Ownership' },

      { value: '↓61%', label: 'Infra Cost' },

      { value: '340×', label: 'API Latency' },
    ],

    achievements: [
      'Led backend team — owning core backend and infrastructure modules, the PR review process, and code quality standards',
      'Architected and delivered multiple survey modules — Survey Sampling and Purchase-to-Consumption (P2C) Survey — end-to-end (DB schema design → API development → deployment), scaling to 3M+ active users',
      'Led international rollout of applications into the UK and France, expanding platform reach beyond the US',
      'Reduced cloud infrastructure costs by 61% by migrating applications from Heroku to self-managed servers on Azure and optimizing infra usage',
      'Improved search performance 6× (900ms → 150ms) using ElasticSearch indexing, query tuning, and Redis caching',
      'Cut core API response times up to 340× (17s → 50ms) through query optimization, profiling, and caching',
      'Designed event-driven Kafka and RabbitMQ pipelines for real-time data sync and monitoring dashboards, and built CI/CD pipelines with Azure DevOps and Bitbucket, cutting deployment time by 70%',
      'Recognized as top performer for contributions to team leadership, scalability, and cost savings',
    ],

    skills: [
      'Rails',
      'Django',
      'Azure',
      'ElasticSearch',
      'PostgreSQL',
      'Docker',
      'Kafka',
      'RabbitMQ',
      'Azure DevOps',
    ],
  },

  {
    title: 'Software Developer',

    company: 'PropertyPistol Realty Pvt Ltd',

    period: 'Feb 2021 - July 2022',

    location: 'Navi Mumbai, India',

    impactMetrics: [
      { value: '↑50%', label: 'Engagement' },

      { value: '↑40%', label: 'Performance' },

      { value: 'Rails', label: 'Backend Core' },

      { value: 'E2E', label: 'Product Delivery' },
    ],

    achievements: [
      'Led end-to-end delivery — from requirements gathering and system design through development, testing, and implementation — for HRMS, ERP, CRM, and sales-management platforms',
      'Owned technical decisions and architecture independently for core product lines, conducting code and PR reviews to uphold engineering standards across the team',
      'Participated in interviewing and onboarding new engineers as the team scaled',
      'Built Ruby on Rails APIs and microservices from scratch (Glitz CRM, IGR Insights), contributing to a 50% increase in user engagement',
      'Improved system performance by 40% through code refactoring and database query optimization',
      'Partnered with product and design teams to translate business requirements into shipped, user-centric features',
    ],

    skills: [
      'Rails',
      'React',
      'PostgreSQL',
      'Redis',
      'AWS',
    ],
  },

  {
    title: 'Full Stack Developer (Founding Member)',

    company: 'PurpleMonks Technology Pvt Ltd',

    period: 'Sep 2018 - Feb 2021',

    location: 'Mumbai, India',

    impactMetrics: [
      { value: '300K+', label: 'Users Reached' },

      { value: '↓70%', label: 'Incomplete Registrations' },

      { value: '3', label: 'Platforms Built' },

      { value: 'Founding', label: 'Member' },
    ],

    achievements: [
      'Promoted from Junior Full Stack Developer to Founding Member in recognition of technical ownership and product judgment',
      'Set technical standards, tooling choices, and deployment processes for the founding engineering team, while participating in hiring and interviewing as the team scaled',
      'Directly scoped and negotiated product and client requirements, shaping technical roadmap and architecture across three platforms (KaryaMitr, KaushalMitr, ChayanMitr) that together reached 300K+ users',
      'Redesigned the onboarding flow, reducing incomplete registrations by 70%',
    ],

    skills: [
      'Rails',
      'React',
      'AWS',
      'PostgreSQL',
      'Node.js',
    ],
  },
];

// ============================================================
// PROJECTS
// ============================================================

export const PROJECTS: Project[] = [
  {
    slug: 'tool-grounded-ai',

    title: 'Tool-Grounded AI Portfolio Assistant',

    description:
      'Built this portfolio assistant as a grounded AI system: a server-side Groq path that defaults to openai/gpt-oss-120b, uses five allowlisted tools, and retains a deterministic local fallback.',

    category: 'APPLIED AI SYSTEMS',

    tags: [
      'Applied AI',
      'Groq',
      'Tool Calling',
      'TypeScript',
      'Privacy',
    ],

    metrics: {
      tools: '5 allowlisted',
      toolRounds: '2 max',
      context: '6 turns',
    },

    color: 'emerald',

    displayMetrics: [
      '5 allowlisted tools',
      '2 max tool rounds',
      '6-turn context',
    ],

    role:
      'Lead Engineer / Applied AI Systems portfolio case study, separate from the employment timeline.',

    challenge:
      'A portfolio assistant must answer flexible questions without converting model output into unsupported career claims, exposing private contact data or provider credentials, or becoming unusable when the hosted model path fails.',

    approach:
      'Implemented an edge API that calls Groq on the server, requires grounding through five allowlisted tools, and accepts final answers only when their non-empty fact IDs are a validated subset of tool-returned IDs. Request size, history, tool calls, tool rounds, output, and provider time are bounded, while phone-like data is redacted before and after model use. The browser calls /api/chat without a provider key and falls back to the deterministic local fact-index responder on HTTP, timeout, or response-validation failure.',

    differently:
      'Add a repeatable evaluation set for retrieval relevance, unsupported-question refusals, and provider-format failures before expanding beyond the current five-tool surface.',

    whyItMatters:
      'This case study demonstrates production-minded AI architecture: constrained tool access, verifiable claims, privacy boundaries, bounded execution, and graceful degradation when the hosted model path is unavailable.',

    seoTitle:
      'Tool-Grounded AI Portfolio Assistant Case Study',

    seoDescription:
      'A grounded portfolio assistant using server-side Groq tool calling, validated fact IDs, privacy redaction, bounded execution, and deterministic local fallback.',

    shareText:
      'How a five-tool, fact-validated AI assistant keeps portfolio answers grounded and degrades predictably.',
  },

  {
    slug: 'coinout-platform-scaling',

    title: 'Cloud & Search Platform Modernization',

    description:
      'Owned backend modules and improved cloud cost, search latency, delivery automation, and event-driven data flows for production survey systems.',

    category: 'PLATFORM ENGINEERING',

    tags: [
      'Rails',
      'Azure',
      'ElasticSearch',
      'Redis',
      'Kafka',
      'RabbitMQ',
      'Docker',
      'CI/CD',
    ],

    metrics: {
      users: '3M+',
      savings: '61%',
      performance: '6×',
    },

    color: 'cyan',

    displayMetrics: [
      '3M+ active users',
      '↓61% infra cost',
      '6× faster search',
    ],

    role: 'Led backend team; official designation Senior Software Engineer. Owned modules end-to-end.',

    challenge:
      'Production survey modules serving 3M+ active users needed lower infrastructure cost, faster search, reliable real-time data movement, and a more efficient release path.',

    approach:
      'Owned database schema, Django/Rails APIs, and Azure deployment for core modules. Migrated applications from Heroku to self-managed servers on Azure, tuned ElasticSearch indexes and queries with Redis caching, designed Kafka and RabbitMQ pipelines, and automated delivery through Azure DevOps and Bitbucket.',

    differently:
      'In hindsight, establishing granular APM observability (e.g., Datadog or OpenTelemetry) and defining Infrastructure-as-Code (Terraform) templates from day one would have accelerated the initial migration validation phases and minimized manual environment provisioning.',

    whyItMatters:
      'This work connects platform architecture to business outcomes: cloud migration, search tuning, event-driven data flow, and release automation produced measurable gains in cost, speed, and delivery reliability at 3M+ user scale.',

    seoTitle:
      'Cloud and Search Platform Modernization Case Study',

    seoDescription:
      'How end-to-end backend ownership reduced cloud cost by 61%, improved search by 6x, and supported 3M+ active users.',

    shareText:
      'How cloud migration, search tuning, event-driven systems, and CI/CD improved a production platform.',
  },

  {
    slug: 'survey-sampling-platform',

    title: 'Survey Sampling & Intelligence Platform',

    description:
      'Architected Survey Sampling and Purchase-to-Consumption (P2C) Survey modules with real-time data synchronization, monitoring dashboards, and international delivery for 3M+ active users.',

    category: 'DATA & SURVEY ENGINEERING',

    tags: [
      'Rails',
      'Django',
      'Kafka',
      'RabbitMQ',
      'PostgreSQL',
      'Azure',
      'Monitoring',
    ],

    metrics: {
      users: '3M+',
      ownership: 'End-to-end',
      cloud: 'Azure',
    },

    color: 'violet',

    displayMetrics: [
      '3M+ active users',
      'Distributed pipelines',
      'Real-time processing',
    ],

    role:
      'Led backend team; official designation Senior Software Engineer. Owned schema, APIs, deployment, and production delivery, including international rollout to the UK and France.',

    challenge:
      'Survey Sampling and Purchase-to-Consumption modules required reliable data capture, processing, and monitoring while supporting 3M+ active users and production delivery on Azure across multiple countries.',

    approach:
      'Owned the database schema and Django/Rails APIs end-to-end, deployed the modules to Azure, led the international rollout into the UK and France, and used Kafka and RabbitMQ for real-time data synchronization and monitoring workflows.',

    differently:
      'I would prioritize implementing automated stress and load-testing suites (e.g., using Locust or k6) early in the development lifecycle to preemptively uncover concurrency bottlenecks in dynamic database queries.',

    whyItMatters:
      'The project demonstrates end-to-end system ownership: data modeling, APIs, event-driven synchronization, operational monitoring, cloud deployment, and international rollout were treated as one production responsibility.',

    seoTitle:
      'Survey Sampling Platform Engineering Case Study',

    seoDescription:
      'How scalable survey intelligence systems were built using Rails, Django, Kafka, PostgreSQL, and Azure.',
  },

  {
    slug: 'elasticsearch-optimization',

    title: 'ElasticSearch & API Performance Optimization',

    description:
      'Architected and optimized search and API infrastructure, improving search response times from 900ms to 150ms and core API latency by up to 340×.',

    category: 'SEARCH & PERFORMANCE',

    tags: [
      'ElasticSearch',
      'Redis',
      'Rails',
      'Performance',
    ],

    metrics: {
      search: '6×',
      api: '340×',
      cache: 'Redis',
    },

    color: 'emerald',

    displayMetrics: [
      '900ms → 150ms search',
      '17s → 50ms API calls',
      'Index + query tuning',
    ],

    role:
      'Lead Engineer scope. Diagnosed search and API bottlenecks and delivered indexing, query-tuning, and caching improvements.',

    challenge:
      'Search requests averaged 900ms and some core API calls took as long as 17 seconds, creating a clear performance bottleneck in production survey workflows.',

    approach:
      'Improved ElasticSearch indexing and query behavior, then introduced Redis caching for repeated reads. Profiled the complete request path for the slowest API calls and applied targeted query optimization and caching, reducing search response time from 900ms to 150ms and cutting core API response times by up to 340× (17s to 50ms).',

    differently:
      'I would introduce a comprehensive canary indexing and schema validation system to run search tests side-by-side with production before fully rolling out index migrations.',

    whyItMatters:
      'This is evidence-led performance engineering: profiling, index and query tuning, and targeted caching translated directly into 6× faster search and up to 340× lower API latency.',

    seoTitle:
      'ElasticSearch and API Performance Optimization Case Study',

    seoDescription:
      'How search and API optimization reduced search latency from 900ms to 150ms and cut core API response times by up to 340x.',
  },

  {
    slug: 'glitz-crm-platform',

    title: 'Glitz CRM & Enterprise Platforms',

    description:
      'Built Rails APIs and microservices from scratch for Glitz CRM and IGR Insights while delivering HRMS, ERP, CRM, and sales-management workflows end to end.',

    category: 'PRODUCT ENGINEERING',

    tags: [
      'Rails',
      'PostgreSQL',
      'Redis',
      'React',
      'CRM',
      'Microservices',
    ],

    metrics: {
      engagement: '50%',
      performance: '40%',
      ownership: 'End-to-end',
    },

    color: 'violet',

    displayMetrics: [
      '↑50% engagement',
      '↑40% performance',
      'Products from scratch',
    ],

    role:
      'Software Developer. Led end-to-end delivery and owned technical decisions and architecture independently for core product lines, including interviewing and onboarding new engineers.',

    challenge:
      'Multiple enterprise product lines needed dependable architecture and delivery from requirements gathering through implementation, while new Rails APIs and microservices had to support CRM and enterprise-insights workflows.',

    approach:
      'Engineered Rails APIs and microservices, developed Glitz CRM and IGR Insights from scratch, refactored application code, optimized database queries, conducted code and PR reviews, and partnered with product and design throughout delivery.',

    differently:
      'I would invest earlier in building self-service administrative dashboards and advanced internal analytics tools to empower business teams to customize workflows without engineering intervention.',

    whyItMatters:
      'The work shows independent product engineering ownership across architecture, implementation, performance, code review, and collaboration with product and design, rather than isolated feature delivery.',

    seoTitle:
      'Glitz CRM Platform Engineering Case Study',

    seoDescription:
      'How scalable CRM and enterprise backend systems improved engagement and performance.',
  },

  {
    slug: 'karyamitr-workforce-platform',

    title: 'KaryaMitr Workforce Ecosystem',

    description:
      'Shaped the technical roadmap and developed workforce-focused platforms including KaryaMitr, ChayanMitr, and KaushalMitr, reaching 300K+ users combined.',

    category: 'WORKFORCE TECH',

    tags: [
      'Rails',
      'React',
      'AWS',
      'PostgreSQL',
      'LMS',
      'Recruitment',
    ],

    metrics: {
      users: '300K+',
      dropoff: '70%',
      platforms: '3',
    },

    color: 'cyan',

    displayMetrics: [
      '300K+ users reached',
      '↓70% incomplete registrations',
      '3 platforms built',
    ],

    role:
      'Full Stack Developer (Founding Member). Set technical standards and directly scoped and negotiated product and client requirements, shaping roadmap and architecture across all three platforms.',

    challenge:
      'Workers needed simpler profile creation, hiring, assessment, and learning journeys, while the business needed a product roadmap that could connect those experiences across three platforms.',

    approach:
      'Set technical standards, tooling choices, and deployment processes for the founding engineering team. Directly scoped and negotiated product and client requirements across KaryaMitr, KaushalMitr, and ChayanMitr, and redesigned the onboarding flow to reduce incomplete registrations by 70%.',

    differently:
      'I would implement funnel analytics tracking (e.g., Mixpanel or Amplitude) on the user registration steps from day one to quickly pinpoint drop-off friction points in real time.',

    whyItMatters:
      'As a founding-team project, the impact extended beyond code: product discovery, client scoping, architecture, technical standards, hiring, deployment, and onboarding conversion all shaped the three-platform ecosystem.',

    seoTitle:
      'KaryaMitr Workforce Platform Case Study',

    seoDescription:
      'How workforce hiring, assessment, and LMS systems were built for scalable workforce ecosystems reaching 300K+ users.',
  },
];
