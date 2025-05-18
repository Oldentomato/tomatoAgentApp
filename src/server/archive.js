import axios from "axios"
import {getToken} from '../components/getToken'

const FETCH_URL = process.env.REACT_APP_SERVER_URL

const serverDeleteArchive = async(id, category) => {
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await axios.post(FETCH_URL+"/api/archive/remove",
            {
                "contentId": id,
                "category": category
            },
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
    }
}

const serverSaveArchive = async(inputSummary, category, content) => {
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await axios.post(FETCH_URL+"/api/archive/add",
            {
                "inputContent":{
                    "query": inputSummary,
                    "content": content,
                    "category": category
                }
            },
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
    }
}

const serverGetArchive = async() => {
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await axios.get(FETCH_URL+"/api/archive/get",
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
            return {success: true, content: result.data.content};
        }else{
            return {success: false, msg: result.data.msg};
        }
    }
}

export {serverDeleteArchive, serverSaveArchive, serverGetArchive}