import React from 'react'
import ReactDOM from 'react-dom/client'
import CFTCompApp from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <CFTCompApp />
)

// ─── Constants ───────────────────────────────────────────────────────────────

const HEAT_COLORS = {
  "HEAT 1": { bg: "#22c55e", text: "#fff" },
  "HEAT 2": { bg: "#f97316", text: "#fff" },
  "HEAT 3": { bg: "#22d3ee", text: "#111" },
  "HEAT 4": { bg: "#ec4899", text: "#fff" },
};

const DIVISIONS = ["RX", "Scaled", "Masters", "Teens", "Open"];

const WODS_CONFIG = [
  { id: "wod1", name: "WOD 1", cap: "16 Min CAP", heats: [{ heat: "HEAT 1", time: "9:00" }, { heat: "HEAT 2", time: "9:18" }, { heat: "HEAT 3", time: "9:36" }, { heat: "HEAT 4", time: "9:54" }] },
  { id: "wod2", name: "WOD 2", cap: "10 Min CAP", heats: [{ heat: "HEAT 1", time: "10:15" }, { heat: "HEAT 2", time: "10:25" }, { heat: "HEAT 3", time: "10:35" }, { heat: "HEAT 4", time: "10:45" }] },
  { id: "wod3", name: "WOD 3", cap: "15 Min CAP", heats: [{ heat: "HEAT 1", time: "11:00" }, { heat: "HEAT 2", time: "11:15" }, { heat: "HEAT 3", time: "11:30" }, { heat: "HEAT 4", time: "11:45" }] },
  { id: "wod4", name: "WOD 4", cap: "10 Min CAP", heats: [{ heat: "HEAT 1", time: "12:05" }, { heat: "HEAT 2", time: "12:15" }, { heat: "HEAT 3", time: "12:25" }, { heat: "HEAT 4", time: "12:35" }] },
];

// Initial team roster — id is stable key, never changes
const INITIAL_TEAMS = [
  { id: "t01", heat: "HEAT 1", lane: "A", teamName: "Rich & Melissa",   athlete1: "Rich",    athlete2: "Melissa",  division: "RX"     },
  { id: "t02", heat: "HEAT 1", lane: "B", teamName: "Scott & Ilsia",    athlete1: "Scott",   athlete2: "Ilsia",    division: "RX"     },
  { id: "t03", heat: "HEAT 1", lane: "D", teamName: "Ben & Rachel",     athlete1: "Ben",     athlete2: "Rachel",   division: "Scaled" },
  { id: "t04", heat: "HEAT 1", lane: "E", teamName: "Brenda & Colin",   athlete1: "Brenda",  athlete2: "Colin",    division: "Scaled" },
  { id: "t05", heat: "HEAT 1", lane: "F", teamName: "Cam & Britt",      athlete1: "Cam",     athlete2: "Britt",    division: "RX"     },
  { id: "t06", heat: "HEAT 2", lane: "A", teamName: "Haley & Daniel",   athlete1: "Haley",   athlete2: "Daniel",   division: "RX"     },
  { id: "t07", heat: "HEAT 2", lane: "B", teamName: "Sara & Carlos",    athlete1: "Sara",    athlete2: "Carlos",   division: "Scaled" },
  { id: "t08", heat: "HEAT 2", lane: "D", teamName: "Matt & Alyssa",    athlete1: "Matt",    athlete2: "Alyssa",   division: "RX"     },
  { id: "t09", heat: "HEAT 2", lane: "E", teamName: "Staci & Stephen",  athlete1: "Staci",   athlete2: "Stephen",  division: "Masters"},
  { id: "t10", heat: "HEAT 3", lane: "A", teamName: "Oscar & Aly",      athlete1: "Oscar",   athlete2: "Aly",      division: "RX"     },
  { id: "t11", heat: "HEAT 3", lane: "B", teamName: "Michael & Amy",    athlete1: "Michael", athlete2: "Amy",      division: "Scaled" },
  { id: "t12", heat: "HEAT 3", lane: "D", teamName: "Matt & Charity",   athlete1: "Matt",    athlete2: "Charity",  division: "RX"     },
  { id: "t13", heat: "HEAT 3", lane: "E", teamName: "Ronnie & Kayla",   athlete1: "Ronnie",  athlete2: "Kayla",    division: "Scaled" },
  { id: "t14", heat: "HEAT 4", lane: "A", teamName: "Dan & Eugenia",    athlete1: "Dan",     athlete2: "Eugenia",  division: "Masters"},
  { id: "t15", heat: "HEAT 4", lane: "B", teamName: "Kat & Gia",        athlete1: "Kat",     athlete2: "Gia",      division: "Scaled" },
  { id: "t16", heat: "HEAT 4", lane: "D", teamName: "Robbie & Tiffany", athlete1: "Robbie",  athlete2: "Tiffany",  division: "RX"     },
  { id: "t17", heat: "HEAT 4", lane: "E", teamName: "Sabrey & Everett", athlete1: "Sabrey",  athlete2: "Everett",  division: "Scaled" },
];

