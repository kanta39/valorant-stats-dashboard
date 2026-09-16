export const getRoundIcon = (endType) => {
  const iconClass = "w-5 h-5 md:w-6 md:h-6 drop-shadow-sm";
  switch(endType) {
    case 'Eliminated': 
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path 
            fillRule="evenodd" 
            d="M12 2.2L17.5 4.5 19.5 9.5 18 14.5 17 15l.8 5.5H6.2L7 15l-1-.5-1.5-5 2-5L12 2.2z M8.5 10.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z M15.5 10.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z M10.8 14.2l1.2 1.8 1.2-1.8H10.8z M9.5 17.5h1.2v2.2H9.5z M13.3 17.5h1.2v2.2h-1.2z" 
          />
        </svg>
      );
    case 'Bomb defused': 
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.5L7 11.5l5 9 5-9L12 2.5z" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 2.5v18" strokeDasharray="1 1" />
          <path d="M4 8.5l4 3.5-4 3.5" strokeWidth="2" />
          <path d="M20 8.5l-4 3.5 4 3.5" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        </svg>
      );
    case 'Bomb detonated': 
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5.5l-3.5 6 3.5 6 3.5-6-3.5-6z" fill="currentColor" />
          <line x1="12" y1="1.5" x2="12" y2="3.5" />
          <line x1="12" y1="19.5" x2="12" y2="22.5" />
          <line x1="2" y1="11.5" x2="4.5" y2="11.5" />
          <line x1="19.5" y1="11.5" x2="22" y2="11.5" />
          <line x1="4.5" y1="4.5" x2="6.5" y2="6.5" />
          <line x1="17.5" y1="16.5" x2="19.5" y2="18.5" />
          <line x1="19.5" y1="4.5" x2="17.5" y2="6.5" />
          <line x1="6.5" y1="16.5" x2="4.5" y2="18.5" />
        </svg>
      );
    case 'Time out': 
    default: 
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 1.5" />
          <path d="M9.5 2h5" />
          <path d="M12 2v3" />
        </svg>
      );
  }
}
