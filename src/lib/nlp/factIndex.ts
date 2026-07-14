// ============================================================
// RC-Nano-NLP: Fact Index — Parses portfolio data into
// searchable fact nodes for the TF-IDF engine.
// ============================================================

import {
  PROFILE,
  CAREER,
  PROJECTS,
  SKILLS,
  KEY_METRICS,
  EDUCATION,
  SPECIALIZATIONS,
  ACADEMIC_PROJECTS,
  type Role,
  type Project,
} from '../../data/resumeData';
import { TESTIMONIALS } from '../../data/testimonials';
import type { PortfolioUIAction } from './types';
import {
  LEAD_SCOPE_LABEL,
  OFFICIAL_CURRENT_TITLE,
  PUBLIC_PHONE_NUMBER,
  PUBLIC_RESUME_URL,
} from '../../data/publicProfile';

// =========================================================
// Types
// =========================================================

export type FactCategory =
  | 'profile'
  | 'experience'
  | 'project'
  | 'skill'
  | 'education'
  | 'metric'
  | 'specialization'
  | 'testimonial';

export interface FactNode {
  id: string;
  text: string;           // Full searchable text content
  category: FactCategory;
  // Rich metadata for synthesis
  meta: {
    company?: string;
    role?: string;
    period?: string;
    location?: string;
    project?: string;
    projectSlug?: string;
    tags?: string[];
    skillCategory?: string;
    value?: string;
    label?: string;
    careerIndex?: number;
    reviewer?: string;
    profileUrl?: string;
  };
}

// =========================================================
// Fact Extraction Functions
// =========================================================

function extractProfileFacts(): FactNode[] {
  return [
    {
      id: 'profile-summary',
      text: `${PROFILE.name}'s official current designation is ${OFFICIAL_CURRENT_TITLE}, with documented responsibilities at ${LEAD_SCOPE_LABEL}. He is based in ${PROFILE.location}. ${PROFILE.summary}`,
      category: 'profile',
      meta: {},
    },
    {
      id: 'profile-tagline',
      text: `${PROFILE.name} ${PROFILE.tagline}`,
      category: 'profile',
      meta: {},
    },
    {
      id: 'profile-contact',
      text: `Contact Rishabh by phone at ${PUBLIC_PHONE_NUMBER}, email ${PROFILE.email}, website ${PROFILE.website}, GitHub ${PROFILE.github}, LinkedIn ${PROFILE.linkedin}, or through the public resume ${PUBLIC_RESUME_URL}. Only this published phone number may be shared; any other phone details are private.`,
      category: 'profile',
      meta: {},
    },
    {
      id: 'profile-identity',
      text: `RC.AI is a portfolio assistant for ${PROFILE.name}. RC.AI answers questions using facts from Rishabh's portfolio and resume data. RC.AI is not Rishabh.`,
      category: 'profile',
      meta: {},
    },
    {
      id: 'profile-availability',
      text: `Yes. ${PROFILE.name} is open to Senior and Lead software engineering roles at product companies and startups. He is based in ${PROFILE.location}, is open to remote opportunities, and can be contacted at ${PROFILE.email} or ${PUBLIC_PHONE_NUMBER}.`,
      category: 'profile',
      meta: {},
    },
  ];
}

