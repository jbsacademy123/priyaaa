// Inject shared header & footer, then initialize behaviors (mobile drawer, active link, year)
async function inject(id, file){
  const base = document.currentScript?.dataset?.base || '';
  const res = await fetch(base + file, { cache:'no-cache' });
  if(!res.ok) return;
  document.getElementById(id).innerHTML = await res.text();
}

(async () => {
  await Promise.all([
    inject('header','/partials/header.html'),
    inject('footer','/partials/footer.html')
  ]);

  // query after injection
  const menuBtn  = document.querySelector('.menu-btn');
  const overlay  = document.querySelector('[data-overlay]');
  const panel    = document.getElementById('mobileMenu');
  const closeBtn = document.querySelector('.drawer-close');

  const onKey = (e) => {
    if(e.key === 'Escape') closeDrawer();
    if(e.key === 'Tab'){ // focus trap
      const focusables = panel.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])');
      if(!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  };

  const openDrawer = () => {
    panel.classList.add('open');
    overlay.hidden = false;
    overlay.classList.add('show');
    panel.setAttribute('aria-hidden','false');
    menuBtn?.setAttribute('aria-expanded','true');
    document.body.classList.add('body-locked');
    const firstLink = panel.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
    firstLink && firstLink.focus();
    document.addEventListener('keydown', onKey);
  };

  const closeDrawer = () => {
    panel.classList.remove('open');
    overlay.classList.remove('show');
    panel.setAttribute('aria-hidden','true');
    menuBtn?.setAttribute('aria-expanded','false');
    document.body.classList.remove('body-locked');
    setTimeout(()=>{ overlay.hidden = true; }, 200);
    menuBtn?.focus();
    document.removeEventListener('keydown', onKey);
  };

  menuBtn?.addEventListener('click', openDrawer);
  overlay?.addEventListener('click', closeDrawer);
  closeBtn?.addEventListener('click', closeDrawer);

  // close drawer after navigating (mobile)
  document.querySelectorAll('.drawer-nav a').forEach(a => {
    a.addEventListener('click', () => {
      if(getComputedStyle(menuBtn).display !== 'none') closeDrawer();
    });
  });

  // highlight the active link (desktop nav)
  const path = location.pathname.replace(/\/+$/,'') || '/index.html';
  document.querySelectorAll('.navlinks a').forEach(a=>{
    const full = new URL(a.getAttribute('href'), location.origin).pathname.replace(/\/+$/,'');
    if (path === full || (path.startsWith(full) && full !== '/')) a.classList.add('active');
  });

  // footer copyright year
  const y = document.getElementById('ycopy');
  if(y) y.textContent = new Date().getFullYear();
})();
