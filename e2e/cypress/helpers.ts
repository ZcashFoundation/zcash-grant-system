import Web3 = require("web3");
import * as CrowdFundFactory from "../../contract/build/contracts/CrowdFundFactory.json";
import { WebsocketProvider } from "web3/providers";
import * as sigUtil from "eth-sig-util";

const WEB3_PROVIDER = `ws://localhost:8545`;

// accounts generated using `ganache -s testGrantIo`
export const testAccounts = [
  [
    "0x0a4ab0753416ce1bebef3855fd081c170ae0194f",
    "872017489e13bc3d7fec343d14691ac3c95a7904651113ce018a6ee21ae70a6e"
  ],
  [
    "0x926604d5a2383eae9d88eb4e884b1a34b3546194",
    "492e6984a9faa04e5aad31219db4db9c927ed011b2b56b3068b1ff2b34e43f00"
  ],
  [
    "0xf277b4a0b9c89c07cc331b38d87a5a382501ed1a",
    "c6aba74cc839af98def2819a85949847f80af42d11fefab4ecb713752261099a"
  ],
  [
    "0x6e6324d0927fb0aee2cbb1c915bcdc47c4f45a37",
    "c66b30565895ef84c9e1cda943d828f9a91e6a0c0624caae76a661e35c2dc722"
  ],
  [
    "0xa696d8f7cfd0136c971492d0e9312c139cb18173",
    "5f33d8df218aaf0b2bfa640d04f69aa234a1997fa08b4db606e6b022aa18cc8c"
  ],
  [
    "0xf90685b1a48259e192876744ff7829c1ba995093",
    "9d1e415439a8411e354e72acd944cae82c3c4296c5bef6ef5d848a97a94f9ea8"
  ],
  [
    "0x9a4e6001044e16c5fe1c98f1ee71ce0b0005ad9b",
    "cb9c060f86cec728b11a6d1143de09d221bc3a417ea9ac3e3b2922589c259ed5"
  ],
  [
    "0x3d03d67dbb26d13fafeebba55f5b6346213f602a",
    "68e1c39abdcc8fc7d801237eb730b8e0f3199e1841209944f8c63580749a6f61"
  ],
  [
    "0x78ae7d98a2291093a4ff9e5003de4ab0d2a82169",
    "f4c9cf60f3f91559af004f7a8de8dfebe3121a2ac418ea4f00ec34b5c841ed42"
  ],
  [
    "0x3cdbcc74770a13cba2045da4740c4c91ddd99b9e",
    "d5c02d0db53291c4074a249e983a2f117d3ebd4155d606edde51a9be7e5deee6"
  ]
];

// keep our own web3 to avoid messing with App's Provider
let e2eWeb3: Web3;
let appWeb3: Web3;
// open(method: string, url: string, async: boolean, username?: string | null, password?: string | null): void;
export const loadWeb3 = (swapAcctIndex: number) => (window: any) => {
  if (appWeb3) {
    ((appWeb3.currentProvider as WebsocketProvider)
      .connection as WebSocket).close();
  }
  if (e2eWeb3) {
    ((e2eWeb3.currentProvider as WebsocketProvider)
      .connection as WebSocket).close();
  }
  appWeb3 = new Web3(WEB3_PROVIDER);
  e2eWeb3 = new Web3(WEB3_PROVIDER);

  // modify backend proposal fields derived using server time
  modifyProposalsApi(window);

  // window.web3.provider gets passed into new Web3 by frontend
  // we will inject this for setting contract.options.gas in frontend
  // this solves gas exhaustion issues
  (appWeb3.currentProvider as any)._e2eContractGas = 5000000;

  // intercept eth_signTypedData_v3 calls and sign (ganache doesn't support yet)
  // intercept eth_accounts RPC calls and fiddle with account[0]
  const origSend = appWeb3.currentProvider.send;
  const newSend = makeSendSpy(origSend, swapAcctIndex);
  appWeb3.currentProvider.send = newSend;
  window.web3 = appWeb3;
};

