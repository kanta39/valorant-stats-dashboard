import { useState, useRef, useEffect } from 'react';

export default function InfoTooltip({
  title = '',
  description = '',
  benchmark = '',
  position = 'top', // 'top' | 'bottom'
  align = 'center', // 'center' | 'left' | 'right'
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // ปิดเมื่อคลิกนอกพื้นที่ (สำหรับ Mobile / Touch)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // กำหนดตำแหน่งกล่อง Tooltip
  let positionClasses = 'bottom-full mb-2';
  if (position === 'bottom') {
    positionClasses = 'top-full mt-2';
  }

  let alignClasses = 'left-1/2 -translate-x-1/2';
  if (align === 'left') {
    alignClasses = 'left-0';
  } else if (align === 'right') {
    alignClasses = 'right-0';
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${isOpen ? 'z-[100]' : 'z-auto'} ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* ปุ่มไอคอน (i) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        aria-label="คำอธิบายเพิ่มเติม"
        className="w-4 h-4 rounded-full flex items-center justify-center text-gray-500 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-700/80 transition-all cursor-help flex-shrink-0 group focus:outline-none"
      >
        <span className="text-[10px] font-black leading-none group-hover:scale-110 transition-transform">
          i
        </span>
      </button>

      {/* กล่อง Tooltip Popup (ทึบแสง 100% ไม่โปร่งใส อยู่หน้าสุดเสมอ) */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute ${positionClasses} ${alignClasses} z-[110] w-64 sm:w-72 bg-[#090e17] border border-gray-600 rounded-xl p-3.5 shadow-[0_15px_35px_rgba(0,0,0,0.9)] animate-fade-in text-left pointer-events-auto`}
        >
          {title && (
            <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-gray-800">
              <span className="text-yellow-400 font-black text-xs uppercase tracking-wider">
                {title}
              </span>
            </div>
          )}

          <p className="text-[11px] text-gray-200 leading-relaxed font-normal">
            {description}
          </p>

          {benchmark && (
            <div className="mt-2.5 pt-2 border-t border-gray-800/90 flex items-center gap-1.5 text-[10px] font-mono">
              <span className="text-amber-400 font-bold flex-shrink-0">💡 เกณฑ์:</span>
              <span className="text-gray-300">{benchmark}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
