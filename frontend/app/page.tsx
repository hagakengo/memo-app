"use client";

import { useState, KeyboardEvent } from "react";
import { Plus, Trash2, Search, Zap, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type Memo = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
};

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([
    { id: 1, title: "アイデア出し: 新機能", content: "AIを使った自動要約機能をフロントエンドに追加したい。shadcnのDialogを使うと良さそう。", tags: ["アイデア", "AI"], createdAt: "10:30" },
    { id: 2, title: "来週のTODO", content: "・バックエンド担当と疎通確認\n・ログイン画面のUI作成\n・リファクタリング", tags: ["TODO"], createdAt: "昨日" },
  ]);
  const [selectedMemoId, setSelectedMemoId] = useState<number | null>(1);
  const [tagInput, setTagInput] = useState("");

  const selectedMemo = memos.find(m => m.id === selectedMemoId);

  const saveToBackend = async () => {
    if (!selectedMemo) return;
    try {
      const response = await fetch("http://localhost:8000/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: selectedMemo.title, content: selectedMemo.content, tag: selectedMemo.tags }),
      });
      if (response.ok) alert("バックエンドへの保存に成功しました！");
    } catch (error) {
      console.error("保存失敗:", error);
      alert("バックエンドが起動していないようです。");
    }
  };

  const addMemo = () => {
    const newMemo: Memo = {
      id: Date.now(),
      title: "無題のメモ",
      content: "",
      tags: [],
      createdAt: new Date().toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
    };
    setMemos([newMemo, ...memos]);
    setSelectedMemoId(newMemo.id);
  };

  const updateMemo = (id: number, field: "title" | "content", value: string) => {
    setMemos(memos.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addTag = (id: number) => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    setMemos(memos.map(m => {
      if (m.id !== id || m.tags.includes(trimmed)) return m;
      return { ...m, tags: [...m.tags, trimmed] };
    }));
    setTagInput("");
  };

  const removeTag = (id: number, tag: string) => {
    setMemos(memos.map(m => m.id === id ? { ...m, tags: m.tags.filter(t => t !== tag) } : m));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(id);
    }
  };

  const deleteMemo = (id: number) => {
    setMemos(memos.filter((m) => m.id !== id));
    if (selectedMemoId === id) {
      setSelectedMemoId(memos.length > 1 ? memos[0].id : null);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">

      {/* 1. サイドバー */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <header className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight">Memo</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={addMemo} className="rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="メモを検索..." className="pl-9 bg-slate-100 border-none rounded-full h-9 text-sm focus-visible:ring-1 focus-visible:ring-blue-400" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {memos.map((memo) => (
              <button
                key={memo.id}
                onClick={() => setSelectedMemoId(memo.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-1 ${
                  selectedMemoId === memo.id ? "bg-blue-50 text-blue-700" : "hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-semibold text-sm truncate ${selectedMemoId === memo.id ? "text-blue-900": "text-slate-900"}`}>
                    {memo.title || "無題のメモ"}
                  </span>
                  <span className="text-xs text-slate-500 flex-shrink-0">{memo.createdAt}</span>
                </div>
                <p className={`text-xs line-clamp-2 ${selectedMemoId === memo.id ? "text-blue-700": "text-slate-600"}`}>
                  {memo.content.substring(0, 50) || "内容なし"}
                </p>
                {memo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {memo.tags.map(tag => (
                      <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${selectedMemoId === memo.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* 2. メインエリア */}
      <main className="flex-1 bg-white flex flex-col">
        {selectedMemo ? (
          <>
            <header className="p-4 border-b border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <Input
                  value={selectedMemo.title}
                  onChange={(e) => updateMemo(selectedMemo.id, "title", e.target.value)}
                  className="text-2xl font-extrabold tracking-tight border-none p-0 h-auto focus-visible:ring-0 shadow-none w-full max-w-lg"
                />
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600">
                    ID: {selectedMemo.id}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteMemo(selectedMemo.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* タグエリア */}
              <div className="flex items-center flex-wrap gap-2">
                <Tag className="h-4 w-4 text-slate-400 flex-shrink-0" />
                {selectedMemo.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 pl-2 pr-1 py-0.5">
                    #{tag}
                    <button
                      onClick={() => removeTag(selectedMemo.id, tag)}
                      className="ml-0.5 rounded-full hover:bg-blue-200 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => handleTagKeyDown(e, selectedMemo.id)}
                  onBlur={() => addTag(selectedMemo.id)}
                  placeholder="タグを追加..."
                  className="h-7 w-32 text-xs border-dashed border-slate-300 focus-visible:ring-1 focus-visible:ring-blue-400 rounded-full px-3"
                />
              </div>
            </header>

            <div className="flex-1 p-6 flex flex-col">
              <Textarea
                value={selectedMemo.content}
                onChange={(e) => updateMemo(selectedMemo.id, "content", e.target.value)}
                placeholder="ここをクリックしてメモを入力..."
                className="flex-1 text-base leading-relaxed border-none p-0 focus-visible:ring-0 shadow-none resize-none whitespace-pre-wrap font-mono"
              />
            </div>

            <footer className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <div>最終更新: {selectedMemo.createdAt} | 文字数: {selectedMemo.content.length}</div>
              <Button
                onClick={saveToBackend}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-9 text-sm font-bold shadow-md"
              >
                保存する
              </Button>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center bg-slate-50">
            <Zap className="h-16 w-16 text-blue-100" />
            <h2 className="text-xl font-bold text-slate-900">メモが選択されていません</h2>
            <Button onClick={addMemo} className="rounded-full bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              最初のメモを作成
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
