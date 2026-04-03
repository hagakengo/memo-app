"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Zap } from "lucide-react"; // アイコンを追加
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type Memo = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([
    // テスト用のデータ（オシャレに見せるため）
    { id: 1, title: "アイデア出し: 新機能", content: "AIを使った自動要約機能をフロントエンドに追加したい。shadcnのDialogを使うと良さそう。", createdAt: "10:30" },
    { id: 2, title: "来週のTODO", content: "・バックエンド担当と疎通確認\n・ログイン画面のUI作成\n・リファクタリング", createdAt: "昨日" },
  ]);
  const [selectedMemoId, setSelectedMemoId] = useState<number | null>(1); // 最初から1つ選択状態にする
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const selectedMemo = memos.find(m => m.id === selectedMemoId);

  const addMemo = () => {
    const newMemo: Memo = {
      id: Date.now(),
      title: "無題のメモ", // 最初はデフォルトタイトル
      content: "",
      createdAt: new Date().toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
    };
    setMemos([newMemo, ...memos]);
    setSelectedMemoId(newMemo.id); // 新しいメモを選択状態に
  };

  const updateMemo = (id: number, field: "title" | "content", value: string) => {
    setMemos(memos.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const deleteMemo = (id: number) => {
    setMemos(memos.filter((m) => m.id !== id));
    if (selectedMemoId === id) {
      setSelectedMemoId(memos.length > 1 ? memos[0].id : null);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      
      {/* 1. サイドバー（メモ一覧） */}
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
                  selectedMemoId === memo.id 
                    ? "bg-blue-50 text-blue-700" 
                    : "hover:bg-slate-100"
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
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* 2. メインエリア（編集画面） */}
      <main className="flex-1 bg-white flex flex-col">
        {selectedMemo ? (
          <>
            <header className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <Input 
                value={selectedMemo.title} 
                onChange={(e) => updateMemo(selectedMemo.id, "title", e.target.value)}
                placeholder="タイトルを入力..."
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
            </header>
            
            <div className="flex-1 p-6 flex flex-col">
              <Textarea 
                value={selectedMemo.content} 
                onChange={(e) => updateMemo(selectedMemo.id, "content", e.target.value)}
                placeholder="ここをクリックしてメモを入力..."
                className="flex-1 text-base leading-relaxed border-none p-0 focus-visible:ring-0 shadow-none resize-none whitespace-pre-wrap font-mono"
              />
            </div>
            
            <footer className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
              最終更新: {selectedMemo.createdAt} | 文字数: {selectedMemo.content.length}
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center bg-slate-50">
            <Zap className="h-16 w-16 text-blue-100" />
            <h2 className="text-xl font-bold text-slate-900">メモが選択されていません</h2>
            <p className="text-sm text-slate-500 max-w-xs">左側のリストからメモを選択するか、新しいメモを作成して開発を始めましょう。</p>
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