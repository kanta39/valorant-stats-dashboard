export default function AgentsTab({ agentStatsArray, agentImages, agentRoles }) {
  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <span className="text-red-500">🕵️‍♂️</span> AGENT ANALYTICS
        </h2>
        <p className="text-sm text-gray-500 mt-1">สถิติการเล่นแยกตามเอเจนต์ของคุณ (จัดเรียงตามความถี่ที่เล่นบ่อยสุด)</p>
      </div>

      {agentStatsArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {agentStatsArray.map((agent, idx) => {
            const winRate = agent.matches > 0 ? ((agent.w / agent.matches) * 100) : 0;
            const kda = agent.death > 0 ? ((agent.k + agent.a) / agent.death).toFixed(2) : (agent.k + agent.a).toFixed(2);
            
            return (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-red-500/50 transition-colors relative overflow-hidden group shadow-lg">
                <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-20 transition-opacity">
                  {agentImages[agent.name] && <img src={agentImages[agent.name]} alt="bg" className="w-32 h-32 object-cover scale-150" />}
                </div>
                
                <div className="flex items-center gap-4 relative z-10 mb-4">
                  <div className="w-16 h-16 bg-gray-950 rounded-xl border border-gray-700 p-1 flex-shrink-0">
                    {agentImages[agent.name] ? (
                      <img src={agentImages[agent.name]} alt={agent.name} className="w-full h-full object-contain drop-shadow-md" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                        {String(agent.name || "UN").substring(0,2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">{agent.name}</h3>
                    <p className="text-xs text-gray-400 font-bold">{agentRoles[agent.name] || 'Unknown Role'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  <div className="bg-gray-950/50 p-2 rounded-lg border border-gray-800 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Win Rate</p>
                    <p className={`text-lg font-black ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{winRate.toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-400">{agent.w}W - {agent.l}L</p>
                  </div>
                  <div className="bg-gray-950/50 p-2 rounded-lg border border-gray-800 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">KDA</p>
                    <p className="text-lg font-black text-white">{kda}</p>
                    <p className="text-[10px] font-mono text-gray-400">{agent.k}/{agent.death}/{agent.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 border border-dashed border-gray-800 rounded-2xl">ไม่พบข้อมูลเอเจนต์ในโหมดนี้</div>
      )}
    </div>
  );
}
