"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Zap, Edit3, Check, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type Memo = {
  id: number;
  title: string;
  content: string;
  tag: string;
  createdAt?: string;
  isSaved?: boolean;
};

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedMemoId, setSelectedMemoId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false); // 編集モード管理

  useEffect(() => {
    fetch("https://memo-app-backend-054s.onrender.com/memos")
      .then((res) => res.json())
      .then((data) => setMemos(data.map((m: Memo) => ({ ...m, isSaved: true }))))
      .catch(() => {});
  }, []);

  const selectedMemo = memos.find(m => m.id === selectedMemoId);

  const saveToBackend = async () => {
    if (!selectedMemo) return;
    try {
      if (selectedMemo.isSaved) {
        await fetch(`https://memo-app-backend-054s.onrender.com/memos/${selectedMemo.id}`, { method: "DELETE" });
      }
      const response = await fetch("https://memo-app-backend-054s.onrender.com/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedMemo.title,
          content: selectedMemo.content,
          tag: selectedMemo.tag
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.id) {
          setMemos(memos.map(m => m.id === selectedMemo.id ? { ...m, id: data.id, isSaved: true } : m));
          setSelectedMemoId(data.id);
        }
        alert("保存に成功しました！");
        setIsEditing(false);
      }
    } catch (error) {
      alert("バックエンド接続エラー");
    }
  };

  const addMemo = () => {
    const newMemo: Memo = {
      id: Date.now(),
      title: "無題のメモ",
      content: "",
      tag: "なし",
      createdAt: new Date().toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
    };
    setMemos([{ ...newMemo, isSaved: false }, ...memos]);
    setSelectedMemoId(newMemo.id);
    setIsEditing(true);
  };

  const updateMemo = (id: number, field: keyof Memo, value: string) => {
    setMemos(memos.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const deleteMemo = async (id: number) => {
    if(!confirm("本当に削除しますか？")) return;
    const memo = memos.find(m => m.id === id);
    if (memo?.isSaved) {
      try {
        await fetch(`https://memo-app-backend-054s.onrender.com/memos/${id}`, { method: "DELETE" });
      } catch (error) {}
    }
    setMemos(memos.filter((m) => m.id !== id));
    if (selectedMemoId === id) setSelectedMemoId(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">

      {/* 1. サイドバー */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <header className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Memo</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={addMemo} className="rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="検索..." className="pl-9 bg-slate-100 border-none rounded-full" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {memos.map((memo) => (
              <button
                key={memo.id}
                onClick={() => {setSelectedMemoId(memo.id); setIsEditing(false);}}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedMemoId === memo.id ? "bg-blue-50" : "hover:bg-slate-100"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm truncate">{memo.title}</span>
                  <Badge variant="outline" className="text-[10px] py-0">{memo.tag}</Badge>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{memo.content}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* 2. メインエリア */}
      <main className="flex-1 bg-white flex flex-col">
        {selectedMemo ? (
          <>
            <header className="p-4 border-b flex items-center justify-between gap-4">
              <div className="flex-1">
                <Input
                  value={selectedMemo.title}
                  disabled={!isEditing}
                  onChange={(e) => updateMemo(selectedMemo.id, "title", e.target.value)}
                  className="text-2xl font-extrabold border-none p-0 focus-visible:ring-0 disabled:opacity-100"
                />
                <div className="flex items-center gap-2 mt-1">
                  <Tag className="h-3 w-3 text-slate-400" />
                  <select
                    value={selectedMemo.tag}
                    disabled={!isEditing}
                    onChange={(e) => updateMemo(selectedMemo.id, "tag", e.target.value)}
                    className="text-xs bg-transparent border-none text-blue-600 font-medium cursor-pointer focus:outline-none"
                  >
                    <option value="なし">なし</option>
                    <option value="重要">重要</option>
                    <option value="仕事">仕事</option>
                    <option value="個人">個人</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="rounded-full"
                >
                  {isEditing ? <><Check className="h-4 w-4 mr-1"/>確定</> : <><Edit3 className="h-4 w-4 mr-1"/>編集</>}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMemo(selectedMemo.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </header>

            <div className="flex-1 p-6 flex flex-col">
              <Textarea
                value={selectedMemo.content}
                disabled={!isEditing}
                onChange={(e) => updateMemo(selectedMemo.id, "content", e.target.value)}
                placeholder="内容を入力..."
                className="flex-1 text-base border-none p-0 focus-visible:ring-0 shadow-none resize-none disabled:opacity-100"
              />
            </div>

            <footer className="p-3 border-t bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-400">文字数: {selectedMemo.content.length}</div>
              <Button onClick={saveToBackend} className="bg-blue-600 hover:bg-blue-700 rounded-full px-8">
                保存する
              </Button>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
            <Zap className="h-12 w-12 mb-2 opacity-20" />
            <p>メモを選択してください</p>
          </div>
        )}
      </main>
    </div>
  );
}
