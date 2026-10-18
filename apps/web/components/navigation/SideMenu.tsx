"use client";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import Logo from "./Logo";
import { useAppDispatch, useAppSelector } from "@/store";
import { setBooleanState } from "@/store/global.slice";

const SideMenu = () => {
  const sidemenu = useAppSelector((store) => store.globalStore.sidemenu);
  const dispatch = useAppDispatch();
  return (
    <Sheet
      open={sidemenu}
      onOpenChange={(val) =>
        dispatch(setBooleanState({ name: "sidemenu", value: val }))
      }
    >
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 px-0 text-base hover:bg-transparent focus:ring-2"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        allowPointerDismissal
        side="left"
        className="w-[300px] sm:w-[400px] p-0"
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <nav className="px-6"></nav>
      </SheetContent>
    </Sheet>
  );
};

export default SideMenu;
