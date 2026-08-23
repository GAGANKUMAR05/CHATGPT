import chatModel from "../models/chat.model.js"



const createChat = async (req,res)=>{
    const {title} = req.body

    const user= req.user

    const chat = await chatModel.create({
        user: user._id,
        title
    });

    res.status(201).json({
        message:"Chat created successfully",
        title: chat.title,
        lastActivity : chat.lastActivity
    })
}



export {
    createChat
}