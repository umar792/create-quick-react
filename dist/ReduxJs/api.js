
import { refreshToken } from "./refreshToken";
import { isTokenExpired, clearTokens, setAuthError, getAccessToken } from "../utils/tokenUtils";

const BASE_API = "http://localhost:500/api/v1";


export const API = async({endPoint, method, body, isFormData, isToast, toast, action, dispatch, isAccount=false, isToken, isHeaders}) => {
    try {
        // Check if token refresh is needed before making the API call
        if (isToken) {
            const accessToken = getAccessToken();
            
            if (isTokenExpired(accessToken)) {
                console.log("Access token expired, attempting refresh");
                const refreshSuccessful = await refreshToken(toast);
                
                if (!refreshSuccessful) {
                    // If refresh failed and this is a protected route, return error
                    if (isToast && toast) {
                        toast.error("Session expired. Please login again.");
                    }
                    
                    // Force logout (we might want to redirect to login here)
                    return {
                        success: false,
                        message: "Authentication failed. Please login again.",
                        authError: true // Add flag to indicate auth error
                    };
                }
            }
        }
        
        // Proceed with the original API call
        const res = await fetch(`${BASE_API}${endPoint}`, {
            method: method,
            ...(isHeaders && {
                headers: {
                    ...(!isFormData && {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        'ngrok-skip-browser-warning': 'true',
                    }),
                    ...(isToken && {
                        "Authorization": `Bearer ${getAccessToken()}`,
                    })
                }
            }),
            ...(method !== "GET" && {
                body: isFormData && body instanceof FormData ? body : JSON.stringify(body)
            })
        });
        
        const data = await res.json();
        
        if (res.status >= 200 && res.status < 300) {
            if (isToast) {
                toast.success(data.message);
            }
            
            if (action && dispatch) {
                dispatch(action(data.data));
            }
            
            if (isAccount) {
                localStorage.setItem("access_token", JSON.stringify(data.data.tokens.access_token));
                localStorage.setItem("refresh_token", JSON.stringify(data.data.tokens.refresh_token));
            }
            
            return {
                success: true,
                message: data.data,
            }
        } else {
            console.log("API error response:", data);
            if (isToast) {
                toast.error(data.message);
            }
            
            // Handle authentication errors
            if (res.status === 401) {
                // Check if the error is related to JWT expiration
                if (data?.message?.includes('expired')) {
                    console.log("Token expired during request, attempting refresh");
                    const refreshSuccessful = await refreshToken(toast);
                    
                    if (refreshSuccessful) {
                        // Retry the original request with the new token
                        console.log("Retrying original request after token refresh");
                        return API({
                            endPoint,
                            method,
                            body,
                            isFormData,
                            isToast,
                            toast,
                            action,
                            dispatch,
                            isAccount,
                            isToken,
                            isHeaders
                        });
                    } else {
                        if (isToast && toast) {
                            toast.error("Session expired. Please login again.");
                        }
                        
                        // Set the auth error flag in localStorage
                        setAuthError();
                        
                        return {
                            success: false,
                            message: data,
                            authError: true
                        };
                    }
                }
            }
            
            return {
                success: false,
                message: data
            }
        }
        
    } catch (error) {
        console.error("API Error:", error);
        if (isToast) {
            toast.error(error.message);
        }
        return {
            success: false,
            message: error
        }
    }
}



