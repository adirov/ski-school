const finder=document.querySelector('.level-finder');
if(finder){
 const variants={
  ski:{
   start:['Спокойный первый шаг.','Начните с индивидуального знакомства с лыжами: экипировка, равновесие и управляемая остановка.',['Привыкнуть к снаряжению','Научиться контролировать скорость','Попробовать первые повороты'],'private','Посмотреть индивидуальные уроки'],
   progress:['От первых спусков — к уверенности.','Небольшая группа поможет закрепить базу. Если нужен свой темп и больше внимания — выбирайте индивидуальный урок.',['Стабильнее держать равновесие','Связывать повороты','Выбирать траекторию и скорость'],'group','Посмотреть групповые уроки'],
   advanced:['Точность в каждом повороте.','Курс поможет последовательно разобрать технику и закрепить изменения на практике.',['Работать над параллельным ведением лыж','Контролировать ритм поворотов','Адаптировать движения к склону'],'courses','Посмотреть курсы']},
  board:{
   start:['Поймать баланс на доске.','Индивидуальный урок поможет освоить стойку, понять работу кантов и начать управлять доской.',['Определить удобную стойку','Освоить торможение на канте','Попробовать первые изменения направления'],'private','Посмотреть индивидуальные уроки'],
   progress:['Соединить движения в линию.','В группе похожего уровня можно закрепить контроль доски и перейти к более связному катанию.',['Увереннее менять кант','Контролировать скорость','Связывать повороты на простом склоне'],'group','Посмотреть групповые уроки'],
   advanced:['Больше контроля. Больше свободы.','Курс для последовательной работы над поворотами, балансом и точностью движений.',['Улучшить ведение доски на канте','Работать над ритмом и траекторией','Разобрать индивидуальные ошибки'],'courses','Посмотреть курсы']}
 };
 function render(){
  const sport=finder.querySelector('[name="finder-sport"]:checked').value;
  const level=finder.querySelector('[name="finder-level"]:checked').value;
  const [title,description,skills,slug,label]=variants[sport][level];
  document.querySelector('#finder-title').textContent=title;
  document.querySelector('#finder-description').textContent=description;
  document.querySelector('#finder-skills').replaceChildren(...skills.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
  const link=document.querySelector('#finder-link');link.href=slug+'.html';link.textContent=label;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches) finder.querySelector('.finder-result').animate([{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
 }
 finder.addEventListener('change',render);
}
