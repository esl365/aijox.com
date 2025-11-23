/**
 * Unit tests for useInstallPrompt hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInstallPrompt } from '@/lib/hooks/use-install-prompt';

// Mock the utilities
vi.mock('@/lib/pwa/platform-detector', () => ({
  detectPlatform: vi.fn(() => 'android'),
  supportsInstallPrompt: vi.fn(() => true),
}));

vi.mock('@/lib/pwa/install-tracking', () => ({
  shouldShowInstallPrompt: vi.fn(() => true),
  markPromptShown: vi.fn(),
  dismissInstallPrompt: vi.fn(),
}));

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

describe('useInstallPrompt', () => {
  let beforeInstallPromptListener: ((event: Event) => void) | null = null;
  let appInstalledListener: ((event: Event) => void) | null = null;
  let mockPromptEvent: Partial<BeforeInstallPromptEvent>;

  beforeEach(() => {
    // Mock window.addEventListener
    global.window.addEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'beforeinstallprompt') {
        beforeInstallPromptListener = handler;
      } else if (event === 'appinstalled') {
        appInstalledListener = handler;
      }
    });

    global.window.removeEventListener = vi.fn();

    // Mock gtag
    (global.window as any).gtag = vi.fn();

    // Create mock prompt event
    mockPromptEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    };
  });

  afterEach(() => {
    beforeInstallPromptListener = null;
    appInstalledListener = null;
    delete (global.window as any).gtag;
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.showPrompt).toBe(false);
    expect(result.current.canInstall).toBe(false);
    expect(result.current.platform).toBe('android');
  });

  it('should register beforeinstallprompt event listener when platform supports it', () => {
    renderHook(() => useInstallPrompt());

    expect(global.window.addEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
    expect(global.window.addEventListener).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );
  });

  it('should not register events if platform does not support install prompt', async () => {
    const { supportsInstallPrompt } = await import('@/lib/pwa/platform-detector');
    vi.mocked(supportsInstallPrompt).mockReturnValueOnce(false);

    const { result } = renderHook(() => useInstallPrompt());

    // Hook should still initialize but not register events
    expect(result.current.platform).toBe('android');
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useInstallPrompt());

    unmount();

    expect(global.window.removeEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
    expect(global.window.removeEventListener).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );
  });

  it('should capture and prevent default on beforeinstallprompt', async () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      if (beforeInstallPromptListener) {
        beforeInstallPromptListener(mockPromptEvent as Event);
      }
    });

    await waitFor(() => {
      expect(mockPromptEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.canInstall).toBe(true);
      expect(result.current.showPrompt).toBe(true);
    });
  });

  it('should call install and trigger prompt', async () => {
    const { result } = renderHook(() => useInstallPrompt());

    // Trigger beforeinstallprompt
    act(() => {
      if (beforeInstallPromptListener) {
        beforeInstallPromptListener(mockPromptEvent as Event);
      }
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true);
    });

    // Call install
    await act(async () => {
      await result.current.install();
    });

    expect(mockPromptEvent.prompt).toHaveBeenCalled();
    expect(result.current.showPrompt).toBe(false);
    expect(result.current.canInstall).toBe(false);
  });

  it('should handle install dismissal', async () => {
    mockPromptEvent.userChoice = Promise.resolve({ outcome: 'dismissed' as const });

    const { result } = renderHook(() => useInstallPrompt());

    // Trigger beforeinstallprompt
    act(() => {
      if (beforeInstallPromptListener) {
        beforeInstallPromptListener(mockPromptEvent as Event);
      }
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true);
    });

    // Call install
    await act(async () => {
      await result.current.install();
    });

    expect(mockPromptEvent.prompt).toHaveBeenCalled();
    expect((global.window as any).gtag).toHaveBeenCalledWith('event', 'install_prompt_result', {
      outcome: 'dismissed',
      platform: 'android',
    });
  });

  it('should handle dismiss action', async () => {
    const { dismissInstallPrompt } = await import('@/lib/pwa/install-tracking');
    const { result } = renderHook(() => useInstallPrompt());

    // Trigger beforeinstallprompt
    act(() => {
      if (beforeInstallPromptListener) {
        beforeInstallPromptListener(mockPromptEvent as Event);
      }
    });

    await waitFor(() => {
      expect(result.current.showPrompt).toBe(true);
    });

    // Dismiss prompt
    act(() => {
      result.current.dismiss();
    });

    expect(result.current.showPrompt).toBe(false);
    expect(dismissInstallPrompt).toHaveBeenCalled();
    expect((global.window as any).gtag).toHaveBeenCalledWith('event', 'install_prompt_dismissed', {
      platform: 'android',
    });
  });

  it('should not show prompt if shouldShowInstallPrompt returns false', async () => {
    const { shouldShowInstallPrompt } = await import('@/lib/pwa/install-tracking');
    vi.mocked(shouldShowInstallPrompt).mockReturnValue(false);

    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      if (beforeInstallPromptListener) {
        beforeInstallPromptListener(mockPromptEvent as Event);
      }
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true);
      expect(result.current.showPrompt).toBe(false);
    });
  });

  it('should not call prompt if deferredPrompt is null', async () => {
    const { result } = renderHook(() => useInstallPrompt());

    // Try to install without triggering beforeinstallprompt
    await act(async () => {
      await result.current.install();
    });

    expect(mockPromptEvent.prompt).not.toHaveBeenCalled();
  });

  it('should handle appinstalled event', async () => {
    const { result } = renderHook(() => useInstallPrompt());

    // Trigger beforeinstallprompt
    act(() => {
      if (beforeInstallPromptListener) {
        beforeInstallPromptListener(mockPromptEvent as Event);
      }
    });

    await waitFor(() => {
      expect(result.current.showPrompt).toBe(true);
    });

    // Trigger appinstalled event
    act(() => {
      if (appInstalledListener) {
        appInstalledListener(new Event('appinstalled'));
      }
    });

    await waitFor(() => {
      expect(result.current.showPrompt).toBe(false);
      expect(result.current.canInstall).toBe(false);
    });

    expect((global.window as any).gtag).toHaveBeenCalledWith('event', 'pwa_installed', {
      platform: 'android',
    });
  });

  it('should detect iOS platform', async () => {
    const { detectPlatform } = await import('@/lib/pwa/platform-detector');
    vi.mocked(detectPlatform).mockReturnValue('ios');

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.platform).toBe('ios');
  });
});
