/* ==========================================================
   界面 15-20 + 通讯录 + 整理链路（核心）
   ========================================================== */

if (!window.SCREENS) { window.SCREENS = {}; }
var SCREENS = window.SCREENS;

/* ---------- 通讯录：分类分组首屏 ---------- */
SCREENS.contacts = function () {
  var h = navBar('通讯录', { back:false,
    right:'<div class="nav-r">' +
      '<div class="nav-i"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div>' +
      '<div class="nav-i" data-newcat><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>' +
      '</div>' });
  h += '<div class="body" style="background:#fff">';
  h += '<div class="sec" style="padding-top:14px">按分类浏览<span>点分类看这一类的群和人</span></div>';
  DB.data.categories.forEach(function (c) {
    h += '<div class="row" data-c="' + c.id + '">' + H.catIcon(c.id, '', 44) +
      '<div class="mid"><div class="nm">' + H.esc(c.name) + '</div>' +
      '<div class="pv">' + Q.groupsOf(c.id).length + ' 群 · ' + Q.peopleOf(c.id).length + ' 人</div></div>' +
      '<svg class="arw" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></div>';
  });
  var uc = Q.uncatCount();
  h += '<div class="row" data-c="__uncat">' +
    '<div class="av" style="background:' + AV.grey + '"><svg viewBox="0 0 24 24" style="width:23px;height:23px;stroke:#fff;fill:none;stroke-width:1.9;stroke-linecap:round"><path d="M4 5h16v11H7l-3 3z"/></svg></div>' +
    '<div class="mid"><div class="nm">未分类</div><div class="pv">' + uc + ' 项待整理</div></div>' +
    '<div class="badge" style="background:#B8BFC7">' + uc + '</div></div>';

  h += '<div class="sec">全部好友<span>' + DB.data.people.length + ' 人</span></div>';
  var last = '';
  DB.data.people.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'zh'); })
    .forEach(function (p) {
      var ix = pinyinIdx(p.name);
      if (ix !== last) { h += '<div class="idxh">' + ix + '</div>'; last = ix; }
      h += '<div class="row noline" data-p="' + p.id + '">' +
        '<div class="av" style="background:' + p.av + '">' + H.esc(p.name.charAt(0)) + '</div>' +
        '<div class="mid"><div class="nm">' + H.esc(p.name) + '</div>' +
        (p.remark ? '<div class="pv">' + H.esc(p.remark) + '</div>' : '') + '</div></div>';
    });
  h += '<div style="height:20px"></div></div>';
  return h;
};
SCREENS.contacts.after = function (root) {
  root.querySelectorAll('[data-c]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var id = el.dataset.c;
      if (id === '__uncat') go('tidy'); else go('category', { id:id });
    };
  });
  root.querySelectorAll('[data-p]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('profile', { id:el.dataset.p, kind:'person' }); };
  });
  var nc = root.querySelector('[data-newcat]');
  if (nc) nc.onclick = function () { H.haptic(); go('newcat'); };
};

/* ==========================================================
   17 整理未分类 —— 多选 + 建议 + 底部归类
   ========================================================== */
var TIDY = { sel: {}, addTo: null };

