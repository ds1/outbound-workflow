"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Mic, Bell, User } from "lucide-react";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    anthropic: "",
    elevenlabs: "",
    slybroadcastEmail: "",
    slybroadcastPassword: "",
    resend: "",
  });

  const [notifications, setNotifications] = useState({
    escalationEmail: "danmakesthings@gmail.com",
    dailyDigest: true,
    replyAlerts: true,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your automation settings and API keys
        </p>
      </div>

      {/* Settings tabs */}
      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="h-4 w-4" />
            Voice Clones
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* API Keys */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Enter your API keys for external services. Keys are encrypted at rest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Claude API */}
              <div className="space-y-2">
                <Label htmlFor="anthropic">Claude API Key (Anthropic)</Label>
                <Input
                  id="anthropic"
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKeys.anthropic}
                  onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Used for AI content generation. Get your key at{" "}
                  <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    console.anthropic.com
                  </a>
                </p>
              </div>

              {/* ElevenLabs */}
              <div className="space-y-2">
                <Label htmlFor="elevenlabs">ElevenLabs API Key</Label>
                <Input
                  id="elevenlabs"
                  type="password"
                  placeholder="Your ElevenLabs API key"
                  value={apiKeys.elevenlabs}
                  onChange={(e) => setApiKeys({ ...apiKeys, elevenlabs: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Used for voice synthesis. Get your key at{" "}
                  <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    elevenlabs.io
                  </a>
                </p>
              </div>

              {/* Slybroadcast */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slybroadcastEmail">Slybroadcast Email</Label>
                  <Input
                    id="slybroadcastEmail"
                    type="email"
                    placeholder="your-email@example.com"
                    value={apiKeys.slybroadcastEmail}
                    onChange={(e) => setApiKeys({ ...apiKeys, slybroadcastEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slybroadcastPassword">Slybroadcast Password</Label>
                  <Input
                    id="slybroadcastPassword"
                    type="password"
                    placeholder="Your Slybroadcast password"
                    value={apiKeys.slybroadcastPassword}
                    onChange={(e) => setApiKeys({ ...apiKeys, slybroadcastPassword: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for ringless voicemail drops. Sign up at{" "}
                  <a href="https://slybroadcast.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    slybroadcast.com
                  </a>
                </p>
              </div>

              {/* Resend */}
              <div className="space-y-2">
                <Label htmlFor="resend">Resend API Key</Label>
                <Input
                  id="resend"
                  type="password"
                  placeholder="re_..."
                  value={apiKeys.resend}
                  onChange={(e) => setApiKeys({ ...apiKeys, resend: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Used for email delivery. Get your key at{" "}
                  <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    resend.com
                  </a>
                </p>
              </div>

              <Button>Save API Keys</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Clones */}
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Clones</CardTitle>
              <CardDescription>
                Upload audio samples to create voice clones for personalized voicemails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                <Mic className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No voice clones yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Upload at least 1 minute of clear audio to clone your voice.
                  Supported formats: MP3, WAV, M4A
                </p>
                <Button>
                  Upload Audio Sample
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="escalationEmail">Escalation Email</Label>
                <Input
                  id="escalationEmail"
                  type="email"
                  value={notifications.escalationEmail}
                  onChange={(e) => setNotifications({ ...notifications, escalationEmail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Receive notifications when escalation triggers are activated
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Daily Digest</div>
                    <div className="text-sm text-muted-foreground">
                      Receive a daily summary of campaign activity
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.dailyDigest}
                    onChange={(e) => setNotifications({ ...notifications, dailyDigest: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Reply Alerts</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified immediately when a prospect replies
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.replyAlerts}
                    onChange={(e) => setNotifications({ ...notifications, replyAlerts: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Default Sender Email</Label>
                <Input id="senderEmail" type="email" placeholder="sales@yourdomain.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Callback Phone Number</Label>
                <Input id="senderPhone" placeholder="+1 (555) 123-4567" />
              </div>
              <Button>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
