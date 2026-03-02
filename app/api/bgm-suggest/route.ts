import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// ─── WHY 404 HAPPENS ───────────────────────────────────────────────────────────
//
//  The @google/generative-ai SDK AUTOMATICALLY prepends "models/" to whatever
//  model name you pass. So:
//
//    "gemini-1.5-flash"        →  SDK constructs →  models/gemini-1.5-flash   ✅
//    "models/gemini-1.5-flash" →  SDK constructs →  models/models/gemini-1.5-flash  ← 404!
//
//  ALWAYS pass the bare model name — never include "models/" yourself.
//
//  Also confirmed: "gemini-1.0-pro" is removed from the v1beta endpoint entirely.
// ──────────────────────────────────────────────────────────────────────────────

// Module-level singleton — constructed once per serverless instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "")

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",      // ✅ confirmed available for this API key
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.8,
  },
})

// ─── Prompt ───────────────────────────────────────────────────────────────────
//
// Must match the BGMPlan type used in the frontend:
//
//  BGMPlan   { confidence, segments[], recommendations[] }
//  BGMSegment { timestamp, energyPct, mood, suggestedStyle, tracks[] }
//  Track      { title, genre, bpm, duration, match }
// ─────────────────────────────────────────────────────────────────────────────

function buildPrompt(transcript: string): string {
  return `
You are an expert AI Music Supervisor for video content.

Analyze the following transcript and return a complete background music (BGM) strategy.

IMPORTANT: Return ONLY a valid JSON object. No markdown, no code fences, no explanation.

JSON schema (follow exactly):

{
  "confidence": <integer 0-100>,
  "segments": [
    {
      "timestamp": "<e.g. 0:00–0:18>",
      "energyPct": <integer 0-100>,
      "mood": "<short label, e.g. Exciting & Intriguing>",
      "suggestedStyle": "<e.g. Upbeat electronic with rising synth>",
      "tracks": [
        {
          "title": "<realistic track name>",
          "genre": "<music genre>",
          "bpm": <integer>,
          "duration": "<e.g. 2:34>",
          "match": <integer 0-100>
        }
      ]
    }
  ],
  "recommendations": [
    "<practical mixing or volume tip>"
  ]
}

Rules:
- Split transcript into 4–6 logical segments.
- Each segment needs exactly 2–3 tracks.
- energyPct: 0 = very calm, 100 = intense/peak energy.
- recommendations: 3–5 actionable tips.
- Output ONLY the JSON. Absolutely no other text.

Transcript:
${transcript}
`.trim()
}

// Strip markdown fences — fallback in case model ignores responseMimeType
function stripFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim()
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Guard: missing key gives a clear dev message instead of a cryptic 401
  if (!process.env.GEMINI_API_KEY) {
    console.error("[bgm-suggest] GEMINI_API_KEY not set in .env.local")
    return NextResponse.json(
      { error: "Server misconfiguration: Gemini API key is missing." },
      { status: 500 }
    )
  }

  let transcript = ""

  try {
    const body = await req.json()
    transcript = (body?.transcript ?? "").trim()

    if (!transcript) {
      return NextResponse.json(
        { error: "transcript is required" },
        { status: 400 }
      )
    }

    // Call Gemini
    const result  = await model.generateContent(buildPrompt(transcript))
    const rawText = result.response.text()

    // Parse — in its own try/catch so a bad Gemini response gives a 502
    let plan: unknown
    try {
      plan = JSON.parse(stripFences(rawText))
    } catch {
      console.error("[bgm-suggest] Gemini returned non-JSON:\n", rawText)
      return NextResponse.json(
        { error: "AI returned an invalid response. Please try again." },
        { status: 502 }
      )
    }

    return NextResponse.json({ plan })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[bgm-suggest] Gemini call failed:", msg)

    // ── 429 Rate-limit: wait and retry once ──
    if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate")) {
      console.log("[bgm-suggest] Rate-limited — retrying in 5 s…")
      await new Promise((r) => setTimeout(r, 5000))

      try {
        const retryResult = await model.generateContent(buildPrompt(transcript))
        const retryRaw = retryResult.response.text()

        let retryPlan: unknown
        try {
          retryPlan = JSON.parse(stripFences(retryRaw))
        } catch {
          console.error("[bgm-suggest] Retry returned non-JSON:\n", retryRaw)
          return NextResponse.json(
            { error: "AI returned an invalid response on retry. Please try again." },
            { status: 502 }
          )
        }

        return NextResponse.json({ plan: retryPlan })
      } catch (retryErr: unknown) {
        const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr)
        console.error("[bgm-suggest] Retry also failed:", retryMsg)
        return NextResponse.json(
          {
            error:
              "Gemini API rate limit exceeded. The free-tier quota may be exhausted. " +
              "Please wait a minute or upgrade your API key, then try again.",
          },
          { status: 429 }
        )
      }
    }

    // Friendly errors for the two most common root causes
    if (msg.includes("404")) {
      return NextResponse.json(
        { error: "Gemini model not found (404). This usually means a bad model name or revoked API key." },
        { status: 502 }
      )
    }
    if (msg.includes("401") || msg.toLowerCase().includes("api_key")) {
      return NextResponse.json(
        { error: "Gemini authentication failed. Check GEMINI_API_KEY in .env.local." },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to generate BGM plan. Please try again." },
      { status: 500 }
    )
  }
}