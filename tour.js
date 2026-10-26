const defaultSteps=[
 {id:'start',title:'Light your first lantern',text:'Start opens your story. You can take your time, and your journey stays on this device.'},
 {id:'choices',title:'Three ways forward',text:'Each page offers three choices. Read them and choose what feels right. Different choices reveal different pieces of the Halloween mystery.'},
 {id:'coloring',title:'Make the story your own',text:'Coloring opens a large picture sheet. You can return to the story whenever you like.'},
 {id:'tools',title:'Your own paint box',text:'Choose a brush, crayon, spray, or fill tool, then a color and size. Round brush starts selected. Undo and Redo help you try new ideas.'},
 {id:'example',title:'A little inspiration',text:'The glowing Color example button shows the finished picture. Tap the sheet once, or press Enter, and the example hides three seconds later. Your painting is safe underneath.'}
];
export function createTour({root=document,targets={},beforeStep=async()=>{},steps=defaultSteps,storage=localStorage,key='casey.thirteenth-lantern.tour.v1'}={}){
 let stored=null;try{stored=JSON.parse(storage.getItem(key));}catch{}
 let index=Math.min(steps.length-1,Math.max(0,Number.isInteger(stored?.step)?stored.step:0)),active=false,request=0,highlighted=[],returnFocus=null;
 const card=document.createElement('aside');card.className='storybook-tour';card.hidden=true;card.setAttribute('role','region');card.setAttribute('aria-label','Storybook tour');
 card.innerHTML='<div class="tour-heading"><span class="tour-count"></span><button class="tour-dismiss" aria-label="Dismiss tour">×</button></div><h2 class="tour-title"></h2><p class="tour-text" aria-live="polite"></p><div class="tour-actions"><button class="tour-skip">Pause tour</button><button class="tour-back">Back</button><button class="tour-next">Next</button></div>';
 const q=selector=>card.querySelector(selector);root.body?root.body.append(card):root.append(card);
 function persist(complete=false){stored={version:1,seen:true,complete,step:index};try{storage.setItem(key,JSON.stringify(stored));}catch{}}
 function clearHighlight(){for(const el of highlighted)el.classList.remove('tour-highlight');highlighted=[];}
 function resolveTarget(id){const value=typeof targets[id]==='function'?targets[id]():targets[id];if(!value)return[];if(typeof value==='string')return[...root.querySelectorAll(value)];if(value.nodeType===1)return[value];return [...value].filter(el=>el?.nodeType===1);}
 function position(){if(!active)return;const box=highlighted[0]?.getBoundingClientRect(),width=window.innerWidth,height=window.innerHeight,cardWidth=Math.min(360,width-24),cardHeight=card.offsetHeight||225;
  const left=box?Math.min(width-cardWidth-12,Math.max(12,box.left+box.width/2-cardWidth/2)):Math.max(12,(width-cardWidth)/2);
  const below=box?.bottom+12,top=box?(below+cardHeight<height-12?below:Math.max(12,box.top-cardHeight-12)):Math.max(12,(height-cardHeight)/2);
  card.style.width=cardWidth+'px';card.style.left=left+'px';card.style.top=Math.min(height-cardHeight-12,top)+'px';
 }
 async function showStep(next){
  if(!active)return;const token=++request;index=Math.min(steps.length-1,Math.max(0,next));persist();clearHighlight();
  await beforeStep(steps[index].id,index);if(token!==request||!active)return;
  highlighted=resolveTarget(steps[index].id).filter(el=>el.isConnected);for(const el of highlighted)el.classList.add('tour-highlight');
  const parent=highlighted[0]?.closest('dialog[open]')||(root.body||root);if(card.parentNode!==parent)parent.append(card);
  card.hidden=false;q('.tour-title').textContent=steps[index].title;q('.tour-text').textContent=steps[index].text;q('.tour-count').textContent=`${index+1} / ${steps.length}`;q('.tour-back').disabled=index===0;q('.tour-next').textContent=index===steps.length-1?'Done':'Next';
  highlighted[0]?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});position();
 }
 function dismiss({complete=false}={}){if(!active)return;active=false;request++;persist(complete);clearHighlight();card.hidden=true;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
 function start({resume=false}={}){if(active)return false;returnFocus=document.activeElement;active=true;if(!resume)index=0;void showStep(index);return true;}
 q('.tour-dismiss').onclick=()=>dismiss();q('.tour-skip').onclick=()=>dismiss();q('.tour-back').onclick=()=>void showStep(index-1);q('.tour-next').onclick=()=>index===steps.length-1?dismiss({complete:true}):void showStep(index+1);
 const escape=e=>{if(active&&e.key==='Escape'){e.preventDefault();dismiss();}};
 document.addEventListener('keydown',escape,true);window.addEventListener('resize',position);document.addEventListener('scroll',position,true);
 return{start,startIfFirstVisit:()=>!stored?.seen&&start(),resume:()=>start({resume:true}),dismiss,next:()=>index===steps.length-1?dismiss({complete:true}):showStep(index+1),get active(){return active;},get step(){return steps[index].id;},destroy(){dismiss();card.remove();document.removeEventListener('keydown',escape,true);window.removeEventListener('resize',position);document.removeEventListener('scroll',position,true);}};
}
