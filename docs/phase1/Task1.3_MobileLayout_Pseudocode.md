# Phase 1 Task 1.3: Mobile Layout Optimization - Pseudocode

**SPARC Phase:** Pseudocode (SPARC-P)
**Task ID:** Phase 1.3
**Date:** 2025-11-23

---

## 1. Mobile Navigation Component

### 1.1 Mobile Menu (Hamburger Navigation)

```pseudocode
COMPONENT MobileNavigation:
  STATE:
    isOpen: boolean = false

  FUNCTION toggleMenu():
    SET isOpen = NOT isOpen
    IF isOpen:
      CALL disableBodyScroll()
    ELSE:
      CALL enableBodyScroll()
    END IF
  END FUNCTION

  FUNCTION disableBodyScroll():
    ADD class "overflow-hidden" to document.body
  END FUNCTION

  FUNCTION enableBodyScroll():
    REMOVE class "overflow-hidden" from document.body
  END FUNCTION

  RENDER:
    // Mobile trigger button (visible only on small screens)
    <Button
      className="md:hidden min-h-[44px] min-w-[44px]"
      onClick={toggleMenu}
      aria-label="Open navigation menu"
      aria-expanded={isOpen}
    >
      <MenuIcon size={24} />
    </Button>

    // Sheet overlay (slides from left)
    <Sheet open={isOpen} onOpenChange={toggleMenu}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        // Navigation links
        <nav className="flex flex-col gap-4 mt-8">
          FOR EACH link IN navigationLinks:
            <Link
              href={link.href}
              className="min-h-[44px] flex items-center text-lg"
              onClick={toggleMenu}
            >
              {link.icon}
              {link.label}
            </Link>
          END FOR
        </nav>
      </SheetContent>
    </Sheet>
  END RENDER
END COMPONENT
```

---

## 2. Responsive Grid Layouts

### 2.1 Job Listing Grid

```pseudocode
COMPONENT JobListingGrid:
  INPUT:
    jobs: Job[]

  FUNCTION calculateColumns():
    screenWidth = GET viewport width

    IF screenWidth < 640:  // Mobile
      RETURN 1
    ELSE IF screenWidth < 1024:  // Tablet
      RETURN 2
    ELSE:  // Desktop
      RETURN 3
    END IF
  END FUNCTION

  RENDER:
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      FOR EACH job IN jobs:
        <JobCard
          job={job}
          className="w-full"  // Full width of grid cell
        />
      END FOR
    </div>
  END RENDER
END COMPONENT
```

### 2.2 Responsive Card Component

```pseudocode
COMPONENT ResponsiveCard:
  INPUT:
    data: any
    variant: "mobile" | "desktop"

  FUNCTION detectDevice():
    screenWidth = GET viewport width
    IF screenWidth < 768:
      RETURN "mobile"
    ELSE:
      RETURN "desktop"
    END IF
  END FUNCTION

  RENDER:
    currentVariant = variant OR detectDevice()

    IF currentVariant == "mobile":
      // Vertical stack layout for mobile
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <CardHeader className="p-0">
            <CardTitle className="text-lg">{data.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm">{data.description}</p>
          </CardContent>
          <CardFooter className="p-0 flex-col gap-2">
            <Button className="w-full min-h-[44px]">Action</Button>
          </CardFooter>
        </div>
      </Card>
    ELSE:
      // Horizontal layout for desktop
      <Card className="p-6">
        <div className="flex gap-6">
          <CardHeader>
            <CardTitle className="text-xl">{data.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p>{data.description}</p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </div>
      </Card>
    END IF
  END RENDER
END COMPONENT
```

---

## 3. Touch-Friendly Form Components

### 3.1 Mobile-Optimized Input

