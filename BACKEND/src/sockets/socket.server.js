import {Server} from 'socket.io'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { userModel } from '/models/user.model.js';
import { generateResponse, generateVector } from '../service/ai.service.js';
import messageModel from '../models/message.model.js';
import { createMemory, queryMemory } from '../service/vector.service.js';


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
           const message =  await messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content: messagePayload.content,
                role:"user"
            })

            const memory = await queryMemory({
               queryVector:vectors,
               limit:3,
               metadata:{}
            })
            
            const vectors = await generateVector(messagePayload.content)
             await createMemory({
                vectors,
                messageId:message._id,
                metadata:{
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    text: messagePayload.content
                }
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

           const responseMessage =  await messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content: response,
                role:"model"
            })

            const responseVectors  = await generateVector(response);

            await createMemory({
                vectors:responseVectors,
                messageId:responseMessage._id,
                metadata:{
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    text: response
                }
            })

            socket.emit('ai-response',{
                content:response,
                chat:messagePayload.chat
            })
        })
    })

}

export default initSocketServer