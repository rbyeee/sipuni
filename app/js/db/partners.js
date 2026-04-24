let teamSlider;

function initTeamSwiper() {
    const width = window.innerWidth;
    let slider = document.getElementById('partners-team-slider');
    if (width < 700) {
        if (slider) {
            const config = {
                slidesPerView: 1,
                spaceBetween: 8,
                loop: false,
            };
            teamSlider = new Swiper(slider, config);
        }

    } else {
        destroyTeamSlider();
    }
}

function destroyTeamSlider() {
    if (teamSlider) {
        teamSlider.destroy(true, true);
        teamSlider = null;
    }
}

// Запускаем после загрузки DOM
document.addEventListener('DOMContentLoaded', initTeamSwiper);

// Обновляем при ресайзе
window.addEventListener('resize', function() {
    clearTimeout(window.resized);
    window.resized = setTimeout(initTeamSwiper, 100);
});