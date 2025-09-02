import { isTokenExpired, getRefreshToken, setTokens, clearTokens, setAuthError } from "./utils/tokenUtils";

const BASE_API = "http://localhost:500/api/v1";


// Function to refresh the token
export const refreshToken = async (toast?: any): Promise<boolean> => {
    try {
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
            console.log("No refresh token found");
            return false;
        }
        
        // Check if refresh token is expired before attempting refresh
        if (isTokenExpired(refreshToken)) {
            console.log("Refresh token expired");
            // Set auth error flag in localStorage
            setAuthError();
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
            setTokens(
                data.data.tokens.access_token,
                data.data.tokens.refresh_token
            );
            console.log("Token refresh successful");
            return true;
        } else {
            // Handle JWT expiration or other refresh token errors
            console.error("Refresh token error:", data);
            
            // If the error is JWT expired, set the auth error flag
            if (data.message?.includes('jwt expired') || data.statusCode === 400) {
                setAuthError();
                if (toast) toast.error("Token expired, please login again");
            }
            
            // Clear tokens on refresh failure
            clearTokens();
            return false;
        }
    } catch (error) {
        console.error("Error refreshing token:", error);
        // Clear tokens on exception
        clearTokens();
        // Set auth error flag
        setAuthError();
        return false;
    }
};