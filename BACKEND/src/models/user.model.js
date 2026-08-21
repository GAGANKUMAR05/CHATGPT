import mongoose from 'mongoose'


const userSchema = new mongoos.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        }
    },
    password:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

const userModel =  mongoose.model('user',userSchema);

export default userModel