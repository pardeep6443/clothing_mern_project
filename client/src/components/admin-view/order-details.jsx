import { useState, useEffect } from "react";
import CommonForm from "../common/form";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import { Package, User, MapPin, CreditCard, Clock, CheckCircle2 } from "lucide-react";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails, onClose }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    if (orderDetails?.orderStatus) {
      setFormData({ status: orderDetails.orderStatus });
    }
  }, [orderDetails]);

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;
    const targetId = orderDetails?._id || orderDetails?.id;

    if (!targetId || !status) return;

    dispatch(
      updateOrderStatus({ id: targetId, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(targetId));
        dispatch(getAllOrdersForAdmin());
        toast({
          title: data?.payload?.message || "Order status updated successfully",
        });
      }
    });
  }

  const orderId = orderDetails?._id || orderDetails?.id || "ORD";

  return (
    <DialogContent className="w-[94vw] max-w-2xl lg:max-w-3xl bg-white text-gray-950 border border-gray-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
      <DialogHeader className="border-b border-gray-200 pb-4 text-left">
        <div className="flex items-center justify-between gap-2 pr-6">
          <div>
            <DialogTitle className="text-xl font-bold font-sans text-gray-950 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-900" />
              Order Management
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-mono mt-1">
              Reference: #{orderId}
            </DialogDescription>
          </div>
          {orderDetails?.orderStatus && (
            <Badge
              className={`py-1 px-3 text-xs font-mono font-bold uppercase tracking-wider ${
                orderDetails?.orderStatus === "confirmed"
                  ? "bg-green-700 text-white"
                  : orderDetails?.orderStatus === "rejected"
                  ? "bg-red-700 text-white"
                  : orderDetails?.orderStatus === "delivered"
                  ? "bg-blue-700 text-white"
                  : orderDetails?.orderStatus === "inProcess" || orderDetails?.orderStatus === "inShipping"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-900 text-white"
              }`}
            >
              {orderDetails?.orderStatus}
            </Badge>
          )}
        </div>
      </DialogHeader>

      {!orderDetails ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-8 h-8 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
            Fetching order details...
          </p>
        </div>
      ) : (
        <div className="grid gap-6 text-gray-950 font-sans pt-2">
          {/* Metadata Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/90 p-4 rounded-lg border border-gray-200 text-sm">
            <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200/80">
              <span className="font-medium text-xs text-gray-600 uppercase font-mono">Order ID</span>
              <span className="font-mono text-xs font-bold text-gray-950 truncate max-w-[170px]" title={orderId}>
                {orderId}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200/80">
              <span className="font-medium text-xs text-gray-600 uppercase font-mono">Date</span>
              <span className="font-mono text-xs text-gray-950">
                {orderDetails?.orderDate ? orderDetails.orderDate.split("T")[0] : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200/80">
              <span className="font-medium text-xs text-gray-600 uppercase font-mono">Total Price</span>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-gray-950">
                  ${orderDetails?.totalAmount}
                </span>
                {orderDetails?.couponApplied && (
                  <span className="block font-mono text-[10px] text-green-700 font-semibold">
                    Saved ${orderDetails?.discountAmount} ({orderDetails?.couponCode})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200/80">
              <span className="font-medium text-xs text-gray-600 uppercase font-mono">Payment</span>
              <span className="uppercase text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {orderDetails?.payment_mode || orderDetails?.paymentMethod || "Razorpay"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200/80 sm:col-span-2">
              <span className="font-medium text-xs text-gray-600 uppercase font-mono">Payment Status</span>
              <Badge
                className={`font-mono text-xs font-bold py-0.5 px-2.5 ${
                  orderDetails?.payment_status === "Paid via Razorpay" ||
                  orderDetails?.paymentStatus === "Paid via Razorpay" ||
                  orderDetails?.paymentStatus === "paid"
                    ? "bg-green-100 text-green-900 border border-green-300"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                }`}
              >
                {orderDetails?.payment_status || orderDetails?.paymentStatus || "pending"}
              </Badge>
            </div>

            {orderDetails?.razorpay_order_id && (
              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200/80 sm:col-span-2">
                <span className="font-medium text-xs text-gray-600 uppercase font-mono">Razorpay Order ID</span>
                <span className="font-mono text-xs text-gray-800">
                  {orderDetails.razorpay_order_id}
                </span>
              </div>
            )}

            {orderDetails?.razorpay_payment_id && (
              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200/80 sm:col-span-2">
                <span className="font-medium text-xs text-gray-600 uppercase font-mono">Razorpay Payment ID</span>
                <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {orderDetails.razorpay_payment_id}
                </span>
              </div>
            )}
          </div>

          {/* Ordered Line Items with Sizes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-gray-700" />
                Ordered Items & Sizes
              </div>
              <span className="text-xs font-mono text-gray-500">
                {orderDetails?.cartItems?.length || 0} line items
              </span>
            </div>

            <ul className="grid gap-2.5">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
                orderDetails?.cartItems.map((item, index) => (
                  <li
                    key={`${item.productId?._id || item.productId || item._id || "item"}_${item.size || "M"}_${index}`}
                    className="flex items-center justify-between gap-4 p-3 bg-white border border-gray-200 rounded-lg shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-16 object-cover rounded-md bg-gray-100 border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-16 bg-gray-100 rounded-md border border-gray-200 shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                          NO IMG
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-900 truncate text-sm">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold bg-[#111111] text-white rounded">
                            SIZE: {item.size || "M"}
                          </span>
                          {item.isPreOrder && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-600 text-white rounded">
                              PRE-ORDER {item.preOrderReleaseDate ? `(${item.preOrderReleaseDate})` : ""}
                            </span>
                          )}
                          <span className="text-xs text-gray-600 font-mono">
                            ${item.price} each
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 font-mono text-xs">
                      <span className="text-gray-500 font-medium">Qty: {item.quantity}</span>
                      <span className="font-bold text-gray-900 text-sm mt-0.5">
                        ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-500 font-mono">
                  No products registered in this order record.
                </li>
              )}
            </ul>
          </div>

          {/* Shipping & Recipient Details */}
          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-700" />
              Delivery & Recipient Information
            </div>
            <div className="grid gap-2 p-4 bg-gray-50/90 rounded-lg border border-gray-200 text-xs text-gray-900">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-mono">Recipient:</span>
                <span className="font-bold text-gray-900 text-sm">
                  {orderDetails?.addressInfo?.name || user?.userName || "Customer"}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-500 font-mono">Address:</span>
                <span className="font-medium text-gray-900 text-right max-w-[320px]">
                  {orderDetails?.addressInfo?.address || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-mono">City & Postal:</span>
                <span className="font-medium text-gray-900">
                  {orderDetails?.addressInfo?.city || "N/A"} — {orderDetails?.addressInfo?.pincode || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-mono">Phone:</span>
                <span className="font-mono font-medium text-gray-900">
                  {orderDetails?.addressInfo?.phone || "N/A"}
                </span>
              </div>
              {orderDetails?.addressInfo?.notes && (
                <div className="flex items-start justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-500 font-mono">Delivery Notes:</span>
                  <span className="text-gray-700 italic max-w-[320px] text-right">
                    {orderDetails.addressInfo.notes}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Update Control */}
          <div className="pt-3 border-t border-gray-200">
            <CommonForm
              formControls={[
                {
                  label: "Update Order Fulfilment Status",
                  name: "status",
                  componentType: "select",
                  options: [
                    { id: "pending", label: "Pending" },
                    { id: "inProcess", label: "In Process" },
                    { id: "inShipping", label: "In Shipping" },
                    { id: "delivered", label: "Delivered" },
                    { id: "rejected", label: "Rejected" },
                  ],
                },
              ]}
              formData={formData}
              setFormData={setFormData}
              buttonText={"Save Status Changes"}
              onSubmit={handleUpdateStatus}
            />
          </div>
        </div>
      )}
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
