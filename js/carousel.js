/**
 * 
 */

Drupal.locale = {
    'strings': {
        "": {
            "All": "\u6240\u6709"
        }
    }
};; +
function($) {
    "use strict";
    var Carousel = function(element, options) {
        this.$element = $(element);
        this.$slides = this.$element.find('article');
        this._options = options;
        this._index = 0;
        this._timer = null;
        this._touch = {};
        this.timers = [];
        this.isRunning = false;
        this.setup();
    };
    Carousel.VERSION = '1.8';
    Carousel.DEFAULTS = {
        tick: 7000,
        transition_time: 660,
        swipeAmount: 20,
        transitionEnd: "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
        isGPU: false,
    };
    Carousel.prototype.supportsGPU = function() {
        var el = document.createElement('div');
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                this._options.isGPU = true;
            }
        };
    };
    Carousel.prototype.setup = function() {
        this.triggerAnimations();
        if (this.$slides.length <= 1) return true;
        this.supportsGPU();
        this.indicators();
        this.controls();
        this.startTimer();
    };
    Carousel.prototype.patchIE = function() {};
    Carousel.prototype.indicators = function() {
        var ul = $('<ul />').addClass('indicators');
        this.$slides.each(function(index, element) {
            var li = $('<li />').on('click',
            function() {
                if (index > this._index) {
                    this._index = index - 1;
                    this.next();
                } else if (index < this._index) {
                    this._index = index + 1;
                    this.prev();
                }
            }.bind(this)).append('<span />');
            ul.append(li);
        }.bind(this));
        ul.find('li').eq('0').addClass('active');
        this.$element.append(ul);
    };
    Carousel.prototype.updateIndicators = function() {
        var indicator = this.$element.find('.indicators');
        indicator.find('.active').removeClass('active').end().find('li').eq(this._index).addClass('active');
    };
    Carousel.prototype.controls = function() {
        var left = $('<div/>').addClass('prev-left').on('click',
        function() {
            this.prev();
            return;
        }.bind(this));
        var right = $('<div/>').addClass('next-right').on('click',
        function() {
            this.next();
            return;
        }.bind(this));
        this.$element.append(left, right);
        this.$element.on('touchstart', this.touchstart.bind(this));
        this.$element.on('touchmove', this.touchmove.bind(this));
        this.$element.on('touchend', this.touchend.bind(this));
        $(document).keydown(function(e) {
            switch (e.keyCode) {
            case 37:
                this.prev();
                break;
            case 39:
                this.next();
                break;
            }
        }.bind(this));
    };
    Carousel.prototype.touchstart = function(e) {
        if (e.originalEvent.changedTouches) {
            var touch = e.originalEvent.changedTouches[0];
        } else {
            var touch = e.originalEvent;
        }
        this._touch.startX = touch.clientX;
        this._touch.startY = touch.clientY;
        this._touch.startTime = new Date().getTime() this._touch.swipped = false;
    };
    Carousel.prototype.touchmove = function(e) {
        if (e.originalEvent.changedTouches) {
            var touch = e.originalEvent.changedTouches[0];
        } else {
            var touch = e.originalEvent;
        }
        if (this._touch.swipped) {
            return false;
        }
        if ((this._touch.startX - touch.clientX) > this._options.swipeAmount) {
            this._touch.swipped = true;
            this.next();
            return;
        } else if ((this._touch.startX - touch.clientX) < -parseFloat(this._options.swipeAmount)) {
            this._touch.swipped = true;
            this.prev();
            return;
        }
    };
    Carousel.prototype.touchend = function(e) {
        this._touch.swipped = true;
    };
    Carousel.prototype.nextCSS3 = function(delay) {
        var $out = $(this.$slides).filter('.active');
        var $in = $(this.$slides[this._index]);
        $out.css({
            'transition': 'transform ' + delay + 'ms',
            '-webkit-transition': '-webkit-transform ' + delay + 'ms',
        }).one(this._options.transitionEnd,
        function() {
            $(this).removeClass('active').removeClass('left').attr({
                'style': null
            }).off().find('.activated').removeClass('activated')
        });
        $in.css({
            'transition': 'transform ' + delay + 'ms',
            '-webkit-transition': '-webkit-transform ' + delay + 'ms',
        }).addClass('right').addClass('active').one(this._options.transitionEnd,
        function() {
            $(this).attr({
                'style': null
            }).off();
            this.isRunning = false;
        }.bind(this));
        this.triggerAnimations();
        $out.addClass('left');
        $in.removeClass('right');
    };
    Carousel.prototype.prevCSS3 = function(delay) {
        var $out = $(this.$slides).filter('.active');
        var $in = $(this.$slides[this._index]);
        $out.css({
            'transition': 'transform ' + delay + 'ms',
            '-webkit-transition': '-webkit-transform ' + delay + 'ms',
        }).one(this._options.transitionEnd,
        function() {
            $(this).removeClass('active').removeClass('right').attr({
                'style': null
            }).off().find('.activated').removeClass('activated')
        });
        $in.css({
            'transition': 'transform ' + delay + 'ms',
            '-webkit-transition': '-webkit-transform ' + delay + 'ms',
        }).addClass('left').addClass('active').one(this._options.transitionEnd,
        function() {
            $(this).attr({
                'style': null
            }).off();
            this.isRunning = false;
        }.bind(this));
        this.triggerAnimations();
        $in.removeClass('left');
        $out.addClass('right');
    };
    Carousel.prototype.nextCSS2 = function(delay) {
        var width = $(this.$slides[this._index]).width();
        $(this.$slides).filter('.active').animate({
            left: -parseFloat(width) + "px"
        },
        delay,
        function() {
            $(this).removeClass('active');
            $(this).find('.activated').removeClass('activated');
        });
        var parent = $(this.$slides[this._index]);
        parent.addClass('active').css({
            left: parseFloat(width) + "px"
        }).animate({
            left: "0"
        },
        delay,
        function() {
            this.triggerAnimations();
            this.isRunning = false;
        }.bind(this));
    };
    Carousel.prototype.prevCSS2 = function(delay) {
        var width = $(this.$slides[this._index]).width();
        $(this.$slides).filter('.active').animate({
            left: parseFloat(width) + "px"
        },
        delay,
        function() {
            $(this).removeClass('active');
            $(this).find('.activated').removeClass('activated');
        });
        var parent = $(this.$slides[this._index]);
        parent.addClass('active').css({
            left: -parseFloat(width) + "px"
        }).animate({
            left: "0"
        },
        delay,
        function() {
            this.triggerAnimations();
            this.isRunning = false;
        }.bind(this));
    };
    Carousel.prototype.next = function() {
        if (this.isRunning) return false;
        this.isRunning = true;
        var delay = this._options.transition_time;
        if ($('html').width() < 480) {
            delay = delay * 0.7;
        }
        if (this._index < this.$slides.length - 1) {
            this._index++;
        } else {
            this._index = 0;
        }
        this.updateIndicators();
        if (this._options.isGPU) {
            this.nextCSS3(delay);
        } else {
            this.nextCSS2(delay);
        }
        this.startTimer();
    };
    Carousel.prototype.prev = function() {
        if (this.isRunning) return false;
        this.isRunning = true;
        var delay = this._options.transition_time;
        if ($('html').width() < 480) {
            delay = delay * 0.7;
        }
        var width = $(this.$slides[this._index]).width();
        if (this._index > 0) {
            this._index--;
        } else {
            this._index = this.$slides.length - 1;
        }
        this.updateIndicators();
        if (this._options.isGPU) {
            this.prevCSS3(delay);
        } else {
            this.prevCSS2(delay);
        }
        this.startTimer();
    };
    Carousel.prototype.triggerAnimations = function() {
        var parent = $(this.$slides[this._index]);
        this.timers.forEach(function(timer, index) {
            this.timers[index] = clearTimeout(timer);
            delete this.timers[index];
            this.$slides.find('[data-delay].activated').each(function(index, target) {
                $(this).removeClass('activated');
            });
        }.bind(this));
        parent.find('[data-delay]').each(function(index, target) {
            var delay = $(target).data('delay');
            if ($('html').width() < 480) {
                delay = (delay - 800);
            }
            var timer = setTimeout(function() {
                $(target).addClass('activated');
            },
            delay);
            this.timers.push(timer);
        }.bind(this));
    };
    Carousel.prototype.startTimer = function() {
        clearInterval(this._timer);
        this._timer = setInterval(function() {
            this.next();
        }.bind(this), this._options.tick);
    };
    function Plugin(option, args) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('carousel');
            if (!data) $this.data('carousel', (data = new Carousel(this, Carousel.DEFAULTS)));
        })
    }
    var old = $.fn.carousel;
    $.fn.carousel = Plugin;
    $.fn.carousel.Constructor = Carousel;
    $.fn.carousel.noConflict = function() {
        $.fn.carousel = old;
        return this;
    };
} (jQuery);;
/* Modernizr 2.7.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-fontface-backgroundsize-flexbox-flexboxlegacy-multiplebgs-opacity-rgba-csscolumns-generatedcontent-hashchange-history-audio-video-inlinesvg-svg-svgclippaths-touch-shiv-mq-cssclasses-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-css_displaytable-css_mediaqueries-fullscreen_api-svg_filters-load
 */
;
window.Modernizr = function(a, b, c) {
    function D(a) {
        j.cssText = a
    }
    function E(a, b) {
        return D(n.join(a + ";") + (b || ""))
    }
    function F(a, b) {
        return typeof a === b
    }
    function G(a, b) {
        return !! ~ ("" + a).indexOf(b)
    }
    function H(a, b) {
        for (var d in a) {
            var e = a[d];
            if (!G(e, "-") && j[e] !== c) return b == "pfx" ? e: !0
        }
        return ! 1
    }
    function I(a, b, d) {
        for (var e in a) {
            var f = b[a[e]];
            if (f !== c) return d === !1 ? a[e] : F(f, "function") ? f.bind(d || b) : f
        }
        return ! 1
    }
    function J(a, b, c) {
        var d = a.charAt(0).toUpperCase() + a.slice(1),
        e = (a + " " + p.join(d + " ") + d).split(" ");
        return F(b, "string") || F(b, "undefined") ? H(e, b) : (e = (a + " " + q.join(d + " ") + d).split(" "), I(e, b, c))
    }
    var d = "2.7.1",
    e = {},
    f = !0,
    g = b.documentElement,
    h = "modernizr",
    i = b.createElement(h),
    j = i.style,
    k,
    l = ":)",
    m = {}.toString,
    n = " -webkit- -moz- -o- -ms- ".split(" "),
    o = "Webkit Moz O ms",
    p = o.split(" "),
    q = o.toLowerCase().split(" "),
    r = {
        svg: "http://www.w3.org/2000/svg"
    },
    s = {},
    t = {},
    u = {},
    v = [],
    w = v.slice,
    x,
    y = function(a, c, d, e) {
        var f, i, j, k, l = b.createElement("div"),
        m = b.body,
        n = m || b.createElement("body");
        if (parseInt(d, 10)) while (d--) j = b.createElement("div"),
        j.id = e ? e[d] : h + (d + 1),
        l.appendChild(j);
        return f = ["&#173;", '<style id="s', h, '">', a, "</style>"].join(""),
        l.id = h,
        (m ? l: n).innerHTML += f,
        n.appendChild(l),
        m || (n.style.background = "", n.style.overflow = "hidden", k = g.style.overflow, g.style.overflow = "hidden", g.appendChild(n)),
        i = c(l, a),
        m ? l.parentNode.removeChild(l) : (n.parentNode.removeChild(n), g.style.overflow = k),
        !!i
    },
    z = function(b) {
        var c = a.matchMedia || a.msMatchMedia;
        if (c) return c(b).matches;
        var d;
        return y("@media " + b + " { #" + h + " { position: absolute; } }",
        function(b) {
            d = (a.getComputedStyle ? getComputedStyle(b, null) : b.currentStyle)["position"] == "absolute"
        }),
        d
    },
    A = function() {
        function d(d, e) {
            e = e || b.createElement(a[d] || "div"),
            d = "on" + d;
            var f = d in e;
            return f || (e.setAttribute || (e = b.createElement("div")), e.setAttribute && e.removeAttribute && (e.setAttribute(d, ""), f = F(e[d], "function"), F(e[d], "undefined") || (e[d] = c), e.removeAttribute(d))),
            e = null,
            f
        }
        var a = {
            select: "input",
            change: "input",
            submit: "form",
            reset: "form",
            error: "img",
            load: "img",
            abort: "img"
        };
        return d
    } (),
    B = {}.hasOwnProperty,
    C; ! F(B, "undefined") && !F(B.call, "undefined") ? C = function(a, b) {
        return B.call(a, b)
    }: C = function(a, b) {
        return b in a && F(a.constructor.prototype[b], "undefined")
    },
    Function.prototype.bind || (Function.prototype.bind = function(b) {
        var c = this;
        if (typeof c != "function") throw new TypeError;
        var d = w.call(arguments, 1),
        e = function() {
            if (this instanceof e) {
                var a = function() {};
                a.prototype = c.prototype;
                var f = new a,
                g = c.apply(f, d.concat(w.call(arguments)));
                return Object(g) === g ? g: f
            }
            return c.apply(b, d.concat(w.call(arguments)))
        };
        return e
    }),
    s.flexbox = function() {
        return J("flexWrap")
    },
    s.flexboxlegacy = function() {
        return J("boxDirection")
    },
    s.touch = function() {
        var c;
        return "ontouchstart" in a || a.DocumentTouch && b instanceof DocumentTouch ? c = !0 : y(["@media (", n.join("touch-enabled),("), h, ")", "{#modernizr{top:9px;position:absolute}}"].join(""),
        function(a) {
            c = a.offsetTop === 9
        }),
        c
    },
    s.hashchange = function() {
        return A("hashchange", a) && (b.documentMode === c || b.documentMode > 7)
    },
    s.history = function() {
        return !! a.history && !!history.pushState
    },
    s.rgba = function() {
        return D("background-color:rgba(150,255,150,.5)"),
        G(j.backgroundColor, "rgba")
    },
    s.multiplebgs = function() {
        return D("background:url(https://),url(https://),red url(https://)"),
        /(url\s*\(.*?){3}/.test(j.background)
    },
    s.backgroundsize = function() {
        return J("backgroundSize")
    },
    s.opacity = function() {
        return E("opacity:.55"),
        /^0.55$/.test(j.opacity)
    },
    s.csscolumns = function() {
        return J("columnCount")
    },
    s.fontface = function() {
        var a;
        return y('@font-face {font-family:"font";src:url("https://")}',
        function(c, d) {
            var e = b.getElementById("smodernizr"),
            f = e.sheet || e.styleSheet,
            g = f ? f.cssRules && f.cssRules[0] ? f.cssRules[0].cssText: f.cssText || "": "";
            a = /src/i.test(g) && g.indexOf(d.split(" ")[0]) === 0
        }),
        a
    },
    s.generatedcontent = function() {
        var a;
        return y(["#", h, "{font:0/0 a}#", h, ':after{content:"', l, '";visibility:hidden;font:3px/1 a}'].join(""),
        function(b) {
            a = b.offsetHeight >= 3
        }),
        a
    },
    s.video = function() {
        var a = b.createElement("video"),
        c = !1;
        try {
            if (c = !!a.canPlayType) c = new Boolean(c),
            c.ogg = a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ""),
            c.h264 = a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ""),
            c.webm = a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, "")
        } catch(d) {}
        return c
    },
    s.audio = function() {
        var a = b.createElement("audio"),
        c = !1;
        try {
            if (c = !!a.canPlayType) c = new Boolean(c),
            c.ogg = a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            c.mp3 = a.canPlayType("audio/mpeg;").replace(/^no$/, ""),
            c.wav = a.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""),
            c.m4a = (a.canPlayType("audio/x-m4a;") || a.canPlayType("audio/aac;")).replace(/^no$/, "")
        } catch(d) {}
        return c
    },
    s.svg = function() {
        return !! b.createElementNS && !!b.createElementNS(r.svg, "svg").createSVGRect
    },
    s.inlinesvg = function() {
        var a = b.createElement("div");
        return a.innerHTML = "<svg/>",
        (a.firstChild && a.firstChild.namespaceURI) == r.svg
    },
    s.svgclippaths = function() {
        return !! b.createElementNS && /SVGClipPath/.test(m.call(b.createElementNS(r.svg, "clipPath")))
    };
    for (var K in s) C(s, K) && (x = K.toLowerCase(), e[x] = s[K](), v.push((e[x] ? "": "no-") + x));
    return e.addTest = function(a, b) {
        if (typeof a == "object") for (var d in a) C(a, d) && e.addTest(d, a[d]);
        else {
            a = a.toLowerCase();
            if (e[a] !== c) return e;
            b = typeof b == "function" ? b() : b,
            typeof f != "undefined" && f && (g.className += " " + (b ? "": "no-") + a),
            e[a] = b
        }
        return e
    },
    D(""),
    i = k = null,
    function(a, b) {
        function l(a, b) {
            var c = a.createElement("p"),
            d = a.getElementsByTagName("head")[0] || a.documentElement;
            return c.innerHTML = "x<style>" + b + "</style>",
            d.insertBefore(c.lastChild, d.firstChild)
        }
        function m() {
            var a = s.elements;
            return typeof a == "string" ? a.split(" ") : a
        }
        function n(a) {
            var b = j[a[h]];
            return b || (b = {},
            i++, a[h] = i, j[i] = b),
            b
        }
        function o(a, c, d) {
            c || (c = b);
            if (k) return c.createElement(a);
            d || (d = n(c));
            var g;
            return d.cache[a] ? g = d.cache[a].cloneNode() : f.test(a) ? g = (d.cache[a] = d.createElem(a)).cloneNode() : g = d.createElem(a),
            g.canHaveChildren && !e.test(a) && !g.tagUrn ? d.frag.appendChild(g) : g
        }
        function p(a, c) {
            a || (a = b);
            if (k) return a.createDocumentFragment();
            c = c || n(a);
            var d = c.frag.cloneNode(),
            e = 0,
            f = m(),
            g = f.length;
            for (; e < g; e++) d.createElement(f[e]);
            return d
        }
        function q(a, b) {
            b.cache || (b.cache = {},
            b.createElem = a.createElement, b.createFrag = a.createDocumentFragment, b.frag = b.createFrag()),
            a.createElement = function(c) {
                return s.shivMethods ? o(c, a, b) : b.createElem(c)
            },
            a.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + m().join().replace(/[\w\-]+/g,
            function(a) {
                return b.createElem(a),
                b.frag.createElement(a),
                'c("' + a + '")'
            }) + ");return n}")(s, b.frag)
        }
        function r(a) {
            a || (a = b);
            var c = n(a);
            return s.shivCSS && !g && !c.hasCSS && (c.hasCSS = !!l(a, "article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),
            k || q(a, c),
            a
        }
        var c = "3.7.0",
        d = a.html5 || {},
        e = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
        f = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
        g, h = "_html5shiv",
        i = 0,
        j = {},
        k; (function() {
            try {
                var a = b.createElement("a");
                a.innerHTML = "<xyz></xyz>",
                g = "hidden" in a,
                k = a.childNodes.length == 1 ||
                function() {
                    b.createElement("a");
                    var a = b.createDocumentFragment();
                    return typeof a.cloneNode == "undefined" || typeof a.createDocumentFragment == "undefined" || typeof a.createElement == "undefined"
                } ()
            } catch(c) {
                g = !0,
                k = !0
            }
        })();
        var s = {
            elements: d.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",
            version: c,
            shivCSS: d.shivCSS !== !1,
            supportsUnknownElements: k,
            shivMethods: d.shivMethods !== !1,
            type: "default",
            shivDocument: r,
            createElement: o,
            createDocumentFragment: p
        };
        a.html5 = s,
        r(b)
    } (this, b),
    e._version = d,
    e._prefixes = n,
    e._domPrefixes = q,
    e._cssomPrefixes = p,
    e.mq = z,
    e.hasEvent = A,
    e.testProp = function(a) {
        return H([a])
    },
    e.testAllProps = J,
    e.testStyles = y,
    g.className = g.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (f ? " js " + v.join(" ") : ""),
    e
} (this, this.document),
function(a, b, c) {
    function d(a) {
        return "[object Function]" == o.call(a)
    }
    function e(a) {
        return "string" == typeof a
    }
    function f() {}
    function g(a) {
        return ! a || "loaded" == a || "complete" == a || "uninitialized" == a
    }
    function h() {
        var a = p.shift();
        q = 1,
        a ? a.t ? m(function() { ("c" == a.t ? B.injectCss: B.injectJs)(a.s, 0, a.a, a.x, a.e, 1)
        },
        0) : (a(), h()) : q = 0
    }
    function i(a, c, d, e, f, i, j) {
        function k(b) {
            if (!o && g(l.readyState) && (u.r = o = 1, !q && h(), l.onload = l.onreadystatechange = null, b)) {
                "img" != a && m(function() {
                    t.removeChild(l)
                },
                50);
                for (var d in y[c]) y[c].hasOwnProperty(d) && y[c][d].onload()
            }
        }
        var j = j || B.errorTimeout,
        l = b.createElement(a),
        o = 0,
        r = 0,
        u = {
            t: d,
            s: c,
            e: f,
            a: i,
            x: j
        };
        1 === y[c] && (r = 1, y[c] = []),
        "object" == a ? l.data = c: (l.src = c, l.type = a),
        l.width = l.height = "0",
        l.onerror = l.onload = l.onreadystatechange = function() {
            k.call(this, r)
        },
        p.splice(e, 0, u),
        "img" != a && (r || 2 === y[c] ? (t.insertBefore(l, s ? null: n), m(k, j)) : y[c].push(l))
    }
    function j(a, b, c, d, f) {
        return q = 0,
        b = b || "j",
        e(a) ? i("c" == b ? v: u, a, b, this.i++, c, d, f) : (p.splice(this.i++, 0, a), 1 == p.length && h()),
        this
    }
    function k() {
        var a = B;
        return a.loader = {
            load: j,
            i: 0
        },
        a
    }
    var l = b.documentElement,
    m = a.setTimeout,
    n = b.getElementsByTagName("script")[0],
    o = {}.toString,
    p = [],
    q = 0,
    r = "MozAppearance" in l.style,
    s = r && !!b.createRange().compareNode,
    t = s ? l: n.parentNode,
    l = a.opera && "[object Opera]" == o.call(a.opera),
    l = !!b.attachEvent && !l,
    u = r ? "object": l ? "script": "img",
    v = l ? "script": u,
    w = Array.isArray ||
    function(a) {
        return "[object Array]" == o.call(a)
    },
    x = [],
    y = {},
    z = {
        timeout: function(a, b) {
            return b.length && (a.timeout = b[0]),
            a
        }
    },
    A,
    B;
    B = function(a) {
        function b(a) {
            var a = a.split("!"),
            b = x.length,
            c = a.pop(),
            d = a.length,
            c = {
                url: c,
                origUrl: c,
                prefixes: a
            },
            e,
            f,
            g;
            for (f = 0; f < d; f++) g = a[f].split("="),
            (e = z[g.shift()]) && (c = e(c, g));
            for (f = 0; f < b; f++) c = x[f](c);
            return c
        }
        function g(a, e, f, g, h) {
            var i = b(a),
            j = i.autoCallback;
            i.url.split(".").pop().split("?").shift(),
            i.bypass || (e && (e = d(e) ? e: e[a] || e[g] || e[a.split("/").pop().split("?")[0]]), i.instead ? i.instead(a, e, f, g, h) : (y[i.url] ? i.noexec = !0 : y[i.url] = 1, f.load(i.url, i.forceCSS || !i.forceJS && "css" == i.url.split(".").pop().split("?").shift() ? "c": c, i.noexec, i.attrs, i.timeout), (d(e) || d(j)) && f.load(function() {
                k(),
                e && e(i.origUrl, h, g),
                j && j(i.origUrl, h, g),
                y[i.url] = 2
            })))
        }
        function h(a, b) {
            function c(a, c) {
                if (a) {
                    if (e(a)) c || (j = function() {
                        var a = [].slice.call(arguments);
                        k.apply(this, a),
                        l()
                    }),
                    g(a, j, b, 0, h);
                    else if (Object(a) === a) for (n in m = function() {
                        var b = 0,
                        c;
                        for (c in a) a.hasOwnProperty(c) && b++;
                        return b
                    } (), a) a.hasOwnProperty(n) && (!c && !--m && (d(j) ? j = function() {
                        var a = [].slice.call(arguments);
                        k.apply(this, a),
                        l()
                    }: j[n] = function(a) {
                        return function() {
                            var b = [].slice.call(arguments);
                            a && a.apply(this, b),
                            l()
                        }
                    } (k[n])), g(a[n], j, b, n, h))
                } else ! c && l()
            }
            var h = !!a.test,
            i = a.load || a.both,
            j = a.callback || f,
            k = j,
            l = a.complete || f,
            m, n;
            c(h ? a.yep: a.nope, !!i),
            i && c(i)
        }
        var i, j, l = this.yepnope.loader;
        if (e(a)) g(a, 0, l, 0);
        else if (w(a)) for (i = 0; i < a.length; i++) j = a[i],
        e(j) ? g(j, 0, l, 0) : w(j) ? B(j) : Object(j) === j && h(j, l);
        else Object(a) === a && h(a, l)
    },
    B.addPrefix = function(a, b) {
        z[a] = b
    },
    B.addFilter = function(a) {
        x.push(a)
    },
    B.errorTimeout = 1e4,
    null == b.readyState && b.addEventListener && (b.readyState = "loading", b.addEventListener("DOMContentLoaded", A = function() {
        b.removeEventListener("DOMContentLoaded", A, 0),
        b.readyState = "complete"
    },
    0)),
    a.yepnope = k(),
    a.yepnope.executeStack = h,
    a.yepnope.injectJs = function(a, c, d, e, i, j) {
        var k = b.createElement("script"),
        l,
        o,
        e = e || B.errorTimeout;
        k.src = a;
        for (o in d) k.setAttribute(o, d[o]);
        c = j ? h: c || f,
        k.onreadystatechange = k.onload = function() { ! l && g(k.readyState) && (l = 1, c(), k.onload = k.onreadystatechange = null)
        },
        m(function() {
            l || (l = 1, c(1))
        },
        e),
        i ? k.onload() : n.parentNode.insertBefore(k, n)
    },
    a.yepnope.injectCss = function(a, c, d, e, g, i) {
        var e = b.createElement("link"),
        j,
        c = i ? h: c || f;
        e.href = a,
        e.rel = "stylesheet",
        e.type = "text/css";
        for (j in d) e.setAttribute(j, d[j]);
        g || (n.parentNode.insertBefore(e, n), m(c, 0))
    }
} (this, document),
Modernizr.load = function() {
    yepnope.apply(window, [].slice.call(arguments, 0))
},
Modernizr.addTest("mediaqueries", Modernizr.mq("only all")),
Modernizr.addTest("display-table",
function() {
    var a = window.document,
    b = a.documentElement,
    c = a.createElement("div"),
    d = a.createElement("div"),
    e = a.createElement("div"),
    f;
    return c.style.cssText = "display: table",
    d.style.cssText = e.style.cssText = "display: table-cell; padding: 10px",
    c.appendChild(d),
    c.appendChild(e),
    b.insertBefore(c, b.firstChild),
    f = d.offsetLeft < e.offsetLeft,
    b.removeChild(c),
    f
}),
Modernizr.addTest("fullscreen",
function() {
    for (var a = 0; a < Modernizr._domPrefixes.length; a++) if (document[Modernizr._domPrefixes[a].toLowerCase() + "CancelFullScreen"]) return ! 0;
    return !! document.cancelFullScreen || !1
}),
Modernizr.addTest("svgfilters",
function() {
    var a = !1;
    try {
        a = typeof SVGFEColorMatrixElement !== undefined && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE == 2
    } catch(b) {}
    return a
});;
/**
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.3.1
 */
