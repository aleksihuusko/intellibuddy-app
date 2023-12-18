// Import necessary hooks from React
import { useState, useEffect } from 'react';

// Define a custom hook called useDebounce
// It takes a value of any type T and an optional delay time in milliseconds
export function useDebounce<T>(value: T, delay?: number): T {
  // Create a state variable to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // useEffect hook to handle the debouncing logic
  useEffect(() => {
    // Set a timer that waits for the specified delay time (default to 500ms if not provided)
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    // Cleanup function to clear the timer if the value or delay changes before the timer ends
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Dependencies of the effect: re-run the effect if value or delay changes

  // Return the debounced value
  return debouncedValue;
}
