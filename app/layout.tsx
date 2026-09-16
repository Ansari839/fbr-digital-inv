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

export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { PrintWrapper } from "@/components/layout/print-wrapper";
import prisma from "@/lib/prisma";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let themeColor = 'default';
  try {
    const session = await getServerSession(authOptions);
    const buId = (session?.user as any)?.businessUnitId;
    if (buId) {
      const business = await prisma.businessUnit.findUnique({ 
        where: { id: buId },
        select: { themeColor: true } 
      });
      if (business && business.themeColor) {
        themeColor = business.themeColor;
      }
    }
  } catch (e) {
    console.error("Failed to load theme from DB", e);
  }

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="font-sans h-full">
        <ThemeProvider initialTheme={themeColor as any}>
          <PrintWrapper sidebar={<Sidebar />}>
            {children}
          </PrintWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
