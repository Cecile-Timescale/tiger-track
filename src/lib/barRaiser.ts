// ── Bar Raiser Competency Matrix ──
// Source: Tiger Data Bar Raiser Competency Matrix.xlsx

export interface SuccessCriteria {
  low: string;
  meets: string;
  exceeds: string;
}

export interface CompetencyQuestion {
  question: string;
  followUps: string;
}

export interface ReviewGuideline {
  poor: string;
  meets: string;
  exceeds: string;
}

export interface Competency {
  id: string;
  name: string;
  category: string;
}

export interface LevelSuccessCriteria {
  level: string;
  levelCode: string;
  criteria: Record<string, SuccessCriteria>;
}

// ── Competency Categories ──
export const COMPETENCY_CATEGORIES = [
  {
    id: "gsd",
    name: "Get Sh*t Done",
    competencies: [
      { id: "ownership", name: "Ownership & Accountability" },
      { id: "execution", name: "Execution Under Constraints" },
      { id: "roadblocks", name: "Removing Roadblocks Proactively" },
      { id: "bias_action", name: "Bias for Action" },
      { id: "shipping", name: "Shipping Quickly in Chaos" },
    ],
  },
  {
    id: "ambiguity",
    name: "Comfort in Unstructured Environments",
    competencies: [
      { id: "ambiguity_nav", name: "Ambiguity Navigation" },
      { id: "learning_fast", name: "Learning Quickly Without Clear Direction" },
      { id: "creating_clarity", name: "Creating Clarity for Others" },
      { id: "onboarding_chaos", name: "Onboarding into Chaos" },
    ],
  },
  {
    id: "communication",
    name: "Strong Communication (Synchronous & Asynchronous)",
    competencies: [
      { id: "clarity_formats", name: "Clarity Across Formats" },
      { id: "async_alignment", name: "Driving Alignment Asynchronously" },
      { id: "adapting_stakeholders", name: "Adapting to Stakeholders" },
      { id: "remote_global", name: "Remote Global Communication" },
    ],
  },
];

// ── Success Criteria by Level ──
export const SUCCESS_CRITERIA: LevelSuccessCriteria[] = [
  {
    level: "Junior P1/P2",
    levelCode: "P1-P2",
    criteria: {
      gsd: {
        low: "Waits for tasks, gets stuck easily",
        meets: "Completes tasks reliably, asks for help",
        exceeds: "Anticipates next steps, improves task process",
      },
      ambiguity: {
        low: "Freezes without instructions, avoids uncertainty",
        meets: "Asks clarifying questions, progresses with guidance",
        exceeds: "Proposes structure for unclear work, helps peers navigate ambiguity",
      },
      communication: {
        low: "Unclear updates, misses context in messages",
        meets: "Communicates status and blockers clearly",
        exceeds: "Proactively shares context, adapts tone for audience",
      },
    },
  },
  {
    level: "Mid/Career P3",
    levelCode: "P3",
    criteria: {
      gsd: {
        low: "Needs handholding, avoids responsibility",
        meets: "Independently delivers projects",
        exceeds: "Shows urgency, identifies & fixes blockers",
      },
      ambiguity: {
        low: "Relies on others for direction, uncomfortable with change",
        meets: "Creates working frameworks in ambiguous settings",
        exceeds: "Brings structure that others adopt, thrives in undefined spaces",
      },
      communication: {
        low: "Miscommunicates priorities, inconsistent follow-through",
        meets: "Keeps stakeholders aligned with regular, clear updates",
        exceeds: "Drives alignment across teams asynchronously, adapts to global contexts",
      },
    },
  },
  {
    level: "Senior/Staff P4/P5",
    levelCode: "P4-P5",
    criteria: {
      gsd: {
        low: "Blames others, can't prioritize",
        meets: "Drives cross-team execution",
        exceeds: "Solves ambiguous problems through research",
      },
      ambiguity: {
        low: "Struggles to lead without clear playbooks",
        meets: "Navigates complex ambiguity and creates clarity for teams",
        exceeds: "Turns ambiguity into repeatable frameworks that scale",
      },
      communication: {
        low: "Creates confusion in cross-functional settings",
        meets: "Communicates complex ideas clearly across functions and levels",
        exceeds: "Shapes org-wide communication practices, influences through writing",
      },
    },
  },
  {
    level: "Early Manager M3",
    levelCode: "M3",
    criteria: {
      gsd: {
        low: "Delegates without accountability, constantly chooses solutions that make them most likeable with ICs",
        meets: "Tracks team deliverables",
        exceeds: "Coaches team to unblock and execute quickly",
      },
      ambiguity: {
        low: "Passes ambiguity down to team without framing",
        meets: "Shields team from noise, provides clear priorities",
        exceeds: "Helps team build comfort with ambiguity, models adaptability",
      },
      communication: {
        low: "Inconsistent messaging to team and stakeholders",
        meets: "Maintains clear communication channels up and down",
        exceeds: "Creates communication systems that improve team-wide clarity",
      },
    },
  },
  {
    level: "Senior Manager M4/M5",
    levelCode: "M4-M5",
    criteria: {
      gsd: {
        low: "Firefights constantly",
        meets: "Establishes processes to ship work",
        exceeds: "Creates systems that scale delivery",
      },
      ambiguity: {
        low: "Avoids strategic ambiguity, defers upward",
        meets: "Sets direction in ambiguous environments for multiple teams",
        exceeds: "Builds organizational capability to operate in ambiguity",
      },
      communication: {
        low: "Creates silos, inconsistent cross-team messaging",
        meets: "Drives alignment across multiple teams and leadership",
        exceeds: "Shapes communication culture across the function",
      },
    },
  },
  {
    level: "Senior Director+",
    levelCode: "M6-VP",
    criteria: {
      gsd: {
        low: "Avoids tough calls, reactive",
        meets: "Sets goals and tracks org outcomes",
        exceeds: "Drives execution culture org-wide, balances speed and quality",
      },
      ambiguity: {
        low: "Provides unclear direction that cascades confusion",
        meets: "Navigates org-level ambiguity and creates strategic clarity",
        exceeds: "Transforms how the organization handles uncertainty and change",
      },
      communication: {
        low: "Disconnected from org communication needs",
        meets: "Sets communication standards for org-wide alignment",
        exceeds: "Models world-class communication that drives culture and strategy",
      },
    },
  },
];

