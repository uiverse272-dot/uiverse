import { Navbar } from "@/components/shell/Navbar";
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
      <Navbar />
      <main className="pb-16 md:pb-0">{children}</main>
      {modal}
      <BottomNav />
      <SaveToast />
    </>
  );
}
