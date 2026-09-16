import { useState, useEffect } from 'react';
import AgentMapMatrix from '../AgentMapMatrix';
import { analyzeMatchSides } from '../../utils/helpers';

export default function MapsTab({ 
  mapStatsArray = [], 
  mapDetails = {}, 
  agentImages = {}, 
  onMatchSelect,
  onNavigateToAgent,
  initialSelectedMap = null,
  onClearInitialMap,
  agentStatsArray = [],
  activeSearchQuery = ''
}) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'matrix'
  const [selectedFilter, setSelectedFilter] = useState('All'); // All, fortress, high, low
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('matches'); // matches, winRate, roundDiff, acs
  const [activeModalMap, setActiveModalMap] = useState(null);

  // สลับมาเปิด Modal ด่านอัตโนมัติหากถูกส่งมาจาก AgentsTab
  useEffect(() => {
    if (initialSelectedMap) {
      const found = mapStatsArray.find(m => m.name.toLowerCase() === initialSelectedMap.toLowerCase());
      if (found) {
        setActiveModalMap(found);
        setViewMode('cards');
      }
      if (onClearInitialMap) onClearInitialMap();
    }
  }, [initialSelectedMap, mapStatsArray]);

  // กรองข้อมูล
  const filteredMaps = mapStatsArray.filter(mapData => {
    const wr = mapData.winRate ?? 0;
    const matchesSearch = mapData.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'fortress') matchesFilter = wr >= 65 && mapData.matches >= 2;
    else if (selectedFilter === 'high') matchesFilter = wr >= 50;
    else if (selectedFilter === 'low') matchesFilter = wr < 50;

    return matchesSearch && matchesFilter;
  });

  // จัดเรียงข้อมูล
  const sortedMaps = [...filteredMaps].sort((a, b) => {
    if (sortBy === 'winRate') return (b.winRate || 0) - (a.winRate || 0);
    if (sortBy === 'roundDiff') return (b.roundDiff || 0) - (a.roundDiff || 0);
    if (sortBy === 'acs') return (b.avgAcs || 0) - (a.avgAcs || 0);
    return (b.matches || 0) - (a.matches || 0);
  });

  // นับจำนวนในตัวกรอง
  const filterCounts = {
    all: mapStatsArray.length,
    fortress: mapStatsArray.filter(m => (m.winRate || 0) >= 65 && m.matches >= 2).length,
    high: mapStatsArray.filter(m => (m.winRate || 0) >= 50).length,
    low: mapStatsArray.filter(m => (m.winRate || 0) < 50).length
  };

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      {/* 🧭 หัวข้อและคำอธิบาย + ปุ่มสลับมุมมอง Cards vs Matrix */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="text-red-500">🗺️</span> MAP WIN RATES & ANALYTICS
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            สถิติอัตราการชนะแยกตามแผนที่ ผลต่างรอบได้-เสีย และความสัมพันธ์กับเอเจนต์ (คลิกการ์ดเพื่อดูรายละเอียด)
          </p>
        </div>

        {/* ปุ่มสลับโหมดมุมมอง */}
        <div className="flex items-center gap-1.5 bg-[#111823] p-1.5 rounded-2xl border border-gray-800/80 shadow-lg flex-shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'cards'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🎴</span>
            <span>การ์ดแผนที่ (Cards)</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'matrix'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>📊</span>
            <span>Synergy Matrix</span>
          </button>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        <AgentMapMatrix 
          agentStatsArray={agentStatsArray}
          mapStatsArray={mapStatsArray}
          agentImages={agentImages}
          mapDetails={mapDetails}
          onNavigateToAgent={onNavigateToAgent}
          onNavigateToMap={(mName) => {
            const m = mapStatsArray.find(mapItem => mapItem.name.toLowerCase() === mName.toLowerCase());
            if (m) setActiveModalMap(m);
            setViewMode('cards');
          }}
        />
      ) : (
        <>
          {/* 🔘 แถบควบคุม: Filter, Search & Sort (จัดช่องไฟ 2 แถวสมดุล) */}
          <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-3.5">
            {/* แถวที่ 1: กลุ่มปุ่มฟิลเตอร์สถานะด่าน + ป้ายนับจำนวน */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedFilter('All')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === 'All'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 scale-[1.02]'
                      : 'bg-gray-900/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-800/60'
                  }`}
                >
                  <span>ทั้งหมด (All)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    selectedFilter === 'All' ? 'bg-red-800 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {filterCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter('fortress')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === 'fortress'
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/25 scale-[1.02]'
                      : 'bg-gray-900/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-800/60'
                  }`}
                >
                  <span>🏰 ด่านบุญ (WR ≥ 65%)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    selectedFilter === 'fortress' ? 'bg-green-800 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {filterCounts.fortress}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter('high')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === 'high'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-[1.02]'
                      : 'bg-gray-900/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-800/60'
                  }`}
                >
                  <span>✅ ชนะบ่อย (WR ≥ 50%)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    selectedFilter === 'high' ? 'bg-blue-800 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {filterCounts.high}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter('low')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === 'low'
                      ? 'bg-red-700 text-white shadow-lg shadow-red-700/25 scale-[1.02]'
                      : 'bg-gray-900/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-800/60'
                  }`}
                >
                  <span>⚠️ แพ้บ่อย (WR &lt; 50%)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    selectedFilter === 'low' ? 'bg-red-900 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {filterCounts.low}
                  </span>
                </button>
              </div>

              <div className="text-xs text-gray-500 font-bold hidden sm:block">
                แสดง <span className="text-red-400 font-extrabold">{sortedMaps.length}</span> จาก {mapStatsArray.length} แผนที่
              </div>
            </div>

            {/* แถวที่ 2: ช่องค้นหา (ซ้าย) + ตัวเลือกจัดเรียง (ขวา) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-gray-800/60">
              {/* 🔍 ค้นหาชื่อด่าน */}
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-2.5 text-gray-500 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อแผนที่..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700/80 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all font-bold"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* ↕️ ตัวเลือกจัดเรียง Sort */}
              <div className="flex items-center gap-2.5 justify-between sm:justify-end">
                <label className="text-xs font-bold text-gray-400 flex items-center gap-1 whitespace-nowrap">
                  <span>↕</span> เรียงตาม:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-900 text-gray-200 text-xs font-bold px-3 py-2 rounded-xl border border-gray-700/80 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                >
                  <option value="matches">เล่นบ่อยสุด (Most Played)</option>
                  <option value="winRate">วินเรตสูงสุด (Highest WR)</option>
                  <option value="roundDiff">ผลต่างรอบสูงสุด (+/- Rounds)</option>
                  <option value="acs">ACS เฉลี่ยสูงสุด (Combat Score)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 🗺️ รายการการ์ด MAPS */}
          {sortedMaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedMaps.map((mapData, idx) => {
                const winRate = mapData.winRate ?? (mapData.matches > 0 ? ((mapData.w / mapData.matches) * 100) : 0);
                const winColor = winRate >= 50 ? "bg-green-500" : "bg-red-500";
                const textColor = winRate >= 50 ? "text-green-400" : "text-red-400";
                
                const detail = mapDetails[mapData.name.toLowerCase()] || {};
                const splashUrl = detail.splash;
                const minimapUrl = detail.displayIcon;
                const tacticalSites = detail.tacticalDescription;
                const roundDiff = mapData.roundDiff ?? (mapData.roundsWon - mapData.roundsLost);
                const bestAgent = mapData.bestAgent;

                return (
                  <div 
                    key={idx} 
                    onClick={() => setActiveModalMap(mapData)}
                    className="bg-[#0f1724] border border-gray-800/80 hover:border-gray-600 rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden shadow-xl cursor-pointer hover:scale-[1.01] hover:shadow-2xl flex flex-col justify-between min-h-[235px] group"
                  >
                    {/* 🖼️ ภาพพื้นหลัง Splash Art แบบ Dark Gradient Overlay */}
                    {splashUrl && (
                      <div className="absolute inset-0 z-0 pointer-events-none">
                        <img 
                          src={splashUrl} 
                          alt={mapData.name} 
                          className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 opacity-25 group-hover:opacity-35" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1420] via-[#0d1420]/85 to-[#0d1420]/65"></div>
                      </div>
                    )}

                    {/* ส่วนหัวการ์ด: Minimap Radar (ซ้าย) + ชื่อด่าน + วินเรต (ขวา ไม่ตกบรรทัด) */}
                    <div className="relative z-10 flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        {minimapUrl ? (
                          <div className="w-12 h-12 bg-gray-950/80 rounded-xl border border-gray-700/80 p-1 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-gray-500 transition-colors">
                            <img src={minimapUrl} alt="radar" className="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-opacity drop-shadow" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-950/80 rounded-xl border border-gray-700/80 p-1 flex items-center justify-center flex-shrink-0 text-gray-500 font-bold text-xs">
                            MAP
                          </div>
                        )}
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xl font-black text-white uppercase tracking-wider truncate drop-shadow">
                              {mapData.name}
                            </h3>
                            {tacticalSites && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-gray-900/90 text-gray-400 border border-gray-700/60 uppercase whitespace-nowrap">
                                {tacticalSites}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 font-bold mt-0.5 whitespace-nowrap">
                            {mapData.matches} นัด • {mapData.w}W - {mapData.l}L {mapData.d > 0 ? `(${mapData.d}D)` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <div className={`text-2xl font-black ${textColor} whitespace-nowrap tabular-nums leading-none drop-shadow-sm`}>
                          {winRate.toFixed(1)}%
                        </div>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mt-1 whitespace-nowrap">
                          Win Rate
                        </span>
                      </div>
                    </div>

                    {/* 🏷️ Destiny Badges แถบฉายาดวงแผนที่ */}
                    {mapData.badges && mapData.badges.length > 0 && (
                      <div className="relative z-10 flex flex-wrap gap-1.5 mb-2.5">
                        {mapData.badges.map((b, bIdx) => (
                          <span 
                            key={bIdx} 
                            title={b.desc}
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${b.color} shadow-sm backdrop-blur-sm`}
                          >
                            <span>{b.icon}</span>
                            <span>{b.label}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 🌟 ชิปแนะนำ "Best Agent on this map" (พร้อมปุ่มวาร์ปไป AgentsTab) */}
                    {bestAgent && bestAgent.winRate > 0 ? (
                      <div className="relative z-10 bg-gray-950/75 border border-gray-800/90 rounded-xl p-2.5 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 bg-gray-900 rounded-lg border border-gray-700 p-0.5 flex-shrink-0 flex items-center justify-center">
                            {agentImages[bestAgent.name] ? (
                              <img src={agentImages[bestAgent.name]} alt={bestAgent.name} className="w-full h-full object-contain drop-shadow" />
                            ) : (
                              <span className="text-[9px] font-bold text-gray-500">{bestAgent.name.substring(0, 2)}</span>
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-[10px] text-yellow-400 font-black uppercase leading-none flex items-center gap-1">
                              <span>⭐</span> เอเจนต์คู่บุญ
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onNavigateToAgent) onNavigateToAgent(bestAgent.name);
                              }}
                              className="text-xs font-black text-white hover:text-red-400 hover:underline flex items-center gap-1 truncate mt-1 transition-colors"
                              title={`คลิกเพื่อดูสถิติ ${bestAgent.name} ในแท็บ Agents`}
                            >
                              <span>{bestAgent.name}</span>
                              <span className="text-red-400 text-[10px]">↗</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="text-xs font-black text-green-400 whitespace-nowrap">
                            WR {bestAgent.winRate.toFixed(0)}%
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">{bestAgent.w}W - {bestAgent.l}L</p>
                        </div>
                      </div>
                    ) : bestAgent ? (
                      <div className="relative z-10 bg-gray-950/50 border border-gray-800/60 rounded-xl p-2.5 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 bg-gray-900 rounded-lg border border-gray-700/80 p-0.5 flex-shrink-0 flex items-center justify-center">
                            {agentImages[bestAgent.name] ? (
                              <img src={agentImages[bestAgent.name]} alt={bestAgent.name} className="w-full h-full object-contain opacity-70" />
                            ) : (
                              <span className="text-[9px] font-bold text-gray-500">{bestAgent.name.substring(0, 2)}</span>
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">
                              🎮 ตัวที่เล่นล่าสุด
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onNavigateToAgent) onNavigateToAgent(bestAgent.name);
                              }}
                              className="text-xs font-bold text-gray-300 hover:text-red-400 hover:underline flex items-center gap-1 truncate mt-1 transition-colors"
                              title={`คลิกเพื่อดูสถิติ ${bestAgent.name} ในแท็บ Agents`}
                            >
                              <span>{bestAgent.name}</span>
                              <span className="text-red-400 text-[10px]">↗</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap">
                            {bestAgent.matches} นัด (ยังไม่ชนะ)
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* แถบสถิติรอบ (Round Diff & Progress Bar) */}
                    <div className="relative z-10 mt-auto">
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-1.5">
                        <span>
                          ผลต่าง: <strong className={roundDiff >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {roundDiff >= 0 ? `+${roundDiff}` : roundDiff} รอบ
                          </strong>
                        </span>
                        {mapData.avgAcs > 0 && (
                          <span className="text-gray-400">
                            {mapData.avgAcs >= 1000 ? 'คะแนน: ' : 'ACS: '}
                            <strong className="text-yellow-400 font-bold">
                              {mapData.avgAcs >= 1000 ? mapData.avgAcs.toLocaleString() : mapData.avgAcs}
                            </strong>
                          </span>
                        )}
                      </div>

                      <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden mb-2.5 border border-gray-800">
                        <div 
                          className={`h-full transition-all duration-1000 ${winColor}`} 
                          style={{ width: `${Math.min(100, Math.max(0, winRate))}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-black tracking-widest pt-2 border-t border-gray-800/50">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">{mapData.w}W</span>
                          {mapData.d > 0 && <span className="text-gray-500">{mapData.d}D</span>}
                          <span className="text-red-400">{mapData.l}L</span>
                        </div>
                        <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                          ดูเจาะลึก ➜
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-3xl">
              <p className="text-base font-bold text-gray-400">ไม่พบข้อมูลแผนที่ตามเงื่อนไขที่คุณเลือก</p>
              <p className="text-xs text-gray-600 mt-1">ลองเปลี่ยนตัวกรองผลงาน หรือล้างคำค้นหา</p>
            </div>
          )}
        </>
      )}

      {/* 🌟 🌟 MAP DETAIL MODAL (เจาะลึกเมื่อคลิกการ์ดแผนที่) 🌟 🌟 */}
      {activeModalMap && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setActiveModalMap(null)}
        >
          <div 
            className="bg-[#0f1923] border border-gray-700/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ปุ่มปิด */}
            <button 
              onClick={() => setActiveModalMap(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors font-bold text-xl w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center z-20"
            >
              ✕
            </button>

            {/* ส่วนหัว Modal พร้อมภาพวิวแผนที่ HD */}
            <div className="relative h-44 sm:h-52 w-full overflow-hidden rounded-t-2xl">
              {mapDetails[activeModalMap.name.toLowerCase()]?.splash ? (
                <img 
                  src={mapDetails[activeModalMap.name.toLowerCase()].splash} 
                  alt={activeModalMap.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gray-900"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-[#0f1923]/60 to-transparent"></div>

              {/* ป้ายชื่อด่านบนภาพ */}
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-widest drop-shadow-lg">
                    {activeModalMap.name}
                  </h2>
                  <p className="text-xs text-gray-300 font-bold mt-1">
                    {mapDetails[activeModalMap.name.toLowerCase()]?.tacticalDescription || 'Standard Map'} • เล่นไปแล้ว {activeModalMap.matches} เกม
                  </p>
                </div>

                {mapDetails[activeModalMap.name.toLowerCase()]?.displayIcon && (
                  <div className="w-14 h-14 bg-gray-950/80 rounded-2xl border border-gray-700 p-1 flex items-center justify-center shadow-lg">
                    <img 
                      src={mapDetails[activeModalMap.name.toLowerCase()].displayIcon} 
                      alt="radar" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* เนื้อหาภายใน Modal */}
            <div className="p-6">
              {/* สรุปตัวเลขสถิติภาพรวมในด่านนี้ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Matches</p>
                  <p className="text-xl font-black text-white mt-0.5">{activeModalMap.matches}</p>
                  <p className="text-[10px] text-gray-400">{activeModalMap.w}W - {activeModalMap.l}L</p>
                </div>

                <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Win Rate</p>
                  <p className={`text-xl font-black mt-0.5 ${activeModalMap.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {activeModalMap.winRate?.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-gray-400">อัตราการชนะ</p>
                </div>

                <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Round Diff</p>
                  <p className={`text-xl font-black mt-0.5 ${activeModalMap.roundDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {activeModalMap.roundDiff >= 0 ? `+${activeModalMap.roundDiff}` : activeModalMap.roundDiff}
                  </p>
                  <p className="text-[10px] text-gray-400">{activeModalMap.roundsWon}W - {activeModalMap.roundsLost}L</p>
                </div>

                <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Avg ACS</p>
                  <p className="text-xl font-black text-yellow-400 mt-0.5">{activeModalMap.avgAcs || '-'}</p>
                  <p className="text-[10px] text-gray-400">Combat Score</p>
                </div>
              </div>

              {/* ⚔️ vs 🛡️ สถิติแยกฝั่งบุก vs ฝั่งรับ ในด่านนี้ */}
              {(() => {
                let mapAtkTotal = 0;
                let mapAtkWon = 0;
                let mapDefTotal = 0;
                let mapDefWon = 0;

                if (activeModalMap.recentMatches) {
                  activeModalMap.recentMatches.forEach(rm => {
                    if (rm.matchRaw) {
                      const analysis = analyzeMatchSides(rm.matchRaw, activeSearchQuery);
                      if (analysis) {
                        mapAtkTotal += analysis.attack.total;
                        mapAtkWon += analysis.attack.won;
                        mapDefTotal += analysis.defense.total;
                        mapDefWon += analysis.defense.won;
                      }
                    }
                  });
                }

                const totalMapRounds = mapAtkTotal + mapDefTotal;
                if (totalMapRounds === 0) return null;

                const mapAtkWR = mapAtkTotal > 0 ? Math.round((mapAtkWon / mapAtkTotal) * 100) : 0;
                const mapDefWR = mapDefTotal > 0 ? Math.round((mapDefWon / mapDefTotal) * 100) : 0;
                const diff = mapAtkWR - mapDefWR;

                let biasText = 'ผลงานทั้งสองฝั่งสมดุลกัน';
                let biasBadge = '⚖️ สมดุล';
                let biasColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

                if (diff >= 5) {
                  biasText = `ด่านนี้ถนัดฝั่งบุกมากกว่า (+${diff}%)`;
                  biasBadge = '💥 ถนัดฝั่งบุก';
                  biasColor = 'text-red-400 bg-red-500/10 border-red-500/30';
                } else if (diff <= -5) {
                  biasText = `ด่านนี้ถนัดฝั่งรับมากกว่า (+${Math.abs(diff)}%)`;
                  biasBadge = '🛡️ ถนัดฝั่งรับ';
                  biasColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
                }

                return (
                  <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black text-gray-200 uppercase tracking-wider flex items-center gap-2">
                        <span>⚔️ vs 🛡️</span> สถิติแยกฝั่งใน {activeModalMap.name}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${biasColor}`}>
                        {biasBadge} • {biasText}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Attack Box */}
                      <div className="bg-[#0f1923] border border-red-500/25 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-black text-red-400 flex items-center gap-1">
                            ⚔️ บุก (ATK)
                          </span>
                          <span className="text-sm font-black text-white font-mono">{mapAtkWR}%</span>
                        </div>
                        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800 mb-1.5">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-700"
                            style={{ width: `${mapAtkWR}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                          <span>ชนะ {mapAtkWon} / แพ้ {mapAtkTotal - mapAtkWon}</span>
                          <span>{mapAtkTotal} รอบ</span>
                        </div>
                      </div>

                      {/* Defense Box */}
                      <div className="bg-[#0f1923] border border-cyan-500/25 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-black text-cyan-400 flex items-center gap-1">
                            🛡️ รับ (DEF)
                          </span>
                          <span className="text-sm font-black text-white font-mono">{mapDefWR}%</span>
                        </div>
                        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800 mb-1.5">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-600 to-teal-400 transition-all duration-700"
                            style={{ width: `${mapDefWR}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                          <span>ชนะ {mapDefWon} / แพ้ {mapDefTotal - mapDefWon}</span>
                          <span>{mapDefTotal} รอบ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 🕵️‍♂️ สถิติแยกตาม Agent ที่เคยใช้ในด่านนี้ */}
              <div className="mb-6">
                <h4 className="text-sm font-black text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🕵️‍♂️</span> สถิติเอเจนต์ที่เคยเล่นใน {activeModalMap.name}
                </h4>

                {activeModalMap.agentList && activeModalMap.agentList.length > 0 ? (
                  <div className="space-y-2">
                    {activeModalMap.agentList.map((ag, aIdx) => {
                      return (
                        <div key={aIdx} className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-3 w-1/3">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg border border-gray-700 p-0.5 flex-shrink-0 flex items-center justify-center">
                              {agentImages[ag.name] ? (
                                <img src={agentImages[ag.name]} alt={ag.name} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-[9px] font-bold text-gray-500">{ag.name.substring(0, 2)}</span>
                              )}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-black text-white uppercase truncate">{ag.name}</p>
                              <p className="text-[10px] text-gray-500">{ag.matches} เกม ({ag.w}W - {ag.l}L)</p>
                            </div>
                          </div>

                          <div className="w-1/3 px-3">
                            <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
                              <div 
                                className={`h-full ${ag.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${ag.winRate}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="w-1/4 text-right flex items-center justify-end gap-2">
                            <div>
                              <span className={`text-xs font-black ${ag.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                WR {ag.winRate.toFixed(0)}%
                              </span>
                              {ag.avgAcs > 0 && (
                                <p className="text-[10px] text-gray-500">ACS {ag.avgAcs}</p>
                              )}
                            </div>
                            {onNavigateToAgent && (
                              <button
                                onClick={() => {
                                  setActiveModalMap(null);
                                  onNavigateToAgent(ag.name);
                                }}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/80 transition-colors flex items-center gap-1 shadow-sm flex-shrink-0"
                                title={`เปิดแท็บ Agents ที่ ${ag.name}`}
                              >
                                <span>ดูตัวนี้</span>
                                <span className="text-red-400">➜</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">ไม่มีข้อมูลเอเจนต์ในด่านนี้</p>
                )}
              </div>

              {/* 📜 รายการแมตช์ล่าสุดในด่านนี้ */}
              {activeModalMap.recentMatches && activeModalMap.recentMatches.length > 0 && (
                <div>
                  <h4 className="text-sm font-black text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>⚔️</span> ประวัติการแข่งขันล่าสุดใน {activeModalMap.name}
                  </h4>

                  <div className="space-y-2">
                    {activeModalMap.recentMatches.slice(0, 5).map((rm, rmIdx) => {
                      const isWin = rm.result === 'W';
                      const isDraw = rm.result === 'D';

                      return (
                        <div
                          key={rmIdx}
                          onClick={() => {
                            if (onMatchSelect && rm.matchRaw) {
                              setActiveModalMap(null);
                              onMatchSelect(rm.matchRaw);
                            }
                          }}
                          className="bg-gray-950/60 hover:bg-gray-900 p-3 rounded-xl border border-gray-800/80 hover:border-gray-700 transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                              isWin 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                                : isDraw 
                                ? 'bg-gray-700/30 text-gray-400 border border-gray-700' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}>
                              {rm.result}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gray-900 rounded-md border border-gray-700 p-0.5 flex-shrink-0 flex items-center justify-center">
                                {agentImages[rm.agent] ? (
                                  <img src={agentImages[rm.agent]} alt={rm.agent} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-[9px] font-bold text-gray-500">{String(rm.agent).substring(0, 2)}</span>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white uppercase">{rm.agent}</p>
                                <p className="text-[10px] text-gray-500 font-mono">สกอร์ {rm.myScore} - {rm.enemyScore}</p>
                              </div>
                            </div>
                          </div>

                          <div className="text-center font-mono text-xs">
                            <span className="text-green-400 font-bold">{rm.kills}</span>
                            <span className="text-gray-600"> / </span>
                            <span className="text-red-400 font-bold">{rm.deaths}</span>
                            <span className="text-gray-600"> / </span>
                            <span className="text-blue-400 font-bold">{rm.assists}</span>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <div className="text-[11px]">
                              <span className="text-gray-400">ACS </span>
                              <span className="text-yellow-400 font-black">{rm.acs}</span>
                            </div>
                            <span className="text-gray-600 group-hover:text-white transition-colors text-xs">➜</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
