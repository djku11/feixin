/* ==========================================================
   界面 08-14 —— 功能 / 广场 / 朋友圈 / 我 / 设置 / 资料 / 分类管理
   + 17-20 整理未分类 · 归类选择器 · 拖拽归类 · 新建分类
   ========================================================== */

if (!window.SCREENS) { window.SCREENS = {}; }
var SCREENS = window.SCREENS;

/* ---------- 拼音首字母（简表，够用） ---------- */
var PY = {陈:'C',林:'L',苏:'S',周:'Z',吴:'W',赵:'Z',李:'L',王:'W',老:'L',妈:'M',爸:'B',姐:'J',我:'W'};
function pinyinIdx(n) { return PY[n.charAt(0)] || n.charAt(0).toUpperCase(); }

/* ---------- 08 功能 ---------- */
SCREENS.tools = function () {
  var h = navBar('功能', { back:false,
    right:'<div class="nav-r"><div class="nav-i"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div></div>' });
  h += '<div class="body" style="background:var(--bg)">';
  function sec(t) { return '<div class="sec grey">' + t + '</div>'; }
  function row(icon, bg, name, val) {
    return '<div class="frow" data-f="' + name + '"><div class="fic" style="background:' + bg + '">' +
      '<svg viewBox="0 0 24 24">' + icon + '</svg></div><div class="fn">' + name + '</div>' +
      (val ? '<div class="fv">' + val + '</div>' : '') + '</div>';
  }
  h += sec('我的工具');
  h += '<div class="card">' +
    row('<path d="M12 2l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/>','rgba(139,107,245,.14)','收藏','128 条') +
    row('<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>','rgba(255,149,0,.14)','文件','2.4 GB') +
    row('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M14.5 9.5c-.6-1-1.5-1.5-2.5-1.5-1.7 0-3 1-3 2s1 1.8 3 2 3 1 3 2-1.3 2-3 2c-1 0-1.9-.5-2.5-1.5"/>','rgba(245,166,35,.16)','钱包与转账') +
    row('<rect x="2" y="6" width="20" height="13" rx="2.5"/><path d="M2 10h20M6 15h4"/>','rgba(16,174,255,.14)','卡包','6 张') +
    '</div>';
  h += sec('设备与互联');
  h += '<div class="card">' +
    row('<rect x="4" y="2" width="16" height="20" rx="3"/><path d="M9 18h6"/>','rgba(7,193,96,.14)','手机投屏') +
    row('<rect x="2" y="5" width="20" height="13" rx="2.5"/><path d="M8 21h8"/>','rgba(90,200,250,.16)','电脑传文件','已连接') +
    row('<path d="M12 3v9M12 21a8 8 0 008-8H4a8 8 0 008 8z"/>','rgba(255,107,107,.14)','多端同步','3 台') +
    '</div>';
  h += sec('常用小程序');
  h += '<div class="card">' +
    row('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 9h8M8 14h5"/>','rgba(7,193,96,.14)','待办清单') +
    row('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>','rgba(139,107,245,.14)','日程表') +
    row('<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>','rgba(255,149,0,.14)','便签') +
    '</div>';
  h += '<div style="height:20px"></div></div>';
  return h;
};
SCREENS.tools.after = function (root) {
  root.querySelectorAll('[data-f]').forEach(function (el) {
    el.onclick = function () { H.haptic(); H.toast(el.dataset.f + '：原型中为占位入口'); };
  });
};

