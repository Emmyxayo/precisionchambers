(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  function onHeaderScroll(){
    if(window.scrollY > 30){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
  }
  onHeaderScroll();

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');
  navToggle.addEventListener('click', function(){
    var open = navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navMobile.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- scroll rail progress ---------- */
  var railFill = document.getElementById('railFill');
  var blueprint = document.querySelector('.blueprint');
  var heroSection = document.querySelector('.hero--video');
  var heroCopy = document.getElementById('heroCopy');
  var heroVideo = document.getElementById('heroVideo');
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  /* ---------- hero video: scroll scrubs playback ---------- */
  var videoReady = false;
  var videoDuration = 0;
  if(heroVideo){
    heroVideo.addEventListener('loadedmetadata', function(){
      videoDuration = heroVideo.duration || 0;
      if(reduceMotion){
        /* respect reduced motion: hold on the poster frame, no autoplay/scrub */
        heroVideo.pause();
        heroVideo.currentTime = 0;
        return;
      }
      if(videoDuration){
        /* "unlock" seeking on mobile Safari, then hand control to scroll */
        var p = heroVideo.play();
        if(p && p.then){
          p.then(function(){ heroVideo.pause(); videoReady = true; }).catch(function(){ videoReady = true; });
        } else {
          heroVideo.pause();
          videoReady = true;
        }
      }
    });
    if(heroVideo.readyState >= 1){
      videoDuration = heroVideo.duration || 0;
      videoReady = !reduceMotion && !!videoDuration;
      if(videoReady) heroVideo.pause();
    }
  }

  function onScroll(){
    onHeaderScroll();

    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (scrollTop / max) * 100 : 0;
    if(railFill) railFill.style.height = pct + '%';

    if(!reduceMotion){
      if(blueprint){
        blueprint.style.transform = 'translateY(' + (scrollTop * 0.08) + 'px)';
      }

      /* parallax: images drift opposite the scroll as they cross the viewport */
      parallaxEls.forEach(function(img){
        var rect = img.getBoundingClientRect();
        if(rect.bottom < -200 || rect.top > window.innerHeight + 200) return; // skip offscreen work
        var factor = parseFloat(img.getAttribute('data-parallax')) || 0.1;
        var centerDelta = (rect.top + rect.height / 2) - window.innerHeight / 2;
        var shift = clamp(centerDelta * factor * -1, -40, 40);
        img.style.transform = 'translateY(' + (-30 + shift) + 'px)';
      });

      if(heroSection){
        var heroH = heroSection.offsetHeight;
        var scrollable = heroH - window.innerHeight;
        var heroProgress = scrollable > 0 ? clamp(scrollTop / scrollable, 0, 1) : 0;

        /* scrub the bronze-scales footage frame-by-frame with scroll position */
        if(videoReady && videoDuration){
          heroVideo.currentTime = heroProgress * videoDuration;
        }

        /* hero copy eases back and fades slightly as the scale finishes assembling */
        if(heroCopy){
          var settleP = clamp((heroProgress - 0.6) / 0.4, 0, 1); // recede over the final 40%
          var copyOpacity = clamp(1 - settleP * 0.85, 0.15, 1);
          var copyY = settleP * -36;
          heroCopy.style.opacity = copyOpacity;
          heroCopy.style.transform = 'translateY(' + copyY + 'px)';
        }
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.16, rootMargin:'0px 0px -8% 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- section tracking: rail dots + header nav active state ---------- */
  var railLinks = document.querySelectorAll('.rail__dots a[data-rail]');
  var navLinks = document.querySelectorAll('#primaryNav a[data-nav]');
  var trackedSections = Array.prototype.slice.call(
    document.querySelectorAll('#top, #about, #services, #why, #commitment, #offices, #contact')
  );

  if('IntersectionObserver' in window && trackedSections.length){
    var sectionIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        var id = entry.target.id;
        railLinks.forEach(function(a){
          a.classList.toggle('active', a.getAttribute('data-rail') === id);
        });
        navLinks.forEach(function(a){
          a.classList.toggle('active', a.getAttribute('data-nav') === id);
        });
      });
    }, { rootMargin:'-45% 0px -45% 0px', threshold:0 });
    trackedSections.forEach(function(el){ sectionIO.observe(el); });
  }

  /* ---------- stat count-up ---------- */
  var statNums = document.querySelectorAll('.stat__num[data-count]');
  if(statNums.length && 'IntersectionObserver' in window){
    var statIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        statIO.unobserve(el);
        if(reduceMotion){ el.textContent = target; return; }
        var start = null;
        var duration = 1100;
        function step(ts){
          if(start === null) start = ts;
          var p = clamp((ts - start) / duration, 0, 1);
          var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          el.textContent = Math.round(eased * target);
          if(p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold:0.6 });
    statNums.forEach(function(el){ statIO.observe(el); });
  }

  /* ---------- 3D tilt on service cards ---------- */
  if(!reduceMotion && window.matchMedia('(hover: hover)').matches){
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      var rect;
      card.addEventListener('mouseenter', function(){ rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', function(e){
        if(!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;   // 0..1
        var py = (e.clientY - rect.top) / rect.height;   // 0..1
        var ry = (px - 0.5) * 14;   // rotateY
        var rx = (0.5 - py) * 14;   // rotateX
        card.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(6px)';
      });
      card.addEventListener('mouseleave', function(){
        card.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  }

  /* ---------- seal ring subtle 3D spin on scroll into view ---------- */
  var sealRing = document.querySelector('.seal__ring');
  if(sealRing && 'IntersectionObserver' in window && !reduceMotion){
    var sealIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          sealRing.style.transition = 'transform 1.1s cubic-bezier(.22,.61,.36,1)';
          sealRing.style.transform = 'rotateY(360deg)';
        }
      });
    }, { threshold:0.5 });
    sealIO.observe(sealRing);
  }

})();
