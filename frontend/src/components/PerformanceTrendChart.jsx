import { useState } from 'react';

export default function PerformanceTrendChart({ 
  matches = [], 
  activeSearchQuery = '', 
  onMatchSelect 
}) {
  const [metric, setMetric] = useState('acs'); // 'acs', 'kd', 'hs'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!matches || matches.length === 0) return null;

  const targetName = (activeSearchQuery || '').split('#')[0].toLowerCase();

  // ดึงข้อมูล 15 นัดล่าสุด เรียงจากอดีต -> ปัจจุบัน (ซ้ายไปขวา)
  const recentMatches = [...matches].slice(0, 15).reverse();
  if (recentMatches.length < 2) return null;

  const dataPoints = recentMatches.map((m, idx) => {
    const myPlayer = m.scoreboard?.find(p => String(p.name || '').toLowerCase() === targetName);
    const pStats = myPlayer?.stats || {};
    const rawStats = m.raw_stats || {};

    const acs = Number(pStats.acs ?? (rawStats.kills ? Math.round((m.analysis?.performance_score || 0) * 2.5) : 0));
    const kd = Number(pStats.kd ?? (m.analysis?.kda_ratio ?? (rawStats.deaths > 0 ? (rawStats.kills / rawStats.deaths) : rawStats.kills)));
    const hs = Number(pStats.hs_percent ?? 0);

    let val = acs;
    if (metric === 'kd') val = Number(kd.toFixed(2));
    if (metric === 'hs') val = hs;

    return {
      match: m,
      index: idx,
      map: m.map || 'Unknown',
      agent: m.agent || myPlayer?.agent || 'Agent',
      mode: m.mode || 'Match',
      acs,
      kd: Number(kd.toFixed(2)),
      hs,
      val
    };
  });

  const values = dataPoints.map(d => d.val);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = Math.max(1, maxVal - minVal);

  // คำนวณสถานะฟอร์ม (Form Detector: เปรียบเทียบ 3 นัดล่าสุดกับค่าเฉลี่ยทั้งหมด)
  const totalAvg = values.reduce((a, b) => a + b, 0) / values.length;
  const last3 = values.slice(-3);
  const last3Avg = last3.reduce((a, b) => a + b, 0) / last3.length;
  const diffPercent = totalAvg > 0 ? Math.round(((last3Avg - totalAvg) / totalAvg) * 100) : 0;

  let formStatus = {
    badge: '⚖️ STEADY FORM',
    desc: 'ฟอร์มคงเส้นคงวา รักษามาตรฐานได้ดี',
    color: 'text-gray-300 bg-gray-800/80 border-gray-700'
  };

  if (diffPercent >= 15) {
    formStatus = {
      badge: '🚀 PEAK FORM',
      desc: `ช่วงมือขึ้น! 3 นัดล่าสุดทำได้ดีกว่าค่าเฉลี่ย +${diffPercent}%`,
      color: 'text-green-400 bg-green-500/15 border-green-500/40 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
    };
  } else if (diffPercent <= -15) {
    formStatus = {
      badge: '📉 SLUMP DETECTED',
      desc: `ฟอร์มดรอป 3 นัดล่าสุดลดลง ${diffPercent}% แนะนำให้พักหรือซ้อมมือก่อน`,
      color: 'text-red-400 bg-red-500/15 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
    };
  }

  // มิติของ SVG กราฟ
  const svgWidth = 600;
  const svgHeight = 140;
  const padX = 25;
  const padY = 20;

  const points = dataPoints.map((d, i) => {
    const x = padX + (i / (dataPoints.length - 1)) * (svgWidth - padX * 2);
    const y = padY + (1 - (d.val - minVal) / valRange) * (svgHeight - padY * 2);
    return { ...d, x, y };
  });

  // สร้าง SVG Path สำหรับเส้นกราฟ
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // สร้าง Area Path สำหรับ Gradient เติมใต้เส้น
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  // สีตาม Metric
  const themeColors = {
    acs: { stroke: '#f59e0b', fill: 'url(#acsGrad)', dot: '#f59e0b', label: 'ACS (Combat Score)' },
    kd: { stroke: '#22c55e', fill: 'url(#kdGrad)', dot: '#22c55e', label: 'K/D Ratio' },
    hs: { stroke: '#3b82f6', fill: 'url(#hsGrad)', dot: '#3b82f6', label: 'Headshot %' }
  };

  const currentTheme = themeColors[metric];

  return (
    <div className="bg-[#111823] border border-gray-800/90 rounded-2xl p-4 sm:p-5 shadow-xl animate-fade-in relative overflow-hidden">
      {/* Header & Metric Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
          <h3 className="text-white text-xs sm:text-sm font-black tracking-widest uppercase">
            PERFORMANCE TREND (15 MATCHES)
          </h3>
        </div>

        {/* ปุ่มเลือก Metric */}
        <div className="flex items-center gap-1 bg-gray-950/80 p-1 rounded-xl border border-gray-800/80">
          <button
            onClick={() => { setMetric('acs'); setHoveredPoint(null); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              metric === 'acs'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚡ ACS
          </button>
          <button
            onClick={() => { setMetric('kd'); setHoveredPoint(null); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              metric === 'kd'
                ? 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎯 K/D
          </button>
          <button
            onClick={() => { setMetric('hs'); setHoveredPoint(null); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              metric === 'hs'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💥 HS%
          </button>
        </div>
      </div>

      {/* Form Status Detector Banner */}
      <div className={`mb-3 px-3 py-1.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${formStatus.color}`}>
        <span className="text-xs font-black uppercase tracking-wider">{formStatus.badge}</span>
        <span className="text-[11px] opacity-90">{formStatus.desc}</span>
      </div>

      {/* Chart SVG */}
      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-28 sm:h-36 overflow-visible"
        >
          <defs>
            <linearGradient id="acsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="kdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="hsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* เส้น Grid แนวนอน */}
          <line x1={padX} y1={padY} x2={svgWidth - padX} y2={padY} stroke="#374151" strokeOpacity="0.3" strokeDasharray="3 3" />
          <line x1={padX} y1={svgHeight / 2} x2={svgWidth - padX} y2={svgHeight / 2} stroke="#374151" strokeOpacity="0.3" strokeDasharray="3 3" />
          <line x1={padX} y1={svgHeight - padY} x2={svgWidth - padX} y2={svgHeight - padY} stroke="#374151" strokeOpacity="0.3" strokeDasharray="3 3" />

          {/* Area Gradient Fill */}
          <path d={areaD} fill={currentTheme.fill} />

          {/* Main Line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke={currentTheme.stroke} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Interactive Data Nodes */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.index === p.index ? 5.5 : 3.5}
              fill="#0f172a"
              stroke={currentTheme.stroke}
              strokeWidth={hoveredPoint?.index === p.index ? 3 : 2}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(p)}
              onClick={() => onMatchSelect && onMatchSelect(p.match)}
            />
          ))}
        </svg>

        {/* Floating Tooltip เมื่อ Hover จุด Node */}
        {hoveredPoint && (
          <div 
            className="absolute top-1 right-2 bg-gray-950/95 border border-gray-700/90 rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none text-right z-10"
          >
            <p className="text-xs font-black text-white flex items-center justify-end gap-1.5">
              <span>{hoveredPoint.map}</span>
              <span className="text-[10px] text-gray-400 font-normal">({hoveredPoint.agent})</span>
            </p>
            <p className="text-[11px] font-mono text-gray-300 mt-0.5">
              {metric === 'acs' && <span className="text-yellow-400 font-bold">{hoveredPoint.acs} ACS</span>}
              {metric === 'kd' && <span className="text-green-400 font-bold">{hoveredPoint.kd} K/D</span>}
              {metric === 'hs' && <span className="text-blue-400 font-bold">{hoveredPoint.hs}% HS</span>}
            </p>
          </div>
        )}
      </div>

      {/* Axis Labels (Oldest -> Newest) */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase mt-1 px-1">
        <span>← อดีต ({points[0]?.map})</span>
        <span className="text-gray-400">ค่าเฉลี่ย: {Math.round(totalAvg)}{metric === 'hs' ? '%' : ''}</span>
        <span>นัดล่าสุด ({points[points.length - 1]?.map}) →</span>
      </div>
    </div>
  );
}
