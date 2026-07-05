import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockBooks, mockBookReviews } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const book = mockBooks.find((b) => b.id === id);
  const reviews = mockBookReviews.filter((r) => r.bookId === id);

  if (!book) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-12">
        <p className="text-muted-foreground">Книга не найдена</p>
        <Link to="/books" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
          Назад
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      <Link
        to="/books"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Книги
      </Link>

      <div className="flex gap-4">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-44 w-28 shrink-0 rounded-xl object-cover shadow-lg"
        />
        <div className="flex flex-1 flex-col">
          {book.isCurrent && (
            <Badge className="mb-2 w-fit bg-primary/10 text-primary hover:bg-primary/20">
              Книга месяца
            </Badge>
          )}
          <h1 className="text-xl font-bold leading-tight">{book.title}</h1>
          <p className="mt-1 text-muted-foreground">{book.author}</p>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(book.rating)
                    ? "fill-primary text-primary"
                    : "text-border"
                }`}
              />
            ))}
            <span className="ml-1 text-sm font-medium">{book.rating}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {book.reviewCount} отзывов
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {book.description}
      </p>

      <Separator />

      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Отзывы ({reviews.length})
        </h2>
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.userAvatar} />
                    <AvatarFallback>{review.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating
                            ? "fill-primary text-primary"
                            : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{review.text}</p>
              </CardContent>
            </Card>
          ))}
          {reviews.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Пока нет отзывов. Будьте первой!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
