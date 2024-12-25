import {useState, useEffect, useRef} from 'react'
import {Radio, Button, Layout} from 'antd'
import {theme, ConfigProvider} from "antd";
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider, List } from 'antd';
import Item from '../components/Item'
import { AnimatePresence } from "framer-motion";
import { SendOutlined } from '@ant-design/icons';
import gptImgLogo from '../assets/bot.jpg';
import userImgLogo from '../assets/user.jpg';
import {useNavigate} from "react-router-dom"
import { LogoutOutlined } from '@ant-design/icons';
import Code from "../components/code";
// import Cookies from 'js-cookie';
import ScreenLockView from "./screenlock";
import {performToast, ConfirmToast} from '../components/toastInfo'
import {getToken} from '../components/getToken'
import {toast} from 'react-toastify';
import "../css/chat_view.css"

const {Header} = Layout;

const req_option = [
    {
        label: "chat",
        value: "chat",
    }
]

export default function MainView() {
    const [req, set_req] = useState("chat");
    const [process_id, set_process] = useState("");
    const [confirm, set_confirm] = useState("yes");
    const [chatRooms, setChatRooms] = useState([]);
    const [chat_uid, setchat_uid] = useState("");
    const navigate = useNavigate();
    const msgEnd = useRef();
    const [input, setInput] = useState("");
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLock, setisLock] = useState(false)
    const [messages, setMessages] = useState([{
        text: "say something!",
        isBot: true,
        iscomponent: false
    }])
    const {defualtAlgorithm, darkAlgorithm} = theme;

    const FETCH_URL = process.env.REACT_APP_SERVER_URL

    const onLockScreen = (e) => {
        if(e.ctrlKey && e.key === "x"){
            e.preventDefault();
            setisLock(true)
        }
    }

    const onunLockScreen = () => {
        setisLock(false)
    }

    const onRequestChange = ({ target: { value } }) =>{
        set_req(value)
    }

    const handleOnKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading && input !== "") {
            e.preventDefault();
            setIsLoading(true)
            handleSend(); // Enter 입력이 되면 클릭 이벤트 실행
        }
    };

    const onLogout = async() =>{
        let url = null
        url = new URL("/api/auth/logout", FETCH_URL);
        const token = await getToken('tomatoSID')
        
        fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token
            })
        }).then(response=>{
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // 응답 본문을 JSON으로 파싱
        }).then(async(data)=>{
            if(!data.success){
                performToast({msg:"로그아웃에 실패했습니다"+data.msg , type:"error"})
            }else{
                const fetchAndLogout = async () => {
                    const result = await window.electronAPI.deleteCookieByName('tomatoSID');
                    return result;
                };
                fetchAndLogout().then((result)=>{
                    console.log(result)
                    if(result){
                        navigate('/')
                    }
                    else{
                        performToast({msg:"토큰 삭제에 문제가 생겼습니다" , type:"error"})
                    }
                })

                
            }
        }).catch(error => {
            performToast({msg:"로그아웃에 실패했습니다"+error , type:"error"})
        });
    }

    const on_new_chat = () =>{
        setchat_uid("")
        setMessages([{
            text: "say something!",
            isBot: true
        }])
    }


    const extractContent = (str) => {
        const regex = /```(.*?)```/;
        const match = str.match(regex);
        return match ? match[1] : '';
    };
    const handleDelete = (item) => {
        toast(
          ({ closeToast }) => (
            <ConfirmToast
              message="정말로 삭제합니까?"
              onConfirm={() => deletechat(item)}
            />
          ),
          { autoClose: false, closeOnClick: false }
        );
      };


    const handleSend = async() =>{
        const requestInput = input
        setInput("")
        let chatHistory = ""
        const get_res_msg = async(response) =>{
            if (!response.body) throw new Error("No response body");
            const reader = response.body.getReader();
            let temp_str = ""

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = new TextDecoder("utf-8").decode(value);
                temp_str += text
                setAnswer((prevText) => prevText + text);
            }
            setAnswer("")
            setMessages((prevMessages)=>{
                const updatedMessages = [
                    ...prevMessages,
                    {text: temp_str, isBot: true, iscomponent: false}
                ]
                chatHistory = temp_str
                return updatedMessages
                }
            )
            
            setIsLoading(false)
        }

        setMessages((prevMessages)=>{
            const updatedMessages = [
                ...prevMessages,
                {text: requestInput, isBot: false, iscomponent: false}
            ]
            return updatedMessages
        })

        let url = null
        const formData  = new FormData();

        if(req === "savecode"){
            url = new URL("/agent/process-savecode", FETCH_URL);
            
            formData.append("code",requestInput) 
            
            if(process_id !== ""){
                if(confirm === "yes"){ //여기도 input이 아니라 버튼value로 수정할것
                    formData.append("confirm", true)
                    formData.append("task_id", process_id)
                }
                else if(confirm === "no") {
                    formData.append("confirm", false)
                }
            }
            await fetch(url,{
                method: 'POST',
                body: formData
            }).then(response=>{
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 응답 본문을 JSON으로 파싱
            }).then(async(data)=>{
                if(data.success){
                    if(data.mode === "summary"){
                        set_process(data.task_id)
                        setMessages((prevMessages)=>[
                            ...prevMessages,
                            {text: "<"+data.summary+"> \n 해당 내용대로 저장하시겠습니까?", isBot: true, iscomponent: true}
                        ])
                    }
                    else if(data.mode === "save"){
                        performToast({msg:"저장되었습니다" , type:"success"})
                        set_process("")
                    }

                }
                else{
                    performToast({msg:"에러"+data.msg , type:"error"})
                }
                
            })
        }
        else if (req === "chat" && requestInput !== ""){
            let chatRoomId = ""
            const token = await getToken('tomatoSID')
            try{
                if(chat_uid === ""){
                    url = new URL("/api/chat/newchat", FETCH_URL);
                    await fetch(url,{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            token: token
                        })
                    }).then(async(response)=>{
                        if(!response.ok){
                            throw new Error("채팅 생성 통신에 문제가 생겼습니다");
                        }
                        const data = await response.json();
                        if(data.success){
                            chatRoomId = data.chat_uid
                        }
                        else{
                            throw new Error("채팅 생성에 문제가 생겼습니다"+data.msg);
                        }
                    })
                }
    
                url = new URL("/api/chat/chat", FETCH_URL);
                await fetch(url,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: requestInput,
                        chat_uid: chat_uid === "" ? chatRoomId : chat_uid,
                        token: token
                    })
                }).then(async(response)=>{
                    if(!response.ok){
                        throw new Error("채팅 통신에 문제가 생겼습니다"+response.msg);
                    }
                    
                    await get_res_msg(response)
                    
                })
                    
                if(chat_uid === ""){
                    url = new URL("/api/chat/createChatName", FETCH_URL);
                    await fetch(url,{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            getChatHistory: [input, chatHistory],
                            chat_uid: chatRoomId
                        })
                    }).then(async(response)=>{
                        if(!response.ok){
                            throw new Error("채팅이름생성 통신에 문제가 생겼습니다");
                        }
                        const data = await response.json();
                        if(data.success){
                            setChatRooms((prev)=>[
                                ...prev,
                                {'id': chatRoomId, 'name': data.chatName}
                            ])
                            setchat_uid(chatRoomId)
                            
                        }
                        else{
                            throw new Error("채팅이름생성에 문제가 생겼습니다"+data.msg);
                        }
                        
                    })
                }
            }
            catch (err){
                performToast({msg:"에러: "+err , type:"error"})
                
            }finally{
                
                setIsLoading(false);
            }
            
        }
        
    }

    const get_chatmsgs = async(item) =>{
        if(item.id !== chat_uid){
            const url = new URL("/api/chat/getChat", FETCH_URL);
            const token = await getToken('tomatoSID')
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_uid: item.id,
                    token: token
                })
            }).then(response=>{
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 응답 본문을 JSON으로 파싱
            }).then(data=>{
                if(data.success){
                    const datas = data.content
                    const modified_datas = datas.map((e)=>{
                        return {text: e.content, isBot: e.role === "user" ? false : true}
                    })
                    setMessages(modified_datas)
                    setchat_uid(item.id)
                }
                else{
                    performToast({msg:"에러"+data.msg , type:"error"})
                }
            }).catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
        }
    }

    const deletechat = async(item) =>{
        let url = null
        url = new URL("/api/chat/chatDelete", FETCH_URL);
        const token = await getToken('tomatoSID')
        await fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                chat_uid: item.id
            })
        }).then(response=>{
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // 응답 본문을 JSON으로 파싱
        }).then((data)=>{
            if(data.success){
                performToast({msg:item.id+": 삭제되었습니다" , type:"success"})
                on_new_chat()
                setChatRooms(prevArray =>
                    prevArray.filter(arr => arr.id !== item.id))
            }
            else{
                performToast({msg:"채팅 삭제에 문제가 생겼습니다"+data.msg , type:"error"})
            }
            
        }).catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });        
    }

    const getchats = async() =>{
        let url = null
        url = new URL("/api/chat/getChatList", FETCH_URL);
        const token = await getToken('tomatoSID')
        fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token
            })
        }).then(response=>{
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // 응답 본문을 JSON으로 파싱
        }).then(data=>{
            if(data.success){
                const result_data = data.content.map(item=>{
                    return {'id': item.chat_id, 'name': item.chat_name}
                })
                setChatRooms(result_data)
            }
        }).catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }


    const msg_format = () =>{
        
    }

    const on_confirm_btn = (value) =>{
        set_confirm(value)
        handleSend()
    }


    useEffect(()=>{
        getchats()
        window.addEventListener("keydown", onLockScreen)

        return () =>{
            window.removeEventListener("keydown", onLockScreen)
        }
    },[])

    useEffect(()=>{
        msgEnd.current.scrollIntoView();

    },[messages, answer])

    useEffect(()=>{

    },[chat_uid])


    return(
        <>
            {isLock ? <ScreenLockView onUnLock={onunLockScreen} />
            :
            <div>
                <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "rgb(20, 20, 20)" }}>
                    <div style={{ color: 'white', marginTop:'10px',fontFamily:"Archivo Black", fontSize: '2.5rem' }}>TOMATO AGENT</div>
                    <Button className='no-drag' type="text" onClick={onLogout} icon={<LogoutOutlined />} style={{ color: 'white' }}>
                        logout
                    </Button>
                    
                </Header>
                <div
                    id="scrollableDiv"
                    style={{
                        position:'absolute',
                        marginTop: '5%',
                        width: '25%',
                        height: '70%',
                        overflow: 'auto',
                        padding: '0 16px',
                        border: '1px solid rgba(140, 140, 140, 0.35)',
                    }}
                    >
                    <ConfigProvider theme={{algorithm: darkAlgorithm}}>
                        <InfiniteScroll
                            dataLength={chatRooms.length}
                            // next={{}}
                            hasMore={chatRooms.length < 10}
                            // loader={
                            // <Skeleton
                            //     avatar
                            //     paragraph={{
                            //     rows: 1,
                            //     }}
                            //     active
                            // />
                            // }
                            endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                            scrollableTarget="scrollableDiv"
                        >
                            <List
                            dataSource={chatRooms}
                            renderItem={(item) => (
                                <List.Item key={item.id}>
                                <List.Item.Meta
                                    // avatar={<Avatar src={item.picture.large} />}
                                    title={item.name}
                                    description={'datetime'}
                                />
                                <Button onClick={()=>{
                                    get_chatmsgs(item)
                                }}>Start</Button>
                                <Button onClick={()=>{handleDelete(item)}}>Delete</Button>
                                </List.Item>
                            )}
                            />
                        </InfiniteScroll>

                    </ConfigProvider>

                </div>
                <div className="chats">
                    <AnimatePresence>
                        {messages.map((message, i)=>
                            <Item key={i}>
                                <div className={message.isBot?"chat bot":"chat"}>
                                    {message.isBot ? <img className="chatImg" src={gptImgLogo}/> : <img className="chatImg" src={userImgLogo}/> }
                                    {message.iscomponent ? 
                                        <div>
                                            <p className="txt" style={{whiteSpace:"pre-line", textAlign:'left'}} key={i}>
                                                {message.text}
                                            </p>
                                            <Button type="text" onClick={() => on_confirm_btn('yes')} style={{ color: 'white' }}>네</Button>
                                            <Button type="text" onClick={() => on_confirm_btn("no")} style={{ color: 'white' }}>아니오</Button>
                                        </div> 
                                    :
                                        <p className="txt" style={{whiteSpace:"pre-line", textAlign:'left'}} key={i}>
                                        {message.text.includes("```") ? (
                                            <div>
                                            {
                                            message.text.split("```").map((part, index) =>
                                                index % 2 === 0 ? (
                                                <span key={index}>{part}</span>
                                                ) : (
                                                    <Code code={part} language={part.split("\n")[0]} key={index} />
                                                )
                                            )}
                                            </div>
                                        ) : (
                                            message.text
                                        )}
                                    </p>
                                    }

                                </div>
                            </Item>)}
                    </AnimatePresence>
                    {(answer === "" && isLoading) &&
                        <div className="chat bot">
                            <img className="chatImg" src={gptImgLogo} /> 
                            <p className="txt">. . .</p>
                        </div>
                    }
                    {answer !== "" &&
                        <div className="chat bot">
                            <img className="chatImg" src={gptImgLogo} /> 
                            <p style={{whiteSpace:"pre-line", textAlign:'left'}} className="txt">{answer}</p>
                        </div>
                    }
                    <div ref={msgEnd} />
                </div>



                <div className="chatFooter">
                    <Radio.Group optionType="button" buttonStyle="solid" options={req_option} onChange={onRequestChange} value={req} />
                    <br />
                    <div className="inp">
                        <input type="text" placeholder="Send a message" onKeyUp={handleOnKeyPress} value={input} onChange={(e)=>{setInput(e.target.value)}}/><Button className="send" type="primary" onClick={handleSend} loading={isLoading} icon={<SendOutlined />}/>
                    </div>
                    <Button type="text" onClick={on_new_chat} style={{ color: 'white' }}>
                        new chat
                    </Button>
                </div>
            </div>
        }
        </>
    )
}