// ── Interview Questions by Competency ──
export const INTERVIEW_QUESTIONS: Record<string, CompetencyQuestion[]> = {
  ownership: [
    {
      question: "Tell me about a time when you owned a project from start to finish.",
      followUps: "What were the biggest challenges? How did you hold yourself accountable? What would you do differently?",
    },
    {
      question: "Imagine your stakeholder is frustrated that something isn't moving fast enough. How do you take ownership and reset expectations?",
      followUps: "How do you balance driving the work forward while managing stakeholder concerns?",
    },
    {
      question: "You realize a deliverable you were responsible for isn't meeting the stakeholder's needs, but they haven't said anything yet. What do you do?",
      followUps: "How do you proactively surface and address quality issues?",
    },
  ],
  execution: [
    {
      question: "Describe a situation where you had limited time or resources to get something important done.",
      followUps: "How did you prioritize? Did you delegate, automate, or change scope? What was the result?",
    },
    {
      question: "You're halfway through a project and your primary stakeholder changes the requirements. What do you do?",
      followUps: "How do you manage delivery under the new constraints?",
    },
    {
      question: "You're juggling multiple competing priorities, and a key internal partner wants their project prioritized. How do you handle that?",
      followUps: "How do you ensure delivery doesn't suffer elsewhere?",
    },
  ],
  roadblocks: [
    {
      question: "Tell me about a time you spotted a potential blocker before it affected delivery. How did you address it?",
      followUps: "What signs made you anticipate the issue? Who did you communicate with? What was the result?",
    },
    {
      question: "A cross-functional partner is holding up your timeline and not responding to nudges. What do you do?",
      followUps: "How do you break through and unblock progress?",
    },
    {
      question: "You're working on something critical, and you suspect there's an approval or dependency that no one has flagged yet. How do you surface and solve that?",
      followUps: "How do you prevent it from becoming a blocker?",
    },
  ],
  bias_action: [
    {
      question: "Can you share a time when progress stalled, and you took initiative to move things forward?",
      followUps: "Why was it stuck? What exactly did you do? How did others respond?",
    },
    {
      question: "You've gotten lukewarm engagement from your internal customer or stakeholder. What do you do to move the work forward anyway?",
      followUps: "How do you maintain momentum despite lack of clear input?",
    },
    {
      question: "The person you're delivering work for is unclear about what they want. What are your next steps?",
      followUps: "Do you wait, push back, or move forward with your own assumptions?",
    },
  ],
  shipping: [
    {
      question: "Imagine you're given a critical task with high urgency and little guidance. What do you do in the first 48 hours?",
      followUps: "What assumptions would you test first? Who would you loop in? How would you report progress?",
    },
    {
      question: "A customer urgently needs a fix by tomorrow, but your team doesn't have a clear solution yet. What's your first move?",
      followUps: "How do you balance speed with quality?",
    },
    {
      question: "You're handed a last-minute request from an exec with very little detail, but a high sense of urgency. How do you decide whether and how to act?",
      followUps: "What framework do you use to prioritize?",
    },
  ],
  ambiguity_nav: [
    {
      question: "Tell me about a time you had to work in a totally ambiguous situation.",
      followUps: "How did you make sense of it? What structure or process did you create? How did others benefit?",
    },
    {
      question: "You join a project already in motion, but no one can explain the goals clearly. How do you get aligned and start contributing value?",
      followUps: "What's your approach to getting up to speed quickly?",
    },
    {
      question: "A partner team you're supposed to work with is disorganized and lacks documentation. How do you move your part of the work forward?",
      followUps: "How do you create structure where none exists?",
    },
  ],
  learning_fast: [
    {
      question: "Share an example where you were assigned something outside your comfort zone without training or precedent.",
      followUps: "How did you get up to speed? How did you manage risk while learning?",
    },
    {
      question: "You're asked to lead an effort in an unfamiliar domain, and no one has time to onboard you. How do you gain the context you need?",
      followUps: "What's your learning strategy under pressure?",
    },
    {
      question: "A stakeholder expects results fast, but there's no playbook or historical data. How do you get started?",
      followUps: "How do you balance learning with delivering?",
    },
  ],
  creating_clarity: [
    {
      question: "Tell me about a time when you brought structure or clarity to a team that was spinning.",
      followUps: "How did you identify the root cause of confusion? What systems or frameworks did you implement?",
    },
    {
      question: "Your team is overwhelmed by competing asks from multiple teams. How do you help them prioritize and establish focus?",
      followUps: "What prioritization frameworks do you use?",
    },
    {
      question: "You notice a recurring confusion between two partner teams that's causing delays. How do you address it?",
      followUps: "How do you create lasting clarity vs. a one-time fix?",
    },
  ],
  onboarding_chaos: [
    {
      question: "Imagine you just joined a new team that has no roadmap, no processes, and unclear roles. What's your 30-day plan?",
      followUps: "How would you define success? What tools or rituals would you introduce?",
    },
    {
      question: "There's an urgent initiative that no one wants to lead because it's messy and undefined. How would you evaluate whether to step in?",
      followUps: "What would your first move be?",
    },
    {
      question: "You're starting on a team that has low morale, inconsistent processes, and unclear goals. What are your first few actions?",
      followUps: "How do you build trust while also driving change?",
    },
  ],
  clarity_formats: [
    {
      question: "Tell me about a time you had to explain something complex to people with different levels of context.",
      followUps: "How did you tailor your message? Did you use visuals, metaphors, or anything else to make it stick?",
    },
    {
      question: "You need to explain a complicated issue to a stakeholder with very limited time and context. How do you craft your message?",
      followUps: "What format and level of detail do you choose?",
    },
    {
      question: "A decision needs to be documented for a broad audience across engineering, product, and execs. What do you write and how do you decide the format?",
      followUps: "How do you ensure it's useful for all audiences?",
    },
  ],
  async_alignment: [
    {
      question: "Share an example of how you kept a cross-functional team aligned asynchronously.",
      followUps: "What tools did you use? How did you ensure nothing fell through the cracks?",
    },
    {
      question: "You post an important async update, but it's met with silence. What do you do next?",
      followUps: "How do you drive engagement without in-person communication?",
    },
    {
      question: "You're leading a remote initiative with contributors in five time zones and no recurring meetings. How do you keep everyone aligned?",
      followUps: "What async rituals and tools do you rely on?",
    },
  ],
  adapting_stakeholders: [
    {
      question: "Tell me about a time you had to change your communication style to work with someone difficult.",
      followUps: "What signals did you pick up on? How did that shift impact the outcome?",
    },
    {
      question: "A senior stakeholder keeps derailing progress with last-minute feedback. How do you communicate with them to keep work on track?",
      followUps: "How do you balance respect with assertiveness?",
    },
    {
      question: "You've identified that two key collaborators prefer completely different communication styles. How do you handle that?",
      followUps: "How do you adapt without losing efficiency?",
    },
  ],
  remote_global: [
    {
      question: "Imagine a major issue happened in a globally distributed team while you're offline. How do you ensure clear communication and resolution?",
      followUps: "What playbook or structure would you follow? How do you balance transparency with urgency?",
    },
    {
      question: "You need to hand off an unfinished project to someone in another time zone. How do you ensure they fully understand where to pick up?",
      followUps: "What documentation and context do you provide?",
    },
    {
      question: "A miscommunication leads to someone doing the wrong work for two weeks. You discover it as the deadline approaches. What do you do?",
      followUps: "How do you communicate the fix and prevent it from happening again?",
    },
  ],
};

