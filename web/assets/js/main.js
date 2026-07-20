/* MatlGroup — interakce: plynulé kotvy, hover styly, reveal on scroll, count-up */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* kotvy v menu: plynule sroluj, ale nezapisuj #sekci do URL — refresh pak zůstane nahoře */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href').slice(1);
      if(!id) return;
      var target = document.getElementById(id);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
      history.replaceState(null, '', location.pathname + location.search);
    });
  });
  /* pokud stránka přijde s #sekcí v URL (starý odkaz), zahoď ji a začni nahoře */
  if(location.hash){
    history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo({top:0, behavior:'instant'});
  }

  /* style-hover -> apply inline styles on hover (faithful to design) */
  document.querySelectorAll('[style-hover]').forEach(function(el){
    var base = el.getAttribute('style') || '';
    var hover = el.getAttribute('style-hover');
    el.addEventListener('mouseenter', function(){ el.setAttribute('style', base + ';' + hover); });
    el.addEventListener('mouseleave', function(){ el.setAttribute('style', base); });
  });

  /* reveal on scroll — s pojistkou, aby obsah nikdy nezůstal skrytý */
  if (!reduce && 'IntersectionObserver' in window){
    var map = {'':'mgRevealUp','left':'mgRevealLeft','right':'mgRevealRight'};
    var items = document.querySelectorAll('[data-reveal]');
    function show(el){
      if(el.dataset.revealed) return;
      el.dataset.revealed='1';
      var dir = el.getAttribute('data-reveal');
      el.style.opacity='';
      el.style.animation = (map[dir]||'mgRevealUp') + ' .7s cubic-bezier(.22,1,.36,1) both';
    }
    items.forEach(function(el){ el.style.opacity='0'; });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target); } });
    }, {threshold:0, rootMargin:'0px 0px -8% 0px'});
    items.forEach(function(el){ io.observe(el); });
    // pojistka: cokoli neodhaleného (rychlý scroll, skok na kotvu) po 2 s zobraz
    setTimeout(function(){ items.forEach(function(el){ if(!el.dataset.revealed){ el.style.opacity=''; el.style.animation=''; el.dataset.revealed='1'; io.unobserve(el);} }); }, 2000);
  }

  /* hero lines stagger */
  if (!reduce){
    document.querySelectorAll('[data-heroline]').forEach(function(el,i){
      el.style.animation='mgHeroLine .8s cubic-bezier(.22,1,.36,1) both';
      el.style.animationDelay=(.08*i)+'s';
    });
  }

  /* count-up for statistics */
  if (!reduce && 'IntersectionObserver' in window){
    var nums = document.querySelectorAll('[data-cnum]');
    var io2 = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var el = e.target, target = parseInt(el.getAttribute('data-cnum'),10), t0=null;
        function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/1100,1);
          el.textContent = Math.round(target*(1-Math.pow(1-p,3))).toString();
          if(p<1) requestAnimationFrame(step); }
        requestAnimationFrame(step); io2.unobserve(el);
      });
    }, {threshold:.5});
    nums.forEach(function(el){ io2.observe(el); });
  }

  /* --- načítání fotek s loaderem + lazy-load (šetří server u velké galerie) ---
     Do markupu stačí:  <img class="img-load" data-src="foto.jpg" alt="..."
                             style="width:100%;height:100%;object-fit:cover;">  uvnitř .img-slot
     JS sám vloží loader (logo + záblesk), fotku stáhne až když se blíží do viewportu,
     a po načtení loader plynule schová a fotku odkryje. */
  var MG_LOGO = 'assets/media/e50ef4c6-83f6-4ae4-a96a-efd81e74224e.png';
  function mgBuildLoader(){
    var l = document.createElement('div');
    l.className = 'mg-loader';
    l.innerHTML =
      '<div class="mg-loader__grid"></div>' +
      '<div class="mg-loader__scan"></div>' +
      '<div class="mg-logo" style="--logo:url(\'' + MG_LOGO + '\')">' +
        '<img src="' + MG_LOGO + '" alt="">' +
        '<div class="mg-logo__shine"></div>' +
      '</div>';
    return l;
  }
  function mgLoadImg(img){
    var slot = img.closest('.img-slot') || img.parentElement;
    if(slot && getComputedStyle(slot).position === 'static'){ slot.style.position = 'relative'; }
    var loader = mgBuildLoader();
    if(slot){ slot.appendChild(loader); }
    img.addEventListener('load', function(){
      img.classList.add('is-loaded');
      if(loader){ loader.classList.add('is-done'); setTimeout(function(){ loader.remove(); }, 500); }
    });
    img.addEventListener('error', function(){ if(loader){ loader.remove(); } });
    img.src = img.getAttribute('data-src');
    img.removeAttribute('data-src');
  }
  var lazyImgs = document.querySelectorAll('img.img-load[data-src]');
  if(lazyImgs.length){
    if('IntersectionObserver' in window){
      var ioImg = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ mgLoadImg(e.target); ioImg.unobserve(e.target); } });
      }, {rootMargin:'250px 0px'});   // začni stahovat ~250px před vstupem do view
      lazyImgs.forEach(function(img){ ioImg.observe(img); });
    } else {
      lazyImgs.forEach(mgLoadImg);   // starý prohlížeč: načti rovnou
    }
  }
})();
