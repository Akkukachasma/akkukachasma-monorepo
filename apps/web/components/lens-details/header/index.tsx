"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import PageHeader from "@/components/PageHeader";
import PlusIcon from "@/components/icons/PlusIcon";
import AdminHeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import { showModal } from "@/store/lens-details/form.slice";
import { useAppSelector } from "@/store";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  buildQueryString,
  setSearchTerm,
} from "@/store/lens-details/data.slice";

const Header = () => {
  const [search, setSearch] = React.useState(false);
  const dispatch = useDispatch();
  const { total, search_term } = useAppSelector(
    (store) => store.lensDetailStore.dataStore,
  );

  const handleSearchInput = (val: string) => {
    dispatch(setSearchTerm(val));
  };

  React.useEffect(() => {
    const debounceId = setTimeout(
      () => dispatch(buildQueryString(search_term.query)),
      400,
    );
    return () => clearTimeout(debounceId);
  }, [search_term.query, dispatch]);

  return (
    <AdminHeaderWrapper title="Lens Details" tagline={`${total} items`}>
      <div
        className={cn("flex items-center gap-1", search && "w-full xl:w-1/2")}
      >
        {search && (
          <React.Fragment>
            <Input
              placeholder="Search..."
              value={search_term.query}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
            <Button
              type="button"
              onClick={() => setSearch(false)}
              variant="ghost"
              size="icon"
            >
              <Cross2Icon className="size-[20px]" />
            </Button>
          </React.Fragment>
        )}

        {!search && (
          <React.Fragment>
            <Button
              type="button"
              onClick={() => setSearch(true)}
              variant="ghost"
              size="icon"
            >
              <MagnifyingGlassIcon className="size-[20px]" />
            </Button>
            <Button onClick={() => dispatch(showModal(true))} className="gap-2">
              <PlusIcon />
              Add New
            </Button>
          </React.Fragment>
        )}
      </div>
    </AdminHeaderWrapper>
  );
};

export default Header;
