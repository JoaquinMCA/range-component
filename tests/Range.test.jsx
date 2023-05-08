import { fireEvent, render } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { Range } from "../src/components/Range";

describe("Range component", () => {
  const config1 = {
    min: 1,
    max: 100,
    showStepTicks: false,
    currencyMode: true,
    step: 1,
  };

  const fixedValues = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];

  const config2 = {
    values: fixedValues,
    showStepTicks: false,
    currencyMode: true,
    showStepTicks: true,
    showStepLabels: true,
  };

  const setup = (config) => {
    const rangeComponent = render(<Range config={config}></Range>);
    const minInput = rangeComponent.container.querySelector("#min");
    const maxInput = rangeComponent.container.querySelector("#max");
    const leftBullet = document.querySelector(".bullet-value");
    const rightBullet = document.querySelector(".bullet-value-max");
    const minLabel = rangeComponent.container.querySelector("#min-label");
    const maxLabel = rangeComponent.container.querySelector("#max-label");

    return {
      rangeComponent,
      minInput,
      maxInput,
      leftBullet,
      rightBullet,
      minLabel,
      maxLabel,
    };
  };

  const generateCurrencyLabel = (amount) => {
    return amount.toString().replace(".", ",") + String.fromCharCode(160) + "€";
  };

  beforeEach(() => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      width: 200,
    });
  });

  describe("Range component, min - max mode", () => {
    test("Renders to bullets with the initial min and max selected", async () => {
      const { leftBullet, rightBullet } = setup(config1);

      const selectedMinText = generateCurrencyLabel("1,00");
      expect(leftBullet.textContent).toEqual(selectedMinText);

      const selectedMaxText = generateCurrencyLabel("100,00");
      expect(rightBullet.textContent).toEqual(selectedMaxText);
    });

    test("If no min, max or values are passed inside config, check error", async () => {
      const errorSpy = vi.spyOn(console, "error");
      const { leftBullet, rightBullet } = setup({});
      expect(errorSpy).toHaveBeenCalledWith(
        "Either min and max or values have to be passed as part of the config."
      );
    });

    test("Change min input", async () => {
      const { minInput, maxInput, minLabel, maxLabel } = setup(config1);
      expect(minInput.value).toBe("1");
      fireEvent.change(minInput, { target: { value: "8" } });
      expect(minInput.value).toBe("8");

      // Check that min can not be greater than max (10) and it's value is set automatically to max-1
      fireEvent.change(minInput, { target: { value: +maxInput.value + 1 } });
      const minAutoValue = +(+maxInput.value - 1);
      expect(+minInput.value).toBe(minAutoValue);

      // Labels should not be present
      expect(minLabel).toBeNull();
      expect(maxLabel).toBeNull();
    });

    test("Change max input", async () => {
      const { minInput, maxInput, minLabel, maxLabel } = setup(config1);
      expect(maxInput.value).toBe("100");
      fireEvent.change(maxInput, { target: { value: "23" } });
      expect(maxInput.value).toBe("23");

      // Check that max can not be smaller than min (1) and it's value is set automatically to min+1
      fireEvent.change(maxInput, { target: { value: +minInput.value - 1 } });
      const maxAutoValue = +(+minInput.value + 1);
      expect(+maxInput.value).toBe(maxAutoValue);

      // Labels should not be present
      expect(minLabel).toBeNull();
      expect(maxLabel).toBeNull();
    });
  });

  describe("Range component, min - max mode", () => {
    test("Renders to bullets with the initial min and max selected, labels, not inputs", async () => {
      const { minInput, maxInput, minLabel, maxLabel } = setup(config2);

      const selectedMinLabelText = generateCurrencyLabel("1,99");
      const selectedMaxLabelText = generateCurrencyLabel("70,99");

      expect(minLabel.textContent).toEqual(selectedMinLabelText);
      expect(maxLabel.textContent).toEqual(selectedMaxLabelText);

      // Inputs should not be present
      expect(minInput).toBeNull();
      expect(maxInput).toBeNull();
    });

    test("Check the correct number of steps (only the given values)", async () => {
      const { rangeComponent } = setup(config2);
      const steps = rangeComponent.container.querySelectorAll(".step");
      const stepLabels =
        rangeComponent.container.querySelectorAll(".step-number");
      expect(steps.length).toEqual(6);
      expect(stepLabels.length).toEqual(6);

      // Check if the step labels correspond to the given values (in this case using currency mode).
      let i = 0;
      stepLabels.forEach((label) => {
        expect(label.textContent).toEqual(
          generateCurrencyLabel(fixedValues[i])
        );
        i++;
      });
    });
  });
});
