import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice/index.js";
import { syncCartWithServer } from "@/store/shop/cart-slice/index.js";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingBag, Lock } from "lucide-react";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  function onSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    dispatch(loginUser(formData)).then(async (data) => {
      if (data?.payload?.success) {
        const loggedInUser = data?.payload?.user;
        toast({
          title: data?.payload?.message || "Logged in successfully",
        });

        // Sync any guest cart items into the user's permanent account
        if (loggedInUser?.id) {
          try {
            await dispatch(syncCartWithServer({ userId: loggedInUser.id }));
          } catch (err) {
            console.error("Error awaiting cart sync:", err);
          }
        }

        // Navigate to redirect destination (e.g. /shop/checkout) or home/dashboard
        if (loggedInUser?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (redirectTo && redirectTo.startsWith("/")) {
          navigate(redirectTo, { replace: true });
        } else {
          navigate("/shop/home", { replace: true });
        }
      } else {
        toast({
          title: data?.payload?.message || "Login failed",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {redirectTo === "/shop/checkout" && (
        <div className="p-4 bg-[#FBF9F5] dark:bg-neutral-900 border border-[#E6DEC8] dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg flex items-start gap-3 shadow-xs">
          <div className="p-1.5 bg-[#F0ECE1] dark:bg-neutral-800 rounded-full mt-0.5 shrink-0 text-[#111111] dark:text-white">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-semibold uppercase tracking-wider text-[11px]">
              Ready to Complete Your Order
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              Please sign in to finalize your purchase. All items in your shopping bag and liked creations are saved and will be loaded for checkout.
            </p>
          </div>
        </div>
      )}

      <div className="text-center space-y-2">
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.3em] text-[#767676]">
          Maison Daylight
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111111]">
          Sign in to your account
        </h1>
        <p className="text-xs font-sans text-[#666666]">
          Don't have an account?
          <Link
            className="font-semibold ml-1.5 text-[#111111] hover:underline uppercase tracking-wider"
            to={`/auth/register${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
          >
            Register
          </Link>
        </p>
      </div>

      <div className="bg-white border border-[#E5E5E5] p-6 sm:p-8 shadow-xs">
        <CommonForm
          formControls={loginFormControls}
          buttonText={"Sign In"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

export default AuthLogin;
