document.addEventListener("DOMContentLoaded", function () {
  const stars = document.querySelectorAll(".star-rating span");
  const ratingInput = document.getElementById("rating");

  if (!stars.length) return;

  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const value = this.getAttribute("data-value");
      ratingInput.value = value;

      stars.forEach((s) => s.classList.remove("selected"));
      this.classList.add("selected");

      let prev = this.previousElementSibling;
      while (prev) {
        prev.classList.add("selected");
        prev = prev.previousElementSibling;
      }
    });
  });
});
