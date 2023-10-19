const express = require("express");
const {ProductModel}=require("../model/productmodel")
const {CartProductModel} = require("../model/cartModel"); // Replace with your actual cart model

const cartRouter = express.Router();



// Route to get cart items

cartRouter.get("/", async (req, res) => {
    const productIds = req.query.productIds; // Assuming productIds is an array of product IDs passed in the query parameters
    
    try {
        // Find products with the specified IDs
        const products = await ProductModel.find({ _id: { $in: productIds } });

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found.' });
        }

        // Return the array of products
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});

// Route to add item to cart
cartRouter.post("/add", async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        // Check if the product is already in the cart
        let cartItem = await CartProductModel.findOne({ productId });
        if (cartItem) {
            // If the product is in the cart, send a response indicating it's already in the cart
            return res.status(200).json({ message: "Product already in the cart" });
        } else {
            // If the product is not in the cart, create a new cart item
            cartItem = new CartProductModel({ productId, quantity });
            // Save the cart item to the database
            await cartItem.save();
            return res.status(201).json({ message: "Item added to cart", cartItem });
        }
    } catch (error) {
        res.status(400).json({ error: "Bad Request", message: error.message });
    }
});

// Route to remove item from cart
cartRouter.delete("/remove/:id", async (req, res) => {
    const cartItemId = req.params.id;
    try {
        const cartItem = await CartProductModel.findByIdAndRemove(cartItemId);
        if (cartItem) {
            res.status(200).json({ message: "Item removed from cart", cartItem });
        } else {
            res.status(404).json({ error: "Not Found", message: "Cart item not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});

module.exports = {
    cartRouter
};
