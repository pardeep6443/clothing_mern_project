import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Check, MapPin, Phone, Edit2, Trash2 } from "lucide-react";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  const isSelected = selectedId?._id === addressInfo?._id;

  return (
    <div
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer transition-all rounded-lg p-4 bg-white text-gray-900 shadow-xs flex flex-col justify-between ${
        isSelected
          ? "border-2 border-[#111111] ring-2 ring-black/10 bg-gray-50/70 shadow-md"
          : "border border-gray-200 hover:border-gray-400 hover:bg-gray-50/30"
      }`}
    >
      <div className="space-y-2.5">
        {/* Header Badge & Pincode */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          {isSelected ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-bold text-white bg-[#111111] px-2.5 py-1 rounded">
              <Check className="w-3.5 h-3.5" />
              SELECTED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded transition-colors">
              ○ SELECT ADDRESS
            </span>
          )}
          <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
            PIN: {addressInfo?.pincode}
          </span>
        </div>

        {/* Street Address */}
        <div className="flex items-start gap-2 pt-1">
          <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-sans font-bold text-gray-900 leading-snug">
              {addressInfo?.address}
            </p>
            <p className="text-xs font-semibold text-gray-700 mt-0.5">
              {addressInfo?.city}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-800 pt-0.5">
          <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className="font-semibold text-gray-900">{addressInfo?.phone}</span>
        </div>

        {/* Optional Notes */}
        {addressInfo?.notes && (
          <div className="bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] p-2 rounded leading-tight italic">
            <strong className="font-semibold not-italic">Note:</strong> {addressInfo?.notes}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 mt-3 border-t border-gray-100 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black text-xs font-semibold h-8 px-2.5 flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            handleEditAddress(addressInfo);
          }}
        >
          <Edit2 className="w-3 h-3 text-gray-600" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-semibold h-8 px-2.5 flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAddress(addressInfo);
          }}
        >
          <Trash2 className="w-3 h-3 text-red-500" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export default AddressCard;
