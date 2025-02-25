"use strict";(self.webpackChunkisomorph_docs=self.webpackChunkisomorph_docs||[]).push([[515],{24:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>i,contentTitle:()=>a,default:()=>p,frontMatter:()=>s,metadata:()=>c,toc:()=>l});var t=n(4848),o=n(8453);const s={title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f React",description:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 React."},a="\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f React",c={id:"utils/react",title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f React",description:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 React.",source:"@site/docs/utils/react.md",sourceDirName:"utils",slug:"/utils/react",permalink:"/isomorph/utils/react",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f React",description:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 React."},sidebar:"tutorialSidebar",previous:{title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Express \u0441\u0435\u0440\u0432\u0435\u0440\u0430.",permalink:"/isomorph/utils/express"},next:{title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Redux-saga",permalink:"/isomorph/utils/redux-saga"}},i={},l=[{value:"ErrorBoundary",id:"errorboundary",level:2},{value:"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f:",id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",level:4},{value:"SafeSuspense",id:"safesuspense",level:2},{value:"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f:",id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f-1",level:4}];function d(e){const r={code:"code",h1:"h1",h2:"h2",h4:"h4",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,o.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(r.header,{children:(0,t.jsx)(r.h1,{id:"\u0443\u0442\u0438\u043b\u0438\u0442\u044b-\u0434\u043b\u044f-react",children:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f React"})}),"\n",(0,t.jsx)(r.p,{children:"\u041f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0443\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 React."}),"\n",(0,t.jsx)(r.h2,{id:"errorboundary",children:"ErrorBoundary"}),"\n",(0,t.jsxs)(r.ul,{children:["\n",(0,t.jsx)(r.li,{children:"\u041a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442 \u043f\u0435\u0440\u0435\u0445\u0432\u0430\u0442\u0447\u0438\u043a \u043e\u0448\u0438\u0431\u043e\u043a, \u043e\u0431\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0435\u0442 \u0432\u0441\u0435 \u043e\u0448\u0438\u0431\u043a\u0438 \u043f\u0440\u0438 \u0440\u0435\u043d\u0434\u0435\u0440\u0435 \u0434\u043e\u0447\u0435\u0440\u043d\u0438\u0445 \u044d\u043b\u0435\u043c\u0435\u043d\u0442\u043e\u0432."}),"\n",(0,t.jsx)(r.li,{children:"\u0420\u0435\u043d\u0434\u0435\u0440\u0438\u0442 fallback \u0435\u0441\u043b\u0438 \u0431\u044b\u043b\u0430 \u0432\u044b\u044f\u0432\u043b\u0435\u043d\u0430 \u043e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0440\u0435\u043d\u0434\u0435\u0440\u0435 \u0432\u0441\u0435\u0445 \u0434\u043e\u0447\u0435\u0440\u043d\u0438\u0445 \u044d\u043b\u0435\u043c\u0435\u043d\u0442\u043e\u0432."}),"\n"]}),"\n",(0,t.jsx)(r.h4,{id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",children:"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f:"}),"\n",(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-tsx",children:"import React from 'react';\nimport { App } from './app';\nimport { ErrorBoundary } from '@sima-land/isomorph/utils/react';\n\nconst rootElement = document.getElementById(config.appName);\nconst onError = logger.error;\n\ncreateRoot(rootElement).render(\n    <ErrorBoundary onError={onError} fallback={null}>\n        <App />\n    </ErrorBoundary>,\n);\n"})}),"\n",(0,t.jsx)(r.h2,{id:"safesuspense",children:"SafeSuspense"}),"\n",(0,t.jsx)(r.p,{children:"\u041a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442 \u043e\u0431\u0451\u0440\u0442\u043a\u0438 Suspense \u0438\u0437 React, \u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0449\u0430\u044f ErrorBoundary \u0432 \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u0438."}),"\n",(0,t.jsx)(r.h4,{id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f-1",children:"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f:"}),"\n",(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-tsx",children:"import React from 'react';\nimport { App } from './app';\nimport { SafeSuspense } from '@sima-land/isomorph/utils/react';\n\nconst rootElement = document.getElementById(config.appName);\nconst onError = logger.error;\n\ncreateRoot(rootElement).render(\n    <SafeSuspense onError={onError} fallback={null}>\n        <App />\n    </SafeSuspense>,\n);\n"})})]})}function p(e={}){const{wrapper:r}={...(0,o.R)(),...e.components};return r?(0,t.jsx)(r,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},8453:(e,r,n)=>{n.d(r,{R:()=>a,x:()=>c});var t=n(6540);const o={},s=t.createContext(o);function a(e){const r=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function c(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),t.createElement(s.Provider,{value:r},e.children)}}}]);