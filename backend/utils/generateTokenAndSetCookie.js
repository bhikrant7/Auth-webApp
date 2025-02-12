import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res,userId) =>{
    //create the token
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn: "7d",
    })

    //set it into cookie("token")
    res.cookie("token",token,{
        httpOnly: true,  //cannot be accessed by client side js
        secure: process.env.NODE_ENV ==="production",
        sameSite: "strict",
        maxAge:7 * 24 * 60 * 60 * 1000,
    });
}