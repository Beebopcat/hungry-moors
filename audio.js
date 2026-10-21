import {createNarrationTransport} from './ext/demos/story-library/narration-transport.js';
import {SOURCE_BINDINGS} from './audio/source-bindings.js';
const BASE = 'ext/demos/top-secret/lantern-gate/audio/';
const scores = [BASE + 'intro.mp3', BASE + 'night.mp3', BASE + 'dungeon.mp3', BASE + 'hunt.mp3'];
const LOOP_SECONDS = 4, MUSIC_LEVEL = .12, DUCK_LEVEL = .035;

export function createBookAudio({onStatus = () => {}, onError = () => {}} = {}) {
  let musicOn = true, voiceOn = true, token = 0, currentPage = null, loading = null;
  let disposed = false, suspended = true, currentTrack = '', active = 0, overlap = null;
  let musicEpoch = 0, effectEpoch = 0, clock = null, gain = MUSIC_LEVEL, targetGain = MUSIC_LEVEL;
  let context = null, pendingPlayback = null, catalogAbort = null, loopBlocked = false;
  const effects = new Set();
  const channels = [0, 1].map(() => {
    const audio = new Audio();
    audio.loop = false; audio.preload = 'auto'; audio.volume = 0;
    return {audio, request: 0, owner: null, pending: null};
  });
  const narration = new Audio(); narration.preload = 'metadata';
  const allowed = () => !disposed && !suspended && !document.hidden;
  const musicAllowed = () => allowed() && musicOn;
  function report(text) { if (!disposed) onStatus(text); }
  function progress() {
    if (!overlap || overlap.waiting) return 0;
    const outgoing = channels[overlap.out].audio, incoming = channels[overlap.into].audio;
    return Math.max(0, Math.min(1, Math.max(outgoing.currentTime - overlap.startedAt, incoming.currentTime) / LOOP_SECONDS));
  }
  function volumes() {
    const fraction = progress();
    channels.forEach(({audio}, index) => {
      const weight = overlap && !overlap.waiting
        ? index === overlap.out ? Math.cos(fraction * Math.PI / 2) : Math.sin(fraction * Math.PI / 2)
        : index === active ? 1 : 0;
      audio.volume = Math.max(0, Math.min(1, gain * weight));
    });
  }
  function clearClock() { clearInterval(clock); clock = null; }
  function ensureClock() {
    if (!clock && musicAllowed() && channels.some(channel => channel.pending || !channel.audio.paused)) clock = setInterval(tick, 40);
  }
  function level(next) { targetGain = next; if (musicAllowed()) ensureClock(); }
  function finishOverlap() {
    if (!overlap || overlap.waiting) return;
    const previous = channels[overlap.out]; active = overlap.into;
    previous.audio.pause(); previous.audio.currentTime = 0; previous.audio.volume = 0;
    overlap = null; loopBlocked = false; volumes();
  }
  function pauseMusic() {
    if (overlap && !overlap.waiting && (progress() >= .5 || channels[overlap.out].audio.ended)) active = overlap.into;
    musicEpoch++; overlap = null; loopBlocked = false; clearClock();
    for (const channel of channels) {
      channel.request++; channel.owner = null; channel.pending = null; channel.audio.pause();
    }
    channels[1 - active].audio.currentTime = 0;
    gain = targetGain; volumes();
  }
  function playMusic(index) {
    const channel = channels[index];
    if (!musicAllowed()) return Promise.resolve(false);
    if (channel.pending) return channel.pending;
    if (!channel.audio.paused && !channel.audio.ended) { ensureClock(); return Promise.resolve(true); }
    const epoch = musicEpoch, request = ++channel.request;
    channel.owner = request;
    const promise = Promise.resolve().then(() => {
      if (!musicAllowed() || epoch !== musicEpoch || request !== channel.request) return false;
      return channel.audio.play();
    }).then(result => {
      if (!musicAllowed() || epoch !== musicEpoch || request !== channel.request) {
        // Pause a cancelled owner, but never pause a newer play on the same channel.
        if (channel.owner === null || channel.owner === request) channel.audio.pause();
        return false;
      }
      if (result === false) return false;
      ensureClock(); return true;
    }).catch(error => {
      if (musicAllowed() && epoch === musicEpoch && request === channel.request) {
        report(error.name === 'NotAllowedError' ? 'Start your adventure to activate sound.' : 'The recorded score could not load.');
      }
      return false;
    }).finally(() => { if (channel.pending === promise) channel.pending = null; });
    channel.pending = promise; return promise;
  }
  function beginOverlap() {
    if (overlap || loopBlocked || !musicAllowed()) return;
    const out = active, into = 1 - active, incoming = channels[into].audio;
    incoming.currentTime = 0; incoming.volume = 0;
    const transition = {out, into, waiting: true, startedAt: 0, epoch: musicEpoch}; overlap = transition;
    void playMusic(into).then(playing => {
      if (overlap !== transition || transition.epoch !== musicEpoch || !musicAllowed()) return;
      if (!playing) { overlap = null; loopBlocked = true; volumes(); return; }
      transition.waiting = false; transition.startedAt = channels[out].audio.currentTime;
      if (channels[out].audio.ended) finishOverlap(); else volumes();
    });
  }
  function tick() {
    if (!musicAllowed()) {
      // Seeking the idle channel can itself emit timeupdate. Do not seek it repeatedly while hidden.
      if (overlap || channels.some(channel => channel.pending || !channel.audio.paused)) pauseMusic();
      else clearClock();
      return;
    }
    gain += (targetGain - gain) * .18;
    if (Math.abs(targetGain - gain) < .0001) gain = targetGain;
    if (overlap && !overlap.waiting && (progress() >= 1 || channels[overlap.out].audio.ended)) finishOverlap();
    const audio = channels[active].audio;
    if (!overlap && Number.isFinite(audio.duration) && audio.duration > LOOP_SECONDS &&
        !audio.paused && audio.duration - audio.currentTime <= LOOP_SECONDS) beginOverlap();
    volumes();
    if (!overlap && channels.every(channel => channel.audio.paused && !channel.pending)) clearClock();
  }
  channels.forEach(({audio}, index) => {
    audio.ontimeupdate = tick;
    audio.onended = () => {
      if (!musicAllowed()) return;
      if (overlap?.out === index) { if (!overlap.waiting) finishOverlap(); return; }
      if (active === index) { audio.currentTime = 0; loopBlocked = false; void playMusic(index); }
    };
  });
  async function score(page) {
    if (!musicAllowed()) return false;
    const index = page?.disposition ? 2 : ([0, 1, 2, 1, 3, 2][(page?.chapter || 1) - 1] || 0);
    const next = scores[index];
    if (currentTrack !== next) {
      pauseMusic(); active = 0; currentTrack = next;
      for (const {audio} of channels) { audio.src = next; audio.currentTime = 0; }
      volumes();
    }
    const playing = await playMusic(active);
    if (playing) tick(); return playing;
  }
  async function catalog() {
    // Explicit Replay retries refresh newly verified clips; there is no polling loop.
    if (!loading) {
      catalogAbort = new AbortController();
      loading = fetch('audio/narration-manifest.json', {cache: 'no-store', signal: catalogAbort.signal})
        .then(response => { if (!response.ok) throw Error('Recorded narration is still being prepared.'); return response.json(); })
        .then(manifest => {
          if (manifest.narrator?.id !== 'qn_lorath_refined' || !manifest.pages || !manifest.clips) throw Error('The selected narrator recording is unavailable.');
          return manifest;
        }).finally(() => { loading = null; catalogAbort = null; });
    }
    return loading;
  }
  const transport=createNarrationTransport({audio:narration,isAllowed:()=>allowed()&&voiceOn,
    onState:s=>{if(s.ready)report((s.playing?'Narration playing':'Narration paused')+' · '+clockTime(s.time)+' / '+clockTime(s.duration));},
    onError:error=>{level(MUSIC_LEVEL);report(error.message);onError(error);},
    onFinish:()=>{level(MUSIC_LEVEL);report('This complete passage has finished. Choose what happens next.');}
  });
  function clockTime(seconds){const n=Math.floor(seconds||0);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');}
  function stopNarration(clear=false){token++;transport.pause();if(clear)transport.clear();level(MUSIC_LEVEL);}
  async function digest(text){if(!globalThis.crypto?.subtle)throw Error('Exact narration verification is unavailable.');return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(n=>n.toString(16).padStart(2,'0')).join('');}
  async function read(page,{consequence}={}){
    const request=++token;transport.pause();currentPage=page;void score(page);
    if(!voiceOn||!allowed())return;
    try{
      const expectedPage=SOURCE_BINDINGS.pages[page.id];
      if(!expectedPage)throw Error('Choose a story passage before listening.');
      const sourceHash=await digest(JSON.stringify({paragraphs:page.paragraphs,dialogue:page.dialogue||[]}));
      if(request!==token||!allowed()||!voiceOn)return;
      if(sourceHash!==expectedPage.textSha256)throw Error('The visible story and narration source did not match.');
      const consequenceKey=consequence?'choice:'+consequence.pageId+':'+consequence.choice.id:null;
      if(consequenceKey&&await digest(consequence.choice.consequence)!==SOURCE_BINDINGS.choices[consequenceKey])throw Error('The selected consequence and narration source did not match.');
      const manifest=await catalog();if(request!==token||!allowed()||!voiceOn)return;
      if(JSON.stringify(manifest.pages[page.id]||[])!==JSON.stringify(expectedPage.keys))throw Error('The ordered passage recordings did not match.');
      const keys=[...(consequenceKey?[consequenceKey]:[]),...expectedPage.keys];
      const clips=keys.map(key=>{const expected=SOURCE_BINDINGS.clips[key],clip=manifest.clips[key];
        if(!expected||!clip||clip.src!==expected.src||clip.voice!==expected.voice||clip.textSha256!==expected.textSha256)throw Error('The exact story recording identities did not match.');
        if(clip.status!=='ready'||clip.transcriptQA!=='passed'||clip.sampleRate!==24000||clip.channels!==1||clip.bits!==24||!/^[a-f0-9]{64}$/.test(clip.audioSha256||''))throw Error('Full narration for this passage is awaiting review. The complete text remains readable.');
        return {...clip,id:key};
      });
      if(request!==token||!allowed()||!voiceOn)return;
      transport.setQueue(page.id+'|'+(consequenceKey||''),clips);level(DUCK_LEVEL);transport.play();
    }catch(error){if(request===token){transport.clear();level(MUSIC_LEVEL);report(error.message);onError(error);}}
  }
  function stopEffects() {
    effectEpoch++;
    for (const {oscillator, gain: effectGain} of effects) {
      try { oscillator.stop(); } catch {}
      try { oscillator.disconnect(); effectGain.disconnect(); } catch {}
    }
    effects.clear(); context?.suspend().catch(() => {});
  }
  function effect(name) {
    if (!allowed()) return;
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      const request = effectEpoch;
      void context.resume().then(() => {
        if (!allowed() || request !== effectEpoch) return;
        const now = context.currentTime, effectGain = context.createGain(); effectGain.connect(context.destination);
        effectGain.gain.setValueAtTime(.001, now); effectGain.gain.exponentialRampToValueAtTime(.05, now + .03); effectGain.gain.exponentialRampToValueAtTime(.001, now + .75);
        const tones = name === 'start' ? [147, 155, 220] : name === 'ending' ? [110, 165, 196] : [330, 440];
        for (const tone of tones) {
          const oscillator = context.createOscillator(), entry = {oscillator, gain: effectGain};
          oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(tone, now); oscillator.frequency.exponentialRampToValueAtTime(tone * .88, now + .7); oscillator.connect(effectGain); effects.add(entry);
          oscillator.onended = () => { effects.delete(entry); oscillator.disconnect(); if (![...effects].some(other => other.gain === effectGain)) effectGain.disconnect(); };
          oscillator.start(now); oscillator.stop(now + .8);
        }
      }).catch(() => {});
    } catch {}
  }
  function suspend() { suspended = true; stopNarration(); pauseMusic(); stopEffects(); }
  async function resume() { if (disposed) return; suspended = false; return score(currentPage); }
  const visibility = () => {
    if (document.hidden) { stopNarration(); pauseMusic(); stopEffects(); }
    else if (!suspended && musicOn) void score(currentPage);
  };
  const pagehide = () => { suspend(); }, pageshow = () => { /* User presses Play after returning. */ };
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', pagehide); window.addEventListener('pageshow', pageshow);
  return {
    start() { return resume(); }, resume, suspend, read,
    readConsequence: ({pageId, choice}) => read({id: 'consequence-only'}, {consequence: {pageId, choice}}),
    setMusic(on) { musicOn = !!on; if (musicOn) void score(currentPage); else pauseMusic(); },
    // The app reads the visible page after enabling voice; this setter never reads twice.
    setVoice(on) { voiceOn = !!on; if (!voiceOn) stopNarration(); },
    skip:seconds=>transport.skip(seconds),restart:()=>transport.restart(),position:()=>transport.snapshot(),
    effect, stopNarration, get musicOn() { return musicOn; }, get voiceOn() { return voiceOn; },
    dispose() {
      if (disposed) return;
      disposed = true; stopNarration(); pauseMusic(); stopEffects(); catalogAbort?.abort();
      for (const {audio} of channels) { audio.onended = null; audio.ontimeupdate = null; audio.src = ''; }
      transport.destroy(); narration.src = ''; context?.close().catch(() => {});
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', pagehide); window.removeEventListener('pageshow', pageshow);
    }
  };
}
