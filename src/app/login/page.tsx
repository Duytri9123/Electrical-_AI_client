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

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

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
    <main className="min-h-screen auth-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left: Product Demo */}
        <div className="lg:col-span-7 flex flex-col space-y-5 animate-slide-up">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-sm">
              A
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              AIDE <span className="text-xs font-medium text-slate-500">AI Design Electric</span>
            </span>
          </div>

          {/* SLD Mock Table */}
          <div className="glow-card rounded-xl overflow-hidden p-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                SINGLE LINE DIAGRAM ANALYSIS
              </span>
              <span data-tooltip="Hệ thống đang sẵn sàng">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg bg-slate-50 border border-slate-200 p-1">
              <table className="table-mini w-full">
                <thead>
                  <tr>
                    <th>Circuit</th>
                    <th>Type</th>
                    <th>Pole</th>
                    <th>Current</th>
                    <th>ICU</th>
                    <th>Brand</th>
                    <th data-tooltip="Model sẽ được tự động khớp từ thư viện">Model</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono text-blue-600 font-medium">HK-1</td>
                    <td>MCCB</td>
                    <td>3</td>
                    <td className="font-semibold">75A</td>
                    <td>22kA</td>
                    <td>LS</td>
                    <td className="text-slate-400 text-[11px]">—</td>
                  </tr>
                  <tr className="bg-blue-50/60">
                    <td className="font-mono text-blue-600 font-medium">SEF-02-04</td>
                    <td>MCCB</td>
                    <td>3</td>
                    <td className="font-semibold text-orange-600">30A</td>
                    <td>10kA</td>
                    <td>LS</td>
                    <td className="text-slate-400 text-[11px]">—</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-blue-600 font-medium">MD2-HÚT</td>
                    <td>MCB</td>
                    <td>1</td>
                    <td className="font-semibold">10A</td>
                    <td>6kA</td>
                    <td>Schneider</td>
                    <td className="text-slate-400 text-[11px]">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-center">
              <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                Kết quả chi tiết theo mã thiết bị
              </h3>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glow-card text-center p-3">
              <div className="text-xl font-black text-blue-600" data-tooltip="Người dùng đã đăng ký">934</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Người dùng</div>
            </div>
            <div className="glow-card text-center p-3">
              <div className="text-xl font-black text-indigo-600" data-tooltip="Bản vẽ đã xử lý">11,046</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Bản vẽ đã đọc</div>
            </div>
            <div className="glow-card text-center p-3">
              <div className="text-xl font-black text-emerald-600" data-tooltip="Thiết bị đã bóc tách từ bản vẽ">167,462</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Thiết bị bóc tách</div>
            </div>
          </div>

          {/* Footer */}
          <footer className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
            <div className="flex space-x-4">
              <Link href="/terms" className="hover:text-slate-600">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
              <Link href="/contact" className="hover:text-slate-600">Contact</Link>
            </div>
            <div className="flex items-center space-x-2">
              <a href="https://zalo.me" target="_blank" rel="noreferrer"
                 className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[11px] rounded-lg font-semibold transition-colors">
                💬 Zalo
              </a>
              <a href="https://t.me" target="_blank" rel="noreferrer"
                 className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-[11px] rounded-lg font-semibold transition-colors">
                ✈ Telegram
              </a>
            </div>
          </footer>
        </div>

        {/* Right: Login Form */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Promo */}
          <div className="glow-card border border-blue-100 bg-blue-50/50 rounded-xl p-3 text-center">
            <p className="text-xs font-semibold text-slate-600">
              🎉 New accounts receive{" "}
              <span className="text-emerald-600 font-extrabold">1,000,000 tokens</span> free
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">
            <h2 className="text-lg font-bold text-slate-800">Đăng nhập tài khoản</h2>

            {isRegistered && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
                ✅ Đăng ký thành công! Vui lòng đăng nhập.
              </div>
            )}

            {(errorMessage || storeError) && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                {errorMessage || storeError}
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wider" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  className={`input-field ${errors.email ? "border-red-400" : ""}`}
                />
                {errors.email && <span className="text-[11px] text-red-500 mt-1 block">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wider" htmlFor="login-password">Mật khẩu</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`input-field ${errors.password ? "border-red-400" : ""}`}
                />
                {errors.password && <span className="text-[11px] text-red-500 mt-1 block">{errors.password.message}</span>}
              </div>

              <div className="flex justify-end text-xs">
                <Link href="/forgot-password" className="text-blue-600 hover:underline font-medium">
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-sm"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2.5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start space-x-2.5 text-sm">
              <span className="text-blue-500 text-base mt-0.5">🔹</span>
              <div>
                <h4 className="font-semibold text-slate-700 text-[13px]">Bóc tách bản vẽ bằng AI</h4>
                <p className="text-[12px] text-slate-500">Nhận diện sơ đồ SLD từ ảnh/PDF, đề xuất thiết bị chính xác theo thư viện chuẩn.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2.5 text-sm">
              <span className="text-blue-500 text-base mt-0.5">🔹</span>
              <div>
                <h4 className="font-semibold text-slate-700 text-[13px]">Đối chiếu thư viện thiết bị</h4>
                <p className="text-[12px] text-slate-500">Khớp tự động với LS, Schneider, Chint, cảnh báo sai lệch.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2.5 text-sm">
              <span className="text-blue-500 text-base mt-0.5">🔹</span>
              <div>
                <h4 className="font-semibold text-slate-700 text-[13px]">Xuất bảng vật tư BOM</h4>
                <p className="text-[12px] text-slate-500">Xuất Excel khối lượng, mã hiệu, đơn giá chỉ một click.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen auth-bg flex items-center justify-center text-slate-400 text-sm">Đang tải...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
