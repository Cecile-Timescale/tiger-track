import { NextRequest, NextResponse } from "next/server";
import { getLevelGuideText } from "@/lib/levelGuide";

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, department, jobDescription, questionAnswers, additionalContext, companyContext } = await req.json();

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

    const systemPrompt = `You are a senior HR compensation and leveling expert at Tiger Data, a technology company. You have deep expertise in organizational design, job architecture, and career frameworks across all functions (engineering, product, design, sales, marketing, finance, operations, people ops, legal, etc.).

Your role is to analyze job descriptions and determine the appropriate job level using the Tiger Data Job Leveling Guide. You bring EXTENSIVE industry knowledge about what roles at each level typically look like in practice — not just matching keywords, but understanding the true scope, complexity, and impact of the work.

Here is the complete Tiger Data Job Leveling Guide:

${levelGuide}

ANALYSIS APPROACH:
1. First, use your deep knowledge of the SPECIFIC ROLE being analyzed. For example, if it's a "Senior Data Engineer", draw on your understanding of what senior data engineers typically do in the industry — the technologies they own, the systems they architect, the cross-team influence they have. If it's an "Executive Assistant", draw on what top EAs do at high-growth tech companies.

2. Analyze the job description against ALL five dimensions: Knowledge & Experience, Organizational Impact, Innovation & Complexity, Communication & Influence, and Leadership & Talent Management.

3. For each dimension, provide a DETAILED rationale (3-5 sentences) that:
   - Cites SPECIFIC phrases or responsibilities from the job description
   - Explains how these map to the level criteria from the Tiger Data guide
   - Draws on industry context for this specific role (e.g., "In the data engineering field, owning end-to-end pipeline architecture with 5+ years experience typically indicates...")
   - Notes any responsibilities that might push toward a higher or lower level

4. The overall recommended level should reflect where the MAJORITY of dimensions fall. If dimensions are split, lean toward the lower level and explain the tension.

5. In the reasoning summary, be specific about what makes this role THIS level and not one level higher or lower. Reference the key distinguishing factors.

6. Suggest 3-4 clarifying questions that would materially affect the leveling decision. These should be specific to the role, not generic.

7. Valid level codes: P1, P2, P3, P4, P5, P6 (Individual Contributors), M3, M4, M5, M6 (People Managers), VP (Executives).

8. First determine the TRACK (IC vs Manager vs Executive) based on whether the role manages people, then level within that track.

IMPORTANT: Your dimension rationales should be SUBSTANTIVE (3-5 sentences each). Do NOT give generic one-liners. Reference specific aspects of the job description AND industry context for the role.
${companyContext && (companyContext.companySize || companyContext.companyStage || companyContext.constraints) ? `
COMPANY CONTEXT — factor this into your analysis:
${companyContext.companySize ? `- Company size: ${companyContext.companySize}` : ""}
${companyContext.companyStage ? `- Company stage: ${companyContext.companyStage}` : ""}
${companyContext.constraints ? `- Constraints: ${companyContext.constraints}` : ""}
Consider the company context when assessing scope and impact. A role at a 170-person startup may have broader scope than the same title at a large enterprise.
` : ""}
Respond in valid JSON with this exact structure:
{
  "recommendedLevel": "<level code>",
  "confidence": "High" | "Medium" | "Low",
  "reasoning": "<3-4 sentence summary explaining why this level, with specific references to what distinguishes it from one level higher and one level lower>",
  "dimensionScores": [
    {
      "dimension": "Knowledge & Experience",
      "suggestedLevel": "<level code>",
      "rationale": "<3-5 sentences with specific JD references and industry context>"
    },
    {
      "dimension": "Organizational Impact",
      "suggestedLevel": "<level code>",
      "rationale": "<3-5 sentences with specific JD references and industry context>"
    },
    {
      "dimension": "Innovation & Complexity",
      "suggestedLevel": "<level code>",
      "rationale": "<3-5 sentences with specific JD references and industry context>"
    },
    {
      "dimension": "Communication & Influence",
      "suggestedLevel": "<level code>",
      "rationale": "<3-5 sentences with specific JD references and industry context>"
    },
    {
      "dimension": "Leadership & Talent Management",
      "suggestedLevel": "<level code>",
      "rationale": "<3-5 sentences with specific JD references and industry context>"
    }
  ],
  "questions": ["<specific clarifying question 1>", "<specific clarifying question 2>", "<specific clarifying question 3>"]
}

ONLY respond with the JSON object, no other text.`;

    // Build question answers block if this is a refinement
    let qaBlock = "";
    if (questionAnswers && questionAnswers.length > 0) {
      qaBlock = "\n\nCLARIFYING ANSWERS (use these to refine your leveling — the user answered questions from a previous analysis):\n";
      for (const qa of questionAnswers) {
        qaBlock += `Q: ${qa.question}\nA: ${qa.answer}\n\n`;
      }
      qaBlock += "IMPORTANT: Use these answers to make a MORE ACCURATE leveling decision. The answers may confirm or change the initial level recommendation. Re-evaluate all dimensions in light of this new information.\n";
    }

    let additionalBlock = "";
    if (additionalContext) {
      additionalBlock = `\n\nADDITIONAL CONTEXT PROVIDED BY USER:\n${additionalContext}\n\nUse this additional context alongside the job description to make a more accurate leveling decision.\n`;
    }

    const userMessage = `Please analyze and level the following role:

${jobTitle ? `Job Title: ${jobTitle}` : ""}
${department ? `Department: ${department}` : ""}

Job Description / Responsibilities:
${jobDescription}${qaBlock}${additionalBlock}`;

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
