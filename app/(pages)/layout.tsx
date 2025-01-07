import type { Metadata } from "next";
import "../styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";


export const metadata: Metadata = {
  title: "EmpAI",
  description: "Employment with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
            {children}
            <SpeedInsights />
            <Analytics />
        </body>
    </html>
  );
}
