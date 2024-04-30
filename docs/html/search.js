window.pdocSearch = (function () {
    /** elasticlunr - http://weixsong.github.io * Copyright (C) 2017 Oliver Nightingale * Copyright (C) 2017 Wei Song * MIT Licensed */ !(function () {
        function e(e) {
            if (null === e || "object" != typeof e) return e;
            var t = e.constructor();
            for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
            return t;
        }
        var t = function (e) {
            var n = new t.Index();
            return n.pipeline.add(t.trimmer, t.stopWordFilter, t.stemmer), e && e.call(n, n), n;
        };
        (t.version = "0.9.5"),
            (lunr = t),
            (t.utils = {}),
            (t.utils.warn = (function (e) {
                return function (t) {
                    e.console && console.warn && console.warn(t);
                };
            })(this)),
            (t.utils.toString = function (e) {
                return void 0 === e || null === e ? "" : e.toString();
            }),
            (t.EventEmitter = function () {
                this.events = {};
            }),
            (t.EventEmitter.prototype.addListener = function () {
                var e = Array.prototype.slice.call(arguments),
                    t = e.pop(),
                    n = e;
                if ("function" != typeof t) throw new TypeError("last argument must be a function");
                n.forEach(function (e) {
                    this.hasHandler(e) || (this.events[e] = []), this.events[e].push(t);
                }, this);
            }),
            (t.EventEmitter.prototype.removeListener = function (e, t) {
                if (this.hasHandler(e)) {
                    var n = this.events[e].indexOf(t);
                    -1 !== n && (this.events[e].splice(n, 1), 0 == this.events[e].length && delete this.events[e]);
                }
            }),
            (t.EventEmitter.prototype.emit = function (e) {
                if (this.hasHandler(e)) {
                    var t = Array.prototype.slice.call(arguments, 1);
                    this.events[e].forEach(function (e) {
                        e.apply(void 0, t);
                    }, this);
                }
            }),
            (t.EventEmitter.prototype.hasHandler = function (e) {
                return e in this.events;
            }),
            (t.tokenizer = function (e) {
                if (!arguments.length || null === e || void 0 === e) return [];
                if (Array.isArray(e)) {
                    var n = e.filter(function (e) {
                        return null === e || void 0 === e ? !1 : !0;
                    });
                    n = n.map(function (e) {
                        return t.utils.toString(e).toLowerCase();
                    });
                    var i = [];
                    return (
                        n.forEach(function (e) {
                            var n = e.split(t.tokenizer.seperator);
                            i = i.concat(n);
                        }, this),
                        i
                    );
                }
                return e.toString().trim().toLowerCase().split(t.tokenizer.seperator);
            }),
            (t.tokenizer.defaultSeperator = /[\s\-]+/),
            (t.tokenizer.seperator = t.tokenizer.defaultSeperator),
            (t.tokenizer.setSeperator = function (e) {
                null !== e && void 0 !== e && "object" == typeof e && (t.tokenizer.seperator = e);
            }),
            (t.tokenizer.resetSeperator = function () {
                t.tokenizer.seperator = t.tokenizer.defaultSeperator;
            }),
            (t.tokenizer.getSeperator = function () {
                return t.tokenizer.seperator;
            }),
            (t.Pipeline = function () {
                this._queue = [];
            }),
            (t.Pipeline.registeredFunctions = {}),
            (t.Pipeline.registerFunction = function (e, n) {
                n in t.Pipeline.registeredFunctions && t.utils.warn("Overwriting existing registered function: " + n),
                    (e.label = n),
                    (t.Pipeline.registeredFunctions[n] = e);
            }),
            (t.Pipeline.getRegisteredFunction = function (e) {
                return e in t.Pipeline.registeredFunctions != !0 ? null : t.Pipeline.registeredFunctions[e];
            }),
            (t.Pipeline.warnIfFunctionNotRegistered = function (e) {
                var n = e.label && e.label in this.registeredFunctions;
                n || t.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n", e);
            }),
            (t.Pipeline.load = function (e) {
                var n = new t.Pipeline();
                return (
                    e.forEach(function (e) {
                        var i = t.Pipeline.getRegisteredFunction(e);
                        if (!i) throw new Error("Cannot load un-registered function: " + e);
                        n.add(i);
                    }),
                    n
                );
            }),
            (t.Pipeline.prototype.add = function () {
                var e = Array.prototype.slice.call(arguments);
                e.forEach(function (e) {
                    t.Pipeline.warnIfFunctionNotRegistered(e), this._queue.push(e);
                }, this);
            }),
            (t.Pipeline.prototype.after = function (e, n) {
                t.Pipeline.warnIfFunctionNotRegistered(n);
                var i = this._queue.indexOf(e);
                if (-1 === i) throw new Error("Cannot find existingFn");
                this._queue.splice(i + 1, 0, n);
            }),
            (t.Pipeline.prototype.before = function (e, n) {
                t.Pipeline.warnIfFunctionNotRegistered(n);
                var i = this._queue.indexOf(e);
                if (-1 === i) throw new Error("Cannot find existingFn");
                this._queue.splice(i, 0, n);
            }),
            (t.Pipeline.prototype.remove = function (e) {
                var t = this._queue.indexOf(e);
                -1 !== t && this._queue.splice(t, 1);
            }),
            (t.Pipeline.prototype.run = function (e) {
                for (var t = [], n = e.length, i = this._queue.length, o = 0; n > o; o++) {
                    for (var r = e[o], s = 0; i > s && ((r = this._queue[s](r, o, e)), void 0 !== r && null !== r); s++);
                    void 0 !== r && null !== r && t.push(r);
                }
                return t;
            }),
            (t.Pipeline.prototype.reset = function () {
                this._queue = [];
            }),
            (t.Pipeline.prototype.get = function () {
                return this._queue;
            }),
            (t.Pipeline.prototype.toJSON = function () {
                return this._queue.map(function (e) {
                    return t.Pipeline.warnIfFunctionNotRegistered(e), e.label;
                });
            }),
            (t.Index = function () {
                (this._fields = []),
                    (this._ref = "id"),
                    (this.pipeline = new t.Pipeline()),
                    (this.documentStore = new t.DocumentStore()),
                    (this.index = {}),
                    (this.eventEmitter = new t.EventEmitter()),
                    (this._idfCache = {}),
                    this.on(
                        "add",
                        "remove",
                        "update",
                        function () {
                            this._idfCache = {};
                        }.bind(this)
                    );
            }),
            (t.Index.prototype.on = function () {
                var e = Array.prototype.slice.call(arguments);
                return this.eventEmitter.addListener.apply(this.eventEmitter, e);
            }),
            (t.Index.prototype.off = function (e, t) {
                return this.eventEmitter.removeListener(e, t);
            }),
            (t.Index.load = function (e) {
                e.version !== t.version && t.utils.warn("version mismatch: current " + t.version + " importing " + e.version);
                var n = new this();
                (n._fields = e.fields),
                    (n._ref = e.ref),
                    (n.documentStore = t.DocumentStore.load(e.documentStore)),
                    (n.pipeline = t.Pipeline.load(e.pipeline)),
                    (n.index = {});
                for (var i in e.index) n.index[i] = t.InvertedIndex.load(e.index[i]);
                return n;
            }),
            (t.Index.prototype.addField = function (e) {
                return this._fields.push(e), (this.index[e] = new t.InvertedIndex()), this;
            }),
            (t.Index.prototype.setRef = function (e) {
                return (this._ref = e), this;
            }),
            (t.Index.prototype.saveDocument = function (e) {
                return (this.documentStore = new t.DocumentStore(e)), this;
            }),
            (t.Index.prototype.addDoc = function (e, n) {
                if (e) {
                    var n = void 0 === n ? !0 : n,
                        i = e[this._ref];
                    this.documentStore.addDoc(i, e),
                        this._fields.forEach(function (n) {
                            var o = this.pipeline.run(t.tokenizer(e[n]));
                            this.documentStore.addFieldLength(i, n, o.length);
                            var r = {};
                            o.forEach(function (e) {
                                e in r ? (r[e] += 1) : (r[e] = 1);
                            }, this);
                            for (var s in r) {
                                var u = r[s];
                                (u = Math.sqrt(u)), this.index[n].addToken(s, { ref: i, tf: u });
                            }
                        }, this),
                        n && this.eventEmitter.emit("add", e, this);
                }
            }),
            (t.Index.prototype.removeDocByRef = function (e) {
                if (e && this.documentStore.isDocStored() !== !1 && this.documentStore.hasDoc(e)) {
                    var t = this.documentStore.getDoc(e);
                    this.removeDoc(t, !1);
                }
            }),
            (t.Index.prototype.removeDoc = function (e, n) {
                if (e) {
                    var n = void 0 === n ? !0 : n,
                        i = e[this._ref];
                    this.documentStore.hasDoc(i) &&
                        (this.documentStore.removeDoc(i),
                        this._fields.forEach(function (n) {
                            var o = this.pipeline.run(t.tokenizer(e[n]));
                            o.forEach(function (e) {
                                this.index[n].removeToken(e, i);
                            }, this);
                        }, this),
                        n && this.eventEmitter.emit("remove", e, this));
                }
            }),
            (t.Index.prototype.updateDoc = function (e, t) {
                var t = void 0 === t ? !0 : t;
                this.removeDocByRef(e[this._ref], !1), this.addDoc(e, !1), t && this.eventEmitter.emit("update", e, this);
            }),
            (t.Index.prototype.idf = function (e, t) {
                var n = "@" + t + "/" + e;
                if (Object.prototype.hasOwnProperty.call(this._idfCache, n)) return this._idfCache[n];
                var i = this.index[t].getDocFreq(e),
                    o = 1 + Math.log(this.documentStore.length / (i + 1));
                return (this._idfCache[n] = o), o;
            }),
            (t.Index.prototype.getFields = function () {
                return this._fields.slice();
            }),
            (t.Index.prototype.search = function (e, n) {
                if (!e) return [];
                e = "string" == typeof e ? { any: e } : JSON.parse(JSON.stringify(e));
                var i = null;
                null != n && (i = JSON.stringify(n));
                for (var o = new t.Configuration(i, this.getFields()).get(), r = {}, s = Object.keys(e), u = 0; u < s.length; u++) {
                    var a = s[u];
                    r[a] = this.pipeline.run(t.tokenizer(e[a]));
                }
                var l = {};
                for (var c in o) {
                    var d = r[c] || r.any;
                    if (d) {
                        var f = this.fieldSearch(d, c, o),
                            h = o[c].boost;
                        for (var p in f) f[p] = f[p] * h;
                        for (var p in f) p in l ? (l[p] += f[p]) : (l[p] = f[p]);
                    }
                }
                var v,
                    g = [];
                for (var p in l) (v = { ref: p, score: l[p] }), this.documentStore.hasDoc(p) && (v.doc = this.documentStore.getDoc(p)), g.push(v);
                return (
                    g.sort(function (e, t) {
                        return t.score - e.score;
                    }),
                    g
                );
            }),
            (t.Index.prototype.fieldSearch = function (e, t, n) {
                var i = n[t].bool,
                    o = n[t].expand,
                    r = n[t].boost,
                    s = null,
                    u = {};
                return 0 !== r
                    ? (e.forEach(function (e) {
                          var n = [e];
                          1 == o && (n = this.index[t].expandToken(e));
                          var r = {};
                          n.forEach(function (n) {
                              var o = this.index[t].getDocs(n),
                                  a = this.idf(n, t);
                              if (s && "AND" == i) {
                                  var l = {};
                                  for (var c in s) c in o && (l[c] = o[c]);
                                  o = l;
                              }
                              n == e && this.fieldSearchStats(u, n, o);
                              for (var c in o) {
                                  var d = this.index[t].getTermFrequency(n, c),
                                      f = this.documentStore.getFieldLength(c, t),
                                      h = 1;
                                  0 != f && (h = 1 / Math.sqrt(f));
                                  var p = 1;
                                  n != e && (p = 0.15 * (1 - (n.length - e.length) / n.length));
                                  var v = d * a * h * p;
                                  c in r ? (r[c] += v) : (r[c] = v);
                              }
                          }, this),
                              (s = this.mergeScores(s, r, i));
                      }, this),
                      (s = this.coordNorm(s, u, e.length)))
                    : void 0;
            }),
            (t.Index.prototype.mergeScores = function (e, t, n) {
                if (!e) return t;
                if ("AND" == n) {
                    var i = {};
                    for (var o in t) o in e && (i[o] = e[o] + t[o]);
                    return i;
                }
                for (var o in t) o in e ? (e[o] += t[o]) : (e[o] = t[o]);
                return e;
            }),
            (t.Index.prototype.fieldSearchStats = function (e, t, n) {
                for (var i in n) i in e ? e[i].push(t) : (e[i] = [t]);
            }),
            (t.Index.prototype.coordNorm = function (e, t, n) {
                for (var i in e)
                    if (i in t) {
                        var o = t[i].length;
                        e[i] = (e[i] * o) / n;
                    }
                return e;
            }),
            (t.Index.prototype.toJSON = function () {
                var e = {};
                return (
                    this._fields.forEach(function (t) {
                        e[t] = this.index[t].toJSON();
                    }, this),
                    {
                        version: t.version,
                        fields: this._fields,
                        ref: this._ref,
                        documentStore: this.documentStore.toJSON(),
                        index: e,
                        pipeline: this.pipeline.toJSON(),
                    }
                );
            }),
            (t.Index.prototype.use = function (e) {
                var t = Array.prototype.slice.call(arguments, 1);
                t.unshift(this), e.apply(this, t);
            }),
            (t.DocumentStore = function (e) {
                (this._save = null === e || void 0 === e ? !0 : e), (this.docs = {}), (this.docInfo = {}), (this.length = 0);
            }),
            (t.DocumentStore.load = function (e) {
                var t = new this();
                return (t.length = e.length), (t.docs = e.docs), (t.docInfo = e.docInfo), (t._save = e.save), t;
            }),
            (t.DocumentStore.prototype.isDocStored = function () {
                return this._save;
            }),
            (t.DocumentStore.prototype.addDoc = function (t, n) {
                this.hasDoc(t) || this.length++, (this.docs[t] = this._save === !0 ? e(n) : null);
            }),
            (t.DocumentStore.prototype.getDoc = function (e) {
                return this.hasDoc(e) === !1 ? null : this.docs[e];
            }),
            (t.DocumentStore.prototype.hasDoc = function (e) {
                return e in this.docs;
            }),
            (t.DocumentStore.prototype.removeDoc = function (e) {
                this.hasDoc(e) && (delete this.docs[e], delete this.docInfo[e], this.length--);
            }),
            (t.DocumentStore.prototype.addFieldLength = function (e, t, n) {
                null !== e && void 0 !== e && 0 != this.hasDoc(e) && (this.docInfo[e] || (this.docInfo[e] = {}), (this.docInfo[e][t] = n));
            }),
            (t.DocumentStore.prototype.updateFieldLength = function (e, t, n) {
                null !== e && void 0 !== e && 0 != this.hasDoc(e) && this.addFieldLength(e, t, n);
            }),
            (t.DocumentStore.prototype.getFieldLength = function (e, t) {
                return null === e || void 0 === e ? 0 : e in this.docs && t in this.docInfo[e] ? this.docInfo[e][t] : 0;
            }),
            (t.DocumentStore.prototype.toJSON = function () {
                return { docs: this.docs, docInfo: this.docInfo, length: this.length, save: this._save };
            }),
            (t.stemmer = (function () {
                var e = {
                        ational: "ate",
                        tional: "tion",
                        enci: "ence",
                        anci: "ance",
                        izer: "ize",
                        bli: "ble",
                        alli: "al",
                        entli: "ent",
                        eli: "e",
                        ousli: "ous",
                        ization: "ize",
                        ation: "ate",
                        ator: "ate",
                        alism: "al",
                        iveness: "ive",
                        fulness: "ful",
                        ousness: "ous",
                        aliti: "al",
                        iviti: "ive",
                        biliti: "ble",
                        logi: "log",
                    },
                    t = { icate: "ic", ative: "", alize: "al", iciti: "ic", ical: "ic", ful: "", ness: "" },
                    n = "[^aeiou]",
                    i = "[aeiouy]",
                    o = n + "[^aeiouy]*",
                    r = i + "[aeiou]*",
                    s = "^(" + o + ")?" + r + o,
                    u = "^(" + o + ")?" + r + o + "(" + r + ")?$",
                    a = "^(" + o + ")?" + r + o + r + o,
                    l = "^(" + o + ")?" + i,
                    c = new RegExp(s),
                    d = new RegExp(a),
                    f = new RegExp(u),
                    h = new RegExp(l),
                    p = /^(.+?)(ss|i)es$/,
                    v = /^(.+?)([^s])s$/,
                    g = /^(.+?)eed$/,
                    m = /^(.+?)(ed|ing)$/,
                    y = /.$/,
                    S = /(at|bl|iz)$/,
                    x = new RegExp("([^aeiouylsz])\\1$"),
                    w = new RegExp("^" + o + i + "[^aeiouwxy]$"),
                    I = /^(.+?[^aeiou])y$/,
                    b =
                        /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,
                    E = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,
                    D = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,
                    F = /^(.+?)(s|t)(ion)$/,
                    _ = /^(.+?)e$/,
                    P = /ll$/,
                    k = new RegExp("^" + o + i + "[^aeiouwxy]$"),
                    z = function (n) {
                        var i, o, r, s, u, a, l;
                        if (n.length < 3) return n;
                        if (
                            ((r = n.substr(0, 1)),
                            "y" == r && (n = r.toUpperCase() + n.substr(1)),
                            (s = p),
                            (u = v),
                            s.test(n) ? (n = n.replace(s, "$1$2")) : u.test(n) && (n = n.replace(u, "$1$2")),
                            (s = g),
                            (u = m),
                            s.test(n))
                        ) {
                            var z = s.exec(n);
                            (s = c), s.test(z[1]) && ((s = y), (n = n.replace(s, "")));
                        } else if (u.test(n)) {
                            var z = u.exec(n);
                            (i = z[1]),
                                (u = h),
                                u.test(i) &&
                                    ((n = i),
                                    (u = S),
                                    (a = x),
                                    (l = w),
                                    u.test(n) ? (n += "e") : a.test(n) ? ((s = y), (n = n.replace(s, ""))) : l.test(n) && (n += "e"));
                        }
                        if (((s = I), s.test(n))) {
                            var z = s.exec(n);
                            (i = z[1]), (n = i + "i");
                        }
                        if (((s = b), s.test(n))) {
                            var z = s.exec(n);
                            (i = z[1]), (o = z[2]), (s = c), s.test(i) && (n = i + e[o]);
                        }
                        if (((s = E), s.test(n))) {
                            var z = s.exec(n);
                            (i = z[1]), (o = z[2]), (s = c), s.test(i) && (n = i + t[o]);
                        }
                        if (((s = D), (u = F), s.test(n))) {
                            var z = s.exec(n);
                            (i = z[1]), (s = d), s.test(i) && (n = i);
                        } else if (u.test(n)) {
                            var z = u.exec(n);
                            (i = z[1] + z[2]), (u = d), u.test(i) && (n = i);
                        }
                        if (((s = _), s.test(n))) {
                            var z = s.exec(n);
                            (i = z[1]), (s = d), (u = f), (a = k), (s.test(i) || (u.test(i) && !a.test(i))) && (n = i);
                        }
                        return (
                            (s = P), (u = d), s.test(n) && u.test(n) && ((s = y), (n = n.replace(s, ""))), "y" == r && (n = r.toLowerCase() + n.substr(1)), n
                        );
                    };
                return z;
            })()),
            t.Pipeline.registerFunction(t.stemmer, "stemmer"),
            (t.stopWordFilter = function (e) {
                return e && t.stopWordFilter.stopWords[e] !== !0 ? e : void 0;
            }),
            (t.clearStopWords = function () {
                t.stopWordFilter.stopWords = {};
            }),
            (t.addStopWords = function (e) {
                null != e &&
                    Array.isArray(e) !== !1 &&
                    e.forEach(function (e) {
                        t.stopWordFilter.stopWords[e] = !0;
                    }, this);
            }),
            (t.resetStopWords = function () {
                t.stopWordFilter.stopWords = t.defaultStopWords;
            }),
            (t.defaultStopWords = {
                "": !0,
                a: !0,
                able: !0,
                about: !0,
                across: !0,
                after: !0,
                all: !0,
                almost: !0,
                also: !0,
                am: !0,
                among: !0,
                an: !0,
                and: !0,
                any: !0,
                are: !0,
                as: !0,
                at: !0,
                be: !0,
                because: !0,
                been: !0,
                but: !0,
                by: !0,
                can: !0,
                cannot: !0,
                could: !0,
                dear: !0,
                did: !0,
                do: !0,
                does: !0,
                either: !0,
                else: !0,
                ever: !0,
                every: !0,
                for: !0,
                from: !0,
                get: !0,
                got: !0,
                had: !0,
                has: !0,
                have: !0,
                he: !0,
                her: !0,
                hers: !0,
                him: !0,
                his: !0,
                how: !0,
                however: !0,
                i: !0,
                if: !0,
                in: !0,
                into: !0,
                is: !0,
                it: !0,
                its: !0,
                just: !0,
                least: !0,
                let: !0,
                like: !0,
                likely: !0,
                may: !0,
                me: !0,
                might: !0,
                most: !0,
                must: !0,
                my: !0,
                neither: !0,
                no: !0,
                nor: !0,
                not: !0,
                of: !0,
                off: !0,
                often: !0,
                on: !0,
                only: !0,
                or: !0,
                other: !0,
                our: !0,
                own: !0,
                rather: !0,
                said: !0,
                say: !0,
                says: !0,
                she: !0,
                should: !0,
                since: !0,
                so: !0,
                some: !0,
                than: !0,
                that: !0,
                the: !0,
                their: !0,
                them: !0,
                then: !0,
                there: !0,
                these: !0,
                they: !0,
                this: !0,
                tis: !0,
                to: !0,
                too: !0,
                twas: !0,
                us: !0,
                wants: !0,
                was: !0,
                we: !0,
                were: !0,
                what: !0,
                when: !0,
                where: !0,
                which: !0,
                while: !0,
                who: !0,
                whom: !0,
                why: !0,
                will: !0,
                with: !0,
                would: !0,
                yet: !0,
                you: !0,
                your: !0,
            }),
            (t.stopWordFilter.stopWords = t.defaultStopWords),
            t.Pipeline.registerFunction(t.stopWordFilter, "stopWordFilter"),
            (t.trimmer = function (e) {
                if (null === e || void 0 === e) throw new Error("token should not be undefined");
                return e.replace(/^\W+/, "").replace(/\W+$/, "");
            }),
            t.Pipeline.registerFunction(t.trimmer, "trimmer"),
            (t.InvertedIndex = function () {
                this.root = { docs: {}, df: 0 };
            }),
            (t.InvertedIndex.load = function (e) {
                var t = new this();
                return (t.root = e.root), t;
            }),
            (t.InvertedIndex.prototype.addToken = function (e, t, n) {
                for (var n = n || this.root, i = 0; i <= e.length - 1; ) {
                    var o = e[i];
                    o in n || (n[o] = { docs: {}, df: 0 }), (i += 1), (n = n[o]);
                }
                var r = t.ref;
                n.docs[r] ? (n.docs[r] = { tf: t.tf }) : ((n.docs[r] = { tf: t.tf }), (n.df += 1));
            }),
            (t.InvertedIndex.prototype.hasToken = function (e) {
                if (!e) return !1;
                for (var t = this.root, n = 0; n < e.length; n++) {
                    if (!t[e[n]]) return !1;
                    t = t[e[n]];
                }
                return !0;
            }),
            (t.InvertedIndex.prototype.getNode = function (e) {
                if (!e) return null;
                for (var t = this.root, n = 0; n < e.length; n++) {
                    if (!t[e[n]]) return null;
                    t = t[e[n]];
                }
                return t;
            }),
            (t.InvertedIndex.prototype.getDocs = function (e) {
                var t = this.getNode(e);
                return null == t ? {} : t.docs;
            }),
            (t.InvertedIndex.prototype.getTermFrequency = function (e, t) {
                var n = this.getNode(e);
                return null == n ? 0 : t in n.docs ? n.docs[t].tf : 0;
            }),
            (t.InvertedIndex.prototype.getDocFreq = function (e) {
                var t = this.getNode(e);
                return null == t ? 0 : t.df;
            }),
            (t.InvertedIndex.prototype.removeToken = function (e, t) {
                if (e) {
                    var n = this.getNode(e);
                    null != n && t in n.docs && (delete n.docs[t], (n.df -= 1));
                }
            }),
            (t.InvertedIndex.prototype.expandToken = function (e, t, n) {
                if (null == e || "" == e) return [];
                var t = t || [];
                if (void 0 == n && ((n = this.getNode(e)), null == n)) return t;
                n.df > 0 && t.push(e);
                for (var i in n) "docs" !== i && "df" !== i && this.expandToken(e + i, t, n[i]);
                return t;
            }),
            (t.InvertedIndex.prototype.toJSON = function () {
                return { root: this.root };
            }),
            (t.Configuration = function (e, n) {
                var e = e || "";
                if (void 0 == n || null == n) throw new Error("fields should not be null");
                this.config = {};
                var i;
                try {
                    (i = JSON.parse(e)), this.buildUserConfig(i, n);
                } catch (o) {
                    t.utils.warn("user configuration parse failed, will use default configuration"), this.buildDefaultConfig(n);
                }
            }),
            (t.Configuration.prototype.buildDefaultConfig = function (e) {
                this.reset(),
                    e.forEach(function (e) {
                        this.config[e] = { boost: 1, bool: "OR", expand: !1 };
                    }, this);
            }),
            (t.Configuration.prototype.buildUserConfig = function (e, n) {
                var i = "OR",
                    o = !1;
                if ((this.reset(), "bool" in e && (i = e.bool || i), "expand" in e && (o = e.expand || o), "fields" in e))
                    for (var r in e.fields)
                        if (n.indexOf(r) > -1) {
                            var s = e.fields[r],
                                u = o;
                            void 0 != s.expand && (u = s.expand),
                                (this.config[r] = { boost: s.boost || 0 === s.boost ? s.boost : 1, bool: s.bool || i, expand: u });
                        } else t.utils.warn("field name in user configuration not found in index instance fields");
                else this.addAllFields2UserConfig(i, o, n);
            }),
            (t.Configuration.prototype.addAllFields2UserConfig = function (e, t, n) {
                n.forEach(function (n) {
                    this.config[n] = { boost: 1, bool: e, expand: t };
                }, this);
            }),
            (t.Configuration.prototype.get = function () {
                return this.config;
            }),
            (t.Configuration.prototype.reset = function () {
                this.config = {};
            }),
            (lunr.SortedSet = function () {
                (this.length = 0), (this.elements = []);
            }),
            (lunr.SortedSet.load = function (e) {
                var t = new this();
                return (t.elements = e), (t.length = e.length), t;
            }),
            (lunr.SortedSet.prototype.add = function () {
                var e, t;
                for (e = 0; e < arguments.length; e++) (t = arguments[e]), ~this.indexOf(t) || this.elements.splice(this.locationFor(t), 0, t);
                this.length = this.elements.length;
            }),
            (lunr.SortedSet.prototype.toArray = function () {
                return this.elements.slice();
            }),
            (lunr.SortedSet.prototype.map = function (e, t) {
                return this.elements.map(e, t);
            }),
            (lunr.SortedSet.prototype.forEach = function (e, t) {
                return this.elements.forEach(e, t);
            }),
            (lunr.SortedSet.prototype.indexOf = function (e) {
                for (var t = 0, n = this.elements.length, i = n - t, o = t + Math.floor(i / 2), r = this.elements[o]; i > 1; ) {
                    if (r === e) return o;
                    e > r && (t = o), r > e && (n = o), (i = n - t), (o = t + Math.floor(i / 2)), (r = this.elements[o]);
                }
                return r === e ? o : -1;
            }),
            (lunr.SortedSet.prototype.locationFor = function (e) {
                for (var t = 0, n = this.elements.length, i = n - t, o = t + Math.floor(i / 2), r = this.elements[o]; i > 1; )
                    e > r && (t = o), r > e && (n = o), (i = n - t), (o = t + Math.floor(i / 2)), (r = this.elements[o]);
                return r > e ? o : e > r ? o + 1 : void 0;
            }),
            (lunr.SortedSet.prototype.intersect = function (e) {
                for (var t = new lunr.SortedSet(), n = 0, i = 0, o = this.length, r = e.length, s = this.elements, u = e.elements; ; ) {
                    if (n > o - 1 || i > r - 1) break;
                    s[n] !== u[i] ? (s[n] < u[i] ? n++ : s[n] > u[i] && i++) : (t.add(s[n]), n++, i++);
                }
                return t;
            }),
            (lunr.SortedSet.prototype.clone = function () {
                var e = new lunr.SortedSet();
                return (e.elements = this.toArray()), (e.length = e.elements.length), e;
            }),
            (lunr.SortedSet.prototype.union = function (e) {
                var t, n, i;
                this.length >= e.length ? ((t = this), (n = e)) : ((t = e), (n = this)), (i = t.clone());
                for (var o = 0, r = n.toArray(); o < r.length; o++) i.add(r[o]);
                return i;
            }),
            (lunr.SortedSet.prototype.toJSON = function () {
                return this.toArray();
            }),
            (function (e, t) {
                "function" == typeof define && define.amd ? define(t) : "object" == typeof exports ? (module.exports = t()) : (e.elasticlunr = t());
            })(this, function () {
                return t;
            });
    })();
    /** pdoc search index */ const docs = [
        { fullname: "nsedt", modulename: "nsedt", kind: "module", doc: "<p>Main file</p>\n" },
        { fullname: "nsedt.derivatives", modulename: "nsedt.derivatives", kind: "module", doc: "<p>get data for Equity</p>\n" },
        {
            fullname: "nsedt.derivatives.log",
            modulename: "nsedt.derivatives",
            qualname: "log",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&lt;RootLogger root (INFO)&gt;",
        },
        {
            fullname: "nsedt.derivatives.get_vix",
            modulename: "nsedt.derivatives",
            qualname: "get_vix",
            kind: "function",
            doc: '<p>Get Vix data</p>\n\n<p>Args:\n    start_date (str): start date in "%d-%m-%Y" format\n    end_date (str): end_date in "%d-%m-%Y" format\n    response_type (str, optional): response_type. Defaults to "panda_df".\n    columns_drop_list (list, optional): provide custom columns drop list. Defaults to None.</p>\n\n<p>Raises:\n    exc: general Exception</p>\n\n<p>Returns:\n        Pandas DataFrame: df containing option data\n    or\n        Json: json containing option data</p>\n',
            signature:
                '<span class="signature pdoc-code multiline">(<span class="param">\t<span class="n">start_date</span><span class="p">:</span> <span class="nb">str</span>,</span><span class="param">\t<span class="n">end_date</span><span class="p">:</span> <span class="nb">str</span>,</span><span class="param">\t<span class="n">response_type</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="s1">&#39;panda_df&#39;</span>,</span><span class="param">\t<span class="n">columns_drop_list</span><span class="p">:</span> <span class="nb">list</span> <span class="o">=</span> <span class="kc">None</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        { fullname: "nsedt.derivatives.futures", modulename: "nsedt.derivatives.futures", kind: "module", doc: "<p>get data for Futures</p>\n" },
        {
            fullname: "nsedt.derivatives.futures.get_future_price",
            modulename: "nsedt.derivatives.futures",
            qualname: "get_future_price",
            kind: "function",
            doc: '<p>get future price of stock / indices\nArgs:\n    symbol (str): _description_\n    start_date (str): _description_\n    end_date (str): _description_\n    expiry_date (str, optional): _description_. Defaults to None.\n    response_type (str, optional): _description_. Defaults to "panda_df".\n    columns_drop_list (list, optional): _description_. Defaults to None.</p>\n\n<p>Returns:\n    _type_: _description_</p>\n',
            signature:
                '<span class="signature pdoc-code multiline">(<span class="param">\t<span class="n">symbol</span><span class="p">:</span> <span class="nb">str</span>,</span><span class="param">\t<span class="n">start_date</span><span class="p">:</span> <span class="nb">str</span>,</span><span class="param">\t<span class="n">end_date</span><span class="p">:</span> <span class="nb">str</span>,</span><span class="param">\t<span class="n">expiry_date</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="kc">None</span>,</span><span class="param">\t<span class="n">response_type</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="s1">&#39;panda_df&#39;</span>,</span><span class="param">\t<span class="n">columns_drop_list</span><span class="p">:</span> <span class="nb">list</span> <span class="o">=</span> <span class="kc">None</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.derivatives.futures.get_future_expdate",
            modulename: "nsedt.derivatives.futures",
            qualname: "get_future_expdate",
            kind: "function",
            doc: "<p>get expiry dates of futures</p>\n\n<p>Args:\n    symbol (str): symbol name</p>\n\n<p>Returns:\n    list: expiry dates</p>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">symbol</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="nb">list</span>:</span></span>',
            funcdef: "def",
        },
        { fullname: "nsedt.derivatives.options", modulename: "nsedt.derivatives.options", kind: "module", doc: "<p>get data for Options</p>\n" },
        {
            fullname: "nsedt.derivatives.options.log",
            modulename: "nsedt.derivatives.options",
            qualname: "log",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&lt;RootLogger root (INFO)&gt;",
        },
        {
            fullname: "nsedt.derivatives.options.get_option_chain",
            modulename: "nsedt.derivatives.options",
            qualname: "get_option_chain",
            kind: "function",
            doc: '<p>Get option data of stock and indices</p>\n\n<p>Args:\n    symbol (str): symbol name\n    strike_price (str, optional): strike price to apply filter on price. Defaults to None.\n    expiry_date (str, optional): expiry date to apply filter on date. Defaults to None.\n    response_type (str, optional): response_type panda_df or json . Defaults to "panda_df".</p>\n\n<p>Returns:\n    Pandas DataFrame: df containing option data\nor\n    Json: json containing option data</p>\n',
            signature:
                '<span class="signature pdoc-code multiline">(<span class="param">\t<span class="n">symbol</span><span class="p">:</span> <span class="nb">str</span>,</span><span class="param">\t<span class="n">strike_price</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="kc">None</span>,</span><span class="param">\t<span class="n">expiry_date</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="kc">None</span>,</span><span class="param">\t<span class="n">response_type</span><span class="o">=</span><span class="s1">&#39;panda_df&#39;</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.derivatives.options.get_option_chain_expdate",
            modulename: "nsedt.derivatives.options",
            qualname: "get_option_chain_expdate",
            kind: "function",
            doc: '<p>get option  expiry date for stock and indices</p>\n\n<p>Args:\n    symbol (str): symbol name</p>\n\n<p>Returns:\n    list: expiry date in list("%d-%m-%Y" format)</p>\n',
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">symbol</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="nb">list</span>:</span></span>',
            funcdef: "def",
        },
        { fullname: "nsedt.equity", modulename: "nsedt.equity", kind: "module", doc: "<p>get data for Equity</p>\n" },
        {
            fullname: "nsedt.equity.log",
            modulename: "nsedt.equity",
            qualname: "log",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&lt;RootLogger root (INFO)&gt;",
        },
        {
            fullname: "nsedt.equity.get_companyinfo",
            modulename: "nsedt.equity",
            qualname: "get_companyinfo",
            kind: "function",
            doc: "<p>_summary_</p>\n\n<p>Args:</p>\n\n<pre><code>symbol (str): stock name\n\nresponse_type (str, Optional): define the response type panda_df | json. Default panda_df\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>Pandas DataFrame: df containing company info\n</code></pre>\n\n<p>or</p>\n\n<pre><code>Json: json containing company info\n</code></pre>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">symbol</span><span class="p">:</span> <span class="nb">str</span>, </span><span class="param"><span class="n">response_type</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="s1">&#39;panda_df&#39;</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.equity.get_marketstatus",
            modulename: "nsedt.equity",
            qualname: "get_marketstatus",
            kind: "function",
            doc: "<p>Args:</p>\n\n<pre><code>response_type (str, Optional): define the response type panda_df | json. Default panda_df\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>Pandas DataFrame: df containing market status\n\nJson : Json containing market status\n</code></pre>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">response_type</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="s1">&#39;panda_df&#39;</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.equity.get_price",
            modulename: "nsedt.equity",
            qualname: "get_price",
            kind: "function",
            doc: "<p>Create threads for different requests, parses data, combines them and returns dataframe</p>\n\n<p>Args:</p>\n\n<pre><code>start_date (datetime.datetime): start date\n\nend_date (datetime.datetime): end date\n\ninput_type (str): Either 'stock' or 'index'\n\nsymbol (str, optional): stock symbol. Defaults to None. TODO: implement for index`\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>Pandas DataFrame: df containing data for symbol of provided date range\n</code></pre>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">start_date</span>, </span><span class="param"><span class="n">end_date</span>, </span><span class="param"><span class="n">symbol</span><span class="o">=</span><span class="kc">None</span>, </span><span class="param"><span class="n">input_type</span><span class="o">=</span><span class="s1">&#39;stock&#39;</span>, </span><span class="param"><span class="n">series</span><span class="o">=</span><span class="s1">&#39;EQ&#39;</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.equity.get_corpinfo",
            modulename: "nsedt.equity",
            qualname: "get_corpinfo",
            kind: "function",
            doc: "<p>Create threads for different requests, parses data, combines them and returns dataframe</p>\n\n<p>Args:</p>\n\n<pre><code>start_date (datetime.datetime): start date\n\nend_date (datetime.datetime): end date\n\nsymbol (str, optional): stock symbol. Defaults to None.\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>Pandas DataFrame: df containing data for symbol of provided date range\n</code></pre>\n\n<p>or</p>\n\n<pre><code>Json: json containing data for symbol of provided date range\n</code></pre>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">start_date</span>, </span><span class="param"><span class="n">end_date</span>, </span><span class="param"><span class="n">symbol</span><span class="o">=</span><span class="kc">None</span>, </span><span class="param"><span class="n">response_type</span><span class="o">=</span><span class="s1">&#39;panda_df&#39;</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.equity.get_event",
            modulename: "nsedt.equity",
            qualname: "get_event",
            kind: "function",
            doc: "<p>Args:</p>\n\n<pre><code>start_date (datetime.datetime,optional): start date\n\nend_date (datetime.datetime,optional): end date\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>Pandas DataFrame: df containing event of provided date range\n</code></pre>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">start_date</span><span class="o">=</span><span class="kc">None</span>, </span><span class="param"><span class="n">end_date</span><span class="o">=</span><span class="kc">None</span>, </span><span class="param"><span class="n">index</span><span class="o">=</span><span class="s1">&#39;equities&#39;</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.equity.get_chartdata",
            modulename: "nsedt.equity",
            qualname: "get_chartdata",
            kind: "function",
            doc: "<p>Args:</p>\n\n<pre><code>symbol (str): stock symbol.\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>Pandas DataFrame: df containing chart data of provided date\n</code></pre>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">symbol</span>, </span><span class="param"><span class="n">preopen</span><span class="o">=</span><span class="kc">False</span>, </span><span class="param"><span class="n">response_type</span><span class="o">=</span><span class="s1">&#39;panda_df&#39;</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.equity.get_symbols_list",
            modulename: "nsedt.equity",
            qualname: "get_symbols_list",
            kind: "function",
            doc: "<p>Args:</p>\n\n<pre><code>No arguments needed\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>List of stock or equity symbols\n</code></pre>\n",
            signature: '<span class="signature pdoc-code condensed">(<span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.equity.get_asm_list",
            modulename: "nsedt.equity",
            qualname: "get_asm_list",
            kind: "function",
            doc: "<p>Args:</p>\n\n<pre><code>asm_type (str): ASM type, possible values: both,longterm,shortterm\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>List of stocks under ASM\n</code></pre>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">asm_type</span><span class="o">=</span><span class="s1">&#39;both&#39;</span></span><span class="return-annotation">) -> <span class="nb">list</span>:</span></span>',
            funcdef: "def",
        },
        { fullname: "nsedt.indices", modulename: "nsedt.indices", kind: "module", doc: "<p>get data for indices</p>\n" },
        {
            fullname: "nsedt.indices.log",
            modulename: "nsedt.indices",
            qualname: "log",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&lt;RootLogger root (INFO)&gt;",
        },
        {
            fullname: "nsedt.indices.get_price",
            modulename: "nsedt.indices",
            qualname: "get_price",
            kind: "function",
            doc: '<p>Get price of index</p>\n\n<p>Args:</p>\n\n<pre><code>start_date (datetime): start date\nend_date (datetime): end date\nsymbol (str): symbol name or index name\nresponse_type (str, optional):  Define return type: panda_df or json.\n                                Defaults to "panda_df".\ncolumns_drop_list (list,optional): define columns drop list, Defaults to None\ncolumns_rename_map (map, optional): define columns rename map, Defaults to None\n</code></pre>\n\n<p>Raises:</p>\n\n<pre><code>exc: general Exception\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>    Pandas DataFrame: df containing company info\nor\n    Json: json containing company info\n</code></pre>\n',
            signature:
                '<span class="signature pdoc-code multiline">(<span class="param">\t<span class="n">start_date</span><span class="p">:</span> <span class="o">&lt;</span><span class="n">module</span> <span class="s1">&#39;datetime&#39;</span> <span class="kn">from</span> <span class="s1">&#39;/opt/homebrew/Cellar/python@3.10/3.10.9/Frameworks/Python.framework/Versions/3.10/lib/python3.10/datetime.py&#39;</span><span class="o">&gt;</span>,</span><span class="param">\t<span class="n">end_date</span><span class="p">:</span> <span class="o">&lt;</span><span class="n">module</span> <span class="s1">&#39;datetime&#39;</span> <span class="kn">from</span> <span class="s1">&#39;/opt/homebrew/Cellar/python@3.10/3.10.9/Frameworks/Python.framework/Versions/3.10/lib/python3.10/datetime.py&#39;</span><span class="o">&gt;</span>,</span><span class="param">\t<span class="n">symbol</span><span class="p">:</span> <span class="nb">str</span>,</span><span class="param">\t<span class="n">response_type</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="s1">&#39;panda_df&#39;</span>,</span><span class="param">\t<span class="n">columns_drop_list</span><span class="p">:</span> <span class="nb">list</span> <span class="o">=</span> <span class="kc">None</span>,</span><span class="param">\t<span class="n">columns_rename_map</span><span class="p">:</span> <span class="nb">map</span> <span class="o">=</span> <span class="kc">None</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        { fullname: "nsedt.resources", modulename: "nsedt.resources", kind: "module", doc: "<p></p>\n" },
        { fullname: "nsedt.resources.constants", modulename: "nsedt.resources.constants", kind: "module", doc: "<p>Constants</p>\n" },
        {
            fullname: "nsedt.resources.constants.WINDOW_SIZE",
            modulename: "nsedt.resources.constants",
            qualname: "WINDOW_SIZE",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "50",
        },
        {
            fullname: "nsedt.resources.constants.MAX_WORKERS",
            modulename: "nsedt.resources.constants",
            qualname: "MAX_WORKERS",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "10",
        },
        {
            fullname: "nsedt.resources.constants.SYMBOL_MAP",
            modulename: "nsedt.resources.constants",
            qualname: "SYMBOL_MAP",
            kind: "variable",
            doc: "<p></p>\n",
            default_value:
                "[{&#x27;keys&#x27;: [&#x27;NIFTY 50&#x27;, &#x27;NIFTY50&#x27;, &#x27;NIFTY&#x27;], &#x27;indices&#x27;: &#x27;NIFTY 50&#x27;, &#x27;derivatives&#x27;: &#x27;NIFTY&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY BANK&#x27;, &#x27;NIFTYBANK&#x27;, &#x27;BANKNIFTY&#x27;], &#x27;derivatives&#x27;: &#x27;BANKNIFTY&#x27;, &#x27;indices&#x27;: &#x27;NIFTY BANK&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY FINANCIAL SERVICES&#x27;, &#x27;FINNIFTY&#x27;, &#x27;NIFTY FIN SERVICE&#x27;], &#x27;derivatives&#x27;: &#x27;FINNIFTY&#x27;, &#x27;indices&#x27;: &#x27;NIFTY FINANCIAL SERVICES&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY NEXT 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY NEXT 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP 100&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP 100&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP 150&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP 150&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SMALLCAP 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SMALLCAP 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SMALLCAP 100&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SMALLCAP 100&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SMALLCAP 250&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SMALLCAP 250&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDSMALLCAP 400&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDSMALLCAP 400&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY 100&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY 100&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY 200&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY 200&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY500 MULTICAP 50:25:25&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY500 MULTICAP 50:25:25&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY LARGEMIDCAP 250&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY LARGEMIDCAP 250&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP SELECT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP SELECT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY TOTAL MARKET&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY TOTAL MARKET&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MICROCAP 250&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MICROCAP 250&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY AUTO&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY AUTO&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY ENERGY&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY ENERGY&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY FINANCIAL SERVICES 25/50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY FINANCIAL SERVICES 25/50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY FMCG&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY FMCG&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY IT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY IT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MEDIA&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MEDIA&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY METAL&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY METAL&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PHARMA&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PHARMA&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PSU BANK&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PSU BANK&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY REALTY&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY REALTY&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PRIVATE BANK&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PRIVATE BANK&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY HEALTHCARE INDEX&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY HEALTHCARE INDEX&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY CONSUMER DURABLES&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY CONSUMER DURABLES&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY OIL &amp;amp; GAS&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY OIL &amp;amp; GAS&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY DIVIDEND OPPORTUNITIES 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY DIVIDEND OPPORTUNITIES 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY50 VALUE 20&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY50 VALUE 20&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 QUALITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 QUALITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY50 EQUAL WEIGHT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY50 EQUAL WEIGHT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 EQUAL WEIGHT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 EQUAL WEIGHT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 LOW VOLATILITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 LOW VOLATILITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY ALPHA 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY ALPHA 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY200 QUALITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY200 QUALITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY ALPHA LOW-VOLATILITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY ALPHA LOW-VOLATILITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY200 MOMENTUM 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY200 MOMENTUM 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP150 QUALITY 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP150 QUALITY 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY COMMODITIES&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY COMMODITIES&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INDIA CONSUMPTION&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INDIA CONSUMPTION&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY CPSE&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY CPSE&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INFRASTRUCTURE&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INFRASTRUCTURE&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MNC&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MNC&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY GROWTH SECTORS 15&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY GROWTH SECTORS 15&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PSE&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PSE&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SERVICES SECTOR&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SERVICES SECTOR&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 LIQUID 15&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 LIQUID 15&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP LIQUID 15&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP LIQUID 15&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INDIA DIGITAL&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INDIA DIGITAL&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 ESG&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 ESG&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INDIA MANUFACTURING&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INDIA MANUFACTURING&#x27;}]",
        },
        {
            fullname: "nsedt.resources.constants.LOG_FORMAT",
            modulename: "nsedt.resources.constants",
            qualname: "LOG_FORMAT",
            kind: "variable",
            doc: "<p></p>\n",
            default_value:
                "&#x27;{\\n    &quot;time&quot;: &quot;%(asctime)s&quot;,\\n    &quot;lineno&quot;: &quot;%(lineno)d&quot;,\\n    &quot;name&quot;: &quot;[%(name)s]&quot;,\\n    &quot;loglevel&quot;: &quot;%(levelname)s&quot;,\\n    &quot;process&quot;: &quot;%(process)s&quot;,\\n    &quot;filename&quot;: &quot;%(filename)s&quot;,\\n    &quot;funcName&quot;: &quot;%(funcName)s&quot;,\\n    &quot;logmessage&quot;: &quot;%(message)s&quot;,\\n}&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.BASE_URL",
            modulename: "nsedt.resources.constants",
            qualname: "BASE_URL",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;https://www.nseindia.com/&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.EQUITY_PRICE_HISTORY",
            modulename: "nsedt.resources.constants",
            qualname: "EQUITY_PRICE_HISTORY",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/historical/securityArchives?&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.EQUITY_CORPINFO",
            modulename: "nsedt.resources.constants",
            qualname: "EQUITY_CORPINFO",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/corporates-corporateActions?&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.MARKETSTATUS",
            modulename: "nsedt.resources.constants",
            qualname: "MARKETSTATUS",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/marketStatus&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.EQUITY_EVENT",
            modulename: "nsedt.resources.constants",
            qualname: "EQUITY_EVENT",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/event-calendar?&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.EQUITY_CHART",
            modulename: "nsedt.resources.constants",
            qualname: "EQUITY_CHART",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/chart-databyindex?&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.EQUITY_INFO",
            modulename: "nsedt.resources.constants",
            qualname: "EQUITY_INFO",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/quote-equity?&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.EQUITY_LIST",
            modulename: "nsedt.resources.constants",
            qualname: "EQUITY_LIST",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/market-data-pre-open?key=ALL&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.ASM_LIST",
            modulename: "nsedt.resources.constants",
            qualname: "ASM_LIST",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/reportASM&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.INDEX_PRICE_HISTORY",
            modulename: "nsedt.resources.constants",
            qualname: "INDEX_PRICE_HISTORY",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/historical/indicesHistory?&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.OPTIONS_PRICE_EQUITIES",
            modulename: "nsedt.resources.constants",
            qualname: "OPTIONS_PRICE_EQUITIES",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/option-chain-equities?&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.OPTIONS_PRICE_INDICES",
            modulename: "nsedt.resources.constants",
            qualname: "OPTIONS_PRICE_INDICES",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/option-chain-indices?&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.INDICES",
            modulename: "nsedt.resources.constants",
            qualname: "INDICES",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "[&#x27;NIFTY&#x27;, &#x27;FINNIFTY&#x27;, &#x27;BANKNIFTY&#x27;]",
        },
        {
            fullname: "nsedt.resources.constants.VIX_HISTORY",
            modulename: "nsedt.resources.constants",
            qualname: "VIX_HISTORY",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/historical/vixhistory?&#x27;",
        },
        {
            fullname: "nsedt.resources.constants.FNO_HISTORY",
            modulename: "nsedt.resources.constants",
            qualname: "FNO_HISTORY",
            kind: "variable",
            doc: "<p></p>\n",
            default_value: "&#x27;api/historical/foCPV?&#x27;",
        },
        { fullname: "nsedt.resources.index_symbol", modulename: "nsedt.resources.index_symbol", kind: "module", doc: "<p>NSE indices symbol map</p>\n" },
        {
            fullname: "nsedt.resources.index_symbol.symbol_map",
            modulename: "nsedt.resources.index_symbol",
            qualname: "symbol_map",
            kind: "variable",
            doc: "<p></p>\n",
            default_value:
                "[{&#x27;keys&#x27;: [&#x27;NIFTY 50&#x27;, &#x27;NIFTY50&#x27;, &#x27;NIFTY&#x27;], &#x27;indices&#x27;: &#x27;NIFTY 50&#x27;, &#x27;derivatives&#x27;: &#x27;NIFTY&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY BANK&#x27;, &#x27;NIFTYBANK&#x27;, &#x27;BANKNIFTY&#x27;], &#x27;derivatives&#x27;: &#x27;BANKNIFTY&#x27;, &#x27;indices&#x27;: &#x27;NIFTY BANK&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY FINANCIAL SERVICES&#x27;, &#x27;FINNIFTY&#x27;, &#x27;NIFTY FIN SERVICE&#x27;], &#x27;derivatives&#x27;: &#x27;FINNIFTY&#x27;, &#x27;indices&#x27;: &#x27;NIFTY FINANCIAL SERVICES&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY NEXT 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY NEXT 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP 100&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP 100&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP 150&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP 150&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SMALLCAP 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SMALLCAP 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SMALLCAP 100&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SMALLCAP 100&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SMALLCAP 250&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SMALLCAP 250&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDSMALLCAP 400&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDSMALLCAP 400&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY 100&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY 100&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY 200&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY 200&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY500 MULTICAP 50:25:25&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY500 MULTICAP 50:25:25&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY LARGEMIDCAP 250&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY LARGEMIDCAP 250&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP SELECT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP SELECT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY TOTAL MARKET&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY TOTAL MARKET&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MICROCAP 250&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MICROCAP 250&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY AUTO&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY AUTO&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY ENERGY&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY ENERGY&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY FINANCIAL SERVICES 25/50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY FINANCIAL SERVICES 25/50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY FMCG&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY FMCG&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY IT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY IT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MEDIA&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MEDIA&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY METAL&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY METAL&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PHARMA&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PHARMA&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PSU BANK&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PSU BANK&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY REALTY&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY REALTY&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PRIVATE BANK&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PRIVATE BANK&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY HEALTHCARE INDEX&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY HEALTHCARE INDEX&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY CONSUMER DURABLES&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY CONSUMER DURABLES&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY OIL &amp;amp; GAS&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY OIL &amp;amp; GAS&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY DIVIDEND OPPORTUNITIES 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY DIVIDEND OPPORTUNITIES 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY50 VALUE 20&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY50 VALUE 20&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 QUALITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 QUALITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY50 EQUAL WEIGHT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY50 EQUAL WEIGHT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 EQUAL WEIGHT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 EQUAL WEIGHT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 LOW VOLATILITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 LOW VOLATILITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY ALPHA 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY ALPHA 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY200 QUALITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY200 QUALITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY ALPHA LOW-VOLATILITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY ALPHA LOW-VOLATILITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY200 MOMENTUM 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY200 MOMENTUM 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP150 QUALITY 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP150 QUALITY 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY COMMODITIES&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY COMMODITIES&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INDIA CONSUMPTION&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INDIA CONSUMPTION&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY CPSE&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY CPSE&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INFRASTRUCTURE&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INFRASTRUCTURE&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MNC&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MNC&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY GROWTH SECTORS 15&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY GROWTH SECTORS 15&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PSE&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PSE&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SERVICES SECTOR&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SERVICES SECTOR&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 LIQUID 15&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 LIQUID 15&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP LIQUID 15&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP LIQUID 15&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INDIA DIGITAL&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INDIA DIGITAL&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 ESG&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 ESG&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INDIA MANUFACTURING&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INDIA MANUFACTURING&#x27;}]",
        },
        { fullname: "nsedt.resources.tmp", modulename: "nsedt.resources.tmp", kind: "module", doc: "<p></p>\n" },
        {
            fullname: "nsedt.resources.tmp.SYMBOL_MAP",
            modulename: "nsedt.resources.tmp",
            qualname: "SYMBOL_MAP",
            kind: "variable",
            doc: "<p></p>\n",
            default_value:
                "[{&#x27;keys&#x27;: [&#x27;NIFTY 50&#x27;, &#x27;NIFTY50&#x27;, &#x27;NIFTY&#x27;], &#x27;indices&#x27;: &#x27;NIFTY 50&#x27;, &#x27;derivatives&#x27;: &#x27;NIFTY&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY BANK&#x27;, &#x27;NIFTYBANK&#x27;, &#x27;BANKNIFTY&#x27;], &#x27;derivatives&#x27;: &#x27;BANKNIFTY&#x27;, &#x27;indices&#x27;: &#x27;NIFTY BANK&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY FINANCIAL SERVICES&#x27;, &#x27;FINNIFTY&#x27;, &#x27;NIFTY FIN SERVICE&#x27;], &#x27;derivatives&#x27;: &#x27;FINNIFTY&#x27;, &#x27;indices&#x27;: &#x27;NIFTY FINANCIAL SERVICES&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY NEXT 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY NEXT 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP 100&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP 100&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP 150&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP 150&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SMALLCAP 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SMALLCAP 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SMALLCAP 100&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SMALLCAP 100&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SMALLCAP 250&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SMALLCAP 250&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDSMALLCAP 400&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDSMALLCAP 400&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY 100&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY 100&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY 200&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY 200&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY500 MULTICAP 50:25:25&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY500 MULTICAP 50:25:25&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY LARGEMIDCAP 250&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY LARGEMIDCAP 250&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP SELECT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP SELECT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY TOTAL MARKET&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY TOTAL MARKET&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MICROCAP 250&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MICROCAP 250&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY AUTO&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY AUTO&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY ENERGY&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY ENERGY&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY FINANCIAL SERVICES 25/50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY FINANCIAL SERVICES 25/50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY FMCG&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY FMCG&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY IT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY IT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MEDIA&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MEDIA&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY METAL&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY METAL&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PHARMA&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PHARMA&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PSU BANK&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PSU BANK&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY REALTY&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY REALTY&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PRIVATE BANK&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PRIVATE BANK&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY HEALTHCARE INDEX&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY HEALTHCARE INDEX&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY CONSUMER DURABLES&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY CONSUMER DURABLES&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY OIL &amp;amp; GAS&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY OIL &amp;amp; GAS&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY DIVIDEND OPPORTUNITIES 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY DIVIDEND OPPORTUNITIES 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY50 VALUE 20&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY50 VALUE 20&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 QUALITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 QUALITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY50 EQUAL WEIGHT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY50 EQUAL WEIGHT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 EQUAL WEIGHT&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 EQUAL WEIGHT&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 LOW VOLATILITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 LOW VOLATILITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY ALPHA 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY ALPHA 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY200 QUALITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY200 QUALITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY ALPHA LOW-VOLATILITY 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY ALPHA LOW-VOLATILITY 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY200 MOMENTUM 30&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY200 MOMENTUM 30&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP150 QUALITY 50&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP150 QUALITY 50&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY COMMODITIES&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY COMMODITIES&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INDIA CONSUMPTION&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INDIA CONSUMPTION&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY CPSE&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY CPSE&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INFRASTRUCTURE&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INFRASTRUCTURE&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MNC&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MNC&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY GROWTH SECTORS 15&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY GROWTH SECTORS 15&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY PSE&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY PSE&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY SERVICES SECTOR&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY SERVICES SECTOR&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 LIQUID 15&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 LIQUID 15&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY MIDCAP LIQUID 15&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY MIDCAP LIQUID 15&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INDIA DIGITAL&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INDIA DIGITAL&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY100 ESG&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY100 ESG&#x27;}, {&#x27;keys&#x27;: [&#x27;NIFTY INDIA MANUFACTURING&#x27;], &#x27;derivatives&#x27;: &#x27;&#x27;, &#x27;indices&#x27;: &#x27;NIFTY INDIA MANUFACTURING&#x27;}]",
        },
        { fullname: "nsedt.utils", modulename: "nsedt.utils", kind: "module", doc: "<p>utils for nsedt</p>\n" },
        {
            fullname: "nsedt.utils.get_headers",
            modulename: "nsedt.utils",
            qualname: "get_headers",
            kind: "function",
            doc: "<p>Args:\n    ---</p>\n\n<p>Returns:</p>\n\n<pre><code>Json: json containing nse header\n</code></pre>\n",
            signature: '<span class="signature pdoc-code condensed">(<span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.utils.get_cookies",
            modulename: "nsedt.utils",
            qualname: "get_cookies",
            kind: "function",
            doc: "<p>Args:\n    ---</p>\n\n<p>Returns:</p>\n\n<pre><code>Json: json containing nse cookies\n</code></pre>\n",
            signature: '<span class="signature pdoc-code condensed">(<span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.utils.fetch_url",
            modulename: "nsedt.utils",
            qualname: "fetch_url",
            kind: "function",
            doc: "<p>Args:</p>\n\n<pre><code>url (str): URL to fetch\ncookies (str): NSE cookies\nkey (str, Optional):\n</code></pre>\n\n<p>Returns:</p>\n\n<pre><code>Pandas DataFrame: df containing url data\n</code></pre>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">url</span>, </span><span class="param"><span class="n">cookies</span>, </span><span class="param"><span class="n">key</span><span class="o">=</span><span class="kc">None</span>, </span><span class="param"><span class="n">response_type</span><span class="o">=</span><span class="s1">&#39;panda_df&#39;</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.utils.get_symbol",
            modulename: "nsedt.utils",
            qualname: "get_symbol",
            kind: "function",
            doc: "<p>_summary_</p>\n\n<p>Args:\n    symbol (str): _description_\n    get_key (str): _description_</p>\n\n<p>Returns:\n    str: _description_</p>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">symbol</span><span class="p">:</span> <span class="nb">str</span>, </span><span class="param"><span class="n">get_key</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="nb">str</span>:</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.utils.check_nd_convert",
            modulename: "nsedt.utils",
            qualname: "check_nd_convert",
            kind: "function",
            doc: '<p>The function <code>check_nd_convert</code> takes two date strings in the format "%d-%m-%Y" and converts them to\ndatetime objects if they are not already in that format.</p>\n\n<h6 id="parameters">Parameters</h6>\n\n<ul>\n<li><strong>start_date</strong>:  The <code>start_date</code> parameter is the starting date of a period, specified as a\nstring in the format "%d-%m-%Y"</li>\n<li><strong>end_date</strong>:  The <code>end_date</code> parameter is a string representing the end date in the format\n"%d-%m-%Y"</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>the start_date and end_date as datetime objects.</p>\n</blockquote>\n',
            signature:
                '<span class="signature pdoc-code multiline">(<span class="param">\t<span class="n">start_date</span><span class="p">:</span> <span class="nb">str</span>,</span><span class="param">\t<span class="n">end_date</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="o">&lt;</span><span class="n">module</span> <span class="s1">&#39;datetime&#39;</span> <span class="kn">from</span> <span class="s1">&#39;/opt/homebrew/Cellar/python@3.10/3.10.9/Frameworks/Python.framework/Versions/3.10/lib/python3.10/datetime.py&#39;</span><span class="o">&gt;</span>:</span></span>',
            funcdef: "def",
        },
        { fullname: "nsedt.utils.data_format", modulename: "nsedt.utils.data_format", kind: "module", doc: "<p>return data in specific format</p>\n" },
        {
            fullname: "nsedt.utils.data_format.price",
            modulename: "nsedt.utils.data_format",
            qualname: "price",
            kind: "function",
            doc: "<p>Args:\n    result (Pandas DataFrame): result</p>\n\n<p>Returns:\n    Pandas DataFrame: df containing data in specific format</p>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">result</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.utils.data_format.indices",
            modulename: "nsedt.utils.data_format",
            qualname: "indices",
            kind: "function",
            doc: "<p>Args:\n    data_json (json):  data in json format\nReturns:\n    Pandas DataFrame: df with indexCloseOnlineRecords and indexTurnoverRecords</p>\n",
            signature:
                '<span class="signature pdoc-code multiline">(<span class="param">\t<span class="n">data_json</span>,</span><span class="param">\t<span class="n">columns_drop_list</span><span class="p">:</span> <span class="nb">list</span> <span class="o">=</span> <span class="kc">None</span>,</span><span class="param">\t<span class="n">columns_rename_map</span><span class="p">:</span> <span class="nb">map</span> <span class="o">=</span> <span class="kc">None</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.utils.data_format.option_chain",
            modulename: "nsedt.utils.data_format",
            qualname: "option_chain",
            kind: "function",
            doc: "<p>_summary_</p>\n\n<p>Args:\n    data_json (str): _description_\n    response_type (str): _description_</p>\n\n<p>Returns:\n    _type_: _description_</p>\n",
            signature:
                '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">data_json</span><span class="p">:</span> <span class="nb">str</span>, </span><span class="param"><span class="n">response_type</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.utils.data_format.get_vix",
            modulename: "nsedt.utils.data_format",
            qualname: "get_vix",
            kind: "function",
            doc: '<p>Format Vix data\nArgs:\n    data_json (object): data in json format.\n    response_type (str, optional): response_type. Defaults to "panda_df".\n    columns_drop_list (list, optional): custom columns drop list. Defaults to None.\nReturns:\n    _type_: _description_</p>\n',
            signature:
                '<span class="signature pdoc-code multiline">(<span class="param">\t<span class="n">data_json</span><span class="p">:</span> <span class="nb">object</span>,</span><span class="param">\t<span class="n">response_type</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="s1">&#39;panda_df&#39;</span>,</span><span class="param">\t<span class="n">columns_drop_list</span><span class="p">:</span> <span class="nb">list</span> <span class="o">=</span> <span class="kc">None</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
        {
            fullname: "nsedt.utils.data_format.derivatives_futures",
            modulename: "nsedt.utils.data_format",
            qualname: "derivatives_futures",
            kind: "function",
            doc: '<p>Format futures data</p>\n\n<p>Args:\n    data_json (object): data in json format.\n    response_type (str, optional): response_type. Defaults to "panda_df".\n    columns_drop_list (list, optional): custom columns drop list. Defaults to None.</p>\n\n<p>Returns:\n        json: formate data in json\n    or\n        dataframe: formate data in panda df</p>\n',
            signature:
                '<span class="signature pdoc-code multiline">(<span class="param">\t<span class="n">data_json</span><span class="p">:</span> <span class="nb">str</span>,</span><span class="param">\t<span class="n">response_type</span><span class="p">:</span> <span class="nb">str</span> <span class="o">=</span> <span class="s1">&#39;panda_df&#39;</span>,</span><span class="param">\t<span class="n">columns_drop_list</span><span class="o">=</span><span class="kc">None</span></span><span class="return-annotation">):</span></span>',
            funcdef: "def",
        },
    ];

    // mirrored in build-search-index.js (part 1)
    // Also split on html tags. this is a cheap heuristic, but good enough.
    elasticlunr.tokenizer.setSeperator(/[\s\-.;&_'"=,()]+|<[^>]*>/);

    let searchIndex;
    if (docs._isPrebuiltIndex) {
        console.info("using precompiled search index");
        searchIndex = elasticlunr.Index.load(docs);
    } else {
        console.time("building search index");
        // mirrored in build-search-index.js (part 2)
        searchIndex = elasticlunr(function () {
            this.pipeline.remove(elasticlunr.stemmer);
            this.pipeline.remove(elasticlunr.stopWordFilter);
            this.addField("qualname");
            this.addField("fullname");
            this.addField("annotation");
            this.addField("default_value");
            this.addField("signature");
            this.addField("bases");
            this.addField("doc");
            this.setRef("fullname");
        });
        for (let doc of docs) {
            searchIndex.addDoc(doc);
        }
        console.timeEnd("building search index");
    }

    return (term) =>
        searchIndex.search(term, {
            fields: {
                qualname: { boost: 4 },
                fullname: { boost: 2 },
                annotation: { boost: 2 },
                default_value: { boost: 2 },
                signature: { boost: 2 },
                bases: { boost: 2 },
                doc: { boost: 1 },
            },
            expand: true,
        });
})();
