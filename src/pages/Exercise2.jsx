import { useCallback, useEffect } from "react";
import { Range } from "../components/Range";
import useFetch from "../hooks/useFetch";

export function Exercise2() {
  const { data, loading, sendRequest } = useFetch();
  const url =
    "https://range-mock-db-default-rtdb.europe-west1.firebasedatabase.app/values.json";

  useEffect(() => getData(), []);

  /**
   * Fetch fixed values.
   */
  const getData = useCallback(() => {
    sendRequest(url);
  }, [url, sendRequest]);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {!loading && data && (
        <Range
          config={{
            values: data.rangeValues,
            showStepTicks: false,
            currencyMode: true,
            showStepTicks: true,
            showStepLabels: true,
          }}
        ></Range>
      )}
    </div>
  );
}
