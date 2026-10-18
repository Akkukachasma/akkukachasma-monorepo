import Header from "@/components/power-types/header";

import PageWrapper from "@/components/wrappers/PageWrapper";
import AddPowerTypeModal from "@/components/power-types/AddPowerTypeModal";
import DeletePowerTypeModal from "@/components/power-types/DeletePowerTypeModal";
import EditPowerTypeModel from "@/components/power-types/EditPowerTypeModal";

import PoweerTypeList from "@/components/power-types/PowerTypeList";


const Page = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <DeletePowerTypeModal />
      <EditPowerTypeModel />
      <AddPowerTypeModal />
      <Header />
      <PageWrapper>
        <PoweerTypeList />
      </PageWrapper>
    </div>
  );
};

export default Page;