// ── Review Guidelines ──
export const REVIEW_GUIDELINES: Record<string, ReviewGuideline> = {
  ownership: {
    poor: "Provides vague examples, fails to take ownership, blames others, or doesn't reflect on outcomes. Misses signals from stakeholders or ignores quality issues.",
    meets: "Provides a clear example of ownership, communicates accountability, and describes taking initiative or adjusting based on stakeholder feedback. Met expectations in complex situations.",
    exceeds: "Demonstrates full ownership end-to-end with high accountability, anticipates stakeholder needs, proactively adjusts direction. Reflects deeply on outcomes and continuous improvement. Shows business thinking and leadership maturity.",
  },
  execution: {
    poor: "Appears overwhelmed, rigid, or reactive. Struggles to prioritize effectively. Fails to adjust approach or misses delivery.",
    meets: "Prioritizes thoughtfully under pressure, communicates tradeoffs, and adjusts the plan. Manages delivery with reasonable quality and maintains stakeholder trust.",
    exceeds: "Demonstrates agility, uses creative or strategic problem-solving (automation, reframing scope, negotiation), and delivers measurable results despite pressure. Maintains composure and alignment.",
  },
  roadblocks: {
    poor: "Passive when obstacles arise, waits for escalation, or complains about dependencies. Does not take initiative to diagnose or resolve.",
    meets: "Identifies blockers and takes logical steps to resolve them. Engages partners, clarifies dependencies, and works through issues with urgency.",
    exceeds: "Anticipates blockers before they hit, navigates relationships to unblock, escalates tactfully, and leaves systems or process improvements behind. Inspires confidence in cross-functional work.",
  },
  bias_action: {
    poor: "Waits for clarity, avoids tension, or stalls until others act. Shows discomfort with making progress under uncertainty or limited engagement.",
    meets: "Takes reasonable initiative, clarifies or reframes the problem, and progresses work through questions, experimentation, or proposed solutions.",
    exceeds: "Confidently drives progress, escalates or reframes productively, proposes hypotheses, aligns others quickly, and keeps things moving with minimal guidance. Demonstrates ownership mindset and urgency.",
  },
  shipping: {
    poor: "Paralyzed by lack of direction, focuses on risks without action, or waits for permission. Reluctant to engage others or start iterating.",
    meets: "Quickly identifies a starting point, proposes early steps, involves stakeholders, and provides updates. Focused on delivering value fast, even if imperfect.",
    exceeds: "Thrives in urgent, ambiguous settings. Instinctively prioritizes impact, makes smart trade-offs, tests assumptions, communicates proactively, and unblocks others. Demonstrates resilience and confidence under pressure.",
  },
};

