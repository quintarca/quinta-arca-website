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
