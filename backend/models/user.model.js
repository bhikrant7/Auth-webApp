//here we create the schema

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            required: true,
            unique: true
        },
        password:{
            type:String,
            required: true
        },
        name:{
            type: String,
            required: true
        },
        lastLogin:{
            type:Date,
            default: Date.now  // i.e default the current time will be added
        },
        isVerified:{
            type: Boolean,
            default: false    //this field tracks if the user is verified
        },

        resetPasswordToken: String,   
        resetPasswordExpiresAt: Date,
        verificationToken: String,
        verificationTokenExpiresAt:Date,
    },
    {
        timestamps: true
    }
);


export const User = mongoose.model("User",userSchema);