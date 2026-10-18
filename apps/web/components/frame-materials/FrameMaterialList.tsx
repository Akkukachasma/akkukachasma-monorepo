"use client";
import { Button, ProcessIndicator } from "../ui/button";
import FrameMaterial from "./FrameMaterial";
import useFrameMaterials from "@/lib/queries/admin/frame-materials/useFrameMaterials";

const FrameMaterialList = () => {
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
  useFrameMaterials();
 console.log(data);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        <FrameMaterial />
        <FrameMaterial />
        <FrameMaterial />
        <FrameMaterial />
        <FrameMaterial />
        <FrameMaterial />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {data?.map((d) => {
        return <FrameMaterial key={d.id} data={d} />;
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

export default FrameMaterialList;
