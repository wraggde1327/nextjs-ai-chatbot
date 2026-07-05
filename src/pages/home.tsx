import { Link } from "react-router-dom";
import { Calendar, Star, ChevronRight, Cake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockPosts, mockBooks, mockEvents, mockPolls, mockBirthdays } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export function HomePage() {
  const currentBook = mockBooks.find((b) => b.isCurrent);
  const nextEvent = mockEvents.find((e) => !e.isPast);
  const activePolls = mockPolls.filter((p) => p.isActive);

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Ближайшее мероприятие */}
      {nextEvent && (
        <Link to={`/events/${nextEvent.id}`}>
          <Card className="overflow-hidden border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-primary">Ближайшее событие</p>
                <p className="truncate font-semibold">{nextEvent.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(nextEvent.date)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Книга месяца */}
      {currentBook && (
        <Link to={`/books/${currentBook.id}`}>
          <Card>
            <CardContent className="p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Книга месяца
              </p>
              <div className="flex gap-4">
                <img
                  src={currentBook.coverUrl}
                  alt={currentBook.title}
                  className="h-28 w-20 shrink-0 rounded-lg object-cover shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-tight">{currentBook.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {currentBook.author}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{currentBook.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      · {currentBook.reviewCount} отзывов
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Дни рождения */}
      {mockBirthdays.length > 0 && (
        <Card className="border-pink-200/50 bg-pink-50/30 dark:border-pink-900/30 dark:bg-pink-950/10">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Cake className="h-4 w-4 text-pink-500" />
              <p className="text-xs font-medium uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Дни рождения
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {mockBirthdays.map((b) => (
                <div key={b.userId} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={b.userAvatar} />
                    <AvatarFallback>{b.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{b.userName.split(" ")[0]}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(b.date, true)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Активные голосования */}
      {activePolls.length > 0 && (
        <Link to="/polls">
          <Card className="border-amber-200/50 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/10">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Голосования
                </p>
                <p className="mt-1 font-medium">
                  {activePolls.length} активных
                </p>
                <p className="text-sm text-muted-foreground">
                  {activePolls[0].title}
                </p>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Голосовать
              </Badge>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Лента постов */}
      <div className="mt-1">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
          Новости клуба
        </h2>
        <div className="flex flex-col gap-3">
          {mockPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{post.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Админ
                  </Badge>
                </div>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="mb-3 w-full rounded-xl object-cover"
                    style={{ maxHeight: 220 }}
                  />
                )}
                <p className="text-sm leading-relaxed">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
