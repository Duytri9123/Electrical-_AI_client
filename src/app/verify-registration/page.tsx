"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

const VERIFY_WINDOW_SECONDS = 600;
const RESEND_COOLDOWN_SECONDS = 120;

function VerificationForm() {
  const router = useRouter();
  const params = useSearchParams();
  const challengeToken = params.get("challenge") ?? "";
  const emailHint = params.get("email") ?? "email của bạn";

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  const startTimer = useCallback((resetStart?: boolean) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (resetStart) startedAtRef.current = Date.now();

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const remaining = Math.max(0, VERIFY_WINDOW_SECONDS - elapsed);
      const cooldownRemaining = Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);

      setResendCooldown(cooldownRemaining);
      if (remaining <= 0) {
        setExpired(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);
  }, []);

  useEffect(() => {
    clearError();
    startTimer(true);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [clearError, startTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      setErrorMsg("Vui lòng nhập đủ 6 chữ số.");
      return;
    }
    setVerifyLoading(true);
    setErrorMsg(null);
    try {
      await verifyOtp(challengeToken, cleanCode);
      router.replace("/login?registered=1");
    } catch (err) {
      setErrorMsg(getApiMessage(err));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setErrorMsg(null);
    try {
      await resendOtp(challengeToken);
      setCode("");
      setExpired(false);
      startTimer(true);
    } catch (err) {
      setErrorMsg(getApiMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
  const remaining = Math.max(0, VERIFY_WINDOW_SECONDS - elapsed);
  const showMin = Math.floor(remaining / 60);
  const showSec = remaining % 60;

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-3xl">✉</div>
        <h2 className="text-lg font-bold text-slate-800">Xác minh tài khoản</h2>
        <p className="text-xs text-slate-500">
          Mã xác minh đã được gửi tới:{" "}
          <span className="text-blue-600 font-semibold">{emailHint}</span>
        </p>
      </div>

      {(errorMsg || storeError) && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
          {errorMsg || storeError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2 tracking-wider text-center">
            Nhập mã OTP (6 chữ số)
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full tracking-[1.2em] text-center font-mono text-xl bg-slate-50 border border-slate-300 rounded-xl py-3.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={verifyLoading || expired}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500">
          <div>
            {!expired ? (
              <span>Hiệu lực: <b className={remaining < 60 ? "text-orange-600" : "text-blue-600"}>{showMin}:{String(showSec).padStart(2, "0")}</b></span>
            ) : (
              <span className="text-red-600 font-semibold">Mã đã hết hạn</span>
            )}
          </div>
          <div>
            {resendCooldown > 0 ? (
              <span>Gửi lại sau {resendCooldown}s</span>
            ) : (
              <button type="button" onClick={handleResend} disabled={resendLoading}
                      className="text-blue-600 font-semibold hover:underline">
                {resendLoading ? "Đang gửi..." : "Gửi lại mã"}
              </button>
            )}
          </div>
        </div>

        <button type="submit"
                disabled={code.length !== 6 || verifyLoading || expired}
                className="w-full btn-primary text-sm">
          {verifyLoading ? "Đang xác minh..." : "Xác minh và Kích hoạt"}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
        Muốn sử dụng tài khoản khác?{" "}
        <button type="button"
                onClick={() => router.push("/login")}
                className="text-blue-600 font-semibold hover:underline">
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}

export default function VerifyRegistrationPage() {
  return (
    <main className="min-h-screen auth-bg flex items-center justify-center p-4 animate-fade-in">
      <Suspense fallback={<div className="text-slate-400 text-sm">Đang tải...</div>}>
        <VerificationForm />
      </Suspense>
    </main>
  );
}
