$(document).ready(function () {
	$(".blog__height").matchHeight()

	$(".tab-amo-item").on("click", function (e) {
		e.preventDefault()
		const $btn = $(this)

		if ($btn.hasClass("active")) return

		// Переключаем кнопки
		$(".tab-amo-item").removeClass("active")
		$btn.addClass("active")

		// Переключаем картинки по индексу
		const index = $(".tab-amo-item").index($btn)
		$(".tab-amo-images img")
			.removeClass("is-active")
			.eq(index)
			.addClass("is-active")
	})
})
