import "../css/archive_view.css";
import {useEffect, useState} from "react";
import {performToast} from '../components/toastInfo'
import ArchiveItem from '../components/archiveItem.js'
import { AnimatePresence } from "framer-motion";
import ScreenLockView from "./screenlock";
import {Layout, ConfigProvider, Button, Drawer, Select, theme} from 'antd';
import { createStyles } from 'antd-style';
import {getToken} from '../components/getToken'
import {useNavigate} from "react-router-dom"
import Item from '../components/Item'

const {Header} = Layout;

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

export default function GptArchiveView(){
    const [isLock, setisLock] = useState(false);
    const [dltLoading, setDltLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [contents, setContents] = useState([]);
    const [inputSummary, setInputSummary] = useState("");
    const [inputContent, setInputContent] = useState("");
    const [category, setCategory] = useState("code");
    const { styles } = useStyle();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const {defualtAlgorithm, darkAlgorithm} = theme;

    const FETCH_URL = process.env.REACT_APP_SERVER_URL


    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

    const onLockScreen = (e) => {
        if((e.ctrlKey || e.metaKey)  && e.key === "x"){
            e.preventDefault();
            setisLock(true)
        }
    }

    const onDelete = async(id,category) => {
        let url = null
        setDltLoading(true)
        url = new URL("/api/archive/remove", FETCH_URL);
        const token = await getToken('tomatoSID')
        await fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                contentId: id,
                category: category
            })
        }).then(response=>{
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // 응답 본문을 JSON으로 파싱
        }).then((data)=>{
            if(data.success){
                performToast({msg: id+": 삭제에 성공했습니다", type:"success"})
                setDltLoading(false);
                getArchive();
            }
            else{
                performToast({msg:"삭제하는데 문제가 생겼습니다: "+data.msg , type:"error"})
            }
            
        }).catch(error => {
            performToast({msg:"통신에 문제가 생겼습니다: "+error , type:"error"})
        }); 
    }

    const onunLockScreen = () => {
        setisLock(false)
    }

    const saveArchive = async() => {
        if(inputContent !== "" && inputSummary !== ""){
            setAddLoading(true);
            let url = null
            url = new URL("/api/archive/add", FETCH_URL);
            const token = await getToken('tomatoSID')
            await fetch(url,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    inputContent: {
                        "query": inputSummary,
                        "content": inputContent,
                        "category": category
                    }
                })
            }).then(response=>{
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 응답 본문을 JSON으로 파싱
            }).then((data)=>{
                if(data.success){
                    performToast({msg:"성공적으로 추가되었습니다" , type:"success"})
                    setAddLoading(false);
                    setOpen(false);
                    setInputSummary("");
                    setInputContent("");
                    getArchive();
                }
                else{
                    performToast({msg:"내용을 저장하는데 문제가 생겼습니다: "+data.msg , type:"error"})
                    setAddLoading(false);
                }
                
            }).catch(error => {
                performToast({msg:"통신에 문제가 생겼습니다: "+error , type:"error"})
                setAddLoading(false);
            });     
        }
        else{
            performToast({msg:"내용을 모두 입력해주세요" , type:"warning"})
        }
   
    }


    const categoryChange = (value) => {
        setCategory(value)
    }

    const getArchive = async() => {
        let url = null
        url = new URL("/api/archive/get", FETCH_URL);
        const token = await getToken('tomatoSID')
        await fetch(url,{
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
        }).then((data)=>{
            if(data.success){
                setContents(data.content)
            }
            else{
                performToast({msg:"내용을 가져오는데 문제가 생겼습니다: "+data.msg , type:"error"})
            }
            
        }).catch(error => {
            performToast({msg:"통신에 문제가 생겼습니다: "+error , type:"error"})
        }); 
        
    }


    useEffect(()=>{
        getArchive();
        window.addEventListener("keydown", onLockScreen);

        return () =>{
            window.removeEventListener("keydown", onLockScreen)
        }
    },[])

    useEffect(()=>{

    },[contents])

    return (
        <>
        {isLock ? <ScreenLockView onUnLock={onunLockScreen} />:
        <>
            <div className="archiveContainer">
                <div ></div>
                <div ></div>
                <div ></div>
                <div ></div>
            </div>

            <div className="ui">
                <ConfigProvider button={{
                    className: styles.linearGradientButton,
                    }}>
                        <Button type="primary" size="large" onClick={()=>navigate('/chat')}>
                            Chat
                        </Button>

                </ConfigProvider>
                <Button type="primary" size="large" onClick={showDrawer}>
                    addContent
                </Button>
                <ConfigProvider theme={{algorithm: darkAlgorithm}}>
                    <Drawer title="Add Content" onClose={onClose} open={open}>
                        <p>summary</p>
                        <input type="text" placeholder="summary" value={inputSummary} onChange={(e)=>{setInputSummary(e.target.value)}}/>
                        <p>content</p>
                        <input type="text" placeholder="content" value={inputContent} onChange={(e)=>{setInputContent(e.target.value)}}/>
                        <p>category</p>
                        <Select
                            defaultValue="code"
                            style={{
                                width: 120,
                            }}
                            onChange={categoryChange}
                            options={[
                                {
                                value: 'code',
                                label: 'code',
                                },
                                {
                                value: 'url',
                                label: 'url',
                                },
                                {
                                value: 'doc',
                                label: 'doc',
                                }
                            ]}
                        />
                        {addLoading ? <Button type="primary" loading />
                        :<Button type="primary" size="large" onClick={saveArchive}>
                            submit
                        </Button>}
                        
                    </Drawer>
                </ConfigProvider>

            </div>


            <div className="cards">
                <AnimatePresence>
                {contents.map((message, i)=>
                    <Item key={i}>
                        <ArchiveItem message={message} onDelete={onDelete} isLoading={dltLoading} />
                    </Item>
                    
                )}
                </AnimatePresence>
            </div>

        </>

        }

        </>
    );
}