function extractCareerFacts(): FactNode[] {
  const facts: FactNode[] = [];

  // Overall experience summary
  facts.push({
    id: 'career-overview',
    text: `Rishabh has 8+ years of software engineering experience across platform engineering, search systems, cloud migration, and product development. His documented employers are ${CAREER.map(r => r.company).join(', ')}.`,
    category: 'experience',
    meta: {},
  });

  CAREER.forEach((role: Role, index: number) => {
    const roleStatement = /\bpresent\b/i.test(role.period)
      ? `Rishabh currently works as ${role.title} at ${role.company}`
      : `Rishabh worked as ${role.title} at ${role.company}`;
    // Role summary
    facts.push({
      id: `career-${index}-summary`,
      text: `${roleStatement} (${role.period}, ${role.location}). Tech stack: ${role.skills.join(', ')}. Impact: ${role.impactMetrics.map(m => `${m.value} ${m.label}`).join(', ')}.`,
      category: 'experience',
      meta: {
        company: role.company,
        role: role.title,
        period: role.period,
        location: role.location,
        tags: role.skills,
        careerIndex: index,
      },
    });

    // Individual achievements
    role.achievements.forEach((achievement, achIdx) => {
      facts.push({
        id: `career-${index}-ach-${achIdx}`,
        text: `At ${role.company} as ${role.title}: ${achievement}`,
        category: 'experience',
        meta: {
          company: role.company,
          role: role.title,
          period: role.period,
          careerIndex: index,
        },
      });
    });

    if (/\bpresent\b/i.test(role.period)) {
      facts.push({
        id: `career-${index}-current-work`,
        text: `Rishabh's current work at ${role.company}: he leads the backend team and owns core backend and infrastructure modules, PR reviews, and code-quality standards. He architects and scales Survey Sampling and Purchase-to-Consumption survey systems serving 3M+ active users. His broader current focus includes AI-native platforms, LLM-powered products, multi-agent systems, and developer tooling.`,
        category: 'experience',
        meta: {
          company: role.company,
          role: role.title,
          period: role.period,
          careerIndex: index,
        },
      });

      facts.push({
        id: `career-${index}-biggest-win`,
        text: `Rishabh's strongest documented engineering win at ${role.company} is reducing cloud infrastructure costs by 61%, delivering massive recurring cost savings while upgrading and modernizing the platform's infrastructure through a migration from Heroku to self-managed servers on Azure and optimized infrastructure usage.`,
        category: 'experience',
        meta: {
          company: role.company,
          role: role.title,
          period: role.period,
          careerIndex: index,
        },
      });
    }
  });

  return facts;
}

function extractProjectFacts(): FactNode[] {
  const facts: FactNode[] = [];

  PROJECTS.forEach((project: Project) => {
    // Project overview
    facts.push({
      id: `project-${project.slug}-overview`,
      text: `Project: ${project.title}. ${project.description}. Tags: ${project.tags.join(', ')}. Metrics: ${(project.displayMetrics || []).join(', ')}.`,
      category: 'project',
      meta: {
        project: project.title,
        projectSlug: project.slug,
        tags: project.tags,
      },
    });

    // Project role
    if (project.role) {
      facts.push({
        id: `project-${project.slug}-role`,
        text: `Role in ${project.title}: ${project.role}`,
        category: 'project',
        meta: { project: project.title, projectSlug: project.slug },
      });
    }

    // Project challenge
    if (project.challenge) {
      facts.push({
        id: `project-${project.slug}-challenge`,
        text: `Challenge for ${project.title}: ${project.challenge}`,
        category: 'project',
        meta: { project: project.title, projectSlug: project.slug },
      });
    }

    // Project approach
    if (project.approach) {
      facts.push({
        id: `project-${project.slug}-approach`,
        text: `Approach for ${project.title}: ${project.approach}`,
        category: 'project',
        meta: { project: project.title, projectSlug: project.slug },
      });
    }

    // What they would do differently
    if (project.differently) {
      facts.push({
        id: `project-${project.slug}-differently`,
        text: `What Rishabh would do differently on ${project.title}: ${project.differently}`,
        category: 'project',
        meta: { project: project.title, projectSlug: project.slug },
      });
    }
  });

  return facts;
}

function extractSkillFacts(): FactNode[] {
  const facts: FactNode[] = [];

  // Group skills by category
  const categories = new Map<string, string[]>();
  SKILLS.forEach(skill => {
    const list = categories.get(skill.category) || [];
    list.push(skill.name);
    categories.set(skill.category, list);
  });

  // One fact per category
  for (const [category, names] of categories) {
    facts.push({
      id: `skill-${category.toLowerCase()}`,
      text: `Rishabh's ${category} skills: ${names.join(', ')}.`,
      category: 'skill',
      meta: { skillCategory: category, tags: names },
    });
  }

  // All skills combined
  facts.push({
    id: 'skill-all',
    text: `All technical skills: ${SKILLS.map(s => `${s.name} (${s.category})`).join(', ')}.`,
    category: 'skill',
    meta: {},
  });

  // Programming languages specifically (high-frequency query)
  const languages = SKILLS.filter(s => s.category === 'Languages').map(s => s.name);
  facts.push({
    id: 'skill-languages',
    text: `Programming languages Rishabh works with: ${languages.join(', ')}.`,
    category: 'skill',
    meta: { skillCategory: 'Languages', tags: languages },
  });

  // Frameworks specifically
  const frameworks = SKILLS.filter(s => s.category === 'Frameworks').map(s => s.name);
  facts.push({
    id: 'skill-frameworks',
    text: `Frameworks Rishabh uses: ${frameworks.join(', ')}.`,
    category: 'skill',
    meta: { skillCategory: 'Frameworks', tags: frameworks },
  });

  return facts;
}

