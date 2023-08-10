"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[878],{3905:(e,r,n)=>{n.d(r,{Zo:()=>c,kt:()=>d});var t=n(7294);function o(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function a(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function l(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?a(Object(n),!0).forEach((function(r){o(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function i(e,r){if(null==e)return{};var n,t,o=function(e,r){if(null==e)return{};var n,t,o={},a=Object.keys(e);for(t=0;t<a.length;t++)n=a[t],r.indexOf(n)>=0||(o[n]=e[n]);return o}(e,r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)n=a[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=t.createContext({}),s=function(e){var r=t.useContext(p),n=r;return e&&(n="function"==typeof e?e(r):l(l({},r),e)),n},c=function(e){var r=s(e.components);return t.createElement(p.Provider,{value:r},e.children)},g="mdxType",u={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},m=t.forwardRef((function(e,r){var n=e.components,o=e.mdxType,a=e.originalType,p=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),g=s(n),m=o,d=g["".concat(p,".").concat(m)]||g[m]||u[m]||a;return n?t.createElement(d,l(l({ref:r},c),{},{components:n})):t.createElement(d,l({ref:r},c))}));function d(e,r){var n=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var a=n.length,l=new Array(a);l[0]=m;var i={};for(var p in r)hasOwnProperty.call(r,p)&&(i[p]=r[p]);i.originalType=e,i[g]="string"==typeof e?e:o,l[1]=i;for(var s=2;s<a;s++)l[s]=n[s];return t.createElement.apply(null,l)}return t.createElement.apply(null,n)}m.displayName="MDXCreateElement"},7796:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>i,toc:()=>s});var t=n(7462),o=(n(7294),n(3905));const a={sidebar_position:3},l="\u041b\u043e\u0433\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435",i={unversionedId:"log",id:"log",title:"\u041b\u043e\u0433\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435",description:"\u0414\u043b\u044f \u043b\u043e\u0433\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u043f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u043f\u0440\u043e\u0441\u0442\u0435\u0439\u0448\u0443\u044e \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044e \u043b\u043e\u0433\u0433\u0435\u0440\u0430 - \u043e\u0431\u044a\u0435\u043a\u0442\u0430, \u0441\u043e\u0434\u0435\u0440\u0436\u0430\u0449\u0435\u0433\u043e \u043c\u0435\u0442\u043e\u0434\u044b \u0434\u043b\u044f \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u0436\u0438\u0437\u043d\u0435\u043d\u043d\u043e\u0433\u043e \u0446\u0438\u043a\u043b\u0430 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f.",source:"@site/docs/log.md",sourceDirName:".",slug:"/log",permalink:"/isomorph/log",draft:!1,tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"\u041f\u0440\u0435\u0441\u0435\u0442\u044b",permalink:"/isomorph/dependency-injection/preset"},next:{title:"\u0422\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u043a\u0430",permalink:"/isomorph/tracing"}},p={},s=[{value:"Logger",id:"logger",level:2},{value:"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",level:3},{value:"\u0421\u0431\u043e\u0440 \u043e\u0448\u0438\u0431\u043e\u043a",id:"\u0441\u0431\u043e\u0440-\u043e\u0448\u0438\u0431\u043e\u043a",level:2},{value:"\u041f\u0440\u0438\u043c\u0435\u0440\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",id:"\u043f\u0440\u0438\u043c\u0435\u0440\u044b-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",level:3}],c={toc:s},g="wrapper";function u(e){let{components:r,...n}=e;return(0,o.kt)(g,(0,t.Z)({},c,n,{components:r,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"\u043b\u043e\u0433\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435"},"\u041b\u043e\u0433\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435"),(0,o.kt)("p",null,"\u0414\u043b\u044f \u043b\u043e\u0433\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u043f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u043f\u0440\u043e\u0441\u0442\u0435\u0439\u0448\u0443\u044e \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044e \u043b\u043e\u0433\u0433\u0435\u0440\u0430 - \u043e\u0431\u044a\u0435\u043a\u0442\u0430, \u0441\u043e\u0434\u0435\u0440\u0436\u0430\u0449\u0435\u0433\u043e \u043c\u0435\u0442\u043e\u0434\u044b \u0434\u043b\u044f \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u0436\u0438\u0437\u043d\u0435\u043d\u043d\u043e\u0433\u043e \u0446\u0438\u043a\u043b\u0430 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f."),(0,o.kt)("h2",{id:"logger"},"Logger"),(0,o.kt)("p",null,"\u0418\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441 ",(0,o.kt)("strong",{parentName:"p"},"Logger")," \u0438\u043c\u0435\u0435\u0442 \u0440\u044f\u0434 \u043c\u0435\u0442\u043e\u0434\u043e\u0432 \u0434\u043b\u044f \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u043d\u0430\u0438\u0431\u043e\u043b\u0435\u0435 \u0440\u0430\u0441\u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0451\u043d\u043d\u044b\u0445 \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u0440\u0430\u0431\u043e\u0442\u044b \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u044b, \u0432\u0440\u043e\u0434\u0435 ",(0,o.kt)("inlineCode",{parentName:"p"},"info"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"error"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"debug")," \u0438 \u0442\u0434 \u043f\u043e\u0434\u043e\u0431\u043d\u043e \u043e\u0431\u044a\u0435\u043a\u0442\u0443 ",(0,o.kt)("a",{parentName:"p",href:"https://developer.mozilla.org/ru/docs/Web/API/Console"},"console"),"."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Logger")," \u0440\u0435\u0430\u043b\u0438\u0437\u0443\u0435\u0442 \u043f\u0440\u043e\u0441\u0442\u0435\u0439\u0448\u0443\u044e \u0441\u0438\u0441\u0442\u0435\u043c\u0443 \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438 \u043d\u0430 \u0441\u043e\u0431\u044b\u0442\u0438\u044f, \u0431\u043b\u0430\u0433\u043e\u0434\u0430\u0440\u044f \u0447\u0435\u043c\u0443 \u0438\u0445 \u043c\u043e\u0436\u043d\u043e \u0432\u044b\u0432\u043e\u0434\u0438\u0442\u044c \u0432 \u043a\u043e\u043d\u0441\u043e\u043b\u044c, \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0442\u044c \u0432 Sentry \u0438 \u0442\u0434."),(0,o.kt)("h3",{id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f"},"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createLogger } from '@sima-land/isomorph/log';\n\nconst logger = createLogger();\n\n// \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0430\nlogger.subscribe(event => {\n  console.log(event.type, event.data);\n});\n\n// ...\u043f\u043e\u0437\u0436\u0435 \u0432 \u043a\u043e\u0434\u0435\nif (somethingWrong) {\n  logger.error('something wrong');\n}\n")),(0,o.kt)("h2",{id:"\u0441\u0431\u043e\u0440-\u043e\u0448\u0438\u0431\u043e\u043a"},"\u0421\u0431\u043e\u0440 \u043e\u0448\u0438\u0431\u043e\u043a"),(0,o.kt)("p",null,"\u0414\u043b\u044f \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u044f \u043e\u0448\u0438\u0431\u043e\u043a \u043c\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c \u043f\u0440\u0435\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e ",(0,o.kt)("strong",{parentName:"p"},"Sentry"),". \u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0443 \u043e\u0448\u0438\u0431\u043e\u043a \u0438 \u0434\u0440\u0443\u0433\u0438\u0445 \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u0432 Sentry \u043c\u043e\u0436\u043d\u043e \u0440\u0435\u0430\u043b\u0438\u0437\u043e\u0432\u0430\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044f Logger \u0441\u043e \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u043c \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u043e\u043c \u0434\u043b\u044f Sentry."),(0,o.kt)("p",null,'\u041f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u043a\u043b\u0430\u0441\u0441\u044b \u0434\u043b\u044f \u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u0433\u043e\u0442\u043e\u0432\u044b\u0445 \u043a \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0435 \u043e\u0431\u044a\u0435\u043a\u0442\u043e\u0432, \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043b\u044f\u044e\u0449\u0438\u0445 \u043e\u0448\u0438\u0431\u043a\u0438 \u0438 "\u0445\u043b\u0435\u0431\u043d\u044b\u0435 \u043a\u0440\u043e\u0448\u043a\u0438".'),(0,o.kt)("h3",{id:"\u043f\u0440\u0438\u043c\u0435\u0440\u044b-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f"},"\u041f\u0440\u0438\u043c\u0435\u0440\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f"),(0,o.kt)("p",null,"\u041f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u0438\u043c \u043b\u043e\u0433\u0433\u0435\u0440 \u0438 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a \u0434\u043b\u044f \u043d\u0435\u0433\u043e. \u0414\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0443 \u043d\u0443\u0436\u0435\u043d Sentry Hub."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { createLogger } from '@sima-land/isomorph/log';\nimport { createSentryHandler } from '@sima-land/isomorph/log/handler/sentry';\nimport { BrowserClient, Hub } from '@sentry/browser';\n\nconst sentryClient = new BrowserClient({ dsn: process.env.SENTRY_DSN });\nconst sentryHub = new Hub(sentryClient);\n\nconst logger = createLogger();\n\nlogger.subscribe(createSentryHandler(sentryHub));\n")),(0,o.kt)("p",null,'\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a \u0431\u0443\u0434\u0435\u0442 \u043e\u0442\u0441\u044b\u043b\u0430\u0442\u044c \u0432\u0441\u0435 \u043e\u0448\u0438\u0431\u043a\u0438 \u0438 "\u0445\u043b\u0435\u0431\u043d\u044b\u0435 \u043a\u0440\u043e\u0448\u043a\u0438" \u0432 Sentry.\n\u041b\u044e\u0431\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435, \u043f\u0435\u0440\u0435\u0434\u0430\u043d\u043d\u044b\u0435 \u043b\u043e\u0433\u0433\u0435\u0440\u0443 \u0447\u0435\u0440\u0435\u0437 \u043c\u0435\u0442\u043e\u0434 ',(0,o.kt)("inlineCode",{parentName:"p"},"error")," \u0442\u0430\u043a\u0436\u0435 \u0431\u0443\u0434\u0443\u0442 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u044b \u0432 Sentry."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { DetailedError, Breadcrumb } from '@sima-land/isomorph/log';\n\n// \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \u043e\u0448\u0438\u0431\u043a\u0438\nlogger.error(\n  new DetailedError('something wrong', {\n    extra: {\n      key: 'something',\n      data: 'wrong',\n    },\n  }),\n);\n\n// \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \"\u0445\u043b\u0435\u0431\u043d\u043e\u0439 \u043a\u0440\u043e\u0448\u043a\u0438\"\nlogger.info(\n  new Breadcrumb({\n    category: 'something happens',\n    data: {\n      foo: 1,\n      bar: 2,\n    },\n  }),\n);\n")))}u.isMDXComponent=!0}}]);