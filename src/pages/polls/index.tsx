import { useState } from "react";
import { Clock, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPolls } from "@/lib/mock-data";
import { daysUntil } from "@/lib/format";

export function PollsPage() {
  const activePolls = mockPolls.filter((p) => p.isActive);
  const archivePolls = mockPolls.filter((p) => !p.isActive);
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});

  const handleVote = (pollId: string, optionId: string) => {
    setVotedPolls((prev) => ({ ...prev, [pollId]: optionId }));
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      <Tabs defaultValue="active">
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">
            Активные ({activePolls.length})
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex-1">
            Архив ({archivePolls.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 flex flex-col gap-4">
          {activePolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              votedOptionId={votedPolls[poll.id]}
              onVote={(optionId) => handleVote(poll.id, optionId)}
            />
          ))}
          {activePolls.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Нет активных голосований
            </p>
          )}
        </TabsContent>

        <TabsContent value="archive" className="mt-4 flex flex-col gap-4">
          {archivePolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              votedOptionId={poll.options[0]?.id}
              onVote={() => {}}
              showResults
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PollCardProps {
  poll: (typeof mockPolls)[0];
  votedOptionId?: string;
  onVote: (optionId: string) => void;
  showResults?: boolean;
}

function PollCard({ poll, votedOptionId, onVote, showResults }: PollCardProps) {
  const hasVoted = !!votedOptionId || showResults;
  const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);
  const days = daysUntil(poll.deadline);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">{poll.title}</h3>
          {poll.isActive && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {days} дн.
            </Badge>
          )}
          {!poll.isActive && (
            <Badge variant="secondary" className="text-xs">
              Завершено
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isSelected = votedOptionId === option.id;

            return (
              <div key={option.id}>
                {hasVoted ? (
                  <div className="rounded-xl border border-border p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {option.imageUrl && (
                          <img
                            src={option.imageUrl}
                            alt=""
                            className="h-10 w-7 rounded object-cover"
                          />
                        )}
                        <div>
                          <span className="text-sm font-medium">
                            {option.title}
                          </span>
                          {option.description && (
                            <p className="text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <span className="text-sm font-semibold">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
                    onClick={() => onVote(option.id)}
                  >
                    {option.imageUrl && (
                      <img
                        src={option.imageUrl}
                        alt=""
                        className="h-12 w-8 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{option.title}</p>
                      {option.description && (
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Проголосовало: {poll.votedCount} из {poll.totalMembers}
        </p>
      </CardContent>
    </Card>
  );
}
