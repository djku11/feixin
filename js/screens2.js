/* ==========================================================
   界面 08-14 —— 功能 / 我 / 设置 / 资料 / 分类管理
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
    row('<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>','rgba(255,149,0,.14)','文件','2.4 GB') +
    row('<path d="M12 2l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/>','rgba(139,107,245,.14)','我的收藏','128 条') +
    row('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/>','rgba(255,149,0,.14)','我的相册','2,483 张') +
    '</div>';
  h += sec('设备与互联');
  h += '<div class="card">' +
    row('<rect x="4" y="2" width="16" height="20" rx="3"/><path d="M9 18h6"/>','rgba(7,193,96,.14)','手机投屏') +
    row('<rect x="2" y="5" width="20" height="13" rx="2.5"/><path d="M8 21h8"/>','rgba(90,200,250,.16)','电脑传文件','已连接') +
    row('<path d="M12 3v9M12 21a8 8 0 008-8H4a8 8 0 008 8z"/>','rgba(255,107,107,.14)','多端同步','3 台') +
    '</div>';
  h += sec('常用小程序');
  h += '<div class="card">' +
    row('<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M8 14h8M8 17h5"/>','rgba(90,200,250,.16)','倒班助手') +
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

/* ---------- 09 广场及其全部功能（朋友圈/动态/群组发现/兴趣圈/附近/视频号）已按需求彻底移除 ---------- */

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
    r('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>','rgba(7,193,96,.14)','交易明细','36 笔') +
    r('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M14.5 9.5c-.6-1-1.5-1.5-2.5-1.5-1.7 0-3 1-3 2s1 1.8 3 2 3 1 3 2-1.3 2-3 2c-1 0-1.9-.5-2.5-1.5"/>','rgba(245,166,35,.16)','钱包') +
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
  var iAmOwner = Q.isOwner(g);
  h += '<div class="card" style="margin-top:0;border-radius:0;padding:14px 16px" data-gname>' +
    '<div style="display:flex;gap:12px;align-items:center">' +
    H.avGroup(g, 'lg') +
    '<div style="flex:1"><div style="font-size:17.5px;font-weight:600;display:flex;align-items:center;gap:6px">' + H.esc(g.name) +
    (iAmOwner ? '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:#B2B2B2;fill:none;stroke-width:1.8;stroke-linecap:round"><path d="M4 20h4L19.5 8.5a2.1 2.1 0 00-3-3L5 17z"/></svg>' : '') +
    '</div>' +
    '<div style="font-size:13px;color:var(--lb2);margin-top:4px">' +
    g.members.length + ' 位成员 · 我在本群的昵称：' + H.esc(DB.data.me.name) + '</div>' +
    (iAmOwner ? '<div style="font-size:11.5px;color:#B2B2B2;margin-top:3px">点此修改群名称</div>' : '') +
    '</div></div></div>';

  h += '<div class="sec grey">成员<span>' + g.members.length + ' 人</span></div><div class="card" style="margin-top:0">';
  h += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;padding:16px">';
  g.members.forEach(function (nm) {
    var isMe = nm === '我';
    var isOwn = g.owner === nm || (g.owner === undefined && isMe);
    var isAdm = !isOwn && (g.admins || []).indexOf(nm) >= 0;
    var av = isMe ? DB.data.me.av : (AV.lin);
    h += '<div data-member="' + H.esc(nm) + '"' + (isMe ? ' data-me' : '') +
      ' style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer">' +
      '<div class="av sm" style="background:' + av + '">' + H.esc(nm.charAt(0)) + '</div>' +
      '<div style="font-size:11px;color:#888;max-width:52px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + H.esc(nm) + '</div>' +
      (isOwn ? '<div style="font-size:9px;line-height:1;color:#fff;background:#FF9F0A;border-radius:6px;padding:1.5px 5px">群主</div>' :
        (isAdm ? '<div style="font-size:9px;line-height:1;color:#fff;background:#10AEFF;border-radius:6px;padding:1.5px 5px">管理员</div>' : '')) +
      '</div>';
  });
  h += '<div data-addmem style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer">' +
    '<div class="av sm" style="background:#fff;border:1px dashed #CCC;color:#BBB">+</div>' +
    '<div style="font-size:11px;color:#888">添加</div></div>';
  h += '</div></div>';

  /* 分组归属 —— 核心（单分组，点选即移动） */
  h += '<div class="sec grey">所属分组<span>点选即移动到该分组</span></div><div class="card" style="margin-top:0">';
  Q.catList('g').forEach(function (c) {
    var on = g.gid === c.id;
    h += '<div class="srow" data-gcat="' + c.id + '">' + H.catIcon(c.id, '', 32) +
      '<div class="sk" style="flex:1;min-width:0">' + H.esc(c.name) + '</div>' +
      '<div class="sw' + (on ? ' on' : '') + '"><i></i></div></div>';
  });
  h += '<div class="srow" data-gout><div class="sk" style="flex:1;color:#888">移出分组（变为未分组）</div></div>';
  h += '<div class="srow" data-newcat style="color:#07C160"><div style="font-size:16px">+ 新建群分组并移入</div></div>';
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
  var g = Q.group(p.id);
  /* 添加成员 */
  var am = root.querySelector('[data-addmem]');
  if (am) am.onclick = function () { H.haptic(); MEMPICK.sel = {}; go('addmember', { gid:p.id }); };
  /* 群名：群主可改，他人提示无权限 */
  var gn = root.querySelector('[data-gname]');
  if (gn) gn.onclick = function () {
    H.haptic();
    if (!Q.isOwner(g)) { H.toast('只有群主可以修改群名'); return; }
    var v = prompt('修改群名称', g ? g.name : '');
    if (v === null) return;
    v = v.trim();
    if (!v) { H.toast('群名不能为空'); return; }
    A.setGroupName(p.id, v);
    render(true);
    H.toast('群名已修改');
  };
  /* 点成员：群主全权；管理员可移出普通成员；普通成员只读 */
  root.querySelectorAll('[data-member]').forEach(function (el) {
    el.onclick = function () {
      var nm = el.dataset.member;
      if (nm === '我') return;
      H.haptic();
      if (g && Q.isOwner(g)) { go('memberact', { gid:p.id, name:nm }); return; }
      if (g && Q.isAdmin(g, '我')) {
        if (nm === g.owner || (g.admins || []).indexOf(nm) >= 0) { H.toast('管理员只能移出普通成员'); return; }
        go('memberact', { gid:p.id, name:nm, limited:true });
        return;
      }
      H.toast('只有群主或管理员可以操作成员');
    };
  });
  root.querySelectorAll('[data-gcat]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var cid = el.dataset.gcat;
      A.toggleCat('group', p.id, cid, true);
      root.querySelectorAll('[data-gcat] .sw').forEach(function (sw) { sw.classList.remove('on'); });
      el.querySelector('.sw').classList.add('on');
      H.toast('已移动到「' + Q.cat(cid).name + '」');
    };
  });
  var go_ = root.querySelector('[data-gout]');
  if (go_) go_.onclick = function () {
    H.haptic();
    A.toggleCat('group', p.id, '', false);
    root.querySelectorAll('[data-gcat] .sw').forEach(function (sw) { sw.classList.remove('on'); });
    H.toast('已移出分组');
  };
  var nc = root.querySelector('[data-newcat]');
  if (nc) nc.onclick = function () { H.haptic(); go('newcat', { kind:'g', thenCats:'group:' + p.id }); };
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

