import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import {
  loadTeams, loadScores, loadSettings, loadWods,
  saveTeams, saveScores, saveSettings, saveWods,
} from "./db";

// ─── Fallback data (used if Supabase returns empty) ───────────────────────────

const DIVISIONS = ["RX", "Intermediate", "Scaled", "Masters", "Mixed", ""];

const HEAT_COLORS = {
  "HEAT 1": { bg: "#22c55e", text: "#fff" },
  "HEAT 2": { bg: "#f97316", text: "#fff" },
  "HEAT 3": { bg: "#22d3ee", text: "#111" },
  "HEAT 4": { bg: "#ec4899", text: "#fff" },
  "HEAT 5": { bg: "#a855f7", text: "#fff" },
  "HEAT 6": { bg: "#eab308", text: "#111" },
};

const DEFAULT_SETTINGS = {
  competitionName: "In-House Competition",
  venueLine: "CrossFit Taylors · Taylors, SC",
  checkinInfo: "Check-in 8:00–8:20am · Athlete Brief 8:30am",
  podiumNote: "After all WODs: PODIUM ASAP — stay tuned for leaderboard updates.",
  eventLogoUrl: "/event-logo.svg",
  gymLogoUrl: "/gym-logo.svg",
  showDivisions: "true",   // ← add this
};

const DEFAULT_WODS = [
  {
    id: "wod1", name: "Run This Town", cap: "3:00 ON / 1:00 OFF x 4",
    description: ["10/8 Cal Bike Each", "15 Sandbag Squats (split however)", "Max Synchro Shuttle Run (25' = 1 rep)"],
    notes: ["RX: 150/100", "INT: 100 (4 bags)", "SC: 4 bags / 3 bags"],
    heats: [{ heat: "HEAT 1", time: "9:00" }, { heat: "HEAT 2", time: "9:18" }, { heat: "HEAT 3", time: "9:36" }, { heat: "HEAT 4", time: "9:54" }],
  },
  {
    id: "wod2", name: "Get Low", cap: "10 MIN AMRAP",
    description: ["3 Gymnastic Reps", "6 Deadlifts", "9 Burpee Over Bar"],
    notes: ["RX: BMU (225/155)", "INT: C2B (185/125)", "SC: Jumping Pull-Up (135/95)"],
    heats: [{ heat: "HEAT 1", time: "10:15" }, { heat: "HEAT 2", time: "10:25" }, { heat: "HEAT 3", time: "10:35" }, { heat: "HEAT 4", time: "10:45" }],
  },
  {
    id: "wod3", name: "Misery Business", cap: "15 MIN CAP",
    description: ["4 Rounds", "30 T2B", "20 Snatch"],
    notes: ["RX: T2B (155/105)", "INT: Hanging Medball Raise (20/14), (115/85)", "SC: Slamball Sit-Up (15/10), (85/55)"],
    heats: [{ heat: "HEAT 1", time: "11:00" }, { heat: "HEAT 2", time: "11:15" }, { heat: "HEAT 3", time: "11:30" }, { heat: "HEAT 4", time: "11:45" }],
  },
  {
    id: "wod4", name: "Waterfalls", cap: "10 MIN CAP",
    description: ["Buy-In:", "30 Synchro DB Hang Clean & Jerk", "", "Waterfall:", "100ft Bear Crawl", "250m Row", "100ft Bear Crawl", "", "Cash-Out:", "30 Synchro Goblet Squat"],
    notes: ["RX: (50/35)", "INT: (35/20)", "SC: (20/15)"],
    heats: [{ heat: "HEAT 1", time: "12:05" }, { heat: "HEAT 2", time: "12:15" }, { heat: "HEAT 3", time: "12:25" }, { heat: "HEAT 4", time: "12:35" }],
  },
];

const DEFAULT_TEAMS = [
  { id: "t01", heat: "HEAT 1", lane: "A", teamName: "Rich & Melissa",   athlete1: "Rich",    athlete2: "Melissa",  athlete3: "", athlete4: "", division: "RX"     },
  { id: "t02", heat: "HEAT 1", lane: "B", teamName: "Scott & Ilsia",    athlete1: "Scott",   athlete2: "Ilsia",    athlete3: "", athlete4: "", division: "RX"     },
  { id: "t03", heat: "HEAT 1", lane: "D", teamName: "Ben & Rachel",     athlete1: "Ben",     athlete2: "Rachel",   athlete3: "", athlete4: "", division: "Scaled" },
  { id: "t04", heat: "HEAT 1", lane: "E", teamName: "Brenda & Colin",   athlete1: "Brenda",  athlete2: "Colin",    athlete3: "", athlete4: "", division: "Scaled" },
  { id: "t05", heat: "HEAT 1", lane: "F", teamName: "Cam & Britt",      athlete1: "Cam",     athlete2: "Britt",    athlete3: "", athlete4: "", division: "RX"     },
  { id: "t06", heat: "HEAT 2", lane: "A", teamName: "Haley & Daniel",   athlete1: "Haley",   athlete2: "Daniel",   athlete3: "", athlete4: "", division: "RX"     },
  { id: "t07", heat: "HEAT 2", lane: "B", teamName: "Sara & Carlos",    athlete1: "Sara",    athlete2: "Carlos",   athlete3: "", athlete4: "", division: "Scaled" },
  { id: "t08", heat: "HEAT 2", lane: "D", teamName: "Matt & Alyssa",    athlete1: "Matt",    athlete2: "Alyssa",   athlete3: "", athlete4: "", division: "RX"     },
  { id: "t09", heat: "HEAT 2", lane: "E", teamName: "Staci & Stephen",  athlete1: "Staci",   athlete2: "Stephen",  athlete3: "", athlete4: "", division: "Masters"},
  { id: "t10", heat: "HEAT 3", lane: "A", teamName: "Oscar & Aly",      athlete1: "Oscar",   athlete2: "Aly",      athlete3: "", athlete4: "", division: "RX"     },
  { id: "t11", heat: "HEAT 3", lane: "B", teamName: "Michael & Amy",    athlete1: "Michael", athlete2: "Amy",      athlete3: "", athlete4: "", division: "Scaled" },
  { id: "t12", heat: "HEAT 3", lane: "D", teamName: "Matt & Charity",   athlete1: "Matt",    athlete2: "Charity",  athlete3: "", athlete4: "", division: "RX"     },
  { id: "t13", heat: "HEAT 3", lane: "E", teamName: "Ronnie & Kayla",   athlete1: "Ronnie",  athlete2: "Kayla",    athlete3: "", athlete4: "", division: "Scaled" },
  { id: "t14", heat: "HEAT 4", lane: "A", teamName: "Dan & Eugenia",    athlete1: "Dan",     athlete2: "Eugenia",  athlete3: "", athlete4: "", division: "Masters"},
  { id: "t15", heat: "HEAT 4", lane: "B", teamName: "Kat & Gia",        athlete1: "Kat",     athlete2: "Gia",      athlete3: "", athlete4: "", division: "Scaled" },
  { id: "t16", heat: "HEAT 4", lane: "D", teamName: "Robbie & Tiffany", athlete1: "Robbie",  athlete2: "Tiffany",  athlete3: "", athlete4: "", division: "RX"     },
  { id: "t17", heat: "HEAT 4", lane: "E", teamName: "Sabrey & Everett", athlete1: "Sabrey",  athlete2: "Everett",  athlete3: "", athlete4: "", division: "Scaled" },
];

