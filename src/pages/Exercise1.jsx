import { useCallback, useEffect } from "react";
import { Range } from "../components/Range";
import useFetch from "../hooks/useFetch";

export function Exercise1() {
  const { data, loading, sendRequest } = useFetch();
  const url =
    "https://range-mock-db-default-rtdb.europe-west1.firebasedatabase.app/min-max.json";

  useEffect(() => getData(), []);

  /**
   * Fetch min and max values.
   */
  const getData = useCallback(() => {
    sendRequest(url, "details");
  }, [url, sendRequest]);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {!loading && data && (
        <Range
          config={{
            min: data.min,
            max: data.max,
            showStepTicks: false,
            currencyMode: true,
            step: 0.01,
          }}
        ></Range>
      )}
    </div>
  );
}
