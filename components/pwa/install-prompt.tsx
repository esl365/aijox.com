/**
 * PWA Install Prompt Component
 * Shows platform-specific installation instructions
 */

'use client';

import { useInstallPrompt } from '@/lib/hooks/use-install-prompt';
import { Button } from '@/components/ui/button';
import { X, Download, Share } from 'lucide-react';
import { useEffect, useState } from 'react';

export function InstallPrompt() {
  const { showPrompt, platform, canInstall, install, dismiss } = useInstallPrompt();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !showPrompt) {
    return null;
  }

  // iOS Installation Instructions
  if (platform === 'ios') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 animate-slide-up">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Install EduNexus</h3>
            </div>
            <button
              onClick={dismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Install this app on your iPhone for a better experience:
          </p>

          <ol className="space-y-2 text-sm text-gray-700 mb-4">
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                1
              </span>
              <span>
                Tap the <Share className="inline h-4 w-4 mx-1" /> Share button in Safari
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                2
              </span>
              <span>Scroll down and tap "Add to Home Screen"</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                3
              </span>
              <span>Tap "Add" to install</span>
            </li>
          </ol>

          <Button
            variant="outline"
            className="w-full"
            onClick={dismiss}
          >
            Got it
          </Button>
        </div>
      </div>
    );
  }

  // Android/Desktop Installation Prompt
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-lg bg-white/10">
            <Download className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Install EduNexus</h3>
            <p className="text-sm text-blue-100">
              Get quick access and work offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={install}
            disabled={!canInstall}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Install
          </Button>
          <button
            onClick={dismiss}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
