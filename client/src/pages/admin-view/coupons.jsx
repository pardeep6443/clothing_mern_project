import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TicketPercent,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle,
  XCircle,
  Tag,
  Percent,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "";

const initialCouponForm = {
  code: "",
  title: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
  expiryDate: "",
  isActive: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialCouponForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const { toast } = useToast();

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/coupons`);
      if (res.data?.success) {
        setCoupons(res.data.data || []);
      }
    } catch (err) {
      toast({
        title: "Error fetching coupons",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  function handleOpenCreate() {
    setEditingId(null);
    setFormData(initialCouponForm);
    setOpenModal(true);
  }

  function handleOpenEdit(coupon) {
    setEditingId(coupon._id);
    let expFormatted = "";
    if (coupon.expiryDate) {
      expFormatted = new Date(coupon.expiryDate).toISOString().split("T")[0];
    }
    setFormData({
      code: coupon.code,
      title: coupon.title || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue || "",
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      usageLimit: coupon.usageLimit || "",
      expiryDate: expFormatted,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setOpenModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a unique coupon code.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid discount amount.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : 0,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 0,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        isActive: Boolean(formData.isActive),
      };

      if (editingId) {
        const res = await axios.put(`${API_URL}/api/admin/coupons/${editingId}`, payload);
        if (res.data?.success) {
          toast({
            title: "Coupon Updated",
            description: `Coupon ${payload.code} was saved successfully.`,
          });
          setOpenModal(false);
          fetchCoupons();
        }
      } else {
        const res = await axios.post(`${API_URL}/api/admin/coupons`, payload);
        if (res.data?.success) {
          toast({
            title: "Coupon Created",
            description: `Coupon ${payload.code} is now active and ready for customers.`,
          });
          setOpenModal(false);
          fetchCoupons();
        }
      }
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await axios.delete(`${API_URL}/api/admin/coupons/${id}`);
      if (res.data?.success) {
        toast({
          title: "Coupon Deleted",
          description: "The coupon was permanently removed.",
        });
        setDeleteConfirmId(null);
        fetchCoupons();
      }
    } catch (err) {
      toast({
        title: "Deletion Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  }

  async function handleToggleStatus(coupon) {
    try {
      const newStatus = !coupon.isActive;
      const res = await axios.put(`${API_URL}/api/admin/coupons/${coupon._id}`, {
        isActive: newStatus,
      });
      if (res.data?.success) {
        toast({
          title: newStatus ? "Coupon Activated" : "Coupon Deactivated",
          description: `Coupon '${coupon.code}' is now ${newStatus ? "active" : "disabled"}.`,
        });
        fetchCoupons();
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  }

  // Quick statistics
  const totalCoupons = coupons.length;
  const activeCouponsCount = coupons.filter(
    (c) => c.isActive && (!c.expiryDate || new Date(c.expiryDate) > new Date())
  ).length;
  const totalTimesUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <TicketPercent className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Coupons & Discounts
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage promotional discount codes stored in MongoDB and available at checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCoupons}
            disabled={loading}
            className="gap-2 border-border/60 hover:bg-muted"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/70 border border-border/50 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Coupons</span>
            <Tag className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-2">{totalCoupons}</p>
          <span className="text-xs text-muted-foreground mt-1 inline-block">Registered in database</span>
        </div>

        <div className="bg-card/70 border border-border/50 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Active for Customers</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-500 mt-2">{activeCouponsCount}</p>
          <span className="text-xs text-muted-foreground mt-1 inline-block">Applicable right now</span>
        </div>

        <div className="bg-card/70 border border-border/50 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Redemptions</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-2">{totalTimesUsed}</p>
          <span className="text-xs text-muted-foreground mt-1 inline-block">Orders redeemed with discount</span>
        </div>
      </div>

      {/* Coupons Table / Grid */}
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-foreground">Available Coupons</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {coupons.length} {coupons.length === 1 ? "coupon" : "coupons"} configured
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">Loading coupons from database...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <TicketPercent className="w-12 h-12 text-muted-foreground/40 stroke-1" />
            <h3 className="text-lg font-medium text-foreground">No coupons created yet</h3>
            <p className="text-sm max-w-sm">
              Create your first promotional discount coupon code so customers can apply it at checkout.
            </p>
            <Button onClick={handleOpenCreate} className="mt-2 gap-2 bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4" />
              Create Coupon
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-medium border-b border-border/40">
                <tr>
                  <th className="px-6 py-3.5">Code & Title</th>
                  <th className="px-6 py-3.5">Discount</th>
                  <th className="px-6 py-3.5">Min Order</th>
                  <th className="px-6 py-3.5">Usage</th>
                  <th className="px-6 py-3.5">Expiry</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {coupons.map((coupon) => {
                  const isExpired =
                    coupon.expiryDate && new Date(coupon.expiryDate) <= new Date();
                  const isLimitReached =
                    coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;
                  const isEffectivelyActive =
                    coupon.isActive && !isExpired && !isLimitReached;

                  return (
                    <tr
                      key={coupon._id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {coupon.code}
                            </span>
                          </div>
                          {coupon.title && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {coupon.title}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-foreground">
                        {coupon.discountType === "percentage" ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Percent className="w-3.5 h-3.5" />
                            {coupon.discountValue}% OFF
                            {coupon.maxDiscountAmount > 0 && (
                              <span className="text-xs text-muted-foreground font-normal ml-1">
                                (Up to ${coupon.maxDiscountAmount})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            ${coupon.discountValue} FLAT OFF
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {coupon.minOrderAmount > 0 ? (
                          <span>${coupon.minOrderAmount}</span>
                        ) : (
                          <span className="text-xs italic text-muted-foreground/70">No minimum</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-mono">
                          {coupon.usedCount || 0}
                          {coupon.usageLimit > 0
                            ? ` / ${coupon.usageLimit}`
                            : " / ∞"}
                        </span>
                        {isLimitReached && (
                          <span className="block text-[10px] text-red-500 font-medium">Limit reached</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {coupon.expiryDate ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className={isExpired ? "text-red-500 font-medium line-through" : ""}>
                              {new Date(coupon.expiryDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs italic text-muted-foreground/70">Never expires</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(coupon)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            isEffectivelyActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                          }`}
                        >
                          {isEffectivelyActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              {isExpired ? "Expired" : "Disabled"}
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(coupon)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(coupon._id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[540px] bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <TicketPercent className="w-5 h-5 text-amber-500" />
              {editingId ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription>
              Coupons are stored in MongoDB and directly validated for customers during checkout.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-semibold uppercase tracking-wider">
                  Coupon Code *
                </Label>
                <Input
                  id="code"
                  placeholder="e.g. SUMMER25"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                  className="font-mono uppercase font-bold tracking-wider"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider">
                  Title / Description
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Summer Mega Discount"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="discountType" className="text-xs font-semibold uppercase tracking-wider">
                  Discount Type
                </Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, discountType: val })
                  }
                >
                  <SelectTrigger id="discountType">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%) Off</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($) Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discountValue" className="text-xs font-semibold uppercase tracking-wider">
                  {formData.discountType === "percentage"
                    ? "Percentage Value (%) *"
                    : "Discount Amount ($) *"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0.1"
                  step="any"
                  placeholder={formData.discountType === "percentage" ? "15" : "20"}
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="minOrderAmount" className="text-xs font-semibold uppercase tracking-wider">
                  Min Cart Total ($)
                </Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0 (No minimum)"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: e.target.value })
                  }
                />
              </div>

              {formData.discountType === "percentage" && (
                <div className="space-y-1.5">
                  <Label htmlFor="maxDiscountAmount" className="text-xs font-semibold uppercase tracking-wider">
                    Max Discount Cap ($)
                  </Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0 (No maximum limit)"
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscountAmount: e.target.value })
                    }
                  />
                </div>
              )}

              {formData.discountType === "fixed" && (
                <div className="space-y-1.5">
                  <Label htmlFor="usageLimit" className="text-xs font-semibold uppercase tracking-wider">
                    Usage Limit
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    placeholder="0 (Unlimited)"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.discountType === "percentage" && (
                <div className="space-y-1.5">
                  <Label htmlFor="usageLimit" className="text-xs font-semibold uppercase tracking-wider">
                    Usage Limit (Max Redemptions)
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    placeholder="0 (Unlimited)"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="expiryDate" className="text-xs font-semibold uppercase tracking-wider">
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-border"
              />
              <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Enable this coupon immediately for customer checkout
              </Label>
            </div>

            <DialogFooter className="pt-4 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                {editingId ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Coupon
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this coupon? Customers will no longer be able to use it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteConfirmId)}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
