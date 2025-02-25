"use strict";(self.webpackChunkisomorph_docs=self.webpackChunkisomorph_docs||[]).push([[869],{5314:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>l,default:()=>x,frontMatter:()=>c,metadata:()=>i,toc:()=>d});var r=t(4848),s=t(8453);const c={sidebar_position:4},l="\u0422\u0435\u043b\u0435\u043c\u0435\u0442\u0440\u0438\u044f",i={id:"telemetry",title:"\u0422\u0435\u043b\u0435\u043c\u0435\u0442\u0440\u0438\u044f",description:"\u0414\u043b\u044f \u0441\u0431\u043e\u0440\u043a\u0438 \u0442\u0435\u043b\u0435\u043c\u0435\u0442\u0440\u0438\u0438 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 OpenTelemetry.",source:"@site/docs/telemetry.md",sourceDirName:".",slug:"/telemetry",permalink:"/isomorph/telemetry",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"\u041b\u043e\u0433\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435",permalink:"/isomorph/log"},next:{title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b",permalink:"/isomorph/category/\u0443\u0442\u0438\u043b\u0438\u0442\u044b"}},o={},d=[{value:"\u0417\u0430\u0442\u0440\u0430\u0433\u0438\u0432\u0430\u0435\u043c\u044b\u0435 \u043f\u0440\u0435\u0441\u0435\u0442\u044b",id:"\u0437\u0430\u0442\u0440\u0430\u0433\u0438\u0432\u0430\u0435\u043c\u044b\u0435-\u043f\u0440\u0435\u0441\u0435\u0442\u044b",level:2},{value:"\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 Exporter",id:"\u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430-exporter",level:2},{value:"\u041e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u0438 \u043e\u0431\u043e\u0433\u0430\u0449\u0435\u043d\u0438\u0435 \u0434\u0430\u043d\u043d\u044b\u0445 \u0440\u0435\u0441\u0443\u0440\u0441\u0430 (<code>Resource</code>)",id:"\u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0435-\u0438-\u043e\u0431\u043e\u0433\u0430\u0449\u0435\u043d\u0438\u0435-\u0434\u0430\u043d\u043d\u044b\u0445-\u0440\u0435\u0441\u0443\u0440\u0441\u0430-resource",level:2}];function h(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"\u0442\u0435\u043b\u0435\u043c\u0435\u0442\u0440\u0438\u044f",children:"\u0422\u0435\u043b\u0435\u043c\u0435\u0442\u0440\u0438\u044f"})}),"\n",(0,r.jsxs)(n.p,{children:["\u0414\u043b\u044f \u0441\u0431\u043e\u0440\u043a\u0438 \u0442\u0435\u043b\u0435\u043c\u0435\u0442\u0440\u0438\u0438 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 ",(0,r.jsx)(n.a,{href:"https://opentelemetry.io/",children:(0,r.jsx)(n.strong,{children:"OpenTelemetry"})}),"."]}),"\n",(0,r.jsx)(n.h2,{id:"\u0437\u0430\u0442\u0440\u0430\u0433\u0438\u0432\u0430\u0435\u043c\u044b\u0435-\u043f\u0440\u0435\u0441\u0435\u0442\u044b",children:"\u0417\u0430\u0442\u0440\u0430\u0433\u0438\u0432\u0430\u0435\u043c\u044b\u0435 \u043f\u0440\u0435\u0441\u0435\u0442\u044b"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"node"})," \u2014 \u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0445 \u0434\u0430\u043d\u043d\u044b\u0445 (Resource, rootSpan) \u0438 \u0442\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442\u0430 (Exporter);"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"node-handler"})," \u2014\xa0\u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445 \u043f\u0440\u0438 \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u0438 \u043a \u0442\u043e\u0447\u043a\u0430\u043c \u0432\u0445\u043e\u0434\u0430,\n\u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u0438 \u0432\u0451\u0440\u0441\u0442\u043a\u0438, \u0437\u0430\u043f\u0440\u043e\u0441\u043e\u0432 \u043a API \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430\u043c\u0438 Axios/fetch (span)."]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"\u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430-exporter",children:"\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 Exporter"}),"\n",(0,r.jsx)(n.p,{children:"\u041a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044f \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0438 \u043e\u043f\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430."}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"center"},children:"\u041f\u0435\u0440\u0435\u043c\u0435\u043d\u043d\u0430\u044f \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u044f"}),(0,r.jsx)(n.th,{children:"\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435"}),(0,r.jsx)(n.th,{style:{textAlign:"center"},children:"\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u043f\u043e-\u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e"})]})}),(0,r.jsx)(n.tbody,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"center"},children:(0,r.jsx)(n.code,{children:"OTEL_EXPORTER_OTLP_URL"})}),(0,r.jsx)(n.td,{children:"URL \u043a\u043e\u043b\u043b\u0435\u043a\u0442\u043e\u0440\u0430 \u0442\u0435\u043b\u0435\u043c\u0435\u0442\u0440\u0438\u0438."}),(0,r.jsx)(n.td,{style:{textAlign:"center"},children:(0,r.jsx)(n.code,{children:"http://localhost:4317"})})]})})]}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:["\u041a\u0430\u043a \u043c\u043e\u0436\u043d\u043e \u0437\u0430\u043c\u0435\u0442\u0438\u0442\u044c \u0432 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0438 \u0443\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043f\u0440\u043e\u0442\u043e\u043a\u043e\u043b \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438 \u2014 \u044d\u0442\u043e \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u043d\u043e \u0442\u0430\u043a \u043a\u0430\u043a \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u0432\u043e\u0437\u043c\u043e\u0436\u043d\u0430 \u0432 Unix domain socket (",(0,r.jsx)(n.code,{children:"sock://"}),")."]}),"\n"]}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:["\u0414\u043b\u044f \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u043d\u043e\u0439 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u043f\u0435\u0440\u0435\u0434\u0430\u0442\u0447\u0438\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445 \u0441\u043c. \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u044e \u043f\u0430\u043a\u0435\u0442\u0430 ",(0,r.jsx)(n.a,{href:"https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc",children:(0,r.jsx)(n.code,{children:"@opentelemetry/exporter-trace-otlp-grpc"})})]}),"\n"]}),"\n",(0,r.jsxs)(n.h2,{id:"\u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0435-\u0438-\u043e\u0431\u043e\u0433\u0430\u0449\u0435\u043d\u0438\u0435-\u0434\u0430\u043d\u043d\u044b\u0445-\u0440\u0435\u0441\u0443\u0440\u0441\u0430-resource",children:["\u041e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u0438 \u043e\u0431\u043e\u0433\u0430\u0449\u0435\u043d\u0438\u0435 \u0434\u0430\u043d\u043d\u044b\u0445 \u0440\u0435\u0441\u0443\u0440\u0441\u0430 (",(0,r.jsx)(n.code,{children:"Resource"}),")"]}),"\n",(0,r.jsx)(n.p,{children:"\u041e\u0441\u043d\u043e\u0432\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0440\u0435\u0441\u0443\u0440\u0441\u0430 \u043f\u0440\u0435\u0434\u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u044b \u0438 \u043d\u0435 \u0442\u0440\u0435\u0431\u0443\u044e\u0442 \u0434\u0435\u043a\u043b\u0430\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f."}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{style:{textAlign:"center"},children:"\u0410\u0442\u0442\u0440\u0438\u0431\u0443\u0442"}),(0,r.jsx)(n.th,{children:"\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435"}),(0,r.jsx)(n.th,{style:{textAlign:"center"},children:"\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u043f\u043e-\u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"center"},children:(0,r.jsx)(n.code,{children:"service.name"})}),(0,r.jsxs)(n.td,{children:["\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0441\u0435\u0440\u0432\u0438\u0441\u0430 (",(0,r.jsx)(n.code,{children:"service-name"}),")"]}),(0,r.jsx)(n.td,{style:{textAlign:"center"},children:(0,r.jsx)(n.code,{children:"KnownTokens.Config.base -> appName"})})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"center"},children:(0,r.jsx)(n.code,{children:"service.version"})}),(0,r.jsxs)(n.td,{children:["\u0412\u0435\u0440\u0441\u0438\u044f \u0441\u0435\u0440\u0432\u0438\u0441\u0430 (",(0,r.jsx)(n.code,{children:"1.0.0"}),")"]}),(0,r.jsx)(n.td,{style:{textAlign:"center"},children:(0,r.jsx)(n.code,{children:"KnownTokens.Config.base -> appVersion"})})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{style:{textAlign:"center"},children:(0,r.jsx)(n.code,{children:"deployment.environment.name"})}),(0,r.jsxs)(n.td,{children:["\u0422\u0438\u043f \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u044f (",(0,r.jsx)(n.code,{children:"production | development"}),")"]}),(0,r.jsx)(n.td,{style:{textAlign:"center"},children:(0,r.jsx)(n.code,{children:"KnownTokens.Config.base -> env"})})]})]})]}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:["\u0422\u0430\u043a\u0436\u0435 \u0435\u0441\u0442\u044c \u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u044c \u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u044c \u0438\u043b\u0438 \u043f\u0435\u0440\u0435\u043f\u0438\u0441\u0430\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435 \u0447\u0435\u0440\u0435\u0437 \u043f\u0435\u0440\u0435\u043c\u0435\u043d\u043d\u0443\u044e \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u044f ",(0,r.jsx)(n.code,{children:"OTEL_RESOURCE_ATTRIBUTES"}),". \u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435 \u2014 ",(0,r.jsx)(n.a,{href:"https://opentelemetry.io/docs/languages/js/resources/#process--environment-resource-detection",children:"\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u044f OTEL"}),"."]}),"\n"]})]})}function x(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>l,x:()=>i});var r=t(6540);const s={},c=r.createContext(s);function l(e){const n=r.useContext(c);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),r.createElement(c.Provider,{value:n},e.children)}}}]);