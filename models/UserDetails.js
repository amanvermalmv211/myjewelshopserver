import mongoose from 'mongoose';
const {Schema} = mongoose;

const UserDetailSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
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
    }
});

const Userdetail = mongoose.model('userdetail', UserDetailSchema);
Userdetail.createIndexes();

export default Userdetail;