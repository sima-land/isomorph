"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[510],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>f});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function a(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var s=n.createContext({}),l=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},c=function(e){var t=l(e.components);return n.createElement(s.Provider,{value:t},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,c=a(e,["components","mdxType","originalType","parentName"]),m=l(r),u=o,f=m["".concat(s,".").concat(u)]||m[u]||d[u]||i;return r?n.createElement(f,p(p({ref:t},c),{},{components:r})):n.createElement(f,p({ref:t},c))}));function f(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=r.length,p=new Array(i);p[0]=u;var a={};for(var s in t)hasOwnProperty.call(t,s)&&(a[s]=t[s]);a.originalType=e,a[m]="string"==typeof e?e:o,p[1]=a;for(var l=2;l<i;l++)p[l]=r[l];return n.createElement.apply(null,p)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},3918:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>p,default:()=>m,frontMatter:()=>i,metadata:()=>a,toc:()=>l});var n=r(7462),o=(r(7294),r(3905));const i={sidebar_position:6},p="\u0421\u0431\u043e\u0440 \u043c\u0435\u0442\u0440\u0438\u043a",a={unversionedId:"metrics",id:"metrics",title:"\u0421\u0431\u043e\u0440 \u043c\u0435\u0442\u0440\u0438\u043a",description:"\u041d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0435 frontend-\u043c\u0438\u043a\u0440\u043e\u0441\u0435\u0440\u0432\u0438\u0441\u044b \u043f\u043e\u0434\u0440\u0430\u0437\u0443\u043c\u0435\u0432\u0430\u044e\u0442 \u043d\u0430\u043b\u0438\u0447\u0438\u0435 \u0441\u0435\u0440\u0432\u0435\u0440\u043d\u043e\u0439 \u0447\u0430\u0441\u0442\u0438, \u0440\u0430\u0431\u043e\u0442\u0443 \u043a\u043e\u0442\u043e\u0440\u043e\u0439 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u0438\u0440\u043e\u0432\u0430\u0442\u044c. \u0414\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u043c\u044b \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u043c \u043c\u0435\u0442\u0440\u0438\u043a\u0438 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u0438.",source:"@site/docs/metrics.md",sourceDirName:".",slug:"/metrics",permalink:"/isomorph/metrics",draft:!1,tags:[],version:"current",sidebarPosition:6,frontMatter:{sidebar_position:6},sidebar:"tutorialSidebar",previous:{title:"\u0422\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u043e\u0432",permalink:"/isomorph/tracing"},next:{title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b",permalink:"/isomorph/utils"}},s={},l=[{value:"\u0422\u043e\u043a\u0435\u043d <code>KnownToken.Metrics.httpApp</code>",id:"\u0442\u043e\u043a\u0435\u043d-knowntokenmetricshttpapp",level:2},{value:"Middleware \u0434\u043b\u044f express-\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0439",id:"middleware-\u0434\u043b\u044f-express-\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0439",level:2}],c={toc:l};function m(e){let{components:t,...r}=e;return(0,o.kt)("wrapper",(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"\u0441\u0431\u043e\u0440-\u043c\u0435\u0442\u0440\u0438\u043a"},"\u0421\u0431\u043e\u0440 \u043c\u0435\u0442\u0440\u0438\u043a"),(0,o.kt)("p",null,"\u041d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0435 frontend-\u043c\u0438\u043a\u0440\u043e\u0441\u0435\u0440\u0432\u0438\u0441\u044b \u043f\u043e\u0434\u0440\u0430\u0437\u0443\u043c\u0435\u0432\u0430\u044e\u0442 \u043d\u0430\u043b\u0438\u0447\u0438\u0435 \u0441\u0435\u0440\u0432\u0435\u0440\u043d\u043e\u0439 \u0447\u0430\u0441\u0442\u0438, \u0440\u0430\u0431\u043e\u0442\u0443 \u043a\u043e\u0442\u043e\u0440\u043e\u0439 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u0438\u0440\u043e\u0432\u0430\u0442\u044c. \u0414\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u043c\u044b \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u043c \u043c\u0435\u0442\u0440\u0438\u043a\u0438 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u0438."),(0,o.kt)("p",null,"\u041f\u0430\u043a\u0435\u0442 ",(0,o.kt)("strong",{parentName:"p"},"isomorph")," \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u0438 \u0431\u0430\u0437\u043e\u0432\u043e\u0433\u043e http-\u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u0434\u043b\u044f \u0432\u044b\u0432\u043e\u0434\u0430 \u0441\u043e\u0431\u0440\u0430\u043d\u043d\u044b\u0445 \u0434\u0430\u043d\u043d\u044b\u0445 \u043e \u0440\u0430\u0431\u043e\u0442\u0435 \u0441\u0435\u0440\u0432\u0438\u0441\u0430, \u0430 \u0442\u0430\u043a\u0436\u0435 express-middleware \u0434\u043b\u044f \u0441\u0431\u043e\u0440\u0430 \u0431\u0430\u0437\u043e\u0432\u044b\u0445 \u043c\u0435\u0442\u0440\u0438\u043a express-\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f."),(0,o.kt)("h2",{id:"\u0442\u043e\u043a\u0435\u043d-knowntokenmetricshttpapp"},"\u0422\u043e\u043a\u0435\u043d ",(0,o.kt)("inlineCode",{parentName:"h2"},"KnownToken.Metrics.httpApp")),(0,o.kt)("p",null,"\u041a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442 \u043f\u043e \u0442\u043e\u043a\u0435\u043d\u0443 ",(0,o.kt)("inlineCode",{parentName:"p"},"KnownToken.Metrics.httpApp")," \u0432\u0435\u0440\u043d\u0435\u0442 \u0433\u043e\u0442\u043e\u0432\u043e\u0435 express-\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0434\u043b\u044f \u0441\u0431\u043e\u0440\u0430 \u043c\u0435\u0442\u0440\u0438\u043a."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import { Resolve } from '@sima-land/isomorph/di';\n\ndeclare const resolve: Resolve;\n\nconst metricsHttpApp = resolve(KnownToken.Metrics.httpApp);\n\nmetricsHttpApp.listen(8080, () => {\n  console.log('Server started');\n});\n")),(0,o.kt)("h2",{id:"middleware-\u0434\u043b\u044f-express-\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0439"},"Middleware \u0434\u043b\u044f express-\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0439"),(0,o.kt)("p",null,"\u0414\u043b\u044f \u0437\u0430\u0445\u0432\u0430\u0442\u0430 \u0441\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u043d\u044b\u0445 \u043c\u0435\u0442\u0440\u0438\u043a \u043f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0444\u0430\u0431\u0440\u0438\u043a\u0438 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0445 \u0441\u043b\u043e\u0435\u0432."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"import {\n  responseMetricsMiddleware,\n  renderMetricsMiddleware,\n} from '@sima-land/isomorph/http-server/middleware/metrics/node';\nimport express from 'express';\nimport * as PromClient from 'prom-client';\n\nconst config = {\n  env: 'dev',\n  appName: 'example',\n  appVersion: 'example',\n};\n\nconst app = express();\n\napp.use(\n  responseMetricsMiddleware(config, {\n    counter: new PromClient.Counter(/* ... */),\n    histogram: new PromClient.Histogram(/* ... */),\n  }),\n);\n\napp.use(\n  renderMetricsMiddleware(config, {\n    histogram: new PromClient.Histogram(/* ... */),\n  }),\n);\n")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"responseMetricsMiddleware")," \u0432\u0435\u0440\u043d\u0435\u0442 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0441\u043b\u043e\u0439, \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u0431\u0443\u0434\u0435\u0442 \u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0437\u0430\u043f\u0440\u043e\u0441\u043e\u0432 \u0438 \u0441\u0440\u0435\u0434\u043d\u0435\u0435 \u0432\u0440\u0435\u043c\u044f \u043e\u0442\u0432\u0435\u0442\u0430."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"renderMetricsMiddleware")," \u0432\u0435\u0440\u043d\u0435\u0442 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0441\u043b\u043e\u0439, \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u0431\u0443\u0434\u0435\u0442 \u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0440\u0435\u0434\u043d\u0435\u0435 \u0432\u0440\u0435\u043c\u044f \u0440\u0435\u043d\u0434\u0435\u0440\u0438\u043d\u0433\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b."),(0,o.kt)("admonition",{title:"\u0412\u0430\u0436\u043d\u043e",type:"info"},(0,o.kt)("p",{parentName:"admonition"},"\u041f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0441\u043b\u043e\u0439, \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043c\u044b\u0439 \u0444\u0443\u043d\u043a\u0446\u0438\u0435\u0439 ",(0,o.kt)("strong",{parentName:"p"},"renderMetricsMiddleware")," \u0431\u0443\u0434\u0435\u0442 \u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0432\u0440\u0435\u043c\u044f \u0440\u0435\u043d\u0434\u0435\u0440\u0430 \u043f\u043e\u0441\u0440\u0435\u0434\u0441\u0442\u0432\u043e\u043c \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438 \u043d\u0430 \u0441\u043e\u0431\u044b\u0442\u0438\u044f \u043d\u0430\u0447\u0430\u043b\u0430 \u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0438\u044f \u0440\u0435\u043d\u0434\u0435\u0440\u0438\u043d\u0433\u0430. \u0418\u043c\u0435\u043d\u0430 \u044d\u0442\u0438\u0445 \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u0432 \u0432\u0438\u0434\u0435 \u043a\u043e\u043d\u0441\u0442\u0430\u043d\u0442\u044b ",(0,o.kt)("inlineCode",{parentName:"p"},"RESPONSE_EVENT")," \u043a\u043e\u0442\u043e\u0440\u0443\u044e \u043c\u043e\u0436\u043d\u043e \u0438\u043c\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0438\u0437 ",(0,o.kt)("inlineCode",{parentName:"p"},"@sima-land/isomorph/http-server/constants"))))}m.isMDXComponent=!0}}]);