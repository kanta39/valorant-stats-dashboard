import os
from dotenv import load_dotenv

# โหลดค่าจากไฟล์ .env เข้าสู่ระบบ
load_dotenv()

# 🔑 2. ดึง API Key มาจากไฟล์ลับ .env อย่างปลอดภัย
API_KEY = os.getenv("VALORANT_API_KEY")
