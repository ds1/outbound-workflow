"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  useVoicemailTemplates,
  useCreateVoicemailTemplate,
  useUpdateVoicemailTemplate,
  useDeleteVoicemailTemplate,
} from "@/hooks/useTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Mail, Phone, FileText, MoreHorizontal, Pencil, Trash2, Loader2, Eye, Sparkles } from "lucide-react";
import { DEFAULT_EMAIL_TEMPLATES, DEFAULT_VOICEMAIL_TEMPLATES, type DefaultEmailTemplate, type DefaultVoicemailTemplate } from "@/lib/default-templates";
import type { EmailTemplate, VoicemailTemplate } from "@/types/database";

const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(255),
  subject: z.string().min(1, "Subject is required").max(255),
  body_html: z.string().min(1, "Email body is required"),
  body_text: z.string().optional(),
  preview_text: z.string().max(255).optional(),
});

const voicemailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(255),
  script: z.string().min(1, "Script is required"),
});

type EmailFormData = z.infer<typeof emailTemplateSchema>;
type VoicemailFormData = z.infer<typeof voicemailTemplateSchema>;

export default function TemplatesPage() {
  const [isEmailCreateOpen, setIsEmailCreateOpen] = useState(false);
  const [isVoicemailCreateOpen, setIsVoicemailCreateOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailTemplate | null>(null);
  const [editingVoicemail, setEditingVoicemail] = useState<VoicemailTemplate | null>(null);
  const [previewingEmail, setPreviewingEmail] = useState<EmailTemplate | null>(null);
  const [previewingVoicemail, setPreviewingVoicemail] = useState<VoicemailTemplate | null>(null);
  const [deletingEmailId, setDeletingEmailId] = useState<string | null>(null);
  const [deletingVoicemailId, setDeletingVoicemailId] = useState<string | null>(null);

  // Email template queries/mutations
  const { data: emailTemplates = [], isLoading: emailLoading, error: emailError } = useEmailTemplates();
  const createEmailTemplate = useCreateEmailTemplate();
  const updateEmailTemplate = useUpdateEmailTemplate();
  const deleteEmailTemplate = useDeleteEmailTemplate();

  // Voicemail template queries/mutations
  const { data: voicemailTemplates = [], isLoading: voicemailLoading, error: voicemailError } = useVoicemailTemplates();
  const createVoicemailTemplate = useCreateVoicemailTemplate();
  const updateVoicemailTemplate = useUpdateVoicemailTemplate();
  const deleteVoicemailTemplate = useDeleteVoicemailTemplate();

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: "",
      subject: "",
      body_html: "",
      body_text: "",
      preview_text: "",
    },
  });

  // Voicemail form
  const voicemailForm = useForm<VoicemailFormData>({
    resolver: zodResolver(voicemailTemplateSchema),
    defaultValues: {
      name: "",
      script: "",
    },
  });

  // Email handlers
  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      if (editingEmail) {
        await updateEmailTemplate.mutateAsync({ id: editingEmail.id, ...data });
        toast.success("Email template updated successfully");
        setEditingEmail(null);
      } else {
        await createEmailTemplate.mutateAsync(data);
        toast.success("Email template created successfully");
        setIsEmailCreateOpen(false);
      }
      emailForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save email template");
    }
  };

  const handleEditEmail = (template: EmailTemplate) => {
    setEditingEmail(template);
    emailForm.reset({
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text || "",
      preview_text: template.preview_text || "",
    });
  };

  const handleDeleteEmail = async (id: string) => {
    try {
      setDeletingEmailId(id);
      await deleteEmailTemplate.mutateAsync(id);
      toast.success("Email template deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete email template");
    } finally {
      setDeletingEmailId(null);
    }
  };

  const handleCloseEmailDialog = () => {
    setIsEmailCreateOpen(false);
    setEditingEmail(null);
    emailForm.reset();
  };

  // Voicemail handlers
  const onVoicemailSubmit = async (data: VoicemailFormData) => {
    try {
      if (editingVoicemail) {
        await updateVoicemailTemplate.mutateAsync({ id: editingVoicemail.id, ...data });
        toast.success("Voicemail template updated successfully");
        setEditingVoicemail(null);
      } else {
        await createVoicemailTemplate.mutateAsync(data);
        toast.success("Voicemail template created successfully");
        setIsVoicemailCreateOpen(false);
      }
      voicemailForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save voicemail template");
    }
  };

  const handleEditVoicemail = (template: VoicemailTemplate) => {
    setEditingVoicemail(template);
    voicemailForm.reset({
      name: template.name,
      script: template.script,
    });
  };

  const handleDeleteVoicemail = async (id: string) => {
    try {
      setDeletingVoicemailId(id);
      await deleteVoicemailTemplate.mutateAsync(id);
      toast.success("Voicemail template deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete voicemail template");
    } finally {
      setDeletingVoicemailId(null);
    }
  };

  const handleCloseVoicemailDialog = () => {
    setIsVoicemailCreateOpen(false);
    setEditingVoicemail(null);
    voicemailForm.reset();
  };

  // Load default template handlers
  const handleLoadDefaultEmail = (templateId: string) => {
    const defaultTemplate = DEFAULT_EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (defaultTemplate) {
      emailForm.reset({
        name: defaultTemplate.name,
        subject: defaultTemplate.subject,
        body_html: defaultTemplate.body_html,
        body_text: "",
        preview_text: defaultTemplate.preview_text || "",
      });
    }
  };

  const handleLoadDefaultVoicemail = (templateId: string) => {
    const defaultTemplate = DEFAULT_VOICEMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (defaultTemplate) {
      voicemailForm.reset({
        name: defaultTemplate.name,
        script: defaultTemplate.script,
      });
    }
  };

  if (emailError || voicemailError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load templates</p>
          <p className="text-sm text-muted-foreground">
            {(emailError as Error)?.message || (voicemailError as Error)?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage email and voicemail templates
          </p>
        </div>
      </div>

      {/* Tabs for email and voicemail templates */}
      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="voicemail" className="gap-2">
            <Phone className="h-4 w-4" />
            Voicemail Templates
          </TabsTrigger>
        </TabsList>

        {/* Email Templates */}
        <TabsContent value="email">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  {emailTemplates.length} template{emailTemplates.length !== 1 ? "s" : ""} available
                </CardDescription>
              </div>
              <Dialog open={isEmailCreateOpen || !!editingEmail} onOpenChange={(open) => !open && handleCloseEmailDialog()}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsEmailCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Email Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEmail ? "Edit Email Template" : "Create Email Template"}</DialogTitle>
                    <DialogDescription>
                      {editingEmail ? "Update email template details" : "Create a new email template with variable placeholders"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    {/* Default template selector - only show when creating new */}
                    {!editingEmail && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          Start from a Template
                        </Label>
                        <Select onValueChange={handleLoadDefaultEmail}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a default template (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEFAULT_EMAIL_TEMPLATES.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex flex-col">
                                  <span>{template.name}</span>
                                  <span className="text-xs text-muted-foreground">{template.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Choose a pre-written template to customize, or start from scratch below
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email-name">Template Name</Label>
                      <Input
                        id="email-name"
                        placeholder="e.g., Initial Outreach"
                        {...emailForm.register("name")}
                      />
                      {emailForm.formState.errors.name && (
                        <p className="text-xs text-red-500">{emailForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Subject Line</Label>
                      <Input
                        id="email-subject"
                        placeholder="e.g., Quick question about {{domain.full}}"
                        {...emailForm.register("subject")}
                      />
                      {emailForm.formState.errors.subject && (
                        <p className="text-xs text-red-500">{emailForm.formState.errors.subject.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-preview">Preview Text (optional)</Label>
                      <Input
                        id="email-preview"
                        placeholder="Text shown in email preview..."
                        {...emailForm.register("preview_text")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-body">Email Body (HTML)</Label>
                      <Textarea
                        id="email-body"
                        placeholder="Hi {{lead.first_name}},&#10;&#10;I noticed you might be interested in {{domain.full}}..."
                        className="min-h-[200px] font-mono text-sm"
                        {...emailForm.register("body_html")}
                      />
                      {emailForm.formState.errors.body_html && (
                        <p className="text-xs text-red-500">{emailForm.formState.errors.body_html.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-text">Plain Text Version (optional)</Label>
                      <Textarea
                        id="email-text"
                        placeholder="Plain text version of the email..."
                        className="min-h-[100px]"
                        {...emailForm.register("body_text")}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseEmailDialog}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createEmailTemplate.isPending || updateEmailTemplate.isPending}
                      >
                        {(createEmailTemplate.isPending || updateEmailTemplate.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingEmail ? "Update Template" : "Create Template"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {emailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : emailTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No email templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create templates with variable placeholders for personalized outreach
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {emailTemplates.map((template) => (
                    <Card key={template.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{template.name}</CardTitle>
                            <CardDescription className="truncate mt-1">
                              {template.subject}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setPreviewingEmail(template)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditEmail(template)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteEmail(template.id)}
                                className="text-red-600"
                                disabled={deletingEmailId === template.id}
                              >
                                {deletingEmailId === template.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(template.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voicemail Templates */}
        <TabsContent value="voicemail">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Voicemail Templates</CardTitle>
                <CardDescription>
                  {voicemailTemplates.length} template{voicemailTemplates.length !== 1 ? "s" : ""} available
                </CardDescription>
              </div>
              <Dialog open={isVoicemailCreateOpen || !!editingVoicemail} onOpenChange={(open) => !open && handleCloseVoicemailDialog()}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsVoicemailCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Voicemail Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingVoicemail ? "Edit Voicemail Template" : "Create Voicemail Template"}</DialogTitle>
                    <DialogDescription>
                      {editingVoicemail ? "Update voicemail script details" : "Create a script that will be converted to audio using AI voice synthesis"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={voicemailForm.handleSubmit(onVoicemailSubmit)} className="space-y-4">
                    {/* Default template selector - only show when creating new */}
                    {!editingVoicemail && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          Start from a Template
                        </Label>
                        <Select onValueChange={handleLoadDefaultVoicemail}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a default template (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEFAULT_VOICEMAIL_TEMPLATES.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex flex-col">
                                  <span>{template.name}</span>
                                  <span className="text-xs text-muted-foreground">{template.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Choose a pre-written script to customize, or start from scratch below
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="voicemail-name">Template Name</Label>
                      <Input
                        id="voicemail-name"
                        placeholder="e.g., Initial Voicemail Drop"
                        {...voicemailForm.register("name")}
                      />
                      {voicemailForm.formState.errors.name && (
                        <p className="text-xs text-red-500">{voicemailForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voicemail-script">Voicemail Script</Label>
                      <Textarea
                        id="voicemail-script"
                        placeholder="Hi {{lead.first_name}}, this is Dan calling about {{domain.full}}. I think this domain would be perfect for your business..."
                        className="min-h-[200px]"
                        {...voicemailForm.register("script")}
                      />
                      {voicemailForm.formState.errors.script && (
                        <p className="text-xs text-red-500">{voicemailForm.formState.errors.script.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Keep scripts under 30 seconds (~75 words) for best engagement
                      </p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseVoicemailDialog}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createVoicemailTemplate.isPending || updateVoicemailTemplate.isPending}
                      >
                        {(createVoicemailTemplate.isPending || updateVoicemailTemplate.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingVoicemail ? "Update Template" : "Create Template"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {voicemailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : voicemailTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No voicemail templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create scripts that will be converted to audio using AI voice synthesis
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {voicemailTemplates.map((template) => (
                    <Card key={template.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{template.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {template.audio_duration_seconds
                                ? `${template.audio_duration_seconds}s audio`
                                : "No audio generated"}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setPreviewingVoicemail(template)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview Script
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditVoicemail(template)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteVoicemail(template.id)}
                                className="text-red-600"
                                disabled={deletingVoicemailId === template.id}
                              >
                                {deletingVoicemailId === template.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(template.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Preview Dialog */}
      <Dialog open={!!previewingEmail} onOpenChange={(open) => !open && setPreviewingEmail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview: {previewingEmail?.name}</DialogTitle>
            <DialogDescription>Preview of the email template</DialogDescription>
          </DialogHeader>
          {previewingEmail && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <p className="mt-1 p-2 bg-muted rounded text-sm">{previewingEmail.subject}</p>
              </div>
              {previewingEmail.preview_text && (
                <div>
                  <Label className="text-sm font-medium">Preview Text</Label>
                  <p className="mt-1 p-2 bg-muted rounded text-sm">{previewingEmail.preview_text}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Body</Label>
                <div
                  className="mt-1 p-4 bg-muted rounded text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewingEmail.body_html }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Voicemail Preview Dialog */}
      <Dialog open={!!previewingVoicemail} onOpenChange={(open) => !open && setPreviewingVoicemail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Voicemail Script: {previewingVoicemail?.name}</DialogTitle>
            <DialogDescription>Preview of the voicemail script</DialogDescription>
          </DialogHeader>
          {previewingVoicemail && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Script</Label>
                <p className="mt-1 p-4 bg-muted rounded text-sm whitespace-pre-wrap">{previewingVoicemail.script}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>~{Math.ceil(previewingVoicemail.script.split(/\s+/).length / 2.5)} seconds</span>
                <span>{previewingVoicemail.script.split(/\s+/).length} words</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template variables reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available Variables
          </CardTitle>
          <CardDescription>
            Use these placeholders in your templates for personalization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium mb-2">Lead Variables</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{lead.first_name}}"}</code></li>
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{lead.last_name}}"}</code></li>
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{lead.company}}"}</code></li>
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{lead.email}}"}</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Domain Variables</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{domain.name}}"}</code></li>
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{domain.full}}"}</code></li>
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{domain.price}}"}</code></li>
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{domain.url}}"}</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sender Variables</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{sender.name}}"}</code></li>
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{sender.email}}"}</code></li>
                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{sender.phone}}"}</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
