"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserAPIAction = void 0;
const api_1 = require("../api");
const LoginUserAPIAction = (formData, dispatch, toast, action) => {
    return (0, api_1.API)({
        endPoint: "/user/login",
        method: "POST",
        body: formData,
        isFormData: false,
        toast,
        isToast: true,
        action,
        dispatch,
        isAccount: true,
        isHeaders: true,
    });
};
exports.LoginUserAPIAction = LoginUserAPIAction;
