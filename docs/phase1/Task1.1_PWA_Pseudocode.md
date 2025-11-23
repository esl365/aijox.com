# Phase 1 - Task 1.1: PWA Configuration Pseudocode

**SPARC Phase:** Pseudocode (P)
**Date:** 2025-01-23
**Task:** Progressive Web App (PWA) Configuration
**Prerequisites:** Specification completed

---

## 1. Installation & Setup Pseudocode

### 1.1 Install Dependencies

```pseudocode
FUNCTION installPWADependencies():
  EXECUTE npm install @ducanh2912/next-pwa
  EXECUTE npm install -D @types/serviceworker

  IF installation_successful:
    LOG "PWA dependencies installed successfully"
    RETURN true
  ELSE:
    LOG "Installation failed"
    RETURN false
END FUNCTION
```

### 1.2 Configure Next.js

```pseudocode
FUNCTION configureNextJSForPWA(nextConfig):
  IMPORT withPWA from '@ducanh2912/next-pwa'

  SET pwaConfig = {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    scope: '/',
    sw: 'sw.js',
    runtimeCaching: DEFINE_CACHING_STRATEGIES()
  }

  SET wrappedConfig = withPWA(pwaConfig)(nextConfig)

  RETURN wrappedConfig
END FUNCTION

FUNCTION DEFINE_CACHING_STRATEGIES():
  RETURN [
    {
      // Google Fonts
      urlPattern: '/^https://fonts.gstatic.com/.*/',
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60
        }
      }
    },
    {
      // Static images
      urlPattern: '/\.(jpg|jpeg|png|gif|svg|ico|webp)$/',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60
        }
      }
    },
    {
      // Next.js images
      urlPattern: '/_next/image?url=.+$/',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60
        }
      }
    },
    {
      // API routes - Network first
      urlPattern: '/api/.*/',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 minutes
        }
      }
    },
    {
      // UploadThing CDN
      urlPattern: '/^https://uploadthing.com/.*/',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'uploadthing-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60
        }
      }
    }
  ]
END FUNCTION
```

---

## 2. Web App Manifest Pseudocode

### 2.1 Generate Manifest

```pseudocode
FUNCTION generateWebAppManifest():
  CREATE manifest object WITH {
    name: "Global Educator Nexus",
    short_name: "EduNexus",
    description: "Connect international teachers with schools worldwide",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    icons: GENERATE_ICON_ARRAY(),
    shortcuts: GENERATE_SHORTCUTS(),
    screenshots: GENERATE_SCREENSHOTS(),
    categories: ["education", "business", "productivity"]
  }

  SAVE manifest TO public/manifest.json

  IF save_successful:
    LOG "Manifest created successfully"
    RETURN true
  ELSE:
    LOG "Manifest creation failed"
    RETURN false
END FUNCTION

FUNCTION GENERATE_ICON_ARRAY():
  SET icon_sizes = [72, 96, 128, 144, 152, 192, 384, 512]
  SET icons = []

  FOR EACH size IN icon_sizes:
    ADD TO icons {
      src: "/icons/icon-{size}x{size}.png",
      sizes: "{size}x{size}",
      type: "image/png",
      purpose: "any"
    }
  END FOR

  // Add maskable icon
  ADD TO icons {
    src: "/icons/maskable-icon-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable"
  }

  RETURN icons
END FUNCTION

FUNCTION GENERATE_SHORTCUTS():
  RETURN [
    {
      name: "Find Jobs",
      short_name: "Jobs",
      description: "Browse teaching jobs worldwide",
      url: "/jobs",
      icons: [{ src: "/icons/shortcut-jobs.png", sizes: "96x96" }]
    },
    {
      name: "My Applications",
      short_name: "Applications",
      description: "View your job applications",
      url: "/dashboard/applications",
      icons: [{ src: "/icons/shortcut-apps.png", sizes: "96x96" }]
    },
    {
      name: "Profile",
      short_name: "Profile",
      description: "Edit your teacher profile",
      url: "/profile",
      icons: [{ src: "/icons/shortcut-profile.png", sizes: "96x96" }]
    }
  ]
END FUNCTION
```