/* ---------- 12b 添加群成员（多选好友入群） ---------- */
var MEMPICK = { sel: {} };
SCREENS.addmember = function (p) {
  var g = Q.group(p.gid);
  if (!g) return '<div class="empty">群不存在</div>';
  var cand = Q.groupCandidates(p.gid);
  var h = navBar('添加成员', { right:'<div class="nav-r"><span class="nav-act" data-all>全选</span></div>' });
  h += '<div class="body" style="padding-bottom:80px">';
  h += '<div class="sec">可添加的好友<span>' + cand.length + ' 人</span></div>';
  if (!cand.length) h += '<div class="empty" style="padding:34px">好友都已在群里了 ✓</div>';
  cand.forEach(function (pe) {
    var on = MEMPICK.sel[pe.id];
    h += '<div class="row" data-pick="' + pe.id + '">' +
      '<div class="pick' + (on ? ' on' : '') + '"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>' +
      '<div class="av" style="background:' + pe.av + '">' + H.esc(pe.name.charAt(0)) + '</div>' +
      '<div class="mid"><div class="nm">' + H.esc(pe.name) + '</div>' +
      '<div class="pv">' + H.esc(pe.remark || '') + '</div></div></div>';
  });
  h += '</div>';
  var n = Object.keys(MEMPICK.sel).filter(function (k) { return MEMPICK.sel[k]; }).length;
  h += '<div class="abar"><div class="ab-n">已选 <b>' + n + '</b> 人</div>' +
    '<button class="ab-btn' + (n ? '' : ' off') + '" data-add>添加到群聊</button></div>';
  return h;
};
SCREENS.addmember.after = function (root, p) {
  function count() { return Object.keys(MEMPICK.sel).filter(function (k) { return MEMPICK.sel[k]; }).length; }
  function refresh() {
    root.querySelector('.ab-n').innerHTML = '已选 <b>' + count() + '</b> 人';
    root.querySelector('[data-add]').classList.toggle('off', !count());
  }
  root.querySelectorAll('[data-pick]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      var k = el.dataset.pick;
      MEMPICK.sel[k] = !MEMPICK.sel[k];
      el.querySelector('.pick').classList.toggle('on', MEMPICK.sel[k]);
      refresh();
    };
  });
  var all = root.querySelector('[data-all]');
  if (all) all.onclick = function () {
    H.haptic();
    var items = root.querySelectorAll('[data-pick]');
    var allOn = Array.prototype.every.call(items, function (el) { return el.querySelector('.pick').classList.contains('on'); });
    items.forEach(function (el) {
      var k = el.dataset.pick;
      MEMPICK.sel[k] = !allOn;
      el.querySelector('.pick').classList.toggle('on', !allOn);
    });
    all.textContent = allOn ? '全选' : '取消全选';
    refresh();
  };
  var ab = root.querySelector('[data-add]');
  ab.onclick = function () {
    var ids = Object.keys(MEMPICK.sel).filter(function (k) { return MEMPICK.sel[k]; });
    if (!ids.length) { H.toast('先勾选要添加的好友'); return; }
    H.haptic();
    var names = ids.map(function (id) { var pe = Q.person(id); return pe ? pe.name : null; }).filter(Boolean);
    var added = A.addMembers(p.gid, names);
    MEMPICK.sel = {};
    H.toast(added ? ('已添加 ' + added + ' 位成员') : '这些成员都已在群里');
    back();
  };
};

