import { Link } from "react-router-dom";
import { MapPin, Users, Camera, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockEvents } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export function EventsPage() {
  const upcomingEvents = mockEvents.filter((e) => !e.isPast);
  const pastEvents = mockEvents.filter((e) => e.isPast);
  const featured = upcomingEvents[0];

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Ближайшее событие */}
      {featured && (
        <Card className="overflow-hidden border-primary/20">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {featured.type === "quarterly" ? "Квартальное" : "Ежемесячное"}
                </Badge>
                {featured.isOnline && (
                  <Badge variant="outline" className="text-xs">
                    Онлайн
                  </Badge>
                )}
              </div>

              <h2 className="text-lg font-bold leading-tight">
                {featured.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {featured.description}
              </p>

              <div className="mt-4 flex flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-base">📅</span>
                  <span>{formatDate(featured.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{featured.location}</span>
                </div>
                {featured.speakerName && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎤</span>
                    <span>
                      {featured.speakerName}
                      {featured.speakerInfo && (
                        <span className="text-muted-foreground">
                          {" "}
                          — {featured.speakerInfo}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button className="flex-1">Буду</Button>
                <Button variant="outline" className="flex-1">
                  Не смогу
                </Button>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {featured.rsvpGoing} из {featured.rsvpTotal} участниц
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Предстоящие */}
      {upcomingEvents.length > 1 && (
        <div>
          <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Предстоящие
          </h2>
          <div className="flex flex-col gap-2">
            {upcomingEvents.slice(1).map((event) => (
              <EventListItem key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Прошедшие */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Прошедшие
          </h2>
          <div className="flex flex-col gap-2">
            {pastEvents.map((event) => (
              <EventListItem key={event.id} event={event} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventListItem({
  event,
  isPast,
}: {
  event: (typeof mockEvents)[0];
  isPast?: boolean;
}) {
  return (
    <Card className={isPast ? "opacity-70" : ""}>
      <CardContent className="flex items-center gap-3 p-3">
        <div
          className={`h-2 w-2 shrink-0 rounded-full ${
            isPast ? "bg-muted-foreground/40" : "bg-green-500"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(event.date)} · {event.location}
          </p>
        </div>
        {event.hasPhotos && isPast && (
          <Link
            to={`/events/${event.id}`}
            className="flex items-center gap-1 text-xs text-primary"
          >
            <Camera className="h-3.5 w-3.5" />
            Фото
          </Link>
        )}
        {!isPast && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {event.rsvpGoing}
          </div>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
