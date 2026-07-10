"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const [data, setData] = useState<{ title: string; content: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/proxy/pages/terms")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
        <button onClick={() => router.push("/dashboard")} className="flex items-center space-x-2.5 cursor-pointer">
          <svg className="w-5 h-5 text-slate-600 hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-sm text-white shadow-sm">A</div>
          <span className="text-base font-extrabold tracking-tight text-slate-800">AIDE</span>
        </button>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">{data?.title || "Terms of Service"}</h1>
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-600 prose prose-slate max-w-none">
          {data?.content ? (
            data.content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-slate-700 mt-6 mb-3">{line.replace("## ", "")}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold text-slate-700 mt-4 mb-2">{line.replace("### ", "")}</h3>;
              if (line.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-slate-300 pl-4 italic text-slate-500 my-2">{line.replace("> ", "")}</blockquote>;
              if (line.trim() === "") return <br key={i} />;
              return <p key={i} className="mb-2">{line}</p>;
            })
          ) : (
            <p className="text-slate-400">Đang tải...</p>
          )}
        </div>
      </main>
    </div>
  );
}