/* ---------- 12c 成员操作（查看资料 / 设管理员 / 移出群聊） ---------- */
SCREENS.memberact = function (p) {
  var g = Q.group(p.gid);
  var isAdm = g && (g.admins || []).indexOf(p.name) >= 0;
  var cap = g ? Q.maxAdmins(g) : 1;
  var h = navBar('群成员', {});
  h += '<div class="body" style="filter:blur(1.4px);opacity:.55;pointer-events:none;background:#fff"></div>';
  h += '<div class="mask" data-close></div>';
  h += '<div class="sheet"><div class="grab"></div>' +
    '<div class="sh-tt">' + H.esc(p.name) + '<span>' + (isAdm ? '管理员' : '群成员') +
    (g ? ' · 管理员 ' + g.admins.length + '/' + cap : '') + '</span></div>' +
    '<div class="sh-body">' +
    '<div class="sh-r" data-profile><div class="sh-n">查看资料</div></div>' +
    (p.limited ? '' :
      '<div class="sh-r" data-admin><div class="sh-n">' + (isAdm ? '撤销管理员' : '设为管理员') + '</div></div>') +
    '<div class="sh-r" data-kick><div class="sh-n" style="color:#FA5151">移出群聊</div></div>' +
    '</div></div>';
  return h;
};
SCREENS.memberact.after = function (root, p) {
  var close = root.querySelector('[data-close]');
  if (close) close.onclick = function () { back(); };
  var adm = root.querySelector('[data-admin]');
  if (adm) adm.onclick = function () {
    H.haptic();
    var g = Q.group(p.gid);
    if (!g) return;
    var turningOn = (g.admins || []).indexOf(p.name) < 0;
    var err = A.toggleAdmin(p.gid, p.name, turningOn);
    if (err) { H.toast(err); return; }
    H.toast(turningOn ? ('已设「' + p.name + '」为管理员') : ('已撤销「' + p.name + '」的管理员'));
    back();
  };
  var kick = root.querySelector('[data-kick]');
  if (kick) kick.onclick = function () {
    H.haptic();
    var g = Q.group(p.gid);
    if (!g || !Q.canKick(g, p.name)) { H.toast('无权限移出该成员'); return; }
    A.removeMember(p.gid, p.name);
    H.toast('已将「' + p.name + '」移出群聊');
    back();
  };
  var pf = root.querySelector('[data-profile]');
  if (pf) pf.onclick = function () {
    H.haptic();
    var per = DB.data.people.filter(function (x) { return x.name === p.name; })[0];
    back();
    if (per) setTimeout(function () { go('profile', { id: per.id, kind:'person' }); }, 60);
    else H.toast('该成员不在你的通讯录');
  };
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

  /* 分组归属 —— 核心（单分组） */
  var link = isMe ? 'me' : 'person';
  h += '<div class="sec grey">所属分组<span>点选即移动到该分组</span></div><div class="card" style="margin-top:0">';
  if (isMe) {
    h += '<div class="srow"><div class="sk" style="flex:1">自己的账号</div>' +
      '<div class="sv" style="color:#B2B2B2;font-size:14px">不需要分组</div></div>';
  } else {
    h += '<div class="srow"><div class="sk" style="flex:1">当前分组</div>' +
      '<div class="sv">' + (obj.pgid && Q.cat(obj.pgid) ? H.esc(Q.cat(obj.pgid).name) : '未分组') + '</div></div>';
    Q.catList('p', 'msgp').forEach(function (c) {
      var on = obj.pgid === c.id;
      h += '<div class="srow" data-pcat="' + c.id + '">' + H.catIcon(c.id, '', 32) +
        '<div class="sk" style="flex:1;min-width:0">' + H.esc(c.name) + '</div>' +
        '<div class="sw' + (on ? ' on' : '') + '"><i></i></div></div>';
    });
    h += '<div class="srow" data-pout><div class="sk" style="flex:1;color:#888">移出分组（变为未分组）</div></div>';
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
    /* 黑名单 / 删除好友：拉黑可恢复，删除是彻底移除 */
    h += '<div class="card"><div class="srow" data-blockper><div class="sk" style="flex:1;color:#E64340">加入黑名单</div></div>' +
      '<div class="srow" data-delper><div class="sk" style="flex:1;color:#E64340">删除好友</div></div></div>';
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
      A.toggleCat('person', p.id, cid, true);
      root.querySelectorAll('[data-pcat] .sw').forEach(function (sw) { sw.classList.remove('on'); });
      el.querySelector('.sw').classList.add('on');
      var cur = root.querySelector('.sv');
      H.toast('已移动到「' + Q.cat(cid).name + '」');
    };
  });
  var po = root.querySelector('[data-pout]');
  if (po) po.onclick = function () {
    H.haptic();
    A.toggleCat('person', p.id, '', false, 'msgp');
    root.querySelectorAll('[data-pcat] .sw').forEach(function (sw) { sw.classList.remove('on'); });
    H.toast('已移出分组');
  };
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
  if (pm) pm.onclick = function () { H.haptic(); H.toast('更多操作（原型占位）'); };
  /* 加入黑名单：收不到 Ta 的任何信息，可在通讯录黑名单里取消拉黑 */
  var bp = root.querySelector('[data-blockper]');
  if (bp) bp.onclick = function () {
    H.haptic();
    var o = Q.person(p.id);
    if (!o) return;
    if (confirm('把「' + o.name + '」加入黑名单？\n拉黑后不会收到 Ta 的任何信息，可随时取消拉黑。')) {
      A.blockPerson(p.id);
      H.toast('已加入黑名单，可在通讯录「黑名单」里管理');
      back();
      setTimeout(function () { render(true); }, 60);
    }
  };
  /* 删除好友：彻底移除（与拉黑不同，不可在黑名单恢复） */
  var dp = root.querySelector('[data-delper]');
  if (dp) dp.onclick = function () {
    H.haptic();
    var o = Q.person(p.id);
    if (!o) return;
    if (confirm('删除好友「' + o.name + '」？\n聊天记录一并删除，不可恢复（拉黑不等于删除）。')) {
      A.delPerson(p.id);
      H.toast('已删除好友');
      home();
    }
  };
};

