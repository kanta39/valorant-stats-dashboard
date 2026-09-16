import { useState } from 'react';
import MatchCard from '../MatchCard';
import PerformanceTrendChart from '../PerformanceTrendChart';
import TeamImpactCard from '../TeamImpactCard';
import SideBiasCard from '../SideBiasCard';
import InfoTooltip from '../InfoTooltip';

export default function OverviewTab({ 
  displayedMatches = [], 
  activeSearchQuery = '', 
  filterMode = 'All', 
  loading = false, 
  onModeChange, 
  onMatchSelect, 
  agentImages = {}, 
  mapDetails = {},
  VALORANT_MODES = [] 
}) {
  const [resultFilter, setResultFilter] = useState('ALL'); // ALL, WIN, LOSS

  const targetName = (activeSearchQuery || "").split('#')[0].toLowerCase();

  // คำนวณผลลัพธ์ของแต่ละแมตช์
  const matchesWithOutcome = displayedMatches.map(match => {
    const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
    const myTeam = myPlayer?.team || 'Blue';
    const redScore = match.teams?.red ?? 0;
    const blueScore = match.teams?.blue ?? 0;
    const myScore = myTeam === 'Red' ? redScore : blueScore;
    const enemyScore = myTeam === 'Red' ? blueScore : redScore;

    const isDraw = redScore === blueScore;
    const isWin = !isDraw && myScore > enemyScore;
    const isLoss = !isDraw && myScore < enemyScore;

    const outcome = isDraw ? 'D' : (isWin ? 'W' : 'L');
    const pStats = myPlayer?.stats || {};

    return {
      ...match,
      myPlayer,
      myTeam,
      myScore,
      enemyScore,
      outcome,
      isWin,
      isLoss,
      isDraw,
      acs: pStats.acs || 0,
      kills: pStats.kills || match.raw_stats?.kills || 0,
      hsPercent: pStats.hs_percent || 0
    };
  });

  // คำนวณ Streak (สถิติต่อเนื่อง ชนะติด/แพ้ติด)
  let winStreak = 0;
  let lossStreak = 0;
  if (matchesWithOutcome.length > 0) {
    const firstOutcome = matchesWithOutcome[0].outcome;
    if (firstOutcome === 'W') {
      for (const m of matchesWithOutcome) {
        if (m.outcome === 'W') winStreak++;
        else break;
      }
    } else if (firstOutcome === 'L') {
      for (const m of matchesWithOutcome) {
        if (m.outcome === 'L') lossStreak++;
        else break;
      }
    }
  }

  // 5 นัดล่าสุด
  const recent5 = matchesWithOutcome.slice(0, 5);
  const recent5Wins = recent5.filter(m => m.isWin).length;
  const recent5WinRate = recent5.length > 0 ? Math.round((recent5Wins / recent5.length) * 100) : 0;

  // Best Match (แมตช์ที่คะแนนสูงสุด)
  let bestMatch = null;
  if (matchesWithOutcome.length > 0) {
    bestMatch = [...matchesWithOutcome].sort((a, b) => (b.acs || 0) - (a.acs || 0))[0];
  }

  // ค่าเฉลี่ย HS% และ ACS
  const totalMatchesCount = matchesWithOutcome.length;
  const avgHs = totalMatchesCount > 0 
    ? Math.round(matchesWithOutcome.reduce((acc, m) => acc + (m.hsPercent || 0), 0) / totalMatchesCount) 
    : 0;
  const avgAcs = totalMatchesCount > 0 
    ? Math.round(matchesWithOutcome.reduce((acc, m) => acc + (m.acs || 0), 0) / totalMatchesCount) 
    : 0;

  // กรองตาม Result Filter
  const filteredMatches = matchesWithOutcome.filter(m => {
    if (resultFilter === 'WIN') return m.isWin;
    if (resultFilter === 'LOSS') return m.isLoss;
    return true;
  });

  const totalWins = matchesWithOutcome.filter(m => m.isWin).length;
  const totalLosses = matchesWithOutcome.filter(m => m.isLoss).length;
  const totalDraws = matchesWithOutcome.filter(m => m.isDraw).length;

  return (
    <div className="w-full space-y-5 animate-fade-in pb-10">
      {/* 🧭 หัวข้อและ Dropdown เลือก Mode */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-200">
            ประวัติการแข่งขันของ <span className="text-red-400 font-extrabold">{activeSearchQuery.split('#')[0]}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            วิเคราะห์ฟอร์มล่าสุด สกอร์รอบ และคลิกการ์ดเพื่อเปิดดูตาราง Scoreboard เต็มรูปแบบ
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto relative">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">โหมด:</label>
          <select 
            value={filterMode} 
            onChange={onModeChange} 
            disabled={loading} 
            className="bg-gray-900 text-gray-200 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-700/80 focus:outline-none focus:border-red-500 transition-colors"
          >
            {VALORANT_MODES.map(mode => ( 
              <option key={mode.id} value={mode.id}>{mode.name}</option> 
            ))}
          </select>
          {loading && <span className="absolute -right-7 top-2.5 animate-spin text-red-500 text-lg">↻</span>}
        </div>
      </div>

      {/* 🔥 RECENT FORM & STREAK TRACKER BANNER 🔥 */}
      {displayedMatches.length > 0 && (
        <div className="bg-[#111823] border border-gray-800/90 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* ซีกซ้าย: สัญลักษณ์ Streak + แถบเม็ด W/L */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
            {/* Streak Status Badge */}
            {winStreak >= 2 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-black text-xs uppercase tracking-wider animate-pulse shadow-sm">
                <span>🔥</span>
                <span>ON FIRE! ({winStreak} WINS IN A ROW)</span>
              </div>
            ) : lossStreak >= 2 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 font-black text-xs uppercase tracking-wider shadow-sm">
                <span>🧊</span>
                <span>COLD STREAK ({lossStreak} LOSSES IN A ROW)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/80 border border-gray-700/60 text-gray-300 font-bold text-xs uppercase tracking-wider">
                <span>⚡</span>
                <span>MATCH FORM</span>
              </div>
            )}

            {/* เม็ดผลการแข่ง 5-10 นัดล่าสุด */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {matchesWithOutcome.slice(0, 10).map((m, mIdx) => (
                <div
                  key={mIdx}
                  onClick={() => onMatchSelect(m)}
                  title={`${m.map} (${m.myScore}-${m.enemyScore}) • คลิกดูสรุป`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs cursor-pointer transition-all hover:scale-110 shadow-sm ${
                    m.isWin 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30' 
                      : m.isDraw 
                      ? 'bg-gray-700/40 text-gray-300 border border-gray-600 hover:bg-gray-700/60' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                  }`}
                >
                  {m.outcome}
                </div>
              ))}
            </div>
          </div>

          {/* ซีกขวา: สรุปฟอร์ม 5 นัดล่าสุด */}
          <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-gray-800/60 flex-shrink-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">5 นัดล่าสุด</p>
            <p className="text-sm font-black text-white mt-0.5">
              WR <span className={recent5WinRate >= 50 ? 'text-green-400' : 'text-red-400'}>{recent5WinRate}%</span>
              <span className="text-xs text-gray-400 font-medium ml-1.5">({recent5Wins}W - {recent5.length - recent5Wins}L)</span>
            </p>
          </div>
        </div>
      )}

      {/* 🏆 PERFORMANCE HIGHLIGHTS (กล่องสรุป 3 ช่อง) 🏆 */}
      {displayedMatches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Best Match */}
          {bestMatch && (
            <div 
              onClick={() => onMatchSelect(bestMatch)}
              className="bg-gray-950/60 border border-gray-800/80 hover:border-yellow-500/40 p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all group"
            >
              <div className="w-11 h-11 bg-gray-900 rounded-xl border border-gray-700/80 p-1 flex-shrink-0 flex items-center justify-center shadow-inner">
                {agentImages[bestMatch.agent] ? (
                  <img src={agentImages[bestMatch.agent]} alt={bestMatch.agent} className="w-full h-full object-contain drop-shadow" />
                ) : (
                  <span className="text-xs font-bold text-gray-500">{String(bestMatch.agent).substring(0, 2)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-yellow-400 font-black uppercase flex items-center gap-1">
                  <span>👑</span> แมตช์คะแนนสูงสุด
                  <InfoTooltip 
                    title="แมตช์คะแนนสูงสุด (Peak Match)"
                    description="แมตช์ที่คุณทำคะแนน Combat Score (ACS) ได้สูงที่สุดจากประวัติแมตช์ที่กำลังแสดงผลอยู่"
                    position="bottom"
                    align="left"
                  />
                </p>
                <p className="text-xs font-black text-white truncate mt-0.5">{bestMatch.map}</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                  <span className="text-green-400 font-bold">{bestMatch.kills} Kills</span> • ACS {bestMatch.acs}
                </p>
              </div>
            </div>
          )}

          {/* Average Headshot */}
          <div className="bg-gray-950/60 border border-gray-800/80 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-900 rounded-xl border border-gray-700/80 p-1 flex-shrink-0 flex items-center justify-center text-blue-400 font-black text-lg shadow-inner">
              🎯
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <span>Headshot เฉลี่ย</span>
                <InfoTooltip 
                  title="Headshot % (ความแม่นยำเข้าหัว)"
                  description="สัดส่วนของกระสุนที่ยิงโดนศีรษะศัตรูเทียบกับจำนวนกระสุนที่ยิงโดนทั้งหมด (หัว + ตัว + ขา)"
                  benchmark="15-20%: มาตรฐาน | 20-25%: แม่นยำสูง | >25%: คมระดับโปร"
                  position="bottom"
                  align="left"
                />
              </p>
              <p className="text-lg font-black text-blue-400 mt-0.5">{avgHs}%</p>
              <p className="text-[10px] text-gray-500">ความแม่นยำทุกแมตช์</p>
            </div>
          </div>

          {/* Average Combat Score */}
          <div className="bg-gray-950/60 border border-gray-800/80 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-900 rounded-xl border border-gray-700/80 p-1 flex-shrink-0 flex items-center justify-center text-yellow-400 font-black text-lg shadow-inner">
              ⚡
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <span>Combat Score เฉลี่ย</span>
                <InfoTooltip 
                  title="ACS (Average Combat Score)"
                  description="คะแนนความสามารถในการต่อสู้เฉลี่ยต่อรอบ คำนวณจากดาเมจ, การคิล, การเปิดคิลแรก (First Kill), และการสังหารต่อเนื่อง"
                  benchmark="150-190: ทั่วไป | 200-240: โหด | >250: แบกเกม"
                  position="bottom"
                  align="left"
                />
              </p>
              <p className="text-lg font-black text-yellow-400 mt-0.5">
                {avgAcs >= 1000 ? avgAcs.toLocaleString() : avgAcs}
              </p>
              <p className="text-[10px] text-gray-500">ACS ต่อเกม</p>
            </div>
          </div>
        </div>
      )}

      {/* 📈 PERFORMANCE TREND & SLUMP DETECTOR 📈 */}
      {displayedMatches.length > 0 && (
        <PerformanceTrendChart 
          matches={displayedMatches}
          activeSearchQuery={activeSearchQuery}
          onMatchSelect={onMatchSelect}
        />
      )}

      {/* 🎯 TEAM IMPACT & CARRY INTELLIGENCE 🎯 */}
      {displayedMatches.length > 0 && (
        <TeamImpactCard 
          matches={displayedMatches}
          activeSearchQuery={activeSearchQuery}
        />
      )}

      {/* ⚔️ vs 🛡️ ATTACK vs DEFENSE SIDE MASTERY ⚔️ */}
      {displayedMatches.length > 0 && (
        <SideBiasCard 
          matches={displayedMatches}
          activeSearchQuery={activeSearchQuery}
        />
      )}

      {/* 🔘 QUICK RESULT FILTER BAR (ทั้งหมด / ชนะ / แพ้) 🔘 */}
      {displayedMatches.length > 0 && (
        <div className="flex items-center justify-between gap-2 bg-gray-950/60 p-2.5 rounded-2xl border border-gray-800/80">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setResultFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                resultFilter === 'ALL'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              ทั้งหมด ({totalMatchesCount})
            </button>

            <button
              onClick={() => setResultFilter('WIN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                resultFilter === 'WIN'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <span>🟢 ชนะ</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${resultFilter === 'WIN' ? 'bg-green-800 text-white' : 'bg-gray-800 text-gray-500'}`}>
                {totalWins}
              </span>
            </button>

            <button
              onClick={() => setResultFilter('LOSS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                resultFilter === 'LOSS'
                  ? 'bg-red-700 text-white shadow-lg shadow-red-700/20'
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <span>🔴 แพ้</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${resultFilter === 'LOSS' ? 'bg-red-900 text-white' : 'bg-gray-800 text-gray-500'}`}>
                {totalLosses}
              </span>
            </button>

            {totalDraws > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                (เสมอ {totalDraws})
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 font-bold hidden sm:block">
            แสดง <span className="text-red-400 font-black">{filteredMatches.length}</span> จาก {totalMatchesCount} แมตช์
          </p>
        </div>
      )}

      {/* ไม่พบประวัติ */}
      {displayedMatches.length === 0 && (
        <div className="text-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-3xl">
          <p className="text-base font-bold text-gray-400">ไม่พบประวัติการเล่นในโหมดที่คุณเลือก</p>
          <p className="text-xs text-gray-600 mt-1">ลองเปลี่ยนโหมดหรือค้นหาชื่อใหม่อีกครั้ง</p>
        </div>
      )}

      {/* 🎴 รายการ MATCH CARDS 🎴 */}
      <div className={loading ? 'opacity-30 pointer-events-none' : 'opacity-100 space-y-3'}>
        {filteredMatches.map((match, index) => (
          <MatchCard 
            key={match.match_id || index}
            match={match}
            agentImages={agentImages}
            mapDetails={mapDetails}
            activeSearchQuery={activeSearchQuery}
            onClick={() => onMatchSelect(match)}
          />
        ))}

        {displayedMatches.length > 0 && filteredMatches.length === 0 && (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-2xl">
            ไม่พบแมตช์ที่ตรงกับตัวกรองที่คุณเลือก
          </div>
        )}
      </div>
    </div>
  );
}
