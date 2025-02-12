import { mailtrapClient, sender } from "./gmail.config.js";
import { VERIFICATION_EMAIL_TEMPLATE,WELCOME_EMAIL_TEMPLATE,PASSWORD_RESET_REQUEST_TEMPLATE,PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplate.js";


//this function is from our signup endpooint (auth controller)
//We send a verification email importing the client(transport) and sender from gmail.config
export const sendVerificationEmail = async (email, verificationToken) => {
    if (!email) {
        throw new Error("Recipient email is required");
    }

    try {
        const response = await mailtrapClient.sendMail({
            from: sender, // Use sender details
            to: email, // Recipient email from the controller
            subject: "Verify your email", // Email subject
            html: VERIFICATION_EMAIL_TEMPLATE.replace(
                "verificationCode",
                verificationToken
            ), // Email content with token
            category: "Email Verification"  ,
        });

        console.log("Email sent successfully:", response);
        return response; // Return response for further processing if needed
    } catch (error) {
        console.error(`Error sending verification email:`, error);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

//Through this function we send the welcome email after succesfull verification and added template
export const sendWelcomeEmail =async(email,name)=>{
    if (!email) {
        throw new Error("Recipient email is required");
    }

    // Define the dynamic values of the template variables
    const placeholders = {
        name: name || "User",
        imageURL: "https://res.cloudinary.com/dfqctp7bq/image/upload/q_auto:eco/v1683447608/rx-36/image_header/django11/sp_z2xtjk.png", // Replace with your actual image URL
        gettingStartedURL: "https://example.com/getting-started",
        communityURL: "https://example.com/community",
        supportURL: "https://example.com/support",
        unsubscribeURL: "https://example.com/unsubscribe",
        category: "Welcome Email",
    };

    // Replace placeholders in the template
    const emailContent = WELCOME_EMAIL_TEMPLATE.replace(
        /{(\w+)}/g,
        (_, key) => placeholders[key] || ""
    );

    try{
        await mailtrapClient.sendMail({
            from: sender, // Use sender details
            to: email, // Recipient email from the controller
            subject:"Welcome to BK Auth!",
            html: emailContent,  //send the template
        });
    }
    catch(error){
        console.error(`Error sending Welcome email:`, error);
        throw new Error(`Failed to send Welcome email: ${error.message}`);
    }
}

//this function sends a pass reset email and with necessary URL
export const sendPasswordResetEmail = async(email,resetURL)=>{
    if (!email) {
        throw new Error("Recipient email is required!");
    }
    try{
        const response = await mailtrapClient.sendMail({
            from: sender,
            to:email,
            subject:"Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}",resetURL),
            category:"Password Reset",
        });

        //console.log("Password reset email sent successfully",response);
    }
    catch(error){
        console.error(`Error sending password reset email:`, error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
}

//this function simply send a static success mail
export const sendResetSuccessEmail= async(email)=>{
    if (!email) {
        throw new Error("Recipient email is required!");
    }
    try{
        const response = await mailtrapClient.sendMail({
            from: sender,
            to:email,
            subject:"Password reset successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category:"Password Reset",
        });

        console.log("Password reset email sent successfully",response);
    }
    catch(error){
        console.error(`Error sending password reset success email:`, error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
}