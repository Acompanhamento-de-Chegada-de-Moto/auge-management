import { SidebarNav } from "./_components/SidebarNav";

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 sm:p-6 lg:p-8">
      <SidebarNav />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
