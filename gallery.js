document.querySelectorAll(".slider-container").forEach((container) => {
  const track = container.querySelector(".slider-track");
  const originalSlides = Array.from(container.querySelectorAll(".slide"));
  const prevBtn = container.querySelector(".nav.left");
  const nextBtn = container.querySelector(".nav.right");

  // Clone first and last slides
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

  track.appendChild(firstClone);
  track.insertBefore(lastClone, originalSlides[0]);

  const slides = container.querySelectorAll(".slide");
  let currentIndex = 1;
  let isTransitioning = false;

  // Set initial position
  track.style.transform = `translateX(-${currentIndex * 100}%)`;

  function moveToSlide(index) {
    isTransitioning = true;
    track.style.transition = "transform 0.5s ease";
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  track.addEventListener("transitionend", () => {
    if (slides[currentIndex].isSameNode(firstClone)) {
      // Jump instantly to real first slide
      track.style.transition = "none";
      currentIndex = 1;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    } else if (slides[currentIndex].isSameNode(lastClone)) {
      // Jump instantly to real last slide
      track.style.transition = "none";
      currentIndex = originalSlides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    isTransitioning = false;
  });

  prevBtn.addEventListener("click", () => {
    if (isTransitioning) return;
    currentIndex--;
    moveToSlide(currentIndex);
  });

  nextBtn.addEventListener("click", () => {
    if (isTransitioning) return;
    currentIndex++;
    moveToSlide(currentIndex);
  });
});
