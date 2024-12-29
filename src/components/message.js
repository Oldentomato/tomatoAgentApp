import "../css/chat_view.css"
import Code from "../components/code";
import gptImgLogo from '../assets/bot.jpg';
import userImgLogo from '../assets/user.jpg';
import {Popover} from 'antd';

const Messages = ({message, i}) =>{
    const inMsg = (message) => {
        if(message.text.includes("```")){
            return(
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
            )
        } 
        else{
            return message.text
        }
    }

    const content = (logs) =>{
        return(
            <div>
                {logs.map((e)=>{
                    return(
                        <p>{e}</p>
                    )
                })}
                
            </div>
        )
    }


    if(message.isBot){
        return(
            <div style={{'cursor':'pointer'}} className="chat bot">
                
                <img className="chatImg" src={gptImgLogo}/> 
                <Popover content={() =>content(message.activity_log)} title="행동내역" trigger="click" >
                    <p className="txt" style={{whiteSpace:"pre-line", textAlign:'left'}} key={i}>
                        {inMsg(message)}
                    
                    </p>
    
                </Popover>
            </div>
        )
    }else{
        return(
            <div className="chat">
                <img className="chatImg" src={userImgLogo}/> 
                    <p className="txt" style={{whiteSpace:"pre-line", textAlign:'left'}} key={i}>
                        {inMsg(message)}
                    </p>
            </div>
        )
    }

}



export default Messages