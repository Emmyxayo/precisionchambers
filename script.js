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
  var scaleRig = document.getElementById('scaleRig');
  var scaleBeam = document.getElementById('scaleBeam');
  var blueprint = document.querySelector('.blueprint');
  var heroBgImg = document.querySelector('.hero__bg img');
  var heroEl = document.querySelector('.hero');

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function onScroll(){
    onHeaderScroll();

    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (scrollTop / max) * 100 : 0;
    plumbFill.style.height = pct + '%';

    if(!reduceMotion){
      /* hero-linked 3D scale + blueprint parallax, only while hero is in view */
      var heroH = heroEl.offsetHeight;
      var heroProgress = clamp(scrollTop / (heroH * 0.9), 0, 1);

      if(scaleRig){
        var ry = -18 + heroProgress * 18;      // settles from -18deg to 0deg
        var rx = 6 - heroProgress * 6;
        scaleRig.style.transform = 'rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
      }
      if(scaleBeam){
        var tilt = -6 + heroProgress * 6;      // beam levels out as you scroll/settle
        scaleBeam.style.setProperty('--tilt', tilt + 'deg');
      }
      if(blueprint){
        blueprint.style.transform = 'translateY(' + (scrollTop * 0.08) + 'px)';
      }
      if(heroBgImg){
        heroBgImg.style.transform = 'scale(1.08) translateY(' + (scrollTop * 0.04) + 'px)';
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
