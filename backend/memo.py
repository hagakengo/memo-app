import sqlite3
from contextlib import contextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://memo-app-phi-one.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "memos.db"


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS memos (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                title   TEXT    NOT NULL DEFAULT '',
                content TEXT    NOT NULL,
                tag     TEXT    NOT NULL DEFAULT ''
            )
        """)
        conn.commit()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


@app.on_event("startup")
def startup():
    init_db()


class Memo(BaseModel):
    title: str = ""
    content: str
    tag: str = ""


@app.get("/memos")
def get_memos():
    with get_db() as conn:
        rows = conn.execute("SELECT id, title, content, tag FROM memos").fetchall()
    return [dict(row) for row in rows]


@app.post("/memos")
def create_memo(memo: Memo):
    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO memos (title, content, tag) VALUES (?, ?, ?)",
            (memo.title, memo.content, memo.tag),
        )
        conn.commit()
        new_id = cursor.lastrowid
    print(f"保存したメモ: id={new_id}, title={memo.title}")
    return {"message": "保存されました", "id": new_id}


@app.delete("/memos/{memo_id}")
def delete_memo(memo_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM memos WHERE id = ?", (memo_id,))
        conn.commit()
    return {"message": f"ID {memo_id} のメモが削除されました"}
