"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, Zap, Pencil } from "lucide-react";
import { useCampaigns, useCampaignStats } from "@/hooks/useCampaigns";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  scheduled: "outline",
  active: "default",
  paused: "outline",
  completed: "default",
  cancelled: "destructive",
};

const typeIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  voicemail: <Phone className="h-4 w-4" />,
  multi_channel: <Zap className="h-4 w-4" />,
};

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: stats } = useCampaignStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage outreach campaigns
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Campaign stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.emailsToday || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Voicemails Dropped Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.voicemailsToday || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first campaign to start reaching prospects
              </p>
              <Link href="/campaigns/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const openRate =
                    campaign.total_sent && campaign.total_sent > 0
                      ? Math.round(((campaign.total_opened || 0) / campaign.total_sent) * 100)
                      : 0;

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {typeIcons[campaign.type]}
                          <span className="capitalize">{campaign.type.replace("_", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[campaign.status] || "default"}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.total_enrolled || 0}</TableCell>
                      <TableCell>{campaign.total_sent || 0}</TableCell>
                      <TableCell>{openRate}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {campaign.status === "draft" && (
                            <Link href={`/campaigns/${campaign.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          )}
                          <Link href={`/campaigns/${campaign.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
