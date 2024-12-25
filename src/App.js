import './App.css';
import AutoRouter from "./components/AutoRouter";
import React from "react";
import { PoweroffOutlined } from '@ant-design/icons';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {

  const handleClose = () => {
    // 메인 프로세스에 'close-app' 메시지 전송
    window.electronAPI.closeApp();
  };


  return (
    <div style={{WebkitAppRegion: "drag", width: "100%", height: "50px"}}>
      <button
        style={{
          position: "absolute",
          bottom: "50px", // 화면 하단에서 50px 위로
          left: "40px", // 화면 왼쪽에서 20px 오른쪽으로
          padding: "10px 20px",
          WebkitAppRegion: "no-drag", // 드래그 제외
          cursor: "pointer",
          background: "none",
          border: "none",
          zIndex: 11
        }}
        onClick={handleClose}
      >
          <PoweroffOutlined style={{ fontSize: '32px', color: 'red' }}/>
      </button>
      <ToastContainer />
      <AutoRouter />
    </div>
  );
}

export default App;