SCREENS.tidy = function (p) {
  TIDY.addTo = p.addTo || null;
  if (p.reset) TIDY.sel = {};
  var gs = Q.uncatGroups(), ps = Q.uncatPeople();
  var total = gs.length + ps.length + DB.data.miscUncat;

  var h = navBar('整理未分类 <span style="font-size:13px;color:#888;font-weight:400">' + total + '</span>', {
    right:'<div class="nav-r"><span class="nav-act" data-all>全选</span></div>'
  });
  h += '<div class="body" style="padding-bottom:80px">';

  if (TIDY.addTo) {
    var tc = Q.cat(TIDY.addTo);
    h += '<div style="margin:12px 16px 0;padding:11px 14px;border-radius:11px;' +
      'background:rgba(7,193,96,.09);font-size:13px;color:#0A8F4C;line-height:1.55">' +
      '正在往「<b>' + H.esc(tc ? tc.name : '') + '</b>」里添加内容，勾选后点下方按钮即可。</div>';
  }

  h += '<div class="sec grey">群聊<span>' + gs.length + ' 个</span></div>';
  if (!gs.length) h += '<div class="empty" style="padding:30px">群都归好类了 ✓</div>';
  gs.forEach(function (g) {
    var on = TIDY.sel['g_' + g.id];
    h += '<div class="row" data-pick-g="' + g.id + '">' +
      '<div class="pick' + (on ? ' on' : '') + '"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>' +
      H.avGroup(g) +
      '<div class="mid"><div class="tt"><div class="nm">' + H.esc(g.name) + '</div>' +
      (g.note ? '<div class="sug">' + H.esc(g.note) + '</div>' : '') + '</div>' +
      '<div class="pv">' + H.esc(g.prev || '') + '</div></div></div>';
  });

  h += '<div class="sec">好友<span>' + (ps.length + DB.data.miscUncat) + ' 人</span></div>';
  if (!ps.length) h += '<div class="empty" style="padding:30px">好友都归好类了 ✓</div>';
  ps.forEach(function (p2) {
    var on = TIDY.sel['p_' + p2.id];
    h += '<div class="row" data-pick-p="' + p2.id + '">' +
      '<div class="pick' + (on ? ' on' : '') + '"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>' +
      '<div class="av" style="background:' + p2.av + '">' + H.esc(p2.name.charAt(0)) + '</div>' +
      '<div class="mid"><div class="tt"><div class="nm">' + H.esc(p2.name) + '</div>' +
      (p2.note ? '<div class="sug">' + H.esc(p2.note) + '</div>' : '') + '</div>' +
      '<div class="pv">' + H.esc(p2.remark || '') + '</div></div></div>';
  });

  /* 其余占位项，凑数量 */
  var rest = DB.data.miscUncat;
  if (rest > 0) {
    h += '<div class="row noline" data-rest style="cursor:default;background:#FAFAFB">' +
      '<div class="av" style="background:#E7E9EB;color:#9AA0A6;font-size:14px">…</div>' +
      '<div class="mid"><div class="nm" style="color:#9AA0A6;font-size:15px">还有 ' + rest + ' 项</div>' +
      '<div class="pv">原型只展开前几项演示</div></div></div>';
  }
  h += '<div style="height:20px"></div></div>';

  var n = Object.keys(TIDY.sel).filter(function (k) { return TIDY.sel[k]; }).length;
  h += '<div class="abar"><div class="ab-n">已选 <b>' + n + '</b> 项</div>' +
    '<button class="ab-btn' + (n ? '' : ' off') + '" data-assign>' +
    (TIDY.addTo ? '添加到分类' : '归类到…') + '</button></div>';
  return h;
};

SCREENS.tidy.after = function (root, p) {
  function refreshBtn() {
    var n = Object.keys(TIDY.sel).filter(function (k) { return TIDY.sel[k]; }).length;
    root.querySelector('.ab-n').innerHTML = '已选 <b>' + n + '</b> 项';
    var b = root.querySelector('[data-assign]');
    b.classList.toggle('off', !n);
  }
  root.querySelectorAll('[data-pick-g],[data-pick-p]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var k = el.dataset.pickG ? 'g_' + el.dataset.pickG : 'p_' + el.dataset.pickP;
      TIDY.sel[k] = !TIDY.sel[k];
      el.querySelector('.pick').classList.toggle('on', TIDY.sel[k]);
      refreshBtn();
    };
  });
  var all = root.querySelector('[data-all]');
  all.onclick = function () {
    H.haptic();
    var items = root.querySelectorAll('[data-pick-g],[data-pick-p]');
    var allOn = Array.prototype.every.call(items, function (el) {
      return el.querySelector('.pick').classList.contains('on');
    });
    items.forEach(function (el) {
      var k = el.dataset.pickG ? 'g_' + el.dataset.pickG : 'p_' + el.dataset.pickP;
      TIDY.sel[k] = !allOn;
      el.querySelector('.pick').classList.toggle('on', !allOn);
    });
    all.textContent = allOn ? '全选' : '取消全选';
    refreshBtn();
  };
  var ab = root.querySelector('[data-assign]');
  ab.onclick = function () {
    var ids = Object.keys(TIDY.sel).filter(function (k) { return TIDY.sel[k]; });
    if (!ids.length) { H.toast('先勾选要整理的内容'); return; }
    H.haptic();
    go('assign', { ids:ids.join(','), addTo:TIDY.addTo });
  };
};

/* ==========================================================
   18 归类选择器
   ========================================================== */
