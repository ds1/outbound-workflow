"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Mail, Phone, FileText } from "lucide-react";

export default function TemplatesPage() {
  const [emailTemplates] = useState<Array<{
    id: string;
    name: string;
    subject: string;
    isActive: boolean;
  }>>([]);

  const [voicemailTemplates] = useState<Array<{
    id: string;
    name: string;
    audioDurationSeconds: number | null;
    isActive: boolean;
  }>>([]);

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
                  {emailTemplates.length} templates available
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Email Template
              </Button>
            </CardHeader>
            <CardContent>
              {emailTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No email templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create templates with variable placeholders for personalized outreach
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {emailTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="truncate">
                          {template.subject}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
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
                  {voicemailTemplates.length} templates available
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Voicemail Template
              </Button>
            </CardHeader>
            <CardContent>
              {voicemailTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No voicemail templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create scripts that will be converted to audio using AI voice synthesis
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {voicemailTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription>
                          {template.audioDurationSeconds
                            ? `${template.audioDurationSeconds}s audio`
                            : "No audio generated"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
