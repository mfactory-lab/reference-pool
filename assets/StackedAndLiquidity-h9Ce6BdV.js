import{_ as H,u as V,k as Q,n as W,q as j}from"./stake-pool-wE_3cxH_.js";import{m as T,a8 as F,U as m,Z as U,R as v,af as G,aJ as J,b8 as I,_ as P,o as f,i as y,h as C,as as i,q as k,t as _,a7 as R,aB as g,j as c,a5 as r,aC as L,ax as S,aL as $,b9 as K,aP as Y,aQ as M,ba as Z,aO as X,aG as B,O as z,Q as O,a4 as D,W as x,bb as ee,ab as te,a1 as oe,bc as ae,bd as se,u as b,be as ne,ay as le}from"./index-z80tX5ck.js";const re="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2035%2035'%3e%3cpath%20fill='%23555555'%20d='M29.327%200h-16v21.583h21.6v-16c-.001-1.483-.591-2.906-1.642-3.953A5.59%205.59%200%200%200%2029.327%200zM8.342%200H5.585a5.58%205.58%200%200%200-3.949%201.636A5.59%205.59%200%200%200%200%205.585v2.757h8.342zM0%2013.329h8.342v8.342H0zm26.658%2021.6h2.757c1.484%200%202.907-.59%203.955-1.641s1.634-2.475%201.63-3.959v-2.671h-8.342zm-13.329-8.271h8.342V35h-8.342zM0%2026.658v2.757a5.58%205.58%200%200%200%201.636%203.949A5.59%205.59%200%200%200%205.585%2035h2.757v-8.342z'/%3e%3c/svg%3e",ce="/reference-pool/assets/mathwallet-Bg7nMMpT.svg",N={solflare:10,phantom:20,sollet:5,blocto:4};function E(e){return[I.Installed,I.Loadable].includes(e.readyState)}const ie=T({setup(){const{wallets:e,select:t,publicKey:u,connected:o,disconnect:s,connect:d}=F(),a=m(()=>{var l;return((l=u.value)==null?void 0:l.toBase58())??""}),n=m(()=>U(a.value)),p=v(!1),{dark:h}=G(),w={ledger:re,mathwallet:ce};return{walletAddress:a,walletShortAddress:n,dialog:p,connected:o,dark:h,wallets:m(()=>[...e.value].map(l=>(l.adapter.darkIcon=w[l.adapter.name.toLowerCase()],l)).sort((l,A)=>{const q=N[l.adapter.name.toLowerCase()]??1;return(N[A.adapter.name.toLowerCase()]??1)-q+((E(A)?1:0)-(E(l)?1:0))})),icons:{close:J},isActiveWallet:E,async select(l){t(l.adapter.name),p.value=!1,await d()},connect(){p.value=!0},disconnect(){s(),p.value=!1},ok(){p.value=!1}}}}),de="_btn_1qt74_83",ue={btn:de},pe={class:"q-gutter-md row justify-between"},_e={class:"col-12 col-md-6"},me={class:"text-light-gray text-caption full-width text-no-wrap",style:{"text-overflow":"ellipsis",overflow:"hidden"}},ve=["src"];function he(e,t,u,o,s,d){const a=H;return f(),y(B,null,[e.connected?(f(),C(g,{key:0,class:R(["app-header__wallet-btn",e.$style.btn]),color:"primary","text-color":"primary-gray",rounded:"",unelevated:"",onClick:t[0]||(t[0]=n=>e.dialog=!0)},{default:i(()=>[k(_(e.walletShortAddress),1)]),_:1},8,["class"])):(f(),C(g,{key:1,class:R(["app-header__wallet-btn",e.$style.btn]),color:"primary","text-color":"primary-gray",rounded:"",onClick:e.connect},{default:i(()=>t[2]||(t[2]=[c("div",{class:"row items-center no-wrap"},[c("span",null,"CONNECT WALLET")],-1)])),_:1},8,["class","onClick"])),r(X,{modelValue:e.dialog,"onUpdate:modelValue":t[1]||(t[1]=n=>e.dialog=n),"transition-duration":"150","transition-show":"fade","transition-hide":"fade"},{default:i(()=>[e.connected?(f(),C(L,{key:0},{default:i(()=>[r(S,{class:"relative-position"},{default:i(()=>[t[3]||(t[3]=c("div",{class:"text-h6 text-center"}," Your wallet ",-1)),r(g,{padding:"md",color:"transparent","text-color":"primary-gray",unelevated:"",class:"absolute-right",icon:e.icons.close,size:"md",onClick:e.ok},null,8,["icon","onClick"])]),_:1}),r($),r(S,null,{default:i(()=>[r(a,{text:e.walletAddress},null,8,["text"]),k(" "+_(e.walletAddress),1)]),_:1}),r($),r(S,null,{default:i(()=>[c("div",pe,[r(g,{outline:"",rounded:"",onClick:e.disconnect},{default:i(()=>t[4]||(t[4]=[k(" Disconnect ")])),_:1},8,["onClick"]),r(g,{outline:"",rounded:"",onClick:e.ok},{default:i(()=>t[5]||(t[5]=[k(" Ok ")])),_:1},8,["onClick"])])]),_:1})]),_:1})):(f(),C(L,{key:1,class:"wallet-connect-card"},{default:i(()=>[r(S,null,{default:i(()=>[t[6]||(t[6]=c("div",{class:"text-h6"}," Connect to a wallet ",-1)),r(g,{padding:"md",color:"transparent","text-color":"primary-gray",unelevated:"",class:"absolute-right",icon:e.icons.close,size:"md",onClick:e.ok},null,8,["icon","onClick"])]),_:1}),r($),r(S,null,{default:i(()=>[r(K,{grid:"",rows:e.wallets,"row-key":"name","hide-pagination":"","hide-header":"","rows-per-page-options":[20]},{item:i(({row:n})=>[c("div",_e,[r(Y,{clickable:"",disable:!e.isActiveWallet(n),onClick:p=>e.select(n)},{default:i(()=>[r(M,null,{default:i(()=>[c("b",null,_(n.adapter.name),1),c("div",me,_(n.adapter.url),1)]),_:2},1024),r(M,{avatar:""},{default:i(()=>[r(Z,{square:""},{default:i(()=>[c("img",{src:e.dark.isActive?n.adapter.icon:n.adapter.darkIcon??n.adapter.icon,alt:""},null,8,ve)]),_:2},1024)]),_:2},1024)]),_:2},1032,["disable","onClick"])])]),_:1},8,["rows"])]),_:1})]),_:1}))]),_:1},8,["modelValue"])],64)}const fe={$style:ue},qe=P(ie,[["render",he],["__cssModules",fe],["__scopeId","data-v-204efcb4"]]),ke=Symbol("EPOCH_UPDATE_EVENT"),ge=z("epoch",()=>{const e=te(),t=O(),u=D(t,"stakePoolAddress"),o=v(),s=v(0),d=v(0),a=v(550),n=v(0),p=m(()=>o.value?(100*o.value.slotIndex/o.value.slotsInEpoch).toFixed(1):100),h=()=>t.connection.getEpochInfo().then(l=>o.value=l),w=()=>Se(t.connection).then(l=>a.value=l);return x(u,()=>{Promise.all([h(),w()]).then()},{immediate:!0}),x(o,l=>{s.value=l?(l.slotsInEpoch-l.slotIndex)*a.value:0,n.value=l?l.slotsInEpoch*a.value:0,l&&l.epoch!==d.value&&(d.value=l.epoch)}),setInterval(async()=>{await Promise.all([h(),w()]),e.emit(ke,o.value),console.log("Reload epoch info",o.value)},ee),setInterval(async()=>{const l=s.value-1e3;s.value=Math.max(l,0)},1e3),{epochInfo:o,epochNumber:d,epochTimeRemaining:s,epochProgress:p,epochTimeTotal:n,reload:()=>h()}});async function Se(e){const o=((await e._rpcRequest("getRecentPerformanceSamples",[60])).result??[]).filter(a=>a.numSlots!==0).map(a=>a.samplePeriodSecs/a.numSlots),s=o.length<60?o.length:60,d=o.reduce((a,n)=>a+n,0)/s;return Math.round(1e3*d)}async function be(e="solana",t="usd"){return new Promise((u,o)=>{fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${t}&ids=${e}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`).then(s=>s.json()).then(s=>{s.length>0?u(s[0]):o(new Error("Promise rejected"))},s=>{console.error(s)})})}const ye=z("coin-rate",()=>{const e=oe("sol-price",200),t=v(0),u=v(0),o=v(0),s=v(!1);async function d(){s.value=!0;const a=await be();e.value=a.current_price,t.value=a.total_volume,u.value=a.price_change_24h,o.value=a.price_change_percentage_24h_in_currency,s.value=!1,console.log("[CoinRate]",a)}return ae(d,se,{immediateCallback:!0}),{solPrice:e,solVol24:t,solChange24:u,solChangePercentage24:o,loading:s,load:d}}),we={class:"epoch"},Ce={class:"epoch__label"},Pe={class:"epoch__label-number"},$e={class:"epoch__label-value"},Ee=T({__name:"Epoch",setup(e){const t=ge(),u=m(()=>t.epochNumber),o=m(()=>+t.epochProgress),s=m(()=>{const a=t.epochTimeRemaining/1e3/60/60,n=Math.floor(a),p=Math.floor((a-n)*60),h=Math.ceil(((a-n)*60-p)*60);return{h:n,m:p<10?`0${p}`:p,s:h<10?`0${h}`:h}});return(d,a)=>(f(),y("div",we,[r(ne,{"show-value":"",class:"q-mt-xs epoch__progress",value:b(o),size:"106px",thickness:.2,color:"natural-gray","track-color":"primary","center-color":"white"},{default:i(()=>[c("div",Ce,[a[1]||(a[1]=c("div",{class:"epoch__label-title"}," Epoch ",-1)),c("div",Pe,_(b(u)),1),c("div",$e,[k(_(b(s).h)+":"+_(b(s).m),1),a[0]||(a[0]=c("br",null,null,-1)),k(_(b(s).s),1)])])]),_:1},8,["value"])]))}}),He=P(Ee,[["__scopeId","data-v-6cb26444"]]),Te={setup(){const e=ye(),t=O(),u=V(),o=D(u,"stakePool"),s=m(()=>{var n;return Q(((n=o.value)==null?void 0:n.totalLamports.toNumber())??0)}),d=m(()=>s.value*e.solPrice);return{maxSolToStake:m(()=>t.stakeLimit??0),solStaked:s,usdStacked:d,formatPrice:n=>W(n,1)}}},Ae={class:"total-stacked"},Ie={class:"total-stacked__value"},Re={class:"total-stacked__sol"},Le={key:0},Me={class:"total-stacked__usd"};function xe(e,t,u,o,s,d){return f(),y("div",Ae,[t[0]||(t[0]=c("div",{class:"total-stacked__label"}," Total Staked ",-1)),c("div",Ie,[c("div",Re,[k(_(o.formatPrice(o.solStaked))+" / ",1),o.maxSolToStake?(f(),y("span",Le,_(o.formatPrice(o.maxSolToStake)),1)):le("",!0)]),c("div",Me," ≈ $"+_(o.formatPrice(o.usdStacked)),1)])])}const Ne=P(Te,[["render",xe],["__scopeId","data-v-7cc7f6ec"]]),Ve=T({setup(){const e=V();return{reserveStakeBalance:m(()=>j.format(Q(e.reserveStakeBalance)))}}}),Qe={class:"total-stacked__reserved-balance"};function Be(e,t,u,o,s,d){const a=Ne;return f(),y(B,null,[r(a),c("div",Qe,[t[0]||(t[0]=k(" Available liquidity: ")),c("b",null,_(e.reserveStakeBalance)+" SOL",1)])],64)}const We=P(Ve,[["render",Be],["__scopeId","data-v-a15b1cb9"]]);export{qe as _,ye as a,We as b,He as c,ge as u};
