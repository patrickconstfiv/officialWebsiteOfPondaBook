const revealElements = document.querySelectorAll("[data-reveal]");
const panels = [...document.querySelectorAll(".story-panel")];
const screens = [...document.querySelectorAll(".device-screen")];
const heroStage = document.querySelector(".hero-stage");
const heroFrame = document.querySelector(".hero-stage-frame");
const progressBar = document.querySelector(".progress-bar");
const yearNode = document.querySelector("#year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -10% 0px"
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

const setActiveStory = (name) => {
  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.story === name);
  });

  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
};

if (panels.length && screens.length) {
  const storyObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.dataset.story) {
        setActiveStory(visible.target.dataset.story);
      }
    },
    {
      threshold: [0.3, 0.5, 0.7],
      rootMargin: "-12% 0px -32% 0px"
    }
  );

  panels.forEach((panel) => storyObserver.observe(panel));
}

const updateScrollUI = () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

  document.body.classList.toggle("is-scrolled", scrollTop > 12);

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (!prefersReducedMotion && heroStage) {
    const offset = Math.min(scrollTop * 0.08, 24);
    heroStage.style.transform = `translateY(${offset}px)`;
  }
};

updateScrollUI();
window.addEventListener("scroll", updateScrollUI, { passive: true });

if (!prefersReducedMotion && heroStage && heroFrame && window.innerWidth > 900) {
  heroStage.addEventListener("pointermove", (event) => {
    const bounds = heroStage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const rotateY = x * 8;
    const rotateX = -y * 8;

    heroFrame.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  });

  heroStage.addEventListener("pointerleave", () => {
    heroFrame.style.transform = "";
  });
}

document.querySelectorAll(".tilt-card").forEach((card) => {
  if (prefersReducedMotion) {
    return;
  }

  card.addEventListener("pointermove", (event) => {
    if (window.innerWidth < 900) {
      return;
    }

    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    card.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-6px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});
