import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingFooter from "./footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#09090B] text-[#111111] dark:text-[#EDEDED] overflow-x-hidden selection:bg-[#111111] selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>
      {/* common footer */}
      <ShoppingFooter />
    </div>
  );
}

export default ShoppingLayout;