(()=>{
const o=new Component(),stage=document.getElementById('stage'),tpl=document.getElementById('tpl').content;
const get=(e,s)=>e.trim().split('.').reduce((a,k)=>a==null?a:a[k],s);
const sub=(t,s)=>t.replace(/\{\{([^}]+)\}\}/g,(m,e)=>{const x=get(e,s);return x==null||typeof x=='function'?'':x});
function build(n,s,parent){
 if(n.nodeType==3){parent.appendChild(document.createTextNode(sub(n.textContent,s)));return}
 if(n.nodeType!=1)return;
 let t=n.localName;
 const raw=a=>(n.getAttribute(a)||'').replace(/[{}]/g,'');
 if(t=='sc-if'){if(get(raw('value'),s))n.childNodes.forEach(c=>build(c,s,parent));return}
 if(t=='sc-for'){(get(raw('list'),s)||[]).forEach((it,i)=>n.childNodes.forEach(c=>build(c,{...s,[n.getAttribute('as')]:it,$index:i},parent)));return}
 if(/^x-(table|thead|tbody|tr|td|th|select|option)$/.test(t))t=t.slice(2);
 const el=n.namespaceURI=='http://www.w3.org/1999/xhtml'?document.createElement(t):document.createElementNS(n.namespaceURI,n.localName);
 el.__on={};
 for(const a of n.attributes){
  const m=a.value.match(/^\{\{([^}]+)\}\}$/),x=m?get(m[1],s):undefined;
  if(a.name.startsWith('on')){if(typeof x=='function')el.__on[a.name.slice(2).toLowerCase()]=x;continue}
  if(a.name.startsWith('hint-')||a.name.startsWith('style-'))continue;
  if(m&&(x===false||x==null))continue;
  el.setAttribute(a.name,sub(a.value,s));
 }
 n.childNodes.forEach(c=>build(c,s,el));
 parent.appendChild(el);
}
function morph(a,b){
 const A=[...a.childNodes],B=[...b.childNodes];
 B.forEach((nb,i)=>{
  const na=A[i];
  if(!na){a.appendChild(nb);return}
  if(na.nodeName!=nb.nodeName){a.replaceChild(nb,na);return}
  if(nb.nodeType==3){if(na.textContent!=nb.textContent)na.textContent=nb.textContent;return}
  for(const x of [...na.attributes])if(!nb.hasAttribute(x.name))na.removeAttribute(x.name);
  for(const x of nb.attributes)if(na.getAttribute(x.name)!=x.value){na.setAttribute(x.name,x.value);if(x.name=='value')na.value=x.value}
  na.__on=nb.__on;morph(na,nb);
 });
 A.slice(B.length).forEach(n=>n.remove());
}
window.__paint=()=>{
 const v=o.renderVals?o.renderVals():{},next=document.createElement('div');
 tpl.childNodes.forEach(c=>build(c,v,next));
 morph(stage,next);
};
const fire=(e,types)=>{for(let n=e.target;n&&n!==stage;n=n.parentNode){for(const t of types){const f=n.__on&&n.__on[t];if(f){f(e);return}}}};
stage.addEventListener('click',e=>{if(e.target.closest('[data-soon]')){e.preventDefault();alert('Layar verifikasi belum didesain.');return}fire(e,['click'])});
stage.addEventListener('input',e=>fire(e,['input','change']));
stage.addEventListener('submit',e=>{e.preventDefault();fire(e,['submit'])});
const syncHeight=()=>{if(location.pathname.includes('dashboard'))return;const h=Math.round(window.visualViewport?window.visualViewport.height:window.innerHeight);document.documentElement.style.setProperty('--app-h',h+'px')};
syncHeight();addEventListener('resize',syncHeight);addEventListener('orientationchange',syncHeight);window.visualViewport&&window.visualViewport.addEventListener('resize',syncHeight);
const scrollers=()=>{const root=stage.firstElementChild;if(!root||getComputedStyle(root).flexDirection!='column')return;for(const c of root.children){const s=getComputedStyle(c);if(+s.flexGrow>0){c.style.minHeight='0';c.style.overflowY='auto';if(s.display=='flex'&&s.flexDirection=='column')for(const k of c.children)k.style.flexShrink='0'}}};
const paint=__paint;window.__paint=()=>{paint();if(!location.pathname.includes('dashboard'))scrollers()};
__paint();o.componentDidMount&&o.componentDidMount();
})();