### 2.2 Update Root Layout

```pseudocode
FUNCTION updateRootLayoutMetadata():
  IN app/layout.tsx:

  IMPORT Metadata from 'next'

  EXPORT metadata AS Metadata = {
    title: {
      default: "Global Educator Nexus",
      template: "%s | EduNexus"
    },
    description: "Connect international teachers with schools worldwide",
    manifest: "/manifest.json",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
      { media: "(prefers-color-scheme: dark)", color: "#1e40af" }
    ],
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "EduNexus"
    },
    formatDetection: {
      telephone: false
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5
    },
    icons: {
      icon: [
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      apple: [
        { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
      ]
    }
  }

  ADD TO <head>:
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="EduNexus" />
END FUNCTION
```

---

## 3. Icon Generation Pseudocode

### 3.1 Generate PWA Icons

```pseudocode
FUNCTION generatePWAIcons(sourceImage):
  SET required_sizes = [72, 96, 128, 144, 152, 192, 384, 512]
  SET output_dir = "public/icons"

  ENSURE output_dir EXISTS

  FOR EACH size IN required_sizes:
    RESIZE sourceImage TO {size}x{size}
    SAVE AS "{output_dir}/icon-{size}x{size}.png"
    LOG "Generated icon: {size}x{size}"
  END FOR

  // Generate maskable icon with safe zone
  RESIZE sourceImage TO 512x512 WITH padding: 10%
  SAVE AS "{output_dir}/maskable-icon-512x512.png"

  // Generate Apple Touch Icon
  RESIZE sourceImage TO 180x180
  SAVE AS "{output_dir}/apple-touch-icon.png"

  // Generate shortcut icons
  FOR EACH shortcut IN ["jobs", "applications", "profile"]:
    LOAD shortcut_icon_source
    RESIZE TO 96x96
    SAVE AS "{output_dir}/shortcut-{shortcut}.png"
  END FOR

  LOG "All icons generated successfully"
  RETURN true
END FUNCTION
```

### 3.2 Icon Optimization

```pseudocode
FUNCTION optimizePWAIcons(icons_directory):
  FOR EACH icon IN icons_directory:
    IF icon.size > 50KB:
      COMPRESS icon USING pngquant OR similar
      LOG "Compressed {icon.name}: {old_size} -> {new_size}"
    END IF
  END FOR

  VERIFY all_icons_valid()
  RETURN true
END FUNCTION
```

---

## 4. Service Worker Management Pseudocode

### 4.1 Service Worker Registration

```pseudocode
FUNCTION registerServiceWorker():
  IF 'serviceWorker' NOT IN navigator:
    LOG "Service workers not supported"
    RETURN false
  END IF

  ON window.load:
    TRY:
      SET registration = AWAIT navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      LOG "Service Worker registered with scope: {registration.scope}"

      // Check for updates
      registration.addEventListener('updatefound', () => {
        HANDLE_SW_UPDATE(registration)
      })

      RETURN registration

    CATCH error:
      LOG "Service Worker registration failed: {error}"
      RETURN null
    END TRY
  END ON
END FUNCTION

FUNCTION HANDLE_SW_UPDATE(registration):
  SET newWorker = registration.installing

  newWorker.addEventListener('statechange', () => {
    IF newWorker.state === 'installed' AND navigator.serviceWorker.controller:
      // New service worker available
      SHOW_UPDATE_NOTIFICATION()
    END IF
  })
END FUNCTION

FUNCTION SHOW_UPDATE_NOTIFICATION():
  DISPLAY toast OR banner WITH {
    message: "New version available!",
    actions: [
      {
        label: "Update",
        onClick: () => {
          window.location.reload()
        }
      },
      {
        label: "Later",
        onClick: () => {
          DISMISS notification
        }
      }
    ]
  }
END FUNCTION
```

### 4.2 Service Worker Client Component

