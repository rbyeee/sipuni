document.addEventListener("DOMContentLoaded", () => {
	let lastScrollTop = 0

	window.addEventListener("scroll", function () {
		const header = document.querySelector(".header")
		const scrollPosition = window.scrollY

		// Определяем направление скролла
		const isScrollingDown = scrollPosition > lastScrollTop

		if (scrollPosition > 240) {
			// Если проскроллили больше 240px
			if (isScrollingDown) {
				// Скроллим вниз - добавляем header--hidden
				header.classList.add("header--hidden")
			} else {
				// Скроллим вверх - убираем header--hidden
				header.classList.remove("header--hidden")
			}
		} else if (scrollPosition > 50) {
			// Если между 50px и 240px
			header.classList.add("header--active")

			// Если возвращаемся в этот диапазон из зоны >240px, убираем header--hidden
			if (lastScrollTop > 240) {
				header.classList.remove("header--hidden")
			}
		} else {
			// Если выше 50px (включая самый верх)
			header.classList.remove("header--active")
			header.classList.remove("header--hidden")
		}

		// Обновляем последнюю позицию скролла
		lastScrollTop = scrollPosition <= 0 ? 0 : scrollPosition
	})
	// Инициализируем контроллер
	const controller = new ScrollMagic.Controller()

	const steps = document?.querySelectorAll(".step")
	const images = document?.querySelectorAll(".step-image")
	const chronologySection = document.querySelector("#chronology")

	let previousActiveStep = 1 // Отслеживаем предыдущий активный этап
	let previousProgress = -1 // Отслеживаем предыдущий прогресс для определения направления скролла (-1 для первого вызова)

	// Функция активации этапа
	function activateStep(stepNumber, isScrollingDown = null) {
		// Находим элемент, который теряет is-active
		const previousStepElement = document.querySelector(
			`.step[data-step="${previousActiveStep}"]`
		)

		// Определяем, нужно ли добавлять класс step-down-active
		// Добавляем только при скролле сверху вниз
		const shouldAddStepDownActive =
			previousActiveStep !== stepNumber &&
			previousActiveStep > 0 &&
			isScrollingDown === true &&
			previousStepElement

		// Определяем, нужно ли удалять класс step-down-active
		// Удаляем при скролле снизу вверх
		const shouldRemoveStepDownActive =
			previousActiveStep !== stepNumber && isScrollingDown === false

		// Сначала добавляем класс step-down-active предыдущему элементу, если нужно
		// ДО того как удалим is-active
		if (shouldAddStepDownActive) {
			previousStepElement.classList.add("step-down-active")
		}

		// Убираем классы is-active и active-hidden у всех этапов
		steps.forEach(step => {
			step.classList.remove("is-active", "active-hidden")
		})
		images.forEach(img => {
			img.classList.remove("is-active")
		})

		// Если скроллим вверх, удаляем step-down-active у текущего активного шага
		if (shouldRemoveStepDownActive) {
			const currentStepElement = document.querySelector(
				`.step[data-step="${stepNumber}"]`
			)
			if (currentStepElement) {
				currentStepElement.classList.remove("step-down-active")
			}
		}

		// Если переходим на другой этап, предыдущий получает класс active-hidden
		if (previousActiveStep !== stepNumber && previousActiveStep > 0) {
			if (previousStepElement) {
				previousStepElement.classList.add("active-hidden")
			}
		}

		// Активируем текущий этап
		const activeStep = document.querySelector(
			`.step[data-step="${stepNumber}"]`
		)
		const activeImage = document.querySelector(
			`.step-image[data-step="${stepNumber}"]`
		)

		if (activeStep) {
			activeStep.classList.add("is-active")

			activeStep.classList.remove("active-hidden") // Убираем active-hidden если был
		}
		if (activeImage) activeImage.classList.add("is-active")

		// Обновляем предыдущий активный этап
		previousActiveStep = stepNumber
	}

	// 1) Пин всей секции на фиксированные 200vh и переключение шагов по прогрессу
	const SECTION_DURATION_VH = 200
	const HEADER_HEIGHT = 90 // Высота фиксированной шапки
	// Тонкая подстройка попадания по клику. Можно править цифры под макет.
	const CLICK_OFFSET = -12 // общий сдвиг, если нужно выше/ниже
	// Индивидуальные корректировки прогресса для шагов (номер шага -> добавка к прогрессу)
	// Позволяет точно посадить 2 и 3 шаг на нужные координаты
	const STEP_PROGRESS_TWEAKS = {
		1: 0, // первый без сдвига
		2: 0, // точная посадка за счёт середины сегмента
		3: 0, // убран отрицательный сдвиг, чтобы не попадать в диапазон 2-го
		4: 0, // последний обычно без сдвига
	}

	function calcDurationPx() {
		// Учитываем высоту шапки при расчете доступной высоты
		// Добавляем дополнительное пространство для последнего элемента (примерно 50% от базовой длительности)
		const baseDuration =
			((window.innerHeight - HEADER_HEIGHT) * SECTION_DURATION_VH) / 100
		// Добавляем дополнительное пространство, чтобы последний элемент не пропадал
		return baseDuration + baseDuration * 0.5
	}

	// Кэшируем реальную стартовую позицию сцены, чтобы клики по шагам работали корректно
	let initialSceneStart = null
	function computeSceneStart() {
		if (!chronologySection) return
		const rect = chronologySection.getBoundingClientRect()
		initialSceneStart = rect.top + window.pageYOffset - HEADER_HEIGHT
	}

	// После полной загрузки страницы вычисляем стартовую позицию
	window.addEventListener("load", () => {
		computeSceneStart()
	})

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
					chronologySection.style.top = HEADER_HEIGHT + "px"
				}
			})
		})
		.on("update", () => {
			// Постоянно обновляем позицию при закреплении, чтобы она всегда была на HEADER_HEIGHT
			if (
				chronologySection &&
				window.getComputedStyle(chronologySection).position === "fixed"
			) {
				chronologySection.style.top = HEADER_HEIGHT + "px"
			}
		})
		.on("progress", e => {
			const total = steps.length
			if (!total) return

			// Определяем направление скролла
			// Если previousProgress === -1, это первый вызов, считаем что скролл вниз
			const isScrollingDown =
				previousProgress === -1 ? true : e.progress > previousProgress
			previousProgress = e.progress

			// Улучшенная логика: последний элемент получает больше времени
			// Делим прогресс: первые 70% для первых элементов, последние 30% для последнего
			const lastElementThreshold = 0.7

			let index
			if (e.progress < lastElementThreshold) {
				// Для первых (total - 1) элементов равномерно распределяем время
				const segment = lastElementThreshold / (total - 1)
				index = Math.min(total - 2, Math.floor(e.progress / segment))
			} else {
				// Последний элемент остается активным на оставшиеся 30% прогресса
				index = total - 1
			}

			activateStep(index + 1, isScrollingDown)
		})
		.on("leave", () => {
			// При откреплении убираем top
			if (chronologySection) {
				chronologySection.style.removeProperty("top")
			}
		})

	window.addEventListener("resize", () => {
		pinScene.duration(calcDurationPx())
		// Пересчитываем стартовую позицию при изменении размеров окна
		computeSceneStart()
	})

	// 2) Клики по этапам для перехода к нужному этапу
	steps.forEach(step => {
		step.addEventListener("click", function (e) {
			e.preventDefault()
			e.stopPropagation()

			const stepNumber = Number(this.getAttribute("data-step"))
			const total = steps.length

			const lastElementThreshold = 0.7
			const otherElementsRatio = lastElementThreshold / (total - 1)

			let targetProgress
			const segment = otherElementsRatio // длина сегмента одного шага в прогрессе
			if (stepNumber < total) {
				// целимся в середину соответствующего сегмента, чтобы не попасть на границу
				targetProgress = segment * (stepNumber - 1 + 0.5)
			} else {
				// для последнего шага целимся в середину его диапазона [0.7..1] => 0.85
				targetProgress = lastElementThreshold + (1 - lastElementThreshold) * 0.5
			}
			// Применяем индивидуальные корректировки прогресса (тонкая настройка)
			const tweak = STEP_PROGRESS_TWEAKS[stepNumber] || 0
			targetProgress = Math.min(1, Math.max(0, targetProgress + tweak))

			// Используем реальные параметры сцены от библиотеки, это надёжнее
			let sceneStart
			if (typeof pinScene.scrollOffset === "function") {
				sceneStart = pinScene.scrollOffset()
			} else {
				// Фолбэк на случай отсутствия метода (не должен понадобиться)
				if (initialSceneStart == null || Number.isNaN(initialSceneStart)) {
					computeSceneStart()
				}
				sceneStart = initialSceneStart || 0
			}

			const duration =
				typeof pinScene.duration === "function"
					? pinScene.duration()
					: calcDurationPx()

			const targetTop = Math.round(
				sceneStart + duration * targetProgress + CLICK_OFFSET
			)

			activateStep(stepNumber, null, true)

			window.scrollTo({
				top: targetTop,
				behavior: "smooth",
			})
		})
	})

	// Индикаторы отключены по умолчанию

	// Инициализация первого этапа
	activateStep(1)

	// ===== Side Menu (auto from headings with data-side-title) =====
	const headings = Array.from(document?.querySelectorAll("[data-side-title]"))
	const sideNavList = document.getElementById("sideNavList")

	function slugify(text) {
		return text
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9\-а-яё]/g, "")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "")
	}

	if (sideNavList && headings.length) {
		headings.forEach(h => {
			if (!h.id) {
				const generatedId = slugify(
					h.getAttribute("data-side-title") || h.textContent || "section"
				)
				h.id =
					generatedId || `section-${Math.random().toString(36).slice(2, 8)}`
			}
			const li = document.createElement("li")
			li.className = "side-nav__item"
			const a = document.createElement("a")
			a.className = "side-nav__link"
			a.href = `#${h.id}`
			a.textContent = h.getAttribute("data-side-title") || h.textContent || ""
			li.appendChild(a)
			sideNavList.appendChild(li)
		})

		const links = Array.from(sideNavList.querySelectorAll(".side-nav__link"))

		// Smooth scroll
		links.forEach(link => {
			link.addEventListener("click", e => {
				e.preventDefault()
				// mark clicked link with active-trigger
				links.forEach(l => l.classList.remove("active-trigger"))
				link.classList.add("active-trigger")

				const id = link.getAttribute("href").slice(1)
				const target = document.getElementById(id)
				if (target) {
					const top =
						target.getBoundingClientRect().top + window.pageYOffset - 20
					window.scrollTo({ top, behavior: "smooth" })
				}
			})
		})

		// Active state by IntersectionObserver
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const id = entry.target.id
						links.forEach(l =>
							l.classList.remove("active", "active-dark", "active-trigger")
						)
						const active = sideNavList.querySelector(
							`.side-nav__link[href="#${id}"]`
						)
						if (active) {
							active.classList.add("active")
							const idx = links.indexOf(active)
							const prev = links[idx - 1]
							const next = links[idx + 1]
							if (prev) prev.classList.add("active-dark")
							if (next) next.classList.add("active-dark")
						}
					}
				})
			},
			{
				root: null,
				rootMargin: "0% 0px -55% 0px",
				threshold: 0,
			}
		)

		headings.forEach(h => observer.observe(h))
	} else {
		// Fallback: use existing static menu links
		const menuLinks = Array.from(document?.querySelectorAll(".side-nav__link"))
		if (menuLinks && menuLinks?.length) {
			const targets = menuLinks
				.map(l => (l.getAttribute("href") || "").trim())
				.filter(h => h.startsWith("#"))
				.map(h => document.querySelector(h))
				.filter(Boolean)

			menuLinks.forEach(link => {
				link.addEventListener("click", e => {
					const href = link.getAttribute("href") || ""
					if (href.startsWith("#")) {
						e.preventDefault()
						// mark clicked link with active-trigger
						menuLinks.forEach(l => l.classList.remove("active-trigger"))
						link.classList.add("active-trigger")

						const target = document.querySelector(href)
						if (target) {
							const top =
								target.getBoundingClientRect().top + window.pageYOffset - 20
							window.scrollTo({ top, behavior: "smooth" })
						}
					}
				})
			})

			const io = new IntersectionObserver(
				entries => {
					entries.forEach(entry => {
						if (!entry.isIntersecting) return
						const id = entry.target.id
						if (!id) return
						menuLinks.forEach(l =>
							l.classList.remove("active", "active-dark", "active-trigger")
						)
						const active = document.querySelector(
							`.side-nav__link[href="#${id}"]`
						)
						if (active) {
							active.classList.add("active")
							const idx = menuLinks.indexOf(active)
							const prev = menuLinks[idx - 1]
							const next = menuLinks[idx + 1]
							if (prev) prev.classList.add("active-dark")
							if (next) next.classList.add("active-dark")
						}
					})
				},
				{ root: null, rootMargin: "-35% 0px -55% 0px", threshold: 0 }
			)
			targets.forEach(t => io.observe(t))
		}
	}

	;(() => {
		const items = Array.from(document?.querySelectorAll(".cat-1-item"))
		if (!items.length) return

		let lastActive = null
		let ticking = false

		const setActive = el => {
			if (lastActive === el) return
			if (lastActive) lastActive.classList.remove("is-active")
			if (el) el.classList.add("is-active")
			lastActive = el
		}

		const computeClosestToCenter = () => {
			const viewportHeight =
				window.innerHeight || document.documentElement.clientHeight
			const viewportCenter = viewportHeight / 2

			let closestElement = null
			let smallestDistance = Infinity

			for (const el of items) {
				const rect = el.getBoundingClientRect()
				// Рассматриваем элементы, которые хотя бы частично видимы (+ небольшой запас)
				const margin = 48
				if (rect.bottom < -margin || rect.top > viewportHeight + margin)
					continue

				const elementCenter = rect.top + rect.height / 2
				const distance = Math.abs(elementCenter - viewportCenter)
				if (distance < smallestDistance) {
					smallestDistance = distance
					closestElement = el
				}
			}

			setActive(closestElement)
		}

		const onScrollOrResize = () => {
			if (ticking) return
			ticking = true
			requestAnimationFrame(() => {
				computeClosestToCenter()
				ticking = false
			})
		}

		// Слушатели с passive для плавности
		window.addEventListener("scroll", onScrollOrResize, { passive: true })
		window.addEventListener("resize", onScrollOrResize, { passive: true })

		// Начальная активация
		computeClosestToCenter()

		// уважение настройки "уменьшить анимацию"
		if (
			window.matchMedia &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			document.body.classList.add("reduce-motion")
		}
	})()

	// ===== Custom Slider Section6 =====
	;(() => {
		const sliderWrapper = document.querySelector(".slider-wrapper")
		const prevButton = document.getElementById("sliderPrev")
		const nextButton = document.getElementById("sliderNext")

		if (!sliderWrapper || !prevButton || !nextButton) return

		const cards = Array.from(sliderWrapper.querySelectorAll(".slider-card"))
		let currentIndex = 1 // Индекс активной карточки (data-index="1")
		let isAnimating = false

		// Находим минимальный и максимальный индекс
		const indices = cards.map(card => parseInt(card.getAttribute("data-index")))
		const minIndex = Math.min(...indices)
		const maxIndex = Math.max(...indices)

		// Функция для обновления классов карточек
		function updateCards() {
			cards.forEach(card => {
				const cardIndex = parseInt(card.getAttribute("data-index"))
				const diff = cardIndex - currentIndex

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
				)

				// Убираем инлайн стили
				card.style.transform = ""
				card.style.opacity = ""

				// Добавляем соответствующий класс в зависимости от позиции
				if (diff === 0) {
					card.classList.add("slider-card-active")
				} else if (diff === -1) {
					card.classList.add("slider-card-prev")
				} else if (diff === 1) {
					card.classList.add("slider-card-next")
				} else if (diff < -1) {
					card.classList.add("slider-card-back-left")
				} else if (diff > 1) {
					card.classList.add("slider-card-back-right")
				}
			})

			// Обновляем состояние кнопок
			prevButton.disabled = currentIndex <= minIndex
			nextButton.disabled = currentIndex >= maxIndex
		}

		// Функция для перехода к следующей карточке
		function nextSlide() {
			if (isAnimating || currentIndex >= maxIndex) return

			isAnimating = true
			const activeCard = cards.find(
				card => parseInt(card.getAttribute("data-index")) === currentIndex
			)
			const nextCard = cards.find(
				card => parseInt(card.getAttribute("data-index")) === currentIndex + 1
			)

			if (activeCard && nextCard) {
				// Сначала убираем класс active у текущей карточки
				activeCard.classList.remove("slider-card-active")

				// Небольшая задержка для плавности
				requestAnimationFrame(() => {
					// Добавляем класс ухода
					activeCard.classList.add("slider-card-exit-left")

					// Убираем класс next у следующей карточки
					nextCard.classList.remove("slider-card-next")

					// Добавляем класс active с небольшой задержкой для плавности
					requestAnimationFrame(() => {
						nextCard.classList.add("slider-card-active")
					})
				})

				// После завершения анимации обновляем все позиции
				setTimeout(() => {
					currentIndex++
					updateCards()
					isAnimating = false
				}, 1000) // Время анимации из CSS
			} else {
				isAnimating = false
			}
		}

		// Функция для перехода к предыдущей карточке
		function prevSlide() {
			if (isAnimating || currentIndex <= minIndex) return

			isAnimating = true
			const activeCard = cards.find(
				card => parseInt(card.getAttribute("data-index")) === currentIndex
			)
			const prevCard = cards.find(
				card => parseInt(card.getAttribute("data-index")) === currentIndex - 1
			)

			if (activeCard && prevCard) {
				// Сначала убираем класс active у текущей карточки
				activeCard.classList.remove("slider-card-active")

				// Небольшая задержка для плавности
				requestAnimationFrame(() => {
					// Добавляем класс ухода
					activeCard.classList.add("slider-card-exit-right")

					// Убираем класс prev у предыдущей карточки
					prevCard.classList.remove("slider-card-prev")

					// Добавляем класс active с небольшой задержкой для плавности
					requestAnimationFrame(() => {
						prevCard.classList.add("slider-card-active")
					})
				})

				setTimeout(() => {
					currentIndex--
					updateCards()
					isAnimating = false
				}, 1000)
			} else {
				isAnimating = false
			}
		}

		// Обработчики событий
		nextButton.addEventListener("click", e => {
			e.preventDefault()
			nextSlide()
		})

		prevButton.addEventListener("click", e => {
			e.preventDefault()
			prevSlide()
		})

		// Инициализация
		updateCards()
	})()

	const container = document?.querySelector(".statistics__container")

	function initStatisticsRotation() {
		const items = container?.querySelectorAll(".statistics__item")
		const videoItem = container?.querySelector(".statistics__item-video")
		const videoImages = videoItem?.querySelectorAll("img")

		// Получаем только элементы без video (фильтруем массив)
		const regularItems = Array?.from(items)?.filter(
			item => !item?.classList?.contains("statistics__item-video")
		)

		let currentIndex = 0
		let rotationInterval = null

		function showImage(index) {
			// Сначала скрываем все изображения
			videoImages.forEach(img => {
				img.style.display = "none"
			})

			// Показываем нужное изображение
			if (videoImages[index]) {
				videoImages[index].style.display = "block"
			}
		}

		function switchToIndex(index) {
			// Проверяем валидность индекса
			if (index < 0 || index >= regularItems?.length) return

			// Убираем активный класс у всех
			items.forEach(item => item?.classList?.remove("statistics__item-active"))

			// Добавляем активный класс выбранному элементу
			if (regularItems[index]) {
				regularItems[index]?.classList?.add("statistics__item-active")
			}

			// Показываем соответствующую картинку
			showImage(index)

			// Обновляем текущий индекс
			currentIndex = index
		}

		function rotateItems() {
			// Увеличиваем индекс для следующего шага
			currentIndex = (currentIndex + 1) % regularItems?.length

			// Переключаем на следующий элемент
			switchToIndex(currentIndex)
		}

		function startRotation() {
			// Очищаем предыдущий интервал, если есть
			if (rotationInterval) {
				clearInterval(rotationInterval)
			}
			// Запускаем ротацию каждые 5 секунд
			rotationInterval = setInterval(rotateItems, 5000)
		}

		// Добавляем обработчики кликов на каждую карточку
		regularItems.forEach((item, index) => {
			item.addEventListener("click", () => {
				switchToIndex(index)
				// Перезапускаем автоматическую ротацию после клика
				startRotation()
			})
		})

		// Инициализация
		showImage(0)
		switchToIndex(0)
		startRotation()
	}

	if (container) {
		initStatisticsRotation()
	}

	const swiper = new Swiper(".statistics-swiper", {
		loop: true,
		spaceBetween: 24,

		pagination: {
			el: ".swiper-pagination",
		},
	})

	// ===== Mobile Header Dropdown =====
	;(() => {
		const arrows = document?.querySelectorAll(".header-mobile__drop-row")

		arrows.forEach(arrow => {
			arrow.addEventListener("click", function (e) {
				e.preventDefault()

				// Находим родительский элемент header-mobile__drop
				const dropContainer = this.closest(".header-mobile__drop")
				if (!dropContainer) return

				// Находим колонку внутри этого контейнера
				const column = dropContainer.querySelector(".header-mobile-collumn")
				if (!column) return

				// Переключаем состояние
				const isOpen = column.classList.contains("is-open")

				if (isOpen) {
					// Закрываем
					column.classList.remove("is-open")
					this.classList.remove("active")
				} else {
					// Открываем
					column.classList.add("is-open")
					this.classList.add("active")
				}
			})
		})
	})()

	// ===== Copy Email to Clipboard =====
	;(() => {
		const rows = document.querySelectorAll(
			".header-desktop__under-row, .header-mobile__under-row"
		)

		if (rows.length === 0) return

		rows.forEach(row => {
			const emailLink = row.querySelector(".header-mobile__under-row span")
			const copyButtons = row.querySelectorAll(".btn-copy")

			console.log("emailLink", emailLink)
			console.log("copyButtons", copyButtons)

			if (!emailLink || copyButtons.length === 0) return

			const email = emailLink.textContent.trim()

			copyButtons.forEach(button => {
				button.addEventListener("click", async function (e) {
					e.preventDefault()

					try {
						await navigator.clipboard.writeText(email)

						this.classList.add("copied")
						setTimeout(() => {
							this.classList.remove("copied")
						}, 2000)
					} catch (err) {
						// Fallback для старых браузеров
						const textArea = document.createElement("textarea")
						textArea.value = email
						textArea.style.position = "fixed"
						textArea.style.left = "-999999px"
						document.body.appendChild(textArea)
						textArea.select()

						try {
							const success = document.execCommand("copy")
							if (success) {
								this.classList.add("copied")
								setTimeout(() => {
									this.classList.remove("copied")
								}, 2000)
							} else {
								console.warn("document.execCommand('copy') вернул false")
							}
						} catch (copyErr) {
							console.error("Не удалось скопировать email:", copyErr)
						}
						document.body.removeChild(textArea)
					}
				})
			})
		})
	})()

	// ===== Chronology Mobile Accordion =====
	;(() => {
		const accordionItems = document?.querySelectorAll(
			".chronology-mobile__item"
		)

		accordionItems.forEach(item => {
			const label = item.querySelector(".chronology-mobile__label")
			const content = item.querySelector(".chronology-mobile__content")

			if (!label || !content) return

			label.addEventListener("click", function (e) {
				e.preventDefault()

				const isOpen = content.classList.contains("is-open")

				// Закрываем все остальные элементы
				accordionItems.forEach(otherItem => {
					if (otherItem !== item) {
						const otherContent = otherItem.querySelector(
							".chronology-mobile__content"
						)
						const otherLabel = otherItem.querySelector(
							".chronology-mobile__label"
						)
						if (otherContent) {
							otherContent.classList.remove("is-open")
						}
						if (otherLabel) {
							otherLabel.classList.remove("is-active")
						}
						otherItem.classList.remove("active")
					}
				})

				// Переключаем текущий элемент
				if (isOpen) {
					content.classList.remove("is-open")
					label.classList.remove("is-active")
					item.classList.remove("active")
				} else {
					content.classList.add("is-open")
					label.classList.add("is-active")
					item.classList.add("active")
				}
			})
		})
	})()
})
