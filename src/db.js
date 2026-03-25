import { supabase } from "./supabase"

// ── LOAD ─────────────────────────────────────

export async function loadTeams() {
  const { data, error } = await supabase.from("teams").select("*")
  if (error) throw error

  return data.map(t => ({
    id: t.id,
    teamName: t.team_name,
    athlete1: t.athlete1,
    athlete2: t.athlete2,
    division: t.division,
    heat: t.heat,
    lane: t.lane
  }))
}

export async function loadScores() {
  const { data, error } = await supabase.from("scores").select("*")
  if (error) throw error

  const formatted = {}

  data.forEach(s => {
    if (!formatted[s.team_id]) formatted[s.team_id] = {}
    formatted[s.team_id][s.wod] = s.score
  })

  return formatted
}

// ── SAVE ─────────────────────────────────────

export async function saveTeams(teams) {
  const payload = teams.map(t => ({
    id: t.id,
    team_name: t.teamName,
    athlete1: t.athlete1,
    athlete2: t.athlete2,
    division: t.division,
    heat: t.heat,
    lane: t.lane
  }))

  const { error } = await supabase.from("teams").upsert(payload)
  if (error) throw error
}

export async function saveScores(scores) {
  const rows = []

  for (const teamId in scores) {
    for (const wod in scores[teamId]) {
      const val = scores[teamId][wod]
      if (val === "") continue

      rows.push({
        team_id: teamId,
        wod,
        score: parseFloat(val)
      })
    }
  }

  const { error } = await supabase.from("scores").upsert(rows)
  if (error) throw error
}
