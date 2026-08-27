from fastapi import APIRouter, HTTPException
from backend.services.valorant_api import fetch_account

router = APIRouter(prefix="/api/player")

@router.get("/{name}/{tag}")
def get_player_info(name: str, tag: str):
    response = fetch_account(name, tag)
    
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
