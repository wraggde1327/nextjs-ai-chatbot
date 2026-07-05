import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { BottomTabs } from "./bottom-tabs";

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="mx-auto max-w-lg pb-20 pt-2">
        <Outlet />
      </main>
      <BottomTabs />
    </div>
  );
}
