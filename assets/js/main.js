(function () {
  "use strict";
  var doc = document.documentElement;
  var lang = doc.lang && doc.lang.indexOf("pt") === 0 ? "pt" : "en";
  var WHATSAPP = doc.getAttribute("data-wa") || "";
  var FORM_ENDPOINT = doc.getAttribute("data-form") || "";
  var GEO = (doc.getAttribute("data-geo") || "-25.9859,31.9975").split(",");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var today = new Date().toISOString().slice(0, 10);

  // ---------------------------------------------------------------- header & menus
  var header = document.querySelector(".site-header");
  function onScroll() { header && header.classList.toggle("scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".menu-toggle");
  var mnav = document.querySelector(".mobile-nav");
  if (toggle && mnav) {
    toggle.addEventListener("click", function () {
      var open = mnav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      if (header) doc.style.setProperty("--header-h", header.offsetHeight + "px");
    });
  }

  document.querySelectorAll(".nav-drop").forEach(function (drop) {
    var btn = drop.querySelector(".nav-drop-btn");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = drop.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function () { drop.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { drop.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.blur(); }
    });
  });

  // ---------------------------------------------------------------- reveal on scroll + drawing botanicals
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.matches("[data-reveal]")) el.classList.add("in");
      if (el.matches(".botanical.draw")) el.classList.add("drawn");
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;

  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    if (io) { el.classList.add("reveal"); io.observe(el); }
  });
  document.querySelectorAll(".botanical.draw").forEach(function (el) {
    if (io && !reduceMotion) io.observe(el); else el.classList.add("drawn");
  });

  // ---------------------------------------------------------------- living landscape: grass in the wind, birds
  var liveC = document.querySelector("[data-live]");
  if (liveC && liveC.getContext) {
    var lx = liveC.getContext("2d"), LW = 0, LH = 0, ldpr = Math.min(window.devicePixelRatio || 1, 2), blades = [], birds = [], liveOn = true, t0 = performance.now();
    var grassCols = ["#1F2E18", "#2B3F22", "#3B5530", "#55703A", "#7C8A44", "#A39A55", "#C2A867"];
    function lSize() {
      LW = liveC.clientWidth; LH = liveC.clientHeight;
      liveC.width = LW * ldpr; liveC.height = LH * ldpr; lx.setTransform(ldpr, 0, 0, ldpr, 0, 0);
      blades = [];
      var n = Math.round(LW / 2.2);
      for (var i = 0; i < n; i++) {
        var depth = Math.random();
        blades.push({ x: Math.random() * LW, h: (18 + Math.random() * 70) * (0.55 + depth * 0.7) * Math.min(1.3, LH / 820),
          w: 0.8 + depth * 1.8, c: grassCols[Math.min(grassCols.length - 1, (depth * 4 + Math.random() * 3) | 0)],
          ph: Math.random() * 6.28, sp: 0.7 + Math.random() * 0.8, y: LH + 4 - depth * 10, d: depth });
      }
      blades.sort(function (a, b) { return a.d - b.d; });
    }
    function bird() {
      var dir = Math.random() < .5 ? 1 : -1;
      return { x: dir > 0 ? -40 : LW + 40, y: LH * (0.12 + Math.random() * 0.25), v: (0.35 + Math.random() * 0.35) * dir,
        s: 5 + Math.random() * 5, ph: Math.random() * 6.28, f: 5 + Math.random() * 3, bob: Math.random() * 6.28 };
    }
    function lFrame(now) {
      if (!liveOn) return;
      var t = (now - t0) / 1000;
      lx.clearRect(0, 0, LW, LH);
      var gust = Math.sin(t * 0.35) * 0.5 + Math.sin(t * 0.13 + 1) * 0.5;
      for (var i = 0; i < blades.length; i++) {
        var b = blades[i];
        var bend = (Math.sin(t * b.sp + b.ph + b.x * 0.004) * 0.35 + gust * 0.55 + 0.25) * b.h * 0.32;
        lx.strokeStyle = b.c; lx.lineWidth = b.w; lx.lineCap = "round";
        lx.beginPath(); lx.moveTo(b.x, b.y);
        lx.quadraticCurveTo(b.x + bend * 0.25, b.y - b.h * 0.55, b.x + bend, b.y - b.h); lx.stroke();
      }
      if (birds.length < 3 && Math.random() < 0.004) birds.push(bird());
      lx.strokeStyle = "rgba(40,36,48,.75)"; lx.lineWidth = 1.4;
      for (var k = birds.length - 1; k >= 0; k--) {
        var q = birds[k]; q.x += q.v; var by = q.y + Math.sin(t * 0.8 + q.bob) * 4;
        var wing = Math.sin(t * q.f + q.ph) * q.s * 0.6;
        lx.beginPath(); lx.moveTo(q.x - q.s, by - wing); lx.quadraticCurveTo(q.x - q.s * 0.4, by - wing * 0.2 - 1, q.x, by);
        lx.quadraticCurveTo(q.x + q.s * 0.4, by - wing * 0.2 - 1, q.x + q.s, by - wing); lx.stroke();
        if (q.x < -60 || q.x > LW + 60) birds.splice(k, 1);
      }
      requestAnimationFrame(lFrame);
    }
    lSize(); window.addEventListener("resize", lSize);
    birds.push(bird());
    if (reduceMotion) { liveOn = false; lFrame(performance.now()); liveOn = false; }
    else {
      if (io) new IntersectionObserver(function (en) { var was = liveOn; liveOn = en[0].isIntersecting; if (liveOn && !was) requestAnimationFrame(lFrame); }).observe(liveC);
      requestAnimationFrame(lFrame);
    }
  }

  // ---------------------------------------------------------------- rooms slider arrows
  var slider = document.querySelector("[data-slider]");
  document.querySelectorAll("[data-slide]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!slider) return;
      var card = slider.querySelector(".slide");
      var step = card ? card.getBoundingClientRect().width + 24 : 320;
      slider.scrollBy({ left: step * parseInt(b.getAttribute("data-slide"), 10), behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  // ---------------------------------------------------------------- booking bar
  var L = {
    en: { adult: ["adult", "adults"], child: ["child", "children"], room: ["room", "rooms"] },
    pt: { adult: ["adulto", "adultos"], child: ["criança", "crianças"], room: ["quarto", "quartos"] }
  }[lang];
  function plural(n, pair) { return n + " " + (n === 1 ? pair[0] : pair[1]); }

  document.querySelectorAll("[data-booking]").forEach(function (bar) {
    var counts = { adults: 2, children: 0, rooms: 1 };
    var limits = { adults: [1, 30], children: [0, 20], rooms: [1, 7] };
    var btn = bar.querySelector("[data-guests-btn]");
    var pop = bar.querySelector("[data-guests-pop]");
    function render() {
      Object.keys(counts).forEach(function (k) {
        bar.querySelector('[data-out="' + k + '"]').textContent = counts[k];
        bar.querySelector('input[name="' + k + '"]').value = counts[k];
      });
      var txt = plural(counts.adults, L.adult) + (counts.children ? " · " + plural(counts.children, L.child) : "") + " · " + plural(counts.rooms, L.room);
      btn.textContent = txt;
    }
    function close() { pop.hidden = true; btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", function (e) { e.stopPropagation(); pop.hidden = !pop.hidden; btn.setAttribute("aria-expanded", pop.hidden ? "false" : "true"); });
    pop.addEventListener("click", function (e) { e.stopPropagation(); });
    bar.querySelectorAll("[data-step]").forEach(function (s) {
      s.addEventListener("click", function () {
        var p = s.getAttribute("data-step").split(":"), k = p[0], d = parseInt(p[1], 10);
        counts[k] = Math.min(limits[k][1], Math.max(limits[k][0], counts[k] + d));
        render();
      });
    });
    bar.querySelector("[data-guests-done]").addEventListener("click", close);
    document.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    var a = bar.querySelector('input[name="arrive"]'), d = bar.querySelector('input[name="depart"]');
    a.min = today; d.min = today;
    a.addEventListener("change", function () { d.min = a.value || today; if (d.value && d.value <= a.value) d.value = ""; });
    // the whole field is clickable: open the date picker where supported
    bar.querySelectorAll(".bb-field").forEach(function (f) {
      f.addEventListener("click", function (e) {
        var inp = f.querySelector("input:not([type=hidden]), select");
        if (inp && e.target === f) { inp.focus(); if (inp.showPicker) { try { inp.showPicker(); } catch (x) {} } }
      });
    });
    render();
  });

  // ---------------------------------------------------------------- reservation request form
  var form = document.getElementById("reserve-form");
  if (form) {
    var msg = document.getElementById("form-msg");
    var ok = document.getElementById("form-ok");
    form.arrive.min = today; form.depart.min = today;
    form.arrive.addEventListener("change", function () { form.depart.min = form.arrive.value || today; });

    // prefill from the booking bar / room buttons (?room=kina&arrive=…)
    var q = new URLSearchParams(location.search);
    ["type", "room", "arrive", "depart", "adults", "children", "rooms", "promo"].forEach(function (k) {
      var v = q.get(k);
      if (!v || !form[k]) return;
      if (form[k].tagName === "SELECT") {
        Array.prototype.forEach.call(form[k].options, function (o) { if (o.value === v) form[k].value = v; });
      } else { form[k].value = v; }
    });

    var T = {
      en: {
        dates: "Your departure date needs to be after your arrival date.",
        consent: "Please confirm you have read the privacy notice.",
        required: "Please add your name, email and arrival date.",
        failed: "We could not send your request just now. Please try again, or send it by WhatsApp.",
        sending: "Sending…",
        hello: "Hello Quinta Arca,", subject: "Reservation request", labels: {
          type: "Request", room: "Room", arrive: "Arrival", depart: "Departure", adults: "Adults", children: "Children",
          rooms: "Rooms", name: "Name", email: "Email", phone: "Phone", promo: "Promotion code", message: "Message" }
      },
      pt: {
        dates: "A data de partida tem de ser posterior à data de chegada.",
        consent: "Por favor confirme que leu o aviso de privacidade.",
        required: "Indique o seu nome, email e data de chegada.",
        failed: "Não foi possível enviar o pedido agora. Tente novamente ou envie por WhatsApp.",
        sending: "A enviar…",
        hello: "Olá Quinta Arca,", subject: "Pedido de reserva", labels: {
          type: "Pedido", room: "Quarto", arrive: "Chegada", depart: "Partida", adults: "Adultos", children: "Crianças",
          rooms: "Quartos", name: "Nome", email: "Email", phone: "Telefone", promo: "Código promocional", message: "Mensagem" }
      }
    }[lang];

    function collect() {
      msg.textContent = "";
      var d = {};
      new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
      if (!d.name || !d.email || !d.arrive) { msg.textContent = T.required; return null; }
      if (d.depart && d.depart <= d.arrive) { msg.textContent = T.dates; return null; }
      if (!form.consent.checked) { msg.textContent = T.consent; return null; }
      var nice = {};
      Object.keys(T.labels).forEach(function (k) {
        var v = d[k];
        if (k === "type" || k === "room") { var s = form[k]; v = s.value ? s.options[s.selectedIndex].text : ""; }
        if (v) nice[T.labels[k]] = v;
      });
      return { raw: d, nice: nice };
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form._honey && form._honey.value) return; // bots
      var data = collect();
      if (!data) return;
      var via = (e.submitter && e.submitter.value) || "email";
      if (via === "whatsapp") {
        var lines = [T.hello, ""];
        Object.keys(data.nice).forEach(function (k) { lines.push(k + ": " + data.nice[k]); });
        document.dispatchEvent(new CustomEvent("qa:lead", { detail: { method: "whatsapp", type: data.raw.type || "", room: data.raw.room || "" } }));
        window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
        return;
      }
      var payload = Object.assign({}, data.nice, {
        _subject: T.subject + " · " + data.raw.name + " · " + data.raw.arrive,
        _replyto: data.raw.email, _template: "table", _captcha: "false"
      });
      var submit = e.submitter || form.querySelector('button[type="submit"]');
      var label = submit.innerHTML; submit.disabled = true; submit.textContent = T.sending;
      fetch(FORM_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || (res.j && String(res.j.success) === "false")) throw new Error("send failed");
          form.classList.add("sent"); ok.hidden = false;
          document.dispatchEvent(new CustomEvent("qa:lead", { detail: { method: "form", type: data.raw.type || "", room: data.raw.room || "" } }));
          ok.querySelectorAll(".botanical.draw").forEach(function (b) { b.classList.add("drawn"); });
          ok.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        })
        .catch(function () { msg.textContent = T.failed; })
        .then(function () { submit.disabled = false; submit.innerHTML = label; });
    });
  }

  // ---------------------------------------------------------------- live Namaacha weather panel (Open-Meteo, no cookies)
  var w = document.querySelector("[data-weather]");
  if (w && window.fetch && w.querySelector('[data-w="tabs"]')) {
    var PT = lang === "pt";
    var words = PT
      ? { 0: "céu limpo", 1: "quase limpo", 2: "pouco nublado", 3: "nublado", 45: "neblina", 48: "neblina", 51: "chuvisco", 53: "chuvisco", 55: "chuvisco",
          61: "chuva fraca", 63: "chuva", 65: "chuva forte", 80: "aguaceiros", 81: "aguaceiros", 82: "aguaceiros fortes", 95: "trovoada", 96: "trovoada", 99: "trovoada" }
      : { 0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "cloudy", 45: "misty", 48: "misty", 51: "drizzle", 53: "drizzle", 55: "drizzle",
          61: "light rain", 63: "rainy", 65: "heavy rain", 80: "showers", 81: "showers", 82: "heavy showers", 95: "storm", 96: "storm", 99: "storm" };
    var ICONS = {
      sun: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="8"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"/></svg>',
      part: '<svg viewBox="0 0 48 48"><circle cx="18" cy="18" r="6"/><path d="M18 6v3M6 18h3M9.5 9.5l2 2M26.5 9.5l-2 2"/><path d="M16 36h20a7 7 0 0 0 0-14 10 10 0 0 0-19 3 6 6 0 0 0-1 11z"/></svg>',
      cloud: '<svg viewBox="0 0 48 48"><path d="M13 36h22a8 8 0 0 0 0-16 11 11 0 0 0-21 3 7 7 0 0 0-1 13z"/></svg>',
      fog: '<svg viewBox="0 0 48 48"><path d="M8 20h32M6 26h36M10 32h28M14 38h20"/></svg>',
      rain: '<svg viewBox="0 0 48 48"><path d="M13 30h22a8 8 0 0 0 0-16 11 11 0 0 0-21 3 7 7 0 0 0-1 13z"/><path d="M18 34v6M24 34v8M30 34v6"/></svg>',
      storm: '<svg viewBox="0 0 48 48"><path d="M13 30h22a8 8 0 0 0 0-16 11 11 0 0 0-21 3 7 7 0 0 0-1 13z"/><path d="M25 32l-4 7h6l-4 7"/></svg>',
      wind: '<svg viewBox="0 0 48 48"><path d="M6 20h26a5 5 0 1 0-5-5M6 28h32a5 5 0 1 1-5 5M6 24h18"/></svg>',
      drop: '<svg viewBox="0 0 48 48"><path d="M24 8c6 9 11 15 11 21a11 11 0 0 1-22 0c0-6 5-12 11-21z"/></svg>'
    };
    function kind(c) { return c === 0 ? "sun" : c <= 2 ? "part" : c === 3 ? "cloud" : c <= 48 ? "fog" : c >= 95 ? "storm" : "rain"; }
    function windWord(v) { return PT ? (v < 12 ? "fraco" : v < 30 ? "moderado" : "forte") : (v < 12 ? "light" : v < 30 ? "moderate" : "strong"); }
    function compass(d) { var n = PT ? ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] : ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]; return n[Math.round(d / 45) % 8]; }
    var $ = function (k) { return w.querySelector('[data-w="' + k + '"]'); };
    var locale = PT ? "pt-PT" : "en-GB";
    var now = new Date();
    $("year").textContent = now.toLocaleDateString(locale, { year: "numeric", timeZone: "Africa/Maputo" });
    $("weekday").textContent = now.toLocaleDateString(locale, { weekday: "long", timeZone: "Africa/Maputo" });
    $("date").textContent = now.toLocaleDateString(locale, { day: "numeric", month: "long", timeZone: "Africa/Maputo" });
    var api = "https://api.open-meteo.com/v1/forecast?latitude=" + GEO[0] + "&longitude=" + GEO[1] +
      "&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m" +
      "&hourly=weather_code,temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,sunset" +
      "&forecast_days=7&timezone=Africa%2FMaputo";
    fetch(api).then(function (r) { return r.json(); }).then(function (j) {
      var d = j.daily, c = j.current, h = j.hourly;
      function show(i) {
        var code = i === 0 ? c.weather_code : d.weather_code[i];
        var wind = i === 0 ? c.wind_speed_10m : d.wind_speed_10m_max[i];
        var dir = i === 0 ? c.wind_direction_10m : d.wind_direction_10m_dominant[i];
        $("icon").innerHTML = ICONS[kind(code)];
        $("desc").textContent = words[code] || "";
        $("windicon").innerHTML = ICONS.wind;
        $("windword").textContent = windWord(wind);
        $("rainicon").innerHTML = ICONS.drop;
        $("rain").textContent = (d.precipitation_probability_max[i] || 0) + "% " + (PT ? "chuva" : "rain");
        $("dir").textContent = compass(dir);
        $("wind").textContent = Math.round(wind) + " km/h";
        $("temp").innerHTML = i === 0 ? Math.round(c.temperature_2m) + "<sup>°</sup>"
          : Math.round(d.temperature_2m_max[i]) + "<sup>°</sup><small>/" + Math.round(d.temperature_2m_min[i]) + "°</small>";
        $("sun").textContent = (PT ? "pôr do sol " : "sunset ") + (d.sunset[i] || "").slice(11, 16);
        // 3-hourly strip for that day
        [].forEach.call(w.querySelectorAll("[data-wx-hour]"), function (el) {
          var hr = +el.getAttribute("data-wx-hour"), idx = i * 24 + hr;
          el.innerHTML = ICONS[kind(h.weather_code[idx])];
          el.parentNode.title = Math.round(h.temperature_2m[idx]) + "°";
          el.parentNode.classList.toggle("now", i === 0 && hr === Math.floor(now.getHours() / 3) * 3);
        });
        [].forEach.call($("tabs").children, function (t, k) { t.classList.toggle("on", k === i); t.setAttribute("aria-selected", k === i); });
      }
      var tabs = $("tabs");
      d.time.forEach(function (day, i) {
        var b = document.createElement("button");
        b.type = "button"; b.setAttribute("role", "tab");
        b.textContent = i === 0 ? (PT ? "Hoje" : "Today")
          : new Date(day + "T12:00:00").toLocaleDateString(locale, { weekday: "short" }).replace(".", "").toUpperCase();
        b.addEventListener("click", function () { show(i); });
        tabs.appendChild(b);
      });
      show(0);
    }).catch(function () { w.classList.add("no-weather"); });
  }

  // ================================================================ menus, motion and living details
  // ---- dialogs: full-screen menu and booking panel
  function dialog(el, openers, closers) {
    if (!el) return;
    var last = null;
    function open(e) {
      if (e) e.preventDefault();
      last = document.activeElement;
      el.hidden = false; document.body.style.overflow = "hidden";
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("open"); }); });
      openers.forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
      el.querySelectorAll(".garland").forEach(function (g) { g.classList.add("open"); });
      var f = el.querySelector("button, a, input, select"); if (f) setTimeout(function () { f.focus(); }, 80);
    }
    function close() {
      el.classList.remove("open"); document.body.style.overflow = "";
      openers.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      setTimeout(function () { el.hidden = true; }, reduceMotion ? 0 : 420);
      if (last) last.focus();
    }
    openers.forEach(function (b) { b.addEventListener("click", open); });
    closers.forEach(function (b) { b.addEventListener("click", close); });
    el.addEventListener("click", function (e) { if (e.target === el) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !el.hidden) close(); });
  }
  dialog(document.getElementById("overlay-menu"), [].slice.call(document.querySelectorAll("[data-menu-open]")), [].slice.call(document.querySelectorAll("[data-menu-close]")));
  dialog(document.getElementById("booking-overlay"), [].slice.call(document.querySelectorAll("[data-booking-open]")), [].slice.call(document.querySelectorAll("[data-booking-close]")));

  // ---- transparent header over photo openings (inner pages); the homepage stage handles its own
  var over = document.querySelector(".site-header.over-hero");
  var intro = document.querySelector("[data-intro]");
  var stagePage = !!document.querySelector("[data-stage]");
  if (over && !intro && !stagePage) over.classList.remove("over-hero");
  if (over && intro && !stagePage) {
    var lastY = 0;
    var onScrollOver = function () {
      var y = window.scrollY, edge = intro.offsetHeight - 90;
      over.classList.toggle("scrolled", y > edge);
      over.classList.toggle("hide", y > edge + 200 && y > lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScrollOver, { passive: true });
    onScrollOver();
  }

  // ---- the photo film: crossfade every 6.5 seconds
  var frames = [].slice.call(document.querySelectorAll(".film-frame"));
  if (frames.length > 1 && !reduceMotion) {
    var cur = 0;
    setInterval(function () {
      if (document.hidden) return;
      frames[cur].classList.remove("on");
      cur = (cur + 1) % frames.length;
      void frames[cur].offsetWidth;
      frames[cur].classList.add("on");
    }, 6500);
  }

  // ---- framed photo crossfade in the collage
  var fr = document.querySelector("[data-frame]");
  if (fr && !reduceMotion) {
    var fimgs = fr.querySelectorAll("img"), fk = 0;
    if (fimgs.length > 1) setInterval(function () { fimgs[fk].classList.remove("on"); fk = (fk + 1) % fimgs.length; fimgs[fk].classList.add("on"); }, 3600);
  }

  // ---- things that appear when they come into view: flowers bloom, letters arrive
  function onView(sel, cls, threshold) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (io && !reduceMotion) {
        var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { el.classList.add(cls); o.disconnect(); } }, { threshold: threshold });
        o.observe(el);
      } else { el.classList.add(cls); }
    });
  }
  onView(".garland", "open", 0.25);
  onView(".vletters", "in", 0.2);
  onView(".vword", "in", 0.2);

  // ---- hover list: a picture follows the cursor
  var xlist = document.querySelector("[data-xlist]");
  var prev = document.querySelector("[data-xpreview]");
  if (xlist && prev && window.matchMedia("(hover: hover)").matches) {
    var pimg = prev.querySelector("img"), px = 0, py = 0, tx = 0, ty = 0, raf = null;
    var follow = function () {
      px += (tx - px) * 0.16; py += (ty - py) * 0.16;
      prev.style.left = px + "px"; prev.style.top = py + "px";
      raf = Math.abs(tx - px) + Math.abs(ty - py) > 0.5 ? requestAnimationFrame(follow) : null;
    };
    xlist.addEventListener("mousemove", function (e) { tx = e.clientX + 170; ty = e.clientY; if (!raf) raf = requestAnimationFrame(follow); });
    xlist.querySelectorAll("a[data-preview]").forEach(function (a) {
      a.addEventListener("mouseenter", function (e) {
        pimg.src = a.getAttribute("data-preview");
        if (!prev.classList.contains("show")) { px = tx = e.clientX + 170; py = ty = e.clientY; }
        prev.classList.add("show");
      });
    });
    xlist.addEventListener("mouseleave", function () { prev.classList.remove("show"); });
  }

  // ---- gentle parallax on framed photos
  var pars = [].slice.call(document.querySelectorAll("[data-parallax]"));
  if (pars.length && !reduceMotion) {
    var ticking = false;
    var para = function () {
      var vh = window.innerHeight;
      pars.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var k = parseFloat(img.getAttribute("data-parallax")) || 0.1;
        var shift = ((r.top + r.height / 2) - vh / 2) * -k;
        img.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0) scale(1.18)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(para); } }, { passive: true });
    para();
  }

  // ================================================================ v5: stage, retreats, extras wall, room pages
  // ---- opening stage: the full-screen film shrinks into the collage frame as you scroll
  var stageEl = document.querySelector("[data-stage]");
  var wide = window.matchMedia("(min-width: 901px)");
  if (stageEl) {
    var sFilm = stageEl.querySelector("[data-stage-film]");
    var sTarget = stageEl.querySelector("[data-frame-target]");
    var sFades = stageEl.querySelectorAll("[data-stage-fade]");
    var sCollage = stageEl.querySelector("[data-collage]");
    var hdr = document.querySelector(".site-header.on-stage");
    var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var stageTick = function () {
      if (!wide.matches || reduceMotion) {
        sFilm.style.clipPath = ""; sCollage.style.opacity = 1;
        if (hdr) hdr.classList.toggle("scrolled", window.scrollY > window.innerHeight - 90);
        return;
      }
      var rect = stageEl.getBoundingClientRect(), vh = window.innerHeight, W = window.innerWidth;
      var p = Math.min(1, Math.max(0, -rect.top / (stageEl.offsetHeight - vh)));
      var e = ease(p);
      var t = sTarget.getBoundingClientRect(), pin = stageEl.firstElementChild.getBoundingClientRect();
      var top = (t.top - pin.top) * e, left = (t.left - pin.left) * e, right = (pin.right - t.right) * e, bottom = (pin.bottom - t.bottom) * e;
      sFilm.style.clipPath = "inset(" + top.toFixed(1) + "px " + right.toFixed(1) + "px " + bottom.toFixed(1) + "px " + left.toFixed(1) + "px)";
      sFilm.style.setProperty("--shade", (1 - e).toFixed(3));
      [].forEach.call(sFades, function (f) { f.style.opacity = Math.max(0, 1 - p * 3); f.style.visibility = p > .34 ? "hidden" : ""; f.style.pointerEvents = p > .2 ? "none" : ""; });
      sCollage.style.opacity = Math.min(1, Math.max(0, (p - .35) / .45));
      sCollage.style.transform = "translateY(" + ((1 - Math.min(1, p / .8)) * 40).toFixed(1) + "px)";
      if (hdr) hdr.classList.toggle("scrolled", p > .9 || rect.bottom < 90);
      stageEl.classList.toggle("settled", p > .98);
    };
    window.addEventListener("scroll", stageTick, { passive: true });
    window.addEventListener("resize", stageTick);
    stageTick();
  }

  // ---- private retreats slideshow
  var rt = document.querySelector("[data-retreats]");
  if (rt) {
    var list = [].map.call(rt.querySelectorAll("ul[hidden] li"), function (li) {
      return { name: li.dataset.name, tag: li.dataset.tag, img: li.dataset.img, href: li.dataset.href };
    });
    var ri = 0, imgA = rt.querySelector("[data-rt-a]"), imgB = rt.querySelector("[data-rt-b]");
    var goRt = function (n) {
      ri = (n + list.length) % list.length;
      var it = list[ri], nx = list[(ri + 1) % list.length];
      imgB.src = it.img; imgB.alt = it.name;
      imgB.classList.add("on"); imgA.classList.remove("on");
      var tmp = imgA; imgA = imgB; imgB = tmp;
      rt.querySelector("[data-rt-name]").textContent = it.name;
      rt.querySelector("[data-rt-tag]").textContent = it.tag;
      rt.querySelector("[data-rt-link]").href = it.href;
      var th = rt.querySelector("[data-rt-next]"); th.href = nx.href; th.querySelector("img").src = nx.img;
      [].forEach.call(rt.querySelectorAll("[data-goto]"), function (b, k) { b.classList.toggle("on", k === ri); });
    };
    rt.querySelectorAll("[data-rt]").forEach(function (b) { b.addEventListener("click", function () { goRt(ri + parseInt(b.dataset.rt, 10)); }); });
    rt.querySelectorAll("[data-goto]").forEach(function (b) { b.addEventListener("click", function () { goRt(parseInt(b.dataset.goto, 10)); }); });
    var rtTimer = setInterval(function () { if (!document.hidden && !reduceMotion) goRt(ri + 1); }, 6000);
    rt.addEventListener("mouseenter", function () { clearInterval(rtTimer); });
  }

  // ---- extras wall: vertical scroll moves the panels sideways
  var xw = document.querySelector("[data-xwall]");
  if (xw) {
    var track = xw.querySelector("[data-xw-track]");
    var xwTick = function () {
      if (!wide.matches || reduceMotion) { track.style.transform = ""; xw.style.height = ""; return; }
      var dist = track.scrollWidth - window.innerWidth + 80;
      xw.style.height = (window.innerHeight + dist) + "px";
      var r = xw.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / (xw.offsetHeight - window.innerHeight)));
      track.style.transform = "translate3d(" + (-dist * p).toFixed(1) + "px,0,0)";
      xw.querySelector(".xw-bg").style.transform = "translate3d(" + (-dist * p * .25).toFixed(1) + "px,0,0)";
    };
    window.addEventListener("scroll", xwTick, { passive: true });
    window.addEventListener("resize", xwTick);
    xwTick();
  }

  // ---- room page: the main photo grows as it comes in
  var grow = document.querySelector("[data-grow]");
  if (grow && !reduceMotion) {
    var gTick = function () {
      var r = grow.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 1.1)));
      grow.style.setProperty("--g", p.toFixed(3));
    };
    window.addEventListener("scroll", gTick, { passive: true }); gTick();
  }

  // ---------------------------------------------------------------- aerial tour (map loads only on request)
  document.querySelectorAll("[data-embed]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.src = btn.getAttribute("data-embed");
      frame.title = btn.getAttribute("data-title") || "Map";
      frame.loading = "lazy";
      frame.allowFullscreen = true;
      frame.referrerPolicy = "no-referrer-when-downgrade";
      btn.replaceWith(frame);
    });
  });
})();


