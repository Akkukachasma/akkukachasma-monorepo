"use client";
import React from "react";
import LensDetail from "./LensDetail";
import { Button, ProcessIndicator } from "../ui/button";
import useLensDetails from "@/lib/queries/admin/lens-details/useLensDetails";
import { useAppDispatch, useAppSelector } from "@/store";
import { Cross2Icon } from "@radix-ui/react-icons";
import { setSearchTerm } from "@/store/lens-details/data.slice";
import ShowingResults from "../ShowingResults";

const LensDetailList = () => {
  const search_term = useAppSelector(
    (store) => store.lensDetailStore.dataStore.search_term,
  );
  const dispatch = useAppDispatch();
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    useLensDetails();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <LensDetail />
        <LensDetail />
        <LensDetail />
        <LensDetail />
        <LensDetail />
        <LensDetail />
      </div>
    );
  }

  return (
    <React.Fragment>
      <ShowingResults
        query={search_term.query_string}
        onClose={() => dispatch(setSearchTerm(""))}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data?.map((d) => {
          return <LensDetail key={d.id} data={d} />;
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
    </React.Fragment>
  );
};

export default LensDetailList;
