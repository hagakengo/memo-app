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
    title: str = ""
    content: str
    tag: str = ""

# 4/13追加：メモを保存するためのリストとIDカウンターを追加。
memos = []
memo_id_counter = 1

# 4/17削除：最初の確認用コードHello from FastAPI!を削除。

# 4/13追加：現在保存されているメモを見るためのための一覧（GET）
@app.get("/memos")
def get_memos():
    return memos
# 4/14追加：メモを保存するためのエンドポイント（POST）
@app.post("/memos")
async def create_memo(memo: Memo):
    global memo_id_counter

# 4/14追加：新しいメモのデータを作成し、IDを割り当てて保存する。
    new_memo = {
        "id": memo_id_counter,
        "title": memo.title,
        "content": memo.content,
        "tags": memo.tag # 4/17追加：タグの情報も保存する。
    }
    # 4/14追加：リストに追加。
    memos.append(new_memo)
    # 4/14追加：IDカウンターをインクリメント。
    memo_id_counter += 1

    print(f"バインダーに保存したメモ: {new_memo}")
    return {"message": "保存されました"} # 4/12のケンケンの指摘によりタイトルを追加。

#4/14追加、削除機能。
@app.delete("/memos/{memo_id}")
def delete_memo(memo_id: int):
    global memos

    # 4/14追加：指定されたIDのメモをリストから削除。
    memos = [memo for memo in memos if memo["id"] != memo_id]

    return {"message": f"ID {memo_id} のメモが削除されました"}
