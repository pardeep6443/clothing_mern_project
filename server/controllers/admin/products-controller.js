const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

const handleMultipleImageUpload = async (req, res) => {
  try {
    const urls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const url = "data:" + file.mimetype + ";base64," + b64;
        const uploadRes = await imageUploadUtil(url);
        urls.push(uploadRes.secure_url || uploadRes.url || url);
      }
    }
    res.json({
      success: true,
      results: urls.map((u) => ({ url: u })),
      urls,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      sizes,
      isPreOrder,
      preOrderReleaseDate,
    } = req.body;

    console.log(averageReview, "averageReview");

    let formattedSizes = ["XS", "S", "M", "L", "XL"];
    if (Array.isArray(sizes) && sizes.length > 0) {
      formattedSizes = sizes.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof sizes === "string" && sizes.trim()) {
      formattedSizes = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    }

    let formattedImages = [];
    if (Array.isArray(images) && images.length > 0) {
      formattedImages = images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
    } else if (Array.isArray(image) && image.length > 0) {
      formattedImages = image.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
    } else if (typeof image === "string" && image.trim()) {
      formattedImages = [image.trim()];
    }
    const mainImage = formattedImages[0] || (typeof image === "string" ? image : "") || "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80";
    if (formattedImages.length === 0) formattedImages = [mainImage];

    const newlyCreatedProduct = new Product({
      image: mainImage,
      images: formattedImages,
      title,
      description,
      category,
      brand,
      price: price === "" ? 0 : Number(price) || 0,
      salePrice: salePrice === "" ? 0 : Number(salePrice) || 0,
      totalStock: totalStock === "" ? 0 : Number(totalStock) || 0,
      averageReview: Number(averageReview) || 0,
      sizes: formattedSizes.length > 0 ? formattedSizes : ["XS", "S", "M", "L", "XL"],
      isPreOrder: isPreOrder === true || isPreOrder === "true",
      preOrderReleaseDate: preOrderReleaseDate ? String(preOrderReleaseDate).trim() : "",
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      sizes,
      isPreOrder,
      preOrderReleaseDate,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    findProduct.title = title !== undefined ? title : findProduct.title;
    findProduct.description = description !== undefined ? description : findProduct.description;
    findProduct.category = category !== undefined ? category : findProduct.category;
    findProduct.brand = brand !== undefined ? brand : findProduct.brand;
    findProduct.price = price === "" ? 0 : (price !== undefined ? Number(price) : findProduct.price);
    findProduct.salePrice =
      salePrice === "" ? 0 : (salePrice !== undefined ? Number(salePrice) : findProduct.salePrice);
    findProduct.totalStock = totalStock !== undefined ? Number(totalStock) : findProduct.totalStock;

    if (images !== undefined && Array.isArray(images) && images.length > 0) {
      const formattedImages = images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
      findProduct.images = formattedImages;
      findProduct.image = formattedImages[0];
      findProduct.markModified("images");
    } else if (image !== undefined && image !== "") {
      findProduct.image = image;
    }

    findProduct.averageReview = averageReview !== undefined ? Number(averageReview) : findProduct.averageReview;
    
    if (sizes !== undefined) {
      let formattedSizes = [];
      if (Array.isArray(sizes)) {
        formattedSizes = sizes.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof sizes === "string" && sizes.trim()) {
        formattedSizes = sizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
      findProduct.sizes = formattedSizes;
      findProduct.markModified("sizes");
    }

    if (isPreOrder !== undefined) {
      findProduct.isPreOrder = isPreOrder === true || isPreOrder === "true";
    }
    if (preOrderReleaseDate !== undefined) {
      findProduct.preOrderReleaseDate = String(preOrderReleaseDate).trim();
    }

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  handleImageUpload,
  handleMultipleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};