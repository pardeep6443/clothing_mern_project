import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";

import { motion } from 'framer-motion';
import React, { useState } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,

}) {
  console.log(product);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <motion.Card className="w-full max-w-sm mx-auto cursor-pointer "
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    // onClick={() => navigate("/shop/productsdetails")}
    >
      <motion.div onClick={() => handleGetProductDetails(product?._id)}>
        <a href ={`/product/${product?._id}`}>
          <div className="relative overflow-hidden">
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full h-full"
            >
              <img
                src={product?.image}
                alt={product?.title}
                className="w-full h-[300px] object-cover rounded-t-lg"
              />
            </motion.div>
            {product?.totalStock === 0 ? (
              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                Out Of Stock
              </Badge>
            ) : product?.totalStock < 10 ? (
              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                {`Only ${product?.totalStock} items left`}
              </Badge>
            ) : product?.salePrice > 0 ? (
              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                Sale
              </Badge>
            ) : null}
          </div>
        </a>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-yellow-50">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-[16px] text-yellow-50">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${product?.salePrice > 0 ? "line-through" : ""
                } text-lg font-semibold text-yellow-50`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-semibold text-yellow-50">
                ${product?.salePrice}
              </span>
            ) : null}
          </div>
        </CardContent>
      </motion.div>
      <CardFooter>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
          className="relative left-0 right-0 flex gap-2"
        >
          {product?.totalStock === 0 ? (
            <Button className="w-full opacity-60 cursor-not-allowed">
              Out Of Stock
            </Button>
          ) : (
            <Button
              onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
              className="w-full cursor-pointer px-10 text-yellow-50"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to cart
            </Button>

          )}
          <a href ={`/product/${product?._id}`}>
          <Button
            onClick={() => handleGetProductDetails(product?._id)}
            variant="secondary"
            size="sm"
            className="px-3"
          >
            <Eye className="w-4 h-4" />
            <span className="sr-only">Quick View</span>
          </Button>
          </a>
        </motion.div>
      </CardFooter>

    </motion.Card>
  );
}

export default ShoppingProductTile;