export default function Navbar({ activeTab, setActiveTab, searchQuery, setSearchQuery, onSearch, loading }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-90 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:w-auto">
        <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform whitespace-nowrap" onClick={() => window.location.reload()}>
          <h1 className="text-xl font-black text-red-500 tracking-wider drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">VALORANT STATS</h1>
        </div>
        <span className="text-gray-700 text-xl font-light hidden sm:block">|</span>
        <div className="flex gap-5 sm:gap-6 overflow-x-auto w-full sm:w-auto justify-center sm:justify-start">
          {['overview', 'agents', 'maps'].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`py-1 text-sm font-bold tracking-widest uppercase transition-all whitespace-nowrap ${ activeTab === tab ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-gray-200 border-b-2 border-transparent" }`}
            > {tab} </button>
          ))}
        </div>
      </div>
      <div className="flex w-full lg:w-auto max-w-md gap-2">
        <input type="text" placeholder="ชื่อผู้เล่น#แท็ก" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyPress} className="w-full sm:w-64 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-all font-bold" spellCheck="false" />
        <button onClick={onSearch} disabled={loading} className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold py-2 px-4 rounded-xl text-sm whitespace-nowrap">ค้นหาใหม่</button>
      </div>
    </nav>
  );
}
