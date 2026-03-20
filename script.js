/* ===== Viewport / Error Handler ===== */
// Mobile/Tablet viewport height fix (Galaxy S23+, iOS Safari, iPad 등)
function setVH() {
  var h = window.innerHeight;
  document.documentElement.style.setProperty('--vh', (h * 0.01) + 'px');
  document.documentElement.style.setProperty('--app-height', h + 'px');
}
setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', function(){ setTimeout(setVH, 200); });
// visualViewport API (더 정확)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', function(){
    document.documentElement.style.setProperty('--app-height', window.visualViewport.height + 'px');
    document.documentElement.style.setProperty('--vh', (window.visualViewport.height * 0.01) + 'px');
  });
}
window.onerror = function(msg, src, line, col, err) {
  var el = document.getElementById('errDisplay');
  if(el){
    el.style.display='block';
    el.textContent = 'JS ERROR\nLine: '+line+'\nMsg: '+msg+'\n\n'+(err&&err.stack?err.stack:'');
  }
  return false;
};
window.addEventListener('unhandledrejection', function(e){
  var el = document.getElementById('errDisplay');
  if(el){ el.style.display='block'; el.textContent = 'PROMISE ERROR: '+(e.reason||e); }
});

/* ===== App Logic ===== */
/* ══ DATA ══ */
const COLORS=[{h:'#4285f4'},{h:'#34a853'},{h:'#ea4335'},{h:'#fbbc04'},{h:'#9c27b0'},{h:'#00bcd4'},{h:'#ff7043'},{h:'#e91e63'}];
const PASTEL_COLORS=[{h:'#90caf9'},{h:'#a5d6a7'},{h:'#ef9a9a'},{h:'#ffe082'},{h:'#ce93d8'},{h:'#80deea'},{h:'#ffab91'},{h:'#f48fb1'}];
const COLOR_SETS={
  vivid: [{h:'#e53935'},{h:'#ff6d00'},{h:'#fdd835'},{h:'#43a047'},{h:'#1e88e5'},{h:'#3949ab'},{h:'#8e24aa'},{h:'#e91e63'}],
  soft:  [{h:'#e57373'},{h:'#ffb74d'},{h:'#fff176'},{h:'#81c784'},{h:'#64b5f6'},{h:'#7986cb'},{h:'#ba68c8'},{h:'#f06292'}],
  pastel:[{h:'#ffcdd2'},{h:'#ffe0b2'},{h:'#fff9c4'},{h:'#c8e6c9'},{h:'#bbdefb'},{h:'#c5cae9'},{h:'#e1bee7'},{h:'#f8bbd0'}],
  muted: [{h:'#b71c1c'},{h:'#e65100'},{h:'#f9a825'},{h:'#2e7d32'},{h:'#1565c0'},{h:'#283593'},{h:'#6a1b9a'},{h:'#880e4f'}],
  mono:  [{h:'#fafafa'},{h:'#bdbdbd'},{h:'#9e9e9e'},{h:'#757575'},{h:'#616161'},{h:'#424242'},{h:'#212121'},{h:'#000000'}]
};
const COLOR_SET_LABELS={vivid:'쨍한',soft:'부드러운',pastel:'파스텔',muted:'차분한',mono:'무채색'};
let curColorSet='vivid';
const ALL_DAYS=['일','월','화','수','목','금','토'];
const SH_DEFAULT=6,EH_DEFAULT=24,HH=64;

const FONTS=[
  {key:'system',   label:'시스템 기본',   family:'-apple-system,BlinkMacSystemFont,sans-serif'},
  {key:'Pretendard',label:'Pretendard',  family:"'Pretendard',sans-serif"},
  {key:'NanumGothic',label:'나눔고딕',   family:"'Nanum Gothic',sans-serif"},
  {key:'NotoSansKR', label:'Noto Sans KR',family:"'Noto Sans KR',sans-serif"},
  {key:'GangwonEdu', label:'강원교육모두체',family:"'GangwonEdu',sans-serif"},
  {key:'OmuDaye',    label:'오뮤 다예쁨체',family:"'OmuDaye',sans-serif"},
  {key:'ChosunIlbo', label:'조선일보명조', family:"'ChosunIlbo',serif"},
  {key:'DungGeunMo', label:'둥근모꼴',     family:"'DungGeunMo',monospace"},
  {key:'Griun',      label:'인권체',       family:"'Griun',sans-serif"},
];

