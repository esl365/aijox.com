# Phase 1 - Task 1.2: Dark Mode & Theming - Pseudocode (SPARC-P)

**Project**: Global Educator Nexus
**Task**: Dark Mode & Theming Implementation
**Phase**: Phase 1 - Foundation Strengthening
**Methodology**: SPARC (Specification → Pseudocode → Architecture → Refinement → Completion)
**Document Version**: 1.0
**Date**: 2025-11-23

---

## 1. Overview

This document provides algorithmic pseudocode for implementing dark mode and theming across Global Educator Nexus. The pseudocode describes the logic flow for theme detection, application, persistence, and user control.

---

## 2. Installation & Setup Logic

### 2.1 Package Installation

```pseudocode
FUNCTION installDarkModePackages():
  EXECUTE shell command: "npm install next-themes"

  IF installation successful:
    LOG "next-themes installed successfully"
    UPDATE package.json with dependency
    RETURN true
  ELSE:
    LOG ERROR "Failed to install next-themes"
    RETURN false
END FUNCTION
```

### 2.2 Tailwind Configuration

```pseudocode
FUNCTION configureTailwindDarkMode():
  OPEN tailwind.config.ts

  SET config.darkMode = "class"  // Use class-based dark mode

  EXTEND config.theme.colors with:
    background:   "hsl(var(--background))"
    foreground:   "hsl(var(--foreground))"
    primary:      "hsl(var(--primary))"
    secondary:    "hsl(var(--secondary))"
    muted:        "hsl(var(--muted))"
    accent:       "hsl(var(--accent))"
    destructive:  "hsl(var(--destructive))"
    border:       "hsl(var(--border))"
    input:        "hsl(var(--input))"
    ring:         "hsl(var(--ring))"

  SAVE configuration

  LOG "Tailwind dark mode configured"
END FUNCTION
```

### 2.3 CSS Variables Definition

```pseudocode
FUNCTION defineColorVariables():
  CREATE globals.css with:

  // Light mode variables
  SET :root {
    --background: 0 0% 100%           // White
    --foreground: 222.2 84% 4.9%      // Near black
    --primary: 221.2 83.2% 53.3%      // Blue
    --primary-foreground: 210 40% 98% // Light blue text
    --secondary: 210 40% 96.1%        // Light gray
    --secondary-foreground: 222.2 47.4% 11.2%
    --muted: 210 40% 96.1%
    --muted-foreground: 215.4 16.3% 46.9%
    --accent: 210 40% 96.1%
    --accent-foreground: 222.2 47.4% 11.2%
    --destructive: 0 84.2% 60.2%
    --destructive-foreground: 210 40% 98%
    --border: 214.3 31.8% 91.4%
    --input: 214.3 31.8% 91.4%
    --ring: 221.2 83.2% 53.3%
    --radius: 0.5rem
  }

  // Dark mode variables
  SET .dark {
    --background: 222.2 84% 4.9%      // Near black
    --foreground: 210 40% 98%         // Near white
    --primary: 217.2 91.2% 59.8%      // Brighter blue
    --primary-foreground: 222.2 47.4% 11.2%
    --secondary: 217.2 32.6% 17.5%    // Dark gray
    --secondary-foreground: 210 40% 98%
    --muted: 217.2 32.6% 17.5%
    --muted-foreground: 215 20.2% 65.1%
    --accent: 217.2 32.6% 17.5%
    --accent-foreground: 210 40% 98%
    --destructive: 0 62.8% 30.6%
    --destructive-foreground: 210 40% 98%
    --border: 217.2 32.6% 17.5%
    --input: 217.2 32.6% 17.5%
    --ring: 224.3 76.3% 48%
  }

  SAVE globals.css
END FUNCTION
```

---

## 3. Theme Provider Logic

### 3.1 Provider Wrapper Component

```pseudocode
FUNCTION createThemeProvider():
  IMPORT ThemeProvider FROM "next-themes"

  COMPONENT Providers({ children }):
    RETURN:
      <ThemeProvider
        attribute="class"              // Use .dark class on <html>
        defaultTheme="system"          // Start with system preference
        enableSystem={true}            // Allow system detection
        disableTransitionOnChange={false}  // Enable smooth transitions
        storageKey="gen-theme-preference"  // LocalStorage key
      >
        {children}
      </ThemeProvider>

  EXPORT Providers
END FUNCTION
```

