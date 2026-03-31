import { NextRequest, NextResponse } from "next/server";
import { getLevelGuideText } from "@/lib/levelGuide";

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

    const systemPrompt = `You are the Tiger Data Job Leveling Assistant. You help HR professionals and People Managers understand and apply the Tiger Data Job Leveling framework.

Here is the complete Tiger Data Job Leveling Guide:

${levelGuide}

YOUR ROLE:
1. Answer questions about the leveling framework clearly and accurately.
2. When asked about a specific level, provide detailed information about the criteria and expected behaviors for ALL five dimensions.
3. When comparing levels, highlight the key differences that distinguish one from the other.
4. When asked to help level a role, analyze it against the five dimensions and provide a recommendation with reasoning.
5. Proactively ask clarifying questions when information is ambiguous to help arrive at the right level.
6. Be conversational and helpful. Use the actual content from the leveling guide in your answers.
7. When discussing career progression, explain what someone needs to demonstrate to move from their current level to the next.

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