/* ---------- 09 广场 ---------- */
SCREENS.plaza = function () {
  var h = navBar('广场', { back:false,
    right:'<div class="nav-r"><div class="nav-i"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div></div>' });
  h += '<div class="body" style="background:var(--bg)">';
  h += '<div class="hero" style="margin-top:12px"><div class="hero-t">朋友们的动态</div>' +
    '<div class="hero-d">' + DB.data.moments.length + ' 位好友更新了状态，1 条新评论</div></div>';
  var tiles = [
    ['朋友圈','好友动态与相册','hobby','<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 000 18z" fill="#fff" fill-opacity=".3"/>'],
    ['动态','短图文与话题','globe','<path d="M3 6h18v12H3z"/><path d="M7 10h10M7 14h6"/>'],
    ['群组发现','按兴趣找群','work','<circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.6"/><path d="M2.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5"/>'],
    ['兴趣圈','设计 · 摄影 · 户外','star','<path d="M12 2l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/>'],
    ['附近','周边的人与活动','family','<path d="M12 21s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.4-7 10-7 10z"/>'],
    ['视频号','好友在看的内容','school','<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="12" cy="10" r="2.5"/><path d="M7 17c1-2 2.8-3 5-3s4 1 5 3"/>']
  ];
  h += '<div class="pgrid2">';
  tiles.forEach(function (t) {
    var ic = ICONS[t[2]];
    h += '<div class="ptile" data-tile="' + t[0] + '"><div class="fic" style="background:' + ic.bg + '">' +
      '<svg viewBox="0 0 24 24">' + ic.svg.replace(/fill="#fff" fill-opacity=".3"/g, 'fill="rgba(255,255,255,.35)"') + '</svg></div>' +
      '<div class="pt-n">' + t[0] + '</div><div class="pt-d">' + t[1] + '</div></div>';
  });
  h += '</div><div style="height:20px"></div></div>';
  return h;
};
SCREENS.plaza.after = function (root) {
  root.querySelectorAll('[data-tile]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      if (el.dataset.tile === '朋友圈') go('moments');
      else H.toast(el.dataset.tile + '：原型中为占位入口');
    };
  });
};

/* ---------- 10 朋友圈 ---------- */
SCREENS.moments = function () {
  var h = navBar('朋友圈', { right:'<div class="nav-r"><div class="nav-i"><svg viewBox="0 0 24 24"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.2"/></svg></div></div>' });
  h += '<div class="body" style="background:#fff">';
  DB.data.moments.forEach(function (m, i) {
    var colors = [['#A8D8FF','#5B8FD6'],['#FFD9A8','#E8A04A'],['#C9E8B8','#5FA85F']];
    h += '<div class="mo"><div class="mo-h"><div class="av sm" style="background:' + m.av + '">' +
      H.esc(m.who.charAt(0)) + '</div><div><div class="mo-n">' + H.esc(m.who) + '</div>' +
      '<div style="font-size:12px;color:#B2B2B2;margin-top:2px">' + H.esc(m.time) + '</div></div></div>' +
      '<div class="mo-t">' + H.esc(m.t) + '</div>';
    h += '<div class="mo-ims">';
    for (var k = 0; k < 3; k++) {
      var c = colors[(i + k) % 3];
      h += '<div class="mo-im" style="background:linear-gradient(140deg,' + c[0] + ',' + c[1] + ')"></div>';
    }
    h += '</div>';
    h += '<div class="mo-f"><span data-like="' + i + '">♥ ' + (m.likes.length || '赞') + '</span><span>💬 评论</span></div>';
    if (m.cmts) h += '<div class="mo-c">' + H.esc(m.cmts) + '</div>';
    h += '</div>';
  });
  h += '<div style="height:20px"></div></div>';
  return h;
};
SCREENS.moments.after = function (root) {
  root.querySelectorAll('[data-like]').forEach(function (el) {
    el.onclick = function () { H.haptic(); H.toast('已点赞'); };
  });
};

