"use client";

export default function SquadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-4 sm:p-6 lg:p-8 space-y-6">{children}</div>;
}
