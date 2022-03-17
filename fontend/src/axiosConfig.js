
import UserIsLogin, { getDataInCookie } from './UserIsLogin.js';
export function axiosConfig(userAccessToken = "") {
    const userData = getDataInCookie("userData");
    const axiosConfig = {
        method: 'POST',
        url: "",
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${(userData === null ? "" : userData.token)}`,
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: "",
    };
    return axiosConfig;
}
