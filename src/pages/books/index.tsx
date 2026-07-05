import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockBooks } from "@/lib/mock-data";

export function BooksPage() {
  const currentBook = mockBooks.find((b) => b.isCurrent);
  const archiveBooks = mockBooks.filter((b) => !b.isCurrent);

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Книга месяца */}
      {currentBook && (
        <Link to={`/books/${currentBook.id}`}>
          <Card className="overflow-hidden border-primary/20">
            <CardContent className="p-4">
              <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20">
                Книга месяца
              </Badge>
              <div className="flex gap-4">
                <img
                  src={currentBook.coverUrl}
                  alt={currentBook.title}
                  className="h-36 w-24 shrink-0 rounded-lg object-cover shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold leading-tight">
                    {currentBook.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentBook.author}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium">{currentBook.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      · {currentBook.reviewCount} отзывов
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {currentBook.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Архив */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Архив · 2026
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {archiveBooks.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="aspect-[2/3] w-full object-cover"
                />
                <CardContent className="p-3">
                  <h3 className="line-clamp-1 text-sm font-semibold">
                    {book.title}
                  </h3>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {book.author}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs font-medium">{book.rating}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 right-4">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          +
        </Button>
      </div>
    </div>
  );
}
