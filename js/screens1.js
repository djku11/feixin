/* ==========================================================
   界面 01-05 —— 消息(个人消息+群聊) / 分组房间 / 聊天 / 发送面板
   ========================================================== */

if (!window.SCREENS) { window.SCREENS = {}; }
var SCREENS = window.SCREENS;

function navBar(title, opt) {
  opt = opt || {};
  var l = opt.back === false ? '<div class="nav-l"></div>'
        : '<div class="nav-l"><div class="nav-i" data-back><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></div></div>';
  var r = opt.right || '<div class="nav-r"></div>';
  return '<div class="nav">' + l + '<div class="nav-t">' + title + '</div>' + r + '</div>';
}

/* ---------- 在线小圆点 ---------- */
function onlineDot(p, big) {
  var on = Q.isOnline(p);
  var cls = big ? 'odot big' : 'odot';
  return '<span class="' + cls + (on ? ' on' : ' off') + '"></span>';
}

/* ---------- 好友行（带在线状态） ---------- */
function personRow(p) {
  var ot = Q.onlineTxt(p);
  var badge = p.unread ? '<div class="badge">' + p.unread + '</div>' : '';
  return '<div class="frow2" data-person="' + p.id + '">' +
    '<div class="fav" style="background:' + p.av + '">' + H.esc(p.name.charAt(0)) + onlineDot(p, true) + '</div>' +
    '<div class="mid"><div class="tt"><div class="nm">' + H.esc(p.name) + '</div>' +
    '<div class="tm">' + H.esc(p.t || '') + '</div></div>' +
    '<div class="pv"><span class="ost ' + (Q.isOnline(p) ? 'on' : 'off') + '">' + ot + '</span>' +
    (p.mood ? '<i class="sub-sep"></i>' + H.esc(p.mood) : '') + '</div></div>' +
    badge + '</div>';
}

/* ---------- 群行 ---------- */
function groupRow(g) {
  var badge = g.unread ? '<div class="badge">' + g.unread + '</div>' : (g.dot ? '<div class="dotr"></div>' : '');
  return '<div class="frow2" data-group="' + g.id + '">' + H.avGroup(g) +
    '<div class="mid"><div class="tt"><div class="nm">' + H.esc(g.name) + '</div>' +
    '<div class="tm">' + H.esc(g.t || '') + '</div></div>' +
    '<div class="pv">' + H.esc(g.prev || '') + '</div></div>' +
    badge + '</div>';
}

/* ---------- toast 简写 ---------- */
function toast(msg) { H.toast(msg); }

/* ==========================================================
   01a/01b 个人消息 + 群聊消息 —— 底部 tab 两个独立屏
   两套体系完全独立：各自分组、各自未分组、各自新建分组
   ========================================================== */

/* 某一体系的总未读（已分组 + 未分组），供底部 tab 徽标使用 */
function sumUnread(kind) {
  var n = 0;
  Q.catList(kind).forEach(function (c) { n += Q.catUnread(c.id); });
  (kind === 'p' ? Q.uncatPeople() : Q.uncatGroups()).forEach(function (o) { n += o.unread || 0; });
  return n;
}

/* ---------- 两个消息屏共用的交互绑定 ---------- */
function bindMsgScreen(root) {
  /* 分组：点击标题 → 折叠/展开（未分组与普通分组行为一致；进整理页入口在通讯录里） */
  root.querySelectorAll('.grp').forEach(function (gEl) {
    var gid = gEl.dataset.grp;
    gEl.querySelector('.grp-h').onclick = function () {
      H.haptic();
      if (gid === '__up' || gid === '__ug') {
        var k = gid === '__up' ? 'up' : 'ug';
        DB.data.settings[k + 'Folded'] = !DB.data.settings[k + 'Folded'];
        DB.save();
        gEl.classList.toggle('fold', DB.data.settings[k + 'Folded']);
        return;
      }
      var c = Q.cat(gid);
      if (!c) return;
      c.collapsed = !c.collapsed; DB.save();
      gEl.classList.toggle('fold', c.collapsed);
    };
  });

  /* 好友 → 聊天；群 → 聊天 */
  root.querySelectorAll('[data-person]').forEach(function (el) {
    el.onclick = function () {
      if (el._justDragged) return;
      H.haptic(); go('chat', { kind:'person', id:el.dataset.person });
    };
  });
  root.querySelectorAll('[data-group]').forEach(function (el) {
    el.onclick = function () {
      if (el._justDragged) return;
      H.haptic(); go('chat', { kind:'group', id:el.dataset.group });
    };
  });

  root.querySelectorAll('[data-newgrp]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('newcat', { kind:el.dataset.newgrp }); };
  });
  var cm = root.querySelector('[data-catmanage]');
  if (cm) cm.onclick = function () { H.haptic(); go('catmanage'); };
  var tipEl = root.querySelector('[data-tip="sort"]');
  if (tipEl) tipEl.onclick = function () { H.haptic(); toast('长按「分组标题栏」上下拖动即可排序'); };

  bindGroupReorder(root);
}

