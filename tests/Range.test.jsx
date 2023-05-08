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

  const setup = (config) => {
    const rangeComponent = render(<Range config={config}></Range>);
    const minInput = rangeComponent.container.querySelector("#min");
    const maxInput = rangeComponent.container.querySelector("#max");
    const leftBullet = document.querySelector(".bullet-value");
    const rightBullet = document.querySelector(".bullet-value-max");

    return { rangeComponent, minInput, maxInput, leftBullet, rightBullet };
  };

  beforeEach(() => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      width: 200,
    });
  });

  describe("Range component, min - max mode", () => {
    test("Renders to bullets with the initial min and max selected", async () => {
      const { leftBullet, rightBullet } = setup(config1);

      const selectedMinText = "1,00" + String.fromCharCode(160) + "€";
      expect(leftBullet.textContent).toEqual(selectedMinText);

      const selectedMaxText = "100,00" + String.fromCharCode(160) + "€";
      expect(rightBullet.textContent).toEqual(selectedMaxText);
    });

    test("Renders to bullets with the default config, initial min and max selected", async () => {
      const { leftBullet, rightBullet } = setup({});

      const selectedMinText = "1";
      expect(leftBullet.textContent).toEqual(selectedMinText);

      const selectedMaxText = "10";
      expect(rightBullet.textContent).toEqual(selectedMaxText);
    });

    test("Change min input", async () => {
      const { minInput, maxInput } = setup(config1);
      expect(minInput.value).toBe("1");
      fireEvent.change(minInput, { target: { value: "8" } });
      expect(minInput.value).toBe("8");

      // Check that min can not be greater than max (10) and it's value is set automatically to max-1
      fireEvent.change(minInput, { target: { value: +maxInput.value + 1 } });
      const minAutoValue = +(+maxInput.value - 1);
      expect(+minInput.value).toBe(minAutoValue);
    });

    test("Change max input", async () => {
      const { minInput, maxInput } = setup(config1);
      expect(maxInput.value).toBe("100");
      fireEvent.change(maxInput, { target: { value: "23" } });
      expect(maxInput.value).toBe("23");

      // Check that max can not be smaller than min (1) and it's value is set automatically to min+1
      fireEvent.change(maxInput, { target: { value: +minInput.value - 1 } });
      const maxAutoValue = +(+minInput.value + 1);
      expect(+maxInput.value).toBe(maxAutoValue);
    });
  });

  describe("Range component, min - max mode", () => {
    test("Renders to bullets with the initial min and max selected", async () => {
      // const {rangeComponent, minInput, maxInput} = setup(config1);
    });
  });
  // TODO e2e mover las bullet (con drag and drop),
});
