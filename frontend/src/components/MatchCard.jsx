export default function MatchCard({ match, agentImages, onClick }) {
  return (
    <div onClick={onClick} className="bg-gray-900 border border-gray-800/80 p-4 sm:p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-12 items-center gap-4 shadow-lg hover:border-red-500/50 hover:bg-gray-900/80 cursor-pointer transition-all tabular-nums">
      <div className="col-span-1 sm:col-span-5 flex items-center gap-4 sm:gap-5 w-full">
        <div className="flex flex-col items-center justify-center bg-gray-950/80 p-2 rounded-xl border border-gray-800 min-w-[80px]">
          {agentImages[match.agent] ? ( <img src={agentImages[match.agent]} alt={match.agent} className="w-12 h-12 object-contain" /> ) : ( <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-full text-xs font-bold border border-gray-700">{String(match.agent || "UN").substring(0, 2).toUpperCase()}</div> )}
          <span className="font-extrabold text-[11px] text-gray-400 mt-1 uppercase tracking-wider">{match.agent || "Unknown"}</span>
        </div>
        <div className="overflow-hidden">
          <h3 className="font-black text-white text-lg tracking-wide truncate">{match.map || "Unknown Map"}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block bg-gray-800 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-700">{match.mode || "Unknown Mode"}</span>
          </div>
        </div>
      </div>

      <div className="col-span-1 sm:col-span-4 flex flex-col items-center justify-center bg-gray-950/50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
        <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-widest uppercase">K / D / A</p>
        <div className="font-black text-lg text-gray-200 flex items-center justify-center">
          <span className="text-green-400 w-8 text-right">{match.raw_stats?.kills || 0}</span>
          <span className="text-gray-700 mx-2">/</span>
          <span className="text-red-500 w-8 text-center">{match.raw_stats?.deaths || 0}</span>
          <span className="text-gray-700 mx-2">/</span>
          <span className="text-blue-400 w-8 text-left">{match.raw_stats?.assists || 0}</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Ratio: <span className="text-gray-200 font-bold">{Number(match.analysis?.kda_ratio || 0).toFixed(2)}</span></p>
      </div>

      <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-end items-center gap-5 w-full">
        <div className="text-left sm:text-right">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Score</p>
          <p className="text-sm font-black text-gray-200 w-16">{match.analysis?.performance_score || 0}<span className="text-gray-600 text-[10px]">/100</span></p>
        </div>
        <div className="bg-gray-950 w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-700 shadow-inner flex-shrink-0">
          <span className="text-2xl font-black text-yellow-400 drop-shadow-md">{String(match.analysis?.grade || "N/A").split(" ")[0]}</span>
        </div>
      </div>
    </div>
  );
}
