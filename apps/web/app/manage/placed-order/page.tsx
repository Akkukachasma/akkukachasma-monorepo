import DeletePlaceOrderFeature from "@/components/placed-order/deletePlaceOrderFeature";
import EditPlaceOrderModel from "@/components/placed-order/EditPlaceOrderFeature";
import Header from "@/components/placed-order/header";
import HeaderNav from "@/components/placed-order/header-nav";
import TableData from "@/components/placed-order/table_data";

const page = () => {
  return (
    <>
      <Header />
      <HeaderNav />
      <TableData />
      <EditPlaceOrderModel />
      <DeletePlaceOrderFeature />
    </>
  );
}
export default page;
