"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, useBulkCreateLeads } from "@/hooks/useLeads";
import { useDomains } from "@/hooks/useDomains";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Users, Upload, MoreHorizontal, Pencil, Trash2, Loader2, FileSpreadsheet } from "lucide-react";
import type { Prospect } from "@/types/database";

const leadSchema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  first_name: z.string().optional().or(z.literal("")),
  last_name: z.string().optional().or(z.literal("")),
  company_name: z.string().optional().or(z.literal("")),
  domain_id: z.string().optional().or(z.literal("")),
  source: z.string().min(1, "Source is required"),
  status: z.enum(["new", "contacted", "engaged", "qualified", "converted", "unsubscribed"]),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"],
});

type LeadFormData = z.infer<typeof leadSchema>;

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  contacted: "secondary",
  engaged: "outline",
  qualified: "default",
  converted: "default",
  unsubscribed: "destructive",
};

export default function LeadsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Prospect | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  type ProspectStatus = "new" | "contacted" | "engaged" | "qualified" | "converted" | "unsubscribed";
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | "all">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<Array<{
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
  }>>([]);

  const { data: leads = [], isLoading, error } = useLeads(
    statusFilter !== "all" ? { status: statusFilter as ProspectStatus } : undefined
  );
  const { data: domains = [] } = useDomains();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkCreateLeads = useBulkCreateLeads();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      email: "",
      phone: "",
      first_name: "",
      last_name: "",
      company_name: "",
      domain_id: "",
      source: "manual",
      status: "new",
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      const payload = {
        email: data.email || null,
        phone: data.phone || null,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        company_name: data.company_name || null,
        domain_id: data.domain_id || null,
        source: data.source,
        status: data.status,
      };

      if (editingLead) {
        await updateLead.mutateAsync({ id: editingLead.id, ...payload });
        toast.success("Lead updated successfully");
        setEditingLead(null);
      } else {
        await createLead.mutateAsync(payload);
        toast.success("Lead added successfully");
        setIsCreateOpen(false);
      }
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save lead");
    }
  };

  const handleEdit = (lead: Prospect) => {
    setEditingLead(lead);
    form.reset({
      email: lead.email || "",
      phone: lead.phone || "",
      first_name: lead.first_name || "",
      last_name: lead.last_name || "",
      company_name: lead.company_name || "",
      domain_id: lead.domain_id || "",
      source: lead.source,
      status: lead.status as LeadFormData["status"],
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteLead.mutateAsync(id);
      toast.success("Lead deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete lead");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setEditingLead(null);
    form.reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].toLowerCase().split(",").map(h => h.trim());

      const emailIndex = headers.findIndex(h => h.includes("email"));
      const phoneIndex = headers.findIndex(h => h.includes("phone"));
      const firstNameIndex = headers.findIndex(h => h.includes("first") || h === "name");
      const lastNameIndex = headers.findIndex(h => h.includes("last"));
      const companyIndex = headers.findIndex(h => h.includes("company") || h.includes("organization"));

      const parsedLeads = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
        return {
          email: emailIndex >= 0 ? values[emailIndex] : undefined,
          phone: phoneIndex >= 0 ? values[phoneIndex] : undefined,
          first_name: firstNameIndex >= 0 ? values[firstNameIndex] : undefined,
          last_name: lastNameIndex >= 0 ? values[lastNameIndex] : undefined,
          company_name: companyIndex >= 0 ? values[companyIndex] : undefined,
        };
      }).filter(lead => lead.email || lead.phone);

      setImportPreview(parsedLeads);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    try {
      const leadsToImport = importPreview.map(lead => ({
        email: lead.email || null,
        phone: lead.phone || null,
        first_name: lead.first_name || null,
        last_name: lead.last_name || null,
        company_name: lead.company_name || null,
        source: "csv_import",
        status: "new" as const,
      }));

      await bulkCreateLeads.mutateAsync(leadsToImport);
      toast.success(`Successfully imported ${leadsToImport.length} leads`);
      setIsImportOpen(false);
      setImportPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import leads");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load leads</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage your prospect pipeline
          </p>
        </div>
        <div className="flex gap-2">
          {/* Import CSV Dialog */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Leads from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with columns: email, phone, first_name, last_name, company
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer text-sm text-blue-600 hover:underline"
                  >
                    Click to upload CSV file
                  </label>
                </div>

                {importPreview.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Preview ({importPreview.length} leads found):
                    </p>
                    <div className="max-h-48 overflow-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Company</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importPreview.slice(0, 10).map((lead, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-sm">{lead.email || "-"}</TableCell>
                              <TableCell className="text-sm">{lead.phone || "-"}</TableCell>
                              <TableCell className="text-sm">
                                {[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "-"}
                              </TableCell>
                              <TableCell className="text-sm">{lead.company_name || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {importPreview.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        ...and {importPreview.length - 10} more
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => {
                    setIsImportOpen(false);
                    setImportPreview([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={importPreview.length === 0 || bulkCreateLeads.isPending}
                  >
                    {bulkCreateLeads.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Import {importPreview.length} Leads
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Lead Dialog */}
          <Dialog open={isCreateOpen || !!editingLead} onOpenChange={(open) => !open && handleCloseDialog()}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
                <DialogDescription>
                  {editingLead ? "Update lead details" : "Add a prospect to your pipeline"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      placeholder="John"
                      {...form.register("first_name")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      placeholder="Doe"
                      {...form.register("last_name")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    {...form.register("phone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company</Label>
                  <Input
                    id="company_name"
                    placeholder="Acme Inc"
                    {...form.register("company_name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain_id">Domain of Interest</Label>
                  <Select
                    value={form.watch("domain_id") || "none"}
                    onValueChange={(value) => form.setValue("domain_id", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          {domain.full_domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Select
                      value={form.watch("source")}
                      onValueChange={(value) => form.setValue("source", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="csv_import">CSV Import</SelectItem>
                        <SelectItem value="web_scrape">Web Scrape</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.watch("status")}
                      onValueChange={(value) => form.setValue("status", value as LeadFormData["status"])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="engaged">Engaged</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createLead.isPending || updateLead.isPending}
                  >
                    {(createLead.isPending || updateLead.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingLead ? "Update Lead" : "Add Lead"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProspectStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="engaged">Engaged</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Leads</CardTitle>
          <CardDescription>
            {leads.length} prospect{leads.length !== 1 ? "s" : ""} in your pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No leads yet</h3>
              <p className="text-muted-foreground mb-4">
                Add leads manually or import from a CSV file
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "-"}
                    </TableCell>
                    <TableCell>{lead.email || "-"}</TableCell>
                    <TableCell>{lead.phone || "-"}</TableCell>
                    <TableCell>{lead.company_name || "-"}</TableCell>
                    <TableCell>
                      {lead.domains?.full_domain || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[lead.status] || "default"}>
                        {lead.status}
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
                          <DropdownMenuItem onClick={() => handleEdit(lead)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(lead.id)}
                            className="text-red-600"
                            disabled={deletingId === lead.id}
                          >
                            {deletingId === lead.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
