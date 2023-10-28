import mongoose from 'mongoose';
const { Schema } = mongoose;

const Allproducts = new Schema({
    name: {
        type: String,
        default: "Prod"
    },
    imglink: {
        type: String,
        required: true,
        unique: true
    },
    weight: {
        type: String,
        required: true
    },
    ktgold: {
        type: String,
        default: ""
    },
    makingcharge: {
        type: String,
        default: ""
    },
    finalmakingcharge: {
        type: String,
        default: ""
    },
    gst: {
        type: String,
        default: "3"
    },
    quantity: {
        type: String,
        required: true
    }
});

const allproducts = mongoose.model('allproduct', Allproducts);
allproducts.createIndexes();

export default allproducts;