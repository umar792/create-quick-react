"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const tokenUtils_1 = require("./utils/tokenUtils");
const BASE_API = "http://localhost:500/api/v1";
// Function to refresh the token
const refreshToken = async (toast) => {
    try {
        const refreshToken = (0, tokenUtils_1.getRefreshToken)();
        if (!refreshToken) {
            console.log("No refresh token found");
            return false;
        }
        // Check if refresh token is expired before attempting refresh
        if ((0, tokenUtils_1.isTokenExpired)(refreshToken)) {
            console.log("Refresh token expired");
            // Set auth error flag in localStorage
            (0, tokenUtils_1.setAuthError)();
            return false;
        }
        const response = await fetch(`${BASE_API}/user/refresh_token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });
        const data = await response.json();
        if (response.status >= 200 && response.status < 300 && data.success) {
            (0, tokenUtils_1.setTokens)(data.data.tokens.access_token, data.data.tokens.refresh_token);
            console.log("Token refresh successful");
            return true;
        }
        else {
            // Handle JWT expiration or other refresh token errors
            console.error("Refresh token error:", data);
            // If the error is JWT expired, set the auth error flag
            if (data.message?.includes('jwt expired') || data.statusCode === 400) {
                (0, tokenUtils_1.setAuthError)();
                if (toast)
                    toast.error("Token expired, please login again");
            }
            // Clear tokens on refresh failure
            (0, tokenUtils_1.clearTokens)();
            return false;
        }
    }
    catch (error) {
        console.error("Error refreshing token:", error);
        // Clear tokens on exception
        (0, tokenUtils_1.clearTokens)();
        // Set auth error flag
        (0, tokenUtils_1.setAuthError)();
        return false;
    }
};
exports.refreshToken = refreshToken;
