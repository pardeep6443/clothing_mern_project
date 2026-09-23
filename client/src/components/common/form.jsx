import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Check, Plus, X, Eye, EyeOff } from "lucide-react";
import CategoryManager from "../admin-view/category-manager";

const CLOTHING_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const FOOTWEAR_PRESETS = ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"];
const NUMERIC_PRESETS = ["28", "30", "32", "34", "36", "38", "40"];
const OTHER_PRESETS = ["ONE SIZE", "FREE SIZE"];

function CommonForm({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  isBtnDisabled,
}) {
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [showPassword, setShowPassword] = useState({});

  function handleToggleSize(sizeName, sizeValue) {
    const currentSizes = Array.isArray(formData[sizeName])
      ? [...formData[sizeName]]
      : [];
    const exists = currentSizes.includes(sizeValue);
    let updated;
    if (exists) {
      updated = currentSizes.filter((s) => s !== sizeValue);
    } else {
      updated = [...currentSizes, sizeValue];
    }
    setFormData({
      ...formData,
      [sizeName]: updated,
    });
  }

  function handleSetPresetBatch(sizeName, batchArray) {
    setFormData({
      ...formData,
      [sizeName]: [...batchArray],
    });
  }

  function handleAddCustomSize(sizeName) {
    if (!customSizeInput.trim()) return;
    const cleanSize = customSizeInput.trim().toUpperCase();
    const currentSizes = Array.isArray(formData[sizeName])
      ? [...formData[sizeName]]
      : [];
    if (!currentSizes.includes(cleanSize)) {
      setFormData({
        ...formData,
        [sizeName]: [...currentSizes, cleanSize],
      });
    }
    setCustomSizeInput("");
  }

  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name] || "";

    switch (getControlItem.componentType) {
      case "category-manager": {
        return (
          <CategoryManager
            value={value}
            onChange={(newVal) =>
              setFormData({
                ...formData,
                [getControlItem.name]: newVal,
              })
            }
          />
        );
      }
      case "size-selector": {
        const selectedSizes = Array.isArray(formData[getControlItem.name])
          ? formData[getControlItem.name]
          : [];

        return (
          <div className="space-y-3 p-3.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold text-[#111111] uppercase tracking-wider">
                Available Sizes ({selectedSizes.length} active)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSetPresetBatch(getControlItem.name, ["XS", "S", "M", "L", "XL"])
                  }
                  className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 bg-white border border-gray-200 hover:border-black text-gray-700 rounded transition-colors"
                >
                  Standard (XS-XL)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetBatch(getControlItem.name, [])}
                  className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 bg-white border border-gray-200 hover:border-red-500 hover:text-red-600 text-gray-500 rounded transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Standard Apparel Section */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                Apparel Sizes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CLOTHING_PRESETS.map((preset) => {
                  const isSelected = selectedSizes.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleToggleSize(getControlItem.name, preset)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#111111] text-white shadow-xs"
                          : "bg-white text-[#444444] border border-[#D5D5D5] hover:border-[#111111] hover:text-[#111111]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footwear & Numeric Section */}
            <div className="space-y-1 pt-1 border-t border-gray-200">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                Footwear & One-Size:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[...FOOTWEAR_PRESETS, ...OTHER_PRESETS].map((preset) => {
                  const isSelected = selectedSizes.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleToggleSize(getControlItem.name, preset)}
                      className={`px-2 py-0.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#111111] text-white shadow-xs"
                          : "bg-white text-[#555555] border border-[#D5D5D5] hover:border-[#111111] hover:text-[#111111]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Size Addition */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#E5E5E5]">
              <Input
                type="text"
                placeholder="Add custom size (e.g., 34R, 42/32, 2X, Petite)"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomSize(getControlItem.name);
                  }
                }}
                className="h-8 text-xs bg-white border-gray-300"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleAddCustomSize(getControlItem.name)}
                className="h-8 px-3 text-xs bg-white hover:bg-[#111111] hover:text-white border-gray-300 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Size
              </Button>
            </div>

            {/* Active Selected Size Tags */}
            {selectedSizes.length > 0 ? (
              <div className="pt-2 border-t border-[#E5E5E5]">
                <span className="text-[11px] font-sans text-[#767676] block mb-1.5 uppercase tracking-wider">
                  Active for this product:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSizes.map((sz) => (
                    <span
                      key={sz}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#111111] text-white text-xs font-mono font-bold rounded shadow-xs"
                    >
                      {sz}
                      <button
                        type="button"
                        onClick={() => handleToggleSize(getControlItem.name, sz)}
                        className="hover:text-red-300 ml-1 p-0.5"
                        title={`Remove ${sz}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 font-mono">
                * Please select at least one size for this product.
              </p>
            )}
          </div>
        );
      }
      case "input": {
        const isPassword = getControlItem.type === "password";
        const isCurrentVisible = Boolean(showPassword[getControlItem.name]);
        const inputType = isPassword
          ? isCurrentVisible
            ? "text"
            : "password"
          : getControlItem.type || "text";

        element = (
          <div className="relative w-full">
            <Input
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              id={getControlItem.name}
              type={inputType}
              value={value}
              autoComplete={
                isPassword
                  ? "current-password"
                  : getControlItem.name === "email"
                  ? "email"
                  : "on"
              }
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [getControlItem.name]: event.target.value,
                })
              }
              className={`bg-white text-[#111111] placeholder:text-[#888888] border-[#D4D4D4] focus-visible:border-[#111111] focus-visible:ring-1 focus-visible:ring-[#111111] ${
                isPassword ? "pr-10" : ""
              }`}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    [getControlItem.name]: !prev[getControlItem.name],
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#111111] transition-colors focus:outline-none"
                aria-label={isCurrentVisible ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {isCurrentVisible ? (
                  <EyeOff className="w-4 h-4 text-gray-600 hover:text-black" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-600 hover:text-black" />
                )}
              </button>
            )}
          </div>
        );

        break;
      }
      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [getControlItem.name]: value,
              })
            }
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );

        break;
      case "textarea":
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.id}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );

        break;

      case "checkbox": {
        const isChecked = Boolean(formData[getControlItem.name]);
        element = (
          <label className="flex items-center gap-2.5 p-2.5 border border-gray-200 bg-white rounded cursor-pointer hover:border-black transition-colors">
            <input
              type="checkbox"
              id={getControlItem.name}
              name={getControlItem.name}
              checked={isChecked}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [getControlItem.name]: e.target.checked,
                })
              }
              className="w-4 h-4 accent-black rounded cursor-pointer"
            />
            <span className="text-xs font-sans text-gray-800 select-none">
              {getControlItem.placeholder || "Enable"}
            </span>
          </label>
        );
        break;
      }

      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
            className="bg-white text-[#111111] placeholder:text-[#888888] border-[#D4D4D4] focus-visible:border-[#111111]"
          />
        );
        break;
    }

    return element;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label className="mb-1 text-xs font-sans font-semibold text-[#111111] uppercase tracking-wider">
              {controlItem.label}
            </Label>
            {renderInputsByComponentType(controlItem)}
          </div>
        ))}
      </div>
      <Button
        disabled={isBtnDisabled}
        type="submit"
        className="mt-4 w-full h-11 bg-[#111111] hover:bg-black text-white rounded-none uppercase font-sans tracking-[0.2em] text-xs font-semibold shadow-md transition-colors"
      >
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;