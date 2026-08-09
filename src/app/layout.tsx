import type { Metadata } from "next";
import { Playfair_Display, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/shared/query-provider";
import { CLINIC_NAME, CLINIC_TAGLINE } from "@/lib/constants";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${CLINIC_NAME} | ${CLINIC_TAGLINE}`,
  description:
    "Premium laser waxing and beauty care. Book appointments online, shop aftercare products, and manage your beauty journey.",
  keywords: [
    "laser waxing",
    "beauty clinic",
    "hair removal",
    "skincare",
    "hydrafacial",
    "beauty treatments",
  ],
  authors: [{ name: CLINIC_NAME }],
  openGraph: {
    title: CLINIC_NAME,
    description: CLINIC_TAGLINE,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${beVietnam.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  );
}
