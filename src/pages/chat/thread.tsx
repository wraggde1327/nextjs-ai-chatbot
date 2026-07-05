import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, ImagePlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockThreads, mockMessages } from "@/lib/mock-data";
import type { ChatMessage } from "@/lib/types";

export function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const thread = mockThreads.find((t) => t.id === threadId);
  const messages = mockMessages.filter((m) => m.threadId === threadId);
  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const allMessages = [...messages, ...localMessages];

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: `local-${Date.now()}`,
      threadId: threadId || "",
      userId: "me",
      userName: "Вы",
      userAvatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Me",
      content: newMessage,
      createdAt: new Date().toISOString(),
      isOwn: true,
    };
    setLocalMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  if (!thread) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-12">
        <p className="text-muted-foreground">Тред не найден</p>
        <Link to="/chat" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
          Назад
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link to="/chat" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg">{thread.icon}</span>
          <h2 className="font-semibold">{thread.title}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.isOwn ? "flex-row-reverse" : ""}`}
            >
              {!msg.isOwn && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={msg.userAvatar} />
                  <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                  msg.isOwn
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary rounded-bl-md"
                }`}
              >
                {!msg.isOwn && (
                  <p className="mb-0.5 text-xs font-semibold text-primary">
                    {msg.userName}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {allMessages.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Начните разговор!
            </p>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="rounded-full"
          />
          <Button
            size="icon"
            className="shrink-0 rounded-full"
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
