import { useGetDashboard, useGetActivity } from "@/api/api";
import { formatZAR, formatPct } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, ArrowUpRight, ArrowDownRight, Briefcase, Percent, Target, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

function StatCard({ title, value, subtext, icon: Icon, trend, isLoading }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {!isLoading && subtext && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}>
            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: dashboard, isLoading: isLoadingDash } = useGetDashboard();
  const { data: activities, isLoading: isLoadingAct } = useGetActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your portfolio snapshot and recent performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Portfolio Value" 
          value={dashboard ? formatZAR(dashboard.portfolioValueZar) : "R0.00"} 
          icon={Briefcase}
          isLoading={isLoadingDash}
        />
        <StatCard 
          title="Total P&L" 
          value={dashboard ? formatZAR(dashboard.totalPnlZar) : "R0.00"} 
          subtext={dashboard ? `${formatPct(dashboard.totalPnlPct)} all time` : ""}
          trend={dashboard?.totalPnlZar && dashboard.totalPnlZar >= 0 ? 'up' : 'down'}
          icon={Activity}
          isLoading={isLoadingDash}
        />
        <StatCard 
          title="Win Rate" 
          value={dashboard ? `${dashboard.winRate.toFixed(1)}%` : "0%"} 
          subtext={dashboard ? `Across ${dashboard.totalTrades} total trades` : ""}
          icon={Target}
          isLoading={isLoadingDash}
        />
        <StatCard 
          title="Monthly P&L" 
          value={dashboard ? formatZAR(dashboard.monthlyPnlZar) : "R0.00"} 
          trend={dashboard?.monthlyPnlZar && dashboard.monthlyPnlZar >= 0 ? 'up' : 'down'}
          icon={Percent}
          isLoading={isLoadingDash}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-1 md:col-span-5">
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
            <CardDescription>Portfolio performance over time (ZAR)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDash ? (
              <div className="h-[350px] w-full flex items-center justify-center">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : dashboard?.equityCurve && dashboard.equityCurve.length > 0 ? (
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboard.equityCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(val) => `R${(val/1000).toFixed(0)}k`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [formatZAR(value), 'Value']}
                      labelFormatter={(label: string) => format(parseISO(label), 'MMMM d, yyyy')}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="valueZar" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
                No equity data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events on your account</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[350px] pr-2">
            {isLoadingAct ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {activities.map((activity, index) => {
                  let Icon = Activity;
                  let colorClass = "bg-primary/20 text-primary";
                  
                  switch(activity.type) {
                    case 'trade_opened': 
                      Icon = Target; colorClass = "bg-blue-500/20 text-blue-500"; break;
                    case 'trade_closed': 
                      Icon = Briefcase; colorClass = "bg-emerald-500/20 text-emerald-500"; break;
                    case 'deposit':
                      Icon = ArrowUpRight; colorClass = "bg-emerald-500/20 text-emerald-500"; break;
                    case 'withdrawal':
                      Icon = ArrowDownRight; colorClass = "bg-amber-500/20 text-amber-500"; break;
                    case 'lesson_completed':
                      Icon = Target; colorClass = "bg-purple-500/20 text-purple-500"; break;
                    case 'rank_changed':
                      Icon = Activity; colorClass = "bg-primary/20 text-primary"; break;
                  }

                  return (
                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-card ${colorClass} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] bg-card border border-border p-3 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-foreground">{activity.title}</h4>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(parseISO(activity.occurredAt), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
               <div className="text-center py-10 text-muted-foreground">
                 No recent activity found.
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
