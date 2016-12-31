(function (root, utils) {
  if (document.createElement(utils.DETAILS) instanceof HTMLUnknownElement === false) {
    return;
  }

  utils.injectStylesheet('details-stylesheet', utils.DETAILS_STYLES);
  document.documentElement.className += ' ' + utils.CLASS_NAME;
  document.documentElement.addEventListener("click", utils.onToggle);
  
  // define open property
  Object.defineProperty(HTMLUnknownElement.prototype, "open", {
    set: function () {
      if (this.nodeName.toLowerCase() === utils.DETAILS) {
        var val = !!arguments[0] ? "open" : undefined,
            b = this.getAttribute('open');
        if (val !== b) {
          if (b === "open") {
            this.removeAttribute('open');
          } else {
            this.setAttribute('open', 'open');
          }
          this.dispatchEvent(new Event("toggle"));
        }
      }
    },
    get: function () {
      if (this.nodeName.toLowerCase() === utils.DETAILS) {
        return this.getAttribute('open') === "open";
      }
    }
  });
  return;
}(this, {
  DETAILS: 'details',
  SUMMARY: 'summary',
  CLASS_NAME: 'detailsStyles',
      
  DETAILS_STYLES: `.detailsStyles details:not([open]) > :not(summary) {
    display: none;
  }

  .detailsStyles details > summary:before {
    content: "▶"; display: inline-block; font-size: .8em; width: 1.5em;
  }

  .detailsStyles details[open] > summary:before {
    content: "▼";
  }`,

  /**
   * Inject details stylesheet
   */
  injectStylesheet : function (id, style) {
    if (!document.getElementById(id)) {
      var el = document.createElement('style');
      el.id = id;
      el.innerHTML = style;
      document.querySelector('head').appendChild(el);
    }
    return;
  },

  /**
   * Toggle handler
   */
  onToggle: function (e) {
    if (e.target.nodeName.toLowerCase() === "summary") {
      e.target.parentNode.open = !e.target.parentNode.open;
    }
  }
}));