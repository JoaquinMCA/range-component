import { Range } from "../components/Range";

export function Exercise1() {
  return (
    <Range
      config={{
        min: 0,
        max: 100,
        showStepTicks: false,
        currencyMode: true,
        step: 0.01,
      }}
    ></Range>
  );
}
