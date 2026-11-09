/* WhatsApp: put the clinic number here in international format without "+", e.g. "77011234567" */
var WA_NUMBER = "";
var WA_TEXT = {kk:"Сәлем! Қабылдауға жазылғым келеді.", ru:"Здравствуйте! Хочу записаться на приём."};
function applyLang(l){
  l = l === 'ru' ? 'ru' : 'kk';
  document.documentElement.dataset.lang = l;
  document.documentElement.lang = l;
  document.querySelectorAll('[data-set-lang]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.setLang === l)); });
  var href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(WA_TEXT[l]);
  document.querySelectorAll('[data-wa]').forEach(function(a){ a.href = href; });
  document.querySelectorAll('.card-form option').forEach(function(o){ o.textContent = o.dataset[l]; });
  refreshBook(l);
}
var MSG_TPL = {
  kk: function(n,p,s,t){ return 'Сәлем! Қабылдауға жазылғым келеді.' + (n?' Атым: '+n+'.':'') + ' Қызмет: '+s+'. Ыңғайлы уақыт: '+t+'.' + (p?' Телефоным: '+p+'.':''); },
  ru: function(n,p,s,t){ return 'Здравствуйте! Хочу записаться на приём.' + (n?' Меня зовут '+n+'.':'') + ' Услуга: '+s+'. Удобное время: '+t+'.' + (p?' Мой телефон: '+p+'.':''); }
};
function refreshBook(l){
  l = l || document.documentElement.dataset.lang || 'kk';
  var f = document.getElementById('bookForm'); if(!f) return;
  var txt = MSG_TPL[l](f.bName.value.trim(), f.bPhone.value.trim(), f.bSvc.selectedOptions[0].dataset[l], f.bTime.selectedOptions[0].dataset[l]);
  document.getElementById('bMsg').textContent = txt;
  document.getElementById('bSend').href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(txt);
}
document.getElementById('bookForm').addEventListener('input', function(){ refreshBook(); });
document.getElementById('bookForm').addEventListener('submit', function(e){ e.preventDefault(); });
document.querySelectorAll('[data-set-lang]').forEach(function(b){
  b.addEventListener('click', function(){
    applyLang(b.dataset.setLang);
    try{ localStorage.setItem('lsp-lang', b.dataset.setLang); }catch(e){}
  });
});
applyLang(document.documentElement.dataset.lang);

/* Map: put the clinic coordinates here (right-click the place on 2GIS / Google Maps to copy them) */
var MAP_LAT = 42.3417, MAP_LON = 69.5901;   /* Shymkent centre until exact coordinates are set */
(function(){
  var f = document.getElementById('mapFrame'); if(!f) return;
  var d = 0.006;
  f.src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + [MAP_LON-d*1.6, MAP_LAT-d, MAP_LON+d*1.6, MAP_LAT+d].join('%2C') + '&layer=mapnik&marker=' + MAP_LAT + '%2C' + MAP_LON;
  var box = document.getElementById('mapBox');
  document.getElementById('mapLock').addEventListener('click', function(){ box.classList.add('active'); });
})();

/* ===== motion ===== */
(function(){
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden','true'); document.body.appendChild(bar);

  /* scroll reveal with stagger */
  var groups = [
    ['.principles .pr', 'rv'], ['.svc article', 'rv'], ['.gal figure', 'rv-z'], ['.steps li', 'rv'], ['.cards .card', 'rv'],
    ['.head', 'rv'], ['.clinic-text', 'rv-l'], ['.doctor-photo', 'rv-l'], ['.doctor-grid > div:last-child', 'rv-r'],
    ['.card-form', 'rv-r'], ['details', 'rv'], ['.map', 'rv-z']
  ];
  var items = [];
  var narrow = window.matchMedia && matchMedia('(max-width: 900px)').matches;
  groups.forEach(function(g){
    if (narrow && g[0] === '.gal figure') return; /* horizontal scroller on phones */
    document.querySelectorAll(g[0]).forEach(function(el, i){
      el.classList.add('rv'); if (g[1] !== 'rv') el.classList.add(g[1]);
      el.style.setProperty('--d', Math.min(i % 4, 3) * 0.09 + 's');
      items.push(el);
    });
  });
  if (reduce || !('IntersectionObserver' in window)) { items.forEach(function(el){ el.classList.add('in'); }); }
  else {
    root.classList.add('js');
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold: .12, rootMargin: '0px 0px -6% 0px'});
    items.forEach(function(el){ io.observe(el); });
  }

  /* scroll: progress bar, header shadow, background drift, active nav link */
  var site = document.querySelector('.site'), clinic = document.getElementById('clinic');
  var links = [].slice.call(document.querySelectorAll('.nav a'));
  var secs = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  var ticking = false;
  function onScroll(){
    var h = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ')';
    if (site) site.classList.toggle('scrolled', scrollY > 10);
    if (clinic && !reduce) {
      var r = clinic.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) clinic.style.setProperty('--py', ((r.top + r.height / 2 - innerHeight / 2) * -0.08).toFixed(1) + 'px');
    }
    var cur = -1;
    secs.forEach(function(s, i){ if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
    links.forEach(function(a, i){ a.classList.toggle('on', i === cur); });
    ticking = false;
  }
  addEventListener('scroll', function(){ if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();

  /* hero video: pause when off screen to save battery */
  var v = document.querySelector('.frame video');
  if (v && 'IntersectionObserver' in window) {
    new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function(){}); } else v.pause(); }); }, {threshold: .1}).observe(v);
  }

  /* pointer glow on contact cards */
  document.querySelectorAll('.card').forEach(function(c){
    c.addEventListener('pointermove', function(e){
      var b = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - b.left) + 'px'); c.style.setProperty('--my', (e.clientY - b.top) + 'px');
    });
  });

  /* subtle tilt of the hero video frame on desktop */
  var fr = document.querySelector('.hero .media');
  if (fr && !reduce && matchMedia('(hover:hover) and (min-width:901px)').matches) {
    fr.style.transition = 'transform .25s ease-out';
    document.querySelector('.hero').addEventListener('pointermove', function(e){
      var b = fr.getBoundingClientRect(), x = (e.clientX - b.left - b.width / 2) / b.width, y = (e.clientY - b.top - b.height / 2) / b.height;
      fr.style.transform = 'perspective(900px) rotateY(' + (x * 5).toFixed(2) + 'deg) rotateX(' + (-y * 4).toFixed(2) + 'deg)';
    });
    document.querySelector('.hero').addEventListener('pointerleave', function(){ fr.style.transform = ''; });
  }
})();
