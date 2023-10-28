import mongoose from 'mongoose';
const {Schema} = mongoose;

const PinCode = new Schema({
    pin:{
        type: String,
        required: true,
        unique: true
    }
});

const Pin = mongoose.model('pincode', PinCode);
Pin.createIndexes();

export default Pin;