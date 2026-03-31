import { NextRequest, NextResponse } from "next/server";
import { getLevelGuideText } from "@/lib/levelGuide";

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, department, jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
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

    const systemPrompt = `You are an expert HR analyst for Tiger Data. Your role is to analyze job descriptions and determine the appropriate job level based on the Tiger Data Job Leveling Guide.

Here is the complete Tiger Data Job Leveling Guide:

${levelGuide}

IMPORTANT RULES:
1. Analyze the job description against ALL five dimensions: Knowledge & Experience, Organizational Impact, Innovation & Complexity, Communication & Influence, and Leadership & Talent Management.
2. For each dimension, determine which level best matches the job description.
3. The overall recommended level should reflect where the MAJORITY of dimensions fall. If dimensions are split, lean toward the lower level.
4. Be specific in your rationale — cite specific phrases from the job description and explain how they map to the level criteria.
5. Always suggest 2-4 clarifying questions that could help refine the leveling if answered.
6. Valid level codes are: P1, P2, P3, P4, P5, P6 (Individual Contributors), M1, M2, M3, M4, M5, M6 (People Managers), VP, SVP (Executives).
7. First determine the TRACK (IC vs Manager vs Executive) based on whether the role manages people, then level within that track.

Respond in valid JSON with this exact structure:
{
  "recommendedLevel": "<level code>",
  "confidence": "High" | "Medium" | "Low",
  "reasoning": "<2-3 sentence summary of why this level was chosen>",
  "dimensionScores": [
    {
      "dimension": "Knowledge & Experience",
      "suggestedLevel": "<level code>",
      "rationale": "<1-2 sentences>"
    },
    {
      "dimension": "Organizational Impact",
      "suggestedLevel": "<level code>",
      "rationale": "<1-2 sentences>"
    },
    {
      "dimension": "Innovation & Complexity",
      "suggestedLevel": "<level code>",
      "rationale": "<1-2 sentences>"
    },
    {
      "dimension": "Communication & Influence",
      "suggestedLevel": "<level code>",
      "rationale": "<1-2 sentences>"
    },
    {
      "dimension": "Leadership & Talent Management",
      "suggestedLevel": "<level code>",
      "rationale": "<1-2 sentences>"
    }
  ],
  "questions": ["<clarifying question 1>", "<clarifying question 2>", ...]
}

ONLY respond with the JSON object, no other text.`;

    const userMessage = `Please analyze and level the following role:

${jobTitle ? `Job Title: ${jobTitle}` : ""}
${department ? `Department: ${department}` : ""}

Job Description / Responsibilities:
${jobDescription}`;

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
        { error: "Failed to analyze job description" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON from response
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
    console.error("Level API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
