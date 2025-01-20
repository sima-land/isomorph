"use strict";(self.webpackChunkisomorph_docs=self.webpackChunkisomorph_docs||[]).push([[874],{2870:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>a,default:()=>d,frontMatter:()=>s,metadata:()=>i,toc:()=>l});var n=r(4848),o=r(8453);const s={title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Web Storage",description:"\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430 \u0441 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043d\u044b\u043c \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0435\u043c."},a=void 0,i={id:"utils/storage",title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Web Storage",description:"\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430 \u0441 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043d\u044b\u043c \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0435\u043c.",source:"@site/docs/utils/storage.md",sourceDirName:"utils",slug:"/utils/storage",permalink:"/isomorph/utils/storage",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Web Storage",description:"\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430 \u0441 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043d\u044b\u043c \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0435\u043c."},sidebar:"tutorialSidebar",previous:{title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Redux",permalink:"/isomorph/utils/redux"}},c={},l=[{value:"createSafeStorage",id:"createsafestorage",level:2},{value:"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f:",id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",level:5}];function u(e){const t={code:"code",h2:"h2",h5:"h5",p:"p",pre:"pre",...(0,o.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:"createsafestorage",children:"createSafeStorage"}),"\n",(0,n.jsx)(t.p,{children:"\u041f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0444\u0443\u043d\u043a\u0446\u0438\u044e, \u0441\u043e\u0437\u0434\u0430\u044e\u0449\u0443\u044e \u043e\u0431\u0435\u0440\u0442\u043a\u0443 \u0434\u043b\u044f \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0439 \u0440\u0430\u0431\u043e\u0442\u044b\n\u0441 API Web Storage."}),"\n",(0,n.jsx)(t.h5,{id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",children:"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f:"}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-ts",children:"import { createSafeStorage } from '@sima-land/isomorph/utils/web/storage';\n\nfunction saveUserPreferences(prefs: UserPreferences) {\n    const storage = createSafeStorage(() => window.localStorage)\n\n    // \u041f\u0440\u043e\u0432\u0435\u0440\u044f\u0435\u043c \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u044c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043d\u043e\u0433\u043e \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0430 \u0432 \u0442\u0435\u043a\u0443\u0449\u0435\u0439 \u0441\u0440\u0435\u0434\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f.\n    if (!storage.isAvailable()) {\n        console.warn('Storage is not available');\n        return;\n    }\n\n    storage.setItem('user-prefs', JSON.stringify(prefs));\n}\n"})})]})}function d(e={}){const{wrapper:t}={...(0,o.R)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(u,{...e})}):u(e)}},8453:(e,t,r)=>{r.d(t,{R:()=>a,x:()=>i});var n=r(6540);const o={},s=n.createContext(o);function a(e){const t=n.useContext(s);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),n.createElement(s.Provider,{value:t},e.children)}}}]);