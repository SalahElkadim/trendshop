const PIXEL_ID = "D9B1U2RC77U3GHS8GQKG";

let initialized = false;

export const initTikTokPixel = () => {
  if (initialized || typeof window === "undefined") {
    return;
  }

  !(function (w, d, t) {
    w.TiktokAnalyticsObject = t;

    const ttq = (w[t] = w[t] || []);

    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
    ];

    ttq.setAndDefer = function (t, e) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };

    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }

    ttq.load = function (e) {
      const scriptUrl = "https://analytics.tiktok.com/i18n/pixel/events.js";

      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = scriptUrl;

      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();

      ttq._o = ttq._o || {};
      ttq._o[e] = {};

      const script = d.createElement("script");

      script.type = "text/javascript";
      script.async = true;
      script.src = `${scriptUrl}?sdkid=${e}&lib=${t}`;

      const firstScript = d.getElementsByTagName("script")[0];

      firstScript.parentNode.insertBefore(script, firstScript);
    };

    ttq.load(PIXEL_ID);
    ttq.page();
  })(window, document, "ttq");

  initialized = true;
};

export const pageView = () => {
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.page();
  }
};

export const trackEvent = (event, data = {}) => {
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(event, data);
  }
};
