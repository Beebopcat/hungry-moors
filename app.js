import {createNarrationOwner,mergeStored} from './ext/demos/story-library/narration-transport.js';
import {story,fresh,valid,journey,choose,rewind,artFor} from './engine.js';
import {createBookAudio} from './audio.js';
const SAVE='casey.slaughtered-lamb.story.v1';
const PAGE_ART=Object.freeze({
  "the-fork": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/the-fork.png",
    "caption": "Three ways into the fog · Hungry Moors"
  },
  "road-cutoff": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/road-cutoff.png",
    "caption": "The breath ahead · Hungry Moors"
  },
  "wooded-shelter": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/wooded-shelter.png",
    "caption": "A roof among the trees · Hungry Moors"
  },
  "bolted-lamb": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/bolted-lamb.png",
    "caption": "The bolt on the other side · Hungry Moors"
  },
  "crypt-coats": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/crypt-coats.png",
    "caption": "The coats beneath the chapel · Hungry Moors"
  },
  "cellar-account": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/cellar-account.png",
    "caption": "Tonight’s empty lines · Hungry Moors"
  },
  "road-wicket": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/road-wicket.png",
    "caption": "The wicket and the hand · Hungry Moors"
  },
  "one-hand": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/one-hand.png",
    "caption": "One hand, two lives · Hungry Moors"
  },
  "blue-light": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/blue-light.png",
    "caption": "The light above a man’s head · Hungry Moors"
  },
  "road-bell": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/road-bell.png",
    "caption": "The bell rope in the rain · Hungry Moors"
  },
  "woods-marking": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/woods-marking.png",
    "caption": "The mark beneath the plaster · Hungry Moors"
  },
  "pub-son": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/pub-son.png",
    "caption": "The photograph’s uneven smile · Hungry Moors"
  },
  "pub-road-home": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/pub-road-home.png",
    "caption": "A lamp no longer waiting · Hungry Moors"
  },
  "pub-last-bolt": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/pub-last-bolt.png",
    "caption": "The bolt he could still lift · Hungry Moors"
  },
  "two-coats": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/two-coats.png",
    "caption": "Two coats at morning · Hungry Moors"
  },
  "record-saved": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/record-saved.png",
    "caption": "The account that survived · Hungry Moors"
  },
  "witnessed-mercy": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/witnessed-mercy.png",
    "caption": "No one waits alone · Hungry Moors"
  },
  "safe-voice": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/safe-voice.png",
    "caption": "The voice allowed through · Hungry Moors"
  },
  "road-kept": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/road-kept.png",
    "caption": "The road kept its promise · Hungry Moors"
  },
  "names-returned": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/names-returned.png",
    "caption": "Names returned to families · Hungry Moors"
  },
  "boundary-broken": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/boundary-broken.png",
    "caption": "The village's last excuse · Hungry Moors"
  },
  "lamps-reckoning": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/lamps-reckoning.png",
    "caption": "Lamps at The Slaughtered Lamb · Hungry Moors"
  },
  "red-sleeve": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/red-sleeve.png",
    "caption": "A hand at the wall · Hungry Moors"
  },
  "vestry-window": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/vestry-window.png",
    "caption": "The nails turned inward · Hungry Moors"
  },
  "upstairs-hand": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/upstairs-hand.png",
    "caption": "A window without a view · Hungry Moors"
  },
  "road-graves": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/road-graves.png",
    "caption": "The graves without dates · Hungry Moors"
  },
  "measured-help": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/measured-help.png",
    "caption": "A door opened carefully · Hungry Moors"
  },
  "borrowed-friend": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/borrowed-friend.png",
    "caption": "The friend the fog remembered · Hungry Moors"
  },
  "hunter-followed": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/hunter-followed.png",
    "caption": "The hunger that followed · Hungry Moors"
  },
  "name-price": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/name-price.png",
    "caption": "The name beyond the boundary · Hungry Moors"
  },
  "woods-altar": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/woods-altar.png",
    "caption": "A table set for no one · Hungry Moors"
  },
  "pub-confession": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/pub-confession.png",
    "caption": "What the ledger does not say · Hungry Moors"
  },
  "road-voice": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/road-voice.png",
    "caption": "A friend's voice behind the door · Hungry Moors"
  },
  "woods-oil": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/woods-oil.png",
    "caption": "The lamp at the church threshold · Hungry Moors"
  },
  "woods-rope": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/woods-rope.png",
    "caption": "The bindings left behind · Hungry Moors"
  },
  "pub-lamp": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/pub-lamp.png",
    "caption": "The mother's lamp · Hungry Moors"
  },
  "pub-regular": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/pub-regular.png",
    "caption": "The man who held the bolt · Hungry Moors"
  },
  "road-dawn": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/road-dawn.png",
    "caption": "The last hundred paces · Hungry Moors"
  },
  "road-hollow": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/road-hollow.png",
    "caption": "The shelter under the bridge · Hungry Moors"
  },
  "woods-brook": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/woods-brook.png",
    "caption": "The water beside the causeway · Hungry Moors"
  },
  "woods-witness": {
    "src": "ext/media/casey-rie-interiors-20261004-v1/woods-witness.png",
    "caption": "The last shadow of the chapel · Hungry Moors"
  }
});
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createBookApp({root=document,storage,audioFactory=createBookAudio}={}){
 const $=id=>root.querySelector('#'+id);
 let state=fresh(),hasSave=false,storageOK=true,started=false,choosing=false,musicOn=true,voiceOn=true,playing=false,suspended=true,destroyed=false,audioEpoch=0,viewDepth=null,lastPositionTick=-1,sceneEpoch=0,scenePlayOwner=null,sceneMotionEnabled=true,sceneUsable=false;
 const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
 if(!storage)storageOK=false;
 try{const saved=JSON.parse(storage?.getItem(SAVE)||'null');if(valid(saved)){state=saved;hasSave=saved.path.length>0;}}catch{storageOK=false;}
 const audio=audioFactory({onStatus:text=>$('audio-status').textContent=text||'',onError:error=>{$('audio-status').textContent=typeof error?.message==='string'&&error.message.trim()?error.message:'Narration could not play. The complete text remains readable.';}});
  const owner=createNarrationOwner({bookId:'moorland-hikers',onSuspend:()=>stopSound()});
  const view=()=>journey(viewDepth===null?state:{version:state.version,path:state.path.slice(0,viewDepth)});
  const narrativeOptions=()=>{const latest=view().latest;return latest?{consequence:{pageId:latest.pageId,choice:latest.choice}}:{};};
  function checkpoints(){
   const options=Array.from({length:state.path.length+1},(_,depth)=>{const p=journey({version:state.version,path:state.path.slice(0,depth)}).page;return '<option value="'+depth+'">'+(depth+1)+' · '+esc(p.title)+(depth===state.path.length?' · current':'')+'</option>';});
   $('route-checkpoints').innerHTML=options.join('');$('route-checkpoints').value=String(viewDepth??state.path.length);
   $('route-current').hidden=viewDepth===null;$('back').disabled=viewDepth!==null||!state.path.length;
  }
 function save(){hasSave=state.path.length>0;try{storage.setItem(SAVE,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}$('saved').textContent=storageOK?'Your place is saved on this device.':'Kept in this tab only.';$('resume').hidden=!hasSave;}
 function read(page,options={}){if(!playing||suspended||destroyed||root.hidden)return Promise.resolve();return Promise.resolve(audio.read(page,options)).catch(error=>{$('audio-status').textContent=typeof error?.message==='string'&&error.message.trim()?error.message:'Narration could not play. The complete text remains readable.';});}
 function sceneControl(){
  const control=$('scene-motion'),playing=sceneMotionEnabled&&Boolean(scenePlayOwner);
  control.hidden=!sceneUsable||!$('scene-video').src||reducedMotion?.matches||!started||suspended||destroyed;
  control.textContent=playing?'Pause scene':'Play scene';control.setAttribute('aria-label',playing?'Pause animated story scene':'Play animated story scene');
 }
 function sceneStill(){scenePlayOwner=null;$('scene-video').pause();$('scene-video').hidden=true;$('scene').hidden=false;sceneControl();}
 function playScene(token=sceneEpoch){
  const video=$('scene-video'),still=$('scene');
  sceneControl();
  if(token!==sceneEpoch||suspended||destroyed||root.hidden||!started||!sceneMotionEnabled||!sceneUsable||reducedMotion?.matches||!video.src)return;
  const owner={token};scenePlayOwner=owner;video.hidden=false;still.hidden=true;sceneControl();
  video.onerror=()=>{if(token===sceneEpoch&&scenePlayOwner===owner){sceneUsable=false;sceneStill();}};
  void video.play().then(()=>{
   if(scenePlayOwner!==owner){if(!scenePlayOwner)sceneStill();return;}
   if(token!==sceneEpoch||suspended||destroyed||root.hidden||!started||!sceneMotionEnabled||reducedMotion?.matches)sceneStill();
  }).catch(()=>{if(scenePlayOwner===owner)sceneStill();});
 }
 function picture(page){
  const art=PAGE_ART[page.id]||artFor(page),video=$('scene-video'),still=$('scene'),token=++sceneEpoch;
  still.src=art.src;still.alt=page.title+' · '+art.caption;still.hidden=false;$('scene-caption').textContent=art.caption;
  scenePlayOwner=null;video.pause();video.hidden=true;video.removeAttribute('src');video.oncanplay=null;video.onerror=null;sceneUsable=Boolean(art.video);
  if(art.video&&!reducedMotion?.matches){video.poster=art.src;video.src=art.video;video.oncanplay=()=>playScene(token);video.onerror=()=>{if(token===sceneEpoch){sceneUsable=false;sceneStill();}};}video.load();sceneControl();
 }
 function render({consequence=null,focus=true,narrate=true,opening=false}={}){
  if(destroyed)return;
  const displayed=view(),page=displayed.page;audioEpoch++;started=true;$('landing').hidden=true;$('reader').hidden=false;
  $('chapter').textContent=displayed.ending?'YOUR STORY’S ENDING':`CHAPTER ${page.chapter} · ${story.chapters.find(c=>c.id===page.chapter).title}`;
  $('page-title').textContent=page.title;picture(page);
  const latest=displayed.latest;const unit=page.id+'|'+(latest?'choice:'+latest.pageId+':'+latest.choice.id:'');if(audio.position?.().unit!==unit)audio.stopNarration(true);
  $('passage').innerHTML=(latest?`<aside class="last-choice"><strong>You chose: ${esc(latest.choice.label)}</strong><p>${esc(latest.choice.consequence)}</p></aside>`:'')+page.paragraphs.map(text=>`<p>${esc(text)}</p>`).join('')+(page.dialogue||[]).map(line=>`<blockquote class="dialogue"><cite>${esc(story.characters.find(c=>c.id===line.speaker)?.name||line.speaker)}</cite>${esc(line.text)}</blockquote>`).join('');
  $('passage').scrollTop=0;$('back').disabled=!state.path.length;
  $('choices').replaceChildren();
  if(displayed.ending){const button=root.createElement('button');button.className='primary';button.textContent='Begin another story';button.onclick=()=>cover();$('choices').append(button);}
  else if(viewDepth===null) page.choices.forEach((choice,index)=>{const button=root.createElement('button');button.className='choice';button.dataset.choice=String(index);button.innerHTML=`${esc(choice.label)}<span aria-hidden="true"><svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-7-7 7 7-7 7" fill="none"/></g></svg></span>`;button.onclick=event=>{if(event?.detail>1)return;chooseAction(index);};$('choices').append(button);});
  checkpoints();soundControls();if(viewDepth!==null){$('choices').textContent='Earlier checkpoint · your current journey is unchanged.';}const readingColumn=root.querySelector('.story-page');if(readingColumn)readingColumn.scrollTop=0;if(focus)$('page-title').focus({preventScroll:true});
  if(narrate&&voiceOn&&playing)void read(page,narrativeOptions());
 }
 function chooseAction(index){
  if(destroyed||choosing||!started||viewDepth!==null||journey(state).ending)return false;
  const page=journey(state).page,choice=page.choices[index];if(!choice)return false;
  choosing=true;viewDepth=null;state=choose(state,index);save();if(playing)audio.effect(journey(state).ending?'ending':'turn');render({consequence:{pageId:page.id,choice}});queueMicrotask(()=>choosing=false);return true;
 }
 function cover(){stopSound();audioEpoch++;sceneEpoch++;scenePlayOwner=null;audio.stopNarration();$('scene-video').pause();$('scene-video').oncanplay=null;started=false;soundControls();sceneControl();$('landing').hidden=false;$('reader').hidden=true;$('resume').hidden=!hasSave;$('start').focus({preventScroll:true});}
 function soundControls(){
  $('play').textContent=playing?'Pause':'Play';$('play').setAttribute('aria-pressed',String(playing));$('play').setAttribute('aria-label',playing?'Pause narration and music':'Play narration and music');
 }
 function stopSound(){playing=false;audioEpoch++;audio.suspend();owner.release();soundControls();}
 function playSound(){
  if(destroyed||root.hidden||!started||!owner.claim())return;playing=true;suspended=false;audioEpoch++;const epoch=audioEpoch;soundControls();
  audio.setMusic(musicOn);audio.setVoice(voiceOn);
  void Promise.resolve(audio.start({activation:true})).then(()=>{if(!destroyed&&playing&&!suspended&&epoch===audioEpoch&&voiceOn)return read(view().page,narrativeOptions());}).catch(()=>{if(epoch===audioEpoch){stopSound();$('audio-status').textContent='Sound could not start. Press Play to retry.';}});
 }
 function begin(resume=false){if(destroyed)return;stopSound();viewDepth=null;suspended=false;if(!resume){state=fresh();save();}render({opening:true,narrate:false});}
 $('play').onclick=()=>playing?stopSound():playSound();soundControls();
  $('rewind-audio').onclick=()=>audio.skip(-15);$('forward-audio').onclick=()=>audio.skip(15);
  $('route-checkpoints').onchange=()=>{stopSound();const n=Number($('route-checkpoints').value);if(Number.isInteger(n)&&n>=0&&n<=state.path.length){viewDepth=n===state.path.length?null:n;render({narrate:false});}};
  $('route-current').onclick=()=>{stopSound();viewDepth=null;render({narrate:false});};
  $('return-library').onclick=()=>{stopSound();if(window.parent!==window)window.parent.postMessage({type:'storybook-library'},window.location.origin);else window.location.href='https://caseyshingledecker.com/demos/story-library/library.html';};
 $('start').onclick=()=>begin(false);$('resume').onclick=()=>begin(true);$('resume').hidden=!hasSave;
 $('home-link').onclick=event=>{event.preventDefault();cover();};
 $('back').onclick=()=>{if(!state.path.length)return;viewDepth=null;state=rewind(state);save();if(playing)audio.effect('turn');render();};
 $('read-again').onclick=()=>{if(destroyed)return;audio.restart();if(!playing)playSound();else{audioEpoch++;void read(view().page,narrativeOptions());}};
 $('scene-motion').onclick=()=>{
  if(destroyed||suspended||root.hidden||!started||!sceneUsable||reducedMotion?.matches)return;
  if(scenePlayOwner){sceneMotionEnabled=false;sceneStill();}else{sceneMotionEnabled=true;playScene();}
 };
 $('music').onclick=()=>{musicOn=!musicOn;audio.setMusic(musicOn);$('music').textContent=musicOn?'Music on':'Music off';$('music').setAttribute('aria-pressed',String(musicOn));};
 $('voice').onclick=()=>{audioEpoch++;voiceOn=!voiceOn;audio.setVoice(voiceOn);$('voice').textContent=voiceOn?'Voice on':'Voice off';$('voice').setAttribute('aria-pressed',String(voiceOn));if(voiceOn&&playing){suspended=false;sceneControl();void Promise.resolve(audio.start()).catch(()=>{});void read(view().page,narrativeOptions());}};
 const unload=()=>{playing=false;soundControls();audioEpoch++;sceneEpoch++;scenePlayOwner=null;suspended=true;audio.suspend();$('scene-video').pause();sceneControl();};
 const visibility=()=>{if(root.hidden)unload();};
 const message=event=>{if(event.origin===window.location?.origin&&event.source===window.parent&&event.data?.type==='storybook-suspend')unload();};
 const motion=()=>{if(reducedMotion.matches){sceneEpoch++;sceneStill();}sceneControl();};
 root.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',unload);window.addEventListener('message',message);reducedMotion?.addEventListener('change',motion);
 $('audio-status').textContent='Press Play when you want narration and music.';
 return {get state(){return structuredClone(state);},get started(){return started;},begin,choose:chooseAction,cover,render,suspend:unload,destroy(){destroyed=true;unload();audio.dispose();owner.destroy();root.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',unload);window.removeEventListener('message',message);reducedMotion?.removeEventListener('change',motion);}};
}
if(typeof document!=='undefined')createBookApp();
