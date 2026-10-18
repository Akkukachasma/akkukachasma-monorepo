"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import {
  showEditPlaceOrder,
  showDeletePlaceOrder,
} from "@/store/placed-order/modal.slice";
import { useAppDispatch } from "@/store";

const TableData = () => {
  const dispatch = useAppDispatch();
  return (
    <>
      <div className="app-container mx-auto px-4 pt-2">
        <div className="  rounded my-6 overflow-x-auto">
          <table className="ak-table" style={{ borderSpacing: "0px 10px" }}>
            <thead>
              <tr>
                <th>Order Date</th>
                <th>Order Id</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Mobile</th>
                <th>Prescription</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div>06/21/2024 10:01 pm</div>
                </td>
                <td>
                  <div>1</div>
                </td>
                <td>
                  <div>John Doe</div>
                </td>
                <td>
                  <div>1000</div>
                </td>
                <td>
                  <div>354554-38374</div>
                </td>
                <td>
                  <div>No</div>
                </td>
                <td>
                  <div className=" justify-center">
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      title="View"
                      onClick={() => dispatch(showEditPlaceOrder(true))}
                    >
                      <FaRegEdit className="w-5 h-5 text-green-500" />
                    </Button>
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      title="Delete"
                      onClick={() => dispatch(showDeletePlaceOrder(true))}
                    >
                      <MdDelete className="w-5 h-5 text-red-1000" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TableData;
