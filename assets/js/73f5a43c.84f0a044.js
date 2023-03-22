"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[490],{3905:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>f});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},s=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),d=c(r),u=a,f=d["".concat(l,".").concat(u)]||d[u]||m[u]||i;return r?n.createElement(f,o(o({ref:t},s),{},{components:r})):n.createElement(f,o({ref:t},s))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=u;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[d]="string"==typeof e?e:a,o[1]=p;for(var c=2;c<i;c++)o[c]=r[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},2604:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>p,toc:()=>c});var n=r(7462),a=(r(7294),r(3905));const i={sidebar_position:5},o="\u0422\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u043e\u0432",p={unversionedId:"tracing",id:"tracing",title:"\u0422\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u043e\u0432",description:"\u0414\u043b\u044f \u0442\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u043a\u0438 \u043c\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c OpenTelemetry \u0432 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u0435 \u043e\u0441\u043d\u043e\u0432\u043d\u043e\u0433\u043e \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430 \u0441\u0431\u043e\u0440\u0430 \u0438 Jaeger \u0434\u043b\u044f \u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u043d\u044b\u0445 \u0434\u0430\u043d\u043d\u044b\u0445.",source:"@site/docs/tracing.md",sourceDirName:".",slug:"/tracing",permalink:"/isomorph/tracing",draft:!1,tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 \u043e\u0448\u0438\u0431\u043e\u043a",permalink:"/isomorph/error-tracking"},next:{title:"\u0421\u0431\u043e\u0440 \u043c\u0435\u0442\u0440\u0438\u043a",permalink:"/isomorph/metrics"}},l={},c=[{value:"tracingMiddleware (express)",id:"tracingmiddleware-express",level:2},{value:"tracingMiddleware (middleware-axios)",id:"tracingmiddleware-middleware-axios",level:2}],s={toc:c};function d(e){let{components:t,...r}=e;return(0,a.kt)("wrapper",(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"\u0442\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u043a\u0430-\u043f\u0440\u043e\u0446\u0435\u0441\u0441\u043e\u0432"},"\u0422\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u043e\u0432"),(0,a.kt)("p",null,"\u0414\u043b\u044f \u0442\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u043a\u0438 \u043c\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c ",(0,a.kt)("strong",{parentName:"p"},"OpenTelemetry")," \u0432 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u0435 \u043e\u0441\u043d\u043e\u0432\u043d\u043e\u0433\u043e \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430 \u0441\u0431\u043e\u0440\u0430 \u0438 ",(0,a.kt)("strong",{parentName:"p"},"Jaeger")," \u0434\u043b\u044f \u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u043d\u044b\u0445 \u0434\u0430\u043d\u043d\u044b\u0445."),(0,a.kt)("p",null,"\u041e\u0437\u043d\u0430\u043a\u043e\u043c\u0438\u0442\u044c\u0441\u044f \u0441 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u0435\u043c ",(0,a.kt)("strong",{parentName:"p"},"OpenTelemetry")," \u043c\u043e\u0436\u043d\u043e \u043d\u0430 ",(0,a.kt)("a",{parentName:"p",href:"https://opentelemetry.io/"},"\u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u043c \u0441\u0430\u0439\u0442\u0435"),"."),(0,a.kt)("p",null,"\u041f\u0430\u043a\u0435\u0442 ",(0,a.kt)("strong",{parentName:"p"},"isomorph")," \u043d\u0430 \u0434\u0430\u043d\u043d\u044b\u0439 \u043c\u043e\u043c\u0435\u043d\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e\u0441\u0442\u044b\u0445 \u0443\u0442\u0438\u043b\u0438\u0442 \u0434\u043b\u044f \u0431\u0430\u0437\u043e\u0432\u043e\u0439 \u0442\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u043a\u0438 \u043e\u0442\u0432\u0435\u0442\u043e\u0432 express-\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f."),(0,a.kt)("h2",{id:"tracingmiddleware-express"},"tracingMiddleware (express)"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"tracingMiddleware")," \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0433\u043e\u0442\u043e\u0432\u044b\u0439 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0441\u043b\u043e\u0439 \u0434\u043b\u044f express-\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f. \u042d\u0442\u043e\u0442 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0441\u043b\u043e\u0439 \u0431\u0443\u0434\u0435\u0442 \u0441\u043e\u0437\u0434\u0430\u0432\u0430\u0442\u044c span \u043d\u0430 \u043a\u0430\u0436\u0434\u044b\u0439 \u0437\u0430\u043f\u0440\u043e\u0441 \u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u0442\u044c \u0435\u0433\u043e \u043f\u0440\u0438 \u043e\u0442\u0432\u0435\u0442\u0435."),(0,a.kt)("p",null,"\u041a\u043e\u043d\u0442\u0435\u043a\u0441\u0442 \u0438 \u043a\u043e\u0440\u043d\u0435\u0432\u043e\u0439 span \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u043d\u0430 ",(0,a.kt)("inlineCode",{parentName:"p"},"res.locals.tracing.rootContext")," \u0438 ",(0,a.kt)("inlineCode",{parentName:"p"},"res.locals.tracing.rootSpan")," \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043d\u043d\u043e."),(0,a.kt)("h2",{id:"tracingmiddleware-middleware-axios"},"tracingMiddleware (middleware-axios)"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"tracingMiddleware")," \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0433\u043e\u0442\u043e\u0432\u044b\u0439 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0441\u043b\u043e\u0439 \u0434\u043b\u044f ",(0,a.kt)("inlineCode",{parentName:"p"},"AxiosInstanceWrapper"),". \u042d\u0442\u043e\u0442 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0441\u043b\u043e\u0439 \u0431\u0443\u0434\u0435\u0442 \u0441\u043e\u0437\u0434\u0430\u0432\u0430\u0442\u044c span \u043d\u0430 \u043a\u0430\u0436\u0434\u044b\u0439 \u0437\u0430\u043f\u0440\u043e\u0441 \u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u0442\u044c \u0435\u0433\u043e \u043f\u0440\u0438 \u043e\u0442\u0432\u0435\u0442\u0435."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import express from 'express';\nimport { create } from 'middleware-axios';\nimport { tracingMiddleware } from '@sima-land/isomorph/http-client/middleware/tracing';\nimport { Tracer, Context } from '@opentelemetry/api';\n\ndeclare const tracer: Tracer;\ndeclare const context: Context;\n\nconst client = create({\n  baseURL: 'https://www.test.com/',\n});\n\nclient.use(tracingMiddleware(tracer, context));\n\n// \u0432\u0441\u0435 \u0438\u0441\u0445\u043e\u0434\u044f\u0449\u0438\u0435 \u0437\u0430\u043f\u0440\u043e\u0441\u044b \u0431\u0443\u0434\u0443\u0442 \u043e\u0442\u0440\u0430\u0436\u0435\u043d\u044b \u043a\u0430\u043a \u0441\u0442\u0430\u0434\u0438\u0438 \u043e\u0441\u043d\u043e\u0432\u043d\u043e\u0433\u043e \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u0430\nclient.get('https://www.sima-land.ru/api/v3/user');\n")),(0,a.kt)("admonition",{title:"\u0412\u0430\u0436\u043d\u043e",type:"info"},(0,a.kt)("p",{parentName:"admonition"},"\u041f\u0440\u0438 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u0438 DI-\u043f\u0440\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u044f \u0441 \u043f\u0440\u0435\u0441\u0435\u0442\u043e\u043c ",(0,a.kt)("inlineCode",{parentName:"p"},"PresetResponse")," \u043d\u0435\u0442 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e\u0441\u0442\u0438 \u0432\u0440\u0443\u0447\u043d\u0443\u044e \u043a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0435 \u0441\u043b\u043e\u0438, \u0430 \u0442\u0430\u043a\u0436\u0435 \u0442\u0440\u0430\u0441\u0441\u0438\u0440\u043e\u0432\u0449\u0438\u043a \u0438 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442. \u0424\u0430\u0431\u0440\u0438\u043a\u0430 (\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u043f\u043e \u0442\u043e\u043a\u0435\u043d\u0443 ",(0,a.kt)("inlineCode",{parentName:"p"},"KnownToken.Http.Client.factory"),") \u0431\u0443\u0434\u0435\u0442 \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u0442\u044c \u043a\u043b\u0438\u0435\u043d\u0442, \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u0443\u0436\u0435 \u0441\u0432\u044f\u0437\u0430\u043d \u0441 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442\u043e\u043c \u0432\u0445\u043e\u0434\u044f\u0449\u0435\u0433\u043e \u0437\u0430\u043f\u0440\u043e\u0441\u0430.")))}d.isMDXComponent=!0}}]);