SCREENS.assign = function (p) {
  var ids = p.ids ? p.ids.split(',') : [];
  var n = ids.length;
  var h = navBar('整理未分类', { right:'<div class="nav-r"><span class="nav-act" data-all>全选</span></div>' });
  h += '<div class="body" style="filter:blur(1.2px);opacity:.75;pointer-events:none">';
  h += '<div class="sec grey">已选择</div>';
  ids.slice(0, 6).forEach(function (k) {
    var isG = k.charAt(0) === 'g';
    var id = k.slice(2);
    var o = isG ? Q.group(id) : Q.person(id);
    if (!o) return;
    h += '<div class="row">' + (isG ? H.avGroup(o) :
      '<div class="av" style="background:' + o.av + '">' + H.esc(o.name.charAt(0)) + '</div>') +
      '<div class="mid"><div class="nm">' + H.esc(o.name) + '</div></div></div>';
  });
  if (n > 6) h += '<div class="row noline" style="justify-content:center;color:#B2B2B2;font-size:14px">还有 ' + (n - 6) + ' 项</div>';
  h += '<div style="height:400px"></div></div>';

  h += '<div class="mask" data-close></div>';
  h += '<div class="sheet">';
  h += '<div class="grab"></div>';
  h += '<div class="sh-tt">归类到分类<span>已选 ' + n + ' 项 · 可多选，一项可进多个分类</span></div>';
  h += '<div class="sh-body">';
  DB.data.categories.forEach(function (c) {
    h += '<div class="sh-r" data-sc="' + c.id + '">' + H.catIcon(c.id, '', 38) +
      '<div class="sh-n">' + H.esc(c.name) + '</div>' +
      '<div class="sh-c">' + Q.groupsOf(c.id).length + ' 群 · ' + Q.peopleOf(c.id).length + ' 人</div>' +
      '<div class="sh-ck"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div></div>';
  });
  h += '</div>';
  h += '<div class="sh-new" data-snew><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>新建分类并归入</div>';
  h += '</div>';
  return h;
};

SCREENS.assign.after = function (root, p) {
  var ids = p.ids.split(',');
  var chosen = {};
  var mask = root.querySelector('[data-close]');
  function close() { back(); }
  mask.onclick = close;
  root.querySelectorAll('[data-sc]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var cid = el.dataset.sc;
      chosen[cid] = !chosen[cid];
      el.querySelector('.sh-ck').classList.toggle('on', chosen[cid]);
      /* 立即生效 */
      ids.forEach(function (k) {
        var isG = k.charAt(0) === 'g';
        A.toggleCat(isG ? 'group' : 'person', k.slice(2), cid, chosen[cid]);
      });
    };
  });
  root.querySelector('[data-snew]').onclick = function () {
    H.haptic();
    var name = prompt('新分类名称', '');
    if (!name || !name.trim()) return;
    var nid = A.addCat(name.trim(), 'asc');
    ids.forEach(function (k) {
      var isG = k.charAt(0) === 'g';
      A.toggleCat(isG ? 'group' : 'person', k.slice(2), nid, true);
    });
    H.toast('已新建「' + name.trim() + '」并归入 ' + ids.length + ' 项');
    TIDY.sel = {};
    home();
  };
  /* 拖到面板上关闭 → 提示 */
};

/* ==========================================================
   19 长按拖拽归类
   ========================================================== */