/* ---------- 14 分组管理（tab='p' 只管好友分组 / tab='g' 只管群分组 / 不传全部） ---------- */
SCREENS.catmanage = function (p) {
  var tab = p && p.tab;
  var title = tab === 'p' ? '管理好友分组' : (tab === 'g' ? '管理群分组' : '管理分组');
  var h = navBar(title, { right:'<div class="nav-r"><span class="nav-act" data-done>完成</span></div>' });
  h += '<div class="body" style="background:var(--bg)">';
  if (!tab || tab === 'p') {
    h += '<div class="sec grey">好友分组<span>右侧箭头调整顺序</span></div>';
    h += '<div class="card" style="margin-top:0" id="catList">';
    Q.catList('p', 'msgp').forEach(function (c) {
      h += '<div class="frow" data-catedit="' + c.id + '">' +
        H.catIcon(c.id, '', 36) +
        '<div class="fn">' + H.esc(c.name) + '</div>' +
        '<div class="fv">' + Q.peopleOf(c.id).length + ' 人</div>' +
        '<div style="display:flex;gap:2px" onclick="event.stopPropagation()">' +
        '<div class="nav-i" data-up="' + c.id + '" style="width:24px;height:24px"><svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 15l6-6 6 6"/></svg></div>' +
        '<div class="nav-i" data-down="' + c.id + '" style="width:24px;height:24px"><svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 9l6 6 6-6"/></svg></div>' +
        '</div></div>';
    });
    h += '</div>';
    h += '<div class="card"><div class="frow" style="justify-content:center;color:#07C160;font-size:15.5px" data-newgrp="p">' +
      '+ 新建好友分组</div></div>';
  }
  if (!tab || tab === 'g') {
    h += '<div class="sec grey">群分组<span>右侧箭头调整顺序</span></div>';
    h += '<div class="card" style="margin-top:0">';
    Q.catList('g').forEach(function (c) {
      h += '<div class="frow" data-catedit="' + c.id + '">' +
        H.catIcon(c.id, '', 36) +
        '<div class="fn">' + H.esc(c.name) + '</div>' +
        '<div class="fv">' + Q.groupsOf(c.id).length + ' 群</div>' +
        '<div style="display:flex;gap:2px" onclick="event.stopPropagation()">' +
        '<div class="nav-i" data-up="' + c.id + '" style="width:24px;height:24px"><svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 15l6-6 6 6"/></svg></div>' +
        '<div class="nav-i" data-down="' + c.id + '" style="width:24px;height:24px"><svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 9l6 6 6-6"/></svg></div>' +
        '</div></div>';
    });
    h += '</div>';
    h += '<div class="card"><div class="frow" style="justify-content:center;color:#07C160;font-size:15.5px" data-newgrp="g">' +
      '+ 新建群分组</div></div>';
  }

  h += '<div class="sec grey">未分组</div><div class="card" style="margin-top:0">';
  if (!tab || tab === 'p') {
    h += '<div class="srow" data-go-tidy><div class="sk" style="flex:1">未分组的好友</div>' +
      '<div class="sv">' + Q.uncatPeople('msgp').length + ' 人</div>' +
      '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>';
  }
  if (!tab || tab === 'g') {
    h += '<div class="srow" data-go-tidy><div class="sk" style="flex:1">未分组的群</div>' +
      '<div class="sv">' + Q.uncatGroups().length + ' 个</div>' +
      '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>';
  }
  h += '</div>';

  if (!tab) {
    h += '<div class="card"><div class="srow" style="justify-content:center;color:#FA5151;font-size:16px" data-reset>' +
      '重置全部数据</div></div>';
  }
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
  root.querySelectorAll('[data-newgrp]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('newcat', { kind:el.dataset.newgrp, scope: el.dataset.newgrp === 'p' ? 'msgp' : undefined }); };
  });
  root.querySelectorAll('[data-go-tidy]').forEach(function (el) {
    el.onclick = function () { H.haptic(); go('tidy'); };
  });
  var rs = root.querySelector('[data-reset]');
  if (rs) rs.onclick = function () {
    H.haptic();
    if (confirm('重置所有数据，回到初始状态？')) { DB.reset(); home(); H.toast('已重置'); }
  };
};