/* ---------- 01a 个人消息（好友体系） ---------- */
SCREENS.msgp = function () {
  var d = DB.data;
  var h = navBar('个人消息', { back:false,
    right:'<div class="nav-r">' +
      '<div class="nav-i"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div>' +
      '<div class="nav-i" data-catmanage><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></div>' +
      '</div>'
  });
  h += '<div class="body">';

  h += '<div class="zone-h"><span class="zone-t">个人消息</span>' +
    '<span class="zone-s">' + Q.totalOnline() + '/' + d.people.length + ' 人在线</span></div>';

  Q.catList('p').forEach(function (c) {
    var ps = Q.peopleOf(c.id);
    var on = Q.onlineCount(c.id);
    var un = Q.catUnread(c.id);
    var fold = c.collapsed ? ' fold' : '';
    h += '<div class="grp' + fold + (un ? ' has-unread' : '') + '" data-grp="' + c.id + '" data-kind="p">' +
      '<div class="grp-h">' +
      '<svg class="tri" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>' +
      '<span class="grp-n">' + H.esc(c.name) + '</span>' +
      (un ? '<span class="grp-badge">' + un + '</span>' : '') +
      '<span class="grp-cnt">' + on + '/' + ps.length + '</span>' +
      '</div>';
    h += '<div class="grp-b">';
    if (!ps.length) h += '<div class="grp-empty">分组里还没有好友，点「未分组好友」或右上角菜单添加</div>';
    ps.forEach(function (p) { h += personRow(p); });
    h += '</div></div>';
  });

  /* 未分组好友（只属于个人消息体系） */
  var ups = Q.uncatPeople();
  if (ups.length || d.miscUncat > 0) {
    var upFold = DB.data.settings.upFolded ? ' fold' : '';
    h += '<div class="grp' + upFold + '" data-grp="__up" data-kind="p">' +
      '<div class="grp-h">' +
      '<svg class="tri" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>' +
      '<span class="grp-n" style="color:#888">未分组好友</span>' +
      '<span class="grp-cnt">' + (ups.length + d.miscUncat) + '</span>' +
      '</div><div class="grp-b">';
    ups.forEach(function (p) { h += personRow(p); });
    if (d.miscUncat > 0) h += '<div class="grp-empty">还有 ' + d.miscUncat + ' 位好友（原型只展开演示部分）</div>';
    h += '</div></div>';
  }

  h += '<div class="addgrp" data-newgrp="p">+ 新建好友分组</div>';

  h += '<div class="folds" data-tip="sort" style="margin-top:14px">' +
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>' +
    '<p>分组<b>长按可拖拽排序</b>；好友<b>左滑</b>可编辑、移动、删除</p><span class="fg">试试</span></div>';
  h += '<div style="height:20px"></div></div>';
  return h;
};
SCREENS.msgp.after = function (root) { bindMsgScreen(root); };

