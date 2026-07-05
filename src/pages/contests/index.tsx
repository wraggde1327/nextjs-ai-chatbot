import { Cake, Trophy, Clock, Users, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { mockContests, mockBirthdays } from "@/lib/mock-data";
import { formatDate, daysUntil } from "@/lib/format";

export function ContestsPage() {
  const activeContests = mockContests.filter((c) => c.isActive);
  const archiveContests = mockContests.filter((c) => !c.isActive);

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Дни рождения */}
      {mockBirthdays.length > 0 && (
        <Card className="overflow-hidden border-pink-200/50 dark:border-pink-900/30">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:from-pink-950/20 dark:to-rose-950/20">
              <div className="mb-3 flex items-center gap-2">
                <Cake className="h-5 w-5 text-pink-500" />
                <h2 className="font-semibold text-pink-700 dark:text-pink-400">
                  С днём рождения!
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {mockBirthdays.map((b) => (
                  <div key={b.userId} className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-pink-200 dark:ring-pink-800">
                      <AvatarImage src={b.userAvatar} />
                      <AvatarFallback>{b.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{b.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(b.date, true)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-400"
                    >
                      <Gift className="h-3.5 w-3.5" />
                      Поздравить
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Активные конкурсы */}
      {activeContests.length > 0 && (
        <div>
          <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Активные конкурсы ({activeContests.length})
          </h2>
          <div className="flex flex-col gap-3">
            {activeContests.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        </div>
      )}

      {/* Архив */}
      {archiveContests.length > 0 && (
        <div>
          <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Архив
          </h2>
          <div className="flex flex-col gap-2">
            {archiveContests.map((contest) => (
              <Card key={contest.id} className="opacity-70">
                <CardContent className="flex items-center gap-3 p-3.5">
                  <Trophy className="h-5 w-5 shrink-0 text-amber-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{contest.title}</p>
                    {contest.winnerName && (
                      <p className="text-xs text-muted-foreground">
                        Победитель: {contest.winnerName}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Завершено
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContestCard({ contest }: { contest: (typeof mockContests)[0] }) {
  const days = daysUntil(contest.deadline);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">{contest.title}</h3>
        </div>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          {contest.description}
        </p>
        <div className="mb-4 flex flex-col gap-1.5 text-sm">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <span>{contest.prize}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              до {formatDate(contest.deadline, true)} ({days} дн.)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{contest.participantCount} участниц</span>
          </div>
        </div>
        <Button className="w-full">Участвовать</Button>
      </CardContent>
    </Card>
  );
}
