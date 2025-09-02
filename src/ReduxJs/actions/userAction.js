import { API } from "../api";


export const LoginUserAPIAction = (formData, dispatch , toast,action)=>{
    return API({
            endPoint: "/user/login",
            method: "POST",
            body: formData,
            isFormData : false,
            toast,
            isToast: true,
            action,
            dispatch,
            isAccount : true,
            isHeaders : true,
    })
} 