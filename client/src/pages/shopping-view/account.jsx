import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { useSelector } from "react-redux";
import { Package, MapPin } from "lucide-react";
import { useSearchParams } from "react-router-dom";

function ShoppingAccount() {
  const { user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "orders";

  const handleTabChange = (val) => {
    setSearchParams({ tab: val });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0B0B0B] text-[#111111] dark:text-[#EDEDED] pt-20 sm:pt-24 md:pt-28 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Breadcrumbs */}
        <div className="border-b border-[#E5E5E5] dark:border-[#27272A] pb-8 mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#767676] dark:text-[#A1A1AA] block mb-2 font-medium">
                MAISON DAYLIGHT // CLIENT SPACE
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.12em] font-normal text-[#111111] dark:text-[#EDEDED]">
                MY ORDERS & ACCOUNT
              </h1>
              <p className="font-serif italic text-[#666666] dark:text-[#A1A1AA] text-xs sm:text-sm mt-2 max-w-lg">
                Track your order fulfillment, review receipt references, and manage registered delivery addresses.
              </p>
            </div>

            {/* Client Profile Chip */}
            {user?.userName && (
              <div className="bg-white dark:bg-[#121214] border border-[#E5E5E5] dark:border-[#27272A] px-4 py-2.5 shadow-xs flex items-center gap-3 self-start md:self-auto transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black flex items-center justify-center font-sans text-xs font-semibold">
                  {user.userName[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-sans text-xs font-semibold text-[#111111] dark:text-[#EDEDED] uppercase tracking-wider">
                    {user.userName}
                  </p>
                  <p className="font-mono text-[10px] text-[#767676] dark:text-[#A1A1AA]">
                    {user.email || "Maison Client"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
          <div className="flex border-b border-[#E5E5E5] dark:border-[#27272A]">
            <TabsList className="bg-transparent p-0 h-auto gap-4 sm:gap-8 rounded-none border-0">
              <TabsTrigger
                value="orders"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#111111] dark:data-[state=active]:border-white data-[state=active]:text-[#111111] dark:data-[state=active]:text-white text-[#767676] dark:text-[#A1A1AA] font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-medium py-3 px-1 rounded-none bg-transparent data-[state=active]:shadow-none flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>Orders & Acquisitions</span>
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#111111] dark:data-[state=active]:border-white data-[state=active]:text-[#111111] dark:data-[state=active]:text-white text-[#767676] dark:text-[#A1A1AA] font-sans text-xs sm:text-sm uppercase tracking-[0.18em] font-medium py-3 px-1 rounded-none bg-transparent data-[state=active]:shadow-none flex items-center gap-2 cursor-pointer transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Delivery Addresses</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders" className="outline-none mt-6">
            <ShoppingOrders />
          </TabsContent>

          <TabsContent value="address" className="outline-none mt-6">
            <div className="bg-white dark:bg-[#121214] border border-[#E5E5E5] dark:border-[#27272A] p-6 sm:p-8 shadow-xs transition-colors">
              <div className="mb-6 border-b border-[#E5E5E5] dark:border-[#27272A] pb-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-[#111111] dark:text-[#EDEDED]">
                  Concierge Shipping Addresses
                </h3>
                <p className="font-sans text-xs text-[#767676] dark:text-[#A1A1AA] mt-1">
                  Manage up to three verified delivery destinations for express dispatch.
                </p>
              </div>
              <Address />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ShoppingAccount;