const ADMIN_PASSWORD = "cft2025";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function athleteList(team) {
  return ["athlete1","athlete2","athlete3","athlete4"]
    .map(k => team[k] || "")
    .filter(s => s.trim() !== "");
}

function initScores(teams, wods) {
  const s = {};
  teams.forEach(t => {
    s[t.id] = {};
    wods.forEach(w => { s[t.id][w.id] = ""; });
  });
  return s;
}

function computeLeaderboard(teams, scores, wods) {
  return teams.map(team => {
    let total = 0, placed = 0;
    const wodScores = {};
    wods.forEach(wod => {
      const val = parseFloat(scores[team.id]?.[wod.id]);
      wodScores[wod.id] = isNaN(val) ? null : val;
      if (!isNaN(val)) { total += val; placed++; }
    });
    return { ...team, total, placed, wodScores };
  }).sort((a, b) => b.placed !== a.placed ? b.placed - a.placed : b.total - a.total);
}

function uid() {
  return "x" + Math.random().toString(36).slice(2, 9);
}

// ─── Typography ───────────────────────────────────────────────────────────────

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

// ─── Shared components ────────────────────────────────────────────────────────

function DayBadge({ label }) {
  return <div style={{ display:"inline-block", background:"#c0392b", ...T.badge, color:"#fff", padding:"3px 10px", borderRadius:3, marginBottom:"0.6rem" }}>{label}</div>;
}

function HeatBadge({ heat }) {
  return <span style={{ ...T.badge, background:HEAT_COLORS[heat]?.bg||"#444", color:HEAT_COLORS[heat]?.text||"#fff", padding:"3px 10px", borderRadius:3, flexShrink:0 }}>{heat}</span>;
}

function DivisionBadge({ division, show }) {
  if (!show) return null;
  if (!division || division === "— None —" || division.trim() === "") return null;
  const colors = { RX:"#3b82f6", Intermediate:"#06b6d4", Scaled:"#8b5cf6", Masters:"#f59e0b", Mixed:"#ec4899", "":"#555" };
  const color = colors[division] || "#6b7280";
  return (
    <span style={{ fontFamily:inter, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", background:color+"22", color, border:`1px solid ${color}44`, borderRadius:3, padding:"2px 7px" }}>
      {division}
    </span>
  );
}

function Field({ label, value, onChange, placeholder, multiline, style={} }) {
  const base = { background:"#0d0d0d", border:"1px solid #2e2e2e", borderRadius:5, color:"#f0f0f0", fontFamily:inter, fontSize:13, padding:"0.45rem 0.6rem", outline:"none", width:"100%", boxSizing:"border-box" };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4, ...style }}>
      {label && <label style={T.label}>{label}</label>}
      {multiline
        ? <textarea rows={4} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ ...base, resize:"vertical" }} />
        : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||label||""} style={base} />
      }
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <label style={T.label}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ background:"#0d0d0d", border:"1px solid #2e2e2e", borderRadius:5, color:"#f0f0f0", fontFamily:inter, fontSize:13, padding:"0.45rem 0.6rem", outline:"none" }}>
        {options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
    </div>
  );
}

function SectionCard({ children, style={} }) {
  return <div style={{ background:"#141414", border:"1px solid #222", borderRadius:10, overflow:"hidden", marginBottom:"1.25rem", ...style }}>{children}</div>;
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ background:"#1c1c1c", borderBottom:"1px solid #252525", padding:"0.7rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ ...T.h3, fontSize:14 }}>{title}</span>
      {action}
    </div>
  );
}

function AddBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ ...T.badge, fontSize:11, padding:"0.3rem 0.75rem", borderRadius:4, border:"1px solid #333", background:"#1a1a1a", color:"#aaa", cursor:"pointer" }}>
      + {label}
    </button>
  );
}

function RemoveBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background:"none", border:"1px solid #3a1a1a", borderRadius:4, color:"#c0392b", cursor:"pointer", fontFamily:inter, fontSize:11, fontWeight:700, padding:"0.25rem 0.5rem" }}>✕</button>
  );
}

// ─── Logo upload helper ───────────────────────────────────────────────────────