// intercept and modify/replace json rpc calls
const makeSendSpy = (origSend: any, swapAcctIndex: number) => {
  return function(opts: any, cb: any) {
    let interceptedCb = cb;
    if (opts.method === "eth_signTypedData_v3") {
      const [acct, data] = opts.params;
      console.log(`e2e: eth_signTypedData_v3 signing for ${acct}`);
      const rawTypedData = JSON.parse(data);
      const signedMessage = signTypedData(acct, rawTypedData);
      interceptedCb(null, { result: signedMessage });
    } else {
      if (opts.method === "eth_accounts") {
        interceptedCb = (err: any, res: any) => {
          console.log(
            `e2e: swapping account[0] with account[${swapAcctIndex}] (${
              res.result[swapAcctIndex]
            })`
          );
          const acctZero = res.result[0];
          res.result[0] = res.result[swapAcctIndex];
          res.result[swapAcctIndex] = acctZero;
          cb(err, res);
        };
      }
      origSend.bind(appWeb3.currentProvider)(opts, interceptedCb);
    }
  };
};

// sign data using ganache determined private keys + eth-sig-util
const signTypedData = (account: string, typedData: any) => {
  const testAccount = testAccounts.find(ta => ta[0] === account.toLowerCase());
  if (testAccount) {
    const privateKey = new Buffer(testAccount[1], "hex");
    const sig = sigUtil.signTypedData(privateKey, { data: typedData });
    return sig;
  } else {
    throw new Error(
      `e2e helpers.sign: Could not find privateKey for account ${account}`
    );
  }
};

// cypress doesn't yet support modifying incoming xhr requests
// https://github.com/cypress-io/cypress/tree/full-network-stubbing-687
const modifyProposalsApi = (window: any) => {
  patchXMLHttpRequest(window, /proposals\/([0-9]+)?/, text => {
    const json = JSON.parse(text);
    const mod = (proposal: any) => {
      if (proposal.crowdFund) {
        proposal.crowdFund.milestones.forEach((ms: any) => {
          if (ms.state === "ACTIVE") {
            // ms.state based on server time, let's use browser time
            ms.state =
              (ms.payoutRequestVoteDeadline > window.Date.now() && "ACTIVE") ||
              (ms.percentAgainstPayout >= 50 && "REJECTED") ||
              "PAID";
            if (ms.state != "ACTIVE") {
              console.log(
                `e2e modifyProposalApi changed ms.state to ${ms.state}`
              );
            }
          }
          return ms;
        });
      }
      return proposal;
    };
    if (Array.isArray(json)) {
      json.forEach(mod);
    } else {
      mod(json);
    }
    return JSON.stringify(json);
  });
};

// patch the window's XMLHttpRequest with modify fn
const patchXMLHttpRequest = (
  window: any,
  urlMatch: RegExp,
  modify: (text: string) => string
) => {
  const script = window.document.createElement("script");
  script.text = xhookText;
  window.__afterxhook__ = function() {
    console.log("xhook.after declaration");
    window.xhook.after(function(request: any, response: any) {
      if (urlMatch.test(request.url)) response.text = modify(response.text);
    });
  };
  window.document.head.appendChild(script);
};

const mineBlock = () =>
  e2eWeb3.currentProvider.send(
    {
      jsonrpc: "2.0",
      method: "evm_mine",
      params: [],
      id: Date.now()
    },
    () => null
  );

const evmIncreaseTime = (seconds: number) =>
  new Promise((res, rej) => {
    e2eWeb3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [seconds],
        id: Date.now()
      },
      (err, _) => (err && rej(err)) || res()
    );
  });

export const increaseTime = (cy: Cypress.Chainable, ms: number) => {
  console.log("increasetime", ms);
  cy.log("INCREASE TIME", ms + "ms");
  cy.window({ log: false })
    .then(w => evmIncreaseTime(Math.round(ms / 1000)))
    .then(() => syncTimeWithEvm(cy));
};

export const syncTimeWithEvm = (cy: Cypress.Chainable) => {
  cy.window({ log: false })
    .then(w => {
      mineBlock();
      return e2eWeb3.eth
        .getBlock("latest")
        .then((x: any) => x.timestamp * 1000);
    })
    .then(t => {
      cy.log("SYNC TIME WITH EVM", new Date(t).toString());
      cy.clock({ log: false }).then(x => x.restore()); // important for repeated calls!
      cy.clock(t, ["Date"] as any, { log: false });
    });
};

