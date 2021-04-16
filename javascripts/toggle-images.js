// import { sendEvent } from './events'
import Cookies from 'js-cookie'

// Determines whether images are hidden or displayed on first visit.
const hideImagesByDefault = false

// Set the image placeholder icon here.
const placeholderImagePath = '/assets/images/octicons/image.svg'

// This module does a few things:
// 1. Wraps every image in a div so they can be toggled individually.
// 2. Adds a button to toggle all images on the page.
// 3. Sets a cookie to keep track of a user's selected preference.
export default function () {
  const toggleImagesBtn = document.getElementById('js-toggle-images')
  if (!toggleImagesBtn) return

  const images = document.querySelectorAll('img')

  // If there are no images on the page, hide the button entirely and return.
  if (!images.length) {
    toggleImagesBtn.style.display = 'none'
    return
  }

  // Look for a cookie with image visibility preference; otherwise, use the default.
  const hideImagesPreferred = (Cookies.get('hideImagesPreferred') === 'true') || hideImagesByDefault

  // Get the aria-labels from the span elements containing the hide/show tooltips for single images.
  // (We do it this way instead of hardcoding text here for localization-friendliness.)
  const tooltipHideSingle = document.getElementById('js-hide-single-image').getAttribute('aria-label')
  const tooltipShowSingle = document.getElementById('js-show-single-image').getAttribute('aria-label')

  // For every image...
  for (const img of images) {
    // First, wrap each image in a button and add some attributes.
    const parentDiv = img.parentNode
    const parentButton = document.createElement('button')
    parentDiv.replaceChild(parentButton, img)
    parentButton.appendChild(img)
    parentButton.classList.add('tooltipped', 'tooltipped-nw', 'btn-toggle-image')

    // Set the relevant tooltip text, and hide the image if that is the preference.
    if (hideImagesPreferred) {
      parentButton.setAttribute('aria-label', tooltipShowSingle)
      toggleImage(img, 'hide', tooltipShowSingle)
    } else {
      parentButton.setAttribute('aria-label', tooltipHideSingle)
    }

    // On any individual image button click...
    parentButton.addEventListener('click', (e) => {
      // Determine current state.
      const hideOnNextClick = parentButton.getAttribute('aria-label') === tooltipShowSingle

      // Hide or show the image!
      if (hideOnNextClick) {
        toggleImage(img, 'show', tooltipHideSingle)
      } else {
        toggleImage(img, 'hide', tooltipShowSingle)
      }

      // Remove focus from the button after click so the tooltip does not stay displayed.
      parentButton.blur()
    })
  }

  // Get the span elements containing the hide and show icons.
  const hideIcon = document.getElementById('js-hide-icon')
  const showIcon = document.getElementById('js-show-icon')

  // Get the aria-labels from the span elements for the tooltips.
  const tooltipHideAll = hideIcon.getAttribute('aria-label')
  const tooltipShowAll = showIcon.getAttribute('aria-label')

  // The icon should be "Hide" to start, so we suppress the "Show" icon here.
  showIcon.style.display = 'none'
  toggleImagesBtn.setAttribute('aria-label', tooltipHideAll)

  // If images are hidden by default, showOnNextClick should be false.
  // If images are not hidden by default, showOnNextClick should be true.
  let showOnNextClick = !hideImagesPreferred

  toggleImagesBtn.addEventListener('click', (e) => {
    if (showOnNextClick) {
      // Button should say "Show" on first click
      showIcon.style.display = 'inline'
      hideIcon.style.display = 'none'
      toggleImagesBtn.setAttribute('aria-label', tooltipShowAll)
      toggleImages(images, 'hide', tooltipShowSingle)
    } else {
      // Button should say "Hide" on another click
      showIcon.style.display = 'none'
      hideIcon.style.display = 'inline'
      toggleImagesBtn.setAttribute('aria-label', tooltipHideAll)
      toggleImages(images, 'show', tooltipHideSingle)
    }

    // Save this preference as a cookie.
    Cookies.set('hideImagesPreferred', showOnNextClick)

    // Toggle the action on every click.
    showOnNextClick = !showOnNextClick

    // TODO Track image toggle events
    // sendEvent({ type: 'imageToggle' })
  })
}

function toggleImages (images, action, tooltipText) {
  for (const img of images) {
    toggleImage(img, action, tooltipText)
  }
}

function toggleImage (img, action, tooltipText) {
  const parentButton = img.parentNode

  if (action === 'show') {
    img.src = img.getAttribute('originalSrc')
    parentButton.setAttribute('aria-label', tooltipText)
  } else {
    if (!img.getAttribute('originalSrc')) img.setAttribute('originalSrc', img.src)
    img.src = placeholderImagePath
    parentButton.setAttribute('aria-label', tooltipText)
  }
}
