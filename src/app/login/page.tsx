"use client";

import React, { useState, Suspense } from "react";
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

/* ─── SVG Icons ─────────────────────────────────────── */
const IcBolt = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcLayers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const IcSheet = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IcEye = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcEyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcArrow = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcWarn = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcOk = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IcGift = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const IcSpin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"_spin 0.8s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

/* ─── Global CSS (injected once) ──────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',system-ui,sans-serif;}

/* Orbs */
@keyframes orb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(24px,-32px) scale(1.09)}66%{transform:translate(-16px,18px) scale(0.93)}}
@keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-28px,-22px) scale(1.12)}}
@keyframes orb3{0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-25px)}75%{transform:translate(-12px,14px)}}

/* Panel entry */
@keyframes slideL{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideR{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}

/* Stagger children */
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

/* Badge shimmer */
@keyframes shimmer{0%{background-position:-300% center}100%{background-position:300% center}}

/* Button pulse */
@keyframes bpulse{0%,100%{box-shadow:0 3px 12px rgba(37,99,235,.35)}50%{box-shadow:0 3px 24px rgba(37,99,235,.6)}}

/* Spinner */
@keyframes _spin{to{transform:rotate(360deg)}}

/* Stat counter */
@keyframes statIn{from{opacity:0;transform:scale(.8) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}

.lp-left{animation:slideL .65s cubic-bezier(.16,1,.3,1) both}
.lp-right{animation:slideR .65s cubic-bezier(.16,1,.3,1) .12s both}
.f1{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) .3s both}
.f2{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) .45s both}
.f3{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) .6s both}
.s1{animation:statIn .5s cubic-bezier(.34,1.56,.64,1) .7s both}
.s2{animation:statIn .5s cubic-bezier(.34,1.56,.64,1) .85s both}
.s3{animation:statIn .5s cubic-bezier(.34,1.56,.64,1) 1s both}
.form-in{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) .25s both}

