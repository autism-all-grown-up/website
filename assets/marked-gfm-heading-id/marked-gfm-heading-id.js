/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/marked-gfm-heading-id@4.1.0/src/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import e from"../github-slugger/github-slugger.js";let r=new e,t=[];const n=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;function s(e){return e.replace(n,((e,r)=>"colon"===(r=r.toLowerCase())?":":"#"===r.charAt(0)?"x"===r.charAt(1)?String.fromCharCode(parseInt(r.substring(2),16)):String.fromCharCode(+r.substring(1)):""))}function o({prefix:e="",globalSlugs:n=!1}={}){return{headerIds:!1,hooks:{preprocess:e=>(n||a(),e)},useNewRenderer:!0,renderer:{heading({tokens:n,depth:o}){const i=this.parser.parseInline(n),a=s(this.parser.parseInline(n,this.parser.textRenderer)).trim().replace(/<[!\/a-z].*?>/gi,""),u=o,p=`${e}${r.slug(a.toLowerCase())}`,l={level:u,text:i,id:p,raw:a};return t.push(l),`<h${u} id="${p}">${i}</h${u}>\n`}}}}function i(){return t}function a(){t=[],r=new e}export{i as getHeadingList,o as gfmHeadingId,a as resetHeadings,s as unescape};export default null;
