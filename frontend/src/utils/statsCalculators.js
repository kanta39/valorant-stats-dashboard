export const getOverallStats = (displayedMatches, activeSearchQuery) => {
  if (displayedMatches.length === 0) return null;
  
  let totalKills = 0; let totalDeaths = 0; let totalAssists = 0;
  let wins = 0; let losses = 0; let draws = 0;
  const targetName = activeSearchQuery.split('#')[0].toLowerCase();

  displayedMatches.forEach(match => {
    totalKills += match.raw_stats?.kills || 0;
    totalDeaths += match.raw_stats?.deaths || 0;
    totalAssists += match.raw_stats?.assists || 0;

    const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
    if (myPlayer) {
      const myTeam = myPlayer.team;
      const redScore = match.teams?.red || 0;
      const blueScore = match.teams?.blue || 0;

      if (redScore === blueScore) draws += 1;
      else if (redScore > blueScore && myTeam === 'Red') wins += 1;
      else if (blueScore > redScore && myTeam === 'Blue') wins += 1;
      else losses += 1;
    }
  });

  const totalMatches = displayedMatches.length;
  const winRate = (wins / totalMatches) * 100;
  const kdaRatio = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : (totalKills + totalAssists).toFixed(2);

  return { totalMatches, winRate, kdaRatio, wins, losses, draws, totalKills, totalDeaths, totalAssists };
}

export const getRoleStats = (displayedMatches, activeSearchQuery, agentRoles) => {
  const stats = {
    'Duelist': { name: 'Duelist', w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 },
    'Initiator': { name: 'Initiator', w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 },
    'Controller': { name: 'Controller', w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 },
    'Sentinel': { name: 'Sentinel', w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 }
  };

  if (displayedMatches.length === 0) return Object.values(stats);
  const targetName = activeSearchQuery.split('#')[0].toLowerCase();

  displayedMatches.forEach(match => {
    const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
    if (!myPlayer) return;

    const role = agentRoles[match.agent] || 'Unknown';
    if (!stats[role]) {
      stats[role] = { name: role, w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 };
    }

    stats[role].matches += 1;
    stats[role].k += match.raw_stats?.kills || 0;
    stats[role].death += match.raw_stats?.deaths || 0;
    stats[role].a += match.raw_stats?.assists || 0;

    const myTeam = myPlayer.team;
    const redScore = match.teams?.red || 0;
    const blueScore = match.teams?.blue || 0;

    if (redScore === blueScore) stats[role].d += 1;
    else if (redScore > blueScore && myTeam === 'Red') stats[role].w += 1;
    else if (blueScore > redScore && myTeam === 'Blue') stats[role].w += 1;
    else stats[role].l += 1;
  });

  return Object.values(stats).sort((a, b) => b.matches - a.matches);
}

export const getAgentStats = (displayedMatches, activeSearchQuery) => {
  if (displayedMatches.length === 0) return [];
  
  const stats = {};
  const targetName = activeSearchQuery.split('#')[0].toLowerCase();

  displayedMatches.forEach(match => {
    const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
    if (!myPlayer) return;

    const agent = match.agent || "Unknown"; 
    if (!stats[agent]) {
      stats[agent] = { name: agent, w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 };
    }

    stats[agent].matches += 1;
    stats[agent].k += match.raw_stats?.kills || 0;
    stats[agent].death += match.raw_stats?.deaths || 0;
    stats[agent].a += match.raw_stats?.assists || 0;

    const myTeam = myPlayer.team;
    const redScore = match.teams?.red || 0;
    const blueScore = match.teams?.blue || 0;

    if (redScore === blueScore) stats[agent].d += 1;
    else if (redScore > blueScore && myTeam === 'Red') stats[agent].w += 1;
    else if (blueScore > redScore && myTeam === 'Blue') stats[agent].w += 1;
    else stats[agent].l += 1;
  });

  return Object.values(stats).sort((a, b) => b.matches - a.matches);
}

export const getMapStats = (displayedMatches, activeSearchQuery) => {
  if (displayedMatches.length === 0) return [];
  
  const stats = {};
  const targetName = activeSearchQuery.split('#')[0].toLowerCase();

  displayedMatches.forEach(match => {
    const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
    if (!myPlayer) return;

    const mapName = match.map || "Unknown Map"; 
    if (!stats[mapName]) {
      stats[mapName] = { name: mapName, w: 0, l: 0, d: 0, matches: 0 };
    }

    stats[mapName].matches += 1;

    const myTeam = myPlayer.team;
    const redScore = match.teams?.red || 0;
    const blueScore = match.teams?.blue || 0;

    if (redScore === blueScore) stats[mapName].d += 1;
    else if (redScore > blueScore && myTeam === 'Red') stats[mapName].w += 1;
    else if (blueScore > redScore && myTeam === 'Blue') stats[mapName].w += 1;
    else stats[mapName].l += 1;
  });

  return Object.values(stats).sort((a, b) => b.matches - a.matches);
}
