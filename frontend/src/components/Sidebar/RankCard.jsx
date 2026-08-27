export default function RankCard({ rank, rankImages }) {
  if (!rank) return null;

  return (
    <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in relative overflow-hidden mb-5">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full"></div>
      
      <h3 className="text-white text-base font-black tracking-widest uppercase mb-4 flex items-center gap-2 relative z-10">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        COMPETITIVE RANK
      </h3>
      
      <div className="flex items-center justify-between relative z-10 mt-2">
        <div className="flex flex-col items-center w-1/2 border-r border-gray-800 px-2">
          <span className="text-[10px] text-gray-500 font-bold mb-3 tracking-widest uppercase">ปัจจุบัน (Current)</span>
          <div className="h-14 flex items-center justify-center mb-3">
            {rankImages[String(rank.current || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"] ? (
              <img 
                src={rankImages[String(rank.current || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"]} 
                alt={rank.current || "Unranked"} 
                className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] scale-110" 
              />
            ) : (
              <span className="text-xs text-gray-500">No Icon</span>
            )}
          </div>
          <span className="text-sm font-black text-white uppercase text-center leading-tight drop-shadow-md">
            {rank.current || "Unranked"}
          </span>
        </div>
        
        <div className="flex flex-col items-center w-1/2 px-2">
          <span className="text-[10px] text-gray-500 font-bold mb-3 tracking-widest uppercase">สูงสุด (Peak)</span>
          <div className="h-14 flex items-center justify-center mb-3">
            {rankImages[String(rank.peak || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"] ? (
              <img 
                src={rankImages[String(rank.peak || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"]} 
                alt={rank.peak || "Unranked"} 
                className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,200,87,0.2)] scale-110" 
              />
            ) : (
              <span className="text-xs text-gray-500">No Icon</span>
            )}
          </div>
          <span className="text-sm font-black text-[#ffc857] uppercase text-center leading-tight drop-shadow-md">
            {rank.peak || "Unranked"}
          </span>
        </div>
      </div>
    </div>
  );
}