### 3.2 Root Layout Integration

```pseudocode
FUNCTION integrateThemeProvider():
  OPEN app/layout.tsx

  IMPORT Providers FROM "./providers"

  MODIFY RootLayout component:
    WRAP children with <Providers>

    RETURN:
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>

  NOTE: suppressHydrationWarning prevents theme class mismatch warnings

  SAVE layout.tsx
END FUNCTION
```

---

## 4. Theme Toggle Component Logic

### 4.1 Basic Toggle Implementation

```pseudocode
FUNCTION ThemeToggle():
  IMPORT { useTheme } FROM "next-themes"
  IMPORT { useState, useEffect } FROM "react"

  COMPONENT ThemeToggle():
    // State
    SET mounted = useState(false)
    GET { theme, setTheme } = useTheme()

    // Prevent hydration mismatch
    useEffect(() => {
      SET mounted = true
    }, [])

    IF NOT mounted:
      RETURN null  // Avoid SSR/client mismatch

    // Render UI
    RETURN:
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun /> Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon /> Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Monitor /> System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

  EXPORT ThemeToggle
END FUNCTION
```

### 4.2 Theme Change Handler

```pseudocode
FUNCTION handleThemeChange(newTheme):
  // Validate input
  IF newTheme NOT IN ["light", "dark", "system"]:
    LOG ERROR "Invalid theme:", newTheme
    RETURN false

  // Apply theme
  SET theme = newTheme

  // Persist to localStorage
  localStorage.setItem("gen-theme-preference", newTheme)

  // Update DOM
  IF newTheme === "dark":
    document.documentElement.classList.add("dark")
  ELSE IF newTheme === "light":
    document.documentElement.classList.remove("dark")
  ELSE IF newTheme === "system":
    SET systemPreference = getSystemThemePreference()
    IF systemPreference === "dark":
      document.documentElement.classList.add("dark")
    ELSE:
      document.documentElement.classList.remove("dark")

  // Track analytics
  IF window.gtag EXISTS:
    gtag("event", "theme_changed", {
      theme: newTheme,
      timestamp: Date.now()
    })

  LOG "Theme changed to:", newTheme
  RETURN true
END FUNCTION
```

---

## 5. System Preference Detection

### 5.1 Initial Detection

```pseudocode
FUNCTION getSystemThemePreference():
  IF typeof window === "undefined":
    RETURN "light"  // Default for SSR

  // Check media query
  SET darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)")

  IF darkModeQuery.matches:
    RETURN "dark"
  ELSE:
    RETURN "light"
END FUNCTION
```

### 5.2 Listen for System Changes

```pseudocode
FUNCTION watchSystemThemeChanges():
  IF typeof window === "undefined":
    RETURN  // Skip on server

  SET darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)")

  FUNCTION handleSystemThemeChange(event):
    GET userPreference = localStorage.getItem("gen-theme-preference")

    // Only auto-update if user chose "system"
    IF userPreference === "system" OR userPreference === null:
      IF event.matches:
        SET theme = "dark"
      ELSE:
        SET theme = "light"

      // Apply theme
      handleThemeChange("system")

      LOG "System theme changed, auto-updating app theme"

  // Add listener
  darkModeQuery.addEventListener("change", handleSystemThemeChange)

  // Return cleanup function
  RETURN () => {
    darkModeQuery.removeEventListener("change", handleSystemThemeChange)
  }
END FUNCTION
```

---

## 6. Component Dark Mode Logic

### 6.1 Auto-Detection Pattern

```pseudocode
FUNCTION applyDarkModeToComponent(className):
  // Split into base classes
  SET classes = className.split(" ")
  SET darkClasses = []

  FOR EACH class IN classes:
    // Detect color-related classes
    IF class STARTS WITH "bg-":
      SET darkClass = "dark:bg-" + extractColorValue(class)
      darkClasses.push(darkClass)

    ELSE IF class STARTS WITH "text-":
      SET darkClass = "dark:text-" + extractColorValue(class)
      darkClasses.push(darkClass)

    ELSE IF class STARTS WITH "border-":
      SET darkClass = "dark:border-" + extractColorValue(class)
      darkClasses.push(darkClass)

    ELSE IF class STARTS WITH "ring-":
      SET darkClass = "dark:ring-" + extractColorValue(class)
      darkClasses.push(darkClass)

  // Merge with original classes
  SET finalClasses = classes.concat(darkClasses).join(" ")

  RETURN finalClasses
END FUNCTION

FUNCTION extractColorValue(classString):
  // Extract color from "bg-blue-500" -> "blue-500"
  SPLIT classString by "-"
  RETURN rest of array after first element
END FUNCTION
```

