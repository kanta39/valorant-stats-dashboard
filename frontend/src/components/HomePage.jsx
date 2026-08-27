export default function HomePage({ searchQuery, setSearchQuery, onSearch, loading, errorMsg }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-5 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-black text-red-500 tracking-wider mb-2">VALORANT STATS</h1>
        <p className="text-gray-400 text-sm md:text-base tracking-widest uppercase">Enter your Riot ID to view match history</p>
      </div>
      <div className="w-full max-w-2xl bg-gray-900/60 p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl mb-8">
        <div className="flex flex-col gap-5">
          <input type="text" placeholder="ชื่อผู้เล่น#แท็ก (เช่น Jett#TH1)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyPress} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-6 py-4 text-white text-xl md:text-2xl text-center focus:border-red-500" spellCheck="false" />
          <button onClick={onSearch} disabled={loading} className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl w-full text-lg shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            {loading ? "กำลังสแกนและดึงข้อมูล..." : "ค้นหาประวัติการแข่งขัน"}
          </button>
        </div>
      </div>
      {errorMsg && <div className="text-red-400 font-bold bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/50">⚠️ {errorMsg}</div>}
    </div>
  );
}