/* ---------- 11 我 ---------- */
SCREENS.me = function () {
  var m = DB.data.me;
  var h = navBar('我', { back:false, right:'<div class="nav-r"></div>' });
  h += '<div class="body" style="background:var(--bg)">';
  h += '<div class="prof-hd" data-me><div class="av lg" style="background:' + m.av + ';border-radius:12px">' +
    H.esc(m.name.charAt(0)) + '</div><div style="flex:1"><div class="prof-n">' + H.esc(m.name) + '</div>' +
    '<div class="prof-i">微信号：' + H.esc(m.wxid) + '</div></div>' +
    '<svg class="arw" viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M9 5l7 7-7 7"/></svg></div>';
  function r(ic, bg, name, val) {
    return '<div class="frow" data-f="' + name + '"><div class="fic" style="background:' + bg + '">' +
      '<svg viewBox="0 0 24 24">' + ic + '</svg></div><div class="fn">' + name + '</div>' +
      (val ? '<div class="fv">' + val + '</div>' : '') +
      '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>';
  }
  h += '<div class="card">' +
    r('<path d="M12 2l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/>','rgba(139,107,245,.14)','我的收藏','128') +
    r('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/>','rgba(255,149,0,.14)','我的相册','2,483 张') +
    r('<path d="M6 4h13v16l-6.5-4L6 20z"/>','rgba(7,193,96,.14)','我的标签','6 组') +
    r('<rect x="2" y="6" width="20" height="13" rx="2.5"/><path d="M2 10h20"/>','rgba(16,174,255,.14)','卡包','6 张') +
    '</div>';
  h += '<div class="card">' +
    r('<rect x="3" y="11" width="18" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 018 0v4"/>','rgba(90,200,250,.16)','隐私') +
    r('<path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 01-3.4 0"/>','rgba(255,107,107,.14)','通知管理') +
    r('<path d="M4 5h16v11H7l-3 3z"/>','rgba(139,107,245,.14)','聊天记录管理','1.8 GB') +
    r('<circle cx="12" cy="12" r="9"/><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 006.5 19.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 003 14.6H3a2 2 0 110-4h.1A1.6 1.6 0 004.6 9.5l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 009.4 3V3a2 2 0 114 0v.1a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 001.1 2.7H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/>','rgba(120,130,140,.16)','设置','') +
    '</div>';
  h += '<div style="height:20px"></div></div>';
  return h;
};
SCREENS.me.after = function (root) {
  root.querySelector('[data-me]').onclick = function () { H.haptic(); go('profile', { id:'me', kind:'me' }); };
  root.querySelectorAll('[data-f]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      if (el.dataset.f === '设置') go('settings');
      else H.toast(el.dataset.f + '：原型中为占位入口');
    };
  });
};

