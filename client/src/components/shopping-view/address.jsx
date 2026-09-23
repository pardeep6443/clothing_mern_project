import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editaAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";
import { PlusCircle, MapPin } from "lucide-react";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "You can add max 3 addresses",
        variant: "destructive",
      });

      return;
    }

    currentEditedId !== null
      ? dispatch(
          editaAddress({
            userId: user?.id,
            addressId: currentEditedId,
            formData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setCurrentEditedId(null);
            setFormData(initialAddressFormData);
            toast({
              title: "Address updated successfully",
            });
          }
        })
      : dispatch(
          addNewAddress({
            ...formData,
            userId: user?.id,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setFormData(initialAddressFormData);
            toast({
              title: "Address added successfully",
            });
          }
        });
  }

  function handleDeleteAddress(getCurrentAddress) {
    dispatch(
      deleteAddress({ userId: user?.id, addressId: getCurrentAddress._id })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({
          title: "Address deleted successfully",
        });
      }
    });
  }

  function handleEditAddress(getCuurentAddress) {
    setCurrentEditedId(getCuurentAddress?._id);
    setFormData({
      ...formData,
      address: getCuurentAddress?.address,
      city: getCuurentAddress?.city,
      phone: getCuurentAddress?.phone,
      pincode: getCuurentAddress?.pincode,
      notes: getCuurentAddress?.notes,
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAllAddresses(user?.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="space-y-6 text-gray-900">
      {/* Existing Saved Addresses Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-gray-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-900" />
            SELECT DELIVERY DESTINATION
          </span>
          <span className="text-[11px] font-mono text-gray-500">
            {addressList?.length || 0} / 3 Saved
          </span>
        </div>

        {addressList && addressList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addressList.map((singleAddressItem, idx) => (
              <AddressCard
                key={`${singleAddressItem?._id || singleAddressItem?.id || "addr"}-${idx}`}
                selectedId={selectedId}
                handleDeleteAddress={handleDeleteAddress}
                addressInfo={singleAddressItem}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded text-center">
            <p className="text-xs font-mono text-gray-500">
              No saved addresses found. Please add a shipping address below.
            </p>
          </div>
        )}
      </div>

      {/* Address Form Card */}
      <Card className="bg-white text-gray-900 border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50/70 border-b border-gray-100 py-3 px-4">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-gray-900" />
            {currentEditedId !== null ? "Edit Shipping Address" : "Add New Shipping Address"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-gray-900">
          <CommonForm
            formControls={addressFormControls}
            formData={formData}
            setFormData={setFormData}
            buttonText={currentEditedId !== null ? "Save Changes" : "Save Shipping Address"}
            onSubmit={handleManageAddress}
            isBtnDisabled={!isFormValid()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Address;
