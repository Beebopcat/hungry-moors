// A verified short opening supplements the still-visible, unabridged passage.
export function createRecordedIntro({identity,isCurrent,play,duck,unduck,report}){
 let epoch=0,abort=null,activeUrl=null;
 const stop=()=>{epoch++;abort?.abort();abort=null;if(activeUrl){URL.revokeObjectURL(activeUrl);activeUrl=null;}};
 function format(bytes){
  const v=new DataView(bytes),tag=(at,n)=>String.fromCharCode(...new Uint8Array(bytes,at,n));
  if(v.byteLength<44||tag(0,4)!=='RIFF'||tag(8,4)!=='WAVE'||v.getUint32(4,true)+8!==v.byteLength)throw Error('The verified opening recording could not load.');
  let fmt=null,data=0;for(let at=12;at+8<=v.byteLength;){const size=v.getUint32(at+4,true),begin=at+8,end=begin+size;if(end>v.byteLength)throw Error('The opening recording is incomplete.');const name=tag(at,4);
   if(name==='fmt '){if(size<16)throw Error('The opening recording format is invalid.');fmt={pcm:v.getUint16(begin,true),channels:v.getUint16(begin+2,true),rate:v.getUint32(begin+4,true),align:v.getUint16(begin+12,true),bits:v.getUint16(begin+14,true)};}
   if(name==='data'){if(!fmt||!size||size%fmt.align)throw Error('The opening recording has no complete samples.');data+=size;}
   at=end+(size%2);
  }
  if(!fmt||!data||fmt.pcm!==1||fmt.channels!==1||fmt.rate!==24000||fmt.bits!==24||fmt.align!==3)throw Error('The opening recording must use its native audio format.');
 }
 function validate(manifest){
  const clip=manifest?.intro;
  if(manifest?.version!==1||manifest.bookId!==identity.bookId||!clip||clip.status!=='ready'||clip.transcriptQA!=='passed'||!/^[a-f0-9]{64}$/.test(clip.audioSha256||''))throw Error('The verified opening recording is still being prepared.');
  for(const key of ['bookId','src','voice','seed','textSha256','sampleRate','channels','bits'])if(clip[key]!==identity[key])throw Error('The exact opening recording is still being prepared.');
  return clip;
 }
 async function run(request){
  stop();const own=epoch,controller=new AbortController();abort=controller;let url=null,ducked=false;
  const current=()=>own===epoch&&isCurrent(request);
  try{
   const response=await fetch('audio/intro-manifest.json',{cache:'no-store',signal:controller.signal});if(!current())return 'cancelled';
   if(!response.ok)throw Error('The verified opening recording is still being prepared.');
   const clip=validate(await response.json());if(!current())return 'cancelled';
   const audio=await fetch(clip.src,{cache:'no-store',signal:controller.signal});if(!current())return 'cancelled';if(!audio.ok)throw Error('The verified opening recording could not load.');
   const bytes=await audio.arrayBuffer();if(!current())return 'cancelled';format(bytes);
   if(!globalThis.crypto?.subtle)throw Error('Opening audio verification is unavailable. The complete story remains readable.');
   const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(!current())return 'cancelled';
   if(hash!==clip.audioSha256)throw Error('The opening recording did not match its verified audio.');
   url=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));activeUrl=url;duck();ducked=true;report('Opening narration playing. The full passage remains on screen.');
   const ended=await play(url,request);if(!current()||!ended)return 'cancelled';
   report('Opening narrated. Full passage recording is still being prepared.');return 'played';
  }catch(error){
   if(!current()||error.name==='AbortError')return 'cancelled';
   report(error.name==='NotAllowedError'?'Press Play to activate sound. Full passage recording is still being prepared.':error.message);
   return error.name==='NotAllowedError'?'blocked':'unavailable';
  }finally{
   if(url){URL.revokeObjectURL(url);if(activeUrl===url)activeUrl=null;}
   if(abort===controller)abort=null;
   if(ducked&&current())unduck();
  }
 }
 return{play:run,stop};
}
