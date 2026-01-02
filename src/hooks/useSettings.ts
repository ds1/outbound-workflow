"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { NotificationPreferences, UserSetting } from "@/types/database";

// Notification preferences
export function useNotificationPreferences() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        throw error;
      }

      return data as NotificationPreferences | null;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<Omit<NotificationPreferences, "id" | "user_id" | "created_at" | "updated_at">>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upsert preferences
      const { data, error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}

// User settings (for API keys and other settings)
export function useUserSettings() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Convert array to object
      const settings: Record<string, string | null> = {};
      for (const setting of data || []) {
        settings[setting.setting_key] = setting.setting_value;
      }

      return settings;
    },
  });
}

export function useUserSetting(key: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["user-settings", key],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_settings")
        .select("setting_value")
        .eq("user_id", user.id)
        .eq("setting_key", key)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data?.setting_value || null;
    },
  });
}

export function useUpdateUserSetting() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value, isEncrypted = false }: { key: string; value: string | null; isEncrypted?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          setting_key: key,
          setting_value: value,
          is_encrypted: isEncrypted,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,setting_key",
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      queryClient.invalidateQueries({ queryKey: ["user-settings", variables.key] });
    },
  });
}

export function useUpdateUserSettings() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Record<string, string | null>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upsert all settings
      const upsertData = Object.entries(settings).map(([key, value]) => ({
        user_id: user.id,
        setting_key: key,
        setting_value: value,
        is_encrypted: key.toLowerCase().includes("key") || key.toLowerCase().includes("password"),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("user_settings")
        .upsert(upsertData, {
          onConflict: "user_id,setting_key",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });
}

// Profile settings
export interface ProfileSettings {
  display_name: string | null;
  sender_email: string | null;
  sender_phone: string | null;
}

export function useProfileSettings() {
  const { data: settings, isLoading } = useUserSettings();

  const profile: ProfileSettings = {
    display_name: settings?.display_name || null,
    sender_email: settings?.sender_email || null,
    sender_phone: settings?.sender_phone || null,
  };

  return { data: profile, isLoading };
}

export function useUpdateProfileSettings() {
  const updateSettings = useUpdateUserSettings();

  return useMutation({
    mutationFn: async (profile: Partial<ProfileSettings>) => {
      const settings: Record<string, string | null> = {};
      if (profile.display_name !== undefined) settings.display_name = profile.display_name;
      if (profile.sender_email !== undefined) settings.sender_email = profile.sender_email;
      if (profile.sender_phone !== undefined) settings.sender_phone = profile.sender_phone;

      await updateSettings.mutateAsync(settings);
    },
  });
}
