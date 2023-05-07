// import "@testing-library/jest-dom/extend-expect";
// import { render } from "@testing-library/react";
// import React from "react";
// import { Range } from "./Range";

// const notLoading = {
//   loading: false,
//   loadingHandler: () => {},
// };

// const config1 = {
//   min: 1,
//   max: 10,
//   showStepTicks: false,
//   currencyMode: true,
//   step: 1,
// };

// describe("Range component", () => {
//   test("Renders to bullets", () => {
//     render(<Range config={config1}></Range>);
//   });
// });
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Range } from "../src/components/Range";

describe("something truthy and falsy", () => {
  it("true to be true", () => {
    expect(true).toBe(true);
  });

  it("false to be false", () => {
    expect(false).toBe(false);
  });

  const config1 = {
    min: 1,
    max: 10,
    showStepTicks: false,
    currencyMode: true,
    step: 1,
  };

  describe("Range component", () => {
    test("Renders to bullets with the initial min and max selected", async () => {
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        width: 200,
      });
      const renderComponent = render(<Range config={config1}></Range>);

      const leftBullet = document.querySelector(".bullet-value");
      const selectedMinText = "1,00" + String.fromCharCode(160) + "€";
      expect(leftBullet.textContent).toEqual(selectedMinText);

      const rightBullet = document.querySelector(".bullet-value-max");
      const selectedMaxText = "10,00" + String.fromCharCode(160) + "€";
      expect(rightBullet.textContent).toEqual(selectedMaxText);
    });
  });
});
