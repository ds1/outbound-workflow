"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, Mail, Phone, FileText, Loader2, ArrowRight, Activity } from "lucide-react";
import { useDomains } from "@/hooks/useDomains";
import { useLeads } from "@/hooks/useLeads";
import { useEmailTemplates, useVoicemailTemplates } from "@/hooks/useTemplates";
import { useRecentActivityLogs } from "@/hooks/useActivityLogs";
import { useUserSettings } from "@/hooks/useSettings";
import { formatDistanceToNow } from "date-fns";

const activityTypeIcons: Record<string, typeof Mail> = {
  email_sent: Mail,
  voicemail_sent: Phone,
  lead_created: Users,
  lead_updated: Users,
  domain_created: Globe,
  domain_updated: Globe,
  campaign_started: Activity,
  campaign_completed: Activity,
};

const activityTypeLabels: Record<string, string> = {
  email_sent: "Email Sent",
  voicemail_sent: "Voicemail Dropped",
  lead_created: "Lead Created",
  lead_updated: "Lead Updated",
  domain_created: "Domain Added",
  domain_updated: "Domain Updated",
  campaign_started: "Campaign Started",
  campaign_completed: "Campaign Completed",
};

export default function DashboardPage() {
  const { data: domains = [], isLoading: domainsLoading } = useDomains();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: emailTemplates = [], isLoading: emailTemplatesLoading } = useEmailTemplates();
  const { data: voicemailTemplates = [], isLoading: voicemailTemplatesLoading } = useVoicemailTemplates();
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentActivityLogs(10);
  const { data: userSettings = {} } = useUserSettings();

  // Check which API keys are configured
  const apiKeysConfigured = {
    claude: !!userSettings.anthropic_api_key,
    elevenlabs: !!userSettings.elevenlabs_api_key,
    slybroadcast: !!userSettings.slybroadcast_email && !!userSettings.slybroadcast_password,
    resend: !!userSettings.resend_api_key,
  };
  const apiKeysCount = Object.values(apiKeysConfigured).filter(Boolean).length;
  const hasAnyApiKeys = apiKeysCount > 0;

  const stats = [
    {
      name: "Total Domains",
      value: domainsLoading ? "-" : domains.length.toString(),
      icon: Globe,
      description: "Active domains in portfolio",
      href: "/domains",
    },
    {
      name: "Total Leads",
      value: leadsLoading ? "-" : leads.length.toString(),
      icon: Users,
      description: "Prospects in pipeline",
      href: "/leads",
    },
    {
      name: "Email Templates",
      value: emailTemplatesLoading ? "-" : emailTemplates.length.toString(),
      icon: Mail,
      description: "Ready for campaigns",
      href: "/templates",
    },
    {
      name: "Voicemail Templates",
      value: voicemailTemplatesLoading ? "-" : voicemailTemplates.length.toString(),
      icon: Phone,
      description: "Ready for campaigns",
      href: "/templates",
    },
  ];

  const isLoading = domainsLoading || leadsLoading || emailTemplatesLoading || voicemailTemplatesLoading;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your outbound sales automation
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions and recent activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/domains">
              <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between">
                <div>
                  <div className="font-medium">Add a Domain</div>
                  <div className="text-sm text-muted-foreground">
                    Add a new domain to your portfolio
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/leads">
              <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between">
                <div>
                  <div className="font-medium">Import Leads</div>
                  <div className="text-sm text-muted-foreground">
                    Upload a CSV file with prospect data
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/campaigns">
              <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between">
                <div>
                  <div className="font-medium">Create Campaign</div>
                  <div className="text-sm text-muted-foreground">
                    Start a new email or voicemail campaign
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest outreach events</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No activity yet. Start by adding domains and leads.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = activityTypeIcons[activity.activity_type] || Activity;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {activityTypeLabels[activity.activity_type] || activity.activity_type}
                        </div>
                        <div className="text-muted-foreground truncate">
                          {activity.description ||
                            (activity.prospects
                              ? `${activity.prospects.first_name || ""} ${activity.prospects.last_name || activity.prospects.email || "Unknown"}`
                              : activity.domains?.full_domain || "—")}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Setup checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Complete these steps to set up your automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${domains.length > 0 ? "border-green-500 bg-green-500 text-white" : "border-gray-300"}`}>
                {domains.length > 0 ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <span className="text-xs">1</span>
                )}
              </div>
              <span className={domains.length > 0 ? "line-through text-muted-foreground" : ""}>
                Add domains to your portfolio
              </span>
              {domains.length > 0 && (
                <Badge variant="secondary">{domains.length} added</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${leads.length > 0 ? "border-green-500 bg-green-500 text-white" : "border-gray-300"}`}>
                {leads.length > 0 ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <span className="text-xs">2</span>
                )}
              </div>
              <span className={leads.length > 0 ? "line-through text-muted-foreground" : ""}>
                Import or add leads
              </span>
              {leads.length > 0 && (
                <Badge variant="secondary">{leads.length} added</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${emailTemplates.length > 0 || voicemailTemplates.length > 0 ? "border-green-500 bg-green-500 text-white" : "border-gray-300"}`}>
                {emailTemplates.length > 0 || voicemailTemplates.length > 0 ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <span className="text-xs">3</span>
                )}
              </div>
              <span className={emailTemplates.length > 0 || voicemailTemplates.length > 0 ? "line-through text-muted-foreground" : ""}>
                Create email and voicemail templates
              </span>
              {(emailTemplates.length > 0 || voicemailTemplates.length > 0) && (
                <Badge variant="secondary">
                  {emailTemplates.length + voicemailTemplates.length} created
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${hasAnyApiKeys ? "border-green-500 bg-green-500 text-white" : "border-gray-300"}`}>
                {hasAnyApiKeys ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <span className="text-xs">4</span>
                )}
              </div>
              <span className={hasAnyApiKeys ? "line-through text-muted-foreground" : ""}>
                Add API keys in Settings (Claude, ElevenLabs, Slybroadcast, Resend)
              </span>
              {hasAnyApiKeys && (
                <Badge variant="secondary">{apiKeysCount}/4 configured</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300">
                <span className="text-xs">5</span>
              </div>
              <span>Launch your first campaign</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
