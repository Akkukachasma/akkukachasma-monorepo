"use client";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import PlusIcon from "@/components/icons/PlusIcon";
import { showModal } from "@/store/lens-features/form.slice";

const HeaderButton = () => {
  const dispatch = useDispatch();
  return (
    <HeaderWrapper title="Lens Features" tagline="Manage lens features">
      <Button onClick={() => dispatch(showModal(true))} className="gap-2">
        <PlusIcon />
        Add New
      </Button>
    </HeaderWrapper>
  );
};

export default HeaderButton;
