import {
  CAREER,
  EDUCATION,
  KEY_METRICS,
  PROFILE,
  PROJECTS,
  SKILLS,
  type Project,
  type Role,
  type Skill,
} from '../../data/resumeData';
import { TESTIMONIALS } from '../../data/testimonials';
import { getUIActionForFact, type FactNode } from './factIndex';
import { hasAnyPhrase, hasNegation, hasPhrase, normalizeForMatch, words } from './matching';
import type { PortfolioAnswer, PortfolioUIAction } from './types';

export type SynthesizedResponse = PortfolioAnswer;

type MatchedFact = { fact: FactNode; score: number };
type Intent =
  | 'greeting'
  | 'identity'
  | 'summary'
  | 'experience'
  | 'current_role'
  | 'current_work'
  | 'biggest_win'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'frameworks'
  | 'metrics'
  | 'education'
  | 'testimonials'
  | 'contact'
  | 'availability'
  | 'challenge'
  | 'general';

const DOMAIN_PHRASES = [
  'rishabh', 'portfolio', 'resume', 'career', 'experience', 'work', 'role', 'company',
  'project', 'built', 'skill', 'stack', 'technology', 'language', 'framework', 'cloud',
  'database', 'impact', 'metric', 'achievement', 'education', 'college',
  'contact', 'email', 'linkedin', 'github', 'available', 'hire', 'challenge',
  'review', 'recommendation', 'testimonial', 'feedback', 'endorsement',
] as const;

const SKILL_ALIASES: Record<string, string[]> = {
  rails: ['ruby on rails'],
  golang: ['go language'],
  javascript: ['js'],
  typescript: ['ts'],
  postgresql: ['postgres', 'postgres sql'],
  elasticsearch: ['elastic search'],
  'node.js': ['nodejs', 'node js'],
  'next.js': ['nextjs', 'next js'],
  'azure devops': ['ado'],
  'rest apis': ['rest api', 'restful api', 'restful apis'],
  websockets: ['websocket'],
};

const COMPANY_ALIASES: Array<{ role: Role; index: number; aliases: string[] }> = CAREER.map((role, index) => {
  const first = role.company.split(/\s+/)[0];
  const compact = role.company.replace(/\s+(?:Technologies|Technology|Realty|Pvt|Ltd).*$/i, '');
  return { role, index, aliases: [role.company, first, compact] };
});

const PROJECT_ALIASES: Array<{ project: Project; aliases: string[] }> = PROJECTS.map((project) => ({
  project,
  aliases: [
    project.title,
    project.slug.replaceAll('-', ' '),
    ...project.slug.split('-').filter((part) => part.length > 3),
    project.title.split(/\s+/)[0],
    ...project.title.split(/[&:]/).map((part) => part.trim()).filter((part) => part.length > 4),
  ],
}));

function answer(
  body: string,
  options: {
    action?: PortfolioUIAction;
    facts?: string[];
    confidence?: SynthesizedResponse['confidence'];
  } = {},
): SynthesizedResponse {
  return {
    body,
    isMarkdown: true,
    uiAction: options.action,
    groundedFactIds: options.facts,
    confidence: options.confidence ?? 'high',
  };
}

function unknownAnswer(subject?: string): SynthesizedResponse {
  const opening = subject
    ? `I couldn't verify **${subject}** in Rishabh's portfolio data, so I won't guess.`
    : `I couldn't verify an answer to that from Rishabh's portfolio data, so I won't guess.`;
  return answer(
    `${opening}\n\nI can reliably help with his **experience**, **projects**, **skills**, **education**, **impact**, or public contact links.`,
    { confidence: 'unknown' },
  );
}

function aliasesForSkill(skill: Skill): string[] {
  return [skill.name, ...(SKILL_ALIASES[normalizeForMatch(skill.name)] ?? [])];
}

function mentionedSkills(query: string): Skill[] {
  return SKILLS
    .filter((skill) => aliasesForSkill(skill).some((alias) => hasPhrase(query, alias)))
    .sort((a, b) => b.name.length - a.name.length);
}

