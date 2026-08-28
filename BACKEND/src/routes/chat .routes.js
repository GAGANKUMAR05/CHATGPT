import express from 'express'
import authMiddleware from './../middlewares/auth.middleware.js';
import { createChat,getChats, getMessages} from '../controllers/chat.controller.js';


const chatRoutes = express.Router()


chatRoutes.post('/',authMiddleware,createChat)
chatRoutes.get( "/", authMiddleware, getChats );
chatRoutes.get('/',authMiddleware,getMessages)


export default chatRoutes