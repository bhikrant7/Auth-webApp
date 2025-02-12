import mongoose from "mongoose";

export const connectDB = async()=>{
try{
const conn = await mongoose.connect(process.env.MONGO_URI);
console.log(`MongoDB connected at: ${conn.connection.host}`); //host name displayed on successful connection
}
catch(error){
console.error(`${error.message}`);
process.exit(1)  // process code 1 means exit and 0 means success
}
}