SCREENS.dragtidy = function () {
  var gs = Q.uncatGroups();
  var h = navBar('整理未分类 <span style="font-size:13px;color:#888;font-weight:400">' + Q.uncatCount() + '</span>',
    { right:'<div class="nav-r"><span class="nav-act" data-all>全选</span></div>' });
  h += '<div class="body" id="dragBody">';
  h += '<div style="font-size:12.5px;color:var(--lb3);padding:12px 18px 4px;line-height:1.6">' +
    '长按任意一项，拖到上方分类芯片即可归入 —— 不用进设置页。</div>';
  h += '<div class="dz" id="dropZone"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>' +
    '<span id="dzText">长按下方项目，拖到这里</span></div>';

  h += '<div style="display:flex;gap:8px;overflow-x:auto;padding:0 16px 12px" id="catChips">';
  DB.data.categories.forEach(function (c) {
    h += '<div data-chip="' + c.id + '" style="flex:none;display:flex;align-items:center;gap:7px;' +
      'padding:7px 13px;border-radius:99px;background:#fff;border:1px solid var(--sep);font-size:13.5px;' +
      'cursor:pointer;transition:all .15s"><span style="width:9px;height:9px;border-radius:50%;background:' +
      (ICONS[c.icon].bg.match(/#[0-9A-F]{6}/i) || ['#07C160'])[0] + '"></span>' + H.esc(c.name) + '</div>';
  });
  h += '</div>';

  h += '<div class="sec grey">群聊<span>' + gs.length + ' 个</span></div>';
  gs.forEach(function (g) {
    h += '<div class="row" data-dg="' + g.id + '" style="touch-action:pan-y">' + H.avGroup(g) +
      '<div class="mid"><div class="tt"><div class="nm">' + H.esc(g.name) + '</div>' +
      (g.note ? '<div class="sug">' + H.esc(g.note) + '</div>' : '') + '</div>' +
      '<div class="pv">' + H.esc(g.prev || '') + '</div></div></div>';
  });
  var ps = Q.uncatPeople();
  h += '<div class="sec">好友<span>' + (ps.length + DB.data.miscUncat) + ' 人</span></div>';
  ps.forEach(function (p2) {
    h += '<div class="row" data-dp="' + p2.id + '" style="touch-action:pan-y">' +
      '<div class="av" style="background:' + p2.av + '">' + H.esc(p2.name.charAt(0)) + '</div>' +
      '<div class="mid"><div class="tt"><div class="nm">' + H.esc(p2.name) + '</div>' +
      (p2.note ? '<div class="sug">' + H.esc(p2.note) + '</div>' : '') + '</div>' +
      '<div class="pv">' + H.esc(p2.remark || '') + '</div></div></div>';
  });
  h += '<div style="height:24px"></div></div>';
  return h;
};

SCREENS.dragtidy.after = function (root) {
  var zone = root.querySelector('#dropZone');
  var dzText = root.querySelector('#dzText');
  var chipEls = root.querySelectorAll('[data-chip]');
  var hoverCat = null;
  var ghost = null, srcEl = null, offX = 0, offY = 0;

  function findChip(x, y) {
    var r = zone.getBoundingClientRect();
    if (x >= r.left - 40 && x <= r.right + 40 && y >= r.top - 60 && y <= r.bottom + 8) return null;
    for (var i = 0; i < chipEls.length; i++) {
      var cr = chipEls[i].getBoundingClientRect();
      if (x >= cr.left - 12 && x <= cr.right + 12 && y >= cr.top - 22 && y <= cr.bottom + 22)
        return chipEls[i];
    }
    return false;
  }

  function start(el, kind, id, x, y) {
    srcEl = el;
    var r = el.getBoundingClientRect();
    offX = x - r.left; offY = y - r.top;
    ghost = el.cloneNode(true);
    ghost.className = 'row dragging';
    ghost.style.width = r.width + 'px';
    ghost.style.left = r.left + 'px';
    ghost.style.top = r.top + 'px';
    document.body.appendChild(ghost);
    el.style.opacity = '.3';
    zone.classList.add('over');
    dzText.textContent = '拖到下方分类芯片，或松手取消';
    el._drag = { kind:kind, id:id };
  }
  function move(x, y) {
    if (!ghost) return;
    ghost.style.left = (x - offX) + 'px';
    ghost.style.top = (y - offY) + 'px';
    var c = findChip(x, y);
    chipEls.forEach(function (ch) { ch.classList.remove('drop'); ch.style.background = '#fff'; });
    hoverCat = null;
    if (c && c !== null) { c.classList.add('drop'); hoverCat = c.dataset.chip; }
    /* 也支持拖到顶部虚线框 */
    var r = zone.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom + 10) {
      zone.classList.add('over');
    } else {
      zone.classList.remove('over');
    }
  }
  function end() {
    if (!ghost) return;
    var info = srcEl._drag;
    ghost.remove(); ghost = null;
    srcEl.style.opacity = ''; srcEl._drag = null;
    zone.classList.remove('over');
    dzText.textContent = '长按下方项目，拖到这里';
    chipEls.forEach(function (ch) { ch.classList.remove('drop'); ch.style.background = '#fff'; });
    if (hoverCat && info) {
      A.toggleCat(info.kind, info.id, hoverCat, true);
      H.haptic();
      H.toast('已归入「' + Q.cat(hoverCat).name + '」');
      render(true);
      return;
    }
    if (!hoverCat && info) {
      /* 拖到虚线框 → 弹出选择器 */
      var r = zone.getBoundingClientRect();
      var gy = ghost ? 0 : 0;
      H.toast('松手在分类芯片上才会归入，试试拖到上方的分类');
    }
    hoverCat = null;
  }

  root.querySelectorAll('[data-dg],[data-dp]').forEach(function (el) {
    var kind = el.dataset.dg ? 'group' : 'person';
    var id = el.dataset.dg || el.dataset.dp;
    /* 鼠标 */
    el.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      start(el, kind, id, e.clientX, e.clientY);
      function mm(ev) { move(ev.clientX, ev.clientY); }
      function mu() { end(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); }
      document.addEventListener('mousemove', mm);
      document.addEventListener('mouseup', mu);
    });
    /* 触摸：长按 180ms 启动 */
    var timer = null, started = false;
    el.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      started = false;
      timer = setTimeout(function () {
        started = true; H.haptic();
        start(el, kind, id, t.clientX, t.clientY);
      }, 180);
    }, { passive:true });
    el.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      if (!started) { clearTimeout(timer); return; }
      e.preventDefault(); move(t.clientX, t.clientY);
    }, { passive:false });
    el.addEventListener('touchend', function () {
      clearTimeout(timer);
      if (started) end();
      started = false;
    });
  });

  /* 点芯片也能直接归入（无需拖拽时的兜底） */
  var sel = null;
  root.querySelectorAll('[data-dg],[data-dp]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (el._justDragged) return;
      H.haptic();
      var kind = el.dataset.dg ? 'group' : 'person';
      var id = el.dataset.dg || el.dataset.dp;
      var o = kind === 'group' ? Q.group(id) : Q.person(id);
      go('quickassign', { kind:kind, id:id, name:o.name });
    });
  });
};

