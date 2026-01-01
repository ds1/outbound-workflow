"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Globe } from "lucide-react";

export default function DomainsPage() {
  const [domains] = useState<Array<{
    id: string;
    name: string;
    tld: string;
    buyNowPrice: number;
    floorPrice: number;
    status: string;
  }>>([]);

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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
              <DialogDescription>
                Add a domain to your portfolio
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Domain Name</Label>
                  <Input id="name" placeholder="example" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tld">TLD</Label>
                  <Input id="tld" placeholder="com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyNowPrice">Buy-It-Now Price ($)</Label>
                  <Input id="buyNowPrice" type="number" placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floorPrice">Floor Price ($)</Label>
                  <Input id="floorPrice" type="number" placeholder="1000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="landingUrl">Spaceship Landing Page URL</Label>
                <Input id="landingUrl" placeholder="https://spaceship.com/..." />
              </div>
              <Button type="submit" className="w-full">
                Add Domain
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Domains table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
          <CardDescription>
            {domains.length} domains in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">
                      {domain.name}.{domain.tld}
                    </TableCell>
                    <TableCell>${domain.buyNowPrice.toLocaleString()}</TableCell>
                    <TableCell>${domain.floorPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={domain.status === "available" ? "default" : "secondary"}>
                        {domain.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
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
