/* ============================================================
   Featured Books Slider — behavior
   ============================================================
   This version pulls its book list from a public GitHub markdown file
   instead of static HTML in homepage_en.html. That file lives at:

     https://github.com/kellyekh/slider/blob/main/books.md

   ...and is fetched via its "raw" URL, which is CORS-enabled for public
   repos (unlike Primo's own API, so no proxy is needed here):

     https://raw.githubusercontent.com/kellyekh/slider/main/books.md

   IMPORTANT: update RAW_BOOKS_URL below once the file is actually
   pushed to the repo, and again any time the default branch name or
   file path changes (this assumes a "main" branch and the file sitting
   at the repo root).

   Each book in books.md is a "## Title" heading followed by "cover:"
   and "link:" lines -- parsed below with parseBooksMarkdown(). Editing
   books.md (add, remove, reorder entries) changes the slider the next
   time the homepage loads or is navigated back to -- no HTML or JS
   edits needed for ordinary content updates.

   Because NDE is a single-page app, the Landing Page's content
   (including this slider) can mount, unmount, and remount as visitors
   navigate to and from the homepage without a full browser reload. So
   rather than assuming a single load event, a MutationObserver watches
   for the slider's markup appearing or disappearing and (re)initializes
   or tears down its behavior accordingly. */

