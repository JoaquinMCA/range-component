import { Range } from "../components/Range";

export function Exercise1() {
  return (
    <div>
      <Range
        config={{
          min: 0,
          max: 100,
          showStepTicks: false,
          currencyMode: true,
          step: 0.01,
        }}
      ></Range>
      <Range
        config={{
          min: 0,
          max: 100,
          showStepTicks: false,
          currencyMode: true,
          step: 0.01,
        }}
      ></Range>
    </div>
    //   <Range
    //     config={{
    //       min: 0,
    //       max: 100,
    //       showStepTicks: false,
    //       currencyMode: true,
    //       step: 0.01,
    //     }}
    //   ></Range>
  );
}