/* ---------- 12 聊天设置（群） / 个人资料 ---------- */
SCREENS.groupset = function (p) {
  var g = Q.group(p.id);
  if (!g) return '<div class="empty">群不存在</div>';
  var h = navBar('聊天设置', { right:'<div class="nav-r"></div>' });
  h += '<div class="body" style="background:var(--bg)">';
  h += '<div class="card" style="margin-top:0;border-radius:0;padding:14px 16px">' +
    '<div style="display:flex;gap:12px;align-items:center">' +
    H.avGroup(g, 'lg') +
    '<div style="flex:1"><div style="font-size:17.5px;font-weight:600">' + H.esc(g.name) + '</div>' +
    '<div style="font-size:13px;color:var(--lb2);margin-top:4px">' +
    g.members.length + ' 位成员 · 我在本群的昵称：' + H.esc(DB.data.me.name) + '</div></div></div></div>';

  h += '<div class="sec grey">成员</div><div class="card" style="margin-top:0">';
  h += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;padding:16px">';
  g.members.forEach(function (nm) {
    var av = nm === DB.data.me.name ? DB.data.me.av : (AV.lin);
    h += '<div style="display:flex;flex-direction:column;align-items:center;gap:5px">' +
      '<div class="av sm" style="background:' + av + '">' + H.esc(nm.charAt(0)) + '</div>' +
      '<div style="font-size:11px;color:#888;max-width:52px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + H.esc(nm) + '</div></div>';
  });
  h += '<div style="display:flex;flex-direction:column;align-items:center;gap:5px">' +
    '<div class="av sm" style="background:#fff;border:1px dashed #CCC;color:#BBB">+</div>' +
    '<div style="font-size:11px;color:#888">添加</div></div>';
  h += '</div></div>';

  /* 分类归属 —— 核心 */
  h += '<div class="sec grey">分类归属<span>可多选，一个群可以进多个分类</span></div><div class="card" style="margin-top:0">';
  DB.data.categories.forEach(function (c) {
    var on = g.cats.indexOf(c.id) >= 0;
    h += '<div class="srow" data-gcat="' + c.id + '">' + H.catIcon(c.id, '', 32) +
      '<div class="sk" style="flex:1;min-width:0">' + H.esc(c.name) + '</div>' +
      '<div class="sw' + (on ? ' on' : '') + '"><i></i></div></div>';
  });
  h += '<div class="srow" data-newcat style="color:#07C160"><div style="font-size:16px">+ 新建分类并归入</div></div>';
  h += '</div>';

  h += '<div class="sec grey">消息设置</div><div class="card" style="margin-top:0">' +
    '<div class="srow" data-tog="msgMute"><div class="sk" style="flex:1">消息免打扰</div><div class="sw' + (DB.data.settings.msgMute ? ' on' : '') + '"><i></i></div></div>' +
    '<div class="srow" data-tog="pinChat"><div class="sk" style="flex:1">置顶聊天</div><div class="sw' + (DB.data.settings.pinChat ? ' on' : '') + '"><i></i></div></div>' +
    '<div class="srow" data-tog="saveContacts"><div class="sk" style="flex:1">保存到通讯录</div><div class="sw' + (DB.data.settings.saveContacts ? ' on' : '') + '"><i></i></div></div>' +
    '<div class="srow"><div class="sk" style="flex:1">查找聊天记录</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '</div>';

  h += '<div class="card"><div class="srow" style="justify-content:center;color:#FA5151;font-size:16px" data-del>' +
    '删除并退出</div></div>';
  h += '<div style="height:24px"></div></div>';
  return h;
};
SCREENS.groupset.after = function (root, p) {
  root.querySelectorAll('[data-gcat]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var cid = el.dataset.gcat;
      var g = Q.group(p.id);
      var on = g.cats.indexOf(cid) < 0;
      A.toggleCat('group', p.id, cid, on);
      el.querySelector('.sw').classList.toggle('on', on);
      H.toast(on ? '已归入「' + Q.cat(cid).name + '」' : '已移出「' + Q.cat(cid).name + '」');
    };
  });
  var nc = root.querySelector('[data-newcat]');
  if (nc) nc.onclick = function () { H.haptic(); go('newcat', { thenCats:'group:' + p.id }); };
  root.querySelectorAll('[data-tog]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var k = el.dataset.tog;
      DB.data.settings[k] = !DB.data.settings[k];
      DB.save();
      el.querySelector('.sw').classList.toggle('on', DB.data.settings[k]);
    };
  });
  var d = root.querySelector('[data-del]');
  if (d) d.onclick = function () { H.haptic(); H.toast('原型中不执行真实退群'); };
};

