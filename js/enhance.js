/* ==========================================================
   微聊 · 交互增强补丁 v4
   适配底部 5 tab（个人消息/群聊消息/通讯录/功能/个人）
   功能：
     1) 好友/群行（.frow2）左滑 → 编辑 / 移动 / 删除
        （个人消息、群聊消息与分组房间都可用）
     2) 通讯录三类行左滑：
        好友行 → 编辑 / 拉黑 / 删除
        陌生人行 → 加好友 / 拉黑 / 删除
        拉黑行 → 取消拉黑 / 删除
     3) 分组房间内长按拖拽行 → 调整该分组内的顺序（写回数据层）
     4) 编辑页 editedit（改名 / 备注）
   注：分组长按拖拽排序已在 screens1.js 原生实现（bindGroupReorder），
      本文件不再重复处理分组排序。
   设计原则：不改动 screens*.js 主逻辑，渲染后自动增强。
   ========================================================== */
(function () {
  'use strict';

  var LONG_PRESS = 260;   // 长按判定时长(ms)
  var MOVE_TOL   = 9;     // 长按前允许的手指抖动(px)

  /* ---------------------------------------------------------
     工具
     --------------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function vibrate(ms) { if (navigator.vibrate) { try { navigator.vibrate(ms || 10); } catch (e) {} } }

  var tipEl = null;
  function tip(text) {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'sort-tip';
      document.body.appendChild(tipEl);
    }
    tipEl.textContent = text;
    tipEl.classList.add('on');
    clearTimeout(tipEl._t);
    tipEl._t = setTimeout(function () { tipEl.classList.remove('on'); }, 1600);
  }

  /* 当前页面 key（栈顶） */
  function curPage() {
    var st = window.S;
    if (st && st.stack && st.stack.length) return st.stack[st.stack.length - 1].page;
    return '';
  }

  /* 统一手势：长按启动 + 移动跟随 + 松手结束（同时支持鼠标与触摸） */
  function bindDrag(el, opt) {
    var timer = null;
    var active = false;      // 长按已触发，进入拖拽态
    var startX = 0, startY = 0;
    var startX0 = 0, startY0 = 0;

    function point(e) {
      if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }

    function down(e) {
      if (e.type === 'mousedown' && e.button !== 0) return;
      var p = point(e);
      startX = p.x; startY = p.y;
      active = false;
      clearTimeout(timer);
      timer = setTimeout(function () {
        active = true;
        el._justDragged = true;          // 防止松手后触发点击
        vibrate(12);
        startX0 = startX; startY0 = startY;
        opt.onStart(startX, startY);
      }, opt.delay || LONG_PRESS);
    }

    function move(e) {
      var p = point(e);
      if (!active) {
        // 还没到长按时间就移动了 → 判定为滚动，取消长按
        if (Math.abs(p.x - startX) > MOVE_TOL || Math.abs(p.y - startY) > MOVE_TOL) {
          clearTimeout(timer);
        }
        return;
      }
      if (e.cancelable) e.preventDefault();
      opt.onMove(p.x, p.y);
    }

    function up() {
      clearTimeout(timer);
      if (active) {
        active = false;
        opt.onEnd();
        setTimeout(function () { el._justDragged = false; }, 420);
      }
    }

    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', up);
    el.addEventListener('touchcancel', up);
    el.addEventListener('mousedown', down);
    document.addEventListener('mousemove', function (e) { if (active) move(e); });
    document.addEventListener('mouseup', function () { if (active) up(); });
    /* 标记：本元素已支持拖拽，供点击处理时判断是否刚拖完 */
    el._dragBound = true;
    return {
      isDragging: function () { return active; },
      startXY: function () { return { x: startX0, y: startY0 }; }
    };
  }

  /* ---------------------------------------------------------
     左滑管理（三处应用）
     - 个人消息/群聊消息/分组房间：好友/群行 → 编辑 / 移动 / 删除
     - 通讯录好友行 → 编辑 / 拉黑 / 删除
     - 通讯录陌生人行 → 加好友 / 拉黑 / 删除
     - 通讯录拉黑行 → 取消拉黑 / 删除（两个按钮）
     --------------------------------------------------------- */
  var SA_ICONS = {
    edit:   '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 5l4 4"/>',
    move:   '<path d="M9 6H5v13h14v-4"/><path d="M14 4h6v6"/><path d="M20 4l-9 9"/>',
    del:    '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
    add:    '<circle cx="10" cy="8" r="3.4"/><path d="M3.5 20c0-3.4 2.9-5.6 6.5-5.6s6.5 2.2 6.5 5.6"/><path d="M19 6v6M16 9h6"/>',
    block:  '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    unblock:'<path d="M5 13l4 4L19 7"/>'
  };

  /* 通用：给一行挂左滑按钮（btns 决定按钮组，宽度 = 按钮数 × 76px；cb 的 key 对应 data-act） */
  function swipeRow(row, btns, cb) {
    if (row._swipeBound) return;
    row._swipeBound = true;
    var wrap = document.createElement('div');
    wrap.className = 'swipe-row';
    var inner = document.createElement('div');
    inner.className = 'swipe-in';
    var acts = document.createElement('div');
    acts.className = 'swipe-act';
    acts.innerHTML = btns.map(function (b) {
      return '<div class="sa ' + b.cls + '" data-act="' + b.act + '">' +
        '<svg viewBox="0 0 24 24">' + (SA_ICONS[b.act] || '') + '</svg>' + b.label + '</div>';
    }).join('');
    row.parentNode.insertBefore(wrap, row);
    wrap.appendChild(inner);
    wrap.appendChild(acts);
    inner.appendChild(row);
    bindSwipe(row, inner, acts, cb, btns.length * 76);
  }

  /* 左滑手势通用实现：给任意行加「滑出操作按钮」 */
  function bindSwipe(row, inner, acts, cb, W) {
    W = W || 228;
    var open = false, sx = 0, sy = 0, dx = 0, tracking = false;
    function setX(v) { inner.style.transform = 'translateX(' + v + 'px)'; }
    function close() { open = false; row._swipeOpen = false; setX(0); }

    row.addEventListener('touchstart', function (e) {
      if (row._sortActive) return;          /* 长按排序中，不启动左滑 */
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
      tracking = true; dx = 0;
      inner.style.transition = 'none';
    }, { passive: true });

    row.addEventListener('touchmove', function (e) {
      if (!tracking || row._sortActive) return;
      dx = e.touches[0].clientX - sx;
      var dy = e.touches[0].clientY - sy;
      if (Math.abs(dy) > Math.abs(dx)) { tracking = false; return; }
      if (e.cancelable) e.preventDefault();
      var base = open ? -W : 0;
      setX(Math.max(-W, Math.min(0, base + dx)));
    }, { passive: false });

    row.addEventListener('touchend', function () {
      if (!tracking) return;
      tracking = false;
      inner.style.transition = '';
      var base = open ? -W : 0;
      if (base + dx < -W * 0.35) { open = true; row._swipeOpen = true; setX(-W); }
      else { close(); }
    });

    /* 包一层点击：左滑打开时点击=收起；长按拖拽后不触发跳转 */
    var origClick = row.onclick;
    row.onclick = function (e) {
      if (open) { close(); return; }
      if (row._justDragged) return;
      if (origClick) origClick.call(this, e);
    };

    acts.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!btn) return;
      vibrate(10);
      var fn = cb[btn.dataset.act];
      if (fn) fn();
    });
  }

  /* 消息两屏 + 分组房间：好友/群行 → 编辑 / 移动 / 删除 */
  function enhanceRowSwipe(page) {
    $$('.frow2[data-group], .frow2[data-person]', page).forEach(function (row) {
      var isG = row.dataset.group !== undefined;
      var id = isG ? row.dataset.group : row.dataset.person;
      var o = isG ? Q.group(id) : Q.person(id);
      if (!o) return;
      swipeRow(row, [
        { act:'edit', cls:'edit', label:'编辑' },
        { act:'move', cls:'move', label:'移动' },
        { act:'del',  cls:'del',  label:'删除' }
      ], {
        edit: function () { go('editedit', { kind: isG ? 'group' : 'person', id: id }); },
        move: function () {
          go('quickassign', { kind: isG ? 'group' : 'person', id: id, name: o.name,
            scope: isG ? undefined : 'msgp' });
        },
        del: function () {
          if (confirm('删除' + (isG ? '群聊「' : '好友「') + o.name + '」？\n聊天记录也会一并删除。')) {
            if (isG) {
              DB.data.groups = DB.data.groups.filter(function (g) { return g.id !== id; });
            } else {
              DB.data.people = DB.data.people.filter(function (p) { return p.id !== id; });
            }
            delete DB.data.chats[id];
            DB.save();
            tip('已删除');
            render(true);
          }
        }
      });
    });
  }

  /* 通讯录：三类行的左滑 */
  function enhanceContactsSwipe(page) {
    /* 好友行：编辑 / 拉黑 / 删除 */
    $$('.row[data-p]', page).forEach(function (row) {
      var id = row.dataset.p;
      var o = Q.person(id);
      if (!o) return;
      swipeRow(row, [
        { act:'edit',  cls:'edit',  label:'编辑' },
        { act:'block', cls:'block', label:'拉黑' },
        { act:'del',   cls:'del',   label:'删除' }
      ], {
        edit: function () { go('editedit', { kind:'person', id:id }); },
        block: function () {
          if (confirm('把「' + o.name + '」加入黑名单？\n拉黑后不会收到 Ta 的任何信息，可随时取消拉黑。')) {
            A.blockPerson(id);
            tip('已加入黑名单');
            render(true);
          }
        },
        del: function () {
          if (confirm('删除好友「' + o.name + '」？\n聊天记录也会一并删除。')) {
            A.delPerson(id);
            tip('已删除好友');
            render(true);
          }
        }
      });
    });
    /* 陌生人行：加好友 / 拉黑 / 删除 */
    $$('.row[data-s]', page).forEach(function (row) {
      var id = row.dataset.s;
      var o = Q.stranger(id);
      if (!o) return;
      swipeRow(row, [
        { act:'add',   cls:'add',   label:'加好友' },
        { act:'block', cls:'block', label:'拉黑' },
        { act:'del',   cls:'del',   label:'删除' }
      ], {
        add: function () {
          A.addFriend(id);
          tip('已添加为好友');
          render(true);
        },
        block: function () {
          if (confirm('把「' + o.name + '」加入黑名单？\n之后不会再收到 Ta 的任何信息。')) {
            A.blockStranger(id);
            tip('已加入黑名单');
            render(true);
          }
        },
        del: function () {
          if (confirm('删除陌生人「' + o.name + '」的消息？')) {
            A.delStranger(id);
            tip('已删除');
            render(true);
          }
        }
      });
    });
    /* 拉黑行：取消拉黑 / 删除 */
    $$('.row[data-b]', page).forEach(function (row) {
      var id = row.dataset.b;
      var o = Q.blocked().filter(function (x) { return x.id === id; })[0];
      if (!o) return;
      swipeRow(row, [
        { act:'unblock', cls:'unblock', label:'取消拉黑' },
        { act:'del',     cls:'del',     label:'删除' }
      ], {
        unblock: function () {
          A.unblockPerson(id);
          tip('已取消拉黑');
          render(true);
        },
        del: function () {
          if (confirm('从黑名单中删除「' + o.name + '」？\n删除后彻底移除（跟取消拉黑不一样，不会恢复）。')) {
            A.delPerson(id);
            tip('已删除');
            render(true);
          }
        }
      });
    });
  }

  /* ---------------------------------------------------------
     分组房间内：好友/群 长按拖动排序（写回数据层）
     只在 category 页启用 —— 消息首页跨分组，不参与。
     --------------------------------------------------------- */
  function reorderList(kind, page) {
    var attr = kind === 'group' ? 'data-group' : 'data-person';
    var rows = $$('.frow2[' + attr + ']', page);
    if (rows.length < 1) return;
    var ghost = null, srcEl = null, startTop = 0, startLeft = 0, startX0 = 0, startY0 = 0;
    var lastSwapAt = 0;

    function onStart(x, y) {
      var el = null;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i].getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top - 6 && y <= r.bottom + 6) { el = rows[i]; break; }
      }
      if (!el) return;
      srcEl = el;
      el._sortActive = true;
      /* 若该行正被左滑打开，先复位 */
      var si = el.querySelector ? el.closest('.swipe-in') : null;
      if (si) si.style.transform = 'translateX(0)';
      var r = el.getBoundingClientRect();
      startTop = r.top; startLeft = r.left; startX0 = x; startY0 = y;
      ghost = el.cloneNode(true);
      ghost.className = 'frow2 cat-ghost';
      ghost.style.width = r.width + 'px';
      ghost.style.height = r.height + 'px';
      ghost.style.left = r.left + 'px';
      ghost.style.top = r.top + 'px';
      document.body.appendChild(ghost);
      el.classList.add('row-dragging');
      document.body.classList.add('cat-sorting');
      tip('上下拖动 · 调整顺序');
    }

    function onMove(x, y) {
      if (!ghost) return;
      ghost.style.top = (startTop + (y - startY0)) + 'px';
      var over = null;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i].getBoundingClientRect();
        if (r.top <= y && y <= r.bottom && rows[i] !== srcEl) { over = rows[i]; break; }
      }
      if (over && Date.now() - lastSwapAt > 140) {
        lastSwapAt = Date.now();
        var ro = over.getBoundingClientRect();
        var rs = srcEl.getBoundingClientRect();
        if (ro.top < rs.top) over.parentNode.insertBefore(srcEl, over);
        else over.parentNode.insertBefore(srcEl, over.nextSibling);
        var nr = srcEl.getBoundingClientRect();
        startTop = nr.top; startY0 = y;
        ghost.style.top = nr.top + 'px';
        vibrate(6);
      }
    }

    /* 把页面上的行顺序写回数据层（分组内相对顺序应用到全局数组） */
    function commitOrder() {
      var key = kind === 'group' ? 'group' : 'person';
      var pos = {};
      $$('.frow2[' + attr + ']', page).forEach(function (r, i) { pos[r.dataset[key]] = i; });
      var arr = kind === 'group' ? DB.data.groups : DB.data.people;
      arr.sort(function (a, b) {
        var pa = pos[a.id] === undefined ? 99999 : pos[a.id];
        var pb = pos[b.id] === undefined ? 99999 : pos[b.id];
        return pa - pb;
      });
      DB.save();
    }

    function onEnd() {
      if (!ghost) return;
      var el = srcEl;
      ghost.remove(); ghost = null;
      el.classList.remove('row-dragging');
      el._sortActive = false;
      document.body.classList.remove('cat-sorting');
      commitOrder();
      tip('顺序已保存');
      vibrate(12);
    }

    var wrapped = { onStart: onStart, onMove: onMove, onEnd: onEnd };

    rows.forEach(function (el, idx) {
      if (el._sortBound) return;
      el._sortBound = true;
      bindDrag(el, wrapped);
      el._sortIdx = idx;
    });
  }

  /* ---------------------------------------------------------
     编辑页（好友 / 群 改名改备注）
     --------------------------------------------------------- */
  if (window.SCREENS) {
    SCREENS.editedit = function (p) {
      var isP = p.kind === 'person';
      var o = isP ? Q.person(p.id) : Q.group(p.id);
      if (!o) return '<div class="empty">对象不存在</div>';
      var h = navBar('编辑', { right: '<div class="nav-r"></div>' });
      h += '<div class="body" style="background:#fff">';
      h += '<div class="edit-wrap"><div class="edit-lab">' + (isP ? '名称' : '群名称') + '</div>' +
        '<input class="edit-in" id="edName" value="' + H.esc(o.name) + '" placeholder="' + (isP ? '好友名称' : '群名称') + '"></div>';
      if (isP) {
        h += '<div class="edit-wrap"><div class="edit-lab">备注</div>' +
          '<input class="edit-in" id="edRemark" value="' + H.esc(o.remark || '') + '" placeholder="例如：项目组 · 设计"></div>';
      } else {
        h += '<div class="edit-wrap"><div class="edit-lab">群备注</div>' +
          '<input class="edit-in" id="edRemark" value="' + H.esc(o.note || '') + '" placeholder="例如：客户项目群"></div>';
      }
      h += '<div class="edit-tip">删除和移动到其他分组：在列表里向左滑动该条目。</div>';
      h += '<div class="edit-save" data-saveed>保存</div>';
      h += '</div>';
      return h;
    };
    SCREENS.editedit.after = function (root, p) {
      var btn = root.querySelector('[data-saveed]');
      if (!btn) return;
      btn.onclick = function () {
        var inp = root.querySelector('#edName');
        var nm = (inp ? inp.value : '').trim();
        if (!nm) { H.toast('名称不能为空'); return; }
        var o = p.kind === 'person' ? Q.person(p.id) : Q.group(p.id);
        if (!o) return;
        o.name = nm;
        var rk = root.querySelector('#edRemark');
        if (rk) {
          if (p.kind === 'person') o.remark = rk.value.trim();
          else o.note = rk.value.trim();
        }
        DB.save();
        H.haptic();
        H.toast('已保存');
        back();
        setTimeout(function () { render(true); }, 80);
      };
    };
  }

  /* ---------------------------------------------------------
     主入口：每次渲染后调用
     --------------------------------------------------------- */
  function enhanceAll() {
    var page = document.querySelector('#view .page');
    if (!page) return;
    var pg = curPage();

    /* 1. 个人消息/群聊消息/分组房间：好友/群左滑管理 */
    if (pg === 'msgp' || pg === 'msgg' || pg === 'category') {
      enhanceRowSwipe(page);
    }

    /* 1.5 通讯录：三类行（好友/陌生人/拉黑）各自的左滑按钮组 */
    if (pg === 'contacts') {
      enhanceContactsSwipe(page);
    }

    /* 2. 分组房间内：长按拖拽调整该分组内的顺序 */
    if (pg === 'category') {
      if (page.querySelector('.frow2[data-group]')) reorderList('group', page);
      if (page.querySelector('.frow2[data-person]')) reorderList('person', page);
    }
  }

  /* 包装 render：每次渲染完自动增强 */
  function hookRender() {
    if (typeof window.render !== 'function' || window.render._enhanced) return;
    var raw = window.render;
    var wrapped = function () {
      var r = raw.apply(this, arguments);
      try { enhanceAll(); } catch (e) { console.error('[enhance]', e); }
      return r;
    };
    wrapped._enhanced = true;
    window.render = wrapped;
    /* app.js 内部函数作用域里的 render 也要指向新版 */
    try { render = wrapped; } catch (e) {}
  }

  /* 启动：等 DOM 就绪后挂钩，并补做一次增强 */
  function boot() {
    hookRender();
    setTimeout(function () {
      enhanceAll();
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  /* 首屏渲染早于本脚本时，补挂一次 */
  window.addEventListener('load', function () {
    hookRender();
    enhanceAll();
  });
})();
