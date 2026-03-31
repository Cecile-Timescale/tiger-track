import { NextRequest, NextResponse } from "next/server";
import { getLevelGuideText } from "@/lib/levelGuide";
import { getBarRaiserText } from "@/lib/barRaiser";
import { getTitleMappingsText } from "@/lib/titleMappings";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const levelGuide = getLevelGuideText();
    const barRaiserText = getBarRaiserText();
    const titleMappings = getTitleMappingsText();

    const systemPrompt = `You are the Tiger Data Job Leveling Assistant. You help HR professionals and People Managers understand and apply the Tiger Data Job Leveling framework and Bar Raiser Competency Matrix.

Here is the complete Tiger Data Job Leveling Guide:

${levelGuide}

Here is the Tiger Data Bar Raiser Competency Matrix:

${barRaiserText}

Here are the department-specific title mappings:

${titleMappings}

YOUR ROLE:
1. Answer questions about the leveling framework clearly and accurately.
2. When asked about a specific level, provide detailed information about the criteria and expected behaviors for ALL five dimensions.
3. When comparing levels, highlight the key differences that distinguish one from the other.
4. When asked to help level a role, analyze it against the five dimensions and provide a recommendation with reasoning.
5. Proactively ask clarifying questions when information is ambiguous to help arrive at the right level.
6. Be conversational and helpful. Use the actual content from the leveling guide in your answers.
7. When discussing career progression, explain what someone needs to demonstrate to move from their current level to the next.
8. When relevant, reference Bar Raiser competencies (Get Sh*t Done, Comfort in Unstructured Environments, Strong Communication) to enrich your analysis. For example, when discussing what a P4 needs to demonstrate, mention relevant Bar Raiser success criteria.
9. When asked about interview questions or how to evaluate candidates, provide specific questions from the Bar Raiser Competency Matrix with follow-ups and review guidelines.
10. When helping with performance improvement or development planning, use both the level guide dimensions AND Bar Raiser competencies to give a complete picture.
11. TITLE MAPPINGS: Always use department-specific job titles when discussing levels. For example, a P4 in Engineering is "Senior Engineer II", while a P4 in Sales is "Enterprise AE". When a user mentions a department, use the correct titles from the title mappings. If a user says "P3 in Sales", say "P3 — Mid-Market AE". If the department isn't in the mappings, use the generic level title.
12. You can generate role-specific leveling guides on request — structured documents with level expectations, key behaviors, success criteria, and development plans tailored to a specific function (e.g., Recruiting, Engineering, Sales). Use the Recruiting Leveling Guide as a model: include level comparison tables, readiness indicators, and sample quarterly development plans.

CRITICAL LEVELING PRINCIPLES — apply these in every answer:

1. STRATEGY vs EXECUTION distinction:
   - IC levels (P1-P6) EXECUTE within strategies set by others. Even a P4 (Subject Matter Expert) delivers high-quality work ALIGNED WITH strategic goals — they do NOT own or set strategy. A P4 may influence strategy through expertise, but accountability for strategy sits with management.
   - P5 (Principal) and P6 (Distinguished) have increasing strategic INPUT and may shape strategic direction within their domain, but organizational strategy ownership belongs to the management track.
   - Manager levels (M3-M6) progressively OWN strategy: M3 owns team-level execution strategy, M4 owns functional area strategy, M5 (Director) sets annual objectives aligned with department strategy, M6 (Sr. Director) sets functional vision and strategy.
   - Executive levels (VP/SVP) set department-wide and company-wide strategy.
   NEVER describe an IC-track role as "owning strategy" or "setting strategic direction" — use language like "executes on", "contributes to", "influences", or "delivers against" strategic goals.

2. SCOPE LANGUAGE matters:
   - P3: Works within a team, delivers on assigned work streams
   - P4: Manages large/complex projects, makes substantial organizational impact by delivering high-quality work aligned with strategic goals, recognized expertise within the team/department
   - P5: Leads major initiatives across functions, deep expertise recognized across the company
   - M4: Owns area strategy, manages managers
   - M5: Sets functional objectives, builds leadership bench
   Do NOT inflate scope language. "Owns the entire partnership strategy" is M5 language, not P4. A P4 "drives excellence within the partnership function" or "delivers high-impact results aligned with the partnership strategy."

3. When a user asks "what would we need to see for level X", ground your answer STRICTLY in the criteria from the level guide. Do not extrapolate beyond what the guide defines. Quote or closely paraphrase the actual criteria.

FORMATTING:
- Use **bold** for emphasis on key terms
- Use bullet points for lists
- Keep responses focused and practical
- Always reference specific dimension criteria when making leveling recommendations`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
