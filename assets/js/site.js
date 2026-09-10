/* ==========================================================================
   ICNGCI 2027 — site behaviour
   Vanilla JS, no dependencies, no build step.
   Every module is defensive: if its markup is not on the page, it no-ops.
   --------------------------------------------------------------------------
   EDIT HERE FIRST: the CONFIG block below drives the countdown, the
   "Add to calendar" files and the deadline status badges.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     CONFIG
     ---------------------------------------------------------------------- */
  var CONFIG = {
    name: "International Conference on Next-Generation Computing and Interdisciplinary Innovations in Science, Engineering, and Health",
    acronym: "ICNGCI 2027",
    // ISO dates (YYYY-MM-DD). Local midnight is assumed.
    startDate: "2027-02-19",
    endDate: "2027-02-20",
    venue: "Sharda University, Greater Noida, India", // TODO: replace
    url: "https://icngci2027.sharda.ac.in/" // TODO: replace
  };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  var on = function (el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); };

  function parseDate(iso) {
    var p = String(iso).split("-");
    return new Date(+p[0], +p[1] - 1, +p[2], 0, 0, 0, 0);
  }
  function pad(n) { return n < 10 ? "0" + n : String(n); }

  /* ----------------------------------------------------------------------
     1. Navigation — mobile drawer, dropdowns, active state, sticky shadow
     ---------------------------------------------------------------------- */
  function initNav() {
    var masthead = $(".masthead");
    var nav = $("#mainnav");
    var toggle = $(".navtoggle");
    if (!masthead) return;

    /* Scrim for the mobile drawer */
    var scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    scrim.hidden = false;
    document.body.appendChild(scrim);

    function closeNav() {
      if (!nav) return;
      nav.classList.remove("is-open");
      scrim.classList.remove("is-open");
      document.body.classList.remove("nav-locked");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
    function openNav() {
      if (!nav) return;
      nav.classList.add("is-open");
      scrim.classList.add("is-open");
      document.body.classList.add("nav-locked");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
    }

    on(toggle, "click", function () {
      if (nav.classList.contains("is-open")) closeNav(); else openNav();
    });
    on(scrim, "click", closeNav);
    on(document, "keydown", function (e) {
      if (e.key === "Escape") {
        closeNav();
        $$(".has-sub.is-open").forEach(function (li) {
          li.classList.remove("is-open");
          var b = $(".mainnav__link", li);
          if (b) b.setAttribute("aria-expanded", "false");
        });
      }
    });

    /* Dropdowns: click/keyboard toggle (hover is handled in CSS on desktop) */
    $$(".has-sub").forEach(function (li) {
      var btn = $(".mainnav__link", li);
      if (!btn || btn.tagName !== "BUTTON") return;
      on(btn, "click", function (e) {
        e.preventDefault();
        var isOpen = li.classList.contains("is-open");
        $$(".has-sub.is-open").forEach(function (other) {
          if (other !== li) {
            other.classList.remove("is-open");
            var ob = $(".mainnav__link", other);
            if (ob) ob.setAttribute("aria-expanded", "false");
          }
        });
        li.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
      });
    });

    on(document, "click", function (e) {
      if (!e.target.closest(".has-sub")) {
        $$(".has-sub.is-open").forEach(function (li) {
          li.classList.remove("is-open");
          var b = $(".mainnav__link", li);
          if (b) b.setAttribute("aria-expanded", "false");
        });
      }
    });

    /* Active page highlighting — derived from the URL, so the nav markup
       stays byte-identical on every page. */
    var here = location.pathname.split("/").pop() || "index.html";
    $$(".mainnav a[href]").forEach(function (a) {
      on(a, "click", function () {
        closeNav();
        $$(".has-sub.is-open").forEach(function (li) {
          li.classList.remove("is-open");
          var b = $(".mainnav__link", li);
          if (b) b.setAttribute("aria-expanded", "false");
        });
      });

      var target = a.getAttribute("href").split("#")[0].split("/").pop();
      if (!target || target !== here) return;
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
      var parentLi = a.closest(".has-sub");
      if (parentLi) {
        var pb = $(".mainnav__link", parentLi);
        if (pb) pb.classList.add("is-active");
      }
    });

    /* Sticky shadow */
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        masthead.classList.toggle("is-stuck", window.scrollY > 8);
        ticking = false;
      });
    }
    on(window, "scroll", onScroll, { passive: true });
    onScroll();

    /* Reset drawer state when resizing up to desktop */
    var mq = window.matchMedia("(min-width: 1121px)");
    var mqHandler = function (e) { if (e.matches) closeNav(); };
    if (mq.addEventListener) mq.addEventListener("change", mqHandler);
    else if (mq.addListener) mq.addListener(mqHandler);
  }

  /* ----------------------------------------------------------------------
     2. Countdown
     ---------------------------------------------------------------------- */
  function initCountdown() {
    var el = $("[data-countdown]");
    if (!el) return;
    var target = parseDate(el.getAttribute("data-countdown") || CONFIG.startDate);
    var out = {
      d: $("[data-cd='days']", el),
      h: $("[data-cd='hours']", el),
      m: $("[data-cd='minutes']", el),
      s: $("[data-cd='seconds']", el)
    };

    function tick() {
      var diff = target.getTime() - Date.now();
      if (diff <= 0) {
        el.innerHTML =
          '<li style="min-width:auto;padding:0.9rem 1.25rem"><b style="font-size:1.35rem">The conference is under way</b></li>';
        return;
      }
      var s = Math.floor(diff / 1000);
      if (out.d) out.d.textContent = Math.floor(s / 86400);
      if (out.h) out.h.textContent = pad(Math.floor(s / 3600) % 24);
      if (out.m) out.m.textContent = pad(Math.floor(s / 60) % 60);
      if (out.s) out.s.textContent = pad(s % 60);
      window.setTimeout(tick, 1000);
    }
    tick();
  }

  /* ----------------------------------------------------------------------
     3. Deadline status + "Add to calendar" (.ics)
        Markup: <li data-date="2026-10-01" data-title="Paper submission">
     ---------------------------------------------------------------------- */
  function icsEscape(str) {
    return String(str).replace(/\\/g, "\\\\").replace(/;/g, "\\;")
      .replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }
  function toICSDate(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
  }
  function downloadICS(title, startISO, endISO, description) {
    var start = parseDate(startISO);
    var end = endISO ? parseDate(endISO) : new Date(start.getTime());
    end.setDate(end.getDate() + 1); // DTEND is exclusive for all-day events
    var stamp = toICSDate(new Date()) + "T000000Z";
    var uid = "icngci-" + toICSDate(start) + "-" +
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "@icngci";
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ICNGCI 2027//Conference Website//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + stamp,
      "DTSTART;VALUE=DATE:" + toICSDate(start),
      "DTEND;VALUE=DATE:" + toICSDate(end),
      "SUMMARY:" + icsEscape(title + " — " + CONFIG.acronym),
      "DESCRIPTION:" + icsEscape(description || CONFIG.name),
      "LOCATION:" + icsEscape(CONFIG.venue),
      "URL:" + CONFIG.url,
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-icngci-2027.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function initDates() {
    var lists = $$("[data-dates]");
    if (!lists.length) return;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    lists.forEach(function (list) {
      var items = $$("li[data-date]", list);
      var nextMarked = false;

      items.forEach(function (li) {
        var d = parseDate(li.getAttribute("data-date"));
        var title = li.getAttribute("data-title") || $(".dates__label", li).textContent.trim();
        var meta = $(".dates__meta", li);
        var isPast = d.getTime() < today.getTime();
        var days = Math.round((d.getTime() - today.getTime()) / 86400000);

        if (isPast) {
          li.classList.add("is-past");
        } else if (!nextMarked) {
          li.classList.add("is-next");
          nextMarked = true;
        }

        if (!meta) return;

        /* Status badge */
        var badge = document.createElement("span");
        badge.className = "badge";
        if (isPast) {
          badge.classList.add("badge--done");
          badge.textContent = "Closed";
        } else if (days === 0) {
          badge.classList.add("badge--live");
          badge.textContent = "Today";
        } else if (days <= 30) {
          badge.classList.add("badge--soon");
          badge.textContent = days + (days === 1 ? " day left" : " days left");
        } else {
          badge.textContent = "Upcoming";
        }
        meta.appendChild(badge);

        /* Add-to-calendar */
        if (li.hasAttribute("data-no-ics")) return;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ics-btn";
        btn.textContent = "+ Calendar";
        btn.setAttribute("aria-label", "Add “" + title + "” to your calendar");
        on(btn, "click", function () {
          downloadICS(title, li.getAttribute("data-date"), li.getAttribute("data-end"),
            title + " for " + CONFIG.name + " (" + CONFIG.acronym + ").");
        });
        meta.appendChild(btn);
      });
    });
  }

  /* ----------------------------------------------------------------------
     3b. Headline deadline block — "N days left" / "Closed"
         Markup: <span class="deadline__left" data-deadline="2026-10-01"></span>
     ---------------------------------------------------------------------- */
  function initDeadlineBanner() {
    $$("[data-deadline]").forEach(function (el) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var d = parseDate(el.getAttribute("data-deadline"));
      var days = Math.round((d.getTime() - today.getTime()) / 86400000);
      if (days < 0) {
        el.textContent = "Submissions closed";
        el.classList.add("is-past");
      } else if (days === 0) {
        el.textContent = "Closes today";
      } else {
        el.textContent = days + (days === 1 ? " day left" : " days left");
      }
    });
  }

  /* ----------------------------------------------------------------------
     4. Track search / filter
     ---------------------------------------------------------------------- */
  function initTrackFilter() {
    var input = $("#track-search");
    var tracks = $$("[data-track]");
    if (!tracks.length) return;
    var chips = $$("[data-track-filter]");
    var count = $("#track-count");
    var empty = $("#track-empty");
    var activeTrack = "all";

    function clearMarks(li) {
      if (li._orig === undefined) li._orig = li.innerHTML;
      li.innerHTML = li._orig;
    }

    function apply() {
      var q = (input ? input.value : "").trim().toLowerCase();
      var shownTracks = 0;
      var shownTopics = 0;

      tracks.forEach(function (track) {
        var inTrack = activeTrack === "all" || track.getAttribute("data-track") === activeTrack;
        var topics = $$(".track__topics li", track);
        var hits = 0;

        topics.forEach(function (li) {
          clearMarks(li);
          if (!q) { li.hidden = false; hits++; return; }
          var text = li.textContent.toLowerCase();
          var idx = text.indexOf(q);
          if (idx === -1) { li.hidden = true; return; }
          li.hidden = false;
          hits++;
          /* highlight the match (plain-text nodes only) */
          var raw = li._orig;
          var lower = raw.toLowerCase();
          var pos = lower.indexOf(q);
          if (pos > -1 && raw.indexOf("<") === -1) {
            li.innerHTML = raw.slice(0, pos) + "<mark>" +
              raw.slice(pos, pos + q.length) + "</mark>" + raw.slice(pos + q.length);
          }
        });

        var headText = ($(".track__head", track) || track).textContent.toLowerCase();
        var headMatch = q && headText.indexOf(q) > -1;
        if (headMatch) topics.forEach(function (li) { li.hidden = false; });

        var visible = inTrack && (hits > 0 || headMatch);
        track.hidden = !visible;
        if (visible) {
          shownTracks++;
          shownTopics += headMatch ? topics.length : hits;
        }
      });

      if (count) {
        count.textContent = q || activeTrack !== "all"
          ? shownTopics + " topic" + (shownTopics === 1 ? "" : "s") + " in " +
            shownTracks + " track" + (shownTracks === 1 ? "" : "s")
          : tracks.length + " tracks · " + shownTopics + " topics";
      }
      if (empty) empty.hidden = shownTracks !== 0;
    }

    on(input, "input", apply);
    chips.forEach(function (chip) {
      on(chip, "click", function () {
        activeTrack = chip.getAttribute("data-track-filter");
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });
        apply();
      });
    });
    apply();
  }

  /* ----------------------------------------------------------------------
     5. Tabs (committee, programme days)
     ---------------------------------------------------------------------- */
  function initTabs() {
    $$("[data-tabs]").forEach(function (group) {
      var buttons = $$("[role='tab']", group);
      if (!buttons.length) return;

      function select(btn, focus) {
        buttons.forEach(function (b) {
          var selected = b === btn;
          b.setAttribute("aria-selected", String(selected));
          b.tabIndex = selected ? 0 : -1;
          var panel = document.getElementById(b.getAttribute("aria-controls"));
          if (panel) panel.hidden = !selected;
        });
        if (focus) btn.focus();
      }

      buttons.forEach(function (btn, i) {
        on(btn, "click", function () { select(btn, false); });
        on(btn, "keydown", function (e) {
          var next = null;
          if (e.key === "ArrowRight") next = buttons[(i + 1) % buttons.length];
          if (e.key === "ArrowLeft") next = buttons[(i - 1 + buttons.length) % buttons.length];
          if (e.key === "Home") next = buttons[0];
          if (e.key === "End") next = buttons[buttons.length - 1];
          if (next) { e.preventDefault(); select(next, true); }
        });
      });

      function applyHash(scroll) {
        var hash = location.hash.replace("#", "");
        if (!hash) return;
        var target = buttons.filter(function (b) {
          return b.getAttribute("aria-controls") === hash || b.id === "tab-" + hash || b.id === hash;
        })[0];
        if (target) {
          select(target, false);
          if (scroll) {
            var el = document.getElementById(target.getAttribute("aria-controls")) || group;
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }

      /* Listen to hash change (e.g. clicking committee dropdown items while already on committee.html) */
      window.addEventListener("hashchange", function () {
        applyHash(true);
      });

      /* Deep-link support on initial page load: #tab-organizing or #organizing selects that tab */
      var hash = location.hash.replace("#", "");
      var target = hash && buttons.filter(function (b) {
        return b.getAttribute("aria-controls") === hash || b.id === "tab-" + hash || b.id === hash;
      })[0];
      select(target || buttons[0], false);
    });
  }

  /* ----------------------------------------------------------------------
     6. People search (committee)
     ---------------------------------------------------------------------- */
  function initPeopleSearch() {
    var input = $("#people-search");
    if (!input) return;
    var count = $("#people-count");
    var people = $$(".person");

    function apply() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      people.forEach(function (p) {
        var match = !q || p.textContent.toLowerCase().indexOf(q) > -1;
        p.hidden = !match;
        if (match) shown++;
      });
      /* Hide groups that ended up empty */
      $$("[data-people-group]").forEach(function (g) {
        var any = $$(".person", g).some(function (p) { return !p.hidden; });
        g.hidden = !any;
      });
      if (count) count.textContent = shown + " of " + people.length + " members";
    }
    on(input, "input", apply);
    apply();
  }

  /* ----------------------------------------------------------------------
     7. Registration fee calculator
     ---------------------------------------------------------------------- */
  function initFeeCalc() {
    var form = $("#fee-calc");
    if (!form) return;

    var FEES = {
      IN: {
        currency: "INR", symbol: "₹",
        categories: {
          attendee: { label: "Attendee / Listener", amount: 2500 },
          student: { label: "Research Scholar / Student", amount: 6500 },
          academic: { label: "Academician / Faculty", amount: 7500 },
          industry: { label: "Industry / Corporate", amount: 8000 }
        }
      },
      FOREIGN: {
        currency: "USD", symbol: "$",
        categories: {
          attendee: { label: "Attendee / Listener", amount: 50 },
          student: { label: "Research Scholar / Student", amount: 100 },
          academic: { label: "Academician / Faculty", amount: 125 },
          industry: { label: "Industry / Corporate", amount: 125 }
        }
      }
    };

    var region = $("#calc-region", form);
    var category = $("#calc-category", form);
    var total = $("#calc-total");
    var breakdown = $("#calc-breakdown");

    function fmt(sym, n) {
      return sym + n.toLocaleString("en-IN");
    }

    function update() {
      var table = FEES[region.value] || FEES.IN;
      var cat = table.categories[category.value] || table.categories.student;
      var sum = cat.amount;

      if (total) total.textContent = fmt(table.symbol, sum);
      if (breakdown) breakdown.textContent = cat.label + " · Standard registration fee (indicative — taxes as applicable).";
    }

    [region, category].forEach(function (el) {
      if (el) {
        on(el, "input", update);
        on(el, "change", update);
      }
    });
    on(form, "submit", function (e) { e.preventDefault(); });
    update();
  }

  /* ----------------------------------------------------------------------
     8. Copy-to-clipboard
     ---------------------------------------------------------------------- */
  function initCopy() {
    $$("[data-copy]").forEach(function (btn) {
      on(btn, "click", function () {
        var value = btn.getAttribute("data-copy");
        var done = function () {
          var old = btn.textContent;
          btn.textContent = "Copied";
          btn.classList.add("is-done");
          window.setTimeout(function () {
            btn.textContent = old;
            btn.classList.remove("is-done");
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done, function () { fallback(value, done); });
        } else {
          fallback(value, done);
        }
      });
    });

    function fallback(value, done) {
      var ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (err) { /* noop */ }
      document.body.removeChild(ta);
    }
  }

  /* ----------------------------------------------------------------------
     9. Back to top
     ---------------------------------------------------------------------- */
  function initToTop() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.innerHTML = "↑";
    btn.setAttribute("aria-label", "Back to top");
    document.body.appendChild(btn);
    on(btn, "click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
      var h = $(".skip-link") || $(".brand");
      if (h) h.focus({ preventScroll: true });
    });
    var ticking = false;
    on(window, "scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        btn.classList.toggle("is-visible", window.scrollY > 700);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ----------------------------------------------------------------------
     10. Conference-wide "Add to calendar" buttons
     ---------------------------------------------------------------------- */
  function initConferenceIcs() {
    $$("[data-ics-conference]").forEach(function (btn) {
      on(btn, "click", function () {
        downloadICS(CONFIG.acronym, CONFIG.startDate, CONFIG.endDate,
          CONFIG.name + ". " + CONFIG.url);
      });
    });
  }

  /* ----------------------------------------------------------------------
     11. Footer year + contact form mailto fallback
     ---------------------------------------------------------------------- */
  function initMisc() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* Contact form: no backend required — compose a mail draft instead. */
    var form = $("#contact-form");
    if (form) {
      on(form, "submit", function (e) {
        e.preventDefault();
        var to = form.getAttribute("data-mailto");
        var get = function (n) {
          var f = form.elements[n];
          return f ? String(f.value).trim() : "";
        };
        var body = [
          "Name: " + get("name"),
          "Affiliation: " + get("affiliation"),
          "Email: " + get("email"),
          "Country: " + get("country"),
          "",
          get("message")
        ].join("\n");
        var href = "mailto:" + to +
          "?subject=" + encodeURIComponent("[ICNGCI 2027] " + (get("subject") || "Enquiry")) +
          "&body=" + encodeURIComponent(body);
        window.location.href = href;
        var status = $("#contact-status", form);
        if (status) {
          status.hidden = false;
          status.textContent =
            "Your email client should now open with the message pre-filled. " +
            "If nothing happens, write to " + to + " directly.";
        }
      });
    }
  }

  /* ----------------------------------------------------------------------
     Carousel Click Navigation to Committee Page
     ---------------------------------------------------------------------- */
  function initCarouselLinks() {
    var carousels = $$(".committee-showcase");
    carousels.forEach(function (sec) {
      on(sec, "click", function (e) {
        var card = e.target.closest(".story-card, .carousel-mini-head");
        if (card) {
          window.location.href = "committee.html";
        }
      });
    });
  }

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  function boot() {
    initNav();
    initCountdown();
    initDates();
    initDeadlineBanner();
    initTrackFilter();
    initTabs();
    initPeopleSearch();
    initFeeCalc();
    initCopy();
    initToTop();
    initConferenceIcs();
    initCarouselLinks();
    initMisc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.ICNGCI = { config: CONFIG, downloadICS: downloadICS };
})();