/* ---------- 01b 群聊消息（群体系，零好友概念） ---------- */
SCREENS.msgg = function () {
  var d = DB.data;
  var h = navBar('群聊消息', { back:false,
    right:'<div class="nav-r">' +
      '<div class="nav-i"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div>' +
      '<div class="nav-i" data-catmanage><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></div>' +
      '</div>'
  });
  h += '<div class="body">';

  h += '<div class="zone-h"><span class="zone-t">群聊</span>' +
    '<span class="zone-s">' + d.groups.length + ' 个群</span></div>';

  Q.catList('g').forEach(function (c) {
    var gs = Q.groupsOf(c.id);
    var un = Q.catUnread(c.id);
    var fold = c.collapsed ? ' fold' : '';
    h += '<div class="grp' + fold + (un ? ' has-unread' : '') + '" data-grp="' + c.id + '" data-kind="g">' +
      '<div class="grp-h">' +
      '<svg class="tri" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>' +
      '<span class="grp-n">' + H.esc(c.name) + '</span>' +
      (un ? '<span class="grp-badge">' + un + '</span>' : '') +
      '<span class="grp-cnt">' + gs.length + ' 群</span>' +
      '</div>';
    h += '<div class="grp-b">';
    if (!gs.length) h += '<div class="grp-empty">分组里还没有群，点「未分组群聊」或右上角菜单添加</div>';
    gs.forEach(function (g) { h += groupRow(g); });
    h += '</div></div>';
  });

  /* 未分组群聊（只属于群聊体系） */
  var ugs = Q.uncatGroups();
  if (ugs.length) {
    var ugFold = DB.data.settings.ugFolded ? ' fold' : '';
    h += '<div class="grp' + ugFold + '" data-grp="__ug" data-kind="g">' +
      '<div class="grp-h">' +
      '<svg class="tri" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>' +
      '<span class="grp-n" style="color:#888">未分组群聊</span>' +
      '<span class="grp-cnt">' + ugs.length + '</span>' +
      '</div><div class="grp-b">';
    ugs.forEach(function (g) { h += groupRow(g); });
    h += '</div></div>';
  }

  h += '<div class="addgrp" data-newgrp="g">+ 新建群分组</div>';

  h += '<div class="folds" data-tip="sort" style="margin-top:14px">' +
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>' +
    '<p>分组<b>长按可拖拽排序</b>；群聊<b>左滑</b>可编辑、移动、删除</p><span class="fg">试试</span></div>';
  h += '<div style="height:20px"></div></div>';
  return h;
};
SCREENS.msgg.after = function (root) { bindMsgScreen(root); };

/* ---------- 分组长按拖拽排序（触屏 + 鼠标） ---------- */
function bindGroupReorder(root) {
  var heads = Array.prototype.slice.call(root.querySelectorAll('.grp[data-grp]'))
    .filter(function (el) { return el.dataset.grp.charAt(0) !== '_'; });  /* 排除 __up/__ug */
  if (heads.length < 2) return;

  var dragEl = null, ghost = null, timer = null, startY = 0, moved = false;

  function start(x, y) {
    moved = false;
    var r = dragEl.querySelector('.grp-h').getBoundingClientRect();
    ghost = dragEl.querySelector('.grp-h').cloneNode(true);
    ghost.className = 'grp-h ghost-bar';
    ghost.style.width = r.width + 'px';
    ghost.style.left = r.left + 'px';
    ghost.style.top = (y - r.height / 2) + 'px';
    document.body.appendChild(ghost);
    dragEl.classList.add('grp-dragging');
    document.body.classList.add('cat-sorting');
    H.haptic(12);
  }
  function move(x, y) {
    if (!ghost) return;
    moved = true;
    ghost.style.top = (y - 24) + 'px';
    for (var i = 0; i < heads.length; i++) {
      var o = heads[i];
      if (o === dragEl) continue;
      var hh = o.querySelector('.grp-h').getBoundingClientRect();
      if (y >= hh.top - 26 && y <= hh.bottom + 26) {
        var dR = dragEl.getBoundingClientRect();
        if (hh.top < dR.top && o.previousElementSibling !== dragEl) {
          o.parentNode.insertBefore(dragEl, o);
          H.haptic(6);
        } else if (hh.top > dR.top && o.nextElementSibling !== dragEl) {
          o.parentNode.insertBefore(dragEl, o.nextElementSibling);
          H.haptic(6);
        }
        break;
      }
    }
  }
  function end() {
    if (!ghost) { return; }
    ghost.remove(); ghost = null;
    dragEl.classList.remove('grp-dragging');
    document.body.classList.remove('cat-sorting');
    if (moved) {
      /* 按 DOM 顺序写回分组顺序（保持 p/g 混排顺序） */
      var order = [];
      root.querySelectorAll('.grp[data-grp]').forEach(function (el) {
        if (el.dataset.grp.charAt(0) !== '_') order.push(el.dataset.grp);
      });
      var map = {};
      DB.data.categories.forEach(function (c) { map[c.id] = c; });
      var next = [];
      order.forEach(function (id) { if (map[id]) { next.push(map[id]); delete map[id]; } });
      Object.keys(map).forEach(function (id) { next.push(map[id]); });
      DB.data.categories = next;
      DB.save();
      H.haptic();
      toast('分组顺序已保存');
      setTimeout(function () { render(true); }, 240);
    }
    var d = dragEl; dragEl = null;
    if (d) { d._justDragged = true; setTimeout(function(){ d._justDragged = false; }, 420); }
  }

  heads.forEach(function (el) {
    var hEl = el.querySelector('.grp-h');
    hEl.addEventListener('touchstart', function (e) {
      if (dragEl) return;
      var t = e.touches[0];
      startY = t.clientY;
      timer = setTimeout(function () { dragEl = el; start(t.clientX, t.clientY); }, 300);
    }, { passive:true });
    hEl.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      if (!dragEl) { clearTimeout(timer); return; }
      e.preventDefault(); move(t.clientX, t.clientY);
    }, { passive:false });
    hEl.addEventListener('touchend', function () {
      clearTimeout(timer);
      if (dragEl === el && ghost) end();
      dragEl = null;
    });
    hEl.addEventListener('touchcancel', function () {
      clearTimeout(timer);
      if (dragEl === el && ghost) end();
      dragEl = null;
    });
    /* 鼠标（电脑测试用） */
    hEl.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || dragEl) return;
      var sy0 = e.clientY;
      function mm(ev) {
        if (!dragEl && Math.abs(ev.clientY - sy0) < 5) return;
        if (!dragEl) { dragEl = el; start(ev.clientX, ev.clientY); }
        move(ev.clientX, ev.clientY);
      }
      function mu() {
        document.removeEventListener('mousemove', mm);
        document.removeEventListener('mouseup', mu);
        if (dragEl === el) { end(); dragEl = null; }
      }
      document.addEventListener('mousemove', mm);
      document.addEventListener('mouseup', mu);
    });
  });
}

