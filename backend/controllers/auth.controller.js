import bcrypt from 'bcryptjs';
import crypto from "crypto";

import {User} from "../models/user.model.js"
import dotenv from "dotenv"

import { generateVerificationToken } from "../utils/verifyCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendPasswordResetEmail, sendVerificationEmail,sendWelcomeEmail,sendResetSuccessEmail } from "../gmailsmtp/email.js";


dotenv.config(); //to enable env file 


//signup endpoint handles (register)user email,name,pass ;
//save into db;hash pass;
//generate a verification string and send it to email;
//json out user data with pass:undefined
export const signUp = async(req,res)=>{
    const {email,password,name} = req.body; //destructing email,password,name
    try{

        if(!email || !password || !name){
            throw new Error("All fields are required")
        }

        const userAlreadyExists = await User.findOne({email});

        //Now if user already exits then userAlreadyExists will be true
        if(userAlreadyExists){
            throw new Error("User already Exist! Email occupied")
        }

        //we will store the hashed password in the database because (security rteason)
        const hashedPassword = await bcrypt.hash(password,10);
        //generate verification code
        const verificationToken = generateVerificationToken();

        //now we create a user
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken, //we will store the verification code too
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000  //time before token expires 24 hours
        })
        //save user to database
        await user.save();

        //jwt
        generateTokenAndSetCookie(res, user._id); //mongo saves user id key as such

        //Email Verification
        await sendVerificationEmail(user.email,verificationToken)  //we send the verifcaitonToken to check

        //success message on Signup
        res.status(201).json({success:true, message: "User registered successfully!",
            user:{
                ...user._doc,
                password:undefined, //so that in console it is not shown
            }
         });
    }
    catch(error){
        //catch error and show it
        res.status(400).json({success: false, message: error.message});  
    }    
}

//Endpoint to handle verify email : verification code is sent now we check and match that;
//If user is verified then we remove the verificationtoken and expire time from database 
//and then send a welcome email
export const verifyEmail = async(req,res)=>{
    const {code} = req.body;
    try{
        //fetch a user using .findOne
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now()} //this line is to check if still active 
        })

        if(!user){
            throw new Error("Invalid or Expired verification code")
        }


        //If user is verified then we remove the verificationtoken and expire time from database
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        //send a welcome email on success
        await sendWelcomeEmail(user.email,user.name);

        //success message on verification on server
        res.status(201).json({success:true, message: "User verified successfully!",
            user:{
                ...user._doc,
                password:undefined,
            }
         });
    }
    catch (error){
        return res.status(400).json({success: false,message:error.message})
    }

}

//Endpoint to login
//first check if user there using email(User.findOne({email})) and then fetch under user
//then check the password using bcrypt.compare(password,user.password)
//Generate a token and set cookie
//update user.lastLogin = new Date();
//return response on server
export const logIn = async(req,res)=>{
    const {email,password} = req.body;
    
    try{
        const user = await User.findOne({email});

        if(!user){
            throw new Error("User not registered!")
        }

        //check pass
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            throw new Error("Invalid Credentials!");
        }

        //set cookie for Login
        generateTokenAndSetCookie(res,user._id); //mongo saves user id key as such

        //change lastLogin
        user.lastLogin = new Date();
        await user.save();

        //response on server
        res.status(200).json({success:true, message: "Logged in successfully",
            user:{
                ...user._doc,
                password:undefined,
            }
        })
    }
    catch(error){
        console.log("Error in login",error)
        res.status(400).json({success: false, message: error.message});
    }
}

//logout endpoint clears user cookie ("made under name: token")
export const logOut =async(req,res)=>{
    res.clearCookie("token");
    res.status(200).json({success:true,message:"Logged out successfully"});

}

//forgot endpoint
//when click forgot pass then a input box will be there to user to fill registered email
//then a warning page and simultaneously if registerd then a reset passw email will be sent to user
//in the email, reset pass link is there 
//steps: generate a reset password token and set expiry after 1 hour
//update and save resetPasswordToken and resetPassExpiry
//send pass reset email with 'client + token' url
export const forgotPassword = async(req,res)=>{
    const {email} = req.body;

    try{
        const user = await User.findOne({email})

        //if email not registered
        if(!user){
            return res.status(400).json({success: false, message: "User not found!"});  
        }


        // Generate a reset password token
        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpiresAt = Date.now() + 1*60*60*1000;  //for 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        
        //save token and expiry date
        await user.save(); 

        //send pass reset email with client + token
        await sendPasswordResetEmail(user.email,`${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({success: true, message:"Password reset link sent to your email"});

    }
    catch(error){
        console.log("Error in Password reset",error)
        res.status(400).json({success: false, message: error.message});
    }
}

//reset pass endpoint
//fetch token and pass from the reset pass frontend page
//check on the basis of reset token and expiry
//Update pass: again hash pass and then update user.pass
//then undefine resetpasstoken and expiry 
//save user and then send reset success mail
export const resetPassword = async(req,res)=>{
    

    try {
        const {token} = req.params;
        const {password} = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()} //if expired 
        });

        if(!user){
            // return new Error("Invalid or expired reset token")
            return res.status(400).json({success: false, message: "Invalid or expired reset token"});  
        }

        //update password
        const hashedPassword = await bcrypt.hash(password,10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        
        
        //save user 
        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({success:true,message:"Password reset successful"})
    } catch (error) {
        console.log("Error in resetPassword",error)
        res.status(400).json({success:false,message: error.message});
    }

}

//what does it do
export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};