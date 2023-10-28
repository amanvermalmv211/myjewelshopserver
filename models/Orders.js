import mongoose from 'mongoose';
const { Schema } = mongoose;

const Orders = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: String,
        required: true,
    },
    prodid: {
        type: String,
        required: true,
    },
    imglink: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true
    },
    makingcharge: {
        type: String,
        default: ""
    },
    price: {
        type: String,
        required: true
    },
    locaddress:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    pin:{
        type: String,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    phoneno:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    isdelivered:{
        type: String,
        required: true
    }
});

const Userorder = mongoose.model('order', Orders);
Userorder.createIndexes();

export default Userorder;