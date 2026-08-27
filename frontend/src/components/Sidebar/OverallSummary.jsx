export default function OverallSummary({ overallStats }) {
  if (!overallStats) return null;

  return (
    <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in">
      <h3 className="text-white text-base font-black tracking-widest uppercase mb-4 flex items-center gap-2">
        <span className="text-yellow-500">📈</span> OVERALL SUMMARY
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/40 border border-gray-800/60 p-3 rounded-xl text-center">
          <p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">Win Rate</p>
          <p className="text-2xl font-black text-green-400 mt-1">{overallStats.winRate.toFixed(1)}%</p>
          <p className="text-[10px] text-gray-400 mt-1">{overallStats.wins}W - {overallStats.losses}L</p>
        </div>
        <div className="bg-gray-900/40 border border-gray-800/60 p-3 rounded-xl text-center">
          <p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">KDA Ratio</p>
          <p className="text-2xl font-black text-white mt-1">{overallStats.kdaRatio}</p>
          <p className="text-[10px] font-mono text-blue-400 mt-1">{overallStats.totalKills}/{overallStats.totalDeaths}/{overallStats.totalAssists}</p>
        </div>
      </div>
      <p className="text-[10px] text-gray-500 text-center font-bold tracking-widest uppercase mt-4">
        Calculated from last {overallStats.totalMatches} matches
      </p>
    </div>
  );
}
