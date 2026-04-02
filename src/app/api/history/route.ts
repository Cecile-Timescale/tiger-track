import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Retrieve leveling history for a specific user
export async function GET(req: NextRequest) {
  try {
    const userEmail = req.nextUrl.searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json(
        { error: "userEmail is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT id, user_email, job_title, department, recommended_level, confidence,
              reasoning, dimension_scores, clarifying_questions, created_at
       FROM leveling_history
       WHERE user_email = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userEmail]
    );

    return NextResponse.json({ history: result.rows });
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve leveling history" },
      { status: 500 }
    );
  }
}

// POST: Save a new leveling decision
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userEmail,
      jobTitle,
      department,
      jobDescription,
      recommendedLevel,
      confidence,
      reasoning,
      dimensionScores,
      questions,
    } = body;

    if (!userEmail || !jobDescription || !recommendedLevel) {
      return NextResponse.json(
        { error: "userEmail, jobDescription, and recommendedLevel are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO leveling_history
        (user_email, job_title, department, job_description, recommended_level,
         confidence, reasoning, dimension_scores, clarifying_questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at`,
      [
        userEmail,
        jobTitle || null,
        department || null,
        jobDescription,
        recommendedLevel,
        confidence,
        reasoning,
        JSON.stringify(dimensionScores || []),
        JSON.stringify(questions || []),
      ]
    );

    return NextResponse.json({
      saved: true,
      id: result.rows[0].id,
      created_at: result.rows[0].created_at,
    });
  } catch (error) {
    console.error("History POST error:", error);
    return NextResponse.json(
      { error: "Failed to save leveling decision" },
      { status: 500 }
    );
  }
}