/* ---------- 快速归类（长按拖拽的兜底路径） ---------- */
SCREENS.quickassign = function (p) {
  var h = navBar('归入分类', { right:'<div class="nav-r"></div>' });
  h += '<div class="body" style="filter:blur(1.2px);opacity:.7;pointer-events:none;background:#fff">' +
    '<div class="empty">' + H.esc(p.name) + '</div></div>';
  h += '<div class="mask" data-close></div><div class="sheet" style="max-height:70%">' +
    '<div class="grab"></div><div class="sh-tt">把「' + H.esc(p.name) + '」归入<span>可多选</span></div>' +
    '<div class="sh-body">';
  var o = p.kind === 'group' ? Q.group(p.id) : Q.person(p.id);
  DB.data.categories.forEach(function (c) {
    var on = o.cats.indexOf(c.id) >= 0;
    h += '<div class="sh-r" data-qc="' + c.id + '">' + H.catIcon(c.id, '', 38) +
      '<div class="sh-n">' + H.esc(c.name) + '</div>' +
      '<div class="sh-ck' + (on ? ' on' : '') + '"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div></div>';
  });
  h += '</div><div class="sh-new" data-qnew><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>新建分类并归入</div></div>';
  return h;
};
SCREENS.quickassign.after = function (root, p) {
  root.querySelector('[data-close]').onclick = function () { back(); };
  root.querySelectorAll('[data-qc]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var cid = el.dataset.qc;
      var o = p.kind === 'group' ? Q.group(p.id) : Q.person(p.id);
      var on = o.cats.indexOf(cid) < 0;
      A.toggleCat(p.kind, p.id, cid, on);
      el.querySelector('.sh-ck').classList.toggle('on', on);
      H.toast(on ? '已归入「' + Q.cat(cid).name + '」' : '已移出');
    };
  });
  root.querySelector('[data-qnew]').onclick = function () {
    H.haptic();
    var name = prompt('新分类名称', '');
    if (!name || !name.trim()) return;
    var nid = A.addCat(name.trim(), 'asc');
    A.toggleCat(p.kind, p.id, nid, true);
    H.toast('已新建并归入');
    back();
  };
};

/* ==========================================================
   20 新建分类
   ========================================================== */
