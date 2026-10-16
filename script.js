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

  /* ---------- plumbline scroll progress ---------- */
  var plumbFill = document.getElementById('plumbFill');
  var blueprint = document.querySelector('.blueprint');
  var heroSection = document.querySelector('.hero--video');
  var heroCopy = document.getElementById('heroCopy');
  var heroVideo = document.getElementById('heroVideo');

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
    plumbFill.style.height = pct + '%';

    if(!reduceMotion){
      if(blueprint){
        blueprint.style.transform = 'translateY(' + (scrollTop * 0.08) + 'px)';
      }

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
