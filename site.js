(function () {
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");

  function applyLabel() {
    if (!toggle) return;
    var mode = root.getAttribute("data-theme");
    if (!mode) {
      mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    toggle.textContent = mode === "dark" ? "Paper" : "Ink";
    toggle.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      if (!current) {
        current = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (err) {
        /* storage can be blocked; the toggle still applies for this view */
      }
      applyLabel();
    });
    applyLabel();
  }

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var target = document.getElementById(button.getAttribute("data-copy"));
      if (!target) return;
      var text = target.innerText.replace(/\n$/, "");
      var previous = button.textContent;
      var flash = function (label) {
        button.textContent = label;
        window.setTimeout(function () {
          button.textContent = previous;
        }, 1400);
      };
      var selectBlock = function () {
        var range = document.createRange();
        range.selectNodeContents(target);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        flash("Selected");
      };
      var legacyCopy = function () {
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (err) {
          ok = false;
        }
        document.body.removeChild(area);
        if (ok) flash("Copied");
        else selectBlock();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          flash("Copied");
        }).catch(legacyCopy);
      } else {
        legacyCopy();
      }
    });
  });

  var menuButton = document.querySelector("[data-menu]");
  var menu = document.getElementById("section-nav");
  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        menu.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  var links = Array.prototype.slice.call(document.querySelectorAll(".rail-nav a[href^='#']"));
  var sections = links
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || sections.length === 0) return;

  var active = null;
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) active = entry.target;
      });
      links.forEach(function (link) {
        var on = active && link.getAttribute("href") === "#" + active.id;
        link.classList.toggle("is-active", Boolean(on));
        if (on) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-20% 0px -65% 0px", threshold: 0.01 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();
