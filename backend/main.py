from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # นำเข้าตัวจัดการประตูรักษาความปลอดภัย
from backend.routers import player, matches
from backend.services.database import check_db_connection

app = FastAPI()

# 🔥 เพิ่มโค้ดชุดนี้เข้าไปใต้คำว่า app = FastAPI() 🔥
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # อนุญาตให้เว็บ Vercel (หรือเว็บอื่นๆ) เข้ามาดึงข้อมูลได้
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(player.router)
app.include_router(matches.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to VALORANT Dashboard API!", "status": "Server is running perfectly"}

@app.get("/api/health/db")
def health_db():
    """ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล MongoDB Atlas"""
    return check_db_connection()
