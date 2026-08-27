import MatchCard from '../MatchCard';

export default function OverviewTab({ displayedMatches, activeSearchQuery, filterMode, loading, onModeChange, onMatchSelect, agentImages, VALORANT_MODES }) {
  return (
    <div className="w-full space-y-4 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-gray-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-300">ประวัติการเล่นของ <span className="text-red-400 font-extrabold">{activeSearchQuery.split('#')[0]}</span></h2>
          <p className="text-xs text-gray-500 mt-1">คลิกที่การ์ดเพื่อเปิดดูตาราง Scoreboard เต็มรูปแบบ</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto relative">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:block">Mode:</label>
          <select value={filterMode} onChange={onModeChange} disabled={loading} className="bg-gray-900 text-gray-200 font-bold text-sm px-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500">
            {VALORANT_MODES.map(mode => ( <option key={mode.id} value={mode.id}>{mode.name}</option> ))}
          </select>
          {loading && <span className="absolute -right-8 top-2.5 animate-spin text-red-500 text-xl">↻</span>}
        </div>
      </div>

      {displayedMatches.length === 0 && (
        <div className="text-center py-10 text-gray-500 border border-dashed border-gray-800 rounded-2xl">ไม่พบประวัติการเล่นในโหมดที่คุณเลือก</div>
      )}

      <div className={loading ? 'opacity-30 pointer-events-none' : 'opacity-100 space-y-4'}>
        {displayedMatches.map((match, index) => (
          <MatchCard 
            key={match.match_id || index}
            match={match}
            agentImages={agentImages}
            onClick={() => onMatchSelect(match)}
          />
        ))}
      </div>
    </div>
  );
}
