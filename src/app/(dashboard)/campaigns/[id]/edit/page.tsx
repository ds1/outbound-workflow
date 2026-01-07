"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CampaignWizard } from "@/components/campaigns/CampaignWizard";
import { useCampaign } from "@/hooks/useCampaigns";

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: campaign, isLoading, error } = useCampaign(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive">Campaign not found</h2>
          <p className="text-muted-foreground mt-2">
            The campaign you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  // Only allow editing draft campaigns
  if (campaign.status !== "draft") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/campaigns/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaign
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Cannot Edit Campaign</h2>
          <p className="text-muted-foreground mt-2">
            Only draft campaigns can be edited. This campaign is currently &quot;{campaign.status}&quot;.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/campaigns/${id}`)}
          >
            View Campaign
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/campaigns/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
        <p className="text-muted-foreground">
          Update the settings for &quot;{campaign.name}&quot;
        </p>
      </div>

      <CampaignWizard campaign={campaign} mode="edit" />
    </div>
  );
}
