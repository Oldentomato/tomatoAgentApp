import {getToken} from '../components/getToken'
import axios from 'axios';

const FETCH_URL = process.env.REACT_APP_SERVER_URL

const serverRegister = async(id, pass) =>{
    const result = await axios.post(FETCH_URL+"/api/auth/register",
    {
        userName: id,
        password: pass
    },
    {
        headers: {
            "Content-Type": "application/json"
        }
    }
    ).catch((err)=>{
        console.log(err)
        return {
            data: {
                success: false,
                msg: String(err)
            }
        };
    })

    if(result.data.success){
        return {success: true};
    }else{
        return {success: false, msg: result.data.msg};
    }

}

const serverLogin = async(id, pass) => {
    const result = await axios.post(FETCH_URL+"/api/auth/login",
        {
            userName: id,
            password: pass
        },
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
        ).catch((err)=>{
            console.log(err)
            return {
                data: {
                    success: false,
                    msg: String(err)
                }
            };
        })
    
    if(result.data.success){
        return {success: true, token: result.data.token};
    }else{
        return {success: false, msg: result.data.msg};
    }
}

const serverCheckUser = async() => {
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await axios.get(FETCH_URL+"/api/auth/checkuser",
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
            ).catch((err)=>{
                console.log(err)
                return {
                    data: {
                        success: false,
                        msg: String(err)
                    }
                };
            })
        
        if(result.data.success){
            return {success: true};
        }else{
            return {success: false, msg: result.data.msg};
        }
    }else{
        return {success: false, msg: "no token"}
    }

    
}

const serverLogout = async() =>{
    const token = await getToken('tomatoSID');
    
    if(token !== ''){
        const result = await axios.get(FETCH_URL+"/api/auth/logout",
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
            ).catch((err)=>{
                console.log(err)
                return {
                    data: {
                        success: false,
                        msg: String(err)
                    }
                };
            })
        
        if(result.data.success){
            return {success: true};
        }else{
            return {success: false, msg: result.data.msg};
        }
    }else{
        return {success: false, msg: "no token"}
    }
    
}


export {serverRegister, serverLogin, serverCheckUser, serverLogout}