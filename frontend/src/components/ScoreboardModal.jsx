import { useState, Fragment } from 'react';
import { analyzeMatchSides } from '../utils/helpers';

export default function ScoreboardModal({ 
  selectedMatch, 
  onClose, 
  targetPlayerName = '', 
  agentImages = {}, 
  rankImages = {}, 
  mapDetails = {},
  agentRoles = {},
  roleIcons = {}
}) {
  const [viewMode, setViewMode] = useState('team'); // 'team' or 'leaderboard'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });

  if (!selectedMatch) return null;

  const targetName = (targetPlayerName || '').toLowerCase();
  const scoreboard = selectedMatch.scoreboard || [];
  const myPlayerInMatch = scoreboard.find(p => String(p.name || '').toLowerCase() === targetName);
  const myTeam = myPlayerInMatch ? myPlayerInMatch.team : 'Blue';
  const otherTeam = myTeam === 'Blue' ? 'Red' : 'Blue';

  const sidesAnalysis = analyzeMatchSides(selectedMatch, targetPlayerName);

  const myTeamScore = selectedMatch.teams?.[myTeam.toLowerCase()] ?? 0;
  const otherTeamScore = selectedMatch.teams?.[otherTeam.toLowerCase()] ?? 0;
  const isCompetitiveOrUnrated = ['competitive', 'unrated', 'swiftplay', 'spikerush'].includes(
    String(selectedMatch.mode || '').toLowerCase()
  );

  const isDraw = myTeamScore === otherTeamScore;
  const isWin = !isDraw && myTeamScore > otherTeamScore;
  const isLoss = !isDraw && myTeamScore < otherTeamScore;

  // ข้อมูลแผนที่ (Splash Art)
  const mapName = selectedMatch.map || 'Unknown Map';
  const mapSplash = mapDetails[mapName.toLowerCase()]?.splash;

  // คำนวณผู้เล่นที่ทำคะแนนสูงสุด (Match MVP) และผู้เล่นสูงสุดของแต่ละทีม (Team MVP)
  const sortedByAcsAll = [...scoreboard].sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0));
  const matchMvpPlayer = sortedByAcsAll[0];

  const myTeamPlayers = scoreboard.filter(p => p.team === myTeam);
  const otherTeamPlayers = scoreboard.filter(p => p.team === otherTeam);

  const myTeamMvp = [...myTeamPlayers].sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0))[0];
  const otherTeamMvp = [...otherTeamPlayers].sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0))[0];

  // คำนวณ Match Highlights
  const highestHsPlayer = [...scoreboard].sort((a, b) => (b.stats?.hs_percent || 0) - (a.stats?.hs_percent || 0))[0];
  const highestAdrPlayer = [...scoreboard].sort((a, b) => (b.stats?.adr || 0) - (a.stats?.adr || 0))[0];
  const mostAssistsPlayer = [...scoreboard].sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0))[0];
  const maxAcsInMatch = matchMvpPlayer?.stats?.acs || 1;

  // จัดการการเรียงลำดับ (Sorting)
  const handleSort = (key) => {
    setSortConfig(current => {
      if (current.key === key) {
        if (current.direction === 'default') return { key, direction: 'asc' };
        if (current.direction === 'asc') return { key, direction: 'desc' };
        return { key: null, direction: 'default' };
      }
      return { key, direction: 'desc' }; // ค่าสถิติเริ่มจากมากไปน้อย
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key || sortConfig.direction === 'default') {
      return <span className="inline-block ml-1 text-gray-500 text-[10px] select-none font-normal">↕</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="inline-block ml-1 text-yellow-400 text-[11px] font-black select-none">↑</span> 
      : <span className="inline-block ml-1 text-yellow-400 text-[11px] font-black select-none">↓</span>;
  };

  // ฟังก์ชัน Sort ข้อมูลผู้เล่น
  const sortPlayers = (players) => {
    if (!sortConfig.key || sortConfig.direction === 'default') {
      return [...players].sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0));
    }
    return [...players].sort((a, b) => {
      let valA = Number(a.stats?.[sortConfig.key] || 0);
      let valB = Number(b.stats?.[sortConfig.key] || 0);
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    });
  };

  // ไอคอนประเภทการจบรอบ (Official Valorant Icons)
  const getRoundTypeIcon = (endType) => {
    const iconClass = "w-4 h-4 md:w-5 md:h-5 drop-shadow";
    switch (endType) {
      case 'Eliminated':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path 
              fillRule="evenodd" 
              d="M12 2.2L17.5 4.5 19.5 9.5 18 14.5 17 15l.8 5.5H6.2L7 15l-1-.5-1.5-5 2-5L12 2.2z M8.5 10.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z M15.5 10.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z M10.8 14.2l1.2 1.8 1.2-1.8H10.8z M9.5 17.5h1.2v2.2H9.5z M13.3 17.5h1.2v2.2h-1.2z" 
            />
          </svg>
        );
      case 'Bomb defused':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.5L7 11.5l5 9 5-9L12 2.5z" fill="currentColor" fillOpacity="0.25" />
            <path d="M12 2.5v18" strokeDasharray="1 1" />
            <path d="M4 8.5l4 3.5-4 3.5" strokeWidth="2" />
            <path d="M20 8.5l-4 3.5 4 3.5" strokeWidth="2" />
            <circle cx="12" cy="12" r="1.8" fill="currentColor" />
          </svg>
        );
      case 'Bomb detonated':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5.5l-3.5 6 3.5 6 3.5-6-3.5-6z" fill="currentColor" />
            <line x1="12" y1="1.5" x2="12" y2="3.5" />
            <line x1="12" y1="19.5" x2="12" y2="22.5" />
            <line x1="2" y1="11.5" x2="4.5" y2="11.5" />
            <line x1="19.5" y1="11.5" x2="22" y2="11.5" />
            <line x1="4.5" y1="4.5" x2="6.5" y2="6.5" />
            <line x1="17.5" y1="16.5" x2="19.5" y2="18.5" />
            <line x1="19.5" y1="4.5" x2="17.5" y2="6.5" />
            <line x1="6.5" y1="16.5" x2="4.5" y2="18.5" />
          </svg>
        );
      case 'Time out':
      default:
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 1.5" />
            <path d="M9.5 2h5" />
            <path d="M12 2v3" />
          </svg>
        );
    }
  };

  const getRoundDescription = (round) => {
    const winnerName = round.winning_team === myTeam ? 'ทีมเรา (Your Team)' : 'ทีมคู่แข่ง (Enemy)';
    const typeMap = {
      'Eliminated': 'กำจัดศัตรูหมดทีม (Elimination)',
      'Bomb defused': 'กู้สไปก์สำเร็จ (Defused)',
      'Bomb detonated': 'สไปก์ระเบิดสำเร็จ (Detonated)',
      'Time out': 'หมดเวลาการแข่งขัน (Time Out)'
    };
    return `รอบที่ ${round.round_num}: ชนะโดย ${winnerName} • ${typeMap[round.end_type] || round.end_type}`;
  };

  // วาดตารางผู้เล่น
  const renderPlayerTable = (players, title, titleColor, borderColor, bgColor) => {
    const sorted = sortPlayers(players);
    const showRank = String(selectedMatch.mode || '').toLowerCase() === 'competitive';

    return (
      <div className={`rounded-2xl border ${borderColor} overflow-hidden shadow-xl mb-4`}>
        {/* หัวทีม */}
        {title && (
          <div className={`${bgColor} px-4 py-3 flex items-center justify-between border-b ${borderColor}`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${titleColor.replace('text-', 'bg-')}`}></span>
              <h4 className={`text-sm font-black uppercase tracking-wider ${titleColor}`}>{title}</h4>
            </div>
            <span className="text-xs text-gray-400 font-bold">{players.length} Players</span>
          </div>
        )}

        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left border-collapse min-w-[950px] tabular-nums">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 bg-gray-950/70 border-b border-gray-800">
                <th className="py-3 px-4 w-16 text-center">Agent</th>
                <th className="py-3 px-4 w-[280px]">Player</th>
                {showRank && <th className="py-3 px-3 text-center w-20">Rank</th>}
                <th 
                  onClick={() => handleSort('acs')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-white transition-colors select-none w-28"
                  title="Average Combat Score"
                >
                  ACS{renderSortIcon('acs')}
                </th>
                <th 
                  onClick={() => handleSort('kills')}
                  className="py-3 px-2.5 text-center cursor-pointer hover:text-white transition-colors select-none w-14"
                  title="Kills"
                >
                  K{renderSortIcon('kills')}
                </th>
                <th 
                  onClick={() => handleSort('deaths')}
                  className="py-3 px-2.5 text-center cursor-pointer hover:text-white transition-colors select-none w-14"
                  title="Deaths"
                >
                  D{renderSortIcon('deaths')}
                </th>
                <th 
                  onClick={() => handleSort('assists')}
                  className="py-3 px-2.5 text-center cursor-pointer hover:text-white transition-colors select-none w-14"
                  title="Assists"
                >
                  A{renderSortIcon('assists')}
                </th>
                <th 
                  onClick={() => handleSort('kd')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-white transition-colors select-none w-20"
                  title="Kill / Death Ratio"
                >
                  K/D{renderSortIcon('kd')}
                </th>
                <th 
                  onClick={() => handleSort('adr')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-white transition-colors select-none w-20"
                  title="Average Damage per Round"
                >
                  ADR{renderSortIcon('adr')}
                </th>
                <th 
                  onClick={() => handleSort('hs_percent')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-white transition-colors select-none w-20"
                  title="Headshot %"
                >
                  HS%{renderSortIcon('hs_percent')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 bg-gray-950/40">
              {sorted.map((player, idx) => {
                const isMe = String(player.name || '').toLowerCase() === targetName;
                const isMatchMvp = matchMvpPlayer && String(matchMvpPlayer.name || '').toLowerCase() === String(player.name || '').toLowerCase();
                const isTeamMvp = !isMatchMvp && (
                  (player.team === myTeam && myTeamMvp && String(myTeamMvp.name || '').toLowerCase() === String(player.name || '').toLowerCase()) ||
                  (player.team === otherTeam && otherTeamMvp && String(otherTeamMvp.name || '').toLowerCase() === String(player.name || '').toLowerCase())
                );

                const kdRatio = Number(player.stats?.kd || 0);
                const kdColor = kdRatio >= 1.0 ? 'text-green-400' : 'text-red-400';
                const rawRank = player.rank || 'Unranked';
                const rankKey = String(rawRank).toLowerCase().replace(/\s/g, '');
                const rankIcon = rankImages[rankKey] || rankImages['unranked'];
                const roleName = agentRoles[player.agent];
                const roleIcon = roleIcons[roleName];

                const acsVal = Number(player.stats?.acs || 0);
                const acsPercent = Math.min(100, Math.round((acsVal / maxAcsInMatch) * 100));

                return (
                  <tr 
                    key={player.name + idx}
                    className={`transition-colors ${
                      isMe 
                        ? 'bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-amber-400 shadow-[inset_0_0_15px_rgba(245,158,11,0.05)]' 
                        : 'hover:bg-gray-800/30 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Agent Avatar + Role */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="relative inline-block">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl border border-gray-700/80 p-0.5 flex items-center justify-center shadow-inner">
                          {agentImages[player.agent] ? (
                            <img src={agentImages[player.agent]} alt={player.agent} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500">{String(player.agent || 'UN').substring(0, 2)}</span>
                          )}
                        </div>
                        {roleIcon && (
                          <div 
                            title={roleName}
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-950 rounded-full border border-gray-700 p-0.5 flex items-center justify-center"
                          >
                            <img src={roleIcon} alt={roleName} className="w-full h-full object-contain opacity-80" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Player Name + Tag + MVP Badge */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-sm md:text-base tracking-wide truncate max-w-[150px] ${
                          isMe ? 'text-amber-400 font-black' : 'text-gray-200'
                        }`}>
                          {player.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">#{player.tag || '000'}</span>

                        {isMe && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                            YOU
                          </span>
                        )}

                        {isMatchMvp && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 uppercase shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse">
                            👑 MATCH MVP
                          </span>
                        )}

                        {isTeamMvp && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
                            ⭐ TEAM MVP
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rank */}
                    {showRank && (
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex justify-center items-center">
                          {rankIcon ? (
                            <img src={rankIcon} alt={rawRank} title={rawRank} className="w-7 h-7 object-contain drop-shadow" />
                          ) : (
                            <span className="text-[10px] font-medium text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800 whitespace-nowrap">
                              {rawRank}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* ACS with Mini Visual Bar */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-black text-gray-200 text-sm md:text-base">{acsVal}</span>
                        <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full ${isMe ? 'bg-amber-400' : 'bg-red-500/80'}`}
                            style={{ width: `${acsPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* K / D / A */}
                    <td className="py-2.5 px-2.5 text-center font-black text-green-400 text-sm md:text-base">{player.stats?.kills || 0}</td>
                    <td className="py-2.5 px-2.5 text-center font-black text-red-400 text-sm md:text-base">{player.stats?.deaths || 0}</td>
                    <td className="py-2.5 px-2.5 text-center font-black text-blue-400 text-sm md:text-base">{player.stats?.assists || 0}</td>

                    {/* K/D Ratio */}
                    <td className={`py-2.5 px-3 text-center font-bold text-sm md:text-base ${kdColor}`}>
                      {kdRatio.toFixed(2)}
                    </td>

                    {/* ADR */}
                    <td className="py-2.5 px-3 text-center font-bold text-gray-300 text-sm md:text-base">
                      {player.stats?.adr || 0}
                    </td>

                    {/* HS% */}
                    <td className="py-2.5 px-3 text-center font-bold text-gray-300 text-sm md:text-base">
                      {player.stats?.hs_percent || 0}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#0b1018] border border-gray-700/80 rounded-3xl max-w-[1380px] w-full max-h-[95vh] overflow-y-auto shadow-2xl relative flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🖼️ HERO HEADER WITH MAP SPLASH ART */}
        <div className="relative overflow-hidden rounded-t-3xl border-b border-gray-800 p-6 md:p-8">
          {/* Splash Background */}
          {mapSplash && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img 
                src={mapSplash} 
                alt={mapName} 
                className="w-full h-full object-cover object-center opacity-15 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1018] via-[#0b1018]/85 to-[#0b1018]/60"></div>
            </div>
          )}

          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-900/80 border border-gray-700/80 text-gray-400 hover:text-white hover:border-red-500 flex items-center justify-center transition-all z-20 shadow-lg text-lg font-bold"
            title="ปิดหน้าต่าง (Close)"
          >
            ✕
          </button>

          {/* Header Content */}
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* ซีกซ้าย: ผลการแข่งขัน + ชื่อด่าน */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                {isCompetitiveOrUnrated ? (
                  isWin ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-black text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                      <span>🏆 VICTORY</span>
                    </div>
                  ) : isLoss ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-black text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <span>💀 DEFEAT</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-500/20 border border-gray-500/40 text-gray-300 font-black text-sm uppercase tracking-widest">
                      <span>⚖️ DRAW</span>
                    </div>
                  )
                ) : null}

                <span className="text-xs text-gray-400 font-bold px-2.5 py-1 rounded-lg bg-gray-900/90 border border-gray-800 uppercase tracking-wider">
                  {selectedMatch.mode || 'Unknown Mode'}
                </span>
                {selectedMatch.rounds_played ? (
                  <span className="text-xs text-gray-400 font-medium">
                    {selectedMatch.rounds_played} Rounds
                  </span>
                ) : null}
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider mt-1 drop-shadow-md">
                <span className="text-red-500 mr-2 font-light">MAP :</span>
                {mapName}
              </h2>
            </div>

            {/* ซีกขวา: กล่องแสดงสกอร์ 13 : 10 ใหญ่สะใจ */}
            {isCompetitiveOrUnrated && (
              <div className="flex items-center gap-4 sm:gap-6 bg-gray-950/80 px-6 sm:px-8 py-3.5 rounded-2xl border border-gray-800/90 shadow-xl backdrop-blur-sm">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {myTeam === 'Blue' ? 'Team Blue' : 'Team Red'} (YOU)
                  </p>
                  <p className={`text-3xl sm:text-4xl font-black tabular-nums ${isWin ? 'text-green-400' : 'text-gray-200'}`}>
                    {myTeamScore}
                  </p>
                </div>

                <span className="text-2xl font-light text-gray-600">:</span>

                <div className="text-left">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {otherTeam === 'Blue' ? 'Team Blue' : 'Team Red'} (ENEMY)
                  </p>
                  <p className={`text-3xl sm:text-4xl font-black tabular-nums ${isLoss ? 'text-red-400' : 'text-gray-200'}`}>
                    {otherTeamScore}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🌟 MATCH HIGHLIGHTS RIBBON (ผู้เล่นเด่นประจำห้อง) 🌟 */}
        {scoreboard.length > 0 && (
          <div className="px-6 md:px-8 pt-5 pb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Match MVP */}
              {matchMvpPlayer && (
                <div className="bg-gray-950/60 border border-yellow-500/30 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl border border-yellow-500/40 p-0.5 flex-shrink-0 flex items-center justify-center">
                    {agentImages[matchMvpPlayer.agent] ? (
                      <img src={agentImages[matchMvpPlayer.agent]} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-yellow-400">👑</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-yellow-400 font-black uppercase">👑 Match MVP</p>
                    <p className="text-xs font-black text-white truncate">{matchMvpPlayer.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{matchMvpPlayer.stats?.acs} ACS • {matchMvpPlayer.stats?.kills} K</p>
                  </div>
                </div>
              )}

              {/* Headshot King */}
              {highestHsPlayer && (
                <div className="bg-gray-950/60 border border-blue-500/30 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl border border-blue-500/40 p-0.5 flex-shrink-0 flex items-center justify-center text-lg">
                    🎯
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-blue-400 font-black uppercase">🎯 Headshot King</p>
                    <p className="text-xs font-black text-white truncate">{highestHsPlayer.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{highestHsPlayer.stats?.hs_percent}% HS</p>
                  </div>
                </div>
              )}

              {/* Damage Leader */}
              {highestAdrPlayer && (
                <div className="bg-gray-950/60 border border-red-500/30 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl border border-red-500/40 p-0.5 flex-shrink-0 flex items-center justify-center text-lg">
                    💥
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-red-400 font-black uppercase">💥 Damage Leader</p>
                    <p className="text-xs font-black text-white truncate">{highestAdrPlayer.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{highestAdrPlayer.stats?.adr} ADR</p>
                  </div>
                </div>
              )}

              {/* Most Assists */}
              {mostAssistsPlayer && (
                <div className="bg-gray-950/60 border border-teal-500/30 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl border border-teal-500/40 p-0.5 flex-shrink-0 flex items-center justify-center text-lg">
                    🤝
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-teal-400 font-black uppercase">🤝 Most Assists</p>
                    <p className="text-xs font-black text-white truncate">{mostAssistsPlayer.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{mostAssistsPlayer.stats?.assists} Assists</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ⏱️ ROUND HISTORY TIMELINE (ไทม์ไลน์ประวัติแต่ละรอบ) ⏱️ */}
        {selectedMatch.round_history && selectedMatch.round_history.length > 0 && (
          <div className="px-6 md:px-8 py-3">
            <div className="bg-gray-950/70 border border-gray-800/90 rounded-2xl p-4 sm:p-5 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <p className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⏱️</span> ROUND TIMELINE
                </p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${myTeam === 'Red' ? 'bg-red-500' : 'bg-cyan-400'}`}></span> 
                    {myTeam === 'Red' ? 'TEAM A (YOU)' : 'TEAM B (YOU)'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${otherTeam === 'Red' ? 'bg-red-500' : 'bg-cyan-400'}`}></span> 
                    {otherTeam === 'Red' ? 'TEAM A' : 'TEAM B'}
                  </span>
                  <span className="text-gray-500 hidden sm:inline">• เส้นคั่น = สลับฝั่ง (Half-Time)</span>
                </div>
              </div>

              {/* ⚔️ vs 🛡️ Side & Halftime Breakdown */}
              {sidesAnalysis && (() => {
                const halfTimeRound = sidesAnalysis.halfTimeRound || 12;
                const firstHalfRounds = selectedMatch.round_history.filter(r => r.round_num <= halfTimeRound);
                const secondHalfRounds = selectedMatch.round_history.filter(r => r.round_num > halfTimeRound);

                const my1stHalfScore = firstHalfRounds.filter(r => r.winning_team === myTeam).length;
                const enemy1stHalfScore = firstHalfRounds.filter(r => r.winning_team === otherTeam).length;

                const my2ndHalfScore = secondHalfRounds.filter(r => r.winning_team === myTeam).length;
                const enemy2ndHalfScore = secondHalfRounds.filter(r => r.winning_team === otherTeam).length;

                const firstHalfSide = sidesAnalysis.startingSide;
                const secondHalfSide = firstHalfSide === 'Attack' ? 'Defense' : 'Attack';

                return (
                  <div className="flex flex-wrap items-center gap-2 mb-3 pt-2 border-t border-gray-800/60">
                    <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-black flex items-center gap-1.5 ${
                      firstHalfSide === 'Attack' 
                        ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}>
                      <span>{firstHalfSide === 'Attack' ? '⚔️' : '🛡️'}</span>
                      <span>ครึ่งแรก: {firstHalfSide === 'Attack' ? 'บุก (ATTACK)' : 'รับ (DEFENSE)'}</span>
                      <span className="text-white font-mono ml-1">({my1stHalfScore} - {enemy1stHalfScore})</span>
                    </div>

                    <span className="text-gray-600 text-xs">➔</span>

                    <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-black flex items-center gap-1.5 ${
                      secondHalfSide === 'Attack' 
                        ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}>
                      <span>{secondHalfSide === 'Attack' ? '⚔️' : '🛡️'}</span>
                      <span>ครึ่งหลัง: {secondHalfSide === 'Attack' ? 'บุก (ATTACK)' : 'รับ (DEFENSE)'}</span>
                      <span className="text-white font-mono ml-1">({my2ndHalfScore} - {enemy2ndHalfScore})</span>
                    </div>

                    <span className="text-[10px] text-gray-400 ml-auto font-medium">
                      Atk WR: <strong className="text-red-400 font-bold">{sidesAnalysis.attack.winRate}%</strong> • Def WR: <strong className="text-cyan-400 font-bold">{sidesAnalysis.defense.winRate}%</strong>
                    </span>
                  </div>
                );
              })()}

              {/* แถวทีมเรา (You) */}
              <div className="flex items-center w-full my-1">
                <div className={`w-28 sm:w-32 text-xs font-bold ${myTeam === 'Red' ? 'text-red-400' : 'text-cyan-400'} flex justify-between items-center pr-3 border-r border-gray-800 flex-shrink-0`}>
                  <span className="uppercase truncate">{myTeam === 'Red' ? 'TEAM A (YOU)' : 'TEAM B (YOU)'}</span>
                  <span className="text-lg font-black tabular-nums">{myTeamScore}</span>
                </div>
                <div className="flex flex-1 items-center gap-1 sm:gap-1.5 ml-3 overflow-x-auto overflow-y-hidden py-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {selectedMatch.round_history.map(r => {
                    const isMyTeamWin = r.winning_team === myTeam;
                    const isPistol = r.round_num === 1 || r.round_num === 13;
                    const winBadgeClass = myTeam === 'Red'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]';

                    return (
                      <Fragment key={'my-' + r.round_num}>
                        <div className="flex-1 min-w-[22px]">
                          <div 
                            title={getRoundDescription(r)}
                            className={`w-full h-8 sm:h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:brightness-130 hover:border-white/70 hover:shadow-lg hover:-translate-y-0.5 duration-150 ${
                              isMyTeamWin 
                                ? winBadgeClass 
                                : 'bg-gray-900/40 text-gray-700'
                            } ${isPistol ? 'ring-1.5 ring-amber-500/50' : ''}`}
                          >
                            {isMyTeamWin ? (
                              getRoundTypeIcon(r.end_type)
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span>
                            )}
                          </div>
                        </div>
                        {r.round_num === 12 && (
                          <div className="w-[2px] bg-gray-600/80 mx-1 sm:mx-1.5 h-7 self-center flex-shrink-0 rounded-full" title="Half-Time (พักครึ่ง/สลับฝั่ง)"></div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              {/* แถวทีมคู่แข่ง (Enemy) */}
              <div className="flex items-center w-full my-1">
                <div className={`w-28 sm:w-32 text-xs font-bold ${otherTeam === 'Red' ? 'text-red-400' : 'text-cyan-400'} flex justify-between items-center pr-3 border-r border-gray-800 flex-shrink-0`}>
                  <span className="uppercase truncate">{otherTeam === 'Red' ? 'TEAM A' : 'TEAM B'}</span>
                  <span className="text-lg font-black tabular-nums">{otherTeamScore}</span>
                </div>
                <div className="flex flex-1 items-center gap-1 sm:gap-1.5 ml-3 overflow-x-auto overflow-y-hidden py-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {selectedMatch.round_history.map(r => {
                    const isEnemyWin = r.winning_team === otherTeam;
                    const isPistol = r.round_num === 1 || r.round_num === 13;
                    const winBadgeClass = otherTeam === 'Red'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]';

                    return (
                      <Fragment key={'enemy-' + r.round_num}>
                        <div className="flex-1 min-w-[22px]">
                          <div 
                            title={getRoundDescription(r)}
                            className={`w-full h-8 sm:h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:brightness-130 hover:border-white/70 hover:shadow-lg hover:-translate-y-0.5 duration-150 ${
                              isEnemyWin 
                                ? winBadgeClass 
                                : 'bg-gray-900/40 text-gray-700'
                            } ${isPistol ? 'ring-1.5 ring-amber-500/50' : ''}`}
                          >
                            {isEnemyWin ? (
                              getRoundTypeIcon(r.end_type)
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span>
                            )}
                          </div>
                        </div>
                        {r.round_num === 12 && (
                          <div className="w-[2px] bg-gray-600/80 mx-1 sm:mx-1.5 h-7 self-center flex-shrink-0 rounded-full" title="Half-Time (พักครึ่ง/สลับฝั่ง)"></div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ตัวเลขหมายเลขรอบ */}
              <div className="flex items-center w-full mt-2 pt-1 border-t border-gray-800/60">
                <div className="w-28 sm:w-32 pr-3 border-r border-transparent flex-shrink-0">
                  <span className="text-[10px] text-gray-600 uppercase font-bold">Round #</span>
                </div>
                <div className="flex flex-1 items-center gap-1 sm:gap-1.5 ml-3 overflow-x-auto overflow-y-hidden py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {selectedMatch.round_history.map(r => (
                    <Fragment key={'num-' + r.round_num}>
                      <div className="flex-1 min-w-[22px] text-center">
                        <span 
                          className={`inline-block text-[10px] font-bold tabular-nums ${
                            r.round_num === 1 || r.round_num === 13 ? 'text-amber-400 font-black' : 'text-gray-500'
                          }`}
                          title={r.round_num === 1 || r.round_num === 13 ? `Pistol Round ${r.round_num}` : undefined}
                        >
                          {r.round_num}
                        </span>
                      </div>
                      {r.round_num === 12 && (
                        <div className="w-[2px] bg-transparent mx-1 sm:mx-1.5 h-4 self-center flex-shrink-0"></div>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔘 VIEW TOGGLE (แบ่งทีม VS อันดับรวม) 🔘 */}
        {isCompetitiveOrUnrated && (
          <div className="px-6 md:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-gray-950/80 p-1.5 rounded-xl border border-gray-800">
              <button
                onClick={() => setViewMode('team')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'team'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                👥 แบ่งฝั่งทีม (Team View)
              </button>
              <button
                onClick={() => setViewMode('leaderboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'leaderboard'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🏆 ตารางรวม 10 คน (Leaderboard)
              </button>
            </div>

            <p className="text-[11px] text-gray-500 font-bold hidden sm:block">
              *คลิกหัวตาราง (ACS, K, D, A...) เพื่อเรียงลำดับ
            </p>
          </div>
        )}

        {/* 📋 SCOREBOARD TABLES 📋 */}
        <div className="p-6 md:p-8 pt-2">
          {viewMode === 'team' && isCompetitiveOrUnrated ? (
            <div className="flex flex-col gap-4">
              {/* ตารางทีมเรา (อยู่บนเสมอ) */}
              {renderPlayerTable(
                myTeamPlayers,
                `${myTeam === 'Blue' ? 'Team Blue' : 'Team Red'} (Your Team) • ${myTeamScore} Rounds Won`,
                myTeam === 'Blue' ? 'text-blue-400' : 'text-red-400',
                myTeam === 'Blue' ? 'border-blue-500/30' : 'border-red-500/30',
                myTeam === 'Blue' ? 'bg-blue-950/30' : 'bg-red-950/30'
              )}

              {/* ตารางทีมศัตรู */}
              {renderPlayerTable(
                otherTeamPlayers,
                `${otherTeam === 'Blue' ? 'Team Blue' : 'Team Red'} (Enemy Team) • ${otherTeamScore} Rounds Won`,
                otherTeam === 'Blue' ? 'text-blue-400' : 'text-red-400',
                otherTeam === 'Blue' ? 'border-blue-500/30' : 'border-red-500/30',
                otherTeam === 'Blue' ? 'bg-blue-950/30' : 'bg-red-950/30'
              )}
            </div>
          ) : (
            // ตารางรวมทุกลำดับ
            renderPlayerTable(
              scoreboard,
              'All Players Leaderboard (ตารางรวม 10 คน)',
              'text-gray-200',
              'border-gray-800',
              'bg-gray-900/40'
            )
          )}
        </div>
      </div>
    </div>
  );
}
