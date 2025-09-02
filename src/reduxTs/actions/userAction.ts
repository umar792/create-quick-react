import type { Dispatch } from "redux";
import { API } from "../api";


export const LoginUserAPIAction = (formData:any, dispatch:Dispatch , toast:any ,action:any)=>{
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