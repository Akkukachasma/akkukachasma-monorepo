"use client";
import usePowerTypes from "@/lib/queries/admin/power-types/usePowerTypes";
import PowerType from "./PowerType";
import { Button, ProcessIndicator } from "../ui/button";

const PoweerTypeList = () => {
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    usePowerTypes();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        <PowerType />
        <PowerType />
        <PowerType />
        <PowerType />
        <PowerType />
        <PowerType />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {data?.map((d) => {
        return <PowerType key={d.id} data={d} />;
      })}

      {hasNextPage && (
        <div className="min-h-24 grid place-content-center">
          <Button
            type="button"
            disabled={isFetching}
            variant="ghost"
            onClick={() => (isFetching ? null : fetchNextPage())}
          >
            <ProcessIndicator isProcessing={isFetching} btnText="Load more" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PoweerTypeList;
