export default function HitMatrixCard({ matches = [], activeSearchQuery = '' }) {
  const targetName = (activeSearchQuery || '').split('#')[0].toLowerCase();

  let totalHeadshots = 0;
  let totalBodyshots = 0;
  let totalLegshots = 0;

  matches.forEach(match => {
    const myPlayer = match.scoreboard?.find(p => String(p.name || '').toLowerCase() === targetName);
    const pStats = myPlayer?.stats || {};
    const rawStats = match.raw_stats || {};

    let hs = pStats.headshots ?? rawStats.headshots ?? 0;
    let bs = pStats.bodyshots ?? rawStats.bodyshots ?? 0;
    let ls = pStats.legshots ?? rawStats.legshots ?? 0;

    // ถ้าไม่มีข้อมูล bodyshots/legshots โดยตรง ให้ประมาณการจาก hs_percent
    if (bs === 0 && ls === 0 && hs > 0) {
      const hsPercent = pStats.hs_percent || (match.analysis?.performance_score ? 20 : 0);
      if (hsPercent > 0) {
        const estTotal = Math.round(hs / (hsPercent / 100));
        const estRemaining = Math.max(0, estTotal - hs);
        bs = Math.round(estRemaining * 0.88);
        ls = Math.max(0, estRemaining - bs);
      }
    }

    totalHeadshots += hs;
    totalBodyshots += bs;
    totalLegshots += ls;
  });

  const totalHits = totalHeadshots + totalBodyshots + totalLegshots;
  const headPercent = totalHits > 0 ? Math.round((totalHeadshots / totalHits) * 100) : 0;
  const bodyPercent = totalHits > 0 ? Math.round((totalBodyshots / totalHits) * 100) : 0;
  const legPercent = totalHits > 0 ? Math.max(0, 100 - headPercent - bodyPercent) : 0;

  // ประเมินฉายาความแม่นยำ (Aim Profile)
  let aimBadge = {
    title: 'Balanced Gunner',
    desc: 'ยิงแม่นยำตามมาตรฐาน',
    color: 'text-gray-300 bg-gray-800/80 border-gray-700',
    icon: '⚔️'
  };

  if (headPercent >= 28) {
    aimBadge = {
      title: 'Aim Demon',
      desc: 'ระดับหัวคมเฉียบขาด',
      color: 'text-red-400 bg-red-500/15 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
      icon: '⚡'
    };
  } else if (headPercent >= 20) {
    aimBadge = {
      title: 'Head Hunter',
      desc: 'เล็งหัวสม่ำเสมอดีมาก',
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/40',
      icon: '🎯'
    };
  } else if (bodyPercent >= 70) {
    aimBadge = {
      title: 'Body Spray Master',
      desc: 'เน้นสเปรย์เข้าลำตัวชัวร์',
      color: 'text-blue-400 bg-blue-500/15 border-blue-500/40',
      icon: '🛡️'
    };
  }

  return (
    <div className="bg-[#111823] border border-gray-800/90 rounded-2xl p-4 sm:p-5 shadow-xl animate-fade-in relative overflow-hidden">
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <h3 className="text-white text-xs sm:text-sm font-black tracking-widest uppercase">
            HIT DISTRIBUTION
          </h3>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">
          {totalHits.toLocaleString()} Hits
        </span>
      </div>

      {/* Silhouette & Stats Layout */}
      <div className="flex items-center justify-between gap-4">
        {/* Silhouette Vector Visual */}
        <div className="relative w-16 h-28 flex-shrink-0 flex items-center justify-center bg-gray-950/60 rounded-xl border border-gray-800/80 p-2 shadow-inner">
          <svg viewBox="0 0 60 120" className="w-full h-full drop-shadow-md">
            {/* HEAD (Red) */}
            <circle 
              cx="30" cy="18" r="11" 
              fill="#ef4444" 
              fillOpacity={Math.max(0.4, headPercent / 50)} 
              stroke="#ef4444" 
              strokeWidth="2"
            />
            <circle cx="30" cy="18" r="3" fill="#ffffff" fillOpacity="0.8" />

            {/* TORSO / BODY (Yellow/Amber) */}
            <path 
              d="M17 34 L43 34 L39 74 L21 74 Z" 
              fill="#f59e0b" 
              fillOpacity={Math.max(0.4, bodyPercent / 100)} 
              stroke="#f59e0b" 
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* ARMS */}
            <path 
              d="M16 36 L8 62 M44 36 L52 62" 
              stroke="#f59e0b" 
              strokeWidth="3.5" 
              strokeLinecap="round"
              strokeOpacity="0.8"
            />

            {/* LEGS (Cyan/Blue) */}
            <path 
              d="M23 75 L18 112 M37 75 L42 112" 
              stroke="#06b6d4" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeOpacity={Math.max(0.4, legPercent / 25)}
            />
          </svg>
        </div>

        {/* 3 Hit Stats Cards */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Headshot */}
          <div className="flex items-center justify-between bg-gray-950/70 px-3 py-1.5 rounded-xl border border-red-500/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]"></span>
              <span className="text-[11px] font-bold text-gray-300">HEAD</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-red-400 tabular-nums">{headPercent}%</span>
              <span className="text-[9px] text-gray-500 ml-1.5 font-mono">({totalHeadshots})</span>
            </div>
          </div>

          {/* Bodyshot */}
          <div className="flex items-center justify-between bg-gray-950/70 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]"></span>
              <span className="text-[11px] font-bold text-gray-300">BODY</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-amber-400 tabular-nums">{bodyPercent}%</span>
              <span className="text-[9px] text-gray-500 ml-1.5 font-mono">({totalBodyshots})</span>
            </div>
          </div>

          {/* Legshot */}
          <div className="flex items-center justify-between bg-gray-950/70 px-3 py-1.5 rounded-xl border border-cyan-500/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span>
              <span className="text-[11px] font-bold text-gray-300">LEGS</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-cyan-400 tabular-nums">{legPercent}%</span>
              <span className="text-[9px] text-gray-500 ml-1.5 font-mono">({totalLegshots})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tripartite Color Progress Bar */}
      <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden flex mt-3.5 border border-gray-800">
        <div 
          style={{ width: `${headPercent}%` }} 
          className="bg-red-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
          title={`Headshots: ${headPercent}%`}
        ></div>
        <div 
          style={{ width: `${bodyPercent}%` }} 
          className="bg-amber-400 h-full transition-all duration-500" 
          title={`Bodyshots: ${bodyPercent}%`}
        ></div>
        <div 
          style={{ width: `${legPercent}%` }} 
          className="bg-cyan-400 h-full transition-all duration-500" 
          title={`Legshots: ${legPercent}%`}
        ></div>
      </div>

      {/* Aim Profile Badge */}
      <div className={`mt-3 px-3 py-1.5 rounded-xl border flex items-center justify-between ${aimBadge.color}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{aimBadge.icon}</span>
          <span className="text-xs font-black uppercase tracking-wider">{aimBadge.title}</span>
        </div>
        <span className="text-[10px] opacity-80">{aimBadge.desc}</span>
      </div>
    </div>
  );
}
