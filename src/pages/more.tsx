import { Link } from "react-router-dom";
import {
  Vote,
  Gift,
  User,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  {
    to: "/polls",
    icon: Vote,
    label: "Голосования",
    description: "Выберите книгу месяца",
    badge: "2",
  },
  {
    to: "/contests",
    icon: Gift,
    label: "Конкурсы и подарки",
    description: "Конкурсы и дни рождения",
  },
  {
    to: "/profile",
    icon: User,
    label: "Профиль",
    description: "Настройки аккаунта",
  },
];

export function MorePage() {
  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Профиль */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=Me" />
            <AvatarFallback>Я</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">Елена Смирнова</p>
            <p className="text-sm text-muted-foreground">Участница клуба</p>
          </div>
          <Badge variant="outline" className="text-xs text-green-600 border-green-300 dark:text-green-400 dark:border-green-800">
            Активна
          </Badge>
        </CardContent>
      </Card>

      {/* Меню */}
      <div className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <item.icon className="h-5 w-5 text-foreground/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {item.badge && (
                  <Badge className="mr-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Separator />

      <Card className="opacity-60">
        <CardContent className="flex items-center gap-3 p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Выйти</p>
        </CardContent>
      </Card>
    </div>
  );
}
