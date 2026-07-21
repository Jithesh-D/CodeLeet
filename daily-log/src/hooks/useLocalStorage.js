import { useEffect, useState } from "react";

function readValue(key, initialValue) {
  if (typeof window === "undefined") {
    return typeof initialValue === "function" ? initialValue() : initialValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    if (storedValue === null) {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }

    return JSON.parse(storedValue);
  } catch {
    return typeof initialValue === "function" ? initialValue() : initialValue;
  }
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore write failures and keep the in-memory value.
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
