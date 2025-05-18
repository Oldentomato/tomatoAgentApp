import {getToken} from '../components/getToken'
import axios from "axios"

const FETCH_URL = process.env.REACT_APP_SERVER_URL

const serverNewChat = async() => {
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await axios.get(FETCH_URL+"/api/chat/newchat",
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
            return {success: true, chat_uid: result.data.chat_uid};
        }else{
            return {success: false, msg: result.data.msg};
        }
    }
}

const serverChat = async(q, chat_uid, tools) => {
    const url = new URL("/api/chat/chat", FETCH_URL);
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                q: q,
                chat_uid: chat_uid,
                toolList: tools
            })
        }).then(res=>{
            if(!res.ok){
                throw new Error("채팅 통신에 문제가 생겼습니다"+res.msg);
            }

            return res
        })

        return result
    }
}

const serverCreateChatName = async(input, chatHistory, chatRoomId) => {
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await axios.post(FETCH_URL+"/api/chat/createChatName",
            {
                getChatHistory: [input, chatHistory],
                chat_uid: chatRoomId
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
            ).catch((err)=>{
                return {
                    data: {
                        success: false,
                        msg: String(err)
                    }
                };
            })
        
        if(result.data.success){
            return {success: true, chatName: result.data.chatName};
        }else{
            return {success: false, msg: result.data.msg};
        }
    }
}

const serverGetChat = async(itemId) => {
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await axios.post(FETCH_URL+"/api/chat/getChat",
            {
                chat_uid: itemId
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
            ).catch((err)=>{
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

const serverDeleteChat = async(chat_uid) => {
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await axios.delete(FETCH_URL+"/api/chat/chatDelete/"+chat_uid,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
            ).catch((err)=>{
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

const serverGetChatList = async() => {
    const token = await getToken('tomatoSID');
    if (token !== ''){
        const result = await axios.get(FETCH_URL+"/api/chat/getChatList",
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
            ).catch((err)=>{
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


export {serverNewChat, serverChat, serverCreateChatName, serverGetChat, serverDeleteChat, serverGetChatList}