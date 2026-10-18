"use client";
import React from "react";
import { Button } from "../ui/button";
import { ChevronRight, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Link from "next/link";

const SearchPanel = () => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <React.Fragment>
      <Button
        variant="outline"
        onClick={() => setIsSearchOpen(true)}
        title="⌘ + K"
        className="px-2 lg:min-w-32 inline-flex items-center gap-2 justify-start"
      >
        <Search className="h-4 w-4" />
        <span className="font-normal text-sm hidden lg:inline-block">
          Search eyeglasses...
        </span>
        <kbd className="ml-2 h-5 inline-flex select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-sm">⌘</span> <span>K</span>
        </kbd>
      </Button>
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput placeholder="Search for frames, sunglasses, lenses... (ESC to close)" />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center py-4">
              <Search className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No results found.
              </p>
            </div>
          </CommandEmpty>
          <CommandGroup heading="Quick Links">
            <CommandItem className="cursor-pointer" asChild>
              <Link href="/shapes/aviator">
                <ChevronRight className="mr-2 h-4 w-4" />
                Aviator glasses
              </Link>
            </CommandItem>
            <CommandItem className="cursor-pointer" asChild>
              <Link href="/categories/kids-glasses">
                <ChevronRight className="mr-2 h-4 w-4" />
                Kids glasses
              </Link>
            </CommandItem>
            <CommandItem className="cursor-pointer" asChild>
              <Link href="/shapes/wayfarer">
                <ChevronRight className="mr-2 h-4 w-4" />
                Wayfarer glasses
              </Link>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </React.Fragment>
  );
};
export default SearchPanel;
