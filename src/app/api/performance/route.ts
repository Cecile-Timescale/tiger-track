import { NextRequest, NextResponse } from "next/server";
import { getLevelGuideText } from "@/lib/levelGuide";
import { getBarRaiserText } from "@/lib/barRaiser";

export async function POST(req: NextRequest) {
  try {
    const { employeeName, currentRole, currentLevel, targetLevel, dimensions } =
      await req.json();

    if (!currentLevel || !targetLevel || !dimensions) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const systemPrompt = `You are an expert HR performance coach for Tiger Data. You help managers identify gaps and build development plans for their team members using the Tiger Data Level Guide and Bar Raiser Competency Matrix.

Here is the Tiger Data Level Guide:
${levelGuide}

Here is the Tiger Data Bar Raiser Competency Matrix:
${barRaiserText}

Your task is to:
1. Analyze the gap between the employee's current demonstrated level and their target level across all 5 dimensions
2. Create a practical, quarterly development plan (Q1-Q4) to close those gaps

IMPORTANT RULES:
- Be specific and actionable — avoid generic advice
- Reference actual criteria from the level guide for both current and target levels
- Include Bar Raiser competencies where relevant (e.g., if someone needs to improve execution, reference "Get Sh*t Done" criteria)
- Each quarter should build on the previous one
- Include measurable deliverables and milestones
- Be honest about gaps but frame them constructively
- If the employee exceeds expectations in a dimension, acknowledge it and suggest how to leverage that strength

Respond in valid JSON with this exact structure:
{
  "gapAnalysis": [
    {
      "dimension": "Knowledge & Experience",
      "currentAssessment": "<1-2 sentences on where they are>",
      "targetExpectation": "<1-2 sentences on what target level requires>",
      "gapSeverity": "none" | "minor" | "significant" | "strength",
      "keyActions": ["<specific action 1>", "<specific action 2>"]
    }
  ],
  "developmentPlan": [
    {
      "quarter": "Q1",
      "theme": "<short theme, e.g. 'Build Foundation'>",
      "goals": ["<goal 1>", "<goal 2>"],
      "deliverables": ["<deliverable 1>", "<deliverable 2>"],
      "milestones": ["<milestone 1>", "<milestone 2>"],
      "barRaiserFocus": "<which Bar Raiser competency to focus on and why>"
    }
  ],
  "overallSummary": "<2-3 sentence executive summary of the gap analysis and plan>"
}

ONLY respond with the JSON object, no other text.`;

    const dimensionSummary = dimensions
      .map(
        (d: { name: string; rating: string; notes: string }) =>
          `${d.name}: ${d.rating}${d.notes ? ` — Manager notes: ${d.notes}` : ""}`
      )
      .join("\n");

    const userMessage = `Please create a gap analysis and development plan for:

Employee: ${employeeName || "Not specified"}
Current Role: ${currentRole || "Not specified"}
Current Level: ${currentLevel}
Target Level: ${targetLevel}

Manager's Assessment of Current Performance by Dimension:
${dimensionSummary}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate performance analysis" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Performance API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
