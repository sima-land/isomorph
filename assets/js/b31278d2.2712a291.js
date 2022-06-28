"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[805],{3905:function(e,n,t){t.d(n,{Zo:function(){return s},kt:function(){return m}});var r=t(7294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function p(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var c=r.createContext({}),l=function(e){var n=r.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):p(p({},n),e)),t},s=function(e){var n=l(e.components);return r.createElement(c.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,i=e.originalType,c=e.parentName,s=a(e,["components","mdxType","originalType","parentName"]),d=l(t),m=o,f=d["".concat(c,".").concat(m)]||d[m]||u[m]||i;return t?r.createElement(f,p(p({ref:n},s),{},{components:t})):r.createElement(f,p({ref:n},s))}));function m(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var i=t.length,p=new Array(i);p[0]=d;var a={};for(var c in n)hasOwnProperty.call(n,c)&&(a[c]=n[c]);a.originalType=e,a.mdxType="string"==typeof e?e:o,p[1]=a;for(var l=2;l<i;l++)p[l]=t[l];return r.createElement.apply(null,p)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},8468:function(e,n,t){t.r(n),t.d(n,{assets:function(){return s},contentTitle:function(){return c},default:function(){return m},frontMatter:function(){return a},metadata:function(){return l},toc:function(){return u}});var r=t(7462),o=t(3366),i=(t(7294),t(3905)),p=["components"],a={sidebar_position:2},c="\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435",l={unversionedId:"dependency-injection/application",id:"dependency-injection/application",title:"\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435",description:'DI-\u043a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440 \u0438\u043c\u0435\u0435\u0442 \u043b\u0438\u0448\u044c \u0434\u0432\u0430 \u043c\u0435\u0442\u043e\u0434\u0430: get \u0438 set. \u0414\u043b\u044f \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0433\u043e\u0442\u043e\u0432\u044b\u0445 \u043a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440\u043e\u0432, \u0438\u043c\u0435\u044e\u0449\u0438\u0445 \u043f\u0440\u0438 \u044d\u0442\u043e\u043c \u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u044c \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u044f \u0438 \u043f\u043e\u0434\u043c\u0435\u043d\u044b \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0445 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u043e\u0432, \u043f\u0430\u043a\u0435\u0442 isomorph \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0430\u0431\u0441\u0442\u0440\u0430\u043a\u0446\u0438\u044e "Application" \u0432 \u0432\u0438\u0434\u0435 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430 \u0438 \u0435\u0435 \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u0438.',source:"@site/docs/dependency-injection/application.md",sourceDirName:"dependency-injection",slug:"/dependency-injection/application",permalink:"/isomorph/dependency-injection/application",draft:!1,tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"\u0412\u0432\u0435\u0434\u0435\u043d\u0438\u0435",permalink:"/isomorph/dependency-injection/container"},next:{title:"\u041f\u0440\u0435\u0441\u0435\u0442\u044b",permalink:"/isomorph/dependency-injection/preset"}},s={},u=[{value:"Application",id:"application",level:2},{value:"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f",level:3}],d={toc:u};function m(e){var n=e.components,t=(0,o.Z)(e,p);return(0,i.kt)("wrapper",(0,r.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435"},"\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435"),(0,i.kt)("p",null,"DI-\u043a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440 \u0438\u043c\u0435\u0435\u0442 \u043b\u0438\u0448\u044c \u0434\u0432\u0430 \u043c\u0435\u0442\u043e\u0434\u0430: get \u0438 set. \u0414\u043b\u044f \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0433\u043e\u0442\u043e\u0432\u044b\u0445 \u043a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440\u043e\u0432, \u0438\u043c\u0435\u044e\u0449\u0438\u0445 \u043f\u0440\u0438 \u044d\u0442\u043e\u043c \u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u044c \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u044f \u0438 \u043f\u043e\u0434\u043c\u0435\u043d\u044b \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0445 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u043e\u0432, \u043f\u0430\u043a\u0435\u0442 ",(0,i.kt)("strong",{parentName:"p"},"isomorph"),' \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0430\u0431\u0441\u0442\u0440\u0430\u043a\u0446\u0438\u044e "Application" \u0432 \u0432\u0438\u0434\u0435 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430 \u0438 \u0435\u0435 \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u0438.'),(0,i.kt)("p",null,'\u0414\u043b\u044f \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u044f \u0431\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u043d\u0430\u0431\u043e\u0440\u0430 \u0437\u0430\u0432\u0438\u0441\u0438\u043c\u043e\u0441\u0442\u0435\u0439 \u0441 \u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u044c\u044e \u0435\u0433\u043e \u043f\u0440\u0438\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u043a \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f\u043c, \u0442\u0430\u043a\u0436\u0435 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0430\u0431\u0441\u0442\u0440\u0430\u043a\u0446\u0438\u044f "Preset" \u0438 \u0435\u0435 \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f.'),(0,i.kt)("h2",{id:"application"},"Application"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Application")," - \u043a\u043b\u0430\u0441\u0441 \u043e\u0431\u044a\u0435\u043a\u0442\u043e\u0432 \u0440\u0435\u0430\u043b\u0438\u0437\u0443\u044e\u0449\u0438\u0445 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u043d\u044b\u0439 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b DI-\u043a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440\u043e\u0432."),(0,i.kt)("h3",{id:"\u043f\u0440\u0438\u043c\u0435\u0440-\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f"},"\u041f\u0440\u0438\u043c\u0435\u0440 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f"),(0,i.kt)("p",null,"\u0414\u043b\u044f \u043d\u0430\u0447\u0430\u043b\u0430 \u0441\u043e\u0437\u0434\u0430\u0434\u0438\u043c \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0434\u043b\u044f \u043d\u0430\u0448\u0435\u0433\u043e Node.js \u0441\u0435\u0440\u0432\u0435\u0440\u0430. \u041f\u0440\u0435\u0434\u043f\u043e\u043b\u0430\u0433\u0430\u0435\u0442\u0441\u044f \u0447\u0442\u043e \u0443 \u043d\u0430\u0441 \u0443\u0436\u0435 \u0435\u0441\u0442\u044c \u043a\u043e\u043d\u0441\u0442\u0430\u043d\u0442\u0430 \u0441 \u0442\u043e\u043a\u0435\u043d\u0430\u043c\u0438 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u043e\u0432."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="app.ts"',title:'"app.ts"'},"import { createApplication } from '@sima-land/isomorph/di';\n\nexport const app = createApplication();\n\n// \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u0435\u043c \u043a\u043e\u043d\u0441\u0442\u0430\u043d\u0442\u043d\u043e\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435\napp.bind(Token.config).toValue({ appName: 'ExampleApp' });\n\n// \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u0435\u043c \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442 \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e \u043f\u0440\u043e\u0432\u0430\u0439\u0434\u0435\u0440\u0430\napp.bind(Token.logger).toProvider(provideLogger);\n")),(0,i.kt)("p",null,'\u0410\u043d\u0430\u043b\u043e\u0433\u0438\u0447\u043d\u043e DI-\u043a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440\u0443, \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u044b, \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u0447\u0435\u0440\u0435\u0437 \u043f\u0440\u043e\u0432\u0430\u0439\u0434\u0435\u0440 \u0431\u0443\u0434\u0443\u0442 \u0438\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c\u0441\u044f "\u043b\u0435\u043d\u0438\u0432\u043e".'),(0,i.kt)("p",null,"\u041f\u043e\u0441\u043b\u0435 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u043c\u044b \u043c\u043e\u0436\u0435\u043c \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u044b \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e \u043c\u0435\u0442\u043e\u0434\u0430 ",(0,i.kt)("strong",{parentName:"p"},"get")," \u0438\u043b\u0438 \u0432\u044b\u0437\u0432\u0430\u0442\u044c callback \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u0438\u0445 \u043f\u043e\u043b\u0443\u0447\u0438\u0442 \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e \u043c\u0435\u0442\u043e\u0434\u0430 ",(0,i.kt)("strong",{parentName:"p"},"invoke"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="index.ts"',title:'"index.ts"'},"import { app } from './app';\n\napp.invoke([Token.config, Token.logger], (config, logger) => {\n  logger.info(config.appName);\n});\n")),(0,i.kt)("p",null,"\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f \u043c\u043e\u0436\u043d\u043e \u0441\u0432\u044f\u0437\u044b\u0432\u0430\u0442\u044c \u043c\u0435\u0436\u0434\u0443 \u0441\u043e\u0431\u043e\u0439 \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e \u043c\u0435\u0442\u043e\u0434\u0430 ",(0,i.kt)("strong",{parentName:"p"},"attach"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"import { createApplication } from '@sima-land/isomorph/di';\n\nconst parentApp = createApplication();\nconst childApp = createApplication();\n\nchildApp.attach(parentApp);\n")),(0,i.kt)("p",null,'\u041f\u0440\u0438 \u043f\u043e\u043f\u044b\u0442\u043a\u0435 \u0434\u043e\u0441\u0442\u0430\u0442\u044c \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442 \u0438\u0437 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f, \u0432 \u0441\u043b\u0443\u0447\u0430\u0435 \u0435\u0441\u043b\u0438 \u043e\u043d \u043d\u0435 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d, \u0431\u0443\u0434\u0435\u0442 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d \u043f\u043e\u0438\u0441\u043a \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u0430 \u043f\u043e \u0442\u043e\u043a\u0435\u043d\u0443 \u0432 "\u0440\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u0441\u043a\u043e\u043c" \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0438. \u041e\u0434\u043d\u0430\u043a\u043e "\u0440\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u0441\u043a\u043e\u0435" \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0438\u043c\u0435\u0442\u044c \u0434\u043e\u0441\u0442\u0443\u043f\u0430 \u043a \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u0430\u043c \u0441\u0432\u043e\u0438\u0445 "\u043f\u043e\u0442\u043e\u043c\u043a\u043e\u0432".'))}m.isMDXComponent=!0}}]);