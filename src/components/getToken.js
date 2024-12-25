import {performToast} from './toastInfo'

export const getToken = async (name) => {
    try {
      const cookie = await window.electronAPI.getCookieByName(name); // Promise 완료 대기
      return cookie?.value || ''; // 쿠키 값 반환
    } catch (error) {
      performToast({ msg: 'Error fetching token: ' + error, type: 'error' });
      return ''; // 에러 발생 시 기본값 반환
    }
  };