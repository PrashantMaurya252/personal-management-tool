import axios from "axios";

// Determine the base URL based on environment
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Important to send cookies for protected routes
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // We can attach any additional headers or tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors, e.g., unauthorized access
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Redirect to login if unauthorized
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
