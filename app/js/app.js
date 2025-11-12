document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("scroll", function () {
    const header = document.querySelector(".header");
    if (window.scrollY > 50) {
      header.classList.add("header--active");
    } else {
      header.classList.remove("header--active");
    }
  });
  // Инициализируем контроллер
  const controller = new ScrollMagic.Controller();

  const steps = document.querySelectorAll(".step");
  const images = document.querySelectorAll(".step-image");
  const chronologySection = document.querySelector("#chronology");

  let previousActiveStep = 1; // Отслеживаем предыдущий активный этап

  // Функция активации этапа
  function activateStep(stepNumber) {
    // Убираем классы у всех этапов
    steps.forEach((step) => {
      step.classList.remove("is-active", "active-hidden");
    });
    images.forEach((img) => img.classList.remove("is-active"));

    // Если переходим на другой этап, предыдущий получает класс active-hidden
    if (previousActiveStep !== stepNumber && previousActiveStep > 0) {
      const previousStep = document.querySelector(
        `.step[data-step="${previousActiveStep}"]`
      );
      if (previousStep) {
        previousStep.classList.add("active-hidden");
      }
    }

    // Активируем текущий этап
    const activeStep = document.querySelector(
      `.step[data-step="${stepNumber}"]`
    );
    const activeImage = document.querySelector(
      `.step-image[data-step="${stepNumber}"]`
    );

    if (activeStep) {
      activeStep.classList.add("is-active");
      activeStep.classList.remove("active-hidden"); // Убираем active-hidden если был
    }
    if (activeImage) activeImage.classList.add("is-active");

    // Обновляем предыдущий активный этап
    previousActiveStep = stepNumber;
  }

  // 1) Пин всей секции на фиксированные 100vh и переключение шагов по прогрессу
  const SECTION_DURATION_VH = 100;
  const HEADER_HEIGHT = 90; // Высота фиксированной шапки

  function calcDurationPx() {
    // Учитываем высоту шапки при расчете доступной высоты
    // Добавляем дополнительное пространство для последнего элемента (примерно 50% от базовой длительности)
    const baseDuration =
      ((window.innerHeight - HEADER_HEIGHT) * SECTION_DURATION_VH) / 100;
    // Добавляем дополнительное пространство, чтобы последний элемент не пропадал
    return baseDuration + baseDuration * 0.5;
  }

  const pinScene = new ScrollMagic.Scene({
    triggerElement: "#chronology",
    triggerHook: 0, // Триггер срабатывает когда элемент достигает верха viewport
    // Отрицательный offset: триггер сработает когда секция будет на HEADER_HEIGHT от верха
    // Это позволит секции начать закрепляться сразу после предыдущей секции
    offset: -HEADER_HEIGHT,
    duration: calcDurationPx(),
  })
    .setPin(chronologySection, { pushFollowers: true })
    .addTo(controller)
    .on("enter", () => {
      // При закреплении устанавливаем top равный высоте шапки
      requestAnimationFrame(() => {
        if (chronologySection) {
          chronologySection.style.top = HEADER_HEIGHT + "px";
        }
      });
    })
    .on("update", () => {
      // Постоянно обновляем позицию при закреплении, чтобы она всегда была на HEADER_HEIGHT
      if (
        chronologySection &&
        window.getComputedStyle(chronologySection).position === "fixed"
      ) {
        chronologySection.style.top = HEADER_HEIGHT + "px";
      }
    })
    .on("progress", (e) => {
      const total = steps.length;
      if (!total) return;

      // Улучшенная логика: последний элемент получает больше времени
      // Делим прогресс: первые 70% для первых элементов, последние 30% для последнего
      const lastElementThreshold = 0.7;

      let index;
      if (e.progress < lastElementThreshold) {
        // Для первых (total - 1) элементов равномерно распределяем время
        const segment = lastElementThreshold / (total - 1);
        index = Math.min(total - 2, Math.floor(e.progress / segment));
      } else {
        // Последний элемент остается активным на оставшиеся 30% прогресса
        index = total - 1;
      }

      activateStep(index + 1);
    })
    .on("leave", () => {
      // При откреплении убираем top
      if (chronologySection) {
        chronologySection.style.removeProperty("top");
      }
    });

  window.addEventListener("resize", () => {
    pinScene.duration(calcDurationPx());
  });

  // 2) Клики по этапам для перехода к нужному этапу
  steps.forEach((step) => {
    step.addEventListener("click", function () {
      const stepNumber = Number(this.getAttribute("data-step"));
      const total = steps.length;

      // Улучшенная логика расчета позиции скролла
      const lastElementThreshold = 0.7;
      const otherElementsRatio = lastElementThreshold / (total - 1);

      let targetProgress;
      if (stepNumber < total) {
        // Для первых элементов
        targetProgress = otherElementsRatio * (stepNumber - 1);
      } else {
        // Для последнего элемента
        targetProgress = lastElementThreshold + 0.15; // Немного после порога
      }

      // Вычисляем позицию скролла на основе прогресса
      const sceneStart = chronologySection.offsetTop - HEADER_HEIGHT;
      const targetTop = sceneStart + calcDurationPx() * targetProgress;

      window.scrollTo({ top: targetTop, behavior: "smooth" });
      activateStep(stepNumber);
    });
  });

  // Индикаторы отключены по умолчанию

  // Инициализация первого этапа
  activateStep(1);

  // ===== Side Menu (auto from headings with data-side-title) =====
  const headings = Array.from(document.querySelectorAll("[data-side-title]"));
  const sideNavList = document.getElementById("sideNavList");

  function slugify(text) {
    return text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-а-яё]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  if (sideNavList && headings.length) {
    headings.forEach((h) => {
      if (!h.id) {
        const generatedId = slugify(
          h.getAttribute("data-side-title") || h.textContent || "section"
        );
        h.id =
          generatedId || `section-${Math.random().toString(36).slice(2, 8)}`;
      }
      const li = document.createElement("li");
      li.className = "side-nav__item";
      const a = document.createElement("a");
      a.className = "side-nav__link";
      a.href = `#${h.id}`;
      a.textContent = h.getAttribute("data-side-title") || h.textContent || "";
      li.appendChild(a);
      sideNavList.appendChild(li);
    });

    const links = Array.from(sideNavList.querySelectorAll(".side-nav__link"));

    // Smooth scroll
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (target) {
          const top =
            target.getBoundingClientRect().top + window.pageYOffset - 20;
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    });

    // Active state by IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((l) => l.classList.remove("active"));
            const active = sideNavList.querySelector(
              `.side-nav__link[href="#${id}"]`
            );
            if (active) active.classList.add("active");
          }
        });
      },
      {
        root: null,
        rootMargin: "0% 0px -55% 0px",
        threshold: 0,
      }
    );

    headings.forEach((h) => observer.observe(h));
  } else {
    // Fallback: use existing static menu links
    const menuLinks = Array.from(document.querySelectorAll(".side-nav__link"));
    if (menuLinks.length) {
      const targets = menuLinks
        .map((l) => (l.getAttribute("href") || "").trim())
        .filter((h) => h.startsWith("#"))
        .map((h) => document.querySelector(h))
        .filter(Boolean);

      menuLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          const href = link.getAttribute("href") || "";
          if (href.startsWith("#")) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              const top =
                target.getBoundingClientRect().top + window.pageYOffset - 20;
              window.scrollTo({ top, behavior: "smooth" });
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
            menuLinks.forEach((l) => l.classList.remove("active"));
            const active = document.querySelector(
              `.side-nav__link[href="#${id}"]`
            );
            if (active) active.classList.add("active");
          });
        },
        { root: null, rootMargin: "-35% 0px -55% 0px", threshold: 0 }
      );
      targets.forEach((t) => io.observe(t));
    }
  }

  (() => {
    const items = Array.from(document.querySelectorAll(".cat-1-item"));
    if (!items.length) return;

    let lastActive = null;
    let ticking = false;

    const setActive = (el) => {
      if (lastActive === el) return;
      if (lastActive) lastActive.classList.remove("is-active");
      if (el) el.classList.add("is-active");
      lastActive = el;
    };

    const computeClosestToCenter = () => {
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const viewportCenter = viewportHeight / 2;

      let closestElement = null;
      let smallestDistance = Infinity;

      for (const el of items) {
        const rect = el.getBoundingClientRect();
        // Рассматриваем элементы, которые хотя бы частично видимы (+ небольшой запас)
        const margin = 48;
        if (rect.bottom < -margin || rect.top > viewportHeight + margin)
          continue;

        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestElement = el;
        }
      }

      setActive(closestElement);
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        computeClosestToCenter();
        ticking = false;
      });
    };

    // Слушатели с passive для плавности
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    // Начальная активация
    computeClosestToCenter();

    // уважение настройки "уменьшить анимацию"
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.body.classList.add("reduce-motion");
    }
  })();

  // ===== Custom Slider Section6 =====
  (() => {
    const sliderWrapper = document.querySelector(".slider-wrapper");
    const prevButton = document.getElementById("sliderPrev");
    const nextButton = document.getElementById("sliderNext");

    if (!sliderWrapper || !prevButton || !nextButton) return;

    const cards = Array.from(sliderWrapper.querySelectorAll(".slider-card"));
    let currentIndex = 1; // Индекс активной карточки (data-index="1")
    let isAnimating = false;

    // Находим минимальный и максимальный индекс
    const indices = cards.map((card) =>
      parseInt(card.getAttribute("data-index"))
    );
    const minIndex = Math.min(...indices);
    const maxIndex = Math.max(...indices);

    // Функция для обновления классов карточек
    function updateCards() {
      cards.forEach((card) => {
        const cardIndex = parseInt(card.getAttribute("data-index"));
        const diff = cardIndex - currentIndex;

        // Удаляем все классы состояний
        card.classList.remove(
          "slider-card-active",
          "slider-card-prev",
          "slider-card-next",
          "slider-card-back-left",
          "slider-card-back-right",
          "slider-card-exit-left",
          "slider-card-exit-right",
          "slider-card-enter-right"
        );

        // Убираем инлайн стили
        card.style.transform = "";
        card.style.opacity = "";

        // Добавляем соответствующий класс в зависимости от позиции
        if (diff === 0) {
          card.classList.add("slider-card-active");
        } else if (diff === -1) {
          card.classList.add("slider-card-prev");
        } else if (diff === 1) {
          card.classList.add("slider-card-next");
        } else if (diff < -1) {
          card.classList.add("slider-card-back-left");
        } else if (diff > 1) {
          card.classList.add("slider-card-back-right");
        }
      });

      // Обновляем состояние кнопок
      prevButton.disabled = currentIndex <= minIndex;
      nextButton.disabled = currentIndex >= maxIndex;
    }

    // Функция для перехода к следующей карточке
    function nextSlide() {
      if (isAnimating || currentIndex >= maxIndex) return;

      isAnimating = true;
      const activeCard = cards.find(
        (card) => parseInt(card.getAttribute("data-index")) === currentIndex
      );
      const nextCard = cards.find(
        (card) => parseInt(card.getAttribute("data-index")) === currentIndex + 1
      );

      if (activeCard && nextCard) {
        // Сначала убираем класс active у текущей карточки
        activeCard.classList.remove("slider-card-active");

        // Небольшая задержка для плавности
        requestAnimationFrame(() => {
          // Добавляем класс ухода
          activeCard.classList.add("slider-card-exit-left");

          // Убираем класс next у следующей карточки
          nextCard.classList.remove("slider-card-next");

          // Добавляем класс active с небольшой задержкой для плавности
          requestAnimationFrame(() => {
            nextCard.classList.add("slider-card-active");
          });
        });

        // После завершения анимации обновляем все позиции
        setTimeout(() => {
          currentIndex++;
          updateCards();
          isAnimating = false;
        }, 1000); // Время анимации из CSS
      } else {
        isAnimating = false;
      }
    }

    // Функция для перехода к предыдущей карточке
    function prevSlide() {
      if (isAnimating || currentIndex <= minIndex) return;

      isAnimating = true;
      const activeCard = cards.find(
        (card) => parseInt(card.getAttribute("data-index")) === currentIndex
      );
      const prevCard = cards.find(
        (card) => parseInt(card.getAttribute("data-index")) === currentIndex - 1
      );

      if (activeCard && prevCard) {
        // Сначала убираем класс active у текущей карточки
        activeCard.classList.remove("slider-card-active");

        // Небольшая задержка для плавности
        requestAnimationFrame(() => {
          // Добавляем класс ухода
          activeCard.classList.add("slider-card-exit-right");

          // Убираем класс prev у предыдущей карточки
          prevCard.classList.remove("slider-card-prev");

          // Добавляем класс active с небольшой задержкой для плавности
          requestAnimationFrame(() => {
            prevCard.classList.add("slider-card-active");
          });
        });

        setTimeout(() => {
          currentIndex--;
          updateCards();
          isAnimating = false;
        }, 1000);
      } else {
        isAnimating = false;
      }
    }

    // Обработчики событий
    nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      nextSlide();
    });

    prevButton.addEventListener("click", (e) => {
      e.preventDefault();
      prevSlide();
    });

    // Инициализация
    updateCards();
  })();

  // ===== Universal Tabs (Section3, Section5, etc.) =====
  (() => {
    // Находим все контейнеры с табами
    const tabsContainers = document.querySelectorAll(".rate-tabs");

    if (!tabsContainers.length) return;

    tabsContainers.forEach((container) => {
      // Находим табы и контент внутри этого контейнера
      const tabLinks = container.querySelectorAll(".rate-tabs__link");

      // Находим родительскую секцию для поиска контента табов
      const section = container.closest("section");
      if (!section) return;

      tabLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();

          const targetTab = link.getAttribute("data-tab");
          if (!targetTab) return;

          // Убираем active у всех табов в этом контейнере
          tabLinks.forEach((l) => l.classList.remove("active"));

          // Убираем active у всех контентов табов в этой секции
          const allTabContents = section.querySelectorAll(
            ".tab[data-tab-content]"
          );
          allTabContents.forEach((content) =>
            content.classList.remove("active")
          );

          // Добавляем active к выбранному табу
          link.classList.add("active");

          // Находим и активируем соответствующий контент в этой секции
          const targetContent = section.querySelector(
            `.tab[data-tab-content="${targetTab}"]`
          );
          if (targetContent) {
            targetContent.classList.add("active");
          }
        });
      });
    });
  })();
});
