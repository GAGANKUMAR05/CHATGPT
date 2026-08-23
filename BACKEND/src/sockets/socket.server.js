import {Server} from 'socket.io'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { userModel } from '/models/user.model.js';
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

    io.on("connection" , (socket)=>{
        console.log("New socket connection: ",socket.id)
    })

}

export default initSocketServer