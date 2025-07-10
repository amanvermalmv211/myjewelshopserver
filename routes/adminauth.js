import dotenv from 'dotenv';
import express from 'express';
import Admin from '../models/OnlyAdmin.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetchadmin from '../middleware/fetchadmin.js';
import Pin from '../models/PinCode.js';
import Metalprice from '../models/MetalPrice.js';
import Orders from '../models/Orders.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


// Route 1 : Create admin using : POST "/admin/adminauth/createadmin"
router.post('/createadmin', [
    body('name', "Enter a valid name min char is 3").isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ success, error: error.array() });
    }
    try {
        // check whether the admin with the email exists already.
        let admin = await Admin.findOne({ email: req.body.email });
        if (admin) {
            return res.status(400).json({ success, error: "Sorry a admin with this email already exists." })
        }

        // Creating secure password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Creating new Admin
        admin = await Admin.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });

        const data = {
            admin: {
                id: admin.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;

        res.json({ success, authtoken });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server error occured.");
    }

});

// Route 2 : Authanticate an Admin using : POST "/admin/adminauth/loginadmin".
router.post('/loginadmin', [
    body('email', "Enter a valid email").isEmail(),
    body('password', "Password cann't be blank").exists()
], async (req, res) => {
    let success = false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ success, error: error.array() });
    }

    const { email, password } = req.body;
    try {
        let admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, admin.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const data = {
            admin: {
                id: admin.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server error occured.");
    }

});


// Route 3 : Get loggedin admin Details using : POST "/admin/adminauth/getadmin". Required login.
router.post('/getadmin', fetchadmin, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const admin = await Admin.findById(adminId).select("-password")
        res.send(admin);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 4: Add a new PIN Code using : POST "/admin/adminauth/addpin" --> Login required
router.post('/addpin', fetchadmin, [
    body('pincode', "pincode can not be empty").exists()
], async (req, res) => {
    try {
        const { pincode } = req.body;

        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }
        const pin = new Pin({ pin: pincode });
        const savePin = await pin.save();

        res.json(savePin);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 5: Get all the PinCode using : GET "/admin/adminauth/getpin" --> Login required
router.get('/getpin', async (req, res) => {
    try {
        const pinCode = await Pin.find();
        res.json(pinCode);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 6: Delete an existing PINCode using : DELETE "/admin/adminauth/deletepin" --> Login required
router.delete('/deletepin/:id', fetchadmin, async (req, res) => {
    try {
        //Find the note to be deleted and delete it
        let pinCode = await Pin.findById(req.params.id);
        if (!pinCode) { res.status(404).send("Not Found") };

        const pinC = await Pin.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted", pin: pinC });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 7: Add Metal price using : POST "/admin/adminauth/addmetalprice" --> Login required
router.post('/addmetalprice', fetchadmin, [
    body('goldprice', "Gold price can not be empty").exists(),
    body('silverprice', "Silver price can not be empty").exists()
], async (req, res) => {
    try {
        const { goldprice, silverprice } = req.body;

        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        const metalprice = new Metalprice({ goldprice: goldprice, silverprice: silverprice });
        const saveMetalprice = await metalprice.save();

        res.json(saveMetalprice);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 8: Get all Metal price using : GET "/admin/adminauth/getmetalprice" --> Login not required
router.get('/getmetalprice', async (req, res) => {
    try {
        const metalprice = await Metalprice.find();
        res.json(metalprice);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 9: Update the Metal Price using : PUT "/admin/adminauth/updatemetalprice" --> Login required
router.put('/updatemetalprice/:id', fetchadmin, async (req, res) => {
    try {
        const { goldprice, silverprice } = req.body;
        const newPrice = {};
        if (goldprice) { newPrice.goldprice = goldprice };
        if (silverprice) { newPrice.silverprice = silverprice };

        //Find the note to be updated and update it
        let metals = await Metalprice.findById(req.params.id);
        if (!metals) { res.status(404).send("Not Found") };

        metals = await Metalprice.findByIdAndUpdate(req.params.id, { $set: newPrice }, { new: true });
        res.json({ metals });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 8 : Get order details using : GET "/admin/adminauth/getorderdetails". Required login.
router.get('/getorderdetails', fetchadmin, async (req, res) => {
    try {
        const orderdetail = await Orders.find();
        res.json(orderdetail);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 9: Delete order using : DELETE "/admin/adminauth/deleteorder" --> Login required
router.delete('/deleteorder/:id', fetchadmin, async (req, res) => {
    try {
        //Find the note to be deleted and delete it
        let orderdetail = await Orders.findById(req.params.id);
        if (!orderdetail) { res.status(404).send("Not Found") };

        await Orders.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted" });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 10: Update delivered order using : PUT "/admin/adminauth/updateorder" --> Login required
router.put('/updateorder/:id', fetchadmin, [
    body('isdelivered', "Boolean value can not be empty").exists()
], async (req, res) => {
    try {
        const { isdelivered } = req.body;
        const newOrder = {};
        if (isdelivered) { newOrder.isdelivered = isdelivered };

        let orderdetail = await Orders.findById(req.params.id);
        if (!orderdetail) { res.status(404).send("Not Found") };

        orderdetail = await Orders.findByIdAndUpdate(req.params.id, { $set: newOrder }, { new: true });
        res.json({ orderdetail });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

export default router;