const ADMIN_PASSWORD = "cft2025";
const WOD_IDS = WODS_CONFIG.map(w => w.id);

function initScores(teams) {
  const s = {};
  teams.forEach(t => { s[t.id] = {}; WOD_IDS.forEach(w => { s[t.id][w] = ""; }); });
  return s;
}

function computeLeaderboard(teams, scores) {
  return teams.map(team => {
    let total = 0, placed = 0;
    const wodScores = {};
    WOD_IDS.forEach(wod => {
      const val = parseFloat(scores[team.id]?.[wod]);
      wodScores[wod] = isNaN(val) ? null : val;
      if (!isNaN(val)) { total += val; placed++; }
    });
    return { ...team, total, placed, wodScores };
  }).sort((a, b) => b.placed !== a.placed ? b.placed - a.placed : b.total - a.total);
}

// ─── Typography tokens ────────────────────────────────────────────────────────

const inter   = "'Inter', sans-serif";
const spartan = "'League Spartan', sans-serif";

const T = {
  h1:          { fontFamily: spartan, fontSize: 32, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#fff", lineHeight: 1.1 },
  h2:          { fontFamily: inter,   fontSize: 20, fontWeight: 700, color: "#fff",    letterSpacing: "0.01em" },
  h3:          { fontFamily: inter,   fontSize: 16, fontWeight: 700, color: "#e0e0e0", letterSpacing: "0.01em" },
  label:       { fontFamily: inter,   fontSize: 11, fontWeight: 700, color: "#666",    textTransform: "uppercase", letterSpacing: "0.1em" },
  body:        { fontFamily: inter,   fontSize: 14, fontWeight: 400, color: "#aaa",    lineHeight: 1.6 },
  small:       { fontFamily: inter,   fontSize: 12, fontWeight: 400, color: "#666" },
  timeDisplay: { fontFamily: inter,   fontSize: 18, fontWeight: 700, color: "#f5f5f0", letterSpacing: "0.03em" },
  navTitle:    { fontFamily: spartan, fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff" },
  navSub:      { fontFamily: inter,   fontSize: 11, fontWeight: 400, color: "#888",    textTransform: "uppercase", letterSpacing: "0.14em" },
  tabText:     { fontFamily: inter,   fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" },
  badge:       { fontFamily: inter,   fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" },
  teamBold:    { fontFamily: inter,   fontSize: 15, fontWeight: 700, color: "#f0f0f0", letterSpacing: "0.01em" },
  teamMuted:   { fontFamily: inter,   fontSize: 13, fontWeight: 400, color: "#bbb" },
};

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

function DayBadge({ label }) {
  return <div style={{ display: "inline-block", background: "#c0392b", ...T.badge, color: "#fff", padding: "3px 10px", borderRadius: 3, marginBottom: "0.6rem" }}>{label}</div>;
}

function HeatBadge({ heat }) {
  return <span style={{ ...T.badge, background: HEAT_COLORS[heat]?.bg || "#444", color: HEAT_COLORS[heat]?.text || "#fff", padding: "3px 10px", borderRadius: 3, flexShrink: 0 }}>{heat}</span>;
}

function DivisionBadge({ division }) {
  const colors = { RX: "#3b82f6", Scaled: "#8b5cf6", Masters: "#f59e0b", Teens: "#10b981", Open: "#6b7280" };
  const color = colors[division] || "#6b7280";
  return (
    <span style={{ fontFamily: inter, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 3, padding: "2px 7px" }}>
      {division}
    </span>
  );
}

function FieldInput({ label, value, onChange, placeholder, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      <label style={T.label}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
        style={{ background: "#0d0d0d", border: "1px solid #2e2e2e", borderRadius: 5, color: "#f0f0f0", fontFamily: inter, fontSize: 13, fontWeight: 400, padding: "0.45rem 0.6rem", outline: "none" }}
      />
    </div>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={T.label}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ background: "#0d0d0d", border: "1px solid #2e2e2e", borderRadius: 5, color: "#f0f0f0", fontFamily: inter, fontSize: 13, padding: "0.45rem 0.6rem", outline: "none" }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Team Profile Card (admin) ────────────────────────────────────────────────

function TeamProfileCard({ team, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const initials = (team.athlete1?.[0] || "") + (team.athlete2?.[0] || "");
  const heatColor = HEAT_COLORS[team.heat]?.bg || "#444";

  return (
    <div style={{ background: "#161616", border: "1px solid #242424", borderRadius: 8, overflow: "hidden" }}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ width: "100%", background: "none", border: "none", padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", textAlign: "left" }}
      >
        {/* Avatar */}
        <div style={{ width: 38, height: 38, borderRadius: 6, background: heatColor + "33", border: `1px solid ${heatColor}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 700, color: heatColor }}>{initials || "??"}</span>
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...T.teamBold, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {team.teamName || <span style={{ color: "#555" }}>Unnamed Team</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: 3, flexWrap: "wrap" }}>
            <span style={{ ...T.small, color: "#555" }}>{team.athlete1 || "—"} & {team.athlete2 || "—"}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <DivisionBadge division={team.division} />
          <HeatBadge heat={team.heat} />
          <span style={{ fontFamily: inter, color: "#555", fontSize: 14, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block", marginLeft: 4 }}>▾</span>
        </div>
      </button>

      {/* Expanded edit form */}
      {expanded && (
        <div style={{ borderTop: "1px solid #1e1e1e", padding: "1rem", background: "#111", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <FieldInput label="Team Name" value={team.teamName} onChange={v => onUpdate({ teamName: v })} placeholder="e.g. The Iron Pair" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <FieldInput label="Athlete 1" value={team.athlete1} onChange={v => onUpdate({ athlete1: v })} />
            <FieldInput label="Athlete 2" value={team.athlete2} onChange={v => onUpdate({ athlete2: v })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <SelectInput label="Division" value={team.division} onChange={v => onUpdate({ division: v })} options={DIVISIONS} />
            <SelectInput label="Heat" value={team.heat} onChange={v => onUpdate({ heat: v })} options={["HEAT 1","HEAT 2","HEAT 3","HEAT 4"]} />
            <FieldInput label="Lane" value={team.lane} onChange={v => onUpdate({ lane: v })} placeholder="A" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function CFTCompApp() {
  const [tab, setTab]               = useState("schedule");
  const [adminTab, setAdminTab]     = useState("teams");
  const [teams, setTeams]           = useState(INITIAL_TEAMS);
  const [scores, setScores]         = useState(() => initScores(INITIAL_TEAMS));
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pwInput, setPwInput]       = useState("");
  const [pwError, setPwError]       = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");

  const leaderboard = computeLeaderboard(teams, scores);

  // Update a single team's profile fields
  const updateTeam = useCallback((id, patch) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    setSyncStatus("unsaved");
  }, []);

  function handleScore(teamId, wod, val) {
    setScores(prev => ({ ...prev, [teamId]: { ...prev[teamId], [wod]: val } }));
    setSyncStatus("unsaved");
  }

  function handleSync() {
    setSyncStatus("syncing");
    setTimeout(() => setSyncStatus("synced"), 1200);
  }

  function handleLogin() {
    if (pwInput === ADMIN_PASSWORD) { setAdminUnlocked(true); setPwError(false); }
    else setPwError(true);
  }

  // Filtered teams for admin profile tab
  const filteredTeams = teams.filter(t =>
    !profileSearch ||
    t.teamName.toLowerCase().includes(profileSearch.toLowerCase()) ||
    t.athlete1.toLowerCase().includes(profileSearch.toLowerCase()) ||
    t.athlete2.toLowerCase().includes(profileSearch.toLowerCase())
  );

  // For schedule: group teams by heat for each WOD
  function heatTeamsForWod(wod) {
    return wod.heats.map(h => ({
      ...h,
      teams: teams.filter(t => t.heat === h.heat),
    }));
  }

  const syncColor = syncStatus === "synced" ? "#22c55e" : syncStatus === "syncing" ? "#f97316" : syncStatus === "unsaved" ? "#eab308" : "#555";
  const syncLabel = syncStatus === "synced" ? "✓ Synced" : syncStatus === "syncing" ? "Syncing..." : syncStatus === "unsaved" ? "● Unsaved changes" : "No changes";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: inter, background: "#0a0a0a", color: "#f5f5f0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{ background: "#111", borderBottom: "2px solid #c0392b", padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 0", flex: 1 }}>
          <div style={{ width: 50, height: 50, borderRadius: 6, border: "1.5px dashed #444", display: "flex", alignItems: "center", justifyContent: "center", ...T.small, textAlign: "center", lineHeight: 1.3, cursor: "pointer", flexShrink: 0 }}>EVENT<br/>LOGO</div>
          <div style={{ width: 50, height: 50, borderRadius: 6, border: "1.5px dashed #444", display: "flex", alignItems: "center", justifyContent: "center", ...T.small, textAlign: "center", lineHeight: 1.3, cursor: "pointer", flexShrink: 0 }}>GYM<br/>LOGO</div>
          <div>
            <div style={T.navTitle}>In-House Competition</div>
            <div style={T.navSub}>CrossFit Taylors · Taylors, SC</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.25rem", padding: "0.75rem 0" }}>
          {["schedule","leaderboard","admin"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...T.tabText, padding: "0.45rem 1.1rem", borderRadius: 4, border: "none", cursor: "pointer", background: tab === t ? "#c0392b" : "transparent", color: tab === t ? "#fff" : "#777", transition: "all 0.15s" }}>
              {t === "admin" ? "🔒 Admin" : t}
            </button>
          ))}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          SCHEDULE TAB
      ══════════════════════════════════════════════════════ */}
      {tab === "schedule" && (
        <div style={{ padding: "1.75rem 1.5rem" }}>
          <DayBadge label="Event Day Schedule" />
          <div style={{ ...T.h1, marginBottom: "0.25rem" }}>Competition Schedule</div>
          <div style={{ ...T.body, marginBottom: "1.5rem" }}>Check-in 8:00–8:20am · Athlete Brief 8:30am</div>

          <div style={{ background: "#161616", borderLeft: "3px solid #c0392b", borderRadius: "0 6px 6px 0", padding: "0.65rem 1rem", marginBottom: "2rem" }}>
            <span style={T.body}>After all WODs: </span>
            <span style={{ ...T.body, fontWeight: 700, color: "#c0392b" }}>PODIUM ASAP</span>
            <span style={T.body}> — stay tuned for leaderboard updates.</span>
          </div>

          {/* WOD blocks */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2.5rem" }}>
            {WODS_CONFIG.map(wod => (
              <div key={wod.id} style={{ background: "#141414", border: "1px solid #222", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: "#1c1c1c", borderBottom: "1px solid #252525", padding: "0.7rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ ...T.h2, fontSize: 21 }}>{wod.name}</span>
                  <span style={{ ...T.badge, color: "#c0392b", fontSize: 12 }}>{wod.cap}</span>
                </div>
                {heatTeamsForWod(wod).map((h, hi, arr) => (
                  <div key={h.heat} style={{ borderBottom: hi < arr.length - 1 ? "1px solid #1c1c1c" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1.25rem", background: "#181818" }}>
                      <HeatBadge heat={h.heat} />
                      <span style={T.timeDisplay}>{h.time}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", padding: "0.5rem 1.25rem 0.65rem", paddingLeft: "calc(1.25rem + 74px)" }}>
                      {h.teams.map(team => (
                        <span key={team.id} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", ...T.teamMuted, background: "#1e1e1e", border: "1px solid #282828", borderRadius: 4, padding: "3px 10px" }}>
                          {team.teamName}
                          <DivisionBadge division={team.division} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Team Heat Groups accordion */}
          <div style={{ border: "1px solid #222", borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => setAccordionOpen(o => !o)} style={{ width: "100%", background: "#161616", border: "none", padding: "0.8rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
              <div>
                <div style={T.h3}>Team Heat Groups</div>
                <div style={{ ...T.small, marginTop: 2 }}>Reference: full team-to-heat assignments</div>
              </div>
              <span style={{ fontFamily: inter, color: "#555", fontSize: 16, transform: accordionOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block", marginLeft: "1rem" }}>▾</span>
            </button>
            {accordionOpen && (
              <div style={{ background: "#0f0f0f", borderTop: "1px solid #1e1e1e", padding: "1rem 1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                  {["HEAT 1","HEAT 2","HEAT 3","HEAT 4"].map(heat => (
                    <div key={heat} style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ background: HEAT_COLORS[heat]?.bg, padding: "0.35rem 0.75rem" }}>
                        <span style={{ ...T.badge, color: HEAT_COLORS[heat]?.text }}>{heat}</span>
                      </div>
                      <div style={{ padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {teams.filter(t => t.heat === heat).map(t => (
                          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ ...T.small, color: "#555", minWidth: 14 }}>{t.lane}</span>
                            <span style={T.teamMuted}>{t.teamName}</span>
                            <DivisionBadge division={t.division} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          LEADERBOARD TAB
      ══════════════════════════════════════════════════════ */}
      {tab === "leaderboard" && (
        <div style={{ padding: "1.75rem 1.5rem" }}>
          <DayBadge label="Live Results" />
          <div style={{ ...T.h1, marginBottom: "0.25rem" }}>Leaderboard</div>
          <div style={{ ...T.body, marginBottom: "1.5rem" }}>Scores update live as admin enters results</div>

          <div style={{ background: "#141414", border: "1px solid #222", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1c1c1c" }}>
                    <th style={{ ...T.label, padding: "0.6rem 0.75rem", borderBottom: "1px solid #2a2a2a", textAlign: "center", width: 44 }}>#</th>
                    <th style={{ ...T.label, padding: "0.6rem 0.75rem", borderBottom: "1px solid #2a2a2a", textAlign: "left" }}>Team</th>
                    {WODS_CONFIG.map(w => (
                      <th key={w.id} style={{ ...T.label, padding: "0.6rem 0.75rem", borderBottom: "1px solid #2a2a2a", textAlign: "center" }}>{w.name}</th>
                    ))}
                    <th style={{ ...T.label, padding: "0.6rem 0.75rem", borderBottom: "1px solid #2a2a2a", textAlign: "center" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, i) => {
                    const rank = i + 1;
                    const rowBg = rank === 1 ? "rgba(245,200,66,0.06)" : rank === 2 ? "rgba(176,184,196,0.04)" : rank === 3 ? "rgba(205,127,50,0.06)" : "transparent";
                    const rankColor = rank === 1 ? "#f5c842" : rank === 2 ? "#b0b8c4" : rank === 3 ? "#cd7f32" : "#444";
                    return (
                      <tr key={row.id} style={{ background: rowBg, borderBottom: "1px solid #1a1a1a" }}>
                        <td style={{ fontFamily: inter, fontSize: 20, fontWeight: 700, color: rankColor, padding: "0.65rem 0.75rem", textAlign: "center" }}>
                          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                        </td>
                        <td style={{ padding: "0.65rem 0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={T.teamBold}>{row.teamName}</span>
                            <DivisionBadge division={row.division} />
                          </div>
                          <div style={{ ...T.small, marginTop: 2 }}>{row.athlete1} &amp; {row.athlete2}</div>
                        </td>
                        {WODS_CONFIG.map(w => (
                          <td key={w.id} style={{ padding: "0.65rem 0.75rem", textAlign: "center" }}>
                            <span style={{ fontFamily: inter, fontSize: 13, fontWeight: row.wodScores[w.id] !== null ? 700 : 400, color: row.wodScores[w.id] !== null ? "#f0f0f0" : "#444", background: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: 4, padding: "2px 10px", display: "inline-block" }}>
                              {row.wodScores[w.id] !== null ? row.wodScores[w.id] : "–"}
                            </span>
                          </td>
                        ))}
                        <td style={{ padding: "0.65rem 0.75rem", textAlign: "center" }}>
                          <span style={{ fontFamily: inter, fontSize: 18, fontWeight: 700, color: row.placed > 0 ? "#f5c842" : "#444" }}>
                            {row.placed > 0 ? row.total : "–"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ADMIN TAB
      ══════════════════════════════════════════════════════ */}
      {tab === "admin" && (
        !adminUnlocked ? (
          /* Login */
          <div style={{ padding: "1.75rem 1.5rem" }}>
            <div style={{ maxWidth: 340, margin: "3rem auto", background: "#161616", border: "1px solid #222", borderRadius: 10, padding: "2.5rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: "0.5rem" }}>🔒</div>
              <div style={{ ...T.h2, marginBottom: "0.35rem" }}>Admin Access</div>
              <div style={{ ...T.body, marginBottom: "1.5rem" }}>Enter password to access the admin panel</div>
              <input type="password" value={pwInput} placeholder="Password"
                onChange={e => { setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: 4, color: "#f5f5f0", fontFamily: inter, fontSize: 15, padding: "0.6rem 0.75rem", marginBottom: "0.75rem", boxSizing: "border-box" }}
              />
              {pwError && <div style={{ fontFamily: inter, fontSize: 12, color: "#c0392b", marginBottom: "0.75rem" }}>Incorrect password</div>}
              <button onClick={handleLogin} style={{ width: "100%", padding: "0.65rem", background: "#c0392b", border: "none", borderRadius: 4, color: "#fff", fontFamily: inter, fontSize: 15, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>Unlock</button>
            </div>
          </div>
        ) : (
          /* Admin panel */
          <div>
            {/* Admin sub-nav */}
            <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1e1e1e", padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "0", justifyContent: "space-between" }}>
              <div style={{ display: "flex" }}>
                {[
                  { id: "teams",   label: "Team Profiles" },
                  { id: "scoring", label: "Score Entry"   },
                ].map(st => (
                  <button key={st.id} onClick={() => setAdminTab(st.id)} style={{ ...T.tabText, fontSize: 12, padding: "0.7rem 1.1rem", background: "none", border: "none", borderBottom: adminTab === st.id ? "2px solid #c0392b" : "2px solid transparent", color: adminTab === st.id ? "#fff" : "#555", cursor: "pointer", marginBottom: "-1px", transition: "color 0.15s" }}>
                    {st.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontFamily: inter, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: syncColor }}>{syncLabel}</span>
                <button onClick={handleSync} style={{ ...T.badge, fontSize: 11, padding: "0.35rem 0.9rem", borderRadius: 4, border: "none", background: "#c0392b", color: "#fff", cursor: "pointer" }}>Save</button>
                <button onClick={() => { setAdminUnlocked(false); setPwInput(""); }} style={{ fontFamily: inter, fontSize: 11, fontWeight: 700, padding: "0.35rem 0.75rem", borderRadius: 4, border: "1px solid #2e2e2e", background: "transparent", color: "#666", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>Lock</button>
              </div>
            </div>

            {/* ── TEAM PROFILES sub-tab ── */}
            {adminTab === "teams" && (
              <div style={{ padding: "1.75rem 1.5rem" }}>
                <DayBadge label="Admin · Team Profiles" />
                <div style={{ ...T.h1, marginBottom: "0.25rem" }}>Team Profiles</div>
                <div style={{ ...T.body, marginBottom: "1.5rem" }}>Edit team names, athlete names, division, heat, and lane. Changes reflect everywhere in the app.</div>

                {/* Stats bar */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.65rem", marginBottom: "1.5rem" }}>
                  {[
                    { label: "Total Teams", value: teams.length },
                    ...DIVISIONS.filter(d => teams.some(t => t.division === d)).map(d => ({ label: d, value: teams.filter(t => t.division === d).length })),
                  ].map(stat => (
                    <div key={stat.label} style={{ background: "#161616", border: "1px solid #222", borderRadius: 7, padding: "0.65rem 0.85rem" }}>
                      <div style={T.label}>{stat.label}</div>
                      <div style={{ fontFamily: inter, fontSize: 24, fontWeight: 700, color: "#fff", marginTop: 2 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Search */}
                <div style={{ marginBottom: "1rem" }}>
                  <input
                    value={profileSearch}
                    onChange={e => setProfileSearch(e.target.value)}
                    placeholder="Search teams or athletes..."
                    style={{ width: "100%", maxWidth: 360, background: "#161616", border: "1px solid #2e2e2e", borderRadius: 6, color: "#f0f0f0", fontFamily: inter, fontSize: 13, padding: "0.5rem 0.75rem", boxSizing: "border-box", outline: "none" }}
                  />
                </div>

                {/* Profile cards — grouped by heat */}
                {["HEAT 1","HEAT 2","HEAT 3","HEAT 4"].map(heat => {
                  const heatTeams = filteredTeams.filter(t => t.heat === heat);
                  if (!heatTeams.length) return null;
                  return (
                    <div key={heat} style={{ marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                        <HeatBadge heat={heat} />
                        <span style={{ ...T.small, color: "#555" }}>{heatTeams.length} team{heatTeams.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {heatTeams.map(team => (
                          <TeamProfileCard key={team.id} team={team} onUpdate={patch => updateTeam(team.id, patch)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── SCORE ENTRY sub-tab ── */}
            {adminTab === "scoring" && (
              <div style={{ padding: "1.75rem 1.5rem" }}>
                <DayBadge label="Admin · Score Entry" />
                <div style={{ ...T.h1, marginBottom: "0.25rem" }}>Score Entry</div>
                <div style={{ ...T.body, marginBottom: "1.5rem" }}>Enter each team's score per WOD. Totals calculate automatically.</div>

                <div style={{ background: "#141414", border: "1px solid #222", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                      <thead>
                        <tr style={{ background: "#1c1c1c" }}>
                          <th style={{ ...T.label, padding: "0.65rem 0.75rem", borderBottom: "1px solid #2a2a2a", textAlign: "left" }}>Team</th>
                          <th style={{ ...T.label, padding: "0.65rem 0.75rem", borderBottom: "1px solid #2a2a2a" }}>Heat</th>
                          <th style={{ ...T.label, padding: "0.65rem 0.75rem", borderBottom: "1px solid #2a2a2a" }}>Div</th>
                          {WODS_CONFIG.map(w => (
                            <th key={w.id} style={{ ...T.label, padding: "0.65rem 0.75rem", borderBottom: "1px solid #2a2a2a", textAlign: "center" }}>
                              <div>{w.name}</div>
                              <div style={{ ...T.small, color: "#555", textTransform: "none", letterSpacing: 0 }}>{w.cap}</div>
                            </th>
                          ))}
                          <th style={{ ...T.label, padding: "0.65rem 0.75rem", borderBottom: "1px solid #2a2a2a", textAlign: "center" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map(team => {
                          const total = WOD_IDS.reduce((sum, w) => { const v = parseFloat(scores[team.id]?.[w]); return isNaN(v) ? sum : sum + v; }, 0);
                          const hasAny = WOD_IDS.some(w => scores[team.id]?.[w] !== "");
                          return (
                            <tr key={team.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                              <td style={{ padding: "0.6rem 0.75rem" }}>
                                <div style={T.teamBold}>{team.teamName}</div>
                                <div style={T.small}>{team.athlete1} &amp; {team.athlete2}</div>
                              </td>
                              <td style={{ padding: "0.6rem 0.75rem" }}><HeatBadge heat={team.heat} /></td>
                              <td style={{ padding: "0.6rem 0.75rem" }}><DivisionBadge division={team.division} /></td>
                              {WODS_CONFIG.map(w => (
                                <td key={w.id} style={{ padding: "0.5rem 0.6rem", textAlign: "center" }}>
                                  <input
                                    type="number"
                                    value={scores[team.id]?.[w.id] || ""}
                                    onChange={e => handleScore(team.id, w.id, e.target.value)}
                                    placeholder="—"
                                    style={{ width: 76, background: "#0a0a0a", border: "1px solid #2e2e2e", borderRadius: 4, color: "#f5f5f0", fontFamily: inter, fontSize: 15, fontWeight: 700, padding: "0.3rem 0.4rem", textAlign: "center", outline: "none" }}
                                  />
                                </td>
                              ))}
                              <td style={{ padding: "0.6rem 0.75rem", textAlign: "center" }}>
                                <span style={{ fontFamily: inter, fontSize: 17, fontWeight: 700, color: hasAny ? "#f5c842" : "#444" }}>
                                  {hasAny ? total : "–"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
