export default function RolesPerformance({ roleStatsArray, roleIcons }) {
  return (
    <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in">
      <h3 className="text-white text-base font-black tracking-widest uppercase mb-4 flex items-center gap-2">
        <span className="text-red-500">🎯</span> ROLES PERFORMANCE
      </h3>
      <div className="flex flex-col gap-3">
        {roleStatsArray.length > 0 ? roleStatsArray.map((role, idx) => {
          const winRate = role.matches > 0 ? ((role.w / role.matches) * 100) : 0;
          const kda = role.death > 0 ? ((role.k + role.a) / role.death).toFixed(2) : (role.k + role.a).toFixed(2);
          const circumference = 125.6; 
          const dashOffset = circumference - (winRate / 100) * circumference;

          return (
            <div key={idx} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-gray-800/60 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center bg-gray-950 rounded-full shadow-inner">
                  <svg className="absolute top-0 left-0 w-full h-full -rotate-90 transform">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-800" />
                    <circle 
                      cx="24" cy="24" r="20" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      fill="none" 
                      className="text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)] transition-all duration-1000" 
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  {roleIcons[role.name] ? (
                    <img src={roleIcons[role.name]} className="w-5 h-5 opacity-90" alt={role.name} />
                  ) : (
                    <span className="text-[10px] text-gray-500 font-bold">{String(role.name || "UN").substring(0,2)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-white font-bold text-sm leading-none">{role.name}</p>
                  <p className="text-xs text-gray-300 font-bold mt-1.5">WR {winRate.toFixed(1)}%</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">{role.w}W - {role.l}L</p>
                </div>
              </div>
              <div className="text-right flex flex-col justify-center">
                <p className="text-white font-black text-sm">KDA {kda}</p>
                <p className="text-[10px] font-mono text-blue-400 mt-1">
                  {role.k}<span className="text-gray-600">/</span><span className="text-red-400">{role.death}</span><span className="text-gray-600">/</span>{role.a}
                </p>
              </div>
            </div>
          )
        }) : (
          <div className="text-center text-gray-600 py-4 text-xs border border-dashed border-gray-800 rounded-xl">ไม่พบข้อมูลสายการเล่น</div>
        )}
      </div>
    </div>
  );
}
