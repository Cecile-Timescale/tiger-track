import { NextRequest, NextResponse } from "next/server";
import { getLevelGuideText } from "@/lib/levelGuide";

export async function POST(req: NextRequest) {
  try {
    const {
      jobTitle,
      department,
      recommendedLevel,
      levelTitle,
      track,
      reasoning,
      dimensionScores,
    } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const levelGuide = getLevelGuideText();

    // Determine the next level up for promotion guidance
    const levelOrder = ["P1", "P2", "P3", "P4", "P5", "P6", "M3", "M4", "M5", "M6", "VP"];
    const currentIndex = levelOrder.indexOf(recommendedLevel.toUpperCase());
    const nextLevel = currentIndex >= 0 && currentIndex < levelOrder.length - 1
      ? levelOrder[currentIndex + 1]
      : null;

    const dimensionSummary = dimensionScores
      .map((d: { dimension: string; suggestedLevel: string; rationale: string }) =>
        `${d.dimension}: ${d.suggestedLevel} — ${d.rationale}`
      )
      .join("\n");

    const systemPrompt = `You are a senior HR business partner and career development expert at Tiger Data. You have deep expertise in:
- Career architecture and job leveling across all functions
- Role-specific competency development (you understand what excellence looks like for EVERY type of role)
- Promotion readiness assessment
- Industry benchmarks for role expectations at each level

Here is the Tiger Data Job Leveling Guide for reference:

${levelGuide}

Your task is to provide a COMPREHENSIVE, ROLE-SPECIFIC analysis of what someone in this role needs to demonstrate for promotion readiness. This is NOT generic advice — it must be deeply tailored to the specific role, function, and industry context.

CRITICAL INSTRUCTIONS:
1. Use your extensive knowledge of the SPECIFIC ROLE to provide concrete, actionable guidance. For example:
   - For a "Senior Data Engineer" → reference specific technical competencies like pipeline architecture, data modeling, observability
   - For an "Executive Assistant" → reference executive communication, calendar optimization, stakeholder management
   - For a "Product Manager" → reference product strategy, roadmap ownership, cross-functional leadership

2. For EACH dimension, explain:
   - What "at level" looks like specifically for THIS ROLE (not generic descriptions)
   - What the NEXT LEVEL requires specifically for THIS ROLE
   - 2-3 concrete actions they can take to demonstrate readiness

3. End with 4-6 "Practical Development Actions" that are HIGHLY SPECIFIC to this role and function.

4. The analysis should feel like it was written by someone who deeply understands the role, not someone reading from a generic framework.

FORMAT: Write in clean markdown with ## and ### headers. Use bullet points for actionable items. Keep the total response between 800-1200 words. Be specific and substantive — no filler.`;

    const userMessage = `Please provide a comprehensive promotion readiness analysis for:

Role: ${jobTitle || "Unknown Role"}
Department: ${department || "Not specified"}
Current Level: ${recommendedLevel} — ${levelTitle} (${track})
${nextLevel ? `Next Level Target: ${nextLevel}` : ""}

Current Assessment:
${reasoning}

Dimension Scores:
${dimensionSummary}

Provide deep, role-specific guidance on what this person needs to demonstrate for promotion readiness to the next level. Use your extensive knowledge of what "${jobTitle}" roles typically involve at each level in the industry.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate insights" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const insights = data.content[0].text;

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