/* ---------- 分组编辑 ---------- */
SCREENS.catedit = function (p) {
  var c = Q.cat(p.id);
  if (!c) return '<div class="empty">不存在</div>';
  var isG = c.kind === 'g';
  var h = navBar('编辑分组', { right:'<div class="nav-r"><span class="nav-act" data-save>保存</span></div>' });
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
  h += '<div class="sec grey">内容</div><div class="card" style="margin-top:0">' +
    '<div class="srow"><div class="sk">' + (isG ? '群聊' : '好友') + '</div><div class="sv">' + Q.catTotal(c.id) + ' ' + (isG ? '个' : '人') + '</div></div>' +
    '</div>';
  h += '<div class="card"><div class="srow" style="justify-content:center;color:#FA5151;font-size:16px" data-delcat>删除分组</div></div>';
  h += '<div style="font-size:12.5px;color:var(--lb3);padding:12px 20px 0;line-height:1.65">' +
    '删除分组不会删掉' + (isG ? '群' : '好友') + '，它们会回到「未分组」。</div>';
  h += '<div style="height:24px"></div></div>';
  return h;
};
SCREENS.catedit.after = function (root, p) {
  var c = Q.cat(p.id);
  var picked = c.icon || 'people';
  if (window._catIconTmp && window._catIconTmp.id === p.id) { picked = window._catIconTmp.icon; }
  root.querySelectorAll('[data-icon]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      window._catIconTmp = { id:p.id, icon:el.dataset.icon };
      render(true);
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
    if (confirm('删除分组「' + c.name + '」？内容会回到未分组。')) {
      A.delCat(p.id); home(); H.toast('已删除');
    }
  };
};

