"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useDomains, useCreateDomain, useUpdateDomain, useDeleteDomain } from "@/hooks/useDomains";
import { useJobsStore, type LeadScrapingJob } from "@/stores/useJobsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Globe, MoreHorizontal, Pencil, Trash2, ExternalLink, Loader2, Search } from "lucide-react";
import { FindLeadsDialog } from "@/components/FindLeadsDialog";
import type { Domain } from "@/types/database";

const domainSchema = z.object({
  name: z.string().min(1, "Domain name is required").max(253),
  tld: z.string().min(1, "TLD is required").max(63),
  buy_now_price: z.string(),
  floor_price: z.string(),
  landing_page_url: z.string(),
  status: z.enum(["available", "sold", "reserved", "expired"]),
});

type DomainFormData = z.infer<typeof domainSchema>;

export default function DomainsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [findLeadsFor, setFindLeadsFor] = useState<Domain | null>(null);
  const [resumeJobId, setResumeJobId] = useState<string | null>(null);

  const { data: domains = [], isLoading, error } = useDomains();

  // Listen for jobs that should be reopened
  const reopenJobId = useJobsStore((state) => state.reopenJobId);
  const jobs = useJobsStore((state) => state.jobs);
  const clearReopenJob = useJobsStore((state) => state.clearReopenJob);

  useEffect(() => {
    if (reopenJobId) {
      const job = jobs.get(reopenJobId) as LeadScrapingJob | undefined;
      if (job) {
        // Find the domain by matching the job's domainName
        const domain = domains.find(
          (d) => d.full_domain === job.domainName || d.name === job.domainName
        );
        if (domain) {
          setFindLeadsFor(domain);
          setResumeJobId(reopenJobId);
        }
      }
      clearReopenJob();
    }
  }, [reopenJobId, jobs, domains, clearReopenJob]);
  const createDomain = useCreateDomain();
  const updateDomain = useUpdateDomain();
  const deleteDomain = useDeleteDomain();

  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      name: "",
      tld: "com",
      buy_now_price: "",
      floor_price: "",
      landing_page_url: "",
      status: "available",
    },
  });

  const onSubmit = async (data: DomainFormData) => {
    try {
      const buyNowPrice = data.buy_now_price ? parseFloat(data.buy_now_price) : null;
      const floorPrice = data.floor_price ? parseFloat(data.floor_price) : null;

      const payload = {
        name: data.name.toLowerCase().trim(),
        tld: data.tld.toLowerCase().replace(/^\./, "").trim(),
        buy_now_price: buyNowPrice && !isNaN(buyNowPrice) ? buyNowPrice : null,
        floor_price: floorPrice && !isNaN(floorPrice) ? floorPrice : null,
        landing_page_url: data.landing_page_url || null,
        status: data.status,
      };

      if (editingDomain) {
        await updateDomain.mutateAsync({ id: editingDomain.id, ...payload });
        toast.success("Domain updated successfully");
        setEditingDomain(null);
      } else {
        await createDomain.mutateAsync(payload);
        toast.success("Domain added successfully");
        setIsCreateOpen(false);
      }
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save domain");
    }
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    form.reset({
      name: domain.name,
      tld: domain.tld,
      buy_now_price: domain.buy_now_price?.toString() || "",
      floor_price: domain.floor_price?.toString() || "",
      landing_page_url: domain.landing_page_url || "",
      status: domain.status as "available" | "sold" | "reserved" | "expired",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDomain.mutateAsync(id);
      toast.success("Domain deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete domain");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setEditingDomain(null);
    form.reset();
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    available: "default",
    sold: "secondary",
    reserved: "outline",
    expired: "destructive",
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load domains</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
          <p className="text-muted-foreground">
            Manage your domain portfolio
          </p>
        </div>
        <Dialog open={isCreateOpen || !!editingDomain} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDomain ? "Edit Domain" : "Add New Domain"}</DialogTitle>
              <DialogDescription>
                {editingDomain ? "Update domain details" : "Add a domain to your portfolio"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Domain Name</Label>
                  <Input
                    id="name"
                    placeholder="example"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tld">TLD</Label>
                  <Input
                    id="tld"
                    placeholder="com"
                    {...form.register("tld")}
                  />
                  {form.formState.errors.tld && (
                    <p className="text-xs text-red-500">{form.formState.errors.tld.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buy_now_price">Buy-It-Now Price ($)</Label>
                  <Input
                    id="buy_now_price"
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    {...form.register("buy_now_price")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor_price">Floor Price ($)</Label>
                  <Input
                    id="floor_price"
                    type="number"
                    step="0.01"
                    placeholder="1000"
                    {...form.register("floor_price")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="landing_page_url">Spaceship Landing Page URL</Label>
                <Input
                  id="landing_page_url"
                  placeholder="https://spaceship.com/..."
                  {...form.register("landing_page_url")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as DomainFormData["status"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
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
                  disabled={createDomain.isPending || updateDomain.isPending}
                >
                  {(createDomain.isPending || updateDomain.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingDomain ? "Update Domain" : "Add Domain"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Domains table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
          <CardDescription>
            {domains.length} domain{domains.length !== 1 ? "s" : ""} in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : domains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No domains yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first domain to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Buy-It-Now</TableHead>
                  <TableHead>Floor Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Landing Page</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">
                      {domain.full_domain}
                    </TableCell>
                    <TableCell>
                      {domain.buy_now_price
                        ? `$${domain.buy_now_price.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {domain.floor_price
                        ? `$${domain.floor_price.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[domain.status] || "default"}>
                        {domain.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {domain.landing_page_url ? (
                        <a
                          href={domain.landing_page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(domain)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFindLeadsFor(domain)}>
                            <Search className="mr-2 h-4 w-4" />
                            Find Leads
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(domain.id)}
                            className="text-red-600"
                            disabled={deletingId === domain.id}
                          >
                            {deletingId === domain.id ? (
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

      {/* Find Leads Dialog */}
      <FindLeadsDialog
        domain={findLeadsFor}
        open={!!findLeadsFor}
        onClose={() => {
          setFindLeadsFor(null);
          setResumeJobId(null);
        }}
        resumeJobId={resumeJobId || undefined}
      />
    </div>
  );
}
