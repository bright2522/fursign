import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/noto-sans-thai";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;
  return {
    title: "Fursign — ออกแบบห้องก่อนซื้อเฟอร์นิเจอร์",
    description: "สร้างห้อง 3 มิติจากขนาดจริง ตรวจการชน สร้างสเปก และค้นหาสินค้าที่ใส่ได้จริง",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title: "Fursign — ออกแบบห้องก่อนซื้อเฟอร์นิเจอร์", description: "วัดพื้นที่ จัดห้อง และเลือกสินค้าที่ใส่ได้จริง", images: [{ url: imageUrl, width: 1792, height: 937, alt: "Fursign room planner" }] },
    twitter: { card: "summary_large_image", title: "Fursign — ออกแบบห้องก่อนซื้อเฟอร์นิเจอร์", description: "วัดพื้นที่ จัดห้อง และเลือกสินค้าที่ใส่ได้จริง", images: [imageUrl] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
