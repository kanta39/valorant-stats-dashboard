import { calculateTeamImpactStats } from '../utils/helpers';
import InfoTooltip from './InfoTooltip';

export default function TeamImpactCard({ matches = [], activeSearchQuery = '' }) {
  if (!matches || matches.length === 0) return null;

  const impact = calculateTeamImpactStats(matches, activeSearchQuery);
  if (!impact) return null;

  return (
    <div className="bg-[#111823] border border-gray-800/90 rounded-2xl p-4 sm:p-5 shadow-xl animate-fade-in relative">
      {/* Ambient gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 via-red-500/5 to-transparent pointer-events-none rounded-tr-2xl overflow-hidden -z-0"></div>

      {/* Header (z-30 เพื่อให้ลอยเหนือ Persona Banner เสมอ) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 relative z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <h3 className="text-white text-xs sm:text-sm font-black tracking-widest uppercase flex items-center gap-1.5">
            <span>🎯</span> TEAM IMPACT & CARRY INTELLIGENCE
          </h3>
          <InfoTooltip 
            title="พลังการแบกและอิทธิพลต่อทีม"
            description="ประมวลผลข้อมูลจากผู้เล่นทั้ง 10 คนในทุกแมตช์ เพื่อวิเคราะห์ว่าคุณมีบทบาทสำคัญต่อชัยชนะของทีมมากน้อยเพียงใด"
            position="bottom"
            align="left"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-mono">
            ประมวลผล {impact.evaluatedMatches} แมตช์ล่าสุด
          </span>
        </div>
      </div>

      {/* Persona Banner (z-20) */}
      <div className={`mb-4 px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-20 ${impact.persona.color}`}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                {impact.persona.badge}
              </span>
              <span className="text-[11px] opacity-75 font-normal">
                ({impact.persona.sub})
              </span>
            </div>
            <p className="text-[11px] opacity-90 mt-0.5">{impact.persona.desc}</p>
          </div>
        </div>

        {/* Rating Meter */}
        <div className="flex items-center gap-1.5 bg-gray-950/60 px-3 py-1.5 rounded-lg border border-white/10 flex-shrink-0 self-start sm:self-auto">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Carry Score:</span>
          <span className="text-base font-black text-amber-300 font-mono">
            {impact.carryRating}
            <span className="text-[10px] text-gray-500 font-normal">/100</span>
          </span>
          <InfoTooltip 
            title="Carry Score (คะแนนพลังการแบก)"
            description="ดัชนีคะแนนรวม (0-100) คำนวณถ่วงน้ำหนักจาก Kill Share (40%), ดาเมจ ADR เหนือทีม (30%), และอัตราการได้ MVP (30%)"
            benchmark="≥75: แบกโหดมาก | 58-74: ตัวทำเกมหลัก | <58: สายซัพพอร์ต"
            position="bottom"
            align="right"
          />
        </div>
      </div>

      {/* 4 Analytics Grid (z-10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
        {/* 1. Team Kill Share */}
        <div className="bg-gray-950/70 border border-gray-800/90 rounded-xl p-3.5 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>🚀</span> สัดส่วนคิลในทีม (Kill Share)
              <InfoTooltip 
                title="สัดส่วนคิลในทีม (Team Kill Share)"
                description="เปอร์เซ็นต์ของจำนวนคิลทั้งหมดในทีมที่เกิดจากฝีมือของคุณ ในทีม 5 คน ค่าเฉลี่ยมาตรฐานจะอยู่ที่คนละ 20%"
                benchmark="≥28%: Hard Carry | 22-27%: Core Fragger | <22%: Support"
                position="bottom"
                align="left"
              />
            </span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {impact.killShare}%
            </span>
          </div>

          <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800 mb-2 relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, impact.killShare * 2))}%` }}
            ></div>
            {/* เส้นประ 20% (ค่าเฉลี่ย 1 ใน 5 คน) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-400/50"
              style={{ left: '40%' }}
              title="ค่าเฉลี่ยมาตรฐาน (20%)"
            ></div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
            <span>
              คุณทำไป <strong className="text-white">{impact.totalMyKills}</strong> จาก {impact.totalTeamKills} Kills ทั้งทีม
            </span>
            <span className="text-gray-500">(ค่าเฉลี่ย 20%)</span>
          </div>
        </div>

        {/* 2. MVP Honors */}
        <div className="bg-gray-950/70 border border-gray-800/90 rounded-xl p-3.5 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>👑</span> เกียรติยศ MVP ประจำแมตช์
              <InfoTooltip 
                title="เกียรติยศ MVP ประจำแมตช์"
                description="👑 Match MVP: ผู้เล่นที่มี Combat Score (ACS) สูงสุดในห้อง (ชนะทั้ง 10 คน) | ⭐ Team MVP: ผู้เล่นที่มี ACS สูงสุดในทีมเรา"
                benchmark="ยิ่งได้ Match MVP บ่อย ยิ่งการันตีความโดดเด่นเหนือทุกคนในห้อง"
                position="bottom"
                align="left"
              />
            </span>
            <span className="text-xs font-black text-yellow-300 font-mono">
              ติด MVP {impact.totalMVPPercent}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-[#0f1923] p-2 rounded-lg border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">👑</span>
                <span className="text-[10px] text-amber-300 font-bold">MATCH MVP</span>
              </div>
              <span className="text-xs font-black text-white font-mono">
                {impact.matchMVPsCount} <span className="text-[9px] text-gray-500">นัด</span>
              </span>
            </div>

            <div className="bg-[#0f1923] p-2 rounded-lg border border-yellow-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⭐</span>
                <span className="text-[10px] text-yellow-300 font-bold">TEAM MVP</span>
              </div>
              <span className="text-xs font-black text-white font-mono">
                {impact.teamMVPsCount} <span className="text-[9px] text-gray-500">นัด</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Damage Dominance */}
        <div className="bg-gray-950/70 border border-gray-800/90 rounded-xl p-3.5 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>💥</span> ดาเมจเฉลี่ยต่อรอบ (ADR)
              <InfoTooltip 
                title="Average Damage per Round (ADR)"
                description="ปริมาณดาเมจเฉลี่ยที่คุณสร้างใส่ศัตรูในแต่ละรอบ เปรียบเทียบกับค่าเฉลี่ยของเพื่อนร่วมทีมทั้ง 5 คน"
                benchmark="ค่าบวก (+) หมายถึงสร้างดาเมจได้มากกว่าค่าเฉลี่ยทีม"
                position="bottom"
                align="left"
              />
            </span>
            <span className={`text-xs font-black px-1.5 py-0.5 rounded border ${
              impact.adrDiffPercent >= 0 
                ? 'bg-green-500/15 text-green-400 border-green-500/30' 
                : 'bg-red-500/15 text-red-400 border-red-500/30'
            }`}>
              {impact.adrDiffPercent >= 0 ? `+${impact.adrDiffPercent}%` : `${impact.adrDiffPercent}%`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-[#0f1923] p-2.5 rounded-lg border border-gray-800">
            <div>
              <p className="text-[10px] text-gray-400">ADR ของคุณ</p>
              <p className="text-sm font-black text-white font-mono mt-0.5">{impact.avgMyADR}</p>
            </div>
            <div className="text-gray-600 font-mono text-xs">vs</div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">เฉลี่ยเพื่อนร่วมทีม</p>
              <p className="text-sm font-black text-gray-300 font-mono mt-0.5">{impact.avgTeamADR}</p>
            </div>
          </div>
        </div>

        {/* 4. Win Correlation */}
        <div className="bg-gray-950/70 border border-gray-800/90 rounded-xl p-3.5 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>📈</span> อิทธิพลต่อผลแพ้-ชนะ (Win Impact)
              <InfoTooltip 
                title="อิทธิพลต่อผลแพ้-ชนะ (Win Correlation)"
                description="เปรียบเทียบ Win Rate ของทีมในเกมที่คุณยิงได้คุ้มตัว (K/D ≥ 1.0) กับเกมที่ฟอร์มดรอป (K/D < 1.0) เพื่อดูว่าฟอร์มส่วนตัวส่งผลต่อการชนะของทีมแค่ไหน"
                benchmark="ตัวเลขบูสต์ยิ่งสูง แปลว่าเกมไหนคุณยิงได้ ทีมแทบจะการันตีชัยชนะ"
                position="bottom"
                align="left"
              />
            </span>
            {impact.winRateBoost > 0 && (
              <span className="text-[10px] font-bold text-green-400">
                บูสต์ทีม +{impact.winRateBoost}% WR
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {/* When K/D >= 1.0 */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-300 flex items-center gap-1">
                <span>🟢</span> เมื่อ K/D ≥ 1.0 ({impact.highKdMatches} นัด)
              </span>
              <span className="font-mono font-bold text-green-400">WR {impact.highKdWinRate}%</span>
            </div>
            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${impact.highKdWinRate}%` }}
              ></div>
            </div>

            {/* When K/D < 1.0 */}
            <div className="flex items-center justify-between text-[10px] pt-1">
              <span className="text-gray-400 flex items-center gap-1">
                <span>🔴</span> เมื่อ K/D &lt; 1.0 ({impact.lowKdMatches} นัด)
              </span>
              <span className="font-mono font-bold text-red-400">WR {impact.lowKdWinRate}%</span>
            </div>
            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${impact.lowKdWinRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
