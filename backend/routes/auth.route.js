import express from "express";

import { signUp,logIn,logOut,verifyEmail,forgotPassword,resetPassword,checkAuth } from "../controllers/auth.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// The route acts as a persistent authentication checker
// It's typically called when:
// The app first loads
// After page refreshes
// When checking if user session is still valid
// It helps maintain the user's authentication state on the client side

router.get("/check-auth",verifyToken,checkAuth);
// First, verifyToken middleware runs
// Checks for token in cookies
// Verifies token validity
// If valid, adds userId to request
// Then checkAuth controller runs
// Returns user data if authenticated
router.post("/signup",signUp);
router.post("/login",logIn);
router.post("/logout",logOut);

router.post("/forgot-password",forgotPassword)
//one more route to handle verify email
router.post("/verify-email",verifyEmail)

router.post("/reset-password/:token",resetPassword)

export default router;
//Why Other Routes Don't Always Need Token Verification:
// Login/Signup routes: Don't need verification as they're for unauthenticated users
// Logout: Usually includes token verification but focuses on clearing the token
// Password reset/forgot password: Designed for users who can't authenticate normally