import {useState, useEffect, useRef} from 'react'
import {Select, Button, Layout} from 'antd'
import {theme, ConfigProvider} from "antd";
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider, List } from 'antd';
import Item from '../components/Item'
import { AnimatePresence } from "framer-motion";
import { SendOutlined } from '@ant-design/icons';
import gptImgLogo from '../assets/bot.jpg';
import Messages from '../components/message.js'
import {useNavigate, useLocation} from "react-router-dom"
import { LogoutOutlined } from '@ant-design/icons';
import ScreenLockView from "./screenlock";
import {performToast, ConfirmToast} from '../components/toastInfo'
import {getToken} from '../components/getToken'
import {toast} from 'react-toastify';
import "../css/chat_view.css"
import { createStyles } from 'antd-style';
import { serverLogout } from '../server/auth.js';
import { serverNewChat, serverChat, serverCreateChatName, serverGetChat, serverDeleteChat, serverGetChatList } from '../server/chat.js';

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
      &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
        > span {
          position: relative;
        }
  
        &::before {
          content: '';
          background: linear-gradient(135deg, #6253e1, #04befe);
          position: absolute;
          inset: -1px;
          opacity: 1;
          transition: all 0.3s;
          border-radius: inherit;
        }
  
        &:hover::before {
          opacity: 0;
        }
      }
    `,
  }));

const {Header} = Layout;


export default function MainView() {
    const [chatRooms, setChatRooms] = useState([]);
    const [chat_uid, setchat_uid] = useState("");
    const location = useLocation(); // 현재 경로 확인
    const navigate = useNavigate();
    const msgEnd = useRef();
    const [input, setInput] = useState("");
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLock, setisLock] = useState(false);
    const [tools, setTools] = useState(["googleSearch"])
    const [messages, setMessages] = useState([{
        text: "say something!",
        isBot: true,
        activity_log: []
    }])
    const {defualtAlgorithm, darkAlgorithm} = theme;

    const FETCH_URL = process.env.REACT_APP_SERVER_URL

    const { styles } = useStyle();

    const onLockScreen = (e) => {
        if((e.ctrlKey || e.metaKey)  && e.key === "x"){
            e.preventDefault();
            setisLock(true)
        }
    }

    const onunLockScreen = () => {
        setisLock(false)
    }

    const handleOnKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading && input !== "") {
            e.preventDefault();
            setIsLoading(true)
            handleSend(); // Enter 입력이 되면 클릭 이벤트 실행
        }
    };

    const onLogout = async() =>{
        serverLogout().then(async(data)=>{
            if(!data.success){
                performToast({msg:"로그아웃에 실패했습니다"+data.msg , type:"error"})
            }else{
                const fetchAndLogout = async () => {
                    const result = await window.electronAPI.deleteCookieByName('tomatoSID');
                    return result;
                };
                fetchAndLogout().then((result)=>{
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
        }).finally(()=>{
            navigate('/')
        });
    }

    const on_new_chat = () =>{
        setchat_uid("")
        setMessages([{
            text: "say something!",
            isBot: true,
            activity_log: []
        }])
    }

    const toolChange = (value) =>{
        setTools(value)
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
                if(text.includes("~")){
                    // setAnswer("생각중");
                }
                else{
                    setAnswer((prevText) => prevText + text);
                }
                
            }
            setAnswer("")
            setMessages((prevMessages)=>{
                const result = temp_str.split(/~+/).map(item => item.trim()).filter(Boolean);


                // 도구 이름과 결과를 activity_log에 저장
                const activityLog = [];
                let additionalInfo = "";

                // result를 순회하면서 도구 이름과 결과를 추출
                result.forEach((item, index) => {
                    if (item.startsWith('사용한 도구:')) {
                        const toolName = item.replace('사용한 도구:', '').trim();
                        const toolResult = result[index + 1]?.startsWith('도구사용 결과:') 
                            ? result[index + 1].replace('도구사용 결과:', '').trim()
                            : null;

                        activityLog.push({ name: toolName, log: toolResult });
                    } else if (!item.startsWith('도구사용 결과:')) {
                        additionalInfo += `${item} `;
                    }
                });


                const updatedMessages = [
                    ...prevMessages,
                    {
                        activity_log: activityLog, // 두 번째 단락 (도구 사용 결과)
                        text: additionalInfo, // 나머지 정보 (배열 형태로 저장)
                        isBot: true
                    }
                ];
                chatHistory = temp_str
                return updatedMessages
                }
            )
            
            setIsLoading(false)
        }

        setMessages((prevMessages)=>{
            const updatedMessages = [
                ...prevMessages,
                {text: requestInput, isBot: false}
            ]
            return updatedMessages
        })


        if (requestInput !== ""){
            let chatRoomId = ""
            try{
                if(chat_uid === ""){
                    await serverNewChat().then(data =>{
                        if(data.success){
                            chatRoomId = data.chat_uid
                        }
                        else{
                            throw new Error("채팅 생성에 문제가 생겼습니다"+data.msg);
                        }
                    })
                }
                    
                await serverChat(
                    requestInput,
                    chat_uid === "" ? chatRoomId : chat_uid,
                    tools
                ).then(async(response)=>{
                    await get_res_msg(response)
                })
                    
                if(chat_uid === ""){
                    await serverCreateChatName(input, chatHistory, chatRoomId).then(data=>{
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
            setMessages([])
            serverGetChat(item.id).then(data=>{
                if(data.success){
                    const datas = data.content
                    let descriptList = []
                    const modified_datas = datas.reduce((acc, e) => {
                        if (e.type === "description") {
                            descriptList.push({log: e.content, name: e.name});
                        } else {
                            if (e.role === "user") {
                                acc.push({ text: e.content, isBot: false });
                            } else {
                                const resultList = [...descriptList];
                                descriptList = [];
                                acc.push({ text: e.content, isBot: true, activity_log: resultList });
                            }
                        }
                        return acc;
                    }, []);
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
        serverDeleteChat(item.id).then((data)=>{
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
        serverGetChatList().then(data=>{
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



    useEffect(()=>{
        getchats()
        window.addEventListener("keydown", onLockScreen)

        return () =>{
            window.removeEventListener("keydown", onLockScreen)
        }
    },[location.pathname])

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
                                <List.Item 
                                    style={{'cursor': 'pointer'}} 
                                    key={item.id} 
                                    onClick={()=>{
                                        get_chatmsgs(item)
                                    }}>
                                <List.Item.Meta
                                    title={item.name}
                                    description={'datetime'}
                                    
                                />
                                <Button danger style={{'zIndex': 10}} onClick={()=>{handleDelete(item)}}>Delete</Button>
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
                                <Messages message={message}/>
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
                    {/* <Radio.Group optionType="button" buttonStyle="solid" options={req_option} onChange={onRequestChange} value={req} /> */}
                    <div style={{display:"flex"}}>
                        <ConfigProvider button={{
                        className: styles.linearGradientButton,
                        }}>
                            <Button type="primary" size="large" onClick={()=>navigate('/gptArchive')}>
                                GPTArchive
                            </Button>

                        </ConfigProvider>

                        <Select
                            defaultValue="googleSearch"
                            mode="multiple"
                            style={{
                                width: 200,
                            }}
                            onChange={toolChange}
                            options={[
                                {
                                value: 'googleSearch',
                                label: 'Google Search',
                                },
                                {
                                value: 'codeArchive',
                                label: 'gptArchive(Code)',
                                }
                            ]}
                        />
                    </div>


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