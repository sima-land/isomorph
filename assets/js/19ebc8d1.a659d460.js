"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[364],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>y});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),p=s(n),d=a,y=p["".concat(c,".").concat(d)]||p[d]||m[d]||o;return n?r.createElement(y,i(i({ref:t},u),{},{components:n})):r.createElement(y,i({ref:t},u))}));function y(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[p]="string"==typeof e?e:a,i[1]=l;for(var s=2;s<o;s++)i[s]=n[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},6395:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>p,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var r=n(7462),a=(n(7294),n(3905));const o={sidebar_position:7},i="\u0423\u0442\u0438\u043b\u0438\u0442\u044b",l={unversionedId:"utils",id:"utils",title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b",description:"\u041f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0443\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430\u043c\u0438 \u0438 \u0444\u0440\u0435\u0439\u043c\u0432\u043e\u0440\u043a\u0430\u043c\u0438 \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043c\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c \u0432 \u043d\u0430\u0448\u0438\u0445 \u043f\u0440\u043e\u0435\u043a\u0442\u0430\u0445.",source:"@site/docs/utils.md",sourceDirName:".",slug:"/utils",permalink:"/isomorph/utils",draft:!1,tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_position:7},sidebar:"tutorialSidebar",previous:{title:"\u0421\u0431\u043e\u0440 \u043c\u0435\u0442\u0440\u0438\u043a",permalink:"/isomorph/metrics"}},c={},s=[{value:"redux/remote-data",id:"reduxremote-data",level:2}],u={toc:s};function p(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"\u0443\u0442\u0438\u043b\u0438\u0442\u044b"},"\u0423\u0442\u0438\u043b\u0438\u0442\u044b"),(0,a.kt)("p",null,"\u041f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0443\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430\u043c\u0438 \u0438 \u0444\u0440\u0435\u0439\u043c\u0432\u043e\u0440\u043a\u0430\u043c\u0438 \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043c\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c \u0432 \u043d\u0430\u0448\u0438\u0445 \u043f\u0440\u043e\u0435\u043a\u0442\u0430\u0445."),(0,a.kt)("h2",{id:"reduxremote-data"},"redux/remote-data"),(0,a.kt)("p",null,"\u0414\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 \u0443\u0434\u0430\u043b\u0435\u043d\u043d\u044b\u043c\u0438 \u0434\u0430\u043d\u043d\u044b\u043c\u0438 \u043f\u0430\u043a\u0435\u0442 \u043f\u0435\u0440\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u043d\u0430\u0431\u043e\u0440 \u0443\u0442\u0438\u043b\u0438\u0442 ",(0,a.kt)("inlineCode",{parentName:"p"},"RemoteData"),"."),(0,a.kt)("p",null,"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f \u0432\u043c\u0435\u0441\u0442\u0435 \u0441 ",(0,a.kt)("inlineCode",{parentName:"p"},"createAction")," \u0438 ",(0,a.kt)("inlineCode",{parentName:"p"},"createReducer")," \u0438\u0437 \u043f\u0430\u043a\u0435\u0442\u0430 ",(0,a.kt)("inlineCode",{parentName:"p"},"@reduxjs/toolkit"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { createAction, createReducer } from '@reduxjs/toolkit';\nimport { RemoteData, RemoteDataState } from '@sima-land/isomorph/utils/redux';\n\ninterface MyData {\n  id: number;\n  name: string;\n}\n\ninterface MyDataState extends RemoteDataState<MyData | null, string | null> {\n  readonly myCustomProperty: boolean;\n}\n\nconst initialState: MyDataState = {\n  data: null,\n  error: null,\n  status: RemoteData.STATUS.initial,\n  myCustomProperty: false,\n};\n\nconst actions = {\n  myCustomAction: createAction('my-data/myCustomAction'),\n\n  // \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u043c action'\u044b \u0434\u043b\u044f \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0434\u0430\u043d\u043d\u044b\u0445: request, success, failure\n  ...RemoteData.createActions<MyData, string>('my-data'),\n};\n\nconst reducer = createReducer(initialState, builder => {\n  // \u043f\u0440\u0438\u043c\u0435\u043d\u044f\u0435\u043c \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0438 action'\u043e\u0432 \u043a reducer'\u0443\n  RemoteData.applyReducers<MyData, string>(actions, builder);\n});\n\nexport const MyData = {\n  initialState,\n  actions,\n  reducer,\n} as const;\n")),(0,a.kt)("p",null,"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f \u0432\u043c\u0435\u0441\u0442\u0435 \u0441 ",(0,a.kt)("inlineCode",{parentName:"p"},"createSlice")," \u0438\u0437 \u043f\u0430\u043a\u0435\u0442\u0430 ",(0,a.kt)("inlineCode",{parentName:"p"},"@reduxjs/toolkit"),";"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { createSlice } from '@reduxjs/toolkit';\nimport { RemoteData, RemoteDataState } from '@sima-land/isomorph/utils/redux';\n\ninterface MyData {\n  id: number;\n  name: string;\n}\n\ninterface MyDataState extends RemoteDataState<MyData | null, string | null> {\n  readonly myCustomProperty: boolean;\n}\n\nconst initialState: MyDataState = {\n  data: null,\n  error: null,\n  status: RemoteData.STATUS.initial,\n  myCustomProperty: false,\n};\n\nexport const MyData = createSlice({\n  name: 'my-data',\n  initialState,\n  reducers: {\n    ...RemoteData.createHandlers<MyData, string>(),\n  },\n});\n")))}p.isMDXComponent=!0}}]);