```pseudocode
COMPONENT MobileInput:
  INPUT:
    type: string
    label: string
    value: string
    error: string | null
    onChange: function

  FUNCTION getInputType():
    // Return HTML5 input type for mobile keyboard optimization
    SWITCH type:
      CASE "email":
        RETURN "email"  // Shows @ key on mobile keyboard
      CASE "phone":
        RETURN "tel"  // Shows numeric keyboard
      CASE "number":
        RETURN "number"  // Shows number pad
      DEFAULT:
        RETURN "text"
    END SWITCH
  END FUNCTION

  FUNCTION getMobileKeyboard():
    // Additional mobile keyboard hints
    SWITCH type:
      CASE "email":
        RETURN { inputMode: "email", autoComplete: "email" }
      CASE "phone":
        RETURN { inputMode: "tel", autoComplete: "tel" }
      CASE "number":
        RETURN { inputMode: "numeric" }
      DEFAULT:
        RETURN {}
    END SWITCH
  END FUNCTION

  RENDER:
    inputType = getInputType()
    keyboardHints = getMobileKeyboard()

    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      <Input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        className="min-h-[44px] text-base w-full"
        aria-invalid={error != null}
        aria-describedby={error ? id + "-error" : undefined}
        {...keyboardHints}
      />
      IF error:
        <p id={id + "-error"} className="text-sm text-destructive">
          {error}
        </p>
      END IF
    </div>
  END RENDER
END COMPONENT
```

### 3.2 Multi-Step Form (Mobile-Optimized)

```pseudocode
COMPONENT MobileMultiStepForm:
  STATE:
    currentStep: number = 0
    formData: object = {}
    totalSteps: number

  FUNCTION nextStep():
    IF validateCurrentStep():
      IF currentStep < totalSteps - 1:
        SET currentStep = currentStep + 1
        CALL scrollToTop()
      ELSE:
        CALL submitForm()
      END IF
    END IF
  END FUNCTION

  FUNCTION previousStep():
    IF currentStep > 0:
      SET currentStep = currentStep - 1
      CALL scrollToTop()
    END IF
  END FUNCTION

  FUNCTION scrollToTop():
    window.scrollTo(0, 0)
  END FUNCTION

  FUNCTION validateCurrentStep():
    errors = VALIDATE formData[currentStep]
    IF errors.length > 0:
      DISPLAY errors
      RETURN false
    END IF
    RETURN true
  END FUNCTION

  FUNCTION calculateProgress():
    RETURN (currentStep + 1) / totalSteps * 100
  END FUNCTION

  RENDER:
    progress = calculateProgress()

    <div className="flex flex-col min-h-screen">
      // Sticky progress bar at top
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {progress}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      // Form step content
      <div className="flex-1 container mx-auto p-4">
        {renderStepContent(currentStep)}
      </div>

      // Sticky footer with navigation buttons
      <div className="sticky bottom-0 bg-background border-t p-4 shadow-lg">
        <div className="container mx-auto flex gap-3">
          IF currentStep > 0:
            <Button
              variant="outline"
              onClick={previousStep}
              className="flex-1 min-h-[48px]"
            >
              Back
            </Button>
          END IF

          <Button
            onClick={nextStep}
            className="flex-1 min-h-[48px]"
          >
            {currentStep == totalSteps - 1 ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  END RENDER
END COMPONENT
```

---

## 4. Responsive Table Component

### 4.1 Table with Mobile Card View

```pseudocode
COMPONENT ResponsiveTable:
  INPUT:
    data: array
    columns: array

  FUNCTION isMobile():
    RETURN window.innerWidth < 768
  END FUNCTION

  RENDER:
    IF isMobile():
      // Card view for mobile
      <div className="flex flex-col gap-4">
        FOR EACH row IN data:
          <Card className="p-4">
            FOR EACH column IN columns:
              <div className="flex justify-between py-2 border-b last:border-0">
                <span className="font-medium text-sm">
                  {column.header}
                </span>
                <span className="text-sm text-muted-foreground">
                  {row[column.key]}
                </span>
              </div>
            END FOR
          </Card>
        END FOR
      </div>
    ELSE:
      // Standard table for desktop
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              FOR EACH column IN columns:
                <TableHead>{column.header}</TableHead>
              END FOR
            </TableRow>
          </TableHeader>
          <TableBody>
            FOR EACH row IN data:
              <TableRow>
                FOR EACH column IN columns:
                  <TableCell>{row[column.key]}</TableCell>
                END FOR
              </TableRow>
            END FOR
          </TableBody>
        </Table>
      </div>
    END IF
  END RENDER
END COMPONENT
```

### 4.2 Horizontal Scroll Table (Alternative)

