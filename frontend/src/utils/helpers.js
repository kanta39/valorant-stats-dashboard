/**
 * วิเคราะห์สถิติฝั่งบุก (Attack) vs ฝั่งรับ (Defense) และรอบปืนพก (Pistol)
 */
export const analyzeMatchSides = (match, targetPlayerName = '') => {
  if (!match) return null;
  const targetLower = targetPlayerName.split('#')[0].toLowerCase();
  const myPlayer = match.scoreboard?.find(p => String(p.name || '').toLowerCase() === targetLower);
  const myTeam = myPlayer?.team || 'Blue';
  const mode = String(match.mode || '').toLowerCase();
  
  // Halftime threshold
  let halfTimeRound = 12;
  if (mode.includes('swiftplay')) halfTimeRound = 4;
  else if (mode.includes('spikerush') || mode.includes('spike rush')) halfTimeRound = 3;

  const roundHistory = match.round_history || [];
  if (roundHistory.length === 0) return null;

  // ตรวจจับ starting side จาก end_type
  let firstHalfMySide = null;

  for (const r of roundHistory) {
    const isFirstHalf = r.round_num <= halfTimeRound;
    let roundAttackingTeam = null;

    if (r.end_type === 'Bomb detonated') {
      roundAttackingTeam = r.winning_team;
    } else if (r.end_type === 'Bomb defused' || r.end_type === 'Time out') {
      roundAttackingTeam = r.winning_team === 'Red' ? 'Blue' : 'Red';
    }

    if (roundAttackingTeam) {
      if (isFirstHalf) {
        firstHalfMySide = (myTeam === roundAttackingTeam) ? 'Attack' : 'Defense';
        break;
      } else {
        const secondHalfMySide = (myTeam === roundAttackingTeam) ? 'Attack' : 'Defense';
        firstHalfMySide = secondHalfMySide === 'Attack' ? 'Defense' : 'Attack';
        break;
      }
    }
  }

  // Fallback ถ้าทุกรอบจบด้วย Eliminated ทั้งหมด
  if (!firstHalfMySide) {
    firstHalfMySide = myTeam === 'Red' ? 'Attack' : 'Defense';
  }

  let atkTotal = 0;
  let atkWon = 0;
  let defTotal = 0;
  let defWon = 0;
  let pistolTotal = 0;
  let pistolWon = 0;

  const roundsWithSide = roundHistory.map(r => {
    const isFirstHalf = r.round_num <= halfTimeRound;
    const isOvertime = r.round_num > (halfTimeRound * 2);

    let mySide = firstHalfMySide;
    if (!isFirstHalf && !isOvertime) {
      mySide = firstHalfMySide === 'Attack' ? 'Defense' : 'Attack';
    } else if (isOvertime) {
      const otRound = r.round_num - (halfTimeRound * 2);
      const isOtEven = Math.floor((otRound - 1) / 2) % 2 === 0;
      mySide = isOtEven ? firstHalfMySide : (firstHalfMySide === 'Attack' ? 'Defense' : 'Attack');
    }

    const isWin = r.winning_team === myTeam;

    if (mySide === 'Attack') {
      atkTotal += 1;
      if (isWin) atkWon += 1;
    } else {
      defTotal += 1;
      if (isWin) defWon += 1;
    }

    const isPistol = r.round_num === 1 || r.round_num === (halfTimeRound + 1);
    if (isPistol) {
      pistolTotal += 1;
      if (isWin) pistolWon += 1;
    }

    return {
      ...r,
      mySide,
      isWin
    };
  });

  const attackWinRate = atkTotal > 0 ? Math.round((atkWon / atkTotal) * 100) : 0;
  const defenseWinRate = defTotal > 0 ? Math.round((defWon / defTotal) * 100) : 0;
  const pistolWinRate = pistolTotal > 0 ? Math.round((pistolWon / pistolTotal) * 100) : 0;

  return {
    startingSide: firstHalfMySide,
    roundsWithSide,
    halfTimeRound,
    attack: { total: atkTotal, won: atkWon, winRate: attackWinRate },
    defense: { total: defTotal, won: defWon, winRate: defenseWinRate },
    pistol: { total: pistolTotal, won: pistolWon, winRate: pistolWinRate }
  };
};

/**
 * วิเคราะห์พลังการแบกและอิทธิพลต่อทีม (Team Impact & Carry Intelligence)
 */
