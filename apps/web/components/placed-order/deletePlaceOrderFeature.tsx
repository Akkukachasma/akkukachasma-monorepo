"use client";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store"
import { showDeletePlaceOrder } from "@/store/placed-order/modal.slice";


const DeletePlaceOrderFeature:React.FC=()=>{

    const dispatch=useAppDispatch();
    const delete_modal=useAppSelector((store)=> store.placeOrderStore.modalStore.delete_modal);
    return(
        <Modal open={delete_modal} onOpenChange={(val) => dispatch(showDeletePlaceOrder(val))}>
<DialogHeader>
        <DialogTitle>Delete Feature</DialogTitle> {/* Changed title to match delete purpose */}
        <DialogDescription>
          Are you sure you want to delete this feature? This action cannot be undone.
        </DialogDescription> {/* Updated description to reflect delete action */}
      </DialogHeader>
      <DialogFooter>
        <Button 
          variant="destructive" 
          onClick={() => {
            // Handle the delete action here
            console.log("Feature deleted");
            dispatch(showDeletePlaceOrder(false)); // Close modal after deletion
          }}
        >
          Confirm Delete
        </Button>
        <Button onClick={() => dispatch(showDeletePlaceOrder(false))}>
          Cancel
        </Button>
      </DialogFooter>
        </Modal>
    )

}
export default DeletePlaceOrderFeature