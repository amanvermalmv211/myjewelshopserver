import mongoose from 'mongoose';
const {Schema} = mongoose;

const RingsSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    tag:{
        type: String,
        default: "General"
    },
    date:{
        type: Date,
        default: Date.now
    }
});

const Rings = mongoose.model('ring', RingsSchema);
Rings.createIndexes();

export default Rings;