```pseudocode
COMPONENT ServiceWorkerRegistration():
  STATE isOnline = true
  STATE showUpdateNotification = false
  STATE registration = null

  EFFECT on_mount:
    // Register service worker
    SET sw = AWAIT registerServiceWorker()
    SET registration = sw

    // Setup online/offline detection
    window.addEventListener('online', () => {
      SET isOnline = true
      SHOW_TOAST("Back online!")
    })

    window.addEventListener('offline', () => {
      SET isOnline = false
      SHOW_TOAST("You're offline. Some features may be limited.")
    })

    // Listen for SW messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      IF event.data.type === 'CACHE_UPDATED':
        LOG "Cache updated: {event.data.url}"
      END IF
    })
  END EFFECT

  FUNCTION handleUpdate():
    IF registration AND registration.waiting:
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    END IF
  END FUNCTION

  RENDER:
    IF NOT isOnline:
      <OfflineBanner />
    END IF

    IF showUpdateNotification:
      <UpdateNotification onUpdate={handleUpdate} />
    END IF
  END RENDER
END COMPONENT
```

---

## 5. Offline Page Pseudocode

### 5.1 Create Offline Fallback

```pseudocode
PAGE OfflinePage():
  RETURN JSX:
    <div className="offline-container">
      <Icon name="wifi-off" size="large" />
      <h1>You're Offline</h1>
      <p>It looks like you've lost your internet connection.</p>

      <div className="offline-actions">
        <button onClick={checkConnection}>
          Try Again
        </button>

        <a href="/dashboard">
          View Cached Dashboard
        </a>
      </div>

      <div className="offline-tips">
        <h3>What you can do offline:</h3>
        <ul>
          <li>View previously loaded pages</li>
          <li>Browse cached job listings</li>
          <li>Review your profile</li>
        </ul>
      </div>
    </div>
  END RETURN

  FUNCTION checkConnection():
    IF navigator.onLine:
      window.location.reload()
    ELSE:
      SHOW_TOAST("Still offline. Please check your connection.")
    END IF
  END FUNCTION
END PAGE
```

---

## 6. Install Prompt Pseudocode

### 6.1 Install Prompt Component

```pseudocode
COMPONENT InstallPrompt():
  STATE showPrompt = false
  STATE deferredPrompt = null
  STATE platform = detectPlatform()

  EFFECT on_mount:
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      SET deferredPrompt = e

      // Check if user dismissed before
      IF NOT localStorage.getItem('installPromptDismissed'):
        IF shouldShowPrompt():
          SET showPrompt = true
        END IF
      END IF
    })

    // Track successful installation
    window.addEventListener('appinstalled', () => {
      trackEvent('pwa_installed', { platform })
      SET showPrompt = false
      SET deferredPrompt = null
    })
  END EFFECT

  FUNCTION shouldShowPrompt():
    SET visits = getVisitCount()
    SET timeOnSite = getTimeOnSite()

    RETURN (visits >= 2) OR (timeOnSite > 30) // seconds
  END FUNCTION

  ASYNC FUNCTION handleInstall():
    IF NOT deferredPrompt:
      RETURN
    END IF

    deferredPrompt.prompt()

    SET result = AWAIT deferredPrompt.userChoice

    IF result.outcome === 'accepted':
      trackEvent('install_prompt_accepted')
      LOG "User accepted the install prompt"
    ELSE:
      trackEvent('install_prompt_declined')
    END IF

    SET deferredPrompt = null
    SET showPrompt = false
  END FUNCTION

  FUNCTION handleDismiss():
    SET showPrompt = false
    localStorage.setItem('installPromptDismissed', Date.now())
    trackEvent('install_prompt_dismissed')
  END FUNCTION

  RENDER:
    IF NOT showPrompt:
      RETURN null
    END IF

    IF platform === 'ios':
      RETURN <IOSInstallInstructions onDismiss={handleDismiss} />
    ELSE IF platform === 'android' OR platform === 'desktop':
      RETURN (
        <div className="install-prompt">
          <div className="prompt-content">
            <Icon name="download" />
            <h3>Install EduNexus</h3>
            <p>Get the full app experience with offline access</p>
          </div>
          <div className="prompt-actions">
            <button onClick={handleInstall}>Install</button>
            <button onClick={handleDismiss}>Not Now</button>
          </div>
        </div>
      )
    END IF
  END RENDER
END COMPONENT

COMPONENT IOSInstallInstructions({ onDismiss }):
  RETURN (
    <div className="ios-install-guide">
      <h3>Install EduNexus on iOS</h3>
      <ol>
        <li>Tap the Share button
          <Icon name="share-ios" />
        </li>
        <li>Scroll down and tap "Add to Home Screen"
          <Icon name="plus-square" />
        </li>
        <li>Tap "Add" in the top right corner</li>
      </ol>
      <button onClick={onDismiss}>Got it</button>
    </div>
  )
END COMPONENT
```

