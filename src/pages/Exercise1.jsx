import { useEffect, useRef, useState } from "react";

export function Exercise1() {
  const bulletSize = 24;
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(10);
  const [step, setStep] = useState(1);
  const [posibleValues, setPosibleValues] = useState([]);
  const [stepLength, setSetepLength] = useState(1);

  const [selectedMin, setSelectedMin] = useState(1);
  const [selectedMax, setSelectedMax] = useState(100);

  const [selectedBullet, setSelectedBullet] = useState(null);
  const [lastSelectedBullet, setLastSelectedBullet] = useState(null);
  const [minBulletPosition, setMinBulletPosition] = useState(0);
  const [maxBulletPosition, setMaxBulletPosition] = useState(0);

  const minBulletRef = useRef();
  const maxBulletRef = useRef();
  const rangeLine = useRef();
  //   let mouseUpListener = useRef(null);

  useEffect(() => {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    // console.log("initial");
    // console.log(lineBoundingClientRect);
    setPosibleValues(calculateSteps());
  }, [min, max]);

  useEffect(() => {
    console.log("posibleValues");
    console.log(posibleValues);
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    const stepLenght =
      +lineBoundingClientRect.width / +(posibleValues.length - +1);
    console.log(
      "lineBoundingClientRect.width  ->",
      lineBoundingClientRect.width
    );
    console.log("(posibleValues.length - 1) ->", posibleValues.length - 1);

    console.log("stepLength ->", stepLenght);
    setSetepLength(stepLenght);

    setMinValues(0);
    setMaxValues(lineBoundingClientRect.width);
  }, [posibleValues]);

  //   function calculateStepLenght() {
  //     console.log("----calculateStepLenght-----");
  //     const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
  //     console.log("posibleValues length! ", posibleValues.length);
  //     return Math.floor(lineBoundingClientRect.width / posibleValues.length);
  //   }

  useEffect(() => {
    window.addEventListener("mouseup", manageMouseUp, true);
    window.addEventListener("mousemove", manageMouseMove, true);
    // TODO listen to
    // arrow left y down para mover izquierda la lastSelected si hay
    // arrow right y top para mover derecha la lastSelected si hay
    // click para mover en el click la lastSelected si hay (click en la range-line)
    // como dejar de escuchar estos 3? si hubiera dos componentes hay que quitarlo para que no mueva todos a la vez al pulsar la tecla de la derecha por ejemplo... (mouse out de la caja del input podría ser...)
    return () => {
      window.removeEventListener("mouseup", manageMouseUp, true);
      window.removeEventListener("mousemove", manageMouseMove, true);
    };
  }, [selectedBullet]);

  function manageMouseMove(e) {
    if (selectedBullet && e) {
      console.log("seteo position mouse move");

      const movement = calcBulletPosition(e);
      selectedBullet === "min-bullet";
      selectedBullet === "min-bullet"
        ? setMinValues(movement)
        : setMaxValues(movement);
    }
  }

  function bulletClicked(ev, bullet) {
    console.log("bulletClicked!");
    console.log(ev);
    console.log(ev.clientX, ev.clientY);
    setSelectedBullet(bullet);
    setLastSelectedBullet(bullet);
    const elem = document.getElementById("app");
    if (elem) {
      elem.style.cursor = "grabbing";
    }
  }

  function manageMouseUp(e) {
    // console.log("mouse up windoweee");
    // console.log("selectedBullet: ", selectedBullet);
    if (selectedBullet && e) {
      const movement = calcBulletPosition(e);
      selectedBullet === "min-bullet"
        ? setMinValues(movement)
        : setMaxValues(movement);
      setSelectedBullet(null);
      const elem = document.getElementById("app");
      if (elem) {
        elem.style.cursor = "default";
      }

      //   window.removeEventListener("mouseup", manageMouseMove, true);
      //   console.log(minBulletPosition);
      //   console.log(maxBulletPosition);
    } else {
      console.log("no hago nada");
      // setSelectedBullet(null);
      e?.preventDefault();
    }
  }

  function setMinValues(movement) {
    const minIndex = calculateStepForMovement(movement);
    console.log(minIndex);
    setSelectedMin(posibleValues[minIndex]);
    setMinBulletPosition(minIndex * stepLength);
  }

  function setMaxValues(movement) {
    const maxIndex = calculateStepForMovement(movement);
    setSelectedMax(posibleValues[maxIndex]);
    setMaxBulletPosition(maxIndex * stepLength);
  }

  function calcBulletPosition(e) {
    let position = e.clientX;
    // min value
    if (position < 0) {
      position = 0;
    }
    // max value
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    if (position > lineBoundingClientRect.width) {
      position = lineBoundingClientRect.width;
    }

    console.log("calc bullet movement");
    console.log(lineBoundingClientRect.width);
    console.log(e.clientX);
    console.log(position);
    if (selectedBullet === "min-bullet") {
      // min < max
      if (position > maxBulletPosition - stepLength) {
        position = maxBulletPosition - stepLength;
      }
    } else {
      // max > min
      if (position < minBulletPosition + stepLength) {
        position = minBulletPosition + stepLength;
      }
    }
    // console.log(`position ${position}`);
    // console.log(`minBulletPosition ${minBulletPosition}`);
    // console.log(`maxBulletPosition ${maxBulletPosition}`);
    return position;
  }

  function calculateSteps() {
    const range = max - min;
    const numberOfSteps = Math.floor(range / step);
    const posibleValues = [min];
    for (let i = 1; i <= numberOfSteps; i++) {
      posibleValues.push(min + i * step);
    }
    if (range / step - Math.floor(range / step) > 0) {
      posibleValues.push(max);
    }
    console.log("posible values: ", posibleValues.toString());
    return posibleValues;
  }

  function calculateStepForMovement(movement) {
    console.log("calculateStepForPosition");
    console.log("stepLength: ", stepLength);
    console.log("movement: ", movement);

    const nonDecimal = +Math.floor(movement / stepLength);
    const decimal =
      movement / stepLength - Math.floor(movement / stepLength) >= 0.5
        ? +1
        : +0;

    const stepIndex = nonDecimal + decimal;

    console.log("-------->nonDecimal: ", nonDecimal);
    console.log("-------->decimal: ", decimal);
    console.log("-------->stepIndex: ", stepIndex);
    return +stepIndex;
  }

  //   function allowDrop(ev) {
  //     ev.preventDefault();
  //   }

  //   function drag(ev) {
  //     console.log("drag!");
  //     console.log(ev);
  //     // ev.preventDefault();
  //     ev.dataTransfer.setData("text", ev.target.id);
  //   }

  //   function drop(ev) {
  //     ev.preventDefault();
  //     console.log("drop!");
  //     console.log(ev);
  //     var data = ev.dataTransfer.getData("text");
  //     ev.target.appendChild(document.getElementById(data));
  //   }

  //   function dragCapture(ev) {
  //     console.log("dragCapture!");
  //     console.log(ev.clientX, ev.clientY);
  //     ev.clientY = 100;
  //   }

  //   function bulletDroped(ev) {
  //     console.log("bulletDroped!");
  //     console.log(ev);
  //     console.log(ev.clientX, ev.clientY);
  //   }

  return (
    <div
      className="range-container"
      style={{
        margin: `${bulletSize / 2}px`,
      }}
    >
      {/* <div
        className="range-line"
        onDrop={(e) => drop(e)}
        onDragOver={(e) => allowDrop(e)}
      >
        <div
        onMou
          className="bullet"
          id="min-bullet"
          draggable="true"
          onDragStart={(e) => drag(e)}
          ref={minBulletRef}
        ></div>
        <div
          className="bullet"
          id="max-bullet"
          draggable="true"
          onDragCapture={(e) => dragCapture(e)}
          onDragStart={(e) => drag(e)}
          ref={maxBulletRef}
        ></div>
      </div> */}

      <div
        className={
          "range-line " + (selectedBullet ? "range-line-changing" : "")
        }
        ref={rangeLine}
      >
        <div
          className={
            "bullet " +
            (selectedBullet === "min-bullet" ? "bullet-dragging" : "")
          }
          id="min-bullet"
          onMouseDown={(e) => bulletClicked(e, "min-bullet")}
          ref={minBulletRef}
          style={{
            width: `${bulletSize}px`,
            height: `${bulletSize}px`,
            position: "absolute",
            left: `${minBulletPosition - bulletSize / 2}px`,
            backgroundColor: "blue",
            // top: `${this.state.yoffset}px`,
          }}
        ></div>
        <div
          className={
            "bullet " +
            (selectedBullet === "max-bullet" ? "bullet-dragging" : "")
          }
          id="max-bullet"
          onMouseDown={(e) => bulletClicked(e, "max-bullet")}
          ref={maxBulletRef}
          style={{
            width: `${bulletSize}px`,
            height: `${bulletSize}px`,
            position: "absolute",
            left: `${maxBulletPosition - bulletSize / 2}px`,
            backgroundColor: "red",
            // top: `${this.state.yoffset}px`,
          }}
        ></div>
        <div
          className="step"
          style={{
            width: `${0}px`,
          }}
        >
          <span className="step-number">{posibleValues[0]}</span>
        </div>
        {posibleValues.map((val, i) => {
          return (
            i > 0 && (
              <div
                key={i}
                className="step"
                style={{
                  width: `${stepLength}px`,
                }}
              >
                <span className="step-number">{posibleValues[i]}</span>
              </div>
            )
          );
        })}
      </div>

      <div className="debug">
        <div>Selected bullet: {selectedBullet}</div>
        <div>Last selected bullet: {lastSelectedBullet}</div>
        <div>minBulletPosition: {minBulletPosition}</div>
        <div>maxBulletPosition: {maxBulletPosition}</div>
        <div>selectedMin {selectedMin}</div>
        <div>selectedMax: {selectedMax}</div>
        {/* <div>posibleValues length: {posibleValues.length}</div> */}
        {/* <div>stepLenght: {stepLength}</div> */}
      </div>

      {/* <div>
        <input type="range" id="volume" name="volume" min="0" max="10" />
        <label>Volume</label>
      </div> */}
    </div>
  );
}
