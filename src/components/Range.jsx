import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrency } from "../hooks/useCurrency";

/**
 * Range component to select using bullets a min and a max value from an interval.
 *
 * Two modes are posible:
 *  - Min and max values are given (and are editable by the user).
 *  - All the possible values are given (and are not editable by the user).
 *
 * Config object passed as prop is available with the following properties:
 *  - min: smallest available value
 *  - max: greatest available value
 *  - step: distance between available values
 *  - showMinSelectedValue: show/hide the selected min value
 *  - showMaxSelectedValue: show/hide the selected max value
 *  - showStepTicks: show/hide the step marks
 *  - showStepLabels: show/hide the step numeric labels
 *
 * Min and max values can be selected by dragging the bullets and using the arrow keys (a bullet has to be dragged before the arrow keys are available).
 */
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
  const rangeContainer = useRef();

  /**
   *
   */
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

  /**
   * Calculate the posible values when the min or max values change.
   */
  useEffect(() => {
    setPosibleValues(calculateSteps());
  }, [min, max]);

  /**
   * Calculates the step lenght.
   */
  useEffect(() => {
    if (posibleValues?.length > 0) {
      const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
      const stepLenght =
        +lineBoundingClientRect.width / +(posibleValues.length - 1);
      setStepLength(stepLenght);
    }
  }, [posibleValues]);

  /**
   * Calculates the step in wich a bullet has to be for a mouse movement.
   *
   * @param movement in pixels
   */
  const calculateStepForMovement = useCallback(
    (movement) => {
      if (stepLength) {
        const nonDecimal = +Math.floor(movement / stepLength);
        const decimal =
          movement / stepLength - Math.floor(movement / stepLength) >= 0.5
            ? +1
            : +0;
        const stepIndex = nonDecimal + decimal;
        return +stepIndex;
      }
    },
    [stepLength]
  );

  /**
   * Sets the selected min value and the min bullet position.
   *
   * @param event movement in px
   */
  const setMinValues = useCallback(
    (movement) => {
      const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
      const minIndex = calculateStepForMovement(movement);
      setSelectedMin(posibleValues[minIndex]);
      setMinBulletPosition(minIndex * stepLength);
    },
    [posibleValues, stepLength, calculateStepForMovement]
  );

  /**
   * Sets the selected max value and the max bullet position.
   *
   * @param event movement in px
   */
  const setMaxValues = useCallback(
    (movement) => {
      const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
      const maxIndex = calculateStepForMovement(movement);
      setSelectedMax(posibleValues[maxIndex]);
      setMaxBulletPosition(maxIndex * stepLength);
    },
    [posibleValues, stepLength, calculateStepForMovement]
  );

  /**
   * Calculate the min and max values and positions.
   */
  useEffect(() => {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    setMinValues(0);
    setMaxValues(lineBoundingClientRect.width);
  }, [stepLength, posibleValues]);

  /**
   * Listen to mouse up and mouse move events to move the bullets and "drop" them.
   */
  useEffect(() => {
    window.addEventListener("mouseup", manageMouseUp, true);
    window.addEventListener("mousemove", manageMouseMove, true);
    return () => {
      window.removeEventListener("mouseup", manageMouseUp, true);
      window.removeEventListener("mousemove", manageMouseMove, true);
    };
  }, [selectedBullet]);

  /**
   * Calculates the exact position of a bullet matching a step.
   * Controls that the min and max bullet cannot cross or leave the range interval.
   *
   * @param event mouse event
   */
  const calcBulletPosition = useCallback(
    (e) => {
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
    },
    [selectedBullet, maxBulletPosition, minBulletPosition, stepLength]
  );

  /**
   * Controls mouse movement to move the bullets accordingly.
   */
  const manageMouseMove = useCallback(
    (e) => {
      if (selectedBullet && e) {
        const movement = calcBulletPosition(e);
        selectedBullet === "min-bullet";
        selectedBullet === "min-bullet"
          ? setMinValues(movement)
          : setMaxValues(movement);
      }
    },
    [calcBulletPosition, setMinValues, setMaxValues]
  );

  /**
   * Selects a bullet.
   */
  const bulletClicked = useCallback((ev, bullet) => {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    setSelectedBullet(bullet);
    setLastSelectedBullet(bullet);
    const elem = document.getElementById("app");
    if (elem) {
      elem.style.cursor = "grabbing";
    }
  }, []);

  /**
   * Releases the bullets.
   */
  const manageMouseUp = useCallback(
    (e) => {
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
    },
    [selectedBullet, calcBulletPosition]
  );

  /**
   * Goes to the previous (smaller) possible value (triggered by arrow keys down and left).
   *
   * @param last moved bullet
   */
  const goPreviousValue = useCallback(
    (bullet) => {
      if (bullet === "min-bullet") {
        let index = posibleValues.findIndex((x) => x === selectedMin);
        index = index - 1 < 0 ? 0 : index - 1;
        setSelectedMin(posibleValues[index]);
        setMinBulletPosition(index * stepLength);
      } else if (bullet === "max-bullet") {
        let index = posibleValues.findIndex((x) => x === selectedMax);
        index = index - 1 < 0 ? 0 : index - 1;
        setSelectedMax(posibleValues[index]);
        setMaxBulletPosition(index * stepLength);
      }
    },
    [posibleValues, selectedMin]
  );

  /**
   * Goes to the next (greater) possible value (triggered by arrow keys right and up).
   *
   * @param last moved bullet
   */
  const goNextValue = useCallback(
    (bullet) => {
      if (bullet === "min-bullet") {
        let index = posibleValues.findIndex((x) => x === selectedMin);
        index =
          index + 1 > posibleValues.length - 1
            ? posibleValues.length - 1
            : index + 1;
        setSelectedMin(posibleValues[index]);
        setMinBulletPosition(index * stepLength);
      } else if (bullet === "max-bullet") {
        let index = posibleValues.findIndex((x) => x === selectedMax);
        index =
          index + 1 > posibleValues.length - 1
            ? posibleValues.length - 1
            : index + 1;
        setSelectedMax(posibleValues[index]);
        setMaxBulletPosition(index * stepLength);
      }
    },
    [posibleValues, selectedMin, stepLength]
  );

  /**
   * Controls arrow keys pressing.
   */
  const manageKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        goNextValue(lastSelectedBullet);
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        goPreviousValue(lastSelectedBullet);
      }
    },
    [goNextValue, goPreviousValue, lastSelectedBullet]
  );

  /**
   * Calculates all the steps between the min and max values.
   */
  const calculateSteps = useCallback(() => {
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
  }, [min, max, step]);

  /**
   * Controls the new min input.
   * Min can't be greather than the max.
   * Min can't be smaller than the first possible value.
   *
   * @param event input change event
   */
  const minInputHandler = useCallback(
    (event) => {
      let newValue = event?.target?.value;
      if (newValue !== min) {
        if (newValue < 0) {
          setMin(0);
        } else if (newValue > max) {
          setMin(max - 1);
        } else {
          setMin(newValue);
        }
      }
    },
    [min, max]
  );

  /**
   * Controls the new max input.
   * Max can't be smaller than the min.
   * Max can't be greater than the last possible value.
   *
   * @param event input change event
   */
  const maxInputHandler = useCallback(
    (event) => {
      let newValue = event?.target?.value;
      if (newValue < min) {
        setMax(min + 1);
      } else {
        setMax(newValue);
      }
    },
    [min]
  );

  // KEYBOARD ARRROWS LOGIC
  /**
   * Listen to the arrow key events to move the last moved bullet.
   */
  useEffect(() => {
    window.addEventListener("keydown", manageKeyDown, true);
    return () => {
      window.removeEventListener("keydown", manageKeyDown, true);
    };
  }, [selectedMin, selectedMax]);

  /**
   * Listen to the mouse leave event to stop listening key events.
   * Needed to avoid wrong behaviours when other components such as other <Range /> are also listening to the key events.
   */
  useEffect(() => {
    rangeContainer.current?.addEventListener("mouseleave", clearKeyListeners);
    return () => {
      rangeContainer.current?.removeEventListener(
        "mouseleave",
        clearKeyListeners
      );
    };
  }, [rangeContainer, selectedMin, selectedMax]);

  /**
   * Clears listeners.
   */
  const clearKeyListeners = useCallback(() => {
    window.removeEventListener("keydown", manageKeyDown, true);
  }, [manageKeyDown]);

  return (
    <div className="range-container" ref={rangeContainer}>
      <div className="min-max-container">
        <input
          type="number"
          step={step}
          onChange={minInputHandler}
          value={min}
        />
      </div>

      <div className="range-line-container">
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
        <input
          type="number"
          step={step}
          onChange={maxInputHandler}
          value={max}
        />
      </div>
    </div>
  );
}
