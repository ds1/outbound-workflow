"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Mail, Phone, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useCreateCampaign, useUpdateCampaign, useEnrollProspects, type CampaignStep, type ScheduleConfig } from "@/hooks/useCampaigns";
import { useEmailTemplates, useVoicemailTemplates } from "@/hooks/useTemplates";
import { useLeads } from "@/hooks/useLeads";
import { Campaign, Json } from "@/types/database";

interface CampaignWizardProps {
  campaign?: Campaign;
  mode?: "create" | "edit";
}

const stepSchema = z.object({
  step: z.number(),
  type: z.enum(["email", "voicemail"]),
  template_id: z.string().min(1, "Template is required"),
  delay_days: z.number().min(0),
  audio_url: z.string().optional(),
});

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["email", "voicemail", "multi_channel"]),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
  schedule_config: z.object({
    timezone: z.string(),
    send_days: z.array(z.string()).min(1, "Select at least one day"),
    start_hour: z.number().min(0).max(23),
    end_hour: z.number().min(0).max(23),
  }),
  prospect_ids: z.array(z.string()),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const DAYS_OF_WEEK = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
];

export function CampaignWizard({ campaign, mode = "create" }: CampaignWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const isEditMode = mode === "edit" && campaign;

  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const enrollProspects = useEnrollProspects();

  const { data: emailTemplates = [] } = useEmailTemplates();
  const { data: voicemailTemplates = [] } = useVoicemailTemplates();
  const { data: leads = [] } = useLeads();

  // Parse existing campaign data for edit mode
  const existingSteps = isEditMode && campaign.steps
    ? (campaign.steps as unknown as CampaignStep[])
    : [{ step: 1, type: "email" as const, template_id: "", delay_days: 0 }];

  const existingSchedule = isEditMode && campaign.schedule_config
    ? (campaign.schedule_config as unknown as ScheduleConfig)
    : {
        timezone: "America/New_York",
        send_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        start_hour: 9,
        end_hour: 17,
      };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: isEditMode ? campaign.name : "",
      description: isEditMode ? campaign.description || "" : "",
      type: isEditMode ? campaign.type : "email",
      steps: existingSteps,
      schedule_config: existingSchedule,
      prospect_ids: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  const watchType = watch("type");
  const watchSteps = watch("steps");
  const watchProspectIds = watch("prospect_ids");
  const watchSchedule = watch("schedule_config");

  const onSubmit = async (data: CampaignFormData) => {
    try {
      if (isEditMode) {
        // Update existing campaign
        await updateCampaign.mutateAsync({
          id: campaign.id,
          name: data.name,
          description: data.description,
          type: data.type,
          steps: data.steps as unknown as Json,
          schedule_config: data.schedule_config as unknown as Json,
        });

        toast.success("Campaign updated successfully");
        router.push(`/campaigns/${campaign.id}`);
      } else {
        // Create new campaign
        const newCampaign = await createCampaign.mutateAsync({
          name: data.name,
          description: data.description,
          type: data.type,
          steps: data.steps,
          schedule_config: data.schedule_config,
        });

        if (data.prospect_ids.length > 0) {
          await enrollProspects.mutateAsync({
            campaign_id: newCampaign.id,
            prospect_ids: data.prospect_ids,
          });
        }

        toast.success("Campaign created successfully");
        router.push(`/campaigns/${newCampaign.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} campaign`);
    }
  };

  const addStep = () => {
    const nextStep = fields.length + 1;
    const stepType = watchType === "voicemail" ? "voicemail" : "email";
    append({
      step: nextStep,
      type: stepType,
      template_id: "",
      delay_days: nextStep === 1 ? 0 : 3,
    });
  };

  const toggleProspect = (prospectId: string) => {
    const current = watchProspectIds;
    if (current.includes(prospectId)) {
      setValue(
        "prospect_ids",
        current.filter((id) => id !== prospectId)
      );
    } else {
      setValue("prospect_ids", [...current, prospectId]);
    }
  };

  const selectAllProspects = () => {
    setValue(
      "prospect_ids",
      leads.map((l) => l.id)
    );
  };

  const clearAllProspects = () => {
    setValue("prospect_ids", []);
  };

  const toggleDay = (day: string) => {
    const current = watchSchedule.send_days;
    if (current.includes(day)) {
      setValue(
        "schedule_config.send_days",
        current.filter((d) => d !== day)
      );
    } else {
      setValue("schedule_config.send_days", [...current, day]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
            {step < 4 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  currentStep > step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Set up the basic information for your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="e.g., Q1 Domain Outreach"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this campaign..."
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type</Label>
              <Select
                value={watchType}
                onValueChange={(value: "email" | "voicemail" | "multi_channel") =>
                  setValue("type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Only
                    </div>
                  </SelectItem>
                  <SelectItem value="voicemail">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Voicemail Only
                    </div>
                  </SelectItem>
                  <SelectItem value="multi_channel">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Phone className="h-4 w-4" />
                      Multi-Channel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Campaign Steps */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Steps</CardTitle>
            <CardDescription>Define the sequence of outreach for this campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline">Step {index + 1}</Badge>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={watchSteps[index]?.type}
                        onValueChange={(value: "email" | "voicemail") =>
                          setValue(`steps.${index}.type`, value)
                        }
                        disabled={watchType !== "multi_channel"}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="voicemail">Voicemail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select
                        value={watchSteps[index]?.template_id}
                        onValueChange={(value) =>
                          setValue(`steps.${index}.template_id`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {watchSteps[index]?.type === "email"
                            ? emailTemplates.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))
                            : voicemailTemplates.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                      {errors.steps?.[index]?.template_id && (
                        <p className="text-sm text-destructive">
                          {errors.steps[index]?.template_id?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Delay (days)</Label>
                      <Input
                        type="number"
                        min="0"
                        {...register(`steps.${index}.delay_days`, {
                          valueAsNumber: true,
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        {index === 0 ? "Send immediately" : `Wait ${watchSteps[index]?.delay_days || 0} days after previous step`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button type="button" variant="outline" onClick={addStep}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>

            {errors.steps && (
              <p className="text-sm text-destructive">{errors.steps.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Schedule */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Set when your campaign should send messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={watchSchedule.timezone}
                onValueChange={(value) => setValue("schedule_config.timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Send Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={watchSchedule.send_days.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
              {errors.schedule_config?.send_days && (
                <p className="text-sm text-destructive">
                  {errors.schedule_config.send_days.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Hour</Label>
                <Select
                  value={watchSchedule.start_hour.toString()}
                  onValueChange={(value) =>
                    setValue("schedule_config.start_hour", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>End Hour</Label>
                <Select
                  value={watchSchedule.end_hour.toString()}
                  onValueChange={(value) =>
                    setValue("schedule_config.end_hour", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Select Prospects */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Prospects</CardTitle>
            <CardDescription>
              Choose which prospects to enroll in this campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {watchProspectIds.length} of {leads.length} prospects selected
              </p>
              <div className="space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllProspects}>
                  Select All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearAllProspects}>
                  Clear All
                </Button>
              </div>
            </div>

            <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
              {leads.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No prospects available. Import prospects first.
                </div>
              ) : (
                leads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 ${
                      watchProspectIds.includes(lead.id) ? "bg-muted" : ""
                    }`}
                    onClick={() => toggleProspect(lead.id)}
                  >
                    <div>
                      <p className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                        watchProspectIds.includes(lead.id)
                          ? "bg-primary border-primary"
                          : "border-input"
                      }`}
                    >
                      {watchProspectIds.includes(lead.id) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button type="button" onClick={() => setCurrentStep((s) => s + 1)}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={createCampaign.isPending || updateCampaign.isPending || enrollProspects.isPending}
          >
            {isEditMode
              ? (updateCampaign.isPending ? "Updating..." : "Update Campaign")
              : (createCampaign.isPending ? "Creating..." : "Create Campaign")
            }
          </Button>
        )}
      </div>
    </form>
  );
}
