import TeamTable from './TeamTable';
import UnifiedTable from './UnifiedTable';

export default function ScoreboardModal({ selectedMatch, onClose, targetPlayerName, agentImages, rankImages, sortConfig, handleSort, renderSortIcon, getRoundIcon }) {
  if (!selectedMatch) return null;

  const myPlayerInMatch = selectedMatch.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetPlayerName);
  const myTeam = myPlayerInMatch ? myPlayerInMatch.team : 'Blue';
  const otherTeam = myTeam === 'Blue' ? 'Red' : 'Blue';
  
  const myTeamScore = selectedMatch.teams?.[myTeam.toLowerCase()] || 0;
  const otherTeamScore = selectedMatch.teams?.[otherTeam.toLowerCase()] || 0;

  const renderTimelineRow = (team, score, title) => {
    const isBlue = team === 'Blue';
    const colorClass = isBlue ? 'text-blue-400' : 'text-red-400';
    const winIconColor = isBlue ? 'text-teal-400' : 'text-[#ff4655]';
    
    return (
      <div className="flex items-center w-full">
        <div className={`w-24 md:w-28 text-sm font-bold ${colorClass} flex justify-between items-center pr-4 border-r border-gray-700`}>
          <span className="uppercase tracking-wide">{title}</span>
          <span className="text-2xl font-black tabular-nums">{score}</span>
        </div>
        <div className="flex flex-1 gap-1.5 md:gap-2 ml-4">
          {selectedMatch.round_history?.map(r => (
            <div key={r.round_num} className="flex-1 flex justify-center items-center h-8">
              {r.winning_team === team 
                ? <span className={`${winIconColor} font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]`}>{getRoundIcon(r.end_type)}</span> 
                : <span className="w-1.5 h-1.5 rounded-full bg-gray-600/50"></span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 animate-fade-in" onClick={onClose}>
      <div className="bg-[#0f1923] border border-gray-700 rounded-xl max-w-[1400px] w-[95vw] max-h-[96vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors font-bold text-2xl z-10">✕</button>

        {['competitive', 'unrated'].includes(String(selectedMatch.mode || "").toLowerCase()) ? (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-800 pb-5 mb-5 gap-4 px-2 mt-2">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-widest leading-tight">{selectedMatch.map || "Unknown Map"}</h2>
                  <p className="text-sm md:text-base text-gray-400 font-medium">{selectedMatch.mode || "Unknown Mode"} • {selectedMatch.rounds_played || 0} Rounds Played</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-900/60 px-6 py-2.5 rounded-lg border border-gray-800/80">
                <span className={`text-sm font-bold ${myTeam === 'Blue' ? 'text-blue-500/80' : 'text-red-500/80'} mr-1 uppercase`}>
                  {myTeam === 'Blue' ? 'Team B' : 'Team A'} (You)
                </span>
                <span className={`text-3xl font-black ${myTeam === 'Blue' ? 'text-blue-400' : 'text-red-400'} tabular-nums`}>
                  {myTeamScore}
                </span>
                <span className="text-xl font-bold text-gray-600 mx-2">:</span>
                <span className={`text-3xl font-black ${otherTeam === 'Blue' ? 'text-blue-400' : 'text-red-400'} tabular-nums`}>
                  {otherTeamScore}
                </span>
                <span className={`text-sm font-bold ${otherTeam === 'Blue' ? 'text-blue-500/80' : 'text-red-500/80'} ml-1 uppercase`}>
                  {otherTeam === 'Blue' ? 'Team B' : 'Team A'}
                </span>
              </div>
            </div>

            {selectedMatch.round_history && selectedMatch.round_history.length > 0 && (
              <div className="w-full bg-[#111823] border border-gray-800/80 rounded-xl p-4 sm:p-5 mb-6">
                <div className="flex flex-col gap-3">
                  {renderTimelineRow(myTeam, myTeamScore, myTeam === 'Blue' ? 'Team B' : 'Team A')}
                  {renderTimelineRow(otherTeam, otherTeamScore, otherTeam === 'Blue' ? 'Team B' : 'Team A')}

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
              <TeamTable
                teamData={selectedMatch.scoreboard?.filter(p => p.team === myTeam)}
                bgColorClass={myTeam === 'Blue' ? "bg-blue-950/20" : "bg-red-950/20"}
                targetPlayerName={targetPlayerName}
                matchMode={selectedMatch.mode}
                agentImages={agentImages}
                rankImages={rankImages}
                sortConfig={sortConfig}
                handleSort={handleSort}
                renderSortIcon={renderSortIcon}
              />
              <TeamTable
                teamData={selectedMatch.scoreboard?.filter(p => p.team === otherTeam)}
                bgColorClass={otherTeam === 'Blue' ? "bg-blue-950/20" : "bg-red-950/20"}
                targetPlayerName={targetPlayerName}
                matchMode={selectedMatch.mode}
                agentImages={agentImages}
                rankImages={rankImages}
                sortConfig={sortConfig}
                handleSort={handleSort}
                renderSortIcon={renderSortIcon}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-800 pb-5 mb-5 gap-4 px-2 mt-2">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-widest leading-tight">{selectedMatch.map || "Unknown Map"}</h2>
                  <p className="text-sm md:text-base text-gray-400 font-medium">{selectedMatch.mode || "Unknown Mode"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Match ID</p>
                <p className="text-sm md:text-base font-mono text-gray-400">{String(selectedMatch.match_id || "N/A").split('-')[0]}</p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <UnifiedTable
                scoreboardData={selectedMatch.scoreboard}
                targetPlayerName={targetPlayerName}
                matchMode={selectedMatch.mode}
                agentImages={agentImages}
                rankImages={rankImages}
                sortConfig={sortConfig}
                handleSort={handleSort}
                renderSortIcon={renderSortIcon}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
