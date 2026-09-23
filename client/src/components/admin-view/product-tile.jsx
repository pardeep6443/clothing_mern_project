import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Images } from "lucide-react";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  setUploadedImageUrl,
  setUploadedImageUrls,
  handleDelete,
}) {
  let productImages = [];
  if (Array.isArray(product?.images) && product.images.length > 0) {
    productImages = product.images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
  } else if (Array.isArray(product?.image) && product.image.length > 0) {
    productImages = product.image.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
  } else if (typeof product?.image === "string" && product.image) {
    productImages = [product.image];
  } else if (product?.image?.url) {
    productImages = [product.image.url];
  }

  const primaryImage =
    productImages[0] ||
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80";

  const productCategories = Array.isArray(product?.categories) && product.categories.length > 0
    ? product.categories
    : Array.isArray(product?.category) && product.category.length > 0
    ? product.category
    : typeof product?.category === "string" && product.category
    ? product.category.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden">
      <div>
        <div className="relative">
          <img
            src={primaryImage}
            alt={product?.title || "Product"}
            className="w-full h-[280px] object-cover rounded-t-lg"
          />
          {product?.isPreOrder && (
            <div className="absolute top-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-mono font-bold px-2 py-1 rounded shadow-xs uppercase tracking-wider">
              PRE-ORDER {product?.preOrderReleaseDate ? `· ${product.preOrderReleaseDate}` : ""}
            </div>
          )}
          {productImages.length > 1 && (
            <div className="absolute top-2.5 right-2.5 bg-black/75 text-white text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 backdrop-blur-xs">
              <Images className="w-3 h-3" />
              {productImages.length} Photos
            </div>
          )}
        </div>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-base font-bold line-clamp-1">{product?.title}</h2>
            {productCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end max-w-[55%]">
                {productCategories.map((c, idx) => (
                  <span
                    key={idx}
                    className="shrink-0 px-1.5 py-0.5 bg-gray-100 text-[#111111] text-[9px] font-mono uppercase font-semibold rounded"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through text-gray-400" : ""
              } text-base font-semibold text-primary`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-base font-bold text-black">${product?.salePrice}</span>
            ) : null}
          </div>
          {product?.sizes && product?.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block w-full">
                Active Sizes ({product.sizes.length}):
              </span>
              {product.sizes.map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 bg-[#111111] text-white text-[10px] font-mono font-bold rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-2 pb-4">
          <Button
            className="flex-1"
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id || product?.id);
              if (setUploadedImageUrls) {
                setUploadedImageUrls(productImages.length > 0 ? productImages : [primaryImage]);
              }
              if (setUploadedImageUrl) {
                setUploadedImageUrl(primaryImage);
              }
              setFormData({
                title: product?.title || "",
                description: product?.description || "",
                category: productCategories,
                brand: product?.brand || "",
                price: product?.price !== undefined ? product.price : "",
                salePrice: product?.salePrice !== undefined ? product.salePrice : "",
                totalStock: product?.totalStock !== undefined ? product.totalStock : "",
                averageReview: product?.averageReview || 0,
                image: primaryImage,
                images: productImages.length > 0 ? productImages : [primaryImage],
                isPreOrder: Boolean(product?.isPreOrder),
                preOrderReleaseDate: product?.preOrderReleaseDate || "",
                sizes:
                  Array.isArray(product?.sizes) && product.sizes.length > 0
                    ? [...product.sizes]
                    : ["XS", "S", "M", "L", "XL"],
              });
            }}
          >
            Edit Product
          </Button>
          <Button variant="destructive" onClick={() => handleDelete(product?._id || product?.id)}>
            Delete
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminProductTile;
