export const getRoundIcon = (endType) => {
  const iconClass = "w-5 h-5 md:w-6 md:h-6 drop-shadow-sm";
  switch(endType) {
    case 'Eliminated': 
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8.5 8.5l7 7M15.5 8.5l-7 7"></path>
        </svg>
      );
    case 'Bomb defused': 
    case 'Bomb detonated': 
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.5L5.5 13l3.5 7.5 9-4.5 1.5-6.5-7.5-7z"></path>
        </svg>
      );
    case 'Time out': 
    default: 
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"></circle>
        </svg>
      );
  }
}