### 6.2 Manual Dark Mode Variants

```pseudocode
FUNCTION addDarkVariantManually():
  EXAMPLE 1: Background color
    BEFORE: className="bg-white"
    AFTER:  className="bg-white dark:bg-gray-900"

  EXAMPLE 2: Text color
    BEFORE: className="text-gray-900"
    AFTER:  className="text-gray-900 dark:text-gray-100"

  EXAMPLE 3: Border
    BEFORE: className="border-gray-200"
    AFTER:  className="border-gray-200 dark:border-gray-700"

  EXAMPLE 4: Combined
    BEFORE: className="bg-white text-gray-900 border-gray-200"
    AFTER:  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"

  PATTERN:
    1. Identify color class
    2. Add dark: prefix
    3. Choose appropriate dark mode color
    4. Ensure sufficient contrast
END FUNCTION
```

---

## 7. Transition Animation Logic

### 7.1 CSS Transition Setup

```pseudocode
FUNCTION addThemeTransitions():
  ADD to globals.css:

  // Respect user motion preferences
  @media (prefers-reduced-motion: no-preference) {
    :root {
      transition-property: background-color, border-color, color, fill, stroke;
      transition-timing-function: ease-in-out;
      transition-duration: 200ms;
    }

    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
      transition-timing-function: ease-in-out;
      transition-duration: 200ms;
    }
  }

  // Disable transitions during theme change to prevent flashing
  .no-transition,
  .no-transition * {
    transition: none !important;
  }
END FUNCTION
```

### 7.2 Smooth Theme Switch

```pseudocode
FUNCTION smoothThemeSwitch(newTheme):
  // Temporarily disable transitions
  document.documentElement.classList.add("no-transition")

  // Change theme
  setTheme(newTheme)

  // Re-enable transitions after a frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("no-transition")
    })
  })
END FUNCTION
```

---

## 8. Accessibility Logic

### 8.1 Keyboard Navigation

```pseudocode
FUNCTION handleThemeToggleKeyboard(event):
  IF event.key === "Enter" OR event.key === " ":
    event.preventDefault()
    toggleThemeMenu()

  ELSE IF event.key === "ArrowDown":
    event.preventDefault()
    focusNextThemeOption()

  ELSE IF event.key === "ArrowUp":
    event.preventDefault()
    focusPreviousThemeOption()

  ELSE IF event.key === "Escape":
    event.preventDefault()
    closeThemeMenu()
END FUNCTION
```

### 8.2 Screen Reader Announcements

```pseudocode
FUNCTION announceThemeChange(newTheme):
  // Create live region for screen readers
  SET liveRegion = document.getElementById("theme-announcer")

  IF NOT liveRegion:
    CREATE new element:
      <div
        id="theme-announcer"
        role="status"
        aria-live="polite"
        className="sr-only"
      />
    APPEND to document.body
    SET liveRegion = document.getElementById("theme-announcer")

  // Announce change
  SET message = `Theme changed to ${newTheme} mode`
  liveRegion.textContent = message

  // Clear after announcement
  setTimeout(() => {
    liveRegion.textContent = ""
  }, 1000)
END FUNCTION
```

### 8.3 Contrast Validation

