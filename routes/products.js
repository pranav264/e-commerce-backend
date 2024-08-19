const router = require('express').Router();
const { client } = require('../db');
const { Users, Products } = require('../models');
const tokenHandler = require("../tokenHandler");
const sendStatus = require("../helper");
const { ObjectId } = require('mongodb');
require('dotenv').config();

router.get("/get", async (req, res) => {
    await client.connect();

    const products = Products.find();
    let products_array = [];

    for await (const product of products) {
        if(product["quantity"] < 10 && product["quantity"] > 0) {
            product["inventoryStatus"] = "LOWSTOCK"
        }
        else if(product["quantity"] === 0) {
            product["inventoryStatus"] = "OUTOFSTOCK"
        }
        else {
            product["inventoryStatus"] = "INSTOCK"
        }
        products_array.push(product);
    }

    sendStatus(res, products_array);
})

router.post("/addToCart", async (req, res) => {
    try {
        const username = req.body.username;
        const productId = req.body.productId;
        const token = req.headers.authorization;
        
        const verify = tokenHandler(username, token);
        if(verify) {
            await client.connect();
            
            await Users.updateOne({ username: username }, {
                $addToSet: {
                    cart: productId
                }
            })
            
            sendStatus(res, "Item added to cart");
        }
        else {
            sendStatus(res, "Unauthorized access");
        }
    } catch (error) {
        sendStatus(res, "Please Try Again");
    }
})

router.post("/removeFromCart", async (req, res) => {
    try {
        const username = req.body.username;
        const productId = req.body.productId;
        const token = req.headers.authorization;
        
        const verify = tokenHandler(username, token);
        if(verify) {
            await client.connect();
            
            await Users.updateOne({ username: username }, {
                $pull: {
                    cart: productId
                }
            })
            
            sendStatus(res, "Item removed from cart");
        }
        else {
            sendStatus(res, "Unauthorized access");
        }
    } catch (error) {
        sendStatus(res, "Please Try Again");
    }
})

router.get("/getCart/:username", async (req, res) => {
    const username = req.params.username;
    const token = req.headers.authorization;
        
    const verify = tokenHandler(username, token);
    if(verify) {
        await client.connect();

        const user = await Users.findOne({ username: username });
        let cart = [];
        for (const productId of user.cart) {
            const objId = ObjectId.createFromHexString(productId);
            const product = await Products.findOne({ _id: objId });
            delete product["boughtBy"];
            cart.push(product);
        }

        sendStatus(res, cart);
    }
    else {
        sendStatus(res, "Unauthorized access");
    }   
})

router.post("/purchaseCart", async (req, res) => {
    try {
    const username = req.body.username;
    const token = req.headers.authorization;
        
    const verify = tokenHandler(username, token);
    if(verify) {
        await client.connect();

        const user = await Users.findOne({ username: username });
        for (const productId of user.cart) {
            const objId = ObjectId.createFromHexString(productId);
            await Products.updateOne({ _id: objId }, {
                $push: {
                    boughtBy: user._id.toString()
                },
                $inc: {
                    quantity: -1
                }
            })
        }

        await Users.updateOne({ username: username }, {
            $set: {
                cart: []
            }
        })

        sendStatus(res, "Purchase complete");
    }
    else {
        sendStatus(res, "Unauthorized access");
    }
} catch (error) {
    sendStatus(res, "Please Try Again");
}
})

router.get("/get/:username", async (req, res) => {
    const username = req.params.username;
    const token = req.headers.authorization;
        
    const verify = tokenHandler(username, token);
    if(verify) {
        await client.connect();

        const user = await Users.findOne({ username: username });
        const products = Products.find({ boughtBy: user._id.toString() });
        let products_array = [];
        for await (const product of products) {
            let counter = 0;
            product.boughtBy.forEach((id, index) => {
                if(id === user._id.toString()) {
                    counter++;
                }
            })

            product["noOfTimesPurchased"] = counter;

            delete product["boughtBy"];

            products_array.push(product);
        }

        sendStatus(res, products_array);
    }
    else {
        sendStatus(res, "Unauthorized access");
    }
})

module.exports = router;