/* ---------- Analytics: Google Analytics 4, loaded only after the visitor accepts ---------- */
(function () {
  var GA = document.documentElement.getAttribute("data-ga") || "";
  var box = document.querySelector("[data-consent]");
  var KEY = "qa-consent";
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function put(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var loaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.qaTrack = function (name, params) { if (loaded) gtag("event", name, params || {}); };

  function load() {
    if (loaded || !GA) return;
    loaded = true;
    gtag("js", new Date());
    gtag("config", GA, { anonymize_ip: true, page_language: document.documentElement.lang });
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA);
    document.head.appendChild(s);
  }
  function clearCookies() {
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (/^_ga/.test(n)) {
        ["", "; domain=.quintarca.com", "; domain=" + location.hostname].forEach(function (d) {
          document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }
  function show() { if (box) box.hidden = false; }
  function hide() { if (box) box.hidden = true; }

  if (GA) {
    var c = get();
    if (c === "yes") load(); else if (c !== "no") show();
  }
  if (box) {
    box.querySelector("[data-consent-yes]").addEventListener("click", function () { put("yes"); hide(); load(); });
    box.querySelector("[data-consent-no]").addEventListener("click", function () {
      var was = get() === "yes"; put("no"); hide(); clearCookies(); if (was) location.reload();
    });
  }
  document.querySelectorAll("[data-consent-open]").forEach(function (b) {
    if (!GA) { b.hidden = true; return; }
    b.addEventListener("click", show);
  });

  /* key actions */
  document.addEventListener("qa:lead", function (e) {
    var d = e.detail || {};
    window.qaTrack("generate_lead", { method: d.method, enquiry_type: d.type, room: d.room });
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a, button");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    var where = a.closest("header") ? "header" : a.closest("footer") ? "footer" : a.classList.contains("wa-float") ? "floating_button" : "page";
    if (/wa\.me/.test(h)) window.qaTrack("whatsapp_click", { location: where });
    else if (/^tel:/.test(h)) window.qaTrack("phone_click", { location: where });
    else if (/^mailto:/.test(h)) window.qaTrack("email_click", { location: where });
    else if (/instagram\.com/.test(h)) window.qaTrack("instagram_click", { location: where });
    else if (a.hasAttribute("data-booking-open")) window.qaTrack("booking_open", { location: where });
    else if (/\/(rooms|pt\/alojamento)\/[^/]+\/$/.test(h)) window.qaTrack("room_view_click", { room: h.split("/").filter(Boolean).pop() });
  }, true);
})();

/* ---------- Sounds of the quinta: birds, soft batuque, mbila, guitar and a low piano composing itself, made live in the browser ---------- */
(function () {
  var btns = [].slice.call(document.querySelectorAll("[data-sound-toggle]"));
  if (!btns.length) return;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { btns.forEach(function (b) { b.hidden = true; }); return; }
  var KEY = "qa-sound";
  var ctx = null, master, verbIn, buses = {}, timers = [], on = false, clock = null, startedAt = 0;
  function pref(v) { try { if (v === undefined) return localStorage.getItem(KEY); localStorage.setItem(KEY, v); } catch (e) { return null; } }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function chance(p) { return Math.random() < p; }
  function later(fn, ms) { var id = setTimeout(function () { timers = timers.filter(function (x) { return x !== id; }); if (on) fn(); }, ms); timers.push(id); }

  function noise(sec, brown) {
    var len = Math.floor(ctx.sampleRate * sec), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
      var f = Math.floor(ctx.sampleRate * 0.05);
      for (var j = 0; j < f; j++) { var g = j / f; d[j] *= g; d[len - 1 - j] *= g; }
    }
    return buf;
  }
  var whiteBuf;
  function impulse(sec) {
    var len = Math.floor(ctx.sampleRate * sec), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) { var d = buf.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    return buf;
  }
  function bus(level, send) {
    var g = ctx.createGain(); g.gain.value = level; g.connect(master);
    if (send) { var s = ctx.createGain(); s.gain.value = send; g.connect(s).connect(verbIn); }
    return g;
  }

  function build() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.01;
    master.connect(comp).connect(ctx.destination);
    var verb = ctx.createConvolver(); verb.buffer = impulse(3.6);
    verbIn = ctx.createGain(); verbIn.gain.value = 0.55; verbIn.connect(verb).connect(master);
    whiteBuf = noise(2, false);

    buses.birds = bus(1, 0.3);
    buses.drums = bus(1, 0.18);
    buses.mbila = bus(1, 0.5);
    buses.piano = bus(1, 0.7);
    buses.guitar = bus(1, 0.35);
    loadSignature();
  }

  /* ---- birds: several kinds, from different directions ---- */
  function voice(pan, vol) { var p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); if (p.pan) p.pan.value = pan; var g = ctx.createGain(); g.gain.value = vol; p.connect(g).connect(buses.birds); return p; }
  function chirp(out, t, f0, f1, dur, peak, type) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.55); o.frequency.exponentialRampToValueAtTime(f0 * 0.93, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.03);
  }
  var songs = [
    function (out, t) { var base = rnd(3200, 4300), n = Math.floor(rnd(3, 8)); for (var i = 0; i < n; i++) chirp(out, t + i * rnd(0.075, 0.12), base * rnd(0.95, 1.05), base * rnd(1.15, 1.35), rnd(0.05, 0.08), 0.5); },
    function (out, t) { var hi = rnd(3000, 3800); chirp(out, t, hi, hi * 1.04, 0.26, 0.42); chirp(out, t + 0.34, hi * 0.82, hi * 0.85, 0.3, 0.36); },
    function (out, t) { var f = rnd(2300, 2900); for (var i = 0; i < 4; i++) chirp(out, t + i * 0.16, f * (1 + i * 0.07), f * (1.22 + i * 0.07), 0.1, 0.45); },
    function (out, t) { var f = rnd(1800, 2400); chirp(out, t, f, f * 1.5, 0.18, 0.4); chirp(out, t + 0.22, f * 1.4, f * 0.9, 0.3, 0.35); chirp(out, t + 0.6, f * 1.1, f * 1.3, 0.14, 0.3); },
    function (out, t) { var o = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain(), f = rnd(3800, 4800), d = rnd(0.35, 0.7);
      o.frequency.value = f; m.frequency.value = rnd(26, 38); mg.gain.value = f * 0.07; m.connect(mg).connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(out); o.start(t); m.start(t); o.stop(t + d + 0.05); m.stop(t + d + 0.05); },
    function (out, t) { for (var i = 0; i < 2; i++) { var f = rnd(520, 640); chirp(out, t + i * 0.7, f, f * 0.96, 0.5, 0.5, "triangle"); } }   // a soft dove far off
  ];
  function birds() {
    var t = ctx.currentTime + 0.05, out = voice(rnd(-0.9, 0.9), rnd(0.09, 0.17));
    pick(songs)(out, t);
    if (chance(0.45)) pick(songs)(voice(rnd(-0.9, 0.9), rnd(0.05, 0.1)), t + rnd(0.5, 1.6));
    later(birds, rnd(700, 3200));
  }

  /* ---- instruments ---- */
  function env(g, t, peak, attack, decay) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay); }
  function drum(t, f0, f1, decay, vol, pan) {
    var o = ctx.createOscillator(), g = ctx.createGain(), p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (p.pan) p.pan.value = pan || 0;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + decay * 0.6);
    env(g, t, vol, 0.004, decay); o.connect(g).connect(p).connect(buses.drums); o.start(t); o.stop(t + decay + 0.05);
    var n = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
    n.buffer = whiteBuf; nf.type = "bandpass"; nf.frequency.value = f0 * 3; nf.Q.value = 1.2;
    env(ng, t, vol * 0.25, 0.002, 0.04); n.connect(nf).connect(ng).connect(p); n.start(t, rnd(0, 1.5), 0.08);
  }
  function shaker(t, vol) {
    var n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    n.buffer = whiteBuf; hp.type = "highpass"; hp.frequency.value = 6000;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    n.connect(hp).connect(g).connect(buses.drums); n.start(t, rnd(0, 1.5), 0.1);
  }
  function mbila(t, f, vol, pan) {
    var p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); if (p.pan) p.pan.value = pan || 0; p.connect(buses.mbila);
    [[1, 1, 0.55, "triangle"], [3.0, 0.22, 0.12, "sine"], [6.2, 0.06, 0.05, "sine"]].forEach(function (h) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = h[3]; o.frequency.value = f * h[0];
      env(g, t, vol * h[1], 0.003, h[2]); o.connect(g).connect(p); o.start(t); o.stop(t + h[2] + 0.05);
    });
    // the buzz of the gourd resonator
    var b = ctx.createOscillator(), bg = ctx.createGain(), bf = ctx.createBiquadFilter();
    b.type = "sawtooth"; b.frequency.value = f; bf.type = "bandpass"; bf.frequency.value = f * 4; bf.Q.value = 6;
    env(bg, t, vol * 0.05, 0.01, 0.25); b.connect(bf).connect(bg).connect(p); b.start(t); b.stop(t + 0.3);
  }
  function piano(t, f, vol) {
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 0.2;
    lp.frequency.setValueAtTime(Math.min(4000, f * 9), t); lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 2.2), t + 2.5);
    lp.connect(buses.piano);
    [[1, 1, 5.5], [2.003, 0.5, 3.6], [3.008, 0.22, 2.4], [4.016, 0.12, 1.6], [5.03, 0.05, 1.0]].forEach(function (h) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f * h[0];
      env(g, t, vol * h[1], 0.008, h[2]); o.connect(g).connect(lp); o.start(t); o.stop(t + h[2] + 0.1);
    });
  }

  /* ---- guitar: soft nylon strings, strummed gently ---- */
  function pluck(t, f, vol, pan) {
    var p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); if (p.pan) p.pan.value = pan;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(Math.min(5000, f * 12), t); lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 3), t + 1.2);
    lp.connect(p).connect(buses.guitar);
    for (var k = 1; k <= 7; k++) {
      var amp = Math.abs(Math.sin(Math.PI * k * 0.18)) / k; if (amp < 0.02) continue;
      var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f * k * (1 + 0.0008 * k * k);
      env(g, t, vol * amp, 0.004, 2.6 / (1 + 0.45 * k)); o.connect(g).connect(lp); o.start(t); o.stop(t + 3);
    }
  }
  var chords = [
    [146.83, 220, 293.66, 369.99],            // D
    [98, 146.83, 196, 246.94, 293.66],         // G
    [110, 164.81, 220, 277.18, 329.63],        // A
    [123.47, 185, 246.94, 293.66],             // Bm
    [82.41, 123.47, 164.81, 196, 293.66]       // Em7
  ];
  var chordIdx = 0;
  function strum(t, up, vol) {
    var c = chords[chordIdx].slice(); if (up) c.reverse();
    c.forEach(function (f, i) { pluck(t + i * rnd(0.022, 0.034), f, vol * (up ? 0.7 : 1) * rnd(0.85, 1), -0.25 + i * 0.12); });
  }

  /* ---- the signature: a distant voice saying "Quinta Arca", woven into the music ---- */
  var sigBuf = null, nextSig = Infinity, farVerb = null;
  function loadSignature() {
    var tries = ["/assets/audio/quinta-arca-voice.m4a", "/assets/audio/quinta-arca-voice.mp3", "/assets/audio/_preview-voice.m4a"];
    (function next() {
      var u = tries.shift(); if (!u) return;
      fetch(u).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(function (a) { return new Promise(function (ok, no) { ctx.decodeAudioData(a, ok, no); }); })
        .then(function (b) { sigBuf = b; nextSig = ctx.currentTime + rnd(20, 30); })
        .catch(next);
    })();
  }
  function signature(t) {
    if (!farVerb) { farVerb = ctx.createConvolver(); farVerb.buffer = impulse(5.5); var fg = ctx.createGain(); fg.gain.value = 0.9; farVerb.connect(fg).connect(master); }
    var src = ctx.createBufferSource(); src.buffer = sigBuf;
    var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 260;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4200;
    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); if (pan.pan) pan.pan.value = rnd(-0.35, 0.35);
    var dry = ctx.createGain(); dry.gain.value = 0.16;
    var wet = ctx.createGain(); wet.gain.value = 0.55;
    var dl = ctx.createDelay(2), fb = ctx.createGain(), dlp = ctx.createBiquadFilter(), dg = ctx.createGain();
    dl.delayTime.value = STEP * 3; fb.gain.value = 0.38; dlp.type = "lowpass"; dlp.frequency.value = 2400; dg.gain.value = 0.5;
    src.connect(hp).connect(lp).connect(pan);
    pan.connect(dry).connect(master);
    pan.connect(wet).connect(farVerb);
    pan.connect(dl); dl.connect(dlp).connect(fb).connect(dl); dlp.connect(dg).connect(farVerb);
    src.start(t);
  }

  /* ---- a shared slow pulse, so drums, mbila and piano always sit together ---- */
  var STEP = 60 / 76 / 3;               // triplet eighths at 76 bpm, a relaxed 12/8 feel
  var scaleLow = [73.42, 82.41, 92.5, 110, 123.47, 146.83, 164.81, 185, 220];       // D-major pentatonic, piano register
  var scaleHigh = [587.33, 659.25, 739.99, 880, 987.77, 1174.66, 1318.51];          // mbila register
  var step = 0, nextTime = 0, motif = [], pIdx = 4;
  var guitarBars = 0, guitarWait = 4;
  var drumsOn = false, drumBarsLeft = 0, mbilaPat = null, mbilaLeft = 0, mbilaWait = 6;

  function onStep(n, t) {
    var s = n % 12, bar = Math.floor(n / 12), age = (t - startedAt);
    var swing = (s % 3 === 2) ? STEP * 0.08 : 0, tt = t + swing + rnd(-0.008, 0.008);

    if (s === 0 && sigBuf && t >= nextSig) { signature(t); nextSig = t + rnd(150, 240); }
    if (s === 0) {   // decide each bar: do the drums play, does the mbila come in?
      if (drumBarsLeft <= 0) { drumsOn = !drumsOn && age > 20 ? chance(0.6) : false; drumBarsLeft = drumsOn ? Math.floor(rnd(4, 9)) : Math.floor(rnd(3, 7)); }
      drumBarsLeft--;
      if (guitarBars > 0) guitarBars--;
      else if (--guitarWait <= 0 && age > 8) { guitarBars = Math.floor(rnd(2, 5)); guitarWait = Math.floor(rnd(5, 10)); chordIdx = Math.floor(rnd(0, chords.length)); }
      if (guitarBars > 0 && chance(0.35)) chordIdx = pick([0, 1, 2, 3, 4]);
      if (mbilaLeft > 0) mbilaLeft--;
      else if (--mbilaWait <= 0 && age > 12) { mbilaPat = []; var root = Math.floor(rnd(0, 4)); for (var i = 0; i < 6; i++) mbilaPat.push(chance(0.75) ? scaleHigh[root + Math.floor(rnd(0, 3))] : 0); mbilaLeft = Math.floor(rnd(2, 4)); mbilaWait = Math.floor(rnd(8, 16)); }
    }

    if (drumsOn) {   // soft batuque: low drum, mid drum, an open slap and the shaker
      var fade = drumBarsLeft === 0 ? 0.6 : 1;
      if (s === 0 && chance(0.95)) drum(tt, 115, 68, 0.45, 0.12 * fade, -0.15);
      if (s === 7 && chance(0.7)) drum(tt, 110, 66, 0.4, 0.09 * fade, -0.15);
      if ((s === 3 || s === 9) && chance(0.55)) drum(tt, 210, 160, 0.22, 0.06 * fade, 0.25);
      if ((s === 6 || s === 10) && chance(0.35)) drum(tt, 330, 260, 0.12, 0.04 * fade, 0.3);
      if (chance(s % 3 === 0 ? 0.8 : 0.45)) shaker(tt, (s % 3 === 0 ? 0.018 : 0.009) * fade);
    }

    if (mbilaLeft > 0 && mbilaPat && s < 12) {   // short interlocking mbila figure on the half-beats
      var note = mbilaPat[s % 6];
      if (note && (s % 2 === 1 || chance(0.3))) mbila(tt, note, rnd(0.08, 0.11), rnd(-0.4, 0.4));
    }

    if (guitarBars > 0) {   // a few unhurried strums: down on the first beat, sometimes a light up-strum
      if (s === 0 && chance(0.9)) strum(tt, false, rnd(0.05, 0.07));
      else if (s === 8 && chance(0.4)) strum(tt, true, rnd(0.035, 0.05));
      else if (s === 6 && chance(0.25)) strum(tt, false, rnd(0.03, 0.045));
    }

    // the piano composes from nothing: very sparse at first, then small motifs it remembers and varies
    var density = Math.min(0.2, 0.025 + age / 600);
    var strong = (s % 3 === 0) ? 1 : 0.35;
    if (chance(density * strong)) {
      var f;
      if (motif.length > 2 && chance(0.45)) f = motif[Math.floor(rnd(0, motif.length))];
      else { pIdx = Math.max(0, Math.min(scaleLow.length - 1, pIdx + pick([-2, -1, -1, 1, 1, 2, 0]))); f = scaleLow[pIdx]; motif.push(f); if (motif.length > 5) motif.shift(); }
      piano(tt, f, rnd(0.035, 0.06) * (s === 0 ? 1.15 : 1));
    }
  }
  function scheduler() {
    while (nextTime < ctx.currentTime + 0.25) { onStep(step, nextTime); step++; nextTime += STEP; }
  }

  function paint() {
    btns.forEach(function (b) { b.classList.remove("is-waiting"); b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
  }
  function start() {
    if (!ctx) build();
    on = true; paint();
    ctx.resume().then(function () {
      var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.7, t + 3);
      if (!clock) { startedAt = t; nextTime = t + 0.3; step = 0; clock = setInterval(scheduler, 90); }
    });
    if (!timers.length) later(birds, 600);
  }
  function stop() {
    on = false; paint(); timers.forEach(clearTimeout); timers = [];
    if (clock) { clearInterval(clock); clock = null; }
    if (!ctx) return;
    var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + 0.6);
    setTimeout(function () { if (!on && ctx) ctx.suspend(); }, 700);
  }
  function waiting() { return btns.some(function (b) { return b.classList.contains("is-waiting"); }); }
  btns.forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (on || waiting()) { stop(); pref("off"); } else { start(); pref("on"); }
    });
  });

  // keep playing while browsing: resume on the first tap or key press of each new page
  if (pref() === "on") {
    btns.forEach(function (b) { b.classList.add("is-waiting"); });
    var go = function (e) {
      if (e && e.target && e.target.closest && e.target.closest("[data-sound-toggle]")) return;
      ["pointerdown", "keydown", "touchstart"].forEach(function (n) { window.removeEventListener(n, go, true); });
      if (pref() === "on" && !on) start();
    };
    ["pointerdown", "keydown", "touchstart"].forEach(function (n) { window.addEventListener(n, go, true); });
  }
  document.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });
})();