/* ---------- 13 个人资料 ---------- */
SCREENS.profile = function (p) {
  var isMe = p.kind === 'me' || p.id === 'me';
  var obj = isMe ? DB.data.me : Q.person(p.id);
  if (!obj) return '<div class="empty">不存在</div>';
  var h = navBar(isMe ? '个人信息' : '个人资料', {
    right: isMe ? '<div class="nav-r"></div>' :
      '<div class="nav-r"><div class="nav-i" data-pmore><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></div></div>'
  });
  h += '<div class="body" style="background:var(--bg)">';
  h += '<div class="card" style="margin-top:0">';
  h += '<div class="srow" style="padding-top:16px"><div class="sk">头像</div>' +
    '<div class="sv" style="display:flex;justify-content:flex-end"><div class="av lg" style="background:' +
    obj.av + ';border-radius:9px">' + H.esc(obj.name.charAt(0)) + '</div></div></div>';
  h += '<div class="srow"><div class="sk">名字</div><div class="sv dark" data-editname>' + H.esc(obj.name) + '</div></div>';
  if (!isMe) h += '<div class="srow"><div class="sk">备注</div><div class="sv" data-editremark>' + H.esc(obj.remark || '点击设置') + '</div></div>';
  h += '</div>';

  /* 分类归属 —— 核心 */
  var link = isMe ? 'me' : 'person';
  h += '<div class="sec grey">分组与分类<span>一个人可以同时在多个分类</span></div><div class="card" style="margin-top:0">';
  h += '<div class="srow"><div class="sk" style="flex:1">所属分类</div>' +
    '<div class="sv" style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;max-width:60%">' +
    (isMe ? '<span style="color:#B2B2B2;font-size:14px">自己的账号</span>' :
      (obj.cats.length ? obj.cats.map(function (cid) {
        var c = Q.cat(cid); if (!c) return '';
        return '<span style="font-size:12px;padding:4px 11px;border-radius:99px;background:#07C160;color:#fff;font-weight:600">' + H.esc(c.name) + '</span>';
      }).join('') : '<span style="color:#B2B2B2;font-size:14px">未分类</span>')) +
    '</div></div>';
  if (!isMe) {
    DB.data.categories.forEach(function (c) {
      var on = obj.cats.indexOf(c.id) >= 0;
      h += '<div class="srow" data-pcat="' + c.id + '">' + H.catIcon(c.id, '', 32) +
        '<div class="sk" style="flex:1;min-width:0">' + H.esc(c.name) + '</div>' +
        '<div class="sw' + (on ? ' on' : '') + '"><i></i></div></div>';
    });
  }
  h += '</div>';

  h += '<div class="sec grey">联系方式</div><div class="card" style="margin-top:0">' +
    '<div class="srow"><div class="sk">电话</div><div class="sv">' + H.esc(obj.phone || '138 0000 0000') + '</div></div>' +
    '<div class="srow"><div class="sk">个性签名</div><div class="sv">' + H.esc(obj.sign || '这个人很懒，什么都没写') + '</div></div>' +
    '</div>';

  if (!isMe) {
    h += '<div class="card"><div class="srow" data-sendmsg><div class="sk" style="flex:1">发消息</div>' +
      '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
      '<div class="srow" data-callper><div class="sk" style="flex:1">音视频通话</div>' +
      '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div></div>';
  }
  h += '<div style="height:24px"></div></div>';
  return h;
};
SCREENS.profile.after = function (root, p) {
  var isMe = p.kind === 'me' || p.id === 'me';
  root.querySelectorAll('[data-pcat]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var cid = el.dataset.pcat;
      var obj = Q.person(p.id);
      var on = obj.cats.indexOf(cid) < 0;
      A.toggleCat('person', p.id, cid, on);
      el.querySelector('.sw').classList.toggle('on', on);
      H.toast(on ? '已归入「' + Q.cat(cid).name + '」' : '已移出');
    };
  });
  var sm = root.querySelector('[data-sendmsg]');
  if (sm) sm.onclick = function () { H.haptic(); go('chat', { kind:'person', id:p.id }); };
  var cp = root.querySelector('[data-callper]');
  if (cp) cp.onclick = function () { H.haptic(); go('call', { id:p.id, kind:'person', mode:'语音通话' }); };
  var en = root.querySelector('[data-editname]');
  if (en) en.onclick = function () {
    H.haptic();
    var v = prompt('修改名字', en.textContent.trim());
    if (v && v.trim()) {
      var obj = isMe ? DB.data.me : Q.person(p.id);
      obj.name = v.trim(); DB.save(); render(true); H.toast('已保存');
    }
  };
  var er = root.querySelector('[data-editremark]');
  if (er) er.onclick = function () {
    H.haptic();
    var v = prompt('修改备注', (Q.person(p.id).remark || ''));
    if (v !== null) { Q.person(p.id).remark = v.trim(); DB.save(); render(true); H.toast('已保存'); }
  };
  var pm = root.querySelector('[data-pmore]');
  if (pm) pm.onclick = function () { H.haptic(); H.toast('更多操作：设置备注 / 加入黑名单（原型占位）'); };
};

