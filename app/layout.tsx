import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AppSidebar from "@/components/Sidebar";
import { CampProvider } from "@/context/CampContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMG Camp Manager",
  description: "Camp management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CampProvider>
          <Navbar />
          <AppSidebar />
          <main className="ml-60 mt-16 min-h-[calc(100vh-4rem)] bg-gray-50 p-6">
            {children}
          </main>
        </CampProvider>
      </body>
    </html>
  );
}
