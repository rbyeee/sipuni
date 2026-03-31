let numbersSupportSlider;

function createNumberSupportSwiper() {
    // Удаляем старый слайдер если есть
    if (numbersSupportSlider) {
        numbersSupportSlider.destroy(true, true);
    }

    const width = window.innerWidth;

    // Базовая конфигурация
    const config = {
        grabCursor: true,
        initialSlide: 2,
        centeredSlides: true,
        navigation: {
            nextEl: '.slider-container .swiper-button-next',
            prevEl: '.slider-container .swiper-button-prev',
        },
        keyboard: {
            enabled: true
        },
        spaceBetween: width < 600 ? 0 : 20,
        slidesPerView: width < 600 ? 1 : 2,
    };

    // Для десктопа добавляем coverflow
    config.effect = "coverflow";
    config.coverflowEffect = {
        rotate: 0,
        stretch: width >= 1350 ? 100 :
            width > 1300 ? 200 :
                width > 1250 ? 200 :
                    width > 990 ? 200 :
                        width > 800 ? 260 :
                            width > 700 ? 180 :
                                width > 600 ? 100 :
                                    width > 420 ? 200 : 100,
        depth: width >= 1350 ? 320 :
            width > 1300 ? 320 :
                width > 1250 ? 320 :
                    width > 990 ? 320 :
                        width > 700 ? 320 :
                            width > 600 ? 400 : 200,
        modifier: width < 600 ? 1.4 : 1.3,
        slideShadows: false,
    };

    numbersSupportSlider = new Swiper(".numbers-slider", config);
}

// Запускаем после загрузки DOM
document.addEventListener('DOMContentLoaded', createNumberSupportSwiper);

// Обновляем при ресайзе
window.addEventListener('resize', function() {
    clearTimeout(window.resized);
    window.resized = setTimeout(createNumberSupportSwiper, 100);
});