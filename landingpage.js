const slider = document.querySelector('.shorts-slider');

// Add these functions for the testimonial slider
let currentPosition = 0;
const slideWidth = 310; // Width of a single slide including margins
const totalSlides = document.querySelectorAll('.b').length;

function scrollLeft() {
    if (currentPosition > 0) {
        currentPosition--;
        updateSliderPosition();
    }
}

function scrollRight() {
    if (currentPosition < totalSlides - 3) { // Show 3 slides at a time
        currentPosition++;
        updateSliderPosition();
    }
}

function updateSliderPosition() {
    const sliderContainer = document.querySelector('.slider-container');
    const position = -currentPosition * slideWidth;
    sliderContainer.style.transform = `translateX(${position}px)`;
}

// Initialize the slider position when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Your existing code (if any)
    
    // Make sure slider is properly initialized
    updateSliderPosition();
});

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

// Add responsive behavior checks when window resizes
window.addEventListener('resize', function() {
    const imageOne = document.querySelector('.imageone');
    if (window.innerWidth <= 1200 && imageOne) {
        imageOne.style.position = 'relative';
        imageOne.style.left = 'auto';
        imageOne.style.top = 'auto';
    }
});

// Testimonial slider functionality
const sliderContainer = document.querySelector('.slider-container');
const testimonials = document.querySelectorAll('.b');
let currentIndex = 0;
const visibleItems = window.innerWidth < 768 ? 1 : 3;

// Set initial width of testimonials
function setTestimonialWidth() {
    const containerWidth = document.querySelector('.short-slider').clientWidth;
    const itemWidth = (containerWidth / visibleItems) - 20; // Accounting for gap
    testimonials.forEach(testimonial => {
        testimonial.style.minWidth = `${itemWidth}px`;
    });
}

// Initialize slider
window.addEventListener('load', setTestimonialWidth);
window.addEventListener('resize', setTestimonialWidth);

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
    const testimonialWidth = testimonials[0].offsetWidth + 20; // Including gap
    sliderContainer.style.transform = `translateX(-${currentIndex * testimonialWidth}px)`;
}
// Sample JavaScript for mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    if (mobileMenuBtn && menu) {
        mobileMenuBtn.addEventListener('click', function() {
            menu.classList.toggle('active');
        });
    }
});