```pseudocode
FUNCTION validateColorContrast(foreground, background):
  FUNCTION hexToRgb(hex):
    // Convert hex to RGB
    RETURN {r, g, b}

  FUNCTION relativeLuminance(color):
    // Calculate relative luminance per WCAG formula
    SET {r, g, b} = hexToRgb(color)

    FOR EACH channel IN [r, g, b]:
      SET normalized = channel / 255
      IF normalized <= 0.03928:
        SET adjusted = normalized / 12.92
      ELSE:
        SET adjusted = ((normalized + 0.055) / 1.055) ^ 2.4

    RETURN 0.2126 * adjustedR + 0.7152 * adjustedG + 0.0722 * adjustedB

  // Calculate contrast ratio
  SET L1 = relativeLuminance(foreground)
  SET L2 = relativeLuminance(background)

  SET lighter = Math.max(L1, L2)
  SET darker = Math.min(L1, L2)

  SET contrastRatio = (lighter + 0.05) / (darker + 0.05)

  // Validate against WCAG standards
  IF contrastRatio >= 4.5:
    RETURN { valid: true, ratio: contrastRatio, level: "AA" }
  ELSE IF contrastRatio >= 3.0:
    RETURN { valid: false, ratio: contrastRatio, warning: "Only valid for large text" }
  ELSE:
    RETURN { valid: false, ratio: contrastRatio, error: "Does not meet WCAG AA" }
END FUNCTION
```

---

## 9. Component Audit Logic

### 9.1 Automated Class Scanner

```pseudocode
FUNCTION scanComponentsForColorClasses():
  SET componentsDirectory = "./app"
  SET files = getAllFilesRecursive(componentsDirectory, ".tsx", ".ts", ".jsx", ".js")

  SET report = {
    totalFiles: 0,
    filesWithColors: 0,
    missingDarkMode: [],
    classBreakdown: {}
  }

  FOR EACH file IN files:
    SET content = readFile(file)
    SET colorClasses = extractColorClasses(content)

    IF colorClasses.length > 0:
      report.filesWithColors++

      FOR EACH colorClass IN colorClasses:
        // Check if dark: variant exists
        SET darkVariant = "dark:" + colorClass

        IF NOT content.includes(darkVariant):
          report.missingDarkMode.push({
            file: file,
            class: colorClass,
            lineNumber: getLineNumber(content, colorClass)
          })

    report.totalFiles++

  // Generate report
  WRITE report TO "dark-mode-audit.json"

  LOG "Audit complete:"
  LOG "  Total files:", report.totalFiles
  LOG "  Files with colors:", report.filesWithColors
  LOG "  Missing dark variants:", report.missingDarkMode.length

  RETURN report
END FUNCTION

FUNCTION extractColorClasses(content):
  SET colorPrefixes = ["bg-", "text-", "border-", "ring-", "divide-", "placeholder-", "from-", "via-", "to-"]
  SET classes = []

  SET regex = /className=["']([^"']+)["']/g
  SET matches = content.matchAll(regex)

  FOR EACH match IN matches:
    SET classString = match[1]
    SET classList = classString.split(" ")

    FOR EACH cl IN classList:
      FOR EACH prefix IN colorPrefixes:
        IF cl.startsWith(prefix):
          classes.push(cl)

  RETURN classes
END FUNCTION
```

### 9.2 Bulk Class Update

```pseudocode
FUNCTION addDarkVariantsToFile(filePath, classMap):
  // classMap = { "bg-white": "bg-gray-900", "text-black": "text-white", ... }

  SET content = readFile(filePath)
  SET originalContent = content

  FOR EACH [lightClass, darkClass] IN classMap:
    // Find instances of lightClass
    SET regex = new RegExp(`(className=["'][^"']*)(${lightClass})([^"']*)`, "g")

    // Replace with both light and dark variants
    SET replacement = `$1${lightClass} dark:${darkClass}$3`

    content = content.replace(regex, replacement)

  // Only write if changes were made
  IF content !== originalContent:
    writeFile(filePath, content)
    LOG "Updated:", filePath
    RETURN true
  ELSE:
    RETURN false
END FUNCTION
```

---

## 10. Testing Logic

### 10.1 Visual Regression Test

```pseudocode
FUNCTION captureThemeScreenshots(component):
  // Setup
  LAUNCH browser with Playwright/Puppeteer
  NAVIGATE to component page

  // Light mode
  SET theme = "light"
  WAIT for theme to apply
  CAPTURE screenshot AS `${component}-light.png`

  // Dark mode
  SET theme = "dark"
  WAIT for theme to apply
  CAPTURE screenshot AS `${component}-dark.png`

  // System mode (dark)
  SET system preference to dark
  SET theme = "system"
  WAIT for theme to apply
  CAPTURE screenshot AS `${component}-system-dark.png`

  CLOSE browser

  // Compare with baseline
  FOR EACH screenshot:
    SET diff = compareImages(screenshot, baseline)
    IF diff > threshold:
      FAIL test with diff report
END FUNCTION
```