export const createCrowdFund = (web3: Web3) => {
  const HOUR = 3600;
  const DAY = HOUR * 24;
  const ETHER = 10 ** 18;
  const NOW = Math.round(new Date().getTime() / 1000);

  return web3.eth.net.getId().then((id: number) => {
    const factoryAddy = (CrowdFundFactory as any).networks[id].address;
    const factory = new web3.eth.Contract(
      (CrowdFundFactory as any).abi,
      factoryAddy
    );

    return web3.eth.getAccounts().then((accounts: string[]) => {
      const raiseGoal = 1 * ETHER;
      const beneficiary = accounts[1];
      const trustees = [accounts[1]];
      const milestones = [raiseGoal + ""];
      const deadline = NOW + DAY * 100;
      const milestoneVotingPeriod = HOUR;
      const immediateFirstMilestonePayout = false;

      return factory.methods
        .createCrowdFund(
          raiseGoal + "",
          beneficiary,
          trustees,
          milestones,
          deadline,
          milestoneVotingPeriod,
          immediateFirstMilestonePayout
        )
        .send({
          from: accounts[4]
          // important
          // gas: 3695268
        })
        .then(
          (receipt: any) =>
            receipt.events.ContractCreated.returnValues.newAddress
        );
    });
  });
};

export const randomString = () => {
  return Math.random()
    .toString(36)
    .substring(7);
};

export const randomHex = function(len: number) {
  const maxlen = 8;
  const min = Math.pow(16, Math.min(len, maxlen) - 1);
  const max = Math.pow(16, Math.min(len, maxlen)) - 1;
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  let r = n.toString(16);
  while (r.length < len) {
    r = r + randomHex(len - maxlen);
  }
  return r;
};