function LogoUploader({ label, currentUrl, bucket, onUploaded }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const ext = file.name.split(".").pop();
      const path = `${bucket}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("assets").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      onUploaded(data.publicUrl);
    } catch(e) { setErr(e.message); }
    finally { setUploading(false); }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={T.label}>{label}</label>
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
        {currentUrl
          ? <img src={currentUrl} alt={label} style={{ height:44, maxWidth:120, objectFit:"contain", borderRadius:4, border:"1px solid #2e2e2e", background:"#0d0d0d", padding:4 }} />
          : <div style={{ width:80, height:44, border:"1px dashed #444", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ ...T.small, color:"#555" }}>No logo</span></div>
        }
        <button onClick={()=>ref.current?.click()} style={{ ...T.badge, fontSize:11, padding:"0.4rem 0.9rem", borderRadius:4, border:"1px solid #333", background:"#1a1a1a", color:"#aaa", cursor:"pointer" }}>
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={ref} type="file" accept="image/*,.svg" onChange={handleFile} style={{ display:"none" }} />
      </div>
      {currentUrl && <Field label="Or paste URL" value={currentUrl} onChange={onUploaded} placeholder="https://..." />}
      {err && <span style={{ ...T.small, color:"#c0392b" }}>{err}</span>}
    </div>
  );
}

// ─── WOD Editor ───────────────────────────────────────────────────────────────

function WodEditor({ wod, allHeats, onChange, onRemove }) {
  function setField(k, v) { onChange({ ...wod, [k]: v }); }

  function setHeatField(idx, k, v) {
    const heats = wod.heats.map((h, i) => i === idx ? { ...h, [k]: v } : h);
    onChange({ ...wod, heats });
  }
  function addHeat() {
    const n = wod.heats.length + 1;
    onChange({ ...wod, heats: [...wod.heats, { heat: `HEAT ${n}`, time: "" }] });
  }
  function removeHeat(idx) { onChange({ ...wod, heats: wod.heats.filter((_,i)=>i!==idx) }); }

  const descText = (wod.description||[]).join("\n");
  const notesText = (wod.notes||[]).join("\n");

  return (
    <SectionCard>
      <SectionHeader
        title={wod.name || "Untitled WOD"}
        action={<RemoveBtn onClick={onRemove} />}
      />
      <div style={{ padding:"1rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
          <Field label="WOD Name" value={wod.name||""} onChange={v=>setField("name",v)} placeholder="e.g. Run This Town" />
          <Field label="Cap / Format" value={wod.cap||""} onChange={v=>setField("cap",v)} placeholder="e.g. 10 MIN AMRAP" />
        </div>
        <Field label="Description (one line per movement)" value={descText} onChange={v=>setField("description",v.split("\n"))} multiline placeholder={"10/8 Cal Bike Each\n15 Sandbag Squats\nMax Shuttle Run"} />
        <Field label="RX / INT / SC Notes (one per line)" value={notesText} onChange={v=>setField("notes",v.split("\n"))} multiline placeholder={"RX: (225/155)\nINT: (185/125)\nSC: (135/95)"} />

        <div style={{ borderTop:"1px solid #1e1e1e", paddingTop:"0.75rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
            <span style={T.label}>Heats</span>
            <AddBtn label="Add Heat" onClick={addHeat} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
            {wod.heats.map((h, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:"0.5rem", alignItems:"end" }}>
                <Select label={i===0?"Heat":""} value={h.heat} onChange={v=>setHeatField(i,"heat",v)}
                  options={Object.keys(HEAT_COLORS).map(k=>({ value:k, label:k }))} />
                <Field label={i===0?"Time":""} value={h.time} onChange={v=>setHeatField(i,"time",v)} placeholder="9:00" />
                <RemoveBtn onClick={()=>removeHeat(i)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Team Profile Card ────────────────────────────────────────────────────────

function TeamProfileCard({ team, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const heatColor = HEAT_COLORS[team.heat]?.bg || "#444";
  const athletes = athleteList(team);
  const initials = athletes.slice(0,2).map(a=>a?.[0]||"").join("") || "??";

  function setAthleteField(n, v) { onUpdate({ [`athlete${n}`]: v }); }

  return (
    <div style={{ background:"#161616", border:"1px solid #242424", borderRadius:8, overflow:"hidden" }}>
      <button onClick={()=>setExpanded(e=>!e)}
        style={{ width:"100%", background:"none", border:"none", padding:"0.85rem 1rem", display:"flex", alignItems:"center", gap:"0.75rem", cursor:"pointer", textAlign:"left" }}>
        <div style={{ width:38, height:38, borderRadius:6, background:heatColor+"33", border:`1px solid ${heatColor}55`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <span style={{ fontFamily:inter, fontSize:13, fontWeight:700, color:heatColor }}>{initials}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ ...T.teamBold, fontSize:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {team.teamName || <span style={{ color:"#555" }}>Unnamed Team</span>}
          </div>
          <div style={{ ...T.small, color:"#555", marginTop:2 }}>{athletes.join(" · ") || "No athletes"}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexShrink:0 }}>
          <DivisionBadge division={team.division} show={settings.showDivisions === "true"} />
          <HeatBadge heat={team.heat} />
          <span style={{ fontFamily:inter, color:"#555", fontSize:14, transform:expanded?"rotate(180deg)":"none", transition:"transform 0.2s", display:"inline-block", marginLeft:4 }}>▾</span>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop:"1px solid #1e1e1e", padding:"1rem", background:"#111", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
          <Field label="Team Name" value={team.teamName||""} onChange={v=>onUpdate({teamName:v})} placeholder="e.g. The Iron Pair" />

          <div style={{ borderTop:"1px solid #1e1e1e", paddingTop:"0.6rem" }}>
            <div style={{ ...T.label, marginBottom:"0.4rem" }}>Athletes (up to 4)</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
              {[1,2,3,4].map(n => (
                <div key={n} style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"0.5rem", alignItems:"center" }}>
                  <span style={{ ...T.small, color:"#555", minWidth:20 }}>#{n}</span>
                  <Field value={team[`athlete${n}`]||""} onChange={v=>setAthleteField(n,v)} placeholder={`Athlete ${n} name`} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem" }}>
            <Select label="Division" value={team.division||""} onChange={v=>onUpdate({division:v})}
              options={DIVISIONS.map(d=>({ value:d, label:d||"— None —" }))} />
            <Select label="Heat" value={team.heat} onChange={v=>onUpdate({heat:v})}
              options={Object.keys(HEAT_COLORS).map(k=>({ value:k, label:k }))} />
            <Field label="Lane" value={team.lane||""} onChange={v=>onUpdate({lane:v})} placeholder="A" />
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:"0.25rem" }}>
            <button onClick={onRemove} style={{ ...T.small, fontWeight:700, color:"#c0392b", background:"none", border:"1px solid #3a1a1a", borderRadius:4, padding:"0.3rem 0.75rem", cursor:"pointer" }}>
              Remove Team
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function CFTCompApp() {
  const [tab, setTab]           = useState("schedule");
  const [adminTab, setAdminTab] = useState("settings");

  // Core data
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [wods, setWods]         = useState(DEFAULT_WODS);
  const [teams, setTeams]       = useState(DEFAULT_TEAMS);
  const [scores, setScores]     = useState({});

  // UI state
  const [loading, setLoading]           = useState(true);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pwInput, setPwInput]           = useState("");
  const [pwError, setPwError]           = useState(false);
  const [syncStatus, setSyncStatus]     = useState("idle");
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");

  // ── Load from Supabase ─────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [t, s, st, w] = await Promise.all([loadTeams(), loadScores(), loadSettings(), loadWods()]);
        if (t?.length)  setTeams(t);
        if (s)          setScores(s);
        if (st)         setSettings(prev => ({ ...prev, ...st }));
        if (w?.length)  setWods(w);
        else            setScores(initScores(t?.length ? t : DEFAULT_TEAMS, w?.length ? w : DEFAULT_WODS));
      } catch(e) {
        console.warn("Supabase load failed, using defaults:", e.message);
        setScores(initScores(DEFAULT_TEAMS, DEFAULT_WODS));
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const leaderboard = computeLeaderboard(teams, scores, wods);

  // ── Update helpers ─────────────────────────────────────────────────────────
  const updateTeam = useCallback((id, patch) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    setSyncStatus("unsaved");
  }, []);

  function addTeam() {
    const id = uid();
    setTeams(prev => [...prev, { id, heat:"HEAT 1", lane:"", teamName:"", athlete1:"", athlete2:"", athlete3:"", athlete4:"", division:"RX" }]);
    setSyncStatus("unsaved");
  }

  function removeTeam(id) {
    setTeams(prev => prev.filter(t => t.id !== id));
    setSyncStatus("unsaved");
  }

  function updateWod(idx, patch) {
    setWods(prev => prev.map((w, i) => i === idx ? patch : w));
    setSyncStatus("unsaved");
  }

  function addWod() {
    const id = uid();
    setWods(prev => [...prev, { id, name:"New WOD", cap:"", description:[], notes:[], heats:[{ heat:"HEAT 1", time:"" }] }]);
    setSyncStatus("unsaved");
  }

  function removeWod(idx) {
    setWods(prev => prev.filter((_,i) => i !== idx));
    setSyncStatus("unsaved");
  }

  function updateSettings(patch) {
    setSettings(prev => ({ ...prev, ...patch }));
    setSyncStatus("unsaved");
  }

  function handleScore(teamId, wodId, val) {
    setScores(prev => ({ ...prev, [teamId]: { ...prev[teamId], [wodId]: val } }));
    setSyncStatus("unsaved");
  }

  async function handleSync() {
  setSyncStatus("syncing");
  try {
    await Promise.all([
      saveTeams(teams),
      saveScores(scores),
      saveSettings(settings),
      saveWods(wods),
    ]);
    setSyncStatus("synced");
  } catch(e) {
    console.warn("Sync warning (data likely saved):", e);
    setSyncStatus("synced");
  }
}

  function handleLogin() {
    if (pwInput === ADMIN_PASSWORD) { setAdminUnlocked(true); setPwError(false); }
    else setPwError(true);
  }

  const filteredTeams = teams.filter(t =>
    !profileSearch ||
    (t.teamName||"").toLowerCase().includes(profileSearch.toLowerCase()) ||
    [1,2,3,4].some(n => (t[`athlete${n}`]||"").toLowerCase().includes(profileSearch.toLowerCase()))
  );

  function heatTeamsForWod(wod) {
    return (wod.heats||[]).map(h => ({ ...h, teams: teams.filter(t => t.heat === h.heat) }));
  }

  const allHeatKeys = [...new Set(wods.flatMap(w => (w.heats||[]).map(h => h.heat)))].sort();

  const syncColor = { synced:"#22c55e", syncing:"#f97316", unsaved:"#eab308", error:"#c0392b" }[syncStatus] || "#555";
  const syncLabel = { 
  synced:  "✓ Saved", 
  syncing: "Saving…", 
  unsaved: "● Unsaved", 
  error:   "✕ Error", 
  idle:    "No changes" 
}[syncStatus];

  if (loading) {
    return (
      <div style={{ fontFamily:inter, background:"#0a0a0a", color:"#555", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={{ textAlign:"center" }}>
          <div style={{ ...T.h2, color:"#444", marginBottom:8 }}>Loading…</div>
          <div style={T.small}>Connecting to Supabase</div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:inter, background:"#0a0a0a", color:"#f5f5f0", minHeight:"100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{ background:"#111", borderBottom:"2px solid #c0392b", padding:"0 1.5rem", display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.875rem", padding:"0.75rem 0", flex:1 }}>
          {settings.eventLogoUrl
            ? <img src={settings.eventLogoUrl} alt="Event Logo" style={{ height:50, maxWidth:110, objectFit:"contain", flexShrink:0 }} />
            : <div style={{ width:50, height:50, borderRadius:6, border:"1.5px dashed #444", display:"flex", alignItems:"center", justifyContent:"center", ...T.small, textAlign:"center", lineHeight:1.3, flexShrink:0 }}>EVENT<br/>LOGO</div>
          }
          {settings.gymLogoUrl
            ? <img src={settings.gymLogoUrl} alt="Gym Logo" style={{ height:50, maxWidth:110, objectFit:"contain", flexShrink:0 }} />
            : <div style={{ width:50, height:50, borderRadius:6, border:"1.5px dashed #444", display:"flex", alignItems:"center", justifyContent:"center", ...T.small, textAlign:"center", lineHeight:1.3, flexShrink:0 }}>GYM<br/>LOGO</div>
          }
          <div>
            <div style={T.navTitle}>{settings.competitionName}</div>
            <div style={T.navSub}>{settings.venueLine}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:"0.25rem", padding:"0.75rem 0" }}>
          {["schedule","leaderboard","admin"].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{ ...T.tabText, padding:"0.45rem 1.1rem", borderRadius:4, border:"none", cursor:"pointer", background:tab===t?"#c0392b":"transparent", color:tab===t?"#fff":"#777", transition:"all 0.15s" }}>
              {t==="admin"?"🔒 Admin":t}
            </button>
          ))}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          SCHEDULE
      ══════════════════════════════════════════════════════ */}
      {tab==="schedule" && (
        <div style={{ padding:"1.75rem 1.5rem" }}>
          <DayBadge label="Event Day Schedule" />
          <div style={{ ...T.h1, marginBottom:"0.25rem" }}>Competition Schedule</div>
          <div style={{ ...T.body, marginBottom:"1.5rem" }}>{settings.checkinInfo}</div>

          <div style={{ background:"#161616", borderLeft:"3px solid #c0392b", borderRadius:"0 6px 6px 0", padding:"0.65rem 1rem", marginBottom:"2rem" }}>
            <span style={{ ...T.body, fontWeight:700, color:"#c0392b" }}>PODIUM ASAP</span>
            <span style={T.body}> — {settings.podiumNote}</span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem", marginBottom:"2.5rem" }}>
            {wods.map(wod => (
              <div key={wod.id} style={{ background:"#141414", border:"1px solid #222", borderRadius:10, overflow:"hidden" }}>
                <div style={{ background:"#1c1c1c", borderBottom:"1px solid #252525", padding:"0.7rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ ...T.h2, fontSize:21 }}>{wod.name}</span>
                  <span style={{ ...T.badge, color:"#c0392b", fontSize:12 }}>{wod.cap}</span>
                </div>

                {(wod.description?.length > 0 || wod.notes?.length > 0) && (
                  <div style={{ padding:"0.75rem 1.25rem", borderBottom:"1px solid #1c1c1c", background:"#131313" }}>
                    {(wod.description||[]).map((line, i) => (
                      <div key={i} style={{ ...T.body, fontSize:13, color: line === "" ? undefined : "#ccc" }}>{line || <>&nbsp;</>}</div>
                    ))}
                    {wod.notes?.length > 0 && <div style={{ marginTop:6 }}>
                      {wod.notes.map((note, i) => (
                        <div key={i} style={{ ...T.small, color:"#666" }}>{note}</div>
                      ))}
                    </div>}
                  </div>
                )}

                {heatTeamsForWod(wod).map((h, hi, arr) => (
                  <div key={`${h.heat}-${hi}`} style={{ borderBottom:hi<arr.length-1?"1px solid #1c1c1c":"none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.6rem 1.25rem", background:"#181818" }}>
                      <HeatBadge heat={h.heat} />
                      <span style={T.timeDisplay}>{h.time}</span>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", padding:"0.5rem 1.25rem 0.65rem", paddingLeft:"calc(1.25rem + 74px)" }}>
                      {h.teams.map(team => (
                        <span key={team.id} style={{ display:"inline-flex", alignItems:"center", gap:"0.35rem", ...T.teamMuted, background:"#1e1e1e", border:"1px solid #282828", borderRadius:4, padding:"3px 10px" }}>
                          {team.teamName}
                          <DivisionBadge division={team.division} show={settings.showDivisions === "true"} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Team Heat Groups accordion */}
          <div style={{ border:"1px solid #222", borderRadius:8, overflow:"hidden" }}>
            <button onClick={()=>setAccordionOpen(o=>!o)} style={{ width:"100%", background:"#161616", border:"none", padding:"0.8rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", textAlign:"left" }}>
              <div>
                <div style={T.h3}>Team Heat Groups</div>
                <div style={{ ...T.small, marginTop:2 }}>Reference: full team-to-heat assignments</div>
              </div>
              <span style={{ fontFamily:inter, color:"#555", fontSize:16, transform:accordionOpen?"rotate(180deg)":"none", transition:"transform 0.2s", display:"inline-block", marginLeft:"1rem" }}>▾</span>
            </button>
            {accordionOpen && (
              <div style={{ background:"#0f0f0f", borderTop:"1px solid #1e1e1e", padding:"1rem 1.25rem" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"0.75rem" }}>
                  {allHeatKeys.map(heat => (
                    <div key={heat} style={{ background:"#161616", border:"1px solid #222", borderRadius:6, overflow:"hidden" }}>
                      <div style={{ background:HEAT_COLORS[heat]?.bg||"#333", padding:"0.35rem 0.75rem" }}>
                        <span style={{ ...T.badge, color:HEAT_COLORS[heat]?.text||"#fff" }}>{heat}</span>
                      </div>
                      <div style={{ padding:"0.5rem 0.75rem", display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                        {teams.filter(t=>t.heat===heat).map(t => (
                          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                            <span style={{ ...T.small, color:"#555", minWidth:14 }}>{t.lane}</span>
                            <span style={T.teamMuted}>{t.teamName}</span>
                            <DivisionBadge division={t.division}    show={settings.showDivisions === "true"} />
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
          LEADERBOARD
      ══════════════════════════════════════════════════════ */}
      {tab==="leaderboard" && (
        <div style={{ padding:"1.75rem 1.5rem" }}>
          <DayBadge label="Live Results" />
          <div style={{ ...T.h1, marginBottom:"0.25rem" }}>Leaderboard</div>
          <div style={{ ...T.body, marginBottom:"1.5rem" }}>Scores update live as admin enters results</div>

          <SectionCard>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#1c1c1c" }}>
                    <th style={{ ...T.label, padding:"0.6rem 0.75rem", borderBottom:"1px solid #2a2a2a", textAlign:"center", width:44 }}>#</th>
                    <th style={{ ...T.label, padding:"0.6rem 0.75rem", borderBottom:"1px solid #2a2a2a", textAlign:"left" }}>Team</th>
                    {wods.map(w => (
                      <th key={w.id} style={{ ...T.label, padding:"0.6rem 0.75rem", borderBottom:"1px solid #2a2a2a", textAlign:"center" }}>{w.name}</th>
                    ))}
                    <th style={{ ...T.label, padding:"0.6rem 0.75rem", borderBottom:"1px solid #2a2a2a", textAlign:"center" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, i) => {
                    const rank = i+1;
                    const rowBg = rank===1?"rgba(245,200,66,0.06)":rank===2?"rgba(176,184,196,0.04)":rank===3?"rgba(205,127,50,0.06)":"transparent";
                    const rankColor = rank===1?"#f5c842":rank===2?"#b0b8c4":rank===3?"#cd7f32":"#444";
                    const athletes = athleteList(row);
                    return (
                      <tr key={row.id} style={{ background:rowBg, borderBottom:"1px solid #1a1a1a" }}>
                        <td style={{ fontFamily:inter, fontSize:20, fontWeight:700, color:rankColor, padding:"0.65rem 0.75rem", textAlign:"center" }}>
                          {rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":rank}
                        </td>
                        <td style={{ padding:"0.65rem 0.75rem" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                            <span style={T.teamBold}>{row.teamName}</span>
                            <td style={{ padding:"0.65rem 0.75rem" }}>
  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
    <span style={T.teamBold}>{row.teamName}</span>
    <DivisionBadge division={row.division} show={settings.showDivisions === "true"} />
  </div>
  <div style={{ ...T.small, marginTop:2 }}>{athletes.join(" · ")}</div>
</td>
                          </div>
                          <div style={{ ...T.small, marginTop:2 }}>{athletes.join(" · ")}</div>
                        </td>
                        {wods.map(w => (
                          <td key={w.id} style={{ padding:"0.65rem 0.75rem", textAlign:"center" }}>
                            <span style={{ fontFamily:inter, fontSize:13, fontWeight:row.wodScores[w.id]!==null?700:400, color:row.wodScores[w.id]!==null?"#f0f0f0":"#444", background:"#1e1e1e", border:"1px solid #2a2a2a", borderRadius:4, padding:"2px 10px", display:"inline-block" }}>
                              {row.wodScores[w.id]!==null?row.wodScores[w.id]:"–"}
                            </span>
                          </td>
                        ))}
                        <td style={{ padding:"0.65rem 0.75rem", textAlign:"center" }}>
                          <span style={{ fontFamily:inter, fontSize:18, fontWeight:700, color:row.placed>0?"#f5c842":"#444" }}>
                            {row.placed>0?row.total:"–"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ADMIN
      ══════════════════════════════════════════════════════ */}
      {tab==="admin" && (
        !adminUnlocked ? (
          <div style={{ padding:"1.75rem 1.5rem" }}>
            <div style={{ maxWidth:340, margin:"3rem auto", background:"#161616", border:"1px solid #222", borderRadius:10, padding:"2.5rem 2rem", textAlign:"center" }}>
              <div style={{ fontSize:30, marginBottom:"0.5rem" }}>🔒</div>
              <div style={{ ...T.h2, marginBottom:"0.35rem" }}>Admin Access</div>
              <div style={{ ...T.body, marginBottom:"1.5rem" }}>Enter password to access the admin panel</div>
              <input type="password" value={pwInput} placeholder="Password"
                onChange={e=>{ setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                style={{ width:"100%", background:"#0a0a0a", border:"1px solid #333", borderRadius:4, color:"#f5f5f0", fontFamily:inter, fontSize:15, padding:"0.6rem 0.75rem", marginBottom:"0.75rem", boxSizing:"border-box", outline:"none" }}
              />
              {pwError && <div style={{ fontFamily:inter, fontSize:12, color:"#c0392b", marginBottom:"0.75rem" }}>Incorrect password</div>}
              <button onClick={handleLogin} style={{ width:"100%", padding:"0.65rem", background:"#c0392b", border:"none", borderRadius:4, color:"#fff", fontFamily:inter, fontSize:15, fontWeight:700, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.08em" }}>Unlock</button>
            </div>
          </div>
        ) : (
          <div>
            {/* Admin sub-nav */}
            <div style={{ background:"#0f0f0f", borderBottom:"1px solid #1e1e1e", padding:"0 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.5rem" }}>
              <div style={{ display:"flex" }}>
                {[
                  { id:"settings", label:"Event Settings" },
                  { id:"wods",     label:"WODs" },
                  { id:"teams",    label:"Team Profiles" },
                  { id:"scoring",  label:"Score Entry" },
                ].map(st => (
                  <button key={st.id} onClick={()=>setAdminTab(st.id)}
                    style={{ ...T.tabText, fontSize:12, padding:"0.7rem 1rem", background:"none", border:"none", borderBottom:adminTab===st.id?"2px solid #c0392b":"2px solid transparent", color:adminTab===st.id?"#fff":"#555", cursor:"pointer", marginBottom:"-1px", transition:"color 0.15s", whiteSpace:"nowrap" }}>
                    {st.label}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.5rem 0" }}>
                <span style={{ fontFamily:inter, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:syncColor }}>{syncLabel}</span>
                <button onClick={handleSync} style={{ ...T.badge, fontSize:11, padding:"0.35rem 0.9rem", borderRadius:4, border:"none", background:"#c0392b", color:"#fff", cursor:"pointer" }}>Save to Supabase</button>
                <button onClick={()=>{ setAdminUnlocked(false); setPwInput(""); }} style={{ fontFamily:inter, fontSize:11, fontWeight:700, padding:"0.35rem 0.75rem", borderRadius:4, border:"1px solid #2e2e2e", background:"transparent", color:"#666", cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.08em" }}>Lock</button>
              </div>
            </div>

            {/* ── EVENT SETTINGS ── */}
            {adminTab==="settings" && (
              <div style={{ padding:"1.75rem 1.5rem" }}>
                <DayBadge label="Admin · Event Settings" />
                <div style={{ ...T.h1, marginBottom:"0.25rem" }}>Event Settings</div>
                <div style={{ ...T.body, marginBottom:"1.5rem" }}>Everything here appears on the public-facing pages.</div>

                <SectionCard>
                  <SectionHeader title="Logos" />
                  <div style={{ padding:"1rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }}>
                    <LogoUploader label="Event Logo" currentUrl={settings.eventLogoUrl} bucket="event-logo" onUploaded={v=>updateSettings({eventLogoUrl:v})} />
                    <LogoUploader label="Gym Logo"   currentUrl={settings.gymLogoUrl}   bucket="gym-logo"   onUploaded={v=>updateSettings({gymLogoUrl:v})} />
                  </div>
                </SectionCard>

                <SectionCard>
                  <SectionHeader title="Competition Info" />
                  <div style={{ padding:"1rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                    <Field label="Competition Name" value={settings.competitionName} onChange={v=>updateSettings({competitionName:v})} placeholder="In-House Competition" />
                    <Field label="Venue / Subtitle Line" value={settings.venueLine} onChange={v=>updateSettings({venueLine:v})} placeholder="CrossFit Taylors · Taylors, SC" />
                    <Field label="Check-In Info (shown below schedule heading)" value={settings.checkinInfo} onChange={v=>updateSettings({checkinInfo:v})} placeholder="Check-in 8:00–8:20am · Athlete Brief 8:30am" />
                    <Field label="Podium Note" value={settings.podiumNote} onChange={v=>updateSettings({podiumNote:v})} placeholder="After all WODs: PODIUM ASAP — stay tuned for leaderboard updates." />
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0d0d0d", border:"1px solid #2e2e2e", borderRadius:5, padding:"0.55rem 0.75rem" }}>
  <div>
    <div style={{ ...T.label, marginBottom:2 }}>Show Division Badges</div>
    <div style={T.small}>Display RX / Scaled / Masters badges on schedule, leaderboard, and team lists</div>
  </div>
  <button
    onClick={() => updateSettings({ showDivisions: settings.showDivisions === "true" ? "false" : "true" })}
    style={{
      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
      background: settings.showDivisions === "true" ? "#22c55e" : "#333",
      position: "relative", transition: "background 0.2s"
    }}
  >
    <span style={{
      position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%", background: "#fff",
      transition: "left 0.2s", left: settings.showDivisions === "true" ? 23 : 3
    }} />
  </button>
</div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── WODS ── */}
            {adminTab==="wods" && (
              <div style={{ padding:"1.75rem 1.5rem" }}>
                <DayBadge label="Admin · WODs" />
                <div style={{ ...T.h1, marginBottom:"0.25rem" }}>WOD Editor</div>
                <div style={{ ...T.body, marginBottom:"1.5rem" }}>Edit workout names, formats, movements, scaling notes, and heat times. Changes appear live on the Schedule and Leaderboard.</div>

                {wods.map((wod, idx) => (
                  <WodEditor key={wod.id} wod={wod} allHeats={allHeatKeys}
                    onChange={patch=>updateWod(idx,patch)}
                    onRemove={()=>removeWod(idx)}
                  />
                ))}
                <button onClick={addWod}
                  style={{ width:"100%", padding:"0.75rem", background:"#141414", border:"1px dashed #333", borderRadius:8, color:"#666", fontFamily:inter, fontSize:13, fontWeight:700, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                  + Add WOD
                </button>
              </div>
            )}

            {/* ── TEAM PROFILES ── */}
            {adminTab==="teams" && (
              <div style={{ padding:"1.75rem 1.5rem" }}>
                <DayBadge label="Admin · Team Profiles" />
                <div style={{ ...T.h1, marginBottom:"0.25rem" }}>Team Profiles</div>
                <div style={{ ...T.body, marginBottom:"1.5rem" }}>Edit team names, athletes (up to 4), division, heat, and lane. Supports pairs and teams of 4.</div>

                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))", gap:"0.65rem", marginBottom:"1.5rem" }}>
                  {[
                    { label:"Total Teams", value:teams.length },
                    ...DIVISIONS.filter(d=>d&&teams.some(t=>t.division===d)).map(d=>({ label:d, value:teams.filter(t=>t.division===d).length })),
                  ].map(stat => (
                    <div key={stat.label} style={{ background:"#161616", border:"1px solid #222", borderRadius:7, padding:"0.65rem 0.85rem" }}>
                      <div style={T.label}>{stat.label}</div>
                      <div style={{ fontFamily:inter, fontSize:22, fontWeight:700, color:"#fff", marginTop:2 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1rem", flexWrap:"wrap" }}>
                  <input value={profileSearch} onChange={e=>setProfileSearch(e.target.value)} placeholder="Search teams or athletes…"
                    style={{ flex:1, minWidth:200, maxWidth:360, background:"#161616", border:"1px solid #2e2e2e", borderRadius:6, color:"#f0f0f0", fontFamily:inter, fontSize:13, padding:"0.5rem 0.75rem", boxSizing:"border-box", outline:"none" }} />
                  <button onClick={addTeam}
                    style={{ ...T.badge, fontSize:12, padding:"0.5rem 1.1rem", borderRadius:6, border:"1px solid #333", background:"#1a1a1a", color:"#aaa", cursor:"pointer" }}>
                    + Add Team
                  </button>
                </div>

                {allHeatKeys.map(heat => {
                  const heatTeams = filteredTeams.filter(t=>t.heat===heat);
                  if (!heatTeams.length) return null;
                  return (
                    <div key={heat} style={{ marginBottom:"1.5rem" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.6rem" }}>
                        <HeatBadge heat={heat} />
                        <span style={{ ...T.small, color:"#555" }}>{heatTeams.length} team{heatTeams.length!==1?"s":""}</span>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                        {heatTeams.map(team => (
                          <TeamProfileCard key={team.id} team={team}
                            onUpdate={patch=>updateTeam(team.id,patch)}
                            onRemove={()=>removeTeam(team.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Teams with no heat assigned */}
                {filteredTeams.filter(t=>!allHeatKeys.includes(t.heat)).length > 0 && (
                  <div style={{ marginBottom:"1.5rem" }}>
                    <div style={{ ...T.label, color:"#555", marginBottom:"0.6rem" }}>Unassigned</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                      {filteredTeams.filter(t=>!allHeatKeys.includes(t.heat)).map(team => (
                        <TeamProfileCard key={team.id} team={team}
                          onUpdate={patch=>updateTeam(team.id,patch)}
                          onRemove={()=>removeTeam(team.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SCORE ENTRY ── */}
            {adminTab==="scoring" && (
              <div style={{ padding:"1.75rem 1.5rem" }}>
                <DayBadge label="Admin · Score Entry" />
                <div style={{ ...T.h1, marginBottom:"0.25rem" }}>Score Entry</div>
                <div style={{ ...T.body, marginBottom:"1.5rem" }}>Enter each team's score per WOD. Totals calculate automatically and reflect live on the Leaderboard.</div>

                <SectionCard>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
                      <thead>
                        <tr style={{ background:"#1c1c1c" }}>
                          <th style={{ ...T.label, padding:"0.65rem 0.75rem", borderBottom:"1px solid #2a2a2a", textAlign:"left" }}>Team</th>
                          <th style={{ ...T.label, padding:"0.65rem 0.75rem", borderBottom:"1px solid #2a2a2a" }}>Heat</th>
                          <th style={{ ...T.label, padding:"0.65rem 0.75rem", borderBottom:"1px solid #2a2a2a" }}>Div</th>
                          {wods.map(w => (
                            <th key={w.id} style={{ ...T.label, padding:"0.65rem 0.75rem", borderBottom:"1px solid #2a2a2a", textAlign:"center" }}>
                              <div>{w.name}</div>
                              <div style={{ ...T.small, color:"#555", textTransform:"none", letterSpacing:0 }}>{w.cap}</div>
                            </th>
                          ))}
                          <th style={{ ...T.label, padding:"0.65rem 0.75rem", borderBottom:"1px solid #2a2a2a", textAlign:"center" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map(team => {
                          const total = wods.reduce((sum,w)=>{ const v=parseFloat(scores[team.id]?.[w.id]); return isNaN(v)?sum:sum+v; }, 0);
                          const hasAny = wods.some(w=>scores[team.id]?.[w.id]!=null&&scores[team.id]?.[w.id]!=="");
                          const athletes = athleteList(team);
                          return (
                            <tr key={team.id} style={{ borderBottom:"1px solid #1a1a1a" }}>
                              <td style={{ padding:"0.6rem 0.75rem" }}>
                                <div style={T.teamBold}>{team.teamName}</div>
                                <div style={T.small}>{athletes.join(" · ")}</div>
                              </td>
                              <td style={{ padding:"0.6rem 0.75rem" }}><HeatBadge heat={team.heat} /></td>
                              <td style={{ padding:"0.6rem 0.75rem" }}><DivisionBadge division={team.division} show={true} /></td>
                              {wods.map(w => (
                                <td key={w.id} style={{ padding:"0.5rem 0.6rem", textAlign:"center" }}>
                                  <input type="number" value={scores[team.id]?.[w.id]||""}
                                    onChange={e=>handleScore(team.id,w.id,e.target.value)}
                                    placeholder="—"
                                    style={{ width:76, background:"#0a0a0a", border:"1px solid #2e2e2e", borderRadius:4, color:"#f5f5f0", fontFamily:inter, fontSize:15, fontWeight:700, padding:"0.3rem 0.4rem", textAlign:"center", outline:"none" }}
                                  />
                                </td>
                              ))}
                              <td style={{ padding:"0.6rem 0.75rem", textAlign:"center" }}>
                                <span style={{ fontFamily:inter, fontSize:17, fontWeight:700, color:hasAny?"#f5c842":"#444" }}>
                                  {hasAny?total:"–"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
