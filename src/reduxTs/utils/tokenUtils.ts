


// Helper function to check if token is expired
export const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const { exp } = JSON.parse(jsonPayload);
        const currentTime = Math.floor(Date.now() / 1000);
        
        return exp < currentTime;
    } catch (error) {
        console.error("Error checking token expiration:", error);
        return true;
    }
};

// Get access token from localStorage
export const getAccessToken = (): string | null => {
    try {
        return JSON.parse(localStorage.getItem("access_token") || "null");
    } catch (error) {
        console.error("Error getting access token:", error);
        return null;
    }
};

// Get refresh token from localStorage
export const getRefreshToken = (): string | null => {
    try {
        return JSON.parse(localStorage.getItem("refresh_token") || "null");
    } catch (error) {
        console.error("Error getting refresh token:", error);
        return null;
    }
};

// Set tokens in localStorage
export const setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem("access_token", JSON.stringify(accessToken));
    localStorage.setItem("refresh_token", JSON.stringify(refreshToken));
};

// Clear tokens from localStorage
export const clearTokens = (): void => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};

// Set auth error flag
export const setAuthError = (): void => {
    localStorage.setItem("auth_error", "true");
};

// Clear auth error flag
export const clearAuthError = (): void => {
    localStorage.removeItem("auth_error");
};