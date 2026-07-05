import { BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Книжный Клуб" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=Me" />
          <AvatarFallback>Я</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
