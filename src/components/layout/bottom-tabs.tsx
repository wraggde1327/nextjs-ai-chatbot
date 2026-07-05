import { NavLink } from "react-router-dom";
import { Home, BookOpen, Calendar, MessageCircle, Menu } from "lucide-react";

const tabs = [
  { to: "/", icon: Home, label: "Главная" },
  { to: "/books", icon: BookOpen, label: "Книги" },
  { to: "/events", icon: Calendar, label: "События" },
  { to: "/chat", icon: MessageCircle, label: "Болталка" },
  { to: "/more", icon: Menu, label: "Ещё" },
];

export function BottomTabs() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
