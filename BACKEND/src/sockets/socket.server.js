import {Server} from 'socket.io'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { userModel } from '/models/user.model.js';
import { generateResponse } from '../service/ai.service.js';
import messageModel from '../models/message.model.js';


function initSocketServer(httpServer){
    const io = new Server(httpServer,{})

    io.use(async (socket,next)=>{
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        (!cookies.token)
        {
            next(new Error("Authentication error: No token provided"))
        }

        try{
            const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET);

            const user = await userModel.findById(decoded.id)
            socket.user =user 
            next()
        }catch(err){ next(new Error("Authentication error: No token provided"))}
    })

    io.on("connection" , async(socket)=>{
        socket.on("ai-message",async(messagePayload)=>{
            await messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content: messagePayload.content,
                role:"user"
            })


            const chatHistory = (await messageModel.find({
                chat:messagePayload.chat
            }).sort({createdAt:-1}).limit(20).lean()).reverse()

           
            const response = await generateResponse( chatHistory.map(item=>{
                return {
                    role: item.role,
                    parts: [{text : item.content}]
                }
            }))

            await messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content: response,
                role:"model"
            })

            socket.emit('ai-response',{
                content:response,
                chat:messagePayload.chat
            })
        })
    })

}

export default initSocketServer