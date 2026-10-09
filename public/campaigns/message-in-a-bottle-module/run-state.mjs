export const DEFAULT_SECONDS=4*60*60;
export function freshRun(){return {version:1,activeSession:0,viewedSession:0,remaining:DEFAULT_SECONDS,deadline:null,marks:{},clues:{},clocks:{},notes:'',volume:0.2};}
const int=(v,min,max,fallback)=>Number.isInteger(v)&&v>=min&&v<=max?v:fallback;
export function restoreRun(value){
 const s=freshRun();if(!value||value.version!==1)return s;
 s.activeSession=int(value.activeSession,0,7,0);s.viewedSession=int(value.viewedSession,0,7,s.activeSession);s.remaining=int(value.remaining,0,24*60*60,DEFAULT_SECONDS);
 s.deadline=Number.isFinite(value.deadline)&&value.deadline>0?value.deadline:null;
 for(const name of ['marks','clues'])if(value[name]&&typeof value[name]==='object')for(const [k,v] of Object.entries(value[name]))if(/^[0-7]-[a-z0-9-]+$/.test(k)&&v===true)s[name][k]=true;
 if(value.clocks&&typeof value.clocks==='object')for(const [k,v] of Object.entries(value.clocks))if(/^(portal|danger|maze|quake|slide|tether)$/.test(k))s.clocks[k]=int(v,0,({portal:3,danger:6,maze:4,quake:6,slide:6,tether:4})[k],0);
 s.notes=typeof value.notes==='string'?value.notes.slice(0,20000):'';s.volume=typeof value.volume==='number'&&value.volume>=0&&value.volume<=1?value.volume:0.2;return s;
}
export function remainingAt(s,now=Date.now()){return s.deadline===null?s.remaining:Math.max(0,Math.ceil((s.deadline-now)/1000));}
export function toggleClock(s,now=Date.now()){const remaining=remainingAt(s,now);return {...s,remaining,deadline:s.deadline===null&&remaining>0?now+remaining*1000:null};}
export function beginSession(s,id){if(!Number.isInteger(id)||id<0||id>7)return s;return {...s,activeSession:id,viewedSession:id,remaining:DEFAULT_SECONDS,deadline:null};}
export function changePressure(s,clock,delta){const value=Math.max(0,Math.min(clock.max,(s.clocks[clock.id]??0)+delta));return {...s,clocks:{...s.clocks,[clock.id]:value}};}
