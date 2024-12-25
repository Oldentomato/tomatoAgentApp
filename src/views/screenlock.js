import React from "react";
import { useDimensions } from "../components/screenlock/use-dimensions";
import { Canvas } from "../components/screenlock/Canvas";
import { Hexagon } from "../components/screenlock/Hexagon";
import { getHexagonsToFillZone } from "../components/screenlock/random-helpers";
import MappedPhrase from "../components/screenlock/MappedPhrase";
import "../css/screenlock_view.css"


const ScreenLockView = ({onUnLock}) => {
  const [ref, { width, height, dpr }] = useDimensions();

  return (
    <div className="mainview" ref={ref}>
      {width === undefined || height === undefined || dpr === undefined ? (
        <div>{"nope"}</div>
      ) : (
        <Canvas width={width} height={height} dpr={dpr} isAnimating={true}>
            <div style={{position: 'absolute'}}>
                <MappedPhrase />
                <br />
                <button className="mainchatbtn" onClick={onUnLock}><p style={{color:"white", fontSize:"20px"}}>Lets Go!</p></button>
            </div>
          {getHexagonsToFillZone({
            height: height * dpr,
            width: width * dpr
          }).map((hexagon, index) => (
            <Hexagon key={index} {...hexagon} />
          ))}
        </Canvas>
        
      )}
    </div>
  );
};

export default ScreenLockView;
