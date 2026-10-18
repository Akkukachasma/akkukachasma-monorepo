"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/hooks/use-toast";
import {
  useGetCompanyInfo,
  useUpdateCompanyInfo,
} from "@/features/admin/company-info";

const DeliveryPreferencesPage = () => {
  const { data: companyInfo, isLoading } = useGetCompanyInfo();
  const updateCompanyInfo = useUpdateCompanyInfo();

  const codEnabled = companyInfo?.cod_enabled ?? true;

  const onToggleCod = (checked: boolean) => {
    if (!companyInfo?.id) {
      toast({
        variant: "destructive",
        description: "Please configure company information first.",
      });
      return;
    }
    updateCompanyInfo.mutate({
      id: companyInfo.id,
      data: { cod_enabled: checked },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Delivery Preferences</h2>
        <p className="text-gray-600">
          Control delivery/payment options customers can choose at checkout.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash on Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="cod_enabled">Accept COD orders</Label>
              <p className="text-xs text-muted-foreground">
                If disabled, COD is hidden on checkout and COD API flows are blocked.
              </p>
            </div>
            <Switch
              id="cod_enabled"
              checked={codEnabled}
              disabled={updateCompanyInfo.isPending}
              onCheckedChange={onToggleCod}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryPreferencesPage;
