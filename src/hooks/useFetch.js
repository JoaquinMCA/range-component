import { useCallback, useState } from "react";

/**
 * Hook to fetch data from APIs.
 */
const useFetch = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errors, setErrors] = useState([]);
  const [reqType, setReqType] = useState();

  /**
   * Single request.
   */
  const sendRequest = useCallback(
    (url, requestType, contentType = "application/json") => {
      setLoading(true);
      setError(false);
      setReqType(requestType);
      fetch(url, {
        headers: {
          "Content-Type": contentType,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.error) {
            setError(true);
          } else {
            setData(res);
          }
        })
        .catch((err) => {
          setError(true);
          setErrors((prevValue) => {
            return [...prevValue, err];
          });
        })
        .finally(() => setLoading(false));
    },
    []
  );

  return { data, loading, error, sendRequest, reqType, errors };
};

export default useFetch;
