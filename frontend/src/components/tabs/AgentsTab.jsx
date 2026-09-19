import { useState, useRef, useEffect } from 'react';
import AgentMapMatrix from '../AgentMapMatrix';

// สีตาม Role ของ Agent
const ROLE_THEMES = {
  'Duelist': {
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    glow: 'group-hover:border-red-500/50',
    accent: 'text-red-500'
  },
  'Initiator': {
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    glow: 'group-hover:border-yellow-500/50',
    accent: 'text-yellow-500'
  },
  'Controller': {
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    glow: 'group-hover:border-purple-500/50',
    accent: 'text-purple-500'
  },
  'Sentinel': {
    badge: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    glow: 'group-hover:border-teal-500/50',
    accent: 'text-teal-400'
  }
};

export default function AgentsTab({ 
  agentStatsArray = [], 
  agentImages = {}, 
  agentRoles = {}, 
  roleIcons = {},
  agentDetails = {},
  onMatchSelect,
  onNavigateToMap,
  initialSelectedAgent = null,
  onClearInitialAgent,
  mapStatsArray = [],
  mapDetails = {},
  totalHistoricalMatches = 0
}) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'matrix'
  const [selectedRole, setSelectedRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('matches'); // matches, winRate, kd, acs, hs
  const [activeModalAgent, setActiveModalAgent] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = useRef(null);

  // สลับมาเปิด Modal ตัวละครอัตโนมัติหากถูกส่งมาจาก MapsTab
  useEffect(() => {
    if (initialSelectedAgent) {
      const found = agentStatsArray.find(a => a.name.toLowerCase() === initialSelectedAgent.toLowerCase());
      if (found) {
        setActiveModalAgent(found);
        setViewMode('cards');
      }
      if (onClearInitialAgent) onClearInitialAgent();
    }
  }, [initialSelectedAgent, agentStatsArray]);

  // ฟังก์ชันเล่นเสียง Voice Line ของ Agent
  const handlePlayVoice = (e, agentName, voiceUrl) => {
    e.stopPropagation();
    if (!voiceUrl) return;

    if (playingAudio === agentName) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudio(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(voiceUrl);
    audioRef.current = audio;
    setPlayingAudio(agentName);

    audio.play().catch(err => {
      console.warn("ไม่สามารถเล่นเสียงได้:", err);
      setPlayingAudio(null);
    });

    audio.onended = () => {
      setPlayingAudio(null);
      audioRef.current = null;
    };
  };

  // กรองตาม Role และการค้นหา
  const rolesList = ['All', 'Duelist', 'Initiator', 'Controller', 'Sentinel'];

  const filteredAgents = agentStatsArray.filter(agent => {
    const role = agentRoles[agent.name] || agent.role || 'Unknown';
    const matchesRole = selectedRole === 'All' || role.toLowerCase() === selectedRole.toLowerCase();
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesRole && matchesSearch;
  });

  // จัดเรียงข้อมูล
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (sortBy === 'winRate') return (b.winRate || 0) - (a.winRate || 0);
    if (sortBy === 'kd') return (b.kd || 0) - (a.kd || 0);
    if (sortBy === 'acs') return (b.avgAcs || 0) - (a.avgAcs || 0);
    if (sortBy === 'hs') return (b.avgHs || 0) - (a.avgHs || 0);
    return (b.matches || 0) - (a.matches || 0); // default: matches
  });

  // นับจำนวนในแต่ละ Role
  const roleCounts = agentStatsArray.reduce((acc, a) => {
    const r = agentRoles[a.name] || a.role || 'Unknown';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      {/* 🧭 หัวข้อและคำอธิบาย + ปุ่มสลับมุมมอง Cards vs Matrix */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="text-red-500">🕵️‍♂️</span> AGENT ANALYTICS
            </h2>
            {totalHistoricalMatches > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
                <span>🍃</span> ข้อมูลสะสมในระบบ {totalHistoricalMatches} แมตช์
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            สถิติเชิงลึกรายตัวละคร ฉายาประเมินฝีมือ และความสัมพันธ์กับแผนที่ (คำนวณจากประวัติสะสมทั้งหมดในระบบ)
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
            <span>การ์ดเอเจนต์ (Cards)</span>
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
          onNavigateToAgent={(agName) => {
            const ag = agentStatsArray.find(a => a.name.toLowerCase() === agName.toLowerCase());
            if (ag) setActiveModalAgent(ag);
            setViewMode('cards');
          }}
          onNavigateToMap={onNavigateToMap}
        />
      ) : (
        <>
          {/* 🔘 แถบควบคุม: Filter Role, Search & Sort (จัดช่องไฟสองแถวสมมาตร ไม่หักแถวมั่ว) */}
          <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-3.5">
            {/* แถวที่ 1: กลุ่มปุ่มเลือก Role (Pills) + ป้ายแสดงจำนวน */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {rolesList.map(role => {
                  const count = role === 'All' ? agentStatsArray.length : (roleCounts[role] || 0);
                  const isSelected = selectedRole === role;
                  const icon = role !== 'All' && roleIcons[role];

                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 scale-[1.02]'
                          : 'bg-gray-900/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-800/60'
                      }`}
                    >
                      {icon && <img src={icon} alt={role} className="w-3.5 h-3.5 object-contain opacity-80" />}
                      <span>{role}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isSelected ? 'bg-red-800 text-white' : 'bg-gray-800/80 text-gray-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-gray-500 font-bold hidden sm:block">
                แสดง <span className="text-red-400 font-extrabold">{sortedAgents.length}</span> จาก {agentStatsArray.length} เอเจนต์
              </div>
            </div>

            {/* แถวที่ 2: ช่องค้นหา (ซ้าย) + ตัวเลือกจัดเรียง (ขวา) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-gray-800/60">
              {/* 🔍 ค้นหาชื่อ Agent */}
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-2.5 text-gray-500 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ Agent..."
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
                  <option value="kd">K/D สูงสุด (Highest K/D)</option>
                  <option value="acs">ACS เฉลี่ยสูงสุด (Combat Score)</option>
                  <option value="hs">ยิงหัวแม่นสุด (Highest HS%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 🎴 รายการการ์ด AGENTS */}
          {sortedAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedAgents.map((agent, idx) => {
                const role = agentRoles[agent.name] || agent.role || 'Unknown';
                const theme = ROLE_THEMES[role] || { badge: 'bg-gray-800 text-gray-400 border-gray-700', glow: 'group-hover:border-gray-500', accent: 'text-gray-400' };
                const details = agentDetails[agent.name] || {};
                const voiceUrl = details.voiceLine;
                const fullPortrait = details.fullPortrait || details.bustPortrait;
                const isAudioPlaying = playingAudio === agent.name;

                const winRate = agent.winRate ?? (agent.matches > 0 ? ((agent.w / agent.matches) * 100) : 0);
                const kd = agent.kd ?? (agent.death > 0 ? (agent.k / agent.death).toFixed(2) : agent.k);
                const kda = agent.kda ?? (agent.death > 0 ? ((agent.k + agent.a) / agent.death).toFixed(2) : (agent.k + agent.a));
                const avgAcs = agent.avgAcs ?? '-';
                const avgHs = agent.avgHs ?? '-';

                return (
                  <div 
                    key={idx} 
                    onClick={() => setActiveModalAgent(agent)}
                    className={`bg-[#111823] border border-gray-800/80 rounded-2xl p-5 ${theme.glow} transition-all duration-300 relative overflow-hidden group shadow-xl cursor-pointer hover:scale-[1.01] hover:shadow-2xl flex flex-col justify-between`}
                  >
                    {/* ภาพพื้นหลังลายน้ำตัวละคร */}
                    <div className="absolute -right-4 -bottom-6 opacity-10 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none">
                      {fullPortrait && (
                        <img 
                          src={fullPortrait} 
                          alt="bg" 
                          className="w-48 h-48 object-contain scale-125 translate-x-2 translate-y-2" 
                        />
                      )}
                    </div>

                    {/* ส่วนหัวการ์ด: ไอคอน + ชื่อ + Role + ปุ่มฟังเสียง */}
                    <div className="relative z-10 flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 bg-gray-950 rounded-2xl border border-gray-700/80 p-1 flex-shrink-0 relative overflow-hidden group-hover:border-gray-500 transition-colors shadow-inner">
                          {agentImages[agent.name] ? (
                            <img 
                              src={agentImages[agent.name]} 
                              alt={agent.name} 
                              className="w-full h-full object-contain drop-shadow-md" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                              {String(agent.name || "UN").substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                            {agent.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${theme.badge}`}>
                              {roleIcons[role] && (
                                <img src={roleIcons[role]} alt={role} className="w-3 h-3 object-contain" />
                              )}
                              {role}
                            </span>
                            <span className="text-[11px] text-gray-500 font-bold">
                              {agent.matches} เกม
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 🔊 ปุ่มเล่นเสียง Quote พากย์ประจำตัว */}
                      {voiceUrl && (
                        <button
                          onClick={(e) => handlePlayVoice(e, agent.name, voiceUrl)}
                          title={isAudioPlaying ? "หยุดเสียง" : "ฟังเสียงพากย์เปิดตัว"}
                          className={`p-2 rounded-xl border transition-all text-xs flex items-center justify-center ${
                            isAudioPlaying 
                              ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/30' 
                              : 'bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-800 border-gray-700/60'
                          }`}
                        >
                          {isAudioPlaying ? '🔊 เล่นอยู่...' : '🔈 ฟังเสียง'}
                        </button>
                      )}
                    </div>

                    {/* 🏷️ Dynamic Badges แถบฉายากวนๆ ตามฟอร์ม */}
                    {agent.badges && agent.badges.length > 0 && (
                      <div className="relative z-10 flex flex-wrap gap-1.5 mb-3.5">
                        {agent.badges.map((b, bIdx) => (
                          <span 
                            key={bIdx} 
                            title={b.desc}
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${b.color} shadow-sm`}
                          >
                            <span>{b.icon}</span>
                            <span>{b.label}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 📊 สถิติหลัก 4 ช่อง: WR, K/D, ACS, HS% */}
                    <div className="grid grid-cols-2 gap-2 relative z-10 my-2">
                      <div className="bg-gray-950/70 p-2.5 rounded-xl border border-gray-800/80 text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Win Rate</p>
                        <p className={`text-lg font-black ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {winRate.toFixed(1)}%
                        </p>
                        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mt-1.5 border border-gray-800">
                          <div 
                            className={`h-full ${winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`} 
                            style={{ width: `${Math.min(100, winRate)}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{agent.w}W - {agent.l}L</p>
                      </div>

                      <div className="bg-gray-950/70 p-2.5 rounded-xl border border-gray-800/80 text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">K/D Ratio</p>
                        <p className="text-lg font-black text-white">{kd}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">KDA: <span className="text-gray-300 font-bold">{kda}</span></p>
                        <p className="text-[9px] font-mono text-gray-500 mt-0.5">{agent.k}/{agent.death}/{agent.a}</p>
                      </div>

                      <div className="bg-gray-950/70 p-2 rounded-xl border border-gray-800/80 text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Avg Combat Score</p>
                        <p className="text-base font-black text-yellow-400 mt-0.5">{avgAcs}</p>
                        <p className="text-[9px] text-gray-500">ACS ต่อรอบ</p>
                      </div>

                      <div className="bg-gray-950/70 p-2 rounded-xl border border-gray-800/80 text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Headshot %</p>
                        <p className="text-base font-black text-blue-400 mt-0.5">{avgHs}%</p>
                        <p className="text-[9px] text-gray-500">ความแม่นยำ</p>
                      </div>
                    </div>

                    {/* 🗺️ Best Map Teaser & คลิกเพื่อดูเพิ่ม (พร้อมปุ่มวาร์ปไป MapsTab) */}
                    <div className="relative z-10 pt-2 border-t border-gray-800/60 mt-2 flex items-center justify-between text-[11px]">
                      {agent.mapList && agent.mapList.length > 0 ? (
                        <div className="text-gray-400 truncate max-w-[70%] flex items-center gap-1">
                          <span>ด่านเด่น:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigateToMap) onNavigateToMap(agent.mapList[0].name);
                            }}
                            className="text-gray-200 hover:text-red-400 font-extrabold hover:underline flex items-center gap-0.5 truncate transition-colors"
                            title={`คลิกเพื่อเปิดดูด่าน ${agent.mapList[0].name} ในแท็บ Maps`}
                          >
                            <span>{agent.mapList[0].name}</span>
                            <span className="text-red-400 text-[10px]">↗</span>
                          </button>
                          <span className="text-gray-500 font-mono">({agent.mapList[0].w}W)</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">ไม่มีข้อมูลด่าน</span>
                      )}
                      <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 flex-shrink-0">
                        ดูเจาะลึก ➜
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-3xl">
              <p className="text-base font-bold text-gray-400">ไม่พบข้อมูลเอเจนต์ที่ตรงกับเงื่อนไข</p>
              <p className="text-xs text-gray-600 mt-1">ลองเปลี่ยนตัวกรอง Role หรือล้างคำค้นหา</p>
            </div>
          )}
        </>
      )}

      {/* 🌟 🌟 AGENT DETAIL MODAL (เจาะลึกเมื่อคลิกการ์ด) 🌟 🌟 */}
      {activeModalAgent && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setActiveModalAgent(null)}
        >
          <div 
            className="bg-[#0f1923] border border-gray-700/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ปุ่มปิด */}
            <button 
              onClick={() => setActiveModalAgent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors font-bold text-xl w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center z-20"
            >
              ✕
            </button>

            {/* ส่วนหัว Modal: ภาพ Portrait + ข้อมูล Lore */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-gray-800 pb-6 mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-950 rounded-2xl border-2 border-gray-700 p-2 flex-shrink-0 relative overflow-hidden shadow-xl">
                {agentImages[activeModalAgent.name] ? (
                  <img 
                    src={agentImages[activeModalAgent.name]} 
                    alt={activeModalAgent.name} 
                    className="w-full h-full object-contain drop-shadow-md" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-600 text-xl">
                    {String(activeModalAgent.name).substring(0, 2)}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <h2 className="text-3xl font-black text-white uppercase tracking-wider">
                    {activeModalAgent.name}
                  </h2>
                  <span className="text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                    {agentRoles[activeModalAgent.name] || 'Unknown'}
                  </span>
                </div>

                {agentDetails[activeModalAgent.name]?.description && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                    {agentDetails[activeModalAgent.name].description}
                  </p>
                )}

                {/* Voice Line in Modal */}
                {agentDetails[activeModalAgent.name]?.voiceLine && (
                  <button
                    onClick={(e) => handlePlayVoice(e, activeModalAgent.name, agentDetails[activeModalAgent.name].voiceLine)}
                    className="mt-3 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-700 transition-colors"
                  >
                    <span>{playingAudio === activeModalAgent.name ? '🔊 กำลังเล่นเสียง...' : '🔈 ฟังเสียง Voice Quote'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* สรุปตัวเลขสถิติภาพรวม */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Matches</p>
                <p className="text-xl font-black text-white mt-0.5">{activeModalAgent.matches}</p>
                <p className="text-[10px] text-gray-400">{activeModalAgent.w}W - {activeModalAgent.l}L</p>
              </div>

              <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Win Rate</p>
                <p className={`text-xl font-black mt-0.5 ${activeModalAgent.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {activeModalAgent.winRate?.toFixed(1)}%
                </p>
                <p className="text-[10px] text-gray-400">อัตราการชนะ</p>
              </div>

              <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Avg ACS</p>
                <p className="text-xl font-black text-yellow-400 mt-0.5">{activeModalAgent.avgAcs}</p>
                <p className="text-[10px] text-gray-400">คะแนนต่อรอบ</p>
              </div>

              <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase">K/D Ratio</p>
                <p className="text-xl font-black text-blue-400 mt-0.5">{activeModalAgent.kd}</p>
                <p className="text-[10px] text-gray-400">KDA {activeModalAgent.kda}</p>
              </div>
            </div>

            {/* 🗺️ สถิติแยกตามแผนที่ (Map Breakdown) */}
            <div className="mb-6">
              <h4 className="text-sm font-black text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>🗺️</span> ประสิทธิภาพแยกตามแผนที่ (Map Breakdown)
              </h4>

              {activeModalAgent.mapList && activeModalAgent.mapList.length > 0 ? (
                <div className="space-y-2">
                  {activeModalAgent.mapList.map((m, mIdx) => {
                    const mWr = m.matches > 0 ? ((m.w / m.matches) * 100) : 0;
                    return (
                      <div key={mIdx} className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/80 flex items-center justify-between">
                        <div className="w-1/3">
                          <p className="text-sm font-bold text-white uppercase">{m.name}</p>
                          <p className="text-[10px] text-gray-500">{m.matches} เกม ({m.w}W - {m.l}L)</p>
                        </div>
                        <div className="w-1/3 px-2">
                          <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
                            <div 
                              className={`h-full ${mWr >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${mWr}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-1/4 text-right flex items-center justify-end gap-2">
                          <span className={`text-sm font-black ${mWr >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                            {mWr.toFixed(0)}%
                          </span>
                          {onNavigateToMap && (
                            <button
                              onClick={() => {
                                setActiveModalAgent(null);
                                onNavigateToMap(m.name);
                              }}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/80 transition-colors flex items-center gap-1 shadow-sm"
                              title={`เปิดแท็บ Maps ที่ด่าน ${m.name}`}
                            >
                              <span>ดูด่านนี้</span>
                              <span className="text-red-400">➜</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500">ไม่มีข้อมูลแผนที่</p>
              )}
            </div>

            {/* 📜 ประวัติการแข่งขันล่าสุดที่เล่นตัวนี้ */}
            {activeModalAgent.recentMatches && activeModalAgent.recentMatches.length > 0 && (
              <div>
                <h4 className="text-sm font-black text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>⚔️</span> แมตช์ล่าสุดที่ใช้ {activeModalAgent.name}
                </h4>

                <div className="space-y-2">
                  {activeModalAgent.recentMatches.slice(0, 5).map((rm, rmIdx) => {
                    const isWin = rm.result === 'W';
                    const isDraw = rm.result === 'D';

                    return (
                      <div
                        key={rmIdx}
                        onClick={() => {
                          if (onMatchSelect && rm.matchRaw) {
                            setActiveModalAgent(null);
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
                          <div>
                            <p className="text-xs font-bold text-white uppercase">{rm.map}</p>
                            <p className="text-[10px] text-gray-500">{rm.mode}</p>
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
      )}
    </div>
  );
}
