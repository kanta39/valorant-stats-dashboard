export default function UnifiedTable({ scoreboardData, targetPlayerName, matchMode, agentImages, rankImages, sortConfig, handleSort, renderSortIcon }) {
  if (!scoreboardData || scoreboardData.length === 0) return null;
  
  let sortedData = [...scoreboardData];
  if (sortConfig.key && sortConfig.direction !== 'default') {
    sortedData.sort((a, b) => {
      let valA = Number(a.stats?.[sortConfig.key] || 0);
      let valB = Number(b.stats?.[sortConfig.key] || 0);
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    });
  } else {
    sortedData.sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0)); // Default
  }

  const showRank = String(matchMode || "").toLowerCase() === 'competitive';

  return (
    <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <table className="w-full text-left border-collapse min-w-[1000px] tabular-nums">
        <thead>
          <tr className="text-xs uppercase tracking-widest text-gray-400 border-b-2 border-gray-600 bg-gray-800/30">
            <th className="py-3 px-4 rounded-tl-md w-16">Agent</th>
            <th className="py-3 px-4 w-full">Player</th>
            {showRank && <th className="py-3 px-4 text-center w-24">Rank</th>}
            <th className="py-3 px-4 text-center w-24 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('acs')}>ACS {renderSortIcon('acs')}</th>
            <th className="py-3 px-4 text-center w-16 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('kills')}>K {renderSortIcon('kills')}</th>
            <th className="py-3 px-4 text-center w-16 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('deaths')}>D {renderSortIcon('deaths')}</th>
            <th className="py-3 px-4 text-center w-16 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('assists')}>A {renderSortIcon('assists')}</th>
            <th className="py-3 px-4 text-center w-24 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('kd')}>K/D {renderSortIcon('kd')}</th>
            <th className="py-3 px-4 text-center w-24 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('adr')}>ADR {renderSortIcon('adr')}</th>
            <th className="py-3 px-4 text-center rounded-tr-md w-24 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('hs_percent')}>HS% {renderSortIcon('hs_percent')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/40">
          {sortedData.map((player, idx) => {
            const isMe = String(player.name || "").toLowerCase() === String(targetPlayerName || "").toLowerCase();
            const kdColor = (player.stats?.kd || 0) >= 1 ? "text-green-400" : "text-red-400";
            const rawRank = player.rank || "Unranked";
            const rankKey = String(rawRank).toLowerCase().replace(/\s/g, '');
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
                    <span className={`font-bold text-base md:text-lg tracking-wide truncate ${isMe ? 'text-yellow-400' : 'text-gray-100'}`}>{player.name || "Unknown"}</span>
                    <span className="text-xs text-gray-600">#{player.tag || "000"}</span>
                  </div>
                </td>
                {showRank && (
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex justify-center items-center">
                      {rankIcon ? ( <img src={rankIcon} alt={rawRank} title={rawRank} className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.05)]" /> ) : ( <span className="text-xs font-medium text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-800 whitespace-nowrap">{rawRank}</span> )}
                    </div>
                  </td>
                )}
                <td className="py-2.5 px-4 text-center font-bold text-gray-200 text-base">{player.stats?.acs || 0}</td>
                <td className="py-2.5 px-4 text-center font-black text-green-400/90 text-base">{player.stats?.kills || 0}</td>
                <td className="py-2.5 px-4 text-center font-black text-red-400/90 text-base">{player.stats?.deaths || 0}</td>
                <td className="py-2.5 px-4 text-center font-black text-blue-400/90 text-base">{player.stats?.assists || 0}</td>
                <td className={`py-2.5 px-4 text-center font-bold text-base ${kdColor}`}>{Number(player.stats?.kd || 0).toFixed(2)}</td>
                <td className="py-2.5 px-4 text-center font-bold text-gray-300 text-base">{player.stats?.adr || 0}</td>
                <td className="py-2.5 px-4 text-center font-bold text-gray-300 text-base">{player.stats?.hs_percent || 0}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
