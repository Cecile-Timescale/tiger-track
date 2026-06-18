import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Ensure the leveling_history table exists. Idempotent and cheap; called on
// every read/write so a freshly-provisioned Ghost database doesn't silently
// drop entries before someone runs migrations manually.
let tableEnsured = false;
async function ensureTable() {
  if (tableEnsured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leveling_history (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      job_title TEXT,
      department TEXT,
      job_description TEXT NOT NULL,
      recommended_level TEXT NOT NULL,
      confidence TEXT,
      reasoning TEXT,
      dimension_scores JSONB DEFAULT '[]'::jsonb,
      clarifying_questions JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS leveling_history_user_email_idx ON leveling_history (user_email, created_at DESC);`
  );
  tableEnsured = true;
}

function describeError(err: unknown): { message: string; code?: string } {
  if (err && typeof err === "object") {
    const e = err as { message?: string; code?: string };
    return { message: e.message || "Unknown database error", code: e.code };
  }
  return { message: String(err) };
}

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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: "DATABASE_URL is not configured",
          reason: "missing_env",
          history: [],
        },
        { status: 503 }
      );
    }

    await ensureTable();

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
    const { message, code } = describeError(error);
    console.error("History GET error:", message, code);
    return NextResponse.json(
      {
        error: "Failed to retrieve leveling history",
        reason: code || "db_error",
        detail: message,
        history: [],
      },
      { status: 503 }
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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: "DATABASE_URL is not configured",
          reason: "missing_env",
        },
        { status: 503 }
      );
    }

    await ensureTable();

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
    const { message, code } = describeError(error);
    console.error("History POST error:", message, code);
    return NextResponse.json(
      {
        error: "Failed to save leveling decision",
        reason: code || "db_error",
        detail: message,
      },
      { status: 503 }
    );
  }
}
