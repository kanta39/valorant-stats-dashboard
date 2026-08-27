import { useState } from 'react';

export default function useSortConfig() {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });

  // 🔥 2. ฟังก์ชันจัดการการคลิกเรียงข้อมูล 3 จังหวะ
  const handleSort = (key) => {
    setSortConfig(current => {
      if (current.key === key) {
        if (current.direction === 'default') return { key, direction: 'asc' }; // 1. น้อยไปมาก
        if (current.direction === 'asc') return { key, direction: 'desc' }; // 2. มากไปน้อย
        return { key: null, direction: 'default' }; // 3. คืนค่าเริ่มต้น
      }
      return { key, direction: 'asc' }; // เริ่มด้วยน้อยไปมาก
    });
  };

  // 🔥 ไอคอนแสดงลูกศรขึ้นลง
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key || sortConfig.direction === 'default') return <span className="inline-block ml-1 text-gray-700 text-[10px] font-normal">↕</span>;
    return sortConfig.direction === 'asc' 
      ? <span className="inline-block ml-1 text-white text-[10px] font-black">↑</span> 
      : <span className="inline-block ml-1 text-white text-[10px] font-black">↓</span>;
  };

  return { sortConfig, setSortConfig, handleSort, renderSortIcon };
}