function mentionedCompanies(query: string) {
  return COMPANY_ALIASES.filter(({ aliases }) => aliases.some((alias) => hasPhrase(query, alias)));
}

function mentionedProjects(query: string) {
  return PROJECT_ALIASES.filter(({ aliases }) => aliases.some((alias) => hasPhrase(query, alias)));
}

function skillAppearsIn(value: string, skill: Skill): boolean {
  return aliasesForSkill(skill).some((alias) => hasPhrase(value, alias));
}

function classifyIntent(query: string): Intent {
  const tokenCount = words(query).length;

  if (tokenCount <= 4 && hasAnyPhrase(query, ['hi', 'hello', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening'])) {
    return 'greeting';
  }
  if (hasAnyPhrase(query, ['who are you', 'what is rc.ai', 'who is rc.ai', 'introduce yourself'])) return 'identity';
  if (hasAnyPhrase(query, ['phone', 'phone number', 'mobile number', 'call him', 'whatsapp number'])) return 'contact';
  if (hasAnyPhrase(query, ['biggest win', 'biggest achievement', 'strongest achievement', 'most impactful achievement', '61% cloud cost', '61% cloud-cost'])) return 'biggest_win';
  if (hasAnyPhrase(query, ['currently working on', 'current work', 'working on now', 'currently responsible for', 'focused on now'])) return 'current_work';
  if (hasAnyPhrase(query, ['available', 'hire', 'hiring', 'open to work', 'open for work', 'open to senior', 'open to lead', 'open to roles', 'open to opportunities', 'recruit', 'opportunity'])) return 'availability';
  if (hasAnyPhrase(query, ['contact', 'email', 'linkedin', 'github', 'resume', 'reach out', 'get in touch'])) return 'contact';
  if (hasAnyPhrase(query, ['current role', 'current job', 'currently working', 'present role', 'latest role'])) return 'current_role';
  if (hasAnyPhrase(query, ['hardest challenge', 'biggest challenge', 'technical challenge', 'toughest problem', 'difficult problem'])) return 'challenge';
  if (hasAnyPhrase(query, ['programming language', 'programming languages', 'coding language', 'languages'])) return 'languages';
  if (hasAnyPhrase(query, ['framework', 'frameworks', 'libraries'])) return 'frameworks';
  if (hasAnyPhrase(query, ['education', 'college', 'degree', 'university', 'academic', 'qualification', 'studied'])) return 'education';
  if (hasAnyPhrase(query, ['review', 'reviews', 'recommendation', 'recommendations', 'testimonial', 'testimonials', 'feedback', 'endorsement', 'endorsements', 'what do people say', 'what others say'])) return 'testimonials';
  if (hasAnyPhrase(query, ['career', 'experience', 'work history', 'employment', 'companies', 'roles', 'worked at', 'background'])) return 'experience';
  if (hasAnyPhrase(query, ['project', 'projects', 'case study', 'case studies', 'built', 'shipped', 'architecture'])) return 'projects';
  if (hasAnyPhrase(query, ['skill', 'skills', 'tech stack', 'technology', 'technologies', 'tools', 'cloud', 'database', 'databases', 'expertise'])) return 'skills';
  if (hasAnyPhrase(query, ['impact', 'metrics', 'achievement', 'achievements', 'results', 'numbers', 'performance'])) return 'metrics';
  if (hasAnyPhrase(query, ['who is rishabh', 'about rishabh', 'summary', 'profile', 'overview', 'elevator pitch', 'introduce rishabh'])) return 'summary';
  return 'general';
}

function contactResponse(query: string): SynthesizedResponse {
  const asksForPhone = hasAnyPhrase(query, ['phone', 'phone number', 'mobile number', 'call him', 'whatsapp number']);
  const privacyNote = asksForPhone
    ? `Rishabh's personal phone number is private, so I can't provide it. His public contact channels are:`
    : `Rishabh's public contact channels are:`;

  return answer([
    privacyNote,
    '',
    `- **Email**: [${PROFILE.email}](mailto:${PROFILE.email})`,
    `- **LinkedIn**: [rishabhjchaturvedi](${PROFILE.linkedin})`,
    `- **GitHub**: [RC-commit](${PROFILE.github})`,
    `- **Resume**: [View PDF](${PROFILE.resumeUrl})`,
  ].join('\n'), {
    action: { action: 'focus_section', value: 'contact' },
    facts: ['profile-contact'],
  });
}

function biggestWinResponse(query: string): SynthesizedResponse {
  const match = mentionedCompanies(query)[0] ?? COMPANY_ALIASES[0];
  const preferredAchievementIndex = match.role.achievements.findIndex((achievement) => /61%|50% increase|70%/i.test(achievement));
  const achievementIndex = preferredAchievementIndex >= 0 ? preferredAchievementIndex : 0;
  const achievement = match.role.achievements[achievementIndex];

  return answer([
    `Rishabh's strongest documented engineering win at **${match.role.company}** was:`,
    '',
    `**${achievement}**`,
    '',
    `This delivered massive recurring cost savings while also upgrading and modernizing the infrastructure through the move from Heroku to self-managed Azure servers and more efficient resource usage.`,
  ].join('\n'), {
    action: { action: 'toggle_experience', value: String(match.index) },
    facts: [`career-${match.index}-biggest-win`],
  });
}

function currentWorkResponse(): SynthesizedResponse {
  const currentMatch = COMPANY_ALIASES.find(({ role }) => /\bpresent\b/i.test(role.period)) ?? COMPANY_ALIASES[0];
  return answer([
    `Rishabh's current work has two connected tracks:`,
    '',
    `- **Engineering leadership at ${currentMatch.role.company}:** leading the backend team; owning core backend and infrastructure modules, PR reviews, and code-quality standards`,
    `- **Platform delivery:** architecting and scaling Survey Sampling and Purchase-to-Consumption survey systems serving 3M+ active users`,
    `- **Applied AI focus:** AI-native platforms, LLM-powered products, multi-agent systems, and developer tooling`,
  ].join('\n'), {
    action: { action: 'toggle_experience', value: String(currentMatch.index) },
    facts: [`career-${currentMatch.index}-summary`, `career-${currentMatch.index}-current-work`, 'profile-summary'],
  });
}

function companyResponse(match: (typeof COMPANY_ALIASES)[number]): SynthesizedResponse {
  const { role, index } = match;
  const isCurrentRole = /\bpresent\b/i.test(role.period);
  const roleSentence = isCurrentRole
    ? `At **${role.company}**, Rishabh currently works as **${role.title}** (${role.period}, ${role.location}).`
    : `At **${role.company}**, Rishabh worked as **${role.title}** (${role.period}, ${role.location}).`;
  return answer([
    roleSentence,
    '',
    '**Selected evidence:**',
    ...role.achievements.slice(0, 4).map((item) => `- ${item}`),
    '',
    `**Recorded stack:** ${role.skills.join(', ')}`,
    `**Impact:** ${role.impactMetrics.map((metric) => `${metric.value} ${metric.label}`).join(' · ')}`,
  ].join('\n'), {
    action: { action: 'toggle_experience', value: String(index) },
    facts: [`career-${index}-summary`, ...role.achievements.slice(0, 4).map((_, achievementIndex) => `career-${index}-ach-${achievementIndex}`)],
  });
}

function projectResponse(project: Project): SynthesizedResponse {
  return answer([
    `**${project.title}**`,
    '',
    project.description,
    project.challenge ? `\n**Challenge:** ${project.challenge}` : '',
    project.approach ? `\n**Approach:** ${project.approach}` : '',
    '',
    `**Evidence:** ${(project.displayMetrics ?? Object.values(project.metrics)).join(' · ')}`,
    `[Read the case study](/case-studies/${project.slug})`,
  ].filter(Boolean).join('\n'), {
    action: { action: 'highlight_project', value: project.title },
    facts: [`project-${project.slug}-overview`, `project-${project.slug}-challenge`, `project-${project.slug}-approach`],
  });
}

function skillResponse(skill: Skill, query: string): SynthesizedResponse {
  const roles = CAREER
    .map((role, index) => ({ role, index }))
    .filter(({ role }) => role.skills.some((name) => skillAppearsIn(name, skill)) || role.achievements.some((item) => skillAppearsIn(item, skill)));
  const projects = PROJECTS.filter((project) => project.tags.some((tag) => skillAppearsIn(tag, skill)) || skillAppearsIn(project.description, skill));

  if (hasNegation(query)) {
    return answer(
      `The portfolio **does list ${skill.name}**, so I can't support the claim that Rishabh does not use it. ${roles.length > 0 ? `It appears in work associated with ${roles.map(({ role }) => role.company).join(', ')}.` : `It is listed in his ${skill.category.toLowerCase()} stack.`}`,
      { action: { action: 'focus_section', value: 'stack' }, facts: [`skill-${skill.category.toLowerCase()}`] },
    );
  }

  const evidence: string[] = [];
  if (roles.length > 0) evidence.push(`- **Roles:** ${roles.map(({ role }) => role.company).join(', ')}`);
  if (projects.length > 0) evidence.push(`- **Projects:** ${projects.map((project) => `[${project.title}](/case-studies/${project.slug})`).join(', ')}`);
  if (evidence.length === 0) evidence.push(`- It is listed in the portfolio's **${skill.category}** inventory; no specific role attribution is recorded.`);

  return answer([
    `Yes. **${skill.name}** is documented in Rishabh's portfolio under **${skill.category}**.`,
    '',
    ...evidence,
  ].join('\n'), {
    action: { action: 'focus_section', value: 'stack' },
    facts: [`skill-${skill.category.toLowerCase()}`],
  });
}

function extractUnverifiedCapability(query: string): string | null {
  if (!hasAnyPhrase(query, ['know', 'knows', 'use', 'uses', 'used', 'experience with', 'familiar with', 'worked with', 'skilled in', 'proficient in'])) {
    return null;
  }

  const normalized = normalizeForMatch(query);
  const match = normalized.match(/\b(?:know|knows|use|uses|used|experience with|familiar with|worked with|skilled in|proficient in)\s+(.+?)(?:[?.!,]|$)/);
  if (!match?.[1]) return null;

  const candidate = match[1]
    .replace(/^(?:the|any)\s+/, '')
    .replace(/\s+(?:at all|professionally|well)$/, '')
    .trim();
  if (!candidate || words(candidate).length > 4) return null;
  if (hasAnyPhrase(candidate, ['skills', 'technology', 'technologies', 'tools', 'languages', 'frameworks'])) return null;
  return candidate.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function comparisonResponse(query: string): SynthesizedResponse | null {
  if (!hasAnyPhrase(query, ['compare', 'comparison', 'versus', 'vs', 'difference between'])) return null;

  const companies = mentionedCompanies(query);
  if (companies.length >= 2) {
    return answer(companies.slice(0, 3).map(({ role }) => [
      `### ${role.company}`,
      `**${role.title}** · ${role.period}`,
      `${role.achievements[0]}`,
      `Impact: ${role.impactMetrics.map((metric) => `${metric.value} ${metric.label}`).join(' · ')}`,
    ].join('\n')).join('\n\n'), {
      action: { action: 'focus_section', value: 'experience' },
      facts: companies.slice(0, 3).map(({ index }) => `career-${index}-summary`),
    });
  }

  const projects = mentionedProjects(query);
  if (projects.length >= 2) {
    return answer(projects.slice(0, 3).map(({ project }) => [
      `### ${project.title}`,
      project.description,
      `Evidence: ${(project.displayMetrics ?? Object.values(project.metrics)).join(' · ')}`,
    ].join('\n')).join('\n\n'), {
      action: { action: 'focus_section', value: 'projects' },
      facts: projects.slice(0, 3).map(({ project }) => `project-${project.slug}-overview`),
    });
  }

  const skills = mentionedSkills(query);
  if (skills.length >= 2) {
    return answer(skills.slice(0, 4).map((skill) => {
      const roleNames = CAREER.filter((role) => role.skills.some((name) => skillAppearsIn(name, skill))).map((role) => role.company);
      return `- **${skill.name}** (${skill.category}): ${roleNames.length ? `recorded at ${roleNames.join(', ')}` : 'listed in the portfolio-wide stack'}`;
    }).join('\n'), {
      action: { action: 'focus_section', value: 'stack' },
      facts: skills.slice(0, 4).map((skill) => `skill-${skill.category.toLowerCase()}`),
    });
  }

  return null;
}

function overviewResponse(): SynthesizedResponse {
  return answer([
    `Rishabh is a **${PROFILE.title}** operating at **lead-engineer scope**, based in **${PROFILE.location}**, with **8+ years of experience**.`,
    '',
    PROFILE.summary,
    '',
    `His strongest documented themes are backend architecture, distributed systems, cloud migration, search performance, and engineering mentorship.`,
  ].join('\n'), {
    action: { action: 'focus_section', value: 'intro' },
    facts: ['profile-summary', 'career-overview'],
  });
}

function testimonialResponse(): SynthesizedResponse {
  const featured = TESTIMONIALS
    .map((testimonial, index) => ({ testimonial, index }))
    .filter(({ testimonial }) => testimonial.featured)
    .slice(0, 4);

  return answer([
    `Across **${TESTIMONIALS.length} attributable LinkedIn recommendations**, recurring themes include technical depth, problem-solving, ownership, client understanding, and dependable collaboration.`,
    '',
    ...featured.map(({ testimonial }) => `- **[${testimonial.name}](${testimonial.profileUrl})**: “${testimonial.quote}”`),
  ].join('\n'), {
    action: { action: 'focus_section', value: 'testimonials' },
    facts: featured.map(({ index }) => `testimonial-${index}`),
  });
}

function intentResponse(intent: Intent, query: string): SynthesizedResponse | null {
  switch (intent) {
    case 'greeting':
      return answer(`Hi. I'm RC.AI, Rishabh's portfolio assistant. Ask me about his experience, projects, skills, impact, or availability.`, { facts: ['profile-identity'] });
    case 'identity':
      return answer(`I'm **RC.AI**, a portfolio assistant. I answer from Rishabh's published portfolio data, distinguish missing evidence from a negative claim, and avoid guessing.`, { facts: ['profile-identity'] });
    case 'summary':
      return overviewResponse();
    case 'contact':
      return contactResponse(query);
    case 'availability':
      return answer([
        `Yes. Rishabh is open to **Senior and Lead software engineering opportunities**, particularly with product companies and startups building substantial systems.`,
        '',
        `- **Location:** ${PROFILE.location}; open to remote opportunities`,
        `- **Email:** [${PROFILE.email}](mailto:${PROFILE.email})`,
        `- **LinkedIn:** [rishabhjchaturvedi](${PROFILE.linkedin})`,
      ].join('\n'), { action: { action: 'focus_section', value: 'contact' }, facts: ['profile-availability'] });
    case 'biggest_win':
      return biggestWinResponse(query);
    case 'current_work':
      return currentWorkResponse();
    case 'current_role':
      return companyResponse(COMPANY_ALIASES[0]);
    case 'challenge':
      return projectResponse(PROJECTS[0]);
    case 'experience':
      return answer([
        `Rishabh has **8+ years of documented software engineering experience** across three roles:`,
        '',
        ...CAREER.map((role) => `- **${role.title}**, ${role.company} (${role.period})`),
      ].join('\n'), {
        action: { action: 'focus_section', value: 'experience' },
        facts: ['career-overview', ...CAREER.map((_, index) => `career-${index}-summary`)],
      });
    case 'projects':
      return answer(PROJECTS.map((project) => `- **[${project.title}](/case-studies/${project.slug})**: ${project.description}`).join('\n'), {
        action: { action: 'focus_section', value: 'projects' },
        facts: PROJECTS.map((project) => `project-${project.slug}-overview`),
      });
    case 'languages': {
      const names = SKILLS.filter((skill) => skill.category === 'Languages').map((skill) => skill.name);
      return answer(`Rishabh's documented programming languages are **${names.join(', ')}**.`, {
        action: { action: 'focus_section', value: 'stack' }, facts: ['skill-languages'],
      });
    }
    case 'frameworks': {
      const names = SKILLS.filter((skill) => skill.category === 'Frameworks').map((skill) => skill.name);
      return answer(`Rishabh's documented frameworks are **${names.join(', ')}**.`, {
        action: { action: 'focus_section', value: 'stack' }, facts: ['skill-frameworks'],
      });
    }
    case 'skills': {
      const categories = [...new Set(SKILLS.map((skill) => skill.category))];
      const lines = categories.map((category) => `- **${category}:** ${SKILLS.filter((skill) => skill.category === category).map((skill) => skill.name).join(', ')}`);
      return answer(lines.join('\n'), { action: { action: 'focus_section', value: 'stack' }, facts: ['skill-all'] });
    }
    case 'metrics': {
      if (hasAnyPhrase(query, ['search performance', 'search speed', 'search latency', 'query latency'])) {
        const searchProject = PROJECTS.find((project) => project.slug === 'elasticsearch-optimization');
        if (searchProject) return projectResponse(searchProject);
      }
      return answer(KEY_METRICS.map((metric) => `- **${metric.label}:** ${metric.value}`).join('\n'), {
        action: { action: 'focus_section', value: 'intro' }, facts: ['metrics-all'],
      });
    }
    case 'education':
      return answer(EDUCATION.map((item) => [
        `**${item.degree} in ${item.field}**`,
        `${item.institution}, ${item.location} (${item.period})`,
        ...(item.details ?? []).slice(0, 2).map((detail) => `- ${detail}`),
      ].join('\n')).join('\n\n'), {
        action: { action: 'focus_section', value: 'education' }, facts: EDUCATION.map((_, index) => `education-${index}`),
      });
    case 'testimonials':
      return testimonialResponse();
    case 'general':
      return null;
  }
}

function cleanedFact(fact: FactNode): string {
  return fact.text
    .replace(/^(?:Project: |Key metric: |Education: )/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function synthesizeResponse(query: string, matchedFacts: MatchedFact[]): SynthesizedResponse {
  const comparison = comparisonResponse(query);
  if (comparison) return comparison;

  const intent = classifyIntent(query);
  if (intent === 'biggest_win' || intent === 'current_work' || intent === 'availability') {
    const prioritized = intentResponse(intent, query);
    if (prioritized) return prioritized;
  }

  const companies = mentionedCompanies(query);
  if (companies.length === 1) return companyResponse(companies[0]);

  const projects = mentionedProjects(query);
  if (projects.length === 1) return projectResponse(projects[0].project);

  const skills = mentionedSkills(query);
  if (skills.length === 1) return skillResponse(skills[0], query);

  const unknownEmployer = normalizeForMatch(query).match(/\b(?:work|worked|working)\s+(?:at|for)\s+([a-z0-9 .&-]{2,40})(?:[?.!,]|$)/)?.[1]?.trim();
  if (unknownEmployer && companies.length === 0) return unknownAnswer(unknownEmployer.replace(/\b\w/g, (letter) => letter.toUpperCase()));

  const unverifiedCapability = extractUnverifiedCapability(query);
  if (unverifiedCapability && skills.length === 0) {
    return answer(
      `**${unverifiedCapability}** is not listed in Rishabh's portfolio. That means I can't verify it; it does not prove he has never used it.`,
      { confidence: 'unknown' },
    );
  }

  const direct = intentResponse(intent, query);
  if (direct) return direct;

  const hasDomainSignal = hasAnyPhrase(query, DOMAIN_PHRASES);
  const relevantFacts = matchedFacts.filter(({ score }) => score >= 0.2).slice(0, 3);
  if (!hasDomainSignal || relevantFacts.length === 0 || relevantFacts[0].score < 0.24) {
    return unknownAnswer();
  }

  const action = getUIActionForFact(relevantFacts[0].fact) ?? undefined;
  return answer([
    `Here's what the portfolio supports:`,
    '',
    ...relevantFacts.map(({ fact }) => `- ${cleanedFact(fact)}`),
  ].join('\n'), {
    action,
    facts: relevantFacts.map(({ fact }) => fact.id),
    confidence: relevantFacts[0].score >= 0.35 ? 'high' : 'medium',
  });
}
