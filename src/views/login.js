import "../css/login_view.css"
import "../css/register_view.css"
import {useState, useEffect} from 'react'
import {useNavigate} from "react-router-dom"
import {getToken} from '../components/getToken'
// import Cookies from 'js-cookie';
import {performToast} from '../components/toastInfo'


export default function LoginView(){
    const [id, set_id] = useState("")
    const [pass, set_pass] = useState("")
    const [isregister, setisregister] = useState()
    const [registerid, setregisterid] = useState("")
    const [registerpass, setregisterpass] = useState("")


    const navigate = useNavigate();

    const FETCH_URL = process.env.REACT_APP_SERVER_URL


    const onIdChnage = (e) =>{
        set_id(e.target.value)
    }

    const onPassChange = (e) =>{
        set_pass(e.target.value)
    }

    const onRegisterIdChnage = (e) =>{
        setregisterid(e.target.value)
    }

    const onRegisterPassChange = (e) =>{
        setregisterpass(e.target.value)
    }

    const handleOnKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onLoginClick();
        }
    };

    const handleOnRegisterKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onRegisterClick();
        }
    };

    const onClickReisterExit = () =>{
        setisregister(false)
    }

    const onClickReisterEnter = () =>{
        setisregister(true)
    }

    const onRegisterClick = async() => {
        if(registerid !== "" && registerpass !== ""){
            let url = null
            url = new URL("/api/auth/register", FETCH_URL);
            const formData  = JSON.stringify({
                userName: registerid,
                password: registerpass
            })

            fetch(url,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: formData
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 응답 본문을 JSON으로 파싱
            })
            .then(data => {
                if(data.success){
                    performToast({msg:"회원가입에 성공했습니다", type:"success"})
                    setisregister(false)
                    
                }else{
                    performToast({msg:"회원가입에 실패했습니다"+data.msg , type:"error"})
                }

            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });


        }
        else{
            performToast({msg:"id와 password를 모두 입력하십시오" , type:"warning"})
        }

    }


    const onLoginClick = async() => {
        if(id !== "" && pass !==""){
            let url = null
            url = new URL("/api/auth/login", FETCH_URL);
            const formData  = JSON.stringify({
                userName: id,
                password: pass
            })

            fetch(url,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: formData
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 응답 본문을 JSON으로 파싱
            })
            .then(data => {
                if(data.success){
                    // window.alert(data.user+"님 환영합니다")
                    // Cookies.set('tomatoSID', data.token, { expires: 7, secure: false }) 
                    window.electronAPI.setCookieByName({
                        name: 'tomatoSID',
                        value: data.token
                    })
                    navigate("/chat")

                    
                }else{
                    performToast({msg:"회원가입에 실패했습니다"+data.msg , type:"error"})
                }

            })
            .catch(error => {
                performToast({msg:"로그인 에러: "+error , type:"error"})
            });


        }
        else{
            performToast({msg:"id와 password를 모두 입력하십시오" , type:"warning"})
        }

    }


    useEffect(()=>{
        const fetchAndSetToken = async () => {
            const token = await getToken('tomatoSID');
            return token;
        };
        fetchAndSetToken().then((token)=>{
            if (token !== ''){
                const url = new URL("/api/auth/checkuser", FETCH_URL);
    
                fetch(url,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: token
                    })
                }).then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); // 응답 본문을 JSON으로 파싱
                }).then(data => {
                    if(data.success){
                        navigate("/chat")
                        
                    }else{
                        window.electronAPI.deleteCookieByName('tomatoSID')
                    }
                })
                .catch(error => {
                    console.error('There was a problem with your fetch operation:', error);
                });
            }
        })
        
    },[])

    return(
        <>
            <body className="loginbody">
                <div className="title">
                    <h2>TOMATO AGENT</h2>
                </div>
                {isregister ?
                <div className="modal-overlay" onClick={onClickReisterExit}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                    >
                        <h1>Register</h1>
                        <div className="inputBx">
                            <input type="text" onChange={onRegisterIdChnage} placeholder="Username"/>
                        </div>
                        <div className="inputBx">
                            <input type="password" onKeyUp={handleOnRegisterKeyPress} onChange={onRegisterPassChange} placeholder="Password" />
                        </div>
                        <div className="inputBx">
                            <input type="submit" onClick={onRegisterClick} value="Register" />

                        </div>
                    </div>
                </div>
            :
            <>
                <div className="container">
                    <i style={{'--clr': '#00ff0a'}}></i>
                    <i style={{'--clr': '#ff0057'}}></i>
                    <i style={{'--clr': '#fffd44'}}></i>
                    <div className="login">
                        <h2>LOGIN</h2>
                        <div className="inputBx">
                            <input type="text" onChange={onIdChnage} placeholder="Username"/>
                        </div>
                        <div className="inputBx">
                            <input type="password" onKeyUp={handleOnKeyPress} onChange={onPassChange} placeholder="Password" />
                        </div>
                        <div className="inputBx">
                            <input type="submit" onClick={onLoginClick} value="Sign in" />

                        </div>
                        <div className="links">
                            <a className="registerBtn" onClick={onClickReisterEnter}>Sign up</a>
                        </div>
                    </div>
                </div>
            </>
                }
            </body>    
            

            
        </>


    )
}