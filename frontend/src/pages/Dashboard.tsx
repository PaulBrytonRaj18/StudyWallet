import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analyticsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Timer,
  AlertCircle,
  BarChart3,
  Youtube,
  MessageSquare,
  StickyNote,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import type { ResourceType } from "@/types";

const resourceIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  youtube_link: <Youtube className="h-4 w-4" />,
  chatgpt_link: <MessageSquare className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  not_started: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  studying: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  revision_pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

const PIE_COLORS = ["#6b7280", "#3b82f6", "#10b981", "#f59e0b"];

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => analyticsService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const progressData = data?.progress_by_status || [];
  const subjectProgress = data?.subject_progress || [];
  const recentUploads = data?.recent_uploads || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          {stats?.study_progress_percentage}% complete
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={BookOpen} label="Subjects" value={stats?.total_subjects || 0} color="text-blue-600" />
        <StatsCard icon={FileText} label="Resources" value={stats?.total_resources || 0} color="text-violet-600" />
        <StatsCard icon={CheckCircle2} label="Completed" value={stats?.completed_resources || 0} color="text-emerald-600" />
        <StatsCard icon={Timer} label="Revision Pending" value={stats?.revision_pending || 0} color="text-amber-600" />
        <StatsCard icon={FileText} label="PDFs" value={stats?.pdf_count || 0} color="text-rose-600" />
        <StatsCard icon={StickyNote} label="Notes" value={stats?.total_notes || 0} color="text-indigo-600" />
        <StatsCard icon={AlertCircle} label="Not Started" value={stats?.not_started_resources || 0} color="text-gray-600" />
        <StatsCard icon={BarChart3} label="Studying" value={stats?.studying_resources || 0} color="text-blue-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Study Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium">{stats?.study_progress_percentage}%</span>
              </div>
              <Progress value={stats?.study_progress_percentage || 0} className="h-3" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {progressData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subject Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectProgress}
                  layout="vertical"
                  margin={{ left: 80, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="subject_name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                    {subjectProgress.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {recentUploads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No recent uploads</p>
          ) : (
            <div className="space-y-3">
              {recentUploads.map((upload: any) => (
                <div key={upload.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    {resourceIcons[upload.resource_type] || <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{upload.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {upload.subject_name} &middot; {formatDistanceToNow(new Date(upload.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
