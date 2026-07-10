"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const [data, setData] = useState<{ title: string; content: string } | null>(null);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/proxy/pages/contact")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{data?.title || "Contact"}</h1>
        <p className="text-slate-500 text-sm mb-8">Liên hệ với chúng tôi để được hỗ trợ</p>

        {data?.content && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 text-sm text-slate-600 prose prose-slate max-w-none">
            {data.content.split("\n").map((line, i) => {
              if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-slate-700">{line.replace(/\*\*/g, "")}</p>;
              if (line.trim() === "") return <br key={i} />;
              return <p key={i} className="mb-1">{line}</p>;
            })}
          </div>
        )}

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-lg font-bold text-green-700">Tin nhắn đã gửi!</h2>
            <p className="text-sm text-green-600 mt-1">Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Họ tên</label>
                <input className="input-field" placeholder="Nguyễn Văn A" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                <input className="input-field" type="email" placeholder="email@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Chủ đề</label>
              <input className="input-field" placeholder="Chủ đề" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nội dung</label>
              <textarea className="input-field min-h-[120px]" placeholder="Nội dung tin nhắn..." required />
            </div>
            <button type="submit" className="btn-primary">Gửi tin nhắn</button>
          </form>
        )}
      </main>
    </div>
  );
}
