import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIDE - AI Design Electric | Single Line Diagram SLD Reader",
  description: "Trích xuất và bóc tách thiết bị điện thông minh từ bản vẽ SLD / PDF / hình ảnh với độ chính xác cao bằng công nghệ AI và đối chiếu thư viện chuẩn IEC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
