import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,  
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  images: [],
  title: "",
  description: "",
  category: [],
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  isPreOrder: false,
  preOrderReleaseDate: "",
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    const activeImages = Array.isArray(uploadedImageUrls) && uploadedImageUrls.length > 0
      ? uploadedImageUrls
      : uploadedImageUrl
      ? [uploadedImageUrl]
      : Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images
      : formData.image
      ? [formData.image]
      : [];

    const primaryImage = activeImages[0] || uploadedImageUrl || formData.image || "";

    const categoriesArray = Array.isArray(formData.category)
      ? formData.category.filter(Boolean)
      : typeof formData.category === "string" && formData.category.trim()
      ? formData.category.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const dataToSubmit = {
      ...formData,
      category: categoriesArray,
      categories: categoriesArray,
      image: primaryImage,
      images: activeImages,
    };

    if (currentEditedId !== null) {
      dispatch(
        editProduct({
          id: currentEditedId,
          formData: dataToSubmit,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setFormData(initialFormData);
          setUploadedImageUrl("");
          setUploadedImageUrls([]);
          setImageFile(null);
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          toast({
            title: "Product updated successfully",
          });
        } else {
          toast({
            title: data?.payload?.message || "Failed to update product",
            variant: "destructive",
          });
        }
      });
    } else {
      dispatch(
        addNewProduct(dataToSubmit)
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setOpenCreateProductsDialog(false);
          setImageFile(null);
          setUploadedImageUrl("");
          setUploadedImageUrls([]);
          setFormData(initialFormData);
          toast({
            title: "Product added successfully",
          });
        } else {
          toast({
            title: data?.payload?.message || "Failed to add product",
            variant: "destructive",
          });
        }
      });
    }
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({
          title: "Product deleted successfully",
        });
      }
    });
  }

  function isFormValid() {
    const requiredFields = ["title", "description", "price", "totalStock"];
    const hasRequired = requiredFields.every((key) => {
      const val = formData[key];
      return val !== undefined && val !== null && String(val).trim() !== "";
    });

    const hasCategory = Array.isArray(formData.category)
      ? formData.category.length > 0
      : Boolean(formData.category && String(formData.category).trim());

    const hasSizes = Array.isArray(formData.sizes) && formData.sizes.length > 0;
    const hasImage = Boolean(
      (uploadedImageUrls && uploadedImageUrls.length > 0) ||
      uploadedImageUrl ||
      formData.image ||
      (formData.images && formData.images.length > 0)
    );

    return hasRequired && hasCategory && hasSizes && hasImage;
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => {
          setFormData(initialFormData);
          setUploadedImageUrl("");
          setUploadedImageUrls([]);
          setCurrentEditedId(null);
          setOpenCreateProductsDialog(true);
        }}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem, index) => (
              <AdminProductTile
                key={`${productItem?._id || productItem?.id || "admin-prod"}-${index}`}
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                setUploadedImageUrl={setUploadedImageUrl}
                setUploadedImageUrls={setUploadedImageUrls}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            setUploadedImageUrl("");
            setUploadedImageUrls([]);
            setImageFile(null);
            setFormData(initialFormData);
          }
        }}
      >
        <SheetContent side="right" className="overflow-auto w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Save Changes" : "Create Product"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;