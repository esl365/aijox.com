import { useState, useEffect } from 'react';

/**
 * Debounce hook
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Email availability check hook
 * Debounces input and checks email availability via API
 */
export function useEmailCheck(email: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    // Reset if email is empty or invalid format
    if (!debouncedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    // Check email availability
    const checkEmail = async () => {
      setIsChecking(true);
      try {
        const response = await fetch(
          `/api/auth/check-email?email=${encodeURIComponent(debouncedEmail)}`
        );
        const data = await response.json();

        if (response.ok) {
          setIsAvailable(data.available);
        } else {
          setIsAvailable(null);
        }
      } catch (error) {
        console.error('Email check failed:', error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkEmail();
  }, [debouncedEmail]);

  return { isChecking, isAvailable };
}
