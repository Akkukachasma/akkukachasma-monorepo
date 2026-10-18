"use client";

import React, { useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import { useGetActivities } from "@/features/admin/activities";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { EmptyState } from "@/components/empty-state";
import { Activity as ActivityIcon } from "lucide-react";
import ActivityDetailModal from "./ActivityDetailModal";
import type { Activity } from "../queries/useGetActivities";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ListFilters {
  search_term?: string;
  sort_by?: string;
  type?: string;
  page_size?: number;
}

interface ActivitiesListProps {
  filters: ListFilters;
}

const TYPE_STYLES: Record<string, string> = {
  INFO: "bg-slate-100 text-slate-700 border-slate-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ERROR: "bg-red-50 text-red-700 border-red-200",
  WARNING: "bg-amber-50 text-amber-700 border-amber-200",
  ALERT: "bg-orange-50 text-orange-700 border-orange-200",
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const ActivityRow = forwardRef<
  HTMLButtonElement,
  {
    activity: Activity;
    typeStyle: string;
    type: string;
    onRowClick: (a: Activity) => void;
    formatDate: (s: string) => string;
  }
>(function ActivityRow({ activity, typeStyle, type, onRowClick, formatDate }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onRowClick(activity)}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 text-left",
        "hover:bg-muted/50 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <span
        className={cn(
          "shrink-0 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
          typeStyle
        )}
      >
        {type}
      </span>
      <span className="flex-1 min-w-0 truncate font-medium text-sm">
        {activity.title ?? "Untitled"}
      </span>
      <div className="hidden sm:flex items-center gap-2 shrink-0 min-w-0">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {(activity.user?.name ?? "S").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground truncate max-w-[180px]">
          {activity.user ? (
            <>
              <span className="font-medium text-foreground">{activity.user.name}</span>
              <span className="mx-1.5">|</span>
              <span>{activity.user.email}</span>
            </>
          ) : (
            <>System | System</>
          )}
        </span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {formatDate(activity.created_at)}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
});

const ActivitiesList = ({ filters }: ActivitiesListProps) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    data,
    total,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetActivities(filters);

  const elementRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    isLoading,
  });

  const handleRowClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load activities</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="space-y-6">

      <div className="space-y-2">
        {!hasData ? (
          <div className="rounded-lg border">
            <EmptyState
              icon={ActivityIcon}
              title="No activities found"
              description="Activities will appear here when APIs log events. Try adjusting your filters."
            />
          </div>
        ) : (
          <div className="rounded-lg border divide-y divide-border overflow-hidden bg-card">
            {data!.map((activity, index) => {
              const type = activity.type ?? "INFO";
              const typeStyle = TYPE_STYLES[type] ?? TYPE_STYLES.INFO;
              const isLast = index === data!.length - 1;
              return (
                <ActivityRow
                  key={activity.id}
                  ref={isLast ? elementRef : undefined}
                  activity={activity}
                  typeStyle={typeStyle}
                  type={type}
                  onRowClick={handleRowClick}
                  formatDate={formatDate}
                />
              );
            })}
          </div>
        )}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <ActivityDetailModal
        activity={selectedActivity}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default ActivitiesList;
