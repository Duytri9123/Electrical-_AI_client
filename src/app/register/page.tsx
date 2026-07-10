"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getApiMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Họ tên cần ít nhất 2 ký tự."),
  email: z.string().trim().email("Email không đúng định dạng."),
  phone: z.string().trim().optional(),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự.")
    .regex(/[A-Z]/, "Cần ít nhất một chữ hoa.")
    .regex(/[a-z]/, "Cần ít nhất một chữ thường.")
    .regex(/[0-9]/, "Cần ít nhất một chữ số."),
  password_confirmation: z.string(),
  accepted_terms: z.boolean().refine((val) => val === true, {
    message: "Bạn phải đồng ý với điều khoản sử dụng.",
  }),
}).refine((data) => data.password === data.password_confirmation, {
  path: ["password_confirmation"],
  message: "Mật khẩu nhập lại không khớp.",
});
type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── SVG Icons ─────────────────────────────────────────────────────────
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" fill="rgba(16,185,129,0.15)" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const IconGift = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const FloatingOrbs = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: "10%", right: "5%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)", animation: "orbA 9s ease-in-out infinite" }} />
    <div style={{ position: "absolute", bottom: "15%", left: "5%", width: "160px", height: "160px", borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)", animation: "orbB 7s ease-in-out infinite" }} />
    <div style={{ position: "absolute", top: "50%", left: "40%", width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)", animation: "orbC 11s ease-in-out infinite" }} />
  </div>
);

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%", padding: "10px 14px", fontSize: "13px",
  border: `1px solid ${hasError ? "#fca5a5" : "#d1d5db"}`,
  borderRadius: "8px", boxSizing: "border-box",
  background: "white", color: "#0f172a", fontFamily: "inherit",
  outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
});

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const storeError = useAuthStore((state) => state.error);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", phone: "", password: "", password_confirmation: "", accepted_terms: false },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await registerUser({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      router.push(`/verify-registration?email=${encodeURIComponent(values.email)}&challenge=${result.challenge_token}`);
    } catch (err) {
      setErrorMsg(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    "Đọc bản vẽ SLD bằng AI Gemini 2.5 Pro",
    "Tự động đối chiếu thư viện LS, Schneider",
    "Xuất bảng vật tư BOM dạng Excel",
    "Lưu lịch sử phân tích, quản lý dự án",
  ];

  return (
    <>
      <style>{`
        @keyframes orbA { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(-20px,-28px) scale(1.08); } 75% { transform: translate(12px,12px) scale(0.95); } }
        @keyframes orbB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(22px,-18px); } }
        @keyframes orbC { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-14px,20px) scale(1.1); } 66% { transform: translate(18px,-10px) scale(0.9); } }
        @keyframes regPanelLeft { from { opacity:0; transform:translateX(-36px); } to { opacity:1; transform:translateX(0); } }
        @keyframes regPanelRight { from { opacity:0; transform:translateX(36px); } to { opacity:1; transform:translateX(0); } }
        @keyframes perkIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes tokenGlow { 0%,100% { box-shadow:0 0 16px rgba(250,191,36,0.3); } 50% { box-shadow:0 0 30px rgba(250,191,36,0.55); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes btnShine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .reg-panel-left { animation: regPanelLeft 0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .reg-panel-right { animation: regPanelRight 0.65s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .perk-item { opacity:0; animation: perkIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards; }
        .perk-item:nth-child(1) { animation-delay:0.4s; }
        .perk-item:nth-child(2) { animation-delay:0.55s; }
        .perk-item:nth-child(3) { animation-delay:0.7s; }
        .perk-item:nth-child(4) { animation-delay:0.85s; }
        .token-card { animation: tokenGlow 2.5s ease-in-out infinite; }
        .auth-input-reg { transition: border-color 0.2s, box-shadow 0.2s; }
        .auth-input-reg:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); outline:none; }
        .btn-reg { transition: all 0.18s ease; }
        .btn-reg:not(:disabled):hover { opacity:0.9; transform:translateY(-1px); box-shadow:0 6px 24px rgba(37,99,235,0.45) !important; }
        .btn-reg:not(:disabled):active { transform:translateY(0); }
        .spinner { animation:spin 0.8s linear infinite; }
        .check-icon { color: #10b981; flex-shrink: 0; margin-top: 2px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", opacity: mounted ? 1 : 0, transition: "opacity 0.3s" }}>

        {/* ── LEFT PANEL ─────────────────────────────── */}
        <div className="reg-panel-left" style={{
          flex: "0 0 42%",
          background: "linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
          display: "flex", flexDirection: "column",
          padding: "48px 52px", position: "relative", overflow: "hidden",
        }}>
          <FloatingOrbs />

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "52px", position: "relative", zIndex: 1 }}>
            <img src="/Images/logo.png" alt="Electrical AI" style={{ height: "38px", objectFit: "contain" }} />
            <span style={{ color: "white", fontWeight: 800, fontSize: "18px", letterSpacing: "0.04em" }}>ELECTRICAL AI</span>
          </div>

          <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
            <h1 style={{ color: "white", fontSize: "30px", fontWeight: 800, lineHeight: 1.3, margin: "0 0 14px" }}>
              Tạo tài khoản<br />miễn phí ngay hôm nay
            </h1>
            <p style={{ color: "#93c5fd", fontSize: "14px", lineHeight: 1.7, margin: "0 0 32px" }}>
              Không cần thẻ tín dụng. Bắt đầu phân tích bản vẽ điện ngay sau khi đăng ký.
            </p>

            {/* Token reward card */}
            <div className="token-card" style={{
              background: "rgba(255,255,255,0.1)", borderRadius: "12px",
              padding: "18px 20px", border: "1px solid rgba(251,191,36,0.3)",
              marginBottom: "28px", backdropFilter: "blur(6px)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div style={{ color: "#fbbf24" }}><IconGift /></div>
                <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: "18px" }}>1,000,000 Tokens</span>
              </div>
              <div style={{ color: "#bfdbfe", fontSize: "13px", lineHeight: 1.6 }}>
                Miễn phí khi đăng ký. Đủ để phân tích hàng trăm bản vẽ SLD phức tạp.
              </div>
            </div>

            {/* Perk list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              {perks.map((item, i) => (
                <div key={i} className="perk-item" style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div className="check-icon"><IconCheckCircle /></div>
                  <span style={{ color: "#bfdbfe", fontSize: "13px", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "32px", position: "relative", zIndex: 1 }}>
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
        <div className="reg-panel-right" style={{
          flex: 1, background: "#f8fafc",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "32px 24px", overflowY: "auto",
        }}>
          <div style={{ width: "100%", maxWidth: "460px" }}>

            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "36px", boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Đăng ký tài khoản</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 22px" }}>
                Đã có tài khoản?{" "}
                <Link href="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Đăng nhập</Link>
              </p>

              {(errorMsg || storeError) && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", fontSize: "13px", color: "#be123c", marginBottom: "16px" }}>
                  <IconAlert /><span>{errorMsg || storeError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* Name + Phone */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }} htmlFor="reg-name">Họ và tên *</label>
                    <input id="reg-name" type="text" placeholder="Nguyễn Văn A" {...register("full_name")}
                      className="auth-input-reg" style={inputStyle(!!errors.full_name)} />
                    {errors.full_name && <span style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px", display: "block" }}>{errors.full_name.message}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }} htmlFor="reg-phone">Số điện thoại</label>
                    <input id="reg-phone" type="text" placeholder="09xxxxxxxx" {...register("phone")}
                      className="auth-input-reg" style={inputStyle()} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }} htmlFor="reg-email">Email *</label>
                  <input id="reg-email" type="email" placeholder="name@company.com" {...register("email")}
                    className="auth-input-reg" style={inputStyle(!!errors.email)} />
                  {errors.email && <span style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px", display: "block" }}>{errors.email.message}</span>}
                </div>

                {/* Password + Confirm */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }} htmlFor="reg-password">Mật khẩu *</label>
                    <div style={{ position: "relative" }}>
                      <input id="reg-password" type={showPwd ? "text" : "password"} placeholder="••••••••" {...register("password")}
                        className="auth-input-reg" style={{ ...inputStyle(!!errors.password), paddingRight: "38px" }} />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex", alignItems: "center" }}>
                        {showPwd ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                    {errors.password && <span style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px", display: "block" }}>{errors.password.message}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }} htmlFor="reg-pwd-confirm">Nhập lại *</label>
                    <div style={{ position: "relative" }}>
                      <input id="reg-pwd-confirm" type={showPwdConfirm ? "text" : "password"} placeholder="••••••••" {...register("password_confirmation")}
                        className="auth-input-reg" style={{ ...inputStyle(!!errors.password_confirmation), paddingRight: "38px" }} />
                      <button type="button" onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                        style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex", alignItems: "center" }}>
                        {showPwdConfirm ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                    {errors.password_confirmation && <span style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px", display: "block" }}>{errors.password_confirmation.message}</span>}
                  </div>
                </div>

                {/* Password hint */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "11px", color: "#64748b" }}>
                  <IconShield />
                  <span>Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.</span>
                </div>

                {/* Terms */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                  <input type="checkbox" {...register("accepted_terms")}
                    style={{ marginTop: "3px", width: "15px", height: "15px", accentColor: "#2563eb", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
                    Tôi đồng ý với{" "}
                    <Link href="/terms" style={{ color: "#2563eb" }}>Điều khoản dịch vụ</Link>
                    {" "}và{" "}
                    <Link href="/privacy" style={{ color: "#2563eb" }}>Chính sách bảo mật</Link>.
                  </span>
                </label>
                {errors.accepted_terms && <span style={{ fontSize: "11px", color: "#dc2626", display: "block", marginTop: "-8px" }}>{errors.accepted_terms.message}</span>}

                {/* Submit */}
                <button type="submit" disabled={loading} className="btn-reg"
                  style={{
                    width: "100%", padding: "12px",
                    background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                    color: "white", border: "none", borderRadius: "8px",
                    fontSize: "15px", fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxShadow: "0 2px 10px rgba(37,99,235,0.35)", marginTop: "4px",
                  }}>
                  {loading ? (
                    <>
                      <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    <><span>Đăng ký ngay</span><IconArrowRight /></>
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
