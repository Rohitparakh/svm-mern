import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import mongoose from "mongoose";
// @desc fetch all products
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc  fetch products for categories page
// @route GET /api/products/category
// @access Public
const getCategoryProducts = asyncHandler(async (req, res, next) => {
  const resultPerPage = 3;
  const productsCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();

  let products = await apiFeature.query;

  let filteredProductsCount = products.length;

  apiFeature.pagination(resultPerPage);

  products = await apiFeature.query.clone();

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
});

// @desc fetch single products
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc delete a product
// @route DELETE /api/products/
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc create a product
// @route POST /api/products/
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: "Sample name",
    price: 0,
    user: req.user._id,
    image: "/images/product-images/mouse.jpg",
    brand: "Sample Brand",
    category: ["Sample category", "sample", "category"],
    tag: ["Sample tag", "sample", "tag"],
    countInStock: 1,
    numReviews: 0,
    description: "Sample Description",
    discount: 10
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc update a product
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    model,
    weight,
    dimensions,
    material,
    price,
    description,
    image,
    brand,
    category,
    tag,
    countInStock,
  } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.sku = sku;
    product.model = model;
    product.weight = weight;
    product.dimensions = dimensions;
    product.material = material;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.tag = tag;
    product.countInStock = countInStock;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const id = req.params.id;
  // console.log({ rating, comment, id });
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    // console.log(alreadyReviewed);

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});


// @desc    Edit review
// @route   PUT /api/products/:id/reviews/:id
// @access  Private
const updateProductReview = asyncHandler(async (req, res) => {
  var {
    name,
    rating,
    comment,
    user,
    _id,

  } = req.body.review;
  _id = new mongoose.Types.ObjectId(_id);
  user = new mongoose.Types.ObjectId(user);


  const newReview = {
    name:name,
    rating: rating,
    comment: comment,
    user: user,
    _id: _id,
  }

  const productId = req.body.productId;
  const product = await Product.findById(productId);
  // console.log(product)

  
console.log(reviewIndex)
  if (product) {
     
    var reviewIndex = product.reviews.findIndex((review)=>{
      return review.name === name
    });
    console.log(reviewIndex)
    
    product.reviews[reviewIndex]=newReview
    
    // product.reviews[reviewIndex]=newReview;
  // console.log(product)
  // console.log(product.reviews[0]._id)
  // var istrue=(_id === product.reviews[0]._id)?true:false;
  // console.log(istrue)

    const updatedProduct = await product.save();
  // console.log(updatedProduct.reviews);

    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  updateProductReview,
  getCategoryProducts,
};
