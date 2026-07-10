"use client";

import React, { useState } from "react";
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

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%", padding: "11px 14px", fontSize: "13px",
  border: `1px solid ${hasError ? "#fca5a5" : "#d1d5db"}`,
  borderRadius: "8px", outline: "none", boxSizing: "border-box",
  background: "white", color: "#0f172a", fontFamily: "inherit",
});

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 700,
  color: "#374151", marginBottom: "5px",
};

const errStyle: React.CSSProperties = {
  fontSize: "12px", color: "#dc2626", marginTop: "4px", display: "block",
};

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const storeError = useAuthStore((state) => state.error);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);

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

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── LEFT PANEL ─────────────────────────────────── */}
      <div style={{
        flex: "0 0 42%",
        background: "linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
        display: "flex", flexDirection: "column",
        padding: "48px 52px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20px", left: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "52px" }}>
          <img src="/Images/logo.png" alt="Electrical AI" style={{ height: "38px", objectFit: "contain" }} />
          <span style={{ color: "white", fontWeight: 800, fontSize: "18px", letterSpacing: "0.02em" }}>ELECTRICAL AI</span>
        </div>

        {/* Headline */}
        <div style={{ flex: 1 }}>
          <h1 style={{ color: "white", fontSize: "30px", fontWeight: 800, lineHeight: 1.3, margin: "0 0 14px" }}>
            Tạo tài khoản<br />miễn phí ngay hôm nay
          </h1>
          <p style={{ color: "#93c5fd", fontSize: "14px", lineHeight: 1.7, margin: "0 0 36px" }}>
            Không cần thẻ tín dụng. Bắt đầu phân tích bản vẽ điện ngay sau khi đăng ký trong 1 phút.
          </p>

          {/* Token reward */}
          <div style={{
            background: "rgba(255,255,255,0.1)", borderRadius: "12px",
            padding: "18px 20px", border: "1px solid rgba(255,255,255,0.15)",
            marginBottom: "28px"
          }}>
            <div style={{ color: "#fbbf24", fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>🎁 1,000,000 Tokens</div>
            <div style={{ color: "#bfdbfe", fontSize: "13px", lineHeight: 1.6 }}>
              Miễn phí khi đăng ký. Đủ để phân tích hàng trăm bản vẽ SLD phức tạp.
            </div>
          </div>

          {/* Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              "Đọc bản vẽ SLD bằng AI Gemini 2.5 Pro",
              "Tự động đối chiếu thư viện thiết bị LS, Schneider",
              "Xuất bảng vật tư BOM dạng Excel",
              "Lưu lịch sử phân tích, quản lý dự án",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white", flexShrink: 0, fontWeight: 700 }}>✓</div>
                <span style={{ color: "#bfdbfe", fontSize: "13px" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
          {[{ label: "Điều khoản", href: "/terms" }, { label: "Bảo mật", href: "/privacy" }, { label: "Liên hệ", href: "/contact" }].map((l) => (
            <Link key={l.label} href={l.href}
              style={{ color: "#60a5fa", fontSize: "12px", textDecoration: "none" }}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────── */}
      <div style={{
        flex: 1, background: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px", overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "36px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Đăng ký tài khoản</h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 22px" }}>
              Đã có tài khoản?{" "}
              <Link href="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Đăng nhập</Link>
            </p>

            {(errorMsg || storeError) && (
              <div style={{ padding: "10px 14px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", fontSize: "13px", color: "#be123c", marginBottom: "16px" }}>
                ❌ {errorMsg || storeError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Grid row: Name + Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle} htmlFor="reg-name">Họ và tên *</label>
                  <input id="reg-name" type="text" placeholder="Nguyễn Văn A" {...register("full_name")} style={inputStyle(!!errors.full_name)} />
                  {errors.full_name && <span style={errStyle}>{errors.full_name.message}</span>}
                </div>
                <div>
                  <label style={labelStyle} htmlFor="reg-phone">Số điện thoại</label>
                  <input id="reg-phone" type="text" placeholder="09xxxxxxxx" {...register("phone")} style={inputStyle()} />
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="reg-email">Email *</label>
                <input id="reg-email" type="email" placeholder="name@company.com" {...register("email")} style={inputStyle(!!errors.email)} />
                {errors.email && <span style={errStyle}>{errors.email.message}</span>}
              </div>

              {/* Grid row: Password + Confirm */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle} htmlFor="reg-password">Mật khẩu *</label>
                  <div style={{ position: "relative" }}>
                    <input id="reg-password" type={showPwd ? "text" : "password"} placeholder="••••••••" {...register("password")} style={{ ...inputStyle(!!errors.password), paddingRight: "38px" }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#94a3b8", padding: 0 }}>
                      {showPwd ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.password && <span style={errStyle}>{errors.password.message}</span>}
                </div>
                <div>
                  <label style={labelStyle} htmlFor="reg-password-confirm">Nhập lại *</label>
                  <div style={{ position: "relative" }}>
                    <input id="reg-password-confirm" type={showPwdConfirm ? "text" : "password"} placeholder="••••••••" {...register("password_confirmation")} style={{ ...inputStyle(!!errors.password_confirmation), paddingRight: "38px" }} />
                    <button type="button" onClick={() => setShowPwdConfirm(!showPwdConfirm)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#94a3b8", padding: 0 }}>
                      {showPwdConfirm ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.password_confirmation && <span style={errStyle}>{errors.password_confirmation.message}</span>}
                </div>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#64748b" }}>
                Mật khẩu: ít nhất 8 ký tự, có chữ hoa, chữ thường và số.
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" {...register("accepted_terms")} style={{ marginTop: "3px", width: "15px", height: "15px", accentColor: "#2563eb", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
                  Tôi đồng ý với{" "}
                  <Link href="/terms" style={{ color: "#2563eb" }}>Điều khoản dịch vụ</Link>
                  {" "}và{" "}
                  <Link href="/privacy" style={{ color: "#2563eb" }}>Chính sách bảo mật</Link>.
                </span>
              </label>
              {errors.accepted_terms && <span style={errStyle}>{errors.accepted_terms.message}</span>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px",
                  background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #4f46e5)",
                  color: "white", border: "none", borderRadius: "8px",
                  fontSize: "15px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
                  marginTop: "4px",
                }}
              >
                {loading ? "⏳ Đang tạo tài khoản..." : "Đăng ký ngay →"}
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