```pseudocode
COMPONENT ScrollableTable:
  INPUT:
    data: array
    columns: array

  STATE:
    canScrollLeft: boolean = false
    canScrollRight: boolean = true

  FUNCTION handleScroll(event):
    scrollLeft = event.target.scrollLeft
    scrollWidth = event.target.scrollWidth
    clientWidth = event.target.clientWidth

    SET canScrollLeft = scrollLeft > 0
    SET canScrollRight = scrollLeft < (scrollWidth - clientWidth - 10)
  END FUNCTION

  RENDER:
    <div className="relative">
      // Scroll indicators
      IF canScrollLeft:
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      END IF

      IF canScrollRight:
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      END IF

      // Scrollable table container
      <div
        className="overflow-x-auto"
        onScroll={handleScroll}
      >
        <Table className="min-w-full">
          {/* Table content */}
        </Table>
      </div>

      // Mobile scroll hint
      <p className="text-xs text-muted-foreground text-center mt-2 md:hidden">
        Swipe to see more →
      </p>
    </div>
  END RENDER
END COMPONENT
```

---

## 5. Modal and Dialog Optimization

### 5.1 Mobile-Friendly Modal

```pseudocode
COMPONENT MobileModal:
  INPUT:
    isOpen: boolean
    onClose: function
    title: string
    children: ReactNode

  FUNCTION isMobile():
    RETURN window.innerWidth < 640
  END FUNCTION

  RENDER:
    mobile = isMobile()

    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={
          mobile
            ? "w-screen h-screen max-w-none m-0 rounded-none"  // Full screen on mobile
            : "max-w-2xl"  // Standard modal on desktop
        }
      >
        <DialogHeader className="sticky top-0 bg-background z-50 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg md:text-xl">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className={
          mobile
            ? "overflow-y-auto flex-1 p-4"  // Scrollable content on mobile
            : "p-6"  // Standard padding on desktop
        }>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  END RENDER
END COMPONENT
```

---

## 6. Layout Overflow Prevention

### 6.1 Overflow Detection and Fix

```pseudocode
FUNCTION detectHorizontalOverflow():
  elements = document.querySelectorAll('*')
  overflowingElements = []

  FOR EACH element IN elements:
    boundingBox = element.getBoundingClientRect()
    IF boundingBox.right > window.innerWidth:
      overflowingElements.push({
        element: element,
        overflow: boundingBox.right - window.innerWidth,
        tagName: element.tagName,
        classes: element.className
      })
    END IF
  END FOR

  IF overflowingElements.length > 0:
    console.warn("Horizontal overflow detected:", overflowingElements)
    RETURN overflowingElements
  ELSE:
    console.log("No horizontal overflow detected")
    RETURN []
  END IF
END FUNCTION

FUNCTION autoFixOverflow(element):
  // Apply overflow fixes
  currentOverflow = element.style.overflowX

  IF currentOverflow != "hidden" AND currentOverflow != "scroll":
    IF element.scrollWidth > element.clientWidth:
      // Check if content is scrollable
      IF element.classList.contains('table'):
        // Wrap tables in scroll container
        wrapper = CREATE div with class "overflow-x-auto"
        element.parentNode.insertBefore(wrapper, element)
        wrapper.appendChild(element)
      ELSE:
        // Add max-width constraint
        element.style.maxWidth = "100vw"
        element.style.overflowX = "hidden"
      END IF
    END IF
  END IF
END FUNCTION
```

---

## 7. Touch Event Handling

### 7.1 Swipeable Component

```pseudocode
COMPONENT SwipeableList:
  INPUT:
    items: array
    onSwipeLeft: function
    onSwipeRight: function

  STATE:
    touchStartX: number = 0
    touchEndX: number = 0
    currentIndex: number = 0

  FUNCTION handleTouchStart(event):
    SET touchStartX = event.touches[0].clientX
  END FUNCTION

  FUNCTION handleTouchMove(event):
    SET touchEndX = event.touches[0].clientX
  END FUNCTION

  FUNCTION handleTouchEnd():
    swipeDistance = touchStartX - touchEndX
    threshold = 50  // Minimum swipe distance in pixels

    IF swipeDistance > threshold:
      // Swiped left
      CALL onSwipeLeft()
      IF currentIndex < items.length - 1:
        SET currentIndex = currentIndex + 1
      END IF
    ELSE IF swipeDistance < -threshold:
      // Swiped right
      CALL onSwipeRight()
      IF currentIndex > 0:
        SET currentIndex = currentIndex - 1
      END IF
    END IF

    // Reset touch coordinates
    SET touchStartX = 0
    SET touchEndX = 0
  END FUNCTION

  RENDER:
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden"
    >
      <div
        className="flex transition-transform duration-300"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        FOR EACH item IN items:
          <div className="w-full flex-shrink-0">
            {renderItem(item)}
          </div>
        END FOR
      </div>

      // Pagination dots
      <div className="flex justify-center gap-2 mt-4">
        FOR i FROM 0 TO items.length - 1:
          <button
            className={
              i == currentIndex
                ? "w-2 h-2 rounded-full bg-primary"
                : "w-2 h-2 rounded-full bg-muted"
            }
            onClick={() => SET currentIndex = i}
          />
        END FOR
      </div>
    </div>
  END RENDER
END COMPONENT
```