/* ==========================================================
   02/03/04 分组房间（好友分组 = 好友列表 / 群分组 = 群列表）
   ========================================================== */
SCREENS.category = function (p) {
  var cid = p.id;
  var c = Q.cat(cid);
  if (!c) return '<div class="empty">分组不存在</div>';
  var isG = c.kind === 'g';
  var gs = isG ? Q.groupsOf(cid) : [];
  var ps = isG ? [] : Q.peopleOf(cid);
  var otherUn = 0;
  DB.data.categories.forEach(function (x) { if (x.id !== cid) otherUn += Q.catUnread(x.id); });

  var h = navBar(H.esc(c.name), {
    right:'<div class="nav-r">' +
      '<div class="nav-i"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div>' +
      '<div class="nav-i" data-catmenu><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></div>' +
      '</div>'
  });
  h += '<div class="body">';

  if (isG) {
    h += '<div class="sec grey">群聊<span>' + gs.length + ' 个</span></div>';
    if (!gs.length) h += '<div class="empty" style="padding:34px 20px">这个分组里还没有群</div>';
    gs.forEach(function (g) { h += groupRow(g); });
    var ou = Q.uncatGroups().length;
    h += '<div class="row noline" data-tidyadd style="justify-content:center;color:#07C160;font-size:15px">' +
      '+ 从「未分组群聊」中添加（' + ou + '）</div>';
  } else {
    h += '<div class="sec grey">好友<span>' + ps.length + ' 人 · ' + Q.onlineCount(cid) + ' 人在线</span></div>';
    if (!ps.length) h += '<div class="empty" style="padding:34px 20px">这个分组里还没有好友</div>';
    ps.forEach(function (p2) { h += personRow(p2); });
    var up = Q.uncatPeople().length;
    h += '<div class="row noline" data-tidyadd style="justify-content:center;color:#07C160;font-size:15px">' +
      '+ 从「未分组好友」中添加（' + up + '）</div>';
  }

  if (otherUn > 0) {
    h += '<div class="folds">' +
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>' +
      '<p>其他分组还有 <b>' + otherUn + ' 条新消息</b>，切到对应分组查看</p>' +
      '<span class="fg">展开</span></div>';
  }
  h += '<div style="height:20px"></div></div>';
  return h;
};

