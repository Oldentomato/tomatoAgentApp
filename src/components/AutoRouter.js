import {
    HashRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';

import {getToken} from './getToken'
import MainView from "../views/main"
import LoginView from "../views/login"
import GptArchiveView from '../views/gptArchive';
// import Cookies from 'js-cookie';

const RouterInfo = [
{ path: '/', element: <LoginView />, withAuthorization: false },
{ path: '/chat', element: <MainView />, withAuthorization: true },
{ path: '/gptArchive', element: <GptArchiveView />, withAuthorization: true }
];

const Authorization = ({
  redirectTo,
  children,
}) => {
    let isAuthenticated
    const fetchAndSetToken = async () => {
        const token = await getToken('tomatoSID');
        return token;
    };
    fetchAndSetToken().then((token)=>{
        isAuthenticated = token;
    

    })

    if (isAuthenticated !== '') {
        return <>{children}</>;
    } else {
        console.log(isAuthenticated)
        return <Navigate to={redirectTo} />;
    }


};

const AutoRouter = () => {
    return (
        <Router>
        <Routes>
            {RouterInfo.map((route) => {
            return (
                <Route
                key={route.path}
                path={route.path}
                element={
                    route.withAuthorization ? (
                    <Authorization
                        redirectTo='/'
                    >
                        {route.element}
                    </Authorization>
                    ) : (
                    route.element
                    )
                }
                />
            );
            })}
        </Routes>
        </Router>
    );
};

export default AutoRouter;