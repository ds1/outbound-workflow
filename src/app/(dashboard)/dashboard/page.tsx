import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, Mail, Phone } from "lucide-react";

const stats = [
  {
    name: "Total Domains",
    value: "0",
    icon: Globe,
    description: "Active domains in portfolio",
  },
  {
    name: "Total Leads",
    value: "0",
    icon: Users,
    description: "Prospects in pipeline",
  },
  {
    name: "Emails Sent",
    value: "0",
    icon: Mail,
    description: "This month",
  },
  {
    name: "Voicemails Dropped",
    value: "0",
    icon: Phone,
    description: "This month",
  },
];

export default function DashboardPage() {
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
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
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
            <div className="rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <div className="font-medium">Add a Domain</div>
              <div className="text-sm text-muted-foreground">
                Add a new domain to your portfolio
              </div>
            </div>
            <div className="rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <div className="font-medium">Import Leads</div>
              <div className="text-sm text-muted-foreground">
                Upload a CSV file with prospect data
              </div>
            </div>
            <div className="rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <div className="font-medium">Create Campaign</div>
              <div className="text-sm text-muted-foreground">
                Start a new email or voicemail campaign
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest outreach events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p>No activity yet. Start by adding domains and leads.</p>
            </div>
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
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300">
                <span className="text-xs">1</span>
              </div>
              <span>Add API keys in Settings (Claude, ElevenLabs, Slybroadcast, Resend)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300">
                <span className="text-xs">2</span>
              </div>
              <span>Add domains to your portfolio</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300">
                <span className="text-xs">3</span>
              </div>
              <span>Import or add leads</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300">
                <span className="text-xs">4</span>
              </div>
              <span>Create email and voicemail templates</span>
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
