import { useGetLeaderboard, useGetMyRank } from "@/api/api";
import { formatZAR, formatPct } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RankBadge({ badge, rank }: { badge: string, rank: number }) {
  if (badge === 'gold') return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 ring-1 ring-yellow-500/50"><Trophy className="w-4 h-4" /></div>;
  if (badge === 'silver') return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300/20 text-gray-300 ring-1 ring-gray-300/50"><Medal className="w-4 h-4" /></div>;
  if (badge === 'bronze') return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-700 ring-1 ring-amber-700/50"><Medal className="w-4 h-4" /></div>;
  
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-mono font-bold text-sm">
      {rank}
    </div>
  );
}

export default function Leaderboard() {
  const [period, setPeriod] = useState<'monthly' | 'alltime'>('monthly');
  const { data: leaderboard, isLoading } = useGetLeaderboard({ period });
  const { data: myRank, isLoading: isLoadingRank } = useGetMyRank();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">Top performing traders in the PrimeTrade network.</p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'monthly' | 'alltime')} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Top 3 Podium (Visible on larger screens) */}
        {!isLoading && leaderboard && leaderboard.length >= 3 && (
          <div className="md:col-span-3 hidden md:flex items-end justify-center gap-8 py-8 mb-4">
            {/* Rank 2 - Silver */}
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
              <Avatar className="w-20 h-20 border-4 border-gray-300 mb-4 shadow-lg shadow-gray-300/20">
                <AvatarImage src={leaderboard[1].avatarUrl || undefined} />
                <AvatarFallback>{leaderboard[1].displayName.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center bg-card border border-border rounded-xl p-4 w-48 shadow-sm">
                <div className="text-gray-300 mb-1"><Medal className="w-6 h-6 mx-auto" /></div>
                <h3 className="font-bold truncate" title={leaderboard[1].displayName}>{leaderboard[1].displayName}</h3>
                <p className="text-emerald-500 font-mono text-sm">{formatZAR(leaderboard[1].pnlZar)}</p>
              </div>
            </div>

            {/* Rank 1 - Gold */}
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-700 z-10">
              <div className="relative">
                <div className="absolute -top-6 inset-x-0 flex justify-center text-yellow-500 drop-shadow-md">
                  <Trophy className="w-8 h-8 fill-yellow-500/20" />
                </div>
                <Avatar className="w-28 h-28 border-4 border-yellow-500 mb-4 shadow-xl shadow-yellow-500/30">
                  <AvatarImage src={leaderboard[0].avatarUrl || undefined} />
                  <AvatarFallback>{leaderboard[0].displayName.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center bg-card border-2 border-yellow-500/30 rounded-xl p-5 w-56 shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
                <h3 className="font-bold text-lg truncate" title={leaderboard[0].displayName}>{leaderboard[0].displayName}</h3>
                <p className="text-emerald-500 font-mono font-bold">{formatZAR(leaderboard[0].pnlZar)}</p>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3"/> {leaderboard[0].winRate.toFixed(1)}%</span>
                  <span>{leaderboard[0].totalTrades} trades</span>
                </div>
              </div>
            </div>

            {/* Rank 3 - Bronze */}
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 delay-200">
              <Avatar className="w-16 h-16 border-4 border-amber-700 mb-4 shadow-md shadow-amber-700/20">
                <AvatarImage src={leaderboard[2].avatarUrl || undefined} />
                <AvatarFallback>{leaderboard[2].displayName.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center bg-card border border-border rounded-xl p-3 w-44 shadow-sm">
                <div className="text-amber-700 mb-1"><Medal className="w-5 h-5 mx-auto" /></div>
                <h3 className="font-bold text-sm truncate" title={leaderboard[2].displayName}>{leaderboard[2].displayName}</h3>
                <p className="text-emerald-500 font-mono text-xs">{formatZAR(leaderboard[2].pnlZar)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="md:col-span-3">
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Rankings</CardTitle>
                {myRank && !isLoadingRank && (
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    Your Rank: #{myRank.rank}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/10 border-b border-border">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Rank</th>
                    <th scope="col" className="px-6 py-4 font-medium">Trader</th>
                    <th scope="col" className="px-6 py-4 font-medium text-right">P&L (ZAR)</th>
                    <th scope="col" className="px-6 py-4 font-medium text-right hidden sm:table-cell">Return</th>
                    <th scope="col" className="px-6 py-4 font-medium text-right hidden md:table-cell">Win Rate</th>
                    <th scope="col" className="px-6 py-4 font-medium text-right hidden lg:table-cell">Trades</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 rounded-full" /></td>
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-24" /></div></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                        <td className="px-6 py-4 hidden sm:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></td>
                        <td className="px-6 py-4 hidden md:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></td>
                        <td className="px-6 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : leaderboard && leaderboard.length > 0 ? (
                    leaderboard.map((entry) => (
                      <tr 
                        key={entry.memberId} 
                        className={`hover:bg-muted/30 transition-colors ${entry.isCurrentUser ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <RankBadge badge={entry.badge} rank={entry.rank} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={entry.avatarUrl || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">{entry.displayName.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium text-foreground">
                              {entry.displayName}
                              {entry.isCurrentUser && <span className="ml-2 text-[10px] uppercase tracking-wider text-primary border border-primary/30 bg-primary/10 px-1.5 py-0.5 rounded-sm">You</span>}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-right font-mono font-medium ${entry.pnlZar >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                          {formatZAR(entry.pnlZar)}
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell font-mono">
                          <div className={`inline-flex items-center gap-1 ${entry.pnlPct >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                            {entry.pnlPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {formatPct(entry.pnlPct)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          {entry.winRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground hidden lg:table-cell">
                          {entry.totalTrades}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No leaderboard data available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
