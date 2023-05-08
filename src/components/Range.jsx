import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrency } from "../hooks/useCurrency";

/**
 * Range component to select using bullets a min and a max value from an interval.
 *
 * Two modes are available:
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
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [step, setStep] = useState("");
  const [possibleValues, setPossibleValues] = useState([]);
  const [stepLength, setStepLength] = useState("");
  const [stepLengths, setStepLengths] = useState([]);
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

  const initialSetup = useCallback(() => {
    // Set default values if needed
    if (props.config.min || props.config.min === 0) {
      setMin(props.config.min);
    } else {
      setMin(1);
    }

    if (props.config.max || props.config.max === 0) {
      setMax(props.config.max);
    } else {
      setMax(10);
    }

    if (props.config.values) {
      setMinMaxVariable(false);
      // Sort values from min to max and remove non number elements
      const values = props.config.values
        .sort(function (a, b) {
          return a - b;
        })
        .filter((x) => {
          return typeof x === "number";
        });
      const minFromValues = values[0];
      const maxFromValues = values[values.length - 1];
      setPossibleValues(values);
      setMin(minFromValues);
      setMax(maxFromValues);
    }

    if (props.config.step) {
      setStep(props.config.step);
    } else {
      setStep(props.config.currencyMode ? +0.01 : +1);
    }
  }, []);

  /**
   * Initial setup, defaults and error if wrong config prop is received.
   */
  useEffect(() => {
    if ((!props.config.min || !props.config.max) && !props.config.values) {
      console.error(
        "Either min and max or values have to be passed as part of the config."
      );
    } else {
      initialSetup();
    }
  }, []);

  /**
   * Calculate the possible values when the min or max values change.
   */
  useEffect(() => {
    if (props.config.min && props.config.max) {
      setPossibleValues(calculateSteps(min, max, step));
    }
  }, [min, max, step]);

  /**
   * Calculates the step lenght.
   */
  useEffect(() => {
    if (possibleValues?.length > 0) {
      const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
      const unitaryStepLength =
        +lineBoundingClientRect.width / +(possibleValues.length - 1);

      if (!props.config.values) {
        setStepLength(unitaryStepLength);
        const stepLengths = [];
        possibleValues.map((x) => {
          stepLengths.push(unitaryStepLength);
        });
        setStepLengths(stepLengths);
      } else {
        const stepLengths = [];
        const relation =
          +lineBoundingClientRect.width /
          (possibleValues[possibleValues.length - 1] - possibleValues[0]);

        for (let i = 1; i < possibleValues.length; i++) {
          stepLengths.push(
            (possibleValues[i] - possibleValues[i - 1]) * relation
          );
        }
        setStepLengths(stepLengths);
      }
    }
  }, [possibleValues]);

  /**
   * Calculates the step lengths when an array of fixed values is given.
   */
  const calculateFixedStepsLength = useCallback((values) => {}, []);

  const calculatePosition = useCallback(
    (index) => {
      let totalLength = 0;
      for (let i = 0; i < index; i++) {
        totalLength += stepLengths[i];
      }
      return totalLength;
    },
    [stepLengths]
  );

  /**
   * Calculates the step in wich a bullet has to be for a mouse movement.
   *
   * @param movement in pixels
   */
  const calculateStepForMovement = useCallback(
    (movement) => {
      let prevStepIndex = 0;
      let nextStepIndex = 0;
      let accLength = 0;
      if (movement === 0 || stepLengths.length === 0) {
        return 0;
      }
      for (let i = 0; i < possibleValues.length; i++) {
        if (accLength >= movement) {
          nextStepIndex = i;
          break;
        } else {
          prevStepIndex = i;
          if (i < possibleValues.length - 1) {
            nextStepIndex = i + 1;
            accLength += stepLengths[i];
          }
        }
      }

      // Check which is closer
      if (
        movement - calculatePosition(prevStepIndex) <
        calculatePosition(nextStepIndex) - movement
      ) {
        return +prevStepIndex;
      } else {
        return +nextStepIndex;
      }
    },
    [possibleValues, stepLengths, calculatePosition]
  );

  /**
   * Sets the selected min value and the min bullet position.
   *
   * @param event movement in px
   */
  const setMinValues = useCallback(
    (movement) => {
      const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
      let minIndex = calculateStepForMovement(movement);
      if (selectedMax && possibleValues[minIndex] >= selectedMax) {
        minIndex -= 1;
        minIndex < 0 ? (minIndex = 0) : null;
      }
      setSelectedMin(possibleValues[minIndex]);
      // setMinBulletPosition(minIndex * stepLength);
      setMinBulletPosition(calculatePosition(minIndex));
    },
    [
      possibleValues,
      stepLength,
      stepLengths,
      selectedMax,
      calculateStepForMovement,
      setMinBulletPosition,
      calculatePosition,
    ]
  );

  /**
   * Sets the selected max value and the max bullet position.
   *
   * @param event movement in px
   */
  const setMaxValues = useCallback(
    (movement) => {
      const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
      let maxIndex = calculateStepForMovement(movement);
      if (selectedMin && possibleValues[maxIndex] <= selectedMin) {
        maxIndex += 1;
        maxIndex > possibleValues.length - 1
          ? (maxIndex = possibleValues.length - 1)
          : null;
      }
      setSelectedMax(possibleValues[maxIndex]);
      // setMaxBulletPosition(maxIndex * stepLength);
      setMaxBulletPosition(calculatePosition(maxIndex));
    },
    [
      possibleValues,
      stepLength,
      stepLengths,
      selectedMin,
      calculateStepForMovement,
      setMaxBulletPosition,
      calculatePosition,
    ]
  );

  /**
   * Calculate the min and max values and positions.
   */
  useEffect(() => {
    const lineBoundingClientRect = rangeLine.current?.getBoundingClientRect();
    setMinValues(0);
    setMaxValues(lineBoundingClientRect.width);
  }, [stepLength, stepLengths, possibleValues]);

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
      let selectedMinIndex = possibleValues.findIndex((x) => x === selectedMin);
      let selectedMaxIndex = possibleValues.findIndex((x) => x === selectedMax);

      if (bullet === "min-bullet") {
        let index = selectedMinIndex;
        index = index - 1 < 0 ? 0 : index - 1;
        setSelectedMin(possibleValues[index]);
        setMinBulletPosition(calculatePosition(index));
      } else if (bullet === "max-bullet") {
        let index = selectedMaxIndex;
        index = index - 1 < 0 ? 0 : index - 1;
        index <= selectedMinIndex ? (index = selectedMinIndex + 1) : null;
        setSelectedMax(possibleValues[index]);
        setMaxBulletPosition(calculatePosition(index));
      }
    },
    [possibleValues, selectedMin, selectedMax, calculatePosition]
  );

  /**
   * Goes to the next (greater) possible value (triggered by arrow keys right and up).
   *
   * @param last moved bullet
   */
  const goNextValue = useCallback(
    (bullet) => {
      let selectedMinIndex = possibleValues.findIndex((x) => x === selectedMin);
      let selectedMaxIndex = possibleValues.findIndex((x) => x === selectedMax);

      if (bullet === "min-bullet") {
        let index = selectedMinIndex;
        index =
          index + 1 > possibleValues.length - 1
            ? possibleValues.length - 1
            : index + 1;

        index >= selectedMaxIndex ? (index = selectedMaxIndex - 1) : null;

        setSelectedMin(possibleValues[index]);
        setMinBulletPosition(calculatePosition(index));
      } else if (bullet === "max-bullet") {
        let index = selectedMaxIndex;
        index =
          index + 1 > possibleValues.length - 1
            ? possibleValues.length - 1
            : index + 1;
        if (index <= selectedMinIndex) {
          index = selectedMinIndex + 1;
        }
        setSelectedMax(possibleValues[index]);
        setMaxBulletPosition(calculatePosition(index));
      }
    },
    [possibleValues, selectedMin, selectedMax, stepLength]
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
  const calculateSteps = useCallback((minValue, maxValue, stepValue) => {
    const range = maxValue - minValue;
    const numberOfSteps = Math.floor(range / stepValue);
    const calculatedPossibleValues = [+minValue];
    for (let i = 1; i <= numberOfSteps; i++) {
      calculatedPossibleValues.push(+minValue + i * stepValue);
    }
    if (range / stepValue - Math.floor(range / stepValue) > 0) {
      calculatedPossibleValues.push(+maxValue);
    }
    return calculatedPossibleValues;
  }, []);

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
        {minMaxVariable && (
          <input
            id="min"
            type="number"
            step={step}
            onChange={minInputHandler}
            value={min}
          />
        )}
        {!minMaxVariable && (
          <label className="min-max-label">
            {props.config.currencyMode ? useCurrency(min) : min}
          </label>
        )}
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
                width: `${stepLengths[0]}px`,
              }}
            >
              {showStepLabels && (
                <span className="step-number">
                  {props.config.currencyMode
                    ? useCurrency(possibleValues[0])
                    : possibleValues[0]}
                </span>
              )}
            </div>
          )}
          {showStepTicks &&
            possibleValues.map((val, i) => {
              return (
                i > 0 && (
                  <div
                    key={i}
                    className="step"
                    style={{
                      width: `${stepLengths[i]}px`,
                    }}
                  >
                    {showStepLabels && (
                      <span className="step-number">
                        {props.config.currencyMode
                          ? useCurrency(possibleValues[i])
                          : possibleValues[i]}
                      </span>
                    )}
                  </div>
                )
              );
            })}
        </div>
      </div>

      <div className="min-max-container">
        {minMaxVariable && (
          <input
            id="max"
            type="number"
            step={step}
            onChange={maxInputHandler}
            value={max}
          />
        )}
        {!minMaxVariable && (
          <label className="min-max-label">
            {props.config.currencyMode ? useCurrency(max) : max}
          </label>
        )}
      </div>
    </div>
  );
}
