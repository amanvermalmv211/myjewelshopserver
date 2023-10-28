import mongoose from 'mongoose';
const { Schema } = mongoose;

const Necklace = new Schema({
    name: {
        type: String,
        default: "Necklace"
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
        required: true
    },
    makingcharge: {
        type: String,
        default: ""
    },
    finalmakingcharge: {
        type: String,
        required: true
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

const Necklacedet = mongoose.model('necklace', Necklace);
Necklacedet.createIndexes();

export default Necklacedet;