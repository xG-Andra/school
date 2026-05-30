(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------------- Navbar ----------------
  const navToggle = $(".nav-toggle");
  const navLinks = $(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    $$(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => navLinks.classList.remove("open"))
    );
  }

  const page = document.body.getAttribute("data-page");
  if (page) {
    $$(".nav-links a").forEach((a) => {
      if (a.getAttribute("data-page") === page) a.classList.add("active");
    });
  }

  // ---------------- Reveal animation ----------------
  function revealNow() {
    $$(".reveal").forEach((el) => {
    
      setTimeout(() => el.classList.add("is-visible"), 80);
    });
  }

  function initSlider() {
    const slider = $(".slider");
    if (!slider) return;

    const slides = $$(".slide", slider);
    const dotsWrap = $(".slider-dots", slider);
    if (!slides.length || !dotsWrap) return;

    let active = 0;
    let timer = null;

    function setActive(i) {
      active = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle("is-active", idx === active));
      $$(".slider-dots button", slider).forEach((b, idx) =>
        b.classList.toggle("is-active", idx === active)
      );
    }

    dotsWrap.innerHTML = "";
    slides.forEach((_, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Slide ${idx + 1}`);
      b.addEventListener("click", () => {
        setActive(idx);
        restart();
      });
      dotsWrap.appendChild(b);
    });

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => setActive(active + 1), 4200);
    }

    setActive(0);
    restart();
  }

  function initReadMoreHome() {
    const btn = $("#btnReadMoreHome");
    const more = $("#homeMoreText");
    if (!btn || !more) return;

    btn.addEventListener("click", () => {
      const isOpen = more.hasAttribute("data-open");
      if (isOpen) {
        more.removeAttribute("data-open");
        more.style.display = "none";
        btn.textContent = "Baca Selengkapnya";
      } else {
        more.setAttribute("data-open", "true");
        more.style.display = "block";
        btn.textContent = "Tutup";
      }
    });
  }

  // ---------------- Artikel ----------------
  function initArticles() {
    const list = $(".articles");
    if (!list) return;

    $$(".article-card [data-action='toggle']", list).forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".article-card");
        if (!card) return;
        const open = card.classList.toggle("is-open");
        btn.textContent = open ? "Tutup" : "Baca Selengkapnya";
      });
    });

    const search = $("#searchArticles");
    if (!search) return;

    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      $$(".article-card", list).forEach((card) => {
        const text = card.innerText.toLowerCase();
        const show = !q || text.includes(q);
        card.style.display = show ? "" : "none";
      });
    });
  }

  // ---------------- Buku Tamu ----------------
  const STORAGE_KEY = "wisata-yogya-guestbook-v1";

  function loadMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveMessages(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function renderMessages() {
  const wrap = $("#messages");
  if (!wrap) return;
  const items = loadMessages();
  wrap.innerHTML = "";
  if (!items.length) {
    wrap.innerHTML = "<p>Belum ada pesan, silakan isi buku tamu terlebih dahulu.</p>";
    return;
  }
  items.slice().reverse().forEach((m, reversedIdx) => {
    const originalIdx = items.length - 1 - reversedIdx;
    const el = document.createElement("div");
    el.className = "message";
    el.innerHTML = `
      <div class="top">
        <span class="name">${escapeHtml(m.name)}</span>
        <span class="date">${escapeHtml(m.date)}</span>
      </div>
      <div class="body">${escapeHtml(m.message)}</div>
      <button class="btn-delete" data-index="${originalIdx}">Hapus</button>
    `;
    el.querySelector(".btn-delete").addEventListener("click", () => {
      const current = loadMessages();
      current.splice(originalIdx, 1);
      saveMessages(current);
      renderMessages();
    });
    wrap.appendChild(el);
  });
}

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setFieldError(fieldEl, msg) {
    if (!fieldEl) return;
    const error = $(".error", fieldEl);
    if (msg) {
      fieldEl.classList.add("has-error");
      if (error) error.textContent = msg;
    } else {
      fieldEl.classList.remove("has-error");
      if (error) error.textContent = "";
    }
  }

  function initGuestbook() {
    const form = $("#guestbookForm");
    if (!form) return;

    const nameEl = $("#name");
    const emailEl = $("#email");
    const messageEl = $("#message");
    const toast = $("#toast");

    const fieldName = $("#fieldName");
    const fieldEmail = $("#fieldEmail");
    const fieldMessage = $("#fieldMessage");

    function validate() {
      let ok = true;
      const name = (nameEl?.value || "").trim();
      const email = (emailEl?.value || "").trim();
      const message = (messageEl?.value || "").trim();

      setFieldError(fieldName, "");
      setFieldError(fieldEmail, "");
      setFieldError(fieldMessage, "");

      if (!name) {
        setFieldError(fieldName, "Nama wajib diisi.");
        ok = false;
      }
      if (!email) {
        setFieldError(fieldEmail, "Email wajib diisi.");
        ok = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError(fieldEmail, "Format email tidak valid.");
        ok = false;
      }
      if (!message) {
        setFieldError(fieldMessage, "Pesan wajib diisi.");
        ok = false;
      } else if (message.length < 3 ) {
        setFieldError(fieldMessage, "Pesan minimal 3 karakter.");
        ok = false;
      }
      return ok;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;

      const items = loadMessages();
      const now = new Date();
      items.push({
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        message: messageEl.value.trim(),
        date: now.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
      });
      saveMessages(items);
      renderMessages();
      form.reset();
      alert("Terima kasih! Pesan Anda berhasil dikirim.");
      if (toast) {
        toast.classList.add("show");
        toast.textContent = "Terima kasih!";
        window.setTimeout(() => toast.classList.remove("show"), 3400);
      }
    });

    renderMessages();
  }

  // ---------------- Init ----------------
  window.addEventListener("DOMContentLoaded", () => {
     if (!sessionStorage.getItem("welcomed")) {
    alert("Selamat datang di Wisata Yogyakarta! \nJelajahi destinasi, kuliner, dan budaya Yogyakarta.");
    sessionStorage.setItem("welcomed", "true");
  }
    revealNow();
    initSlider();
    initReadMoreHome();
    initArticles();
    initGuestbook();
  });
})();

