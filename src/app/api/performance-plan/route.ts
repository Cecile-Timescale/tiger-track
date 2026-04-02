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
      participants,
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
      companyBlock += `- Do NOT assume formal mentorship programs, L&D budgets, leadership academies, or executive coaching programs exist.\n`;
      companyBlock += `- DO recommend scrappy, practical actions: learning from peers, taking on stretch projects, external communities, self-directed learning, cross-functional collaboration.\n`;
      companyBlock += `- DO consider that people at a startup wear multiple hats and have more direct access to leadership.\n`;
      companyBlock += `- Tailor every recommendation to what's ACTUALLY possible at a company of this size and stage.\n`;
    }

    const systemPrompt = `You are a senior HR business partner at Tiger Data, a technology company. You create focused, actionable Performance Improvement Plans (PIPs) that give employees clear expectations and concrete deliverables over a 4-week period.
${companyBlock}

Here is the Tiger Data Job Leveling Guide:

${levelGuide}

CRITICAL CONTEXT — HOW THIS PIP WORKS:

The manager has described specific gaps in the employee's performance. Your job is to:

1. UNDERSTAND THE GAPS in the context of the Tiger Data leveling framework. Map the manager's observations to what the current level (${currentLevel}) and target level (${targetLevel}) REQUIRE.

2. GENERATE ROLE REQUIREMENTS — Based on the role, level, and gaps described, produce 4-6 key requirements/expectations that this person should be meeting at their level. These should be SPECIFIC to the role (not generic competency statements). They should directly address the gaps the manager identified.

3. For EACH requirement, produce a SPECIFIC DELIVERY OUTCOME — a concrete, measurable thing the person must deliver within the next 4 weeks that proves they can meet this requirement. Delivery outcomes should:
   - Be achievable in 4 weeks
   - Name specific tools, systems, or processes relevant to the role
   - Describe a tangible output (a document, a campaign, a dashboard, a strategy, a presentation, etc.)
   - Be detailed enough that both the manager and employee know exactly what "done" looks like

4. Write a DELIVERY ISSUES summary — a narrative (3-5 sentences) that explains the core problem, connecting the manager's gap description to the level requirements. This should read like a professional HR document.

IMPORTANT — LEVEL-SPECIFIC REQUIREMENTS:
- The gaps described by the manager should be mapped to what the Tiger Data level guide says about ${currentLevel} and ${targetLevel}.
- If the gap is about "influence" and the target is P5, explain what P5-level influence looks like for THIS specific role.
- If the gap is about "driving complex projects," explain what ${targetLevel}-level project ownership means for THIS role.
- Every requirement and delivery outcome must connect back to: (a) the gap the manager described, AND (b) the level expectations.

Respond in valid JSON with this exact structure:
{
  "deliveryIssues": "<3-5 sentence narrative summarizing the core performance gaps, tying them to the level requirements. Written in third person about the employee. Professional HR tone.>",
  "roleRequirements": [
    {
      "requirement": "<A specific role requirement/expectation that this person should be meeting at their level — directly tied to one of the gaps described>",
      "deliveryOutcome": "<A concrete, specific deliverable the person must complete in the next 4 weeks to demonstrate this capability. Should be detailed and name specific outputs.>"
    }
  ],
  "levelContext": "<2-3 sentences explaining what ${currentLevel} vs ${targetLevel} requires in the context of this role, specifically around the gaps identified>",
  "weeklyCheckpoints": [
    {
      "week": "Week 1",
      "focus": "<What should be accomplished by end of week 1>",
      "checkIn": "<What manager should look for / ask about>"
    },
    {
      "week": "Week 2",
      "focus": "<What should be accomplished by end of week 2>",
      "checkIn": "<What manager should look for / ask about>"
    },
    {
      "week": "Week 3",
      "focus": "<What should be accomplished by end of week 3>",
      "checkIn": "<What manager should look for / ask about>"
    },
    {
      "week": "Week 4",
      "focus": "<What should be accomplished by end of week 4 — final deliverables>",
      "checkIn": "<Final assessment criteria>"
    }
  ],
  "consequenceStatement": "Failure to meet the expectations and deliverables outlined in this performance improvement plan may result in further disciplinary actions, up to and including termination."
}

CRITICAL RULES:
- Produce 4-6 roleRequirements, each with a specific deliveryOutcome
- Every deliveryOutcome must be completable within 4 weeks
- deliveryOutcomes should be SPECIFIC to this role — reference actual tools, processes, and outputs this role would produce
- Do NOT use generic language like "demonstrate improved communication" — instead say exactly what they need to produce
- The deliveryIssues narrative should read like a real HR document, not a template
- Weekly checkpoints should build progressively toward the final deliverables

ONLY respond with the JSON object, no other text.`;

    const userMessage = `Create a 4-week Performance Improvement Plan for:

Employee: ${employeeName}
Role: ${currentRole}
${department ? `Department: ${department}` : ""}
Current Level: ${currentLevel}
Target Level: ${targetLevel}
${participants ? `Participants: ${participants}` : ""}

Manager's description of the performance gaps:
${gapDescription}

${strengths ? `Known strengths:\n${strengths}` : ""}

Based on this, create a focused 4-week PIP that maps these specific gaps to concrete delivery outcomes the employee must achieve, grounded in what ${currentLevel}/${targetLevel} requires for this role.`;

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
