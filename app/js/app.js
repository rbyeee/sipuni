// // Import vendor jQuery plugin example
// import '~/app/libs/mmenu/dist/mmenu.js'

// document.addEventListener("DOMContentLoaded", () => {
//   const menuLinks = document.querySelectorAll(".side-nav__link");
//   const sections = document.querySelectorAll(".section");

//   const observerOptions = {
//     root: null,
//     rootMargin: "-20% 0px -70% 0px", // Настройка зоны срабатывания
//     threshold: 0,
//   };

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         const sectionId = entry.target.getAttribute("id");
//         const correspondingLink = document.querySelector(
//           `.side-nav__link[href="#${sectionId}"]`
//         );

//         // Убираем активный класс у всех
//         menuLinks.forEach((link) => link.classList.remove("active"));
//         // Добавляем текущему
//         correspondingLink.classList.add("active");
//       }
//     });
//   }, observerOptions);

//   // Наблюдаем за всеми секциями
//   sections.forEach((section) => {
//     observer.observe(section);
//   });

//   const steps = document.querySelectorAll(".step");
//   const stepContents = document.querySelectorAll(".step__content");
//   const stepBullets = document.querySelectorAll(".step__bullet");
//   const images = document.querySelectorAll(".image-frame__img");

//   // Функция активации этапа
//   function activateStep(stepNumber) {
//     // Деактивируем все
//     stepContents.forEach((content) => content.classList.remove("active"));
//     stepBullets.forEach((bullet) => bullet.classList.remove("active"));
//     images.forEach((img) => img.classList.remove("active"));

//     // Активируем выбранный
//     const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
//     const targetContent = targetStep.querySelector(".step__content");
//     const targetBullet = targetStep.querySelector(".step__bullet");
//     const targetImage = document.querySelector(
//       `.image-frame__img:nth-child(${stepNumber})`
//     );

//     targetContent.classList.add("active");
//     targetBullet.classList.add("active");
//     if (targetImage) targetImage.classList.add("active");
//   }

//   // Клик по этапу
//   steps.forEach((step) => {
//     step.addEventListener("click", () => {
//       const stepNumber = step.getAttribute("data-step");
//       activateStep(stepNumber);
//     });
//   });

//   // ScrollMagic для автоматической смены при скролле
//   const controller = new ScrollMagic.Controller();

//   const pinScene = new ScrollMagic.Scene({
//     triggerElement: "#chronology",
//     triggerHook: 0,
//     duration: "100%", // На сколько пикселей закреплять
//   })
//     .setPin(".chronology__image")
//     .addTo(controller);

//   steps.forEach((step, index) => {
//     const stepNumber = index + 1;

//     new ScrollMagic.Scene({
//       triggerElement: step,
//       triggerHook: 0.2,
//       duration: step.offsetHeight,
//     })
//       .on("enter", function () {
//         activateStep(stepNumber);
//       })
//       .addTo(controller);
//   });

//   // Инициализация первого этапа
//   activateStep(1);
// });
document.addEventListener("DOMContentLoaded", () => {
  // Инициализируем контроллер
  const controller = new ScrollMagic.Controller();

  const steps = document.querySelectorAll(".step");
  const images = document.querySelectorAll(".step-image");
  const chronologySection = document.querySelector("#chronology");

  // Функция активации этапа
  function activateStep(stepNumber) {
    console.log("Activating step:", stepNumber);

    // Деактивируем все
    steps.forEach((step) => step.classList.remove("active"));
    images.forEach((img) => img.classList.remove("active"));

    // Активируем текущий
    const activeStep = document.querySelector(
      `.step[data-step="${stepNumber}"]`
    );
    const activeImage = document.querySelector(
      `.step-image[data-step="${stepNumber}"]`
    );

    if (activeStep) activeStep.classList.add("active");
    if (activeImage) activeImage.classList.add("active");
  }

  // 1) Пин всей секции на фиксированные 200vh и переключение шагов по прогрессу
  const SECTION_DURATION_VH = 200;

  function calcDurationPx() {
    return (window.innerHeight * SECTION_DURATION_VH) / 100;
  }

  const pinScene = new ScrollMagic.Scene({
    triggerElement: "#chronology",
    triggerHook: "onLeave",
    duration: calcDurationPx(),
  })
    .setPin(chronologySection)
    .addTo(controller)
    .on("progress", (e) => {
      const total = steps.length;
      if (!total) return;
      const segment = 1 / total; // равные сегменты на всю длительность
      let index = Math.min(total - 1, Math.floor(e.progress / segment));
      activateStep(index + 1);
    });

  window.addEventListener("resize", () => {
    pinScene.duration(calcDurationPx());
  });

  // 2) Дополнительно оставим клики по пунктам для ручного выбора
  steps.forEach((step) => {
    step.addEventListener("click", function () {
      const stepNumber = Number(this.getAttribute("data-step"));
      const total = steps.length;
      const segmentHeight = calcDurationPx() / total;
      const targetTop = chronologySection.offsetTop + segmentHeight * (stepNumber - 1);
      window.scrollTo({ top: targetTop, behavior: "smooth" });
      activateStep(stepNumber);
    });
  });

  // Индикаторы отключены по умолчанию

  // Инициализация первого этапа
  activateStep(1);

  // ===== Side Menu (auto from headings with data-side-title) =====
  const headings = Array.from(document.querySelectorAll('[data-side-title]'));
  const sideNavList = document.getElementById('sideNavList');

  function slugify(text) {
    return text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-а-яё]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  if (sideNavList && headings.length) {
    headings.forEach((h) => {
      if (!h.id) {
        const generatedId = slugify(h.getAttribute('data-side-title') || h.textContent || 'section');
        h.id = generatedId || `section-${Math.random().toString(36).slice(2, 8)}`;
      }
      const li = document.createElement('li');
      li.className = 'side-nav__item';
      const a = document.createElement('a');
      a.className = 'side-nav__link';
      a.href = `#${h.id}`;
      a.textContent = h.getAttribute('data-side-title') || h.textContent || '';
      li.appendChild(a);
      sideNavList.appendChild(li);
    });

    const links = Array.from(sideNavList.querySelectorAll('.side-nav__link'));

    // Smooth scroll
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          const top = target.getBoundingClientRect().top + window.pageYOffset - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // Active state by IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((l) => l.classList.remove('active'));
            const active = sideNavList.querySelector(`.side-nav__link[href="#${id}"]`);
            if (active) active.classList.add('active');
          }
        });
      },
      {
        root: null,
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0,
      }
    );

    headings.forEach((h) => observer.observe(h));
  } else {
    // Fallback: use existing static menu links
    const menuLinks = Array.from(document.querySelectorAll('.side-nav__link'));
    if (menuLinks.length) {
      const targets = menuLinks
        .map((l) => (l.getAttribute('href') || '').trim())
        .filter((h) => h.startsWith('#'))
        .map((h) => document.querySelector(h))
        .filter(Boolean);

      menuLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href') || '';
          if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              const top = target.getBoundingClientRect().top + window.pageYOffset - 20;
              window.scrollTo({ top, behavior: 'smooth' });
            }
          }
        });
      });

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            if (!id) return;
            menuLinks.forEach((l) => l.classList.remove('active'));
            const active = document.querySelector(`.side-nav__link[href="#${id}"]`);
            if (active) active.classList.add('active');
          });
        },
        { root: null, rootMargin: '-35% 0px -55% 0px', threshold: 0 }
      );
      targets.forEach((t) => io.observe(t));
    }
  }
});
