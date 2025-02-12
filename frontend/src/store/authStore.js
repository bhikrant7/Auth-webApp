import { create } from "zustand";
import axios from "axios";

//zustand is the state management library we are using
//axios is the library we are using to make HTTP requests  //can also be used to make requests in the backend from one enpoint to another


const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth"; //declare the API_URL variable

axios.defaults.withCredentials = true; //this is to ensure that the cookies are sent with the requests

export const useAuthStore = create((set) => ({
	user: null, //the user state holds the verified user
	isAuthenticated: false, //the isAuthenticated state holds the boolean value of whether the user is authenticated or not
	error: null, //the error state holds the error message
	isLoading: false, //the isLoading state holds the boolean value of whether the page is loading or not
	isCheckingAuth: true, //the isCheckingAuth state holds the boolean value of whether the user is checking the authentication or not(mainly used in the useEffect hook)
	message: null,

	//the signup function is an async function that takes in the email, password, and name as arguments
	signup: async (email, password, name) => {
		set({ isLoading: true, error: null }); //before signup is successful, the isLoading state is set to true and the error state is set to null
		try {
			const response = await axios.post(`${API_URL}/signup`, { email, password, name }); //send a POST request to the /signup endpoint with the email, password, and name as the request body
			set({ user: response.data.user, isAuthenticated: true, isLoading: false }); //user holds the verified user, isAuthenticated is set to true, and isLoading is set to false
		} catch (error) {
			set({ error: error.response.data.message || "Error signing up", isLoading: false }); //if error the response.data -> error message is set to the error state and isLoading is set to false
			throw error;
		}
	},
	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/login`, { email, password });
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
		} catch (error) {
			set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
	},
	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch (error) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false }); //if error, isAuthenticated is set to false
		}
	},
	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},
	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},
}));
