import React from "react";
import DeleteModal from "./DeleteModal";
import EditModal from "./EditModal";

const ProductGlobalModals = () => {
  return (
    <React.Fragment>
      <DeleteModal />
      <EditModal />
    </React.Fragment>
  );
};

export default ProductGlobalModals;
