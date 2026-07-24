import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

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
      <body className={`${roboto.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
