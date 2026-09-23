import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";
import { Eye } from "lucide-react";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    setOpenDetailsDialog(true);
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user?.id));
    }
  }, [dispatch, user?.id]);

  return (
    <Card className="bg-white border border-[#E5E5E5] shadow-xs rounded-none overflow-hidden">
      <CardHeader className="bg-[#FAF9F6] border-b border-[#E5E5E5] py-4 px-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-display uppercase tracking-widest text-[#111111]">
            Order History & Acquisitions
          </CardTitle>
          <p className="text-xs text-[#767676] font-sans mt-0.5">
            {orderList?.length || 0} registered order{orderList?.length === 1 ? "" : "s"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[720px]">
            <TableHeader className="bg-[#FAF9F6]/80 border-b border-[#E5E5E5]">
              <TableRow>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#555555] py-3.5">Order Reference</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#555555]">Order Date</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#555555]">Items & Sizes</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#555555]">Order Status</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#555555]">Total Price</TableHead>
                <TableHead className="text-right pr-6 font-mono text-[11px] uppercase tracking-wider text-[#555555]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList && orderList.length > 0 ? (
                orderList.map((orderItem) => (
                  <TableRow key={orderItem?._id} className="hover:bg-[#FAF9F6]/60 transition-colors border-b border-[#F0F0F0]">
                    <TableCell className="font-mono text-xs font-semibold text-[#111111]">
                      #{orderItem?._id}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#666666]">
                      {orderItem?.orderDate ? orderItem.orderDate.split("T")[0] : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 max-w-[260px]">
                        {orderItem?.cartItems && orderItem?.cartItems.length > 0 ? (
                          orderItem.cartItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs">
                              <span className="font-medium text-[#111111] truncate max-w-[140px]" title={item.title}>
                                {item.title}
                              </span>
                              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#111111] text-white rounded">
                                {item.size || "M"}
                              </span>
                              <span className="text-[#767676] font-mono text-[11px]">
                                ×{item.quantity}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-[#999999] font-mono">No items</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 font-mono text-[11px] font-bold uppercase rounded-none ${
                          orderItem?.orderStatus === "confirmed"
                            ? "bg-emerald-700 text-white"
                            : orderItem?.orderStatus === "delivered"
                            ? "bg-blue-700 text-white"
                            : orderItem?.orderStatus === "rejected"
                            ? "bg-rose-700 text-white"
                            : "bg-[#111111] text-white"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-sm text-[#111111]">
                      ${orderItem?.totalAmount}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs font-medium bg-[#111111] text-white hover:bg-black transition-all flex items-center gap-1.5 ml-auto rounded-none cursor-pointer"
                        onClick={() => handleFetchOrderDetails(orderItem?._id)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-[#767676]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-mono text-xs uppercase tracking-widest text-[#767676]">
                        No orders registered under this account yet.
                      </p>
                      <p className="text-xs text-[#999999] max-w-sm">
                        When you acquire pieces from the atelier, your receipts and order tracking will appear here.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog
        open={openDetailsDialog}
        onOpenChange={(open) => {
          setOpenDetailsDialog(open);
          if (!open) {
            dispatch(resetOrderDetails());
          }
        }}
      >
        <ShoppingOrderDetailsView orderDetails={orderDetails} />
      </Dialog>
    </Card>
  );
}

export default ShoppingOrders;
