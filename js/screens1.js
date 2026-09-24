/* ==========================================================
   界面 01-07 —— 消息目录 / 分类房间 / 聊天 / 群聊 / 发送面板
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
function bindNav(html) { return html; }

/* ---------- 01 消息 · 分类目录 ---------- */
SCREENS.msg = function () {
  var d = DB.data;
  var unreadCats = Q.unreadCatCount();
  var totalUn = Q.totalUnread();
  var h = navBar('消息', {
    back:false,
    right:'<div class="nav-r">' +
      '<div class="nav-i"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div>' +
      '<div class="nav-i" data-newcat><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>' +
      '</div>'
  });
  h += '<div class="body">';
  h += '<div class="hero"><div class="hero-t">' +
    (unreadCats ? unreadCats + ' 个分类有未读' : '全部已读') + '</div>' +
    '<div class="hero-d">' + (unreadCats
      ? d.categories.filter(function(c){return Q.catUnread(c.id)>0;})
          .map(function(c){return c.name+' '+Q.catUnread(c.id);}).join(' · ')
        : '所有分类都处理完了') +
    ' —— 点开分类，只看这一类</div></div>';

  /* 置顶分类排前面 */
  var cats = d.categories.slice().sort(function (a, b) {
    return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
  });
  cats.forEach(function (c) {
    var u = Q.catUnread(c.id);
    h += '<div class="cat" data-cat="' + c.id + '"><div class="cat-in">' +
      H.catIcon(c.id) +
      '<div class="cat-nm"><div class="cat-t">' + H.esc(c.name) +
        (c.pinned ? ' <span style="font-size:11px;color:#07C160;font-weight:500">置顶</span>' : '') +
      '</div><div class="cat-s">' + H.esc(Q.latestLine(c.id)) + '</div></div>' +
      (u ? '<div class="badge">' + u + '</div>' : '<div class="cat-n">' + Q.catTotal(c.id) + '</div>') +
      '<svg class="arw" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>' +
      '</div></div>';
  });

  /* 未分类 */
  var uc = Q.uncatCount();
  if (uc > 0) {
    h += '<div class="cat" data-cat="__uncat"><div class="cat-in">' +
      '<div class="cat-ic" style="background:' + AV.grey + '"><svg viewBox="0 0 24 24" style="stroke:#fff;fill:none;stroke-width:1.9;stroke-linecap:round"><path d="M4 5h16v11H7l-3 3z"/></svg></div>' +
      '<div class="cat-nm"><div class="cat-t">未分类</div>' +
      '<div class="cat-s">建议整理：让每个群和人都有自己的位置</div></div>' +
      '<div class="cat-n">' + uc + '</div>' +
      '<svg class="arw" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>' +
      '</div></div>';
  }

  h += '<div class="newcat" data-newcat>+ 新建分类</div>';
  h += '<div class="folds" data-tip="folds"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>' +
    '<p>分类是<b>可拖拽排序</b>的，长按分类卡即可调整顺序</p><span class="fg">试试</span></div>';
  h += '<div style="height:20px"></div></div>';
  return h;
};

SCREENS.msg.after = function (root) {
  root.querySelectorAll('[data-cat]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var id = el.dataset.cat;
      if (id === '__uncat') go('tidy');
      else go('category', { id:id });
    };
  });
  root.querySelectorAll('[data-newcat]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('newcat'); };
  });
};

