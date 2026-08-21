import mongoose from 'mongoose'


const connetToDb = async ()=>{
    try{

        await mongoose.connect(process.env.MONGODB_URL)
    }catch(err)
    {
        console.error("Error connecting to mongodb: ",err)
    }
}


export default connectToDb