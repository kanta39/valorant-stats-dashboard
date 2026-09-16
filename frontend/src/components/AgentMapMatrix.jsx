import { useState } from 'react';

export default function AgentMapMatrix({
  agentStatsArray = [],
  mapStatsArray = [],
  agentImages = {},
  mapDetails = {},
  onNavigateToAgent,
  onNavigateToMap
}) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // ดึงรายชื่อ Maps ทั้งหมดที่มีการเล่นจริง
  const allMaps = mapStatsArray.map(m => m.name);

  // สร้าง Map Data Lookup รวดเร็วสำหรับแต่ละ Agent × Map
  // agent.maps[mapName] = { name, matches, w, l, d }
  // mapData.agentsPlayed[agentName] = { matches, w, l, d, acsSum, kills, deaths }
  const getCellData = (agent, mapName) => {
    const mapData = mapStatsArray.find(m => m.name.toLowerCase() === mapName.toLowerCase());
    const agentInMap = mapData?.agentsPlayed?.[agent.name];
    const mapInAgent = agent.maps?.[mapName];

    if (!agentInMap && !mapInAgent) return null;

    const matches = agentInMap?.matches ?? mapInAgent?.matches ?? 0;
    const w = agentInMap?.w ?? mapInAgent?.w ?? 0;
    const l = agentInMap?.l ?? mapInAgent?.l ?? 0;
    const d = agentInMap?.d ?? mapInAgent?.d ?? 0;
    const winRate = matches > 0 ? Math.round((w / matches) * 100) : 0;
    const avgAcs = agentInMap?.acsSum && matches > 0 ? Math.round(agentInMap.acsSum / matches) : null;
    const kd = agentInMap?.deaths > 0 ? (agentInMap.kills / agentInMap.deaths).toFixed(2) : (agentInMap?.kills ?? null);

    return {
      agentName: agent.name,
      mapName,
      matches,
      w,
      l,
      d,
      winRate,
      avgAcs,
      kd
    };
  };

  // Helper สำหรับสี Heatmap
  const getCellTheme = (cell) => {
    if (!cell || cell.matches === 0) {
      return {
        bg: 'bg-gray-950/40 hover:bg-gray-900/60',
        text: 'text-gray-600',
        border: 'border-gray-800/40',
        glow: ''
      };
    }
    if (cell.winRate >= 65) {
      return {
        bg: 'bg-emerald-500/20 hover:bg-emerald-500/30',
        text: 'text-emerald-400 font-black',
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.15)]'
      };
    }
    if (cell.winRate >= 50) {
      return {
        bg: 'bg-blue-500/20 hover:bg-blue-500/30',
        text: 'text-blue-400 font-black',
        border: 'border-blue-500/40',
        glow: 'shadow-[0_0_10px_rgba(59,130,246,0.15)]'
      };
    }
    if (cell.winRate >= 40) {
      return {
        bg: 'bg-amber-500/20 hover:bg-amber-500/30',
        text: 'text-amber-400 font-bold',
        border: 'border-amber-500/40',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.15)]'
      };
    }
    return {
      bg: 'bg-red-500/20 hover:bg-red-500/30',
      text: 'text-red-400 font-bold',
      border: 'border-red-500/40',
      glow: 'shadow-[0_0_10px_rgba(239,68,68,0.15)]'
    };
  };

  if (agentStatsArray.length === 0 || allMaps.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-3xl">
        <p className="text-base font-bold text-gray-400">ไม่มีข้อมูลเพียงพอสำหรับสร้างตาราง Synergy Matrix</p>
        <p className="text-xs text-gray-600 mt-1">ลองเปลี่ยนโหมดการเล่นเพื่อดึงแมตช์เพิ่มเติม</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* 🧭 คำอธิบายและ Legend สัญลักษณ์สี */}
      <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <span>🗺️ × 🕵️‍♂️</span> AGENT × MAP SYNERGY MATRIX
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            วิเคราะห์จุดตัดระหว่างตัวละครกับแผนที่ (คลิกที่ชื่อเพื่อเปิดดูสถิติเจาะลึก หรือคลิกที่ช่องเพื่อดูผลงานคู่นั้น)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
          <span className="text-gray-500 uppercase text-[10px] tracking-wider mr-1">ระดับฟอร์ม:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            ≥ 65% คู่บุญ
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400">
            50-64% ชนะบ่อย
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400">
            40-49% สูสี
          </span>
          <span className="px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400">
            &lt; 40% แพ้บ่อย
          </span>
        </div>
      </div>

      {/* 📊 ตาราง Matrix (Horizontal Scrollable Table) */}
      <div className="bg-[#0f1724] border border-gray-800/90 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-950">
          <table className="w-full border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-gray-950/80 border-b border-gray-800">
                {/* มุมบนซ้าย: หัวข้อ Agent */}
                <th className="p-3 text-left sticky left-0 z-20 bg-[#0c131d] border-r border-gray-800 min-w-[150px] shadow-sm">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🕵️‍♂️ เอเจนต์ / ด่าน 🗺️</span>
                  </span>
                </th>

                {/* คอลัมน์ Maps ทั้งหมด */}
                {allMaps.map(mapName => {
                  const mDetail = mapDetails[mapName.toLowerCase()] || {};
                  return (
                    <th 
                      key={mapName}
                      onClick={() => onNavigateToMap && onNavigateToMap(mapName)}
                      className="p-2.5 text-center min-w-[105px] border-r border-gray-800/60 cursor-pointer hover:bg-gray-900/80 transition-colors group"
                      title={`คลิกเพื่อดูสถิติด่าน ${mapName} ในแท็บ Maps`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-900 border border-gray-700/80 p-0.5 flex items-center justify-center group-hover:border-red-500/50 transition-colors shadow-sm">
                          {mDetail.displayIcon ? (
                            <img src={mDetail.displayIcon} alt={mapName} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[9px] text-gray-500 font-bold">{mapName.substring(0, 2)}</span>
                          )}
                        </div>
                        <span className="text-xs font-black text-gray-300 group-hover:text-white uppercase truncate max-w-[95px] flex items-center gap-0.5">
                          {mapName}
                          <span className="text-[9px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">➜</span>
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {agentStatsArray.map((agent, aIdx) => {
                return (
                  <tr 
                    key={agent.name || aIdx}
                    className="border-b border-gray-800/60 hover:bg-gray-900/30 transition-colors"
                  >
                    {/* แถว Agent (Sticky Column ทางซ้าย) */}
                    <td 
                      onClick={() => onNavigateToAgent && onNavigateToAgent(agent.name)}
                      className="p-2.5 sticky left-0 z-10 bg-[#0d1420] border-r border-gray-800 cursor-pointer hover:bg-gray-900 transition-colors group shadow-sm"
                      title={`คลิกเพื่อดูสถิติ ${agent.name} ในแท็บ Agents`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-950 border border-gray-700/80 p-0.5 flex items-center justify-center flex-shrink-0 group-hover:border-red-500/50 transition-colors shadow-inner">
                          {agentImages[agent.name] ? (
                            <img src={agentImages[agent.name]} alt={agent.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500">{agent.name.substring(0, 2)}</span>
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-black text-white group-hover:text-red-400 transition-colors uppercase truncate flex items-center gap-1">
                            {agent.name}
                            <span className="text-[9px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">➜</span>
                          </p>
                          <p className="text-[10px] text-gray-500 font-bold">
                            {agent.matches} เกม ({agent.winRate?.toFixed(0)}% WR)
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* เซลล์ข้อมูลของแต่ละ Map */}
                    {allMaps.map(mapName => {
                      const cell = getCellData(agent, mapName);
                      const theme = getCellTheme(cell);

                      return (
                        <td
                          key={mapName}
                          onClick={() => cell && setSelectedCell(cell)}
                          onMouseEnter={() => cell && setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`p-2 text-center border-r border-gray-800/40 transition-all cursor-pointer relative ${theme.bg} ${theme.glow}`}
                        >
                          {cell && cell.matches > 0 ? (
                            <div className="flex flex-col items-center justify-center py-1">
                              <span className={`text-xs ${theme.text} tabular-nums leading-tight`}>
                                {cell.winRate}%
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono mt-0.5">
                                {cell.matches}G ({cell.w}W-{cell.l}L)
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-700 font-light select-none">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💡 Tooltip / Popover ลอยเมื่อ Hover หรือคลิก Cell */}
      {hoveredCell && (
        <div className="bg-gray-950/95 border border-gray-700 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-lg border border-gray-700 p-0.5 flex-shrink-0 flex items-center justify-center">
              {agentImages[hoveredCell.agentName] && (
                <img src={agentImages[hoveredCell.agentName]} alt={hoveredCell.agentName} className="w-full h-full object-contain" />
              )}
            </div>
            <div>
              <p className="text-xs font-black text-white">
                {hoveredCell.agentName} <span className="text-gray-500 font-normal">ในด่าน</span> {hoveredCell.mapName}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {hoveredCell.matches} นัด ({hoveredCell.w} ชนะ - {hoveredCell.l} แพ้)
                {hoveredCell.kd && <span> • K/D: <strong className="text-white">{hoveredCell.kd}</strong></span>}
                {hoveredCell.avgAcs && <span> • ACS: <strong className="text-yellow-400">{hoveredCell.avgAcs}</strong></span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-black px-2 py-0.5 rounded-lg border ${getCellTheme(hoveredCell).border} ${getCellTheme(hoveredCell).text} bg-gray-900`}>
              WR {hoveredCell.winRate}%
            </span>
          </div>
        </div>
      )}

      {/* 🔍 Selected Cell Modal / Action Banner */}
      {selectedCell && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedCell(null)}
        >
          <div 
            className="bg-[#0f1724] border border-gray-700 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative text-left"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedCell(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg w-7 h-7 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-950 rounded-xl border border-gray-700 p-1 flex items-center justify-center shadow-inner">
                {agentImages[selectedCell.agentName] && (
                  <img src={agentImages[selectedCell.agentName]} alt={selectedCell.agentName} className="w-full h-full object-contain" />
                )}
              </div>
              <div>
                <h4 className="text-base font-black text-white uppercase">
                  {selectedCell.agentName} @ {selectedCell.mapName}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  ความสัมพันธ์และสถิติการเล่นคู่นี้
                </p>
              </div>
            </div>

            {/* สถิติ 4 ช่อง */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-gray-950/80 p-2.5 rounded-xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Win Rate</p>
                <p className={`text-xl font-black mt-0.5 ${selectedCell.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedCell.winRate}%
                </p>
                <p className="text-[10px] text-gray-400">{selectedCell.w}W - {selectedCell.l}L</p>
              </div>

              <div className="bg-gray-950/80 p-2.5 rounded-xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Matches</p>
                <p className="text-xl font-black text-white mt-0.5">{selectedCell.matches}</p>
                <p className="text-[10px] text-gray-400">แมตช์ทั้งหมด</p>
              </div>

              {selectedCell.avgAcs && (
                <div className="bg-gray-950/80 p-2.5 rounded-xl border border-gray-800 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Avg ACS</p>
                  <p className="text-xl font-black text-yellow-400 mt-0.5">{selectedCell.avgAcs}</p>
                  <p className="text-[10px] text-gray-400">Combat Score</p>
                </div>
              )}

              {selectedCell.kd && (
                <div className="bg-gray-950/80 p-2.5 rounded-xl border border-gray-800 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">K/D Ratio</p>
                  <p className="text-xl font-black text-blue-400 mt-0.5">{selectedCell.kd}</p>
                  <p className="text-[10px] text-gray-400">อัตราสังหาร</p>
                </div>
              )}
            </div>

            {/* ปุ่มทางลัดวาร์ปไปแท็บ Agents หรือ Maps */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-800">
              <button
                onClick={() => {
                  setSelectedCell(null);
                  onNavigateToAgent && onNavigateToAgent(selectedCell.agentName);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20"
              >
                <span>🕵️‍♂️ ดูเจาะลึก {selectedCell.agentName}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCell(null);
                  onNavigateToMap && onNavigateToMap(selectedCell.mapName);
                }}
                className="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🗺️ ดูเจาะลึก {selectedCell.mapName}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
