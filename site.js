// Header on the home page: shows the heading of the section you are in,
// hides that section's own menu link, and clears the heading on the hero / contact.
//
// Why this replaces the old version: the old one reacted only when a section ENTERED view.
// Going down to Contact cleared the heading, and when you scrolled back up Projects was
// already "in view", so nothing told the header to bring "Projects" back.
// This version looks at where you are on every scroll, so it always shows the right heading.
const header  = document.querySelector('.header');
const titleEl = header.querySelector('.page-title');
const links   = header.querySelectorAll('.nav a');
const sections = [...document.querySelectorAll('main [data-k]')];
let currentId = null;

function setHeader(key, title, hindi) {
  const en = titleEl.querySelector('.pt-en'), hi = titleEl.querySelector('.pt-hi');
  if (en) { en.textContent = title || ''; if (hi) hi.textContent = hindi || ''; }   // two-line title (English + Hindi)
  else titleEl.textContent = title || '';                                            // plain title
  header.classList.toggle('titled', !!title);
  links.forEach(a => a.hidden = !!key && a.dataset.k === key);
}

function update() {
  let current = null;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) {
    current = sections[sections.length - 1];                 // very bottom of the page = Contact
  } else {
    const line = window.innerHeight * 0.45;                  // the section crossing this line is "current"
    sections.forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = s;
    });
  }
  if (!current) return;                                      // on a border strip: keep what we had
  const id = sections.indexOf(current);
  if (id === currentId) return;
  currentId = id;
  setHeader(current.dataset.k, current.dataset.title, current.dataset.hi);
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { update(); ticking = false; });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
window.addEventListener('load', update);
update();
