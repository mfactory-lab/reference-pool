import{c as qe,i as _e,a as we,Q as ve,P as ke,N as ye,b as ze,d as Ae,e as Se,f as Te,S as Pe,g as Ee,h as Ce,j as Re,k as Le,C as Ne,E as Fe,B as Ie,l as Oe,m as je,n as Ge,o as Ue,T as Be,G as De,M as We,L as Ye,p as Me,q as S,u as H,r as b,s as v,w as z,t as Ve,v as ne,W as He,x as le,y as de,z as Ke,A as G,D as te,F as U,H as $e,I as ce,J as Xe,K as oe,O as Qe,R as K,U as Ze,V as B,X as Je,Y as et,Z as tt,_ as $,$ as ot,a0 as rt,a1 as at,a2 as se,a3 as pe,a4 as y,a5 as it,a6 as nt,a7 as lt,a8 as dt,a9 as fe,aa as M,ab as V,ac as P,ad as E,ae as L,af as W,ag as ct,ah as st,ai as pt,aj as ft,ak as bt,al as mt,am as gt,an as ut,ao as ht,ap as xt,aq as qt,ar as A,as as _t,at as wt,au as vt}from"./vendor.cace6bbc.js";const kt=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const d of n.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&a(d)}).observe(document,{childList:!0,subtree:!0});function r(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerpolicy&&(n.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?n.credentials="include":o.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(o){if(o.ep)return;o.ep=!0;const n=r(o);fetch(o.href,n)}};kt();const yt=.07,zt="",At=6e4,St=3e5,Tt=3e4,Pt=18e5,re="",Oo="xSOL",jo="",Go="",Uo="",Bo="",Do="xxx",Wo="Powered by mFactory GmbH",Yo="https://mfactory.tech/",Mo='{ "Documentation":"https://docs.jpool.one/","Terms of Service":"/terms","Legal Disclosure":"/impressum","Privacy":"/privacy","Pool Info":"/pool-info" }',O="CtMyWsrUtAwXWiGr9WjHT5fC3p3fgV8cyGpLTo2LJzG1",j="1500000",Et="AeuEVJrnL5SwftWzchEfqMkKXPxLcZjrFtShdAZ7FwKy",Ct="1500000",Rt="vU5rGXWuLTqFbxtz89TXEbJ59wYHJiLHNmtbXdSB7UF",be=[{id:"genesys-mainnet",name:"Genesys RPC",cluster:"mainnet-beta",url:"https://ssc-dao.genesysgo.net/",stakePoolAddress:O,stakeLimit:Number(j)},{id:"serum-mainnet",name:"Serum RPC",cluster:"mainnet-beta",url:"https://solana-api.projectserum.com/",stakePoolAddress:O,stakeLimit:Number(j)},{id:"rpcpool-mainnet",name:"RPCPool RPC",cluster:"mainnet-beta",url:"https://mainnet.rpcpool.com/",stakePoolAddress:O,stakeLimit:Number(j)},{id:"mainnet",name:"Solana RPC",cluster:"mainnet-beta",url:qe("mainnet-beta"),stakePoolAddress:O,stakeLimit:Number(j)},{id:"testnet",name:"TestNet",cluster:"testnet",url:"https://testnet.rpcpool.com/",stakePoolAddress:Et,stakeLimit:Number(Ct)},{id:"devnet",name:"DevNet",cluster:"devnet",url:"https://devnet.rpcpool.com/",stakePoolAddress:Rt,stakeLimit:1e5}],Lt=be[0],me="confirmed",Vo="processed",Ho=15e3,Nt=12e4,Ko={}.VITE_TELEGRAM_ANNOUNCEMENT_URL,ae={}.VITE_GTAG_ID,Ft=({app:e})=>{ae&&e.use(_e,{config:{id:ae}})};var It=Object.freeze(Object.defineProperty({__proto__:null,install:Ft},Symbol.toStringTag,{value:"Module"}));const Ot=({app:e})=>{const t=we();e.use(t)};var jt=Object.freeze(Object.defineProperty({__proto__:null,install:Ot},Symbol.toStringTag,{value:"Module"}));const Gt=({app:e})=>{e.use(ve,{plugins:{Dark:ke,Notify:ye,LocalStorage:ze},iconSet:Ae})};var Ut=Object.freeze(Object.defineProperty({__proto__:null,install:Gt},Symbol.toStringTag,{value:"Module"}));const Bt=({app:e})=>{e.use(Se,{wallets:[new Te,new Pe,new Ee,new Ce,new Re,new Le,new Ne,new Fe,new Ie,new Oe,new je,new Ge,new Ue,new Be,new De,new We,new Ye,new Me],autoConnect:!1})};var Dt=Object.freeze(Object.defineProperty({__proto__:null,install:Bt},Symbol.toStringTag,{value:"Module"})),Wt="/reference-pool/assets/logo.d39b3616.svg";const $o=S("apy",()=>{var s;const e=bo(),t=lo(),r=H("apy",{beginTimestamp:0,collectionTimestamp:0,endTimestamp:0,firstEpoch:0,isEstimated:!1,lastEpoch:0,validators:[]}),a=b(),o=b(!((s=r.value)!=null&&s.lastEpoch)),n=v(()=>e.voteIds),d=v(()=>t.epochInfo);z([d,n],async([f,u])=>{var p,m;if(!(!(f!=null&&f.epoch)||u.length===0)){if(((p=r.value)==null?void 0:p.lastEpoch)===f.epoch){console.log("[APY] Skip loading..."),o.value=!1;return}console.log("[APY] Loading apy info..."),o.value=!0;try{const i=await Yt("prev10");r.value={...i,validators:(m=i==null?void 0:i.validators.filter(c=>u.includes(c.vote)))!=null?m:[]}}finally{o.value=!1}}});const l=v(()=>{var p,m;const f=(m=(p=r.value)==null?void 0:p.validators)!=null?m:[];return f.length===0?yt:a.value?a.value:f.reduce((i,c)=>i+c.apy,0)/f.length});return{apyInfo:r,apyLoading:o,apy:l}});async function Yt(e="prev3"){return(await Ve.get(`https://stakeview.app/apy/${e}.json`)).data}const ge=S("auth",()=>{const e=H("password",null),t=v(()=>e.value===String(re));return{isEnabled:v(()=>!!re),isAuthenticated:t,password:e,login:a=>(e.value=a,t.value)}});function Mt(e){return new Promise(t=>setTimeout(t,e))}async function Xo(e,t,r,a){if(!(t!=null&&t.publicKey))throw new Error("Wallet is not connected");let o=new ne({feePayer:t.publicKey});o.add(...r),o.recentBlockhash=(await e.getRecentBlockhash("finalized")).blockhash,a.length>0&&o.partialSign(...a),o=await t.signTransaction(o);const n=o.serialize(),d=await e.sendRawTransaction(n,{skipPreflight:!0,preflightCommitment:me});return console.log("TX(signature): ",d.toString()),console.log("TX(base64): ",n.toString("base64")),d}const Qo=async(e,t,r,a,{commitment:o="singleGossip",maxRetries:n=3,onSuccess:d,onError:l,stopOnError:s,blockhash:f}={})=>{var c,h;if(!t.publicKey)throw new He;const u=[];f||(f=(await e.getRecentBlockhash(o)).blockhash);for(let _=0;_<r.length;_++){const w=(c=r[_])!=null?c:[];if(w.length===0)continue;const q=new ne({feePayer:t.publicKey});q.add(...w),q.recentBlockhash=f;const k=(h=a[_])!=null?h:[];k.length>0&&q.partialSign(...k),u.push(q)}const p=await t.signAllTransactions(u),m=[];let i=0;for(const _ of p){const w=_.serialize(),q=e.sendRawTransaction(w,{skipPreflight:!0,maxRetries:n});try{const k=await q;console.log(`TX(#${i}) Signature:`,k),console.log(`TX(#${i}) Base64: `,w.toString("base64")),d&&await d(k,i)}catch(k){if(console.log(`TX(#${i}) Error:`,k),console.log(`TX(#${i}) Base64: `,w.toString("base64")),l&&await l(k,i),s)return await Promise.all(m)}m.push(q),i++}return await Promise.all(m)},R=localStorage;class Vt{setToken(t){R.setItem("auth-token",t),R.setItem("last-set",String(new Date().valueOf()))}getTimeSinceLastSet(){return R.getItem("last-set")?new Date().valueOf()-Number(R.getItem("last-set")):null}getToken(){return R.getItem("auth-token")}}function Ht({tokenStorage:e=new Vt,tokenExpiry:t=5*60*1e3,getToken:r}){return(a,o,n)=>{(async()=>{try{const d=e.getToken(),l=e.getTimeSinceLastSet();d&&d!=="undefined"&&l&&l<t||e.setToken(await r())}catch(d){console.error(d)}n(a,{...o||{},headers:{...(o||{}).headers,Authorization:`Bearer ${e.getToken()}`}})})()}}function ue(e){if(typeof e=="number")return Math.abs(e)/le;let t=1;e.isNeg()&&(t=-1);const a=e.abs().toString(10).padStart(10,"0"),o=a.length-9,n=`${a.slice(0,o)}.${a.slice(o)}`;return t*parseFloat(n)}function Zo(e){return isNaN(e)?Number(0):Number(e*le)}const Jo=new Intl.NumberFormat("en-US",{style:"decimal",minimumFractionDigits:2,maximumFractionDigits:2}),er=new Intl.NumberFormat("en-US",{style:"decimal",minimumFractionDigits:2,maximumFractionDigits:5}),tr=new Intl.NumberFormat("en-US",{style:"percent",minimumFractionDigits:2,maximumFractionDigits:2}),Kt=["","K","M","G","T","P","E"],$t=(e,t,r=!1)=>{const a=Math.log10(e)/3|0;let o=e;const n=Kt[a];if(a>0){const l=10**(a*3);o=e/l}return isNaN(o)?"":(r?Number(o.toFixed(t)):o.toFixed(t))+(typeof n=="string"?n:"")},or=(e,t=5,r=!0)=>r?$t(e,t):e.toFixed(t);function rr(e){if(typeof e=="undefined"||e===null||e==="")return"";e=e.toString();const t=e.lastIndexOf(".");let r=t>=0?e.slice(0,t):e,a=t>=0?e.slice(t+1):null;a?(a=a.slice(0,2).replace(/[^0-9]+/g,""),a.length===1&&(a+="0")):a||(a="00"),r=r.replace(/[^0-9]+/g,""),r||(r="0");let o="";for(let n=0;n<r.length;n++)n!==0&&n%3===0?o=`${r[r.length-n-1]},${o}`:o=r[r.length-n-1]+o;return o+=`.${a}`,o}function he(e,t=4){return`${e.slice(0,t)}...${e.slice(-t)}`}async function Xt(e,t){return await e.getParsedProgramAccounts(K.programId,{filters:[{memcmp:{offset:44,bytes:t.toBase58()}}]})}function Qt(e){return Ke([G({jsonrpc:te("2.0"),id:U(),result:e}),G({jsonrpc:te("2.0"),id:U(),error:G({code:de(),message:U(),data:$e(ce())})})])}Qt(de());G({executable:Xe(),owner:U(),lamports:oe(),data:ce(),rentEpoch:Qe(oe())});async function Zt(e,t){const[r,a]=await B.findProgramAddress(e,t);return{publicKey:r,nonce:a}}async function Jt(e,t){const{publicKey:r}=await Zt([e.toBuffer(),Ze.toBuffer(),t.toBuffer()],Je);return r}async function eo(e,t,r){return await e.getParsedProgramAccounts(t,{commitment:e.commitment,filters:r})}const to=et();function D(){return to}const oo=Symbol("WALLET_CONNECT_EVENT"),xe=Symbol("WALLET_DISCONNECT_EVENT"),X=Symbol("ACCOUNT_CHANGE_EVENT"),Y=5e3;function ro(){const{connection:e}=C(),{emit:t}=D(),{notify:r}=tt(),{wallet:a}=$();z(a,o=>{if(!o)return;const n=()=>{const s=o.publicKey;e.onAccountChange(s,f=>{t(X,f)}),e.onLogs(s,f=>{console.log(f)}),r({message:"Wallet update",caption:`Connected to wallet ${he(s.toBase58(),7)}`,timeout:Y}),t(oo,o)},d=()=>{r({message:"Wallet update",caption:"Disconnected from wallet",timeout:Y}),t(xe,o)},l=s=>{!(s!=null&&s.message)||r({type:"negative",message:"Wallet update",caption:s.message,timeout:Y})};o.once("connect",n),o.once("disconnect",d),o.removeAllListeners("error"),o.on("error",l)},{immediate:!0})}const ao=300,ar=S("balance",()=>{const e=C(),t=po(),{publicKey:r}=$(),a=D(),o=b(0),n=b(!1),d=b(!1),l=b(0),s=v(()=>t.stakePool),f=v(()=>ue(o.value));async function u(){var c,h;if(!r.value||!((c=s.value)!=null&&c.poolMint))return;d.value=!0;const i=await io(e.connection,r.value,(h=s.value)==null?void 0:h.poolMint);n.value=i!==null,l.value=i!=null?i:0,d.value=!1,console.log("[Balance] JSOL:",l.value)}const p=ot(async i=>{var c;o.value=(c=i==null?void 0:i.lamports)!=null?c:0,console.log("[Balance] SOL:",o.value),u().then()},ao),m=()=>{d.value=!1,o.value=0,l.value=0};return a.on(X,p),a.on(xe,m),z(r,i=>{i&&e.connection.getAccountInfo(i).then(p)},{immediate:!0}),{solBalance:f,nativeBalance:o,hasTokenAccount:n,tokenBalanceLoading:d,tokenBalance:l}});async function io(e,t,r){try{const a=await Jt(t,r);return(await e.getTokenAccountBalance(a)).value.uiAmount}catch{return null}}const C=S({id:"connection",state:()=>({commitment:me,confirmTransactionInitialTimeout:Nt,rpc:rt("rpc","")}),getters:{endpoint(e){var t;return(t=be.find(r=>r.id===e.rpc))!=null?t:Lt},connection(e){return new at(this.endpoint.url,{confirmTransactionInitialTimeout:e.confirmTransactionInitialTimeout,commitment:e.commitment,fetchMiddleware:this.endpoint.getToken?Ht({tokenExpiry:5*60*1e3,getToken:this.endpoint.getToken}):void 0})},stakePoolAddress(){return this.endpoint?new B(this.endpoint.stakePoolAddress):null},stakeLimit(){var e;return(e=this.endpoint.stakeLimit)!=null?e:0},cluster(){return this.endpoint.cluster}},actions:{setRpc(e){this.rpc=e},setCommitment(e){this.commitment=e}}}),no=Symbol("EPOCH_UPDATE_EVENT"),lo=S("epoch",()=>{const e=D(),t=C(),r=se(t,"stakePoolAddress"),a=b(),o=b(0),n=b(0),d=b(550),l=b(0),s=v(()=>a.value?(100*a.value.slotIndex/a.value.slotsInEpoch).toFixed(1):100),f=()=>t.connection.getEpochInfo().then(p=>a.value=p),u=()=>co(t.connection).then(p=>d.value=p);return z(r,()=>{Promise.all([f(),u()]).then()},{immediate:!0}),z(a,p=>{o.value=p?(p.slotsInEpoch-p.slotIndex)*d.value:0,l.value=p?p.slotsInEpoch*d.value:0,p&&p.epoch!==n.value&&(n.value=p.epoch)}),setInterval(async()=>{await Promise.all([f(),u()]),e.emit(no,a.value),console.log("Reload epoch info",a.value)},At),setInterval(async()=>{const p=o.value-1e3;o.value=Math.max(p,0)},1e3),{epochInfo:a,epochNumber:n,epochTimeRemaining:o,epochProgress:s,epochTimeTotal:l,reload:()=>f()}});async function co(e){var d;const a=((d=(await e._rpcRequest("getRecentPerformanceSamples",[60])).result)!=null?d:[]).filter(l=>l.numSlots!==0).map(l=>l.samplePeriodSecs/l.numSlots),o=a.length<60?a.length:60,n=a.reduce((l,s)=>l+s,0)/o;return Math.round(1e3*n)}async function so(e="solana",t="usd"){return new Promise((r,a)=>{fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${t}&ids=${e}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`).then(o=>o.json()).then(o=>{o.length>0?r(o[0]):a(Error("Promise rejected"))},o=>{console.error(o)})})}const ir=S("coin-rate",()=>{const e=H("sol-price",200),t=b(0),r=b(0),a=b(0),o=b(!1);async function n(){o.value=!0;const d=await so();e.value=d.current_price,t.value=d.total_volume,r.value=d.price_change_24h,a.value=d.price_change_percentage_24h_in_currency,o.value=!1,console.log("[CoinRate]",d)}return pe(n,St,{immediateCallback:!0}),{solPrice:e,solVol24:t,solChange24:r,solChangePercentage24:a,loading:o,load:n}}),nr=S("stake-accounts",()=>{const e=C(),{publicKey:t}=$(),r=b([]),a=b(!1),o=b(!1),n=b();function d(m){r.value=r.value.filter(i=>i.pubkey.toBase58()!==m)}async function l({delay:m}={}){if(a.value||!t.value){console.log("[Stake accounts] Skip loading...");return}a.value=!0,console.log("[Stake accounts] Loading...");const i=[{memcmp:{offset:12,bytes:t.value.toBase58()}},{dataSize:200}];m&&await Mt(m);try{r.value=await eo(e.connection,K.programId,i),console.log("[Stake accounts] Data:",r.value)}catch(c){console.log("[Stake accounts] Error:",c.message)}finally{a.value=!1}}z(t,()=>{l()},{immediate:!0}),z(o,m=>{m||(n.value=null)});const s=m=>{const i=m.reduce((c,h)=>(c+=h.account.lamports,c),0);return ue(i)};function f(m){return r.value.filter(i=>{var c,h,_,w,q;return((q=(w=(_=(h=(c=i.account.data)==null?void 0:c.parsed)==null?void 0:h.info)==null?void 0:_.stake)==null?void 0:w.delegation)==null?void 0:q.voter)===m})}const u=v(()=>s(r.value)),p=m=>v(()=>s(f(m)));return{loading:a,dialog:o,voter:n,stakeSolBalance:u,data:v(()=>n.value?f(n.value):r.value),voterStake:p,removeAccount:d,load:l}}),po=S("stake-pool",()=>{const e=C(),t=D(),r=b(),a=b(0),o=b(0),n=b(5e3),d=b(1),l=b({fee:0,feeNext:0,stakeDepositFee:0,solDepositFee:0,withdrawalFee:0,solWithdrawalFee:0,nextStakeWithdrawalFee:0,nextSolWithdrawalFee:0,nextEpochFee:0,solReferralFee:0,stakeReferralFee:0}),s=se(e,"stakePoolAddress"),f=v(()=>!r.value);async function u(){var h;if(!r.value)return;const i=r.value.reserveStake.toBase58();console.log("Loading reserve stake balance from",i);const c=await e.connection.getAccountInfo(r.value.reserveStake);o.value=(h=c==null?void 0:c.lamports)!=null?h:0,console.log("Reserve Stake Balance:",o.value)}async function p(){var i;if(!s.value){r.value=void 0;return}try{console.log("[StakePool] Load:",(i=s.value)==null?void 0:i.toBase58());const c=await it(e.connection,s.value);r.value=c==null?void 0:c.account.data,console.log("[StakePool] Result:",r.value),await u()}catch(c){console.error("[StakePool] Error:",c),r.value=void 0}}async function m(){a.value=await e.connection.getMinimumBalanceForRentExemption(K.space)}return t.on(X,p),pe(p,Tt),z(s,()=>Promise.all([p(),m()]),{immediate:!0}),z(r,async i=>{var c,h,_,w,q;if(!i){d.value=1,l.value.fee=0,l.value.feeNext=0,l.value.stakeDepositFee=0,l.value.solDepositFee=0,l.value.withdrawalFee=0,l.value.solWithdrawalFee=0,l.value.nextStakeWithdrawalFee=0,l.value.nextSolWithdrawalFee=0,l.value.nextEpochFee=0,l.value.solReferralFee=0,l.value.stakeReferralFee=0;return}i.poolTokenSupply.isZero()||i.totalLamports.isZero()?d.value=1:d.value=y(i.poolTokenSupply,i.totalLamports),console.log("TotalStakeLamports:",i.totalLamports.toNumber()),console.log("PoolTokenSupply:",i.poolTokenSupply.toNumber()),console.log("ExchangeRate:",d.value),l.value.fee=y(i.epochFee.numerator,i.epochFee.denominator),l.value.stakeDepositFee=y(i.stakeDepositFee.numerator,i.stakeDepositFee.denominator),l.value.withdrawalFee=y(i.stakeWithdrawalFee.numerator,i.stakeWithdrawalFee.denominator),l.value.solWithdrawalFee=y(i.solWithdrawalFee.numerator,i.solWithdrawalFee.denominator),l.value.solDepositFee=y(i.solDepositFee.numerator,i.solDepositFee.denominator),(c=i.nextEpochFee)!=null&&c.numerator&&(l.value.nextEpochFee=y(i.nextEpochFee.numerator,i.nextEpochFee.denominator)),(h=i.nextStakeWithdrawalFee)!=null&&h.numerator&&(l.value.nextStakeWithdrawalFee=y(i.nextStakeWithdrawalFee.numerator,i.nextStakeWithdrawalFee.denominator)),(_=i.nextSolWithdrawalFee)!=null&&_.numerator&&(l.value.nextSolWithdrawalFee=y(i.nextSolWithdrawalFee.numerator,i.nextSolWithdrawalFee.denominator)),i.nextEpochFee&&(l.value.feeNext=y(i.nextEpochFee.numerator,i.nextEpochFee.denominator)),l.value.solReferralFee=(w=i.solReferralFee)!=null?w:0,l.value.stakeReferralFee=(q=i.stakeReferralFee)!=null?q:0}),{stakePool:r,exchangeRate:d,minRentBalance:a,reserveStakeBalance:o,lamportsPerSignature:n,stakePoolAddress:s,connectionLost:f,fees:l,loadReserveStake:u}}),fo=new B("Config1111111111111111111111111111111111111"),bo=S("validators",()=>{const e=C(),t=b(!1),r=b([]),a=b([]),o=async(d=!1)=>{var h,_,w,q,k,Q,Z,J;if(t.value&&!d)return;t.value=!0,console.log("[Validators] Loading stake accounts...");const l=await mo(e.connection,e.stakePoolAddress);console.log("[Validators] StakeAccounts"),console.log(l.map(x=>x.pubkey.toBase58()).join(`
`));const s=(h=l.reduce((x,g)=>{var N,F,I,ee;const T=(ee=(I=(F=(N=g.account.data.parsed)==null?void 0:N.info)==null?void 0:F.stake)==null?void 0:I.delegation)==null?void 0:ee.voter;return T&&(x[T]||(x[T]=0),x[T]+=g.account.lamports),x},{}))!=null?h:{};a.value=Object.keys(s),console.log("[Validators] Vote ids",a.value);const[f,u]=await Promise.all([e.connection.getVoteAccounts(),go(e.connection)]),p=f.delinquent.filter(x=>a.value.includes(x.votePubkey)),m=f.current.filter(x=>a.value.includes(x.votePubkey)),i=[...p,...m];console.log("[Validators] voteAccountInfos:",i.length),console.log("[Validators] validatorInfos:",u.length);const c=[];for(const x of i){const g=u.find(I=>I.key.equals(new B(x.nodePubkey))),T=x.nodePubkey,N=(_=s[x.votePubkey])!=null?_:0,F=e.cluster.replace("-beta","");c.push({id:T,voter:x.votePubkey,name:(q=(w=g==null?void 0:g.info)==null?void 0:w.name)!=null?q:he(T),details:(k=g==null?void 0:g.info)==null?void 0:k.details,website:(Q=g==null?void 0:g.info)==null?void 0:Q.website,keybaseUsername:(Z=g==null?void 0:g.info)==null?void 0:Z.keybaseUsername,image:(J=g==null?void 0:g.info)!=null&&J.keybaseUsername?`https://keybase.io/${g.info.keybaseUsername}/picture`:void 0,url:`https://www.validators.app/validators/${F}/${T}`,lamports:N})}r.value=c.sort((x,g)=>x.name.localeCompare(g.name)).sort((x,g)=>g.lamports-x.lamports),t.value=!1},n=v(()=>e.cluster);return z(n,()=>{o(!0)},{immediate:!0}),setInterval(()=>{o()},Pt),{loading:t,data:r,voteIds:a,load:o,clear:()=>r.value=[]}});async function mo(e,t){const r=await nt(lt,t);return(await Xt(e,r)).sort((o,n)=>n.account.lamports-o.account.lamports)}async function go(e){return(await e.getProgramAccounts(fo)).flatMap(r=>{const a=dt.fromConfigData(r.account.data);return a?[a]:[]})}const uo="_input_wwixo_83",ho="_layout_wwixo_90",xo="_logo_wwixo_94";var qo={input:uo,layout:ho,logo:xo},_o=(e,t)=>{const r=e.__vccOpts||e;for(const[a,o]of t)r[a]=o;return r};const wo={class:"column"},vo={class:"row justify-center"},ko=L("img",{src:Wt,alt:"",height:"132"},null,-1),yo=[ko],zo={class:"row"},Ao=ut(" GO "),So=fe({__name:"PasswordProtect",setup(e){const t=ge(),r=b(!1),a=b("");function o(){t.login(a.value)||(a.value="",r.value=!0)}return(n,d)=>(M(),V(gt,{class:W(n.$style.layout)},{default:P(()=>[E(mt,{class:"window-height window-width row justify-center items-center"},{default:P(()=>[L("div",wo,[L("div",vo,[L("div",{class:W(n.$style.logo)},yo,2)]),L("div",zo,[E(ct,{class:"q-pa-lg shadow-1"},{default:P(()=>[E(st,null,{default:P(()=>[E(pt,{class:"q-gutter-md"},{default:P(()=>[E(ft,{modelValue:a.value,"onUpdate:modelValue":d[0]||(d[0]=l=>a.value=l),class:W(n.$style.input),error:r.value,placeholder:"Secret Code",type:"password",outlined:""},{append:P(()=>[E(bt,{flat:"",rounded:"",onClick:o},{default:P(()=>[Ao]),_:1})]),_:1},8,["modelValue","class","error"])]),_:1})]),_:1})]),_:1})])])]),_:1})]),_:1},8,["class"]))}}),To={$style:qo};var Po=_o(So,[["__cssModules",To]]);const Eo=fe({__name:"App",setup(e){ht(()=>{ro()});const t=ge(),r=v(()=>t.isEnabled&&!t.isAuthenticated);return(a,o)=>{const n=Po,d=xt("router-view");return qt(r)?(M(),V(n,{key:0})):(M(),V(d,{key:1}))}}}),ie={"../pages/404.vue":()=>A(()=>import("./404.e7a79b0e.js"),["assets/404.e7a79b0e.js","assets/ErrorContainer.cefccb7a.js","assets/ErrorContainer.4c438dd9.css","assets/vendor.cace6bbc.js"]),"../pages/500.vue":()=>A(()=>import("./500.68250ddb.js"),["assets/500.68250ddb.js","assets/ErrorContainer.cefccb7a.js","assets/ErrorContainer.4c438dd9.css","assets/vendor.cace6bbc.js"]),"../pages/home.vue":()=>A(()=>import("./home.0f2ca01d.js"),["assets/home.0f2ca01d.js","assets/home.dc15a23b.css","assets/vendor.cace6bbc.js","assets/StackedAndLiquidity.39e38790.js","assets/StackedAndLiquidity.9cd688d7.css","assets/CopyToClipboard.3240c4ec.js"]),"../pages/impressum.vue":()=>A(()=>import("./impressum.045cf0af.js"),["assets/impressum.045cf0af.js","assets/vendor.cace6bbc.js"]),"../pages/pool-info.vue":()=>A(()=>import("./pool-info.35b1f138.js"),["assets/pool-info.35b1f138.js","assets/CopyToClipboard.3240c4ec.js","assets/vendor.cace6bbc.js"]),"../pages/privacy.vue":()=>A(()=>import("./privacy.913b7f79.js"),["assets/privacy.913b7f79.js","assets/vendor.cace6bbc.js"]),"../pages/terms.vue":()=>A(()=>import("./terms.c4c173d3.js"),["assets/terms.c4c173d3.js","assets/vendor.cace6bbc.js"])};function Co(e=""){return Object.keys(ie).map(t=>{const r=t.match(/\.\/pages\/(.*)\.vue$/);let a="";return r&&r[1]&&(a=r[1].toLowerCase()),{path:["home","index"].includes(a)?e:e+a,component:ie[t]}}).filter(t=>!t.path.startsWith("/_"))}var Ro=[{path:"",component:()=>A(()=>import("./default.2459b49c.js"),["assets/default.2459b49c.js","assets/default.890d43da.css","assets/vendor.cace6bbc.js","assets/StackedAndLiquidity.39e38790.js","assets/StackedAndLiquidity.9cd688d7.css","assets/CopyToClipboard.3240c4ec.js"]),children:Co()},{path:"/:catchAll(.*)*",component:()=>A(()=>import("./404.e7a79b0e.js"),["assets/404.e7a79b0e.js","assets/ErrorContainer.cefccb7a.js","assets/ErrorContainer.4c438dd9.css","assets/vendor.cace6bbc.js"]),children:[]}];const Lo=_t({history:wt("/reference-pool/"),scrollBehavior:()=>({left:0,top:0}),strict:!0,routes:Ro});function No(e){e.use(Lo)}async function Fo(){const e=vt(Eo);Object.values({"./plugins/gtag.ts":It,"./plugins/pinia.ts":jt,"./plugins/quasar.ts":Ut,"./plugins/wallet.ts":Dt}).forEach(t=>{var r;return(r=t.install)==null?void 0:r.call(t,{app:e})}),No(e),e.mount("#app")}Fo().then();export{jo as A,Do as C,Vo as D,be as E,Mo as F,Uo as N,Wo as P,Ko as T,Oo as X,_o as _,Ho as a,Nt as b,Zo as c,po as d,ar as e,or as f,Qo as g,nr as h,lo as i,Yt as j,Go as k,ue as l,$o as m,tr as n,he as o,ir as p,er as q,rr as r,Xo as s,Jo as t,C as u,Bo as v,Yo as w};
