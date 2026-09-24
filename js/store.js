/* ==========================================================
   数据层 —— 分类系统聊天 App
   核心模型：分类(Category) 下同时容纳 群(Group) 与 人(Person)
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
  plus  :{bg:'linear-gradient(150deg,#B8BFC7,#8A939C)',svg:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'},
  people:{bg:'linear-gradient(150deg,#07C160,#059E4E)',svg:'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M17 11.5a3 3 0 100-6M19 20c0-2.4-.9-4.2-2.3-5.4"/>'}
};

var ICON_KEYS = ['work','school','family','hobby','asc','star','globe','plus'];

/* --------- 初始数据 --------- */
function seed() {
  var now = Date.now();
  var min = 60000;
  return {
    me: { name:'王郑伟', wxid:'wxid_zhengwei98', avatar:'王', av:AV.zhou,
          sign:'把每一帧都拍好', phone:'138 0000 0000' },

    categories: [
      { id:'c_work',   name:'工作', icon:'work',   pinned:true,  notify:true, rule:'按备注关键词' },
      { id:'c_school', name:'学校', icon:'school', pinned:false, notify:true, rule:'按备注关键词' },
      { id:'c_family', name:'家人', icon:'family', pinned:false, notify:true, rule:'' },
      { id:'c_hobby',  name:'兴趣', icon:'hobby',  pinned:false, notify:true, rule:'' }
    ],

    /* 群：每个群归属若干分类（可多归属） */
    groups: [
      { id:'g1', name:'项目组 · 设计评审', cats:['c_work'], members:['我','周悦','林晚','陈默','苏黎'],
        prev:'周悦：下午两点评审，记得带最新版', t:'14:32', unread:6,
        msgs:[
          {me:false,who:'周悦',t:'下午两点评审，记得带最新版',time:'14:32'},
          {me:true, t:'收到，我提前十分钟到',time:'14:34'}
        ] },
      { id:'g2', name:'产品研发同步群', cats:['c_work'], members:['我','赵一鸣','周悦','苏黎'],
        prev:'赵一鸣：接口文档已更新，麻烦看下', t:'13:20', unread:0, dot:true },
      { id:'g3', name:'客户对接群 · 元启', cats:['c_work'], members:['我','周子谦','林晚'],
        prev:'对方已确认第二版方案', t:'昨天', unread:0 },
      { id:'g4', name:'高三二班 · 同学会', cats:['c_school'], members:['我','李哲','老四','王婷','林晚'],
        prev:'班长：初七聚一下，来的人扣个 1', t:'11:02', unread:2 },
      { id:'g5', name:'宿舍 306 永不熄灯', cats:['c_school'], members:['我','老四','李哲','赵一鸣'],
        prev:'老四：谁还有当年那张合影', t:'昨天', unread:0 },
      { id:'g6', name:'大学班级群', cats:['c_school'], members:['我','苏黎','吴桐'],
        prev:'辅导员：毕业十周年返校通知', t:'周一', unread:0 },
      { id:'g7', name:'一家人', cats:['c_family'], members:['我','妈','爸','姐姐'],
        prev:'妈：周末回来吃饭吗', t:'昨天', unread:1 },
      { id:'g8', name:'周末爬山团', cats:['c_hobby'], members:['我','吴桐','赵一鸣','老四'],
        prev:'周六早七点山脚集合', t:'昨天', unread:0, dot:true },
      { id:'g9', name:'读书会 · 九月共读', cats:['c_hobby'], members:['我','苏黎','林晚'],
        prev:'本月书目已投票选出', t:'周一', unread:0 },
      { id:'g10', name:'周末球友会', cats:[], members:['我','吴桐','老四'],
        prev:'这周谁去？三缺一', t:'周二', unread:0, note:'建议归入「兴趣」' },
      { id:'g11', name:'小区业主群', cats:[], members:['我','吴桐'],
        prev:'物业：本周六停水通知', t:'周一', unread:0, note:'建议归入「家人」' },
      { id:'g12', name:'客户对接群 · 甲方', cats:[], members:['我','周子谦'],
        prev:'对方已确认第二版方案', t:'周三', unread:0, note:'建议归入「工作」' }
    ],

    /* 人：备注里带关系关键词，供自动建议使用 */
    people: [
      { id:'p1',  name:'林晚',   remark:'项目组 · 设计',        cats:['c_work'],   av:AV.lin,  note:'设计师' },
      { id:'p2',  name:'陈默',   remark:'同部门',              cats:['c_work'],   av:AV.chen, note:'' },
      { id:'p3',  name:'赵一鸣', remark:'后端 · 同组',          cats:['c_work'],   av:AV.wu,   note:'' },
      { id:'p4',  name:'周悦',   remark:'产品经理',            cats:['c_work'],   av:AV.zhou, note:'' },
      { id:'p5',  name:'周子谦', remark:'元启科技 · 技术负责人', cats:[],           av:AV.sun,  note:'建议归入「工作」' },
      { id:'p6',  name:'苏黎',   remark:'大学同学',            cats:['c_school'], av:AV.su,   note:'' },
      { id:'p7',  name:'李哲',   remark:'高三二班班长',        cats:[],           av:AV.li,   note:'建议归入「学校」' },
      { id:'p8',  name:'老四',   remark:'高中同宿舍',          cats:['c_school'], av:AV.sun,  note:'' },
      { id:'p9',  name:'王婷',   remark:'高中同学',            cats:[],           av:AV.zhao, note:'建议归入「学校」' },
      { id:'p10', name:'吴桐',   remark:'爬山认识的',          cats:['c_hobby'],  av:AV.wu,   note:'' },
      { id:'p11', name:'妈',     remark:'家人',                cats:['c_family'], av:AV.mom,  note:'' },
      { id:'p12', name:'爸',     remark:'家人',                cats:['c_family'], av:AV.grey, note:'' },
      { id:'p13', name:'姐姐',   remark:'家人',                cats:['c_family'], av:AV.su,   note:'' }
    ],

    /* 私聊会话（人和群的聊天记录统一在这里） */
    chats: {
      p1: [ {me:false,t:'那份设计稿我看过了，整体节奏很好，就是第二屏的留白可以再大一点。',time:'14:20'},
            {me:true, t:'好的，我调一版。你说的留白是指上下间距还是左右？',time:'14:21'} ],
      g1: [ {me:false,who:'周悦',t:'下午两点评审，记得带最新版',time:'14:32'} ]
    },

    /* 未分类里额外批量的人/群，凑出「46 项」的数量感 */
    miscUncat: 33,

    /* 界面16 通话、界面15 录音为纯展示，无需数据 */

    settings: {
      showDirFirst:true, collapseOthers:true, multiCat:true, newToUncat:true,
      msgMute:false, pinChat:true, saveContacts:true
    },

    moments: [
      { who:'林晚', av:AV.lin, t:'秋天的第一组照片，光是真的好。', time:'1 小时前', likes:['陈默','苏黎'], cmts:'陈默：第三张构图很好' },
      { who:'陈默', av:AV.chen, t:'项目终于上线了。感谢每一个加班的夜晚。', time:'3 小时前', likes:['林晚'], cmts:'' }
    ]
  };
}

