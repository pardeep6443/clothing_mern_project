import React, { useState, useRef } from "react";
import {
  UploadCloudIcon,
  XIcon,
  PlusIcon,
  StarIcon,
  LinkIcon,
  Loader2Icon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ImageIcon,
} from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import axios from "axios";
import { API_URL } from "@/config/api";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageFiles,
  setImageFiles,
  imageLoadingState,
  setImageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  uploadedImageUrls = [],
  setUploadedImageUrls,
  isEditMode,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Normalize current images list
  const currentImages = Array.isArray(uploadedImageUrls) && uploadedImageUrls.length > 0
    ? uploadedImageUrls
    : uploadedImageUrl
    ? [uploadedImageUrl]
    : [];

  const updateImageList = (newList) => {
    if (setUploadedImageUrls) {
      setUploadedImageUrls(newList);
    }
    if (setUploadedImageUrl) {
      setUploadedImageUrl(newList[0] || "");
    }
  };

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    
    if (setImageLoadingState) setImageLoadingState(true);
    setIsUploading(true);

    try {
      if (fileList.length === 1) {
        const formData = new FormData();
        formData.append("my_file", fileList[0]);
        const response = await axios.post(`${API_URL}/api/admin/products/upload-image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
        if (response?.data?.success && response.data.result?.url) {
          const newUrl = response.data.result.url;
          const updated = [...currentImages, newUrl];
          updateImageList(updated);
        } else {
          // Fallback to local Data URL
          const localUrl = await readFileAsDataUrl(fileList[0]);
          if (localUrl) {
            updateImageList([...currentImages, localUrl]);
          }
        }
      } else {
        const formData = new FormData();
        fileList.forEach((file) => formData.append("my_files", file));
        const response = await axios.post(`${API_URL}/api/admin/products/upload-images`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
        if (response?.data?.success && Array.isArray(response.data.urls) && response.data.urls.length > 0) {
          const newUrls = response.data.urls;
          const updated = [...currentImages, ...newUrls];
          updateImageList(updated);
        } else {
          // Fallback to local Data URLs
          const localUrls = await Promise.all(fileList.map((f) => readFileAsDataUrl(f)));
          const validUrls = localUrls.filter(Boolean);
          if (validUrls.length > 0) {
            updateImageList([...currentImages, ...validUrls]);
          }
        }
      }
    } catch (err) {
      console.warn("Server upload notice, applying seamless local image fallback:", err?.message || err);
      try {
        const localUrls = await Promise.all(fileList.map((f) => readFileAsDataUrl(f)));
        const validUrls = localUrls.filter(Boolean);
        if (validUrls.length > 0) {
          updateImageList([...currentImages, ...validUrls]);
        }
      } catch (readErr) {
        console.warn("Local fallback read error:", readErr);
      }
    } finally {
      if (setImageLoadingState) setImageLoadingState(false);
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleImageFileChange(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }

  function handleAddUrl() {
    if (!urlInput.trim()) return;
    const newUrl = urlInput.trim();
    const updated = [...currentImages, newUrl];
    updateImageList(updated);
    setUrlInput("");
  }

  function handleRemoveImage(indexToRemove) {
    const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
    updateImageList(updated);
  }

  function handleSetAsCover(indexToCover) {
    if (indexToCover === 0) return;
    const selected = currentImages[indexToCover];
    const rest = currentImages.filter((_, idx) => idx !== indexToCover);
    const updated = [selected, ...rest];
    updateImageList(updated);
  }

  function handleMoveImage(index, direction) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= currentImages.length) return;
    const copy = [...currentImages];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    updateImageList(copy);
  }

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-[#111111]" />
          Product Images ({currentImages.length})
        </Label>
        <span className="text-[11px] text-gray-500 font-mono">
          First image will be the primary cover
        </span>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 hover:border-[#111111] transition-colors rounded-lg p-4 bg-gray-50/60 text-center"
      >
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          multiple
          accept="image/*"
        />

        {isUploading || imageLoadingState ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <Loader2Icon className="w-8 h-8 animate-spin text-[#111111]" />
            <p className="text-xs text-gray-600 font-medium">Uploading product images to atelier...</p>
          </div>
        ) : (
          <Label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center py-4 cursor-pointer"
          >
            <UploadCloudIcon className="w-8 h-8 text-gray-400 mb-2 hover:text-[#111111] transition-colors" />
            <span className="text-xs font-semibold text-gray-800">
              Click to browse or drag & drop multiple images
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5">
              PNG, JPG, WEBP, GIF up to 10MB each
            </span>
          </Label>
        )}
      </div>

      {/* Direct URL input option */}
      <div className="mt-3 flex gap-2 items-center">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Or paste direct image URL (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="text-xs pl-8 h-9 bg-white"
          />
        </div>
        <Button
          type="button"
          onClick={handleAddUrl}
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs font-medium border-gray-300 hover:bg-gray-100 shrink-0"
        >
          <PlusIcon className="w-3.5 h-3.5 mr-1" />
          Add URL
        </Button>
      </div>

      {/* Uploaded Images Gallery Preview */}
      {currentImages.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label className="text-xs font-semibold text-gray-700 block">
            Gallery Carousel Preview ({currentImages.length} {currentImages.length === 1 ? "image" : "images"} attached)
          </Label>
          
          <div className="grid grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 border border-gray-100 rounded-md bg-gray-50/40">
            {currentImages.map((url, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${url}-${index}`}
                  className={`relative group aspect-square rounded-md overflow-hidden border-2 transition-all ${
                    isCover
                      ? "border-[#111111] shadow-xs"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Cover Badge */}
                  {isCover && (
                    <div className="absolute top-1.5 left-1.5 bg-[#111111] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                      <StarIcon className="w-2.5 h-2.5 fill-white" />
                      COVER
                    </div>
                  )}

                  {/* Top Action Overlay (Remove) */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity shadow-xs"
                    title="Remove image"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>

                  {/* Bottom Controls (Set as cover / reorder) */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity text-white text-[9px]">
                    <div className="flex items-center gap-0.5">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, -1)}
                          className="p-1 hover:bg-white/20 rounded"
                          title="Move left"
                        >
                          <ArrowLeftIcon className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {index < currentImages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, 1)}
                          className="p-1 hover:bg-white/20 rounded"
                          title="Move right"
                        >
                          <ArrowRightIcon className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(index)}
                        className="px-1.5 py-0.5 bg-white/20 hover:bg-white/40 rounded font-sans text-[8px] uppercase tracking-wider font-semibold"
                      >
                        Make Cover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductImageUpload;
