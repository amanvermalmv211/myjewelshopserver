import dotenv from 'dotenv';
import express from 'express';
import User from '../models/User.js';
import Userdetails from '../models/UserDetails.js';
import Orders from '../models/Orders.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetchuser from '../middleware/fetchuser.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


// Route 1 : Create user using : POST "/user/userauth/createuser"
router.post('/createuser', [
    body('name', "Enter a valid name min char is 3").isLength({ min: 1 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8 })
], async (req, res) => {
    let success = false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ success, error: error.array() });
    }
    try {
        // check whether the user with the email exists already.
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user with this email already exists" })
        }

        // Creating secure password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Creating new Admin
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });

        const data = {
            user: {
                id: user.id
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

// Route 2 : Authanticate an User using : POST "/user/userauth/loginuser".
router.post('/loginuser', [
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
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
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

// Route : Check whether a user exists or not using : POST "/user/userauth/checkuser".
router.post('/checkuser', [
    body('email', "Enter a valid email").isEmail()
], async (req, res) => {
    let success = false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ success, error: error.array() });
    }

    const { email } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user with this email already exists" });
        }

        success = true;
        res.json({ success, message: "User doesn't exists" });

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server error occured.");
    }

});


// Route 3 : Taking loggedin user Details using : POST "/user/userauth/getuser". Required login.
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 4 : Get loggedin user Details using : GET "/user/userauth/userdetails". Required login.
router.get('/userdetails', fetchuser, async (req, res) => {
    try {
        const userdetail = await Userdetails.find({ user: req.user.id });
        res.json(userdetail);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 5: Adding user detail using : POST "/user/userauth/getuserdetail" --> Login required
router.post('/getuserdetail', fetchuser, [
    body('locaddress', "Local address can not be blank").exists(),
    body('city', "City can not be blank").exists(),
    body('pin', "PIN code can not be blank").exists(),
    body('state', "State can not be blank").exists(),
    body('phoneno').isMobilePhone()
], async (req, res) => {
    try {
        const { locaddress, city, pin, state, phoneno } = req.body;

        // If there are error, return the bad error and the errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }
        const userdetail = new Userdetails({
            locaddress, city, pin, state, phoneno, user: req.user.id
        });
        const saveUserdetail = await userdetail.save();

        res.json(saveUserdetail);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 6: Update an existing Address using : PUT "/user/userauth/updateuserdetail" --> Login required
router.put('/updateuserdetail/:id', fetchuser, async (req, res) => {
    try {
        const { locaddress, city, pin, state, phoneno } = req.body;
        // Create a newAddres object
        const newAddress = {};
        if (locaddress) { newAddress.locaddress = locaddress };
        if (city) { newAddress.city = city };
        if (pin) { newAddress.pin = pin };
        if (state) { newAddress.state = state };
        if(phoneno) {newAddress.phoneno = phoneno};

        //Find the address to be updated and update it
        let address = await Userdetails.findById(req.params.id);
        if (!address) { res.status(404).send("Not Found") };

        if (address.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        address = await Userdetails.findByIdAndUpdate(req.params.id, { $set: newAddress }, { new: true });
        res.json({ address });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 7: Adding order detail using : POST "/user/userauth/addorderdetails" --> Login required
router.post('/addorderdetails', fetchuser, [
    body('name', "Name can not be blank").exists(),
    body('prodid', "ID of order can not be blank").exists(),
    body('imglink', "Image link can not be blank").exists(),
    body('weight', "Weight can not be blank").exists(),
    body('makingcharge', "Making Charge can not be blank").exists(),
    body('price', "Price can not be blank").exists(),
    body('locaddress', "locaddress can not be blank").exists(),
    body('city', "city can not be blank").exists(),
    body('pin', "pin can not be blank").exists(),
    body('state', "state can not be blank").exists(),
    body('phoneno', "phoneno can not be blank").exists(),
    body('username', "User Name can not be blank").exists(),
    body('isdelivered', "User Name can not be blank").exists(),

], async (req, res) => {
    try {
        const { name, prodid, imglink, weight, makingcharge, price, locaddress, city, pin, state, phoneno, username, isdelivered } = req.body;

        // If there are error, return the bad error and the errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }
        const orderdetail = new Orders({
            name, prodid, imglink, weight, makingcharge, price, locaddress, city, pin, state, phoneno, username, isdelivered, user: req.user.id
        });
        const saveOrderdetail = await orderdetail.save();

        res.json(saveOrderdetail);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});


// Route 8 : Get order details using : GET "/user/userauth/getorderdetails". Required login.
router.get('/getorderdetails', fetchuser, async (req, res) => {
    try {
        const orderdetail = await Orders.find({ user: req.user.id });
        res.json(orderdetail);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured.");
    }
});

// Route 9: Delete order using : DELETE "/user/userauth/deleteorder" --> Login required
router.delete('/deleteorder/:id', fetchuser, async (req, res) => {
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

export default router;