var NEWCAT = { icon: 'school', thenCats: '' };
SCREENS.newcat = function (p) {
  if (p.thenCats !== undefined) NEWCAT.thenCats = p.thenCats || '';
  if (p.icon) NEWCAT.icon = p.icon;
  var h = navBar('新建分类', { right:'<div class="nav-r"><span class="nav-act" data-create>创建</span></div>' });
  h += '<div class="body" style="background:var(--bg)">';
  h += '<div class="sec grey">名称</div><div class="card" style="margin-top:0">' +
    '<div class="srow"><div style="width:36px;height:36px;border-radius:10px;background:' + ICONS[NEWCAT.icon].bg +
    ';display:flex;align-items:center;justify-content:center;flex:none">' +
    '<svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#fff;fill:none;stroke-width:1.9;stroke-linecap:round">' + ICONS[NEWCAT.icon].svg + '</svg></div>' +
    '<input id="ncName" placeholder="给分类起个名字" style="flex:1;border:none;outline:none;font-size:17px;' +
    'font-family:inherit;background:transparent"></div></div>';

  h += '<div class="sec grey">图标</div><div class="card" style="margin-top:0;padding:16px">' +
    '<div style="display:flex;gap:11px;flex-wrap:wrap">';
  ICON_KEYS.forEach(function (k) {
    var on = NEWCAT.icon === k;
    h += '<div data-ni="' + k + '" style="width:46px;height:46px;border-radius:12px;background:' + ICONS[k].bg +
      ';display:flex;align-items:center;justify-content:center;cursor:pointer;' +
      (on ? 'outline:2.5px solid #07C160;outline-offset:2px' : '') + '">' +
      '<svg viewBox="0 0 24 24" style="width:23px;height:23px;stroke:#fff;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round">' + ICONS[k].svg + '</svg></div>';
  });
  h += '</div></div>';

  h += '<div class="sec grey">行为</div><div class="card" style="margin-top:0">' +
    '<div class="srow" data-nb="pinned"><div class="sk" style="flex:1">置顶到目录顶部</div><div class="sw"><i></i></div></div>' +
    '<div class="srow" data-nb="notify"><div class="sk" style="flex:1">有新消息时提醒我</div><div class="sw on"><i></i></div></div>' +
    '<div class="srow"><div class="sk" style="flex:1">自动归类规则</div><div class="sv">按备注关键词</div>' +
    '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '</div>';

  h += '<div class="sec grey">已有成员</div><div class="card" style="margin-top:0">' +
    '<div class="srow"><div class="sk" style="flex:1;color:#B2B2B2;font-weight:400">创建后可随时往里添加</div></div>' +
    '</div>';
  h += '<div style="font-size:12.5px;color:var(--lb3);padding:14px 20px 0;line-height:1.65">' +
    '分类之间是平级的。「学校」里可以同时有学校群和学校认识的人。</div>';
  h += '<div style="height:24px"></div></div>';
  return h;
};
SCREENS.newcat.after = function (root, p) {
  root.querySelectorAll('[data-ni]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      NEWCAT.icon = el.dataset.ni;
      var nm = root.querySelector('#ncName');
      if (nm && nm.value) NEWCAT._tmpName = nm.value;
      render(true);
      var n2 = document.querySelector('#ncName');
      if (n2) { n2.value = NEWCAT._tmpName || ''; n2.focus(); }
    };
  });
  var nameI = root.querySelector('#ncName');
  if (NEWCAT._tmpName && !nameI.value) nameI.value = NEWCAT._tmpName;
  nameI.oninput = function () { NEWCAT._tmpName = nameI.value; };
  nameI.focus();
  root.querySelectorAll('[data-nb]').forEach(function (el) {
    el.onclick = function () { H.haptic(); el.querySelector('.sw').classList.toggle('on'); };
  });
  root.querySelector('[data-create]').onclick = function () {
    var v = nameI.value.trim();
    if (!v) { H.toast('请先给分类起个名字'); nameI.focus(); return; }
    H.haptic();
    var pinned = root.querySelector('[data-nb="pinned"] .sw').classList.contains('on');
    var id = A.addCat(v, NEWCAT.icon);
    var c = Q.cat(id);
    c.pinned = pinned; DB.save();
    /* 来自「从分类里添加」的链路：把关联内容归入 */
    if (NEWCAT.thenCats) {
      var parts = NEWCAT.thenCats.split(':');
      if (parts[0] === 'group') A.toggleCat('group', parts[1], id, true);
      if (parts[0] === 'person') A.toggleCat('person', parts[1], id, true);
      NEWCAT.thenCats = '';
    }
    NEWCAT._tmpName = ''; NEWCAT.icon = 'school';
    H.toast('已创建「' + v + '」');
    home();
  };
};

