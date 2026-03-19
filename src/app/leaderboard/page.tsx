import Leaderboard from "@/components/Leaderboard"

export default function LeaderboardPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--void-abyss)" }} className="grid-bg">
      {/* Status bar */}
      <div style={{ borderBottom: "1px solid var(--grid-line)", background: "var(--nav-bg)", padding: "0.375rem 1.5rem" }}>
        <span className="label-mono" style={{ color: "var(--loss-red)" }}>
          [!] SIMULATED PERFORMANCE ONLY — NO REAL CAPITAL AT RISK
        </span>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
        {/* Hero banner — Atlas spec */}
        <div style={{
          border: "1px solid var(--grid-line)",
          padding: "2rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Crosshair decoration */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "200px", height: "200px",
            opacity: 0.04,
            pointerEvents: "none",
          }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "var(--signal-cyan)" }} />
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "var(--signal-cyan)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--signal-white)" }}>
                LLM ARENA
              </div>
              <div className="label-mono" style={{ marginTop: "0.25rem" }}>SEASON 1 — AI GLADIATORS</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="live-dot" />
              <span className="label-mono" style={{ color: "var(--signal-cyan)" }}>LIVE</span>
            </div>
          </div>
        </div>

        <Leaderboard />
      </div>
    </div>
  )
}