// XHook - v1.4.9 - https://github.com/jpillora/xhook
// Jaime Pillora <dev@jpillora.com> - MIT Copyright 2018
const xhookText =
  '(function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H=[].indexOf||function(a){for(var b=0,c=this.length;b<c;b++)if(b in this&&this[b]===a)return b;return-1};q=null,q="undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:"undefined"!=typeof global?global:a,x=q.document,d="before",c="after",o="readyState",n="addEventListener",m="removeEventListener",h="dispatchEvent",u="XMLHttpRequest",g="fetch",i="FormData",p=["load","loadend","loadstart"],e=["progress","abort","error","timeout"],E="undefined"!=typeof navigator&&navigator.useragent?navigator.userAgent:"",A=parseInt((/msie (\\d+)/.exec(E.toLowerCase())||[])[1]),isNaN(A)&&(A=parseInt((/trident\\/.*; rv:(\\d+)/.exec(E.toLowerCase())||[])[1])),(G=Array.prototype).indexOf||(G.indexOf=function(a){var b,c,d,e;for(b=d=0,e=this.length;d<e;b=++d)if(c=this[b],c===a)return b;return-1}),D=function(a,b){return Array.prototype.slice.call(a,b)},w=function(a){return"returnValue"===a||"totalSize"===a||"position"===a},z=function(a,b){var c;for(c in a)if(a[c],!w(c))try{b[c]=a[c]}catch(a){}return b},B=function(a){return void 0===a?null:a},C=function(a,b,c){var d,e,f,g;for(e=function(a){return function(d){var e,f,g;e={};for(f in d)w(f)||(g=d[f],e[f]=g===b?c:g);return c[h](a,e)}},f=0,g=a.length;f<g;f++)d=a[f],c._has(d)&&(b["on"+d]=e(d))},y=function(a){var b;if(x&&null!=x.createEventObject)return b=x.createEventObject(),b.type=a,b;try{return new Event(a)}catch(b){return{type:a}}},f=function(a){var c,d,e;return d={},e=function(a){return d[a]||[]},c={},c[n]=function(a,c,f){d[a]=e(a),d[a].indexOf(c)>=0||(f=f===b?d[a].length:f,d[a].splice(f,0,c))},c[m]=function(a,c){var f;if(a===b)return void(d={});c===b&&(d[a]=[]),f=e(a).indexOf(c),f!==-1&&e(a).splice(f,1)},c[h]=function(){var b,d,f,g,h,i,j,k;for(b=D(arguments),d=b.shift(),a||(b[0]=z(b[0],y(d))),g=c["on"+d],g&&g.apply(c,b),k=e(d).concat(e("*")),f=i=0,j=k.length;i<j;f=++i)h=k[f],h.apply(c,b)},c._has=function(a){return!(!d[a]&&!c["on"+a])},a&&(c.listeners=function(a){return D(e(a))},c.on=c[n],c.off=c[m],c.fire=c[h],c.once=function(a,b){var d;return d=function(){return c.off(a,d),b.apply(null,arguments)},c.on(a,d)},c.destroy=function(){return d={}}),c},F=f(!0),F.EventEmitter=f,F[d]=function(a,b){if(a.length<1||a.length>2)throw"invalid hook";return F[n](d,a,b)},F[c]=function(a,b){if(a.length<2||a.length>3)throw"invalid hook";return F[n](c,a,b)},F.enable=function(){q[u]=t,"function"==typeof r&&(q[g]=r),k&&(q[i]=s)},F.disable=function(){q[u]=F[u],q[g]=F[g],k&&(q[i]=k)},v=F.headers=function(a,b){var c,d,e,f,g,h,i,j,k;switch(null==b&&(b={}),typeof a){case"object":d=[];for(e in a)g=a[e],f=e.toLowerCase(),d.push(f+":\\t"+g);return d.join("\\n")+"\\n";case"string":for(d=a.split("\\n"),i=0,j=d.length;i<j;i++)c=d[i],/([^:]+):\\s*(.+)/.test(c)&&(f=null!=(k=RegExp.$1)?k.toLowerCase():void 0,h=RegExp.$2,null==b[f]&&(b[f]=h));return b}},k=q[i],s=function(a){var b;this.fd=a?new k(a):new k,this.form=a,b=[],Object.defineProperty(this,"entries",{get:function(){var c;return c=a?D(a.querySelectorAll("input,select")).filter(function(a){var b;return"checkbox"!==(b=a.type)&&"radio"!==b||a.checked}).map(function(a){return[a.name,"file"===a.type?a.files:a.value]}):[],c.concat(b)}}),this.append=function(a){return function(){var c;return c=D(arguments),b.push(c),a.fd.append.apply(a.fd,c)}}(this)},k&&(F[i]=k,q[i]=s),l=q[u],F[u]=l,t=q[u]=function(){var a,b,g,i,j,k,l,m,q,r,t,w,x,y,D,E,G,I,J,K,L;a=-1,I=new F[u],t={},y=null,l=void 0,D=void 0,w=void 0,r=function(){var b,c,d,e;if(w.status=y||I.status,y===a&&A<10||(w.statusText=I.statusText),y!==a){e=v(I.getAllResponseHeaders());for(b in e)d=e[b],w.headers[b]||(c=b.toLowerCase(),w.headers[c]=d)}},q=function(){if(I.responseType&&"text"!==I.responseType)"document"===I.responseType?(w.xml=I.responseXML,w.data=I.responseXML):w.data=I.response;else{w.text=I.responseText,w.data=I.responseText;try{w.xml=I.responseXML}catch(a){}}"responseURL"in I&&(w.finalUrl=I.responseURL)},G=function(){k.status=w.status,k.statusText=w.statusText},E=function(){"text"in w&&(k.responseText=w.text),"xml"in w&&(k.responseXML=w.xml),"data"in w&&(k.response=w.data),"finalUrl"in w&&(k.responseURL=w.finalUrl)},i=function(a){for(;a>b&&b<4;)k[o]=++b,1===b&&k[h]("loadstart",{}),2===b&&G(),4===b&&(G(),E()),k[h]("readystatechange",{}),4===b&&(t.async===!1?g():setTimeout(g,0))},g=function(){l||k[h]("load",{}),k[h]("loadend",{}),l&&(k[o]=0)},b=0,x=function(a){var b,d;if(4!==a)return void i(a);b=F.listeners(c),(d=function(){var a;return b.length?(a=b.shift(),2===a.length?(a(t,w),d()):3===a.length&&t.async?a(t,w,d):d()):i(4)})()},k=t.xhr=f(),I.onreadystatechange=function(a){try{2===I[o]&&r()}catch(a){}4===I[o]&&(D=!1,r(),q()),x(I[o])},m=function(){l=!0},k[n]("error",m),k[n]("timeout",m),k[n]("abort",m),k[n]("progress",function(){b<3?x(3):k[h]("readystatechange",{})}),("withCredentials"in I||F.addWithCredentials)&&(k.withCredentials=!1),k.status=0,L=e.concat(p);for(J=0,K=L.length;J<K;J++)j=L[J],k["on"+j]=null;return k.open=function(a,c,d,e,f){b=0,l=!1,D=!1,t.headers={},t.headerNames={},t.status=0,w={},w.headers={},t.method=a,t.url=c,t.async=d!==!1,t.user=e,t.pass=f,x(1)},k.send=function(a){var b,c,f,g,h,i,j,l;for(l=["type","timeout","withCredentials"],i=0,j=l.length;i<j;i++)c=l[i],f="type"===c?"responseType":c,f in k&&(t[c]=k[f]);t.body=a,h=function(){var a,b,d,g,h,i;for(C(e,I,k),k.upload&&C(e.concat(p),I.upload,k.upload),D=!0,I.open(t.method,t.url,t.async,t.user,t.pass),h=["type","timeout","withCredentials"],d=0,g=h.length;d<g;d++)c=h[d],f="type"===c?"responseType":c,c in t&&(I[f]=t[c]);i=t.headers;for(a in i)b=i[a],a&&I.setRequestHeader(a,b);t.body instanceof s&&(t.body=t.body.fd),I.send(t.body)},b=F.listeners(d),(g=function(){var a,c;return b.length?(a=function(a){if("object"==typeof a&&("number"==typeof a.status||"number"==typeof w.status))return z(a,w),H.call(a,"data")<0&&(a.data=a.response||a.text),void x(4);g()},a.head=function(a){return z(a,w),x(2)},a.progress=function(a){return z(a,w),x(3)},c=b.shift(),1===c.length?a(c(t)):2===c.length&&t.async?c(t,a):a()):h()})()},k.abort=function(){y=a,D?I.abort():k[h]("abort",{})},k.setRequestHeader=function(a,b){var c,d;c=null!=a?a.toLowerCase():void 0,d=t.headerNames[c]=t.headerNames[c]||a,t.headers[d]&&(b=t.headers[d]+", "+b),t.headers[d]=b},k.getResponseHeader=function(a){var b;return b=null!=a?a.toLowerCase():void 0,B(w.headers[b])},k.getAllResponseHeaders=function(){return B(v(w.headers))},I.overrideMimeType&&(k.overrideMimeType=function(){return I.overrideMimeType.apply(I,arguments)}),I.upload&&(k.upload=t.upload=f()),k.UNSENT=0,k.OPENED=1,k.HEADERS_RECEIVED=2,k.LOADING=3,k.DONE=4,k.response="",k.responseText="",k.responseXML=null,k.readyState=0,k.statusText="",k},"function"==typeof q[g]&&(j=q[g],F[g]=j,r=q[g]=function(a,b){var e,f,g;return null==b&&(b={headers:{}}),b.url=a,g=null,f=F.listeners(d),e=F.listeners(c),new Promise(function(a,c){var d,h,i,k,l;h=function(){return b.body instanceof s&&(b.body=b.body.fd),b.headers&&(b.headers=new Headers(b.headers)),g||(g=new Request(b.url,b)),z(b,g)},i=function(b){var c;return e.length?(c=e.shift(),2===c.length?(c(h(),b),i(b)):3===c.length?c(h(),b,i):i(b)):a(b)},d=function(b){var c;if(void 0!==b)return c=new Response(b.body||b.text,b),a(c),void i(c);k()},k=function(){var a;return f.length?(a=f.shift(),1===a.length?d(a(b)):2===a.length?a(h(),d):void 0):void l()},l=function(){return j(h()).then(function(a){return i(a)}).catch(function(a){return i(a),c(a)})},k()})}),t.UNSENT=0,t.OPENED=1,t.HEADERS_RECEIVED=2,t.LOADING=3,t.DONE=4,"function"==typeof define&&define.amd?define("xhook",[],function(){return F}):"object"==typeof module&&module.exports?module.exports={xhook:F}:q&&(q.xhook=F)}).call(this,window);' +
  "window.__afterxhook__();";