/* ==========================================================
   15 语音录制 / 16 通话
   ========================================================== */
SCREENS.recording = function (p) {
  var h = navBar('按住说话', { right:'<div class="nav-r"></div>' });
  h += '<div class="rec"><div class="rec-wave">';
  for (var i = 0; i < 11; i++) {
    h += '<i style="animation-delay:' + (i * 0.09).toFixed(2) + 's"></i>';
  }
  h += '</div><div class="rec-t" id="recT">00:00</div>' +
    '<div class="rec-s">松开手指，发送语音</div></div>';
  h += '<div class="ibar" style="justify-content:center;gap:22px">' +
    '<div style="font-size:15px;color:#888;cursor:pointer" data-cancel>取消</div>' +
    '<div style="width:140px;height:44px;border-radius:6px;background:#07C160;color:#fff;' +
    'display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:500;cursor:pointer" data-send>松开发送</div>' +
    '</div>';
  return h;
};
SCREENS.recording.after = function (root, p) {
  var t = 0;
  var iv = setInterval(function () {
    t++;
    var el = document.querySelector('#recT');
    if (!el) { clearInterval(iv); return; }
    el.textContent = '00:' + String(t).padStart(2, '0');
  }, 1000);
  root.querySelector('[data-cancel]').onclick = function () { H.haptic(); back(); };
  root.querySelector('[data-send]').onclick = function () {
    H.haptic();
    A.send(p.id, '［语音］' + t + '″');
    A.setPrev(p.id, '我：［语音］' + t + '″');
    back(); H.toast('语音已发送');
  };
};

SCREENS.call = function (p) {
  p = p || {};
  var isG = p.kind === 'group';
  var obj = isG ? Q.group(p.id) : Q.person(p.id);
  /* 兜底：没有传 id（或 id 失效）时用第一个群，避免整页崩掉 */
  if (!obj) { obj = DB.data.groups[0] || DB.data.people[0]; isG = true; }
  var h = '<div class="page nofx"><div class="statusbar dark"><span id="clock">9:41</span>' +
    '<span class="sb-r"><svg viewBox="0 0 20 14" fill="currentColor"><rect y="9" width="3" height="5" rx="1"/><rect x="5" y="6" width="3" height="8" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" width="3" height="14" rx="1" opacity=".3"/></svg></span></div>';
  h += '<div class="callbg"><div class="call-av" style="background:' +
    (isG ? AV.chen : obj.av) + '">' + H.esc(obj.name.charAt(0)) + '</div>' +
    '<div class="call-n">' + H.esc(obj.name) + '</div>' +
    '<div class="call-s" id="callT">' + H.esc(p.mode || '语音通话') + '中 · 00:00</div>' +
    '<div class="call-btns">' +
    '<div class="cbtn" data-mute><div class="cbtn-d"><svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7"/></svg></div><div class="cbtn-l">静音</div></div>' +
    '<div class="cbtn" data-cam><div class="cbtn-d"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/></svg></div><div class="cbtn-l">摄像头</div></div>' +
    '<div class="cbtn" data-hang><div class="cbtn-d red"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.4-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z" transform="rotate(135 12 12)"/></svg></div><div class="cbtn-l">挂断</div></div>' +
    '</div></div></div>';
  return h;
};
SCREENS.call.after = function (root, p) {
  p = p || {};
  var t = 0;
  var iv = setInterval(function () {
    t++;
    var el = document.querySelector('#callT');
    if (!el) { clearInterval(iv); return; }
    el.textContent = (p.mode || '语音通话') + '中 · ' +      String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  }, 1000);
  root.querySelector('[data-hang]').onclick = function () {
    H.haptic();
    var obj = p.kind === 'group' ? Q.group(p.id) : Q.person(p.id);
    if (obj) A.send(obj.id, '［' + (p.mode || '语音通话') + '］通话时长 ' + t + ' 秒');
    return back();
  };
  root.querySelector('[data-mute]').onclick = function () { H.haptic(); H.toast('已静音'); };
  root.querySelector('[data-cam]').onclick = function () { H.haptic(); H.toast('已开启摄像头'); };
  document.querySelector('#tabbar').style.display = 'none';
};

window.TIDY = TIDY;