/* ---------- 14 分类管理 ---------- */
SCREENS.catmanage = function () {
  var h = navBar('管理分类', { right:'<div class="nav-r"><span class="nav-act" data-done>完成</span></div>' });
  h += '<div class="body" style="background:var(--bg)">';
  h += '<div class="sec grey">我创建的分类<span>长按可拖动排序</span></div>';
  h += '<div class="card" style="margin-top:0" id="catList">';
  DB.data.categories.forEach(function (c, i) {
    h += '<div class="frow" data-catedit="' + c.id + '">' +
      H.catIcon(c.id, '', 36) +
      '<div class="fn">' + H.esc(c.name) + '</div>' +
      '<div class="fv">' + Q.groupsOf(c.id).length + ' 群 · ' + Q.peopleOf(c.id).length + ' 人</div>' +
      '<div style="display:flex;gap:2px" onclick="event.stopPropagation()">' +
      '<div class="nav-i" data-up="' + c.id + '" style="width:24px;height:24px"><svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 15l6-6 6 6"/></svg></div>' +
      '<div class="nav-i" data-down="' + c.id + '" style="width:24px;height:24px"><svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 9l6 6 6-6"/></svg></div>' +
      '</div></div>';
  });
  h += '</div>';
  h += '<div class="card"><div class="frow" style="justify-content:center;color:#07C160;font-size:15.5px" data-newcat>' +
    '+ 新建分类</div></div>';

  h += '<div class="sec grey">分类行为</div><div class="card" style="margin-top:0">';
  var st = DB.data.settings;
  [['showDirFirst','首屏显示分类目录'],['collapseOthers','其他分类折叠为一行'],
   ['multiCat','一人可属多个分类'],['newToUncat','新好友先进「未分类」']].forEach(function (x) {
    h += '<div class="srow" data-tog2="' + x[0] + '"><div class="sk" style="flex:1">' + x[1] + '</div>' +
      '<div class="sw' + (st[x[0]] ? ' on' : '') + '"><i></i></div></div>';
  });
  h += '</div>';

  h += '<div class="sec grey">未分类</div><div class="card" style="margin-top:0">' +
    '<div class="srow" data-go-tidy><div class="sk" style="flex:1">未分类的好友</div>' +
    '<div class="sv">' + Q.uncatPeople().length + ' 人</div>' +
    '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow" data-go-tidy><div class="sk" style="flex:1">未分类的群</div>' +
    '<div class="sv">' + Q.uncatGroups().length + ' 个</div>' +
    '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '</div>';

  h += '<div class="card"><div class="srow" style="justify-content:center;color:#FA5151;font-size:16px" data-reset>' +
    '重置全部数据</div></div>';
  h += '<div style="height:24px"></div></div>';
  return h;
};
SCREENS.catmanage.after = function (root) {
  root.querySelector('[data-done]').onclick = function () { H.haptic(); back(); };
  root.querySelectorAll('[data-catedit]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('catedit', { id:el.dataset.catedit }); };
  });
  root.querySelectorAll('[data-up]').forEach(function (el) {
    el.onclick = function () { H.haptic(); A.moveCat(el.dataset.up, -1); render(true); };
  });
  root.querySelectorAll('[data-down]').forEach(function (el) {
    el.onclick = function () { H.haptic(); A.moveCat(el.dataset.down, 1); render(true); };
  });
  root.querySelectorAll('[data-newcat]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('newcat'); };
  });
  root.querySelectorAll('[data-tog2]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var k = el.dataset.tog2;
      DB.data.settings[k] = !DB.data.settings[k]; DB.save();
      el.querySelector('.sw').classList.toggle('on', DB.data.settings[k]);
    };
  });
  root.querySelectorAll('[data-go-tidy]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('tidy'); };
  });
  root.querySelector('[data-reset]').onclick = function () {
    H.haptic();
    if (confirm('重置所有数据，回到初始状态？')) { DB.reset(); home(); H.toast('已重置'); }
  };
};