SCREENS.category.after = function (root, p) {
  root.querySelectorAll('[data-group]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('chat', { kind:'group', id:el.dataset.group }); };
  });
  root.querySelectorAll('[data-person]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('chat', { kind:'person', id:el.dataset.person }); };
  });
  var t = root.querySelector('[data-tidyadd]');
  if (t) t.onclick = function () {
    H.haptic();
    var cc = Q.cat(p.id);
    go('tidy', { addTo:p.id, kind: cc ? cc.kind : null });
  };
  var m = root.querySelector('[data-catmenu]');
  if (m) m.onclick = function () { H.haptic(); go('catmenu', { id:p.id }); };
  var f = root.querySelector('.folds');
  if (f) f.onclick = function () { H.haptic(); toast('其他分组的消息不会丢，切过去就能看'); };
};

/* ==========================================================
   05 聊天详情
   ========================================================== */
SCREENS.chat = function (p) {
  var isG = p.kind === 'group';
  var isS = p.kind === 'stranger';
  var obj = isG ? Q.group(p.id) : (isS ? Q.stranger(p.id) : Q.person(p.id));
  if (!obj) return '<div class="empty">会话不存在</div>';
  var msgs = Q.chat(p.id);
  if (isG) A.readGroup(p.id);
  else if (obj.unread) { obj.unread = 0; DB.save(); }

  var h = navBar(H.esc(obj.name), {
    right:'<div class="nav-r">' +
      (isG ? '<span class="nav-act" style="font-size:15px">' + (obj.members ? obj.members.length : 0) + '</span>' : '') +
      (isS ? '' : '<div class="nav-i" data-chatmore><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></div>') +
      '</div>'
  });
  h += '<div class="chat" id="chatBody">';
  msgs.forEach(function (m) {
    if (m.sys) { h += '<div class="c-sys"><span>' + H.esc(m.t) + '</span></div>'; return; }
    var av = m.me ? DB.data.me.av : (isG ? AV.chen : obj.av);
    var initial = m.me ? DB.data.me.name.charAt(0) : (m.who || obj.name).charAt(0);
    var inner;
    if (m.img) {
      /* 真·图片消息：本体在 IndexedDB，after 里异步填充 */
      inner = '<div class="bub bub-imgw"><img class="bub-img" data-imgload="' +
        H.esc(m.img) + '" alt="图片"></div>';
    } else if (m.geo) {
      /* 真·位置消息：地图卡片（OpenStreetMap 瓦片） */
      inner = '<div class="bub geo-bub"><div class="geo-card" data-geo="' +
        m.geo.lat + ',' + m.geo.lng + '">' +
        '<div class="geo-map"></div>' +
        '<div class="geo-meta"><b>我的位置</b><span>' +
        m.geo.lat.toFixed(4) + ', ' + m.geo.lng.toFixed(4) + '</span></div>' +
        '</div></div>';
    } else {
      inner = '<div class="bub' + (m.me ? ' me' : '') + '">' + H.esc(m.t) + '</div>';
    }
    h += '<div class="cline' + (m.me ? ' me' : '') + '">' +
      '<div class="cav" style="background:' + av + '">' + H.esc(initial) + '</div>' +
      '<div class="cbody">' +
      (isG && !m.me ? '<div class="cwho">' + H.esc(m.who || '') + '</div>' : '') +
      (m.quote ? '<div class="quote">' + H.esc(m.quote) + '</div>' : '') +
      inner +
      '</div></div>';
  });
  h += '</div>';
  /* 陌生人会话：只能发文字（类似抖音陌生人聊天），无语音/表情/图片/文件入口 */
  h += '<div class="ibar">' +
    (isS ? '' : '<div class="ib-ic" data-voice><svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7"/></svg></div>') +
    '<textarea class="ib-in" rows="1" placeholder="' + (isS ? '仅支持文字聊天' : '说点什么…') + '"></textarea>' +
    (isS ? '' :
      '<div class="ib-ic" data-emoji><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.3 1.6 3.5 1.6 3.5-1.6 3.5-1.6M9 9.5h.01M15 9.5h.01"/></svg></div>' +
      '<div class="ib-ic" data-plus><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg></div>') +
    '</div>';
  return h;
};

