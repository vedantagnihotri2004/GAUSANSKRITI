const slider = document.querySelector('.shorts-slider');

function scrollLeft() {
    slider.scrollBy({ left: -200, behavior: 'smooth' });
}

function scrollRight() {
    slider.scrollBy({ left: 200, behavior: 'smooth' });
}