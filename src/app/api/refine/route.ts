import { NextRequest, NextResponse } from "next/server";
import { getLevelGuideText } from "@/lib/levelGuide";

export async function POST(req: NextRequest) {
  try {
    const {
      originalResult,
      refinementFeedback,
      companyContext,
      contextType, // "performance-plan" | "insights" | "level"
    } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const levelGuide = getLevelGuideText();

    let companyBlock = "";
    if (companyContext) {
      companyBlock = "\n\nCOMPANY CONTEXT — all recommendations MUST fit this reality:\n";
      if (companyContext.companySize) companyBlock += `- Company size: ${companyContext.companySize}\n`;
      if (companyContext.companyStage) companyBlock += `- Company stage: ${companyContext.companyStage}\n`;
      if (companyContext.constraints) companyBlock += `- Constraints: ${companyContext.constraints}\n`;
    }

    const systemPrompt = `You are a senior HR business partner at Tiger Data. You have already generated an analysis or plan, and the user has provided feedback about what doesn't work for their company. Your job is to REFINE the output based on their feedback.
${companyBlock}

Here is the Tiger Data Job Leveling Guide for reference:
${levelGuide}

CRITICAL RULES:
1. Take the user's feedback seriously — if they say something isn't realistic for their company, REPLACE IT with something that is.
2. Keep everything else the same — only change what the feedback asks you to change.
3. Maintain the same JSON structure as the original.
4. Every replacement recommendation must be practical and actionable at the company's actual size and stage.
5. Do NOT add disclaimers or notes about the changes — just produce the improved version.

ONLY respond with the refined JSON object, no other text.`;

    let userMessage = "";

    if (contextType === "performance-plan") {
      userMessage = `Here is the original performance improvement plan (JSON):

${JSON.stringify(originalResult, null, 2)}

The user's feedback on what needs to change:
"${refinementFeedback}"

Please refine the plan based on this feedback. Keep the same JSON structure. Replace any recommendations that don't fit the company's reality with practical alternatives.`;
    } else if (contextType === "insights") {
      userMessage = `Here is the original AI analysis / promotion readiness text:

${originalResult}

The user's feedback on what needs to change:
"${refinementFeedback}"

Please refine the analysis based on this feedback. Return ONLY the refined markdown text (not JSON). Replace any recommendations that don't fit the company's reality with practical alternatives.`;
    } else {
      userMessage = `Here is the original leveling result (JSON):

${JSON.stringify(originalResult, null, 2)}

The user's feedback on what needs to change:
"${refinementFeedback}"

Please refine the result based on this feedback. Keep the same JSON structure.`;
    }

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
        { error: "Failed to refine analysis" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // For insights (markdown), return as-is
    if (contextType === "insights") {
      return NextResponse.json({ refined: content, type: "text" });
    }

    // For JSON types, parse
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse refined AI response" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ refined: result, type: "json" });
  } catch (error) {
    console.error("Refine API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