(function () {
  var RAW_BOOKS_URL = 'https://raw.githubusercontent.com/kellyekh/slider/main/books.md';

  var activeSlider = null;

  function trySetup() {
    var root = document.querySelector('.book-slider');
    if (!root || root.dataset.sliderInitialized === 'true') return;
    root.dataset.sliderInitialized = 'true';
    loadAndSetup(root);
  }

  function tryTeardown() {
    var root = document.querySelector('.book-slider');
    if (!root && activeSlider) {
      activeSlider.destroy();
      activeSlider = null;
    }
  }

  function parseBooksMarkdown(text) {
    // Splits on lines starting with "## " (a book heading), then pulls
    // "cover:" and "link:" out of the lines that follow, up to the next
    // heading or the end of the file.
    var books = [];
    var blocks = text.split(/^##\s+/m).slice(1); // drop anything before the first heading

    blocks.forEach(function (block) {
      var lines = block.split('\n');
      var title = lines[0].trim();
      var cover = '';
      var link = '';

      lines.slice(1).forEach(function (line) {
        var coverMatch = line.match(/^\s*-?\s*cover:\s*(\S+)/i);
        var linkMatch = line.match(/^\s*-?\s*link:\s*(\S+)/i);
        if (coverMatch) cover = coverMatch[1];
        if (linkMatch) link = linkMatch[1];
      });

      if (title && cover && link) {
        books.push({ title: title, cover: cover, link: link });
      }
    });

    return books;
  }

  function buildSlideElement(book) {
    // A <div>, not an <li>: each slide gets role="group" below, which
    // isn't allowed on list items and would break the list's semantics.
    var li = document.createElement('div');
    li.className = 'book-slide';
    li.setAttribute('data-slide', '');

    var a = document.createElement('a');
    a.className = 'book-slide-link';
    a.href = book.link;

    var img = document.createElement('img');
    img.className = 'book-slide-cover';
    // Covers come through Ex Libris's Syndetics proxy, which can take ~2s
    // per image. Lazy loading lets the browser skip covers scrolled out of
    // the slider until they're needed, so they don't compete with the rest
    // of the page. (Set before src so the first request is already lazy.)
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = book.cover;
    img.alt = ''; // decorative: the title text in the same link names it

    var infoSpan = document.createElement('span');
    infoSpan.className = 'book-slide-info';

    var titleSpan = document.createElement('span');
    titleSpan.className = 'book-slide-book-title';
    titleSpan.textContent = book.title;

    infoSpan.appendChild(titleSpan);
    a.appendChild(img);
    a.appendChild(infoSpan);
    li.appendChild(a);

    return li;
  }

  function loadAndSetup(root) {
    var track = root.querySelector('.book-slider-track');
    if (!track) return;

    fetch(RAW_BOOKS_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Fetch failed with status ' + response.status);
        }
        return response.text();
      })
      .then(function (text) {
        var books = parseBooksMarkdown(text);
        if (!books.length) {
          throw new Error('No books parsed from books.md');
        }

        track.innerHTML = '';
        books.forEach(function (book) {
          track.appendChild(buildSlideElement(book));
        });

        activeSlider = setupBookSlider(root);
      })
      .catch(function (err) {
        // Fail quietly but visibly: leave a short message in place of the
        // slider rather than an empty box with no explanation, and log
        // the real error for whoever checks the browser console.
        console.error('Book slider: could not load books.md —', err);
        track.innerHTML = '<p class="book-slider-error" style="padding: 1rem;">Featured books are temporarily unavailable.</p>';
      });
  }

  function setupBookSlider(root) {
    var track = root.querySelector('.book-slider-track');
    var slides = Array.prototype.slice.call(track.querySelectorAll('[data-slide]'));
    var prevBtn = root.querySelector('.book-slider-prev');
    var nextBtn = root.querySelector('.book-slider-next');
    var pauseBtn = root.querySelector('.book-slider-pause');
    var dotsContainer = root.querySelector('.book-slider-dots');
    var viewport = root.querySelector('.book-slider-viewport');

    if (!track || !slides.length || !prevBtn || !nextBtn || !pauseBtn || !dotsContainer || !viewport) {
      return null; // required pieces missing; bail out quietly
    }

    var prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Continuous loop: a full set of cloned slides sits on each side of
    // the real ones ([clones][real][clones]). `position` indexes into
    // that whole row; the real slides occupy positions n..2n-1. When a
    // move lands in the clones, we wait for the slide animation to
    // finish and then silently jump (no transition) to the matching
    // real slide, so book 1 always appears right after book 10.
    var n = slides.length;
    var clones = [];

    function makeClone(slide) {
      var clone = slide.cloneNode(true);
      clone.removeAttribute('data-slide');
      clone.setAttribute('data-slide-clone', '');
      clone.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(clone.querySelectorAll('a, button'), function (el) {
        el.setAttribute('tabindex', '-1');
      });
      clones.push(clone);
      return clone;
    }

    slides.forEach(function (slide) {
      track.appendChild(makeClone(slide));
    });
    slides.slice().reverse().forEach(function (slide) {
      track.insertBefore(makeClone(slide), track.firstChild);
    });

    var position = n;
    var current = 0;
    var autoplayId = null;
    var manuallyPaused = false;
    var AUTOPLAY_DELAY = 6000;

    dotsContainer.innerHTML = '';
    var dots = [];

    slides.forEach(function (slide, i) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to book ' + (i + 1) + ' of ' + slides.length);
      dot.addEventListener('click', onDotClick(i));
      dotsContainer.appendChild(dot);
      dots.push(dot);
    });

    function onDotClick(i) {
      return function () {
        goTo(i);
        restartAutoplayIfRunning();
      };
    }

    function getVisibleCount() {
      // Measures the ACTUAL rendered widths instead of guessing from
      // window.innerWidth. The previous version assumed 3 slides are
      // visible on any desktop-width window, which is only true for this
      // slider's other, standalone placement -- nested inside .welcome,
      // CSS forces every slide to 100% width regardless of window size,
      // and the old guess-based version had no way to know that, causing
      // the track's translateX math to not match each slide's real
      // width (visible as partial/overlapping slides, or the whole
      // slider appearing oversized and misaligned).
      if (!viewport || !slides.length) return 1;
      var viewportWidth = viewport.getBoundingClientRect().width;
      var slideWidth = slides[0].getBoundingClientRect().width;
      if (!slideWidth) return 1;
      var count = Math.round(viewportWidth / slideWidth);
      return Math.max(1, count);
    }

    function update() {
      var percentPerSlide = 100 / getVisibleCount();
      track.style.transform = 'translateX(' + (position * -percentPerSlide) + '%)';
      current = ((position - n) % n + n) % n;
      dots.forEach(function (dot, i) {
        if (i === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    // If we're sitting on a clone, jump to the identical real slide
    // with the transition switched off so the swap is invisible.
    function snapToReal() {
      if (position >= n && position < 2 * n) return;
      jumpTo(n + current);
    }

    function jumpTo(newPosition) {
      position = newPosition;
      track.style.transition = 'none';
      update();
      void track.offsetWidth; // force reflow so the jump isn't animated
      track.style.transition = '';
    }

    function onTransitionEnd(e) {
      if (e.target === track && e.propertyName === 'transform') snapToReal();
    }
    track.addEventListener('transitionend', onTransitionEnd);

    function step(delta) {
      snapToReal(); // in case a rapid click arrived mid-animation
      position += delta;
      update();
      if (prefersReducedMotion) snapToReal(); // no transition, so no transitionend
    }

    function goTo(index) {
      snapToReal();
      position = n + index;
      update();
    }

    function next() {
      step(1);
    }

    function prev() {
      step(-1);
    }

    function onPrevClick() {
      prev();
      restartAutoplayIfRunning();
    }

    function onNextClick() {
      next();
      restartAutoplayIfRunning();
    }

    // Keyboard users can Tab to any of the real slides, including ones
    // currently scrolled out of view. Bring a focused slide into view by
    // moving the track, and undo the browser's own attempt to reveal it
    // by scrolling the overflow:hidden viewport (which would otherwise
    // knock the track out of line with our translateX math).
    function onViewportScroll() {
      viewport.scrollLeft = 0;
    }
    viewport.addEventListener('scroll', onViewportScroll);

    function onSlideFocus(e) {
      var slide = e.target.closest('[data-slide]');
      if (!slide) return;
      viewport.scrollLeft = 0;
      var i = slides.indexOf(slide);
      var visible = getVisibleCount();
      function isVisible(p) {
        return p >= position && p < position + visible;
      }
      if (isVisible(n + i)) return;
      // If a clone of this slide is what's showing, swap invisibly to
      // the real set so the focused (real) slide sits in the same spot.
      if (isVisible(2 * n + i)) jumpTo(position - n);
      else if (isVisible(i)) jumpTo(position + n);
      else goTo(i);
    }
    track.addEventListener('focusin', onSlideFocus);

    prevBtn.addEventListener('click', onPrevClick);
    nextBtn.addEventListener('click', onNextClick);

    function onKeydown(e) {
      if (e.key === 'ArrowLeft') {
        prev();
        restartAutoplayIfRunning();
      } else if (e.key === 'ArrowRight') {
        next();
        restartAutoplayIfRunning();
      }
    }
    root.addEventListener('keydown', onKeydown);

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayId = window.setInterval(next, AUTOPLAY_DELAY);
      pauseBtn.textContent = 'Pause';
      // Don't announce every automatic rotation to screen readers...
      viewport.setAttribute('aria-live', 'off');
    }

    function stopAutoplay() {
      if (autoplayId) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
      // ...but do announce slide changes the visitor makes themselves.
      viewport.setAttribute('aria-live', 'polite');
    }

    function restartAutoplayIfRunning() {
      if (autoplayId) startAutoplay();
    }

    function onPauseClick() {
      if (autoplayId) {
        stopAutoplay();
        manuallyPaused = true;
        pauseBtn.textContent = 'Play';
      } else {
        manuallyPaused = false;
        startAutoplay();
      }
    }
    pauseBtn.addEventListener('click', onPauseClick);

    function onMouseEnter() {
      stopAutoplay();
    }
    function onMouseLeave() {
      if (!manuallyPaused) startAutoplay();
    }
    function onFocusIn() {
      stopAutoplay();
    }
    function onFocusOut() {
      if (!manuallyPaused) startAutoplay();
    }

    root.addEventListener('mouseenter', onMouseEnter);
    root.addEventListener('mouseleave', onMouseLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);

    function onResize() {
      update();
    }
    window.addEventListener('resize', onResize);

    update();
    if (!prefersReducedMotion) {
      startAutoplay();
    } else {
      pauseBtn.textContent = 'Play';
      viewport.setAttribute('aria-live', 'polite');
    }

    return {
      destroy: function () {
        stopAutoplay();
        prevBtn.removeEventListener('click', onPrevClick);
        nextBtn.removeEventListener('click', onNextClick);
        pauseBtn.removeEventListener('click', onPauseClick);
        root.removeEventListener('keydown', onKeydown);
        root.removeEventListener('mouseenter', onMouseEnter);
        root.removeEventListener('mouseleave', onMouseLeave);
        root.removeEventListener('focusin', onFocusIn);
        root.removeEventListener('focusout', onFocusOut);
        window.removeEventListener('resize', onResize);
        track.removeEventListener('transitionend', onTransitionEnd);
        track.removeEventListener('focusin', onSlideFocus);
        viewport.removeEventListener('scroll', onViewportScroll);
        clones.forEach(function (clone) {
          if (clone.parentNode) clone.parentNode.removeChild(clone);
        });
        delete root.dataset.sliderInitialized;
      }
    };
  }

  // Try immediately in case the homepage is already in the DOM when this
  // script runs...
  trySetup();

  // ...and keep watching afterward, since NDE's Angular router can mount
  // and unmount the homepage (and this slider) without a full reload.
  var observer = new MutationObserver(function () {
    trySetup();
    tryTeardown();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

/* ============================================================
   Featured Collection card — content
   ============================================================
   Pulls the featured collection card's content from a public GitHub
   markdown file:

     https://github.com/kellyekh/homepage-content/blob/main/featured-collection.md

   ...fetched via its CORS-enabled "raw" URL (GitHub caches it for about
   5 minutes, so edits can take that long to show up).

   The card markup in homepage_en.html stays fully populated as a
   fallback. This script only overwrites it once the file has loaded
   AND every required field is present and valid -- otherwise it leaves
   the fallback alone and logs why to the console. It's all-or-nothing
   on purpose, so the card never mixes an old link with a new title.

   Expected format (see the comment at the top of the .md file):
     ## Title
     image: https://...      (required)
     alt: ...                (optional, defaults to title)
     link: https://...       (required)
     cta: ...                (optional, keeps the HTML's text)
     Description as plain text (required)

   Everything is inserted with textContent / setAttribute, never as HTML,
   so nothing in the markdown file can inject markup or scripts.

   Same SPA caveat as the slider above: the homepage can remount without
   a full reload, so a MutationObserver re-applies the content to each
   new copy of the card. The parsed result is cached so remounts don't
   refetch. */

(function () {
  var RAW_FEATURED_URL = 'https://raw.githubusercontent.com/kellyekh/homepage-content/main/featured-collection.md';

  var featuredPromise = null;

  function parseFeaturedMarkdown(text) {
    // Drop HTML comments (the editing guide), then everything before the
    // first "## " heading, and anything from a second heading onward.
    var cleaned = text.replace(/<!--[\s\S]*?-->/g, '');
    var blocks = cleaned.split(/^##\s+/m);
    if (blocks.length < 2) {
      throw new Error('no "## Title" heading found');
    }

    var lines = blocks[1].split('\n');
    var data = { title: lines[0].trim(), image: '', alt: '', link: '', cta: '' };
    var descriptionLines = [];

    lines.slice(1).forEach(function (line) {
      var fieldMatch = line.match(/^\s*(image|alt|link|cta):\s*(.*?)\s*$/i);
      if (fieldMatch) {
        data[fieldMatch[1].toLowerCase()] = fieldMatch[2];
      } else if (line.trim()) {
        descriptionLines.push(line.trim());
      }
    });
    data.description = descriptionLines.join(' ');

    var missing = ['title', 'image', 'link', 'description'].filter(function (key) {
      return !data[key];
    });
    if (missing.length) {
      throw new Error('missing required field(s): ' + missing.join(', '));
    }
    ['image', 'link'].forEach(function (key) {
      if (!/^https:\/\//i.test(data[key])) {
        throw new Error('"' + key + '" must start with https:// (got "' + data[key] + '")');
      }
    });

    return data;
  }

  function loadFeatured() {
    if (!featuredPromise) {
      featuredPromise = fetch(RAW_FEATURED_URL)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('fetch failed with status ' + response.status);
          }
          return response.text();
        })
        .then(parseFeaturedMarkdown);

      // Don't cache failures -- let the next remount try again.
      featuredPromise.catch(function () {
        featuredPromise = null;
      });
    }
    return featuredPromise;
  }

  function applyFeatured(card, data) {
    var link = card.querySelector('.featured-collection-link');
    var image = card.querySelector('.featured-collection-image');
    var title = card.querySelector('.featured-collection-title');
    var description = card.querySelector('.featured-collection-description');
    var cta = card.querySelector('.featured-collection-cta');

    if (link) link.setAttribute('href', data.link);
    if (image) {
      image.setAttribute('src', data.image);
      image.setAttribute('alt', data.alt || data.title);
    }
    if (title) title.textContent = data.title;
    if (description) description.textContent = data.description;
    if (cta && data.cta) cta.textContent = data.cta;
  }

  function trySetup() {
    var card = document.querySelector('.featured-collection-card');
    if (!card || card.dataset.featuredInitialized === 'true') return;
    card.dataset.featuredInitialized = 'true';

    loadFeatured()
      .then(function (data) {
        applyFeatured(card, data);
      })
      .catch(function (err) {
        // Leave the HTML fallback content in place.
        console.error('Featured collection: could not load featured-collection.md, keeping fallback content —', err.message || err);
      });
  }

  trySetup();

  var observer = new MutationObserver(trySetup);
  observer.observe(document.body, { childList: true, subtree: true });
})();

/* ============================================================
   Full record — "Report Harmful Language" link wording
   ============================================================
   The consortium (CCC Libraries) adds a "Report Harmful Language"
   link to the Links section of every full record, with a note under
   it. That link isn't in our package or our Alma config, so we can't
   change its label there. Instead this rewrites the text after NDE
   renders it, keeping both URLs as they are:

     If you have found a harmful term or phrase in one of our records,
     please [report it to the Harmful Language Review work group].
     [Learn more about their process].

   The form link is found by its URL, so if CCC Libraries ever moves
   the form, this quietly stops matching and the original text shows.

   Same SPA caveat as above: NDE can re-render the record without a
   full reload, so a MutationObserver re-applies the wording. Each step
   only writes when the text differs, so it doesn't retrigger itself. */

(function () {
  var FORM_URL_PART = 'ccclibraries.libwizard.com/f/report_harmful_language';
  var WORK_GROUP_URL = 'https://ccclibraries.org/lsp/DEIAA/HLR';
  var INTRO_TEXT = 'If you have found a harmful term or phrase in one of our records, please';
  var LINK_TEXT = 'report it to the Harmful Language Review work group';

  function rewrite(formLink) {
    var container = formLink.parentElement;
    if (!container) return;

    var label = formLink.querySelector('span');
    if (label && label.textContent !== LINK_TEXT) label.textContent = LINK_TEXT;

    var ariaLabel = LINK_TEXT.charAt(0).toUpperCase() + LINK_TEXT.slice(1) + ' Open a link in a new tab';
    if (formLink.getAttribute('aria-label') !== ariaLabel) formLink.setAttribute('aria-label', ariaLabel);

    // The note renders before the link, so it becomes the sentence's intro.
    var note = container.querySelector('.link-public-note');
    if (note && note.textContent !== INTRO_TEXT) note.textContent = INTRO_TEXT;

    if (!container.querySelector('.harmful-language-learn-more')) {
      var tail = document.createElement('span');
      tail.className = 'harmful-language-learn-more';
      var learnMore = document.createElement('a');
      learnMore.href = WORK_GROUP_URL;
      learnMore.target = '_blank';
      learnMore.rel = 'noopener';
      learnMore.textContent = 'Learn more about their process';
      learnMore.setAttribute('aria-label', 'Learn more about their process Open a link in a new tab');
      tail.append('. ', learnMore, '.');
      formLink.after(tail);
    }
  }

  function trySetup() {
    var links = document.querySelectorAll('nde-full-display-links a[href*="' + FORM_URL_PART + '"]');
    for (var i = 0; i < links.length; i++) rewrite(links[i]);
  }

  trySetup();

  var observer = new MutationObserver(trySetup);
  observer.observe(document.body, { childList: true, subtree: true });
})();

/* ============================================================
   Full record — "Check for Online Access" steps in Requests
   ============================================================
   When a record's availability is "Check for Online Access", adds two
   step cards to the Requests section, signed in or not:

     Didn't find what you need online?
     STEP 1  Search Google Scholar for availability    [Search Google Scholar]
     STEP 2  Request it from another library           [Open ILL Form]

   The Google Scholar link searches the record's title (read from the
   availability button's aria-label, "Check for Online Access (Title)").
   Signed in, NDE also shows our nde.request.noRequests label with the
   same steps as plain text; that copy is hidden so they don't double up.

   Same SPA caveat as above: a MutationObserver re-applies the cards when
   NDE re-renders the record, and removes them if the status changes. */

(function () {
  var STATUS_TEXT = 'Check for Online Access';
  var INTRO_TEXT = "Didn't find what you need online?";
  var SCHOLAR_URL = 'https://scholar.google.com/scholar';
  var ILL_URL = 'https://www.hancockcollege.edu/library/request-a-book.php';
  var NEW_TAB_ICON = '<svg viewBox="0 -960 960 960" aria-hidden="true" focusable="false"><path d="m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z"></path></svg>';

  function recordTitle(statusButton) {
    var match = (statusButton && statusButton.getAttribute('aria-label') || '').match(/\((.*)\)\s*$/);
    return match ? match[1] : '';
  }

  function buildStep(number, title, description, linkText, href) {
    var step = document.createElement('div');
    step.className = 'ahc-online-step';

    var text = document.createElement('div');
    text.className = 'ahc-online-step-text';
    var heading = document.createElement('div');
    heading.className = 'ahc-online-step-title';
    var label = document.createElement('span');
    label.className = 'ahc-online-step-number';
    label.textContent = 'STEP ' + number + ':';
    heading.append(label, ' ' + title);
    var desc = document.createElement('div');
    desc.className = 'ahc-online-step-description';
    desc.textContent = description;
    text.append(heading, desc);

    var link = document.createElement('a');
    link.className = 'ahc-online-step-button';
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Step ' + number + ': ' + linkText + ' Opens in a new tab');
    link.innerHTML = '<span></span>' + NEW_TAB_ICON;
    link.firstChild.textContent = linkText;

    step.append(text, link);
    return step;
  }

  function buildSteps(title) {
    var scholarHref = title
      ? SCHOLAR_URL + '?as_q=' + encodeURIComponent('"' + title + '"')
      : SCHOLAR_URL.replace('/scholar', '/');

    var wrap = document.createElement('div');
    wrap.className = 'ahc-online-steps';
    var intro = document.createElement('p');
    intro.className = 'ahc-online-steps-intro';
    intro.textContent = INTRO_TEXT;
    wrap.append(
      intro,
      buildStep(1, 'Search Google Scholar for availability.',
        'If there are no results there, go to Step 2.',
        'Search Google Scholar', scholarHref),
      buildStep(2, 'Request it from another library.',
        'Fill out our Interlibrary Loan (ILL) form to request a copy.',
        'Open ILL Form', ILL_URL)
    );
    return wrap;
  }

  // Hides NDE's plain-text copy of the steps (the noRequests label,
  // shown signed in) without touching anything else in Requests.
  function hideLabelCopy(requests) {
    var nodes = requests.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.closest('.ahc-online-steps') || el.querySelector('nde-request-card, .ahc-online-steps')) continue;
      var text = el.textContent.trim();
      if (text.indexOf(INTRO_TEXT) === 0 && /STEP\s*2/i.test(text)) {
        (el.closest('nde-notification') || el).classList.add('ahc-online-steps-hidden');
      }
    }
  }

  function trySetup() {
    var requests = document.querySelector('nde-requests');
    if (!requests) return;

    var statusCode = document.querySelector('nde-record-availability .availability-code');
    var matches = statusCode && statusCode.textContent.trim() === STATUS_TEXT;
    var existing = requests.querySelector('.ahc-online-steps');

    if (!matches) {
      if (existing) existing.remove();
      return;
    }

    hideLabelCopy(requests);
    if (!existing) requests.append(buildSteps(recordTitle(statusCode.closest('button'))));
  }

  trySetup();

  var observer = new MutationObserver(trySetup);
  observer.observe(document.body, { childList: true, subtree: true });
})();

/* ============================================================
   Full record — "No available request options" notice in Requests
   ============================================================
   Signed in, NDE shows our nde.request.noRequests label when a record
   has nothing to request at the title level. Copies can still be
   requestable item by item (View Items under Locations), so the label's
   "No available request options" is misleading. This hides NDE's
   message and adds our own notice after it, styled like the sign-in
   notice. The wording depends on how many copies the Locations section
   lists. Some locations read "(N copies, N available, N requests)";
   ones without that summary are counted as one copy:

     2+ copies:  There are no request options for this title as a whole,
                 but some copies may still be requestable -- open View
                 Items under Locations above to check.
     1 copy:     There are no request options for this item right now.
                 See its status under Locations above.
     0 / online: There are no request options for this item.
                 (no copies, or no Locations section at all)
     + always:   If you believe there is an error, please [let us know].

   Locations can render after Requests, so the wording is re-checked on
   every pass and updated if the count changes.

   NDE's message is a translate="nde.request.noRequests" element, and
   NDE's translate directive keeps resetting its text from the label --
   so rather than rewriting it, we hide it and leave it alone. It's
   found by its data-qa attribute, so the label's wording in Alma
   doesn't matter here; the wording people see comes from the NOTICE_*
   constants.

   "let us know" opens NDE's own Give Us Feedback dialog (the same one
   as the report-a-problem button in the corner) by clicking that
   button. If the button isn't on the page, the link falls back to our
   Ask a Librarian page.

   Same SPA caveat as above: a MutationObserver re-applies it when NDE
   re-renders the record, and removes our notice if NDE's goes away. */

(function () {
  var NDE_MESSAGE = '[data-qa="nde.request.noRequests"]';
  var NOTICE_MANY_COPIES = 'There are no request options for this title as a whole, ' +
    'but some copies may still be requestable \u2014 open View Items under Locations above to check.';
  var NOTICE_ONE_COPY = 'There are no request options for this item right now. ' +
    'See its status under Locations above.';
  var NOTICE_NONE = 'There are no request options for this item.';
  var CHAT_URL = 'https://www.hancockcollege.edu/library/ask-a-librarian.php';
  var FEEDBACK_BUTTON = 'button[data-qa="report_a_problem_button"]';

  // Copies across every location on the record, read from each
  // location's "(N copies, ...)" summary. A location without that
  // summary counts as one copy. 0 when there's no Locations section
  // (online resources).
  function copyCount() {
    var total = 0;
    var locations = document.querySelectorAll('nde-location');
    for (var i = 0; i < locations.length; i++) {
      var match = locations[i].textContent.match(/\((\d+)\s+cop(?:y|ies)\b/i);
      total += match ? parseInt(match[1], 10) : 1;
    }
    return total;
  }

  function noticeText() {
    var copies = copyCount();
    if (copies > 1) return NOTICE_MANY_COPIES;
    if (copies === 1) return NOTICE_ONE_COPY;
    return NOTICE_NONE;
  }

  function buildNotice() {
    var notice = document.createElement('div');
    notice.className = 'ahc-no-requests';

    var text = document.createElement('div');
    text.className = 'ahc-no-requests-text';

    var help = document.createElement('div');
    help.className = 'ahc-no-requests-help';
    var link = document.createElement('a');
    link.href = CHAT_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'let us know';
    link.setAttribute('aria-label', 'Let us know: open the Give Us Feedback form');
    link.addEventListener('click', function (event) {
      var feedbackButton = document.querySelector(FEEDBACK_BUTTON);
      if (!feedbackButton) return;
      event.preventDefault();
      feedbackButton.click();
    });
    help.append('If you believe there is an error, please ', link, '.');

    notice.append(text, help);
    return notice;
  }

  function trySetup() {
    var requests = document.querySelector('nde-requests');
    if (!requests) return;

    var message = requests.querySelector(NDE_MESSAGE);
    var notice = requests.querySelector('.ahc-no-requests');

    if (!message) {
      if (notice) notice.remove();
      return;
    }

    message.classList.add('ahc-no-requests-original');
    if (!notice) {
      notice = buildNotice();
      message.after(notice);
    }

    // Only write when the wording changes, so the observer doesn't loop.
    var text = notice.querySelector('.ahc-no-requests-text');
    var wanted = noticeText();
    if (text.textContent !== wanted) text.textContent = wanted;
  }

  trySetup();

  var observer = new MutationObserver(trySetup);
  observer.observe(document.body, { childList: true, subtree: true });
})();
