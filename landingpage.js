const slider = document.querySelector('.shorts-slider');

// Testimonial slider functionality
const sliderContainer = document.querySelector('.slider-container');
const testimonials = document.querySelectorAll('.b');
let currentIndex = 0;
let visibleItems = window.innerWidth < 768 ? 1 : 3;

// Set initial width of testimonials
function setTestimonialWidth() {
    const containerWidth = document.querySelector('.short-slider')?.clientWidth;
    if (!containerWidth) return;
    
    const itemWidth = (containerWidth / visibleItems) - 20; // Accounting for gap
    testimonials.forEach(testimonial => {
        testimonial.style.minWidth = `${itemWidth}px`;
    });
}

// Scroll functions for testimonial slider
function scrollLeft() {
    if (currentIndex > 0) {
        currentIndex--;
        updateSliderPosition();
    }
}

function scrollRight() {
    if (currentIndex < testimonials.length - visibleItems) {
        currentIndex++;
        updateSliderPosition();
    }
}

function updateSliderPosition() {
    if (!sliderContainer || !testimonials.length) return;
    const testimonialWidth = testimonials[0].offsetWidth + 20; // Including gap
    sliderContainer.style.transform = `translateX(-${currentIndex * testimonialWidth}px)`;
}

// Function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add touch swipe functionality for mobile devices
let touchStartX = 0;
let touchEndX = 0;

if (slider) {
    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    if (touchStartX - touchEndX > 50) {
        // Swipe left
        scrollRight();
    }
    
    if (touchEndX - touchStartX > 50) {
        // Swipe right
        scrollLeft();
    }
}

// Initialize the app when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    if (mobileMenuBtn && menu) {
        mobileMenuBtn.addEventListener('click', function() {
            menu.classList.toggle('active');
        });
    }
    
    // Handle image loading errors
    // Check if any of the award images have failed to load
    const awardImages = document.querySelectorAll('.award-icons img');
    
    // Pre-check the awards section specifically
    setTimeout(function() {
        let missingAwards = false;
        awardImages.forEach(img => {
            if (!img.complete || img.naturalHeight === 0) {
                missingAwards = true;
                img.src = 'images/placeholder-award.png';
            }
        });
        
        if (missingAwards) {
            console.log('Some award images could not be loaded');
        }
    }, 2000);
    
    // Make sure slider is properly initialized
    setTestimonialWidth();
    updateSliderPosition();
});

// Add responsive behavior checks when window resizes
window.addEventListener('resize', function() {
    // Update visible items count based on screen width
    visibleItems = window.innerWidth < 768 ? 1 : 3;
    
    // Responsive behavior for imageone
    const imageOne = document.querySelector('.imageone');
    if (window.innerWidth <= 1200 && imageOne) {
        imageOne.style.position = 'relative';
        imageOne.style.left = 'auto';
        imageOne.style.top = 'auto';
    }
    
    // Update testimonial widths
    setTestimonialWidth();
    updateSliderPosition();
});

// Update global error handler for fetch or connection issues
window.addEventListener('error', function(e) {
    // Only handle resource loading errors
    if (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK') {
        console.log('Resource failed to load:', e.target.src || e.target.href);
        
        // Check if error is critical before showing message
        const isCriticalResource = e.target.hasAttribute('data-critical');
        if (isCriticalResource && !document.querySelector('.connection-error-message')) {
            // Create a more user-friendly message for critical resources only
            const errorBanner = document.createElement('div');
            errorBanner.className = 'connection-error-message';
            errorBanner.innerHTML = '<p>Some content may not be fully loaded. Please check your internet connection.</p><button class="dismiss-error">Dismiss</button>';
            errorBanner.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #f8d7da; color: #721c24; padding: 10px 15px; border-radius: 4px; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.2);';
            document.body.appendChild(errorBanner);
            
            // Allow dismissing the error message
            document.querySelector('.dismiss-error').addEventListener('click', function() {
                errorBanner.remove();
            });
            
            // Auto-dismiss after 8 seconds
            setTimeout(() => {
                if (errorBanner.parentNode) {
                    errorBanner.remove();
                }
            }, 8000);
        }
    }
}, true);