import "../css/archive_card.css";
import {Tilt} from "react-tilt";
import {Button} from "antd";


const defaultOptions = {
	reverse:        false,  // reverse the tilt direction
	max:            20,     // max tilt rotation (degrees)
	perspective:    1200,   // Transform perspective, the lower the more extreme the tilt gets.
	scale:          1.1,    // 2 = 200%, 1.5 = 150%, etc..
	speed:          2000,   // Speed of the enter/exit transition
	transition:     true,   // Set a transition on enter/exit.
	axis:           null,   // What axis should be disabled. Can be X or Y.
	reset:          true,    // If the tilt effect has to be reset on exit.
	easing:         "cubic-bezier(.03,.98,.52,.99)",    // Easing on enter/exit.
}

export default function ArchiveItem ({message, onDelete, isLoading}){
    const contentId = message.id
    const contentCategory = message.category

    return(
        <Tilt options={defaultOptions} className="box">
            <div className="elements bg">
                <h2>{contentCategory}</h2>
            </div>
            <div className="elements name">
                <h2>{message.query}</h2>
                {isLoading ? <Button className="dltBtn" type="link" danger loading />
                :<Button className="dltBtn" type="link" danger onClick={() => onDelete(contentId,contentCategory)}>
                    Delete
                </Button>}
                
            </div>

            <div className="elements content">
                <p>{message.content}</p>
            </div>
            <div className="card">
            </div>
        </Tilt>
    )
}