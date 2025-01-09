import type { Metadata } from "next";
import "../styles/globals.css";


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
        </body>
    </html>
  );
}
