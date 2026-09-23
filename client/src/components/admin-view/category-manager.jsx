import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Check, Plus, Trash2, X, Tag, Sparkles, Layers } from "lucide-react";

function CategoryManager({ value, onChange }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  // Normalize selected categories into an array of strings
  const selectedCategories = Array.isArray(value)
    ? value.filter(Boolean)
    : typeof value === "string" && value.trim()
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  async function fetchCategories() {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/categories/get`);
      if (res?.data?.success && Array.isArray(res?.data?.data)) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function handleToggleCategory(catName) {
    const trimmed = String(catName || "").trim();
    if (!trimmed) return;

    const exists = selectedCategories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );

    let updated;
    if (exists) {
      // Deselect
      updated = selectedCategories.filter(
        (c) => c.toLowerCase() !== trimmed.toLowerCase()
      );
    } else {
      // Select (add to selection)
      updated = [...selectedCategories, trimmed];
    }

    onChange(updated);
  }

  function handleRemoveSelected(catName, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const updated = selectedCategories.filter(
      (c) => c.toLowerCase() !== catName.toLowerCase()
    );
    onChange(updated);
  }

  function handleClearAll() {
    onChange([]);
  }

  function handleSelectAll() {
    const allNames = categories.map((c) => c.name || c).filter(Boolean);
    onChange(allNames);
  }

  async function handleAddCategory(e) {
    if (e && e.preventDefault) e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) {
      toast({
        title: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/categories/add`, {
        name: cleanName,
      });

      if (res?.data?.success) {
        const created = res.data.data;
        const nameToUse = created.name || cleanName;

        setCategories((prev) => {
          const exists = prev.some(
            (c) => (c.name || "").toLowerCase() === nameToUse.toLowerCase()
          );
          if (exists) return prev;
          return [...prev, created];
        });

        // Automatically add to selected categories
        const existsInSelected = selectedCategories.some(
          (c) => c.toLowerCase() === nameToUse.toLowerCase()
        );
        if (!existsInSelected) {
          onChange([...selectedCategories, nameToUse]);
        }

        setNewCategoryName("");
        toast({
          title: `Category "${nameToUse}" added and selected`,
        });
      } else {
        toast({
          title: res?.data?.message || "Failed to add category",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error adding category:", err);
      toast({
        title: err?.response?.data?.message || "Error adding category",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteCategory(categoryItem, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const targetId = categoryItem._id || categoryItem.id || categoryItem.name;
    const catName = categoryItem.name || "";
    setDeletingId(targetId);

    try {
      const res = await axios.delete(
        `${API_URL}/api/admin/categories/delete/${encodeURIComponent(targetId)}`
      );

      if (res?.data?.success) {
        setCategories((prev) =>
          prev.filter(
            (c) =>
              (c._id || c.id || c.name) !== targetId &&
              (c.name || "").toLowerCase() !== catName.toLowerCase()
          )
        );

        // Remove from selected list if present
        const updated = selectedCategories.filter(
          (c) =>
            c.toLowerCase() !== catName.toLowerCase() &&
            c.toLowerCase() !== (categoryItem.slug || "").toLowerCase()
        );
        if (updated.length !== selectedCategories.length) {
          onChange(updated);
        }

        toast({
          title: `Category "${catName}" removed from store`,
        });
      } else {
        toast({
          title: res?.data?.message || "Failed to remove category",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      toast({
        title: "Error removing category",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  const isSelected = (catName) => {
    if (!catName) return false;
    return selectedCategories.some(
      (c) => c.trim().toLowerCase() === catName.trim().toLowerCase()
    );
  };

  return (
    <div className="space-y-3 p-3.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded">
      {/* Header & Quick Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#111111]" />
          <span className="text-xs font-sans font-semibold text-[#111111] uppercase tracking-wider">
            Product Categories (Multi-Select)
          </span>
        </div>
        <div className="flex items-center gap-3">
          {categories.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[10px] font-mono text-[#555555] hover:text-[#111111] underline uppercase cursor-pointer"
            >
              Select All
            </button>
          )}
          {selectedCategories.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] font-mono text-red-600 hover:text-red-700 underline uppercase cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Active Selected Categories Display */}
      <div className="p-2.5 bg-white border border-[#E5E5E5] rounded text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans text-[#767676] uppercase tracking-wider">
            Active Categories ({selectedCategories.length} selected):
          </span>
          <span className="text-[10px] font-sans text-neutral-400 italic">
            Click categories below to toggle
          </span>
        </div>

        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedCategories.map((catName) => (
              <span
                key={catName}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#111111] text-white font-mono text-xs font-medium rounded group"
              >
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{catName}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveSelected(catName, e)}
                  className="hover:text-red-300 ml-0.5 transition-colors"
                  title={`Deselect ${catName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="font-mono text-xs text-amber-600 italic block">
            No categories selected — click one or more categories below
          </span>
        )}
      </div>

      {/* Available Categories Palette */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono text-[#767676] uppercase tracking-wider block">
          Available Categories ({categories.length}):
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {categories.length > 0 ? (
            categories.map((cat) => {
              const active = isSelected(cat.name);
              const isDeleting = deletingId === (cat._id || cat.id || cat.name);

              return (
                <div
                  key={cat._id || cat.id || cat.name}
                  onClick={() => handleToggleCategory(cat.name)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all cursor-pointer border select-none ${
                    active
                      ? "bg-[#111111] text-white border-[#111111] shadow-xs font-bold font-mono"
                      : "bg-white text-[#333333] border-[#D5D5D5] hover:border-[#111111] hover:text-[#111111] font-sans"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      active
                        ? "bg-white border-white"
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    {active && <Check className="w-2.5 h-2.5 text-[#111111] stroke-[3]" />}
                  </div>

                  <span className="capitalize tracking-wider">{cat.name}</span>

                  <button
                    type="button"
                    title={`Delete "${cat.name}" category from store`}
                    disabled={isDeleting}
                    onClick={(e) => handleDeleteCategory(cat, e)}
                    className={`ml-1.5 p-0.5 rounded transition-colors ${
                      active
                        ? "text-white/70 hover:text-red-300 hover:bg-black/30"
                        : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-500 font-mono py-1">
              {isLoading
                ? "Loading categories..."
                : "No custom categories found. Add your first category below."}
            </p>
          )}
        </div>
      </div>

      {/* Add Custom Category Input */}
      <div className="pt-2 border-t border-[#E5E5E5] space-y-1.5">
        <span className="text-[10px] font-mono text-[#767676] uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#111111]" />
          Add new custom category to store:
        </span>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="e.g. Haute Couture, Silk Loungewear, Winter 2026..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCategory(e);
              }
            }}
            className="h-8 text-xs bg-white border-gray-300"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCategory}
            disabled={isAdding || !newCategoryName.trim()}
            className="h-8 px-3 text-xs bg-[#111111] text-white hover:bg-black shrink-0 font-sans uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {isAdding ? "Adding..." : "Add Category"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;