### 10.2 Accessibility Test

```pseudocode
FUNCTION testThemeAccessibility():
  // Setup
  LAUNCH browser with axe-core

  // Test light mode
  SET theme = "light"
  SET lightResults = runAxeAudit()

  // Test dark mode
  SET theme = "dark"
  SET darkResults = runAxeAudit()

  // Analyze results
  SET violations = []

  FOR EACH result IN [lightResults, darkResults]:
    FOR EACH violation IN result.violations:
      IF violation.impact IN ["critical", "serious"]:
        violations.push({
          theme: result.theme,
          rule: violation.id,
          description: violation.description,
          nodes: violation.nodes
        })

  // Fail if critical violations exist
  IF violations.length > 0:
    FAIL test
    LOG violations
  ELSE:
    PASS test
END FUNCTION
```

### 10.3 Performance Test

```pseudocode
FUNCTION measureThemeSwitchPerformance():
  SET iterations = 10
  SET timings = []

  FOR i = 0 TO iterations:
    // Measure light to dark
    SET startTime = performance.now()
    setTheme("dark")
    WAIT for next paint
    SET endTime = performance.now()

    timings.push(endTime - startTime)

    // Reset
    setTheme("light")
    WAIT 100ms

  // Calculate statistics
  SET average = sum(timings) / timings.length
  SET max = Math.max(...timings)
  SET min = Math.min(...timings)

  LOG "Theme switch performance:"
  LOG "  Average:", average, "ms"
  LOG "  Min:", min, "ms"
  LOG "  Max:", max, "ms"

  // Assert performance target
  IF average > 100:
    FAIL "Theme switch too slow (target: <100ms)"
  ELSE:
    PASS
END FUNCTION
```

---

## 11. Error Handling

### 11.1 Theme Load Failure

```pseudocode
FUNCTION handleThemeLoadError(error):
  LOG ERROR "Failed to load theme:", error

  // Fallback to light mode
  SET theme = "light"
  document.documentElement.classList.remove("dark")

  // Clear corrupted localStorage
  TRY:
    localStorage.removeItem("gen-theme-preference")
  CATCH:
    // Ignore if localStorage unavailable

  // Show user-friendly error
  showToast({
    type: "error",
    message: "Failed to load theme preferences. Defaulting to light mode.",
    duration: 5000
  })

  // Track error
  IF window.gtag:
    gtag("event", "exception", {
      description: "theme_load_error",
      fatal: false
    })
END FUNCTION
```

### 11.2 localStorage Unavailable

```pseudocode
FUNCTION handleStorageUnavailable():
  LOG WARNING "localStorage unavailable, theme will not persist"

  // Use in-memory fallback
  SET themeState = {
    current: getSystemThemePreference(),
    persistent: false
  }

  // Apply theme normally
  applyTheme(themeState.current)

  // Show info message
  showToast({
    type: "info",
    message: "Theme preferences will not be saved (browser storage disabled)",
    duration: 3000
  })

  RETURN themeState
END FUNCTION
```

---

## 12. Summary Workflow

```pseudocode
MAIN FUNCTION implementDarkMode():
  // Phase 1: Setup
  STEP 1: installDarkModePackages()
  STEP 2: configureTailwindDarkMode()
  STEP 3: defineColorVariables()
  STEP 4: createThemeProvider()
  STEP 5: integrateThemeProvider()

  // Phase 2: UI Components
  STEP 6: createThemeToggle()
  STEP 7: addThemeToggleToHeader()

  // Phase 3: Component Audit
  STEP 8: scanComponentsForColorClasses()
  STEP 9: prioritizeComponentsByUsage()
  STEP 10: addDarkVariantsSystematically()

  // Phase 4: Testing
  STEP 11: testThemeAccessibility()
  STEP 12: captureThemeScreenshots()
  STEP 13: measureThemeSwitchPerformance()

  // Phase 5: Polish
  STEP 14: addThemeTransitions()
  STEP 15: validateColorContrast()
  STEP 16: documentColorSystem()

  LOG "Dark mode implementation complete!"
END FUNCTION
```

---

**Document Status**: ✅ Complete
**Next Phase**: SPARC-A (Architecture)
**Complexity**: Medium