function ld(k,d){try{const v=localStorage.getItem(k);return v!=null?JSON.parse(v):d}catch{return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}

/* Settings */
let S=ld('pl_s',{font:'Pretendard',dark:'auto',weekStart:0,startH:6,endH:24,showWeekNum:false,defaultView:'month',showLocation:true,fontSize:16});
function saveS(){sv('pl_s',S)}

/* Data */
let events=ld('pl_ev',[
  {id:1,title:'팀 스탠드업',date:'',startH:10,startM:0,endH:10,endM:30,color:'#5b8dee',showM:true,repeat:{on:true,weeks:1,days:[1,2,3,4,5],until:''}},
]);
let todos=ld('pl_td',[
  {id:1,text:'주간 보고서 작성',done:false,date:'',catId:0,repeat:{on:false,type:'none',days:[],until:''}},
  {id:2,text:'이메일 답장',done:true,date:'',catId:0,repeat:{on:false,type:'none',days:[],until:''}},
]);
let categories=ld('pl_cats',[
  {id:0,name:'전체',color:'#5b8dee'},
  {id:1,name:'개인',color:'#48c774'},
  {id:2,name:'업무',color:'#f7a23b'},
  {id:3,name:'학교',color:'#a55eea'},
]);
let memos=ld('pl_mm',{});
let classes=ld('pl_cls',[
  {id:1,name:'알고리즘',professor:'김교수',room:'공학관 301',color:'#bbdefb',startDate:'2026-03-02',endDate:'2026-06-19',days:[1,3],startH:9,startM:0,endH:10,endM:30},
  {id:2,name:'운영체제',professor:'이교수',room:'IT관 201',color:'#c8e6c9',startDate:'2026-03-03',endDate:'2026-06-19',days:[2,4],startH:13,startM:0,endH:14,endM:30},
]);
let assignments=ld('pl_asgn',[]);
let nid=ld('pl_nid',20);

function persist(){sv('pl_ev',events);sv('pl_td',todos);sv('pl_cats',categories);sv('pl_mm',memos);sv('pl_cls',classes);sv('pl_asgn',assignments);sv('pl_nid',nid)}

/* ══ STATE ══ */
let page='cal',calView='month',dTab='schedule',schTab='tt',drag=null,mMode='add';
let todoCurDate=new Date();todoCurDate.setHours(0,0,0,0);
let curDate=new Date();curDate.setHours(0,0,0,0);
let curMonth=new Date(curDate.getFullYear(),curDate.getMonth(),1);
let selCat=0;

/* ══ UTILS ══ */
function fmt(d){return d.toISOString().slice(0,10)}
function addDays(d,n){const r=new Date(d);r.setDate(r.getDate()+n);return r}
function pad(n){return String(n).padStart(2,'0')}

function h2r(h,a){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function SH(){return S.startH}
function EH(){return S.endH}
function TOTAL(){return EH()-SH()}

function getWS(d){
  const r=new Date(d);
  let diff=r.getDay()-S.weekStart;
  if(diff<0)diff+=7;
  r.setDate(r.getDate()-diff);r.setHours(0,0,0,0);return r;
}
function getDaysArr(){return Array.from({length:7},(_,i)=>ALL_DAYS[(S.weekStart+i)%7])}

function evMatch(ev,d){
  const dow=d.getDay(),ds=fmt(d);
  if(ev.repeat&&ev.repeat.on){
    if(!ev.repeat.days.includes(dow))return false;
    if(ev.repeat.until&&ds>ev.repeat.until)return false;
    if(ev.date){const diff=Math.round((d-new Date(ev.date))/(7*86400000));if(diff<0)return false;return diff%(ev.repeat.weeks||1)===0}
    return true;
  }
  return ev.date===ds;
}
function getEvs(d){return events.filter(e=>!e.allDay&&evMatch(e,d))}
function getCls(d){const dow=d.getDay(),ds=fmt(d);return classes.filter(c=>c.days.includes(dow)&&ds>=c.startDate&&ds<=c.endDate)}
function getMonthEvs(d){
  const ds=fmt(d),r=[];
  events.filter(e=>e.showM&&evMatch(e,d)).forEach(e=>r.push({title:e.title,color:e.color,type:'ev'}));
  assignments.filter(a=>a.showM&&a.deadline===ds).forEach(a=>r.push({title:a.title,color:a.color,type:'asgn'}));
  return r;
}
function hasMemo(ds){return !!(memos[ds]&&memos[ds].trim().length>0)}

/* Todo repeat match */
function todoMatchDate(t,d){
  const ds=fmt(d);
  if(!t.repeat||!t.repeat.on)return t.date===ds||t.date==='';
  const dow=d.getDay();
  if(t.repeat.type==='weekly'){
    if(!t.repeat.days.includes(dow))return false;
    if(t.repeat.until&&ds>t.repeat.until)return false;
    return true;
  }
  if(t.repeat.type==='daily'){
    if(t.repeat.until&&ds>t.repeat.until)return false;
    return true;
  }
  return t.date===ds||t.date==='';
}

/* ══ DARK MODE ══ */
function applyDark(mode){
  const h=document.documentElement;
  if(mode==='dark')h.classList.add('dark');
  else if(mode==='light')h.classList.remove('dark');
  else{window.matchMedia('(prefers-color-scheme:dark)').matches?h.classList.add('dark'):h.classList.remove('dark')}
}
function initDark(){
  applyDark(S.dark);
  window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',e=>{if(S.dark==='auto')applyDark('auto')});
}

/* ══ FONT ══ */
function applyFont(key){
  S.font=key;saveS();
  const f=FONTS.find(x=>x.key===key);
  document.getElementById('app').style.fontFamily=f&&f.family?f.family:"'Nanum Gothic',sans-serif";
    if(page==='opts')renderOpts();
}

/* ══ PAGE NAV ══ */
function switchPage(p){
  page=p;
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.bni').forEach(el=>el.classList.remove('active'));
  const pmap={cal:'pageCal',todo:'pageTodo',school:'pageSchool',opts:'pageOpts'};
  const bmap={cal:'bniCal',todo:'bniTodo',school:'bniSchool',opts:'bniOpts'};
  document.getElementById(pmap[p]).classList.add('active');
  document.getElementById(bmap[p]).classList.add('active');
  // 달력 탭이면 row2(월간/주간/일간) 표시
  const _tl=document.getElementById('tnavLeft');
  if(_tl)_tl.style.display=p==='cal'?'flex':'none';
  const hideNav=p==='opts'||p==='school';
  document.getElementById('tPrev').style.display=hideNav?'none':'flex';
  document.getElementById('tNext').style.display=hideNav?'none':'flex';
  document.getElementById('tToday').style.display=hideNav?'none':'block';
  updateNav();updateFab();
  if(p==='todo'){todoCurDate=new Date();todoCurDate.setHours(0,0,0,0);}
  if(p==='cal'){if(calView==='month')renderMonthly();else if(calView==='week')renderWeekly();else{fillTGrid();fillDayTodo();fillMemo();}}
  else if(p==='todo')renderTodoPage();
  else if(p==='school')renderSchool();
  else renderOpts();
}

function setCalView(v){
  calView=v;
  ['month','week','day'].forEach(x=>{const el=document.getElementById('cv'+cap(x));if(el)el.classList.toggle('active',x===v)});
  document.querySelectorAll('#pageCal>.spanel').forEach(el=>el.classList.remove('active'));
  document.getElementById(v==='day'?'spDay':v==='week'?'spWeek':'spMonth').classList.add('active');
  // 일간 뷰 진입 시 기본 탭(schedule) active 보장
  if(v==='day'){
    dTab='schedule';
    document.querySelectorAll('#spDay .stab').forEach((el,i)=>el.classList.toggle('active',i===0));
    const dspSch=document.getElementById('dspSch');
    const dspMemo=document.getElementById('dspMemo');
    if(dspSch){dspSch.classList.add('active');}
    if(dspMemo){dspMemo.classList.remove('active');}
  }
  updateNav();updateFab();
  if(v==='month')renderMonthly();else if(v==='week')renderWeekly();else{fillTGrid();fillDayTodo();fillMemo();}
}

function updateNav(){
  const el=document.getElementById('navDate');
  if(page==='opts'){el.textContent='옵션';return}
  if(page==='school'){el.textContent='학교 일정';return}
  if(page==='todo'){
    const td=fmt(todoCurDate),today=fmt(new Date());
    const label=td===today?'오늘':td===fmt(addDays(new Date(),1))?'내일':td===fmt(addDays(new Date(),-1))?'어제':`${todoCurDate.getMonth()+1}월 ${todoCurDate.getDate()}일`;
    el.innerHTML=`${label} <span style="font-size:11px;font-weight:400;color:var(--tx2)">(${ALL_DAYS[todoCurDate.getDay()]})</span>`;
    return;
  }
  if(calView==='month')el.textContent=`${curMonth.getFullYear()}년 ${curMonth.getMonth()+1}월`;
  else if(calView==='week'){const ws=getWS(curDate),we=addDays(ws,6);el.textContent=`${ws.getMonth()+1}/${ws.getDate()} — ${we.getMonth()+1}/${we.getDate()}`;}
  else el.innerHTML=`${curDate.getMonth()+1}월 ${curDate.getDate()}일 <span style="font-size:11px;font-weight:400;color:var(--tx2)">(${ALL_DAYS[curDate.getDay()]})</span>`;
}

function updateFab(){
  const fab=document.getElementById('fab');
  const show=(page==='cal'&&(calView==='month'||calView==='week'||(calView==='day'&&dTab==='schedule')));
  show?fab.classList.add('show'):fab.classList.remove('show');
}
function onFab(){
  if(page==='cal')openEvModal();
  else if(page==='todo')openTodoModal();
  else if(page==='school'&&schTab==='asgn')openAsgnModal();
}
function prevP(){
  if(page==='opts'||page==='school')return;
  if(page==='todo'){todoCurDate=addDays(todoCurDate,-1);renderTodoPage();updateNav();return;}
  if(calView==='month'){curMonth=new Date(curMonth.getFullYear(),curMonth.getMonth()-1,1);renderMonthly();}
  else if(calView==='week'){curDate=addDays(curDate,-7);renderWeekly();}
  else{curDate=addDays(curDate,-1);fillTGrid();fillDayTodo();fillMemo();}
  updateNav();
}
function nextP(){
  if(page==='opts'||page==='school')return;
  if(page==='todo'){todoCurDate=addDays(todoCurDate,1);renderTodoPage();updateNav();return;}
  if(calView==='month'){curMonth=new Date(curMonth.getFullYear(),curMonth.getMonth()+1,1);renderMonthly();}
  else if(calView==='week'){curDate=addDays(curDate,7);renderWeekly();}
  else{curDate=addDays(curDate,1);fillTGrid();fillDayTodo();fillMemo();}
  updateNav();
}
function goToday(){
  curDate=new Date();curDate.setHours(0,0,0,0);
  todoCurDate=new Date();todoCurDate.setHours(0,0,0,0);
  curMonth=new Date(curDate.getFullYear(),curDate.getMonth(),1);
  if(calView==='month')renderMonthly();else if(calView==='week')renderWeekly();else{fillTGrid();fillMemo();}
  updateNav();
}

/* ══ MONTHLY ══ */
function renderMonthly(){
  const days=getDaysArr();
  document.getElementById('mghRow').innerHTML=days.map(d=>`<div class="mghc">${d}</div>`).join('');
  const today=fmt(new Date()),y=curMonth.getFullYear(),m=curMonth.getMonth();
  const first=new Date(y,m,1),last=new Date(y,m+1,0);
  let startDow=first.getDay()-S.weekStart;if(startDow<0)startDow+=7;
  const total=Math.ceil((startDow+last.getDate())/7)*7;
  let html='';
  for(let i=0;i<total;i+=7){
    html+='<div class="mwrow">';
    for(let j=0;j<7;j++){
      const date=addDays(first,-startDow+i+j),ds=fmt(date),isOther=date.getMonth()!==m,isToday=ds===today,dow=date.getDay();
      const evs=getMonthEvs(date);
      const dc='mcell'+(isOther?' other':'')+(isToday?' today':'');
      const nc='mday'+(dow===0?' sun':dow===6?' sat':'');
      let dots=evs.slice(0,3).map(e=>`<div class="mev" style="background:${h2r(e.color,.18)};color:${e.color}">${e.title}</div>`).join('');
      if(evs.length>3)dots+=`<div class="mlbl">+${evs.length-3}</div>`;
      const memoDot=hasMemo(ds)?`<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#e53935;margin-left:2px;vertical-align:middle;flex-shrink:0"></span>`:'';
      html+=`<div class="${dc}" onclick="onMClick('${ds}')"><div style="display:flex;align-items:center;margin-bottom:3px"><div class="${nc}" style="margin-bottom:0">${date.getDate()}</div>${memoDot}</div>${dots}</div>`;
    }
    html+='</div>';
  }
  document.getElementById('monthWeeks').innerHTML=html;
}
function onMClick(ds){
  const date=new Date(ds),evs=getMonthEvs(date);
  const m=date.getMonth()+1,d=date.getDate(),dow=ALL_DAYS[date.getDay()];
  let items=evs.length?evs.map(e=>`<div class="devit"><div class="devbar" style="background:${e.color};min-height:32px"></div><div class="devinfo"><div class="devttl">${e.title}</div><div class="devsub">${e.type==='asgn'?'과제/시험 마감':'일정'}</div></div></div>`).join(''):`<div class="noev">이 날의 주요 일정이 없어요</div>`;
  mkSheet('dayOv',`<div class="daysh" onclick="event.stopPropagation()"><div class="shhdl"></div><div class="dsttl">${m}월 ${d}일 (${dow})</div>${items}<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="sbtn" onclick="closeSheet('dayOv')">닫기</button>
      <button class="sbtn sbtn-save" style="background:var(--bg-success);border-color:var(--bd-success);color:var(--tx-success)" onclick="closeSheet('dayOv');addEvOnDate('${ds}')">+ 일정 추가</button>
      <button class="sbtn sbtn-save" onclick="goDay('${ds}')">일간 뷰 →</button>
    </div></div>`);
}
function goDay(ds){curDate=new Date(ds);curDate.setHours(0,0,0,0);closeSheet('dayOv');setCalView('day')}

/* ══ WEEKLY ══ */
function renderWeekly(){
  const ws=getWS(curDate),today=fmt(new Date()),days=getDaysArr();
  let h='<div class="wgrid" style="grid-template-rows:auto repeat('+TOTAL()+','+HH+'px)">';
  // 헤더
  h+='<div class="whcell" style="border-right:0.5px solid var(--bd)"></div>';
  for(let d=0;d<7;d++){
    const day=addDays(ws,d),isT=fmt(day)===today;
    h+='<div class="whcell"><div class="wdl'+(isT?' td':'')+'">'+days[d]+'</div>';
    h+='<div class="wdd'+(isT?' td':'')+'">'+day.getDate()+'</div></div>';
  }
  // 시간 행
  for(let hr=SH();hr<EH();hr++){
    h+='<div class="wtc">'+pad(hr)+'</div>';
    for(let d=0;d<7;d++){
      const day=addDays(ws,d);
      const dayStr=fmt(day);
      let eh='';
      const allEvs=[...getEvs(day),...getCls(day)];
      allEvs.filter(e=>e.startH===hr).forEach(function(e){
        const dur=(e.endH-e.startH)*60+(e.endM-e.startM);
        const hp=Math.max(Math.round(dur/60*HH),16);
        const topOffset=Math.round(e.startM/60*HH);
        const isDashed=!!e.professor;
        const col=e.color;
        const nm=e.title||e.name||'';
        const locHtml=(isDashed&&S.showLocation&&e.room)?'<div style="font-size:9px;opacity:.7">'+e.room+'</div>':'';
        // 수업(isDashed)은 단일 색상, 일반 일정은 원래 색상
        const dispCol=isDashed?'#90caf9':col;
        const style='height:'+hp+'px;top:'+topOffset+'px;position:absolute;left:1px;right:1px;'
          +'background:'+h2r(dispCol,.18)+';color:'+dispCol+';border-left-color:'+dispCol+';'
          +(isDashed?'border-left-style:dashed;':'')
          +'';
        
        const clk=isDashed
          ?'onclick="event.stopPropagation();openClsModal('+e.id+')"'
          :'onclick="event.stopPropagation();openEvEdit('+e.id+')"';
        eh+='<div class="wev" id="wev'+e.id+'" style="'+style+'"  '+clk+'>'+nm+locHtml+'</div>';
      });
      const dcClk='onclick="openEvModalAt(\'' +dayStr+ '\',' +hr+ ')"';
      h+='<div class="wdc" '+dcClk+'>'+eh+'</div>';
    }
  }
  h+='</div>';
  document.getElementById('weekScroll').innerHTML='<div style="overflow:auto;height:100%;-webkit-overflow-scrolling:touch">'+h+'</div>';
}

/* ══ DAY RIGHT PANEL: 오늘 투두 ══ */
function fillDayTodo(){
  const panel=document.getElementById('dayRight');
  if(!panel)return;
  const ds=fmt(curDate);
  // Show todos for today (non-repeating matching date, or repeating matching day)
  const todayTodos=todos.filter(t=>{
    if(t.repeat&&t.repeat.on){
      const dow=curDate.getDay();
      if(t.repeat.type==='daily')return true;
      if(t.repeat.type==='weekly')return t.repeat.days.includes(dow);
      return false;
    }
    return t.date===ds;
  });
  const active=todayTodos.filter(t=>!t.done);
  const done=todayTodos.filter(t=>t.done);
  const cnt=active.length;

  let items='';
  if(active.length){
    active.forEach(t=>{
      const cat=categories.find(c=>c.id===t.catId)||categories[0];
      items+=`<div class="day-ti" onclick="toggleTodoDay(${t.id})">
        <div class="day-cat-dot" style="background:${cat.color}"></div>
        <div class="day-tcheck ${t.done?'done':''}"></div>
        <span class="day-ttext">${t.text}</span>
      </div>`;
    });
  }
  if(done.length){
    items+=`<div class="day-sec-lbl">완료 (${done.length})</div>`;
    done.forEach(t=>{
      const cat=categories.find(c=>c.id===t.catId)||categories[0];
      items+=`<div class="day-ti" onclick="toggleTodoDay(${t.id})">
        <div class="day-cat-dot" style="background:${cat.color}"></div>
        <div class="day-tcheck done"></div>
        <span class="day-ttext done">${t.text}</span>
      </div>`;
    });
  }
  if(!active.length&&!done.length){
    items=`<div style="padding:14px 8px;text-align:center;font-size:11px;color:var(--tx3)">할 일 없음</div>`;
  }

  panel.innerHTML=`
    <div class="day-right-hdr">
      <span>할 일</span>
      ${cnt>0?`<span class="day-right-hdr-cnt">${cnt}</span>`:''}
    </div>
    <div class="day-todo-scroll">${items}</div>
    <div class="day-todo-add">
      <input class="day-todo-inp" id="dayTodoInp" placeholder="할 일..." inputmode="text"
        enterkeyhint="done" onkeydown="if(event.key==='Enter')addDayTodo()">
      <button class="day-tadd-btn" onclick="addDayTodo()">+</button>
    </div>`;
}

function toggleTodoDay(id){
  const t=todos.find(x=>x.id===id);
  if(t){t.done=!t.done;persist();fillDayTodo();
    // also refresh full todo page if visible
    if(page==='todo')renderTodoPage();
  }
}
function addDayTodo(){
  const inp=document.getElementById('dayTodoInp');
  if(!inp||!inp.value.trim())return;
  const catId=selCat===0?0:selCat;
  todos.push({id:nid++,text:inp.value.trim(),done:false,date:fmt(curDate),catId,repeat:{on:false,type:'none',days:[],until:''}});
  inp.value='';
  persist();
  fillDayTodo();
  if(page==='todo')renderTodoPage();
}

/* ══ DAILY ══ */
function switchDTab(tab){
  dTab=tab;
  document.querySelectorAll('#spDay .stab').forEach((el,i)=>el.classList.toggle('active',['schedule','memo'][i]===tab));
  ['dspSch','dspMemo'].forEach((id,i)=>{
    const el=document.getElementById(id);
    if(el)el.classList.toggle('active',i===['schedule','memo'].indexOf(tab));
  });
  updateFab();
  if(tab==='schedule'){fillTGrid();fillDayTodo();}else fillMemo();
}
function fillTGrid(){
  const grid=document.getElementById('tGrid');if(!grid)return;
  grid.style.height=(TOTAL()*HH+80)+'px';
  let html='';
  for(let h=SH();h<EH();h++)html+=`<div class="hrow" style="top:${(h-SH())*HH}px"><span class="tlbl">${pad(h)}:00</span></div>`;
  for(const ev of getEvs(curDate)){
    const top=(ev.startH-SH())*HH+Math.round(ev.startM/60*HH),bot=(ev.endH-SH())*HH+Math.round(ev.endM/60*HH),h=Math.max(bot-top,28);
    html+=`<div class="evb" id="ev${ev.id}" style="top:${top}px;min-height:${h}px;background:${h2r(ev.color,.14)};border-left-color:${ev.color}" ontouchstart="tStart(event,${ev.id})" onclick="openEvEdit(${ev.id})"><div class="evtitle" style="color:${ev.color}">${ev.title}</div><div class="evsub" style="color:${ev.color}">${pad(ev.startH)}:${pad(ev.startM)}–${pad(ev.endH)}:${pad(ev.endM)}</div></div>`;
  }
  for(const cls of getCls(curDate)){
    const top=(cls.startH-SH())*HH+Math.round(cls.startM/60*HH),bot=(cls.endH-SH())*HH+Math.round(cls.endM/60*HH),h=Math.max(bot-top,28);
    const clsDispCol=cls.color;
    html+=`<div class="evb" style="top:${top}px;min-height:${h}px;background:${h2r(clsDispCol,.3)};border-left-color:${clsDispCol};border-left-style:dashed" onclick="openClsModal(${cls.id})"><div class="evtitle" style="color:${clsDispCol}">${cls.name}</div>${S.showLocation?`<div class="evsub" style="color:${clsDispCol}">${cls.room} \xb7 ${cls.professor}</div>`:''}</div>`;
  }
  html+=`<div class="dghost" id="dghost"></div>`;
  grid.innerHTML=html;setupDrag();
  fillDayTodo();
}

/* ══ TODO PAGE ══ */
function renderTodoPage(){
  const panel=document.getElementById('todoPage');
  const tdStr=fmt(todoCurDate);
  const allLeft=todos.filter(t=>{
    if(t.done)return false;
    if(t.repeat&&t.repeat.on){const dow=todoCurDate.getDay();if(t.repeat.type==='daily')return true;if(t.repeat.type==='weekly')return t.repeat.days.includes(dow);return false;}
    return t.date===tdStr;
  }).length;
  // Category chips
  let catHtml=categories.map(c=>{
    const active=selCat===c.id;
    const cnt=todos.filter(t=>!t.done&&(c.id===0||t.catId===c.id)).length;
    var chipStyle=active?('background:'+h2r(c.color,.15)+';color:'+c.color+';border-color:'+c.color):'';
    var cntBadge=cnt>0?('<span style="font-size:10px;background:'+(active?c.color:'var(--bg3)')+';color:'+(active?'#fff':'var(--tx2)')+';border-radius:10px;padding:0 5px">'+cnt+'</span>'):'';
    return '<button class="cat-chip '+(active?'active':'')+'" style="'+chipStyle+'" onclick="selCat='+c.id+';renderTodoPage()">'+c.name+cntBadge+'</button>';
  }).join('');

  // Filtered todos
  // todoCurDate 기준: 반복 투두는 요일 매칭, 일반은 날짜 매칭
  const filtered=todos.filter(t=>{
    const catOk=selCat===0||t.catId===selCat;
    if(!catOk)return false;
    if(t.repeat&&t.repeat.on){
      const dow=todoCurDate.getDay();
      if(t.repeat.type==='daily')return true;
      if(t.repeat.type==='weekly')return t.repeat.days.includes(dow);
      return false;
    }
    return t.date===tdStr;
  });
  const active=filtered.filter(t=>!t.done);
  const done=filtered.filter(t=>t.done);

  let items=active.length?active.map(t=>todoHTML(t)).join(''):`<div class="empty-state">할 일이 없어요 🎉</div>`;
  if(done.length)items+=`<div class="seclbl">완료됨 (${done.length})</div>`+done.map(t=>todoHTML(t)).join('');

  panel.innerHTML=`
    <div class="todo-top">
      <div class="cat-scroll">${catHtml}</div>
      <button class="cat-manage-btn" onclick="openCatManager()">≡</button>
    </div>
    <div class="todo-toolbar">
      <button class="tbtn danger" onclick="clearIncomplete()">미완료 삭제</button>
      <button class="tbtn" onclick="moveTomorrow()">다음날로 이동</button>
      <button class="tbtn" onclick="clearDone()">완료 삭제</button>
      <button class="tbtn" onclick="clearAll()">전체 삭제</button>
    </div>
    <div class="todo-scroll">${items}</div>
    <div class="todo-add-row">
      <input class="todo-inp" id="todoInp" placeholder="할 일 입력..." inputmode="text" enterkeyhint="done" onkeydown="if(event.key==='Enter')quickAddTodo()">
      <button class="tadd-btn" onclick="quickAddTodo()">추가</button>
    </div>`;
}

function todoHTML(t){
  const cat=categories.find(c=>c.id===t.catId)||categories[0];
  const repLabel=t.repeat&&t.repeat.on?(t.repeat.type==='daily'?'매일':t.repeat.type==='weekly'?'매주':''):'';
  const dl=t.date&&!t.repeat?.on?`<span class="tmeta-date">${t.date}</span>`:'';
  const asgnTag=t.asgnTitle?`<span style="font-size:10px;color:var(--tx2);background:var(--bg3);border-radius:8px;padding:1px 6px">📎 ${t.asgnTitle}</span>`:'';
  const rep=repLabel?`<span class="tmeta-rep">↻ ${repLabel}</span>`:'';
  const catTag=`<span class="tmeta-tag" style="background:${h2r(cat.color,.15)};color:${cat.color}">${cat.name}</span>`;
  return`<div class="ti">
    <div class="tcheck ${t.done?'done':''}" onclick="toggleTodo(${t.id})"></div>
    <div class="tbody">
      <div class="ttext ${t.done?'done':''}">${t.text}</div>
      <div class="tmeta">${catTag}${dl}${rep}${asgnTag}</div>
      <div class="tactions">
        ${t.done?'':(`<button class="tact" onclick="openTodoEdit(${t.id})">수정</button>`)}
        <button class="tact del" onclick="deleteTodo(${t.id})">삭제</button>
      </div>
    </div>
  </div>`;
}

function toggleTodo(id){const t=todos.find(x=>x.id===id);if(t)t.done=!t.done;persist();renderTodoPage()}
function quickAddTodo(){
  const inp=document.getElementById('todoInp');
  if(!inp||!inp.value.trim())return;
  todos.push({id:nid++,text:inp.value.trim(),done:false,date:fmt(todoCurDate),catId:selCat===0?0:selCat,repeat:{on:false,type:'none',days:[],until:''}});
  inp.value='';persist();renderTodoPage();
}
function deleteTodo(id){todos=todos.filter(t=>t.id!==id);persist();renderTodoPage()}
function clearIncomplete(){if(confirm('미완료 항목을 모두 삭제할까요?')){todos=todos.filter(t=>t.done);persist();renderTodoPage()}}
function clearDone(){todos=todos.filter(t=>!t.done);persist();renderTodoPage()}
function moveTomorrow(){
  // 각 할 일의 등록 날짜 기준 다음날로 개별 이동
  todos.filter(t=>!t.done&&(!t.repeat||!t.repeat.on)&&t.date===tdStr).forEach(t=>{
    t.date=fmt(addDays(new Date(t.date),1));
  });
  persist();renderTodoPage();updateNav();
}
function clearAll(){if(confirm('모든 할 일을 삭제할까요?')){todos=[];persist();renderTodoPage()}}

/* ══ TODO MODAL ══ */
function openTodoModal(){mMode='add';showTodoSheet({id:null,text:'',date:fmt(curDate),catId:selCat===0?0:selCat,repeat:{on:false,type:'none',days:[],until:''}})}
function openTodoEdit(id){const t=todos.find(x=>x.id===id);if(!t)return;mMode='edit';showTodoSheet({...t,repeat:{...(t.repeat||{})}})}
function showTodoSheet(t){
  const rep=t.repeat||{};
  const catOpts=categories.filter(c=>c.id!==0).map(c=>`<option value="${c.id}" ${t.catId===c.id?'selected':''}>${c.name}</option>`).join('');
  const dchips=ALL_DAYS.map((d,i)=>`<button class="dchip ${rep.days&&rep.days.includes(i)?'sel':''}" onclick="this.classList.toggle('sel')">${d}</button>`).join('');
  mkSheet('todoSh',`<div class="sheet" onclick="event.stopPropagation()">
    <div class="shhdl"></div><div class="shtitle">${mMode==='add'?'할 일 추가':'할 일 수정'}</div>
    <div class="fr"><label>내용</label><input id="tText" value="${t.text||''}" placeholder="할 일 내용" inputmode="text"></div>
    <div class="fr"><label>카테고리</label><select id="tCat"><option value="0">없음</option>${catOpts}</select></div>
    <div class="fr" id="tDateRow" style="${rep.on?'display:none':''}"><label>날짜</label><input type="date" id="tDate" value="${t.date||fmt(curDate)}"></div>
    <div class="fr">
      <div class="chkrow"><input type="checkbox" id="tRep" ${rep.on?'checked':''} onchange="toggleTRepUI(this.checked)"><label for="tRep">반복</label></div>
      <div class="repbox" id="tRepBox" style="${rep.on?'':'display:none'}">
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <button class="dchip ${!rep.type||rep.type==='daily'?'sel':''}" id="tRepDaily" onclick="setTRepType('daily')">매일</button>
          <button class="dchip ${rep.type==='weekly'?'sel':''}" id="tRepWeekly" onclick="setTRepType('weekly')">매주</button>
        </div>
        <div id="tDaysRow" style="${rep.type==='weekly'?'':'display:none'}"><div class="dchips">${dchips}</div></div>
        <div style="margin-top:8px"><div style="font-size:12px;color:var(--tx2);margin-bottom:4px">종료일 (비워두면 무기한)</div>
        <input type="date" id="tUntil" value="${rep.until||''}" style="width:100%;border:0.5px solid var(--bd);border-radius:var(--r);padding:8px 10px;font-size:14px;background:var(--bg2);color:var(--tx)"></div>
      </div>
    </div>
    <div class="shbtns">
      ${mMode==='edit'?`<button class="sbtn sbtn-del" onclick="deleteTodo(${t.id});closeSheet('todoSh')">삭제</button>`:''}
      <button class="sbtn" onclick="closeSheet(&quot;todoSh&quot;)">취소</button>
      <button class="sbtn sbtn-save" onclick="saveTodo(${t.id||'null'})">저장</button>
    </div>
  </div>`);
}
function toggleTRepUI(on){document.getElementById('tRepBox').style.display=on?'':'none';document.getElementById('tDateRow').style.display=on?'none':''}
function setTRepType(type){
  document.getElementById('tRepDaily').classList.toggle('sel',type==='daily');
  document.getElementById('tRepWeekly').classList.toggle('sel',type==='weekly');
  document.getElementById('tDaysRow').style.display=type==='weekly'?'':'none';
}
function saveTodo(id){
  const text=document.getElementById('tText').value.trim();if(!text)return;
  const catId=parseInt(document.getElementById('tCat').value)||0;
  const repOn=document.getElementById('tRep').checked;
  const repDaily=document.getElementById('tRepDaily').classList.contains('sel');
  const type=repOn?(repDaily?'daily':'weekly'):'none';
  const days=repOn&&!repDaily?[...document.querySelectorAll('#tDaysRow .dchip.sel')].map(el=>ALL_DAYS.indexOf(el.textContent)):[];
  const until=document.getElementById('tUntil')?.value||'';
  const dateVal=repOn?fmt(todoCurDate):(document.getElementById('tDate')||{value:fmt(todoCurDate)}).value;
  const data={text,catId,date:dateVal,done:false,repeat:{on:repOn,type,days,until}};
  if(mMode==='edit'&&id&&id!=='null'){const i=todos.findIndex(t=>t.id==id);if(i>-1)todos[i]={...todos[i],...data}}
  else todos.push({id:nid++,...data});
  persist();closeSheet('todoSh');renderTodoPage();
}

/* ══ CATEGORY MANAGER ══ */
function openCatManager(){
  let rows=categories.filter(c=>c.id!==0).map(c=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--bd)">
      <div style="width:14px;height:14px;border-radius:50%;background:${c.color};flex-shrink:0"></div>
      <span style="flex:1;font-size:14px;color:var(--tx)">${c.name}</span>
      <button onclick="deleteCat(${c.id})" style="font-size:12px;color:var(--tx-danger);background:transparent;border:0.5px solid var(--bd-danger);border-radius:var(--r);padding:4px 10px;cursor:pointer">삭제</button>
    </div>`).join('');
  mkSheet('catMgr',`<div class="sheet" onclick="event.stopPropagation()">
    <div class="shhdl"></div><div class="shtitle">카테고리 관리</div>
    ${rows}
    <div style="display:flex;gap:8px;margin-top:12px">
      <input id="newCatName" placeholder="새 카테고리 이름" style="flex:1;border:0.5px solid var(--bd);border-radius:var(--r);padding:10px 12px;font-size:14px;background:var(--bg2);color:var(--tx);font-family:var(--font)">
      <button onclick="addCat()" style="padding:10px 14px;border:0.5px solid var(--bd-info);border-radius:var(--r);background:var(--bg-info);color:var(--tx-info);font-size:14px;cursor:pointer;font-family:var(--font)">추가</button>
    </div>
    <div class="shbtns"><button class="sbtn sbtn-save" onclick="closeSheet('catMgr');renderTodoPage()">완료</button></div>
  </div>`);
}
function addCat(){
  const inp=document.getElementById('newCatName');if(!inp||!inp.value.trim())return;
  const colors=['#5b8dee','#48c774','#ff6b6b','#f7a23b','#a55eea','#20c997','#fd79a8'];
  const color=colors[categories.length%colors.length];
  categories.push({id:nid++,name:inp.value.trim(),color});
  inp.value='';persist();closeSheet('catMgr');openCatManager();
}
function deleteCat(id){
  if(!confirm('이 카테고리를 삭제할까요?\n해당 카테고리의 할 일은 미분류로 이동됩니다.'))return;
  categories=categories.filter(c=>c.id!==id);
  todos.forEach(t=>{if(t.catId===id)t.catId=0});
  persist();closeSheet('catMgr');renderTodoPage();
}

/* ══ MEMO ══ */
function fillMemo(){
  const panel=document.getElementById('dspMemo');if(!panel)return;
  const ds=fmt(curDate),content=memos[ds]||'';
  panel.innerHTML=`<div class="memo-inner"><div class="memo-dlbl">${curDate.getFullYear()}년 ${curDate.getMonth()+1}월 ${curDate.getDate()}일 메모</div><textarea class="memo-ta" id="memoA" placeholder="오늘의 메모를 자유롭게 적어보세요..." oninput="onMemoIn(this)">${content}</textarea><div class="memo-foot"><span class="memo-cnt" id="memoCnt">${content.length}자</span><button class="memo-clr" onclick="clearMemo()">메모 지우기</button></div></div>`;
}
function onMemoIn(el){
  memos[fmt(curDate)]=el.value;persist();
  const c=document.getElementById('memoCnt');if(c)c.textContent=el.value.length+'자';
}
function clearMemo(){if(confirm('메모를 지울까요?')){memos[fmt(curDate)]='';persist();fillMemo()}}


/* ══ TOUCH DRAG ══ */
function setupDrag(){
  const grid=document.getElementById('tGrid');if(!grid)return;
  grid.addEventListener('touchmove',onTMove,{passive:false});
  grid.addEventListener('touchend',onTEnd,{passive:true});
}

/* ══ MOUSE DRAG SUPPORT (web) ══ */




function tStart(e,id){
  const ev=events.find(x=>x.id===id);if(!ev)return;
  const el=document.getElementById('ev'+id),grid=document.getElementById('tGrid');if(!el||!grid)return;
  const touch=e.touches[0],gRect=grid.getBoundingClientRect(),eRect=el.getBoundingClientRect();
  const dur=(ev.endH-ev.startH)*60+(ev.endM-ev.startM);
  const topPx=(ev.startH-SH())*HH+Math.round(ev.startM/60*HH);
  const ghost=document.getElementById('dghost');
  ghost.style.cssText=`display:block;top:${topPx}px;height:${Math.max(Math.round(dur/60*HH),28)}px;border-color:${ev.color};background:${h2r(ev.color,.09)};transition:top 0.05s cubic-bezier(0.25,0.46,0.45,0.94);`;
  // 시간 툴팁 생성
  let tooltip=document.getElementById('dragTooltip');
  if(!tooltip){tooltip=document.createElement('div');tooltip.id='dragTooltip';
    tooltip.style.cssText='position:absolute;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:#fff;font-size:11px;font-weight:500;padding:3px 8px;border-radius:20px;pointer-events:none;z-index:20;white-space:nowrap;transition:top 0.05s cubic-bezier(0.25,0.46,0.45,0.94)';
    document.getElementById('tGrid').appendChild(tooltip);}
  const initEndMin=(ev.startH-SH())*60+ev.startM+dur;
  tooltip.textContent=pad(ev.startH)+':'+pad(ev.startM)+'–'+pad(SH()+Math.floor(initEndMin/60))+':'+pad(initEndMin%60);
  tooltip.style.top=(topPx-24)+'px';tooltip.style.display='block';
  drag={id,dur,offsetY:touch.clientY-eRect.top,gRect,ghost,el,moved:false,previewTop:topPx,tooltip};
  drag._t=setTimeout(()=>{if(drag&&drag.id===id)el.classList.add('drag-active')},150);
}
function onTMove(e){
  if(!drag)return;e.preventDefault();drag.moved=true;
  const touch=e.touches[0],relY=touch.clientY-drag.gRect.top-drag.offsetY;
  const snapPx=HH/4; // 15분 = HH/4 px
  const maxTop=TOTAL()*HH-Math.round(drag.dur/60*HH);
  const snapped=Math.max(0,Math.min(Math.round(relY/snapPx)*snapPx,maxTop));
  // 이전 스냅 위치와 달라질 때만 업데이트 (끊기는 느낌)
  if(snapped!==drag.previewTop){
    drag.previewTop=snapped;
    drag.ghost.style.top=snapped+'px';
    // 햅틱 진동 (안드로이드/iOS 지원)
    if(navigator.vibrate){navigator.vibrate(8);}
    // 시각적 스냅 효과 - ghost 살짝 번쩍
    drag.ghost.style.opacity='0.5';
    requestAnimationFrame(()=>{if(drag)drag.ghost.style.opacity='1';});
    // 시간 툴팁 업데이트
    const totalMin=Math.round(snapped/HH*60);
    const newH=SH()+Math.floor(totalMin/60);
    const newM=totalMin%60;
    const endMin=totalMin+drag.dur;
    const endH=SH()+Math.floor(endMin/60);
    const endM=endMin%60;
    drag.ghost.dataset.time=pad(newH)+':'+pad(newM)+'–'+pad(endH)+':'+pad(endM);
    if(drag.tooltip){
      drag.tooltip.textContent=drag.ghost.dataset.time;
      drag.tooltip.style.top=Math.max(0,snapped-24)+'px';
    }
  }
}
function onTEnd(){
  if(!drag)return;clearTimeout(drag._t);drag.el.classList.remove('drag-active');drag.ghost.style.display='none';
  if(drag.tooltip)drag.tooltip.style.display='none';
  if(drag.moved){const tm=Math.round(drag.previewTop/HH*60),ev=events.find(x=>x.id===drag.id);if(ev){ev.startH=SH()+Math.floor(tm/60);ev.startM=tm%60;const et=tm+drag.dur;ev.endH=SH()+Math.floor(et/60);ev.endM=et%60}persist();}
  drag=null;fillTGrid();
}

/* ══ SCHOOL ══ */
function switchSchTab(tab){
  schTab=tab;
  document.querySelectorAll('#pageSchool .stab').forEach((el,i)=>el.classList.toggle('active',['tt','asgn'][i]===tab));
  document.querySelectorAll('#pageSchool .spanel').forEach((el,i)=>el.classList.toggle('active',i===['tt','asgn'].indexOf(tab)));
  updateFab();
  if(tab==='tt')renderTT();else renderAsgn();
}
function renderSchool(){renderTT();renderAsgn()}
function renderTT(){
  const sc=document.getElementById('ttScroll');if(!sc)return;
  if(!classes.length){sc.innerHTML=`<div class="empty-state">등록된 수업이 없어요</div>`;return}
  // 시간표는 항상 8~20시 고정
  const minH=8, maxH=20;
  const CH=56, dn=['월','화','수','목','금'];
  let html=`<div style="display:grid;grid-template-columns:36px repeat(5,1fr);min-width:100%;grid-template-rows:auto repeat(${maxH-minH},${CH}px)">`;
  html+=`<div style="position:sticky;top:0;left:0;z-index:10;background:var(--bg);border-right:0.5px solid var(--bd);border-bottom:0.5px solid var(--bd)"></div>`;
  dn.forEach(d=>html+=`<div style="text-align:center;padding:8px 4px;font-size:12px;font-weight:500;color:var(--tx);border-right:0.5px solid var(--bd);border-bottom:0.5px solid var(--bd);background:var(--bg);position:sticky;top:0;z-index:5">${d}</div>`);
  for(let h=minH;h<maxH;h++){
    html+=`<div style="font-size:10px;color:var(--tx3);text-align:right;padding:4px 4px 0 0;border-right:0.5px solid var(--bd);height:${CH}px;position:sticky;left:0;background:var(--bg);z-index:4;border-top:0.5px solid var(--bd)">${pad(h)}</div>`;
    for(let d=1;d<=5;d++){
      // 이 시간(h)에 걸쳐있는 수업 찾기 - 분 단위까지 정확히 계산
      const cls=classes.find(c=>{
        if(!c.days.includes(d))return false;
        const startTot=c.startH*60+c.startM;
        const endTot=c.endH*60+c.endM;
        const rowStart=h*60, rowEnd=(h+1)*60;
        // 이 row의 시작 시간에 수업이 시작되는 경우만 블록 그리기
        return startTot>=rowStart && startTot<rowEnd;
      });
      let inner='';
      if(cls){
        const dur=(cls.endH-cls.startH)*60+(cls.endM-cls.startM);
        const topOffset=Math.round(cls.startM/60*CH); // 분 오프셋
        const blockH=Math.round(dur/60*CH)-2;
        inner=`<div class="ttcls" style="top:${topOffset}px;height:${blockH}px;background:${h2r(cls.color,.15)};border-left-color:${cls.color};color:${cls.color}" onclick="openClsModal(${cls.id})">
          <div style="word-break:keep-all;overflow-wrap:break-word;white-space:normal;line-height:1.3">${cls.name}</div>
          <div style="font-size:9px;opacity:.7;margin-top:1px">${pad(cls.startH)}:${pad(cls.startM)}–${pad(cls.endH)}:${pad(cls.endM)}</div>
          <div style="font-size:9px;opacity:.7">${cls.room}</div>
        </div>`;
      }
      html+=`<div style="border-right:0.5px solid var(--bd);border-top:0.5px solid var(--bd);height:${CH}px;position:relative;overflow:visible">${inner}</div>`;
    }
  }
  html+=`</div>`;sc.innerHTML=html;
}
function renderAsgn(){
  const panel=document.getElementById('asgnList');if(!panel)return;
  if(!assignments.length){panel.innerHTML=`<div class="empty-state">등록된 과제/시험이 없어요</div>`;return}
  const today=fmt(new Date()),sorted=[...assignments].sort((a,b)=>a.deadline.localeCompare(b.deadline));
  const up=sorted.filter(a=>a.deadline>=today),past=sorted.filter(a=>a.deadline<today);
  let html='';
  if(up.length){html+=`<div class="asec">진행 중 / 예정</div>`;up.forEach(a=>{html+=asgnHTML(a,today)})}
  if(past.length){html+=`<div class="asec">지난 과제</div>`;past.forEach(a=>{html+=asgnHTML(a,today)})}
  panel.innerHTML=html;
}
function bdg(dl,today){
  const diff=Math.round((new Date(dl)-new Date(today))/86400000);
  if(diff<0)return`<span class="badge badge-ok">완료</span>`;
  if(diff===0)return`<span class="badge badge-u">오늘 마감</span>`;
  if(diff<=3)return`<span class="badge badge-u">D-${diff}</span>`;
  if(diff<=7)return`<span class="badge badge-s">D-${diff}</span>`;
  return`<span class="badge badge-ok">D-${diff}</span>`;
}
function asgnHTML(a,today){
  const cls=classes.find(c=>c.id===a.classId);
  const tasks=a.tasks||[];
  const done=tasks.filter(t=>t.done).length;
  const taskRows=tasks.map(t=>{
    const regDate=t.regDate?`<span style="font-size:10px;color:var(--tx3);margin-left:4px">${t.regDate}</span>`:'';
    const scheduled=t.regDate?`<span style="font-size:10px;color:var(--tx-info);background:var(--bg-info);border-radius:8px;padding:1px 5px;margin-left:4px">📋 등록됨</span>`:'';
    return `<div class="atask">
      <div class="atch ${t.done?'done':''}" onclick="toggleAT(${a.id},${t.id})"></div>
      <div style="flex:1;min-width:0">
        <span class="atxt ${t.done?'done':''}">${t.text}</span>
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin-top:2px">
          ${regDate}${scheduled}
        </div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;align-items:center">
        ${t.done?'':`<button onclick="openRegTodoSheet(${a.id},${t.id})" style="font-size:10px;padding:2px 7px;border:0.5px solid var(--bd-info);border-radius:10px;background:var(--bg-info);color:var(--tx-info);cursor:pointer;font-family:var(--font)">날짜등록</button>`}
        <span class="atdel" onclick="deleteAT(${a.id},${t.id})">✕</span>
      </div>
    </div>`;
  }).join('');
  return`<div class="ai" id="ai${a.id}">
    <div class="ai-top">
      <div class="ai-dot" style="background:${a.color}"></div>
      <div class="ai-title">${a.title}</div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
        <div class="ai-dl">${a.deadline}${bdg(a.deadline,today)}</div>
        <button onclick="openAsgnEdit(${a.id})" style="font-size:13px;background:transparent;border:none;cursor:pointer;padding:0 2px;color:var(--tx2)">✏️</button>
      </div>
    </div>
    <div class="ai-cls">${cls?'📚 '+cls.name+' · ':''}<span style="color:var(--tx3)">${done}/${tasks.length} 완료</span></div>
    <div style="padding:0 0 4px">${taskRows}</div>
    <div class="atadd">
      <input class="atinp" id="atI${a.id}" placeholder="할 일 추가 (예: 자료 조사)..." onkeydown="if(event.key==='Enter')addAT(${a.id})">
      <button class="atbtn" onclick="addAT(${a.id})">추가</button>
    </div>
  </div>`;
}
function toggleAT(aid,tid){
  const a=assignments.find(x=>x.id===aid);if(!a)return;
  const t=(a.tasks||[]).find(x=>x.id===tid);
  if(!t)return;
  t.done=!t.done;
  // 연결된 투두도 동기화
  if(t.linkedTodoId){
    const linked=todos.find(x=>x.id===t.linkedTodoId);
    if(linked)linked.done=t.done;
  }
  persist();renderAsgn();
  if(page==='todo')renderTodoPage();
  if(calView==='day')fillDayTodo();
}
function deleteAT(aid,tid){
  const a=assignments.find(x=>x.id===aid);if(!a)return;
  const t=(a.tasks||[]).find(x=>x.id===tid);
  if(t&&t.linkedTodoId){todos=todos.filter(x=>x.id!==t.linkedTodoId);}
  a.tasks=(a.tasks||[]).filter(t=>t.id!==tid);
  persist();renderAsgn();
  if(page==='todo')renderTodoPage();
}
function addAT(aid){
  const inp=document.getElementById('atI'+aid);
  if(!inp||!inp.value.trim())return;
  const a=assignments.find(x=>x.id===aid);
  if(!a)return;
  if(!a.tasks)a.tasks=[];
  a.tasks.push({id:nid++,text:inp.value.trim(),done:false,regDate:null});
  inp.value='';persist();renderAsgn();
}

/* ══ OPTIONS ══ */
function renderOpts(){
  const content=document.getElementById('optsContent');
  const startDay=S.weekStart===1?'월':'일';
  const darkLabels=['자동','라이트','다크'];
  const darkVals=['auto','light','dark'];
  let fontRows=FONTS.map(f=>`<div class="font-opt-row" onclick="applyFont('${f.key}')">
    <span class="font-opt-name" style="${f.family?'font-family:'+f.family:''}">${f.label}</span>
    <div class="font-radio ${S.font===f.key?'sel':''}"></div>
  </div>`).join('');

  content.innerHTML=`
    <div class="optsec">폰트</div>
    ${fontRows}
        <div class="optsec">주 시작 요일</div>
    <div class="optrow">
      <span class="optlbl">월요일 시작</span>
      <label class="sw"><input type="checkbox" ${S.weekStart===1?'checked':''} onchange="S.weekStart=this.checked?1:0;saveS();if(calView==='week')renderWeekly();if(calView==='month')renderMonthly();renderOpts()"><span class="sl"></span></label>
    </div>
    <div class="optsec">하루 시간 범위</div>
    <div class="optrow" style="flex-direction:column;align-items:flex-start;gap:10px">
      <div style="display:flex;align-items:center;gap:10px;width:100%">
        <span class="optlbl" style="min-width:40px">시작</span>
        <select onchange="S.startH=parseInt(this.value);saveS();if(calView==='day')fillTGrid();renderOpts()" style="flex:1;padding:8px;border:0.5px solid var(--bd);border-radius:var(--r);background:var(--bg2);color:var(--tx);font-size:14px;font-family:var(--font)">
          ${Array.from({length:18},(_,i)=>`<option value="${i}" ${S.startH==i?'selected':''}>${pad(i)}:00</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;align-items:center;gap:10px;width:100%">
        <span class="optlbl" style="min-width:40px">종료</span>
        <select onchange="S.endH=parseInt(this.value);saveS();if(calView==='day')fillTGrid();renderOpts()" style="flex:1;padding:8px;border:0.5px solid var(--bd);border-radius:var(--r);background:var(--bg2);color:var(--tx);font-size:14px;font-family:var(--font)">
          ${Array.from({length:12},(_,i)=>`<option value="${i+13}" ${S.endH==i+13?'selected':''}>${pad(i+13)}:00</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="optsec">화면 모드</div>
    <div style="display:flex;border-bottom:0.5px solid var(--bd)">
      ${darkVals.map(function(v,i){
      var isActive=S.dark===v;
      return '<button onclick="S.dark=\''+v+'\';saveS();applyDark(\''+v+'\');renderOpts()" style="flex:1;padding:13px 4px;border:none;background:'+(isActive?'var(--bg-info)':'transparent')+';color:'+(isActive?'var(--tx-info)':'var(--tx2)')+';font-size:13px;cursor:pointer;border-right:'+(i<2?'0.5px solid var(--bd)':'none')+';font-weight:'+(isActive?'500':'400')+';font-family:var(--font)">'+darkLabels[i]+'</button>';
    }).join('')}
    </div>
    <div class="optsec">표시 설정</div>
    <div class="optrow">
      <span class="optlbl">타임블록에 장소 표시</span>
      <label class="sw"><input type="checkbox" ${S.showLocation?'checked':''} onchange="S.showLocation=this.checked;saveS();if(calView==='day')fillTGrid();if(calView==='week')renderWeekly();renderOpts()"><span class="sl"></span></label>
    </div>
    <div class="optsec">기타</div>
    <div class="optrow">
      <div><div class="optlbl">데이터 초기화</div><div class="optsub">모든 데이터를 삭제합니다</div></div>
      <button onclick="resetAll()" style="padding:7px 14px;border:0.5px solid var(--bd-danger);border-radius:var(--r);background:transparent;color:var(--tx-danger);font-size:13px;cursor:pointer;font-family:var(--font)">초기화</button>
    </div>
    <div class="optrow" onclick="openAboutSheet()" style="cursor:pointer">
      <div><div class="optlbl">앱 소개 및 도움말</div><div class="optsub">기능 안내 보기</div></div>
      <div style="font-size:18px;color:var(--tx3)">›</div>
    </div>
    <div class="optrow"><div class="optlbl">버전</div><div style="font-size:13px;color:var(--tx3)">v1.0</div></div>
  `;
}

/* ══ 앱 소개 ══ */
function openAboutSheet(){
  mkSheet('aboutSh',`<div class="sheet" onclick="event.stopPropagation()" style="padding-bottom:32px">
    <div class="shhdl"></div>
    <div style="text-align:center;padding:8px 0 20px">
      <div style="font-size:22px;font-weight:700;color:var(--tx)">플래너</div>
      <div style="font-size:13px;color:var(--tx3);margin-top:4px">당신의 하루를 하나로</div>
    </div>

    <div class="about-sec">📅 달력</div>
    <div class="about-item">
      <div class="about-title">월간 뷰</div>
      <div class="about-desc">한 달 일정을 한눈에 확인해요. 날짜를 탭하면 그날 일정 목록과 함께 일정 추가 버튼이 나타나요. 우측 하단 + 버튼으로도 추가할 수 있어요. 메모가 있는 날은 날짜 옆에 빨간 점이 표시돼요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">주간 뷰</div>
      <div class="about-desc">이번 주 전체 흐름을 타임블록으로 확인해요. 빈 시간 칸을 탭하면 그 날짜와 시간으로 일정을 바로 추가할 수 있어요. 수업 시간표도 점선 블록으로 함께 표시돼요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">일간 뷰</div>
      <div class="about-desc">왼쪽엔 시간대별 일정, 오른쪽엔 그 날의 할 일이 함께 표시돼요. 일정 블록을 길게 눌러 위아래로 드래그하면 15분 단위로 시간을 조정할 수 있어요. 오른쪽 할 일 패널에서 바로 추가·체크도 가능해요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">일정 추가 옵션</div>
      <div class="about-desc">일정 추가 시 시간 지정 여부를 선택할 수 있어요. 시간을 지정하면 주간·일간 타임블록에 표시되고, 지정하지 않으면 월간 캘린더에만 표시돼요(종일 일정). 월간 캘린더 표시 여부도 따로 설정할 수 있어요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">반복 일정</div>
      <div class="about-desc">요일·주 단위로 반복되는 일정을 등록하고 종료일도 지정할 수 있어요. 반복 일정을 수정할 때는 이 일정만 / 이후 모든 일정 / 전체 반복 일정 중 적용 범위를 선택할 수 있어요.</div>
    </div>

    <div class="about-sec">✅ 할 일</div>
    <div class="about-item">
      <div class="about-title">날짜별 관리</div>
      <div class="about-desc">◀ ▶ 버튼으로 날짜를 이동하며 그날의 할 일만 확인해요. 상단에 오늘·내일·날짜가 표시되고, 오늘 버튼으로 언제든 돌아올 수 있어요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">추가 방법</div>
      <div class="about-desc">하단 입력창에 내용을 입력하고 추가 버튼을 누르거나 엔터를 치면 바로 등록돼요. 카테고리와 반복 설정은 각 할 일의 수정 버튼에서 변경할 수 있어요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">카테고리</div>
      <div class="about-desc">개인·업무·학교 등 원하는 카테고리를 직접 만들어 할 일을 분류해요. 오른쪽 ≡ 버튼으로 카테고리를 관리할 수 있어요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">반복 할 일</div>
      <div class="about-desc">매일 또는 특정 요일마다 반복되는 할 일을 등록할 수 있어요. 반복 할 일은 요일 기준으로 자동 표시돼요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">다음날로 이동</div>
      <div class="about-desc">오늘 못 한 미완료 할 일을 각자의 등록 날짜 기준 다음날로 한 번에 이동해요.</div>
    </div>

    <div class="about-sec">🎓 학교</div>
    <div class="about-item">
      <div class="about-title">시간표</div>
      <div class="about-desc">수업명·교수·강의실·개강/종강일·요일·시간을 등록하면 일간·주간 뷰에 점선 블록으로 자동 표시돼요. 옵션에서 장소 표시 여부를 설정할 수 있어요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">과제 / 시험</div>
      <div class="about-desc">마감일과 연결 수업을 등록하고 D-day 뱃지로 남은 시간을 확인해요. 월간 캘린더 표시 여부도 설정할 수 있어요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">부속 할 일 등록</div>
      <div class="about-desc">과제마다 세부 할 일을 추가하고 날짜등록 버튼으로 원하는 날짜의 할 일 탭에 바로 연결할 수 있어요. 과제에서 체크하면 할 일 탭에도 자동으로 반영돼요.</div>
    </div>

    <div class="about-sec">📝 메모</div>
    <div class="about-item">
      <div class="about-title">날짜별 메모</div>
      <div class="about-desc">일간 뷰의 메모 탭에서 날짜별로 자유롭게 기록해요. 메모가 있는 날은 월간 캘린더 날짜 옆에 빨간 점으로 표시돼요.</div>
    </div>

    <div class="about-sec">⚙️ 옵션</div>
    <div class="about-item">
      <div class="about-title">폰트</div>
      <div class="about-desc">Pretendard(기본)·나눔고딕·Noto Sans KR·시스템 기본 중 선택할 수 있어요. 인터넷 연결 시 자동으로 로드돼요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">화면 모드</div>
      <div class="about-desc">라이트·다크·자동(시스템 설정 따라감) 중 선택해요.</div>
    </div>
    <div class="about-item">
      <div class="about-title">기타 설정</div>
      <div class="about-desc">주 시작 요일(일/월), 하루 표시 시간 범위(시작·종료), 기본 캘린더 뷰(월간·주간·일간), 타임블록 장소 표시 여부를 설정할 수 있어요.</div>
    </div>

    <div style="margin-top:24px;padding:14px;background:var(--bg2);border-radius:var(--r);font-size:12px;color:var(--tx3);line-height:1.8;text-align:center">
      모든 데이터는 이 기기에만 저장돼요.<br>인터넷 연결 없이도 사용할 수 있어요.<br>(폰트 로딩은 인터넷 필요)
    </div>
    <div class="shbtns" style="margin-top:16px">
      <button class="sbtn sbtn-save" onclick="closeSheet('aboutSh')">확인</button>
    </div>
  </div>`);
}
function resetAll(){if(confirm('모든 데이터를 초기화할까요?\n이 작업은 되돌릴 수 없습니다.')){events=[];todos=[];memos={};classes=[];assignments=[];categories=[{id:0,name:'전체',color:'#5b8dee'},{id:1,name:'개인',color:'#48c774'},{id:2,name:'업무',color:'#f7a23b'}];nid=1;persist();renderMonthly();fillTGrid();fillMemo();renderSchool();renderTodoPage();alert('초기화 완료!')}}

/* ══ EVENT MODAL ══ */

function addEvOnDate(dateStr){
  mMode='add';
  showEvSheet({id:null,title:'',date:dateStr,startH:9,startM:0,endH:10,endM:0,
    color:'#5b8dee',showM:true,allDay:false,
    repeat:{on:false,weeks:1,days:[],until:''}});
}
function openEvModal(){mMode='add';showEvSheet({id:null,title:'',date:fmt(curDate),startH:9,startM:0,endH:10,endM:0,color:'#5b8dee',showM:false,repeat:{on:false,weeks:1,days:[],until:''}})}
function openEvModalAt(dateStr,hour){
  // 셀 클릭으로 열릴 때 - 이벤트 버블링 방지는 wev onclick에서 처리
  mMode='add';
  showEvSheet({id:null,title:'',date:dateStr,startH:hour,startM:0,endH:Math.min(hour+1,23),endM:0,color:'#5b8dee',showM:false,repeat:{on:false,weeks:1,days:[],until:''}});
}
function openEvEdit(id){const ev=events.find(e=>e.id===id);if(!ev)return;mMode='edit';showEvSheet({...ev,repeat:{...(ev.repeat||{}),days:[...((ev.repeat&&ev.repeat.days)||[])]}})}
function showEvSheet(ev){
  const rep=ev.repeat||{};
  const cdots=buildColorPicker('cR1', ev.color||'#1e88e5');
  const dchips=ALL_DAYS.map((d,i)=>`<button class="dchip ${rep.days&&rep.days.includes(i)?'sel':''}" onclick="this.classList.toggle('sel')">${d}</button>`).join('');
  mkSheet('evSh',`<div class="sheet" onclick="event.stopPropagation()">
    <div class="shhdl"></div><div class="shtitle">${mMode==='add'?'일정 추가':'일정 수정'}</div>
    <div class="fr"><label>제목</label><input id="eTitle" value="${ev.title||''}" placeholder="일정 이름" inputmode="text"></div>
    <div class="tglrow" style="margin:4px 0 8px">
      <span class="tgllbl">시간 지정</span>
      <label class="sw"><input type="checkbox" id="eHasTime" ${ev.allDay?'':'checked'} onchange="toggleEvTime(this.checked)"><span class="sl"></span></label>
    </div>
    <div id="eTimeRow" style="${ev.allDay?'display:none':''}">
      <div class="fr-row"><div class="fr"><label>시작</label><input type="time" id="eStart" value="${pad(ev.startH||9)}:${pad(ev.startM||0)}"></div><div class="fr"><label>종료</label><input type="time" id="eEnd" value="${pad(ev.endH||10)}:${pad(ev.endM||0)}"></div></div>
    </div>
    <div class="fr" id="eDateRow" style="${rep.on?'display:none':''}"><label>날짜</label><input type="date" id="eDate" value="${ev.date||fmt(curDate)}"></div>
    <div class="fr"><label>색상</label>${cdots}</div>
    <div class="tglrow"><span class="tgllbl">월간 캘린더에 표시</span><label class="sw"><input type="checkbox" id="eShowM" ${ev.showM?'checked':''}><span class="sl"></span></label></div>
    <div class="fr">
      <div class="chkrow"><input type="checkbox" id="eRep" ${rep.on?'checked':''} onchange="toggleEvRep(this.checked)"><label for="eRep">반복 일정</label></div>
      <div class="repbox" id="eRepBox" style="${rep.on?'':'display:none'}">
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--tx2);margin-bottom:8px">매 <input type="number" id="eWeeks" value="${rep.weeks||1}" min="1" max="52" style="width:50px;padding:6px 8px;text-align:center;border:0.5px solid var(--bd);border-radius:var(--r);background:var(--bg);color:var(--tx)"> 주마다</div>
        <div class="dchips" id="eDays">${dchips}</div>
        <div style="margin-top:10px"><div style="font-size:12px;color:var(--tx2);margin-bottom:4px">반복 종료일 (비워두면 무기한)</div><input type="date" id="eUntil" value="${rep.until||''}" style="width:100%;border:0.5px solid var(--bd);border-radius:var(--r);padding:8px 10px;font-size:14px;background:var(--bg2);color:var(--tx)"></div>
      </div>
    </div>
    <div class="shbtns">
      ${mMode==='edit'?`<button class="sbtn sbtn-del" onclick="deleteEv(${ev.id})">삭제</button>`:''}
      <button class="sbtn" onclick="closeSheet(&quot;evSh&quot;)">취소</button>
      <button class="sbtn sbtn-save" onclick="saveEv(${ev.id||'null'})">저장</button>
    </div>
  </div>`);
}


function buildColorPicker(rowId, selColor, defSet){
  var initSet = defSet || 'vivid';
  var initPal = COLOR_SETS[initSet] || COLOR_SETS.vivid;
  // 선택된 색상이 없으면 initPal 첫번째
  var curColor = selColor || initPal[0].h;

  // 메인 줄: 현재 팔레트 색상 + 토글
  function mkDot(c, inAll){
    var fn = 'cpPick(\''+rowId+'\',\''+c.h+'\','+(inAll?'true':'false')+')';
    return '<div class="cpdot'+(c.h===curColor?' on':'')+'" '
      +'style="background:'+c.h+';'+(c.h===curColor?'transform:scale(1.2)':'')+'" '
      +'onclick="'+fn+'" '
      +'data-c="'+c.h+'" data-row="'+rowId+'"></div>';
  }

  var mainDots = initPal.map(function(c){ return mkDot(c, false); }).join('');
  var allRows = Object.keys(COLOR_SETS).map(function(k){
    var pal = COLOR_SETS[k];
    var dots = pal.map(function(c){ return mkDot(c, true); }).join('');
    return '<div class="cp-row">'+dots+'</div>';
  }).join('');

  return '<div class="cpwrap" id="cpw_'+rowId+'">'
    +'<div class="cp-main-row" id="cpmain_'+rowId+'">'
    +mainDots
    +'<button class="cp-toggle" onclick="cpToggle(\'' + rowId + '\')" type="button">▼</button>'
    +'</div>'
    +'<div class="cp-all-rows" id="cpall_'+rowId+'">'+allRows+'</div>'
    +'</div>';
}
function cpPick(rowId, color, inAll){
  // 메인 + 전체 줄 선택 상태 업데이트
  ['#cpmain_'+rowId, '#cpall_'+rowId].forEach(function(sel){
    var cont = document.querySelector(sel);
    if(!cont) return;
    cont.querySelectorAll('.cpdot').forEach(function(d){
      var same = d.dataset.c === color;
      d.classList.toggle('on', same);
      d.style.transform = same ? 'scale(1.2)' : '';
    });
  });
  if(inAll){
    // 클릭한 색의 팔레트 찾기 → 메인줄 교체
    var newSet = null;
    Object.keys(COLOR_SETS).forEach(function(k){
      COLOR_SETS[k].forEach(function(c){ if(c.h===color) newSet=k; });
    });
    if(newSet){
      var pal = COLOR_SETS[newSet];
      var mainRow = document.getElementById('cpmain_'+rowId);
      if(mainRow){
        var togBtn = mainRow.querySelector('.cp-toggle');
        mainRow.innerHTML = pal.map(function(c){
          var fn='cpPick(\''+rowId+'\',\''+c.h+'\',false)';
          return '<div class="cpdot'+(c.h===color?' on':'')+'" '
            +'style="background:'+c.h+';'+(c.h===color?'transform:scale(1.2)':'')+'" '
            +'onclick="'+fn+'" data-c="'+c.h+'" data-row="'+rowId+'"></div>';
        }).join('');
        if(togBtn) mainRow.appendChild(togBtn);
      }
    }
    // 전체 패널 닫기
    cpToggle(rowId); // 이미 열려있으니 토글하면 닫힘
  }
}
function cpToggle(rowId){
  var allRows = document.getElementById('cpall_'+rowId);
  var togEl = document.querySelector('#cpw_'+rowId+' .cp-toggle');
  if(!allRows) return;
  var isOpen = allRows.classList.contains('open');
  allRows.classList.toggle('open', !isOpen);
  if(togEl){ togEl.classList.toggle('open', !isOpen); togEl.textContent = isOpen ? '▼' : '▲'; }
}
function getSelectedColor(rowId){
  var dot = document.querySelector('#cpmain_'+rowId+' .cpdot.on, #cpall_'+rowId+' .cpdot.on');
  // 우선순위: 메인줄
  var mainSel = document.querySelector('#cpmain_'+rowId+' .cpdot.on');
  return mainSel ? mainSel.dataset.c : (dot ? dot.dataset.c : null);
}
document.addEventListener('click', function(e){
});

function toggleEvTime(hasTime){
  const row=document.getElementById('eTimeRow');
  if(row)row.style.display=hasTime?'':'none';
}
function toggleEvRep(on){document.getElementById('eRepBox').style.display=on?'':'none';document.getElementById('eDateRow').style.display=on?'none':''}
function selC(el,rowId){document.querySelectorAll(`#${rowId} .cdot`).forEach(d=>d.classList.remove('sel'));el.classList.add('sel')}
function deleteEv(id){events=events.filter(e=>e.id!==id);persist();closeSheet('evSh');fillTGrid();if(calView==='month')renderMonthly();else if(calView==='week')renderWeekly()}
function saveEv(id){
  const title=document.getElementById('eTitle').value.trim();if(!title)return;
  const startVal=document.getElementById('eStart').value||'09:00';
  const endVal=document.getElementById('eEnd').value||'10:00';
  const[sH,sM]=startVal.split(':').map(Number);
  const[eH,eM]=endVal.split(':').map(Number);
  if(isNaN(sH)||isNaN(sM)||isNaN(eH)||isNaN(eM))return;
  const evColor=getSelectedColor('cR1')||'#1e88e5';
  const repOn=document.getElementById('eRep').checked;
  const weeks=parseInt(document.getElementById('eWeeks').value)||1;
  const days=[...document.querySelectorAll('#eDays .dchip.sel')].map(el=>ALL_DAYS.indexOf(el.textContent));
  const until=document.getElementById('eUntil').value||'';
  const showM=document.getElementById('eShowM').checked;
  const hasTimeEl=document.getElementById('eHasTime');
  const allDay=hasTimeEl?!hasTimeEl.checked:false;
  const dateVal=repOn?fmt(curDate):(document.getElementById('eDate')||{value:fmt(curDate)}).value;
  const data={title,date:dateVal,startH:allDay?0:sH,startM:allDay?0:sM,endH:allDay?0:eH,endM:allDay?0:eM,color:evColor,showM,allDay,repeat:{on:repOn,weeks,days,until}};
  if(mMode==='edit'&&id&&id!=='null'){
    const origEv=events.find(e=>e.id==id);
    if(origEv&&origEv.repeat&&origEv.repeat.on){
      // 반복 일정 수정 → 범위 선택
      openRepeatEditScope(id,data);
      return;
    }
    const i=events.findIndex(e=>e.id==id);
    if(i>-1)events[i]={...events[i],...data};
  } else events.push({id:nid++,...data});
  persist();closeSheet('evSh');fillTGrid();if(calView==='month')renderMonthly();else if(calView==='week')renderWeekly();
}

function openRepeatEditScope(id,data){
  mkSheet('repScopeOv',`<div class="sheet" onclick="event.stopPropagation()">
    <div class="shhdl"></div>
    <div class="shtitle">반복 일정 수정</div>
    <div style="font-size:14px;color:var(--tx);margin-bottom:16px">이 수정 사항을 어디에 적용할까요?</div>
    <div class="shbtns" style="flex-direction:column;gap:10px">
      <button class="sbtn sbtn-save" style="font-size:14px" onclick="applyRepeatEdit(${id},'this')">이 일정만</button>
      <button class="sbtn sbtn-save" style="font-size:14px;background:var(--bg-success);border-color:var(--bd-success);color:var(--tx-success)" onclick="applyRepeatEdit(${id},'future')">이 일정 이후 모두</button>
      <button class="sbtn sbtn-save" style="font-size:14px;background:var(--bg-warn);border-color:var(--tx-warn);color:var(--tx-warn)" onclick="applyRepeatEdit(${id},'all')">모든 반복 일정</button>
      <button class="sbtn" onclick="closeSheet('repScopeOv')">취소</button>
    </div>
  </div>`);
  // 임시 저장
  window._pendingRepeatEdit={id,data};
}

function applyRepeatEdit(id,scope){
  const {data}=window._pendingRepeatEdit||{};
  if(!data)return;
  closeSheet('repScopeOv');
  closeSheet('evSh');
  const origIdx=events.findIndex(e=>e.id==id);
  if(origIdx<0){persist();return;}
  const orig=events[origIdx];
  const todayStr=fmt(curDate);
  if(scope==='all'){
    // 모든 반복 일정에 적용
    events[origIdx]={...orig,...data};
  } else if(scope==='future'){
    // 이 날 이후 → 기존 반복은 오늘 전날까지로 종료
    orig.repeat={...orig.repeat,until:fmt(addDays(curDate,-1))};
    // 오늘부터 새 반복 일정 생성
    events.push({...data,id:nid++,date:todayStr,repeat:{...data.repeat,on:true}});
  } else {
    // 이 일정만 → 기존 반복에 이 날만 예외 단일 일정 추가
    events.push({...data,id:nid++,date:todayStr,repeat:{on:false,weeks:1,days:[],until:''}});
  }
  persist();fillTGrid();if(calView==='month')renderMonthly();else if(calView==='week')renderWeekly();
}

/* ══ CLASS MODAL ══ */
function openClsModal(id){
  const cls=id?classes.find(c=>c.id===id):null;mMode=cls?'edit':'add';
  const c=cls||{id:null,name:'',professor:'',room:'',color:'#90caf9',startDate:'',endDate:'',days:[],startH:9,startM:0,endH:10,endM:30};
  const cdots=buildColorPicker('cR2', c.color||'#bbdefb', 'pastel');
  const dchips=['월','화','수','목','금'].map((d,i)=>`<button class="dchip ${c.days.includes(i+1)?'sel':''}" onclick="this.classList.toggle('sel')">${d}</button>`).join('');
  mkSheet('clsSh',`<div class="sheet" onclick="event.stopPropagation()">
    <div class="shhdl"></div><div class="shtitle">${mMode==='add'?'수업 추가':'수업 수정'}</div>
    <div class="fr"><label>수업명</label><input id="cName" value="${c.name}" placeholder="예: 알고리즘"></div>
    <div class="fr"><label>교수</label><input id="cProf" value="${c.professor}" placeholder="예: 김교수"></div>
    <div class="fr"><label>강의실</label><input id="cRoom" value="${c.room}" placeholder="예: 공학관 301"></div>
    <div class="fr-row"><div class="fr"><label>시작</label><input type="time" id="cStart" value="${pad(c.startH)}:${pad(c.startM)}"></div><div class="fr"><label>종료</label><input type="time" id="cEnd" value="${pad(c.endH)}:${pad(c.endM)}"></div></div>
    <div class="fr-row"><div class="fr"><label>개강일</label><input type="date" id="cSD" value="${c.startDate}"></div><div class="fr"><label>종강일</label><input type="date" id="cED" value="${c.endDate}"></div></div>
    <div class="fr"><label>요일</label><div class="dchips" id="cDays">${dchips}</div></div>
    <div class="fr"><label>색상</label>${cdots}</div>
    <div class="shbtns">${mMode==='edit'?`<button class="sbtn sbtn-del" onclick="deleteCls(${c.id})">삭제</button>`:''}<button class="sbtn" onclick="closeSheet(&quot;clsSh&quot;)">취소</button><button class="sbtn sbtn-save" onclick="saveCls(${c.id||'null'})">저장</button></div>
  </div>`);
}
function deleteCls(id){classes=classes.filter(c=>c.id!==id);persist();closeSheet('clsSh');renderTT();fillTGrid()}
function saveCls(id){
  const name=document.getElementById('cName').value.trim();if(!name)return;
  const[sH,sM]=document.getElementById('cStart').value.split(':').map(Number);
  const[eH,eM]=document.getElementById('cEnd').value.split(':').map(Number);
  const days=[...document.querySelectorAll('#cDays .dchip.sel')].map(el=>['월','화','수','목','금'].indexOf(el.textContent)+1);
  const clsColor=getSelectedColor('cR2')||'#bbdefb';
  const data={name,professor:document.getElementById('cProf').value.trim(),room:document.getElementById('cRoom').value.trim(),color:clsColor,startDate:document.getElementById('cSD').value,endDate:document.getElementById('cED').value,days,startH:sH,startM:sM,endH:eH,endM:eM};
  if(mMode==='edit'&&id&&id!=='null'){const i=classes.findIndex(c=>c.id==id);if(i>-1)classes[i]={...classes[i],...data}}
  else classes.push({id:nid++,...data});
  persist();closeSheet('clsSh');renderTT();fillTGrid();
}

/* ══ ASSIGN MODAL ══ */
function openAsgnModal(id){
  const a=id?assignments.find(x=>x.id===id):null;mMode=a?'edit':'add';
  const d=a||{id:null,title:'',classId:null,color:'#ff6b6b',deadline:'',showM:true,tasks:[]};
  const cdots=buildColorPicker('cR3', d.color||'#1e88e5');
  const clsOpts=classes.map(c=>`<option value="${c.id}" ${d.classId===c.id?'selected':''}>${c.name}</option>`).join('');
  mkSheet('asgnSh',`<div class="sheet" onclick="event.stopPropagation()">
    <div class="shhdl"></div><div class="shtitle">${mMode==='add'?'과제/시험 추가':'과제/시험 수정'}</div>
    <div class="fr"><label>제목</label><input id="aTitle" value="${d.title}" placeholder="예: 알고리즘 과제 1"></div>
    <div class="fr"><label>수업</label><select id="aCls"><option value="">수업 선택</option>${clsOpts}</select></div>
    <div class="fr"><label>마감일</label><input type="date" id="aDL" value="${d.deadline}"></div>
    <div class="fr"><label>색상</label>${cdots}</div>
    <div class="tglrow"><span class="tgllbl">월간 캘린더에 표시</span><label class="sw"><input type="checkbox" id="aShowM" ${d.showM?'checked':''}><span class="sl"></span></label></div>
    <div class="shbtns">${mMode==='edit'?`<button class="sbtn sbtn-del" onclick="deleteAsgn(${d.id})">삭제</button>`:''}<button class="sbtn" onclick="closeSheet(&quot;asgnSh&quot;)">취소</button><button class="sbtn sbtn-save" onclick="saveAsgn(${d.id||'null'})">저장</button></div>
  </div>`);
}
function openAsgnEdit(id){openAsgnModal(id)}
/* ══ 과제 할 일 → 투두 날짜 등록 ══ */
function openRegTodoSheet(aid,tid){
  const a=assignments.find(x=>x.id===aid);
  const t=a&&a.tasks&&a.tasks.find(x=>x.id===tid);
  if(!a||!t)return;
  const today=fmt(new Date());
  const catOpts=categories.filter(c=>c.id!==0).map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  mkSheet('regTodoSh',`<div class="sheet" onclick="event.stopPropagation()">
    <div class="shhdl"></div>
    <div class="shtitle" style="margin-bottom:6px">할 일 날짜 등록</div>
    <div style="font-size:13px;color:var(--tx2);margin-bottom:14px;padding:8px 10px;background:var(--bg2);border-radius:var(--r)">
      <div style="font-weight:500;color:var(--tx)">${t.text}</div>
      <div style="font-size:11px;margin-top:2px;color:var(--tx3)">📎 ${a.title}</div>
    </div>
    <div class="fr"><label>할 날짜</label><input type="date" id="regDate" value="${t.regDate||today}"></div>
    <div class="fr"><label>카테고리</label><select id="regCat"><option value="0">없음</option>${catOpts}</select></div>
    <div style="font-size:12px;color:var(--tx3);margin-bottom:12px;padding:8px 10px;background:var(--bg-info);border-radius:var(--r);color:var(--tx-info)">
      선택한 날짜의 할 일 탭에 자동으로 등록돼요
    </div>
    <div class="shbtns">
      <button class="sbtn" onclick="closeSheet('regTodoSh')">취소</button>
      <button class="sbtn sbtn-save" onclick="confirmRegTodo(${aid},${tid})">등록</button>
    </div>
  </div>`);
}

function confirmRegTodo(aid,tid){
  const a=assignments.find(x=>x.id===aid);
  const t=a&&a.tasks&&a.tasks.find(x=>x.id===tid);
  if(!a||!t)return;
  const dateVal=document.getElementById('regDate').value;
  const catId=parseInt(document.getElementById('regCat').value)||0;
  if(!dateVal)return;
  // 이미 등록된 투두가 있으면 날짜만 업데이트
  if(t.linkedTodoId){
    const existing=todos.find(x=>x.id===t.linkedTodoId);
    if(existing){existing.date=dateVal;existing.catId=catId;persist();closeSheet('regTodoSh');renderAsgn();renderTodoPage();return;}
  }
  // 새 투두 생성
  const newTodo={
    id:nid++,
    text:t.text,
    done:false,
    date:dateVal,
    catId,
    asgnId:aid,
    asgnTitle:a.title,
    repeat:{on:false,type:'none',days:[],until:''}
  };
  todos.push(newTodo);
  t.regDate=dateVal;
  t.linkedTodoId=newTodo.id;
  persist();
  closeSheet('regTodoSh');
  renderAsgn();
  if(page==='todo')renderTodoPage();
  if(calView==='day')fillDayTodo();
  // 성공 피드백
  const notice=document.createElement('div');
  notice.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg-success);color:var(--tx-success);padding:12px 20px;border-radius:var(--rl);font-size:14px;font-weight:500;z-index:999;box-shadow:0 4px 20px rgba(0,0,0,.15)';
  notice.textContent='✓ 할 일이 등록되었어요!';
  document.body.appendChild(notice);
  setTimeout(()=>notice.remove(),1800);
}

function deleteAsgn(id){assignments=assignments.filter(a=>a.id!==id);persist();closeSheet('asgnSh');renderAsgn();if(calView==='month')renderMonthly()}
function saveAsgn(id){
  const title=document.getElementById('aTitle').value.trim();if(!title)return;
  const classId=parseInt(document.getElementById('aCls').value)||null;
  const deadline=document.getElementById('aDL').value;
  const asgnColor=getSelectedColor('cR3')||'#1e88e5';
  const showM=document.getElementById('aShowM').checked;
  const data={title,classId,deadline,color:asgnColor,showM};
  if(mMode==='edit'&&id&&id!=='null'){const i=assignments.findIndex(a=>a.id==id);if(i>-1)assignments[i]={...assignments[i],...data}}
  else assignments.push({id:nid++,...data,tasks:[]});
  persist();closeSheet('asgnSh');renderAsgn();if(calView==='month')renderMonthly();
}

/* ══ SHEET UTILS ══ */
function mkSheet(id,html){closeSheet(id);const ov=document.createElement('div');ov.className='shov';ov.id=id;ov.innerHTML=html;ov.addEventListener('click',()=>closeSheet(id));document.body.appendChild(ov);return ov}
function closeSheet(id){const el=document.getElementById(id);if(el)el.remove()}

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', function(){
// 기존 수업 색상이 진한 원색이면 파스텔로 변환
const ORIG_COLORS=['#5b8dee','#48c774','#ff6b6b','#f7a23b','#a55eea','#20c997','#fd79a8','#636e72','#4285f4','#34a853','#ea4335','#fbbc04','#9c27b0','#00bcd4','#ff7043','#607d8b'];
classes=classes.map(function(c){
  if(ORIG_COLORS.includes(c.color)){
    const i=ORIG_COLORS.indexOf(c.color)%PASTEL_COLORS.length;
    return Object.assign({},c,{color:PASTEL_COLORS[i].h});
  }
  return c;
});
// todos 날짜 보정 (빈 날짜 → 오늘)
todos=todos.map(function(t){return Object.assign({},t,{date:t.date&&t.date!==''?t.date:fmt(new Date())})});
initDark();
applyFont(S.font||'Pretendard');
updateNav();
renderMonthly();
fillTGrid();fillDayTodo();fillMemo();
renderSchool();
renderTodoPage();
renderOpts();
// 달력 탭 기본 - 월간/주간/일간 버튼 표시
const _tnavLeft=document.getElementById('tnavLeft');
if(_tnavLeft)_tnavLeft.style.display='flex';
updateFab();
// Set default calendar view from settings
if(S.defaultView&&S.defaultView!=='month'){setCalView(S.defaultView)}
});