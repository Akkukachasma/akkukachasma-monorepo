"use client";

import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/notifications/useNotificationPreferences";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationSettingsPage() {
  const { data, isLoading } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  if (isLoading || !data) {
    return (
      <div className="max-w-md space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Notification channels</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Control how we reach you for order updates and account alerts. In-app updates
          appear on the site when you are signed in.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="pref-email">Email</Label>
          <p className="text-xs text-muted-foreground">
            Receive transactional emails (order confirmed, shipped, etc.)
          </p>
        </div>
        <Switch
          id="pref-email"
          checked={data.email}
          disabled={update.isPending}
          onCheckedChange={(checked) => update.mutate({ email: checked })}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="pref-inapp">In-app</Label>
          <p className="text-xs text-muted-foreground">
            Real-time list and optional browser notifications while you use the site
          </p>
        </div>
        <Switch
          id="pref-inapp"
          checked={data.in_app}
          disabled={update.isPending}
          onCheckedChange={(checked) => update.mutate({ in_app: checked })}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
        <div className="space-y-0.5">
          <Label>SMS / WhatsApp</Label>
          <p className="text-xs text-muted-foreground">Coming later — not used yet.</p>
        </div>
        <Switch checked={data.phone} disabled aria-readonly />
      </div>
    </div>
  );
}
