const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');
import('./scroll-motion.js').catch(()=>{});
import('./level-finder.js').catch(()=>{});
if(document.querySelector('.hero') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const loadSnow=()=>import('./snow.js').catch(()=>{});
  if('requestIdleCallback' in window) requestIdleCallback(loadSnow,{timeout:1500});
  else setTimeout(loadSnow,300);
}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);toggle.innerHTML=open?'Закрыть <span>×</span>':'Меню <span>☰</span>'});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){toggle.click();toggle.focus()}});
const form=document.querySelector('#lesson-form');
if(form){const selected=new URLSearchParams(location.search).get('program');if([...form.elements.program.options].some(o=>o.value===selected))form.elements.program.value=selected;
form.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(form),type=f.get('program'),level=f.get('level'),result=document.querySelector('#result');let recommendation=type==='help'?(level==='Начинаю с нуля'?'Начните с индивидуального урока: так проще освоиться со снаряжением и базовыми движениями.':'Рассмотрите курс: регулярные занятия помогут последовательно поработать над техникой.'):{private:'Индивидуальный урок подойдёт для работы в своём темпе с персональной обратной связью.',group:'Групповой урок — формат для обучения вместе с участниками похожего уровня.',courses:'Курс — последовательная работа над навыками в течение нескольких занятий.',kids:'Для детского занятия важно заранее обсудить возраст, опыт ребёнка и длительность.'}[type];result.replaceChildren();const strong=document.createElement('strong');strong.textContent='Ваш формат: '+f.get('sport');const p=document.createElement('p');p.textContent=recommendation;const note=document.createElement('p');const tariffs={private:'24 000 ₸ · 2 часа · 1–2 человека',group:'12 000 ₸ · 2 часа · до 6 человек',courses:'68 000 ₸ · 4 занятия по 2 часа',kids:'16 000 ₸ · 90 минут · 6–12 лет'};const chosen=type==='help'?(level==='Начинаю с нуля'?'private':'courses'):type;note.textContent='Пример тарифа: '+tariffs[chosen]+'. Учебная база «Северный склон», встреча за 30 минут до занятия. Данные вымышлены, бронирование не производится.';result.append(strong,p,note);result.hidden=false;result.focus()});}
