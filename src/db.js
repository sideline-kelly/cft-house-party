import { supabase } from "./supabase";

// ── TEAMS ─────────────────────────────────────────────────────────────────────

export async function loadTeams() {
  const { data, error } = await supabase.from("teams").select("*").order("heat").order("lane");
  if (error) throw error;
  return data.map(t => ({
    id:        t.id,
    teamName:  t.team_name,
    athlete1:  t.athlete1  || "",
    athlete2:  t.athlete2  || "",
    athlete3:  t.athlete3  || "",
    athlete4:  t.athlete4  || "",
    division:  t.division  || "",
    heat:      t.heat,
    lane:      t.lane      || "",
  }));
}

export async function saveTeams(teams) {
  const payload = teams.map(t => ({
    id:        t.id,
    team_name: t.teamName,
    athlete1:  t.athlete1  || "",
    athlete2:  t.athlete2  || "",
    athlete3:  t.athlete3  || "",
    athlete4:  t.athlete4  || "",
    division:  t.division  || "",
    heat:      t.heat,
    lane:      t.lane      || "",
  }));
  const { error } = await supabase.from("teams").upsert(payload);
  if (error) throw error;
}

// ── SCORES ────────────────────────────────────────────────────────────────────

export async function loadScores() {
  const { data, error } = await supabase.from("scores").select("*");
  if (error) throw error;
  const formatted = {};
  data.forEach(s => {
    if (!formatted[s.team_id]) formatted[s.team_id] = {};
    formatted[s.team_id][s.wod] = s.score ?? "";
  });
  return formatted;
}

export async function saveScores(scores) {
  const rows = [];
  for (const teamId in scores) {
    for (const wod in scores[teamId]) {
      const val = scores[teamId][wod];
      if (val === "" || val == null) continue;
      rows.push({ team_id: teamId, wod, score: parseFloat(val) });
    }
  }
  if (!rows.length) return;
  const { error } = await supabase.from("scores").upsert(rows, { onConflict: "team_id,wod" });
  if (error) throw error;
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
// Stored as key/value rows: { key: "competitionName", value: "In-House Competition" }

export async function loadSettings() {
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw error;
  const out = {};
  data.forEach(row => { out[row.key] = row.value; });
  return out;
}

export async function saveSettings(settings) {
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value: value ?? "" }));
  const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
  if (error) throw error;
}

// ── WODS ──────────────────────────────────────────────────────────────────────
// Stored as a single JSON blob in settings under key "wods_json"

export async function loadWods() {
  const { data, error } = await supabase.from("settings").select("value").eq("key", "wods_json").single();
  if (error) return null;
  try { return JSON.parse(data.value); } catch { return null; }
}

export async function saveWods(wods) {
  const { error } = await supabase.from("settings").upsert(
    [{ key: "wods_json", value: JSON.stringify(wods) }],
    { onConflict: "key" }
  );
  if (error) throw error;
}
