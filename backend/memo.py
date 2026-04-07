from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Reactからの通信を許可する設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Memo(BaseModel):
    content: str

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.post("/memos")
async def create_memo(memo: Memo):
    print(f"受信したメモ: {memo.content}")

    return {"message": "保存されました！"}