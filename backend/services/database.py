import datetime
from typing import List, Dict, Any, Optional
from pymongo import MongoClient, UpdateOne
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
from backend.config import MONGO_URI, DB_NAME

_client: Optional[MongoClient] = None

def get_mongo_client() -> Optional[MongoClient]:
    """คืนค่า MongoClient แบบ Singleton เชื่อมต่อเพียงครั้งเดียว"""
    global _client
    if not MONGO_URI:
        return None
    
    if _client is None:
        try:
            _client = MongoClient(
                MONGO_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=10000,
                maxPoolSize=50
            )
        except Exception as e:
            print("❌ ไม่สามารถสร้าง MongoClient:", e)
            _client = None
            
    return _client

def get_database():
    """ดึง Database instance"""
    client = get_mongo_client()
    if client is None:
        return None
    return client[DB_NAME]

def check_db_connection() -> Dict[str, Any]:
    """ทดสอบ Ping ตรวจสอบการเชื่อมต่อ MongoDB Atlas"""
    client = get_mongo_client()
    if not client:
        return {
            "connected": False, 
            "message": "ไม่มีการตั้งค่า MONGO_URI ในไฟล์ .env"
        }
    
    try:
        # สั่ง ping ไปที่ admin database
        client.admin.command('ping')
        db = client[DB_NAME]
        collections = db.list_collection_names()
        return {
            "connected": True,
            "database": DB_NAME,
            "collections": collections,
            "message": "เชื่อมต่อ MongoDB Atlas สำเร็จ!"
        }
    except ServerSelectionTimeoutError:
        return {
            "connected": False,
            "message": "หมดเวลาเชื่อมต่อ (Timeout) กรุณาตรวจสอบ Network Access (IP Whitelist) ใน MongoDB Atlas ว่าเปิด 0.0.0.0/0 หรือยัง"
        }
    except PyMongoError as e:
        return {
            "connected": False,
            "message": f"MongoDB Error: {str(e)}"
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Connection Error: {str(e)}"
        }

def upsert_matches(match_list: List[Dict[str, Any]], target_name: str = "", target_tag: str = "") -> int:
    """
    บันทึกหรืออัปเดตแมตช์ลงในคอลเลกชัน 'matches'
    ใช้ match_id เป็น Unique Key เพื่อไม่ให้ข้อมูลซ้ำซ้อน
    """
    db = get_database()
    if db is None or not match_list:
        return 0

    try:
        matches_col = db["matches"]
        # สร้าง Index บน match_id หากยังไม่มี
        matches_col.create_index("match_id", unique=True)
        matches_col.create_index("tracked_players")

        player_key = f"{target_name}#{target_tag}".lower().strip() if target_name else ""
        operations = []

        for match in match_list:
            match_id = match.get("match_id")
            if not match_id:
                continue

            match_doc = dict(match)
            match_doc["updated_at"] = datetime.datetime.utcnow()

            # สร้างชุดคำสั่ง $set และ $addToSet
            update_query: Dict[str, Any] = {"$set": match_doc}
            if player_key:
                update_query["$addToSet"] = {"tracked_players": player_key}

            operations.append(
                UpdateOne(
                    {"match_id": match_id},
                    update_query,
                    upsert=True
                )
            )

        if operations:
            result = matches_col.bulk_write(operations, ordered=False)
            upserted_or_modified = (result.upserted_count or 0) + (result.modified_count or 0)
            return upserted_or_modified
    except Exception as e:
        print("⚠️ ไม่สามารถบันทึกแมตช์ลง MongoDB:", e)
        return 0

    return 0

def upsert_player_profile(name: str, tag: str, rank_data: Dict[str, Any]) -> bool:
    """บันทึกข้อมูลและแรงค์ของผู้เล่นลงคอลเลกชัน 'players'"""
    db = get_database()
    if db is None or not name:
        return False

    try:
        players_col = db["players"]
        players_col.create_index([("name_lower", 1), ("tag_lower", 1)], unique=True)

        player_doc = {
            "name": name,
            "tag": tag,
            "name_lower": name.lower().strip(),
            "tag_lower": tag.lower().strip(),
            "rank": rank_data,
            "updated_at": datetime.datetime.utcnow()
        }

        players_col.update_one(
            {"name_lower": name.lower().strip(), "tag_lower": tag.lower().strip()},
            {"$set": player_doc},
            upsert=True
        )
        return True
    except Exception as e:
        print("⚠️ ไม่สามารถบันทึกโปรไฟล์ผู้เล่นลง MongoDB:", e)
        return False

def get_cached_player_matches(name: str, tag: str, mode: str = "All", limit: int = 20) -> List[Dict[str, Any]]:
    """ดึงแมตช์ที่เคยบันทึกไว้ใน MongoDB สำหรับผู้เล่นนี้"""
    db = get_database()
    if db is None:
        return []

    try:
        matches_col = db["matches"]
        player_key = f"{name}#{tag}".lower().strip()

        # ค้นหาแมตช์ที่มี player_key ใน tracked_players หรือใน scoreboard
        query: Dict[str, Any] = {
            "$or": [
                {"tracked_players": player_key},
                {"scoreboard.name": {"$regex": f"^{name}$", "$options": "i"}}
            ]
        }

        if mode and mode != "All":
            query["mode"] = {"$regex": f"^{mode}$", "$options": "i"}

        cursor = matches_col.find(
            query,
            {"_id": 0}  # ไม่ส่ง Mongo ObjectId กลับไป เพื่อให้ JSON serialize ได้ง่าย
        ).sort("updated_at", -1).limit(limit)

        return list(cursor)
    except Exception as e:
        print("⚠️ ไม่สามารถดึงแคชแมตช์จาก MongoDB:", e)
        return []

def get_all_player_matches(name: str, tag: str, mode: str = "All") -> List[Dict[str, Any]]:
    """ดึงประวัติการแข่งขันทั้งหมดที่เคยบันทึกไว้ใน MongoDB สำหรับผู้เล่นคนนี้ (ไม่จำกัดจำนวน)"""
    db = get_database()
    if db is None:
        return []

    try:
        matches_col = db["matches"]
        player_key = f"{name}#{tag}".lower().strip()

        query: Dict[str, Any] = {
            "$or": [
                {"tracked_players": player_key},
                {"scoreboard.name": {"$regex": f"^{name}$", "$options": "i"}}
            ]
        }

        if mode and mode != "All":
            query["mode"] = {"$regex": f"^{mode}$", "$options": "i"}

        cursor = matches_col.find(
            query,
            {"_id": 0}
        ).sort("updated_at", -1)

        return list(cursor)
    except Exception as e:
        print("⚠️ ไม่สามารถดึงประวัติแมตช์ทั้งหมดจาก MongoDB:", e)
        return []

def get_cached_player_profile(name: str, tag: str) -> Optional[Dict[str, Any]]:
    """ดึงโปรไฟล์และแรงค์ที่เคยบันทึกไว้จาก MongoDB"""
    db = get_database()
    if db is None:
        return None

    try:
        players_col = db["players"]
        doc = players_col.find_one(
            {"name_lower": name.lower().strip(), "tag_lower": tag.lower().strip()},
            {"_id": 0}
        )
        return doc
    except Exception as e:
        print("⚠️ ไม่สามารถดึงโปรไฟล์ผู้เล่นจาก MongoDB:", e)
        return None
