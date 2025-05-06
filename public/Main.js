const {app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
    /*
    * 넓이 1920에 높이 1080의 FHD 풀스크린 앱을 실행시킵니다.
    * */
    win = new BrowserWindow({
        width:1920,
        height:1080,
        frame: false,
        icon: path.join(__dirname, '/../build/icon.jpg'),
        webPreferences: {
            nodeIntegration: true, // Node.js 사용 허용
            enableRemoteModule: true,
            contextIsolation: true, // 필수 옵션
            preload: path.join(__dirname, '/../build/preload.js')
        },
    });

    /*
    * ELECTRON_START_URL을 직접 제공할경우 해당 URL을 로드합니다.
    * 만일 URL을 따로 지정하지 않을경우 (프로덕션빌드) React 앱이
    * 빌드되는 build 폴더의 index.html 파일을 로드합니다.
    * */
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    /*
    * startUrl에 배정되는 url을 맨 위에서 생성한 BrowserWindow에서 실행시킵니다.
    * */
    win.loadURL(startUrl);

    win.on('closed', () => {
        win = null;
    });

        
    // 개발자 도구 열기
    win.webContents.openDevTools();

}


app.on('ready', createWindow);

// React에서 창 종료 명령 받기
ipcMain.on('close-app', () => {
    if (win) {
        win.close();
    }
});

// 특정 이름의 쿠키 가져오기
ipcMain.handle('get-cookie-by-name', async (event, cookieName) => {
    try {
      // 모든 쿠키 가져오기
        const cookies = await session.defaultSession.cookies.get({});
      // 이름으로 필터링
        const targetCookie = cookies.find(cookie => cookie.name === cookieName);
      return targetCookie || null; // 쿠키가 없으면 null 반환
    } catch (error) {
        console.error('Failed to get cookie by name:', error);
        return null; // 에러 시 null 반환
    }
});

ipcMain.handle('set-cookie-by-name', async (event, cookie) => {
    try {
      // 쿠키 설정
      await session.defaultSession.cookies.set({
        url: 'http://localhost', // 반드시 URL 필요
        name: cookie.name,         // 쿠키 이름
        value: cookie.value,       // 쿠키 값
        path: '/',                 // 경로 설정 (필수)
        expirationDate: Math.floor(Date.now() / 1000) + 3600, // 만료 시간 (1시간 뒤)
      });
      return 'Cookie set successfully';
    } catch (error) {
      console.error('Failed to set cookie:', error);
      return 'Error setting cookie';
    }
  });

  ipcMain.handle('delete-cookie-by-name', async (event, cookieName) => {
    try {
      // 모든 쿠키 가져오기
      const cookies = await session.defaultSession.cookies.get({});
      const targetCookie = cookies.find(cookie => cookie.name === cookieName);
  
      if (targetCookie) {
        // 정확한 URL 생성
        const cookieUrl = `http${targetCookie.secure ? 's' : ''}://${targetCookie.domain}${targetCookie.path}`;
  
        // 쿠키 삭제
        await session.defaultSession.cookies.remove(cookieUrl, targetCookie.name);
        return true;
      } else {
        return false; // 쿠키를 찾을 수 없음
      }
    } catch (error) {
      console.error('Failed to delete cookie:', error);
      return false;
    }
  });