/* ---------- 分组更多操作 ---------- */
SCREENS.catmenu = function (p) {
  var c = Q.cat(p.id);
  var isG = c.kind === 'g';
  var h = navBar('分组操作', { right:'<div class="nav-r"></div>' });
  h += '<div class="body" style="background:var(--bg);padding-top:12px">';
  h += '<div class="card" style="margin-top:0">' +
    '<div class="srow" data-m="edit"><div class="sk" style="flex:1">编辑分组名称与图标</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow" data-m="add"><div class="sk" style="flex:1">添加' + (isG ? '群' : '好友') + '到这个分组</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow" data-m="manage"><div class="sk" style="flex:1">管理全部分组</div><svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '</div>';
  h += '<div class="card"><div class="srow" style="justify-content:center;color:#FA5151;font-size:16px" data-m="del">删除分组</div></div>';
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
      else if (m === 'add') go('tidy', { addTo:p.id, kind:c.kind, scope: c.kind === 'p' ? c.scope : undefined });
      else if (m === 'manage') go('catmanage');
      else if (m === 'del') {
        if (confirm('删除分组「' + c.name + '」？')) { A.delCat(p.id); home(); H.toast('已删除'); }
      }
    };
  });
};

/* ---------- 右上角 ⋯ 功能菜单（扫一扫/付款码/传文件） ---------- */
SCREENS.plusmenu = function (p) {
  var isG = p.kind === 'g';
  var h = navBar(isG ? '群聊消息' : '个人消息', { back:false, right:'' });
  h += '<div class="body" style="filter:blur(1.4px);opacity:.55;pointer-events:none;background:#fff"></div>';
  h += '<div class="mask" data-close></div>';
  function mi(key, icon, label) {
    return '<div class="pm-i" data-x="' + key + '" style="display:flex;align-items:center;gap:12px;padding:13px 18px;color:#fff;font-size:15.5px;cursor:pointer">' +
      '<svg viewBox="0 0 24 24" style="width:19px;height:19px;stroke:#fff;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round">' + icon + '</svg>' +
      '<span>' + label + '</span></div>';
  }
  h += '<div style="position:fixed;top:62px;right:12px;z-index:70;background:#4C4C4C;border-radius:12px;min-width:186px;box-shadow:0 10px 34px rgba(0,0,0,.3);overflow:hidden">' +
    '<div style="position:absolute;top:-6px;right:16px;width:12px;height:12px;background:#4C4C4C;transform:rotate(45deg)"></div>' +
    mi('scan', '<path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2"/><path d="M4 12h16"/>', '扫一扫') +
    '<div style="height:1px;background:rgba(255,255,255,.1);margin:0 14px"></div>' +
    mi('paycode', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 14.5h.01M11 14.5h.01M15 14.5h.01"/>', '付款码') +
    '<div style="height:1px;background:rgba(255,255,255,.1);margin:0 14px"></div>' +
    mi('filexfer', '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 14h6M9 17h4"/>', '传文件') +
    '</div>';
  return h;
};
SCREENS.plusmenu.after = function (root) {
  var close = root.querySelector('[data-close]');
  if (close) close.onclick = function () { back(); };
  root.querySelectorAll('[data-x]').forEach(function (el) {
    el.onclick = function () {
      H.haptic();
      back();
      setTimeout(function () { go(el.dataset.x); }, 60);
    };
  });
};

/* ---------- 扫一扫（取景框 + 相册识别，原型演示） ---------- */
SCREENS.scan = function () {
  var h = '<style>@keyframes scanmv{0%{top:8px}50%{top:206px}100%{top:8px}}</style>';
  h += '<div style="position:fixed;inset:0;background:#141414;z-index:60;display:flex;flex-direction:column">' +
    '<div style="height:52px;display:flex;align-items:center;padding:0 8px;background:rgba(0,0,0,.55);color:#fff">' +
    '<div class="nav-i" data-back style="color:#fff"><svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round"><path d="M15 5l-7 7 7 7"/></svg></div>' +
    '<div style="flex:1;text-align:center;font-size:16.5px;font-weight:600">扫一扫</div>' +
    '<div class="nav-i" data-album style="color:#fff;font-size:14px;padding:6px 10px">相册</div>' +
    '</div>';
  h += '<div style="flex:1;display:flex;align-items:center;justify-content:center">' +
    '<div style="position:relative;width:230px;height:230px">' +
    '<span style="position:absolute;left:0;top:0;width:38px;height:38px;border-left:3.5px solid #07C160;border-top:3.5px solid #07C160;border-radius:6px 0 0 0"></span>' +
    '<span style="position:absolute;right:0;top:0;width:38px;height:38px;border-right:3.5px solid #07C160;border-top:3.5px solid #07C160;border-radius:0 6px 0 0"></span>' +
    '<span style="position:absolute;left:0;bottom:0;width:38px;height:38px;border-left:3.5px solid #07C160;border-bottom:3.5px solid #07C160;border-radius:0 0 0 6px"></span>' +
    '<span style="position:absolute;right:0;bottom:0;width:38px;height:38px;border-right:3.5px solid #07C160;border-bottom:3.5px solid #07C160;border-radius:0 0 6px 0"></span>' +
    '<div data-line style="position:absolute;left:10px;right:10px;height:2px;background:linear-gradient(90deg,rgba(7,193,96,0),#07C160,rgba(7,193,96,0));box-shadow:0 0 12px rgba(7,193,96,.8);animation:scanmv 2.2s ease-in-out infinite"></div>' +
    '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.25);font-size:13px">将二维码放入框内</div>' +
    '</div></div>';
  h += '<div style="padding:26px 0 40px;text-align:center;color:rgba(255,255,255,.45);font-size:12.5px">原型演示 · 扫描取景为模拟画面<br>点右上角「相册」可从相册选图识别</div>' +
    '<input type="file" accept="image/*" data-file style="display:none">' +
    '</div>';
  return h;
};
SCREENS.scan.after = function (root) {
  var bk = root.querySelector('[data-back]');
  if (bk) bk.onclick = function () { H.haptic(); back(); };
  var file = root.querySelector('[data-file]');
  var al = root.querySelector('[data-album]');
  if (al) al.onclick = function () { H.haptic(); file.click(); };
  if (file) file.onchange = function () {
    if (file.files && file.files.length) { H.haptic(); H.toast('已从相册识别二维码（原型演示）'); file.value = ''; }
  };
};

/* ---------- 付款码（条形码 + 二维码，原型演示） ---------- */
SCREENS.paycode = function () {
  var seed = (Date.now() % 2147483647) >>> 0;
  function rnd() { seed = (seed * 48271) % 2147483647; return seed / 2147483647; }
  /* 伪二维码 21x21：三个定位角 + 随机点 */
  var n = 21, cell = 6, qr = '';
  function finder(cx, cy) {
    for (var y = 0; y < 7; y++) for (var x = 0; x < 7; x++) {
      var edge = (x === 0 || x === 6 || y === 0 || y === 6);
      var core = (x >= 2 && x <= 4 && y >= 2 && y <= 4);
      if (edge || core) qr += '<rect x="' + ((cx + x) * cell) + '" y="' + ((cy + y) * cell) + '" width="' + cell + '" height="' + cell + '" fill="#111"/>';
    }
  }
  for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
    var inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    if (!inF && rnd() < 0.44) qr += '<rect x="' + (x * cell) + '" y="' + (y * cell) + '" width="' + cell + '" height="' + cell + '" fill="#111"/>';
  }
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  var qrSvg = '<svg viewBox="0 0 ' + (n * cell) + ' ' + (n * cell) + '" style="width:190px;height:190px;background:#fff">' + qr + '</svg>';
  /* 条形码 */
  var bar = '', bx = 0;
  while (bx < 220) { var w = 1 + Math.floor(rnd() * 3); bar += '<rect x="' + bx + '" y="0" width="' + w + '" height="44" fill="#111"/>'; bx += w + 1 + Math.floor(rnd() * 2); }
  var barSvg = '<svg viewBox="0 0 220 44" style="width:220px;height:44px">' + bar + '</svg>';
  var m = DB.data.me;
  var h = navBar('付款码', { right:'' });
  h += '<div class="body" style="background:var(--bg)">';
  h += '<div class="card" style="margin-top:0;padding:22px 16px;text-align:center">' +
    '<div style="font-size:16px;font-weight:600">向商家付款</div>' +
    '<div style="margin:14px auto 4px;display:inline-block;padding:10px;background:#fff;border:1px solid #EEE;border-radius:10px">' + qrSvg + '</div>' +
    '<div style="margin:10px 0 2px">' + barSvg + '</div>' +
    '<div style="font-size:11.5px;color:#B2B2B2;letter-spacing:2px">' + (100000 + Math.floor(rnd() * 899999)) + '</div>' +
    '</div>';
  h += '<div class="card"><div class="srow"><div class="sk">付款方式</div><div class="sv">微聊钱包 · 零钱 ¥168.50</div></div>' +
    '<div class="srow"><div class="sk">持有者</div><div class="sv">' + H.esc(m.name) + '</div></div></div>';
  h += '<div style="font-size:12px;color:var(--lb3);padding:4px 22px;line-height:1.7">付款码每分钟自动更新（原型为静态演示），请勿泄露给他人。</div>';
  h += '<div style="height:24px"></div></div>';
  return h;
};