SCREENS.chat.after = function (root, p) {
  var isS = p.kind === 'stranger';
  var ta = root.querySelector('.ib-in');
  var body = root.querySelector('#chatBody');
  if (body) body.scrollTop = body.scrollHeight;
  var more = root.querySelector('[data-chatmore]');
  if (more) more.onclick = function () {
    H.haptic();
    go(p.kind === 'group' ? 'groupset' : 'profile', { id:p.id, kind:p.kind });
  };
  var plus = root.querySelector('[data-plus]');
  if (plus) plus.onclick = function () { H.haptic(); go('panel', p); };
  var voice = root.querySelector('[data-voice]');
  if (voice) voice.onclick = function () { H.haptic(); go('recording', p); };
  var emoji = root.querySelector('[data-emoji]');
  if (emoji) emoji.onclick = function () { H.toast('😀 表情面板（原型省略）'); };

  /* 真·图片：从 IndexedDB 取图填充；点击看大图 */
  function lightbox(src) {
    var d = document.createElement('div');
    d.className = 'c-lightbox';
    d.innerHTML = '<img alt="大图">';
    d.querySelector('img').src = src;
    d.onclick = function () { d.remove(); };
    document.body.appendChild(d);
  }
  root.querySelectorAll('[data-imgload]').forEach(function (img) {
    IM.get(img.dataset.imgload, function (data) {
      if (data) { img.src = data; }
      else { var w = img.closest('.bub-imgw'); if (w) w.style.display = 'none'; }
    });
    img.onload = function () {
      if (body) body.scrollTop = body.scrollHeight;
    };
    img.onclick = function () {
      if (img.src) lightbox(img.src);
    };
  });

  /* 真·位置：拼 3×3 OSM 瓦片，图钉落在卡片中心；点卡片看大地图 */
  root.querySelectorAll('[data-geo]').forEach(function (card) {
    var pt = card.dataset.geo.split(',');
    var lat = +pt[0], lng = +pt[1];
    var map = card.querySelector('.geo-map');
    var g = IM.grid(lat, lng, 15);
    var inner = document.createElement('div');
    inner.className = 'geo-inner';
    g.tiles.forEach(function (tl) {
      var t = document.createElement('img');
      t.className = 'geo-tile';
      t.alt = '';
      t.style.left = tl.left + 'px';
      t.style.top = tl.top + 'px';
      t.onload = function () { t.classList.add('ld'); };
      t.onerror = function () {
        /* 主源失败 → 自动换备用源 */
        var n = (t._retry || 0) + 1;
        if (n <= 2) { t._retry = n; t.src = IM.tileUrl(15, tl.x, tl.y, n); }
      };
      t.src = IM.tileUrl(15, tl.x, tl.y, 0);
      inner.appendChild(t);
    });
    var pin = document.createElement('div');
    pin.className = 'geo-pin';
    map.appendChild(inner);
    map.appendChild(pin);
    var mw = map.clientWidth || 216, mh = map.clientHeight || 118;
    inner.style.left = (mw / 2 - g.pin.x) + 'px';
    inner.style.top = (mh / 2 - g.pin.y) + 'px';
    card.onclick = function () {
      H.haptic();
      window.open(IM.osmLink(lat, lng, 16), '_blank');
    };
  });

  function doSend() {
    var v = ta.value.trim(); if (!v) return;
    A.send(p.id, v);
    A.setPrev(p.id, '我：' + v);
    ta.value = ''; ta.style.height = 'auto';
    H.haptic();
    render(true);
    var b = document.querySelector('#chatBody');
    if (b) b.scrollTop = b.scrollHeight;
  }
  ta.onkeydown = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  };
  ta.oninput = function () { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 104) + 'px'; };
  ta.onblur = function () { if (ta.value.trim()) doSend(); };
  void isS;
};

