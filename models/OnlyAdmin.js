import mongoose from 'mongoose';
const {Schema} = mongoose;

const AdminSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        unique: true
    }
});

const Admin = mongoose.model('admin', AdminSchema);
Admin.createIndexes();

export default Admin;