/* ---------- 传文件（传到电脑 / 面对面传） ---------- */
SCREENS.filexfer = function () {
  var seed = (Date.now() % 2147483647) >>> 0;
  function rnd() { seed = (seed * 48271) % 2147483647; return seed / 2147483647; }
  var n = 15, cell = 6, qr = '';
  for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
    var inF = (x < 6 && y < 6) || (x > n - 7 && y < 6) || (x < 6 && y > n - 7);
    if (!inF && rnd() < 0.46) qr += '<rect x="' + (x * cell) + '" y="' + (y * cell) + '" width="' + cell + '" height="' + cell + '" fill="#111"/>';
  }
  function fnd(cx, cy) {
    for (var yy = 0; yy < 5; yy++) for (var xx = 0; xx < 5; xx++) {
      var edge = (xx === 0 || xx === 4 || yy === 0 || yy === 4), core = (xx === 2 && yy === 2);
      if (edge || core) qr += '<rect x="' + ((cx + xx) * cell) + '" y="' + ((cy + yy) * cell) + '" width="' + cell + '" height="' + cell + '" fill="#111"/>';
    }
  }
  fnd(0, 0); fnd(n - 5, 0); fnd(0, n - 5);
  var qrSvg = '<svg viewBox="0 0 ' + (n * cell) + ' ' + (n * cell) + '" style="width:120px;height:120px;background:#fff">' + qr + '</svg>';
  var h = navBar('传文件', { right:'' });
  h += '<div class="body" style="background:var(--bg)">';
  h += '<div class="card" style="margin-top:0;padding:18px 16px;display:flex;gap:14px;align-items:center" data-topc>' +
    '<div style="width:46px;height:46px;border-radius:12px;background:rgba(90,200,250,.16);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
    '<svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#5AC8FA;fill:none;stroke-width:1.8;stroke-linecap:round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>' +
    '<div style="flex:1;min-width:0"><div style="font-size:15.5px;font-weight:600">传到电脑</div>' +
    '<div style="font-size:12.5px;color:var(--lb2);margin-top:3px;line-height:1.5">电脑浏览器打开微聊网页版，扫下面二维码登录后，手机电脑互传文件</div></div>' +
    '</div>';
  h += '<div class="card" style="padding:20px;text-align:center" data-topc>' + qrSvg +
    '<div style="font-size:12px;color:var(--lb3);margin-top:10px">用电脑浏览器扫一扫 · 登录网页版微聊</div></div>';
  h += '<div class="card"><div class="srow" data-face><div class="sk" style="flex:1">' +
    '<div style="font-weight:600;font-size:15.5px">面对面传</div>' +
    '<div style="font-size:12.5px;color:var(--lb2);margin-top:3px">与身边设备快速互传文件、图片，无需网络</div></div>' +
    '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow" data-dev><div class="sk" style="flex:1">已连接设备</div><div class="sv">Windows 电脑 · 1 台</div></div></div>';
  h += '<div style="height:24px"></div></div>';
  return h;
};
SCREENS.filexfer.after = function (root) {
  root.querySelectorAll('[data-topc]').forEach(function (el) {
    el.onclick = function () { H.haptic(); H.toast('原型演示：请用电脑浏览器扫码登录网页版'); };
  });
  var fc = root.querySelector('[data-face]');
  if (fc) fc.onclick = function () { H.haptic(); H.toast('面对面传：原型演示'); };
  var dv = root.querySelector('[data-dev]');
  if (dv) dv.onclick = function () { H.haptic(); H.toast('设备管理：原型演示'); };
};

/* ---------- 设置 ---------- */
SCREENS.settings = function () {
  var h = navBar('设置', { right:'<div class="nav-r"></div>' });
  var st = DB.data.settings;
  h += '<div class="body" style="background:var(--bg);padding-top:12px">';
  h += '<div class="card" style="margin-top:0">' +
    '<div class="srow" data-go="catmanage"><div class="sk" style="flex:1">管理分组</div>' +
    '<div class="sv">' + DB.data.categories.length + ' 个</div>' +
    '<svg class="arw" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '<div class="srow" data-go="tidy"><div class="sk" style="flex:1">整理未分组</div>' +
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
    if (el.dataset.go === undefined) el.onclick = function () { H.toast('原型中为占位入口'); };
  });
};

window.pinyinIdx = pinyinIdx;