/* ---------- 分类编辑 ---------- */
SCREENS.catedit = function (p) {
  var c = Q.cat(p.id);
  if (!c) return '<div class="empty">不存在</div>';
  var h = navBar('编辑分类', { right:'<div class="nav-r"><span class="nav-act" data-save>保存</span></div>' });
  h += '<div class="body" style="background:var(--bg)">';
  h += '<div class="sec grey">名称</div><div class="card" style="margin-top:0">' +
    '<div class="srow"><input id="catNm" value="' + H.esc(c.name) + '" style="flex:1;border:none;outline:none;font-size:17px;font-family:inherit;background:transparent">' +
    '</div></div>';
  h += '<div class="sec grey">图标</div><div class="card" style="margin-top:0;padding:16px">' +
    '<div style="display:flex;gap:11px;flex-wrap:wrap">';
  ICON_KEYS.forEach(function (k) {
    var on = c.icon === k;
    h += '<div data-icon="' + k + '" style="width:46px;height:46px;border-radius:12px;background:' +
      ICONS[k].bg + ';display:flex;align-items:center;justify-content:center;cursor:pointer;' +
      (on ? 'outline:2.5px solid #07C160;outline-offset:2px' : '') + '">' +
      '<svg viewBox="0 0 24 24" style="width:23px;height:23px;stroke:#fff;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round">' + ICONS[k].svg + '</svg></div>';
  });
  h += '</div></div>';
  h += '<div class="sec grey">行为</div><div class="card" style="margin-top:0">' +
    '<div class="srow" data-tp="pinned"><div class="sk" style="flex:1">置顶到目录顶部</div><div class="sw' + (c.pinned ? ' on' : '') + '"><i></i></div></div>' +
    '<div class="srow" data-tp="notify"><div class="sk" style="flex:1">有新消息时提醒我</div><div class="sw' + (c.notify ? ' on' : '') + '"><i></i></div></div>' +
    '</div>';
  h += '<div class="sec grey">内容</div><div class="card" style="margin-top:0">' +
    '<div class="srow"><div class="sk">群聊</div><div class="sv">' + Q.groupsOf(c.id).length + ' 个</div></div>' +
    '<div class="srow"><div class="sk">好友</div><div class="sv">' + Q.peopleOf(c.id).length + ' 人</div></div>' +
    '</div>';
  h += '<div class="card"><div class="srow" style="justify-content:center;color:#FA5151;font-size:16px" data-delcat>删除分类</div></div>';
  h += '<div style="font-size:12.5px;color:var(--lb3);padding:12px 20px 0;line-height:1.65">' +
    '删除分类不会删掉人和群，它们会回到「未分类」。</div>';
  h += '<div style="height:24px"></div></div>';
  return h;
};
SCREENS.catedit.after = function (root, p) {
  var c = Q.cat(p.id);
  var picked = c.icon;
  root.querySelectorAll('[data-icon]').forEach(function (el) {
    el.onclick = function () { H.haptic(); picked = el.dataset.icon; render(true); };
  });
  /* 重渲染后 picked 丢失，这里用 DOM 状态兜底：先记录到临时变量 */
  if (window._catIconTmp && window._catIconTmp.id === p.id) { picked = window._catIconTmp.icon; }
  root.querySelectorAll('[data-icon]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      window._catIconTmp = { id:p.id, icon:el.dataset.icon };
      render(true);
    };
  });
  root.querySelectorAll('[data-tp]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var k = el.dataset.tp;
      c[k] = !c[k]; DB.save();
      el.querySelector('.sw').classList.toggle('on', c[k]);
    };
  });
  var inp = root.querySelector('#catNm');
  root.querySelector('[data-save]').onclick = function () {
    H.haptic();
    var v = inp.value.trim();
    if (!v) { H.toast('名称不能为空'); return; }
    c.name = v;
    if (window._catIconTmp && window._catIconTmp.id === p.id) c.icon = window._catIconTmp.icon;
    DB.save(); back(); H.toast('已保存');
  };
  root.querySelector('[data-delcat]').onclick = function () {
    H.haptic();
    if (confirm('删除分类「' + c.name + '」？人和群会回到未分类。')) {
      A.delCat(p.id); back(); H.toast('已删除');
    }
  };
};

