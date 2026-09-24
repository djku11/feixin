/* ==========================================================
   数据层 v3 —— 个人消息 / 群聊 双体系
   · 个人消息：好友分组（QQ 式，可折叠、显示在线 n/m、来消息闪烁）
   · 群聊：群分组（同样可折叠）
   · 每个好友属于一个好友分组（pgid），每个群属于一个群分组（gid）
   ========================================================== */

var AV = {
  chen:'linear-gradient(150deg,#8E9BFF,#5B6BE0)',
  lin :'linear-gradient(150deg,#FFB27A,#E8734A)',
  su  :'linear-gradient(150deg,#C9A6F5,#8B5CE0)',
  zhou:'linear-gradient(150deg,#7ED9A8,#3FA76C)',
  sun :'linear-gradient(150deg,#5AC8FA,#2E9FD8)',
  wu  :'linear-gradient(150deg,#FFC857,#F5A623)',
  zhao:'linear-gradient(150deg,#FF8A8A,#E05A5A)',
  grey:'linear-gradient(150deg,#B8BFC7,#8A939C)',
  mom :'linear-gradient(150deg,#FFB27A,#E8734A)',
  li  :'linear-gradient(150deg,#7ED9A8,#3FA76C)'
};

var ICONS = {
  work  :{bg:'linear-gradient(150deg,#5AC8FA,#2E9FD8)',svg:'<rect x="2" y="7" width="20" height="14" rx="2.5"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>'},
  school:{bg:'linear-gradient(150deg,#C9A6F5,#8B5CE0)',svg:'<path d="M12 3l9.5 5-9.5 5-9.5-5z"/><path d="M6 10.5V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-5.5"/>'},
  family:{bg:'linear-gradient(150deg,#FFB27A,#E8734A)',svg:'<path d="M12 21s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.4-7 10-7 10z"/>'},
  hobby :{bg:'linear-gradient(150deg,#7ED9A8,#3FA76C)',svg:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 000 18z" fill="#fff" fill-opacity=".3"/>'},
  asc   :{bg:'linear-gradient(150deg,#FFC857,#F5A623)',svg:'<path d="M6 4h13v16l-6.5-4L6 20z"/>'},
  star  :{bg:'linear-gradient(150deg,#FFC857,#F5A623)',svg:'<path d="M12 2l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/>'},
  globe :{bg:'linear-gradient(150deg,#8E9BFF,#5B6BE0)',svg:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 000 18z" fill="#fff" fill-opacity=".3"/>'},
  people:{bg:'linear-gradient(150deg,#07C160,#059E4E)',svg:'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M17 11.5a3 3 0 100-6M19 20c0-2.4-.9-4.2-2.3-5.4"/>'},
  heart :{bg:'linear-gradient(150deg,#FF8A8A,#E05A5A)',svg:'<path d="M12 21s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.4-7 10-7 10z"/>'}
};

var ICON_KEYS = ['work','school','family','hobby','asc','star','globe','heart'];

/* 在线状态 → 显示文案 */
var ONLINE_TXT = {
  online:'在线', wifi:'WiFi在线', '4g':'4G在线', '5g':'5G在线', off:'离线'
};

/* --------- 初始数据 --------- */
function seed() {
  return {
    me: { name:'王郑伟', wxid:'wxid_zhengwei98', avatar:'王', av:AV.zhou,
          sign:'把每一帧都拍好', phone:'138 0000 0000' },

    /* 分组：kind = 'p' 好友分组 / 'g' 群分组，collapsed 记住折叠状态 */
    categories: [
      { id:'p_best',   kind:'p', name:'特别关心', collapsed:false, scope:'msgp' },
      { id:'p_family', kind:'p', name:'家人',     collapsed:false, scope:'msgp' },
      { id:'p_school', kind:'p', name:'同学',     collapsed:false, scope:'msgp' },
      { id:'p_work',   kind:'p', name:'同事',     collapsed:false, scope:'msgp' },
      { id:'g_work',   kind:'g', name:'工作群',   collapsed:false },
      { id:'g_school', kind:'g', name:'同学群',   collapsed:false },
      { id:'g_family', kind:'g', name:'家人群',   collapsed:false },
      { id:'g_hobby',  kind:'g', name:'兴趣群',   collapsed:false }
    ],

    /* 群：gid = 所属群分组（单分组） */
    groups: [
      { id:'g1', name:'项目组 · 设计评审', gid:'g_work', members:['我','周悦','林晚','陈默','苏黎'],
        prev:'周悦：下午两点评审，记得带最新版', t:'14:32', unread:6,
        msgs:[
          {me:false,who:'周悦',t:'下午两点评审，记得带最新版',time:'14:32'},
          {me:true, t:'收到，我提前十分钟到',time:'14:34'}
        ] },
      { id:'g2', name:'产品研发同步群', gid:'g_work', members:['我','赵一鸣','周悦','苏黎'],
        prev:'赵一鸣：接口文档已更新，麻烦看下', t:'13:20', unread:0, dot:true },
      { id:'g3', name:'客户对接群 · 元启', gid:'g_work', members:['我','周子谦','林晚'],
        prev:'对方已确认第二版方案', t:'昨天', unread:0 },
      { id:'g4', name:'高三二班 · 同学会', gid:'g_school', members:['我','李哲','老四','王婷','林晚'],
        prev:'班长：初七聚一下，来的人扣个 1', t:'11:02', unread:2 },
      { id:'g5', name:'宿舍 306 永不熄灯', gid:'g_school', members:['我','老四','李哲','赵一鸣'],
        prev:'老四：谁还有当年那张合影', t:'昨天', unread:0 },
      { id:'g6', name:'大学班级群', gid:'g_school', members:['我','苏黎','吴桐'],
        prev:'辅导员：毕业十周年返校通知', t:'周一', unread:0 },
      { id:'g7', name:'一家人', gid:'g_family', members:['我','妈','爸','姐姐'],
        prev:'妈：周末回来吃饭吗', t:'昨天', unread:1 },
      { id:'g8', name:'周末爬山团', gid:'g_hobby', members:['我','吴桐','赵一鸣','老四'],
        prev:'周六早七点山脚集合', t:'昨天', unread:0, dot:true },
      { id:'g9', name:'读书会 · 九月共读', gid:'g_hobby', members:['我','苏黎','林晚'],
        prev:'本月书目已投票选出', t:'周一', unread:0 },
      { id:'g10', name:'周末球友会', gid:'', members:['我','吴桐','老四'],
        prev:'这周谁去？三缺一', t:'周二', unread:0, note:'建议归入「兴趣群」' },
      { id:'g11', name:'小区业主群', gid:'', members:['我','吴桐'],
        prev:'物业：本周六停水通知', t:'周一', unread:0, note:'建议归入「家人群」' },
      { id:'g12', name:'客户对接群 · 甲方', gid:'', members:['我','周子谦'],
        prev:'对方已确认第二版方案', t:'周三', unread:0, note:'建议归入「工作群」' }
    ],

    /* 好友：pgid = 所属好友分组（单分组）；online 在线状态；mood 个性签名 */
    people: [
      { id:'p11', name:'妈',     pgid:'p_best',   av:AV.mom,  online:'wifi', mood:'周末回家吃饭',
        remark:'家人', prev:'那我给你留门', t:'16:02', unread:2 },
      { id:'p13', name:'姐姐',   pgid:'p_best',   av:AV.su,   online:'4g',   mood:'在超市，要带什么',
        remark:'家人', prev:'[表情]', t:'15:40', unread:0 },
      { id:'p1',  name:'林晚',   pgid:'p_work',   av:AV.lin,  online:'5g',   mood:'改稿第 8 版',
        remark:'项目组 · 设计', prev:'那份设计稿我看过了', t:'14:20', unread:1 },
      { id:'p4',  name:'周悦',   pgid:'p_work',   av:AV.zhou, online:'online', mood:'开会中',
        remark:'产品经理', prev:'评审纪要我发你邮箱', t:'13:55', unread:0 },
      { id:'p2',  name:'陈默',   pgid:'p_work',   av:AV.chen, online:'off',  mood:'代码即诗',
        remark:'同部门', prev:'明天见', t:'昨天', unread:0 },
      { id:'p3',  name:'赵一鸣', pgid:'p_work',   av:AV.wu,   online:'online', mood:'',
        remark:'后端 · 同组', prev:'接口文档已更新', t:'13:20', unread:0 },
      { id:'p6',  name:'苏黎',   pgid:'p_school', av:AV.su,   online:'online', mood:'九月的书看完啦',
        remark:'大学同学', prev:'共读打卡第 21 天', t:'12:30', unread:0 },
      { id:'p8',  name:'老四',   pgid:'p_school', av:AV.sun,  online:'4g',   mood:'干饭人干饭魂',
        remark:'高中同宿舍', prev:'谁还有当年那张合影', t:'昨天', unread:0 },
      { id:'p7',  name:'李哲',   pgid:'p_school', av:AV.li,   online:'off',  mood:'',
        remark:'高三二班班长', prev:'初七聚一下', t:'11:02', unread:0 },
      { id:'p9',  name:'王婷',   pgid:'p_school', av:AV.zhao, online:'5g',   mood:'旅行计划中',
        remark:'高中同学', prev:'[链接] 十周年返校', t:'周一', unread:0 },
      { id:'p10', name:'吴桐',   pgid:'p_family', av:AV.wu,   online:'online', mood:'山顶见',
        remark:'爬山认识的', prev:'下周末去哪爬', t:'昨天', unread:0 },
      { id:'p12', name:'爸',     pgid:'p_family', av:AV.grey, online:'off',  mood:'',
        remark:'家人', prev:'好', t:'前天', unread:0 },
      { id:'p5',  name:'周子谦', pgid:'',         av:AV.sun,  online:'online', mood:'元启科技',
        remark:'元启科技 · 技术负责人', note:'建议归入「同事」', prev:'方案第二版没问题', t:'周三', unread:0 },
      /* 拉黑演示：收不到 Ta 任何信息，除非取消拉黑（与删除不同，记录保留） */
      { id:'p14', name:'广告推销小号', pgid:'', av:AV.grey, online:'off', mood:'', remark:'',
        prev:'加我领福利', t:'周一', unread:0, relation:'blocked', blockedFrom:'stranger' }
    ],

    /* 陌生人：加好友请求 + 留言（可文字聊天，不能发图片/视频/文件） */
    strangers: [
      { id:'s1', name:'山水有相逢', av:AV.grey, type:'request', msg:'我是老四的高中同学，加一下', t:'12:40' },
      { id:'s2', name:'老街旧人',   av:AV.chen, type:'chat',    msg:'在吗？上次说的事想再问问你', t:'09:15', unread:2 },
      { id:'s3', name:'顺风快递',   av:AV.sun,  type:'chat',    msg:'你的快递放前台了，记得取', t:'昨天', unread:0 }
    ],

    /* 私聊/群聊/陌生人会话记录 */
    chats: {
      p1: [ {me:false,t:'那份设计稿我看过了，整体节奏很好，就是第二屏的留白可以再大一点。',time:'14:20'},
            {me:true, t:'好的，我调一版。你说的留白是指上下间距还是左右？',time:'14:21'} ],
      g1: [ {me:false,who:'周悦',t:'下午两点评审，记得带最新版',time:'14:32'} ],
      s2: [ {me:false,t:'上次你说那个分组的功能，用着还行吗？',time:'09:14'},
            {me:false,t:'在吗？上次说的事想再问问你',time:'09:15'} ]
    },

    miscUncat: 21,   /* 未分组占位数量感 */

    settings: { showDirFirst:true, collapseOthers:true, multiCat:false, newToUncat:true,
                msgMute:false, pinChat:true, saveContacts:true, msgTab:'p', contactSort:'pinyin',
                upFolded:false, ugFolded:false }
  };
}

/* --------- 持久化 --------- */
var DB = {
  key: 'chatcat_v3',
  data: null,
  load: function () {
    try {
      var raw = localStorage.getItem(this.key);
      if (raw) this.data = JSON.parse(raw);
    } catch (e) {}
    if (!this.data) this.data = seed();
    /* 旧版本数据迁移：补齐新字段，不重置用户已建的分组 */
    if (!this.data.strangers) this.data.strangers = seed().strangers;
    if (!this.data.settings) this.data.settings = seed().settings;
    if (this.data.settings.contactSort === undefined) this.data.settings.contactSort = 'pinyin';
    if (this.data.settings.upFolded === undefined) this.data.settings.upFolded = false;
    if (this.data.settings.ugFolded === undefined) this.data.settings.ugFolded = false;
    /* 旧版好友分组无 scope：默认归入个人消息体系；旧好友补 cpgid（通讯录初始全未分组） */
    DB.data.categories.forEach(function (c) {
      if (c.kind === 'p' && c.scope === undefined) c.scope = 'msgp';
    });
    DB.data.people.forEach(function (p) {
      if (p.cpgid === undefined) p.cpgid = '';
    });
    /* 旧版群无 owner：成员数组里 '我' 表示自己，默认「我」为群主；admins 为管理员名单 */
    DB.data.groups.forEach(function (g) {
      if (!g.members) g.members = ['我'];
      if (g.owner === undefined) g.owner = g.members.indexOf('我') >= 0 ? '我' : (g.members[0] || '');
      if (!g.admins) g.admins = [];
    });
    this.save();
    return this.data;
  },
  save: function () {
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) {}
  },
  reset: function () {
    this.data = seed();
    /* 与 load 一致：补齐群主，保证测试/重置后数据规整 */
    this.data.groups.forEach(function (g) {
      if (g.owner === undefined) g.owner = g.members.indexOf('我') >= 0 ? '我' : (g.members[0] || '');
      if (!g.admins) g.admins = [];
    });
    this.save();
  }
};

/* --------- 查询 --------- */
var Q = {
  cat: function (id) { return DB.data.categories.filter(function (c) { return c.id === id; })[0]; },
  /* 好友分组按 scope 区分：'msgp'=个人消息体系，'contacts'=通讯录体系；群分组 kind:'g' 无 scope */
  catList: function (kind, scope) {
    return DB.data.categories.filter(function (c) {
      return c.kind === kind && (scope === undefined || c.scope === scope);
    });
  },
  groupsOf: function (cid) { return DB.data.groups.filter(function (g) { return g.gid === cid; }); },
  peopleOf: function (cid) {
    var c = Q.cat(cid);
    if (!c) return [];
    var fld = c.scope === 'contacts' ? 'cpgid' : 'pgid';
    return DB.data.people.filter(function (p) {
      return p[fld] === cid && p.relation !== 'blocked';
    });
  },
  uncatGroups: function () {
    return DB.data.groups.filter(function (g) { return !g.gid || !Q.cat(g.gid); });
  },
  /* 未分组好友：scope='contacts' 看 cpgid，默认看 pgid（个人消息体系） */
  uncatPeople: function (scope) {
    scope = scope || 'msgp';
    return DB.data.people.filter(function (p) {
      if (p.relation === 'blocked') return false;
      if (scope === 'contacts') return !p.cpgid || !Q.cat(p.cpgid);
      return !p.pgid || !Q.cat(p.pgid);
    });
  },
  /* 全部好友（不含拉黑） */
  friends: function () {
    return DB.data.people.filter(function (p) { return p.relation !== 'blocked'; });
  },
  /* 拉黑名单 */
  blocked: function () {
    return DB.data.people.filter(function (p) { return p.relation === 'blocked'; });
  },
  stranger: function (id) { return DB.data.strangers.filter(function (s) { return s.id === id; })[0]; },
  strangerUnread: function () {
    return DB.data.strangers.reduce(function (n, s) { return n + (s.unread || 0); }, 0);
  },
  uncatCount: function () { return Q.uncatGroups().length + Q.uncatPeople().length + DB.data.miscUncat; },
  catTotal: function (cid) {
    var c = Q.cat(cid); if (!c) return 0;
    return c.kind === 'g' ? Q.groupsOf(cid).length : Q.peopleOf(cid).length;
  },
  catUnread: function (cid) {
    var n = 0;
    Q.groupsOf(cid).forEach(function (g) { n += g.unread || 0; });
    Q.peopleOf(cid).forEach(function (p) { n += p.unread || 0; });
    return n;
  },
  onlineCount: function (cid) {
    var n = 0;
    Q.peopleOf(cid).forEach(function (p) { if (p.online && p.online !== 'off') n++; });
    return n;
  },
  totalOnline: function () {
    return DB.data.people.filter(function (p) {
      return p.online && p.online !== 'off' && p.relation !== 'blocked';
    }).length;
  },
  unreadCatCount: function () {
    return DB.data.categories.filter(function (c) { return Q.catUnread(c.id) > 0; }).length;
  },
  totalUnread: function () {
    var n = 0;
    DB.data.categories.forEach(function (c) { n += Q.catUnread(c.id); });
    DB.data.strangers.forEach(function (s) { n += s.unread || 0; });
    return n;
  },
  latestLine: function (cid) {
    var c = Q.cat(cid); if (!c) return '';
    if (c.kind === 'g') {
      var gs = Q.groupsOf(cid);
      return gs.length ? (gs[0].prev || '') : '暂无消息';
    }
    var ps = Q.peopleOf(cid);
    return ps.length ? (ps[0].prev || '') : '暂无消息';
  },
  group: function (id) { return DB.data.groups.filter(function (g) { return g.id === id; })[0]; },
  person: function (id) { return DB.data.people.filter(function (p) { return p.id === id; })[0]; },
  chat: function (id) { if (!DB.data.chats[id]) DB.data.chats[id] = []; return DB.data.chats[id]; },
  onlineTxt: function (p) { return (p.online && ONLINE_TXT[p.online]) || '离线'; },
  isOnline: function (p) { return p.online && p.online !== 'off'; },
  /* 是否群主：成员数组里 '我' 表示自己；owner 缺省时按是否包含 '我' 判定 */
  isOwner: function (g) {
    if (!g) return false;
    return g.owner !== undefined ? g.owner === '我' : (g.members || []).indexOf('我') >= 0;
  },
  /* 还没在群里的好友（「添加成员」候选，不含拉黑） */
  groupCandidates: function (gid) {
    var g = Q.group(gid); if (!g) return [];
    return DB.data.people.filter(function (p) {
      return p.relation !== 'blocked' && (g.members || []).indexOf(p.name) < 0;
    });
  },
  /* 管理员名额上限：50 人以下 1 个，50～499 人 2 个，500 人及以上 3 个；群成员人数不设上限 */
  maxAdmins: function (g) {
    var n = (g && g.members ? g.members.length : 0);
    return n >= 500 ? 3 : (n >= 50 ? 2 : 1);
  },
  /* 某人（默认「我」）是否该群管理员 */
  isAdmin: function (g, name) {
    if (!g) return false;
    return (g.admins || []).indexOf(name === undefined ? '我' : name) >= 0;
  },
  /* 能否把 target 移出群：群主可踢任何他人；管理员只能踢普通成员 */
  canKick: function (g, target) {
    if (!g || target === '我' || target === g.owner) return false;
    if (Q.isOwner(g)) return true;
    if (Q.isAdmin(g, '我')) return (g.admins || []).indexOf(target) < 0;
    return false;
  }
};

/* --------- 操作 --------- */
var A = {
  /* 归入/移出分组。好友分组按 scope 落到 pgid(个人消息) 或 cpgid(通讯录)；
     cid 给定时优先用该分组的 scope；cid 为空（移出）时需显式传 scope */
  toggleCat: function (kind, id, cid, on, scope) {
    var obj = kind === 'group' ? Q.group(id) : Q.person(id);
    if (!obj) return;
    if (kind === 'group') {
      obj.gid = on ? cid : '';
    } else {
      var fld = (scope === 'contacts') ? 'cpgid' : 'pgid';
      if (cid) { var cc = Q.cat(cid); if (cc && cc.scope) fld = cc.scope === 'contacts' ? 'cpgid' : 'pgid'; }
      obj[fld] = on ? cid : '';
    }
    DB.save();
  },
  /* 往群里加人（按姓名去重追加），返回实际新增数 */
  addMembers: function (gid, names) {
    var g = Q.group(gid); if (!g) return 0;
    g.members = g.members || [];
    var add = 0;
    (names || []).forEach(function (n) {
      if (n && g.members.indexOf(n) < 0) { g.members.push(n); add++; }
    });
    DB.save();
    return add;
  },
  /* 把某人移出群；不能移出自己；若他是管理员同步撤销 */
  removeMember: function (gid, name) {
    var g = Q.group(gid); if (!g) return;
    if (name === '我') return;
    g.members = (g.members || []).filter(function (m) { return m !== name; });
    if (g.admins) g.admins = g.admins.filter(function (m) { return m !== name; });
    DB.save();
  },
  /* 群主修改群名 */
  setGroupName: function (gid, name) {
    var g = Q.group(gid); if (!g || !name) return false;
    g.name = name; DB.save(); return true;
  },
  /* 设置/撤销管理员（仅群主可操作）。返回错误文案或 null */
  toggleAdmin: function (gid, name, on) {
    var g = Q.group(gid); if (!g) return '群不存在';
    if (!Q.isOwner(g)) return '只有群主可以设置管理员';
    if (name === '我' || name === g.owner) return '不能对群主设置管理员';
    g.admins = g.admins || [];
    var i = g.admins.indexOf(name);
    if (on && i >= 0) return '该成员已是管理员';
    if (!on && i < 0) return '该成员不是管理员';
    if (on) {
      var cap = Q.maxAdmins(g);
      if (g.admins.length >= cap) return g.members.length + ' 人群最多可设 ' + cap + ' 个管理员';
      g.admins.push(name);
    } else {
      g.admins.splice(i, 1);
    }
    DB.save();
    return null;
  },
  addCat: function (name, icon, kind, scope) {
    var id = (kind === 'g' ? 'g_' : 'p_') + Date.now();
    var c = { id:id, kind:kind || 'p', name:name, collapsed:false };
    if (kind !== 'g') c.scope = scope || 'msgp';
    DB.data.categories.push(c);
    DB.save();
    return id;
  },
  renameCat: function (cid, name) { var c = Q.cat(cid); if (c) { c.name = name; DB.save(); } },
  delCat: function (cid) {
    var c = Q.cat(cid); if (!c) return;
    DB.data.categories = DB.data.categories.filter(function (x) { return x.id !== cid; });
    if (c.kind === 'g') DB.data.groups.forEach(function (g) { if (g.gid === cid) g.gid = ''; });
    else {
      var fld = c.scope === 'contacts' ? 'cpgid' : 'pgid';
      DB.data.people.forEach(function (p) { if (p[fld] === cid) p[fld] = ''; });
    }
    DB.save();
  },
  moveCat: function (cid, dir) {
    var arr = DB.data.categories;
    var c = Q.cat(cid); if (!c) return;
    var same = [];
    arr.forEach(function (x, i) {
      if (x.kind === c.kind && (c.kind === 'g' || x.scope === c.scope)) same.push(i);
    });
    var pos = same.indexOf(arr.indexOf(c));
    var npos = pos + dir;
    if (npos < 0 || npos >= same.length) return;
    var i = same[pos], j = same[npos];
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    DB.save();
  },
  send: function (chatId, text, who) {
    var list = Q.chat(chatId);
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    list.push({ me:true, t:text, who:who || 'me', time:hh + ':' + mm });
    DB.save();
  },
  /* 真·图片消息：只存图片 key，图片本体在 IndexedDB（js/media.js） */
  sendImg: function (chatId, key) {
    var list = Q.chat(chatId);
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    list.push({ me:true, img:key, time:hh + ':' + mm });
    DB.save();
  },
  /* 真·位置消息：存真实经纬度，聊天里渲染成地图卡片 */
  sendGeo: function (chatId, geo) {
    var list = Q.chat(chatId);
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    list.push({ me:true, geo:geo, time:hh + ':' + mm });
    DB.save();
  },
  setPrev: function (id, text) {
    var g = Q.group(id);
    if (g) { g.prev = text; g.t = '刚刚'; g.unread = 0; }
    var p = Q.person(id);
    if (p) { p.prev = text; p.t = '刚刚'; p.unread = 0; }
    var s = Q.stranger(id);
    if (s) { s.msg = text; s.t = '刚刚'; s.unread = 0; }
    DB.save();
  },
  readGroup: function (id) {
    var g = Q.group(id); if (g) { g.unread = 0; g.dot = false; DB.save(); }
    var p = Q.person(id); if (p) { p.unread = 0; DB.save(); }
    var s = Q.stranger(id); if (s) { s.unread = 0; DB.save(); }
  },
  bump: function (id, text) {
    var g = Q.group(id);
    if (g) { g.prev = text; g.t = '刚刚'; g.unread = (g.unread || 0) + 1; DB.save(); }
    var p = Q.person(id);
    if (p) { p.prev = text; p.t = '刚刚'; p.unread = (p.unread || 0) + 1; DB.save(); }
  },
  addPerson: function (name, pgid) {
    var id = 'p_' + Date.now();
    DB.data.people.push({ id:id, name:name, pgid:pgid || '', cpgid:'', av:AV.grey,
      online:'online', mood:'', remark:'', prev:'', t:'', unread:0 });
    DB.save();
    return id;
  },

  /* ---- 好友 / 陌生人 / 拉黑 关系操作 ---- */
  /* 同意陌生人的好友申请（或把留言陌生人加为好友）→ 进入未分组好友 */
  addFriend: function (sid) {
    var s = Q.stranger(sid); if (!s) return null;
    var id = 'p_' + Date.now();
    DB.data.people.push({ id:id, name:s.name, pgid:'', cpgid:'', av:s.av || AV.grey,
      online:'online', mood:'', remark:'', prev:s.msg || '', t:s.t || '', unread:0 });
    DB.data.strangers = DB.data.strangers.filter(function (x) { return x.id !== sid; });
    DB.save();
    return id;
  },
  /* 删除陌生人（连留言一起清掉） */
  delStranger: function (sid) {
    DB.data.strangers = DB.data.strangers.filter(function (x) { return x.id !== sid; });
    delete DB.data.chats[sid];
    DB.save();
  },
  /* 拉黑陌生人 */
  blockStranger: function (sid) {
    var s = Q.stranger(sid); if (!s) return;
    DB.data.people.push({ id:'p_' + Date.now(), name:s.name, pgid:'', cpgid:'', av:s.av || AV.grey,
      online:'off', mood:'', remark:'', prev:s.msg || '', t:s.t || '', unread:0,
      relation:'blocked', blockedFrom:'stranger' });
    this.delStranger(sid);
  },
  /* 拉黑好友：收不到 Ta 的任何信息，与删除不同（记录保留，可恢复） */
  blockPerson: function (id) {
    var p = Q.person(id); if (!p || p.relation === 'blocked') return;
    p.relation = 'blocked';
    p.blockedFrom = 'friend';
    DB.save();
  },
  /* 取消拉黑：好友回到原分组；原陌生人回到陌生类 */
  unblockPerson: function (id) {
    var p = Q.person(id);
    if (!p || p.relation !== 'blocked') return;
    if (p.blockedFrom === 'stranger') {
      DB.data.people = DB.data.people.filter(function (x) { return x.id !== id; });
      DB.data.strangers.push({ id:'s_' + Date.now(), name:p.name, av:p.av, type:'chat',
        msg:p.prev || '', t:p.t || '', unread:0 });
    } else {
      delete p.relation;
      delete p.blockedFrom;
    }
    DB.save();
  },
  /* 删除好友：连聊天记录一起删除（与拉黑不同，不可恢复） */
  delPerson: function (id) {
    DB.data.people = DB.data.people.filter(function (x) { return x.id !== id; });
    delete DB.data.chats[id];
    DB.save();
  }
};

window.DB = DB; window.Q = Q; window.A = A; window.AV = AV;
window.ICONS = ICONS; window.ICON_KEYS = ICON_KEYS; window.ONLINE_TXT = ONLINE_TXT;
