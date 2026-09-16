import { analyzeMatchSides } from '../utils/helpers';
import InfoTooltip from './InfoTooltip';

export default function SideBiasCard({ matches = [], activeSearchQuery = '' }) {
  if (!matches || matches.length === 0) return null;

  let totalAtkRounds = 0;
  let totalAtkWon = 0;
  let totalDefRounds = 0;
  let totalDefWon = 0;
  let totalPistolRounds = 0;
  let totalPistolWon = 0;

  matches.forEach(match => {
    const analysis = analyzeMatchSides(match, activeSearchQuery);
    if (!analysis) return;

    totalAtkRounds += analysis.attack.total;
    totalAtkWon += analysis.attack.won;

    totalDefRounds += analysis.defense.total;
    totalDefWon += analysis.defense.won;

    totalPistolRounds += analysis.pistol.total;
    totalPistolWon += analysis.pistol.won;
  });

  const totalRounds = totalAtkRounds + totalDefRounds;
  if (totalRounds === 0) return null;

  const atkWinRate = totalAtkRounds > 0 ? Math.round((totalAtkWon / totalAtkRounds) * 100) : 0;
  const defWinRate = totalDefRounds > 0 ? Math.round((totalDefWon / totalDefRounds) * 100) : 0;
  const pistolWinRate = totalPistolRounds > 0 ? Math.round((totalPistolWon / totalPistolRounds) * 100) : 0;

  const diff = atkWinRate - defWinRate;

  // กำหนด Tactical Persona ตามสถิติจริง
  let persona = {
    badge: '⚖️ BALANCED TACTICIAN',
    sub: 'กลยุทธ์สมดุลรอบด้าน',
    desc: 'ผลงานคงเส้นคงวาทั้งเกมรุกและเกมรับ ไม่ว่าจะอยู่ฝั่งไหนก็รักษามาตรฐานได้ดี',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
  };

  if (diff >= 5) {
    persona = {
      badge: '💥 AGGRESSIVE ATTACKER',
      sub: 'เจ้าแห่งเกมบุกทะลวง',
      desc: `ผลงานฝั่งบุกเฉียบคม เปิดไซต์และเจาะทำแต้มได้เหนือกว่าฝั่งรับ (+${diff}% เหนือฝั่งรับ)`,
      color: 'border-red-500/40 text-red-400 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
    };
  } else if (diff <= -5) {
    persona = {
      badge: '🛡️ IRONCLAD DEFENDER',
      sub: 'ปราการเหล็กตั้งรับ',
      desc: `เซ็ตเกมรับเหนียวแน่น ดักมุมและป้องกันพื้นที่ได้รัดกุมกว่า (+${Math.abs(diff)}% เหนือฝั่งบุก)`,
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
    };
  }

  return (
    <div className="bg-[#111823] border border-gray-800/90 rounded-2xl p-4 sm:p-5 shadow-xl animate-fade-in relative">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-500/10 via-cyan-500/5 to-transparent pointer-events-none rounded-tr-2xl overflow-hidden"></div>

      {/* Header (z-30) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 relative z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <h3 className="text-white text-xs sm:text-sm font-black tracking-widest uppercase">
            ATTACK vs DEFENSE SIDE BIAS
          </h3>
          <InfoTooltip 
            title="ความถนัดฝั่งบุก vs ฝั่งรับ"
            description="เปรียบเทียบอัตราการชนะระหว่างฝั่งบุก (วางสไปก์) และฝั่งรับ (กู้สไปก์) เพื่อให้คุณรู้ว่าด่านไหนควรเน้นแผนรุกหรือแผนตั้งรับ"
            position="bottom"
            align="left"
          />
        </div>
        <span className="text-[10px] text-gray-400 font-mono">
          จากทั้งหมด {totalRounds} รอบ ({matches.length} แมตช์)
        </span>
      </div>

      {/* Persona Banner (z-20) */}
      <div className={`mb-4 px-3.5 py-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-20 ${persona.color}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider">{persona.badge}</span>
          <span className="text-[10px] opacity-75 font-normal">({persona.sub})</span>
        </div>
        <span className="text-[11px] opacity-90">{persona.desc}</span>
      </div>

      {/* Dual Side Comparison Grid (z-10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 relative z-10">
        {/* ⚔️ ATTACK SIDE */}
        <div className="bg-gray-950/70 border border-red-500/30 rounded-xl p-3.5 relative overflow-hidden group hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">⚔️</span>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-wider">ฝั่งบุก (ATTACK)</p>
                <p className="text-[10px] text-gray-400 font-mono">
                  {totalAtkWon} ชนะ / {totalAtkRounds - totalAtkWon} แพ้
                </p>
              </div>
            </div>
            <span className="text-2xl font-black text-red-400 tabular-nums">
              {atkWinRate}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
            <div 
              style={{ width: `${atkWinRate}%` }} 
              className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-700 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-gray-500 font-bold uppercase mt-1.5">
            <span>Win Rate ฝั่งบุก</span>
            <span>{totalAtkRounds} รอบ</span>
          </div>
        </div>

        {/* 🛡️ DEFENSE SIDE */}
        <div className="bg-gray-950/70 border border-cyan-500/30 rounded-xl p-3.5 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-wider">ฝั่งรับ (DEFENSE)</p>
                <p className="text-[10px] text-gray-400 font-mono">
                  {totalDefWon} ชนะ / {totalDefRounds - totalDefWon} แพ้
                </p>
              </div>
            </div>
            <span className="text-2xl font-black text-cyan-400 tabular-nums">
              {defWinRate}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
            <div 
              style={{ width: `${defWinRate}%` }} 
              className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-700 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-gray-500 font-bold uppercase mt-1.5">
            <span>Win Rate ฝั่งรับ</span>
            <span>{totalDefRounds} รอบ</span>
          </div>
        </div>
      </div>

      {/* 🎯 PISTOL ROUND STATS BAR */}
      <div className="bg-gray-950/60 border border-gray-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🎯</span>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>PISTOL ROUND MASTERY (รอบปืนพก)</span>
              <InfoTooltip 
                title="รอบปืนพก (Pistol Round)"
                description="รอบที่ 1 และรอบเริ่มครึ่งหลัง ทีมที่ชนะรอบปืนพกจะมีเงินซื้อปืนและเกราะเหนือกว่าใน 2-3 รอบถัดไป ซึ่งเป็นตัวชี้วัดโมเมนตัมหลักของเกม"
                benchmark="≥50%: คุมโมเมนตัมต้นเกมได้ดี"
                position="top"
                align="left"
              />
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded border ${
                pistolWinRate >= 50 
                  ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {pistolWinRate}% WR
              </span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              ชนะ {totalPistolWon} จาก {totalPistolRounds} รอบแรกของครึ่ง (รอบ 1 และรอบหลังสลับฝั่ง)
            </p>
          </div>
        </div>

        <span className="text-[10px] text-gray-500 font-medium">
          {pistolWinRate >= 50 ? '✨ คุมโมเมนตัมต้นเกมและ Economy ได้ดีเยี่ยม' : '🩹 วอร์มยิงปืนพกก่อนเล่นเพื่อเพิ่มแต้มต้นเกม'}
        </span>
      </div>
    </div>
  );
}
