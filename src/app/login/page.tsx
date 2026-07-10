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

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  useEffect(() => { clearError(); }, [clearError]);

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

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── LEFT PANEL ─────────────────────────────────── */}
      <div style={{
        flex: "0 0 48%",
        background: "linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "48px 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decoration */}
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "340px", height: "340px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: "40px", left: "-80px",
          width: "280px", height: "280px", borderRadius: "50%",
          background: "rgba(255,255,255,0.03)", pointerEvents: "none"
        }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "60px" }}>
          <img src="/Images/logo.png" alt="Electrical AI" style={{ height: "40px", objectFit: "contain" }} />
          <span style={{ color: "white", fontWeight: 800, fontSize: "20px", letterSpacing: "0.02em" }}>
            ELECTRICAL AI
          </span>
        </div>

        {/* Headline */}
        <div style={{ flex: 1 }}>
          <h1 style={{ color: "white", fontSize: "36px", fontWeight: 800, lineHeight: 1.25, margin: "0 0 16px" }}>
            Phân tích bản vẽ<br />điện tự động<br />
            <span style={{ color: "#60a5fa" }}>bằng AI</span>
          </h1>
          <p style={{ color: "#93c5fd", fontSize: "15px", lineHeight: 1.7, margin: "0 0 40px" }}>
            Tải lên sơ đồ nguyên lý đơn tuyến (SLD), AI sẽ tự động bóc tách thiết bị, đối chiếu thư viện và xuất bảng vật tư BOM trong vài giây.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
            {[
              { icon: "⚡", title: "Đọc ảnh & PDF tự động", desc: "Hỗ trợ JPG, PNG, PDF — AI nhận diện thiết bị trực tiếp từ bản vẽ kỹ thuật" },
              { icon: "📋", title: "Đối chiếu thư viện thiết bị", desc: "Khớp tự động với LS, Schneider, Chint, cảnh báo sai lệch ngay lập tức" },
              { icon: "📊", title: "Xuất BOM một click", desc: "Excel đầy đủ mã hiệu, số lượng, đơn giá, sẵn sàng gửi nhà thầu" },
            ].map((f) => (
              <div key={f.title} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.12)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0
                }}>{f.icon}</div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "14px", marginBottom: "2px" }}>{f.title}</div>
                  <div style={{ color: "#93c5fd", fontSize: "12px", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {[
              { value: "11,046+", label: "Bản vẽ đã đọc" },
              { value: "167K+", label: "Thiết bị bóc tách" },
              { value: "98%", label: "Độ chính xác" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.08)", borderRadius: "10px",
                padding: "12px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <div style={{ color: "white", fontWeight: 800, fontSize: "18px" }}>{s.value}</div>
                <div style={{ color: "#93c5fd", fontSize: "11px", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
          {["Điều khoản", "Bảo mật", "Liên hệ"].map((l) => (
            <Link key={l} href={`/${l === "Điều khoản" ? "terms" : l === "Bảo mật" ? "privacy" : "contact"}`}
              style={{ color: "#60a5fa", fontSize: "12px", textDecoration: "none" }}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}>
              {l}
            </Link>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────── */}
      <div style={{
        flex: 1,
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Promo badge */}
          <div style={{
            textAlign: "center", marginBottom: "28px",
            padding: "8px 16px", background: "#eff6ff",
            border: "1px solid #bfdbfe", borderRadius: "20px",
            display: "inline-block", width: "100%",
            boxSizing: "border-box" as const
          }}>
            <span style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: 600 }}>
              🎉 Tài khoản mới nhận ngay <strong style={{ color: "#059669" }}>1,000,000 tokens</strong> miễn phí
            </span>
          </div>

          {/* Card */}
          <div style={{
            background: "white", borderRadius: "16px",
            border: "1px solid #e2e8f0", padding: "36px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
              Đăng nhập
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px" }}>
              Chưa có tài khoản?{" "}
              <Link href="/register" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
                Đăng ký miễn phí
              </Link>
            </p>

            {isRegistered && (
              <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", fontSize: "13px", color: "#15803d", marginBottom: "16px" }}>
                ✅ Đăng ký thành công! Vui lòng đăng nhập.
              </div>
            )}

            {(errorMessage || storeError) && (
              <div style={{ padding: "10px 14px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", fontSize: "13px", color: "#be123c", marginBottom: "16px" }}>
                ❌ {errorMessage || storeError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }} htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  style={{
                    width: "100%", padding: "11px 14px", fontSize: "14px",
                    border: `1px solid ${errors.email ? "#fca5a5" : "#d1d5db"}`,
                    borderRadius: "8px", outline: "none", boxSizing: "border-box" as const,
                    background: "white", color: "#0f172a",
                  }}
                />
                {errors.email && <span style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px", display: "block" }}>{errors.email.message}</span>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }} htmlFor="login-password">
                  Mật khẩu
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    style={{
                      width: "100%", padding: "11px 44px 11px 14px", fontSize: "14px",
                      border: `1px solid ${errors.password ? "#fca5a5" : "#d1d5db"}`,
                      borderRadius: "8px", outline: "none", boxSizing: "border-box" as const,
                      background: "white", color: "#0f172a",
                    }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#94a3b8", padding: 0 }}>
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <span style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px", display: "block" }}>{errors.password.message}</span>}
                <div style={{ textAlign: "right", marginTop: "6px" }}>
                  <Link href="/forgot-password" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none" }}>Quên mật khẩu?</Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px",
                  background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #4f46e5)",
                  color: "white", border: "none", borderRadius: "8px",
                  fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.opacity = "0.9"; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {loading ? "⏳ Đang đăng nhập..." : "Đăng nhập →"}
              </button>
            </form>
          </div>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "20px" }}>
            © 2025 Electrical AI. Powered by Google Gemini.
          </p>
        </div>
      </div>
    </div>
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