---

## 8. Image Optimization

### 8.1 Responsive Image Component

```pseudocode
COMPONENT ResponsiveImage:
  INPUT:
    src: string
    alt: string
    aspectRatio: "1:1" | "16:9" | "4:3"
    priority: boolean

  FUNCTION getAspectRatioClass():
    SWITCH aspectRatio:
      CASE "1:1":
        RETURN "aspect-square"
      CASE "16:9":
        RETURN "aspect-video"
      CASE "4:3":
        RETURN "aspect-[4/3]"
      DEFAULT:
        RETURN "aspect-auto"
    END SWITCH
  END FUNCTION

  FUNCTION getSizes():
    // Responsive image sizes for different viewports
    RETURN "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  END FUNCTION

  RENDER:
    aspectClass = getAspectRatioClass()
    sizes = getSizes()

    <div className={`relative ${aspectClass} overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  END RENDER
END COMPONENT
```

---

## 9. Testing Utilities

### 9.1 Mobile Viewport Test

```pseudocode
FUNCTION testMobileViewport(pageUrl, breakpoint):
  // Automated test for responsive design

  viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 }
  }

  viewport = viewports[breakpoint]

  // Set viewport size
  SET browser viewport to viewport.width x viewport.height

  // Navigate to page
  NAVIGATE to pageUrl

  // Wait for page load
  WAIT for page to be fully loaded

  // Check for horizontal overflow
  bodyWidth = EXECUTE JavaScript:
    "document.body.scrollWidth"

  ASSERT bodyWidth <= viewport.width,
    "Page has horizontal overflow: ${bodyWidth}px > ${viewport.width}px"

  // Check touch target sizes
  buttons = FIND ALL elements matching "button, a, input[type='button']"

  FOR EACH button IN buttons:
    boundingBox = GET bounding box of button
    height = boundingBox.height
    width = boundingBox.width

    ASSERT height >= 44 AND width >= 44,
      "Touch target too small: ${width}x${height}px (minimum 44x44px)"
  END FOR

  // Take screenshot
  CAPTURE screenshot as "${pageUrl}-${breakpoint}.png"

  RETURN {
    passed: true,
    viewport: viewport,
    screenshot: screenshotPath
  }
END FUNCTION
```

---

## 10. Performance Optimization

### 10.1 Lazy Loading Strategy

```pseudocode
FUNCTION implementLazyLoading():
  // Lazy load components and images below the fold

  observerOptions = {
    root: null,
    rootMargin: "200px",  // Load 200px before entering viewport
    threshold: 0
  }

  observer = CREATE IntersectionObserver(callback, observerOptions)

  FUNCTION callback(entries):
    FOR EACH entry IN entries:
      IF entry.isIntersecting:
        element = entry.target

        IF element.dataset.src:
          // Lazy load image
          element.src = element.dataset.src
          element.removeAttribute("data-src")
        END IF

        IF element.dataset.component:
          // Lazy load React component
          componentName = element.dataset.component
          IMPORT dynamic component
          RENDER component
        END IF

        // Stop observing this element
        observer.unobserve(element)
      END IF
    END FOR
  END FUNCTION

  // Observe all lazy-loadable elements
  lazyElements = document.querySelectorAll('[data-src], [data-component]')
  FOR EACH element IN lazyElements:
    observer.observe(element)
  END FOR
END FUNCTION
```

---

**Document Status:** ✅ APPROVED
**Next Phase:** SPARC-A (Architecture)
