import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FBR Digital Invoicing",
  description: "FBR compliant digital invoicing system",
};

import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { PrintWrapper } from "@/components/layout/print-wrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="font-sans h-full">
        <ThemeProvider>
          <PrintWrapper sidebar={<Sidebar />}>
            {children}
          </PrintWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
