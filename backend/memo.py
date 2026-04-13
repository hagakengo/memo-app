from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Reactからの通信を許可する設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173" #http://localhost:5173 を追加
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Memo(BaseModel):
    title: str # 4/12のケンケンの指摘によりタイトルを追加。
    content: str

# 4/13追加：メモを保存するためのリストとIDカウンターを追加。
memos = []
memo_id_counter = 1

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

# 4/13追加：現在保存されているメモを見るためのための一覧（GET）
@app.get("/memos")
def get_memos():
    return memos

@app.post("/memos")
async def create_memo(memo: Memo):
    print(f"受信したメモ - タイトル: {memo.title}, 内容: {memo.content}") # 4/12のケンケンの指摘によりタイトルを追加。

    return {"message": "保存されました！"}