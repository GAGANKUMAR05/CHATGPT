
import userModel from '../models/user.model.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'



const registerController = async (req,res)=>{
    try{

        const {fullName:{firstName,lastName},email,password} = req.body
        
        const isUserAlreadyRegistered = await userModel.findOne({email})
        
        if(isUserAlreadyRegistered)
            {
                return res.status(400).json({message:"User already exists"});
            }

        const hash = await bcrypt.hash(password,10);
        const user = await userModel.create({
            fullName:{
                firstName,lastName
            },
            email,
            password:hash
        })

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

        res.cookie("token",token)

        res.status(201).json({
            message:"User registered successfully",
            user:{
                email:user.email,
                _id: user._id,
                fullName:user.fullName
            }
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message:"Internal server error"
        })
        process.exit(1);
    }
}

const  loginController = async (req,res)=>{
    try{

        
        const {email,password} = req.body;

    const user = await userModel.findOne({email})

    if(!user){
           return res.status(400).json({message:"Invaild email or password"})
    }

    const isPasswordValid = await bcrypt.compare(password,user.password);

    if(!isPasswordValid)
    {
        return res.status(400).json({message:"Invalid email or password"});
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET);

    res.cookie("token",token)

    res.status(200).json({
        message:"User logged in successfully  "
    })
   }catch(err)
   {
    console.log(err)
    return res.status(500).json({
        message:"Internal server error"
    })
    process.exit(1);
   }
}




export {
    registerController,
    loginController
}