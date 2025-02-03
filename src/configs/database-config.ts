import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI! as string);
    console.log("Connected to Database");
  } catch (error) {
    console.log("Error Connecting to Server " + error + "\n " + process.env.MONGOURI);
  }
};

export default connectDB;