export const calculateTeamImpactStats = (matches = [], targetPlayerName = '') => {
  if (!matches || matches.length === 0) return null;
  const targetLower = targetPlayerName.split('#')[0].toLowerCase();

  let totalMyKills = 0;
  let totalTeamKills = 0;
  let totalMyADR = 0;
  let totalTeamAvgADR = 0;
  let matchesWithScoreboard = 0;

  let matchMVPsCount = 0;
  let teamMVPsCount = 0;

  let highKdMatches = 0; // KD >= 1.0
  let highKdWins = 0;
  let lowKdMatches = 0;  // KD < 1.0
  let lowKdWins = 0;

  matches.forEach(match => {
    if (!match.scoreboard || match.scoreboard.length === 0) return;
    const myPlayer = match.scoreboard.find(p => String(p.name || '').toLowerCase() === targetLower);
    if (!myPlayer) return;

    matchesWithScoreboard += 1;
    const myTeam = myPlayer.team || 'Blue';
    const myKills = myPlayer.stats?.kills || 0;
    const myDeaths = myPlayer.stats?.deaths || 0;
    const myADR = myPlayer.stats?.adr || 0;
    const myKD = myDeaths > 0 ? (myKills / myDeaths) : myKills;

    const redScore = match.teams?.red ?? 0;
    const blueScore = match.teams?.blue ?? 0;
    const myScore = myTeam === 'Red' ? redScore : blueScore;
    const enemyScore = myTeam === 'Red' ? blueScore : redScore;
    const isWin = myScore > enemyScore;

    // Team players & enemy players
    const teamPlayers = match.scoreboard.filter(p => p.team === myTeam);
    const teamKills = teamPlayers.reduce((sum, p) => sum + (p.stats?.kills || 0), 0);
    const teamADRSum = teamPlayers.reduce((sum, p) => sum + (p.stats?.adr || 0), 0);
    const teamAvgADR = teamPlayers.length > 0 ? (teamADRSum / teamPlayers.length) : myADR;

    totalMyKills += myKills;
    totalTeamKills += teamKills;
    totalMyADR += myADR;
    totalTeamAvgADR += teamAvgADR;

    // Check MVP
    const sortedAll = [...match.scoreboard].sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0));
    if (sortedAll[0] && String(sortedAll[0].name || '').toLowerCase() === targetLower) {
      matchMVPsCount += 1;
    } else {
      const sortedTeam = [...teamPlayers].sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0));
      if (sortedTeam[0] && String(sortedTeam[0].name || '').toLowerCase() === targetLower) {
        teamMVPsCount += 1;
      }
    }

    // Win Correlation with KD
    if (myKD >= 1.0) {
      highKdMatches += 1;
      if (isWin) highKdWins += 1;
    } else {
      lowKdMatches += 1;
      if (isWin) lowKdWins += 1;
    }
  });

  if (matchesWithScoreboard === 0 || totalTeamKills === 0) return null;

  const killShare = Math.round((totalMyKills / totalTeamKills) * 100);
  const avgMyADR = Math.round(totalMyADR / matchesWithScoreboard);
  const avgTeamADR = Math.round(totalTeamAvgADR / matchesWithScoreboard);
  const adrDiffPercent = avgTeamADR > 0 ? Math.round(((avgMyADR - avgTeamADR) / avgTeamADR) * 100) : 0;

  const matchMVPPercent = Math.round((matchMVPsCount / matchesWithScoreboard) * 100);
  const teamMVPPercent = Math.round((teamMVPsCount / matchesWithScoreboard) * 100);
  const totalMVPPercent = Math.round(((matchMVPsCount + teamMVPsCount) / matchesWithScoreboard) * 100);

  const highKdWinRate = highKdMatches > 0 ? Math.round((highKdWins / highKdMatches) * 100) : 0;
  const lowKdWinRate = lowKdMatches > 0 ? Math.round((lowKdWins / lowKdMatches) * 100) : 0;
  const winRateBoost = highKdWinRate - lowKdWinRate;

  // Carry Potential Index (0 - 100)
  let killShareScore = Math.min(100, Math.max(0, (killShare - 10) * 4));
  let adrScore = Math.min(100, Math.max(0, 50 + adrDiffPercent));
  let mvpScore = Math.min(100, totalMVPPercent * 2);
  let carryRating = Math.round((killShareScore * 0.4) + (adrScore * 0.3) + (mvpScore * 0.3));
  carryRating = Math.min(99, Math.max(25, carryRating));

  let persona = {
    badge: '🛡️ RELIABLE ANCHOR',
    sub: 'เสาหลักช่วยทีม',
    desc: 'เล่นตามหน้าที่และจังหวะของทีม เน้นซัพพอร์ตและสร้างพื้นที่ให้เพื่อนร่วมทีมทำเกม',
    color: 'border-blue-500/40 text-blue-400 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
  };

  if (killShare >= 28 || carryRating >= 75) {
    persona = {
      badge: '🔥 UNSTOPPABLE CARRY',
      sub: 'เดอะแบกตัวตึงระดับท็อป',
      desc: `คิลมากกว่า 1 ใน 4 ของทั้งทีม (${killShare}%) และมีอิทธิพลต่อชัยชนะอย่างเด็ดขาด`,
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
    };
  } else if (killShare >= 22 || carryRating >= 58) {
    persona = {
      badge: '⚔️ CORE FRAGGER',
      sub: 'ตัวทำเกมหลัก',
      desc: 'สร้างจังหวะคิลสม่ำเสมอ เป็นแกนหลักในการทำดาเมจและเปิดไฟต์ของทีม',
      color: 'border-green-500/40 text-green-400 bg-green-500/10 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
    };
  }

  return {
    evaluatedMatches: matchesWithScoreboard,
    killShare,
    totalMyKills,
    totalTeamKills,
    avgMyADR,
    avgTeamADR,
    adrDiffPercent,
    matchMVPsCount,
    teamMVPsCount,
    matchMVPPercent,
    teamMVPPercent,
    totalMVPPercent,
    highKdMatches,
    highKdWins,
    highKdWinRate,
    lowKdMatches,
    lowKdWins,
    lowKdWinRate,
    winRateBoost,
    carryRating,
    persona
  };
};

