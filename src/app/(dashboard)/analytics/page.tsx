"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  Phone,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MousePointer,
  Eye,
  Loader2,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  useCampaignAnalytics,
  useDailyActivity,
  useEngagementMetrics,
  useCostEstimates,
  useActivityTotals,
} from "@/hooks/useAnalytics";
import { format } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");

  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaignAnalytics();
  const { data: dailyActivity = [], isLoading: activityLoading } = useDailyActivity(
    parseInt(dateRange)
  );
  const { data: engagement, isLoading: engagementLoading } = useEngagementMetrics();
  const { data: costData, isLoading: costsLoading } = useCostEstimates(parseInt(dateRange));
  const { data: totals, isLoading: totalsLoading } = useActivityTotals();

  const isLoading =
    campaignsLoading || activityLoading || engagementLoading || costsLoading || totalsLoading;

  // Aggregate stats
  const totalSent = totals?.emails_sent || 0;
  const totalOpened = totals?.emails_opened || 0;
  const totalClicked = totals?.emails_clicked || 0;
  const totalVoicemails = totals?.voicemails_sent || 0;

  // Chart data for daily activity - format dates for display
  const chartData = dailyActivity.map((d) => ({
    ...d,
    displayDate: format(new Date(d.date), "MMM d"),
  }));

  // Pie chart data for engagement
  const engagementPieData = engagement
    ? [
        { name: "Engaged", value: engagement.engaged_prospects - engagement.converted_prospects },
        { name: "Converted", value: engagement.converted_prospects },
        {
          name: "Not Engaged",
          value:
            engagement.total_prospects -
            engagement.engaged_prospects -
            engagement.unsubscribed_prospects,
        },
        { name: "Unsubscribed", value: engagement.unsubscribed_prospects },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Campaign performance metrics and cost tracking
          </p>
        </div>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalsLoading ? "-" : totalSent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals && totals.open_rate > 0 && (
                <span className="text-green-600">
                  {formatPercent(totals.open_rate)} open rate
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Opens</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalsLoading ? "-" : totalOpened.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals && totals.click_rate > 0 && (
                <span className="text-green-600">
                  {formatPercent(totals.click_rate)} click-through
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalsLoading ? "-" : totalClicked.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique link clicks tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voicemails</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalsLoading ? "-" : totalVoicemails.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Ringless voicemails sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        {/* Activity Trends */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>
                Email and voicemail activity over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No activity data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="displayDate"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="emails_sent"
                      name="Emails Sent"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="emails_opened"
                      name="Opens"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="emails_clicked"
                      name="Clicks"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="voicemails_sent"
                      name="Voicemails"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Performance */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Metrics for all campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns created yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Enrolled</TableHead>
                      <TableHead className="text-right">Sent</TableHead>
                      <TableHead className="text-right">Open Rate</TableHead>
                      <TableHead className="text-right">Click Rate</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {campaign.type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.status === "active"
                                ? "default"
                                : campaign.status === "completed"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.total_enrolled.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.total_sent.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              campaign.open_rate > 20
                                ? "text-green-600"
                                : campaign.open_rate > 10
                                ? "text-yellow-600"
                                : "text-muted-foreground"
                            }
                          >
                            {formatPercent(campaign.open_rate)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              campaign.click_rate > 5
                                ? "text-green-600"
                                : campaign.click_rate > 2
                                ? "text-yellow-600"
                                : "text-muted-foreground"
                            }
                          >
                            {formatPercent(campaign.click_rate)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercent(campaign.conversion_rate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Campaign comparison chart */}
          {campaigns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Comparison</CardTitle>
                <CardDescription>Open and click rates by campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaigns.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      formatter={(value) => value !== undefined ? [`${Number(value).toFixed(1)}%`] : []}
                    />
                    <Legend />
                    <Bar dataKey="open_rate" name="Open Rate" fill="#3b82f6" />
                    <Bar dataKey="click_rate" name="Click Rate" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Engagement */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prospect Engagement</CardTitle>
                <CardDescription>Overall engagement breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {engagementLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : engagementPieData.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No prospect data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={engagementPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {engagementPieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Key engagement indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {engagementLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : engagement ? (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span>Total Prospects</span>
                      </div>
                      <span className="font-bold">
                        {engagement.total_prospects.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span>Engagement Rate</span>
                      </div>
                      <span className="font-bold text-green-600">
                        {formatPercent(engagement.engagement_rate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <span>Conversion Rate</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        {formatPercent(engagement.conversion_rate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                        <span>Unsubscribed</span>
                      </div>
                      <span className="font-bold text-red-600">
                        {engagement.unsubscribed_prospects.toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Analysis */}
        <TabsContent value="costs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>
                  Estimated costs for the last {dateRange} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {costsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : costData ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Usage</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costData.costs.map((cost) => (
                        <TableRow key={cost.service}>
                          <TableCell className="font-medium">{cost.service}</TableCell>
                          <TableCell className="text-right">
                            {cost.usage.toLocaleString()} {cost.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(cost.unit_cost)}/{cost.unit.slice(0, -1)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(cost.total_cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={3} className="font-bold">
                          Total Estimated Cost
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(costData.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No cost data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Spend</CardTitle>
                <CardDescription>Last {dateRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <DollarSign className="h-12 w-12 text-green-600 mb-2" />
                  <div className="text-4xl font-bold">
                    {costsLoading ? "-" : formatCurrency(costData?.total || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Estimated based on activity
                  </p>
                </div>

                {costData && costData.total > 0 && (
                  <div className="space-y-2 mt-4">
                    {costData.costs.map((cost) => {
                      const percentage = (cost.total_cost / costData.total) * 100;
                      return (
                        <div key={cost.service} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{cost.service.split(" ")[0]}</span>
                            <span>{formatPercent(percentage)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cost projection */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Projections</CardTitle>
              <CardDescription>
                Estimated costs for scaling campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Per 100 Leads</div>
                  <div className="text-2xl font-bold mt-1">
                    {formatCurrency(11 + 9 + 1.6 + 0.09)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Email + Voicemail + AI
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Per 1,000 Leads</div>
                  <div className="text-2xl font-bold mt-1">
                    {formatCurrency(110 + 90 + 16 + 0.9)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Full campaign with 3 steps
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Per 10,000 Leads</div>
                  <div className="text-2xl font-bold mt-1">
                    {formatCurrency(1100 + 900 + 160 + 9)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Enterprise scale
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
