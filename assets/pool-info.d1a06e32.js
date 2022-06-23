import{bJ as d,G as i,bK as f,bL as c,bM as h,bO as e,c3 as s,bU as p,bW as o}from"./vendor.48da25e5.js";import{_ as u,d as _,n as m}from"./index.018bffbd.js";const b=d({setup(){const t=_(),a=i(()=>t.stakePoolAddress),l=i(()=>t.fees);return{stakePoolAddress:a,fees:l,formatPct(n){return m.format(n)}}}}),w={class:"container q-pb-xl"},P=e("div",{class:"page-title"}," Stake Pool Info ",-1),k={class:"container q-pb-xl"},F=o(" Stake Pool: "),S=e("br",null,null,-1),W=e("br",null,null,-1),D=o(" Epoch Fee: "),g=o(" of epoch rewards "),v=o(" Epoch Fee, starting next epoch: "),B=o(" of epoch rewards "),I=o(" Withdrawal: "),R=o(" of withdrawal amount "),$=o(" Withdrawal, starting next epoch: "),A=o(" of withdrawal amount "),L=o(" Instant Withdrawal: "),N=o(" of withdrawal amount "),O=o(" Instant Withdrawal, starting next epoch: "),q=o(" of withdrawal amount "),C=o(" Stake Deposit Fee: "),E=o(" SOL Deposit Fee: "),V=o(" of deposit amount "),y=o(" SOL Deposit Referral Fee: "),G=o(" Stake Deposit Referral Fee: ");function J(t,a,l,n,K,M){return f(),c(p,null,{default:h(()=>{var r;return[e("div",w,[P,e("div",k,[F,e("b",null,s((r=t.stakePoolAddress)==null?void 0:r.toBase58()),1),S,W,e("p",null,[D,e("b",null,s(t.formatPct(t.fees.fee)),1),g]),e("p",null,[v,e("b",null,s(t.formatPct(t.fees.feeNext)),1),B]),e("p",null,[I,e("b",null,s(t.formatPct(t.fees.withdrawalFee)),1),R]),e("p",null,[$,e("b",null,s(t.formatPct(t.fees.nextStakeWithdrawalFee)),1),A]),e("p",null,[L,e("b",null,s(t.formatPct(t.fees.solWithdrawalFee)),1),N]),e("p",null,[O,e("b",null,s(t.formatPct(t.fees.nextSolWithdrawalFee)),1),q]),e("p",null,[C,e("b",null,s(t.formatPct(t.fees.stakeDepositFee)),1)]),e("p",null,[E,e("b",null,s(t.formatPct(t.fees.solDepositFee)),1),V]),e("p",null,[y,e("b",null,s(t.formatPct(t.fees.solReferralFee)),1)]),e("p",null,[G,e("b",null,s(t.formatPct(t.fees.stakeReferralFee)),1)])])])]}),_:1})}var U=u(b,[["render",J]]);export{U as default};
