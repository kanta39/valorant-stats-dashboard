import { useState, useEffect, useRef } from 'react'
import OverviewTab from './components/tabs/OverviewTab'
import AgentsTab from './components/tabs/AgentsTab'
import MapsTab from './components/tabs/MapsTab'
import ScoreboardModal from './components/ScoreboardModal'
import HitMatrixCard from './components/HitMatrixCard'
import SearchHistoryDropdown from './components/SearchHistoryDropdown'

const VALORANT_MODES = [
  { id: 'All', name: 'ทุกโหมด (All Modes)' },
  { id: 'competitive', name: 'Competitive (ลงแรงค์)' },
  { id: 'unrated', name: 'Unrated (ทั่วไป)' },
  { id: 'deathmatch', name: 'Deathmatch' },
  { id: 'teamdeathmatch', name: 'Team Deathmatch' },
  { id: 'swiftplay', name: 'Swiftplay' },
  { id: 'spikerush', name: 'Spike Rush' }
];

function App() {
  const [searchQuery, setSearchQuery] = useState("Double Chesse#0001") 
  const [activeSearchQuery, setActiveSearchQuery] = useState("Double Chesse#0001") 

  // 🕒 ระบบบันทึกประวัติการค้นหา (Search History)
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('valorant_search_history');
      return saved ? JSON.parse(saved) : ["Double Chesse#0001"];
    } catch {
      return ["Double Chesse#0001"];
    }
  });
  const [showNavHistory, setShowNavHistory] = useState(false);
  const [showHomeHistory, setShowHomeHistory] = useState(false);
  const navSearchContainerRef = useRef(null);
  const homeSearchContainerRef = useRef(null);
  
  const [playerData, setPlayerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [filterMode, setFilterMode] = useState("All")
  const [activeTab, setActiveTab] = useState("overview")
  const [agentImages, setAgentImages] = useState({})
  const [rankImages, setRankImages] = useState({})
  
  const [agentRoles, setAgentRoles] = useState({})
  const [roleIcons, setRoleIcons] = useState({})
  const [agentDetails, setAgentDetails] = useState({})
  const [mapDetails, setMapDetails] = useState({})
  
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [initialModalAgent, setInitialModalAgent] = useState(null)
  const [initialModalMap, setInitialModalMap] = useState(null)

  // 🔥 1. เพิ่ม State สำหรับเก็บสถานะการเรียงข้อมูล (Sorting)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });

  // จัดการปิด Dropdown ประวัติเมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navSearchContainerRef.current && !navSearchContainerRef.current.contains(e.target)) {
        setShowNavHistory(false);
      }
      if (homeSearchContainerRef.current && !homeSearchContainerRef.current.contains(e.target)) {
        setShowHomeHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
      .then(res => res.json())
      .then(data => {
        if (!data || !data.data) return;
        const imageMap = {};
        const roleMap = {};
        const rIconMap = {};
        const detailsMap = {};
        data.data.forEach(agent => {
          imageMap[agent.displayName] = agent.displayIcon;
          if (agent.role) {
            roleMap[agent.displayName] = agent.role.displayName;
            rIconMap[agent.role.displayName] = agent.role.displayIcon;
          }
          detailsMap[agent.displayName] = {
            name: agent.displayName,
            description: agent.description,
            icon: agent.displayIcon,
            bustPortrait: agent.bustPortrait,
            fullPortrait: agent.fullPortrait || agent.bustPortrait || agent.displayIcon,
            background: agent.background,
            gradientColors: agent.backgroundGradientColors || [],
            role: agent.role?.displayName || 'Unknown',
            roleIcon: agent.role?.displayIcon,
            voiceLine: agent.voiceLine?.mediaList?.[0]?.wave || null
          };
        });
        setAgentImages(imageMap);
        setAgentRoles(roleMap);
        setRoleIcons(rIconMap);
        setAgentDetails(detailsMap);
      })
      .catch(err => console.error("โหลดรูป Agent ไม่สำเร็จ:", err));

    fetch('https://valorant-api.com/v1/maps')
      .then(res => res.json())
      .then(data => {
        if (!data || !data.data) return;
        const mMap = {};
        data.data.forEach(m => {
          if (m.displayName) {
            mMap[m.displayName.toLowerCase()] = {
              name: m.displayName,
              splash: m.splash,
              displayIcon: m.displayIcon,
              tacticalDescription: m.tacticalDescription
            };
          }
        });
        setMapDetails(mMap);
      })
      .catch(err => console.error("โหลดข้อมูล Map ไม่สำเร็จ:", err));

    fetch('https://valorant-api.com/v1/competitivetiers')
      .then(res => res.json())
      .then(data => {
        if (!data || !data.data || data.data.length === 0) return;
        const latestEpisode = data.data[data.data.length - 1];
        const rankMap = {};
        if (latestEpisode && latestEpisode.tiers) {
          latestEpisode.tiers.forEach(tier => {
            if (tier.tierName) rankMap[tier.tierName.toLowerCase().replace(/\s/g, '')] = tier.largeIcon || tier.smallIcon;
          });
        }
        rankMap["unrated"] = rankMap["unranked"];
        setRankImages(rankMap);
      })
      .catch(err => console.error("โหลดรูป Rank ไม่สำเร็จ:", err));
  }, []);

  // จัดการประวัติการค้นหา
  const saveToHistory = (query) => {
    if (!query || !query.includes('#')) return;
    const trimmed = query.trim();
    setSearchHistory(prev => {
      const filtered = prev.filter(item => {
        const str = typeof item === 'string' ? item : item.query;
        return str.toLowerCase() !== trimmed.toLowerCase();
      });
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('valorant_search_history', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save search history:", err);
      }
      return updated;
    });
  };

  const removeFromHistory = (queryToRemove) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => {
        const str = typeof item === 'string' ? item : item.query;
        return str.toLowerCase() !== queryToRemove.toLowerCase();
      });
      try {
        localStorage.setItem('valorant_search_history', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update search history:", err);
      }
      return updated;
    });
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('valorant_search_history');
    } catch (err) {
      console.error("Failed to clear search history:", err);
    }
  };

  const handleSelectHistoryItem = (query) => {
    setSearchQuery(query);
    setShowNavHistory(false);
    setShowHomeHistory(false);
    fetchStats(filterMode, true, query);
  };

  const fetchStats = async (modeToFetch = filterMode, isNewSearch = false, customQuery = null) => {
    const queryToUse = customQuery ? customQuery : (isNewSearch ? searchQuery : activeSearchQuery);

    if (!queryToUse.trim()) { setErrorMsg("กรุณากรอก Riot ID และ Tag คับ"); return; }
    if (!queryToUse.includes('#')) { setErrorMsg("รูปแบบไม่ถูกต้องคับ กรุณาพิมพ์ในรูปแบบ ชื่อ#แท็ก (ต้องมีเครื่องหมาย #)"); return; }
    
    const [riotName, riotTag] = queryToUse.split('#')
    if (!riotName.trim() || !riotTag.trim()) { setErrorMsg("กรุณากรอกทั้งชื่อและแท็กให้ครบถ้วนคับ"); return; }

    setLoading(true); setErrorMsg(null); setSelectedMatch(null);

    let currentMode = modeToFetch;
    if (isNewSearch) { currentMode = "All"; setFilterMode("All"); setActiveTab("overview"); }

    try {
      // เพิ่ม { cache: "no-store" } เข้าไปด้านหลังสุดของวงเล็บ fetch
      const response = await fetch(`https://val-stats-api.onrender.com/api/matches/${riotName.trim()}/${riotTag.trim()}?mode=${currentMode}`, { cache: "no-store" })
      const data = await response.json()
      if (data.error) { 
        setErrorMsg(data.error); 
        if (isNewSearch) setPlayerData(null); 
      } 
      else { 
        setPlayerData(data); 
        if (isNewSearch) {
          setActiveSearchQuery(queryToUse);
          saveToHistory(queryToUse);
        }
      }
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ:", error); setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้");
      if (isNewSearch) setPlayerData(null);
    } finally { setLoading(false); }
  }

  const handleKeyPress = (e) => { 
    if (e.key === 'Enter') {
      setShowNavHistory(false);
      setShowHomeHistory(false);
      fetchStats(filterMode, true);
    }
  }
  const handleModeChange = (e) => {
    const selectedMode = e.target.value; setFilterMode(selectedMode); fetchStats(selectedMode, false); setSelectedMatch(null); 
  }

  const hasData = playerData && playerData.match_history && !errorMsg;

  const displayedMatches = !hasData ? [] : (
    filterMode === "All" 
      ? playerData.match_history 
      : playerData.match_history.filter(m => String(m.mode || "unknown").toLowerCase().replace(/\s/g, '') === filterMode.toLowerCase().replace(/\s/g, ''))
  );

  // 🍃 ประวัติการแข่งขันทั้งหมดที่สะสมใน MongoDB Atlas สำหรับแท็บ Agents และ Maps
  const allHistoricalMatches = !hasData ? [] : (
    (playerData.all_matches && playerData.all_matches.length > 0)
      ? (
          filterMode === "All"
            ? playerData.all_matches
            : playerData.all_matches.filter(m => String(m.mode || "unknown").toLowerCase().replace(/\s/g, '') === filterMode.toLowerCase().replace(/\s/g, ''))
        )
      : displayedMatches
  );

  const getOverallStats = () => {
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

  const getRoleStats = (matchesToUse = allHistoricalMatches) => {
    const stats = {
      'Duelist': { name: 'Duelist', w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 },
      'Initiator': { name: 'Initiator', w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 },
      'Controller': { name: 'Controller', w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 },
      'Sentinel': { name: 'Sentinel', w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 }
    };

    if (matchesToUse.length === 0) return Object.values(stats);
    const targetName = activeSearchQuery.split('#')[0].toLowerCase();

    matchesToUse.forEach(match => {
      const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
      if (!myPlayer) return;

      const agent = myPlayer.agent || match.agent || "Unknown";
      const role = agentRoles[agent] || 'Unknown';
      if (!stats[role]) {
        stats[role] = { name: role, w: 0, l: 0, d: 0, k: 0, death: 0, a: 0, matches: 0 };
      }

      const pStats = myPlayer.stats || {};
      stats[role].matches += 1;
      stats[role].k += (pStats.kills !== undefined ? pStats.kills : (match.raw_stats?.kills || 0));
      stats[role].death += (pStats.deaths !== undefined ? pStats.deaths : (match.raw_stats?.deaths || 0));
      stats[role].a += (pStats.assists !== undefined ? pStats.assists : (match.raw_stats?.assists || 0));

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

  const getAgentStats = (matchesToUse = allHistoricalMatches) => {
    if (matchesToUse.length === 0) return [];
    
    const stats = {};
    const targetName = activeSearchQuery.split('#')[0].toLowerCase();

    matchesToUse.forEach(match => {
      const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
      if (!myPlayer) return;

      const agent = myPlayer.agent || match.agent || "Unknown"; 
      if (!stats[agent]) {
        stats[agent] = { 
          name: agent, 
          w: 0, 
          l: 0, 
          d: 0, 
          k: 0, 
          death: 0, 
          a: 0, 
          matches: 0,
          totalAcs: 0,
          totalAdr: 0,
          totalHs: 0,
          maps: {},
          recentMatches: []
        };
      }

      const pStats = myPlayer.stats || {};
      stats[agent].matches += 1;
      stats[agent].k += (pStats.kills !== undefined ? pStats.kills : (match.raw_stats?.kills || 0));
      stats[agent].death += (pStats.deaths !== undefined ? pStats.deaths : (match.raw_stats?.deaths || 0));
      stats[agent].a += (pStats.assists !== undefined ? pStats.assists : (match.raw_stats?.assists || 0));

      stats[agent].totalAcs += (pStats.acs || 0);
      stats[agent].totalAdr += (pStats.adr || 0);
      stats[agent].totalHs += (pStats.hs_percent || 0);

      const myTeam = myPlayer.team;
      const redScore = match.teams?.red || 0;
      const blueScore = match.teams?.blue || 0;

      let matchResult = 'L';
      if (redScore === blueScore) {
        stats[agent].d += 1;
        matchResult = 'D';
      } else if ((redScore > blueScore && myTeam === 'Red') || (blueScore > redScore && myTeam === 'Blue')) {
        stats[agent].w += 1;
        matchResult = 'W';
      } else {
        stats[agent].l += 1;
        matchResult = 'L';
      }

      // สถิติแยกตามด่าน
      const mapName = match.map || "Unknown Map";
      if (!stats[agent].maps[mapName]) {
        stats[agent].maps[mapName] = { name: mapName, matches: 0, w: 0, l: 0, d: 0 };
      }
      stats[agent].maps[mapName].matches += 1;
      if (matchResult === 'W') stats[agent].maps[mapName].w += 1;
      else if (matchResult === 'L') stats[agent].maps[mapName].l += 1;
      else stats[agent].maps[mapName].d += 1;

      // ประวัติแมตช์ล่าสุดของตัวละครนี้
      stats[agent].recentMatches.push({
        match_id: match.match_id,
        map: mapName,
        mode: match.mode,
        result: matchResult,
        kills: (pStats.kills !== undefined ? pStats.kills : (match.raw_stats?.kills || 0)),
        deaths: (pStats.deaths !== undefined ? pStats.deaths : (match.raw_stats?.deaths || 0)),
        assists: (pStats.assists !== undefined ? pStats.assists : (match.raw_stats?.assists || 0)),
        acs: pStats.acs || 0,
        adr: pStats.adr || 0,
        hs_percent: pStats.hs_percent || 0,
        redScore,
        blueScore,
        myTeam,
        matchRaw: match
      });
    });

    const totalAllMatches = matchesToUse.length;

    return Object.values(stats).map(agent => {
      const winRate = agent.matches > 0 ? ((agent.w / agent.matches) * 100) : 0;
      const avgAcs = agent.matches > 0 ? Math.round(agent.totalAcs / agent.matches) : 0;
      const avgAdr = agent.matches > 0 ? Math.round(agent.totalAdr / agent.matches) : 0;
      const avgHs = agent.matches > 0 ? Math.round(agent.totalHs / agent.matches) : 0;
      const kd = agent.death > 0 ? Number((agent.k / agent.death).toFixed(2)) : agent.k;
      const kda = agent.death > 0 ? Number(((agent.k + agent.a) / agent.death).toFixed(2)) : (agent.k + agent.a);
      const role = agentRoles[agent.name] || 'Unknown';

      // คำนวณ Badges ฉายาตามสถิติจริง
      const badges = [];
      if (agent.matches >= 3 && (agent.matches / totalAllMatches) >= 0.35) {
        badges.push({ label: 'One-Trick', icon: '🦄', desc: 'เล่นตัวนี้เกิน 35% ของเกมทั้งหมด', color: 'border-pink-500/40 text-pink-400 bg-pink-500/10' });
      }
      if (agent.matches >= 3 && winRate >= 60 && avgAcs >= 210) {
        badges.push({ label: 'Signature Pick', icon: '👑', desc: 'ตัวหลักประจำตัว วินเรตสูงและแบกทีมได้ดี', color: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10' });
      }
      if (agent.matches >= 2 && winRate === 100) {
        badges.push({ label: 'Pocket Pick', icon: '🍀', desc: 'ตัวลับไร้พ่าย เล่นแล้วชนะ 100%', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' });
      }
      if (agent.matches >= 2 && avgHs >= 25) {
        badges.push({ label: 'Headshot God', icon: '🎯', desc: 'อัตรายิงหัวเฉลี่ยสูงเกิน 25%', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' });
      }
      if (kd >= 1.25 && avgAcs >= 225) {
        badges.push({ label: 'Impact Fragger', icon: '⚡', desc: 'ทำผลงานสังหารศัตรูได้อย่างดุดัน', color: 'border-red-500/40 text-red-400 bg-red-500/10' });
      }
      if (agent.matches >= 3 && winRate < 40) {
        badges.push({ label: 'Needs Warmup', icon: '🩹', desc: 'วินเรตต่ำกว่า 40% อาจต้องปรับแผนการเล่น', color: 'border-gray-600 text-gray-400 bg-gray-800/40' });
      }
      if ((role === 'Controller' || role === 'Sentinel') && winRate >= 50 && agent.matches >= 2) {
        badges.push({ label: 'Team Anchor', icon: '🛡️', desc: 'เสาหลักของทีม เล่นสายซัพพอร์ตคว้าชัยชนะ', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' });
      }

      // จัดเรียงด่านที่ดีที่สุดสำหรับตัวละครนี้
      const mapList = Object.values(agent.maps).sort((a, b) => {
        const wrA = (a.w / a.matches);
        const wrB = (b.w / b.matches);
        if (wrB !== wrA) return wrB - wrA;
        return b.matches - a.matches;
      });

      return {
        ...agent,
        winRate,
        avgAcs,
        avgAdr,
        avgHs,
        kd,
        kda,
        role,
        badges,
        mapList
      };
    }).sort((a, b) => b.matches - a.matches);
  }

  const getMapStats = (matchesToUse = allHistoricalMatches) => {
    if (matchesToUse.length === 0) return [];
    
    const stats = {};
    const targetName = activeSearchQuery.split('#')[0].toLowerCase();

    matchesToUse.forEach(match => {
      const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
      if (!myPlayer) return;

      const mapName = match.map || "Unknown Map"; 
      if (!stats[mapName]) {
        stats[mapName] = { 
          name: mapName, 
          w: 0, 
          l: 0, 
          d: 0, 
          matches: 0,
          roundsWon: 0,
          roundsLost: 0,
          totalAcs: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          agentsPlayed: {},
          recentMatches: []
        };
      }

      stats[mapName].matches += 1;

      const myTeam = myPlayer.team;
      const redScore = match.teams?.red || 0;
      const blueScore = match.teams?.blue || 0;
      const myScore = myTeam === 'Red' ? redScore : blueScore;
      const enemyScore = myTeam === 'Red' ? blueScore : redScore;

      stats[mapName].roundsWon += myScore;
      stats[mapName].roundsLost += enemyScore;

      let matchResult = 'L';
      if (redScore === blueScore) {
        stats[mapName].d += 1;
        matchResult = 'D';
      } else if ((redScore > blueScore && myTeam === 'Red') || (blueScore > redScore && myTeam === 'Blue')) {
        stats[mapName].w += 1;
        matchResult = 'W';
      } else {
        stats[mapName].l += 1;
        matchResult = 'L';
      }

      const pStats = myPlayer.stats || {};
      stats[mapName].totalAcs += (pStats.acs || 0);
      stats[mapName].totalKills += (pStats.kills !== undefined ? pStats.kills : (match.raw_stats?.kills || 0));
      stats[mapName].totalDeaths += (pStats.deaths !== undefined ? pStats.deaths : (match.raw_stats?.deaths || 0));
      stats[mapName].totalAssists += (pStats.assists !== undefined ? pStats.assists : (match.raw_stats?.assists || 0));

      // บันทึก Agent ที่เล่นในด่านนี้
      const agentPlayed = myPlayer.agent || match.agent || "Unknown";
      if (!stats[mapName].agentsPlayed[agentPlayed]) {
        stats[mapName].agentsPlayed[agentPlayed] = {
          name: agentPlayed,
          matches: 0,
          w: 0,
          l: 0,
          d: 0,
          acsSum: 0,
          kills: 0,
          deaths: 0
        };
      }
      stats[mapName].agentsPlayed[agentPlayed].matches += 1;
      stats[mapName].agentsPlayed[agentPlayed].acsSum += (pStats.acs || 0);
      stats[mapName].agentsPlayed[agentPlayed].kills += (pStats.kills !== undefined ? pStats.kills : (match.raw_stats?.kills || 0));
      stats[mapName].agentsPlayed[agentPlayed].deaths += (pStats.deaths !== undefined ? pStats.deaths : (match.raw_stats?.deaths || 0));
      if (matchResult === 'W') stats[mapName].agentsPlayed[agentPlayed].w += 1;
      else if (matchResult === 'L') stats[mapName].agentsPlayed[agentPlayed].l += 1;
      else stats[mapName].agentsPlayed[agentPlayed].d += 1;

      // บันทึกแมตช์ล่าสุดในด่านนี้
      stats[mapName].recentMatches.push({
        match_id: match.match_id,
        mode: match.mode,
        result: matchResult,
        myScore,
        enemyScore,
        agent: agentPlayed,
        kills: (pStats.kills !== undefined ? pStats.kills : (match.raw_stats?.kills || 0)),
        deaths: (pStats.deaths !== undefined ? pStats.deaths : (match.raw_stats?.deaths || 0)),
        assists: (pStats.assists !== undefined ? pStats.assists : (match.raw_stats?.assists || 0)),
        acs: pStats.acs || 0,
        matchRaw: match
      });
    });

    return Object.values(stats).map(mapData => {
      const winRate = mapData.matches > 0 ? ((mapData.w / mapData.matches) * 100) : 0;
      const roundDiff = mapData.roundsWon - mapData.roundsLost;
      const avgAcs = mapData.matches > 0 ? Math.round(mapData.totalAcs / mapData.matches) : 0;
      const kd = mapData.totalDeaths > 0 ? Number((mapData.totalKills / mapData.totalDeaths).toFixed(2)) : mapData.totalKills;

      // จัดอันดับ Agent ในด่านนี้เพื่อหา Best Pick
      const agentList = Object.values(mapData.agentsPlayed).map(ag => ({
        ...ag,
        winRate: ag.matches > 0 ? ((ag.w / ag.matches) * 100) : 0,
        avgAcs: ag.matches > 0 ? Math.round(ag.acsSum / ag.matches) : 0,
        kd: ag.deaths > 0 ? Number((ag.kills / ag.deaths).toFixed(2)) : ag.kills
      })).sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (b.matches !== a.matches) return b.matches - a.matches;
        return b.avgAcs - a.avgAcs;
      });

      const bestAgent = agentList.length > 0 ? agentList[0] : null;

      // คำนวณ Map Destiny Badges
      const badges = [];
      if (winRate >= 65 && mapData.matches >= 2) {
        badges.push({ label: 'Free Elo / ด่านบุญ', icon: '🏰', desc: 'วินเรตเกิน 65% ด่านแจกแต้มประจำตัว', color: 'border-green-500/40 text-green-400 bg-green-500/10' });
      } else if (winRate === 0 && mapData.matches >= 2) {
        badges.push({ label: 'Dodge Recommend!', icon: '🚨', desc: 'ยังไม่เคยชนะด่านนี้ แนะนำให้ดอดจ์แบบกวนๆ', color: 'border-red-500/40 text-red-400 bg-red-500/10' });
      } else if (winRate <= 35 && mapData.matches >= 3) {
        badges.push({ label: 'Cursed / ด่านกรรม', icon: '💀', desc: 'วินเรตต่ำกว่า 35% ด่านเจ้ากรรมนายเวร', color: 'border-orange-500/40 text-orange-400 bg-orange-500/10' });
      } else if (mapData.matches >= 4 && winRate >= 50) {
        badges.push({ label: 'Comfort Map', icon: '⚔️', desc: 'ลงเล่นบ่อยและคว้าชัยชนะได้สม่ำเสมอ', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' });
      } else if (winRate >= 45 && winRate <= 55 && mapData.matches >= 2) {
        badges.push({ label: 'Coin Flip', icon: '⚖️', desc: 'ผลงาน 50-50 สูสีวัดดวง', color: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10' });
      }

      return {
        ...mapData,
        winRate,
        roundDiff,
        avgAcs,
        kd,
        agentList,
        bestAgent,
        badges
      };
    }).sort((a, b) => b.matches - a.matches);
  }

  const getPartyStats = () => {
    if (displayedMatches.length === 0) {
      return { 
        friends: [], 
        soloStats: { matches: 0, wins: 0, losses: 0, winRate: 0 }, 
        partyStats: { matches: 0, wins: 0, losses: 0, winRate: 0 } 
      };
    }
    
    const stats = {};
    const targetName = activeSearchQuery.split('#')[0].toLowerCase();

    let soloMatches = 0;
    let soloWins = 0;
    let soloLosses = 0;

    let partyMatches = 0;
    let partyWins = 0;
    let partyLosses = 0;

    displayedMatches.forEach(match => {
      const myPlayer = match.scoreboard?.find(p => String(p.name || "").toLowerCase() === targetName);
      if (!myPlayer) return;

      const myPartyId = myPlayer.party_id;
      const myTeam = myPlayer.team;
      const redScore = match.teams?.red || 0;
      const blueScore = match.teams?.blue || 0;
      
      const isWin = (redScore > blueScore && myTeam === 'Red') || (blueScore > redScore && myTeam === 'Blue');
      const isDraw = redScore === blueScore;

      // หาเพื่อนทุกคนที่ party_id ตรงกับเรา (แต่ไม่ใช่ตัวเราเอง)
      const partyMembers = myPartyId ? (match.scoreboard?.filter(p => 
        p.party_id === myPartyId && String(p.name || "").toLowerCase() !== targetName
      ) || []) : [];

      if (partyMembers.length === 0) {
        soloMatches += 1;
        if (isWin) soloWins += 1;
        else if (!isDraw) soloLosses += 1;
      } else {
        partyMatches += 1;
        if (isWin) partyWins += 1;
        else if (!isDraw) partyLosses += 1;
      }

      partyMembers.forEach(friend => {
        const friendKey = `${friend.name}#${friend.tag}`;
        if (!stats[friendKey]) {
          stats[friendKey] = {
            name: friend.name,
            tag: friend.tag,
            matches: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            lastAgent: friend.agent
          };
        }

        stats[friendKey].matches += 1;
        stats[friendKey].lastAgent = friend.agent;

        if (isDraw) stats[friendKey].draws += 1;
        else if (isWin) stats[friendKey].wins += 1;
        else stats[friendKey].losses += 1;
      });
    });

    const soloWinRate = soloMatches > 0 ? Math.round((soloWins / soloMatches) * 100) : 0;
    const partyWinRate = partyMatches > 0 ? Math.round((partyWins / partyMatches) * 100) : 0;

    const friends = Object.values(stats).map(friend => {
      const winRate = friend.matches > 0 ? Math.round((friend.wins / friend.matches) * 100) : 0;
      let badge = { 
        label: 'Combat Partner', 
        icon: '⚔️', 
        color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' 
      };
      if (winRate >= 60 && friend.matches >= 2) {
        badge = { 
          label: 'Dream Duo', 
          icon: '🔥', 
          color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/15 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
        };
      } else if (winRate <= 40 && friend.matches >= 2) {
        badge = { 
          label: 'Cursed Duo', 
          icon: '💀', 
          color: 'border-red-500/40 text-red-400 bg-red-500/15' 
        };
      }
      return {
        ...friend,
        winRate,
        badge
      };
    }).sort((a, b) => b.matches - a.matches).slice(0, 5);

    return {
      friends,
      soloStats: { matches: soloMatches, wins: soloWins, losses: soloLosses, winRate: soloWinRate },
      partyStats: { matches: partyMatches, wins: partyWins, losses: partyLosses, winRate: partyWinRate }
    };
  }

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
  // 🔥 ไอคอนแสดงลูกศรขึ้นลง (แสดงต่อท้ายในบรรทัดเดียวกันเสมอ)
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key || sortConfig.direction === 'default') {
      return <span className="inline-block ml-1 text-gray-500 text-[11px] font-normal select-none">↕</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="inline-block ml-1 text-yellow-400 text-[11px] font-black select-none">↑</span> 
      : <span className="inline-block ml-1 text-yellow-400 text-[11px] font-black select-none">↓</span>;
  };

  const overallStats = getOverallStats();
  const roleStatsArray = getRoleStats();
  const agentStatsArray = getAgentStats();
  const mapStatsArray = getMapStats();
  const partyData = getPartyStats();
  const partyStatsArray = partyData.friends;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans transition-all duration-500 flex flex-col relative">
      
      {/* 🌐 NAVBAR */}
      {hasData && (
        <nav className="w-full bg-gray-900 border-b border-gray-800 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-90 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform whitespace-nowrap" onClick={() => setPlayerData(null)}>
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
          <div className="flex w-full lg:w-auto max-w-md gap-2 relative" ref={navSearchContainerRef}>
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="ชื่อผู้เล่น#แท็ก" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onFocus={() => setShowNavHistory(true)}
                onKeyDown={handleKeyPress} 
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-all font-bold" 
                spellCheck="false" 
              />
              <SearchHistoryDropdown
                history={searchHistory}
                isOpen={showNavHistory}
                onSelect={handleSelectHistoryItem}
                onRemove={removeFromHistory}
                onClearAll={clearAllHistory}
              />
            </div>
            <button 
              onClick={() => {
                setShowNavHistory(false);
                fetchStats(filterMode, true);
              }} 
              disabled={loading} 
              className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold py-2 px-4 rounded-xl text-sm whitespace-nowrap"
            >
              ค้นหาใหม่
            </button>
          </div>
        </nav>
      )}

      {/* 🏠 หน้าแรก */}
      {!hasData && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-5 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-black text-red-500 tracking-wider mb-2">VALORANT STATS</h1>
            <p className="text-gray-400 text-sm md:text-base tracking-widest uppercase">Enter your Riot ID to view match history</p>
          </div>
          <div className="w-full max-w-2xl bg-gray-900/60 p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl mb-8">
            <div className="flex flex-col gap-5">
              <div className="relative w-full" ref={homeSearchContainerRef}>
                <input 
                  type="text" 
                  placeholder="ชื่อผู้เล่น#แท็ก (เช่น Jett#TH1)" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onFocus={() => setShowHomeHistory(true)}
                  onKeyDown={handleKeyPress} 
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-6 py-4 text-white text-xl md:text-2xl text-center focus:border-red-500" 
                  spellCheck="false" 
                />
                <SearchHistoryDropdown
                  history={searchHistory}
                  isOpen={showHomeHistory}
                  onSelect={handleSelectHistoryItem}
                  onRemove={removeFromHistory}
                  onClearAll={clearAllHistory}
                />
              </div>
              <button 
                onClick={() => {
                  setShowHomeHistory(false);
                  fetchStats(filterMode, true);
                }} 
                disabled={loading} 
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl w-full text-lg shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              >
                {loading ? "กำลังสแกนและดึงข้อมูล..." : "ค้นหาประวัติการแข่งขัน"}
              </button>
            </div>
          </div>
          {errorMsg && <div className="text-red-400 font-bold bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/50">⚠️ {errorMsg}</div>}
        </div>
      )}

      {/* 📜 ส่วนแสดงเนื้อหา (Layout 2 คอลัมน์) */}
      {hasData && (
        <div className="flex-1 w-full max-w-7xl mx-auto py-8 px-5 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* 📊 แผงด้านซ้าย (Sidebar) */}
          <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col gap-5">
            {/* 🌟 RANK CARD 🌟 */}
            {playerData.rank && (
              <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in relative overflow-hidden mb-5">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full"></div>
                
                <h3 className="text-white text-base font-black tracking-widest uppercase mb-4 flex items-center gap-2 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  COMPETITIVE RANK
                </h3>
                
                <div className="flex items-center justify-between relative z-10 mt-2">
                  <div className="flex flex-col items-center w-1/2 border-r border-gray-800 px-2">
                    <span className="text-[10px] text-gray-500 font-bold mb-3 tracking-widest uppercase">ปัจจุบัน (Current)</span>
                    <div className="h-14 flex items-center justify-center mb-3">
                      {rankImages[String(playerData.rank.current || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"] ? (
                        <img 
                          src={rankImages[String(playerData.rank.current || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"]} 
                          alt={playerData.rank.current || "Unranked"} 
                          className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] scale-110" 
                        />
                      ) : (
                        <span className="text-xs text-gray-500">No Icon</span>
                      )}
                    </div>
                    <span className="text-sm font-black text-white uppercase text-center leading-tight drop-shadow-md">
                      {playerData.rank.current || "Unranked"}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center w-1/2 px-2">
                    <span className="text-[10px] text-gray-500 font-bold mb-3 tracking-widest uppercase">สูงสุด (Peak)</span>
                    <div className="h-14 flex items-center justify-center mb-3">
                      {rankImages[String(playerData.rank.peak || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"] ? (
                        <img 
                          src={rankImages[String(playerData.rank.peak || "unranked").toLowerCase().replace(/\s/g, '')] || rankImages["unranked"]} 
                          alt={playerData.rank.peak || "Unranked"} 
                          className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,200,87,0.2)] scale-110" 
                        />
                      ) : (
                        <span className="text-xs text-gray-500">No Icon</span>
                      )}
                    </div>
                    <span className="text-sm font-black text-[#ffc857] uppercase text-center leading-tight drop-shadow-md">
                      {playerData.rank.peak || "Unranked"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* OVERALL SUMMARY */}
            {overallStats && (
              <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in">
                <h3 className="text-white text-base font-black tracking-widest uppercase mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">📈</span> OVERALL SUMMARY
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/40 border border-gray-800/60 p-3 rounded-xl text-center">
                    <p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">Win Rate</p>
                    <p className="text-2xl font-black text-green-400 mt-1">{overallStats.winRate.toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-400 mt-1">{overallStats.wins}W - {overallStats.losses}L</p>
                  </div>
                  <div className="bg-gray-900/40 border border-gray-800/60 p-3 rounded-xl text-center">
                    <p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">KDA Ratio</p>
                    <p className="text-2xl font-black text-white mt-1">{overallStats.kdaRatio}</p>
                    <p className="text-[10px] font-mono text-blue-400 mt-1">{overallStats.totalKills}/{overallStats.totalDeaths}/{overallStats.totalAssists}</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 text-center font-bold tracking-widest uppercase mt-4">
                  Calculated from last {overallStats.totalMatches} matches
                </p>
              </div>
            )}

            {/* 🎯 HIT DISTRIBUTION MATRIX (Aim Profile) */}
            {allHistoricalMatches.length > 0 && (
              <HitMatrixCard 
                matches={allHistoricalMatches} 
                activeSearchQuery={activeSearchQuery} 
              />
            )}

            {/* ROLES PERFORMANCE */}
            <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-base font-black tracking-widest uppercase flex items-center gap-2">
                  <span className="text-red-500">🎯</span> ROLES PERFORMANCE
                </h3>
                {allHistoricalMatches.length > 0 && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/25">
                    {allHistoricalMatches.length} แมตช์สะสม
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {roleStatsArray.length > 0 ? roleStatsArray.map((role, idx) => {
                  const winRate = role.matches > 0 ? ((role.w / role.matches) * 100) : 0;
                  const kda = role.death > 0 ? ((role.k + role.a) / role.death).toFixed(2) : (role.k + role.a).toFixed(2);
                  const circumference = 125.6; 
                  const dashOffset = circumference - (winRate / 100) * circumference;

                  return (
                    <div key={idx} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-gray-800/60 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex items-center justify-center bg-gray-950 rounded-full shadow-inner">
                          <svg className="absolute top-0 left-0 w-full h-full -rotate-90 transform">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-800" />
                            <circle 
                              cx="24" cy="24" r="20" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              fill="none" 
                              className="text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)] transition-all duration-1000" 
                              strokeDasharray={circumference}
                              strokeDashoffset={dashOffset}
                              strokeLinecap="round"
                            />
                          </svg>
                          {roleIcons[role.name] ? (
                            <img src={roleIcons[role.name]} className="w-5 h-5 opacity-90" alt={role.name} />
                          ) : (
                            <span className="text-[10px] text-gray-500 font-bold">{String(role.name || "UN").substring(0,2)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-white font-bold text-sm leading-none">{role.name}</p>
                          <p className="text-xs text-gray-300 font-bold mt-1.5">WR {winRate.toFixed(1)}%</p>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">{role.w}W - {role.l}L</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                        <p className="text-white font-black text-sm">KDA {kda}</p>
                        <p className="text-[10px] font-mono text-blue-400 mt-1">
                          {role.k}<span className="text-gray-600">/</span><span className="text-red-400">{role.death}</span><span className="text-gray-600">/</span>{role.a}
                        </p>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center text-gray-600 py-4 text-xs border border-dashed border-gray-800 rounded-xl">ไม่พบข้อมูลสายการเล่น</div>
                )}
              </div>
            </div>

            {/* 👥 DUO SYNERGY & PARTY INTELLIGENCE */}
            <div className="bg-[#111823] border border-gray-800/80 rounded-2xl p-5 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-base font-black tracking-widest uppercase flex items-center gap-2">
                  <span className="text-green-400">👥</span> PARTY INTELLIGENCE
                </h3>
              </div>

              {/* ⚖️ Solo vs Party Win Rate Comparison */}
              {(partyData.soloStats.matches > 0 || partyData.partyStats.matches > 0) && (
                <div className="mb-4 bg-gray-950/60 p-3 rounded-xl border border-gray-800/80">
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                    <span className="text-gray-300 flex items-center gap-1">
                      <span>👤 Solo</span>
                      <span className="text-gray-500 font-normal">({partyData.soloStats.matches}G)</span>
                    </span>
                    <span className="text-gray-300 flex items-center gap-1">
                      <span>👥 Party</span>
                      <span className="text-gray-500 font-normal">({partyData.partyStats.matches}G)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-black text-sm mb-2">
                    <span className={partyData.soloStats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                      WR {partyData.soloStats.winRate}%
                    </span>
                    <span className={partyData.partyStats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                      WR {partyData.partyStats.winRate}%
                    </span>
                  </div>

                  {/* Dual comparison bar */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${partyData.soloStats.winRate}%` }} 
                        className={`h-full rounded-full ${partyData.soloStats.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`} 
                      />
                    </div>
                    <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${partyData.partyStats.winRate}%` }} 
                        className={`h-full rounded-full ${partyData.partyStats.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                {partyStatsArray.length > 0 ? partyStatsArray.map((friend, idx) => {
                  const winRate = friend.winRate;
                  const badge = friend.badge;

                  return (
                    <div key={idx} className="flex items-center justify-between bg-gray-900/50 p-2.5 sm:p-3 rounded-xl border border-gray-800/60 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-950 rounded-lg border border-gray-700 p-0.5 flex-shrink-0 flex items-center justify-center">
                          {agentImages[friend.lastAgent] ? (
                            <img src={agentImages[friend.lastAgent]} alt={friend.lastAgent} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500">{String(friend.name).substring(0, 2)}</span>
                          )}
                        </div>
                        <div className="flex flex-col truncate">
                          <p className="text-white font-bold text-xs sm:text-sm truncate flex items-center gap-1">
                            {friend.name}
                            <span className="text-[10px] text-gray-500 font-normal">#{friend.tag}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {friend.matches} แมตช์ ({friend.wins}W - {friend.losses}L)
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end justify-center flex-shrink-0 ml-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded border ${
                          winRate >= 50 ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          WR {winRate}%
                        </span>
                        <span className={`text-[9px] font-black mt-1 px-1.5 py-0.5 rounded border flex items-center gap-1 ${badge.color}`}>
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center text-gray-600 py-4 text-xs border border-dashed border-gray-800 rounded-xl">
                    เล่นคนเดียว (Solo Queue) ในแมตช์ที่แสดง
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 📊 แผงด้านขวา (เนื้อหาหลัก) */}
          <div className="flex-1 w-full min-w-0 flex flex-col">
            {activeTab === "overview" && (
              <OverviewTab 
                displayedMatches={displayedMatches}
                activeSearchQuery={activeSearchQuery}
                filterMode={filterMode}
                loading={loading}
                onModeChange={handleModeChange}
                onMatchSelect={(match) => {
                  setSelectedMatch(match);
                  setSortConfig({ key: null, direction: 'default' });
                }}
                agentImages={agentImages}
                mapDetails={mapDetails}
                VALORANT_MODES={VALORANT_MODES}
              />
            )}

            {activeTab === "agents" && (
              <AgentsTab 
                agentStatsArray={agentStatsArray}
                agentImages={agentImages}
                agentRoles={agentRoles}
                roleIcons={roleIcons}
                agentDetails={agentDetails}
                onMatchSelect={(match) => {
                  setSelectedMatch(match);
                  setSortConfig({ key: null, direction: 'default' });
                }}
                onNavigateToMap={(mapName) => {
                  setActiveTab("maps");
                  setInitialModalMap(mapName);
                }}
                initialSelectedAgent={initialModalAgent}
                onClearInitialAgent={() => setInitialModalAgent(null)}
                mapStatsArray={mapStatsArray}
                mapDetails={mapDetails}
                totalHistoricalMatches={allHistoricalMatches.length}
              />
            )}

            {activeTab === "maps" && (
              <MapsTab 
                mapStatsArray={mapStatsArray}
                mapDetails={mapDetails}
                agentImages={agentImages}
                onMatchSelect={(match) => {
                  setSelectedMatch(match);
                  setSortConfig({ key: null, direction: 'default' });
                }}
                onNavigateToAgent={(agentName) => {
                  setActiveTab("agents");
                  setInitialModalAgent(agentName);
                }}
                initialSelectedMap={initialModalMap}
                onClearInitialMap={() => setInitialModalMap(null)}
                agentStatsArray={agentStatsArray}
                activeSearchQuery={activeSearchQuery}
                totalHistoricalMatches={allHistoricalMatches.length}
              />
            )}
          </div>
        </div>
      )}

      {/* 📜 FOOTER */}
      {hasData && (
        <footer className="w-full bg-gray-950 border-t border-gray-900 py-6 mt-8 text-center px-4">
          <p className="text-gray-500 text-[10px] md:text-xs max-w-4xl mx-auto leading-relaxed">
            This project is a non-commercial, fan-made application. VALORANT STATS isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
          </p>
        </footer>
      )}

      {/* 🔥 FULL SCOREBOARD MODAL POP-UP 🔥 */}
      <ScoreboardModal
        selectedMatch={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        targetPlayerName={activeSearchQuery.split('#')[0].toLowerCase()}
        agentImages={agentImages}
        rankImages={rankImages}
        mapDetails={mapDetails}
        agentRoles={agentRoles}
        roleIcons={roleIcons}
      />
    </div>
  )
}

export default App