.shimmer-badge{
  background:linear-gradient(90deg,#dbeafe 0%,#eff6ff 40%,#bfdbfe 60%,#eff6ff 80%,#dbeafe 100%);
  background-size:300% auto;
  animation:shimmer 3s linear infinite;
}
.btn-submit{animation:bpulse 2.5s ease-in-out infinite;transition:all .18s ease;}
.btn-submit:not(:disabled):hover{animation:none;opacity:.9;transform:translateY(-2px);box-shadow:0 6px 24px rgba(37,99,235,.5)!important;}
.btn-submit:not(:disabled):active{transform:translateY(0);}
.btn-submit:disabled{animation:none;cursor:not-allowed;}

.auth-field{
  width:100%;padding:13px 16px;font-size:14px;font-family:inherit;
  border:1.5px solid #cbd5e1;border-radius:12px;
  background:#f8fafc;color:#0f172a;outline:none;
  transition:all .2s ease;
}
.auth-field:focus{border-color:#2563eb;background:#ffffff;box-shadow:0 0 0 4px rgba(37,99,235,.14);}
.auth-field.err{border-color:#f87171;background:#fff5f5;}
.auth-field:focus.err{border-color:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.18);}
.auth-field::placeholder{color:#94a3b8;}

.pw-wrap{position:relative;}
.pw-wrap .auth-field{padding-right:44px;}
.pw-toggle{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94a3b8;display:flex;align-items:center;padding:2px;transition:color .15s;}
.pw-toggle:hover{color:#475569;}

.feature-icon{width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;color:#93c5fd;flex-shrink:0;transition:transform .2s,background .2s;}
.feature-row:hover .feature-icon{transform:scale(1.1) rotate(-5deg);background:rgba(255,255,255,.2);}

/* Glow and pulse animations */
@keyframes textGlow {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(96,165,250,0.6)); }
  50% { filter: drop-shadow(0 0 22px rgba(251,191,36,0.85)); }
}
@keyframes logoPulse {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(59,130,246,0.7)); transform: scale(1); }
  50% { filter: drop-shadow(0 0 24px rgba(251,191,36,0.9)); transform: scale(1.03); }
}

.electric-title-ai {
  background: linear-gradient(90deg, #38bdf8 0%, #60a5fa 40%, #fbbf24 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textGlow 3s ease-in-out infinite, shimmer 4s linear infinite;
  display: inline-block;
}

.electric-logo-text {
  background: linear-gradient(90deg, #ffffff 0%, #93c5fd 50%, #fef08a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.feature-box-glass {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  padding: 12px 16px;
  border-radius: 14px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature-box-glass:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(96, 165, 250, 0.6);
  box-shadow: 0 8px 28px rgba(37, 99, 235, 0.3);
  transform: translateX(6px);
}

.stat-box-enhanced {
  background: rgba(15, 23, 42, 0.45);
  border-radius: 14px;
  padding: 14px 10px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.25s ease;
}

.stat-box-enhanced:hover {
  border-color: rgba(251, 191, 36, 0.6);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
`;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore(s => s.login);
  const storeError = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string|null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const isRegistered = searchParams.get("registered") === "1";

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (v: LoginFormValues) => {
    setLoading(true); setErrMsg(null); clearError();
    try {
      await login(v.email, v.password);
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.code === "ACCOUNT_NOT_VERIFIED") {
        const d = err.response.data.data;
        router.push(`/verify-registration?email=${encodeURIComponent(v.email)}&challenge=${d.challenge_token}`);
        return;
      }
      setErrMsg(getApiMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ display:"flex", minHeight:"100vh" }}>

        {/* ── LEFT ─────────────────────────────────────── */}
        <div className="lp-left" style={{
          flex:"0 0 50%", position:"relative", overflow:"hidden",
          backgroundImage: "linear-gradient(145deg, rgba(15,23,42,0.88) 0%, rgba(30,58,138,0.85) 52%, rgba(29,78,216,0.82) 100%), url('/Images/electrical_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display:"flex", flexDirection:"column", padding:"52px 60px",
        }}>
          {/* Orbs */}
          <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
            <div style={{position:"absolute",top:"6%",left:"10%",width:"200px",height:"200px",borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,.2) 0%,transparent 70%)",animation:"orb1 8s ease-in-out infinite"}}/>
            <div style={{position:"absolute",top:"52%",right:"5%",width:"260px",height:"260px",borderRadius:"50%",background:"radial-gradient(circle,rgba(79,70,229,.16) 0%,transparent 70%)",animation:"orb2 11s ease-in-out infinite"}}/>
            <div style={{position:"absolute",bottom:"8%",left:"32%",width:"150px",height:"150px",borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,.13) 0%,transparent 70%)",animation:"orb3 7s ease-in-out infinite"}}/>
          </div>

          {/* Brand */}
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"52px",position:"relative",zIndex:1}}>
            <img
              src="/Images/logo.png"
              alt="Electrical AI"
              style={{height:"52px",objectFit:"contain",animation:"logoPulse 4s ease-in-out infinite"}}
            />
            <span className="electric-logo-text" style={{fontSize:"24px",lineHeight:1.1}}>
              ELECTRICAL AI
            </span>
          </div>

          <div style={{flex:1,position:"relative",zIndex:1}}>
            <div className="f1">
              <h1 style={{color:"white",fontSize:"36px",fontWeight:900,lineHeight:1.25,marginBottom:"16px",letterSpacing:"-0.02em"}}>
                Phân tích bản vẽ<br/>điện tự động<br/>
                <span className="electric-title-ai">bằng AI Engine ⚡</span>
              </h1>
              <p style={{color:"#cbd5e1",fontSize:"14.5px",lineHeight:1.75,marginBottom:"32px",fontWeight:400}}>
                Tải lên sơ đồ SLD, AI tự động bóc tách thiết bị, đối chiếu thư viện và xuất BOM chỉ trong vài giây.
              </p>
            </div>

            {/* Features */}
            <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"32px"}}>
              {[
                { cls:"f1", icon:<IcBolt/>, t:"Đọc ảnh & PDF tự động", d:"Hỗ trợ JPG, PNG, PDF — nhận diện thiết bị trực tiếp từ bản vẽ kỹ thuật" },
                { cls:"f2", icon:<IcLayers/>, t:"Đối chiếu thư viện thiết bị", d:"Khớp tự động với LS, Schneider, Chint, cảnh báo sai lệch ngay lập tức" },
                { cls:"f3", icon:<IcSheet/>, t:"Xuất BOM một click", d:"Excel đầy đủ mã hiệu, số lượng, đơn giá, sẵn sàng gửi nhà thầu" },
              ].map((f,i) => (
                <div key={i} className={`feature-box-glass ${f.cls}`} style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
                  <div className="feature-icon">{f.icon}</div>
                  <div>
                    <div style={{color:"white",fontWeight:800,fontSize:"14px",marginBottom:"2px",letterSpacing:"-0.01em"}}>{f.t}</div>
                    <div style={{color:"#cbd5e1",fontSize:"12.5px",lineHeight:1.6}}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px"}}>
              {[
                {cls:"s1",v:"11,046+",l:"Bản vẽ đã đọc", color:"#38bdf8"},
                {cls:"s2",v:"167K+",l:"Thiết bị bóc tách", color:"#fbbf24"},
                {cls:"s3",v:"98%",l:"Độ chính xác", color:"#34d399"},
              ].map((s,i) => (
                <div key={i} className={`stat-box-enhanced ${s.cls}`}>
                  <div style={{color:s.color,fontWeight:900,fontSize:"21px",letterSpacing:"-0.03em",textShadow:"0 2px 10px rgba(0,0,0,0.3)"}}>{s.v}</div>
                  <div style={{color:"#f1f5f9",fontSize:"11.5px",marginTop:"4px",fontWeight:600,letterSpacing:"0.01em"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",gap:"24px",marginTop:"36px",position:"relative",zIndex:1}}>
            <Link href="/terms" style={{color:"#93c5fd",fontSize:"12.5px",fontWeight:600,textDecoration:"none",transition:"color .15s"}} onMouseOver={(e)=>e.currentTarget.style.color="#ffffff"} onMouseOut={(e)=>e.currentTarget.style.color="#93c5fd"}>Điều khoản</Link>
            <Link href="/privacy" style={{color:"#93c5fd",fontSize:"12.5px",fontWeight:600,textDecoration:"none",transition:"color .15s"}} onMouseOver={(e)=>e.currentTarget.style.color="#ffffff"} onMouseOut={(e)=>e.currentTarget.style.color="#93c5fd"}>Bảo mật</Link>
            <Link href="/contact" style={{color:"#93c5fd",fontSize:"12.5px",fontWeight:600,textDecoration:"none",transition:"color .15s"}} onMouseOver={(e)=>e.currentTarget.style.color="#ffffff"} onMouseOut={(e)=>e.currentTarget.style.color="#93c5fd"}>Liên hệ</Link>
          </div>
        </div>

        {/* ── RIGHT ────────────────────────────────────── */}
        <div className="lp-right" style={{
          flex:1, background:"#f1f5f9",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"40px 32px",
        }}>
          <div style={{width:"100%",maxWidth:"400px"}}>

            {/* Shimmer promo badge */}
            <div className="shimmer-badge" style={{
              borderRadius:"24px", border:"1.5px solid #bfdbfe",
              background:"linear-gradient(90deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)",
              padding:"10px 20px", marginBottom:"24px",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
              boxShadow:"0 4px 16px rgba(37,99,235,0.12)",
            }}>
              <div style={{color:"#2563eb",display:"flex",alignItems:"center"}}><IcGift/></div>
              <span style={{fontSize:"12.5px",color:"#1e40af",fontWeight:600}}>
                Tài khoản mới nhận <strong style={{color:"#047857",fontWeight:800}}>1,000,000 tokens</strong> miễn phí
              </span>
            </div>

            {/* Form card */}
            <div className="form-in" style={{background:"white",borderRadius:"20px",border:"1px solid #e2e8f0",padding:"38px 36px 34px",boxShadow:"0 12px 40px rgba(15,23,42,0.08)"}}>
              <h2 style={{fontSize:"25px",fontWeight:900,color:"#0f172a",marginBottom:"4px",letterSpacing:"-0.02em"}}>
                Đăng nhập <span style={{color:"#2563eb"}}>.</span>
              </h2>
              <p style={{fontSize:"13.5px",color:"#64748b",marginBottom:"26px",fontWeight:500}}>
                Chưa có tài khoản? <Link href="/register" className="auth-link">Đăng ký miễn phí</Link>
              </p>

              {isRegistered && (
                <div className="alert-box alert-ok"><IcOk/><span>Đăng ký thành công! Vui lòng đăng nhập.</span></div>
              )}
              {(errMsg || storeError) && (
                <div className="alert-box alert-err"><IcWarn/><span>{errMsg || storeError}</span></div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} style={{display:"flex",flexDirection:"column",gap:"20px"}}>
                <div>
                  <label className="field-label" htmlFor="l-email">Địa chỉ email</label>
                  <input id="l-email" type="email" placeholder="your@email.com"
                    {...register("email")}
                    className={`auth-field${errors.email?" err":""}`}
                  />
                  {errors.email && <span className="field-err">{errors.email.message}</span>}
                </div>

                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                    <label className="field-label" style={{margin:0}} htmlFor="l-pwd">Mật khẩu</label>
                    <Link href="/forgot-password" style={{fontSize:"12.5px",color:"#2563eb",fontWeight:600,textDecoration:"none"}}>Quên mật khẩu?</Link>
                  </div>
                  <div className="pw-wrap">
                    <input id="l-pwd" type={showPwd?"text":"password"} placeholder="Nhập mật khẩu..."
                      {...register("password")}
                      className={`auth-field${errors.password?" err":""}`}
                    />
                    <button type="button" className="pw-toggle" onClick={()=>setShowPwd(!showPwd)}>
                      {showPwd ? <IcEyeOff/> : <IcEye/>}
                    </button>
                  </div>
                  {errors.password && <span className="field-err">{errors.password.message}</span>}
                </div>

                <button type="submit" disabled={loading} className="btn-submit"
                  style={{width:"100%",padding:"14px",background:loading?"#93c5fd":"linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)",color:"white",border:"none",borderRadius:"12px",fontSize:"15px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",cursor:"pointer"}}>
                  {loading ? <><IcSpin/><span>Đang đăng nhập...</span></> : <><span>Đăng nhập</span><IcArrow/></>}
                </button>
              </form>
            </div>

            <p style={{textAlign:"center",fontSize:"12px",color:"#94a3b8",marginTop:"22px",fontWeight:500}}>
              © 2025 Electrical AI · Powered by Google Gemini
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
      <div style={{minHeight:"100vh",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>
        Đang tải...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
