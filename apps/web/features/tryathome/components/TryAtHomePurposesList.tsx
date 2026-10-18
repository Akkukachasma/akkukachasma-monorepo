"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import useGetTryAtHomePurposes from "../queries/useGetTryAtHomePurposes";
import { useAppDispatch } from "@/store";
import {
  setPurposeToEdit,
  setPurposeToDelete,
} from "@/features/tryathome/store";

const TryAtHomePurposesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: purposes, isLoading } = useGetTryAtHomePurposes();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!purposes || purposes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No purposes found. Create your first purpose to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {purposes.map((purpose) => (
        <Card key={purpose.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {purpose.label}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(setPurposeToEdit(purpose))}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(setPurposeToDelete(purpose))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {purpose.requests_count || 0} requests
              </Badge>
              <span className="text-xs text-muted-foreground">
                Created {new Date(purpose.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TryAtHomePurposesList;
