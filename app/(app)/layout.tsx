import Navbar from "@/components/layout/navbar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
