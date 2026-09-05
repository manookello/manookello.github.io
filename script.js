/* Amos Odhiambo — portfolio behaviour.
   Three small jobs: the theme toggle, the contact form, and the footer year. */

(function () {
  "use strict";

  /* ------------------------------------------------------------ theme */

  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var STORAGE_KEY = "theme";

  function systemPrefersLight() {
    return window.matchMedia("(prefers-color-scheme: light)").matches;
  }

  function currentTheme() {
    return root.getAttribute("data-theme") || (systemPrefersLight() ? "light" : "dark");
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var icon = toggle.querySelector("[data-icon]");
    // Show the theme you would switch *to*, which is what the control does.
    icon.textContent = theme === "dark" ? "☾" : "☀";
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  // A stored choice wins over the system setting; otherwise leave the document
  // unstamped so prefers-color-scheme keeps control.
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
    } else {
      applyTheme(currentTheme());
    }
  } catch (error) {
    applyTheme(currentTheme());
  }

  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      /* private browsing: the toggle still works for this visit */
    }
  });

  /* ------------------------------------------------------------ nav state */

  /* Mark the section currently in view. Purely additive: without JS, or
     without IntersectionObserver, the nav is still a working set of links. */
  if ("IntersectionObserver" in window) {
    var navLinks = {};
    Array.prototype.forEach.call(
      document.querySelectorAll('.nav nav a[href^="#"]'),
      function (link) {
        navLinks[link.getAttribute("href").slice(1)] = link;
      }
    );

    var visible = {};

    function markCurrent() {
      // The topmost visible section wins, so scrolling past a short section
      // does not leave two links lit at once.
      var current = null;
      Object.keys(navLinks).forEach(function (id) {
        var section = document.getElementById(id);
        if (!section || !visible[id]) return;
        if (!current || section.offsetTop < document.getElementById(current).offsetTop) {
          current = id;
        }
      });

      Object.keys(navLinks).forEach(function (id) {
        if (id === current) navLinks[id].setAttribute("aria-current", "true");
        else navLinks[id].removeAttribute("aria-current");
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });
        markCurrent();
      },
      // Ignore the strip under the sticky header, and require a section to
      // occupy the upper part of the viewport before it counts.
      { rootMargin: "-25% 0px -60% 0px" }
    );

    Object.keys(navLinks).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ------------------------------------------------------------ year */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------ form */

  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  var button = document.getElementById("submit-btn");
  if (!form) return;

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var FALLBACK = "amomano41@gmail.com";

  function setFieldError(input, message) {
    var field = input.closest(".field");
    if (!field) return;
    var error = field.querySelector(".field-error");
    if (!error) {
      error = document.createElement("p");
      error.className = "field-error";
      field.appendChild(error);
    }
    if (message) {
      field.classList.add("invalid");
      error.textContent = message;
      input.setAttribute("aria-invalid", "true");
    } else {
      field.classList.remove("invalid");
      error.textContent = "";
      input.removeAttribute("aria-invalid");
    }
  }

  function validate() {
    var ok = true;
    var name = form.elements.name;
    var email = form.elements.email;
    var message = form.elements.message;

    if (!name.value.trim()) {
      setFieldError(name, "Please add your name.");
      ok = false;
    } else setFieldError(name, "");

    if (!EMAIL_PATTERN.test(email.value.trim())) {
      setFieldError(email, "Please check this email address — replies go here.");
      ok = false;
    } else setFieldError(email, "");

    if (message.value.trim().length < 10) {
      setFieldError(message, "A little more detail helps — at least 10 characters.");
      ok = false;
    } else setFieldError(message, "");

    return ok;
  }

  function say(text, kind) {
    status.textContent = text;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  /* Compose a mailto as the fallback whenever the endpoint cannot be used,
     so the section is never a dead end. */
  function mailtoFallback() {
    var subject = encodeURIComponent("Portfolio enquiry from " + form.elements.name.value.trim());
    var body = encodeURIComponent(
      form.elements.message.value.trim() +
        "\n\n— " +
        form.elements.name.value.trim() +
        "\n" +
        form.elements.email.value.trim()
    );
    window.location.href = "mailto:" + FALLBACK + "?subject=" + subject + "&body=" + body;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validate()) {
      say("Please fix the highlighted fields.", "error");
      return;
    }

    var key = form.elements.access_key.value;
    if (!key || key.indexOf("REPLACE_WITH") === 0) {
      // No endpoint configured yet — hand off to the visitor's mail client.
      say("Opening your email app…", "ok");
      mailtoFallback();
      return;
    }

    button.disabled = true;
    var original = button.textContent;
    button.textContent = "Sending…";
    say("");

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    })
      .then(function (response) {
        return response.json().catch(function () {
          return { success: response.ok };
        });
      })
      .then(function (result) {
        if (result && result.success) {
          form.reset();
          say("Thanks — your message is on its way. I'll reply to the address you gave.", "ok");
        } else {
          say(
            "That didn't send. Please email " + FALLBACK + " directly — sorry for the detour.",
            "error"
          );
        }
      })
      .catch(function () {
        say(
          "No connection to the mail service. Please email " + FALLBACK + " directly.",
          "error"
        );
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = original;
      });
  });

  // Clear a field's error as soon as the visitor starts fixing it.
  ["name", "email", "message"].forEach(function (id) {
    var input = form.elements[id];
    if (input) {
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("invalid")) setFieldError(input, "");
      });
    }
  });
})();