/* ---------- 06 发送面板 ---------- */
SCREENS.panel = function (p) {
  var obj = p.kind === 'group' ? Q.group(p.id) : Q.person(p.id);
  var h = navBar(H.esc(obj ? obj.name : ''), { right:'<div class="nav-r"></div>' });
  h += '<div class="body" style="background:#F7F7F7">' +
    '<div style="padding:40px 20px;text-align:center;color:#B2B2B2;font-size:13.5px">选择要发送的内容</div></div>';
  var items = [
    ['图片','<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M3 17l5-5 4 4 3-3 6 6"/>'],
    ['拍摄','<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.2"/>'],
    ['语音通话','<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.4-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/>'],
    ['视频通话','<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/>'],
    ['位置','<path d="M12 21s-7-4.6-7-10a7 7 0 1114 0c0 5.4-7 10-7 10z"/><circle cx="12" cy="11" r="2.6"/>'],
    ['文件','<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>'],
    ['转账','<circle cx="12" cy="12" r="9"/><path d="M12 7v10M14.5 9.5c-.6-1-1.5-1.5-2.5-1.5-1.7 0-3 1-3 2s1 1.8 3 2 3 1 3 2-1.3 2-3 2c-1 0-1.9-.5-2.5-1.5"/>'],
    ['收藏','<path d="M12 2l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/>'],
    ['名片','<rect x="2" y="5" width="20" height="14" rx="2.5"/><circle cx="8.5" cy="11" r="2.2"/><path d="M5 16.5c.7-1.6 2-2.4 3.5-2.4s2.8.8 3.5 2.4M15 10h5M15 14h4"/>'],
    ['群接龙','<path d="M4 6h16M4 12h16M4 18h10"/>'],
    ['提醒','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'],
    ['更多','<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>']
  ];
  h += '<div class="panel" style="padding-top:20px"><div class="pgrid">';
  items.forEach(function (it) {
    h += '<div class="pg" data-pg="' + it[0] + '"><div class="pg-ic">' +
      '<svg viewBox="0 0 24 24">' + it[1] + '</svg></div>' +
      '<div class="pg-l">' + it[0] + '</div></div>';
  });
  h += '</div></div>';
  return h;
};
/* ---------- 真·图片：选相册 / 调相机 → 压缩 → 存图库 → 发送 ---------- */
function pickImage(p, capture) {
  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  if (capture) inp.setAttribute('capture', 'environment');   /* 拍摄：直接调起后置相机 */
  inp.style.display = 'none';
  document.body.appendChild(inp);
  inp.onchange = function () {
    var f = inp.files && inp.files[0];
    inp.remove();
    if (!f) return;                       /* 用户取消选择 */
    H.toast('正在处理图片…');
    IM.compress(f, function (key) {
      if (!key) { H.toast('图片处理失败，换一张试试'); return; }
      A.sendImg(p.id, key);
      A.setPrev(p.id, '我：［图片］');
      H.haptic();
      back();
      var b = document.querySelector('#chatBody');
      if (b) setTimeout(function () { b.scrollTop = b.scrollHeight; }, 80);
    });
  };
  inp.click();
}

/* ---------- 真·定位：iOS 弹授权 → 真实经纬度 → 地图卡片 ---------- */
function sendLocation(p) {
  if (!navigator.geolocation) { H.toast('这台设备不支持定位'); return; }
  H.toast('正在定位…');
  navigator.geolocation.getCurrentPosition(function (pos) {
    var geo = {
      lat: +pos.coords.latitude.toFixed(6),
      lng: +pos.coords.longitude.toFixed(6)
    };
    A.sendGeo(p.id, geo);
    A.setPrev(p.id, '我：［位置］');
    H.haptic();
    back();
    var b = document.querySelector('#chatBody');
    if (b) setTimeout(function () { b.scrollTop = b.scrollHeight; }, 80);
  }, function () {
    H.toast('没有获得定位权限，去设置里允许「位置」');
  }, { enableHighAccuracy:false, timeout:8000, maximumAge:60000 });
}

SCREENS.panel.after = function (root, p) {
  root.querySelectorAll('[data-pg]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var k = el.dataset.pg;
      if (k === '语音通话' || k === '视频通话') { go('call', { id:p.id, kind:p.kind, mode:k }); return; }
      /* 真实功能：图片 / 拍摄 / 位置 */
      if (k === '图片')  { pickImage(p, false); return; }
      if (k === '拍摄')  { pickImage(p, true);  return; }
      if (k === '位置')  { sendLocation(p);     return; }
      /* 其余保持演示占位 */
      A.send(p.id, '［' + k + '］');
      A.setPrev(p.id, '我：［' + k + '］');
      H.toast('已发送' + k);
      back();
      var b = document.querySelector('#chatBody');
      if (b) setTimeout(function(){ b.scrollTop = b.scrollHeight; }, 60);
    };
  });
};
