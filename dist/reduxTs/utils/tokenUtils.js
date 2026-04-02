"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthError = exports.setAuthError = exports.clearTokens = exports.setTokens = exports.getRefreshToken = exports.getAccessToken = exports.isTokenExpired = void 0;
// Helper function to check if token is expired
const isTokenExpired = (token) => {
    if (!token)
        return true;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const { exp } = JSON.parse(jsonPayload);
        const currentTime = Math.floor(Date.now() / 1000);
        return exp < currentTime;
    }
    catch (error) {
        console.error("Error checking token expiration:", error);
        return true;
    }
};
exports.isTokenExpired = isTokenExpired;
// Get access token from localStorage
const getAccessToken = () => {
    try {
        return JSON.parse(localStorage.getItem("access_token") || "null");
    }
    catch (error) {
        console.error("Error getting access token:", error);
        return null;
    }
};
exports.getAccessToken = getAccessToken;
// Get refresh token from localStorage
const getRefreshToken = () => {
    try {
        return JSON.parse(localStorage.getItem("refresh_token") || "null");
    }
    catch (error) {
        console.error("Error getting refresh token:", error);
        return null;
    }
};
exports.getRefreshToken = getRefreshToken;
// Set tokens in localStorage
const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem("access_token", JSON.stringify(accessToken));
    localStorage.setItem("refresh_token", JSON.stringify(refreshToken));
};
exports.setTokens = setTokens;
// Clear tokens from localStorage
const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};
exports.clearTokens = clearTokens;
// Set auth error flag
const setAuthError = () => {
    localStorage.setItem("auth_error", "true");
};
exports.setAuthError = setAuthError;
// Clear auth error flag
const clearAuthError = () => {
    localStorage.removeItem("auth_error");
};
exports.clearAuthError = clearAuthError;
