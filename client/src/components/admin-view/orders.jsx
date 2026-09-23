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
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { Eye } from "lucide-react";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(orderItem) {
    const targetId = orderItem?._id || orderItem?.id;
    setSelectedOrderForModal(orderItem);
    setOpenDetailsDialog(true);
    if (targetId) {
      dispatch(getOrderDetailsForAdmin(targetId));
    }
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  return (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50/70 border-b border-gray-200 py-4 px-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
            Customer Orders Management
          </CardTitle>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Total {orderList?.length || 0} order records registered
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-gray-700">Order ID</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-gray-700">Order Date</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-gray-700">Items & Sizes</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-gray-700">Payment Mode</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-gray-700">Payment Status</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-gray-700">Order Status</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-gray-700">Total Price</TableHead>
              <TableHead className="text-right pr-6 font-mono text-xs uppercase tracking-wider text-gray-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0 ? (
              orderList.map((orderItem) => (
                <TableRow key={orderItem?._id} className="hover:bg-gray-50/80 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-gray-900">
                    {orderItem?._id}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">
                    {orderItem?.orderDate ? orderItem.orderDate.split("T")[0] : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 max-w-[260px]">
                      {orderItem?.cartItems && orderItem?.cartItems.length > 0 ? (
                        orderItem.cartItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs">
                            <span className="font-medium text-gray-900 truncate max-w-[140px]" title={item.title}>
                              {item.title}
                            </span>
                            <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#111111] text-white rounded">
                              {item.size || "M"}
                            </span>
                            <span className="text-gray-500 font-mono text-[11px]">
                              x{item.quantity}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 font-mono">No items</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="font-mono text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {orderItem?.payment_mode || orderItem?.paymentMethod || "Razorpay"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`font-mono text-[11px] font-bold py-0.5 px-2 ${
                        orderItem?.payment_status === "Paid via Razorpay" ||
                        orderItem?.paymentStatus === "Paid via Razorpay" ||
                        orderItem?.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {orderItem?.payment_status || orderItem?.paymentStatus || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 font-mono text-[11px] font-bold uppercase ${
                        orderItem?.orderStatus === "confirmed"
                          ? "bg-green-600 text-white"
                          : orderItem?.orderStatus === "delivered"
                          ? "bg-blue-600 text-white"
                          : orderItem?.orderStatus === "rejected"
                          ? "bg-red-600 text-white"
                          : "bg-[#111111] text-white"
                      }`}
                    >
                      {orderItem?.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-sm text-gray-950">
                    ${orderItem?.totalAmount}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs font-medium bg-[#111111] text-white hover:bg-black transition-all flex items-center gap-1.5 ml-auto"
                      onClick={() => handleFetchOrderDetails(orderItem)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500 font-mono text-xs">
                  No orders found in the database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Single Modal Dialog outside the table */}
      <Dialog
        open={openDetailsDialog}
        onOpenChange={(open) => {
          setOpenDetailsDialog(open);
          if (!open) {
            setSelectedOrderForModal(null);
            dispatch(resetOrderDetails());
          }
        }}
      >
        <AdminOrderDetailsView
          orderDetails={orderDetails || selectedOrderForModal}
          onClose={() => setOpenDetailsDialog(false)}
        />
      </Dialog>
    </Card>
  );
}

export default AdminOrdersView;
