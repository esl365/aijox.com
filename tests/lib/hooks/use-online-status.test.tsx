/**
 * Unit tests for useOnlineStatus hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '@/lib/hooks/use-online-status';

describe('useOnlineStatus', () => {
  const originalNavigator = global.navigator;
  let onlineListener: ((event: Event) => void) | null = null;
  let offlineListener: ((event: Event) => void) | null = null;

  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Mock addEventListener and removeEventListener
    global.window.addEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'online') {
        onlineListener = handler;
      } else if (event === 'offline') {
        offlineListener = handler;
      }
    });

    global.window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    global.navigator = originalNavigator;
    onlineListener = null;
    offlineListener = null;
    vi.clearAllMocks();
  });

  it('should return true when navigator.onLine is true', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('should return false when navigator.onLine is false', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('should update to false when offline event is triggered', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    // Trigger offline event
    act(() => {
      if (offlineListener) {
        offlineListener(new Event('offline'));
      }
    });

    expect(result.current).toBe(false);
  });

  it('should update to true when online event is triggered', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    // Trigger online event
    act(() => {
      if (onlineListener) {
        onlineListener(new Event('online'));
      }
    });

    expect(result.current).toBe(true);
  });

  it('should register event listeners on mount', () => {
    renderHook(() => useOnlineStatus());

    expect(global.window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(global.window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(global.window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(global.window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should handle multiple online/offline transitions', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    // Go offline
    act(() => {
      if (offlineListener) {
        offlineListener(new Event('offline'));
      }
    });
    expect(result.current).toBe(false);

    // Come back online
    act(() => {
      if (onlineListener) {
        onlineListener(new Event('online'));
      }
    });
    expect(result.current).toBe(true);

    // Go offline again
    act(() => {
      if (offlineListener) {
        offlineListener(new Event('offline'));
      }
    });
    expect(result.current).toBe(false);
  });
});
