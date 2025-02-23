import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import {connectDB} from './db/db.js'
import authRoutes from "./routes/auth.route.js"  //imported router
import cors from "cors";  //CORS IS TO BIND FRONTEND and BACKEND running on different ports

//for production
import path from "path";
const __dirname = path.resolve();
//--
const port = process.env.PORT || 5000; 
const app = express();

app.use(cors({origin: "http://localhost:5173", credentials: true}))  //we send the cookies through this line to backend

dotenv.config(); //to enable env file 
app.use(cookieParser());

app.use(express.json())
app.use("/api/auth",authRoutes)  //to use routers

//for production
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}


app.listen(port, () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
});

