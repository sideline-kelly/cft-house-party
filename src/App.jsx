import { useState, useEffect, useCallback } from "react"
import { loadTeams, loadScores, saveTeams, saveScores } from "./db"

// ─── Constants ─────────────────────────────────────────

const HEAT_COLORS = {
  "HEAT 1": { bg: "#22c55e", text: "#fff" },
  "HEAT 2": { bg: "#f97316", text: "#fff" },
  "HEAT 3": { bg: "#22d3ee", text: "#111" },
  "HEAT 4": { bg: "#ec4899", text: "#fff" },
}

const WODS_CONFIG = [
  { id: "wod1", name: "WOD 1" },
  { id: "wod2", name: "WOD 2" },
  { id: "wod3", name: "WOD 3" },
  { id: "wod4", name: "WOD 4" },
]

const WOD_IDS = WODS_CONFIG.map(w => w.id)

// ─── Helpers ───────────────────────────────────────────

function computeLeaderboard(teams, scores) {
  return teams
    .map(team => {
      let total = 0
      let placed = 0

      WOD_IDS.forEach(w => {
        const val = parseFloat(scores[team.id]?.[w])
        if (!isNaN(val)) {
          total += val
          placed++
        }
      })

      return { ...team, total, placed }
    })
    .sort((a, b) =>
      b.placed !== a.placed ? b.placed - a.placed : b.total - a.total
    )
}

// ─── App ───────────────────────────────────────────────

export default function App() {
  const [teams, setTeams] = useState([])
  const [scores, setScores] = useState({})
  const [tab, setTab] = useState("schedule")
  const [syncStatus, setSyncStatus] = useState("idle")

  // ── LOAD FROM SUPABASE ───────────────────────────────

  useEffect(() => {
    async function init() {
      try {
        const t = await loadTeams()
        const s = await loadScores()

        setTeams(t)
        setScores(s)
      } catch (e) {
        console.error("Load error:", e)
      }
    }

    init()
  }, [])

  // ── UPDATE TEAM ─────────────────────────────────────

  const updateTeam = useCallback((id, patch) => {
    setTeams(prev =>
      prev.map(t => (t.id === id ? { ...t, ...patch } : t))
    )
    setSyncStatus("unsaved")
  }, [])

  // ── UPDATE SCORE ────────────────────────────────────

  function handleScore(teamId, wod, val) {
    setScores(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [wod]: val,
      },
    }))
    setSyncStatus("unsaved")
  }

  // ── SAVE TO SUPABASE ────────────────────────────────

  async function handleSync() {
    try {
      setSyncStatus("syncing")

      await saveTeams(teams)
      await saveScores(scores)

      setSyncStatus("synced")
    } catch (e) {
      console.error("Save error:", e)
      setSyncStatus("unsaved")
    }
  }

  const leaderboard = computeLeaderboard(teams, scores)

  // ── UI ──────────────────────────────────────────────

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Competition App</h1>

      {/* NAV */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setTab("schedule")}>Schedule</button>
        <button onClick={() => setTab("leaderboard")}>Leaderboard</button>
        <button onClick={() => setTab("admin")}>Admin</button>
      </div>

      {/* SYNC STATUS */}
      <div style={{ marginBottom: 20 }}>
        <strong>Status:</strong> {syncStatus}
        <button onClick={handleSync} style={{ marginLeft: 10 }}>
          Save
        </button>
      </div>

      {/* SCHEDULE */}
      {tab === "schedule" && (
        <div>
          <h2>Schedule</h2>
          {teams.map(t => (
            <div key={t.id}>
              {t.teamName} — {t.heat}
            </div>
          ))}
        </div>
      )}

      {/* LEADERBOARD */}
      {tab === "leaderboard" && (
        <div>
          <h2>Leaderboard</h2>
          {leaderboard.map((t, i) => (
            <div key={t.id}>
              #{i + 1} — {t.teamName} ({t.total})
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {tab === "admin" && (
        <div>
          <h2>Admin</h2>

          {teams.map(team => (
            <div
              key={team.id}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <input
                value={team.teamName}
                onChange={e =>
                  updateTeam(team.id, { teamName: e.target.value })
                }
              />

              {WOD_IDS.map(wod => (
                <input
                  key={wod}
                  type="number"
                  placeholder={wod}
                  value={scores[team.id]?.[wod] || ""}
                  onChange={e =>
                    handleScore(team.id, wod, e.target.value)
                  }
                  style={{ marginLeft: 10 }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}