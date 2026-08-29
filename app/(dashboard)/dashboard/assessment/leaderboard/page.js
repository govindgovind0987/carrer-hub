import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Flame, Zap, Award } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Competitive Leaderboard | CareerHub Coding Platform',
};

export default async function LeaderboardPage() {
  const leaderStats = await prisma.userCodingStats.findMany({
    take: 50,
    orderBy: { points: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
          userBadges: {
            include: { badge: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="text-center space-y-2">
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs px-3 py-1 font-bold">
          <Trophy className="h-3.5 w-3.5 mr-1" /> Competitive Standings
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">Global Coding Leaderboard</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Top candidate engineers ranked by solved algorithm problems, speed metrics, and points.
        </p>
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {leaderStats.length > 0 ? (
              leaderStats.map((stat, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={stat.id}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Indicator */}
                      <div className="w-8 text-center font-bold font-mono">
                        {rank === 1 ? (
                          <span className="text-xl">🥇</span>
                        ) : rank === 2 ? (
                          <span className="text-xl">🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-xl">🥉</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">#{rank}</span>
                        )}
                      </div>

                      {/* User Avatar & Name */}
                      <Avatar className="h-10 w-10 border border-border/50">
                        {stat.user?.image && <AvatarImage src={stat.user.image} />}
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold">
                          {getInitials(stat.user?.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h4 className="font-bold text-sm text-foreground">
                          {stat.user?.name || 'Anonymous Coder'}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {stat.user?.userBadges?.map((ub) => (
                            <span key={ub.id} title={ub.badge.name} className="text-xs">
                              {ub.badge.icon}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="flex items-center gap-6 text-right">
                      <div className="hidden sm:block">
                        <p className="text-xs text-muted-foreground font-medium">Solved</p>
                        <p className="font-bold text-sm">{stat.solvedCount} Problems</p>
                      </div>

                      <div className="hidden sm:block">
                        <p className="text-xs text-muted-foreground font-medium">Streak</p>
                        <p className="font-bold text-sm text-amber-500 flex items-center justify-end gap-1">
                          <Flame className="h-3.5 w-3.5 fill-current" /> {stat.streakDays}d
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Points</p>
                        <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/30 font-bold text-xs">
                          <Zap className="h-3 w-3 mr-1 fill-current" /> {stat.points} PTS
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <Trophy className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p>No leaderboard standings yet. Be the first to solve a challenge!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
