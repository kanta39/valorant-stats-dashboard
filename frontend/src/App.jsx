import { useState, useEffect } from 'react'

const VALORANT_MODES = [
  { id: 'All', name: 'ทุกโหมด (All Modes)' },
  { id: 'competitive', name: 'Competitive (ลงแรงค์)' },
  { id: 'unrated', name: 'Unrated (ทั่วไป)' },
  { id: 'deathmatch', name: 'Deathmatch' },
  { id: 'teamdeathmatch', name: 'Team Deathmatch' },
  { id: 'swiftplay', name: 'Swiftplay' },
  { id: 'spikerush', name: 'Spike Rush' }
];

function App() {
  const [searchQuery, setSearchQuery] = useState("Raven#x10") 
  const [playerData, setPlayerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [filterMode, setFilterMode] = useState("All")
  const [activeTab, setActiveTab] = useState("overview")
  const [agentImages, setAgentImages] = useState({})
  const [rankImages, setRankImages] = useState({})
  
  const [agentRoles, setAgentRoles] = useState({})
  const [roleIcons, setRoleIcons] = useState({})
  
  const [selectedMatch, setSelectedMatch] = useState(null)

  useEffect(() => {
    fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
      .then(res => res.json())
      .then(data => {
        const imageMap = {};
        const roleMap = {};
        const rIconMap = {};
        data.data.forEach(agent => {
          imageMap[agent.displayName] = agent.displayIcon;
          if (agent.role) {
            roleMap[agent.displayName] = agent.role.displayName;
            rIconMap[agent.role.displayName] = agent.role.displayIcon;
          }
        });
        setAgentImages(imageMap);
        setAgentRoles(roleMap);
        setRoleIcons(rIconMap);
      })
      .catch(err => console.error("โหลดรูป Agent ไม่สำเร็จ:", err));

    fetch('https://valorant-api.com/v1/competitivetiers')
      .then(res => res.json())
      .then(data => {
        const latestEpisode = data.data[data.data.length - 1];
        const rankMap = {};
        latestEpisode.tiers.forEach(tier => {
          if (tier.tierName) rankMap[tier.tierName.toLowerCase().replace(/\s/g, '')] = tier.largeIcon || tier.smallIcon;
        });
        rankMap["unrated"] = rankMap["unranked"];
        setRankImages(rankMap);
      })
      .catch(err => console.error("โหลดรูป Rank ไม่สำเร็จ:", err));
  }, []);

  const fetchStats = async (modeToFetch = filterMode, isNewSearch = false) => {
    if (!searchQuery.trim()) { setErrorMsg("กรุณากรอก Riot ID และ Tag คับ"); return; }
    if (!searchQuery.includes('#')) { setErrorMsg("รูปแบบไม่ถูกต้องคับ กรุณาพิมพ์ในรูปแบบ ชื่อ#แท็ก (ต้องมีเครื่องหมาย #)"); return; }
    
    const [riotName, riotTag] = searchQuery.split('#')
    if (!riotName.trim() || !riotTag.trim()) { setErrorMsg("กรุณากรอกทั้งชื่อและแท็กให้ครบถ้วนคับ"); return; }

    setLoading(true); setErrorMsg(null); setSelectedMatch(null);

    let currentMode = modeToFetch;
    if (isNewSearch) { currentMode = "All"; setFilterMode("All"); setActiveTab("overview"); }

    try {
      //  ของใหม่ (ยิงเข้าเซิร์ฟเวอร์คลาวด์ออนไลน์)
      const response = await fetch(`https://val-stats-api.onrender.com/api/matches/${riotName.trim()}/${riotTag.trim()}?mode=${currentMode}`)
      const data = await response.json()
      if (data.error) { setErrorMsg(data.error); if (isNewSearch) setPlayerData(null); } 
      else { setPlayerData(data); }
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ:", error); setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้");
      if (isNewSearch) setPlayerData(null);
    } finally { setLoading(false); }
  }

  const handleKeyPress = (e) => { if (e.key === 'Enter') fetchStats(filterMode, true); }
  const handleModeChange = (e) => {
    const selectedMode = e.target.value; setFilterMode(selectedMode); fetchStats(selectedMode, false); setSelectedMatch(null); 
  }

  const hasData = playerData && playerData.match_history && !errorMsg;

  const displayedMatches = !hasData ? [] : (
    filterMode === "All" 
      ? playerData.match_history 
      : playerData.match_history.filter(m => m.mode.toLowerCase().replace(/\s/g, '') === filterMode.toLowerCase().replace(/\s/g, ''))
  );

  const getRoundIcon = (endType) => {
    // ใช้ strokeWidth="1.5" เพื่อให้เส้นดูบางและคลีนเหมือน Official UI
    const iconClass = "w-5 h-5 md:w-6 md:h-6 drop-shadow-sm";
    
    switch(endType) {
      case 'Eliminated': 
        // สัญลักษณ์จัดการศัตรู (วงกลม + กากบาทด้านใน)
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M8.5 8.5l7 7M15.5 8.5l-7 7"></path>
          </svg>
        );
      case 'Bomb defused': 
      case 'Bomb detonated': 
        // สัญลักษณ์ Spike ทำงานหรือถูกกู้ (ลายเส้นทรงคริสตัล)
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.5L5.5 13l3.5 7.5 9-4.5 1.5-6.5-7.5-7z"></path>
          </svg>
        );
      case 'Time out': 
      default: 
        // สัญลักษณ์หมดเวลา หรืออื่นๆ (วงกลมโปร่ง)
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
          </svg>
        );
    }
  }
  const getOverallStats = () => {
    if (displayedMatches.length === 0) return null;
    
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    const targetName = searchQuery.split('#')[0].toLowerCase();

    displayedMatches.forEach(match => {
      totalKills += match.raw_stats.kills;
      totalDeaths += match.raw_stats.deaths;
      totalAssists += match.raw_stats.assists;

      const myPlayer = match.scoreboard?.find(p => p.name.toLowerCase() === targetName);
      if (myPlayer) {
        const myTeam = myPlayer.team;
        const redScore = match.teams.red;
        const blueScore = match.teams.blue;

        if (redScore === blueScore) draws += 1;
        else if (redScore > blueScore && myTeam === 'Red') wins += 1;
        else if (blueScore > redScore && myTeam === 'Blue') wins += 1;
        else losses += 1;
      }
    });

    const totalMatches = displayedMatches.length;
    const winRate = (wins / totalMatches) * 100;
    const kdaRatio = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : (totalKills + totalAssists).toFixed(2);

    return { totalMatches, winRate, kdaRatio, wins, losses, draws, totalKills, totalDeaths, totalAssists };
  }

  const getAgentStats = () => {
    if (displayedMatches.length === 0) return [];
    
    const stats = {};
    const targetName = searchQuery.split('#')[0].toLowerCase();

    displayedMatches.forEach(match => {
      const myPlayer = match.scoreboard?.find(p => p.name.toLowerCase() === targetName);
      if (!myPlayer) return;

      // 🔥 ใส่ || "Unknown" เพื่อดักกรณีที่ API ไม่ส่งชื่อตัวละครมาให้
      const agent = match.agent || "Unknown"; 
      if (!stats[agent]) {
        stats[agent] = { name: agent, w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 };
      }

      stats[agent].matches += 1;
      stats[agent].k += match.raw_stats?.kills || 0;
      stats[agent].death += match.raw_stats?.deaths || 0;
      stats[agent].a += match.raw_stats?.assists || 0;

      const myTeam = myPlayer.team;
      const redScore = match.teams?.red || 0;
      const blueScore = match.teams?.blue || 0;

      if (redScore === blueScore) stats[agent].d += 1;
      else if (redScore > blueScore && myTeam === 'Red') stats[agent].w += 1;
      else if (blueScore > redScore && myTeam === 'Blue') stats[agent].w += 1;
      else stats[agent].l += 1;
    });

    return Object.values(stats).sort((a, b) => b.matches - a.matches);
  }

  // เรียกใช้ฟังก์ชันที่เพิ่งสร้าง ไว้คู่กับบรรทัดที่เรียก overallStats คับ
  const overallStats = getOverallStats();
  const roleStatsArray = getRoleStats();
  const agentStatsArray = getAgentStats(); // 👈 เพิ่มบรรทัดนี้เข้าไป

  const renderTeamTable = (teamName, teamData, teamColorClass, bgColorClass, targetPlayerName, matchMode) => {
    if (!teamData || teamData.length === 0) return null;
    const sortedTeam = [...teamData].sort((a, b) => b.stats.acs - a.stats.acs);
    const showRank = matchMode.toLowerCase() === 'competitive';

    return (
      <div className="w-full overflow-x-auto mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full text-left border-collapse min-w-[1000px] tabular-nums">
          <thead>
            <tr className={`text-xs uppercase tracking-widest text-gray-400 border-b-2 border-gray-700 ${bgColorClass}`}>
              <th className="py-3 px-4 rounded-tl-md w-16">Agent</th>
              <th className="py-3 px-4 w-full">Player</th>
              {showRank && <th className="py-3 px-4 text-center w-24">Rank</th>}
              <th className="py-3 px-4 text-center w-24">ACS</th>
              <th className="py-3 px-4 text-center w-16">K</th>
              <th className="py-3 px-4 text-center w-16">D</th>
              <th className="py-3 px-4 text-center w-16">A</th>
              <th className="py-3 px-4 text-center w-24">K/D</th>
              <th className="py-3 px-4 text-center w-24">ADR</th>
              <th className="py-3 px-4 text-center rounded-tr-md w-24">HS%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {sortedTeam.map((player, idx) => {
              const isMe = String(player.name || "").toLowerCase() === String(targetPlayerName || "").toLowerCase();
              const kdColor = player.stats.kd >= 1 ? "text-green-400" : "text-red-400";
              const rawRank = player.rank || "Unranked";
              const rankKey = rawRank.toLowerCase().replace(/\s/g, '');
              const rankIcon = rankImages[rankKey] || rankImages["unranked"];
              
              return (
                <tr key={idx} className={`hover:bg-gray-800/40 transition-colors ${isMe ? 'bg-gray-800/60 border-l-4 border-yellow-500' : 'border-l-4 border-transparent'}`}>
                  <td className="py-2.5 px-4">
                    <div className="w-10 h-10 bg-gray-900 rounded border border-gray-700 p-0.5">
                      {agentImages[player.agent] ? ( <img src={agentImages[player.agent]} alt={player.agent} className="w-full h-full object-contain" /> ) : ( <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{String(player.agent || "UN").substring(0,2)}</div> )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 w-full">
                    <div className="flex items-baseline gap-2 overflow-hidden">
                      <span className={`font-bold text-base md:text-lg tracking-wide truncate ${isMe ? 'text-yellow-400' : 'text-gray-100'}`}>{player.name}</span>
                      <span className="text-xs text-gray-500">#{player.tag}</span>
                    </div>
                  </td>
                  {showRank && (
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex justify-center items-center">
                        {rankIcon ? ( <img src={rankIcon} alt={rawRank} title={rawRank} className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.05)]" /> ) : ( <span className="text-xs font-medium text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-800 whitespace-nowrap">{rawRank}</span> )}
                      </div>
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-center font-bold text-gray-200 text-base">{player.stats.acs}</td>
                  <td className="py-2.5 px-4 text-center font-black text-green-400/90 text-base">{player.stats.kills}</td>
                  <td className="py-2.5 px-4 text-center font-black text-red-400/90 text-base">{player.stats.deaths}</td>
                  <td className="py-2.5 px-4 text-center font-black text-blue-400/90 text-base">{player.stats.assists}</td>
                  <td className={`py-2.5 px-4 text-center font-bold text-base ${kdColor}`}>{Number(player.stats.kd).toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-center font-bold text-gray-300 text-base">{player.stats.adr}</td>
                  <td className="py-2.5 px-4 text-center font-bold text-gray-300 text-base">{player.stats.hs_percent}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const renderUnifiedTable = (scoreboardData, targetPlayerName, matchMode) => {
    if (!scoreboardData || scoreboardData.length === 0) return null;
    const sortedData = [...scoreboardData].sort((a, b) => b.stats.acs - a.stats.acs);
    const showRank = matchMode.toLowerCase() === 'competitive';

    return (
      <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full text-left border-collapse min-w-[1000px] tabular-nums">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-gray-400 border-b-2 border-gray-600 bg-gray-800/30">
              <th className="py-3 px-4 rounded-tl-md w-16">Agent</th>
              <th className="py-3 px-4 w-full">Player</th>
              {showRank && <th className="py-3 px-4 text-center w-24">Rank</th>}
              <th className="py-3 px-4 text-center w-24">ACS</th>
              <th className="py-3 px-4 text-center w-16">K</th>
              <th className="py-3 px-4 text-center w-16">D</th>
              <th className="py-3 px-4 text-center w-16">A</th>
              <th className="py-3 px-4 text-center w-24">K/D</th>
              <th className="py-3 px-4 text-center w-24">ADR</th>
              <th className="py-3 px-4 text-center rounded-tr-md w-24">HS%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {sortedData.map((player, idx) => {
              const isMe = String(player.name || "").toLowerCase() === String(targetPlayerName || "").toLowerCase();
              const kdColor = player.stats.kd >= 1 ? "text-green-400" : "text-red-400";
              const rawRank = player.rank || "Unranked";
              const rankKey = rawRank.toLowerCase().replace(/\s/g, '');
              const rankIcon = rankImages[rankKey] || rankImages["unranked"];

              return (
                <tr key={idx} className={`hover:bg-gray-800/40 transition-colors ${isMe ? 'bg-gray-800/60 border-l-4 border-yellow-500' : 'border-l-4 border-transparent'}`}>
                  <td className="py-2.5 px-4">
                    <div className="w-10 h-10 bg-gray-900 rounded border border-gray-700 p-0.5">
                      {agentImages[player.agent] ? ( <img src={agentImages[player.agent]} alt={player.agent} className="w-full h-full object-contain" /> ) : ( <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{String(player.agent || "UN").substring(0,2)}</div> )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 w-full">
                    <div className="flex items-baseline gap-2 overflow-hidden">
                      <span className={`font-bold text-base md:text-lg tracking-wide truncate ${isMe ? 'text-yellow-400' : 'text-gray-100'}`}>{player.name}</span>
                      <span className="text-xs text-gray-600">#{player.tag}</span>
                    </div>
                  </td>
                  {showRank && (
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex justify-center items-center">
                        {rankIcon ? ( <img src={rankIcon} alt={rawRank} title={rawRank} className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.05)]" /> ) : ( <span className="text-xs font-medium text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-800 whitespace-nowrap">{rawRank}</span> )}
                      </div>
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-center font-bold text-gray-200 text-base">{player.stats.acs}</td>
                  <td className="py-2.5 px-4 text-center font-black text-green-400/90 text-base">{player.stats.kills}</td>
                  <td className="py-2.5 px-4 text-center font-black text-red-400/90 text-base">{player.stats.deaths}</td>
                  <td className="py-2.5 px-4 text-center font-black text-blue-400/90 text-base">{player.stats.assists}</td>
                  <td className={`py-2.5 px-4 text-center font-bold text-base ${kdColor}`}>{Number(player.stats.kd).toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-center font-bold text-gray-300 text-base">{player.stats.adr}</td>
                  <td className="py-2.5 px-4 text-center font-bold text-gray-300 text-base">{player.stats.hs_percent}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans transition-all duration-500 flex flex-col relative">
      
      {/* 🌐 NAVBAR */}
      {hasData && (
        <nav className="w-full bg-gray-900 border-b border-gray-800 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-90 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform whitespace-nowrap" onClick={() => setPlayerData(null)}>
              <h1 className="text-xl font-black text-red-500 tracking-wider drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">VALORANT STATS</h1>
            </div>
            <span className="text-gray-700 text-xl font-light hidden sm:block">|</span>
            <div className="flex gap-5 sm:gap-6 overflow-x-auto w-full sm:w-auto justify-center sm:justify-start">
              {['overview', 'agents', 'maps'].map(tab => (
                <button 
                  key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-1 text-sm font-bold tracking-widest uppercase transition-all whitespace-nowrap ${ activeTab === tab ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-gray-200 border-b-2 border-transparent" }`}
                > {tab} </button>
              ))}
            </div>
          </div>
          <div className="flex w-full lg:w-auto max-w-md gap-2">
            <input type="text" placeholder="ชื่อผู้เล่น#แท็ก" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyPress} className="w-full sm:w-64 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-all font-bold" spellCheck="false" />
            <button onClick={() => fetchStats(filterMode, true)} disabled={loading} className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold py-2 px-4 rounded-xl text-sm whitespace-nowrap">ค้นหาใหม่</button>
          </div>
        </nav>
      )}

      {/* 🏠 หน้าแรก */}
      {!hasData && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-5 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-black text-red-500 tracking-wider mb-2">VALORANT STATS</h1>
            <p className="text-gray-400 text-sm md:text-base tracking-widest uppercase">Enter your Riot ID to view match history</p>
          </div>
          <div className="w-full max-w-2xl bg-gray-900/60 p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl mb-8">
            <div className="flex flex-col gap-5">
              <input type="text" placeholder="ชื่อผู้เล่น#แท็ก (เช่น Jett#TH1)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyPress} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-6 py-4 text-white text-xl md:text-2xl text-center focus:border-red-500" spellCheck="false" />
              <button onClick={() => fetchStats(filterMode, true)} disabled={loading} className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl w-full text-lg shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                {loading ? "กำลังสแกนและดึงข้อมูล..." : "ค้นหาประวัติการแข่งขัน"}
              </button>
            </div>
          </div>
          {errorMsg && <div className="text-red-400 font-bold bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/50">⚠️ {errorMsg}</div>}
        </div>
      )}

      {/* 📜 ส่วนแสดงเนื้อหา (Layout 2 คอลัมน์) */}
      {hasData && (
        <div className="flex-1 w-full max-w-7xl mx-auto py-8 px-5 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* 📊 แผงด้านซ้าย (Sidebar) - ลบคำสั่งล็อกตำแหน่งออกแล้ว เพื่อให้เลื่อนตามหน้าเว็บหลักพร้อมกันอย่างเป็นธรรมชาติ 📊 */}
          <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col gap-5">
            {/* 🌟 RANK CARD 🌟 */}
            {playerData.rank && (
              <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in relative overflow-hidden mb-5">
                {/* แสงตกแต่งมุมขวาบนให้ดูพรีเมียม */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full"></div>
                
                <h3 className="text-white text-base font-black tracking-widest uppercase mb-4 flex items-center gap-2 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  COMPETITIVE RANK
                </h3>
                
                <div className="flex items-center justify-between relative z-10 mt-2">
                  {/* แรงค์ปัจจุบัน */}
                  <div className="flex flex-col items-center w-1/2 border-r border-gray-800 px-2">
                    <span className="text-[10px] text-gray-500 font-bold mb-3 tracking-widest uppercase">ปัจจุบัน (Current)</span>
                    
                    <div className="h-14 flex items-center justify-center mb-3">
                      {rankImages[String(playerData.rank.peak || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"] ? (
                        <img 
                          src={rankImages[String(playerData.rank.peak || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"]} 
                          alt={playerData.rank.peak || "Unranked"} 
                          className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,200,87,0.2)] scale-110" 
                        />
                      ) : (
                        <span className="text-xs text-gray-500">No Icon</span>
                      )}
                    </div>
                    
                    <span className="text-sm font-black text-white uppercase text-center leading-tight drop-shadow-md">
                      {playerData.rank.current}
                    </span>
                  </div>
                  
                  {/* แรงค์สูงสุด */}
                  <div className="flex flex-col items-center w-1/2 px-2">
                    <span className="text-[10px] text-gray-500 font-bold mb-3 tracking-widest uppercase">สูงสุด (Peak)</span>
                    
                    <div className="h-14 flex items-center justify-center mb-3">
                      {rankImages[playerData.rank.peak.toLowerCase().replace(/\s/g, '')] || rankImages["unranked"] ? (
                        <img 
                          src={rankImages[playerData.rank.peak.toLowerCase().replace(/\s/g, '')] || rankImages["unranked"]} 
                          alt={playerData.rank.peak} 
                          className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,200,87,0.2)] scale-110" 
                        />
                      ) : (
                        <span className="text-xs text-gray-500">No Icon</span>
                      )}
                    </div>

                    <span className="text-sm font-black text-[#ffc857] uppercase text-center leading-tight drop-shadow-md">
                      {playerData.rank.peak}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* OVERALL SUMMARY */}
            {overallStats && (
              <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in">
                <h3 className="text-white text-base font-black tracking-widest uppercase mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">📈</span> OVERALL SUMMARY
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/40 border border-gray-800/60 p-3 rounded-xl text-center">
                    <p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">Win Rate</p>
                    <p className="text-2xl font-black text-green-400 mt-1">{overallStats.winRate.toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-400 mt-1">{overallStats.wins}W - {overallStats.losses}L</p>
                  </div>
                  <div className="bg-gray-900/40 border border-gray-800/60 p-3 rounded-xl text-center">
                    <p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">KDA Ratio</p>
                    <p className="text-2xl font-black text-white mt-1">{overallStats.kdaRatio}</p>
                    <p className="text-[10px] font-mono text-blue-400 mt-1">{overallStats.totalKills}/{overallStats.totalDeaths}/{overallStats.totalAssists}</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 text-center font-bold tracking-widest uppercase mt-4">
                  Calculated from last {overallStats.totalMatches} matches
                </p>
              </div>
            )}

            {/* ROLES PERFORMANCE */}
            <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in">
              <h3 className="text-white text-base font-black tracking-widest uppercase mb-4 flex items-center gap-2">
                <span className="text-red-500">🎯</span> ROLES PERFORMANCE
              </h3>
              
              <div className="flex flex-col gap-3">
                {roleStatsArray.length > 0 ? roleStatsArray.map((role, idx) => {
                  const winRate = role.matches > 0 ? ((role.w / role.matches) * 100) : 0;
                  const kda = role.death > 0 ? ((role.k + role.a) / role.death).toFixed(2) : (role.k + role.a).toFixed(2);
                  const circumference = 125.6; 
                  const dashOffset = circumference - (winRate / 100) * circumference;

                  return (
                    <div key={idx} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-gray-800/60 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex items-center justify-center bg-gray-950 rounded-full shadow-inner">
                          <svg className="absolute top-0 left-0 w-full h-full -rotate-90 transform">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-800" />
                            <circle 
                              cx="24" cy="24" r="20" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              fill="none" 
                              className="text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)] transition-all duration-1000" 
                              strokeDasharray={circumference}
                              strokeDashoffset={dashOffset}
                              strokeLinecap="round"
                            />
                          </svg>
                          {roleIcons[role.name] ? (
                            <img src={roleIcons[role.name]} className="w-5 h-5 opacity-90" alt={role.name} />
                          ) : (
                            <span className="text-[10px] text-gray-500 font-bold">{role.name.substring(0,2)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-white font-bold text-sm leading-none">{role.name}</p>
                          <p className="text-xs text-gray-300 font-bold mt-1.5">WR {winRate.toFixed(1)}%</p>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">{role.w}W - {role.l}L</p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-center">
                        <p className="text-white font-black text-sm">KDA {kda}</p>
                        <p className="text-[10px] font-mono text-blue-400 mt-1">
                          {role.k}<span className="text-gray-600">/</span><span className="text-red-400">{role.death}</span><span className="text-gray-600">/</span>{role.a}
                        </p>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center text-gray-600 py-4 text-xs border border-dashed border-gray-800 rounded-xl">ไม่พบข้อมูลสายการเล่น</div>
                )}
              </div>
            </div>

          </div>

          {/* 📊 แผงด้านขวา (เนื้อหาหลัก) */}
          <div className="flex-1 w-full min-w-0 flex flex-col">
            {activeTab === "overview" && (
              <div className="w-full space-y-4 animate-fade-in pb-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-gray-800 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-300">ประวัติการเล่นของ <span className="text-red-400 font-extrabold">{searchQuery.split('#')[0]}</span></h2>
                    <p className="text-xs text-gray-500 mt-1">คลิกที่การ์ดเพื่อเปิดดูตาราง Scoreboard เต็มรูปแบบ</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:block">Mode:</label>
                    <select value={filterMode} onChange={handleModeChange} disabled={loading} className="bg-gray-900 text-gray-200 font-bold text-sm px-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500">
                      {VALORANT_MODES.map(mode => ( <option key={mode.id} value={mode.id}>{mode.name}</option> ))}
                    </select>
                    {loading && <span className="absolute -right-8 top-2.5 animate-spin text-red-500 text-xl">↻</span>}
                  </div>
                </div>

                {displayedMatches.length === 0 && (
                  <div className="text-center py-10 text-gray-500 border border-dashed border-gray-800 rounded-2xl">ไม่พบประวัติการเล่นในโหมดที่คุณเลือก</div>
                )}

                <div className={loading ? 'opacity-30 pointer-events-none' : 'opacity-100 space-y-4'}>
                  {displayedMatches.map((match, index) => {
                    return (
                      <div key={match.match_id || index} onClick={() => setSelectedMatch(match)} className="bg-gray-900 border border-gray-800/80 p-4 sm:p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-12 items-center gap-4 shadow-lg hover:border-red-500/50 hover:bg-gray-900/80 cursor-pointer transition-all tabular-nums">
                        <div className="col-span-1 sm:col-span-5 flex items-center gap-4 sm:gap-5 w-full">
                          <div className="flex flex-col items-center justify-center bg-gray-950/80 p-2 rounded-xl border border-gray-800 min-w-[80px]">
                            {agentImages[match.agent] ? ( <img src={agentImages[match.agent]} alt={match.agent} className="w-12 h-12 object-contain" /> ) : ( <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-full text-xs font-bold border border-gray-700">{String(match.agent || "UN").substring(0, 2).toUpperCase()}</div> )}
                            <span className="font-extrabold text-[11px] text-gray-400 mt-1 uppercase tracking-wider">{match.agent}</span>
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-black text-white text-lg tracking-wide truncate">{match.map}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-block bg-gray-800 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-700">{match.mode}</span>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-1 sm:col-span-4 flex flex-col items-center justify-center bg-gray-950/50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                          <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-widest uppercase">K / D / A</p>
                          <div className="font-black text-lg text-gray-200 flex items-center justify-center">
                            <span className="text-green-400 w-8 text-right">{match.raw_stats.kills}</span>
                            <span className="text-gray-700 mx-2">/</span>
                            <span className="text-red-500 w-8 text-center">{match.raw_stats.deaths}</span>
                            <span className="text-gray-700 mx-2">/</span>
                            <span className="text-blue-400 w-8 text-left">{match.raw_stats.assists}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Ratio: <span className="text-gray-200 font-bold">{Number(match.analysis.kda_ratio).toFixed(2)}</span></p>
                        </div>

                        <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-end items-center gap-5 w-full">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Score</p>
                            <p className="text-sm font-black text-gray-200 w-16">{match.analysis.performance_score}<span className="text-gray-600 text-[10px]">/100</span></p>
                          </div>
                          <div className="bg-gray-950 w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-700 shadow-inner flex-shrink-0">
                            <span className="text-2xl font-black text-yellow-400 drop-shadow-md">{match.analysis.grade.split(" ")[0]}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === "agents" && (
              <div className="w-full space-y-6 animate-fade-in pb-10">
                <div className="border-b border-gray-800 pb-4">
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <span className="text-red-500">🕵️‍♂️</span> AGENT ANALYTICS
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">สถิติการเล่นแยกตามเอเจนต์ของคุณ (จัดเรียงตามความถี่ที่เล่นบ่อยสุด)</p>
                </div>

                {agentStatsArray.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {agentStatsArray.map((agent, idx) => {
                      const winRate = agent.matches > 0 ? ((agent.w / agent.matches) * 100) : 0;
                      const kda = agent.death > 0 ? ((agent.k + agent.a) / agent.death).toFixed(2) : (agent.k + agent.a).toFixed(2);
                      
                      return (
                        <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-red-500/50 transition-colors relative overflow-hidden group shadow-lg">
                          {/* เอฟเฟกต์ลายน้ำรูปตัวละครด้านหลัง */}
                          <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-20 transition-opacity">
                            {agentImages[agent.name] && <img src={agentImages[agent.name]} alt="bg" className="w-32 h-32 object-cover scale-150" />}
                          </div>
                          
                          <div className="flex items-center gap-4 relative z-10 mb-4">
                            <div className="w-16 h-16 bg-gray-950 rounded-xl border border-gray-700 p-1 flex-shrink-0">
                              {agentImages[agent.name] ? (
                                <img src={agentImages[agent.name]} alt={agent.name} className="w-full h-full object-contain drop-shadow-md" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                                  {String(agent.name || "UN").substring(0,2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-white uppercase tracking-wider">{agent.name}</h3>
                              <p className="text-xs text-gray-400 font-bold">{agentRoles[agent.name] || 'Unknown Role'}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 relative z-10">
                            <div className="bg-gray-950/50 p-2 rounded-lg border border-gray-800 text-center">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Win Rate</p>
                              <p className={`text-lg font-black ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{winRate.toFixed(1)}%</p>
                              <p className="text-[10px] text-gray-400">{agent.w}W - {agent.l}L</p>
                            </div>
                            <div className="bg-gray-950/50 p-2 rounded-lg border border-gray-800 text-center">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">KDA</p>
                              <p className="text-lg font-black text-white">{kda}</p>
                              <p className="text-[10px] font-mono text-gray-400">{agent.k}/{agent.death}/{agent.a}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500 border border-dashed border-gray-800 rounded-2xl">ไม่พบข้อมูลเอเจนต์ในโหมดนี้</div>
                )}
              </div>
            )}
            {activeTab === "maps" && (
              <div className="w-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/30">
                <span className="text-5xl mb-4">🗺️</span>
                <h2 className="text-2xl font-black text-white mb-2">Map Win Rates</h2>
                <p className="text-gray-500">ระบบวิเคราะห์อัตราชนะตามแผนที่ต่างๆ (กำลังอยู่ระหว่างการพัฒนา)</p>
              </div>
            )}
          </div>
           
        </div>
        
      )}
      {/* 📜 FOOTER - ประกาศลิขสิทธิ์ตามกฎของ Riot Games 📜 */}
      {hasData && (
        <footer className="w-full bg-gray-950 border-t border-gray-900 py-6 mt-8 text-center px-4">
          <p className="text-gray-500 text-[10px] md:text-xs max-w-4xl mx-auto leading-relaxed">
            This project is a non-commercial, fan-made application. VALORANT STATS isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
          </p>
        </footer>
      )}

      {/* 🔥 🔥 FULL SCOREBOARD MODAL POP-UP 🔥 🔥 */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 animate-fade-in" onClick={() => setSelectedMatch(null)}>
          <div className="bg-[#0f1923] border border-gray-700 rounded-xl max-w-[1400px] w-[95vw] max-h-[96vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedMatch(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors font-bold text-2xl z-10">✕</button>

            {['competitive', 'unrated'].includes(selectedMatch.mode.toLowerCase()) ? (
              <>
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-800 pb-5 mb-5 gap-4 px-2 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-widest leading-tight">{selectedMatch.map}</h2>
                      <p className="text-sm md:text-base text-gray-400 font-medium">{selectedMatch.mode} • {selectedMatch.rounds_played} Rounds Played</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-900/60 px-6 py-2.5 rounded-lg border border-gray-800/80">
                    <span className="text-sm font-bold text-red-500/80 mr-1 uppercase">Team A</span>
                    <span className="text-3xl font-black text-red-400 tabular-nums">{selectedMatch.teams.red}</span>
                    <span className="text-xl font-bold text-gray-600 mx-2">:</span>
                    <span className="text-3xl font-black text-blue-400 tabular-nums">{selectedMatch.teams.blue}</span>
                    <span className="text-sm font-bold text-blue-500/80 ml-1 uppercase">Team B</span>
                  </div>
                </div>

                {/* 🌟 อัปเกรด Timeline ให้เหมือนตัวเกมเป๊ะๆ (ไม่มีกรอบ, เป็นจุดเล็กๆ) 🌟 */}
                {selectedMatch.round_history && selectedMatch.round_history.length > 0 && (
                  <div className="w-full bg-[#111823] border border-gray-800/80 rounded-xl p-4 sm:p-5 mb-6">
                    <div className="flex flex-col gap-3">
                      
                      {/* Team B Row (ฝั่งสีฟ้า) */}
                      <div className="flex items-center w-full">
                        <div className="w-24 md:w-28 text-sm font-bold text-blue-400 flex justify-between items-center pr-4 border-r border-gray-700">
                          <span className="uppercase tracking-wide">Team B</span>
                          <span className="text-2xl font-black tabular-nums">{selectedMatch.teams.blue}</span>
                        </div>
                        <div className="flex flex-1 gap-1.5 md:gap-2 ml-4">
                          {selectedMatch.round_history.map(r => (
                            <div key={r.round_num} className="flex-1 flex justify-center items-center h-8">
                              {r.winning_team === 'Blue' 
                                ? <span className="text-teal-400 font-black drop-shadow-[0_0_5px_rgba(45,212,191,0.4)]">{getRoundIcon(r.end_type)}</span> 
                                : <span className="w-1.5 h-1.5 rounded-full bg-gray-600/50"></span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Team A Row (ฝั่งสีแดง) */}
                      <div className="flex items-center w-full">
                        <div className="w-24 md:w-28 text-sm font-bold text-red-400 flex justify-between items-center pr-4 border-r border-gray-700">
                          <span className="uppercase tracking-wide">Team A</span>
                          <span className="text-2xl font-black tabular-nums">{selectedMatch.teams.red}</span>
                        </div>
                        <div className="flex flex-1 gap-1.5 md:gap-2 ml-4">
                          {selectedMatch.round_history.map(r => (
                            <div key={r.round_num} className="flex-1 flex justify-center items-center h-8">
                              {r.winning_team === 'Red' 
                                ? <span className="text-[#ff4655] font-black drop-shadow-[0_0_5px_rgba(255,70,85,0.4)]">{getRoundIcon(r.end_type)}</span> 
                                : <span className="w-1.5 h-1.5 rounded-full bg-gray-600/50"></span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Round Numbers Row (ตัวเลขบอกรอบด้านล่าง) */}
                      <div className="flex items-center mt-1 w-full">
                        <div className="w-24 md:w-28 pr-4 border-r border-transparent"></div>
                        <div className="flex flex-1 gap-1.5 md:gap-2 ml-4">
                          {selectedMatch.round_history.map(r => (
                            <div key={r.round_num} className="flex-1 text-center text-[10px] md:text-xs font-bold text-gray-500 tabular-nums">
                              {r.round_num}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {renderTeamTable("Team Blue", selectedMatch.scoreboard?.filter(p => p.team === 'Blue'), "border-blue-500/40", "bg-blue-950/20", searchQuery.split('#')[0], selectedMatch.mode)}
                  {renderTeamTable("Team Red", selectedMatch.scoreboard?.filter(p => p.team === 'Red'), "border-red-500/40", "bg-red-950/20", searchQuery.split('#')[0], selectedMatch.mode)}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-800 pb-5 mb-5 gap-4 px-2 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-widest leading-tight">{selectedMatch.map}</h2>
                      <p className="text-sm md:text-base text-gray-400 font-medium">{selectedMatch.mode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Match ID</p>
                    <p className="text-sm md:text-base font-mono text-gray-400">{selectedMatch.match_id.split('-')[0]}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {renderUnifiedTable(selectedMatch.scoreboard, searchQuery.split('#')[0], selectedMatch.mode)}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App