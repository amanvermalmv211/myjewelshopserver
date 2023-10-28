import dotenv from 'dotenv';
import express from 'express';
import { body, validationResult } from 'express-validator';
import fetchadmin from '../middleware/fetchadmin.js';
import Necklacedet from '../models/Necklace.js';
import Allproducts from '../models/AllProducts.js';

dotenv.config();

const router = express.Router();

// Route 1: Get all product using : GET "/admin/allproducts/getproducts" --> Login not required
router.post('/getproducts', [
    body('name', "ProductnName can not be empty").exists(),
], async (req, res) => {
    try {
        const { name } = req.body;
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        const product = await Allproducts.find({ name: name });
        res.json(product);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 2: Add Products using : POST "/admin/allproducts/addproducts" --> Login required
router.post('/addproducts', fetchadmin, [
    body('name', "Name can not be empty").exists(),
    body('imglink', "Image link can not be empty").exists(),
    body('weight', "Weight can not be empty").exists(),
    body('ktgold', "Gold kt can not be empty").exists(),
    body('makingcharge', "Making Charge can not be empty").exists(),
    body('finalmakingcharge', "Final making charge can not be empty").exists(),
    body('gst', "GST can not be empty").exists(),
    body('quantity', "Quantity of the necklage can not be empty").exists()
], async (req, res) => {
    try {
        const { name, imglink, weight, ktgold, makingcharge, finalmakingcharge, gst, quantity } = req.body;

        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        const productDet = new Allproducts({ name: name, imglink: imglink, weight: weight, ktgold: ktgold, makingcharge: makingcharge, finalmakingcharge: finalmakingcharge, gst: gst, quantity: quantity });
        const saveProductdet = await productDet.save();

        res.json(saveProductdet);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 3: Update an Product using : PUT "/admin/allproducts/updateproducts" --> Login required
router.put('/updateproducts/:id', fetchadmin, async (req, res) => {
    try {
        const {name, imglink, weight, ktgold, makingcharge, finalmakingcharge, gst, quantity} = req.body;
        const newProduct = {};
        if(name){newProduct.name = name};
        if(imglink){newProduct.imglink = imglink};
        if(weight){newProduct.weight = weight};
        if(ktgold){newProduct.ktgold = ktgold};
        if(makingcharge){newProduct.makingcharge = makingcharge};
        if(finalmakingcharge){newProduct.finalmakingcharge = finalmakingcharge};
        if(gst){newProduct.gst = gst};
        if(quantity){newProduct.quantity = quantity};

        //Find the note to be updated and update it
        let productupd = await Allproducts.findById(req.params.id);
        if(!productupd){res.status(404).send("Not Found")};

        productupd = await Allproducts.findByIdAndUpdate(req.params.id, {$set: newProduct}, {new:true});
        res.json({productupd});

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});


// Route 4: Delete an Product using : DELETE "/admin/allproducts/deleteproducts" --> Login required
router.delete('/deleteproducts/:id', fetchadmin, async (req, res) => {
    try {
        let productdelete = await Allproducts.findById(req.params.id);
        if (!productdelete) { res.status(404).send("Not Found") };

        await Allproducts.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted" });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

export default router;  