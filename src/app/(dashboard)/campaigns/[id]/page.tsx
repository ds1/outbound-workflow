"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Mail,
  Phone,
  Users,
  Send,
  MousePointer,
  Eye,
} from "lucide-react";
import {
  useCampaignWithProspects,
  useStartCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useCompleteCampaign,
  type CampaignStep,
} from "@/hooks/useCampaigns";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  scheduled: "outline",
  active: "default",
  paused: "outline",
  completed: "default",
  cancelled: "destructive",
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data, isLoading, error } = useCampaignWithProspects(id);
  const startCampaign = useStartCampaign();
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();
  const completeCampaign = useCompleteCampaign();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load campaign</p>
        <Link href="/campaigns">
          <Button variant="link">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const { campaign, enrollments } = data;
  const steps = (campaign.steps as unknown as CampaignStep[]) || [];

  const handleStart = async () => {
    try {
      await startCampaign.mutateAsync(campaign.id);
      toast.success("Campaign started");
    } catch (err) {
      toast.error("Failed to start campaign");
    }
  };

  const handlePause = async () => {
    try {
      await pauseCampaign.mutateAsync(campaign.id);
      toast.success("Campaign paused");
    } catch (err) {
      toast.error("Failed to pause campaign");
    }
  };

  const handleResume = async () => {
    try {
      await resumeCampaign.mutateAsync(campaign.id);
      toast.success("Campaign resumed");
    } catch (err) {
      toast.error("Failed to resume campaign");
    }
  };

  const handleComplete = async () => {
    try {
      await completeCampaign.mutateAsync(campaign.id);
      toast.success("Campaign marked as complete");
    } catch (err) {
      toast.error("Failed to complete campaign");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
          </div>
          {campaign.description && (
            <p className="text-muted-foreground mt-1">{campaign.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          {campaign.status === "draft" && (
            <Button onClick={handleStart} disabled={startCampaign.isPending}>
              <Play className="mr-2 h-4 w-4" />
              Start Campaign
            </Button>
          )}
          {campaign.status === "active" && (
            <Button variant="outline" onClick={handlePause} disabled={pauseCampaign.isPending}>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          {campaign.status === "paused" && (
            <>
              <Button onClick={handleResume} disabled={resumeCampaign.isPending}>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
              <Button
                variant="outline"
                onClick={handleComplete}
                disabled={completeCampaign.isPending}
              >
                <Square className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_enrolled || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4" />
              Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_sent || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Opened
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_opened || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Clicked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_clicked || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Replied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_replied || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Steps</CardTitle>
          <CardDescription>
            {steps.length} step{steps.length !== 1 ? "s" : ""} in this campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {step.type === "email" ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                    <span className="font-medium capitalize">{step.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {index === 0
                      ? "Send immediately"
                      : `Wait ${step.delay_days} day${step.delay_days !== 1 ? "s" : ""} after previous step`}
                  </p>
                </div>
                <Badge variant="outline">Template: {step.template_id.slice(0, 8)}...</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Prospects */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Prospects</CardTitle>
          <CardDescription>
            {enrollments?.length || 0} prospects in this campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!enrollments || enrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No prospects enrolled yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prospect</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.prospect_id}>
                    <TableCell className="font-medium">
                      {(enrollment.prospects as { first_name?: string; last_name?: string })?.first_name}{" "}
                      {(enrollment.prospects as { first_name?: string; last_name?: string })?.last_name}
                    </TableCell>
                    <TableCell>
                      {(enrollment.prospects as { email?: string })?.email}
                    </TableCell>
                    <TableCell>
                      Step {enrollment.current_step || 0} of {steps.length}
                    </TableCell>
                    <TableCell>
                      <Badge variant={enrollment.status === "in_progress" ? "default" : "secondary"}>
                        {enrollment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {enrollment.enrolled_at
                        ? new Date(enrollment.enrolled_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
