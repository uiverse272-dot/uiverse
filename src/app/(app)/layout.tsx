import { Navbar } from "@/components/shell/Navbar";
import { Sidebar } from "@/components/shell/Sidebar";
import { BottomNav } from "@/components/shell/BottomNav";
import { SaveToast } from "@/components/save/SaveToast";

export default function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Navbar />
          <main className="pb-16 md:pb-0">{children}</main>
        </div>
      </div>
      {modal}
      <BottomNav />
      <SaveToast />
    </>
  );
}
