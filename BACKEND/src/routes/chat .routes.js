import express from 'express'
import authMiddleware from './../middlewares/auth.middleware.js';
import { createChat } from '../controllers/chat.controller.js';


const chatRoutes = express.Router()


chatRoutes.post('/',authMiddleware,createChat)


export default chatRoutes