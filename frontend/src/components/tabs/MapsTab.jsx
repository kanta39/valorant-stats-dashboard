export default function MapsTab({ mapStatsArray }) {
  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <span className="text-red-500">🗺️</span> MAP WIN RATES
        </h2>
        <p className="text-sm text-gray-500 mt-1">สถิติอัตราการชนะแยกตามแผนที่ (จัดเรียงจากด่านที่เล่นบ่อยสุด)</p>
      </div>

      {mapStatsArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mapStatsArray.map((mapData, idx) => {
            const winRate = mapData.matches > 0 ? ((mapData.w / mapData.matches) * 100) : 0;
            const winColor = winRate >= 50 ? "bg-green-500" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
            const textColor = winRate >= 50 ? "text-green-400" : "text-red-400";
            
            return (
              <div key={idx} className="bg-[#111823] border border-gray-800/80 rounded-2xl p-6 hover:border-gray-600 transition-colors relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[160px]">
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest">{mapData.name}</h3>
                    <p className="text-[11px] text-gray-500 font-bold mt-1 uppercase tracking-wider">{mapData.matches} Matches Played</p>
                  </div>
                  <div className={`text-2xl font-black ${textColor}`}>
                    {winRate.toFixed(1)}%
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden mb-3 border border-gray-800">
                    <div className={`h-full transition-all duration-1000 ${winColor}`} style={{ width: `${winRate}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
                    <span className="text-green-400">{mapData.w} WINS</span>
                    <span className="text-gray-600">{mapData.d} DRAWS</span>
                    <span className="text-red-400">{mapData.l} LOSSES</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 border border-dashed border-gray-800 rounded-2xl">ไม่พบข้อมูลแผนที่ในโหมดนี้</div>
      )}
    </div>
  );
}