function extractMetricFacts(): FactNode[] {
  const facts: FactNode[] = [];

  KEY_METRICS.forEach(metric => {
    facts.push({
      id: `metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`,
      text: `Key metric: ${metric.label} — ${metric.value}. ${metric.label} achievement by Rishabh.`,
      category: 'metric',
      meta: { value: metric.value, label: metric.label },
    });
  });

  // Combined metrics
  facts.push({
    id: 'metrics-all',
    text: `Key impact metrics: ${KEY_METRICS.map(m => `${m.label}: ${m.value}`).join(', ')}. Rishabh has also mentored 20+ engineers and shipped major systems across search, CRM, and cloud infrastructure.`,
    category: 'metric',
    meta: {},
  });

  return facts;
}

function extractEducationFacts(): FactNode[] {
  return EDUCATION.map((edu, index) => ({
    id: `education-${index}`,
    text: `Education: ${edu.degree} in ${edu.field} from ${edu.institution}, ${edu.location} (${edu.period}). ${(edu.details || []).join(' ')}`,
    category: 'education' as FactCategory,
    meta: {},
  }));
}

function extractSpecializationFacts(): FactNode[] {
  return [{
    id: 'specializations',
    text: `Rishabh's specializations: ${SPECIALIZATIONS.join(', ')}.`,
    category: 'specialization',
    meta: {},
  }];
}

function extractTestimonialFacts(): FactNode[] {
  return TESTIMONIALS.map((testimonial, index) => ({
    id: `testimonial-${index}`,
    text: `LinkedIn recommendation from ${testimonial.name}, dated ${testimonial.date}. ${testimonial.relationship}. "${testimonial.quote}" Reviewer headline: ${testimonial.headline}. Profile: ${testimonial.profileUrl}`,
    category: 'testimonial' as FactCategory,
    meta: {
      reviewer: testimonial.name,
      profileUrl: testimonial.profileUrl,
    },
  }));
}

function extractAcademicFacts(): FactNode[] {
  return ACADEMIC_PROJECTS.map((project, index) => ({
    id: `academic-${index}`,
    text: `Academic project: ${project.title}. ${project.description}. Technologies: ${project.technologies.join(', ')}.`,
    category: 'education' as FactCategory,
    meta: {},
  }));
}

// =========================================================
// Build Complete Fact Index
// =========================================================

let cachedFacts: FactNode[] | null = null;

/**
 * Build and return the complete fact index from all portfolio data.
 * Results are cached after first call.
 */
export function buildFactIndex(): FactNode[] {
  if (cachedFacts) return cachedFacts;

  cachedFacts = [
    ...extractProfileFacts(),
    ...extractCareerFacts(),
    ...extractProjectFacts(),
    ...extractSkillFacts(),
    ...extractMetricFacts(),
    ...extractEducationFacts(),
    ...extractSpecializationFacts(),
    ...extractTestimonialFacts(),
    ...extractAcademicFacts(),
  ];

  return cachedFacts;
}

/**
 * Determine the best UI action for a matched fact.
 */
export function getUIActionForFact(fact: FactNode): PortfolioUIAction | null {
  switch (fact.category) {
    case 'experience':
      if (fact.meta.careerIndex !== undefined) {
        return { action: 'toggle_experience', value: String(fact.meta.careerIndex) };
      }
      return { action: 'focus_section', value: 'experience' };

    case 'project':
      if (fact.meta.project) {
        return { action: 'highlight_project', value: fact.meta.project };
      }
      return { action: 'focus_section', value: 'projects' };

    case 'skill':
    case 'specialization':
      return { action: 'focus_section', value: 'stack' };

    case 'education':
      return { action: 'focus_section', value: 'education' };

    case 'metric':
      return { action: 'focus_section', value: 'intro' };

    case 'testimonial':
      return { action: 'focus_section', value: 'testimonials' };

    case 'profile':
      if (fact.id === 'profile-contact' || fact.id === 'profile-availability') {
        return { action: 'focus_section', value: 'contact' };
      }
      return { action: 'focus_section', value: 'intro' };

    default:
      return null;
  }
}
