/**
 * almond 0.0.3 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
var requirejs,require,define;!function(e){function n(e,n){if(e&&"."===e.charAt(0)&&n){n=n.split("/"),n=n.slice(0,n.length-1),e=n.concat(e.split("/"));var r,i;for(r=0;i=e[r];r++)if("."===i)e.splice(r,1),r-=1;else if(".."===i){if(1===r&&(".."===e[2]||".."===e[0]))break;r>0&&(e.splice(r-1,2),r-=2)}e=e.join("/")}return e}function r(n,r){return function(){return c.apply(e,p.call(arguments,0).concat([n,r]))}}function i(e){return function(r){return n(r,e)}}function t(e){return function(n){s[e]=n}}function f(n){if(l.hasOwnProperty(n)){var r=l[n];delete l[n],u.apply(e,r)}return s[n]}function o(e,r){var t,o,u=e.indexOf("!");return-1!==u?(t=n(e.slice(0,u),r),e=e.slice(u+1),o=f(t),e=o&&o.normalize?o.normalize(e,i(r)):n(e,r)):e=n(e,r),{f:t?t+"!"+e:e,n:e,p:o}}var u,c,s={},l={},p=[].slice;"function"!=typeof define&&(u=function(n,i,u,c){var p,a,d,y,g,h,m=[];if(c||(c=n),"function"==typeof u){for(!i.length&&u.length&&(i=["require","exports","module"]),y=0;y<i.length;y++)if(h=o(i[y],c),d=h.f,"require"===d)m[y]=r(n);else if("exports"===d)m[y]=s[n]={},p=!0;else if("module"===d)a=m[y]={id:n,uri:"",exports:s[n]};else if(s.hasOwnProperty(d)||l.hasOwnProperty(d))m[y]=f(d);else{if(!h.p)throw n+" missing "+d;h.p.load(h.n,r(c,!0),t(d),{}),m[y]=s[d]}g=u.apply(s[n],m),n&&(a&&a.exports!==e?s[n]=a.exports:p||(s[n]=g))}else n&&(s[n]=u)},requirejs=c=function(n,r,i,t){return"string"==typeof n?f(o(n,r).f):(n.splice||(r.splice?(n=r,r=arguments[2]):n=[]),t?u(e,n,r,i):setTimeout(function(){u(e,n,r,i)},15),c)},c.config=function(){return c},require||(require=c),define=function(e,n,r){n.splice||(r=n,n=[]),define.unordered?l[e]=[e,n,r]:u(e,n,r)},define.amd={jQuery:!0})}();