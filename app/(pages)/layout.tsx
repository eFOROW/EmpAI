import type { Metadata } from "next";
import "../styles/globals.css";
import { Navbar } from "../components/Home";


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
          <main className="bg-gray-200 overflow-hidden">
            <Navbar/>
            {children}
          </main>
        </body>
    </html>
  );
}
