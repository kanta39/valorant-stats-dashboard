export default function SearchHistoryDropdown({
  history = [],
  isOpen = false,
  onSelect,
  onRemove,
  onClearAll,
  dropdownRef,
  className = ''
}) {
  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute left-0 right-0 top-full mt-2 bg-[#0f1923] border border-gray-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-fade-in backdrop-blur-xl ${className}`}
      onMouseDown={(e) => e.stopPropagation()} // ป้องกัน blur ก่อนคลิก
    >
      {/* Header ของ Dropdown */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-950/80 border-b border-gray-800/80 text-[11px] font-bold">
        <span className="text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
          <span>🕒</span> ประวัติการค้นหา ({history.length})
        </span>
        {history.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearAll?.();
            }}
            className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer text-[10px]"
          >
            ล้างทั้งหมด
          </button>
        )}
      </div>

      {/* รายการประวัติ */}
      <div className="max-h-60 overflow-y-auto divide-y divide-gray-800/40 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {history.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500">
            ยังไม่มีประวัติการค้นหาล่าสุด
          </div>
        ) : (
          history.map((item, idx) => {
            const queryStr = typeof item === 'string' ? item : item.query;
            const [name, tag] = queryStr.includes('#') 
              ? queryStr.split('#') 
              : [queryStr, ''];

            return (
              <div
                key={queryStr + idx}
                onClick={() => onSelect?.(queryStr)}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-800/60 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <span className="text-gray-500 group-hover:text-red-400 transition-colors text-xs flex-shrink-0">
                    🔍
                  </span>
                  <div className="truncate flex items-baseline gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-white group-hover:text-red-400 transition-colors truncate">
                      {name}
                    </span>
                    {tag && (
                      <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">
                        #{tag}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  title="ลบรายการนี้"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.(queryStr);
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-gray-700/50 transition-colors flex-shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
