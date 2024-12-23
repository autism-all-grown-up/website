(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.markedCustomHeadingId = factory());
})(this, (function () { 'use strict';

  function customHeadingId() {
    return {
      useNewRenderer: true,
      renderer: {
        heading({ text, depth }) {
          const headingIdRegex = /(?: +|^)\{#([a-z][\w-]*)\}(?: +|$)/i;
          const hasId = text.match(headingIdRegex);
          if (!hasId) {
            // fallback to original heading renderer
            return false;
          }
          return `<h${depth} id="${hasId[1]}">${text.replace(headingIdRegex, '')}</h${depth}>\n`;
        },
      },
    };
  }

  return customHeadingId;

}));
