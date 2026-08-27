import { useState, useEffect } from 'react';

export default function useValorantAssets() {
  const [agentImages, setAgentImages] = useState({});
  const [rankImages, setRankImages] = useState({});
  const [agentRoles, setAgentRoles] = useState({});
  const [roleIcons, setRoleIcons] = useState({});

  useEffect(() => {
    fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
      .then(res => res.json())
      .then(data => {
        if (!data || !data.data) return;
        const imageMap = {};
        const roleMap = {};
        const rIconMap = {};
        data.data.forEach(agent => {
          imageMap[agent.displayName] = agent.displayIcon;
          if (agent.role) {
            roleMap[agent.displayName] = agent.role.displayName;
            rIconMap[agent.role.displayName] = agent.role.displayIcon;
          }
        });
        setAgentImages(imageMap);
        setAgentRoles(roleMap);
        setRoleIcons(rIconMap);
      })
      .catch(err => console.error("โหลดรูป Agent ไม่สำเร็จ:", err));

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

  return { agentImages, rankImages, agentRoles, roleIcons };
}