/* ---------- 02/03/04 分类房间 ---------- */
SCREENS.category = function (p) {
  var cid = p.id;
  var c = Q.cat(cid);
  if (!c) return '<div class="empty">分类不存在</div>';
  var gs = Q.groupsOf(cid), ps = Q.peopleOf(cid);
  var otherUn = 0;
  DB.data.categories.forEach(function (x) { if (x.id !== cid) otherUn += Q.catUnread(x.id); });

  var h = navBar(H.esc(c.name), {
    right:'<div class="nav-r">' +
      '<div class="nav-i"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div>' +
      '<div class="nav-i" data-catmenu><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></div>' +
      '</div>'
  });
  h += '<div class="body">';
  h += '<div class="sec grey">群聊<span>' + gs.length + ' 个</span></div>';
  if (!gs.length) h += '<div class="empty" style="padding:34px 20px">这个分类里还没有群</div>';
  gs.forEach(function (g) {
    h += '<div class="row" data-group="' + g.id + '">' + H.avGroup(g) +
      '<div class="mid"><div class="tt"><div class="nm">' + H.esc(g.name) + '</div>' +
      '<div class="tm">' + H.esc(g.t) + '</div></div>' +
      '<div class="pv">' + H.esc(g.prev) + '</div></div>' +
      (g.unread ? '<div class="badge">' + g.unread + '</div>' : (g.dot ? '<div class="dotr"></div>' : '')) +
      '</div>';
  });

  h += '<div class="sec">好友<span>' + ps.length + ' 人</span></div>';
  if (!ps.length) h += '<div class="empty" style="padding:34px 20px">这个分类里还没有好友</div>';
  var lastIdx = '';
  ps.slice().sort(function(a,b){return a.name.localeCompare(b.name,'zh');}).forEach(function (p2) {
    var idx = pinyinIdx(p2.name);
    if (idx !== lastIdx && ps.length > 6) { h += '<div class="idxh">' + idx + '</div>'; lastIdx = idx; }
    h += '<div class="row" data-person="' + p2.id + '">' +
      '<div class="av" style="background:' + p2.av + '">' + H.esc(p2.name.charAt(0)) + '</div>' +
      '<div class="mid"><div class="nm">' + H.esc(p2.name) + '</div>' +
      (p2.remark ? '<div class="pv">' + H.esc(p2.remark) + '</div>' : '') + '</div></div>';
  });

  /* 把未分类的拉进来 */
  var others = Q.uncatGroups().length + Q.uncatPeople().length;
  h += '<div class="row noline" data-tidyadd style="justify-content:center;color:#07C160;font-size:15px">' +
    '+ 从「未分类」中添加（' + others + '）</div>';

  if (otherUn > 0) {
    h += '<div class="folds">' +
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>' +
      '<p>其他分类还有 <b>' + otherUn + ' 条新消息</b>，切到对应分类查看</p>' +
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
  if (t) t.onclick = function () { H.haptic(); go('tidy', { addTo:p.id }); };
  var m = root.querySelector('[data-catmenu]');
  if (m) m.onclick = function () { H.haptic(); go('catmenu', { id:p.id }); };
  var f = root.querySelector('.folds');
  if (f) f.onclick = function () { H.haptic(); toast('其他分类的消息不会丢，切过去就能看'); };
};

/* ---------- 05 聊天详情 ---------- */
SCREENS.chat = function (p) {
  var isG = p.kind === 'group';
  var obj = isG ? Q.group(p.id) : Q.person(p.id);
  if (!obj) return '<div class="empty">会话不存在</div>';
  var msgs = Q.chat(isG ? p.id : p.id);
  if (isG) A.readGroup(p.id);

  var h = navBar(H.esc(obj.name), {
    right:'<div class="nav-r">' +
      (isG ? '<span class="nav-act" style="font-size:15px">' + (obj.members ? obj.members.length : 0) + '</span>' : '') +
      '<div class="nav-i" data-chatmore><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></div>' +
      '</div>'
  });
  h += '<div class="chat" id="chatBody">';
  msgs.forEach(function (m) {
    if (m.sys) { h += '<div class="c-sys"><span>' + H.esc(m.t) + '</span></div>'; return; }
    var av = m.me ? DB.data.me.av : (isG ? AV.chen : obj.av);
    var initial = m.me ? DB.data.me.name.charAt(0) : (m.who || obj.name).charAt(0);
    h += '<div class="cline' + (m.me ? ' me' : '') + '">' +
      '<div class="cav" style="background:' + av + '">' + H.esc(initial) + '</div>' +
      '<div class="cbody">' +
      (isG && !m.me ? '<div class="cwho">' + H.esc(m.who || '') + '</div>' : '') +
      (m.quote ? '<div class="quote">' + H.esc(m.quote) + '</div>' : '') +
      '<div class="bub' + (m.me ? ' me' : '') + '">' + H.esc(m.t) + '</div>' +
      '</div></div>';
  });
  h += '</div>';
  h += '<div class="ibar">' +
    '<div class="ib-ic" data-voice><svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7"/></svg></div>' +
    '<textarea class="ib-in" rows="1" placeholder="说点什么…"></textarea>' +
    '<div class="ib-ic" data-emoji><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.3 1.6 3.5 1.6 3.5-1.6 3.5-1.6M9 9.5h.01M15 9.5h.01"/></svg></div>' +
    '<div class="ib-ic" data-plus><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg></div>' +
    '</div>';
  return h;
};

SCREENS.chat.after = function (root, p) {
  var ta = root.querySelector('.ib-in');
  var body = root.querySelector('#chatBody');
  if (body) body.scrollTop = body.scrollHeight;
  root.querySelector('[data-chatmore]').onclick = function () {
    H.haptic();
    go(p.kind === 'group' ? 'groupset' : 'profile', { id:p.id, kind:p.kind });
  };
  root.querySelector('[data-plus]').onclick = function () { H.haptic(); go('panel', p); };
  root.querySelector('[data-voice]').onclick = function () { H.haptic(); go('recording', p); };
  root.querySelector('[data-emoji]').onclick = function () { H.toast('😀 表情面板（原型省略）'); };
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
SCREENS.panel.after = function (root, p) {
  root.querySelectorAll('[data-pg]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var k = el.dataset.pg;
      if (k === '语音通话' || k === '视频通话') { go('call', { id:p.id, kind:p.kind, mode:k }); return; }
      if (k === '位置') {
        A.send(p.id, '［位置］中关村软件园 · 北京市海淀区');
        A.setPrev(p.id, '我：［位置］中关村软件园');
        H.toast('已发送位置');
      } else if (k === '文件') {
        A.send(p.id, '［文件］设计规范-v3.pdf · 4.2 MB');
        A.setPrev(p.id, '我：［文件］设计规范-v3.pdf');
        H.toast('已发送文件');
      } else {
        A.send(p.id, '［' + k + '］');
        A.setPrev(p.id, '我：［' + k + '］');
        H.toast('已发送' + k);
      }
      back();
      var b = document.querySelector('#chatBody');
      if (b) setTimeout(function(){ b.scrollTop = b.scrollHeight; }, 60);
    };
  });
};