; (function($) {
    var h = $.scrollTo = function(a, b, c) {
        $(window).scrollTo(a, b, c)
    };
    h.defaults = {
        axis: 'xy',
        duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
        limit: true
    };
    h.window = function(a) {
        return $(window)._scrollable()
    };
    $.fn._scrollable = function() {
        return this.map(function() {
            var a = this,
            isWin = !a.nodeName || $.inArray(a.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1;
            if (!isWin) return a;
            var b = (a.contentWindow || a).document || a.ownerDocument || a;
            return /webkit/i.test(navigator.userAgent) || b.compatMode == 'BackCompat' ? b.body: b.documentElement
        })
    };
    $.fn.scrollTo = function(e, f, g) {
        if (typeof f == 'object') {
            g = f;
            f = 0
        }
        if (typeof g == 'function') g = {
            onAfter: g
        };
        if (e == 'max') e = 9e9;
        g = $.extend({},
        h.defaults, g);
        f = f || g.duration;
        g.queue = g.queue && g.axis.length > 1;
        if (g.queue) f /= 2;
        g.offset = both(g.offset);
        g.over = both(g.over);
        return this._scrollable().each(function() {
            if (e == null) return;
            var d = this,
            $elem = $(d),
            targ = e,
            toff,
            attr = {},
            win = $elem.is('html,body');
            switch (typeof targ) {
            case 'number':
            case 'string':
                if (/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
                    targ = both(targ);
                    break
                }
                targ = $(targ, this);
                if (!targ.length) return;
            case 'object':
                if (targ.is || targ.style) toff = (targ = $(targ)).offset()
            }
            $.each(g.axis.split(''),
            function(i, a) {
                var b = a == 'x' ? 'Left': 'Top',
                pos = b.toLowerCase(),
                key = 'scroll' + b,
                old = d[key],
                max = h.max(d, a);
                if (toff) {
                    attr[key] = toff[pos] + (win ? 0 : old - $elem.offset()[pos]);
                    if (g.margin) {
                        attr[key] -= parseInt(targ.css('margin' + b)) || 0;
                        attr[key] -= parseInt(targ.css('border' + b + 'Width')) || 0
                    }
                    attr[key] += g.offset[pos] || 0;
                    if (g.over[pos]) attr[key] += targ[a == 'x' ? 'width': 'height']() * g.over[pos]
                } else {
                    var c = targ[pos];
                    attr[key] = c.slice && c.slice( - 1) == '%' ? parseFloat(c) / 100 * max: c
                }
                if (g.limit && /^\d+$/.test(attr[key])) attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
                if (!i && g.queue) {
                    if (old != attr[key]) animate(g.onAfterFirst);
                    delete attr[key]
                }
            });
            animate(g.onAfter);
            function animate(a) {
                $elem.animate(attr, f, g.easing, a &&
                function() {
                    a.call(this, e, g)
                })
            }
        }).end()
    };
    h.max = function(a, b) {
        var c = b == 'x' ? 'Width': 'Height',
        scroll = 'scroll' + c;
        if (!$(a).is('html,body')) return a[scroll] - $(a)[c.toLowerCase()]();
        var d = 'client' + c,
        html = a.ownerDocument.documentElement,
        body = a.ownerDocument.body;
        return Math.max(html[scroll], body[scroll]) - Math.min(html[d], body[d])
    };
    function both(a) {
        return typeof a == 'object' ? a: {
            top: a,
            left: a
        }
    }
})(jQuery);;
window.JSON || (window.JSON = {}),
function() {
    function f(a) {
        return a < 10 ? "0" + a: a
    }
    function quote(a) {
        return escapable.lastIndex = 0,
        escapable.test(a) ? '"' + a.replace(escapable,
        function(a) {
            var b = meta[a];
            return typeof b == "string" ? b: "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice( - 4)
        }) + '"': '"' + a + '"'
    }
    function str(a, b) {
        var c, d, e, f, g = gap,
        h, i = b[a];
        i && typeof i == "object" && typeof i.toJSON == "function" && (i = i.toJSON(a)),
        typeof rep == "function" && (i = rep.call(b, a, i));
        switch (typeof i) {
        case "string":
            return quote(i);
        case "number":
            return isFinite(i) ? String(i) : "null";
        case "boolean":
        case "null":
            return String(i);
        case "object":
            if (!i) return "null";
            gap += indent,
            h = [];
            if (Object.prototype.toString.apply(i) === "[object Array]") {
                f = i.length;
                for (c = 0; c < f; c += 1) h[c] = str(c, i) || "null";
                return e = h.length === 0 ? "[]": gap ? "[\n" + gap + h.join(",\n" + gap) + "\n" + g + "]": "[" + h.join(",") + "]",
                gap = g,
                e
            }
            if (rep && typeof rep == "object") {
                f = rep.length;
                for (c = 0; c < f; c += 1) d = rep[c],
                typeof d == "string" && (e = str(d, i), e && h.push(quote(d) + (gap ? ": ": ":") + e))
            } else for (d in i) Object.hasOwnProperty.call(i, d) && (e = str(d, i), e && h.push(quote(d) + (gap ? ": ": ":") + e));
            return e = h.length === 0 ? "{}": gap ? "{\n" + gap + h.join(",\n" + gap) + "\n" + g + "}": "{" + h.join(",") + "}",
            gap = g,
            e
        }
    }
    "use strict",
    typeof Date.prototype.toJSON != "function" && (Date.prototype.toJSON = function(a) {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z": null
    },
    String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(a) {
        return this.valueOf()
    });
    var JSON = window.JSON,
    cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap, indent, meta = {
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        '"': '\\"',
        "\\": "\\\\"
    },
    rep;
    typeof JSON.stringify != "function" && (JSON.stringify = function(a, b, c) {
        var d;
        gap = "",
        indent = "";
        if (typeof c == "number") for (d = 0; d < c; d += 1) indent += " ";
        else typeof c == "string" && (indent = c);
        rep = b;
        if (!b || typeof b == "function" || typeof b == "object" && typeof b.length == "number") return str("", {
            "": a
        });
        throw new Error("JSON.stringify")
    }),
    typeof JSON.parse != "function" && (JSON.parse = function(text, reviver) {
        function walk(a, b) {
            var c, d, e = a[b];
            if (e && typeof e == "object") for (c in e) Object.hasOwnProperty.call(e, c) && (d = walk(e, c), d !== undefined ? e[c] = d: delete e[c]);
            return reviver.call(a, b, e)
        }
        var j;
        text = String(text),
        cx.lastIndex = 0,
        cx.test(text) && (text = text.replace(cx,
        function(a) {
            return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice( - 4)
        }));
        if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"),
        typeof reviver == "function" ? walk({
            "": j
        },
        "") : j;
        throw new SyntaxError("JSON.parse")
    })
} (),
function(a, b) {
    "use strict";
    var c = a.History = a.History || {},
    d = a.jQuery;
    if (typeof c.Adapter != "undefined") throw new Error("History.js Adapter has already been loaded...");
    c.Adapter = {
        bind: function(a, b, c) {
            d(a).bind(b, c)
        },
        trigger: function(a, b, c) {
            d(a).trigger(b, c)
        },
        extractEventData: function(a, c, d) {
            var e = c && c.originalEvent && c.originalEvent[a] || d && d[a] || b;
            return e
        },
        onDomLoad: function(a) {
            d(a)
        }
    },
    typeof c.init != "undefined" && c.init()
} (window),
function(a, b) {
    "use strict";
    var c = a.document,
    d = a.setTimeout || d,
    e = a.clearTimeout || e,
    f = a.setInterval || f,
    g = a.History = a.History || {};
    if (typeof g.initHtml4 != "undefined") throw new Error("History.js HTML4 Support has already been loaded...");
    g.initHtml4 = function() {
        if (typeof g.initHtml4.initialized != "undefined") return ! 1;
        g.initHtml4.initialized = !0,
        g.enabled = !0,
        g.savedHashes = [],
        g.isLastHash = function(a) {
            var b = g.getHashByIndex(),
            c;
            return c = a === b,
            c
        },
        g.saveHash = function(a) {
            return g.isLastHash(a) ? !1 : (g.savedHashes.push(a), !0)
        },
        g.getHashByIndex = function(a) {
            var b = null;
            return typeof a == "undefined" ? b = g.savedHashes[g.savedHashes.length - 1] : a < 0 ? b = g.savedHashes[g.savedHashes.length + a] : b = g.savedHashes[a],
            b
        },
        g.discardedHashes = {},
        g.discardedStates = {},
        g.discardState = function(a, b, c) {
            var d = g.getHashByState(a),
            e;
            return e = {
                discardedState: a,
                backState: c,
                forwardState: b
            },
            g.discardedStates[d] = e,
            !0
        },
        g.discardHash = function(a, b, c) {
            var d = {
                discardedHash: a,
                backState: c,
                forwardState: b
            };
            return g.discardedHashes[a] = d,
            !0
        },
        g.discardedState = function(a) {
            var b = g.getHashByState(a),
            c;
            return c = g.discardedStates[b] || !1,
            c
        },
        g.discardedHash = function(a) {
            var b = g.discardedHashes[a] || !1;
            return b
        },
        g.recycleState = function(a) {
            var b = g.getHashByState(a);
            return g.discardedState(a) && delete g.discardedStates[b],
            !0
        },
        g.emulated.hashChange && (g.hashChangeInit = function() {
            g.checkerFunction = null;
            var b = "",
            d, e, h, i;
            return g.isInternetExplorer() ? (d = "historyjs-iframe", e = c.createElement("iframe"), e.setAttribute("id", d), e.style.display = "none", c.body.appendChild(e), e.contentWindow.document.open(), e.contentWindow.document.close(), h = "", i = !1, g.checkerFunction = function() {
                if (i) return ! 1;
                i = !0;
                var c = g.getHash() || "",
                d = g.unescapeHash(e.contentWindow.document.location.hash) || "";
                return c !== b ? (b = c, d !== c && (h = d = c, e.contentWindow.document.open(), e.contentWindow.document.close(), e.contentWindow.document.location.hash = g.escapeHash(c)), g.Adapter.trigger(a, "hashchange")) : d !== h && (h = d, g.setHash(d, !1)),
                i = !1,
                !0
            }) : g.checkerFunction = function() {
                var c = g.getHash();
                return c !== b && (b = c, g.Adapter.trigger(a, "hashchange")),
                !0
            },
            g.intervalList.push(f(g.checkerFunction, g.options.hashChangeInterval)),
            !0
        },
        g.Adapter.onDomLoad(g.hashChangeInit)),
        g.emulated.pushState && (g.onHashChange = function(b) {
            var d = b && b.newURL || c.location.href,
            e = g.getHashByUrl(d),
            f = null,
            h = null,
            i = null,
            j;
            return g.isLastHash(e) ? (g.busy(!1), !1) : (g.doubleCheckComplete(), g.saveHash(e), e && g.isTraditionalAnchor(e) ? (g.Adapter.trigger(a, "anchorchange"), g.busy(!1), !1) : (f = g.extractState(g.getFullUrl(e || c.location.href, !1), !0), g.isLastSavedState(f) ? (g.busy(!1), !1) : (h = g.getHashByState(f), j = g.discardedState(f), j ? (g.getHashByIndex( - 2) === g.getHashByState(j.forwardState) ? g.back(!1) : g.forward(!1), !1) : (g.pushState(f.data, f.title, f.url, !1), !0))))
        },
        g.Adapter.bind(a, "hashchange", g.onHashChange), g.pushState = function(b, d, e, f) {
            if (g.getHashByUrl(e)) throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (f !== !1 && g.busy()) return g.pushQueue({
                scope: g,
                callback: g.pushState,
                args: arguments,
                queue: f
            }),
            !1;
            g.busy(!0);
            var h = g.createStateObject(b, d, e),
            i = g.getHashByState(h),
            j = g.getState(!1),
            k = g.getHashByState(j),
            l = g.getHash();
            return g.storeState(h),
            g.expectedStateId = h.id,
            g.recycleState(h),
            g.setTitle(h),
            i === k ? (g.busy(!1), !1) : i !== l && i !== g.getShortUrl(c.location.href) ? (g.setHash(i, !1), !1) : (g.saveState(h), g.Adapter.trigger(a, "statechange"), g.busy(!1), !0)
        },
        g.replaceState = function(a, b, c, d) {
            if (g.getHashByUrl(c)) throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (d !== !1 && g.busy()) return g.pushQueue({
                scope: g,
                callback: g.replaceState,
                args: arguments,
                queue: d
            }),
            !1;
            g.busy(!0);
            var e = g.createStateObject(a, b, c),
            f = g.getState(!1),
            h = g.getStateByIndex( - 2);
            return g.discardState(f, e, h),
            g.pushState(e.data, e.title, e.url, !1),
            !0
        }),
        g.emulated.pushState && g.getHash() && !g.emulated.hashChange && g.Adapter.onDomLoad(function() {
            g.Adapter.trigger(a, "hashchange")
        })
    },
    typeof g.init != "undefined" && g.init()
} (window),
function(a, b) {
    "use strict";
    var c = a.console || b,
    d = a.document,
    e = a.navigator,
    f = a.sessionStorage || !1,
    g = a.setTimeout,
    h = a.clearTimeout,
    i = a.setInterval,
    j = a.clearInterval,
    k = a.JSON,
    l = a.alert,
    m = a.History = a.History || {},
    n = a.history;
    k.stringify = k.stringify || k.encode,
    k.parse = k.parse || k.decode;
    if (typeof m.init != "undefined") throw new Error("History.js Core has already been loaded...");
    m.init = function() {
        return typeof m.Adapter == "undefined" ? !1 : (typeof m.initCore != "undefined" && m.initCore(), typeof m.initHtml4 != "undefined" && m.initHtml4(), !0)
    },
    m.initCore = function() {
        if (typeof m.initCore.initialized != "undefined") return ! 1;
        m.initCore.initialized = !0,
        m.options = m.options || {},
        m.options.hashChangeInterval = m.options.hashChangeInterval || 100,
        m.options.safariPollInterval = m.options.safariPollInterval || 500,
        m.options.doubleCheckInterval = m.options.doubleCheckInterval || 500,
        m.options.storeInterval = m.options.storeInterval || 1e3,
        m.options.busyDelay = m.options.busyDelay || 250,
        m.options.debug = m.options.debug || !1,
        m.options.initialTitle = m.options.initialTitle || d.title,
        m.intervalList = [],
        m.clearAllIntervals = function() {
            var a, b = m.intervalList;
            if (typeof b != "undefined" && b !== null) {
                for (a = 0; a < b.length; a++) j(b[a]);
                m.intervalList = null
            }
        },
        m.debug = function() { (m.options.debug || !1) && m.log.apply(m, arguments)
        },
        m.log = function() {
            var a = typeof c != "undefined" && typeof c.log != "undefined" && typeof c.log.apply != "undefined",
            b = d.getElementById("log"),
            e,
            f,
            g,
            h,
            i;
            a ? (h = Array.prototype.slice.call(arguments), e = h.shift(), typeof c.debug != "undefined" ? c.debug.apply(c, [e, h]) : c.log.apply(c, [e, h])) : e = "\n" + arguments[0] + "\n";
            for (f = 1, g = arguments.length; f < g; ++f) {
                i = arguments[f];
                if (typeof i == "object" && typeof k != "undefined") try {
                    i = k.stringify(i)
                } catch(j) {}
                e += "\n" + i + "\n"
            }
            return b ? (b.value += e + "\n-----\n", b.scrollTop = b.scrollHeight - b.clientHeight) : a || l(e),
            !0
        },
        m.getInternetExplorerMajorVersion = function() {
            var a = m.getInternetExplorerMajorVersion.cached = typeof m.getInternetExplorerMajorVersion.cached != "undefined" ? m.getInternetExplorerMajorVersion.cached: function() {
                var a = 3,
                b = d.createElement("div"),
                c = b.getElementsByTagName("i");
                while ((b.innerHTML = "<!--[if gt IE " + ++a + "]><i></i><![endif]-->") && c[0]);
                return a > 4 ? a: !1
            } ();
            return a
        },
        m.isInternetExplorer = function() {
            var a = m.isInternetExplorer.cached = typeof m.isInternetExplorer.cached != "undefined" ? m.isInternetExplorer.cached: Boolean(m.getInternetExplorerMajorVersion());
            return a
        },
        m.emulated = {
            pushState: !Boolean(a.history && a.history.pushState && a.history.replaceState && !/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i.test(e.userAgent) && !/AppleWebKit\/5([0-2]|3[0-2])/i.test(e.userAgent)),
            hashChange: Boolean(!("onhashchange" in a || "onhashchange" in d) || m.isInternetExplorer() && m.getInternetExplorerMajorVersion() < 8)
        },
        m.enabled = !m.emulated.pushState,
        m.bugs = {
            setHash: Boolean(!m.emulated.pushState && e.vendor === "Apple Computer, Inc." && /AppleWebKit\/5([0-2]|3[0-3])/.test(e.userAgent)),
            safariPoll: Boolean(!m.emulated.pushState && e.vendor === "Apple Computer, Inc." && /AppleWebKit\/5([0-2]|3[0-3])/.test(e.userAgent)),
            ieDoubleCheck: Boolean(m.isInternetExplorer() && m.getInternetExplorerMajorVersion() < 8),
            hashEscape: Boolean(m.isInternetExplorer() && m.getInternetExplorerMajorVersion() < 7)
        },
        m.isEmptyObject = function(a) {
            for (var b in a) return ! 1;
            return ! 0
        },
        m.cloneObject = function(a) {
            var b, c;
            return a ? (b = k.stringify(a), c = k.parse(b)) : c = {},
            c
        },
        m.getRootUrl = function() {
            var a = d.location.protocol + "//" + (d.location.hostname || d.location.host);
            if (d.location.port || !1) a += ":" + d.location.port;
            return a += "/",
            a
        },
        m.getBaseHref = function() {
            var a = d.getElementsByTagName("base"),
            b = null,
            c = "";
            return a.length === 1 && (b = a[0], c = b.href.replace(/[^\/]+$/, "")),
            c = c.replace(/\/+$/, ""),
            c && (c += "/"),
            c
        },
        m.getBaseUrl = function() {
            var a = m.getBaseHref() || m.getBasePageUrl() || m.getRootUrl();
            return a
        },
        m.getPageUrl = function() {
            var a = m.getState(!1, !1),
            b = (a || {}).url || d.location.href,
            c;
            return c = b.replace(/\/+$/, "").replace(/[^\/]+$/,
            function(a, b, c) {
                return /\./.test(a) ? a: a + "/"
            }),
            c
        },
        m.getBasePageUrl = function() {
            var a = d.location.href.replace(/[#\?].*/, "").replace(/[^\/]+$/,
            function(a, b, c) {
                return /[^\/]$/.test(a) ? "": a
            }).replace(/\/+$/, "") + "/";
            return a
        },
        m.getFullUrl = function(a, b) {
            var c = a,
            d = a.substring(0, 1);
            return b = typeof b == "undefined" ? !0 : b,
            /[a-z]+\:\/\//.test(a) || (d === "/" ? c = m.getRootUrl() + a.replace(/^\/+/, "") : d === "#" ? c = m.getPageUrl().replace(/#.*/, "") + a: d === "?" ? c = m.getPageUrl().replace(/[\?#].*/, "") + a: b ? c = m.getBaseUrl() + a.replace(/^(\.\/)+/, "") : c = m.getBasePageUrl() + a.replace(/^(\.\/)+/, "")),
            c.replace(/\#$/, "")
        },
        m.getShortUrl = function(a) {
            var b = a,
            c = m.getBaseUrl(),
            d = m.getRootUrl();
            return m.emulated.pushState && (b = b.replace(c, "")),
            b = b.replace(d, "/"),
            m.isTraditionalAnchor(b) && (b = "./" + b),
            b = b.replace(/^(\.\/)+/g, "./").replace(/\#$/, ""),
            b
        },
        m.store = {},
        m.idToState = m.idToState || {},
        m.stateToId = m.stateToId || {},
        m.urlToId = m.urlToId || {},
        m.storedStates = m.storedStates || [],
        m.savedStates = m.savedStates || [],
        m.normalizeStore = function() {
            m.store.idToState = m.store.idToState || {},
            m.store.urlToId = m.store.urlToId || {},
            m.store.stateToId = m.store.stateToId || {}
        },
        m.getState = function(a, b) {
            typeof a == "undefined" && (a = !0),
            typeof b == "undefined" && (b = !0);
            var c = m.getLastSavedState();
            return ! c && b && (c = m.createStateObject()),
            a && (c = m.cloneObject(c), c.url = c.cleanUrl || c.url),
            c
        },
        m.getIdByState = function(a) {
            var b = m.extractId(a.url),
            c;
            if (!b) {
                c = m.getStateString(a);
                if (typeof m.stateToId[c] != "undefined") b = m.stateToId[c];
                else if (typeof m.store.stateToId[c] != "undefined") b = m.store.stateToId[c];
                else {
                    for (;;) {
                        b = (new Date).getTime() + String(Math.random()).replace(/\D/g, "");
                        if (typeof m.idToState[b] == "undefined" && typeof m.store.idToState[b] == "undefined") break
                    }
                    m.stateToId[c] = b,
                    m.idToState[b] = a
                }
            }
            return b
        },
        m.normalizeState = function(a) {
            var b, c;
            if (!a || typeof a != "object") a = {};
            if (typeof a.normalized != "undefined") return a;
            if (!a.data || typeof a.data != "object") a.data = {};
            b = {},
            b.normalized = !0,
            b.title = a.title || "",
            b.url = m.getFullUrl(m.unescapeString(a.url || d.location.href)),
            b.hash = m.getShortUrl(b.url),
            b.data = m.cloneObject(a.data),
            b.id = m.getIdByState(b),
            b.cleanUrl = b.url.replace(/\??\&_suid.*/, ""),
            b.url = b.cleanUrl,
            c = !m.isEmptyObject(b.data);
            if (b.title || c) b.hash = m.getShortUrl(b.url).replace(/\??\&_suid.*/, ""),
            /\?/.test(b.hash) || (b.hash += "?"),
            b.hash += "&_suid=" + b.id;
            return b.hashedUrl = m.getFullUrl(b.hash),
            (m.emulated.pushState || m.bugs.safariPoll) && m.hasUrlDuplicate(b) && (b.url = b.hashedUrl),
            b
        },
        m.createStateObject = function(a, b, c) {
            var d = {
                data: a,
                title: b,
                url: c
            };
            return d = m.normalizeState(d),
            d
        },
        m.getStateById = function(a) {
            a = String(a);
            var c = m.idToState[a] || m.store.idToState[a] || b;
            return c
        },
        m.getStateString = function(a) {
            var b, c, d;
            return b = m.normalizeState(a),
            c = {
                data: b.data,
                title: a.title,
                url: a.url
            },
            d = k.stringify(c),
            d
        },
        m.getStateId = function(a) {
            var b, c;
            return b = m.normalizeState(a),
            c = b.id,
            c
        },
        m.getHashByState = function(a) {
            var b, c;
            return b = m.normalizeState(a),
            c = b.hash,
            c
        },
        m.extractId = function(a) {
            var b, c, d;
            return c = /(.*)\&_suid=([0-9]+)$/.exec(a),
            d = c ? c[1] || a: a,
            b = c ? String(c[2] || "") : "",
            b || !1
        },
        m.isTraditionalAnchor = function(a) {
            var b = !/[\/\?\.]/.test(a);
            return b
        },
        m.extractState = function(a, b) {
            var c = null,
            d, e;
            return b = b || !1,
            d = m.extractId(a),
            d && (c = m.getStateById(d)),
            c || (e = m.getFullUrl(a), d = m.getIdByUrl(e) || !1, d && (c = m.getStateById(d)), !c && b && !m.isTraditionalAnchor(a) && (c = m.createStateObject(null, null, e))),
            c
        },
        m.getIdByUrl = function(a) {
            var c = m.urlToId[a] || m.store.urlToId[a] || b;
            return c
        },
        m.getLastSavedState = function() {
            return m.savedStates[m.savedStates.length - 1] || b
        },
        m.getLastStoredState = function() {
            return m.storedStates[m.storedStates.length - 1] || b
        },
        m.hasUrlDuplicate = function(a) {
            var b = !1,
            c;
            return c = m.extractState(a.url),
            b = c && c.id !== a.id,
            b
        },
        m.storeState = function(a) {
            return m.urlToId[a.url] = a.id,
            m.storedStates.push(m.cloneObject(a)),
            a
        },
        m.isLastSavedState = function(a) {
            var b = !1,
            c, d, e;
            return m.savedStates.length && (c = a.id, d = m.getLastSavedState(), e = d.id, b = c === e),
            b
        },
        m.saveState = function(a) {
            return m.isLastSavedState(a) ? !1 : (m.savedStates.push(m.cloneObject(a)), !0)
        },
        m.getStateByIndex = function(a) {
            var b = null;
            return typeof a == "undefined" ? b = m.savedStates[m.savedStates.length - 1] : a < 0 ? b = m.savedStates[m.savedStates.length + a] : b = m.savedStates[a],
            b
        },
        m.getHash = function() {
            var a = m.unescapeHash(d.location.hash);
            return a
        },
        m.unescapeString = function(b) {
            var c = b,
            d;
            for (;;) {
                d = a.unescape(c);
                if (d === c) break;
                c = d
            }
            return c
        },
        m.unescapeHash = function(a) {
            var b = m.normalizeHash(a);
            return b = m.unescapeString(b),
            b
        },
        m.normalizeHash = function(a) {
            var b = a.replace(/[^#]*#/, "").replace(/#.*/, "");
            return b
        },
        m.setHash = function(a, b) {
            var c, e, f;
            return b !== !1 && m.busy() ? (m.pushQueue({
                scope: m,
                callback: m.setHash,
                args: arguments,
                queue: b
            }), !1) : (c = m.escapeHash(a), m.busy(!0), e = m.extractState(a, !0), e && !m.emulated.pushState ? m.pushState(e.data, e.title, e.url, !1) : d.location.hash !== c && (m.bugs.setHash ? (f = m.getPageUrl(), m.pushState(null, null, f + "#" + c, !1)) : d.location.hash = c), m)
        },
        m.escapeHash = function(b) {
            var c = m.normalizeHash(b);
            return c = a.escape(c),
            m.bugs.hashEscape || (c = c.replace(/\%21/g, "!").replace(/\%26/g, "&").replace(/\%3D/g, "=").replace(/\%3F/g, "?")),
            c
        },
        m.getHashByUrl = function(a) {
            var b = String(a).replace(/([^#]*)#?([^#]*)#?(.*)/, "$2");
            return b = m.unescapeHash(b),
            b
        },
        m.setTitle = function(a) {
            var b = a.title,
            c;
            b || (c = m.getStateByIndex(0), c && c.url === a.url && (b = c.title || m.options.initialTitle));
            try {
                d.getElementsByTagName("title")[0].innerHTML = b.replace("<", "&lt;").replace(">", "&gt;").replace(" & ", " &amp; ")
            } catch(e) {}
            return d.title = b,
            m
        },
        m.queues = [],
        m.busy = function(a) {
            typeof a != "undefined" ? m.busy.flag = a: typeof m.busy.flag == "undefined" && (m.busy.flag = !1);
            if (!m.busy.flag) {
                h(m.busy.timeout);
                var b = function() {
                    var a, c, d;
                    if (m.busy.flag) return;
                    for (a = m.queues.length - 1; a >= 0; --a) {
                        c = m.queues[a];
                        if (c.length === 0) continue;
                        d = c.shift(),
                        m.fireQueueItem(d),
                        m.busy.timeout = g(b, m.options.busyDelay)
                    }
                };
                m.busy.timeout = g(b, m.options.busyDelay)
            }
            return m.busy.flag
        },
        m.busy.flag = !1,
        m.fireQueueItem = function(a) {
            return a.callback.apply(a.scope || m, a.args || [])
        },
        m.pushQueue = function(a) {
            return m.queues[a.queue || 0] = m.queues[a.queue || 0] || [],
            m.queues[a.queue || 0].push(a),
            m
        },
        m.queue = function(a, b) {
            return typeof a == "function" && (a = {
                callback: a
            }),
            typeof b != "undefined" && (a.queue = b),
            m.busy() ? m.pushQueue(a) : m.fireQueueItem(a),
            m
        },
        m.clearQueue = function() {
            return m.busy.flag = !1,
            m.queues = [],
            m
        },
        m.stateChanged = !1,
        m.doubleChecker = !1,
        m.doubleCheckComplete = function() {
            return m.stateChanged = !0,
            m.doubleCheckClear(),
            m
        },
        m.doubleCheckClear = function() {
            return m.doubleChecker && (h(m.doubleChecker), m.doubleChecker = !1),
            m
        },
        m.doubleCheck = function(a) {
            return m.stateChanged = !1,
            m.doubleCheckClear(),
            m.bugs.ieDoubleCheck && (m.doubleChecker = g(function() {
                return m.doubleCheckClear(),
                m.stateChanged || a(),
                !0
            },
            m.options.doubleCheckInterval)),
            m
        },
        m.safariStatePoll = function() {
            var b = m.extractState(d.location.href),
            c;
            if (!m.isLastSavedState(b)) c = b;
            else return;
            return c || (c = m.createStateObject()),
            m.Adapter.trigger(a, "popstate"),
            m
        },
        m.back = function(a) {
            return a !== !1 && m.busy() ? (m.pushQueue({
                scope: m,
                callback: m.back,
                args: arguments,
                queue: a
            }), !1) : (m.busy(!0), m.doubleCheck(function() {
                m.back(!1)
            }), n.go( - 1), !0)
        },
        m.forward = function(a) {
            return a !== !1 && m.busy() ? (m.pushQueue({
                scope: m,
                callback: m.forward,
                args: arguments,
                queue: a
            }), !1) : (m.busy(!0), m.doubleCheck(function() {
                m.forward(!1)
            }), n.go(1), !0)
        },
        m.go = function(a, b) {
            var c;
            if (a > 0) for (c = 1; c <= a; ++c) m.forward(b);
            else {
                if (! (a < 0)) throw new Error("History.go: History.go requires a positive or negative integer passed.");
                for (c = -1; c >= a; --c) m.back(b)
            }
            return m
        };
        if (m.emulated.pushState) {
            var o = function() {};
            m.pushState = m.pushState || o,
            m.replaceState = m.replaceState || o
        } else m.onPopState = function(b, c) {
            var e = !1,
            f = !1,
            g, h;
            return m.doubleCheckComplete(),
            g = m.getHash(),
            g ? (h = m.extractState(g || d.location.href, !0), h ? m.replaceState(h.data, h.title, h.url, !1) : (m.Adapter.trigger(a, "anchorchange"), m.busy(!1)), m.expectedStateId = !1, !1) : (e = m.Adapter.extractEventData("state", b, c) || !1, e ? f = m.getStateById(e) : m.expectedStateId ? f = m.getStateById(m.expectedStateId) : f = m.extractState(d.location.href), f || (f = m.createStateObject(null, null, d.location.href)), m.expectedStateId = !1, m.isLastSavedState(f) ? (m.busy(!1), !1) : (m.storeState(f), m.saveState(f), m.setTitle(f), m.Adapter.trigger(a, "statechange"), m.busy(!1), !0))
        },
        m.Adapter.bind(a, "popstate", m.onPopState),
        m.pushState = function(b, c, d, e) {
            if (m.getHashByUrl(d) && m.emulated.pushState) throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (e !== !1 && m.busy()) return m.pushQueue({
                scope: m,
                callback: m.pushState,
                args: arguments,
                queue: e
            }),
            !1;
            m.busy(!0);
            var f = m.createStateObject(b, c, d);
            return m.isLastSavedState(f) ? m.busy(!1) : (m.storeState(f), m.expectedStateId = f.id, n.pushState(f.id, f.title, f.url), m.Adapter.trigger(a, "popstate")),
            !0
        },
        m.replaceState = function(b, c, d, e) {
            if (m.getHashByUrl(d) && m.emulated.pushState) throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (e !== !1 && m.busy()) return m.pushQueue({
                scope: m,
                callback: m.replaceState,
                args: arguments,
                queue: e
            }),
            !1;
            m.busy(!0);
            var f = m.createStateObject(b, c, d);
            return m.isLastSavedState(f) ? m.busy(!1) : (m.storeState(f), m.expectedStateId = f.id, n.replaceState(f.id, f.title, f.url), m.Adapter.trigger(a, "popstate")),
            !0
        };
        if (f) {
            try {
                m.store = k.parse(f.getItem("History.store")) || {}
            } catch(p) {
                m.store = {}
            }
            m.normalizeStore()
        } else m.store = {},
        m.normalizeStore();
        m.Adapter.bind(a, "beforeunload", m.clearAllIntervals),
        m.Adapter.bind(a, "unload", m.clearAllIntervals),
        m.saveState(m.storeState(m.extractState(d.location.href, !0))),
        f && (m.onUnload = function() {
            var a, b;
            try {
                a = k.parse(f.getItem("History.store")) || {}
            } catch(c) {
                a = {}
            }
            a.idToState = a.idToState || {},
            a.urlToId = a.urlToId || {},
            a.stateToId = a.stateToId || {};
            for (b in m.idToState) {
                if (!m.idToState.hasOwnProperty(b)) continue;
                a.idToState[b] = m.idToState[b]
            }
            for (b in m.urlToId) {
                if (!m.urlToId.hasOwnProperty(b)) continue;
                a.urlToId[b] = m.urlToId[b]
            }
            for (b in m.stateToId) {
                if (!m.stateToId.hasOwnProperty(b)) continue;
                a.stateToId[b] = m.stateToId[b]
            }
            m.store = a,
            m.normalizeStore(),
            f.setItem("History.store", k.stringify(a))
        },
        m.intervalList.push(i(m.onUnload, m.options.storeInterval)), m.Adapter.bind(a, "beforeunload", m.onUnload), m.Adapter.bind(a, "unload", m.onUnload));
        if (!m.emulated.pushState) {
            m.bugs.safariPoll && m.intervalList.push(i(m.safariStatePoll, m.options.safariPollInterval));
            if (e.vendor === "Apple Computer, Inc." || (e.appCodeName || "") === "Mozilla") m.Adapter.bind(a, "hashchange",
            function() {
                m.Adapter.trigger(a, "popstate")
            }),
            m.getHash() && m.Adapter.onDomLoad(function() {
                m.Adapter.trigger(a, "hashchange")
            })
        }
    },
    m.init()
} (window);
/**
 * author Remy Sharp
 * url http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 */
(function($) {
    function getViewportHeight() {
        var height = window.innerHeight; // Safari, Opera
        var mode = document.compatMode;

        if ((mode || !$.support.boxModel)) { // IE, Gecko
            height = (mode == 'CSS1Compat') ? document.documentElement.clientHeight: // Standards
            document.body.clientHeight; // Quirks
        }

        return height;
    }

    $(window).scroll(function() {
        var vpH = getViewportHeight(),
        scrolltop = (document.documentElement.scrollTop ? document.documentElement.scrollTop: document.body.scrollTop),
        elems = [];

        // naughty, but this is how it knows which elements to check for
        $.each($.cache,
        function() {
            if (this.events && this.events.inview) {
                elems.push(this.handle.elem);
            }
        });

        if (elems.length) {
            $(elems).each(function() {
                var $el = $(this),
                top = $el.offset().top,
                height = $el.height(),
                inview = $el.data('inview') || false;

                if (scrolltop > (top + height) || scrolltop + vpH < top) {
                    if (inview) {
                        $el.data('inview', false);
                        $el.trigger('inview', [false]);
                    }
                } else if (scrolltop < (top + height)) {
                    if (!inview) {
                        $el.data('inview', true);
                        $el.trigger('inview', [true]);
                    }
                }
            });
        }
    });

    // kick the event to pick up any elements already in view.
    // note however, this only works if the plugin is included after the elements are bound to 'inview'
    $(function() {
        $(window).scroll();
    });
})(jQuery);;
/*! fancyBox v2.1.5 fancyapps.com | fancyapps.com/fancybox/#license */
(function(s, H, f, w) {
    var K = f("html"),
    q = f(s),
    p = f(H),
    b = f.fancybox = function() {
        b.open.apply(this, arguments)
    },
    J = navigator.userAgent.match(/msie/i),
    C = null,
    t = H.createTouch !== w,
    u = function(a) {
        return a && a.hasOwnProperty && a instanceof f
    },
    r = function(a) {
        return a && "string" === f.type(a)
    },
    F = function(a) {
        return r(a) && 0 < a.indexOf("%")
    },
    m = function(a, d) {
        var e = parseInt(a, 10) || 0;
        d && F(a) && (e *= b.getViewport()[d] / 100);
        return Math.ceil(e)
    },
    x = function(a, b) {
        return m(a, b) + "px"
    };
    f.extend(b, {
        version: "2.1.5",
        defaults: {
            padding: 15,
            margin: 20,
            width: 800,
            height: 600,
            minWidth: 100,
            minHeight: 100,
            maxWidth: 9999,
            maxHeight: 9999,
            pixelRatio: 1,
            autoSize: !0,
            autoHeight: !1,
            autoWidth: !1,
            autoResize: !0,
            autoCenter: !t,
            fitToView: !0,
            aspectRatio: !1,
            topRatio: 0.5,
            leftRatio: 0.5,
            scrolling: "auto",
            wrapCSS: "",
            arrows: !0,
            closeBtn: !0,
            closeClick: !1,
            nextClick: !1,
            mouseWheel: !0,
            autoPlay: !1,
            playSpeed: 3E3,
            preload: 3,
            modal: !1,
            loop: !0,
            ajax: {
                dataType: "html",
                headers: {
                    "X-fancyBox": !0
                }
            },
            iframe: {
                scrolling: "auto",
                preload: !0
            },
            swf: {
                wmode: "transparent",
                allowfullscreen: "true",
                allowscriptaccess: "always"
            },
            keys: {
                next: {
                    13 : "left",
                    34 : "up",
                    39 : "left",
                    40 : "up"
                },
                prev: {
                    8 : "right",
                    33 : "down",
                    37 : "right",
                    38 : "down"
                },
                close: [27],
                play: [32],
                toggle: [70]
            },
            direction: {
                next: "left",
                prev: "right"
            },
            scrollOutside: !0,
            index: 0,
            type: null,
            href: null,
            content: null,
            title: null,
            tpl: {
                wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
                image: '<img class="fancybox-image" src="{href}" alt="" />',
                iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (J ? ' allowtransparency="true"': "") + "></iframe>",
                error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
                closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
                next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
                prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
            },
            openEffect: "fade",
            openSpeed: 250,
            openEasing: "swing",
            openOpacity: !0,
            openMethod: "zoomIn",
            closeEffect: "fade",
            closeSpeed: 250,
            closeEasing: "swing",
            closeOpacity: !0,
            closeMethod: "zoomOut",
            nextEffect: "elastic",
            nextSpeed: 250,
            nextEasing: "swing",
            nextMethod: "changeIn",
            prevEffect: "elastic",
            prevSpeed: 250,
            prevEasing: "swing",
            prevMethod: "changeOut",
            helpers: {
                overlay: !0,
                title: !0
            },
            onCancel: f.noop,
            beforeLoad: f.noop,
            afterLoad: f.noop,
            beforeShow: f.noop,
            afterShow: f.noop,
            beforeChange: f.noop,
            beforeClose: f.noop,
            afterClose: f.noop
        },
        group: {},
        opts: {},
        previous: null,
        coming: null,
        current: null,
        isActive: !1,
        isOpen: !1,
        isOpened: !1,
        wrap: null,
        skin: null,
        outer: null,
        inner: null,
        player: {
            timer: null,
            isActive: !1
        },
        ajaxLoad: null,
        imgPreload: null,
        transitions: {},
        helpers: {},
        open: function(a, d) {
            if (a && (f.isPlainObject(d) || (d = {}), !1 !== b.close(!0))) return f.isArray(a) || (a = u(a) ? f(a).get() : [a]),
            f.each(a,
            function(e, c) {
                var l = {},
                g, h, k, n, m;
                "object" === f.type(c) && (c.nodeType && (c = f(c)), u(c) ? (l = {
                    href: c.data("fancybox-href") || c.attr("href"),
                    title: f("<div/>").text(c.data("fancybox-title") || c.attr("title")).html(),
                    isDom: !0,
                    element: c
                },
                f.metadata && f.extend(!0, l, c.metadata())) : l = c);
                g = d.href || l.href || (r(c) ? c: null);
                h = d.title !== w ? d.title: l.title || "";
                n = (k = d.content || l.content) ? "html": d.type || l.type; ! n && l.isDom && (n = c.data("fancybox-type"), n || (n = (n = c.prop("class").match(/fancybox\.(\w+)/)) ? n[1] : null));
                r(g) && (n || (b.isImage(g) ? n = "image": b.isSWF(g) ? n = "swf": "#" === g.charAt(0) ? n = "inline": r(c) && (n = "html", k = c)), "ajax" === n && (m = g.split(/\s+/, 2), g = m.shift(), m = m.shift()));
                k || ("inline" === n ? g ? k = f(r(g) ? g.replace(/.*(?=#[^\s]+$)/, "") : g) : l.isDom && (k = c) : "html" === n ? k = g: n || g || !l.isDom || (n = "inline", k = c));
                f.extend(l, {
                    href: g,
                    type: n,
                    content: k,
                    title: h,
                    selector: m
                });
                a[e] = l
            }),
            b.opts = f.extend(!0, {},
            b.defaults, d),
            d.keys !== w && (b.opts.keys = d.keys ? f.extend({},
            b.defaults.keys, d.keys) : !1),
            b.group = a,
            b._start(b.opts.index)
        },
        cancel: function() {
            var a = b.coming;
            a && !1 === b.trigger("onCancel") || (b.hideLoading(), a && (b.ajaxLoad && b.ajaxLoad.abort(), b.ajaxLoad = null, b.imgPreload && (b.imgPreload.onload = b.imgPreload.onerror = null), a.wrap && a.wrap.stop(!0, !0).trigger("onReset").remove(), b.coming = null, b.current || b._afterZoomOut(a)))
        },
        close: function(a) {
            b.cancel(); ! 1 !== b.trigger("beforeClose") && (b.unbindEvents(), b.isActive && (b.isOpen && !0 !== a ? (b.isOpen = b.isOpened = !1, b.isClosing = !0, f(".fancybox-item, .fancybox-nav").remove(), b.wrap.stop(!0, !0).removeClass("fancybox-opened"), b.transitions[b.current.closeMethod]()) : (f(".fancybox-wrap").stop(!0).trigger("onReset").remove(), b._afterZoomOut())))
        },
        play: function(a) {
            var d = function() {
                clearTimeout(b.player.timer)
            },
            e = function() {
                d();
                b.current && b.player.isActive && (b.player.timer = setTimeout(b.next, b.current.playSpeed))
            },
            c = function() {
                d();
                p.unbind(".player");
                b.player.isActive = !1;
                b.trigger("onPlayEnd")
            }; ! 0 === a || !b.player.isActive && !1 !== a ? b.current && (b.current.loop || b.current.index < b.group.length - 1) && (b.player.isActive = !0, p.bind({
                "onCancel.player beforeClose.player": c,
                "onUpdate.player": e,
                "beforeLoad.player": d
            }), e(), b.trigger("onPlayStart")) : c()
        },
        next: function(a) {
            var d = b.current;
            d && (r(a) || (a = d.direction.next), b.jumpto(d.index + 1, a, "next"))
        },
        prev: function(a) {
            var d = b.current;
            d && (r(a) || (a = d.direction.prev), b.jumpto(d.index - 1, a, "prev"))
        },
        jumpto: function(a, d, e) {
            var c = b.current;
            c && (a = m(a), b.direction = d || c.direction[a >= c.index ? "next": "prev"], b.router = e || "jumpto", c.loop && (0 > a && (a = c.group.length + a % c.group.length), a %= c.group.length), c.group[a] !== w && (b.cancel(), b._start(a)))
        },
        reposition: function(a, d) {
            var e = b.current,
            c = e ? e.wrap: null,
            l;
            c && (l = b._getPosition(d), a && "scroll" === a.type ? (delete l.position, c.stop(!0, !0).animate(l, 200)) : (c.css(l), e.pos = f.extend({},
            e.dim, l)))
        },
        update: function(a) {
            var d = a && a.originalEvent && a.originalEvent.type,
            e = !d || "orientationchange" === d;
            e && (clearTimeout(C), C = null);
            b.isOpen && !C && (C = setTimeout(function() {
                var c = b.current;
                c && !b.isClosing && (b.wrap.removeClass("fancybox-tmp"), (e || "load" === d || "resize" === d && c.autoResize) && b._setDimension(), "scroll" === d && c.canShrink || b.reposition(a), b.trigger("onUpdate"), C = null)
            },
            e && !t ? 0 : 300))
        },
        toggle: function(a) {
            b.isOpen && (b.current.fitToView = "boolean" === f.type(a) ? a: !b.current.fitToView, t && (b.wrap.removeAttr("style").addClass("fancybox-tmp"), b.trigger("onUpdate")), b.update())
        },
        hideLoading: function() {
            p.unbind(".loading");
            f("#fancybox-loading").remove()
        },
        showLoading: function() {
            var a, d;
            b.hideLoading();
            a = f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");
            p.bind("keydown.loading",
            function(a) {
                27 === (a.which || a.keyCode) && (a.preventDefault(), b.cancel())
            });
            b.defaults.fixed || (d = b.getViewport(), a.css({
                position: "absolute",
                top: 0.5 * d.h + d.y,
                left: 0.5 * d.w + d.x
            }));
            b.trigger("onLoading")
        },
        getViewport: function() {
            var a = b.current && b.current.locked || !1,
            d = {
                x: q.scrollLeft(),
                y: q.scrollTop()
            };
            a && a.length ? (d.w = a[0].clientWidth, d.h = a[0].clientHeight) : (d.w = t && s.innerWidth ? s.innerWidth: q.width(), d.h = t && s.innerHeight ? s.innerHeight: q.height());
            return d
        },
        unbindEvents: function() {
            b.wrap && u(b.wrap) && b.wrap.unbind(".fb");
            p.unbind(".fb");
            q.unbind(".fb")
        },
        bindEvents: function() {
            var a = b.current,
            d;
            a && (q.bind("orientationchange.fb" + (t ? "": " resize.fb") + (a.autoCenter && !a.locked ? " scroll.fb": ""), b.update), (d = a.keys) && p.bind("keydown.fb",
            function(e) {
                var c = e.which || e.keyCode,
                l = e.target || e.srcElement;
                if (27 === c && b.coming) return ! 1;
                e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || l && (l.type || f(l).is("[contenteditable]")) || f.each(d,
                function(d, l) {
                    if (1 < a.group.length && l[c] !== w) return b[d](l[c]),
                    e.preventDefault(),
                    !1;
                    if ( - 1 < f.inArray(c, l)) return b[d](),
                    e.preventDefault(),
                    !1
                })
            }), f.fn.mousewheel && a.mouseWheel && b.wrap.bind("mousewheel.fb",
            function(d, c, l, g) {
                for (var h = f(d.target || null), k = !1; h.length && !(k || h.is(".fancybox-skin") || h.is(".fancybox-wrap"));) k = h[0] && !(h[0].style.overflow && "hidden" === h[0].style.overflow) && (h[0].clientWidth && h[0].scrollWidth > h[0].clientWidth || h[0].clientHeight && h[0].scrollHeight > h[0].clientHeight),
                h = f(h).parent();
                0 !== c && !k && 1 < b.group.length && !a.canShrink && (0 < g || 0 < l ? b.prev(0 < g ? "down": "left") : (0 > g || 0 > l) && b.next(0 > g ? "up": "right"), d.preventDefault())
            }))
        },
        trigger: function(a, d) {
            var e, c = d || b.coming || b.current;
            if (c) {
                f.isFunction(c[a]) && (e = c[a].apply(c, Array.prototype.slice.call(arguments, 1)));
                if (!1 === e) return ! 1;
                c.helpers && f.each(c.helpers,
                function(d, e) {
                    if (e && b.helpers[d] && f.isFunction(b.helpers[d][a])) b.helpers[d][a](f.extend(!0, {},
                    b.helpers[d].defaults, e), c)
                })
            }
            p.trigger(a)
        },
        isImage: function(a) {
            return r(a) && a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)
        },
        isSWF: function(a) {
            return r(a) && a.match(/\.(swf)((\?|#).*)?$/i)
        },
        _start: function(a) {
            var d = {},
            e, c;
            a = m(a);
            e = b.group[a] || null;
            if (!e) return ! 1;
            d = f.extend(!0, {},
            b.opts, e);
            e = d.margin;
            c = d.padding;
            "number" === f.type(e) && (d.margin = [e, e, e, e]);
            "number" === f.type(c) && (d.padding = [c, c, c, c]);
            d.modal && f.extend(!0, d, {
                closeBtn: !1,
                closeClick: !1,
                nextClick: !1,
                arrows: !1,
                mouseWheel: !1,
                keys: null,
                helpers: {
                    overlay: {
                        closeClick: !1
                    }
                }
            });
            d.autoSize && (d.autoWidth = d.autoHeight = !0);
            "auto" === d.width && (d.autoWidth = !0);
            "auto" === d.height && (d.autoHeight = !0);
            d.group = b.group;
            d.index = a;
            b.coming = d;
            if (!1 === b.trigger("beforeLoad")) b.coming = null;
            else {
                c = d.type;
                e = d.href;
                if (!c) return b.coming = null,
                b.current && b.router && "jumpto" !== b.router ? (b.current.index = a, b[b.router](b.direction)) : !1;
                b.isActive = !0;
                if ("image" === c || "swf" === c) d.autoHeight = d.autoWidth = !1,
                d.scrolling = "visible";
                "image" === c && (d.aspectRatio = !0);
                "iframe" === c && t && (d.scrolling = "scroll");
                d.wrap = f(d.tpl.wrap).addClass("fancybox-" + (t ? "mobile": "desktop") + " fancybox-type-" + c + " fancybox-tmp " + d.wrapCSS).appendTo(d.parent || "body");
                f.extend(d, {
                    skin: f(".fancybox-skin", d.wrap),
                    outer: f(".fancybox-outer", d.wrap),
                    inner: f(".fancybox-inner", d.wrap)
                });
                f.each(["Top", "Right", "Bottom", "Left"],
                function(a, b) {
                    d.skin.css("padding" + b, x(d.padding[a]))
                });
                b.trigger("onReady");
                if ("inline" === c || "html" === c) {
                    if (!d.content || !d.content.length) return b._error("content")
                } else if (!e) return b._error("href");
                "image" === c ? b._loadImage() : "ajax" === c ? b._loadAjax() : "iframe" === c ? b._loadIframe() : b._afterLoad()
            }
        },
        _error: function(a) {
            f.extend(b.coming, {
                type: "html",
                autoWidth: !0,
                autoHeight: !0,
                minWidth: 0,
                minHeight: 0,
                scrolling: "no",
                hasError: a,
                content: b.coming.tpl.error
            });
            b._afterLoad()
        },
        _loadImage: function() {
            var a = b.imgPreload = new Image;
            a.onload = function() {
                this.onload = this.onerror = null;
                b.coming.width = this.width / b.opts.pixelRatio;
                b.coming.height = this.height / b.opts.pixelRatio;
                b._afterLoad()
            };
            a.onerror = function() {
                this.onload = this.onerror = null;
                b._error("image")
            };
            a.src = b.coming.href; ! 0 !== a.complete && b.showLoading()
        },
        _loadAjax: function() {
            var a = b.coming;
            b.showLoading();
            b.ajaxLoad = f.ajax(f.extend({},
            a.ajax, {
                url: a.href,
                error: function(a, e) {
                    b.coming && "abort" !== e ? b._error("ajax", a) : b.hideLoading()
                },
                success: function(d, e) {
                    "success" === e && (a.content = d, b._afterLoad())
                }
            }))
        },
        _loadIframe: function() {
            var a = b.coming,
            d = f(a.tpl.iframe.replace(/\{rnd\}/g, (new Date).getTime())).attr("scrolling", t ? "auto": a.iframe.scrolling).attr("src", a.href);
            f(a.wrap).bind("onReset",
            function() {
                try {
                    f(this).find("iframe").hide().attr("src", "//about:blank").end().empty()
                } catch(a) {}
            });
            a.iframe.preload && (b.showLoading(), d.one("load",
            function() {
                f(this).data("ready", 1);
                t || f(this).bind("load.fb", b.update);
                f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();
                b._afterLoad()
            }));
            a.content = d.appendTo(a.inner);
            a.iframe.preload || b._afterLoad()
        },
        _preloadImages: function() {
            var a = b.group,
            d = b.current,
            e = a.length,
            c = d.preload ? Math.min(d.preload, e - 1) : 0,
            f,
            g;
            for (g = 1; g <= c; g += 1) f = a[(d.index + g) % e],
            "image" === f.type && f.href && ((new Image).src = f.href)
        },
        _afterLoad: function() {
            var a = b.coming,
            d = b.current,
            e, c, l, g, h;
            b.hideLoading();
            if (a && !1 !== b.isActive) if (!1 === b.trigger("afterLoad", a, d)) a.wrap.stop(!0).trigger("onReset").remove(),
            b.coming = null;
            else {
                d && (b.trigger("beforeChange", d), d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());
                b.unbindEvents();
                e = a.content;
                c = a.type;
                l = a.scrolling;
                f.extend(b, {
                    wrap: a.wrap,
                    skin: a.skin,
                    outer: a.outer,
                    inner: a.inner,
                    current: a,
                    previous: d
                });
                g = a.href;
                switch (c) {
                case "inline":
                case "ajax":
                case "html":
                    a.selector ? e = f("<div>").html(e).find(a.selector) : u(e) && (e.data("fancybox-placeholder") || e.data("fancybox-placeholder", f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()), e = e.show().detach(), a.wrap.bind("onReset",
                    function() {
                        f(this).find(e).length && e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder", !1)
                    }));
                    break;
                case "image":
                    e = a.tpl.image.replace(/\{href\}/g, g);
                    break;
                case "swf":
                    e = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + g + '"></param>',
                    h = "",
                    f.each(a.swf,
                    function(a, b) {
                        e += '<param name="' + a + '" value="' + b + '"></param>';
                        h += " " + a + '="' + b + '"'
                    }),
                    e += '<embed src="' + g + '" type="application/x-shockwave-flash" width="100%" height="100%"' + h + "></embed></object>"
                }
                u(e) && e.parent().is(a.inner) || a.inner.append(e);
                b.trigger("beforeShow");
                a.inner.css("overflow", "yes" === l ? "scroll": "no" === l ? "hidden": l);
                b._setDimension();
                b.reposition();
                b.isOpen = !1;
                b.coming = null;
                b.bindEvents();
                if (!b.isOpened) f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();
                else if (d.prevMethod) b.transitions[d.prevMethod]();
                b.transitions[b.isOpened ? a.nextMethod: a.openMethod]();
                b._preloadImages()
            }
        },
        _setDimension: function() {
            var a = b.getViewport(),
            d = 0,
            e = !1,
            c = !1,
            e = b.wrap,
            l = b.skin,
            g = b.inner,
            h = b.current,
            c = h.width,
            k = h.height,
            n = h.minWidth,
            v = h.minHeight,
            p = h.maxWidth,
            q = h.maxHeight,
            t = h.scrolling,
            r = h.scrollOutside ? h.scrollbarWidth: 0,
            y = h.margin,
            z = m(y[1] + y[3]),
            s = m(y[0] + y[2]),
            w,
            A,
            u,
            D,
            B,
            G,
            C,
            E,
            I;
            e.add(l).add(g).width("auto").height("auto").removeClass("fancybox-tmp");
            y = m(l.outerWidth(!0) - l.width());
            w = m(l.outerHeight(!0) - l.height());
            A = z + y;
            u = s + w;
            D = F(c) ? (a.w - A) * m(c) / 100 : c;
            B = F(k) ? (a.h - u) * m(k) / 100 : k;
            if ("iframe" === h.type) {
                if (I = h.content, h.autoHeight && 1 === I.data("ready")) try {
                    I[0].contentWindow.document.location && (g.width(D).height(9999), G = I.contents().find("body"), r && G.css("overflow-x", "hidden"), B = G.outerHeight(!0))
                } catch(H) {}
            } else if (h.autoWidth || h.autoHeight) g.addClass("fancybox-tmp"),
            h.autoWidth || g.width(D),
            h.autoHeight || g.height(B),
            h.autoWidth && (D = g.width()),
            h.autoHeight && (B = g.height()),
            g.removeClass("fancybox-tmp");
            c = m(D);
            k = m(B);
            E = D / B;
            n = m(F(n) ? m(n, "w") - A: n);
            p = m(F(p) ? m(p, "w") - A: p);
            v = m(F(v) ? m(v, "h") - u: v);
            q = m(F(q) ? m(q, "h") - u: q);
            G = p;
            C = q;
            h.fitToView && (p = Math.min(a.w - A, p), q = Math.min(a.h - u, q));
            A = a.w - z;
            s = a.h - s;
            h.aspectRatio ? (c > p && (c = p, k = m(c / E)), k > q && (k = q, c = m(k * E)), c < n && (c = n, k = m(c / E)), k < v && (k = v, c = m(k * E))) : (c = Math.max(n, Math.min(c, p)), h.autoHeight && "iframe" !== h.type && (g.width(c), k = g.height()), k = Math.max(v, Math.min(k, q)));
            if (h.fitToView) if (g.width(c).height(k), e.width(c + y), a = e.width(), z = e.height(), h.aspectRatio) for (; (a > A || z > s) && c > n && k > v && !(19 < d++);) k = Math.max(v, Math.min(q, k - 10)),
            c = m(k * E),
            c < n && (c = n, k = m(c / E)),
            c > p && (c = p, k = m(c / E)),
            g.width(c).height(k),
            e.width(c + y),
            a = e.width(),
            z = e.height();
            else c = Math.max(n, Math.min(c, c - (a - A))),
            k = Math.max(v, Math.min(k, k - (z - s)));
            r && "auto" === t && k < B && c + y + r < A && (c += r);
            g.width(c).height(k);
            e.width(c + y);
            a = e.width();
            z = e.height();
            e = (a > A || z > s) && c > n && k > v;
            c = h.aspectRatio ? c < G && k < C && c < D && k < B: (c < G || k < C) && (c < D || k < B);
            f.extend(h, {
                dim: {
                    width: x(a),
                    height: x(z)
                },
                origWidth: D,
                origHeight: B,
                canShrink: e,
                canExpand: c,
                wPadding: y,
                hPadding: w,
                wrapSpace: z - l.outerHeight(!0),
                skinSpace: l.height() - k
            }); ! I && h.autoHeight && k > v && k < q && !c && g.height("auto")
        },
        _getPosition: function(a) {
            var d = b.current,
            e = b.getViewport(),
            c = d.margin,
            f = b.wrap.width() + c[1] + c[3],
            g = b.wrap.height() + c[0] + c[2],
            c = {
                position: "absolute",
                top: c[0],
                left: c[3]
            };
            d.autoCenter && d.fixed && !a && g <= e.h && f <= e.w ? c.position = "fixed": d.locked || (c.top += e.y, c.left += e.x);
            c.top = x(Math.max(c.top, c.top + (e.h - g) * d.topRatio));
            c.left = x(Math.max(c.left, c.left + (e.w - f) * d.leftRatio));
            return c
        },
        _afterZoomIn: function() {
            var a = b.current;
            a && ((b.isOpen = b.isOpened = !0, b.wrap.css("overflow", "visible").addClass("fancybox-opened"), b.update(), (a.closeClick || a.nextClick && 1 < b.group.length) && b.inner.css("cursor", "pointer").bind("click.fb",
            function(d) {
                f(d.target).is("a") || f(d.target).parent().is("a") || (d.preventDefault(), b[a.closeClick ? "close": "next"]())
            }), a.closeBtn && f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb",
            function(a) {
                a.preventDefault();
                b.close()
            }), a.arrows && 1 < b.group.length && ((a.loop || 0 < a.index) && f(a.tpl.prev).appendTo(b.outer).bind("click.fb", b.prev), (a.loop || a.index < b.group.length - 1) && f(a.tpl.next).appendTo(b.outer).bind("click.fb", b.next)), b.trigger("afterShow"), a.loop || a.index !== a.group.length - 1) ? b.opts.autoPlay && !b.player.isActive && (b.opts.autoPlay = !1, b.play(!0)) : b.play(!1))
        },
        _afterZoomOut: function(a) {
            a = a || b.current;
            f(".fancybox-wrap").trigger("onReset").remove();
            f.extend(b, {
                group: {},
                opts: {},
                router: !1,
                current: null,
                isActive: !1,
                isOpened: !1,
                isOpen: !1,
                isClosing: !1,
                wrap: null,
                skin: null,
                outer: null,
                inner: null
            });
            b.trigger("afterClose", a)
        }
    });
    b.transitions = {
        getOrigPosition: function() {
            var a = b.current,
            d = a.element,
            e = a.orig,
            c = {},
            f = 50,
            g = 50,
            h = a.hPadding,
            k = a.wPadding,
            n = b.getViewport(); ! e && a.isDom && d.is(":visible") && (e = d.find("img:first"), e.length || (e = d));
            u(e) ? (c = e.offset(), e.is("img") && (f = e.outerWidth(), g = e.outerHeight())) : (c.top = n.y + (n.h - g) * a.topRatio, c.left = n.x + (n.w - f) * a.leftRatio);
            if ("fixed" === b.wrap.css("position") || a.locked) c.top -= n.y,
            c.left -= n.x;
            return c = {
                top: x(c.top - h * a.topRatio),
                left: x(c.left - k * a.leftRatio),
                width: x(f + k),
                height: x(g + h)
            }
        },
        step: function(a, d) {
            var e, c, f = d.prop;
            c = b.current;
            var g = c.wrapSpace,
            h = c.skinSpace;
            if ("width" === f || "height" === f) e = d.end === d.start ? 1 : (a - d.start) / (d.end - d.start),
            b.isClosing && (e = 1 - e),
            c = "width" === f ? c.wPadding: c.hPadding,
            c = a - c,
            b.skin[f](m("width" === f ? c: c - g * e)),
            b.inner[f](m("width" === f ? c: c - g * e - h * e))
        },
        zoomIn: function() {
            var a = b.current,
            d = a.pos,
            e = a.openEffect,
            c = "elastic" === e,
            l = f.extend({
                opacity: 1
            },
            d);
            delete l.position;
            c ? (d = this.getOrigPosition(), a.openOpacity && (d.opacity = 0.1)) : "fade" === e && (d.opacity = 0.1);
            b.wrap.css(d).animate(l, {
                duration: "none" === e ? 0 : a.openSpeed,
                easing: a.openEasing,
                step: c ? this.step: null,
                complete: b._afterZoomIn
            })
        },
        zoomOut: function() {
            var a = b.current,
            d = a.closeEffect,
            e = "elastic" === d,
            c = {
                opacity: 0.1
            };
            e && (c = this.getOrigPosition(), a.closeOpacity && (c.opacity = 0.1));
            b.wrap.animate(c, {
                duration: "none" === d ? 0 : a.closeSpeed,
                easing: a.closeEasing,
                step: e ? this.step: null,
                complete: b._afterZoomOut
            })
        },
        changeIn: function() {
            var a = b.current,
            d = a.nextEffect,
            e = a.pos,
            c = {
                opacity: 1
            },
            f = b.direction,
            g;
            e.opacity = 0.1;
            "elastic" === d && (g = "down" === f || "up" === f ? "top": "left", "down" === f || "right" === f ? (e[g] = x(m(e[g]) - 200), c[g] = "+=200px") : (e[g] = x(m(e[g]) + 200), c[g] = "-=200px"));
            "none" === d ? b._afterZoomIn() : b.wrap.css(e).animate(c, {
                duration: a.nextSpeed,
                easing: a.nextEasing,
                complete: b._afterZoomIn
            })
        },
        changeOut: function() {
            var a = b.previous,
            d = a.prevEffect,
            e = {
                opacity: 0.1
            },
            c = b.direction;
            "elastic" === d && (e["down" === c || "up" === c ? "top": "left"] = ("up" === c || "left" === c ? "-": "+") + "=200px");
            a.wrap.animate(e, {
                duration: "none" === d ? 0 : a.prevSpeed,
                easing: a.prevEasing,
                complete: function() {
                    f(this).trigger("onReset").remove()
                }
            })
        }
    };
    b.helpers.overlay = {
        defaults: {
            closeClick: !0,
            speedOut: 200,
            showEarly: !0,
            css: {},
            locked: !t,
            fixed: !0
        },
        overlay: null,
        fixed: !1,
        el: f("html"),
        create: function(a) {
            var d;
            a = f.extend({},
            this.defaults, a);
            this.overlay && this.close();
            d = b.coming ? b.coming.parent: a.parent;
            this.overlay = f('<div class="fancybox-overlay"></div>').appendTo(d && d.lenth ? d: "body");
            this.fixed = !1;
            a.fixed && b.defaults.fixed && (this.overlay.addClass("fancybox-overlay-fixed"), this.fixed = !0)
        },
        open: function(a) {
            var d = this;
            a = f.extend({},
            this.defaults, a);
            this.overlay ? this.overlay.unbind(".overlay").width("auto").height("auto") : this.create(a);
            this.fixed || (q.bind("resize.overlay", f.proxy(this.update, this)), this.update());
            a.closeClick && this.overlay.bind("click.overlay",
            function(a) {
                if (f(a.target).hasClass("fancybox-overlay")) return b.isActive ? b.close() : d.close(),
                !1
            });
            this.overlay.css(a.css).show()
        },
        close: function() {
            q.unbind("resize.overlay");
            this.el.hasClass("fancybox-lock") && (f(".fancybox-margin").removeClass("fancybox-margin"), this.el.removeClass("fancybox-lock"), q.scrollTop(this.scrollV).scrollLeft(this.scrollH));
            f(".fancybox-overlay").remove().hide();
            f.extend(this, {
                overlay: null,
                fixed: !1
            })
        },
        update: function() {
            var a = "100%",
            b;
            this.overlay.width(a).height("100%");
            J ? (b = Math.max(H.documentElement.offsetWidth, H.body.offsetWidth), p.width() > b && (a = p.width())) : p.width() > q.width() && (a = p.width());
            this.overlay.width(a).height(p.height())
        },
        onReady: function(a, b) {
            var e = this.overlay;
            f(".fancybox-overlay").stop(!0, !0);
            e || this.create(a);
            a.locked && this.fixed && b.fixed && (b.locked = this.overlay.append(b.wrap), b.fixed = !1); ! 0 === a.showEarly && this.beforeShow.apply(this, arguments)
        },
        beforeShow: function(a, b) {
            b.locked && !this.el.hasClass("fancybox-lock") && (!1 !== this.fixPosition && f("*").filter(function() {
                return "fixed" === f(this).css("position") && !f(this).hasClass("fancybox-overlay") && !f(this).hasClass("fancybox-wrap")
            }).addClass("fancybox-margin"), this.el.addClass("fancybox-margin"), this.scrollV = q.scrollTop(), this.scrollH = q.scrollLeft(), this.el.addClass("fancybox-lock"), q.scrollTop(this.scrollV).scrollLeft(this.scrollH));
            this.open(a)
        },
        onUpdate: function() {
            this.fixed || this.update()
        },
        afterClose: function(a) {
            this.overlay && !b.coming && this.overlay.fadeOut(a.speedOut, f.proxy(this.close, this))
        }
    };
    b.helpers.title = {
        defaults: {
            type: "float",
            position: "bottom"
        },
        beforeShow: function(a) {
            var d = b.current,
            e = d.title,
            c = a.type;
            f.isFunction(e) && (e = e.call(d.element, d));
            if (r(e) && "" !== f.trim(e)) {
                d = f('<div class="fancybox-title fancybox-title-' + c + '-wrap">' + e + "</div>");
                switch (c) {
                case "inside":
                    c = b.skin;
                    break;
                case "outside":
                    c = b.wrap;
                    break;
                case "over":
                    c = b.inner;
                    break;
                default:
                    c = b.skin,
                    d.appendTo("body"),
                    J && d.width(d.width()),
                    d.wrapInner('<span class="child"></span>'),
                    b.current.margin[2] += Math.abs(m(d.css("margin-bottom")))
                }
                d["top" === a.position ? "prependTo": "appendTo"](c)
            }
        }
    };
    f.fn.fancybox = function(a) {
        var d, e = f(this),
        c = this.selector || "",
        l = function(g) {
            var h = f(this).blur(),
            k = d,
            l,
            m;
            g.ctrlKey || g.altKey || g.shiftKey || g.metaKey || h.is(".fancybox-wrap") || (l = a.groupAttr || "data-fancybox-group", m = h.attr(l), m || (l = "rel", m = h.get(0)[l]), m && "" !== m && "nofollow" !== m && (h = c.length ? f(c) : e, h = h.filter("[" + l + '="' + m + '"]'), k = h.index(this)), a.index = k, !1 !== b.open(h, a) && g.preventDefault())
        };
        a = a || {};
        d = a.index || 0;
        c && !1 !== a.live ? p.undelegate(c, "click.fb-start").delegate(c + ":not('.fancybox-item, .fancybox-nav')", "click.fb-start", l) : e.unbind("click.fb-start").bind("click.fb-start", l);
        this.filter("[data-fancybox-start=1]").trigger("click");
        return this
    };
    p.ready(function() {
        var a, d;
        f.scrollbarWidth === w && (f.scrollbarWidth = function() {
            var a = f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),
            b = a.children(),
            b = b.innerWidth() - b.height(99).innerWidth();
            a.remove();
            return b
        });
        f.support.fixedPosition === w && (f.support.fixedPosition = function() {
            var a = f('<div style="position:fixed;top:20px;"></div>').appendTo("body"),
            b = 20 === a[0].offsetTop || 15 === a[0].offsetTop;
            a.remove();
            return b
        } ());
        f.extend(b.defaults, {
            scrollbarWidth: f.scrollbarWidth(),
            fixed: f.support.fixedPosition,
            parent: f("body")
        });
        a = f(s).width();
        K.addClass("fancybox-lock-test");
        d = f(s).width();
        K.removeClass("fancybox-lock-test");
        f("<style type='text/css'>.fancybox-margin{margin-right:" + (d - a) + "px;}</style>").appendTo("head")
    })
})(window, document, jQuery);;
// jquery.royalslider v9.4.92
(function(l) {
    function t(b, f) {
        var c, g, a = this,
        e = navigator.userAgent.toLowerCase();
        a.uid = l.rsModules.uid++;
        a.ns = ".rs" + a.uid;
        var d = document.createElement("div").style,
        j = ["webkit", "Moz", "ms", "O"],
        h = "",
        k = 0;
        for (c = 0; c < j.length; c++) g = j[c],
        !h && g + "Transform" in d && (h = g),
        g = g.toLowerCase(),
        window.requestAnimationFrame || (window.requestAnimationFrame = window[g + "RequestAnimationFrame"], window.cancelAnimationFrame = window[g + "CancelAnimationFrame"] || window[g + "CancelRequestAnimationFrame"]);
        window.requestAnimationFrame || (window.requestAnimationFrame = function(a) {
            var b = (new Date).getTime(),
            c = Math.max(0, 16 - (b - k)),
            d = window.setTimeout(function() {
                a(b + c)
            },
            c);
            k = b + c;
            return d
        });
        window.cancelAnimationFrame || (window.cancelAnimationFrame = function(a) {
            clearTimeout(a)
        });
        a.isIPAD = e.match(/(ipad)/);
        j = /(chrome)[ \/]([\w.]+)/.exec(e) || /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || 0 > e.indexOf("compatible") && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e) || [];
        c = j[1] || "";
        g = j[2] || "0";
        j = {};
        c && (j[c] = !0, j.version = g);
        j.chrome && (j.webkit = !0);
        a._a = j;
        a.isAndroid = -1 < e.indexOf("android");
        a.slider = l(b);
        a.ev = l(a);
        a._b = l(document);
        a.st = l.extend({},
        l.fn.royalSlider.defaults, f);
        a._c = a.st.transitionSpeed;
        a._d = 0;
        if (a.st.allowCSS3 && (!j.webkit || a.st.allowCSS3OnWebkit)) e = h + (h ? "T": "t"),
        a._e = e + "ransform" in d && e + "ransition" in d,
        a._e && (a._f = h + (h ? "P": "p") + "erspective" in d);
        h = h.toLowerCase();
        a._g = "-" + h + "-";
        a._h = "vertical" === a.st.slidesOrientation ? !1 : !0;
        a._i = a._h ? "left": "top";
        a._j = a._h ? "width": "height";
        a._k = -1;
        a._l = "fade" === a.st.transitionType ? !1 : !0;
        a._l || (a.st.sliderDrag = !1, a._m = 10);
        a._n = "z-index:0; display:none; opacity:0;";
        a._o = 0;
        a._p = 0;
        a._q = 0;
        l.each(l.rsModules,
        function(b, c) {
            "uid" !== b && c.call(a)
        });
        a.slides = [];
        a._r = 0; (a.st.slides ? l(a.st.slides) : a.slider.children().detach()).each(function() {
            a._s(this, !0)
        });
        a.st.randomizeSlides && a.slides.sort(function() {
            return 0.5 - Math.random()
        });
        a.numSlides = a.slides.length;
        a._t();
        a.st.startSlideId ? a.st.startSlideId > a.numSlides - 1 && (a.st.startSlideId = a.numSlides - 1) : a.st.startSlideId = 0;
        a._o = a.staticSlideId = a.currSlideId = a._u = a.st.startSlideId;
        a.currSlide = a.slides[a.currSlideId];
        a._v = 0;
        a.msTouch = !1;
        a.slider.addClass((a._h ? "rsHor": "rsVer") + (a._l ? "": " rsFade"));
        d = '<div class="rsOverflow"><div class="rsContainer">';
        a.slidesSpacing = a.st.slidesSpacing;
        a._w = (a._h ? a.slider.width() : a.slider.height()) + a.st.slidesSpacing;
        a._x = Boolean(0 < a._y);
        1 >= a.numSlides && (a._z = !1);
        a._a1 = a._z && a._l ? 2 === a.numSlides ? 1 : 2 : 0;
        a._b1 = 6 > a.numSlides ? a.numSlides: 6;
        a._c1 = 0;
        a._d1 = 0;
        a.slidesJQ = [];
        for (c = 0; c < a.numSlides; c++) a.slidesJQ.push(l('<div style="' + (a._l ? "": c !== a.currSlideId ? a._n: "z-index:0;") + '" class="rsSlide "></div>'));
        a._e1 = d = l(d + "</div></div>");
        h = a.ns;
        a.msEnabled = window.navigator.msPointerEnabled;
        a.msEnabled ? (a.msTouch = Boolean(1 < window.navigator.msMaxTouchPoints), a.hasTouch = !1, a._n1 = 0.2, a._j1 = "MSPointerDown" + h, a._k1 = "MSPointerMove" + h, a._l1 = "MSPointerUp" + h, a._m1 = "MSPointerCancel" + h) : (a._j1 = "mousedown" + h, a._k1 = "mousemove" + h, a._l1 = "mouseup" + h, a._m1 = "mouseup" + h, "ontouchstart" in window || "createTouch" in document ? (a.hasTouch = !0, a._j1 += " touchstart" + h, a._k1 += " touchmove" + h, a._l1 += " touchend" + h, a._m1 += " touchcancel" + h, a._n1 = 0.5, a.st.sliderTouch && (a._f1 = !0)) : (a.hasTouch = !1, a._n1 = 0.2));
        a.st.sliderDrag && (a._f1 = !0, j.msie || j.opera ? a._g1 = a._h1 = "move": j.mozilla ? (a._g1 = "-moz-grab", a._h1 = "-moz-grabbing") : j.webkit && -1 != navigator.platform.indexOf("Mac") && (a._g1 = "-webkit-grab", a._h1 = "-webkit-grabbing"), a._i1());
        a.slider.html(d);
        a._o1 = a.st.controlsInside ? a._e1: a.slider;
        a._p1 = a._e1.children(".rsContainer");
        a.msEnabled && a._p1.css("-ms-touch-action", a._h ? "pan-y": "pan-x");
        a._q1 = l('<div class="rsPreloader"></div>');
        d = a._p1.children(".rsSlide");
        a._r1 = a.slidesJQ[a.currSlideId];
        a._s1 = 0;
        a._e ? (a._t1 = "transition-property", a._u1 = "transition-duration", a._v1 = "transition-timing-function", a._w1 = a._x1 = a._g + "transform", a._f ? (j.webkit && !j.chrome && a.slider.addClass("rsWebkit3d"), /iphone|ipad|ipod/gi.test(navigator.appVersion), a._y1 = "translate3d(", a._z1 = "px, ", a._a2 = "px, 0px)") : (a._y1 = "translate(", a._z1 = "px, ", a._a2 = "px)"), a._l ? a._p1[a._g + a._t1] = a._g + "transform": (h = {},
        h[a._g + a._t1] = "opacity", h[a._g + a._u1] = a.st.transitionSpeed + "ms", h[a._g + a._v1] = a.st.css3easeInOut, d.css(h))) : (a._x1 = "left", a._w1 = "top");
        var n;
        l(window).on("resize" + a.ns,
        function() {
            n && clearTimeout(n);
            n = setTimeout(function() {
                a.updateSliderSize()
            },
            50)
        });
        a.ev.trigger("rsAfterPropsSetup");
        a.updateSliderSize();
        a.st.keyboardNavEnabled && a._b2();
        if (a.st.arrowsNavHideOnTouch && (a.hasTouch || a.msTouch)) a.st.arrowsNav = !1;
        a.st.arrowsNav && (d = a._o1, l('<div class="rsArrow rsArrowLeft"><div class="rsArrowIcn"></div></div><div class="rsArrow rsArrowRight"><div class="rsArrowIcn"></div></div>').appendTo(d), a._c2 = d.children(".rsArrowLeft").click(function(b) {
            b.preventDefault();
            a.prev()
        }), a._d2 = d.children(".rsArrowRight").click(function(b) {
            b.preventDefault();
            a.next()
        }), a.st.arrowsNavAutoHide && !a.hasTouch && (a._c2.addClass("rsHidden"), a._d2.addClass("rsHidden"), d.one("mousemove.arrowshover",
        function() {
            a._c2.removeClass("rsHidden");
            a._d2.removeClass("rsHidden")
        }), d.hover(function() {
            a._e2 || (a._c2.removeClass("rsHidden"), a._d2.removeClass("rsHidden"))
        },
        function() {
            a._e2 || (a._c2.addClass("rsHidden"), a._d2.addClass("rsHidden"))
        })), a.ev.on("rsOnUpdateNav",
        function() {
            a._f2()
        }), a._f2());
        if (a._f1) a._p1.on(a._j1,
        function(b) {
            a._g2(b)
        });
        else a.dragSuccess = !1;
        var m = ["rsPlayBtnIcon", "rsPlayBtn", "rsCloseVideoBtn", "rsCloseVideoIcn"];
        a._p1.click(function(b) {
            if (!a.dragSuccess) {
                var c = l(b.target).attr("class");
                if ( - 1 !== l.inArray(c, m) && a.toggleVideo()) return ! 1;
                if (a.st.navigateByClick && !a._h2) {
                    if (l(b.target).closest(".rsNoDrag", a._r1).length) return ! 0;
                    a._i2(b)
                }
                a.ev.trigger("rsSlideClick")
            }
        }).on("click.rs", "a",
        function() {
            if (a.dragSuccess) return ! 1;
            a._h2 = !0;
            setTimeout(function() {
                a._h2 = !1
            },
            3)
        });
        a.ev.trigger("rsAfterInit")
    }
    l.rsModules || (l.rsModules = {
        uid: 0
    });
    t.prototype = {
        constructor: t,
        _i2: function(b) {
            b = b[this._h ? "pageX": "pageY"] - this._j2;
            b >= this._q ? this.next() : 0 > b && this.prev()
        },
        _t: function() {
            var b;
            b = this.st.numImagesToPreload;
            if (this._z = this.st.loop) 2 === this.numSlides ? (this._z = !1, this.st.loopRewind = !0) : 2 > this.numSlides && (this.st.loopRewind = this._z = !1);
            this._z && 0 < b && (4 >= this.numSlides ? b = 1 : this.st.numImagesToPreload > (this.numSlides - 1) / 2 && (b = Math.floor((this.numSlides - 1) / 2)));
            this._y = b
        },
        _s: function(b, f) {
            function c(a, b) {
                b ? e.images.push(a.attr(b)) : e.images.push(a.text());
                if (j) {
                    j = !1;
                    e.caption = "src" === b ? a.attr("alt") : a.contents();
                    e.image = e.images[0];
                    e.videoURL = a.attr("data-rsVideo");
                    var c = a.attr("data-rsw"),
                    d = a.attr("data-rsh");
                    "undefined" !== typeof c && !1 !== c && "undefined" !== typeof d && !1 !== d ? (e.iW = parseInt(c, 10), e.iH = parseInt(d, 10)) : g.st.imgWidth && g.st.imgHeight && (e.iW = g.st.imgWidth, e.iH = g.st.imgHeight)
                }
            }
            var g = this,
            a, e = {},
            d, j = !0;
            b = l(b);
            g._k2 = b;
            g.ev.trigger("rsBeforeParseNode", [b, e]);
            if (!e.stopParsing) return b = g._k2,
            e.id = g._r,
            e.contentAdded = !1,
            g._r++,
            e.images = [],
            e.isBig = !1,
            e.hasCover || (b.hasClass("rsImg") ? (d = b, a = !0) : (d = b.find(".rsImg"), d.length && (a = !0)), a ? (e.bigImage = d.eq(0).attr("data-rsBigImg"), d.each(function() {
                var a = l(this);
                a.is("a") ? c(a, "href") : a.is("img") ? c(a, "src") : c(a)
            })) : b.is("img") && (b.addClass("rsImg rsMainSlideImage"), c(b, "src"))),
            d = b.find(".rsCaption"),
            d.length && (e.caption = d.remove()),
            e.content = b,
            g.ev.trigger("rsAfterParseNode", [b, e]),
            f && g.slides.push(e),
            0 === e.images.length && (e.isLoaded = !0, e.isRendered = !1, e.isLoading = !1, e.images = null),
            e
        },
        _b2: function() {
            var b = this,
            f, c, g = function(a) {
                37 === a ? b.prev() : 39 === a && b.next()
            };
            b._b.on("keydown" + b.ns,
            function(a) {
                if (!b._l2 && (c = a.keyCode, (37 === c || 39 === c) && !f)) g(c),
                f = setInterval(function() {
                    g(c)
                },
                700)
            }).on("keyup" + b.ns,
            function() {
                f && (clearInterval(f), f = null)
            })
        },
        goTo: function(b, f) {
            b !== this.currSlideId && this._m2(b, this.st.transitionSpeed, !0, !f)
        },
        destroy: function(b) {
            this.ev.trigger("rsBeforeDestroy");
            this._b.off("keydown" + this.ns + " keyup" + this.ns + " " + this._k1 + " " + this._l1);
            this._p1.off(this._j1 + " click");
            this.slider.data("royalSlider", null);
            l.removeData(this.slider, "royalSlider");
            l(window).off("resize" + this.ns);
            b && this.slider.remove();
            this.ev = this.slider = this.slides = null
        },
        _n2: function(b, f) {
            function c(c, e, f) {
                c.isAdded ? (g(e, c), a(e, c)) : (f || (f = d.slidesJQ[e]), c.holder ? f = c.holder: (f = d.slidesJQ[e] = l(f), c.holder = f), c.appendOnLoaded = !1, a(e, c, f), g(e, c), d._p2(c, f, b), c.isAdded = !0)
            }
            function g(a, c) {
                c.contentAdded || (d.setItemHtml(c, b), b || (c.contentAdded = !0))
            }
            function a(a, b, c) {
                d._l && (c || (c = d.slidesJQ[a]), c.css(d._i, (a + d._d1 + p) * d._w))
            }
            function e(a) {
                if (k) {
                    if (a > n - 1) return e(a - n);
                    if (0 > a) return e(n + a)
                }
                return a
            }
            var d = this,
            j, h, k = d._z,
            n = d.numSlides;
            if (!isNaN(f)) return e(f);
            var m = d.currSlideId,
            p, q = b ? Math.abs(d._o2 - d.currSlideId) >= d.numSlides - 1 ? 0 : 1 : d._y,
            r = Math.min(2, q),
            u = !1,
            t = !1,
            s;
            for (h = m; h < m + 1 + r; h++) if (s = e(h), (j = d.slides[s]) && (!j.isAdded || !j.positionSet)) {
                u = !0;
                break
            }
            for (h = m - 1; h > m - 1 - r; h--) if (s = e(h), (j = d.slides[s]) && (!j.isAdded || !j.positionSet)) {
                t = !0;
                break
            }
            if (u) for (h = m; h < m + q + 1; h++) s = e(h),
            p = Math.floor((d._u - (m - h)) / d.numSlides) * d.numSlides,
            (j = d.slides[s]) && c(j, s);
            if (t) for (h = m - 1; h > m - 1 - q; h--) s = e(h),
            p = Math.floor((d._u - (m - h)) / n) * n,
            (j = d.slides[s]) && c(j, s);
            if (!b) {
                r = e(m - q);
                m = e(m + q);
                q = r > m ? 0 : r;
                for (h = 0; h < n; h++) if (! (r > m && h > r - 1) && (h < q || h > m)) if ((j = d.slides[h]) && j.holder) j.holder.detach(),
                j.isAdded = !1
            }
        },
        setItemHtml: function(b, f) {
            var c = this,
            g = function() {
                if (b.images) {
                    if (!b.isLoading) {
                        var e, f;
                        b.content.hasClass("rsImg") ? (e = b.content, f = !0) : e = b.content.find(".rsImg:not(img)");
                        e && !e.is("img") && e.each(function() {
                            var a = l(this),
                            c = '<img class="rsImg" src="' + (a.is("a") ? a.attr("href") : a.text()) + '" />';
                            f ? b.content = l(c) : a.replaceWith(c)
                        });
                        e = f ? b.content: b.content.find("img.rsImg");
                        h();
                        e.eq(0).addClass("rsMainSlideImage");
                        b.iW && b.iH && (b.isLoaded || c._q2(b), d());
                        b.isLoading = !0;
                        if (b.isBig) l("<img />").on("load.rs error.rs",
                        function() {
                            l(this).off("load.rs error.rs");
                            a([this], !0)
                        }).attr("src", b.image);
                        else {
                            b.loaded = [];
                            b.numStartedLoad = 0;
                            e = function() {
                                l(this).off("load.rs error.rs");
                                b.loaded.push(this);
                                b.loaded.length === b.numStartedLoad && a(b.loaded, !1)
                            };
                            for (var g = 0; g < b.images.length; g++) {
                                var j = l("<img />");
                                b.numStartedLoad++;
                                j.on("load.rs error.rs", e).attr("src", b.images[g])
                            }
                        }
                    }
                } else b.isRendered = !0,
                b.isLoaded = !0,
                b.isLoading = !1,
                d(!0)
            },
            a = function(a, c) {
                if (a.length) {
                    var d = a[0];
                    if (c !== b.isBig)(d = b.holder.children()) && 1 < d.length && k();
                    else if (b.iW && b.iH) e();
                    else if (b.iW = d.width, b.iH = d.height, b.iW && b.iH) e();
                    else {
                        var f = new Image;
                        f.onload = function() {
                            f.width ? (b.iW = f.width, b.iH = f.height, e()) : setTimeout(function() {
                                f.width && (b.iW = f.width, b.iH = f.height);
                                e()
                            },
                            1E3)
                        };
                        f.src = d.src
                    }
                } else e()
            },
            e = function() {
                b.isLoaded = !0;
                b.isLoading = !1;
                d();
                k();
                j()
            },
            d = function() {
                if (!b.isAppended && c.ev) {
                    var a = c.st.visibleNearby,
                    d = b.id - c._o;
                    if (!f && !b.appendOnLoaded && c.st.fadeinLoadedSlide && (0 === d || (a || c._r2 || c._l2) && ( - 1 === d || 1 === d))) a = {
                        visibility: "visible",
                        opacity: 0
                    },
                    a[c._g + "transition"] = "opacity 400ms ease-in-out",
                    b.content.css(a),
                    setTimeout(function() {
                        b.content.css("opacity", 1)
                    },
                    16);
                    b.holder.find(".rsPreloader").length ? b.holder.append(b.content) : b.holder.html(b.content);
                    b.isAppended = !0;
                    b.isLoaded && (c._q2(b), j());
                    b.sizeReady || (b.sizeReady = !0, setTimeout(function() {
                        c.ev.trigger("rsMaybeSizeReady", b)
                    },
                    100))
                }
            },
            j = function() { ! b.loadedTriggered && c.ev && (b.isLoaded = b.loadedTriggered = !0, b.holder.trigger("rsAfterContentSet"), c.ev.trigger("rsAfterContentSet", b))
            },
            h = function() {
                c.st.usePreloader && b.holder.html(c._q1.clone())
            },
            k = function() {
                if (c.st.usePreloader) {
                    var a = b.holder.find(".rsPreloader");
                    a.length && a.remove()
                }
            };
            b.isLoaded ? d() : f ? !c._l && b.images && b.iW && b.iH ? g() : (b.holder.isWaiting = !0, h(), b.holder.slideId = -99) : g()
        },
        _p2: function(b) {
            this._p1.append(b.holder);
            b.appendOnLoaded = !1
        },
        _g2: function(b, f) {
            var c = this,
            g, a = "touchstart" === b.type;
            c._s2 = a;
            c.ev.trigger("rsDragStart");
            if (l(b.target).closest(".rsNoDrag", c._r1).length) return c.dragSuccess = !1,
            !0; ! f && c._r2 && (c._t2 = !0, c._u2());
            c.dragSuccess = !1;
            if (c._l2) a && (c._v2 = !0);
            else {
                a && (c._v2 = !1);
                c._w2();
                if (a) {
                    var e = b.originalEvent.touches;
                    if (e && 0 < e.length) g = e[0],
                    1 < e.length && (c._v2 = !0);
                    else return
                } else b.preventDefault(),
                g = b,
                c.msEnabled && (g = g.originalEvent);
                c._l2 = !0;
                c._b.on(c._k1,
                function(a) {
                    c._x2(a, f)
                }).on(c._l1,
                function(a) {
                    c._y2(a, f)
                });
                c._z2 = "";
                c._a3 = !1;
                c._b3 = g.pageX;
                c._c3 = g.pageY;
                c._d3 = c._v = (!f ? c._h: c._e3) ? g.pageX: g.pageY;
                c._f3 = 0;
                c._g3 = 0;
                c._h3 = !f ? c._p: c._i3;
                c._j3 = (new Date).getTime();
                if (a) c._e1.on(c._m1,
                function(a) {
                    c._y2(a, f)
                })
            }
        },
        _k3: function(b, f) {
            if (this._l3) {
                var c = this._m3,
                g = b.pageX - this._b3,
                a = b.pageY - this._c3,
                e = this._h3 + g,
                d = this._h3 + a,
                j = !f ? this._h: this._e3,
                e = j ? e: d,
                d = this._z2;
                this._a3 = !0;
                this._b3 = b.pageX;
                this._c3 = b.pageY;
                "x" === d && 0 !== g ? this._f3 = 0 < g ? 1 : -1 : "y" === d && 0 !== a && (this._g3 = 0 < a ? 1 : -1);
                d = j ? this._b3: this._c3;
                g = j ? g: a;
                f ? e > this._n3 ? e = this._h3 + g * this._n1: e < this._o3 && (e = this._h3 + g * this._n1) : this._z || (0 >= this.currSlideId && 0 < d - this._d3 && (e = this._h3 + g * this._n1), this.currSlideId >= this.numSlides - 1 && 0 > d - this._d3 && (e = this._h3 + g * this._n1));
                this._h3 = e;
                200 < c - this._j3 && (this._j3 = c, this._v = d);
                f ? this._q3(this._h3) : this._l && this._p3(this._h3)
            }
        },
        _x2: function(b, f) {
            var c = this,
            g, a = "touchmove" === b.type;
            if (!c._s2 || a) {
                if (a) {
                    if (c._r3) return;
                    var e = b.originalEvent.touches;
                    if (e) {
                        if (1 < e.length) return;
                        g = e[0]
                    } else return
                } else g = b,
                c.msEnabled && (g = g.originalEvent);
                c._a3 || (c._e && (!f ? c._p1: c._s3).css(c._g + c._u1, "0s"),
                function j() {
                    c._l2 && (c._t3 = requestAnimationFrame(j), c._u3 && c._k3(c._u3, f))
                } ());
                if (c._l3) b.preventDefault(),
                c._m3 = (new Date).getTime(),
                c._u3 = g;
                else if (e = !f ? c._h: c._e3, g = Math.abs(g.pageX - c._b3) - Math.abs(g.pageY - c._c3) - (e ? -7 : 7), 7 < g) {
                    if (e) b.preventDefault(),
                    c._z2 = "x";
                    else if (a) {
                        c._v3();
                        return
                    }
                    c._l3 = !0
                } else if ( - 7 > g) {
                    if (e) {
                        if (a) {
                            c._v3();
                            return
                        }
                    } else b.preventDefault(),
                    c._z2 = "y";
                    c._l3 = !0
                }
            }
        },
        _v3: function() {
            this._r3 = !0;
            this._a3 = this._l2 = !1;
            this._y2()
        },
        _y2: function(b, f) {
            function c(a) {
                return 100 > a ? 100 : 500 < a ? 500 : a
            }
            function g(b, d) {
                if (a._l || f) j = ( - a._u - a._d1) * a._w,
                h = Math.abs(a._p - j),
                a._c = h / d,
                b && (a._c += 250),
                a._c = c(a._c),
                a._x3(j, !1)
            }
            var a = this,
            e, d, j, h;
            d = "touchend" === b.type || "touchcancel" === b.type;
            if (!a._s2 || d) if (a._s2 = !1, a.ev.trigger("rsDragRelease"), a._u3 = null, a._l2 = !1, a._r3 = !1, a._l3 = !1, a._m3 = 0, cancelAnimationFrame(a._t3), a._a3 && (f ? a._q3(a._h3) : a._l && a._p3(a._h3)), a._b.off(a._k1).off(a._l1), d && a._e1.off(a._m1), a._i1(), !a._a3 && !a._v2 && f && a._w3) {
                var k = l(b.target).closest(".rsNavItem");
                k.length && a.goTo(k.index())
            } else {
                e = !f ? a._h: a._e3;
                if (!a._a3 || "y" === a._z2 && e || "x" === a._z2 && !e) if (!f && a._t2) {
                    a._t2 = !1;
                    if (a.st.navigateByClick) {
                        a._i2(a.msEnabled ? b.originalEvent: b);
                        a.dragSuccess = !0;
                        return
                    }
                    a.dragSuccess = !0
                } else {
                    a._t2 = !1;
                    a.dragSuccess = !1;
                    return
                } else a.dragSuccess = !0;
                a._t2 = !1;
                a._z2 = "";
                var n = a.st.minSlideOffset;
                d = d ? b.originalEvent.changedTouches[0] : a.msEnabled ? b.originalEvent: b;
                var m = e ? d.pageX: d.pageY,
                p = a._d3;
                d = a._v;
                var q = a.currSlideId,
                r = a.numSlides,
                u = e ? a._f3: a._g3,
                t = a._z;
                Math.abs(m - p);
                e = m - d;
                d = (new Date).getTime() - a._j3;
                d = Math.abs(e) / d;
                if (0 === u || 1 >= r) g(!0, d);
                else {
                    if (!t && !f) if (0 >= q) {
                        if (0 < u) {
                            g(!0, d);
                            return
                        }
                    } else if (q >= r - 1 && 0 > u) {
                        g(!0, d);
                        return
                    }
                    if (f) {
                        j = a._i3;
                        if (j > a._n3) j = a._n3;
                        else if (j < a._o3) j = a._o3;
                        else {
                            n = d * d / 0.006;
                            k = -a._i3;
                            m = a._y3 - a._z3 + a._i3;
                            0 < e && n > k ? (k += a._z3 / (15 / (0.003 * (n / d))), d = d * k / n, n = k) : 0 > e && n > m && (m += a._z3 / (15 / (0.003 * (n / d))), d = d * m / n, n = m);
                            k = Math.max(Math.round(d / 0.003), 50);
                            j += n * (0 > e ? -1 : 1);
                            if (j > a._n3) {
                                a._a4(j, k, !0, a._n3, 200);
                                return
                            }
                            if (j < a._o3) {
                                a._a4(j, k, !0, a._o3, 200);
                                return
                            }
                        }
                        a._a4(j, k, !0)
                    } else p + n < m ? 0 > u ? g(!1, d) : a._m2("prev", c(Math.abs(a._p - ( - a._u - a._d1 + 1) * a._w) / d), !1, !0, !0) : p - n > m ? 0 < u ? g(!1, d) : a._m2("next", c(Math.abs(a._p - ( - a._u - a._d1 - 1) * a._w) / d), !1, !0, !0) : g(!1, d)
                }
            }
        },
        _p3: function(b) {
            b = this._p = b;
            this._e ? this._p1.css(this._x1, this._y1 + (this._h ? b + this._z1 + 0 : 0 + this._z1 + b) + this._a2) : this._p1.css(this._h ? this._x1: this._w1, b)
        },
        updateSliderSize: function(b) {
            var f, c;
            if (this.st.autoScaleSlider) {
                var g = this.st.autoScaleSliderWidth,
                a = this.st.autoScaleSliderHeight;
                this.st.autoScaleHeight ? (f = this.slider.width(), f != this.width && (this.slider.css("height", f * (a / g)), f = this.slider.width()), c = this.slider.height()) : (c = this.slider.height(), c != this.height && (this.slider.css("width", c * (g / a)), c = this.slider.height()), f = this.slider.width())
            } else f = this.slider.width(),
            c = this.slider.height();
            if (b || f != this.width || c != this.height) {
                this.width = f;
                this.height = c;
                this._b4 = f;
                this._c4 = c;
                this.ev.trigger("rsBeforeSizeSet");
                this.ev.trigger("rsAfterSizePropSet");
                this._e1.css({
                    width: this._b4,
                    height: this._c4
                });
                this._w = (this._h ? this._b4: this._c4) + this.st.slidesSpacing;
                this._d4 = this.st.imageScalePadding;
                for (f = 0; f < this.slides.length; f++) b = this.slides[f],
                b.positionSet = !1,
                b && (b.images && b.isLoaded) && (b.isRendered = !1, this._q2(b));
                if (this._e4) for (f = 0; f < this._e4.length; f++) b = this._e4[f],
                b.holder.css(this._i, (b.id + this._d1) * this._w);
                this._n2();
                this._l && (this._e && this._p1.css(this._g + "transition-duration", "0s"), this._p3(( - this._u - this._d1) * this._w));
                this.ev.trigger("rsOnUpdateNav")
            }
            this._j2 = this._e1.offset();
            this._j2 = this._j2[this._i]
        },
        appendSlide: function(b, f) {
            var c = this._s(b);
            if (isNaN(f) || f > this.numSlides) f = this.numSlides;
            this.slides.splice(f, 0, c);
            this.slidesJQ.splice(f, 0, '<div style="' + (this._l ? "position:absolute;": this._n) + '" class="rsSlide"></div>');
            f < this.currSlideId && this.currSlideId++;
            this.ev.trigger("rsOnAppendSlide", [c, f]);
            this._f4(f);
            f === this.currSlideId && this.ev.trigger("rsAfterSlideChange")
        },
        removeSlide: function(b) {
            var f = this.slides[b];
            f && (f.holder && f.holder.remove(), b < this.currSlideId && this.currSlideId--, this.slides.splice(b, 1), this.slidesJQ.splice(b, 1), this.ev.trigger("rsOnRemoveSlide", [b]), this._f4(b), b === this.currSlideId && this.ev.trigger("rsAfterSlideChange"))
        },
        _f4: function() {
            var b = this,
            f = b.numSlides,
            f = 0 >= b._u ? 0 : Math.floor(b._u / f);
            b.numSlides = b.slides.length;
            0 === b.numSlides ? (b.currSlideId = b._d1 = b._u = 0, b.currSlide = b._g4 = null) : b._u = f * b.numSlides + b.currSlideId;
            for (f = 0; f < b.numSlides; f++) b.slides[f].id = f;
            b.currSlide = b.slides[b.currSlideId];
            b._r1 = b.slidesJQ[b.currSlideId];
            b.currSlideId >= b.numSlides ? b.goTo(b.numSlides - 1) : 0 > b.currSlideId && b.goTo(0);
            b._t();
            b._l && b._z && b._p1.css(b._g + b._u1, "0ms");
            b._h4 && clearTimeout(b._h4);
            b._h4 = setTimeout(function() {
                b._l && b._p3(( - b._u - b._d1) * b._w);
                b._n2();
                b._l || b._r1.css({
                    display: "block",
                    opacity: 1
                })
            },
            14);
            b.ev.trigger("rsOnUpdateNav")
        },
        _i1: function() {
            this._f1 && this._l && (this._g1 ? this._e1.css("cursor", this._g1) : (this._e1.removeClass("grabbing-cursor"), this._e1.addClass("grab-cursor")))
        },
        _w2: function() {
            this._f1 && this._l && (this._h1 ? this._e1.css("cursor", this._h1) : (this._e1.removeClass("grab-cursor"), this._e1.addClass("grabbing-cursor")))
        },
        next: function(b) {
            this._m2("next", this.st.transitionSpeed, !0, !b)
        },
        prev: function(b) {
            this._m2("prev", this.st.transitionSpeed, !0, !b)
        },
        _m2: function(b, f, c, g, a) {
            var e = this,
            d, j, h;
            e.ev.trigger("rsBeforeMove", [b, g]);
            h = "next" === b ? e.currSlideId + 1 : "prev" === b ? e.currSlideId - 1 : b = parseInt(b, 10);
            if (!e._z) {
                if (0 > h) {
                    e._i4("left", !g);
                    return
                }
                if (h >= e.numSlides) {
                    e._i4("right", !g);
                    return
                }
            }
            e._r2 && (e._u2(!0), c = !1);
            j = h - e.currSlideId;
            h = e._o2 = e.currSlideId;
            var k = e.currSlideId + j;
            g = e._u;
            var l;
            e._z ? (k = e._n2(!1, k), g += j) : g = k;
            e._o = k;
            e._g4 = e.slidesJQ[e.currSlideId];
            e._u = g;
            e.currSlideId = e._o;
            e.currSlide = e.slides[e.currSlideId];
            e._r1 = e.slidesJQ[e.currSlideId];
            var k = e.st.slidesDiff,
            m = Boolean(0 < j);
            j = Math.abs(j);
            var p = Math.floor(h / e._y),
            q = Math.floor((h + (m ? k: -k)) / e._y),
            p = (m ? Math.max(p, q) : Math.min(p, q)) * e._y + (m ? e._y - 1 : 0);
            p > e.numSlides - 1 ? p = e.numSlides - 1 : 0 > p && (p = 0);
            h = m ? p - h: h - p;
            h > e._y && (h = e._y);
            if (j > h + k) {
                e._d1 += (j - (h + k)) * (m ? -1 : 1);
                f *= 1.4;
                for (h = 0; h < e.numSlides; h++) e.slides[h].positionSet = !1
            }
            e._c = f;
            e._n2(!0);
            a || (l = !0);
            d = ( - g - e._d1) * e._w;
            l ? setTimeout(function() {
                e._j4 = !1;
                e._x3(d, b, !1, c);
                e.ev.trigger("rsOnUpdateNav")
            },
            0) : (e._x3(d, b, !1, c), e.ev.trigger("rsOnUpdateNav"))
        },
        _f2: function() {
            this.st.arrowsNav && (1 >= this.numSlides ? (this._c2.css("display", "none"), this._d2.css("display", "none")) : (this._c2.css("display", "block"), this._d2.css("display", "block"), !this._z && !this.st.loopRewind && (0 === this.currSlideId ? this._c2.addClass("rsArrowDisabled") : this._c2.removeClass("rsArrowDisabled"), this.currSlideId === this.numSlides - 1 ? this._d2.addClass("rsArrowDisabled") : this._d2.removeClass("rsArrowDisabled"))))
        },
        _x3: function(b, f, c, g, a) {
            function e() {
                var a;
                if (j && (a = j.data("rsTimeout"))) j !== h && j.css({
                    opacity: 0,
                    display: "none",
                    zIndex: 0
                }),
                clearTimeout(a),
                j.data("rsTimeout", "");
                if (a = h.data("rsTimeout")) clearTimeout(a),
                h.data("rsTimeout", "")
            }
            var d = this,
            j, h, k = {};
            isNaN(d._c) && (d._c = 400);
            d._p = d._h3 = b;
            d.ev.trigger("rsBeforeAnimStart");
            d._e ? d._l ? (d._c = parseInt(d._c, 10), c = d._g + d._v1, k[d._g + d._u1] = d._c + "ms", k[c] = g ? l.rsCSS3Easing[d.st.easeInOut] : l.rsCSS3Easing[d.st.easeOut], d._p1.css(k), g || !d.hasTouch ? setTimeout(function() {
                d._p3(b)
            },
            5) : d._p3(b)) : (d._c = d.st.transitionSpeed, j = d._g4, h = d._r1, h.data("rsTimeout") && h.css("opacity", 0), e(), j && j.data("rsTimeout", setTimeout(function() {
                k[d._g + d._u1] = "0ms";
                k.zIndex = 0;
                k.display = "none";
                j.data("rsTimeout", "");
                j.css(k);
                setTimeout(function() {
                    j.css("opacity", 0)
                },
                16)
            },
            d._c + 60)), k.display = "block", k.zIndex = d._m, k.opacity = 0, k[d._g + d._u1] = "0ms", k[d._g + d._v1] = l.rsCSS3Easing[d.st.easeInOut], h.css(k), h.data("rsTimeout", setTimeout(function() {
                h.css(d._g + d._u1, d._c + "ms");
                h.data("rsTimeout", setTimeout(function() {
                    h.css("opacity", 1);
                    h.data("rsTimeout", "")
                },
                20))
            },
            20))) : d._l ? (k[d._h ? d._x1: d._w1] = b + "px", d._p1.animate(k, d._c, g ? d.st.easeInOut: d.st.easeOut)) : (j = d._g4, h = d._r1, h.stop(!0, !0).css({
                opacity: 0,
                display: "block",
                zIndex: d._m
            }), d._c = d.st.transitionSpeed, h.animate({
                opacity: 1
            },
            d._c, d.st.easeInOut), e(), j && j.data("rsTimeout", setTimeout(function() {
                j.stop(!0, !0).css({
                    opacity: 0,
                    display: "none",
                    zIndex: 0
                })
            },
            d._c + 60)));
            d._r2 = !0;
            d.loadingTimeout && clearTimeout(d.loadingTimeout);
            d.loadingTimeout = a ? setTimeout(function() {
                d.loadingTimeout = null;
                a.call()
            },
            d._c + 60) : setTimeout(function() {
                d.loadingTimeout = null;
                d._k4(f)
            },
            d._c + 60)
        },
        _u2: function(b) {
            this._r2 = !1;
            clearTimeout(this.loadingTimeout);
            if (this._l) if (this._e) {
                if (!b) {
                    b = this._p;
                    var f = this._h3 = this._l4();
                    this._p1.css(this._g + this._u1, "0ms");
                    b !== f && this._p3(f)
                }
            } else this._p1.stop(!0),
            this._p = parseInt(this._p1.css(this._x1), 10);
            else 20 < this._m ? this._m = 10 : this._m++
        },
        _l4: function() {
            var b = window.getComputedStyle(this._p1.get(0), null).getPropertyValue(this._g + "transform").replace(/^matrix\(/i, "").split(/, |\)$/g),
            f = 0 === b[0].indexOf("matrix3d");
            return parseInt(b[this._h ? f ? 12 : 4 : f ? 13 : 5], 10)
        },
        _m4: function(b, f) {
            return this._e ? this._y1 + (f ? b + this._z1 + 0 : 0 + this._z1 + b) + this._a2: b
        },
        _k4: function() {
            this._l || (this._r1.css("z-index", 0), this._m = 10);
            this._r2 = !1;
            this.staticSlideId = this.currSlideId;
            this._n2();
            this._n4 = !1;
            this.ev.trigger("rsAfterSlideChange")
        },
        _i4: function(b, f) {
            var c = this,
            g = ( - c._u - c._d1) * c._w;
            if (! (0 === c.numSlides || c._r2)) if (c.st.loopRewind) c.goTo("left" === b ? c.numSlides - 1 : 0, f);
            else if (c._l) {
                c._c = 200;
                var a = function() {
                    c._r2 = !1
                };
                c._x3(g + ("left" === b ? 30 : -30), "", !1, !0,
                function() {
                    c._r2 = !1;
                    c._x3(g, "", !1, !0, a)
                })
            }
        },
        _q2: function(b) {
            if (!b.isRendered) {
                var f = b.content,
                c = "rsMainSlideImage",
                g, a = this.st.imageAlignCenter,
                e = this.st.imageScaleMode,
                d;
                b.videoURL && (c = "rsVideoContainer", "fill" !== e ? g = !0 : (d = f, d.hasClass(c) || (d = d.find("." + c)), d.css({
                    width: "100%",
                    height: "100%"
                }), c = "rsMainSlideImage"));
                f.hasClass(c) || (f = f.find("." + c));
                if (f) {
                    var j = b.iW,
                    c = b.iH;
                    b.isRendered = !0;
                    if ("none" !== e || a) {
                        b = "fill" !== e ? this._d4: 0;
                        d = this._b4 - 2 * b;
                        var h = this._c4 - 2 * b,
                        k, l, m = {};
                        if ("fit-if-smaller" === e && (j > d || c > h)) e = "fit";
                        if ("fill" === e || "fit" === e) k = d / j,
                        l = h / c,
                        k = "fill" == e ? k > l ? k: l: "fit" == e ? k < l ? k: l: 1,
                        j = Math.ceil(j * k, 10),
                        c = Math.ceil(c * k, 10);
                        "none" !== e && (m.width = j, m.height = c, g && f.find(".rsImg").css({
                            width: "100%",
                            height: "100%"
                        }));
                        a && (m.marginLeft = Math.floor((d - j) / 2) + b, m.marginTop = Math.floor((h - c) / 2) + b);
                        f.css(m)
                    }
                }
            }
        }
    };
    l.rsProto = t.prototype;
    l.fn.royalSlider = function(b) {
        var f = arguments;
        return this.each(function() {
            var c = l(this);
            if ("object" === typeof b || !b) c.data("royalSlider") || c.data("royalSlider", new t(c, b));
            else if ((c = c.data("royalSlider")) && c[b]) return c[b].apply(c, Array.prototype.slice.call(f, 1))
        })
    };
    l.fn.royalSlider.defaults = {
        slidesSpacing: 8,
        startSlideId: 0,
        loop: !1,
        loopRewind: !1,
        numImagesToPreload: 4,
        fadeinLoadedSlide: !0,
        slidesOrientation: "horizontal",
        transitionType: "move",
        transitionSpeed: 600,
        controlNavigation: "bullets",
        controlsInside: !0,
        arrowsNav: !0,
        arrowsNavAutoHide: !0,
        navigateByClick: !0,
        randomizeSlides: !1,
        sliderDrag: !0,
        sliderTouch: !0,
        keyboardNavEnabled: !1,
        fadeInAfterLoaded: !0,
        allowCSS3: !0,
        allowCSS3OnWebkit: !0,
        addActiveClass: !1,
        autoHeight: !1,
        easeOut: "easeOutSine",
        easeInOut: "easeInOutSine",
        minSlideOffset: 10,
        imageScaleMode: "fit-if-smaller",
        imageAlignCenter: !0,
        imageScalePadding: 4,
        usePreloader: !0,
        autoScaleSlider: !1,
        autoScaleSliderWidth: 800,
        autoScaleSliderHeight: 400,
        autoScaleHeight: !0,
        arrowsNavHideOnTouch: !1,
        globalCaption: !1,
        slidesDiff: 2
    };
    l.rsCSS3Easing = {
        easeOutSine: "cubic-bezier(0.390, 0.575, 0.565, 1.000)",
        easeInOutSine: "cubic-bezier(0.445, 0.050, 0.550, 0.950)"
    };
    l.extend(jQuery.easing, {
        easeInOutSine: function(b, f, c, g, a) {
            return - g / 2 * (Math.cos(Math.PI * f / a) - 1) + c
        },
        easeOutSine: function(b, f, c, g, a) {
            return g * Math.sin(f / a * (Math.PI / 2)) + c
        },
        easeOutCubic: function(b, f, c, g, a) {
            return g * ((f = f / a - 1) * f * f + 1) + c
        }
    })
})(jQuery, window);
// jquery.rs.active-class v1.0.1
(function(c) {
    c.rsProto._o4 = function() {
        var b, a = this;
        if (a.st.addActiveClass) a.ev.on("rsOnUpdateNav",
        function() {
            b && clearTimeout(b);
            b = setTimeout(function() {
                a._g4 && a._g4.removeClass("rsActiveSlide");
                a._r1 && a._r1.addClass("rsActiveSlide");
                b = null
            },
            50)
        })
    };
    c.rsModules.activeClass = c.rsProto._o4
})(jQuery);
// jquery.rs.animated-blocks v1.0.7
(function(j) {
    j.extend(j.rsProto, {
        _p4: function() {
            function l() {
                var g = a.currSlide;
                if (a.currSlide && a.currSlide.isLoaded && a._t4 !== g) {
                    if (0 < a._s4.length) {
                        for (b = 0; b < a._s4.length; b++) clearTimeout(a._s4[b]);
                        a._s4 = []
                    }
                    if (0 < a._r4.length) {
                        var f;
                        for (b = 0; b < a._r4.length; b++) if (f = a._r4[b]) a._e ? (f.block.css(a._g + a._u1, "0s"), f.block.css(f.css)) : f.block.stop(!0).css(f.css),
                        a._t4 = null,
                        g.animBlocksDisplayed = !1;
                        a._r4 = []
                    }
                    g.animBlocks && (g.animBlocksDisplayed = !0, a._t4 = g, a._u4(g.animBlocks))
                }
            }
            var a = this,
            b;
            a._q4 = {
                fadeEffect: !0,
                moveEffect: "top",
                moveOffset: 20,
                speed: 400,
                easing: "easeOutSine",
                delay: 200
            };
            a.st.block = j.extend({},
            a._q4, a.st.block);
            a._r4 = [];
            a._s4 = [];
            a.ev.on("rsAfterInit",
            function() {
                l()
            });
            a.ev.on("rsBeforeParseNode",
            function(a, b, d) {
                b = j(b);
                d.animBlocks = b.find(".rsABlock").css("display", "none");
                d.animBlocks.length || (d.animBlocks = b.hasClass("rsABlock") ? b.css("display", "none") : !1)
            });
            a.ev.on("rsAfterContentSet",
            function(b, f) {
                f.id === a.slides[a.currSlideId].id && setTimeout(function() {
                    l()
                },
                a.st.fadeinLoadedSlide ? 300 : 0)
            });
            a.ev.on("rsAfterSlideChange",
            function() {
                l()
            })
        },
        _v4: function(j, a) {
            setTimeout(function() {
                j.css(a)
            },
            6)
        },
        _u4: function(l) {
            var a = this,
            b, g, f, d, h, e, m;
            a._s4 = [];
            l.each(function(l) {
                b = j(this);
                g = {};
                f = {};
                d = null;
                var c = b.attr("data-move-offset"),
                c = c ? parseInt(c, 10) : a.st.block.moveOffset;
                if (0 < c && ((e = b.data("move-effect")) ? (e = e.toLowerCase(), "none" === e ? e = !1 : "left" !== e && ("top" !== e && "bottom" !== e && "right" !== e) && (e = a.st.block.moveEffect, "none" === e && (e = !1))) : e = a.st.block.moveEffect, e && "none" !== e)) {
                    var n;
                    n = "right" === e || "left" === e ? !0 : !1;
                    var k;
                    m = !1;
                    a._e ? (k = 0, h = a._x1) : (n ? isNaN(parseInt(b.css("right"), 10)) ? h = "left": (h = "right", m = !0) : isNaN(parseInt(b.css("bottom"), 10)) ? h = "top": (h = "bottom", m = !0), h = "margin-" + h, m && (c = -c), a._e ? k = parseInt(b.css(h), 10) : (k = b.data("rs-start-move-prop"), void 0 === k && (k = parseInt(b.css(h), 10), b.data("rs-start-move-prop", k))));
                    f[h] = a._m4("top" === e || "left" === e ? k - c: k + c, n);
                    g[h] = a._m4(k, n)
                }
                if (c = b.attr("data-fade-effect")) {
                    if ("none" === c.toLowerCase() || "false" === c.toLowerCase()) c = !1
                } else c = a.st.block.fadeEffect;
                c && (f.opacity = 0, g.opacity = 1);
                if (c || e) d = {},
                d.hasFade = Boolean(c),
                Boolean(e) && (d.moveProp = h, d.hasMove = !0),
                d.speed = b.data("speed"),
                isNaN(d.speed) && (d.speed = a.st.block.speed),
                d.easing = b.data("easing"),
                d.easing || (d.easing = a.st.block.easing),
                d.css3Easing = j.rsCSS3Easing[d.easing],
                d.delay = b.data("delay"),
                isNaN(d.delay) && (d.delay = a.st.block.delay * l);
                c = {};
                a._e && (c[a._g + a._u1] = "0ms");
                c.moveProp = g.moveProp;
                c.opacity = g.opacity;
                c.display = "none";
                a._r4.push({
                    block: b,
                    css: c
                });
                a._v4(b, f);
                a._s4.push(setTimeout(function(b, d, c, e) {
                    return function() {
                        b.css("display", "block");
                        if (c) {
                            var g = {};
                            if (a._e) {
                                var f = "";
                                c.hasMove && (f += c.moveProp);
                                c.hasFade && (c.hasMove && (f += ", "), f += "opacity");
                                g[a._g + a._t1] = f;
                                g[a._g + a._u1] = c.speed + "ms";
                                g[a._g + a._v1] = c.css3Easing;
                                b.css(g);
                                setTimeout(function() {
                                    b.css(d)
                                },
                                24)
                            } else setTimeout(function() {
                                b.animate(d, c.speed, c.easing)
                            },
                            16)
                        }
                        delete a._s4[e]
                    }
                } (b, g, d, l), 6 >= d.delay ? 12 : d.delay))
            })
        }
    });
    j.rsModules.animatedBlocks = j.rsProto._p4
})(jQuery);
// jquery.rs.auto-height v1.0.2
(function(b) {
    b.extend(b.rsProto, {
        _w4: function() {
            var a = this;
            if (a.st.autoHeight) {
                var b, d, e, c = function(c) {
                    e = a.slides[a.currSlideId];
                    if (b = e.holder) if ((d = b.height()) && void 0 !== d) a._c4 = d,
                    a._e || !c ? a._e1.css("height", d) : a._e1.stop(!0, !0).animate({
                        height: d
                    },
                    a.st.transitionSpeed)
                };
                a.ev.on("rsMaybeSizeReady.rsAutoHeight",
                function(a, b) {
                    e === b && c()
                });
                a.ev.on("rsAfterContentSet.rsAutoHeight",
                function(a, b) {
                    e === b && c()
                });
                a.slider.addClass("rsAutoHeight");
                a.ev.one("rsAfterInit",
                function() {
                    setTimeout(function() {
                        c(!1);
                        setTimeout(function() {
                            a.slider.append('<div style="clear:both; float: none;"></div>');
                            a._e && a._e1.css(a._g + "transition", "height " + a.st.transitionSpeed + "ms ease-in-out")
                        },
                        16)
                    },
                    16)
                });
                a.ev.on("rsBeforeAnimStart",
                function() {
                    c(!0)
                });
                a.ev.on("rsBeforeSizeSet",
                function() {
                    setTimeout(function() {
                        c(!1)
                    },
                    16)
                })
            }
        }
    });
    b.rsModules.autoHeight = b.rsProto._w4
})(jQuery);
// jquery.rs.autoplay v1.0.5
(function(b) {
    b.extend(b.rsProto, {
        _x4: function() {
            var a = this,
            d;
            a._y4 = {
                enabled: !1,
                stopAtAction: !0,
                pauseOnHover: !0,
                delay: 2E3
            }; ! a.st.autoPlay && a.st.autoplay && (a.st.autoPlay = a.st.autoplay);
            a.st.autoPlay = b.extend({},
            a._y4, a.st.autoPlay);
            a.st.autoPlay.enabled && (a.ev.on("rsBeforeParseNode",
            function(a, c, f) {
                c = b(c);
                if (d = c.attr("data-rsDelay")) f.customDelay = parseInt(d, 10)
            }), a.ev.one("rsAfterInit",
            function() {
                a._z4()
            }), a.ev.on("rsBeforeDestroy",
            function() {
                a.stopAutoPlay();
                a.slider.off("mouseenter mouseleave");
                b(window).off("blur" + a.ns + " focus" + a.ns)
            }))
        },
        _z4: function() {
            var a = this;
            a.startAutoPlay();
            a.ev.on("rsAfterContentSet",
            function(b, e) { ! a._l2 && (!a._r2 && a._a5 && e === a.currSlide) && a._b5()
            });
            a.ev.on("rsDragRelease",
            function() {
                a._a5 && a._c5 && (a._c5 = !1, a._b5())
            });
            a.ev.on("rsAfterSlideChange",
            function() {
                a._a5 && a._c5 && (a._c5 = !1, a.currSlide.isLoaded && a._b5())
            });
            a.ev.on("rsDragStart",
            function() {
                a._a5 && (a.st.autoPlay.stopAtAction ? a.stopAutoPlay() : (a._c5 = !0, a._d5()))
            });
            a.ev.on("rsBeforeMove",
            function(b, e, c) {
                a._a5 && (c && a.st.autoPlay.stopAtAction ? a.stopAutoPlay() : (a._c5 = !0, a._d5()))
            });
            a._e5 = !1;
            a.ev.on("rsVideoStop",
            function() {
                a._a5 && (a._e5 = !1, a._b5())
            });
            a.ev.on("rsVideoPlay",
            function() {
                a._a5 && (a._c5 = !1, a._d5(), a._e5 = !0)
            });
            b(window).on("blur" + a.ns,
            function() {
                a._a5 && (a._c5 = !0, a._d5())
            }).on("focus" + a.ns,
            function() {
                a._a5 && a._c5 && (a._c5 = !1, a._b5())
            });
            a.st.autoPlay.pauseOnHover && (a._f5 = !1, a.slider.hover(function() {
                a._a5 && (a._c5 = !1, a._d5(), a._f5 = !0)
            },
            function() {
                a._a5 && (a._f5 = !1, a._b5())
            }))
        },
        toggleAutoPlay: function() {
            this._a5 ? this.stopAutoPlay() : this.startAutoPlay()
        },
        startAutoPlay: function() {
            this._a5 = !0;
            this.currSlide.isLoaded && this._b5()
        },
        stopAutoPlay: function() {
            this._e5 = this._f5 = this._c5 = this._a5 = !1;
            this._d5()
        },
        _b5: function() {
            var a = this; ! a._f5 && !a._e5 && (a._g5 = !0, a._h5 && clearTimeout(a._h5), a._h5 = setTimeout(function() {
                var b; ! a._z && !a.st.loopRewind && (b = !0, a.st.loopRewind = !0);
                a.next(!0);
                b && (a.st.loopRewind = !1)
            },
            !a.currSlide.customDelay ? a.st.autoPlay.delay: a.currSlide.customDelay))
        },
        _d5: function() { ! this._f5 && !this._e5 && (this._g5 = !1, this._h5 && (clearTimeout(this._h5), this._h5 = null))
        }
    });
    b.rsModules.autoplay = b.rsProto._x4
})(jQuery);
// jquery.rs.bullets v1.0.1
(function(c) {
    c.extend(c.rsProto, {
        _i5: function() {
            var a = this;
            "bullets" === a.st.controlNavigation && (a.ev.one("rsAfterPropsSetup",
            function() {
                a._j5 = !0;
                a.slider.addClass("rsWithBullets");
                for (var b = '<div class="rsNav rsBullets">',
                e = 0; e < a.numSlides; e++) b += '<div class="rsNavItem rsBullet"><span></span></div>';
                a._k5 = b = c(b + "</div>");
                a._l5 = b.appendTo(a.slider).children();
                a._k5.on("click.rs", ".rsNavItem",
                function() {
                    a._m5 || a.goTo(c(this).index())
                })
            }), a.ev.on("rsOnAppendSlide",
            function(b, c, d) {
                d >= a.numSlides ? a._k5.append('<div class="rsNavItem rsBullet"><span></span></div>') : a._l5.eq(d).before('<div class="rsNavItem rsBullet"><span></span></div>');
                a._l5 = a._k5.children()
            }), a.ev.on("rsOnRemoveSlide",
            function(b, c) {
                var d = a._l5.eq(c);
                d && d.length && (d.remove(), a._l5 = a._k5.children())
            }), a.ev.on("rsOnUpdateNav",
            function() {
                var b = a.currSlideId;
                a._n5 && a._n5.removeClass("rsNavSelected");
                b = a._l5.eq(b);
                b.addClass("rsNavSelected");
                a._n5 = b
            }))
        }
    });
    c.rsModules.bullets = c.rsProto._i5
})(jQuery);
// jquery.rs.deeplinking v1.0.6 + jQuery hashchange plugin v1.3 Copyright (c) 2010 Ben Alman
(function(b) {
    b.extend(b.rsProto, {
        _o5: function() {
            var a = this,
            g, c, e;
            a._p5 = {
                enabled: !1,
                change: !1,
                prefix: ""
            };
            a.st.deeplinking = b.extend({},
            a._p5, a.st.deeplinking);
            if (a.st.deeplinking.enabled) {
                var h = a.st.deeplinking.change,
                d = "#" + a.st.deeplinking.prefix,
                f = function() {
                    var a = window.location.hash;
                    return a && (a = parseInt(a.substring(d.length), 10), 0 <= a) ? a - 1 : -1
                },
                j = f(); - 1 !== j && (a.st.startSlideId = j);
                h && (b(window).on("hashchange" + a.ns,
                function() {
                    if (!g) {
                        var b = f();
                        0 > b || (b > a.numSlides - 1 && (b = a.numSlides - 1), a.goTo(b))
                    }
                }), a.ev.on("rsBeforeAnimStart",
                function() {
                    c && clearTimeout(c);
                    e && clearTimeout(e)
                }), a.ev.on("rsAfterSlideChange",
                function() {
                    c && clearTimeout(c);
                    e && clearTimeout(e);
                    e = setTimeout(function() {
                        g = !0;
                        window.location.replace(("" + window.location).split("#")[0] + d + (a.currSlideId + 1));
                        c = setTimeout(function() {
                            g = !1;
                            c = null
                        },
                        60)
                    },
                    400)
                }));
                a.ev.on("rsBeforeDestroy",
                function() {
                    c = e = null;
                    h && b(window).off("hashchange" + a.ns)
                })
            }
        }
    });
    b.rsModules.deeplinking = b.rsProto._o5
})(jQuery); (function(b, a, g) {
    function c(a) {
        a = a || location.href;
        return "#" + a.replace(/^[^#]*#?(.*)$/, "$1")
    }
    "$:nomunge";
    var e = document,
    h, d = b.event.special,
    f = e.documentMode,
    j = "onhashchange" in a && (f === g || 7 < f);
    b.fn.hashchange = function(a) {
        return a ? this.bind("hashchange", a) : this.trigger("hashchange")
    };
    b.fn.hashchange.delay = 50;
    d.hashchange = b.extend(d.hashchange, {
        setup: function() {
            if (j) return ! 1;
            b(h.start)
        },
        teardown: function() {
            if (j) return ! 1;
            b(h.stop)
        }
    });
    var p = function() {
        var e = c(),
        d = r(n);
        e !== n ? (q(n = e, d), b(a).trigger("hashchange")) : d !== n && (location.href = location.href.replace(/#.*/, "") + d);
        l = setTimeout(p, b.fn.hashchange.delay)
    },
    d = {},
    l,
    n = c(),
    q = f = function(a) {
        return a
    },
    r = f;
    d.start = function() {
        l || p()
    };
    d.stop = function() {
        l && clearTimeout(l);
        l = g
    };
    if (a.attachEvent && !a.addEventListener && !j) {
        var k, m;
        d.start = function() {
            k || (m = (m = b.fn.hashchange.src) && m + c(), k = b('<iframe tabindex="-1" title="empty"/>').hide().one("load",
            function() {
                m || q(c());
                p()
            }).attr("src", m || "javascript:0").insertAfter("body")[0].contentWindow, e.onpropertychange = function() {
                try {
                    "title" === event.propertyName && (k.document.title = e.title)
                } catch(a) {}
            })
        };
        d.stop = f;
        r = function() {
            return c(k.location.href)
        };
        q = function(a, d) {
            var c = k.document,
            f = b.fn.hashchange.domain;
            a !== d && (c.title = e.title, c.open(), f && c.write('<script>document.domain="' + f + '"\x3c/script>'), c.close(), k.location.hash = a)
        }
    }
    h = d
})(jQuery, this);
// jquery.rs.fullscreen v1.0.5
(function(c) {
    c.extend(c.rsProto, {
        _q5: function() {
            var a = this;
            a._r5 = {
                enabled: !1,
                keyboardNav: !0,
                buttonFS: !0,
                nativeFS: !1,
                doubleTap: !0
            };
            a.st.fullscreen = c.extend({},
            a._r5, a.st.fullscreen);
            if (a.st.fullscreen.enabled) a.ev.one("rsBeforeSizeSet",
            function() {
                a._s5()
            })
        },
        _s5: function() {
            var a = this;
            a._t5 = !a.st.keyboardNavEnabled && a.st.fullscreen.keyboardNav;
            if (a.st.fullscreen.nativeFS) {
                a._u5 = {
                    supportsFullScreen: !1,
                    isFullScreen: function() {
                        return ! 1
                    },
                    requestFullScreen: function() {},
                    cancelFullScreen: function() {},
                    fullScreenEventName: "",
                    prefix: ""
                };
                var b = ["webkit", "moz", "o", "ms", "khtml"];
                if (!a.isAndroid) if ("undefined" != typeof document.cancelFullScreen) a._u5.supportsFullScreen = !0;
                else for (var d = 0; d < b.length; d++) if (a._u5.prefix = b[d], "undefined" != typeof document[a._u5.prefix + "CancelFullScreen"]) {
                    a._u5.supportsFullScreen = !0;
                    break
                }
                a._u5.supportsFullScreen ? (a.nativeFS = !0, a._u5.fullScreenEventName = a._u5.prefix + "fullscreenchange" + a.ns, a._u5.isFullScreen = function() {
                    switch (this.prefix) {
                    case "":
                        return document.fullScreen;
                    case "webkit":
                        return document.webkitIsFullScreen;
                    default:
                        return document[this.prefix + "FullScreen"]
                    }
                },
                a._u5.requestFullScreen = function(a) {
                    return "" === this.prefix ? a.requestFullScreen() : a[this.prefix + "RequestFullScreen"]()
                },
                a._u5.cancelFullScreen = function() {
                    return "" === this.prefix ? document.cancelFullScreen() : document[this.prefix + "CancelFullScreen"]()
                }) : a._u5 = !1
            }
            a.st.fullscreen.buttonFS && (a._v5 = c('<div class="rsFullscreenBtn"><div class="rsFullscreenIcn"></div></div>').appendTo(a._o1).on("click.rs",
            function() {
                a.isFullscreen ? a.exitFullscreen() : a.enterFullscreen()
            }))
        },
        enterFullscreen: function(a) {
            var b = this;
            if (b._u5) if (a) b._u5.requestFullScreen(c("html")[0]);
            else {
                b._b.on(b._u5.fullScreenEventName,
                function() {
                    b._u5.isFullScreen() ? b.enterFullscreen(!0) : b.exitFullscreen(!0)
                });
                b._u5.requestFullScreen(c("html")[0]);
                return
            }
            if (!b._w5) {
                b._w5 = !0;
                b._b.on("keyup" + b.ns + "fullscreen",
                function(a) {
                    27 === a.keyCode && b.exitFullscreen()
                });
                b._t5 && b._b2();
                a = c(window);
                b._x5 = a.scrollTop();
                b._y5 = a.scrollLeft();
                b._z5 = c("html").attr("style");
                b._a6 = c("body").attr("style");
                b._b6 = b.slider.attr("style");
                c("body, html").css({
                    overflow: "hidden",
                    height: "100%",
                    width: "100%",
                    margin: "0",
                    padding: "0"
                });
                b.slider.addClass("rsFullscreen");
                var d;
                for (d = 0; d < b.numSlides; d++) a = b.slides[d],
                a.isRendered = !1,
                a.bigImage && (a.isBig = !0, a.isMedLoaded = a.isLoaded, a.isMedLoading = a.isLoading, a.medImage = a.image, a.medIW = a.iW, a.medIH = a.iH, a.slideId = -99, a.bigImage !== a.medImage && (a.sizeType = "big"), a.isLoaded = a.isBigLoaded, a.isLoading = !1, a.image = a.bigImage, a.images[0] = a.bigImage, a.iW = a.bigIW, a.iH = a.bigIH, a.isAppended = a.contentAdded = !1, b._c6(a));
                b.isFullscreen = !0;
                b._w5 = !1;
                b.updateSliderSize();
                b.ev.trigger("rsEnterFullscreen")
            }
        },
        exitFullscreen: function(a) {
            var b = this;
            if (b._u5) {
                if (!a) {
                    b._u5.cancelFullScreen(c("html")[0]);
                    return
                }
                b._b.off(b._u5.fullScreenEventName)
            }
            if (!b._w5) {
                b._w5 = !0;
                b._b.off("keyup" + b.ns + "fullscreen");
                b._t5 && b._b.off("keydown" + b.ns);
                c("html").attr("style", b._z5 || "");
                c("body").attr("style", b._a6 || "");
                var d;
                for (d = 0; d < b.numSlides; d++) a = b.slides[d],
                a.isRendered = !1,
                a.bigImage && (a.isBig = !1, a.slideId = -99, a.isBigLoaded = a.isLoaded, a.isBigLoading = a.isLoading, a.bigImage = a.image, a.bigIW = a.iW, a.bigIH = a.iH, a.isLoaded = a.isMedLoaded, a.isLoading = !1, a.image = a.medImage, a.images[0] = a.medImage, a.iW = a.medIW, a.iH = a.medIH, a.isAppended = a.contentAdded = !1, b._c6(a, !0), a.bigImage !== a.medImage && (a.sizeType = "med"));
                b.isFullscreen = !1;
                a = c(window);
                a.scrollTop(b._x5);
                a.scrollLeft(b._y5);
                b._w5 = !1;
                b.slider.removeClass("rsFullscreen");
                b.updateSliderSize();
                setTimeout(function() {
                    b.updateSliderSize()
                },
                1);
                b.ev.trigger("rsExitFullscreen")
            }
        },
        _c6: function(a) {
            var b = !a.isLoaded && !a.isLoading ? '<a class="rsImg rsMainSlideImage" href="' + a.image + '"></a>': '<img class="rsImg rsMainSlideImage" src="' + a.image + '"/>';
            a.content.hasClass("rsImg") ? a.content = c(b) : a.content.find(".rsImg").eq(0).replaceWith(b); ! a.isLoaded && (!a.isLoading && a.holder) && a.holder.html(a.content)
        }
    });
    c.rsModules.fullscreen = c.rsProto._q5
})(jQuery);
// jquery.rs.global-caption v1.0
(function(b) {
    b.extend(b.rsProto, {
        _d6: function() {
            var a = this;
            a.st.globalCaption && (a.ev.on("rsAfterInit",
            function() {
                a.globalCaption = b('<div class="rsGCaption"></div>').appendTo(!a.st.globalCaptionInside ? a.slider: a._e1);
                a.globalCaption.html(a.currSlide.caption)
            }), a.ev.on("rsBeforeAnimStart",
            function() {
                a.globalCaption.html(a.currSlide.caption)
            }))
        }
    });
    b.rsModules.globalCaption = b.rsProto._d6
})(jQuery);
// jquery.rs.nav-auto-hide v1.0
(function(b) {
    b.extend(b.rsProto, {
        _e6: function() {
            var a = this;
            if (a.st.navAutoHide && !a.hasTouch) a.ev.one("rsAfterInit",
            function() {
                if (a._k5) {
                    a._k5.addClass("rsHidden");
                    var b = a.slider;
                    b.one("mousemove.controlnav",
                    function() {
                        a._k5.removeClass("rsHidden")
                    });
                    b.hover(function() {
                        a._k5.removeClass("rsHidden")
                    },
                    function() {
                        a._k5.addClass("rsHidden")
                    })
                }
            })
        }
    });
    b.rsModules.autoHideNav = b.rsProto._e6
})(jQuery);
// jquery.rs.tabs v1.0.2
(function(e) {
    e.extend(e.rsProto, {
        _f6: function() {
            var a = this;
            "tabs" === a.st.controlNavigation && (a.ev.on("rsBeforeParseNode",
            function(a, d, b) {
                d = e(d);
                b.thumbnail = d.find(".rsTmb").remove();
                b.thumbnail.length ? b.thumbnail = e(document.createElement("div")).append(b.thumbnail).html() : (b.thumbnail = d.attr("data-rsTmb"), b.thumbnail || (b.thumbnail = d.find(".rsImg").attr("data-rsTmb")), b.thumbnail = b.thumbnail ? '<img src="' + b.thumbnail + '"/>': "")
            }), a.ev.one("rsAfterPropsSetup",
            function() {
                a._g6()
            }), a.ev.on("rsOnAppendSlide",
            function(c, d, b) {
                b >= a.numSlides ? a._k5.append('<div class="rsNavItem rsTab">' + d.thumbnail + "</div>") : a._l5.eq(b).before('<div class="rsNavItem rsTab">' + item.thumbnail + "</div>");
                a._l5 = a._k5.children()
            }), a.ev.on("rsOnRemoveSlide",
            function(c, d) {
                var b = a._l5.eq(d);
                b && (b.remove(), a._l5 = a._k5.children())
            }), a.ev.on("rsOnUpdateNav",
            function() {
                var c = a.currSlideId;
                a._n5 && a._n5.removeClass("rsNavSelected");
                c = a._l5.eq(c);
                c.addClass("rsNavSelected");
                a._n5 = c
            }))
        },
        _g6: function() {
            var a = this,
            c;
            a._j5 = !0;
            c = '<div class="rsNav rsTabs">';
            for (var d = 0; d < a.numSlides; d++) c += '<div class="rsNavItem rsTab">' + a.slides[d].thumbnail + "</div>";
            c = e(c + "</div>");
            a._k5 = c;
            a._l5 = c.children(".rsNavItem");
            a.slider.append(c);
            a._k5.click(function(b) {
                b = e(b.target).closest(".rsNavItem");
                b.length && a.goTo(b.index())
            })
        }
    });
    e.rsModules.tabs = e.rsProto._f6
})(jQuery);
// jquery.rs.thumbnails v1.0.5
(function(f) {
    f.extend(f.rsProto, {
        _h6: function() {
            var a = this;
            "thumbnails" === a.st.controlNavigation && (a._i6 = {
                drag: !0,
                touch: !0,
                orientation: "horizontal",
                navigation: !0,
                arrows: !0,
                arrowLeft: null,
                arrowRight: null,
                spacing: 4,
                arrowsAutoHide: !1,
                appendSpan: !1,
                transitionSpeed: 600,
                autoCenter: !0,
                fitInViewport: !0,
                firstMargin: !0,
                paddingTop: 0,
                paddingBottom: 0
            },
            a.st.thumbs = f.extend({},
            a._i6, a.st.thumbs), a._j6 = !0, !1 === a.st.thumbs.firstMargin ? a.st.thumbs.firstMargin = 0 : !0 === a.st.thumbs.firstMargin && (a.st.thumbs.firstMargin = a.st.thumbs.spacing), a.ev.on("rsBeforeParseNode",
            function(a, c, b) {
                c = f(c);
                b.thumbnail = c.find(".rsTmb").remove();
                b.thumbnail.length ? b.thumbnail = f(document.createElement("div")).append(b.thumbnail).html() : (b.thumbnail = c.attr("data-rsTmb"), b.thumbnail || (b.thumbnail = c.find(".rsImg").attr("data-rsTmb")), b.thumbnail = b.thumbnail ? '<img src="' + b.thumbnail + '"/>': "")
            }), a.ev.one("rsAfterPropsSetup",
            function() {
                a._k6()
            }), a._n5 = null, a.ev.on("rsOnUpdateNav",
            function() {
                var e = f(a._l5[a.currSlideId]);
                e !== a._n5 && (a._n5 && (a._n5.removeClass("rsNavSelected"), a._n5 = null), a._l6 && a._m6(a.currSlideId), a._n5 = e.addClass("rsNavSelected"))
            }), a.ev.on("rsOnAppendSlide",
            function(e, c, b) {
                e = "<div" + a._n6 + ' class="rsNavItem rsThumb">' + a._o6 + c.thumbnail + "</div>";
                b >= a.numSlides ? a._s3.append(e) : a._l5.eq(b).before(e);
                a._l5 = a._s3.children();
                a.updateThumbsSize()
            }), a.ev.on("rsOnRemoveSlide",
            function(e, c) {
                var b = a._l5.eq(c);
                b && (b.remove(), a._l5 = a._s3.children(), a.updateThumbsSize())
            }))
        },
        _k6: function() {
            var a = this,
            e = "rsThumbs",
            c = a.st.thumbs,
            b = "",
            g, d, h = c.spacing;
            a._j5 = !0;
            a._e3 = "vertical" === c.orientation ? !1 : !0;
            a._n6 = g = h ? ' style="margin-' + (a._e3 ? "right": "bottom") + ":" + h + 'px;"': "";
            a._i3 = 0;
            a._p6 = !1;
            a._m5 = !1;
            a._l6 = !1;
            a._q6 = c.arrows && c.navigation;
            d = a._e3 ? "Hor": "Ver";
            a.slider.addClass("rsWithThumbs rsWithThumbs" + d);
            b += '<div class="rsNav rsThumbs rsThumbs' + d + '"><div class="' + e + 'Container">';
            a._o6 = c.appendSpan ? '<span class="thumbIco"></span>': "";
            for (var j = 0; j < a.numSlides; j++) d = a.slides[j],
            b += "<div" + g + ' class="rsNavItem rsThumb">' + d.thumbnail + a._o6 + "</div>";
            b = f(b + "</div></div>");
            g = {};
            c.paddingTop && (g[a._e3 ? "paddingTop": "paddingLeft"] = c.paddingTop);
            c.paddingBottom && (g[a._e3 ? "paddingBottom": "paddingRight"] = c.paddingBottom);
            b.css(g);
            a._s3 = f(b).find("." + e + "Container");
            a._q6 && (e += "Arrow", c.arrowLeft ? a._r6 = c.arrowLeft: (a._r6 = f('<div class="' + e + " " + e + 'Left"><div class="' + e + 'Icn"></div></div>'), b.append(a._r6)), c.arrowRight ? a._s6 = c.arrowRight: (a._s6 = f('<div class="' + e + " " + e + 'Right"><div class="' + e + 'Icn"></div></div>'), b.append(a._s6)), a._r6.click(function() {
                var b = (Math.floor(a._i3 / a._t6) + a._u6) * a._t6;
                a._a4(b > a._n3 ? a._n3: b)
            }), a._s6.click(function() {
                var b = (Math.floor(a._i3 / a._t6) - a._u6) * a._t6;
                a._a4(b < a._o3 ? a._o3: b)
            }), c.arrowsAutoHide && !a.hasTouch && (a._r6.css("opacity", 0), a._s6.css("opacity", 0), b.one("mousemove.rsarrowshover",
            function() {
                a._l6 && (a._r6.css("opacity", 1), a._s6.css("opacity", 1))
            }), b.hover(function() {
                a._l6 && (a._r6.css("opacity", 1), a._s6.css("opacity", 1))
            },
            function() {
                a._l6 && (a._r6.css("opacity", 0), a._s6.css("opacity", 0))
            })));
            a._k5 = b;
            a._l5 = a._s3.children();
            a.msEnabled && a.st.thumbs.navigation && a._s3.css("-ms-touch-action", a._e3 ? "pan-y": "pan-x");
            a.slider.append(b);
            a._w3 = !0;
            a._v6 = h;
            c.navigation && a._e && a._s3.css(a._g + "transition-property", a._g + "transform");
            a._k5.on("click.rs", ".rsNavItem",
            function() {
                a._m5 || a.goTo(f(this).index())
            });
            a.ev.off("rsBeforeSizeSet.thumbs").on("rsBeforeSizeSet.thumbs",
            function() {
                a._w6 = a._e3 ? a._c4: a._b4;
                a.updateThumbsSize(!0)
            })
        },
        updateThumbsSize: function() {
            var a = this,
            e = a._l5.first(),
            c = {},
            b = a._l5.length;
            a._t6 = (a._e3 ? e.outerWidth() : e.outerHeight()) + a._v6;
            a._y3 = b * a._t6 - a._v6;
            c[a._e3 ? "width": "height"] = a._y3 + a._v6;
            a._z3 = a._e3 ? a._k5.width() : a._k5.height();
            a._o3 = -(a._y3 - a._z3) - a.st.thumbs.firstMargin;
            a._n3 = a.st.thumbs.firstMargin;
            a._u6 = Math.floor(a._z3 / a._t6);
            if (a._y3 < a._z3) a.st.thumbs.autoCenter && a._q3((a._z3 - a._y3) / 2),
            a.st.thumbs.arrows && a._r6 && (a._r6.addClass("rsThumbsArrowDisabled"), a._s6.addClass("rsThumbsArrowDisabled")),
            a._l6 = !1,
            a._m5 = !1,
            a._k5.off(a._j1);
            else if (a.st.thumbs.navigation && !a._l6 && (a._l6 = !0, !a.hasTouch && a.st.thumbs.drag || a.hasTouch && a.st.thumbs.touch)) a._m5 = !0,
            a._k5.on(a._j1,
            function(b) {
                a._g2(b, !0)
            });
            a._e && (c[a._g + "transition-duration"] = "0ms");
            a._s3.css(c);
            if (a._w3 && (a.isFullscreen || a.st.thumbs.fitInViewport)) a._e3 ? a._c4 = a._w6 - a._k5.outerHeight() : a._b4 = a._w6 - a._k5.outerWidth()
        },
        setThumbsOrientation: function(a, e) {
            this._w3 && (this.st.thumbs.orientation = a, this._k5.remove(), this.slider.removeClass("rsWithThumbsHor rsWithThumbsVer"), this._k6(), this._k5.off(this._j1), e || this.updateSliderSize(!0))
        },
        _q3: function(a) {
            this._i3 = a;
            this._e ? this._s3.css(this._x1, this._y1 + (this._e3 ? a + this._z1 + 0 : 0 + this._z1 + a) + this._a2) : this._s3.css(this._e3 ? this._x1: this._w1, a)
        },
        _a4: function(a, e, c, b, g) {
            var d = this;
            if (d._l6) {
                e || (e = d.st.thumbs.transitionSpeed);
                d._i3 = a;
                d._x6 && clearTimeout(d._x6);
                d._p6 && (d._e || d._s3.stop(), c = !0);
                var h = {};
                d._p6 = !0;
                d._e ? (h[d._g + "transition-duration"] = e + "ms", h[d._g + "transition-timing-function"] = c ? f.rsCSS3Easing[d.st.easeOut] : f.rsCSS3Easing[d.st.easeInOut], d._s3.css(h), d._q3(a)) : (h[d._e3 ? d._x1: d._w1] = a + "px", d._s3.animate(h, e, c ? "easeOutCubic": d.st.easeInOut));
                b && (d._i3 = b);
                d._y6();
                d._x6 = setTimeout(function() {
                    d._p6 = !1;
                    g && (d._a4(b, g, !0), g = null)
                },
                e)
            }
        },
        _y6: function() {
            this._q6 && (this._i3 === this._n3 ? this._r6.addClass("rsThumbsArrowDisabled") : this._r6.removeClass("rsThumbsArrowDisabled"), this._i3 === this._o3 ? this._s6.addClass("rsThumbsArrowDisabled") : this._s6.removeClass("rsThumbsArrowDisabled"))
        },
        _m6: function(a, e) {
            var c = 0,
            b, f = a * this._t6 + 2 * this._t6 - this._v6 + this._n3,
            d = Math.floor(this._i3 / this._t6);
            this._l6 && (this._j6 && (e = !0, this._j6 = !1), f + this._i3 > this._z3 ? (a === this.numSlides - 1 && (c = 1), d = -a + this._u6 - 2 + c, b = d * this._t6 + this._z3 % this._t6 + this._v6 - this._n3) : 0 !== a ? (a - 1) * this._t6 <= -this._i3 + this._n3 && a - 1 <= this.numSlides - this._u6 && (b = ( - a + 1) * this._t6 + this._n3) : b = this._n3, b !== this._i3 && (c = void 0 === b ? this._i3: b, c > this._n3 ? this._q3(this._n3) : c < this._o3 ? this._q3(this._o3) : void 0 !== b && (e ? this._q3(b) : this._a4(b))), this._y6())
        }
    });
    f.rsModules.thumbnails = f.rsProto._h6
})(jQuery);
// jquery.rs.video v1.1.1
(function(f) {
    f.extend(f.rsProto, {
        _z6: function() {
            var a = this;
            a._a7 = {
                autoHideArrows: !0,
                autoHideControlNav: !1,
                autoHideBlocks: !1,
                autoHideCaption: !1,
                disableCSS3inFF: !0,
                youTubeCode: '<iframe src="http://www.youtube.com/embed/%id%?rel=1&autoplay=1&showinfo=0&autoplay=1&wmode=transparent" frameborder="no"></iframe>',
                vimeoCode: '<iframe src="http://player.vimeo.com/video/%id%?byline=0&amp;portrait=0&amp;autoplay=1" frameborder="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
            };
            a.st.video = f.extend({},
            a._a7, a.st.video);
            a.ev.on("rsBeforeSizeSet",
            function() {
                a._b7 && setTimeout(function() {
                    var b = a._r1,
                    b = b.hasClass("rsVideoContainer") ? b: b.find(".rsVideoContainer");
                    a._c7 && a._c7.css({
                        width: b.width(),
                        height: b.height()
                    })
                },
                32)
            });
            var c = a._a.mozilla;
            a.ev.on("rsAfterParseNode",
            function(b, e, d) {
                b = f(e);
                if (d.videoURL) {
                    a.st.video.disableCSS3inFF && c && (a._e = a._f = !1);
                    e = f('<div class="rsVideoContainer"></div>');
                    var g = f('<div class="rsBtnCenterer"><div class="rsPlayBtn"><div class="rsPlayBtnIcon"></div></div></div>');
                    b.hasClass("rsImg") ? d.content = e.append(b).append(g) : d.content.find(".rsImg").wrap(e).after(g)
                }
            });
            a.ev.on("rsAfterSlideChange",
            function() {
                a.stopVideo()
            })
        },
        toggleVideo: function() {
            return this._b7 ? this.stopVideo() : this.playVideo()
        },
        playVideo: function() {
            var a = this;
            if (!a._b7) {
                var c = a.currSlide;
                if (!c.videoURL) return ! 1;
                var b = a._d7 = c.content,
                c = c.videoURL,
                e, d;
                c.match(/youtu\.be/i) || c.match(/youtube\.com/i) ? (d = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/, (d = c.match(d)) && 11 == d[7].length && (e = d[7]), void 0 !== e && (a._c7 = a.st.video.youTubeCode.replace("%id%", e))) : c.match(/vimeo\.com/i) && (d = /(www\.)?vimeo.com\/(\d+)($|\/)/, (d = c.match(d)) && (e = d[2]), void 0 !== e && (a._c7 = a.st.video.vimeoCode.replace("%id%", e)));
                a.videoObj = f(a._c7);
                a.ev.trigger("rsOnCreateVideoElement", [c]);
                a.videoObj.length && (a._c7 = f('<div class="rsVideoFrameHolder"><div class="rsPreloader"></div><div class="rsCloseVideoBtn"><div class="rsCloseVideoIcn"></div></div></div>'), a._c7.find(".rsPreloader").after(a.videoObj), b = b.hasClass("rsVideoContainer") ? b: b.find(".rsVideoContainer"), a._c7.css({
                    width: b.width(),
                    height: b.height()
                }).find(".rsCloseVideoBtn").off("click.rsv").on("click.rsv",
                function(b) {
                    a.stopVideo();
                    b.preventDefault();
                    b.stopPropagation();
                    return ! 1
                }), b.append(a._c7), a.isIPAD && b.addClass("rsIOSVideo"), a._e7(!1), setTimeout(function() {
                    a._c7.addClass("rsVideoActive")
                },
                10), a.ev.trigger("rsVideoPlay"), a._b7 = !0);
                return ! 0
            }
            return ! 1
        },
        stopVideo: function() {
            var a = this;
            return a._b7 ? (a.isIPAD && a.slider.find(".rsCloseVideoBtn").remove(), a._e7(!0), setTimeout(function() {
                a.ev.trigger("rsOnDestroyVideoElement", [a.videoObj]);
                var c = a._c7.find("iframe");
                if (c.length) try {
                    c.attr("src", "")
                } catch(b) {}
                a._c7.remove();
                a._c7 = null
            },
            16), a.ev.trigger("rsVideoStop"), a._b7 = !1, !0) : !1
        },
        _e7: function(a) {
            var c = [],
            b = this.st.video;
            b.autoHideArrows && (this._c2 && (c.push(this._c2, this._d2), this._e2 = !a), this._v5 && c.push(this._v5));
            b.autoHideControlNav && this._k5 && c.push(this._k5);
            b.autoHideBlocks && this.currSlide.animBlocks && c.push(this.currSlide.animBlocks);
            b.autoHideCaption && this.globalCaption && c.push(this.globalCaption);
            if (c.length) for (b = 0; b < c.length; b++) a ? c[b].removeClass("rsHidden") : c[b].addClass("rsHidden")
        }
    });
    f.rsModules.video = f.rsProto._z6
})(jQuery);
// jquery.rs.visible-nearby v1.0.2
(function(d) {
    d.rsProto._f7 = function() {
        var a = this;
        a.st.visibleNearby && a.st.visibleNearby.enabled && (a._g7 = {
            enabled: !0,
            centerArea: 0.6,
            center: !0,
            breakpoint: 0,
            breakpointCenterArea: 0.8,
            hiddenOverflow: !0,
            navigateByCenterClick: !1
        },
        a.st.visibleNearby = d.extend({},
        a._g7, a.st.visibleNearby), a.ev.one("rsAfterPropsSetup",
        function() {
            a._h7 = a._e1.css("overflow", "visible").wrap('<div class="rsVisibleNearbyWrap"></div>').parent();
            a.st.visibleNearby.hiddenOverflow || a._h7.css("overflow", "visible");
            a._o1 = a.st.controlsInside ? a._h7: a.slider
        }), a.ev.on("rsAfterSizePropSet",
        function() {
            var b, c = a.st.visibleNearby;
            b = c.breakpoint && a.width < c.breakpoint ? c.breakpointCenterArea: c.centerArea;
            a._h ? (a._b4 *= b, a._h7.css({
                height: a._c4,
                width: a._b4 / b
            }), a._d = a._b4 * (1 - b) / 2 / b) : (a._c4 *= b, a._h7.css({
                height: a._c4 / b,
                width: a._b4
            }), a._d = a._c4 * (1 - b) / 2 / b);
            c.navigateByCenterClick || (a._q = a._h ? a._b4: a._c4);
            c.center && a._e1.css("margin-" + (a._h ? "left": "top"), a._d)
        }))
    };
    d.rsModules.visibleNearby = d.rsProto._f7
})(jQuery);;