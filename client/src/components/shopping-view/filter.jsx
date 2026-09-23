import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  return (
    <div className="bg-white dark:bg-[#121214] border border-[#E5E5E5] dark:border-[#27272A] overflow-hidden transition-colors">
      <div className="p-4 border-b border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-between">
        <h2 className="text-xs font-sans uppercase tracking-[0.25em] text-[#111111] dark:text-[#EDEDED] font-medium">
          REFINE CREATIONS
        </h2>
      </div>
      <div className="p-4 space-y-6">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#767676] dark:text-[#A1A1AA] font-medium mb-3">
                {keyItem}
              </h3>
              <div className="grid gap-2">
                {filterOptions[keyItem].map((option) => {
                  const isChecked =
                    filters &&
                    Object.keys(filters).length > 0 &&
                    filters[keyItem] &&
                    filters[keyItem].indexOf(option.id) > -1;

                  return (
                    <Label
                      key={option.id}
                      className={`flex items-center gap-2.5 text-xs font-sans cursor-pointer transition-colors py-1.5 px-2 rounded-xs ${
                        isChecked
                          ? "bg-[#F5F5F5] dark:bg-[#1C1C1F] text-[#111111] dark:text-white font-medium border-l-2 border-[#111111] dark:border-white"
                          : "text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white hover:bg-[#FAF9F6] dark:hover:bg-[#18181B]"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleFilter(keyItem, option.id)}
                        className="border-[#CCCCCC] dark:border-[#52525B] data-[state=checked]:bg-[#111111] dark:data-[state=checked]:bg-white data-[state=checked]:text-white dark:data-[state=checked]:text-black data-[state=checked]:border-[#111111] dark:data-[state=checked]:border-white rounded-none w-3.5 h-3.5"
                      />
                      <span className="capitalize tracking-wider">{option.label}</span>
                    </Label>
                  );
                })}
              </div>
            </div>
            <Separator className="bg-[#E5E5E5] dark:bg-[#27272A]" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;