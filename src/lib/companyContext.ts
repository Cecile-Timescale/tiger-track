// Company context that informs all AI recommendations
// Stored in localStorage so it persists across sessions

export interface CompanyContext {
  companySize: string;
  companyStage: string;
  constraints: string;
}

const STORAGE_KEY = "tiger-track-company-context";

const DEFAULT_CONTEXT: CompanyContext = {
  companySize: "",
  companyStage: "",
  constraints: "",
};

export function getCompanyContext(): CompanyContext {
  if (typeof window === "undefined") return DEFAULT_CONTEXT;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return DEFAULT_CONTEXT;
}

export function saveCompanyContext(ctx: CompanyContext) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
}

export function hasCompanyContext(): boolean {
  const ctx = getCompanyContext();
  return !!(ctx.companySize || ctx.companyStage || ctx.constraints);
}

/**
 * Build a text block that can be injected into any AI system prompt
 * to make recommendations realistic for the company.
 */
export function buildCompanyContextPrompt(ctx?: CompanyContext): string {
  const c = ctx || getCompanyContext();
  if (!c.companySize && !c.companyStage && !c.constraints) return "";

  let text = "\n\nIMPORTANT — COMPANY CONTEXT (adapt ALL recommendations to this reality):\n";
  text += "Tiger Data is NOT a large enterprise. Your recommendations MUST be realistic and actionable within this company's actual structure.\n";
  if (c.companySize) text += `- Company size: ${c.companySize}\n`;
  if (c.companyStage) text += `- Company stage: ${c.companyStage}\n`;
  if (c.constraints) text += `- Specific constraints & context: ${c.constraints}\n`;
  text += `\nBecause of the above:\n`;
  text += `- Do NOT recommend shadowing executives, senior leaders, or specialized teams that likely don't exist at this size.\n`;
  text += `- Do NOT assume formal mentorship programs, learning & development budgets, leadership academies, or executive coaching programs exist.\n`;
  text += `- DO recommend scrappy, practical actions: learning from peers, taking on stretch projects, finding external mentors/communities, self-directed learning, cross-functional collaboration within the existing team.\n`;
  text += `- DO consider that people at a startup wear multiple hats and may have more direct access to leadership than at a large company.\n`;
  text += `- Tailor every recommendation to what's ACTUALLY possible at a company of this size and stage.\n`;
  return text;
}
