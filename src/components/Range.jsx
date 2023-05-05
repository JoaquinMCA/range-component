import { useEffect, useRef, useState } from "react";

export function Range(props) {
  const bulletSize = 24;
  const [min, setMin] = useState(props.config.min ?? 1);
  const [max, setMax] = useState(props.config.max ?? 10);
  const [step, setStep] = useState(1);
  const [posibleValues, setPosibleValues] = useState([]);
  const [stepLength, setStepLength] = useState(null);
  const [minMaxVariable, setMinMaxVariable] = useState(true);
  const [showMinSelectedValue, setShowMinSelectedValue] = useState(
    props.config.showMinSelectedValue ?? true
  );
  const [showMaxSelectedValue, setShowMaxSelectedValue] = useState(
    props.config.showMaxSelectedValue ?? true
  );
  const [showStepTicks, setShowStepTicks] = useState(
    props.config.showStepTicks ?? true
  );
  const [showStepLabels, setShowStepLabels] = useState(
    props.config.showStepLabels ?? false
  );

  const [selectedMin, setSelectedMin] = useState(1);
  const [selectedMax, setSelectedMax] = useState(100);

  const [selectedBullet, setSelectedBullet] = useState(null);
  const [lastSelectedBullet, setLastSelectedBullet] = useState(null);
  const [minBulletPosition, setMinBulletPosition] = useState(0);
  const [maxBulletPosition, setMaxBulletPosition] = useState(0);

  const minBulletRef = useRef();
  const maxBulletRef = useRef();
  const rangeLine = useRef();

  useEffect(() => {
    console.log("re-render");
    console.log(props.config);
    console.log(props.config.min);
    console.log(props.config.max);
    if (
      !props.config.minInput ||
      (!props.config.maxInput && props.config.possibleValuesInput)
    ) {
      // setMin(config.possibleValuesInput[0]);
      // setMax(config.possibleValuesInput[config.possibleValuesInput.length - 1]);
    }
  }, []);

  useEffect(() => {
    console.log("efect de setPosible values");
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    // console.log("initial");
    // console.log(lineBoundingClientRect);
    setPosibleValues(calculateSteps());
  }, [min, max]);

  useEffect(() => {
    console.log("efect de setMin setMax");
    console.log(posibleValues);
    if (posibleValues?.length > 0) {
      const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
      const stepLenght =
        +lineBoundingClientRect.width / +(posibleValues.length - 1);

      setStepLength(stepLenght);
    }
  }, [posibleValues]);

  useEffect(() => {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    setMinValues(0);
    setMaxValues(lineBoundingClientRect.width);
  }, [stepLength]);

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
    console.log(ev);

    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    console.log(lineBoundingClientRect.clientX);
    console.log(ev.clientX, ev.clientY);
    setSelectedBullet(bullet);
    setLastSelectedBullet(bullet);
    const elem = document.getElementById("app");
    if (elem) {
      elem.style.cursor = "grabbing";
    }
  }

  function manageMouseUp(e) {
    // e.preventDefault();
    // e.stopPropagation();
    // // console.log("mouse up windoweee");
    // // console.log("selectedBullet: ", selectedBullet);
    if (selectedBullet && e) {
      console.log("hay selected bulleT");
      const movement = calcBulletPosition(e);
      selectedBullet === "min-bullet"
        ? setMinValues(movement)
        : setMaxValues(movement);
      setSelectedBullet(null);
      const elem = document.getElementById("app");
      if (elem) {
        elem.style.cursor = "default";
      }
    }
  }

  function setMinValues(movement) {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();

    const minIndex = calculateStepForMovement(movement);
    console.log(minIndex);
    setSelectedMin(posibleValues[minIndex]);
    setMinBulletPosition(minIndex * stepLength);
  }

  function setMaxValues(movement) {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();

    const maxIndex = calculateStepForMovement(movement);
    setSelectedMax(posibleValues[maxIndex]);
    setMaxBulletPosition(maxIndex * stepLength);
  }

  function calcBulletPosition(e) {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    let position = e.clientX - lineBoundingClientRect.left;
    // min value
    if (position < 0) {
      position = 0;
    }
    // max value
    if (position > lineBoundingClientRect.width) {
      position = lineBoundingClientRect.width;
    }

    console.log("calc bullet movement");
    console.log(lineBoundingClientRect.width);
    console.log(lineBoundingClientRect);
    console.log(e.clientX - lineBoundingClientRect.left);
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
    const posibleValues = [+min];
    for (let i = 1; i <= numberOfSteps; i++) {
      posibleValues.push(+min + i * step);
    }
    if (range / step - Math.floor(range / step) > 0) {
      posibleValues.push(+max);
    }
    console.log("posible values: ", posibleValues.toString());
    return posibleValues;
  }

  function calculateStepForMovement(movement) {
    // console.log("calculateStepForPosition");
    // console.log("stepLength: ", stepLength);
    // console.log("movement: ", movement);

    if (stepLength) {
      const nonDecimal = +Math.floor(movement / stepLength);
      const decimal =
        movement / stepLength - Math.floor(movement / stepLength) >= 0.5
          ? +1
          : +0;

      const stepIndex = nonDecimal + decimal;

      // console.log("-------->nonDecimal: ", nonDecimal);
      // console.log("-------->decimal: ", decimal);
      // console.log("-------->stepIndex: ", stepIndex);
      return +stepIndex;
    }
  }

  function minInputHandler(event) {
    if (event.target.value !== min) {
      if (event.target.value < 0) {
        console.log("set min 0");
        setMin(0);
      } else if (event.target.value > max) {
        console.log("set min max - 1");
        setMin(max - 1);
      } else {
        console.log("set min lo que sea");
        setMin(event.target.value);
      }
    }
  }

  function maxInputHandler(event) {
    console.log("max input handler: ", event.target.value);
    if (event.target.value < min) {
      setMax(min + 1);
    } else {
      setMax(event.target.value);
    }
  }

  return (
    <div className="range-container">
      <div className="min-max-container">
        <input type="number" step={1} onChange={minInputHandler} value={min} />
      </div>

      <div
        className="range-line-container"
        style={
          {
            // margin: `${bulletSize / 2}px`,
          }
        }
      >
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
            }}
          >
            {showMinSelectedValue && (
              <div className="bullet-value">{selectedMin}</div>
            )}
          </div>
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
            }}
          >
            {showMaxSelectedValue && (
              <div className="bullet-value">{selectedMax}</div>
            )}
          </div>
          {showStepTicks && (
            <div
              className="step"
              style={{
                width: `${0}px`,
              }}
            >
              {showStepLabels && (
                <span className="step-number">{posibleValues[0]}</span>
              )}
            </div>
          )}
          {showStepTicks &&
            posibleValues.map((val, i) => {
              return (
                i > 0 && (
                  <div
                    key={i}
                    className="step"
                    style={{
                      width: `${stepLength}px`,
                    }}
                  >
                    {showStepLabels && (
                      <span className="step-number">{posibleValues[i]}</span>
                    )}
                  </div>
                )
              );
            })}
        </div>
      </div>
      <div className="min-max-container">
        <input type="number" step={1} onChange={maxInputHandler} value={max} />
      </div>

      <div className="debug">
        <div>Selected bullet: {selectedBullet}</div>
        <div>Last selected bullet: {lastSelectedBullet}</div>
        {/* <div>minBulletPosition: {minBulletPosition}</div>
        <div>maxBulletPosition: {maxBulletPosition}</div> */}
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
