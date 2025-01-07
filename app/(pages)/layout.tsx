import type { Metadata } from "next";
import "../styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";


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
        </body>
    </html>
  );
}
