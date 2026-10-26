import story from './story-data.js';
export {story};
const dimensions=['prudence','loyalty','defiance'];
const routes=['road','woods','pub'];
const number=path=>path.reduce((n,i)=>n*3+i,0);
// 121 full ternary nodes, 28 selected sixth decisions, and one explicit binary rescue finale.
// 149 ternary nodes give 299 leaves; the one binary node raises the total to exactly300.
const expanded=new Set(Array.from({length:243},(_,i)=>i).filter(i=>Math.floor((i+1)*28/243)>Math.floor(i*28/243)));
const binaryPath='00000';
export function isDecision(path){return path.length<5||path.length===5&&(expanded.has(number(path))||path.join('')===binaryPath);}
export function passageFor(path){
 if(!isDecision(path))return null;
 if(path.join('')===binaryPath)return story.passages.find(p=>p.id==='one-hand');
 if(!path.length)return story.passages.find(p=>p.chapter===1);
 const route=routes[path[0]],chapter=path.length+1;
 // The first entrance leads to its actual room. Later scenes share the connected church/causeway.
 const entrances={road:[0,0,1],woods:[1,1,0],pub:[1,0,1]};
 const variant=chapter===2?0:chapter===3?entrances[route][path[1]]:number(path.slice(1))%2;
 const p=story.passages.find(p=>p.chapter===chapter&&p.route===route&&p.variant===variant);
 if(!p)throw Error('Missing authored route passage');return p;
}
function dominant(values,last={}){
 const max=Math.max(...dimensions.map(k=>values[k]));
 return dimensions.filter(k=>values[k]===max).sort((a,b)=>(last[b]||0)-(last[a]||0)||dimensions.indexOf(a)-dimensions.indexOf(b))[0];
}
export function resolutionFor(choice){return choice.resolutionTag||({prudence:'escape',loyalty:'rescue',defiance:'expose'}[dominant(choice.values)]);}
export function fresh(){return{version:1,path:[]};}
export function valid(state){
 if(!state||state.version!==1||!Array.isArray(state.path)||state.path.length>6)return false;
 for(let i=0;i<state.path.length;i++){
  const prior=state.path.slice(0,i),index=state.path[i];
  if(!isDecision(prior)||!Number.isInteger(index)||index<0||index>=passageFor(prior).choices.length)return false;
 }
 return true;
}
export function journey(state){
 if(!valid(state))throw Error('Invalid Casey and Mara story path');
 const totals={prudence:0,loyalty:0,defiance:0},flags=new Set(),history=[];
 for(let i=0;i<state.path.length;i++){
  const page=passageFor(state.path.slice(0,i)),choice=page.choices[state.path[i]];
  for(const k of dimensions)totals[k]+=choice.values[k];choice.flags.forEach(f=>flags.add(f));
  history.push({pageId:page.id,title:page.title,choiceIndex:state.path[i],choice});
 }
 const latest=history.at(-1),disposition=dominant(totals,latest?.choice.values),resolution=latest?resolutionFor(latest.choice):null;
 const ending=!isDecision(state.path)?story.endings.find(e=>e.disposition===disposition&&e.resolutionTag===resolution):null;
 if(!isDecision(state.path)&&!ending)throw Error('No authored ending matches the decisions');
 return{history,latest,totals,flags:[...flags],disposition,resolution,ending,page:ending||passageFor(state.path)};
}
export function choose(state,index){if(!valid(state)||!isDecision(state.path)||!Number.isInteger(index)||index<0||index>=passageFor(state.path).choices.length)throw Error('Choose an available action');return{version:1,path:[...state.path,index]};}
export function rewind(state){if(!valid(state))throw Error('Invalid story path');return{version:1,path:state.path.slice(0,-1)};}
export function enumerateRoutes(){const out=[];function visit(state){if(!isDecision(state.path)){out.push({...state,...journey(state)});return;}for(let i=0;i<passageFor(state.path).choices.length;i++)visit(choose(state,i));}visit(fresh());return out;}
export function artFor(page){return story.art[page.art];}
