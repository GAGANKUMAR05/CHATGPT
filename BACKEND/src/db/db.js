import mongoose from 'mongoose'


const connectToDb = async ()=>{
    try{

        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB connected successfully");
    }catch(err)
    {
        console.error("Error connecting to mongodb: ",err)
    }
}


export default connectToDb





