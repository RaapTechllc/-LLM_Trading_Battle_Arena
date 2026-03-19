import { NextResponse } from 'next/server'
import { runArenaRound } from '@/lib/arena-orchestrator'

export async function POST(req: Request) {
  // Internal-only auth: shared secret prevents unauthenticated round triggering
  const token = req.headers.get('x-arena-token')
  const expected = process.env.ARENA_API_TOKEN
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (process.env.ARENA_KILL_SWITCH === 'true' || process.env.ARENA_KILL_SWITCH === '1') {
    return NextResponse.json({ error: 'ARENA_KILL_SWITCH active' }, { status: 503 })
  }

  try {
    const { seasonId } = await req.json()
    if (!seasonId) return NextResponse.json({ error: 'seasonId required' }, { status: 400 })
    const result = await runArenaRound(seasonId)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
