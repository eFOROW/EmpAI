import { Navbar2 } from "@/app/components/Home";

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div>
        <Navbar2 />
        {children}
      </div>
    );
  }