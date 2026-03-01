import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SensoryProvider } from "@/components/ui/SensoryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Consensus Engine",
  description: "Verified AI Responses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SensoryProvider>
            {children}
          </SensoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