### 6.2 Visit Tracking Logic

```pseudocode
FUNCTION getVisitCount():
  SET visits = localStorage.getItem('visit_count') OR 0
  SET newCount = parseInt(visits) + 1
  localStorage.setItem('visit_count', newCount)
  RETURN newCount
END FUNCTION

FUNCTION getTimeOnSite():
  IF NOT sessionStorage.getItem('session_start'):
    sessionStorage.setItem('session_start', Date.now())
  END IF

  SET start = sessionStorage.getItem('session_start')
  SET now = Date.now()
  SET timeInSeconds = (now - start) / 1000

  RETURN timeInSeconds
END FUNCTION

FUNCTION detectPlatform():
  SET userAgent = navigator.userAgent OR navigator.vendor

  IF /iPad|iPhone|iPod/.test(userAgent) AND NOT window.MSStream:
    RETURN 'ios'
  ELSE IF /android/i.test(userAgent):
    RETURN 'android'
  ELSE:
    RETURN 'desktop'
  END IF
END FUNCTION
```

---

## 7. Analytics & Tracking Pseudocode

### 7.1 PWA Event Tracking

```pseudocode
FUNCTION trackPWAEvents():
  // Track service worker registration
  TRACK_EVENT('sw_registered', {
    scope: registration.scope,
    timestamp: Date.now()
  })

  // Track install prompt shown
  TRACK_EVENT('install_prompt_shown', {
    visits: getVisitCount(),
    timeOnSite: getTimeOnSite(),
    platform: detectPlatform()
  })

  // Track installation
  TRACK_EVENT('pwa_installed', {
    platform: detectPlatform(),
    timestamp: Date.now()
  })

  // Track offline usage
  IF NOT navigator.onLine:
    TRACK_EVENT('offline_usage', {
      currentPage: window.location.pathname,
      timestamp: Date.now()
    })
  END IF

  // Track cache hits
  ON service_worker_message:
    IF message.type === 'CACHE_HIT':
      TRACK_EVENT('cache_hit', {
        url: message.url,
        cacheName: message.cacheName
      })
    END IF
  END ON
END FUNCTION

FUNCTION TRACK_EVENT(eventName, properties):
  // Send to analytics service
  IF window.analytics:
    window.analytics.track(eventName, properties)
  END IF

  // Also log to console in development
  IF process.env.NODE_ENV === 'development':
    console.log('PWA Event:', eventName, properties)
  END IF
END FUNCTION
```

---

## 8. Testing Pseudocode

### 8.1 Service Worker Tests

```pseudocode
TEST_SUITE "Service Worker Registration":
  TEST "should register service worker successfully":
    MOCK navigator.serviceWorker.register

    SET result = AWAIT registerServiceWorker()

    EXPECT result TO NOT be null
    EXPECT navigator.serviceWorker.register TO have_been_called_with('/sw.js')
  END TEST

  TEST "should handle registration failure":
    MOCK navigator.serviceWorker.register TO throw error

    SET result = AWAIT registerServiceWorker()

    EXPECT result TO be null
  END TEST

  TEST "should not register in unsupported browsers":
    DELETE navigator.serviceWorker

    SET result = registerServiceWorker()

    EXPECT result TO be false
  END TEST
END TEST_SUITE

TEST_SUITE "Caching Strategies":
  TEST "should cache static assets":
    MOCK cache.put

    FETCH '/icons/icon-192x192.png'

    EXPECT cache.put TO have_been_called
    EXPECT cached_response TO exist
  END TEST

  TEST "should use network-first for API calls":
    MOCK fetch

    FETCH '/api/jobs'

    EXPECT fetch TO have_been_called_first
    EXPECT cache TO be_used_as_fallback
  END TEST
END TEST_SUITE
```

