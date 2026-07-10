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

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const storeError = useAuthStore((state) => state.error);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "", email: "", phone: "",
      password: "", password_confirmation: "", accepted_terms: false,
    }
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
    <main className="min-h-screen auth-bg flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">

        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-sm">
            A
          </div>
          <h2 className="text-lg font-bold text-slate-800 mt-1">Đăng ký tài khoản AIDE</h2>
          <p className="text-xs text-slate-500" data-tooltip="Tokens dùng để bóc tách mỗi bản vẽ">
            🎉 Nhận ngay <b className="text-emerald-600">1,000,000 tokens</b> miễn phí
          </p>
        </div>

        {(errorMsg || storeError) && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
            {errorMsg || storeError}
          </div>
        )}

        <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wider" htmlFor="reg-name">Họ và tên</label>
            <input type="text" id="reg-name" placeholder="Nguyễn Văn A"
                   {...register("full_name")} className="input-field" />
            {errors.full_name && <span className="text-[11px] text-red-500 mt-1 block">{errors.full_name.message}</span>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wider" htmlFor="reg-email">Email</label>
            <input type="email" id="reg-email" placeholder="name@company.com"
                   {...register("email")} className="input-field" />
            {errors.email && <span className="text-[11px] text-red-500 mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wider" htmlFor="reg-phone">
              Số điện thoại <span className="font-normal normal-case text-slate-400">(tùy chọn)</span>
            </label>
            <input type="text" id="reg-phone" placeholder="09xxxxxxxx"
                   {...register("phone")} className="input-field" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wider" htmlFor="reg-password">Mật khẩu</label>
            <input type="password" id="reg-password" placeholder="••••••••"
                   {...register("password")} className="input-field" />
            {errors.password && <span className="text-[11px] text-red-500 mt-1 block">{errors.password.message}</span>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wider" htmlFor="reg-password-confirm">Nhập lại mật khẩu</label>
            <input type="password" id="reg-password-confirm" placeholder="••••••••"
                   {...register("password_confirmation")} className="input-field" />
            {errors.password_confirmation && <span className="text-[11px] text-red-500 mt-1 block">{errors.password_confirmation.message}</span>}
          </div>

          <div className="flex items-start space-x-2 text-xs pt-1">
            <input type="checkbox" id="accepted_terms"
                   {...register("accepted_terms")}
                   className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="accepted_terms" className="text-slate-500 leading-tight cursor-pointer">
              Tôi đồng ý với{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">Điều khoản dịch vụ</Link>
              {" "}và{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">Chính sách bảo mật</Link>.
            </label>
          </div>
          {errors.accepted_terms && <span className="text-[11px] text-red-500 mt-1 block">{errors.accepted_terms.message}</span>}

          <button type="submit" disabled={loading} className="w-full btn-primary text-sm">
            {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </main>
  );
}
