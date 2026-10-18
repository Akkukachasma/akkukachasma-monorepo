import Addresses from "@/components/account/addresses";
import PageWrapper from "@/components/wrappers/PageWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Addresses | Akku Ka Chasma",
};

const AddressesPage = () => {
  return (
    <div className="flex h-full flex-col">
      <PageWrapper className="flex-grow">
        <Addresses />
      </PageWrapper>
    </div>
  );
};

export default AddressesPage;
