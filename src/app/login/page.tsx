"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { getApiMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

const loginSchema = z.object({
  email: z.string().trim().email("Email không đúng định dạng."),
  password: z.string().min(6, "Mật khẩu cần ít nhất 6 ký tự."),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconBolt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconLayers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
const IconTable = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
  </svg>
);
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconSuccess = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconGift = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

// ─── Floating Orbs (decorative) ───────────────────────────────────────────────
const FloatingOrbs = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{
      position: "absolute", top: "8%", left: "12%",
      width: "180px", height: "180px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)",
      animation: "orbFloat1 8s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute", top: "55%", right: "8%",
      width: "240px", height: "240px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)",
      animation: "orbFloat2 10s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute", bottom: "10%", left: "30%",
      width: "140px", height: "140px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
      animation: "orbFloat3 7s ease-in-out infinite",
    }} />
  </div>
);

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    clearError();
  }, [clearError]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(values.email, values.password);
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.code === "ACCOUNT_NOT_VERIFIED") {
        const data = err.response.data.data;
        router.push(`/verify-registration?email=${encodeURIComponent(values.email)}&challenge=${data.challenge_token}`);
        return;
      }
      setErrorMessage(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isRegistered = searchParams.get("registered") === "1";

  const features = [
    { icon: <IconBolt />, title: "Đọc ảnh & PDF tự động", desc: "Hỗ trợ JPG, PNG, PDF — AI nhận diện thiết bị trực tiếp từ bản vẽ kỹ thuật" },
    { icon: <IconLayers />, title: "Đối chiếu thư viện thiết bị", desc: "Khớp tự động với LS, Schneider, Chint, cảnh báo sai lệch ngay lập tức" },
    { icon: <IconTable />, title: "Xuất BOM một click", desc: "Excel đầy đủ mã hiệu, số lượng, đơn giá, sẵn sàng gửi nhà thầu" },
  ];

  return (
    <>
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.08); }
          66% { transform: translate(-15px, 15px) scale(0.94); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, -20px) scale(1.1); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0); }
          40% { transform: translate(18px, -22px); }
          70% { transform: translate(-10px, 10px); }
        }
        @keyframes panelSlideIn {
          from { opacity: 0; transform: translateX(-32px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes formSlideIn {
          from { opacity: 0; transform: translateX(32px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes featureStagger {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes statPop {
          0% { opacity: 0; transform: scale(0.85); }
          70% { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmerBadge {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes inputFocus {
          from { box-shadow: 0 0 0 0px rgba(59,130,246,0); }
          to { box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 2px 8px rgba(37,99,235,0.35); }
          50% { box-shadow: 0 4px 20px rgba(37,99,235,0.55); }
        }
        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }
        .login-panel-left {
          animation: panelSlideIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .login-panel-right {
          animation: formSlideIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .feature-item { opacity: 0; animation: featureStagger 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .feature-item:nth-child(1) { animation-delay: 0.35s; }
        .feature-item:nth-child(2) { animation-delay: 0.5s; }
        .feature-item:nth-child(3) { animation-delay: 0.65s; }
        .stat-item { opacity: 0; animation: statPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .stat-item:nth-child(1) { animation-delay: 0.7s; }
        .stat-item:nth-child(2) { animation-delay: 0.85s; }
        .stat-item:nth-child(3) { animation-delay: 1s; }
        .promo-badge {
          background: linear-gradient(90deg, #eff6ff 0%, #dbeafe 40%, #eff6ff 80%);
          background-size: 200% auto;
          animation: shimmerBadge 3s linear infinite;
        }
        .auth-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .auth-input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); outline: none; }
        .btn-login:not(:disabled):hover { opacity: 0.92; transform: translateY(-1px); }
        .btn-login:not(:disabled):active { transform: translateY(0); }
        .btn-login { transition: all 0.18s ease; animation: btnPulse 2.5s ease-in-out infinite; }
        .btn-login:hover { animation: none; }
        .feature-icon-box { transition: transform 0.2s, background 0.2s; }
        .feature-item:hover .feature-icon-box { transform: scale(1.1) rotate(-4deg); background: rgba(255,255,255,0.2) !important; }
        .spin { animation: spinLoader 0.8s linear infinite; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", opacity: mounted ? 1 : 0, transition: "opacity 0.3s" }}>

        {/* ── LEFT PANEL ─────────────────────────────── */}
        <div className="login-panel-left" style={{
          flex: "0 0 48%",
          background: "linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
          display: "flex", flexDirection: "column",
          padding: "48px 56px", position: "relative", overflow: "hidden",
        }}>
          <FloatingOrbs />

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "60px", position: "relative", zIndex: 1 }}>
            <img src="/Images/logo.png" alt="Electrical AI" style={{ height: "40px", objectFit: "contain" }} />
            <span style={{ color: "white", fontWeight: 800, fontSize: "20px", letterSpacing: "0.04em" }}>ELECTRICAL AI</span>
          </div>

          {/* Headline */}
          <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
            <h1 style={{ color: "white", fontSize: "36px", fontWeight: 800, lineHeight: 1.25, margin: "0 0 16px" }}>
              Phân tích bản vẽ<br />điện tự động<br />
              <span style={{ color: "#60a5fa" }}>bằng AI</span>
            </h1>
            <p style={{ color: "#93c5fd", fontSize: "15px", lineHeight: 1.7, margin: "0 0 40px" }}>
              Tải lên sơ đồ nguyên lý đơn tuyến (SLD), AI tự động bóc tách thiết bị, đối chiếu thư viện và xuất BOM trong vài giây.
            </p>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
              {features.map((f, i) => (
                <div key={i} className="feature-item" style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div className="feature-icon-box" style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.12)", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#93c5fd", flexShrink: 0,
                  }}>{f.icon}</div>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: "14px", marginBottom: "3px" }}>{f.title}</div>
                    <div style={{ color: "#93c5fd", fontSize: "12px", lineHeight: 1.65 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
              {[
                { value: "11,046+", label: "Bản vẽ đã đọc" },
                { value: "167K+", label: "Thiết bị bóc tách" },
                { value: "98%", label: "Độ chính xác" },
              ].map((s, i) => (
                <div key={i} className="stat-item" style={{
                  background: "rgba(255,255,255,0.08)", borderRadius: "10px",
                  padding: "14px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(6px)",
                }}>
                  <div style={{ color: "white", fontWeight: 800, fontSize: "18px" }}>{s.value}</div>
                  <div style={{ color: "#93c5fd", fontSize: "11px", marginTop: "3px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", gap: "20px", marginTop: "32px", position: "relative", zIndex: 1 }}>
            {[{ label: "Điều khoản", href: "/terms" }, { label: "Bảo mật", href: "/privacy" }, { label: "Liên hệ", href: "/contact" }].map((l) => (
              <Link key={l.label} href={l.href}
                style={{ color: "#60a5fa", fontSize: "12px", textDecoration: "none", transition: "color 0.15s" }}
                onMouseOver={(e) => { e.currentTarget.style.color = "#bfdbfe"; }}
                onMouseOut={(e) => { e.currentTarget.style.color = "#60a5fa"; }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────── */}
        <div className="login-panel-right" style={{
          flex: 1, background: "#f8fafc",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 24px",
        }}>
          <div style={{ width: "100%", maxWidth: "420px" }}>

            {/* Promo badge */}
            <div className="promo-badge" style={{
              textAlign: "center", marginBottom: "24px",
              padding: "10px 20px", borderRadius: "24px",
              border: "1px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              <IconGift />
              <span style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: 600 }}>
                Tài khoản mới nhận ngay <strong style={{ color: "#059669" }}>1,000,000 tokens</strong> miễn phí
              </span>
            </div>

            {/* Card */}
            <div style={{
              background: "white", borderRadius: "16px",
              border: "1px solid #e2e8f0", padding: "36px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
            }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Đăng nhập</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px" }}>
                Chưa có tài khoản?{" "}
                <Link href="/register" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Đăng ký miễn phí</Link>
              </p>

              {/* Alerts */}
              {isRegistered && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", fontSize: "13px", color: "#15803d", marginBottom: "16px" }}>
                  <IconSuccess /><span>Đăng ký thành công! Vui lòng đăng nhập.</span>
                </div>
              )}
              {(errorMessage || storeError) && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", fontSize: "13px", color: "#be123c", marginBottom: "16px" }}>
                  <IconAlert /><span>{errorMessage || storeError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }} htmlFor="login-email">
                    Email
                  </label>
                  <input
                    id="login-email" type="email" placeholder="your@email.com"
                    {...register("email")}
                    className="auth-input"
                    style={{
                      width: "100%", padding: "11px 14px", fontSize: "14px",
                      border: `1px solid ${errors.email ? "#fca5a5" : "#d1d5db"}`,
                      borderRadius: "8px", boxSizing: "border-box" as const,
                      background: "white", color: "#0f172a",
                    }}
                  />
                  {errors.email && <span style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px", display: "block" }}>{errors.email.message}</span>}
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }} htmlFor="login-password">
                    Mật khẩu
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="login-password" type={showPwd ? "text" : "password"} placeholder="••••••••"
                      {...register("password")}
                      className="auth-input"
                      style={{
                        width: "100%", padding: "11px 44px 11px 14px", fontSize: "14px",
                        border: `1px solid ${errors.password ? "#fca5a5" : "#d1d5db"}`,
                        borderRadius: "8px", boxSizing: "border-box" as const,
                        background: "white", color: "#0f172a",
                      }}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex", alignItems: "center" }}>
                      {showPwd ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {errors.password && <span style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px", display: "block" }}>{errors.password.message}</span>}
                  <div style={{ textAlign: "right", marginTop: "6px" }}>
                    <Link href="/forgot-password" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none" }}>Quên mật khẩu?</Link>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="btn-login"
                  style={{
                    width: "100%", padding: "12px",
                    background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #4f46e5)",
                    color: "white", border: "none", borderRadius: "8px",
                    fontSize: "15px", fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}>
                  {loading ? (
                    <>
                      <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      Đang đăng nhập...
                    </>
                  ) : (
                    <><span>Đăng nhập</span><IconArrowRight /></>
                  )}
                </button>
              </form>
            </div>

            <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "20px" }}>
              © 2025 Electrical AI. Powered by Google Gemini.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "14px" }}>
        Đang tải...
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