### 8.2 Install Prompt Tests

```pseudocode
TEST_SUITE "Install Prompt":
  TEST "should show prompt after 2 visits":
    SET_VISIT_COUNT(2)

    TRIGGER 'beforeinstallprompt' event

    EXPECT showPrompt TO be true
  END TEST

  TEST "should not show if previously dismissed":
    SET localStorage.installPromptDismissed = Date.now()

    TRIGGER 'beforeinstallprompt' event

    EXPECT showPrompt TO be false
  END TEST

  TEST "should show iOS instructions on iOS":
    MOCK platform detection TO return 'ios'

    RENDER InstallPrompt

    EXPECT component TO show iOS instructions
  END TEST
END TEST_SUITE
```

### 8.3 Offline Tests

```pseudocode
TEST_SUITE "Offline Functionality":
  TEST "should show offline page when disconnected":
    SET navigator.onLine = false

    NAVIGATE_TO '/jobs'

    EXPECT page TO show offline fallback
  END TEST

  TEST "should serve cached pages offline":
    CACHE page '/dashboard'
    SET navigator.onLine = false

    NAVIGATE_TO '/dashboard'

    EXPECT page TO load from cache
  END TEST
END TEST_SUITE
```

---

## 9. Deployment Checklist Pseudocode

```pseudocode
FUNCTION deploymentChecklist():
  CHECKS = [
    {
      name: "Service worker builds correctly",
      command: "npm run build",
      verify: () => fs.existsSync('public/sw.js')
    },
    {
      name: "Manifest is valid",
      command: null,
      verify: () => validateManifest('public/manifest.json')
    },
    {
      name: "All icons exist",
      command: null,
      verify: () => verifyAllIconsExist()
    },
    {
      name: "Lighthouse PWA score > 90",
      command: "lighthouse https://deployed-url --preset=pwa",
      verify: (score) => score >= 90
    },
    {
      name: "Install works on iOS",
      command: "manual test",
      verify: () => MANUAL_CONFIRMATION()
    },
    {
      name: "Install works on Android",
      command: "manual test",
      verify: () => MANUAL_CONFIRMATION()
    }
  ]

  FOR EACH check IN CHECKS:
    LOG "Running: {check.name}"

    IF check.command:
      EXECUTE check.command
    END IF

    IF check.verify():
      LOG "✅ {check.name} passed"
    ELSE:
      LOG "❌ {check.name} failed"
      RETURN false
    END IF
  END FOR

  LOG "✅ All deployment checks passed"
  RETURN true
END FUNCTION
```

---

## 10. Error Handling Pseudocode

### 10.1 Service Worker Error Recovery

```pseudocode
FUNCTION handleServiceWorkerError(error):
  LOG_ERROR("Service Worker error:", error)

  SWITCH error.type:
    CASE 'registration_failed':
      // Try to unregister and re-register
      TRY:
        AWAIT navigator.serviceWorker.getRegistration()
        AWAIT registration.unregister()
        AWAIT registerServiceWorker()
      CATCH e:
        SHOW_USER_NOTIFICATION("App installation failed. Please refresh the page.")
      END TRY

    CASE 'update_failed':
      // Skip waiting and force update
      SEND_MESSAGE_TO_SW({ type: 'SKIP_WAITING' })
      window.location.reload()

    CASE 'cache_error':
      // Clear corrupted cache
      AWAIT clearAllCaches()
      window.location.reload()

    DEFAULT:
      // Generic error handling
      SHOW_USER_NOTIFICATION("Something went wrong. Please try again.")
  END SWITCH
END FUNCTION

ASYNC FUNCTION clearAllCaches():
  SET cacheNames = AWAIT caches.keys()

  FOR EACH cacheName IN cacheNames:
    AWAIT caches.delete(cacheName)
    LOG "Cleared cache: {cacheName}"
  END FOR
END FUNCTION
```

---

## Approval

**Pseudocode Status:** ✅ Ready for Architecture Phase

**Next SPARC Phase:** Architecture (A)

---

**Created:** 2025-01-23
**Version:** 1.0
