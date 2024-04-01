"use strict";(self.webpackChunkisomorph_docs=self.webpackChunkisomorph_docs||[]).push([[932],{8444:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>l});var a=n(5893),r=n(1151);const o={},s="\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Redux",i={id:"utils/redux",title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Redux",description:"\u041f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0443\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 Redux.",source:"@site/docs/utils/redux.md",sourceDirName:"utils",slug:"/utils/redux",permalink:"/isomorph/utils/redux",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Axios",permalink:"/isomorph/utils/axios"}},c={},l=[{value:"\u0423\u0434\u0430\u043b\u0435\u043d\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435",id:"\u0443\u0434\u0430\u043b\u0435\u043d\u043d\u044b\u0435-\u0434\u0430\u043d\u043d\u044b\u0435",level:3}];function d(e){const t={code:"code",h1:"h1",h3:"h3",p:"p",pre:"pre",...(0,r.a)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.h1,{id:"\u0443\u0442\u0438\u043b\u0438\u0442\u044b-\u0434\u043b\u044f-redux",children:"\u0423\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f Redux"}),"\n",(0,a.jsx)(t.p,{children:"\u041f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0443\u0442\u0438\u043b\u0438\u0442\u044b \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 Redux."}),"\n",(0,a.jsx)(t.h3,{id:"\u0443\u0434\u0430\u043b\u0435\u043d\u043d\u044b\u0435-\u0434\u0430\u043d\u043d\u044b\u0435",children:"\u0423\u0434\u0430\u043b\u0435\u043d\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435"}),"\n",(0,a.jsxs)(t.p,{children:["\u0414\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c\u044b\u043c\u0438 \u0434\u0430\u043d\u043d\u044b\u043c\u0438 \u043f\u0430\u043a\u0435\u0442 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u043d\u0430\u0431\u043e\u0440 \u0443\u0442\u0438\u043b\u0438\u0442 ",(0,a.jsx)(t.code,{children:"RemoteData"}),"."]}),"\n",(0,a.jsxs)(t.p,{children:["\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f \u0432\u043c\u0435\u0441\u0442\u0435 \u0441 ",(0,a.jsx)(t.code,{children:"createAction"})," \u0438 ",(0,a.jsx)(t.code,{children:"createReducer"})," \u0438\u0437 \u043f\u0430\u043a\u0435\u0442\u0430 ",(0,a.jsx)(t.code,{children:"@reduxjs/toolkit"}),":"]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-ts",children:"import { createAction, createReducer } from '@reduxjs/toolkit';\nimport { RemoteData, RemoteDataState } from '@sima-land/isomorph/utils/redux';\n\ninterface MyData {\n  id: number;\n  name: string;\n}\n\ninterface MyDataState extends RemoteDataState<MyData | null, string | null> {\n  readonly myCustomProperty: boolean;\n}\n\nconst initialState: MyDataState = {\n  data: null,\n  error: null,\n  status: RemoteData.STATUS.initial,\n  myCustomProperty: false,\n};\n\nconst actions = {\n  myCustomAction: createAction('my-data/myCustomAction'),\n\n  // \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u043c action'\u044b \u0434\u043b\u044f \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0434\u0430\u043d\u043d\u044b\u0445: request, success, failure\n  ...RemoteData.createActions<MyData, string>('my-data'),\n};\n\nconst reducer = createReducer(initialState, builder => {\n  // \u043f\u0440\u0438\u043c\u0435\u043d\u044f\u0435\u043c \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0438 action'\u043e\u0432 \u043a reducer'\u0443\n  RemoteData.applyReducers<MyData, string>(actions, builder);\n});\n\nconst selectors = {\n  // \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u043c \u0431\u0430\u0437\u043e\u0432\u044b\u0435 \u0441\u0435\u043b\u0435\u043a\u0442\u043e\u0440\u044b (\u0434\u0430\u043d\u043d\u044b\u0445, \u0441\u0442\u0430\u0442\u0443\u0441\u0430, \u043a\u043e\u043b-\u0432\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a \u0438 \u0442\u0434)\n  ...RemoteData.createSelectors<MyDataState, { slice: MyDataState }>(rootState => rootState.slice),\n};\n\nexport const MyData = {\n  initialState,\n  actions,\n  reducer,\n  selectors,\n} as const;\n"})}),"\n",(0,a.jsxs)(t.p,{children:["\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f \u0432\u043c\u0435\u0441\u0442\u0435 \u0441 ",(0,a.jsx)(t.code,{children:"createSlice"})," \u0438\u0437 \u043f\u0430\u043a\u0435\u0442\u0430 ",(0,a.jsx)(t.code,{children:"@reduxjs/toolkit"}),";"]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-ts",children:"import { createSlice } from '@reduxjs/toolkit';\nimport { RemoteData, RemoteDataState } from '@sima-land/isomorph/utils/redux';\n\ninterface MyData {\n  id: number;\n  name: string;\n}\n\ninterface MyDataState extends RemoteDataState<MyData | null, string | null> {\n  readonly myCustomProperty: boolean;\n}\n\nconst initialState: MyDataState = {\n  data: null,\n  error: null,\n  status: RemoteData.STATUS.initial,\n  myCustomProperty: false,\n};\n\nexport const MyData = createSlice({\n  name: 'my-data',\n  initialState,\n  reducers: {\n    ...RemoteData.createHandlers<MyData, string>(),\n  },\n});\n\n// ...\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u0435 RemoteData.createSelectors \u043f\u043e \u0430\u043d\u0430\u043b\u043e\u0433\u0438\u0438 \u0441 \u043f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0438\u043c \u043f\u0440\u0438\u043c\u0435\u0440\u043e\u043c\n"})})]})}function u(e={}){const{wrapper:t}={...(0,r.a)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(d,{...e})}):d(e)}},1151:(e,t,n)=>{n.d(t,{Z:()=>i,a:()=>s});var a=n(7294);const r={},o=a.createContext(r);function s(e){const t=a.useContext(o);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:s(e.components),a.createElement(o.Provider,{value:t},e.children)}}}]);