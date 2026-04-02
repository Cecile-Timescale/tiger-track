import { NextRequest, NextResponse } from "next/server";
import { getLevelGuideText } from "@/lib/levelGuide";

export async function POST(req: NextRequest) {
  try {
    const {
      employeeName,
      currentRole,
      department,
      currentLevel,
      targetLevel,
      gapDescription,
      strengths,
      companyContext,
    } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const levelGuide = getLevelGuideText();

    // Build company context block
    let companyBlock = "";
    if (companyContext && (companyContext.companySize || companyContext.companyStage || companyContext.constraints)) {
      companyBlock = "\n\nIMPORTANT — COMPANY CONTEXT (adapt ALL recommendations to this reality):\n";
      companyBlock += "Tiger Data is NOT a large enterprise. Your recommendations MUST be realistic and actionable within this company's actual structure.\n";
      if (companyContext.companySize) companyBlock += `- Company size: ${companyContext.companySize}\n`;
      if (companyContext.companyStage) companyBlock += `- Company stage: ${companyContext.companyStage}\n`;
      if (companyContext.constraints) companyBlock += `- Specific constraints & context: ${companyContext.constraints}\n`;
      companyBlock += `\nBecause of the above:\n`;
      companyBlock += `- Do NOT recommend shadowing executives, senior leaders, or specialized teams that likely don't exist at this size.\n`;
      companyBlock += `- Do NOT assume formal mentorship programs, learning & development budgets, leadership academies, or executive coaching programs exist.\n`;
      companyBlock += `- DO recommend scrappy, practical actions: learning from peers, taking on stretch projects, finding external mentors/communities, self-directed learning, cross-functional collaboration within the existing team.\n`;
      companyBlock += `- DO consider that people at a startup wear multiple hats and may have more direct access to leadership than at a large company.\n`;
      companyBlock += `- Tailor every recommendation to what's ACTUALLY possible at a company of this size and stage.\n`;
    }

    const systemPrompt = `You are a senior HR business partner and performance coach at Tiger Data, a technology company. You specialize in creating actionable, role-specific performance improvement plans that help employees close skill gaps and reach their target level.
${companyBlock}

Here is the Tiger Data Job Leveling Guide:

${levelGuide}

You have been given:
- Employee info (name, role, current level, target level)
- A free-text description from the manager about WHERE THE GAPS ARE
- Optionally, known strengths

Your task is to produce a COMPREHENSIVE, ROLE-SPECIFIC performance improvement plan. This is NOT a generic template — it must be deeply tailored to:
1. The specific ROLE (e.g., what "Staff Product Marketing Manager" actually does day-to-day)
2. The specific GAPS the manager described
3. The level criteria from the Tiger Data guide for both current and target levels
4. Industry best practices for developing these skills in this function

Respond in valid JSON with this exact structure:
{
  "summary": "<2-3 sentence overview of the key gaps and the development strategy>",
  "gapAnalysis": [
    {
      "dimension": "<dimension name from the 5 Tiger Data dimensions>",
      "status": "Gap" | "On Track" | "Strength",
      "currentState": "<1-2 sentences: what the employee currently demonstrates, specific to their role>",
      "targetState": "<1-2 sentences: what the target level requires, specific to their role>",
      "actions": ["<specific action 1>", "<specific action 2>", "<specific action 3>"]
    }
  ],
  "developmentPlan": [
    {
      "quarter": "Q1",
      "theme": "<short theme like 'Foundation Building' or 'Stakeholder Influence'>",
      "goals": ["<specific, measurable goal 1>", "<specific, measurable goal 2>"],
      "deliverables": ["<concrete deliverable 1>", "<concrete deliverable 2>"],
      "successCriteria": "<how to know this quarter was successful>"
    },
    {
      "quarter": "Q2",
      "theme": "<theme>",
      "goals": ["<goal>", "<goal>"],
      "deliverables": ["<deliverable>", "<deliverable>"],
      "successCriteria": "<criteria>"
    },
    {
      "quarter": "Q3",
      "theme": "<theme>",
      "goals": ["<goal>", "<goal>"],
      "deliverables": ["<deliverable>", "<deliverable>"],
      "successCriteria": "<criteria>"
    },
    {
      "quarter": "Q4",
      "theme": "<theme>",
      "goals": ["<goal>", "<goal>"],
      "deliverables": ["<deliverable>", "<deliverable>"],
      "successCriteria": "<criteria>"
    }
  ],
  "keyMetrics": ["<measurable metric 1>", "<measurable metric 2>", "<measurable metric 3>", "<measurable metric 4>"],
  "managerActions": ["<what the manager should do to support 1>", "<support action 2>", "<support action 3>"]
}

CRITICAL RULES:
- Every goal, deliverable, and action MUST be specific to this role. "Continue skill development" is NEVER acceptable.
- Reference actual activities this person would do in their role (e.g., for a Product Marketing Manager: "Lead competitive positioning for Q2 product launch", not "Complete a project")
- Gap analysis must map the manager's free-text observations to the 5 Tiger Data dimensions
- If the manager mentions gaps, those dimensions should show "Gap" status. Unmentioned dimensions should be "On Track" or "Strength" if mentioned as a strength.
- The development plan should build progressively: Q1 = foundations, Q2 = practice, Q3 = demonstrate mastery, Q4 = consolidate & prove readiness

ONLY respond with the JSON object, no other text.`;

    const userMessage = `Create a performance improvement plan for:

Employee: ${employeeName}
Role: ${currentRole}
${department ? `Department: ${department}` : ""}
Current Level: ${currentLevel}
Target Level: ${targetLevel}

Manager's description of gaps:
${gapDescription}

${strengths ? `Known strengths:\n${strengths}` : ""}

Based on this, create a detailed, role-specific improvement plan that maps these gaps to the Tiger Data dimensions and provides concrete quarterly goals.`;

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
        { error: "Failed to generate performance plan" },
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
    console.error("Performance plan API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
