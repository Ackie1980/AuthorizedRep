import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./_providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AR Portal - Authorized Representative Management",
  description: "Manage authorized representative applications and documentation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
