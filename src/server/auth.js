import {getToken} from '../components/getToken'

const FETCH_URL = process.env.REACT_APP_SERVER_URL

const serverRegister = async(id, pass) =>{
    let url = new URL("/api/auth/register", FETCH_URL);
    const formData  = JSON.stringify({
        userName: id,
        password: pass
    })

    fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            
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
            return {success: true}
            
        }else{

            return {success:false, msg:"회원가입에 실패했습니다"+data.msg}
        }

    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

export {serverRegister}