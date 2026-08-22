import express from 'express'
import { registerController } from '../controllers/auth.controllers';

const authRoutes = express.Router();



authRoutes.post('/register',registerController)




export default authRoutes