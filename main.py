from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # นำเข้าตัวจัดการประตูรักษาความปลอดภัย
import requests
import os # เครื่องมืออ่านระบบปฏิบัติการ
from dotenv import load_dotenv # เครื่องมือโหลดไฟล์ลับ

# โหลดค่าจากไฟล์ .env เข้าสู่ระบบ
load_dotenv()

app = FastAPI()

# 🔥 เพิ่มโค้ดชุดนี้เข้าไปใต้คำว่า app = FastAPI() 🔥
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # อนุญาตให้เว็บ Vercel (หรือเว็บอื่นๆ) เข้ามาดึงข้อมูลได้
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 2. ดึง API Key มาจากไฟล์ลับ .env อย่างปลอดภัย
API_KEY = os.getenv("VALORANT_API_KEY")

def calculate_performance(kills: int, deaths: int, assists: int, headshots: int):
    safe_deaths = deaths if deaths > 0 else 1
    kda_ratio = (kills + assists) / safe_deaths
    hs_ratio = headshots / kills if kills > 0 else 0
    kda_score = min(100, (kda_ratio / 3.0) * 100) 
    acc_score = min(100, (hs_ratio / 0.8) * 100)
    total_score = round((kda_score * 0.7) + (acc_score * 0.3))
    
    if total_score >= 80:
        grade = "S (Excellent)"
    elif total_score >= 65:
        grade = "A (Great)"
    elif total_score >= 50:
        grade = "B (Good)"
    elif total_score >= 35:
        grade = "C (Average)"
    else:
        grade = "D (Needs Improvement)"
        
    return total_score, grade, round(kda_ratio, 2)

@app.get("/")
def read_root():
    return {"message": "Welcome to VALORANT Dashboard API!", "status": "Server is running perfectly"}

@app.get("/api/player/{name}/{tag}")
def get_player_info(name: str, tag: str):
    url = f"https://api.henrikdev.xyz/valorant/v1/account/{name}/{tag}"
    headers = {"Authorization": API_KEY}
    response = requests.get(url, headers=headers)
    
    # 🔥 เพิ่ม 3 บรรทัดนี้เข้าไป เพื่อดักทางเวลาหาชื่อไม่เจอ
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลผู้เล่นนี้ โปรดตรวจสอบชื่อและแท็กอีกครั้ง")
        
    data = response.json()
    
    if response.status_code == 200:
        data = response.json()
        return {
            "message": "ดึงข้อมูลสำเร็จ!",
            "player_name": data['data']['name'],
            "player_tag": data['data']['tag'],
            "account_level": data['data']['account_level'],
            "card_image": data['data']['card']['small']
        }
    else:
        return {"error": "ไม่พบข้อมูลผู้เล่น", "status_code": response.status_code}

@app.get("/api/matches/{name}/{tag}")
def get_player_matches(name: str, tag: str, mode: str = "All"):
    region = "ap"
    headers = {"Authorization": API_KEY}
    
    # 1. แอบดึงแรงค์จริงมาเก็บไว้เผื่อเอาไปปะผุในโหมด Unrated
    my_real_rank = "Unranked"
    try:
        mmr_url = f"https://api.henrikdev.xyz/valorant/v1/mmr/{region}/{name}/{tag}"
        mmr_res = requests.get(mmr_url, headers=headers)
        if mmr_res.status_code == 200:
            mmr_data = mmr_res.json()
            if 'data' in mmr_data and 'currenttierpatched' in mmr_data['data']:
                my_real_rank = mmr_data['data']['currenttierpatched']
    except Exception as e:
        print("ดึงข้อมูล MMR ไม่สำเร็จ:", e)

    # 🔥 2. ดึงประวัติ 20 นัดล่าสุด พร้อมยัดตัวกรองดัก API ทุกรูปแบบ
    url = f"https://api.henrikdev.xyz/valorant/v3/matches/{region}/{name}/{tag}?size=20"
    if mode != "All":
        mode_lower = mode.lower()
        url += f"&mode={mode_lower}&filter={mode_lower}"
        
    response = requests.get(url, headers=headers)
    
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
                return {"message": "Success", "match_history": match_history}
            else:
                return {"error": "ไม่พบข้อมูลสถิติของคุณในระบบแมตช์"}
        else:
            return {"message": "ไม่พบประวัติการแข่งขันล่าสุด"}
    else:
        return {"error": "ไม่สามารถดึงข้อมูลได้", "status": response.status_code}
    
