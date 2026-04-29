import { GoogleGenAI } from '@google/genai'

export type SessionReport = {
  fluencyPoints: number
  vocabularyLearned: string[]
  stuckWords: string[]
  readinessLevel: 'beginner' | 'basic' | 'ready'
  summary: string
}

export async function generateSessionReport(
  transcript: string,
  session: {
    nativeLanguage: string
    jobType: string
    country: string
    durationMinutes: number
  },
): Promise<SessionReport> {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

  const prompt = `You are an expert language learning analyst for ViswaSethu — a platform that teaches migrant workers job-specific foreign language skills.

Analyze this voice learning session and return a JSON report.

SESSION CONTEXT:
- Native language: ${session.nativeLanguage}
- Job type: ${session.jobType}
- Destination country: ${session.country}
- Session duration: ${session.durationMinutes} minutes

TRANSCRIPT (AI tutor speech during session):
${transcript || 'No transcript available — estimate based on session duration and context.'}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "fluencyPoints": <number 0-100, based on session engagement and duration>,
  "vocabularyLearned": [<list of foreign language words or phrases taught>],
  "stuckWords": [<words that seemed difficult based on repetition in transcript>],
  "readinessLevel": "<beginner | basic | ready>",
  "summary": "<2-3 sentence summary of what was accomplished>"
}`

  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? 'gemini-3.1-flash-lite-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: 'application/json' },
  })

  let parsed: Partial<SessionReport> = {}
  try {
    parsed = JSON.parse(result.text ?? '{}') as Partial<SessionReport>
  } catch {
    parsed = {}
  }

  return {
    fluencyPoints: Math.min(100, Math.max(0, Number(parsed.fluencyPoints) || 0)),
    vocabularyLearned: Array.isArray(parsed.vocabularyLearned) ? parsed.vocabularyLearned : [],
    stuckWords: Array.isArray(parsed.stuckWords) ? parsed.stuckWords : [],
    readinessLevel: ['beginner', 'basic', 'ready'].includes(parsed.readinessLevel ?? '')
      ? (parsed.readinessLevel as SessionReport['readinessLevel'])
      : 'beginner',
    summary: String(parsed.summary || 'Session completed.'),
  }
}
