"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Key, Mic, Bell, User, Loader2, Check, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useUserSettings,
  useUpdateUserSettings,
  useProfileSettings,
  useUpdateProfileSettings,
} from "@/hooks/useSettings";

export default function SettingsPage() {
  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    anthropic_api_key: "",
    elevenlabs_api_key: "",
    slybroadcast_email: "",
    slybroadcast_password: "",
    resend_api_key: "",
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    escalation_email: "danmakesthings@gmail.com",
    daily_digest: true,
    reply_alerts: true,
    cost_alerts: false,
    cost_alert_threshold: 100,
  });

  // Profile state
  const [profile, setProfile] = useState({
    display_name: "",
    sender_email: "",
    sender_phone: "",
  });

  // Hooks
  const { data: userSettings, isLoading: settingsLoading } = useUserSettings();
  const { data: notificationPrefs, isLoading: notificationsLoading } = useNotificationPreferences();
  const { data: profileData, isLoading: profileLoading } = useProfileSettings();

  const updateSettings = useUpdateUserSettings();
  const updateNotifications = useUpdateNotificationPreferences();
  const updateProfile = useUpdateProfileSettings();

  // Load data into state when available
  useEffect(() => {
    if (userSettings) {
      setApiKeys({
        anthropic_api_key: userSettings.anthropic_api_key || "",
        elevenlabs_api_key: userSettings.elevenlabs_api_key || "",
        slybroadcast_email: userSettings.slybroadcast_email || "",
        slybroadcast_password: userSettings.slybroadcast_password || "",
        resend_api_key: userSettings.resend_api_key || "",
      });
    }
  }, [userSettings]);

  useEffect(() => {
    if (notificationPrefs) {
      setNotifications({
        escalation_email: notificationPrefs.escalation_email || "danmakesthings@gmail.com",
        daily_digest: notificationPrefs.daily_digest ?? true,
        reply_alerts: notificationPrefs.reply_alerts ?? true,
        cost_alerts: notificationPrefs.cost_alerts ?? false,
        cost_alert_threshold: notificationPrefs.cost_alert_threshold || 100,
      });
    }
  }, [notificationPrefs]);

  useEffect(() => {
    if (profileData) {
      setProfile({
        display_name: profileData.display_name || "",
        sender_email: profileData.sender_email || "",
        sender_phone: profileData.sender_phone || "",
      });
    }
  }, [profileData]);

  const handleSaveApiKeys = async () => {
    try {
      await updateSettings.mutateAsync(apiKeys);
      toast.success("API keys saved successfully");
    } catch {
      toast.error("Failed to save API keys");
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateNotifications.mutateAsync(notifications);
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save notification preferences");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(profile);
      toast.success("Profile saved successfully");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const isLoading = settingsLoading || notificationsLoading || profileLoading;

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
                Enter your API keys for external services. Keys are stored securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Claude API */}
                  <div className="space-y-2">
                    <Label htmlFor="anthropic">Claude API Key (Anthropic)</Label>
                    <Input
                      id="anthropic"
                      type="password"
                      placeholder="sk-ant-..."
                      value={apiKeys.anthropic_api_key}
                      onChange={(e) => setApiKeys({ ...apiKeys, anthropic_api_key: e.target.value })}
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
                      value={apiKeys.elevenlabs_api_key}
                      onChange={(e) => setApiKeys({ ...apiKeys, elevenlabs_api_key: e.target.value })}
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
                        value={apiKeys.slybroadcast_email}
                        onChange={(e) => setApiKeys({ ...apiKeys, slybroadcast_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slybroadcastPassword">Slybroadcast Password</Label>
                      <Input
                        id="slybroadcastPassword"
                        type="password"
                        placeholder="Your Slybroadcast password"
                        value={apiKeys.slybroadcast_password}
                        onChange={(e) => setApiKeys({ ...apiKeys, slybroadcast_password: e.target.value })}
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
                      value={apiKeys.resend_api_key}
                      onChange={(e) => setApiKeys({ ...apiKeys, resend_api_key: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for email delivery. Get your key at{" "}
                      <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        resend.com
                      </a>
                    </p>
                  </div>

                  <Button onClick={handleSaveApiKeys} disabled={updateSettings.isPending}>
                    {updateSettings.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Save API Keys
                  </Button>
                </>
              )}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="escalationEmail">Escalation Email</Label>
                    <Input
                      id="escalationEmail"
                      type="email"
                      value={notifications.escalation_email}
                      onChange={(e) => setNotifications({ ...notifications, escalation_email: e.target.value })}
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
                      <Switch
                        checked={notifications.daily_digest}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, daily_digest: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Reply Alerts</div>
                        <div className="text-sm text-muted-foreground">
                          Get notified immediately when a prospect replies
                        </div>
                      </div>
                      <Switch
                        checked={notifications.reply_alerts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, reply_alerts: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Cost Alerts</div>
                        <div className="text-sm text-muted-foreground">
                          Get notified when spending exceeds threshold
                        </div>
                      </div>
                      <Switch
                        checked={notifications.cost_alerts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, cost_alerts: checked })}
                      />
                    </div>

                    {notifications.cost_alerts && (
                      <div className="space-y-2 pl-4 border-l-2">
                        <Label htmlFor="costThreshold">Cost Alert Threshold ($)</Label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="costThreshold"
                            type="number"
                            min={1}
                            max={10000}
                            value={notifications.cost_alert_threshold}
                            onChange={(e) => setNotifications({ ...notifications, cost_alert_threshold: parseInt(e.target.value) || 100 })}
                            className="w-32"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Alert when monthly spend exceeds this amount
                        </p>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleSaveNotifications} disabled={updateNotifications.isPending}>
                    {updateNotifications.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Save Preferences
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account information and sender details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="Your name"
                      value={profile.display_name}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Default Sender Email</Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      placeholder="sales@yourdomain.com"
                      value={profile.sender_email}
                      onChange={(e) => setProfile({ ...profile, sender_email: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used as the &quot;From&quot; address in outgoing emails
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderPhone">Callback Phone Number</Label>
                    <Input
                      id="senderPhone"
                      placeholder="+1 (555) 123-4567"
                      value={profile.sender_phone}
                      onChange={(e) => setProfile({ ...profile, sender_phone: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used as the callback number in voicemails
                    </p>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Save Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