// ── Helper: Get Bar Raiser text for AI context ──
export function getBarRaiserText(): string {
  let text = "TIGER DATA BAR RAISER COMPETENCY MATRIX\n";
  text += "=========================================\n\n";
  text += "The Bar Raiser framework evaluates candidates and employees across three core competency areas:\n\n";

  for (const cat of COMPETENCY_CATEGORIES) {
    text += `## ${cat.name}\n`;
    text += `Competencies: ${cat.competencies.map((c) => c.name).join(", ")}\n\n`;
  }

  text += "\n## SUCCESS CRITERIA BY LEVEL\n\n";
  for (const level of SUCCESS_CRITERIA) {
    text += `### ${level.level} (${level.levelCode})\n`;
    for (const [catId, criteria] of Object.entries(level.criteria)) {
      const catName = COMPETENCY_CATEGORIES.find((c) => c.id === catId)?.name || catId;
      text += `${catName}:\n`;
      text += `  - Low: ${criteria.low}\n`;
      text += `  - Meets: ${criteria.meets}\n`;
      text += `  - Exceeds: ${criteria.exceeds}\n`;
    }
    text += "\n";
  }

  text += "\n## REVIEW GUIDELINES (for evaluating interview responses)\n\n";
  for (const [compId, guideline] of Object.entries(REVIEW_GUIDELINES)) {
    const allComps = COMPETENCY_CATEGORIES.flatMap((c) => c.competencies);
    const comp = allComps.find((c) => c.id === compId);
    text += `### ${comp?.name || compId}\n`;
    text += `Poor: ${guideline.poor}\n`;
    text += `Meets: ${guideline.meets}\n`;
    text += `Exceeds: ${guideline.exceeds}\n\n`;
  }

  return text;
}
