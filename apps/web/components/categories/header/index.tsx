"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import PlusIcon from "@/components/icons/PlusIcon";
import { showModal } from "@/store/categories/form.slice";
import { useAppSelector } from "@/store";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { setSearchTerm } from "@/store/categories/data.slice";

const Header = () => {
  const [search, setSearch] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const dispatch = useDispatch();
  const total = useAppSelector((store) => store.categoryStore.dataStore.total);

  React.useEffect(() => {
    const debounceId = setTimeout(() => dispatch(setSearchTerm(query)), 400);
    return () => clearTimeout(debounceId);
  }, [query, dispatch]);

  return (
    <HeaderWrapper title="Categories" tagline={`${total} items`}>
      <div
        className={cn("flex items-center gap-1", search && "w-full xl:w-1/2")}
      >
        {search && (
          <React.Fragment>
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
    </HeaderWrapper>
  );
};

export default Header;
