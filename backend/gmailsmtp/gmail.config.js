import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

//NODEMAILER + GOOGLE   //BEST FOR TESTING :for how to google to allow check my whp

//  (Server) : CONNECTION WITH SMTP
export const mailtrapClient = nodemailer.createTransport({
    service:"gmail",  //to use gmail service 
    secure: true,
    port: 465,
    auth: {
        user: process.env.SMTP_USER,  //sender mail
        pass: process.env.SMTP_PASS   //sender app pass (not gmail pass)
    }
});

// Configure Sender (Client) and export
export const sender = {
    address: process.env.SMTP_USER, // sender mail
    name: process.env.SMTP_NAME,   // sender name
};

// Verify the SMTP connection
mailtrapClient.verify((error, success) => {
    if (error) {
        console.error("Error configuring SMTP:", error);
    } else {
        console.log("SMTP server is ready to send emails.");
    }
});
