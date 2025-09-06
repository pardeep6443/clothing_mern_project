import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator.jsx";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { fetchProductDetails, setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";


import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Truck, Shield, RotateCcw, Sparkles } from 'lucide-react';
// import { Product } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useParams } from "react-router-dom";
import axios from "axios";

function ProductDetailsDialog({
  productDetails,
}) {

  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { toast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // const [selectedColor, setSelectedColor] = useState(productDetails.colors[0]);
  // const [quantity, setQuantity] = useState(1);

  const { productId } = useParams();
  console.log(productId);

  const dispatch = useDispatch();

  const item = useSelector((state) => state.shopProducts.productDetails);
  console.log(item);


  useEffect(() => {
    if (!item || item.productId !== productId) {
      dispatch(fetchProductDetails(productId));
    }
  }, [dispatch, productId]);

  if (!item) return <p>No product found.</p>;


  function handleRatingChange(getRating) {
    console.log(getRating, "getRating");

    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleAddReview() {
    dispatch(
      addReview({
        Id: productId,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productId));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  // useEffect(() => {
  //    if (item !== null) dispatch(getReviews(productId));
  // }, [item]);

  console.log(reviews, "reviews");

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
      reviews.length
      : 0;


  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % item.image.length);
  };
  console.log(item.image.length);
  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + item.image.length) % item.image.length);
  };

  return ( 
 <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 pt-15">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-[5/5] rounded-2xl overflow-hidden bg-muted">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <img
                  src={item.image[selectedImageIndex]}
                  alt={item.title}
                  fill
                  className="object-cover "
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {item.image.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Badges */}
            {/* <div className="absolute top-4 left-4 flex flex-col gap-2">
              {item.isNew && (
                <Badge className="bg-brand-accent text-white">NEW</Badge>
              )}
              {item.isOnSale && (
                <Badge className="bg-destructive text-white">SALE</Badge>
              )}
            </div> */}
          </div>

          {/* Thumbnail Gallery */}
          {item.image.length > 1 && (
            <div className="flex space-x-4 overflow-x-auto">
              {item.image.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative flex-none w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors",
                    selectedImageIndex === index
                      ? "border-border hover:border-foreground/50"
                      : "border-foreground"
                  )}
                >
                  <img
                    src={image}
                    alt={`${item.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-grotesk font-black text-yellow-50 mb-2">
                  {item.title}
                </h1>
                <p className="text-yellow-50 text-2xl mb-2">
                  {item.description}
                </p>
                <p className="text-muted-foreground capitalize">
                  {item.category}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.floor(averageReview)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({averageReview.toFixed(2)})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3">
                <p
                  className={`text-3xl font-bold text-yellow-50 ${item.salePrice > 0 ? "line-through" : ""
                    }`}
                >
                  ${item.price}
                </p>
                {item.salePrice > 0 ? (
                  <p className="text-2xl font-bold text-yellow-50">
                    ${item.salePrice}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Product Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Color Selection */}
            {/* <div>
                  <h3 className="font-grotesk font-bold text-sm uppercase tracking-wide mb-3">
                    Color: {selectedColor.name}
                  </h3>
                  <div className="flex space-x-3">
                    {productDetails.colors.map((color) => (
                      <motion.button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedImageIndex(0);
                        }}
                        className={cn(
                          "relative w-10 h-10 rounded-full border-2 transition-all",
                          selectedColor.name === color.name
                            ? "border-foreground scale-110"
                            : "border-muted hover:border-foreground"
                        )}
                        style={{ backgroundColor: color.value }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="sr-only">{color.name}</span>
                        {selectedColor.name === color.name && (
                          <div className="absolute inset-0 rounded-full border-2 border-background" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div> */}

            {/* Size Selection */}
            {/* <div>
                  <h3 className="font-grotesk font-bold text-sm uppercase tracking-wide mb-3">
                    Size
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {productDetails?.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "px-4 py-3 text-sm font-medium rounded-lg border transition-all",
                          selectedSize === size
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background text-foreground border-border hover:border-foreground"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div> */}

            {/* Quantity */}
            {/* <div>
              <h3 className="font-grotesk font-bold text-sm uppercase tracking-wide mb-3">
                Quantity
              </h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div> */}
          </motion.div>

          <Separator />

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {productDetails?.totalStock === 0 ? (
                <Button className="w-full opacity-60 text-yellow-50">
                  Out of Stock
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    handleAddToCart(
                      item?._id,
                      item?.totalStock
                    )
                  }
                  className="sm:col-span-2 bg-gray-800 hover:bg-gray-900 text-yellow-50 font-medium py-6 text-lg group"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin text-yellow-400" />
                  Add to Cart
                </Button>
              )}
              {/* <Button
                    variant="outline"
                    onClick={handleToggleWishlist}
                    className={cn(
                      "font-medium py-6",
                      isInWishlist(productDetails.id)
                        ? "bg-brand-accent text-white border-brand-accent hover:bg-brand-accent/90"
                        : ""
                    )}
                    size="lg"
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5",
                        isInWishlist(productDetails.id) && "fill-current"
                      )}
                    />
                    <span className="sr-only">Add to Wishlist</span>
                  </Button> */}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2 text-sm">
              {item?.totalStock === 0 ? (
                <p className="w-full opacity-60">
                  Out Of Stock
                </p>
              ) : (
                <p>
                  <span className=" text-green-600 font-medium">In Stock</span>
                  <span className="text-muted-foreground"> • Ships within 1-2 business days</span>
                </p>
              )}
            </div>
          </motion.div>

          <Separator />

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
              <Truck className="w-5 h-5 text-brand-accent" />
              <div>
                <div className="font-medium text-sm">Free Shipping</div>
                <div className="text-xs text-accent-foreground">Orders over $100</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
              <RotateCcw className="w-5 h-5 text-brand-accent" />
              <div>
                <div className="font-medium text-sm">Easy Returns</div>
                <div className="text-xs text-accent-foreground">30-day window</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
              <Shield className="w-5 h-5 text-brand-accent" />
              <div>
                <div className="font-medium text-sm">Quality Guarantee</div>
                <div className="text-xs text-accent-foreground">Premium materials</div>
              </div>
            </div>
          </motion.div>

          <Separator />
          <div className="text-yellow-50">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="grid gap-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem) => (
                  <div className="flex gap-4">
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{reviewItem?.userName}</h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <h1>No Reviews</h1>
              )}
            </div>
            <div className="mt-10 flex-col flex gap-2">
              <Label>Write a review</Label>
              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="Write a review..."
              />
              <Button
                onClick={handleAddReview}
                disabled={reviewMsg.trim() === ""}
              >
                Submit
              </Button>
            </div>
          </div>

          <Separator />


          {/* Product Details Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-yellow-50"
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="font-grotesk font-bold">
                  Description
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-yellow-50 leading-relaxed">
                    {item.description}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sizing">
                <AccordionTrigger className="font-grotesk font-bold">
                  Size & Fit
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-yellow-50">
                    <p>Model is 6'0" and wearing size M</p>
                    <p>Regular fit</p>
                    <p>True to size</p>
                    <Button variant="link" className="p-0 h-auto text-brand-accent">
                      View size guide
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care">
                <AccordionTrigger className="font-grotesk font-bold">
                  Care Instructions
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 text-yellow-50">
                    <p>Machine wash cold</p>
                    <p>Tumble dry low</p>
                    <p>Do not bleach</p>
                    <p>Iron on medium heat</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="font-grotesk font-bold">
                  Shipping & Returns
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-yellow-50">
                    <p><strong>Shipping:</strong> Free on orders over $100. Standard delivery 3-5 business days.</p>
                    <p><strong>Returns:</strong> 30-day return window. Items must be unworn with tags attached.</p>
                    <Button variant="link" className="p-0 h-auto text-brand-accent">
                      Full return policy
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </div>

    </div>

  );
}

export default ProductDetailsDialog;