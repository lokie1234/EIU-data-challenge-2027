const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Mở menu'); }
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(max-width: 620px)').addEventListener('change', closeMenu);

// The information panels live in HTML; JavaScript only manages navigation.
const viewIds = ['about', 'rounds', 'timeline', 'prizes', 'faq'];
const hero = document.querySelector('.hero');
const hub = document.querySelector('.challenge-hub');
const panels = viewIds.map(id => document.getElementById(id));
const viewTabs = [...hub.querySelectorAll('[data-view]')];
const headerExplore = document.querySelector('.header-explore');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function switchView(id, { focus = false, history = true } = {}) {
  if (!viewIds.includes(id)) return;
  const entering = document.body.dataset.screen !== 'hub';
  const update = () => {
    closeMenu();
    document.body.dataset.screen = 'hub';
    hero.hidden = true; hero.inert = true;
    hub.hidden = false;
    viewTabs.forEach(tab => {
      const active = tab.dataset.view === id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.id !== id; });
    document.querySelector('.hub-page-count').textContent = `0${viewIds.indexOf(id) + 1} / 05`;
    headerExplore.textContent = '← Màn mở đầu';
    const activePanel = document.getElementById(id);
    activePanel.scrollTop = 0;
    if (entering) window.scrollTo({ top: 0, behavior: 'instant' });
    if (focus) activePanel.focus({ preventScroll: true });
    document.dispatchEvent(new Event('challenge-screen-change'));
    if (history) window.history.pushState({ view: id }, '', `#${id}`);
  };
  if (document.startViewTransition && !reducedMotion.matches) document.startViewTransition(update);
  else update();
}
function showIntro({ history = true } = {}) {
  const update = () => {
    closeMenu();
    hub.hidden = true; hero.hidden = false; hero.inert = false;
    document.body.dataset.screen = 'intro';
    headerExplore.innerHTML = 'Khám phá cuộc thi <span>↗</span>';
    if (history) window.history.pushState({ view: 'intro' }, '', window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('.hero [data-explore]').focus({ preventScroll: true });
    document.dispatchEvent(new Event('challenge-screen-change'));
  };
  if (document.startViewTransition && !reducedMotion.matches) document.startViewTransition(update);
  else update();
}
document.querySelectorAll('[data-explore]').forEach(button => button.addEventListener('click', () => {
  if (button === headerExplore && document.body.dataset.screen === 'hub') showIntro();
  else switchView('about', { focus: true });
}));
hub.querySelector('[data-home]').addEventListener('click', () => showIntro());
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); showIntro(); });
viewTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % viewTabs.length;
    if (event.key === 'ArrowLeft') next = (index + viewTabs.length - 1) % viewTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = viewTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); viewTabs[next].focus(); switchView(viewTabs[next].dataset.view); }
  });
});
document.querySelectorAll('a[href^="#"]').forEach(link => {
  const id = link.getAttribute('href').slice(1);
  if (viewIds.includes(id)) link.addEventListener('click', event => { event.preventDefault(); switchView(id, { focus: true }); });
});
function restoreLocation() {
  const id = window.location.hash.slice(1);
  if (viewIds.includes(id)) switchView(id, { history: false });
  else if (document.body.dataset.screen === 'hub') showIntro({ history: false });
}
window.addEventListener('popstate', restoreLocation);
window.addEventListener('hashchange', restoreLocation);
restoreLocation();

const rounds = [
  { kicker: 'ROUND 01 · ONLINE TEST', title: ['Bước đầu nhỏ.', 'Góc nhìn lớn.'], description: 'Đọc biểu đồ, nhận diện xu hướng và đưa ra lựa chọn từ những tình huống kinh doanh gần gũi.', meta: ['◎ Thi cá nhân', '↗ Trực tuyến'], chart: 'A fresh perspective.', bars: [30,48,41,65,56,82,96] },
  { kicker: 'ROUND 02 · VIDEO CASE CHALLENGE', title: ['Kết nối góc nhìn.', 'Giải mã vấn đề.'], description: 'Cùng đồng đội phân tích một bộ dữ liệu và kể câu chuyện về đề xuất kinh doanh qua video.', meta: ['◎ Thi theo đội', '↗ Nộp video'], chart: 'Better, together.', bars: [45,35,60,50,80,72,96] },
  { kicker: 'ROUND 03 · FINAL PRESENTATION', title: ['Đưa ý tưởng', 'đến sân khấu lớn.'], description: 'Trình bày giải pháp trước ban giám khảo, bảo vệ lập luận và thể hiện sức mạnh của đội bạn.', meta: ['◎ Đội vào chung kết', '↗ Thuyết trình trực tiếp'], chart: 'Ideas into impact.', bars: [20,40,55,66,77,85,100] },
];
const tabs = [...document.querySelectorAll('[data-round]')];
function selectRound(index, focus = false) {
  tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
  if (focus) tabs[index].focus();
  const round = rounds[index];
  document.querySelector('#round-panel').setAttribute('aria-labelledby', tabs[index].id);
  document.querySelector('#round-kicker').textContent = round.kicker;
  const title = document.querySelector('#round-title');
  title.replaceChildren(document.createTextNode(round.title[0]), document.createElement('br'), document.createTextNode(round.title[1]));
  document.querySelector('#round-description').textContent = round.description;
  document.querySelector('#round-meta').replaceChildren(...round.meta.map(text => { const span = document.createElement('span'); span.textContent = text; return span; }));
  document.querySelector('.chart-title').textContent = round.chart;
  document.querySelectorAll('.bar-chart i').forEach((bar, i) => bar.style.setProperty('--h', `${round.bars[i]}%`));
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectRound(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectRound(next, true); }
  });
});

const dialog = document.querySelector('#registration');
const form = document.querySelector('#registration-form');
const formView = document.querySelector('#form-view');
const successView = document.querySelector('#success-view');
let opener;
document.querySelectorAll('[data-register]').forEach(button => button.addEventListener('click', () => {
  opener = button; closeMenu(); form.reset(); formView.hidden = false; successView.hidden = true;
  dialog.showModal(); document.body.classList.add('modal-open');
}));
function closeDialog() { dialog.close(); }
document.querySelector('.close-modal').addEventListener('click', closeDialog);
document.querySelector('.close-success').addEventListener('click', closeDialog);
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) closeDialog();
});
dialog.addEventListener('close', () => { form.reset(); document.body.classList.remove('modal-open'); opener?.focus(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  form.reset(); formView.hidden = true; successView.hidden = false; successView.focus();
});
