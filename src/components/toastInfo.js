import {toast, Bounce} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export const performToast = ({msg, type}) => {
    const options = {
        position: 'top-right',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true, 
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Bounce
    };

    switch (type) {
        case 'error':
            return toast.error(msg, options);
        case 'success':
            return toast.success(msg, options);
        case 'warning':
            return toast.warn(msg, options);
        default:
            return;
    }
}

export const ConfirmToast = ({ message, onConfirm }) => {
    return (
        <div>
        <p>{message}</p>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
            <button
            onClick={() => {
                onConfirm();
                toast.dismiss();
            }}
            >
            Confirm
            </button>
            <button
            onClick={() => {
                toast.dismiss();
            }}
            >
            Cancel
            </button>
        </div>
        </div>
    );
};