/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/marked-custom-heading-id@2.0.10/src/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
function e(){return{useNewRenderer:!0,renderer:{heading({text:e,depth:r}){const t=/(?: +|^)\{#([a-z][\w-]*)\}(?: +|$)/i,n=e.match(t);return!!n&&`<h${r} id="${n[1]}">${e.replace(t,"")}</h${r}>\n`}}}}export{e as default};