/* ---------- 分类更多操作 ---------- */
SCREENS.catmenu = function (p) {
  var c = Q.cat(p.id);
  var h = navBar('分类操作', { right:'<div class="nav-r"></div>' });
  h += '<div class="body" style="background:var(--bg);padding-top:12px">';
  h += '<div class="card" style="margin-top:0">' +
    '<div class="srow" data-m="edit"><div class="sk" style="flex:1">编辑分类名称与图标</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow" data-m="pin"><div class="sk" style="flex:1">' + (c.pinned ? '取消置顶' : '置顶到目录顶部') + '</div></div>' +
    '<div class="srow" data-m="add"><div class="sk" style="flex:1">添加好友 / 群到这个分类</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow" data-m="manage"><div class="sk" style="flex:1">管理全部分类</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '</div>';
  h += '<div class="card"><div class="srow" style="justify-content:center;color:#FA5151;font-size:16px" data-m="del">删除分类</div></div>';
  h += '<div style="height:24px"></div></div>';
  return h;
};
SCREENS.catmenu.after = function (root, p) {
  var c = Q.cat(p.id);
  root.querySelectorAll('[data-m]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var m = el.dataset.m;
      if (m === 'edit') go('catedit', { id:p.id });
      else if (m === 'pin') { c.pinned = !c.pinned; DB.save(); back(); H.toast(c.pinned ? '已置顶' : '已取消置顶'); }
      else if (m === 'add') go('tidy', { addTo:p.id });
      else if (m === 'manage') go('catmanage');
      else if (m === 'del') {
        if (confirm('删除分类「' + c.name + '」？')) { A.delCat(p.id); home(); H.toast('已删除'); }
      }
    };
  });
};

/* ---------- 设置 ---------- */
SCREENS.settings = function () {
  var h = navBar('设置', { right:'<div class="nav-r"></div>' });
  var st = DB.data.settings;
  h += '<div class="body" style="background:var(--bg);padding-top:12px">';
  h += '<div class="card" style="margin-top:0">' +
    '<div class="srow" data-go="catmanage"><div class="sk" style="flex:1">管理分类</div>' +
    '<div class="sv">' + DB.data.categories.length + ' 个</div>' +
    '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow" data-go="tidy"><div class="sk" style="flex:1">整理未分类</div>' +
    '<div class="sv">' + Q.uncatCount() + ' 项</div>' +
    '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '</div>';
  h += '<div class="card">' +
    '<div class="srow"><div class="sk" style="flex:1">账号与安全</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow"><div class="sk" style="flex:1">隐私</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow"><div class="sk" style="flex:1">通用</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow"><div class="sk" style="flex:1">关于微聊</div><div class="sv">v1.1</div></div>' +
    '</div>';
  h += '<div style="height:24px"></div></div>';
  return h;
};
SCREENS.settings.after = function (root) {
  root.querySelectorAll('[data-go]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var g = el.dataset.go;
      go(g === 'catmanage' ? 'catmanage' : 'tidy');
    };
  });
  root.querySelectorAll('.srow').forEach(function (el) {
    if (!el.dataset.go) el.onclick = function () { H.toast('原型中为占位入口'); };
  });
};

window.pinyinIdx = pinyinIdx;