/* --------- 持久化 --------- */
var DB = {
  key: 'chatcat_v1',
  data: null,
  load: function () {
    try {
      var raw = localStorage.getItem(this.key);
      if (raw) { this.data = JSON.parse(raw); return this.data; }
    } catch (e) {}
    this.data = seed();
    this.save();
    return this.data;
  },
  save: function () {
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) {}
  },
  reset: function () { this.data = seed(); this.save(); }
};

/* --------- 查询与操作 --------- */
var Q = {
  cat: function (id) { return DB.data.categories.filter(function (c) { return c.id === id; })[0]; },
  groupsOf: function (cid) { return DB.data.groups.filter(function (g) { return g.cats.indexOf(cid) >= 0; }); },
  peopleOf: function (cid) { return DB.data.people.filter(function (p) { return p.cats.indexOf(cid) >= 0; }); },
  uncatGroups: function () { return DB.data.groups.filter(function (g) { return !g.cats.length; }); },
  uncatPeople: function () { return DB.data.people.filter(function (p) { return !p.cats.length; }); },
  uncatCount: function () { return Q.uncatGroups().length + Q.uncatPeople().length + DB.data.miscUncat; },
  catTotal: function (cid) { return Q.groupsOf(cid).length + Q.peopleOf(cid).length; },
  catUnread: function (cid) {
    var n = 0;
    Q.groupsOf(cid).forEach(function (g) { n += g.unread || 0; });
    return n;
  },
  unreadCatCount: function () {
    return DB.data.categories.filter(function (c) { return Q.catUnread(c.id) > 0; }).length;
  },
  totalUnread: function () {
    var n = 0;
    DB.data.categories.forEach(function (c) { n += Q.catUnread(c.id); });
    return n;
  },
  latestLine: function (cid) {
    var gs = Q.groupsOf(cid);
    if (!gs.length) return '暂无消息';
    return gs[0].prev || '';
  },
  group: function (id) { return DB.data.groups.filter(function (g) { return g.id === id; })[0]; },
  person: function (id) { return DB.data.people.filter(function (p) { return p.id === id; })[0]; },
  chat: function (id) { if (!DB.data.chats[id]) DB.data.chats[id] = []; return DB.data.chats[id]; }
};

var A = {
  /* 把一组人或群归入 / 移出某个分类 */
  toggleCat: function (kind, id, cid, on) {
    var obj = kind === 'group' ? Q.group(id) : Q.person(id);
    if (!obj) return;
    var i = obj.cats.indexOf(cid);
    if (on && i < 0) obj.cats.push(cid);
    if (!on && i >= 0) obj.cats.splice(i, 1);
    DB.save();
  },
  addCat: function (name, icon) {
    var id = 'c_' + Date.now();
    DB.data.categories.push({ id:id, name:name, icon:icon || 'asc', pinned:false, notify:true, rule:'' });
    DB.save();
    return id;
  },
  renameCat: function (cid, name) { var c = Q.cat(cid); if (c) { c.name = name; DB.save(); } },
  delCat: function (cid) {
    DB.data.categories = DB.data.categories.filter(function (c) { return c.id !== cid; });
    DB.data.groups.forEach(function (g) { g.cats = g.cats.filter(function (x) { return x !== cid; }); });
    DB.data.people.forEach(function (p) { p.cats = p.cats.filter(function (x) { return x !== cid; }); });
    DB.save();
  },
  moveCat: function (cid, dir) {
    var arr = DB.data.categories;
    var i = arr.findIndex(function (c) { return c.id === cid; });
    var j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
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
  setPrev: function (id, text) {
    var g = Q.group(id);
    if (g) { g.prev = text; g.t = '刚刚'; g.unread = 0; }
    var p = Q.person(id);
    if (p) { p.prev = text; p.t = '刚刚'; }
    DB.save();
  },
  readGroup: function (id) { var g = Q.group(id); if (g) { g.unread = 0; g.dot = false; DB.save(); } },
  bump: function (id, text) {
    var g = Q.group(id);
    if (g) { g.prev = text; g.t = '刚刚'; g.unread = (g.unread || 0) + 1; DB.save(); }
  }
};

window.DB = DB; window.Q = Q; window.A = A; window.AV = AV;
window.ICONS = ICONS; window.ICON_KEYS = ICON_KEYS;
