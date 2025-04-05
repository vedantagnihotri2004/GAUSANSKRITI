document.addEventListener('DOMContentLoaded', function() {
    // Get slider elements
    const sliderContainer = document.querySelector('.slider-container');
    const prevBtn = document.querySelector('.slide-btn:first-of-type');
    const nextBtn = document.querySelector('.slide-btn:last-of-type');
    
    // Testimonial data - you can replace with your actual testimonials
    const testimonials = [
        // Current testimonials from your slider
        // Add more as needed
    ];
    
    let currentIndex = 0;
    const testimonialsPerView = getTestimonialsPerView();
    
    // Update testimonials per view on window resize
    window.addEventListener('resize', function() {
        updateTestimonialsPerView();
    });
    
    // Function to get number of testimonials to show based on screen width
    function getTestimonialsPerView() {
        if (window.innerWidth < 768) {
            return 1;
        } else if (window.innerWidth < 992) {
            return 2;
        } else {
            return 3;
        }
    }
    
    // Update testimonials per view on resize
    function updateTestimonialsPerView() {
        const newTestimonialsPerView = getTestimonialsPerView();
        if (newTestimonialsPerView !== testimonialsPerView) {
            testimonialsPerView = newTestimonialsPerView;
            slideTestimonials(currentIndex);
        }
    }
    
    // Function to slide testimonials
    function slideTestimonials(index) {
        // Get all testimonial slides
        const slides = document.querySelectorAll('.b');
        
        // If no slides exist, exit function
        if (!slides.length) return;
        
        // Calculate slide width including gap
        const slideWidth = slides[0].offsetWidth + 20; // 20px is the gap between slides
        
        // Calculate translation value
        sliderContainer.style.transform = `translateX(-${index * slideWidth}px)`;
        
        // Update current index
        currentIndex = index;
        
        // Enable/disable buttons as needed
        prevBtn.disabled = currentIndex === 0;
        prevBtn.style.opacity = currentIndex === 0 ? "0.5" : "1";
        
        const maxIndex = slides.length - testimonialsPerView;
        nextBtn.disabled = currentIndex >= maxIndex;
        nextBtn.style.opacity = currentIndex >= maxIndex ? "0.5" : "1";
    }
    
    // Add event listeners for buttons
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            slideTestimonials(currentIndex - 1);
        }
    });
    
    nextBtn.addEventListener('click', function() {
        const slides = document.querySelectorAll('.b');
        const maxIndex = slides.length - testimonialsPerView;
        
        if (currentIndex < maxIndex) {
            slideTestimonials(currentIndex + 1);
        }
    });
    
    // Initialize slider
    slideTestimonials(0);
});
