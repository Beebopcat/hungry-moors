// One ordered, source-verified chapter/page. Seeking never changes the story route.
export function createNarrationTransport({audio,isAllowed=()=>true,onState=()=>{},onError=()=>{},onFinish=()=>{}}){
 let clips=[],unit=null,index=0,offset=0,wanted=false,epoch=0,metadata=false,destroyed=false;
 const duration=clip=>Number(clip.durationSeconds);
 const total=()=>clips.reduce((n,c)=>n+duration(c),0);
 const absolute=src=>new URL(src,globalThis.location?.href||'https://example.invalid/').href;
 const owns=()=>!destroyed&&clips[index]&&audio.getAttribute('src')===clips[index].src&&(!audio.currentSrc||audio.currentSrc===absolute(clips[index].src));
 const elapsed=()=>clips.slice(0,index).reduce((n,c)=>n+duration(c),0)+(metadata&&owns()?Math.max(0,Math.min(duration(clips[index]),audio.currentTime||0)):offset);
 const snapshot=()=>({unit,index,clipId:clips[index]?.id||null,textSha256:clips[index]?.textSha256||null,audioSha256:clips[index]?.audioSha256||null,offset:metadata&&owns()?audio.currentTime||0:offset,time:elapsed(),duration:total(),playing:wanted,ready:clips.length>0});
 const report=()=>onState(snapshot());
 function pause(){if(metadata&&owns())offset=audio.currentTime||0;wanted=false;epoch++;audio.pause();report();}
 function clear(){pause();clips=[];unit=null;index=0;offset=0;metadata=false;audio.removeAttribute('src');audio.load();report();}
 async function perform(){
  if(!wanted||!metadata||!owns()||!isAllowed())return;
  const own=epoch,src=clips[index].src;
  try{await audio.play();if(own!==epoch||!wanted||!isAllowed()||audio.getAttribute('src')!==src){if(!wanted||!isAllowed())audio.pause();return;}report();}
  catch(error){if(own===epoch){pause();onError(error);}}
 }
 function load(){
  epoch++;audio.pause();metadata=false;
  if(!clips[index])return;
  const own=epoch,clip=clips[index];audio.src=clip.src;
  audio.onloadedmetadata=()=>{if(own!==epoch||!owns()||clips[index]!==clip)return;metadata=true;offset=Math.max(0,Math.min(offset,duration(clip),Number.isFinite(audio.duration)?audio.duration:duration(clip)));audio.currentTime=offset;report();void perform();};
  audio.load();report();
 }
 function setQueue(identity,next,{position=null}={}){
  if(!identity||!Array.isArray(next)||!next.length||next.some(c=>!c.id||!c.src||c.status!=='ready'||!Number.isFinite(duration(c))||duration(c)<=0)){
   clear();throw Error('Full narration for this passage is awaiting review. The complete story remains readable.');
  }
  const key=JSON.stringify(next.map(c=>[c.id,c.src,c.textSha256,c.audioSha256,c.durationSeconds]));
  if(unit===identity&&clips.key===key){report();return false;}
  pause();clips=next.map(c=>({...c}));clips.key=key;unit=identity;index=0;offset=0;
  if(position&&position.unit===identity){const at=clips.findIndex(c=>c.id===position.clipId&&(!position.textSha256||position.textSha256===c.textSha256)&&(!position.audioSha256||position.audioSha256===c.audioSha256));if(at>=0){index=at;offset=Math.max(0,Math.min(Number(position.offset)||0,duration(clips[index])));}}
  load();return true;
 }
 function play(){if(!clips.length||!isAllowed())return false;if(elapsed()>=total())seek(0);wanted=true;epoch++;if(!metadata)load();else void perform();report();return true;}
 function seek(seconds){
  if(!clips.length)return false;const at=Math.max(0,Math.min(Number(seconds)||0,total()));let rest=at,next=0;
  while(next<clips.length-1&&rest>=duration(clips[next])){rest-=duration(clips[next]);next++;}
  if(next===index&&metadata&&owns()){offset=Math.min(rest,duration(clips[index]));audio.currentTime=offset;report();}
  else{index=next;offset=Math.min(rest,duration(clips[index]));load();}
  return true;
 }
 function ended(){
  if(!wanted||!metadata||!owns()||!audio.ended||!isAllowed())return;
  if(index+1<clips.length){index++;offset=0;load();}
  else{offset=duration(clips[index]);wanted=false;epoch++;report();onFinish(snapshot());}
 }
 const time=()=>{if(metadata&&owns()){offset=audio.currentTime||0;report();}};
 const failure=()=>{if(owns()){pause();onError(Error('This recorded passage could not load.'));}};
 const enforce=()=>{if(!wanted||!owns()||!isAllowed())audio.pause();};
 audio.addEventListener('ended',ended);audio.addEventListener('timeupdate',time);audio.addEventListener('error',failure);audio.addEventListener('play',enforce);
 return{setQueue,clear,pause,play,seek,skip:seconds=>seek(elapsed()+seconds),restart:()=>seek(0),snapshot,destroy(){if(destroyed)return;clear();destroyed=true;audio.onloadedmetadata=null;for(const [event,fn]of [['ended',ended],['timeupdate',time],['error',failure],['play',enforce]])audio.removeEventListener?.(event,fn);}};
}

export function createNarrationOwner({bookId,onSuspend=()=>{}}){
 const id=globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random();let active=false;
 const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('casey-story-narration-owner-v1'):null;
 const suspend=()=>{active=false;onSuspend();};
 if(channel)channel.onmessage=event=>{if(event.data?.type==='claim'&&event.data.owner!==id)suspend();};
 const message=event=>{if(event.origin===location.origin&&event.source===parent&&['narration-suspend','story-library-suspend','storybook-suspend'].includes(event.data?.type))suspend();};
 const hidden=()=>{if(document.hidden)suspend();};
 window.addEventListener('message',message);window.addEventListener('pagehide',suspend);document.addEventListener('visibilitychange',hidden);
 return{get active(){return active;},claim(){if(document.hidden)return false;active=true;const current=typeof bookId==='function'?bookId():bookId;channel?.postMessage({type:'claim',owner:id,bookId:current});if(parent!==window)parent.postMessage({type:'narration-claim',bookId:current},location.origin);return true;},release(){active=false;},destroy(){active=false;channel?.close();window.removeEventListener('message',message);window.removeEventListener('pagehide',suspend);document.removeEventListener('visibilitychange',hidden);}};
}

export function mergeStored(storage,key,patch){
 let current={};try{const value=JSON.parse(storage.getItem(key)||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))current=value;}catch{}
 const next={...current,...patch};if(patch.settings)next.settings={...(current.settings||{}),...patch.settings};storage.setItem(key,JSON.stringify(next));return next;
}
