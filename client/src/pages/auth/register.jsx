import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice/index.js";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {
       if (data?.payload?.success) {
        toast({
          title: data?.payload?.message || "Registration successful",
          description: "Please sign in to continue.",
        });
        const searchStr = searchParams.toString();
        navigate(`/auth/login${searchStr ? `?${searchStr}` : ""}`);
      }  else {
        toast({
          title: data?.payload?.message || "Registration failed",
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
              Create an account to finalize your order. All items in your shopping bag and liked creations are saved and will be loaded for checkout.
            </p>
          </div>
        </div>
      )}

      <div className="text-center space-y-2">
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.3em] text-[#767676]">
          Maison Daylight
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111111]">
          Create an account
        </h1>
        <p className="text-xs font-sans text-[#666666]">
          Already have an account?
          <Link
            className="font-semibold ml-1.5 text-[#111111] hover:underline uppercase tracking-wider"
            to={`/auth/login${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
          >
            Sign In
          </Link>
        </p>
      </div>

      <div className="bg-white border border-[#E5E5E5] p-6 sm:p-8 shadow-xs">
        <CommonForm
          formControls={registerFormControls}
          buttonText={"Create Account"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

export default AuthRegister;