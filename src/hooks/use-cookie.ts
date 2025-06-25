'use client';

import { useState, useCallback, useEffect } from 'react';

// Function to set a cookie
const setCookie = (name: string, value: string, days: number) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  if (typeof document !== 'undefined') {
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  }
};

// Function to get a cookie
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const useCookie = (key: string, initialValue: string): [string | null, (value: string, days?: number) => void] => {
  const [item, setItemValue] = useState<string | null>(initialValue);

  useEffect(() => {
    const value = getCookie(key);
    if (value !== null) {
      setItemValue(value);
    }
  }, [key]);

  const setValue = useCallback(
    (value: string, days = 365) => {
      setItemValue(value);
      setCookie(key, value, days);
    },
    [key]
  );

  return [item, setValue];
};
