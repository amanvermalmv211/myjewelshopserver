import mongoose from 'mongoose';
const {Schema} = mongoose;

const MetalPrice = new Schema({
    goldprice:{
        type: String,
        required: true,
        unique: true
    },
    silverprice:{
        type: String,
        required: true,
        unique: true
    }
});

const Metalprice = mongoose.model('metalprice', MetalPrice);
Metalprice.createIndexes();

export default Metalprice;