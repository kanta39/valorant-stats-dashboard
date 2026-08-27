from fastapi import APIRouter
from backend.services.valorant_api import fetch_mmr, fetch_matches
from backend.utils.performance import calculate_performance

router = APIRouter(prefix="/api/matches")

@router.get("/{name}/{tag}")
def get_player_matches(name: str, tag: str, mode: str = "All"):
    region = "ap"
    
# 1. อัปเกรดการดึงแรงค์ (ใช้ v2 เพื่อดึง Peak Rank และ RR)
    my_real_rank = "Unranked"
    current_rr = 0
    peak_rank = "Unranked"
    
    try:
        mmr_res = fetch_mmr(region, name, tag)
        if mmr_res.status_code == 200:
            mmr_data = mmr_res.json().get('data', {})
            if mmr_data:
                current_data = mmr_data.get('current_data', {})
                highest_rank = mmr_data.get('highest_rank', {})
                
                my_real_rank = current_data.get('currenttierpatched', 'Unranked')
                current_rr = current_data.get('ranking_in_tier', 0)
                peak_rank = highest_rank.get('patched_tier', 'Unranked')
    except Exception as e:
        print("ดึงข้อมูล MMR ไม่สำเร็จ:", e)

    # 🔥 2. ดึงประวัติ 20 นัดล่าสุด พร้อมยัดตัวกรองดัก API ทุกรูปแบบ
    response = fetch_matches(region, name, tag, 20, mode)
    
    if response.status_code == 200:
        data = response.json()
        
        if 'data' in data and len(data['data']) > 0:
            match_history = []
            
            for match in data['data']:
                metadata = match['metadata']
                
                if match.get('players') is None:
                    continue  # สั่งให้ข้ามไปแมตช์ถัดไปทันที
                all_players = match['players']['all_players']
                
                teams_data = match.get('teams', {})
                red_score = teams_data.get('red', {}).get('rounds_won', 0) if teams_data else 0
                blue_score = teams_data.get('blue', {}).get('rounds_won', 0) if teams_data else 0
                rounds_played = metadata.get('rounds_played', 1)
                if rounds_played == 0: rounds_played = 1
                
                rounds_data = match.get('rounds', [])
                round_history = []
                for idx, r in enumerate(rounds_data):
                    round_history.append({
                        "round_num": idx + 1,
                        "winning_team": r.get('winning_team', 'Unknown'),
                        "end_type": r.get('end_type', 'Eliminated')
                    })
                
                target_player_stats = None
                scoreboard_players = [] 
                
                for player in all_players:
                    is_me = player['name'].lower() == name.lower() and player['tag'].lower() == tag.lower()
                    if is_me: target_player_stats = player
                    
                    p_stats = player.get('stats', {})
                    kills = p_stats.get('kills', 0)
                    deaths = p_stats.get('deaths', 0)
                    assists = p_stats.get('assists', 0)
                    score = p_stats.get('score', 0)
                    damage = player.get('damage_made', 0)
                    
                    headshots = p_stats.get('headshots', 0)
                    bodyshots = p_stats.get('bodyshots', 0)
                    legshots = p_stats.get('legshots', 0)
                    total_shots = headshots + bodyshots + legshots
                    
                    hs_percent = round((headshots / total_shots * 100)) if total_shots > 0 else 0
                    acs = round(score / rounds_played)
                    adr = round(damage / rounds_played)
                    kd_ratio = round(kills / deaths, 2) if deaths > 0 else kills
                    plus_minus = kills - deaths

                    raw_rank = player.get('currenttier_patched')
                    if not raw_rank or str(raw_rank).lower() in ['unrated', 'unranked', '']:
                        if is_me: raw_rank = my_real_rank
                        else: raw_rank = "Unranked"

                    scoreboard_players.append({
                        "name": player['name'],
                        "tag": player['tag'],
                        "team": player['team'],
                        "agent": player['character'],
                        "rank": raw_rank,
                        "stats": {
                            "acs": acs, "kills": kills, "deaths": deaths, "assists": assists,
                            "plus_minus": plus_minus, "kd": kd_ratio, "adr": adr, "hs_percent": hs_percent
                        }
                    })
                        
                if target_player_stats:
                    stats = target_player_stats['stats']
                    score_val, grade, kda_val = calculate_performance(stats['kills'], stats['deaths'], stats['assists'], stats['headshots'])
                    
                    match_history.append({
                        "match_id": metadata['matchid'],
                        "map": metadata['map'],
                        "mode": metadata['mode'],
                        "rounds_played": rounds_played,
                        "agent": target_player_stats['character'],
                        "raw_stats": {
                            "kills": stats['kills'], "deaths": stats['deaths'], 
                            "assists": stats['assists'], "headshots": stats['headshots']
                        },
                        "analysis": {"kda_ratio": kda_val, "performance_score": score_val, "grade": grade},
                        "teams": {"red": red_score, "blue": blue_score},
                        "round_history": round_history,
                        "scoreboard": scoreboard_players
                    })
            if match_history:
                # 🔥 ส่งข้อมูล Rank กลับไปให้หน้าบ้านเอาไปใส่ในการ์ด 🔥
                return {
                    "message": "Success", 
                    "match_history": match_history,
                    "rank": {
                        "current": my_real_rank,
                        "current_rr": current_rr,
                        "peak": peak_rank
                    }
                }
            else:
                return {"error": "ไม่พบข้อมูลสถิติของคุณในระบบแมตช์"}
        else:
            return {"message": "ไม่พบประวัติการแข่งขันล่าสุด"}
    else:
        return {"error": "ไม่สามารถดึงข้อมูลได้", "status": response.status_code}
