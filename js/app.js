/* ==========================================================
   路由 + 通用工具
   ========================================================== */
var S = { stack: [], tab: 'msg', ctx: {} };

var H = {
  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m];
    });
  },
  icon: function (k, cls) {
    var ic = ICONS[k] || ICONS.asc;
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24">' + ic.svg + '</svg>';
  },
  catIcon: function (cid, cls, size) {
    var c = Q.cat(cid); if (!c) return '';
    var ic = ICONS[c.icon] || ICONS.asc;
    var st = 'background:' + ic.bg + ';' + (size ? 'width:' + size + 'px;height:' + size + 'px' : '');
    return '<div class="cat-ic" style="' + st + '"><svg class="' + (cls || '') +
      '" viewBox="0 0 24 24">' + ic.svg + '</svg></div>';
  },
  avGroup: function (g, cls) {
    var ms = (g.members || []).filter(function (m) { return m !== '我'; }).slice(0, 3);
    var extra = (g.members || []).length - 1 - ms.length;
    var colors = [AV.chen, AV.lin, AV.zhou, AV.su, AV.sun, AV.wu, AV.zhao];
    var h = '<div class="av av-grid ' + (cls || '') + '">';
    for (var i = 0; i < 3; i++) {
      var nm = ms[i] || '';
      h += '<i style="background:' + colors[i % colors.length] + '">' + H.esc(nm.charAt(0)) + '</i>';
    }
    h += '<i style="background:' + AV.grey + '">+' + Math.max(extra, 0) + '</i></div>';
    return h;
  },
  hhmm: function () {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  },
  toast: function (msg) {
    var el = document.getElementById('hud');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('on'); }, 1700);
  },
  haptic: function () { if (navigator.vibrate) navigator.vibrate(8); }
};

/* ---------- 路由 ---------- */
function go(page, params, noAnim) {
  S.stack.push({ page: page, params: params || {} });
  render(noAnim);
}
function back() {
  if (S.stack.length > 1) { S.stack.pop(); render(); }
}
function replace(page, params) {
  S.stack[S.stack.length - 1] = { page: page, params: params || {} };
  render(true);
}
function home() { S.stack = [{ page: 'msg', params: {} }]; render(); }
function goto(tab) {
  S.stack = [{ page: tab, params: {} }]; S.tab = tab; render();
}
function cur() { return S.stack[S.stack.length - 1]; }

/* ---------- 渲染 ---------- */
var SCREENS = window.SCREENS || (window.SCREENS = {});

function render(noAnim) {
  var c = cur();
  var fn = SCREENS[c.page];
  if (!fn) { S.stack.pop(); return render(noAnim); }
  var html = fn(c.params) || '';
  var view = document.getElementById('view');
  var old = view.querySelector('.page');
  if (old) old.remove();
  var div = document.createElement('div');
  div.className = 'page' + (noAnim ? ' nofx' : '');
  div.innerHTML = html;
  view.appendChild(div);
  /* 绑定交互 */
  if (typeof fn.after === 'function') { try { fn.after(div, c.params || {}); } catch (e) { console.error(e); } }
  var bk = div.querySelector('[data-back]');
  if (bk) bk.onclick = function () { H.haptic(); back(); };
  if (c.params && c.params.focus) {
    var i = div.querySelector('.ib-in');
    if (i) { i.focus(); }
  }
  renderTabs();
  var b = div.querySelector('.body,.chat');
  if (b && c.params && typeof c.params.scroll === 'number') b.scrollTop = c.params.scroll;
}

var TABS = [
  { id:'msg',   label:'消息',   svg:'<path d="M4 5h16v11H7l-3 3z"/>' },
  { id:'contacts', label:'通讯录', svg:'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M17 11.5a3 3 0 100-6M19 20c0-2.4-.9-4.2-2.3-5.4"/>' },
  { id:'tools', label:'功能',   svg:'<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>' },
  { id:'plaza', label:'广场',   svg:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/>' },
  { id:'me',    label:'我',     svg:'<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c0-4 3.4-6.8 7.5-6.8s7.5 2.8 7.5 6.8"/>' }
];

function renderTabs() {
  var c = cur();
  var hideOn = ['chat', 'assign', 'quickassign', 'call', 'recording'];
  var isChat = hideOn.indexOf(c.page) >= 0;
  var el = document.getElementById('tabbar');
  if (isChat) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  var un = Q.totalUnread();
  var h = '';
  TABS.forEach(function (t) {
    var on = (c.page === t.id) || (c.page === 'category' && t.id === 'msg');
    var badge = '';
    if (t.id === 'msg' && un) badge = '<div class="tb-b">' + un + '</div>';
    if (t.id === 'plaza') badge = '<div class="tb-d"></div>';
    h += '<div class="tb' + (on ? ' on' : '') + '" data-tab="' + t.id + '">' +
         '<svg viewBox="0 0 24 24">' + t.svg + '</svg>' +
         '<div class="tb-l">' + t.label + '</div>' + badge + '</div>';
  });
  el.innerHTML = h;
  el.querySelectorAll('[data-tab]').forEach(function (b) {
    b.onclick = function () { H.haptic(); goto(b.dataset.tab); };
  });
  document.querySelector('.statusbar').classList.toggle('dark', false);
}

/* ---------- 启动 ---------- */
window.addEventListener('DOMContentLoaded', function () {
  DB.load();
  home();
  setInterval(function () {
    document.getElementById('clock').textContent = H.hhmm();
  }, 20000);
  document.getElementById('clock').textContent = H.hhmm();
  /* 返回手势：左边缘右滑 */
  var sx = 0, sy = 0, tracking = false;
  document.addEventListener('touchstart', function (e) {
    if (e.touches[0].clientX < 34) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true; }
  }, { passive:true });
  document.addEventListener('touchend', function (e) {
    if (!tracking) return; tracking = false;
    var t = e.changedTouches[0];
    if (t.clientX - sx > 62 && Math.abs(t.clientY - sy) < 60) back();
  }, { passive:true });
});

window.go = go; window.back = back; window.replace = replace;
window.home = home; window.goto = goto; window.cur = cur;
window.render = render; window.H = H; window.S = S;
