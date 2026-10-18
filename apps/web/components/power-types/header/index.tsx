"use client";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import AdminHeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import PlusIcon from "@/components/icons/PlusIcon";
import { showModal } from "@/store/power-types/form.slice";

const HeaderButton = () => {
  const dispatch = useDispatch();
  return (
    <AdminHeaderWrapper title="Power Types">
      <Button onClick={() => dispatch(showModal(true))} className="gap-2">
        <PlusIcon />
        Add New
      </Button>
    </AdminHeaderWrapper>
  );
};

export default HeaderButton;
