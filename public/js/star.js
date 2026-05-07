document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll(".star-rating span");
  const ratingInput = document.getElementById("rating");

  stars.forEach(star => {
    star.addEventListener("click", () => {
      const val = parseInt(star.getAttribute("data-value"));
      if (ratingInput) ratingInput.value = val;
      stars.forEach(s => {
        const sv = parseInt(s.getAttribute("data-value"));
        s.classList.toggle("selected", sv <= val);
      });
    });
  });
});
