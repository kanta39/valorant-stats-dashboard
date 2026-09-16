export default function MatchCard({ 
  match, 
  agentImages = {}, 
  mapDetails = {}, 
  activeSearchQuery = '', 
  onClick 
}) {
  const targetName = (activeSearchQuery || "").split('#')[0].toLowerCase();
  const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
  
  const myTeam = myPlayer?.team || 'Blue';
  const redScore = match.teams?.red ?? 0;
  const blueScore = match.teams?.blue ?? 0;
  const myScore = myTeam === 'Red' ? redScore : blueScore;
  const enemyScore = myTeam === 'Red' ? blueScore : redScore;

  const isDraw = redScore === blueScore;
  const isWin = !isDraw && myScore > enemyScore;

  // ธีมสีตามผลแพ้-ชนะ
  const resultText = isDraw ? 'DRAW' : (isWin ? 'VICTORY' : 'DEFEAT');
  const resultTheme = isDraw 
    ? {
        border: 'border-gray-700/80 hover:border-gray-500',
        stripe: 'bg-gray-500',
        bg: 'bg-gray-900/90',
        badge: 'bg-gray-700/40 text-gray-300 border-gray-600',
        scoreColor: 'text-gray-300',
        glow: 'shadow-gray-950/40'
      }
    : isWin 
    ? {
        border: 'border-green-500/35 hover:border-green-400/70',
        stripe: 'bg-green-500',
        bg: 'bg-gradient-to-r from-green-950/20 via-[#111823] to-[#111823]',
        badge: 'bg-green-500/20 text-green-400 border-green-500/40',
        scoreColor: 'text-green-400',
        glow: 'shadow-[0_4px_20px_rgba(34,197,94,0.08)]'
      }
    : {
        border: 'border-red-500/35 hover:border-red-400/70',
        stripe: 'bg-red-500',
        bg: 'bg-gradient-to-r from-red-950/20 via-[#111823] to-[#111823]',
        badge: 'bg-red-500/20 text-red-400 border-red-500/40',
        scoreColor: 'text-red-400',
        glow: 'shadow-[0_4px_20px_rgba(239,68,68,0.08)]'
      };

  // ตรวจสอบตำแหน่ง MVP (Match MVP / Team MVP)
  let isMatchMvp = false;
  let isTeamMvp = false;
  if (match.scoreboard && match.scoreboard.length > 0) {
    const sortedAll = [...match.scoreboard].sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0));
    if (sortedAll[0] && String(sortedAll[0].name || "").toLowerCase() === targetName) {
      isMatchMvp = true;
    } else {
      const myTeamPlayers = match.scoreboard.filter(p => p.team === myTeam);
      const sortedTeam = myTeamPlayers.sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0));
      if (sortedTeam[0] && String(sortedTeam[0].name || "").toLowerCase() === targetName) {
        isTeamMvp = true;
      }
    }
  }

  // สถิติการต่อสู้
  const pStats = myPlayer?.stats || {};
  const acs = pStats.acs ?? (match.raw_stats?.kills ? Math.round((match.analysis?.performance_score || 0) * 2.5) : 0);
  const hsPercent = pStats.hs_percent ?? 0;
  const adr = pStats.adr ?? 0;
  const mapSplash = mapDetails?.[(match.map || "").toLowerCase()]?.splash;

  return (
    <div 
      onClick={onClick}
      className={`border ${resultTheme.border} ${resultTheme.bg} ${resultTheme.glow} rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl cursor-pointer hover:scale-[1.008] transition-all duration-300 group`}
    >
      {/* 🖼️ ภาพพื้นหลัง Splash Art ของแผนที่ */}
      {mapSplash && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img 
            src={mapSplash} 
            alt="map" 
            className="w-full h-full object-cover object-center opacity-10 group-hover:opacity-20 scale-105 group-hover:scale-110 transition-all duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1420]/95 via-[#0d1420]/80 to-[#0d1420]/90"></div>
        </div>
      )}

      {/* แถบสีบ่งบอกผลแพ้ชนะแนวตั้งด้านซ้าย */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${resultTheme.stripe}`}></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-4">
        {/* คอลัมน์ 1: ผลแข่ง + สกอร์ + Agent + Map (Cols 1-5) */}
        <div className="col-span-1 lg:col-span-5 flex items-center gap-3.5 sm:gap-4">
          {/* รูป Agent Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-950 rounded-2xl border border-gray-700/80 p-1 flex items-center justify-center shadow-inner group-hover:border-gray-500 transition-colors">
              {agentImages[match.agent] ? (
                <img src={agentImages[match.agent]} alt={match.agent} className="w-full h-full object-contain drop-shadow" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                  {String(match.agent || "UN").substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* ป้ายผล + สกอร์รอบ + ชื่อด่าน */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* ผลการแข่งขัน VICTORY / DEFEAT */}
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${resultTheme.badge}`}>
                {resultText}
              </span>

              {/* สกอร์รอบสุดท้าย เช่น 13 - 7 */}
              <span className={`text-base font-black ${resultTheme.scoreColor} tabular-nums tracking-wide`}>
                {myScore} : {enemyScore}
              </span>

              {/* ป้าย MVP */}
              {isMatchMvp && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  👑 MATCH MVP
                </span>
              )}
              {!isMatchMvp && isTeamMvp && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 uppercase">
                  ⭐ TEAM MVP
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <h3 className="font-black text-white text-base sm:text-lg tracking-wide truncate drop-shadow">
                {match.map || "Unknown Map"}
              </h3>
              <span className="text-[10px] text-gray-400 font-bold px-1.5 py-0.5 rounded bg-gray-800/80 border border-gray-700/60 uppercase">
                {match.mode || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* คอลัมน์ 2: K / D / A + Ratio + ADR (Cols 6-8) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col items-center lg:items-center justify-center bg-gray-950/40 lg:bg-transparent p-2.5 lg:p-0 rounded-xl border border-gray-800/40 lg:border-none">
          <div className="font-black text-base sm:text-lg text-gray-200 flex items-center justify-center tabular-nums">
            <span className="text-green-400 w-7 text-right">{match.raw_stats?.kills ?? 0}</span>
            <span className="text-gray-600 mx-1.5 font-normal">/</span>
            <span className="text-red-400 w-7 text-center">{match.raw_stats?.deaths ?? 0}</span>
            <span className="text-gray-600 mx-1.5 font-normal">/</span>
            <span className="text-blue-400 w-7 text-left">{match.raw_stats?.assists ?? 0}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
            <span>K/D: <strong className="text-gray-200">{Number(match.analysis?.kda_ratio || 0).toFixed(2)}</strong></span>
            {adr > 0 && <span>ADR: <strong className="text-gray-300">{adr}</strong></span>}
          </div>
        </div>

        {/* คอลัมน์ 3: ACS + Headshot % + Grade Score (Cols 9-12) */}
        <div className="col-span-1 lg:col-span-3 flex items-center justify-between lg:justify-end gap-4 sm:gap-6">
          <div className="text-left lg:text-right">
            <div className="flex items-center lg:justify-end gap-1.5">
              <span className="text-xs text-gray-400 font-bold">ACS</span>
              <span className="text-sm font-black text-yellow-400 tabular-nums">
                {acs >= 1000 ? acs.toLocaleString() : acs}
              </span>
            </div>
            <div className="flex items-center lg:justify-end gap-1.5 mt-0.5">
              <span className="text-[11px] text-gray-400">HS</span>
              <span className="text-xs font-black text-blue-400 tabular-nums">{hsPercent}%</span>
            </div>
          </div>

          {/* ป้าย Grade วงกลม */}
          <div className="flex items-center gap-2.5">
            <div className="bg-gray-950 w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-700/80 shadow-inner flex-shrink-0 group-hover:border-gray-500 transition-colors">
              <span className="text-xl font-black text-yellow-400 drop-shadow">
                {String(match.analysis?.grade || "N/A").split(" ")[0]}
              </span>
            </div>
            <span className="text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all text-sm font-bold hidden sm:inline">
              ➜
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
