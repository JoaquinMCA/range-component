import { useEffect, useRef, useState } from "react";
import { useCurrency } from "../hooks/useCurrency";

export function Range(props) {
  const bulletSize = 24;
  const [min, setMin] = useState(props.config.min ?? 1);
  const [max, setMax] = useState(props.config.max ?? 10);
  const [step, setStep] = useState(props.config.step ?? 1);
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
    if (
      !props.config.minInput ||
      (!props.config.maxInput && props.config.possibleValuesInput)
    ) {
      // TODO given possibleValues
      // setMin(config.possibleValuesInput[0]);
      // setMax(config.possibleValuesInput[config.possibleValuesInput.length - 1]);
    }
  }, []);

  useEffect(() => {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    setPosibleValues(calculateSteps());
  }, [min, max]);

  useEffect(() => {
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
      const movement = calcBulletPosition(e);
      selectedBullet === "min-bullet";
      selectedBullet === "min-bullet"
        ? setMinValues(movement)
        : setMaxValues(movement);
    }
  }

  function bulletClicked(ev, bullet) {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    setSelectedBullet(bullet);
    setLastSelectedBullet(bullet);
    const elem = document.getElementById("app");
    if (elem) {
      elem.style.cursor = "grabbing";
    }
  }

  function manageMouseUp(e) {
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
    }
  }

  function setMinValues(movement) {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    const minIndex = calculateStepForMovement(movement);
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
    return position;
  }

  function calculateSteps() {
    // const range = props.config.currencyMode ? (max - min) * 100 : max - min;
    const range = max - min;
    const numberOfSteps = Math.floor(range / step);
    const posibleValues = [+min];
    for (let i = 1; i <= numberOfSteps; i++) {
      posibleValues.push(+min + i * step);
    }
    if (range / step - Math.floor(range / step) > 0) {
      posibleValues.push(+max);
    }
    return posibleValues;
  }

  function calculateStepForMovement(movement) {
    if (stepLength) {
      const nonDecimal = +Math.floor(movement / stepLength);
      const decimal =
        movement / stepLength - Math.floor(movement / stepLength) >= 0.5
          ? +1
          : +0;
      const stepIndex = nonDecimal + decimal;
      return +stepIndex;
    }
  }

  function minInputHandler(event) {
    let newValue = event?.target?.value;
    if (newValue !== min) {
      if (newValue < 0) {
        setMin(0);
      } else if (newValue > max) {
        setMin(max - 1);
      } else {
        console.log("set min: ", newValue);
        setMin(newValue);
      }
    }
  }

  function maxInputHandler(event) {
    let newValue = event?.target?.value;
    if (newValue < min) {
      setMax(min + 1);
    } else {
      setMax(newValue);
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
              "bullet bullet-on-top " +
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
              <div className="bullet-value">
                {props.config.currencyMode
                  ? useCurrency(selectedMin)
                  : selectedMin}
              </div>
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
              <div className="bullet-value-max ">
                {" "}
                {props.config.currencyMode
                  ? useCurrency(selectedMax)
                  : selectedMax}
              </div>
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
