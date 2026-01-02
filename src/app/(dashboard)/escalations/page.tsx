"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertTriangle,
  Plus,
  MoreHorizontal,
  Loader2,
  Play,
  Pause,
  Trash2,
  Clock,
  Mail,
  MousePointer,
  MessageSquare,
  XCircle,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useEscalationRules,
  useCreateEscalationRule,
  useToggleEscalationRule,
  useDeleteEscalationRule,
  useEscalationHistory,
  type TriggerType,
  type EscalationRuleFormData,
} from "@/hooks/useEscalationRules";
import { toast } from "sonner";

const triggerTypeLabels: Record<TriggerType, string> = {
  no_response_days: "No Response",
  high_engagement: "High Engagement",
  reply_received: "Reply Received",
  link_clicked: "Link Clicked",
  email_bounced: "Email Bounced",
};

const triggerTypeIcons: Record<TriggerType, typeof Clock> = {
  no_response_days: Clock,
  high_engagement: Zap,
  reply_received: MessageSquare,
  link_clicked: MousePointer,
  email_bounced: XCircle,
};

const triggerTypeDescriptions: Record<TriggerType, string> = {
  no_response_days: "Trigger when no response after X days",
  high_engagement: "Trigger when engagement score exceeds threshold",
  reply_received: "Trigger immediately when prospect replies",
  link_clicked: "Trigger when prospect clicks a specific link",
  email_bounced: "Trigger when email bounces",
};

export default function EscalationsPage() {
  const { data: rules = [], isLoading } = useEscalationRules();
  const { data: history = [], isLoading: historyLoading } = useEscalationHistory(10);
  const createRule = useCreateEscalationRule();
  const toggleRule = useToggleEscalationRule();
  const deleteRule = useDeleteEscalationRule();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EscalationRuleFormData>({
    name: "",
    description: "",
    is_active: true,
    trigger_type: "no_response_days",
    trigger_config: { days: 7 },
    conditions: [],
    actions: [{ type: "notify_email" }],
    cooldown_hours: 24,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRule.mutateAsync(formData);
      toast.success("Escalation rule created");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        is_active: true,
        trigger_type: "no_response_days",
        trigger_config: { days: 7 },
        conditions: [],
        actions: [{ type: "notify_email" }],
        cooldown_hours: 24,
      });
    } catch {
      toast.error("Failed to create rule");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleRule.mutateAsync({ id, is_active: !currentStatus });
      toast.success(currentStatus ? "Rule deactivated" : "Rule activated");
    } catch {
      toast.error("Failed to update rule");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      await deleteRule.mutateAsync(id);
      toast.success("Rule deleted");
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  const updateTriggerConfig = (key: string, value: number | string) => {
    setFormData({
      ...formData,
      trigger_config: { ...formData.trigger_config, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalation Rules</h1>
          <p className="text-muted-foreground">
            Automated alerts for prospect engagement triggers
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Escalation Rule</DialogTitle>
              <DialogDescription>
                Define triggers and actions for automated escalations
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hot Lead Alert"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="When should this rule trigger?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value: TriggerType) => {
                    setFormData({
                      ...formData,
                      trigger_type: value,
                      trigger_config:
                        value === "no_response_days"
                          ? { days: 7 }
                          : value === "high_engagement"
                          ? { engagement_threshold: 50 }
                          : {},
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(triggerTypeLabels) as TriggerType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = triggerTypeIcons[type];
                            return <Icon className="h-4 w-4" />;
                          })()}
                          {triggerTypeLabels[type]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {triggerTypeDescriptions[formData.trigger_type]}
                </p>
              </div>

              {/* Trigger-specific configuration */}
              {formData.trigger_type === "no_response_days" && (
                <div className="space-y-2">
                  <Label htmlFor="days">Days without response</Label>
                  <Input
                    id="days"
                    type="number"
                    min={1}
                    max={90}
                    value={formData.trigger_config.days || 7}
                    onChange={(e) => updateTriggerConfig("days", parseInt(e.target.value))}
                  />
                </div>
              )}

              {formData.trigger_type === "high_engagement" && (
                <div className="space-y-2">
                  <Label htmlFor="threshold">Engagement threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.trigger_config.engagement_threshold || 50}
                    onChange={(e) =>
                      updateTriggerConfig("engagement_threshold", parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Based on email opens and link clicks
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="cooldown">Cooldown (hours)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  min={1}
                  max={168}
                  value={formData.cooldown_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, cooldown_hours: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Wait time before rule can trigger again for same prospect
                </p>
              </div>

              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={formData.actions[0]?.type || "notify_email"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      actions: [{ type: value as "notify_email" | "update_status" }],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notify_email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Send Email Notification
                      </div>
                    </SelectItem>
                    <SelectItem value="update_status">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Update Prospect Status
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active">Activate rule immediately</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createRule.isPending}>
                  {createRule.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Rule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules list */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
          <CardDescription>
            Rules are evaluated automatically by the campaign engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No escalation rules</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Create rules to automatically alert you when prospects show high engagement
                or haven&apos;t responded.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Rule
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Cooldown</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => {
                  const triggerConfig = rule.trigger_config as Record<string, unknown>;
                  const actions = rule.actions as { type: string }[];
                  const TriggerIcon =
                    triggerTypeIcons[rule.trigger_type as TriggerType] || AlertTriangle;

                  return (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          {rule.description && (
                            <div className="text-sm text-muted-foreground">
                              {rule.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TriggerIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {triggerTypeLabels[rule.trigger_type as TriggerType] ||
                              rule.trigger_type}
                          </span>
                          {typeof triggerConfig?.days === "number" && (
                            <Badge variant="secondary">{triggerConfig.days}d</Badge>
                          )}
                          {typeof triggerConfig?.engagement_threshold === "number" && (
                            <Badge variant="secondary">
                              &gt;{triggerConfig.engagement_threshold}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {actions?.[0]?.type === "notify_email" ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            Email
                          </div>
                        ) : (
                          actions?.[0]?.type || "—"
                        )}
                      </TableCell>
                      <TableCell>{rule.cooldown_hours}h</TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleToggle(rule.id, rule.is_active)}
                            >
                              {rule.is_active ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(rule.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent escalations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Escalations</CardTitle>
          <CardDescription>Latest triggered escalation events</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No escalations triggered yet
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const metadata = item.metadata as Record<string, unknown>;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {(metadata?.rule_name as string) || "Escalation Triggered"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.prospects
                          ? `${item.prospects.first_name || ""} ${
                              item.prospects.last_name || item.prospects.email || ""
                            }`.trim()
                          : "Unknown prospect"}
                        {item.prospects?.company_name && ` at ${item.prospects.company_name}`}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
