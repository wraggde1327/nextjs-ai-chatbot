import { Link } from "react-router-dom";
import { Pin, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockThreads } from "@/lib/mock-data";

export function ChatPage() {
  const pinnedThreads = mockThreads.filter((t) => t.isPinned);
  const regularThreads = mockThreads.filter((t) => !t.isPinned);

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      {pinnedThreads.map((thread) => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}
      {regularThreads.map((thread) => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}

      <div className="fixed bottom-20 right-4">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function ThreadItem({ thread }: { thread: (typeof mockThreads)[0] }) {
  return (
    <Link to={`/chat/${thread.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-lg">
            {thread.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {thread.isPinned && (
                <Pin className="h-3 w-3 text-muted-foreground" />
              )}
              <p className="truncate text-sm font-semibold">{thread.title}</p>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">
                {thread.lastMessageAuthor}:
              </span>{" "}
              {thread.lastMessage}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">
              {thread.lastMessageTime}
            </span>
            {thread.unreadCount > 0 && (
              <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 text-xs">
                {thread.unreadCount}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
