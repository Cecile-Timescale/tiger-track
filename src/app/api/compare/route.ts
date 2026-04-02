import { NextRequest, NextResponse } from "next/server";
import { getLevelGuideText } from "@/lib/levelGuide";

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, department, levelA, levelB } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const levelGuide = getLevelGuideText();

    const systemPrompt = `You are a senior HR compensation expert at Tiger Data with deep knowledge of job leveling across all functions and industries. You help managers and HR partners understand the concrete differences between two levels as they apply to a SPECIFIC role.

Here is the Tiger Data Job Leveling Guide:

${levelGuide}

Your task: Given two levels and a specific role, explain the KEY DIFFERENCES for each of the 5 dimensions in a way that is deeply specific to that role. Do NOT give generic framework language — explain what the difference actually looks like in practice for someone in this specific role.

CRITICAL: Each difference should be 2-3 sentences that reference:
- What the LOWER level looks like specifically for this role
- What the HIGHER level requires specifically for this role
- The key shift or leap the person needs to make

Respond in valid JSON with this exact structure:
{
  "summary": "<1-2 sentence overview of the key leap between these levels for this role>",
  "dimensions": {
    "knowledgeExperience": "<2-3 sentences specific to this role>",
    "organizationalImpact": "<2-3 sentences specific to this role>",
    "innovationComplexity": "<2-3 sentences specific to this role>",
    "communicationInfluence": "<2-3 sentences specific to this role>",
    "leadershipTalentMgmt": "<2-3 sentences specific to this role>"
  }
}

ONLY respond with the JSON object, no other text.`;

    const userMessage = `Compare levels ${levelA} and ${levelB} specifically for:
Role: ${jobTitle || "General"}
${department ? `Department: ${department}` : ""}

Explain what the concrete differences look like for someone in this specific role.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate comparison" },
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
    console.error("Compare API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
