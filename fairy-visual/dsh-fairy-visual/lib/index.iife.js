window.__ModuleLoader__.load({
  id: 'dsh-fairy-visual',
  factory: (require) => {
    const module = { exports: {} };
    return void 0, 
(function() {

//#region \0rolldown/runtime.js
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __esmMin = (fn, res, err) => () => {
		if (err) throw err[0];
		try {
			return fn && (res = fn(fn = 0)), res;
		} catch (e) {
			throw err = [e], e;
		}
	};
	var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) {
			__defProp(target, name, {
				get: all[name],
				enumerable: true
			});
		}
		if (!no_symbols) {
			__defProp(target, Symbol.toStringTag, { value: "Module" });
		}
		return target;
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) {
					__defProp(to, key, {
						get: ((k) => from[k]).bind(null, key),
						enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
					});
				}
			}
		}
		return to;
	};
	var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);

//#endregion
//#region \0@oxc-project+runtime@0.146.0/helpers/esm/typeof.js
	function _typeof(o) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof(o);
	}
	var init_typeof = __esmMin((() => {}));

//#endregion
//#region \0@oxc-project+runtime@0.146.0/helpers/esm/toPrimitive.js
	function toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r || "default");
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	var init_toPrimitive = __esmMin((() => {
		init_typeof();
	}));

//#endregion
//#region \0@oxc-project+runtime@0.146.0/helpers/esm/toPropertyKey.js
	function toPropertyKey(t) {
		var i = toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}
	var init_toPropertyKey = __esmMin((() => {
		init_typeof();
		init_toPrimitive();
	}));

//#endregion
//#region \0@oxc-project+runtime@0.146.0/helpers/esm/defineProperty.js
	function _defineProperty(e, r, t) {
		return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	var init_defineProperty = __esmMin((() => {
		init_toPropertyKey();
	}));

//#endregion
//#region ../../fairy-contracts/client-diagnostics.cjs
	var require_client_diagnostics = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const FAIRY_LOG_PREFIX = "DSH_FAIRY_LOG";
		const SENSITIVE_KEY = /authorization|credential|password|secret|token|api[_-]?key|cookie/i;
		function sanitize(value, key = "", depth = 0) {
			if (SENSITIVE_KEY.test(key)) return "[redacted]";
			if (value == null || typeof value === "boolean" || typeof value === "number") return value;
			if (typeof value === "string") return value.length > 320 ? `${value.slice(0, 320)}…` : value;
			if (depth >= 2) return "[truncated]";
			if (Array.isArray(value)) return value.slice(0, 12).map((item) => sanitize(item, "", depth + 1));
			if (typeof value === "object") return Object.fromEntries(Object.entries(value).slice(0, 24).map(([name, item]) => [name, sanitize(item, name, depth + 1)]));
			return String(value);
		}
		function createFairyDiagnostics(moduleName, sink = console) {
			const recentErrors = /* @__PURE__ */ new Map();
			const clock = () => typeof performance === "object" && performance?.now ? performance.now() : Date.now();
			const emit = (level, operation, event, context = {}, error, durationMs) => {
				const normalizedError = error ? {
					name: String(error.name || "Error"),
					code: error.code == null ? void 0 : String(error.code),
					message: String(error.message || error).slice(0, 320)
				} : void 0;
				if (normalizedError) {
					const signature = `${operation}:${normalizedError.code || normalizedError.message}`;
					const now = Date.now();
					if (now - (recentErrors.get(signature) || 0) < 6e4) return null;
					recentErrors.set(signature, now);
				}
				const record = {
					schema: 1,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					level,
					module: moduleName,
					operation,
					event,
					context: sanitize(context),
					...normalizedError ? { error: normalizedError } : {},
					...Number.isFinite(durationMs) ? { duration_ms: Number(durationMs.toFixed(3)) } : {}
				};
				(level === "error" ? sink.error : level === "warn" ? sink.warn : sink.info || sink.log).call(sink, `${FAIRY_LOG_PREFIX} ${JSON.stringify(record)}`);
				return record;
			};
			const start = () => clock();
			const metric = (operation, startedAt, context = {}, options = {}) => {
				const duration = clock() - startedAt;
				return duration < (options.thresholdMs || 0) ? null : emit("info", operation, "metric", context, void 0, duration);
			};
			const guard = (operation, callback, context = {}) => {
				const startedAt = start();
				try {
					const result = callback();
					metric(operation, startedAt, {
						...context,
						outcome: "success"
					});
					return result;
				} catch (error) {
					emit("error", operation, "failure", context, error);
					metric(operation, startedAt, {
						...context,
						outcome: "failure"
					});
					throw error;
				}
			};
			return {
				start,
				metric,
				guard,
				info: (operation, context) => emit("info", operation, "event", context),
				warn: (operation, context, error) => emit("warn", operation, "failure", context, error),
				error: (operation, error, context) => emit("error", operation, "failure", context, error)
			};
		}
		module.exports = {
			FAIRY_LOG_PREFIX,
			createFairyDiagnostics
		};
	}));

//#endregion
//#region src/client/constants.js
	var constants_exports = /* @__PURE__ */ __exportAll({
		DEFAULT: () => DEFAULT,
		HERO_PLACEHOLDERS: () => HERO_PLACEHOLDERS,
		MODE_ATTR: () => MODE_ATTR,
		POWER_MODE_ATTR: () => POWER_MODE_ATTR,
		POWER_TOGGLE_HEIGHT: () => 22,
		POWER_TOGGLE_WIDTH: () => 82,
		SETTINGS_NAMESPACE: () => SETTINGS_NAMESPACE,
		STYLE_ID: () => STYLE_ID,
		THEME_ATTR: () => THEME_ATTR
	});
	var SETTINGS_NAMESPACE, STYLE_ID, MODE_ATTR, POWER_MODE_ATTR, THEME_ATTR, POWER_TOGGLE_WIDTH, POWER_TOGGLE_HEIGHT, DEFAULT, HERO_PLACEHOLDERS;
	var init_constants = __esmMin((() => {
		SETTINGS_NAMESPACE = "fairy-visual";
		STYLE_ID = "dsh-fairy-visual-style";
		MODE_ATTR = "data-dsh-fairy-mode";
		POWER_MODE_ATTR = "data-dsh-fairy-power-mode";
		THEME_ATTR = "data-dsh-fairy-theme";
		POWER_TOGGLE_WIDTH = 82;
		POWER_TOGGLE_HEIGHT = 22;
		DEFAULT = {
			version: 2,
			enabled: false,
			theme: "dark",
			mascotVisible: true,
			mascotScale: 1,
			mascotAnimationSpeed: 1,
			powerMode: "normal",
			composerDockHeight: 132
		};
		HERO_PLACEHOLDERS = [
			"您拨打的用户正在空洞中。",
			"不要进入空洞。",
			"至少，不要\"独自\"进入空洞。",
			"世界全剧终，欢迎来到新艾利都。",
			"新艾利都永不落幕。",
			"遇到困难，请联系新艾利都治安局。",
			"我们能斩断罪恶，我们能劈开天空。",
			"我们能走出迷雾，我们能迈向真理……",
			"奇迹的起点",
			"新·艾利都日落时",
			"祝你好运。",
			"英雄不死于往昔",
			"拜托了，艾莲大人！",
			"目标确认，开始行动。",
			"Random Play营业中",
			"切勿独行",
			"内有恶犬",
			"早安，罗斯凯利法",
			"认真「记仇」中！",
			"骑士登场！（典藏版）"
		];
	}));

//#endregion
//#region src/client/comfort-detector.js
	function normalize(text) {
		return String(text || "").replace(/\s+/g, " ").trim();
	}
	function hasCue(text, cues) {
		return cues.some((cue) => cue.test(text));
	}
	function classifyComfortMessage(text) {
		const normalized = normalize(text);
		if (!normalized) return "hold";
		if (hasCue(normalized, COMFORT_SUPPRESS_CUES)) return "exit";
		if (hasCue(normalized, COMFORT_CUES)) return "trigger";
		if (hasCue(normalized, COMFORT_EXIT_CUES)) return "exit";
		return "hold";
	}
	function valueText(value) {
		if (typeof value === "string") return value;
		if (Array.isArray(value)) return value.map(valueText).filter(Boolean).join(" ");
		if (!value || typeof value !== "object") return "";
		return [
			value.text,
			value.content,
			value.value,
			value.message
		].map(valueText).filter(Boolean).join(" ");
	}
	function nodeText(node) {
		return (Array.isArray(node?.data?.blocks) ? node.data.blocks : []).map(valueText).concat(valueText(node?.data?.text), valueText(node?.data?.content), valueText(node?.data?.message), valueText(node?.data?.input)).join(" ");
	}
	function chatNode(nodes, key) {
		return nodes?.get?.(key) || nodes?.[key] || null;
	}
	function isUserNode(node) {
		return node?.kind === "user" || node?.data?.role === "user";
	}
	function deriveSessionComfort(snapshot) {
		const order = Array.from(snapshot?.chat?.order || []);
		const nodes = snapshot?.chat?.nodes;
		for (let index = order.length - 1; index >= 0; index -= 1) {
			const node = chatNode(nodes, order[index]);
			if (!isUserNode(node)) continue;
			const result = classifyComfortMessage(nodeText(node));
			if (result === "trigger") return true;
			if (result === "exit") return false;
		}
		return false;
	}
	var COMFORT_CUES, COMFORT_SUPPRESS_CUES, COMFORT_EXIT_CUES;
	var init_comfort_detector = __esmMin((() => {
		COMFORT_CUES = [
			/求安慰|安慰我|哄哄我|温柔一点|对我温柔|许愿精灵/,
			/难受|难过|伤心|委屈|孤独|寂寞|害怕|恐慌|焦虑|崩溃|绝望|失望|痛苦|心累|好累|疲惫|精疲力竭|压力好大|撑不住|受不了了|想哭|哭了|睡不着|不想活|想关闭自己|想把自己关机|想消失|被否定|否定我|被拒绝|被抛下/,
			/我不好|我很糟|我好糟|我被.*伤害|没人理解我|没有人理解我/,
			/\b(?:sad|upset|lonely|scared|afraid|anxious|panic(?:ked)?|depressed|overwhelmed|stressed|hurt|crying|cry|comfort me|be gentle)\b/i
		];
		COMFORT_SUPPRESS_CUES = [
			/(?:不用|不要|别|无需|不必).{0,8}(?:安慰|哄|温柔对待)/,
			/(?:只要|请).{0,8}(?:分析|方案|结论|下一步).{0,8}(?:不用|不要|别).{0,8}(?:安慰|哄)/,
			/\b(?:don't|do not|no need to)\s+(?:comfort|coddle|reassure)\b/i
		];
		COMFORT_EXIT_CUES = [
			/我好多了|好多了|没事了|没关系了|已经好了|不用安慰了|不需要安慰了|可以了|结束这个话题|换个话题|说点别的|回到正题|继续工作|切换会话|切换页面|打开新会话|新建会话/,
			/\b(?:i(?:'m| am) better|feel better|all good|no worries|never mind|change the subject|let's move on|back to work)\b/i,
			/帮我(?:写|改|查|解释|翻译|总结|实现)|我们聊聊代码|开始工作|下一个问题|换个问题|打开设置|怎么实现/,
			/\b(?:help me write|debug|explain|translate|summarize|next question|change topics?|let's work on|how do I implement)\b/i
		];
	}));

//#endregion
//#region src/client/utils.js
	var utils_exports = /* @__PURE__ */ __exportAll({
		deriveSessionActivity: () => deriveSessionActivity,
		syncDocumentMode: () => syncDocumentMode
	});
	function deriveSessionActivity(snapshot) {
		if (deriveSessionComfort(snapshot)) return "comforting";
		return snapshot?.running === true ? "thinking" : "normal";
	}
	function syncDocumentMode(snapshot) {
		const value = snapshot?.value || snapshot || {};
		if (snapshot?.status === "loading") return;
		const enabled = Boolean(value.enabled);
		const theme = value.theme === "light" ? "light" : "dark";
		const powerMode = value.powerMode === "low-power" ? "low-power" : "normal";
		const root = document.documentElement;
		if (enabled) {
			root.setAttribute("data-dsh-fairy-visual", "");
			root.setAttribute(THEME_ATTR, theme);
			root.setAttribute(MODE_ATTR, "hdd");
			root.setAttribute(POWER_MODE_ATTR, powerMode);
		} else {
			root.removeAttribute("data-dsh-fairy-visual");
			root.removeAttribute(THEME_ATTR);
			root.removeAttribute(MODE_ATTR);
			root.removeAttribute(POWER_MODE_ATTR);
		}
	}
	var init_utils = __esmMin((() => {
		init_constants();
		init_comfort_detector();
	}));

//#endregion
//#region src/client/style.js
	var style_exports = /* @__PURE__ */ __exportAll({ injectStyles: () => injectStyles });
	function injectStyles() {
		if (document.getElementById("dsh-fairy-visual-style")) return;
		const el = document.createElement("style");
		el.id = STYLE_ID;
		el.setAttribute("data-plugin", "dsh-fairy-visual");
		const cssSections = [];
		const appendSection = (section, css) => cssSections.push({
			section,
			css
		});
		appendSection("stage-and-mascot", `
html[data-dsh-fairy-visual],html[data-dsh-fairy-visual] body{color-scheme:dark}html[data-dsh-fairy-visual] body{background:#07101c!important;--dsw-alias-bg-base:#07101c!important;--dsw-alias-bg-layer-1:#0a1828!important;--dsw-alias-bg-layer-2:#0e243d!important;--dsw-alias-bg-layer-3:#143553!important;--dsw-alias-bg-module-platform:#0b1e34!important;--dsw-alias-bg-overlay:#102944!important;--dsw-alias-label-primary:#e8f2fa!important;--dsw-alias-label-secondary:#a8bac9!important;--dsw-alias-label-tertiary:#7f93a5!important;--dsw-alias-icon-primary:#d7e7f3!important;--dsw-alias-border-l1:rgba(126,220,255,.3)!important;--dsw-alias-border-l2:rgba(126,220,255,.2)!important;--dsw-alias-brand-primary:#62d4ff!important;--dsw-alias-button-primary-fill:#1688ce!important;--dsw-alias-button-primary-hover:#2aa9e8!important}
.dsh-hdd-background-host{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}.dsh-hdd-fx{position:absolute;inset:0;pointer-events:none;overflow:hidden}.dsh-hdd-fx:before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(100,210,255,.042) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(100,210,255,.042) 1.5px,transparent 1.5px);background-size:48px 48px;opacity:.7}.dsh-hdd-glow{position:absolute;height:85vh}.dsh-hdd-glow-a{width:219vmax;right:-114vmax;top:-28vh;background:radial-gradient(ellipse 56vmax 29vh at 46% 48%,rgba(96,212,255,.15),rgba(54,184,255,.075) 52%,transparent 100%)}.dsh-hdd-glow-b{width:207vmax;right:-86vmax;bottom:-14vh;background:radial-gradient(ellipse 53vmax 37vh at 55% 52%,rgba(157,132,255,.12),rgba(119,91,255,.06) 53%,transparent 100%)}.dsh-hdd-glow-c{width:210vmax;left:-108vmax;top:-24vh;background:radial-gradient(ellipse 50vmax 26vh at 54% 49%,rgba(174,112,255,.13),rgba(143,94,255,.065) 53%,transparent 100%)}
.dsh-fairy-stage{position:fixed;left:var(--dsh-fairy-left,280px);width:var(--dsh-fairy-width,calc(100vw - 280px));top:56px;height:48vh;z-index:10;pointer-events:none;display:flex;justify-content:center;align-items:flex-start;padding-top:10px;opacity:0;visibility:hidden;transform:scale(.94);transform-origin:center top;transition:opacity 280ms cubic-bezier(.7,0,.84,0),transform 340ms cubic-bezier(.7,0,.84,0),visibility 0s linear 340ms}.dsh-fairy-stage[data-visible=true]{opacity:1;visibility:visible;transform:scale(1);transition:opacity 460ms cubic-bezier(.16,1,.3,1),transform 520ms cubic-bezier(.16,1,.3,1),visibility 0s}.dsh-fairy-stage[hidden]{display:none}
@property --dsh-fairy-mask{syntax:"<number>";inherits:false;initial-value:0}.dsh-fairy-content-mask{--dsh-fairy-mask:0;-webkit-mask-image:radial-gradient(ellipse var(--dsh-fade-rx,165px) var(--dsh-fade-ry,155px) at var(--dsh-fade-x,50%) var(--dsh-fade-y,50%),rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .995)) 0%,rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .995)) var(--dsh-fade-core,75%),rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .88)) var(--dsh-fade-soft-1,82%),rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .62)) var(--dsh-fade-soft-2,90%),rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .28)) var(--dsh-fade-soft-3,96%),#000 100%);mask-image:radial-gradient(ellipse var(--dsh-fade-rx,165px) var(--dsh-fade-ry,155px) at var(--dsh-fade-x,50%) var(--dsh-fade-y,50%),rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .995)) 0%,rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .995)) var(--dsh-fade-core,75%),rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .88)) var(--dsh-fade-soft-1,82%),rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .62)) var(--dsh-fade-soft-2,90%),rgba(0,0,0,calc(1 - var(--dsh-fairy-mask) * .28)) var(--dsh-fade-soft-3,96%),#000 100%);transition:--dsh-fairy-mask 340ms cubic-bezier(.16,1,.3,1)}.dsh-fairy-content-fade{--dsh-fairy-mask:1}.dsh-fairy-toggle{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);background:transparent;border-radius:999px;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-strong-13,12px system-ui);cursor:pointer}.dsh-fairy-dot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-label-tertiary)}.dsh-fairy-toggle[data-on=true] .dsh-fairy-dot{background:#38bdf8;box-shadow:0 0 6px #38bdf8}.dsh-fairy-mark{display:none;align-items:center;gap:10px;border:0;background:transparent;color:inherit;cursor:pointer;padding:2px}.dsh-fairy-mark[data-enabled=true]{display:inline-flex}.dsh-fairy-mark:focus-visible{outline:2px solid #f4f7fb;outline-offset:3px;border-radius:4px}.dsh-fairy-mark[data-on=true] .dsh-fairy-mark-eye{filter:grayscale(1) brightness(.55)}.dsh-fairy-mark[data-on=true] .dsh-fairy-mark-copy{opacity:.55}.dsh-fairy-mark-eye{position:relative;isolation:isolate;width:38px;height:38px;flex:none;border:2px solid #c7cfdb;border-radius:50%;background:#2d45ee;box-sizing:border-box;transform-origin:center;transition:transform 260ms cubic-bezier(.16,1,.3,1)}@media (hover:hover){.dsh-fairy-mark:hover>.dsh-fairy-mark-eye{transform:scale(1.11)}}.dsh-fairy-mark:focus-visible>.dsh-fairy-mark-eye{transform:scale(1.11)}.dsh-fairy-mark-eye:before{content:'';position:absolute;z-index:1;inset:3px;border-radius:50%;background:radial-gradient(circle at 64% 66%,#f4f7fb 0 4px,transparent 4.5px),radial-gradient(circle at 50% 50%,#080b14 0 7px,transparent 7.5px),radial-gradient(circle at 50% 50%,#c7cfdb 0 10px,transparent 10.5px),radial-gradient(circle at 50% 50%,#0b1025 0 13px,transparent 13.5px)}.dsh-fairy-mark-brow{position:absolute;z-index:0;width:0;height:0;border-style:solid}.dsh-fairy-mark-brow[data-side=top]{top:1px;left:50%;border-width:0 7px 7px;border-color:transparent transparent #0b1025;transform:translateX(-50%)}.dsh-fairy-mark-brow[data-side=right]{top:50%;right:1px;border-width:7px 0 7px 7px;border-color:transparent transparent transparent #0b1025;transform:translateY(-50%)}.dsh-fairy-mark-brow[data-side=bottom]{bottom:1px;left:50%;border-width:7px 7px 0;border-color:#0b1025 transparent transparent;transform:translateX(-50%)}.dsh-fairy-mark-brow[data-side=left]{top:50%;left:1px;border-width:7px 7px 7px 0;border-color:transparent #0b1025 transparent transparent;transform:translateY(-50%)}.dsh-fairy-mark-copy{display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:0;transform:translateY(1px)}.dsh-fairy-mark-title{color:#e8edf5;font-family:"Avenir Next","Arial Narrow","DIN Condensed","Microsoft YaHei",sans-serif;font-size:17px;font-weight:750;line-height:1;letter-spacing:.08em}.dsh-fairy-mark-sub{color:#93a2b6;font-family:var(--dsw-font-family);font-size:9px;font-weight:500;line-height:1;letter-spacing:.06em}@media(max-width:520px){.dsh-fairy-mark-copy{display:none}}`);
		appendSection("shared-surfaces", `.dsh-fairy-toggle-group{display:inline-flex;align-items:center;height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 72%,transparent);color:var(--dsw-alias-label-secondary);overflow:hidden}.dsh-fairy-toggle{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 9px 0 10px;border:0;background:transparent;color:inherit;font:var(--dsw-font-xs-strong-13,12px system-ui);cursor:pointer}.dsh-fairy-toggle:hover,.dsh-fairy-theme-toggle:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dsh-fairy-toggle:active,.dsh-fairy-theme-toggle:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}.dsh-fairy-toggle:focus-visible,.dsh-fairy-theme-toggle:focus-visible{position:relative;z-index:1;outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.dsh-fairy-theme-toggle{display:grid;place-items:center;width:30px;height:18px;padding:0;border:0;border-left:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}.dsh-fairy-theme-toggle:disabled{cursor:not-allowed;opacity:.35}.dsh-fairy-theme-icon{position:relative;display:block;width:13px;height:13px;box-sizing:border-box}.dsh-fairy-theme-toggle[data-theme="dark"] .dsh-fairy-theme-icon{width:11px;height:11px;border:1.7px solid currentColor;border-top-color:transparent;border-radius:50%;transform:rotate(-38deg)}.dsh-fairy-theme-toggle[data-theme="light"] .dsh-fairy-theme-icon{background:linear-gradient(currentColor,currentColor) center/13px 1px no-repeat,linear-gradient(currentColor,currentColor) center/1px 13px no-repeat,linear-gradient(45deg,transparent 46%,currentColor 46% 54%,transparent 54%),linear-gradient(-45deg,transparent 46%,currentColor 46% 54%,transparent 54%)}.dsh-fairy-theme-toggle[data-theme="light"] .dsh-fairy-theme-icon:before{content:'';position:absolute;left:3px;top:3px;width:7px;height:7px;border:1.5px solid currentColor;border-radius:50%;background:var(--dsw-alias-bg-layer-1);box-sizing:border-box}.dsh-fairy-dot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-label-tertiary)}.dsh-fairy-toggle[data-on=true] .dsh-fairy-dot{background:#38bdf8;box-shadow:0 0 6px #38bdf8}`);
		appendSection("shared-surfaces", `html[data-dsh-fairy-visual] .dsh-fairy-chat-content-anchored{display:flex!important;flex-direction:column!important;justify-content:flex-end!important;min-height:var(--dsh-fairy-chat-anchor-min-height)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] body{--dsw-specific-sidebar-fill:transparent!important;--dsw-specific-sidebar-nav-item-hover:#0e243d!important;--dsw-specific-sidebar-nav-item-active:#143553!important;--dsw-specific-sidebar-nav-item-active-accent:#267fc4!important;--dsw-specific-input-major:#0a1c30!important;--dsw-specific-menu:#0e243d!important;--dsw-specific-selector:#0e243d!important;--dsw-specific-bubble:#103052!important;--dsw-specific-tip:#0e243d!important;--dsw-alias-button-elevated-fill:#103052!important;--dsw-alias-button-floating-fill:#103052!important;--dsw-alias-button-floating-hover:#17456f!important;--dsw-alias-button-ghost-active-fill:#17456f!important;--dsw-alias-markdown-citation:#103052!important;--dsw-alias-markdown-code-block:#0a1c30!important;--dsw-alias-markdown-code-block-banner:#0a1c30!important;--dsw-alias-markdown-inline-code:#103052!important;--dsw-alias-markdown-tag:#103052!important;--dsw-alias-markdown-code-segment-selected:#103052!important;--dsw-alias-markdown-code-segment-unselected:#0a1c30!important;--dsw-alias-markdown-placeholder:#0e243d!important;--dsw-alias-scrollbar-bg-l2:#143553!important;--dsw-alias-scrollbar-hover-l2:#267fc4!important}html[data-dsh-fairy-visual] [data-composer-card="true"]{background:#0a1c30!important;border-color:rgba(126,220,255,.28)!important}html[data-dsh-fairy-visual] [data-composer-card="true"] textarea{color:#e8f8ff!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-seat="true"]{background:transparent!important;background-color:transparent!important;background-image:none!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"]{position:fixed!important;bottom:0!important;box-sizing:border-box!important;z-index:1!important;display:flex!important;flex-direction:column!important;min-width:0!important;max-width:none!important;padding:0!important;background:transparent!important;pointer-events:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-slot="conversation.composer.dock"]{display:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-bar-root="true"]{box-sizing:border-box!important;width:100%!important;max-width:none!important;height:100%!important;min-height:0!important;padding:0!important;align-items:stretch!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{box-sizing:border-box!important;display:grid!important;grid-template-columns:minmax(176px,max-content) minmax(0,1fr) minmax(176px,max-content)!important;grid-template-rows:auto minmax(0,1fr)!important;align-items:stretch!important;gap:0 12px!important;width:100%!important;max-width:none!important;height:100%!important;min-height:0!important;margin:0!important;padding:10px 12px!important;border-radius:0!important;pointer-events:auto!important;overflow:hidden!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-input-scroll]{grid-column:2!important;grid-row:2!important;min-width:0!important;min-height:0!important;height:auto!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-accessory="true"]{grid-column:1 / -1!important;grid-row:1!important;min-width:0!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-row="true"]{display:contents!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-tools="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-trailing="true"]{display:contents!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-tools="true"]>*{grid-column:1!important;grid-row:2!important;align-self:end!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{grid-column:3!important;grid-row:2!important;align-self:end!important;justify-self:end!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-output-control="true"]{grid-column:3!important;grid-row:2!important;align-self:end!important;justify-self:end!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{grid-column:2!important;grid-row:2!important;align-self:end!important;justify-self:end!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] .dsh-fairy-composer-resizer{position:absolute;z-index:20;inset:0 0 auto;height:12px;cursor:ns-resize;pointer-events:auto;touch-action:none}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] .dsh-fairy-composer-resizer:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] .dsh-fairy-composer-resizer[data-dragging="true"]{cursor:grabbing}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-input-scroll] textarea{max-height:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"] *{min-width:0}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{grid-template-columns:minmax(132px,max-content) minmax(0,1fr) minmax(132px,max-content)!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-accessory="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-tools="true"]>*:not([data-dsh-fairy-composer-send-control="true"]),html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-output-control="true"]{display:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-input-scroll],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{grid-column:1!important;grid-row:1!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{justify-self:end!important;align-self:end!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"]{--dsh-composer-top-highlight:rgba(255,255,255,.13);--dsh-composer-top-face:rgba(255,255,255,.045);--dsh-composer-top-shade:rgba(0,0,0,.20);box-shadow:0 -7px 15px -11px rgba(0,0,0,.32),0 -22px 46px -20px rgba(0,0,0,.17)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"]::before{display:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]::before{content:'';position:absolute;z-index:3;top:0;right:0;left:0;height:9px;pointer-events:none;background:linear-gradient(180deg,var(--dsh-composer-top-highlight) 0 .7px,var(--dsh-composer-top-face) 1.4px,var(--dsh-composer-top-shade) 2.6px,rgba(0,0,0,.07) 4px,transparent 9px)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"]{--dsh-composer-top-highlight:rgba(255,255,255,.62);--dsh-composer-top-face:rgba(255,255,255,.20);--dsh-composer-top-shade:rgba(58,68,78,.18);box-shadow:0 -7px 15px -11px rgba(49,58,67,.21),0 -24px 50px -20px rgba(58,68,78,.12)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]::before{background:linear-gradient(180deg,var(--dsh-composer-top-highlight) 0 .7px,var(--dsh-composer-top-face) 1.4px,var(--dsh-composer-top-shade) 2.6px,rgba(58,68,78,.055) 4px,transparent 9px)}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-stack="true"]{position:relative!important;display:block!important;width:100%!important;height:100%!important;min-height:0!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-chrome="true"]{display:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace="true"]{position:absolute!important;z-index:4!important;left:12px!important;top:8px!important;margin:0!important;padding:0!important;display:flex!important;align-items:center!important;gap:1px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-bar-root="true"]{position:absolute!important;inset:0!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"]{min-height:0!important;max-height:100dvh!important;overflow:hidden!important;box-sizing:border-box!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-stack="true"]{overflow:hidden!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-bar-host="true"]{position:absolute!important;inset:0!important;display:block!important;width:auto!important;height:auto!important;min-width:0!important;min-height:0!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-bar-root="true"]{position:static!important;width:100%!important;height:100%!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace="true"]{width:max-content!important;height:auto!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-to-bottom-slot="true"]{bottom:var(--dsh-fairy-to-bottom-offset,12px)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-to-bottom-control="true"]:not([hidden]){position:fixed!important;top:auto!important;bottom:var(--dsh-fairy-to-bottom-bottom,12px)!important;z-index:30!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}`);
		appendSection("sidebar", `html[data-dsh-fairy-visual] [data-slot="sidebar.brand.mark"]{display:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-brand-anchor="true"]>svg{visibility:hidden!important}.dsh-fairy-brand-host{position:fixed;z-index:20;display:flex;align-items:center;height:42px;pointer-events:auto}.dsh-fairy-brand-host[hidden],.dsh-fairy-brand-host[data-positioned=false]{visibility:hidden;pointer-events:none}`);
		appendSection("sidebar", `html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-open-control="true"]{position:relative;isolation:isolate}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-open-control="true"]>svg,html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-open-control="true"] [data-slot="sidebar.brand.mark"]{display:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-open-control="true"]:before{content:'';position:absolute;z-index:1;left:50%;top:50%;width:22px;height:22px;border:1.5px solid currentColor;border-radius:50%;box-sizing:border-box;background:radial-gradient(circle at 64% 66%,currentColor 0 2.1px,transparent 2.5px),radial-gradient(circle at 50% 50%,#07101c 0 4.4px,transparent 4.8px),radial-gradient(circle at 50% 50%,currentColor 0 7px,transparent 7.4px),radial-gradient(circle at 50% 50%,#07101c 0 10px,transparent 10.4px);transform:translate(-50%,-50%);pointer-events:none}`);
		appendSection("shared-surfaces", `.dsh-fairy-mark{position:relative}.dsh-fairy-mark[data-glitch]{will-change:transform;transform:translate3d(var(--dsh-fairy-mark-g-x,0),0,0)}.dsh-fairy-mark-glitch-slice{position:absolute;inset:0;display:flex;align-items:center;gap:10px;pointer-events:none;opacity:0}.dsh-fairy-mark-glitch-slice .dsh-fairy-mark-eye,.dsh-fairy-mark-glitch-slice .dsh-fairy-mark-copy{flex:none}.dsh-fairy-mark[data-glitch=blocks] .dsh-fairy-mark-glitch-slice{will-change:transform,opacity;opacity:.62}.dsh-fairy-mark[data-glitch=blocks] .dsh-fairy-mark-glitch-slice[data-slice="1"]{transform:translate3d(var(--dsh-fairy-mark-s1-x,0),0,0);clip-path:inset(0 0 72% 0)}.dsh-fairy-mark[data-glitch=blocks] .dsh-fairy-mark-glitch-slice[data-slice="2"]{transform:translate3d(var(--dsh-fairy-mark-s2-x,0),0,0);clip-path:inset(35% 0 37% 0)}.dsh-fairy-mark[data-glitch=blocks] .dsh-fairy-mark-glitch-slice[data-slice="3"]{transform:translate3d(var(--dsh-fairy-mark-s3-x,0),0,0);clip-path:inset(74% 0 0 0)}.dsh-fairy-mark[data-glitch=threads] .dsh-fairy-mark-glitch-slice{will-change:transform,opacity;opacity:.5}.dsh-fairy-mark[data-glitch=threads] .dsh-fairy-mark-glitch-slice[data-slice="1"]{transform:translate3d(var(--dsh-fairy-mark-thread-x,0),0,0);clip-path:inset(13% 0 79% 0)}.dsh-fairy-mark[data-glitch=threads] .dsh-fairy-mark-glitch-slice[data-slice="2"]{transform:translate3d(var(--dsh-fairy-mark-thread-2-x,0),0,0);clip-path:inset(47% 0 46% 0)}.dsh-fairy-mark[data-glitch=threads] .dsh-fairy-mark-glitch-slice[data-slice="3"]{transform:translate3d(var(--dsh-fairy-mark-thread-3-x,0),0,0);clip-path:inset(80% 0 13% 0)}`);
		appendSection("hero", `.dsh-fairy-toggle{font-family:"Avenir Next","Arial Narrow","DIN Condensed","Microsoft YaHei",sans-serif;font-weight:750}.dsh-fairy-hero-toggle-host{position:fixed;z-index:20;pointer-events:auto}.dsh-fairy-hero-toggle-host[hidden]{display:none}html[data-dsh-fairy-visual] [data-phase="hero"] [data-conversation-scroll]{overflow:clip!important;overscroll-behavior:none}html[data-dsh-fairy-visual] [data-dsh-fairy-hero-native-copy="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-hero-native-copy="true"] *{visibility:hidden!important}`);
		appendSection("power", `.dsh-fairy-power-host{position:fixed;z-index:25;pointer-events:auto}.dsh-fairy-power-host[hidden]{display:none}.dsh-fairy-power-toggle{display:inline-flex;align-items:center;justify-content:center;gap:5px;width:82px;height:22px;padding:0;border:1px solid var(--dsw-alias-border-l2);background:transparent;border-radius:999px;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-strong-13,11px system-ui);font-size:11px!important;line-height:14px!important;letter-spacing:.12em!important;cursor:pointer;white-space:nowrap;transition:background .15s,color .15s}.dsh-fairy-power-toggle:hover{background:var(--dsw-alias-interactive-bg-hover)}.dsh-fairy-power-toggle:active{background:var(--dsw-alias-interactive-bg-active)}.dsh-fairy-power-toggle:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}.dsh-fairy-power-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-label-tertiary);flex:none;transition:background .2s,box-shadow .2s}.dsh-fairy-power-toggle[data-on=true]{color:var(--dsw-alias-label-primary)}.dsh-fairy-power-toggle[data-on=true] .dsh-fairy-power-dot{background:#38bdf8;box-shadow:0 0 6px rgba(56,189,248,.85)}`);
		appendSection("transitions", `.dsh-hdd-mode-transition,.dsh-hdd-session-transition{position:fixed;inset:0;z-index:2147483000;overflow:hidden;pointer-events:none;contain:strict}.dsh-hdd-mode-transition>[data-dsh-transition-layer]{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;will-change:transform,clip-path,opacity}.dsh-hdd-mode-transition [data-dsh-transition-frame],.dsh-hdd-session-transition [data-dsh-transition-frame]{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;pointer-events:none!important;user-select:none!important}.dsh-hdd-mode-transition [data-dsh-transition-frame] *,.dsh-hdd-session-transition [data-dsh-transition-frame] *{pointer-events:none!important}`);
		appendSection("shared-surfaces", `html[data-dsh-fairy-visual] [data-dsh-fairy-version-navigation="true"]{display:none!important}.dsh-fairy-session-metrics{position:relative;display:inline-flex;align-items:center;order:3;margin-left:16px}.dsh-fairy-session-metrics-button{height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-strong-13,12px system-ui);cursor:pointer}.dsh-fairy-session-metrics-button:hover,.dsh-fairy-session-metrics-button[aria-expanded="true"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.dsh-fairy-session-metrics-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.dsh-fairy-session-metrics-panel{position:absolute;z-index:30;right:0;top:calc(100% + 8px);width:min(280px,calc(100vw - 32px));padding:12px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv3,0 8px 24px rgba(0,0,0,.18));color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px;white-space:normal;overflow-wrap:anywhere}.dsh-fairy-session-metrics-item{display:block;padding:3px 0}.dsh-fairy-session-metrics-item+.dsh-fairy-session-metrics-item{border-top:1px solid var(--dsw-alias-border-l2)}html[data-dsh-fairy-mode="hdd"] [data-dsh-fairy-header-session-agent-preset="true"]{display:none!important}@media(min-width:900px){html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"]>header{box-sizing:border-box;display:flex;align-items:center;height:44px;padding:8px 28px 8px 20px}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"]>header>[data-dsh-fairy-header-title-row="true"]{display:contents!important}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"] [data-dsh-fairy-header-title-cluster="true"]{flex:0 1 auto!important;min-width:0}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"] [data-dsh-fairy-header-utilities-shell="true"]{display:contents!important}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"] [data-dsh-fairy-header-actions-cluster="true"]{order:1;flex:0 1 auto;min-width:0;align-self:center}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"]>header>[role="tablist"]{order:2;flex:0 0 auto;width:auto;height:28px;margin:0 0 0 18px;padding:0;gap:18px;align-items:center;align-self:center}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"]>header>[role="tablist"]>[role="tab"]{height:28px;padding:0;line-height:28px}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"] [data-dsh-fairy-header-utilities-cluster="true"]{display:contents!important}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"] [data-dsh-fairy-header-session-log="true"]{order:4;flex:0 0 auto;margin-left:18px;align-self:center}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header"] .dsh-fairy-toggle-group{order:5;flex:0 0 auto;margin-left:auto;align-self:center}html[data-dsh-fairy-visual] body>#root>[data-slot="root"] [data-phase="active"] [data-slot="conversation.session.header.utilities"] button{box-sizing:border-box;height:28px;padding-top:4px;padding-bottom:4px}}`);
		appendSection("hero", `.dsh-fairy-hero-projection-svg{position:absolute;left:0;top:0;width:100%;height:220px;overflow:visible;pointer-events:none;font:inherit;letter-spacing:0}.dsh-fairy-hero-projection-text,.dsh-fairy-hero-mask-text{font:inherit;font-size:inherit;font-weight:inherit;letter-spacing:inherit;text-anchor:middle;dominant-baseline:alphabetic}.dsh-fairy-hero-mask-text{fill:#000!important;opacity:1!important}.dsh-fairy-hero-projection-text-1{fill:#c9dce9;opacity:.20}.dsh-fairy-hero-projection-text-2{fill:#a7c2d4;opacity:.14}.dsh-fairy-hero-projection-text-3{fill:#7f9fb8;opacity:.085}.dsh-fairy-hero-projection-text-4{fill:#5d82a0;opacity:.045}@media(max-width:520px){.dsh-fairy-hero-projection-svg{height:120px}.dsh-fairy-hero-projection-text{transform-origin:0 0}.dsh-fairy-hero-projection-text-1{y:38px;transform:matrix(1,0,0,-1,0,76)}.dsh-fairy-hero-projection-text-2{y:50px;transform:matrix(1,0,0,-1,0,100)}.dsh-fairy-hero-projection-text-3{y:66px;transform:matrix(1,0,0,-1,0,132)}.dsh-fairy-hero-projection-text-4{y:86px;transform:matrix(1,0,0,-1,0,172)}.dsh-fairy-hero-mask-text-1-for-2{y:62px}.dsh-fairy-hero-mask-text-1-for-3{y:94px}.dsh-fairy-hero-mask-text-2-for-3{y:82px}.dsh-fairy-hero-mask-text-1-for-4{y:134px}.dsh-fairy-hero-mask-text-2-for-4{y:122px}.dsh-fairy-hero-mask-text-3-for-4{y:106px}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-projection-text-1{fill:#4f6d83}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-projection-text-2{fill:#607f96}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-projection-text-3{fill:#7895a9}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-projection-text-4{fill:#93abb9}}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-projection-text-1{fill:#4f6d83;opacity:.16}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-projection-text-2{fill:#607f96;opacity:.105}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-projection-text-3{fill:#7895a9;opacity:.065}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-projection-text-4{fill:#93abb9;opacity:.038}`);
		appendSection("hero", `.dsh-fairy-hero-native-headline{min-height:74px;visibility:visible!important;opacity:1;transition:opacity 460ms cubic-bezier(.16,1,.3,1),visibility 0s}.dsh-fairy-hero-native-headline.dsh-fairy-hero-native-headline-hidden{visibility:hidden!important;opacity:0;transition:opacity 280ms cubic-bezier(.7,0,.84,0),visibility 0s linear 280ms}.dsh-fairy-hero-host{position:fixed;z-index:0!important;top:clamp(96px,calc(90px + min(36vh,450px)),calc(100dvh - 220px));display:flex;flex-direction:column;align-items:center;gap:2px;width:max-content;max-width:none;pointer-events:none;transform:translateX(-50%);white-space:nowrap;opacity:0;visibility:hidden;transition:none!important}.dsh-fairy-hero-host[data-active=true]{opacity:1;visibility:visible;transition:none!important}.dsh-fairy-hero-main{position:relative;z-index:0;isolation:isolate;color:#f4f7fb;font-family:"Avenir Next","Arial Narrow","DIN Condensed","Microsoft YaHei",sans-serif;font-size:52px;font-weight:750;line-height:1;letter-spacing:0}.dsh-fairy-hero-sub{position:relative;display:flex;align-items:center;gap:44px;color:#aebbc9;font-family:var(--dsw-font-family);font-size:15px;font-weight:500;line-height:1}.dsh-fairy-hero-sub::before,.dsh-fairy-hero-sub::after{content:'';position:absolute;top:50%;width:240px;height:1px;background:currentColor;transform:translateY(-50%);pointer-events:none}.dsh-fairy-hero-sub::before{right:calc(100% + 12px)}.dsh-fairy-hero-sub::after{left:calc(100% + 12px)}.dsh-fairy-hero-sub-char{display:block}@media(max-width:520px){.dsh-fairy-hero-native-headline{min-height:45px}.dsh-fairy-hero-host{top:clamp(86px,calc(90px + min(31vh,324px)),calc(100dvh - 190px));gap:2px}.dsh-fairy-hero-main{font-size:30px}.dsh-fairy-hero-sub{gap:18px;font-size:12px}.dsh-fairy-hero-sub::before,.dsh-fairy-hero-sub::after{width:84px}.dsh-fairy-hero-sub::before{right:calc(100% + 7px)}.dsh-fairy-hero-sub::after{left:calc(100% + 7px)}}@media(prefers-reduced-motion:reduce){.dsh-fairy-hero-native-headline,.dsh-fairy-hero-host{transition:none!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"],html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] body{color-scheme:light}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] body{background:#f7fafc!important;--dsw-alias-bg-base:#f7fafc!important;--dsw-alias-bg-layer-1:#fff!important;--dsw-alias-bg-layer-2:#edf4f8!important;--dsw-alias-bg-layer-3:#dfebf3!important;--dsw-alias-bg-module-platform:#f3f7fa!important;--dsw-alias-bg-overlay:#fff!important;--dsw-alias-label-primary:#172531!important;--dsw-alias-label-secondary:#526675!important;--dsw-alias-label-tertiary:#748694!important;--dsw-alias-icon-primary:#263b4b!important;--dsw-alias-border-l1:rgba(32,111,149,.24)!important;--dsw-alias-border-l2:rgba(32,91,122,.14)!important;--dsw-alias-brand-primary:#1688ce!important;--dsw-alias-button-primary-fill:#1688ce!important;--dsw-alias-button-primary-hover:#0f78b8!important;--dsw-specific-sidebar-fill:#f3f7fa!important;--dsw-specific-sidebar-nav-item-hover:#e9f1f6!important;--dsw-specific-sidebar-nav-item-active:#dcebf5!important;--dsw-specific-sidebar-nav-item-active-accent:#1688ce!important;--dsw-specific-input-major:#fff!important;--dsw-specific-menu:#fff!important;--dsw-specific-selector:#fff!important;--dsw-specific-bubble:#e7f2f9!important;--dsw-specific-tip:#fff!important;--dsw-alias-button-elevated-fill:#fff!important;--dsw-alias-button-floating-fill:#fff!important;--dsw-alias-button-floating-hover:#e5f0f7!important;--dsw-alias-button-ghost-active-fill:#dcebf5!important;--dsw-alias-markdown-citation:#e7f2f9!important;--dsw-alias-markdown-code-block:#f0f5f8!important;--dsw-alias-markdown-code-block-banner:#e8f0f5!important;--dsw-alias-markdown-inline-code:#e7f2f9!important;--dsw-alias-markdown-tag:#e7f2f9!important;--dsw-alias-markdown-code-segment-selected:#e1edf5!important;--dsw-alias-markdown-code-segment-unselected:#f0f5f8!important;--dsw-alias-markdown-placeholder:#eaf1f5!important;--dsw-alias-scrollbar-bg-l2:#d2e0e9!important;--dsw-alias-scrollbar-hover-l2:#a8bfce!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-composer-card="true"]{background:#fff!important;border-color:rgba(32,111,149,.22)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-composer-card="true"] textarea{color:#172531!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-fx:before{background-image:linear-gradient(rgba(34,126,166,.055) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(34,126,166,.055) 1.5px,transparent 1.5px)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-glow-a{background:radial-gradient(ellipse 56vmax 29vh at 46% 48%,rgba(48,180,229,.12),rgba(54,184,255,.055) 52%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-glow-b{background:radial-gradient(ellipse 53vmax 37vh at 55% 52%,rgba(139,115,241,.09),rgba(119,91,255,.04) 53%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-glow-c{background:radial-gradient(ellipse 50vmax 26vh at 54% 49%,rgba(154,91,233,.085),rgba(143,94,255,.035) 53%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-main{color:#172531}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-hero-sub{color:#607585}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-mark-title{color:#1b2b38}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-mark-sub{color:#667b8b}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-sidebar-open-control="true"]:before{background:radial-gradient(circle at 64% 66%,currentColor 0 2.1px,transparent 2.5px),radial-gradient(circle at 50% 50%,#f7fafc 0 4.4px,transparent 4.8px),radial-gradient(circle at 50% 50%,currentColor 0 7px,transparent 7.4px),radial-gradient(circle at 50% 50%,#f7fafc 0 10px,transparent 10.4px)}`);
		appendSection("shared-surfaces", `.dsh-fairy-toggle-group{box-sizing:border-box}`);
		appendSection("themes", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-fairy-mark[data-on=true] .dsh-fairy-mark-eye{filter:grayscale(1) brightness(.82) contrast(.9)}`);
		appendSection("themes", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .dsh-hdd-glow-a{background:radial-gradient(ellipse 56vmax 29vh at 46% 48%,rgba(96,212,255,.21),rgba(54,184,255,.105) 52%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .dsh-hdd-glow-b{background:radial-gradient(ellipse 53vmax 37vh at 55% 52%,rgba(157,132,255,.18),rgba(119,91,255,.09) 53%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .dsh-hdd-glow-c{background:radial-gradient(ellipse 50vmax 26vh at 54% 49%,rgba(174,112,255,.19),rgba(143,94,255,.095) 53%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-glow-a{background:radial-gradient(ellipse 56vmax 29vh at 46% 48%,rgba(48,180,229,.17),rgba(54,184,255,.078) 52%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-glow-b{background:radial-gradient(ellipse 53vmax 37vh at 55% 52%,rgba(139,115,241,.135),rgba(119,91,255,.062) 53%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-glow-c{background:radial-gradient(ellipse 50vmax 26vh at 54% 49%,rgba(154,91,233,.13),rgba(143,94,255,.058) 53%,transparent 100%)}`);
		appendSection("shared-surfaces", `.dsh-fairy-toggle-group .dsh-fairy-toggle{appearance:none;border-radius:999px 0 0 999px;box-shadow:none}.dsh-fairy-toggle-group .dsh-fairy-theme-toggle{position:relative;appearance:none;height:26px;border-left:0;border-radius:0 999px 999px 0;box-shadow:none}.dsh-fairy-toggle-group .dsh-fairy-theme-toggle:before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:1px;background:var(--dsw-alias-border-l2);pointer-events:none}.dsh-fairy-toggle-group .dsh-fairy-toggle:active,.dsh-fairy-toggle-group .dsh-fairy-theme-toggle:active:not(:disabled){box-shadow:inset 0 1px 3px color-mix(in srgb,var(--dsw-alias-label-primary) 18%,transparent)}.dsh-fairy-toggle-group .dsh-fairy-toggle:focus-visible,.dsh-fairy-toggle-group .dsh-fairy-theme-toggle:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--dsw-alias-brand-primary)}`);
		appendSection("themes", `html[data-dsh-fairy-theme-transition]{view-transition-name:dsh-fairy-theme}@keyframes dsh-fairy-theme-out{to{opacity:0}}@keyframes dsh-fairy-theme-in{from{opacity:0}}::view-transition-group(dsh-fairy-theme){animation-duration:480ms}::view-transition-old(dsh-fairy-theme){animation:dsh-fairy-theme-out 400ms cubic-bezier(.4,0,1,1) both;mix-blend-mode:normal}::view-transition-new(dsh-fairy-theme){animation:dsh-fairy-theme-in 480ms cubic-bezier(0,0,.2,1) both;mix-blend-mode:normal}@media(prefers-reduced-motion:reduce){::view-transition-old(dsh-fairy-theme),::view-transition-new(dsh-fairy-theme){animation:none}}`);
		appendSection("transitions", `.dsh-fairy-theme-fade-transition{position:fixed;inset:0;z-index:2147482999;overflow:hidden;pointer-events:none;contain:strict}.dsh-fairy-theme-fade-transition>[data-dsh-transition-frame]{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;pointer-events:none!important;user-select:none!important}.dsh-fairy-theme-fade-transition>[data-dsh-transition-frame] *{pointer-events:none!important;animation-play-state:paused!important}`);
		appendSection("stage-and-mascot", `.dsh-fairy-stage>[data-dsh-fairy-mascot-root="true"]{top:-20px}`);
		appendSection("hero", `html[data-dsh-fairy-visual] body,html[data-dsh-fairy-visual] body :where(*){font-weight:800!important}html[data-dsh-fairy-visual] body :where(pre,code,kbd,samp),html[data-dsh-fairy-visual] body :where(pre,code,kbd,samp) *{font-weight:400!important}html[data-dsh-fairy-visual] body :where(.dsh-fairy-hero-main,.dsh-fairy-mark-title,.dsh-fairy-toggle){font-weight:750!important}`);
		appendSection("sidebar", `html[data-dsh-fairy-visual] .dsh-history-overlay-scrollbar{width:12px!important;transition:opacity 180ms cubic-bezier(.22,.61,.36,1)}html[data-dsh-fairy-visual] .dsh-history-overlay-scrollbar-thumb{width:6px!important}html[data-dsh-fairy-visual] .dsh-history-overlay-scrollbar[data-idle="true"]{opacity:0;pointer-events:none;transition-timing-function:cubic-bezier(.4,0,.2,1)}`);
		appendSection("sidebar", `html[data-dsh-fairy-visual] body>#root{position:relative!important;z-index:1!important}html[data-dsh-fairy-visual] [data-dsh-fairy-background-surface="true"],html[data-dsh-fairy-visual] [data-slot="conversation"]>[data-phase]{background:transparent!important;background-color:transparent!important;background-image:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-layer="true"]{position:relative!important;z-index:2!important;isolation:isolate!important;overflow:visible!important;width:100%!important;min-width:0!important;height:100%!important;border-right:0!important;background:transparent!important;background-color:transparent!important;background-image:none!important;--dsh-sidebar-ridge-width:10px;--dsh-sidebar-board-color:#3b4148;--dsh-sidebar-board-image:radial-gradient(circle at 1px 1px,rgba(255,255,255,.022) 0 .75px,transparent 1px),radial-gradient(circle at 2px 3px,rgba(0,0,0,.028) 0 .8px,transparent 1.1px),radial-gradient(ellipse 115% 48% at 18% 4%,rgba(255,255,255,.022),transparent 64%),linear-gradient(180deg,#3d434b 0%,#3a4047 52%,#373d44 100%);--dsh-sidebar-elevation-contact:rgba(0,0,0,.58);--dsh-sidebar-elevation-ambient:rgba(0,0,0,.48);--dsh-sidebar-ridge-contact:#3b434b;--dsh-sidebar-ridge-highlight:#5e6973;--dsh-sidebar-ridge-face:#4d5660;--dsh-sidebar-ridge-shade:#424b54;--dsh-sidebar-ridge-edge:#353d45;--dsh-sidebar-ridge-cast-left:rgba(0,0,0,.18);--dsh-sidebar-ridge-cast-right-contact:rgba(0,0,0,.44);--dsh-sidebar-ridge-cast-right-ambient:rgba(0,0,0,.24)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-sidebar-layer="true"]{--dsh-sidebar-board-color:#d9dde1;--dsh-sidebar-board-image:radial-gradient(circle at 1px 1px,rgba(255,255,255,.22) 0 .75px,transparent 1.1px),radial-gradient(circle at 2px 3px,rgba(64,74,84,.055) 0 .8px,transparent 1.1px),radial-gradient(ellipse 115% 48% at 18% 4%,rgba(255,255,255,.18),transparent 64%),linear-gradient(180deg,#dde1e5 0%,#d9dde1 52%,#d4d8dc 100%);--dsh-sidebar-elevation-contact:rgba(49,58,67,.28);--dsh-sidebar-elevation-ambient:rgba(58,68,78,.24);--dsh-sidebar-ridge-contact:#cbd1d6;--dsh-sidebar-ridge-highlight:#f8fafb;--dsh-sidebar-ridge-face:#d7dde1;--dsh-sidebar-ridge-edge:#bec5cb;--dsh-sidebar-ridge-cast-left:rgba(64,74,84,.10);--dsh-sidebar-ridge-cast-right-contact:rgba(49,58,67,.28);--dsh-sidebar-ridge-cast-right-ambient:rgba(49,58,67,.14)}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-layer="true"]::before{content:'';position:absolute;z-index:0;inset:0;pointer-events:none;background-color:var(--dsh-sidebar-board-color);background-image:var(--dsh-sidebar-board-image);background-size:5px 5px,9px 9px,100% 100%,100% 100%;background-position:0 0,1px 2px,0 0,0 0;background-repeat:repeat,repeat,no-repeat,no-repeat;clip-path:var(--dsh-sidebar-board-clip,inset(0));box-shadow:4px 0 10px -7px var(--dsh-sidebar-elevation-contact),16px 0 36px -22px var(--dsh-sidebar-elevation-ambient)}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-layer="true"]::after{content:'';position:absolute;z-index:5;top:0;right:0;bottom:0;width:var(--dsh-sidebar-ridge-width);pointer-events:none;border-radius:0;background:linear-gradient(90deg,var(--dsh-sidebar-ridge-contact) 0 1px,var(--dsh-sidebar-ridge-highlight) 1px 2px,var(--dsh-sidebar-ridge-face) 2px 8px,var(--dsh-sidebar-ridge-shade) 8px 9px,var(--dsh-sidebar-ridge-edge) 9px 10px);background-size:var(--dsh-sidebar-ridge-width) 100%;background-repeat:no-repeat;box-shadow:-2px 0 4px -1px var(--dsh-sidebar-ridge-cast-left),3px 0 6px -1px var(--dsh-sidebar-ridge-cast-right-contact),20px 0 52px -16px var(--dsh-sidebar-ridge-cast-right-ambient)}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]{position:relative!important;z-index:1!important;isolation:isolate!important;width:calc(100% - var(--dsh-sidebar-ridge-width))!important;background:transparent!important;background-color:transparent!important;background-image:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-collapsed-content="true"]{padding-left:5px!important;padding-right:5px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]>*{background:transparent!important;background-color:transparent!important;background-image:none!important}`);
		appendSection("sidebar", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-sidebar-layer="true"]{--dsh-sidebar-board-image:radial-gradient(circle at 1px 1px,rgba(255,255,255,.22) 0 .75px,transparent 1px),radial-gradient(circle at 2px 3px,rgba(64,74,84,.055) 0 .8px,transparent 1.1px),radial-gradient(ellipse 115% 48% at 18% 4%,rgba(255,255,255,.18),transparent 64%),linear-gradient(180deg,#dde1e5 0%,#d9dde1 52%,#d4d8dc 100%);--dsh-sidebar-ridge-face:#e6eaed;--dsh-sidebar-ridge-shade:#d7dde1}`);
		appendSection("sidebar", `html[data-dsh-fairy-visual] [data-dsh-fairy-history-surface="true"]{position:relative;box-sizing:border-box;margin-left:-4px!important;margin-right:-4px!important;border-radius:10px;overflow:hidden;isolation:isolate;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-history-surface="true"]::after{content:'';position:absolute;z-index:3;inset:0;pointer-events:none;border-radius:10px;box-shadow:inset 0 0 7px -2px var(--dsh-history-cutout-contact),inset 7px 7px 16px -10px var(--dsh-history-cutout-shadow),inset -4px -4px 10px -7px var(--dsh-history-cutout-ambient)}html[data-dsh-fairy-visual] [data-dsh-fairy-history-fade="true"]{background:none!important;background-image:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-history-surface="true"] [role="tree"]{padding-left:8px!important;padding-right:6px!important;box-sizing:border-box!important;scrollbar-width:none!important;scrollbar-color:transparent transparent!important}html[data-dsh-fairy-visual] [data-slot="conversation"] [data-conversation-scroll],html[data-dsh-fairy-visual] [data-slot="conversation"] [data-input-scroll]{scrollbar-width:none!important;scrollbar-color:transparent transparent!important}html[data-dsh-fairy-visual] [data-dsh-fairy-history-surface="true"] [role="tree"]::-webkit-scrollbar,html[data-dsh-fairy-visual] [data-slot="conversation"] [data-conversation-scroll]::-webkit-scrollbar,html[data-dsh-fairy-visual] [data-slot="conversation"] [data-input-scroll]::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}html[data-dsh-fairy-visual] .dsh-hdd-scrollbar-layer{position:fixed;inset:0;z-index:4;pointer-events:none;overflow:visible}html[data-dsh-fairy-visual] .dsh-hdd-scrollbar-layer[hidden]{display:none!important}html[data-dsh-fairy-visual] .dsh-history-overlay-scrollbar{position:fixed;z-index:4;width:10px;min-height:24px;opacity:.4;pointer-events:auto;cursor:default;touch-action:none;transition:opacity 140ms ease}html[data-dsh-fairy-visual] .dsh-history-overlay-scrollbar[data-visible="false"]{display:none}html[data-dsh-fairy-visual] .dsh-history-overlay-scrollbar[data-active="true"],html[data-dsh-fairy-visual] .dsh-history-overlay-scrollbar:hover{opacity:.68}html[data-dsh-fairy-visual] .dsh-history-overlay-scrollbar-thumb{position:absolute;top:0;right:2px;width:5px;min-height:20px;border-radius:999px;background:rgba(225,232,238,.24);box-shadow:0 0 0 1px rgba(0,0,0,.06);cursor:grab}html[data-dsh-fairy-visual] .dsh-history-overlay-scrollbar-thumb:active{cursor:grabbing}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-history-overlay-scrollbar-thumb{background:rgba(52,63,73,.18);box-shadow:0 0 0 1px rgba(255,255,255,.16)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-history-surface="true"]{--dsh-history-cutout-contact:rgba(0,0,0,.52);--dsh-history-cutout-shadow:rgba(0,0,0,.84);--dsh-history-cutout-ambient:rgba(0,0,0,.36)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-history-surface="true"]{--dsh-history-cutout-contact:rgba(58,68,78,.26);--dsh-history-cutout-shadow:rgba(58,68,78,.56);--dsh-history-cutout-ambient:rgba(58,68,78,.20)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-history-surface="true"] [role="treeitem"]:hover:not([data-dsh-fairy-selected-session="true"]){background-color:rgba(255,255,255,.07)!important;box-shadow:0 2px 10px -7px rgba(255,255,255,.72),inset 0 0 0 1px rgba(255,255,255,.06)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-selected-session="true"]{background-color:var(--dsh-selected-fill)!important;background-image:none!important;border:0!important;box-shadow:none!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"]{--dsh-selected-fill:rgba(81,90,100,.58);--dsh-selected-text:#f4f7fb}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"]{--dsh-selected-fill:rgba(198,204,210,.58);--dsh-selected-text:#25313b}html[data-dsh-fairy-visual] [data-dsh-fairy-selected-session="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-selected-session="true"] *{color:var(--dsh-selected-text)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-active-folder="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-active-folder="true"] :is(svg,path){color:#c3c8cd!important}`);
		appendSection("sidebar", `html[data-dsh-fairy-visual] [data-dsh-fairy-native-new-session="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-brand-anchor="true"]{box-sizing:border-box!important;border-style:solid!important;border-width:2px!important;border-color:transparent!important;border-radius:8px!important;background:linear-gradient(#30353a,#30353a) padding-box,linear-gradient(135deg,#555f68 0%,#4e5861 48%,#3d444b 100%) border-box!important;color:#f4f7fb!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-brand-anchor="true"]{background:transparent!important;border-color:transparent!important;box-shadow:none!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-native-new-session="true"],html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-brand-anchor="true"]{background:linear-gradient(#f4f5f6,#f4f5f6) padding-box,linear-gradient(135deg,#dfe5e9 0%,#dce2e6 48%,#c1c8ce 100%) border-box!important;border-color:transparent!important;color:#293139!important;box-shadow:-4px -4px 9px rgba(255,255,255,.46),5px 6px 13px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-brand-anchor="true"]{background:transparent!important;border-color:transparent!important;box-shadow:none!important;visibility:hidden!important}html[data-dsh-fairy-visual] [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]{box-sizing:border-box!important;border-style:solid!important;border-width:2px!important;border-color:transparent!important;border-radius:8px!important;background:linear-gradient(#30353a,#30353a) padding-box,linear-gradient(135deg,#4b555e 0%,#454f58 48%,#30363b 100%) border-box!important;color:#eef1f4!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]{background:linear-gradient(#f4f5f6,#f4f5f6) padding-box,linear-gradient(135deg,#dfe5e9 0%,#dce2e6 48%,#c1c8ce 100%) border-box!important;border-color:transparent!important;color:#293139!important;box-shadow:-4px -4px 9px rgba(255,255,255,.46),5px 6px 13px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}html[data-dsh-fairy-visual] [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"] *{background:transparent!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]{margin-top:10px!important;margin-bottom:6px!important}`);
		appendSection("shared-surfaces", `html[data-dsh-fairy-visual] [data-dsh-fairy-active-folder="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-active-folder="true"] :is(svg,path){color:inherit!important}`);
		appendSection("themes", `html[data-dsh-fairy-visual] [data-dsh-fairy-native-new-session="true"],html[data-dsh-fairy-visual] [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]{--dsh-card-fill:#30353a;--dsh-card-grain-light:rgba(255,255,255,.055);--dsh-card-grain-dark:rgba(0,0,0,.038);--dsh-card-sheen-light:rgba(255,255,255,.028);--dsh-card-sheen-dark:rgba(0,0,0,.024);--dsh-card-border:linear-gradient(135deg,#555f68 0%,#4e5861 48%,#3d444b 100%);background-image:radial-gradient(circle at 1px 1px,var(--dsh-card-grain-light) 0 .34px,transparent .68px),radial-gradient(circle at 2px 3px,var(--dsh-card-grain-dark) 0 .34px,transparent .72px),linear-gradient(135deg,var(--dsh-card-sheen-light),transparent 48%,var(--dsh-card-sheen-dark)),linear-gradient(var(--dsh-card-fill),var(--dsh-card-fill)),var(--dsh-card-border)!important;background-size:4px 4px,7px 7px,100% 100%,100% 100%,100% 100%;background-position:0 0,1px 2px,0 0,0 0,0 0;background-repeat:repeat,repeat,no-repeat,no-repeat,no-repeat;background-clip:padding-box,padding-box,padding-box,padding-box,border-box!important;background-origin:padding-box,padding-box,padding-box,padding-box,border-box!important;overflow:hidden!important}html[data-dsh-fairy-visual] [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]{--dsh-card-border:linear-gradient(135deg,#4b555e 0%,#454f58 48%,#30363b 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-native-new-session="true"],html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]{--dsh-card-fill:#f4f5f6;--dsh-card-grain-light:rgba(255,255,255,.12);--dsh-card-grain-dark:rgba(74,87,98,.048);--dsh-card-sheen-light:rgba(255,255,255,.085);--dsh-card-sheen-dark:rgba(74,87,98,.032);--dsh-card-border:linear-gradient(135deg,#dfe5e9 0%,#dce2e6 48%,#c1c8ce 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-native-new-session="true"]:is(:hover,:focus-visible),html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]:is(:hover,:focus-visible){--dsh-card-sheen-light:rgba(255,255,255,.13)}`);
		appendSection("themes", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .re-model-menu{color:#e8f2fa!important;background:#0e243d!important;border-color:rgba(126,220,255,.24)!important;box-shadow:0 12px 32px rgba(0,0,0,.42)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .re-model-menu :is(.re-model-row,.re-model-option,.re-model-back){color:#e8f2fa!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .re-model-menu :is(.re-model-row,.re-model-option,.re-model-back):hover{background:rgba(255,255,255,.10)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .re-model-menu :is(.re-model-group-title,.re-model-option-desc,.re-model-status){color:#a8bac9!important}`);
		appendSection("themes", `html[data-dsh-fairy-visual] [data-dsh-fairy-native-new-session="true"],html[data-dsh-fairy-visual] [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]{background-image:radial-gradient(circle at 1px 1px,var(--dsh-card-grain-light) 0 .34px,transparent .68px),radial-gradient(circle at 2px 3px,var(--dsh-card-grain-dark) 0 .34px,transparent .72px),linear-gradient(135deg,var(--dsh-card-sheen-light),transparent 48%,var(--dsh-card-sheen-dark)),linear-gradient(var(--dsh-card-fill),var(--dsh-card-fill)),var(--dsh-card-border)!important;background-size:4px 4px,7px 7px,100% 100%,100% 100%,100% 100%!important;background-position:0 0,1px 2px,0 0,0 0,0 0!important;background-repeat:repeat,repeat,no-repeat,no-repeat,no-repeat!important;background-clip:padding-box,padding-box,padding-box,padding-box,border-box!important;background-origin:padding-box,padding-box,padding-box,padding-box,border-box!important;overflow:hidden!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-native-new-session="true"],html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]{background-image:radial-gradient(circle at 1px 1px,var(--dsh-card-grain-light) 0 .34px,transparent .68px),radial-gradient(circle at 2px 3px,var(--dsh-card-grain-dark) 0 .34px,transparent .72px),linear-gradient(135deg,var(--dsh-card-sheen-light),transparent 48%,var(--dsh-card-sheen-dark)),linear-gradient(var(--dsh-card-fill),var(--dsh-card-fill)),var(--dsh-card-border)!important;background-size:4px 4px,7px 7px,100% 100%,100% 100%,100% 100%!important;background-position:0 0,1px 2px,0 0,0 0,0 0!important;background-repeat:repeat,repeat,no-repeat,no-repeat,no-repeat!important;background-clip:padding-box,padding-box,padding-box,padding-box,border-box!important;background-origin:padding-box,padding-box,padding-box,padding-box,border-box!important;overflow:hidden!important}`);
		appendSection("sidebar", `html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]{width:calc(100% - 4px)!important;min-width:0!important;height:62px!important;min-height:62px!important;margin:10px 2px 6px!important;padding:6px 10px 7px!important;display:grid!important;grid-template-columns:max-content max-content max-content max-content!important;grid-template-rows:1fr 1fr!important;column-gap:0!important;row-gap:2px!important;justify-content:space-between!important;align-items:center!important;clip-path:none!important;-webkit-mask-image:none!important;mask-image:none!important;border-radius:8px!important;position:relative!important;top:4px!important;z-index:3!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div{min-width:0!important;box-sizing:border-box!important;align-items:baseline!important;white-space:nowrap!important;line-height:15px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div:nth-child(1),html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div:nth-child(2){display:contents!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div:nth-child(1)>:first-child{grid-column:1!important;grid-row:1!important;justify-self:start!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div:nth-child(1)>:last-child{grid-column:2!important;grid-row:1!important;justify-self:start!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div:nth-child(2)>:first-child{grid-column:3!important;grid-row:1!important;justify-self:start!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div:nth-child(2)>:last-child{grid-column:4!important;grid-row:1!important;justify-self:start!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div:nth-child(3){display:grid!important;grid-template-columns:max-content max-content!important;column-gap:0!important;justify-content:space-between!important;grid-column:1 / span 2!important;grid-row:2!important;width:100%!important;max-width:100%!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div:nth-child(3)> :last-child{justify-self:end!important;text-align:right!important}`);
		appendSection("sidebar", `html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-content="true"]:not([data-dsh-fairy-sidebar-collapsed-content="true"]) [data-slot="sidebar.footer.action"] [aria-label^="DeepSeek 余额"]>div:nth-child(3){contain:inline-size!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-input-scroll]{box-sizing:border-box!important;margin-left:-20px!important;margin-right:-20px!important;border:0!important;border-color:transparent!important;border-radius:10px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;overflow-x:hidden!important;overflow-y:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"][data-dragging="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"][data-dragging="true"] *{transition:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-workspace="true"]{pointer-events:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-workspace="true"] button{pointer-events:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-workspace-projection="true"]{opacity:.46!important;filter:grayscale(1)!important;pointer-events:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-workspace-projection="true"] button{pointer-events:none!important;cursor:not-allowed!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-mode-pending="true"]{visibility:hidden!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-tools="true"]>*:nth-child(1){justify-self:start!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-tools="true"]>*:nth-child(2){justify-self:end!important;margin-right:16px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-stack="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"]{overflow:visible!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-input-scroll]{border-color:transparent!important;background:transparent!important;background-color:transparent!important;background-image:none!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{background:transparent!important;border-color:transparent!important;isolation:isolate!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material="true"]{position:absolute!important;z-index:0!important;top:-10px!important;right:-12px!important;bottom:-10px!important;left:-12px!important;pointer-events:none!important;overflow:visible!important;--dsh-composer-polymer:#30363d;--dsh-composer-polymer-light:rgba(255,255,255,.045);--dsh-composer-polymer-dark:rgba(0,0,0,.11);--dsh-composer-edge-light:rgba(255,255,255,.18);--dsh-composer-edge-dark:rgba(0,0,0,.42);--dsh-composer-hole-radius:10px}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material="true"]{--dsh-composer-polymer:#c9cfd4;--dsh-composer-polymer-light:rgba(255,255,255,.42);--dsh-composer-polymer-dark:rgba(70,80,90,.12);--dsh-composer-edge-light:rgba(255,255,255,.78);--dsh-composer-edge-dark:rgba(70,80,90,.27)}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material-face]{position:absolute!important;box-sizing:border-box!important;background-color:var(--dsh-composer-polymer)!important;background-image:radial-gradient(circle at 1px 1px,var(--dsh-composer-polymer-light) 0 .32px,transparent .72px),radial-gradient(circle at 2px 3px,var(--dsh-composer-polymer-dark) 0 .34px,transparent .76px),linear-gradient(135deg,rgba(255,255,255,.035),transparent 46%,rgba(0,0,0,.055))!important;background-size:5px 5px,7px 7px,100% 100%!important;background-position:0 0,1px 2px,0 0!important;background-repeat:repeat,repeat,no-repeat!important;overflow:hidden!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material-face="top"]{left:0!important;right:0!important;top:0!important;height:var(--dsh-fairy-composer-hole-top)!important;border-bottom-left-radius:var(--dsh-composer-hole-radius)!important;border-bottom-right-radius:var(--dsh-composer-hole-radius)!important;box-shadow:0 -8px 18px -13px var(--dsh-composer-edge-light),0 5px 12px -9px var(--dsh-composer-edge-dark),inset 0 1px 0 var(--dsh-composer-edge-light)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material-face="left"]{left:0!important;top:var(--dsh-fairy-composer-hole-top)!important;bottom:calc(100% - var(--dsh-fairy-composer-hole-bottom))!important;width:var(--dsh-fairy-composer-hole-left)!important;border-top-right-radius:var(--dsh-composer-hole-radius)!important;border-bottom-right-radius:var(--dsh-composer-hole-radius)!important;box-shadow:inset 0 1px 0 var(--dsh-composer-edge-light),inset -7px 0 13px -11px var(--dsh-composer-edge-dark)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material-face="right"]{right:0!important;top:var(--dsh-fairy-composer-hole-top)!important;bottom:calc(100% - var(--dsh-fairy-composer-hole-bottom))!important;left:var(--dsh-fairy-composer-hole-right)!important;border-top-left-radius:var(--dsh-composer-hole-radius)!important;border-bottom-left-radius:var(--dsh-composer-hole-radius)!important;box-shadow:inset 1px 0 0 var(--dsh-composer-edge-light),inset 7px 0 13px -11px var(--dsh-composer-edge-dark)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material-face="bottom"]{left:0!important;right:0!important;bottom:0!important;top:var(--dsh-fairy-composer-hole-bottom)!important;border-top-left-radius:var(--dsh-composer-hole-radius)!important;border-top-right-radius:var(--dsh-composer-hole-radius)!important;box-shadow:inset 0 -1px 0 var(--dsh-composer-edge-dark),0 8px 20px -13px var(--dsh-composer-edge-dark)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]>:not([data-dsh-fairy-composer-material="true"]){z-index:1!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-input-scroll]{position:relative!important;z-index:2!important;border:0!important;background:transparent!important;border-radius:10px!important;box-shadow:none!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material="true"]{display:block!important;overflow:visible!important;filter:none!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material="true"]{filter:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material-face="continuous"]{position:static!important;width:100%!important;height:100%!important;display:block!important;stroke:none!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material="true"]{--dsh-composer-polymer:#3b4148!important;--dsh-composer-polymer-light:rgba(255,255,255,.06)!important;--dsh-composer-polymer-dark:rgba(0,0,0,.07)!important;--dsh-composer-polymer-stripe:rgba(0,0,0,.16)!important;--dsh-composer-sheen-light:rgba(255,255,255,.07)!important;--dsh-composer-sheen-dark:rgba(0,0,0,.09)!important;--dsh-composer-ambient-light:rgba(255,255,255,.055)!important;--dsh-composer-ambient-dark:rgba(0,0,0,.045)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material="true"]{--dsh-composer-polymer:#d9dde1!important;--dsh-composer-polymer-light:rgba(255,255,255,.18)!important;--dsh-composer-polymer-dark:rgba(64,74,84,.065)!important;--dsh-composer-polymer-stripe:rgba(255,255,255,.42)!important;--dsh-composer-sheen-light:rgba(255,255,255,.18)!important;--dsh-composer-sheen-dark:rgba(64,74,84,.09)!important;--dsh-composer-ambient-light:rgba(255,255,255,.20)!important;--dsh-composer-ambient-dark:rgba(64,74,84,.055)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{position:relative!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-model-control="true"]{position:absolute!important;z-index:6!important;left:12px!important;top:35px!important;width:176px!important;min-width:0!important;display:flex!important;align-items:stretch!important;margin:0!important;padding:0!important;pointer-events:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-model-control="true"]>*{pointer-events:auto!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-model-control="true"]{width:132px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-model-control="true"]{display:none!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-native-model-control="true"]{display:none!important;position:absolute!important;grid-column:auto!important;grid-row:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{position:absolute!important;z-index:30!important;left:auto!important;right:242px!important;top:auto!important;bottom:13px!important;width:176px!important;min-width:0!important;max-width:176px!important;height:28px!important;min-height:0!important;max-height:28px!important;margin:0!important;padding:0!important;display:block!important;grid-column:auto!important;grid-row:auto!important;align-self:auto!important;justify-self:auto!important;pointer-events:auto!important;overflow:visible!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"] *{pointer-events:auto!important;min-width:0!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{right:198px!important;width:132px!important;max-width:132px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{display:none!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace="true"]{left:0!important;top:0!important;width:176px!important;height:122px!important;display:block!important;pointer-events:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-mode-control="true"]{position:absolute!important;left:12px!important;width:max-content!important;max-width:152px!important;margin:0!important;pointer-events:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace-control="true"]{top:10px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-mode-control="true"]{top:52px!important;height:28px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-mode-control="true"]>button{width:max-content!important;max-width:152px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-access-control="true"]{position:absolute!important;z-index:6!important;grid-column:1 / -1!important;grid-row:1 / -1!important;left:-1px!important;top:83px!important;margin:0!important;align-self:auto!important;justify-self:auto!important;pointer-events:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-command-control="true"]{position:absolute!important;z-index:9!important;grid-column:1 / -1!important;grid-row:1 / -1!important;left:179px!important;top:auto!important;bottom:3px!important;margin:0!important;align-self:auto!important;justify-self:auto!important;pointer-events:auto!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace="true"]{width:132px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-mode-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-mode-control="true"]>button{max-width:108px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-command-control="true"]{left:135px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-command-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-access-control="true"]{display:none!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{position:absolute!important;z-index:10!important;grid-column:1 / -1!important;grid-row:1 / -1!important;left:auto!important;right:176px!important;top:auto!important;bottom:6px!important;width:28px!important;min-width:28px!important;max-width:28px!important;height:28px!important;min-height:28px!important;max-height:28px!important;margin:0!important;padding:0!important;align-self:auto!important;justify-self:auto!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{right:132px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-input-scroll]{margin-left:-8px!important;margin-right:-8px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{right:0!important}}`);
		appendSection("shared-surfaces", `html[data-dsh-fairy-selection-lock="true"],html[data-dsh-fairy-selection-lock="true"] *{user-select:none!important;-webkit-user-select:none!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-input-side:176px;--dsh-fairy-input-control-size:28px;--dsh-fairy-input-control-inset:8px;--dsh-fairy-input-control-gap:4px;--dsh-fairy-reasoning-gap:4px}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-command-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-context-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{position:absolute!important;z-index:9!important;grid-column:1 / -1!important;grid-row:1 / -1!important;top:auto!important;bottom:6px!important;height:var(--dsh-fairy-input-control-size)!important;min-height:var(--dsh-fairy-input-control-size)!important;max-height:var(--dsh-fairy-input-control-size)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-command-control="true"]{left:var(--dsh-fairy-input-side)!important;right:auto!important;width:var(--dsh-fairy-input-control-size)!important;min-width:var(--dsh-fairy-input-control-size)!important;max-width:var(--dsh-fairy-input-control-size)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{left:auto!important;right:var(--dsh-fairy-input-side)!important;width:var(--dsh-fairy-input-control-size)!important;min-width:var(--dsh-fairy-input-control-size)!important;max-width:var(--dsh-fairy-input-control-size)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-context-control="true"]{left:auto!important;right:calc(var(--dsh-fairy-input-side) + var(--dsh-fairy-input-control-size) + var(--dsh-fairy-input-control-gap))!important;width:var(--dsh-fairy-input-control-size)!important;min-width:var(--dsh-fairy-input-control-size)!important;max-width:var(--dsh-fairy-input-control-size)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{left:auto!important;right:calc(var(--dsh-fairy-input-side) + (var(--dsh-fairy-input-control-size) * 2) + var(--dsh-fairy-input-control-gap) + var(--dsh-fairy-reasoning-gap))!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-input-side:132px}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-input-side:0px}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-command-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{bottom:var(--dsh-fairy-input-control-inset)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{bottom:calc(var(--dsh-fairy-input-control-inset) - 2px)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{right:calc(var(--dsh-fairy-input-side) + (var(--dsh-fairy-input-control-size) * 2) + var(--dsh-fairy-input-control-gap) + var(--dsh-fairy-reasoning-gap))!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{z-index:30!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-stack="true"][data-dsh-fairy-model-menu-open="true"]{z-index:21!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"][data-dsh-fairy-model-menu-open="true"]{z-index:21!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-input-control-gap:4px;--dsh-fairy-reasoning-gap:4px}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"] .re-model-name,html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"] .re-model-effort,html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"] .re-model-chevron{opacity:.72!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"] .re-model-trigger{width:100%!important;max-width:none!important;justify-content:flex-end!important;text-align:right!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"] .re-model-trigger{gap:8px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"] .re-model-chevron{margin-left:0!important;margin-right:0!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{width:220px!important;max-width:220px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"] .re-model-name{min-width:0!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{width:200px!important;max-width:200px!important}}@media(max-width:760px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{width:176px!important;max-width:176px!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{box-shadow:inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13),-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]{position:absolute!important;z-index:12!important;left:0!important;right:0!important;top:25px!important;width:100%!important;height:20px!important;min-width:0!important;box-sizing:border-box!important;display:block!important;padding:2px 7px!important;border:2px solid transparent!important;border-radius:999px!important;background:linear-gradient(var(--dsh-card-fill,#30353a),var(--dsh-card-fill,#30353a)) padding-box,var(--dsh-card-border,linear-gradient(135deg,#555f68,#3d444b)) border-box!important;box-shadow:inset 1px 1px 0 var(--dsh-card-sheen-light,rgba(255,255,255,.04)),inset -1px -1px 0 var(--dsh-card-sheen-dark,rgba(0,0,0,.14)),2px 3px 8px rgba(0,0,0,.18)!important;pointer-events:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]{--dsh-fairy-scale:100%;appearance:none!important;-webkit-appearance:none!important;display:block!important;width:100%!important;height:12px!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;cursor:pointer!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-runnable-track{height:3px;border-radius:999px;background:linear-gradient(to right,var(--dsw-alias-label-secondary) 0 var(--dsh-fairy-scale),var(--dsw-alias-border-l2) var(--dsh-fairy-scale) 100%)}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;margin-top:-3.5px;border:2px solid var(--dsh-card-fill,#30353a);border-radius:50%;background:var(--dsw-alias-label-secondary);box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]:focus-visible{outline:none}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 2px var(--dsw-alias-brand-primary)}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-track{height:3px;border:0;border-radius:999px;background:var(--dsw-alias-border-l2)}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-progress{height:3px;border-radius:999px;background:var(--dsw-alias-label-secondary)}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-thumb{width:8px;height:8px;border:2px solid var(--dsh-card-fill,#30353a);border-radius:50%;background:var(--dsw-alias-label-secondary);box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-control="true"]:focus-within{box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 35%,transparent),inset 1px 1px 0 var(--dsh-card-sheen-light,rgba(255,255,255,.04)),inset -1px -1px 0 var(--dsh-card-sheen-dark,rgba(0,0,0,.14)),2px 3px 8px rgba(0,0,0,.18)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-mascot-scale-control="true"]{box-shadow:inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08),2px 3px 8px rgba(52,63,73,.10)!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]{top:25px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-control="true"]{display:none!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"]{position:absolute!important;z-index:11!important;right:0!important;top:33px!important;bottom:auto!important;left:auto!important;width:152px!important;height:28px!important;min-width:152px!important;max-width:152px!important;min-height:28px!important;max-height:28px!important;box-sizing:border-box!important;border:2px solid transparent!important;border-radius:999px!important;pointer-events:none!important;background:linear-gradient(#30353a,#30353a) padding-box,linear-gradient(135deg,#555f68 0%,#4e5861 48%,#3d444b 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"]{background:linear-gradient(#f4f5f6,#f4f5f6) padding-box,linear-gradient(135deg,#dfe5e9 0%,#dce2e6 48%,#c1c8ce 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.46),5px 6px 13px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"]{right:-2px!important;width:108px!important;min-width:108px!important;max-width:108px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"]{display:none!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-base="true"]{position:absolute!important;z-index:11!important;right:0!important;top:65px!important;bottom:auto!important;left:auto!important;width:152px!important;height:28px!important;min-width:152px!important;max-width:152px!important;min-height:28px!important;max-height:28px!important;box-sizing:border-box!important;padding:0!important;border:2px solid transparent!important;border-radius:999px!important;pointer-events:none!important;background:linear-gradient(#30353a,#30353a) padding-box,linear-gradient(135deg,#555f68 0%,#4e5861 48%,#3d444b 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-base="true"]{background:linear-gradient(#f4f5f6,#f4f5f6) padding-box,linear-gradient(135deg,#dfe5e9 0%,#dce2e6 48%,#c1c8ce 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.46),5px 6px 13px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{position:absolute!important;inset:5px!important;box-sizing:border-box!important;border-radius:999px!important;background:linear-gradient(#30353a,#30353a)!important;box-shadow:inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{background:linear-gradient(#f4f5f6,#f4f5f6)!important;box-shadow:inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-base="true"]{right:-2px!important;width:108px!important;min-width:108px!important;max-width:108px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-animation-speed-base="true"]{display:none!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-animation-speed-control="true"]{display:block!important;overflow:visible!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-tick]{position:absolute!important;top:50%!important;width:5px!important;height:5px!important;margin:0!important;border:1px solid rgba(255,255,255,.22)!important;border-radius:50%!important;background:#69747c!important;box-shadow:inset 0 1px 1px rgba(0,0,0,.32),0 1px 1px rgba(255,255,255,.04)!important;transform:translate(-50%,-50%)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-tick="0.5"]{left:6px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-tick="1"]{left:50%!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-tick="2"]{left:calc(100% - 6px)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{position:absolute!important;z-index:2!important;top:50%!important;left:50%!important;width:12px!important;height:12px!important;margin:0!important;border:2px solid rgba(255,255,255,.72)!important;border-radius:50%!important;background:radial-gradient(circle at 28% 28%,rgba(255,255,255,.78) 0 9%,transparent 30%),radial-gradient(circle at 72% 68%,rgba(196,113,231,.96) 0 13%,transparent 48%),radial-gradient(circle at 28% 70%,rgba(103,176,243,.96) 0 15%,transparent 52%),radial-gradient(circle at 66% 25%,rgba(247,142,194,.94) 0 16%,transparent 54%),linear-gradient(135deg,#8fcfff 0%,#b997ed 48%,#efa5cc 100%)!important;box-shadow:0 0 0 1px rgba(95,80,150,.30),0 1px 3px rgba(44,49,74,.28),inset 0 1px 1px rgba(255,255,255,.48),inset 0 -1px 1px rgba(70,49,105,.22)!important;transform:translate(-50%,-50%)!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{inset:5px!important}}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-tick]{border-color:rgba(52,63,73,.20)!important;background:#aeb6bc!important;box-shadow:inset 0 1px 1px rgba(255,255,255,.58),0 1px 1px rgba(52,63,73,.10)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{border-color:rgba(255,255,255,.82)!important;background:radial-gradient(circle at 28% 28%,rgba(255,255,255,.68) 0 9%,transparent 30%),radial-gradient(circle at 72% 68%,rgba(190,104,224,.98) 0 13%,transparent 48%),radial-gradient(circle at 28% 70%,rgba(88,157,231,.96) 0 15%,transparent 52%),radial-gradient(circle at 66% 25%,rgba(241,126,187,.96) 0 16%,transparent 54%),linear-gradient(135deg,#8bc9f4 0%,#ae91e2 48%,#eca3c9 100%)!important;box-shadow:0 0 0 1px rgba(95,80,150,.24),0 1px 3px rgba(52,63,73,.18),inset 0 1px 1px rgba(255,255,255,.48),inset 0 -1px 1px rgba(70,49,105,.16)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{position:absolute!important;z-index:11!important;right:12px!important;top:-1px!important;bottom:auto!important;left:auto!important;width:152px!important;height:28px!important;min-width:152px!important;max-width:152px!important;min-height:28px!important;max-height:28px!important;margin:0!important;padding:2px 6px!important;display:flex!important;align-items:center!important;gap:3px!important;box-sizing:border-box!important;border:1px solid rgba(30,39,48,.16)!important;border-radius:999px!important;background:#fff!important;color:#25313b!important;box-shadow:inset 1px 1px 0 rgba(255,255,255,.78),inset -1px -1px 0 rgba(30,39,48,.10),2px 3px 8px rgba(30,39,48,.12)!important;overflow:visible!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-auto-control="true"]{position:relative!important;z-index:3!important;width:16px!important;height:16px!important;min-width:16px!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;color:inherit!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-auto-dot="true"]{display:block!important;width:8px!important;height:8px!important;border-radius:50%!important;background:#d4d8dc!important;box-shadow:inset 0 1px 1px rgba(0,0,0,.12)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-auto-control="true"][data-on="true"] [data-dsh-fairy-auto-dot="true"]{background:#e24b4b!important;box-shadow:0 0 0 2px rgba(226,75,75,.12),inset 0 1px 1px rgba(255,255,255,.24)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-waveform="true"]{display:flex!important;position:relative!important;z-index:1!important;height:18px!important;padding:0 3px!important;gap:1px!important;color:#26343e!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-wave-bar="true"]{width:2px!important;min-width:2px!important;background:currentColor!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-volume-input="true"]{position:absolute!important;z-index:2!important;left:22px!important;right:3px!important;top:0!important;width:auto!important;height:100%!important;margin:0!important;opacity:0!important;cursor:pointer!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [role="tooltip"]{transform:translateY(11px)!important;font-size:11px!important;font-weight:650!important;line-height:16px!important;padding:2px 6px!important;border:1px solid #c1c8ce!important;border-radius:999px!important;background:#f4f5f6!important;color:#293139!important;box-shadow:-3px -3px 7px rgba(255,255,255,.46),4px 5px 10px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{border-color:transparent!important;background:#30353a!important;color:#f1f6fa!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [role="tooltip"]{border-color:#555f68!important;background:#30353a!important;color:#f1f6fa!important;box-shadow:-3px -3px 7px rgba(255,255,255,.06),4px 5px 10px rgba(0,0,0,.16),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-wave-bar="true"]{--dsh-fairy-wave-opacity:.72!important;color:#f1f6fa!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-wave-bar="true"][data-active="true"]{--dsh-fairy-wave-opacity:1!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-auto-dot="true"]{background:#e9f0f5!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-on="true"] [data-dsh-fairy-auto-dot="true"]{background:#e24b4b!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-voice-control="true"]{right:10px!important;width:108px!important;min-width:108px!important;max-width:108px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-voice-control="true"]{right:8px!important;top:10px!important;bottom:auto!important;width:116px!important;min-width:116px!important;max-width:116px!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{pointer-events:auto!important;touch-action:none!important;cursor:grab!important;user-select:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"][data-dragging="true"]{cursor:grabbing!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{transition:left 180ms cubic-bezier(.2,.8,.2,1),transform 120ms ease,box-shadow 120ms ease!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"][data-dragging="true"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{transition:left 40ms linear,transform 80ms ease!important;transform:translate(-50%,-50%) scale(1.12)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-position="0"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{left:6px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-position="0.5"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{left:50%!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-position="1"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{left:calc(100% - 6px)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-animation-speed-tick="0.5"],html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-animation-speed-tick="2"]{display:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-animation-speed-tick="0.7"]{left:6px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-animation-speed-tick="1.5"]{left:calc(100% - 6px)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{background:linear-gradient(#30353a,#30353a)!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.12),inset 0 -1px 2px rgba(0,0,0,.42)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{background:linear-gradient(#f4f5f6,#f4f5f6)!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.52),inset 0 -1px 2px rgba(52,63,73,.22)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-wave-bar="true"]{width:2px!important;min-width:0!important;max-width:2px!important;flex:1 1 2px!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{--dsh-card-fill:#30353a;--dsh-card-grain-light:rgba(255,255,255,.055);--dsh-card-grain-dark:rgba(0,0,0,.038);--dsh-card-sheen-light:rgba(255,255,255,.028);--dsh-card-sheen-dark:rgba(0,0,0,.024);--dsh-card-border:linear-gradient(135deg,#555f68 0%,#4e5861 48%,#3d444b 100%);border-style:solid!important;border-width:2px!important;border-color:transparent!important;background:linear-gradient(var(--dsh-card-fill),var(--dsh-card-fill)) padding-box,var(--dsh-card-border) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{background-image:radial-gradient(circle at 1px 1px,var(--dsh-card-grain-light) 0 .34px,transparent .68px),radial-gradient(circle at 2px 3px,var(--dsh-card-grain-dark) 0 .34px,transparent .72px),linear-gradient(135deg,var(--dsh-card-sheen-light),transparent 48%,var(--dsh-card-sheen-dark)),linear-gradient(var(--dsh-card-fill),var(--dsh-card-fill)),var(--dsh-card-border)!important;background-size:4px 4px,7px 7px,100% 100%,100% 100%,100% 100%!important;background-position:0 0,1px 2px,0 0,0 0,0 0!important;background-repeat:repeat,repeat,no-repeat,no-repeat,no-repeat!important;background-clip:padding-box,padding-box,padding-box,padding-box,border-box!important;background-origin:padding-box,padding-box,padding-box,padding-box,border-box!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{--dsh-card-fill:#f4f5f6;--dsh-card-grain-light:rgba(255,255,255,.12);--dsh-card-grain-dark:rgba(74,87,98,.048);--dsh-card-sheen-light:rgba(255,255,255,.085);--dsh-card-sheen-dark:rgba(74,87,98,.032);--dsh-card-border:linear-gradient(135deg,#dfe5e9 0%,#dce2e6 48%,#c1c8ce 100%);color:#293139!important;box-shadow:-4px -4px 9px rgba(255,255,255,.46),5px 6px 13px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]:is(:hover,:focus-visible){--dsh-card-sheen-light:rgba(255,255,255,.13)}`);
		appendSection("composer", `html[data-dsh-fairy-visual][data-dsh-fairy-modal-open] [data-dsh-fairy-overlay-layer="true"],html[data-dsh-fairy-visual][data-dsh-fairy-modal-open] [data-dsh-fairy-composer-dock="true"]{z-index:1!important}html[data-dsh-fairy-visual][data-dsh-fairy-modal-open] [data-dsh-fairy-sidebar-layer="true"]::after{z-index:0!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual]{--dsh-input-substrate:#07101c;--dsh-input-grid:rgba(100,210,255,.0294);--dsh-input-glow-a:rgba(96,212,255,.27);--dsh-input-glow-a-fade:rgba(54,184,255,.135);--dsh-input-glow-b:rgba(157,132,255,.23);--dsh-input-glow-b-fade:rgba(119,91,255,.115);--dsh-input-glow-c:rgba(174,112,255,.24);--dsh-input-glow-c-fade:rgba(143,94,255,.12);--dsh-input-substrate-image:radial-gradient(ellipse 50vmax 26vh at 5.4vmax 17.65vh,var(--dsh-input-glow-c),var(--dsh-input-glow-c-fade) 53%,transparent 100%),radial-gradient(ellipse 53vmax 37vh at calc(100vw - 7.15vmax) 73.2vh,var(--dsh-input-glow-b),var(--dsh-input-glow-b-fade) 53%,transparent 100%),radial-gradient(ellipse 56vmax 29vh at calc(100vw - 13.26vmax) 12.8vh,var(--dsh-input-glow-a),var(--dsh-input-glow-a-fade) 52%,transparent 100%),linear-gradient(var(--dsh-input-grid) 1.5px,transparent 1.5px),linear-gradient(90deg,var(--dsh-input-grid) 1.5px,transparent 1.5px)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"]{--dsh-input-substrate:#f7fafc;--dsh-input-grid:rgba(34,126,166,.0385);--dsh-input-glow-a:rgba(48,180,229,.22);--dsh-input-glow-a-fade:rgba(54,184,255,.10);--dsh-input-glow-b:rgba(139,115,241,.17);--dsh-input-glow-b-fade:rgba(119,91,255,.078);--dsh-input-glow-c:rgba(154,91,233,.17);--dsh-input-glow-c-fade:rgba(143,94,233,.075)}html[data-dsh-fairy-visual][data-dsh-fairy-theme] [data-dsh-fairy-composer-dock="true"] [data-input-scroll]{background-color:var(--dsh-input-substrate)!important;background-image:var(--dsh-input-substrate-image)!important;background-attachment:fixed!important;background-position:0 0!important;background-repeat:no-repeat,no-repeat,no-repeat,repeat,repeat!important;background-size:auto,auto,auto,48px 48px,48px 48px!important;border-color:transparent!important;box-shadow:inset 0 12px 19px -18px rgba(0,0,0,.82),inset 0 -8px 15px -14px rgba(0,0,0,.58),inset 7px 0 14px -13px rgba(0,0,0,.56),inset -7px 0 14px -13px rgba(0,0,0,.56)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-input-scroll] textarea,html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-input-scroll] [contenteditable="true"]{background:transparent!important;background-color:transparent!important;background-image:none!important;border-color:transparent!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-material="true"]{filter:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-history-surface="true"]::after{display:block!important;content:''!important;position:absolute!important;z-index:3!important;inset:0!important;pointer-events:none!important;border-radius:10px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:inset 0 0 7px -2px var(--dsh-history-cutout-contact),inset 7px 7px 16px -10px var(--dsh-history-cutout-shadow),inset -4px -4px 10px -7px var(--dsh-history-cutout-ambient)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-layer="true"]::before{opacity:0!important}html[data-dsh-fairy-visual] [data-dsh-fairy-sidebar-layer="true"][data-dsh-fairy-sidebar-geometry="ready"]::before{opacity:1!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"][data-dsh-fairy-composer-attachments-active="true"] [data-input-scroll]{box-shadow:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"][data-dsh-fairy-composer-attachments-active="true"]::after{content:''!important;position:absolute!important;z-index:1!important;left:var(--dsh-fairy-composer-hole-contact-left)!important;top:var(--dsh-fairy-composer-hole-contact-top)!important;width:var(--dsh-fairy-composer-hole-contact-width)!important;height:var(--dsh-fairy-composer-hole-contact-height)!important;box-sizing:border-box!important;pointer-events:none!important;border-radius:10px!important;background:transparent!important;box-shadow:inset 0 12px 19px -18px rgba(0,0,0,.82),inset 0 -8px 15px -14px rgba(0,0,0,.58),inset 7px 0 14px -13px rgba(0,0,0,.56),inset -7px 0 14px -13px rgba(0,0,0,.56)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"][data-dsh-fairy-composer-attachments-active="true"]::after{background-color:var(--dsh-input-substrate)!important;background-image:var(--dsh-input-substrate-image)!important;background-attachment:fixed!important;background-position:0 0!important;background-repeat:no-repeat,no-repeat,no-repeat,repeat,repeat!important;background-size:auto,auto,auto,48px 48px,48px 48px!important}`);
		appendSection("themes", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .dsh-hdd-glow-a{background:radial-gradient(ellipse 56vmax 29vh at 46% 48%,rgba(96,212,255,.27),rgba(54,184,255,.135) 52%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .dsh-hdd-glow-b{background:radial-gradient(ellipse 53vmax 37vh at 55% 52%,rgba(157,132,255,.23),rgba(119,91,255,.115) 53%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] .dsh-hdd-glow-c{background:radial-gradient(ellipse 50vmax 26vh at 54% 49%,rgba(174,112,255,.24),rgba(143,94,255,.12) 53%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-glow-a{background:radial-gradient(ellipse 56vmax 29vh at 46% 48%,rgba(48,180,229,.22),rgba(54,184,255,.10) 52%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-glow-b{background:radial-gradient(ellipse 53vmax 37vh at 55% 52%,rgba(139,115,241,.17),rgba(119,91,255,.078) 53%,transparent 100%)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] .dsh-hdd-glow-c{background:radial-gradient(ellipse 50vmax 26vh at 54% 49%,rgba(154,91,233,.17),rgba(143,94,233,.075) 53%,transparent 100%)}`);
		appendSection("shared-surfaces", `html[data-dsh-fairy-visual] [data-dsh-fairy-native-new-session="true"]{transition:filter 90ms ease,transform 90ms ease}html[data-dsh-fairy-visual] [data-dsh-fairy-native-new-session="true"]:active{filter:brightness(.84)!important;transform:translateY(1px)!important}`);
		appendSection("shared-surfaces", `@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-control="true"]{display:block!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]{top:31px!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]{box-shadow:-4px -4px 9px rgba(255,255,255,.46),5px 6px 13px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]{height:24px!important;padding:2px 6px!important;overflow:hidden!important;--dsh-fairy-scale-track:#8ea6b5;--dsh-fairy-scale-track-rest:rgba(82,112,132,.24)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-mascot-scale-control="true"]{--dsh-fairy-scale-track:#a8bac9;--dsh-fairy-scale-track-rest:rgba(168,186,201,.24)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]{position:absolute!important;left:16px!important;right:16px!important;top:50%!important;transform:translateY(-50%)!important;width:auto!important;height:16px!important;margin:0!important;box-sizing:border-box!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-runnable-track{height:5px!important;background:linear-gradient(to right,var(--dsh-fairy-scale-track) 0 var(--dsh-fairy-scale),var(--dsh-fairy-scale-track-rest) var(--dsh-fairy-scale) 100%)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-thumb{margin-top:-2.5px!important;background:var(--dsh-fairy-scale-track)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-track{height:5px!important;background:var(--dsh-fairy-scale-track-rest)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-progress{height:5px!important;background:var(--dsh-fairy-scale-track)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-thumb{background:var(--dsh-fairy-scale-track)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]{position:absolute!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]::before{content:''!important;position:absolute!important;z-index:0!important;left:16px!important;right:16px!important;top:50%!important;height:5px!important;transform:translateY(-50%)!important;border-radius:999px!important;background:linear-gradient(to right,var(--dsh-fairy-scale-track) 0 var(--dsh-fairy-scale),var(--dsh-fairy-scale-track-rest) var(--dsh-fairy-scale) 100%)!important;pointer-events:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]{z-index:1!important;background:transparent!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-runnable-track,html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-track,html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-progress{background:transparent!important}`);
		appendSection("themes", `html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-control="true"]{--dsh-fairy-scale-track:#7898aa;--dsh-fairy-scale-track-rest:rgba(82,112,132,.30)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-mascot-scale-control="true"]{--dsh-fairy-scale-track:#9eb5c4;--dsh-fairy-scale-track-rest:rgba(158,181,196,.30)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-thumb{background:var(--dsh-fairy-scale-track)!important;border:2px solid var(--dsh-card-fill,#f4f5f6)!important;box-shadow:0 0 0 1px var(--dsh-fairy-scale-track)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-thumb{background:var(--dsh-fairy-scale-track)!important;border:2px solid var(--dsh-card-fill,#f4f5f6)!important;box-shadow:0 0 0 1px var(--dsh-fairy-scale-track)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-runnable-track{background:transparent!important;background-image:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-track,html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-progress{background:transparent!important;background-image:none!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-thumb{-webkit-appearance:none!important;width:10px!important;height:10px!important;background-color:#fff!important;background-image:none!important;opacity:1!important;border:2px solid #7898aa!important;box-shadow:0 0 0 1px rgba(82,112,132,.42)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-thumb{width:10px!important;height:10px!important;background-color:#fff!important;background-image:none!important;opacity:1!important;border:2px solid #7898aa!important;box-shadow:0 0 0 1px rgba(82,112,132,.42)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]{position:static!important;display:block!important;width:100%!important;height:16px!important;margin:0!important;transform:none!important;z-index:1!important;background:transparent!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-runnable-track,html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-track,html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-progress{background:transparent!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-composer-wing:176px;--dsh-fairy-composer-voice-width:152px;--dsh-fairy-composer-voice-inset:12px;--dsh-fairy-composer-voice-right:calc(var(--dsh-fairy-composer-wing) + var(--dsh-fairy-composer-voice-inset) + 5px);--dsh-fairy-input-side:var(--dsh-fairy-composer-wing);--dsh-fairy-input-control-gap:4px;--dsh-fairy-reasoning-gap:4px;--dsh-fairy-composer-reasoning-width:220px;grid-template-columns:minmax(var(--dsh-fairy-composer-wing),max-content) minmax(0,1fr) minmax(var(--dsh-fairy-composer-wing),max-content)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-model-control="true"]{left:12px!important;width:var(--dsh-fairy-composer-wing)!important;max-width:var(--dsh-fairy-composer-wing)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace="true"]{width:var(--dsh-fairy-composer-wing)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-workspace-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-mode-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-mode-control="true"]>button{max-width:calc(var(--dsh-fairy-composer-wing) - 24px)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-command-control="true"]{left:var(--dsh-fairy-composer-wing)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-send-control="true"]{right:var(--dsh-fairy-composer-wing)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-context-control="true"]{right:calc(var(--dsh-fairy-composer-wing) + var(--dsh-fairy-input-control-size) + var(--dsh-fairy-input-control-gap))!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{right:calc(var(--dsh-fairy-composer-wing) + (var(--dsh-fairy-input-control-size) * 2) + var(--dsh-fairy-input-control-gap) + var(--dsh-fairy-reasoning-gap))!important;width:var(--dsh-fairy-composer-reasoning-width)!important;max-width:var(--dsh-fairy-composer-reasoning-width)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{right:var(--dsh-fairy-composer-voice-right)!important;width:var(--dsh-fairy-composer-voice-width)!important;min-width:var(--dsh-fairy-composer-voice-width)!important;max-width:var(--dsh-fairy-composer-voice-width)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"] [data-dsh-fairy-volume-input="true"]{right:3px!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-composer-wing:132px;--dsh-fairy-composer-voice-width:108px;--dsh-fairy-composer-voice-inset:10px;--dsh-fairy-composer-reasoning-width:200px}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-composer-wing:0px;--dsh-fairy-composer-voice-width:0px;--dsh-fairy-composer-voice-inset:8px;--dsh-fairy-composer-reasoning-width:0px;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{display:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-model-control="true"],html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-reasoning-control="true"]{display:none!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-reasoning-gap:3px!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-composer-voice-right:12px!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-composer-voice-right:10px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"]{--dsh-fairy-composer-voice-right:8px!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"]{position:absolute!important;z-index:11!important;right:0!important;top:33px!important;bottom:auto!important;left:auto!important;width:152px!important;height:28px!important;min-width:152px!important;max-width:152px!important;min-height:28px!important;max-height:28px!important;box-sizing:border-box!important;padding:0!important;border:2px solid transparent!important;border-radius:999px!important;background:linear-gradient(#30353a,#30353a) padding-box,linear-gradient(135deg,#555f68 0%,#4e5861 48%,#3d444b 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important;pointer-events:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-control="true"]{position:absolute!important;inset:5px!important;width:auto!important;height:auto!important;min-width:0!important;max-width:none!important;min-height:0!important;max-height:none!important;box-sizing:border-box!important;padding:0!important;border:1px solid rgba(0,0,0,.42)!important;border-radius:999px!important;background:linear-gradient(to right,var(--dsh-fairy-scale-fill,#08090b) 0 var(--dsh-fairy-scale,100%),var(--dsh-fairy-scale-rest,#7d8790) var(--dsh-fairy-scale,100%) 100%)!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.12),inset 0 -1px 2px rgba(0,0,0,.42)!important;overflow:hidden!important;pointer-events:auto!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-input="true"]{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;appearance:none!important;-webkit-appearance:none!important;background:transparent!important;opacity:0!important;cursor:pointer!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-runnable-track,html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-track,html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-progress{height:100%!important;background:transparent!important;border:0!important}html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-input="true"]::-webkit-slider-thumb,html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-input="true"]::-moz-range-thumb{width:0!important;height:0!important;border:0!important;background:transparent!important;box-shadow:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]:focus-within{box-shadow:0 0 0 2px rgba(255,255,255,.28),inset 0 1px 2px rgba(255,255,255,.12),inset 0 -1px 2px rgba(0,0,0,.42)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"]{background:linear-gradient(#f4f5f6,#f4f5f6) padding-box,linear-gradient(135deg,#dfe5e9 0%,#dce2e6 48%,#c1c8ce 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.46),5px 6px 13px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]{--dsh-fairy-scale-rest:#aeb6bc;border-color:rgba(52,63,73,.34)!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.52),inset 0 -1px 2px rgba(52,63,73,.22)!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"]{right:-2px!important;width:108px!important;min-width:108px!important;max-width:108px!important}}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-mascot-scale-base="true"]{display:none!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-control="true"]{--dsh-fairy-scale-fill:#000000!important;--dsh-fairy-scale-rest:#cfd2d5!important;border:0!important;box-shadow:none!important;background:linear-gradient(to right,#000000 0 var(--dsh-fairy-scale,100%),#cfd2d5 var(--dsh-fairy-scale,100%) 100%)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-control="true"]::before,html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-control="true"]::after{display:none!important;content:none!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-control="true"]:focus-within{box-shadow:none!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-control="true"]{--dsh-fairy-scale-rest:#cfd2d5!important;--dsh-fairy-scale-gradient-start:#8bb9c8;--dsh-fairy-scale-gradient-blue:#36519a;--dsh-fairy-scale-gradient-purple:#624d9f;--dsh-fairy-scale-gradient-end:#b26b99;--dsh-fairy-scale-inset-shadow:inset 0 0 6px rgba(52,63,73,.48);background-image:linear-gradient(to right,transparent 0 var(--dsh-fairy-scale,100%),#cfd2d5 var(--dsh-fairy-scale,100%) 100%),radial-gradient(ellipse 38% 170% at 15% 18%,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 70%),radial-gradient(ellipse 42% 150% at 40% 90%,rgba(36,82,186,.28) 0%,rgba(36,82,186,0) 72%),radial-gradient(ellipse 36% 150% at 68% 24%,rgba(190,107,232,.25) 0%,rgba(190,107,232,0) 72%),radial-gradient(ellipse 34% 160% at 91% 82%,rgba(255,180,220,.28) 0%,rgba(255,180,220,0) 70%),linear-gradient(to right,var(--dsh-fairy-scale-gradient-start) 0%,var(--dsh-fairy-scale-gradient-blue) 34%,var(--dsh-fairy-scale-gradient-purple) 67%,var(--dsh-fairy-scale-gradient-end) 100%)!important;background-color:#cfd2d5!important;background-repeat:no-repeat!important;box-shadow:var(--dsh-fairy-scale-inset-shadow)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-control="true"]{--dsh-fairy-scale-gradient-start:#d6f5ff;--dsh-fairy-scale-gradient-blue:#7897d8;--dsh-fairy-scale-gradient-purple:#b29be8;--dsh-fairy-scale-gradient-end:#f7bbdc;--dsh-fairy-scale-inset-shadow:inset 0 0 6px rgba(52,63,73,.48)}html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"] [data-dsh-fairy-mascot-scale-control="true"]{--dsh-fairy-scale-gradient-start:#8bb9c8;--dsh-fairy-scale-gradient-blue:#36519a;--dsh-fairy-scale-gradient-purple:#624d9f;--dsh-fairy-scale-gradient-end:#b26b99;--dsh-fairy-scale-inset-shadow:inset 0 0 6px rgba(0,0,0,.68)}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"]{top:39px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-base="true"]{top:79px!important}@media(max-width:900px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-scale-base="true"]{top:39px!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-base="true"]{top:79px!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{overflow:hidden!important;box-shadow:inset 0 2px 3px rgba(0,0,0,.24),inset 0 -2px 3px rgba(255,255,255,.16)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{box-shadow:inset 0 2px 3px rgba(52,63,73,.18),inset 0 -2px 3px rgba(255,255,255,.65)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{box-shadow:inset 0 2px 3px rgba(0,0,0,.30),inset 0 -1px 2px rgba(0,0,0,.16)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{box-shadow:inset 0 2px 3px rgba(52,63,73,.22),inset 0 -1px 2px rgba(52,63,73,.10)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{border-color:rgba(48,53,58,.94)!important;background:radial-gradient(circle at 28% 28%,rgba(255,255,255,.34) 0 9%,transparent 30%),radial-gradient(circle at 72% 68%,rgba(196,113,231,.96) 0 13%,transparent 48%),radial-gradient(circle at 28% 70%,rgba(103,176,243,.96) 0 15%,transparent 52%),radial-gradient(circle at 66% 25%,rgba(247,142,194,.94) 0 16%,transparent 54%),linear-gradient(135deg,#8fcfff 0%,#b997ed 48%,#efa5cc 100%)!important;box-shadow:0 0 0 1px rgba(15,18,22,.72),0 1px 3px rgba(0,0,0,.46),inset 0 1px 1px rgba(255,255,255,.18),inset 0 -1px 1px rgba(20,16,32,.38)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-control="true"]{overflow:visible!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{z-index:5!important;box-sizing:border-box!important;width:16px!important;height:16px!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-mascot-animation-speed-thumb="1"]{border-color:rgba(112,124,137,.72)!important;box-shadow:0 0 0 1px rgba(82,94,107,.28),0 1px 3px rgba(0,0,0,.34),inset 0 1px 1px rgba(255,255,255,.18),inset 0 -1px 1px rgba(20,16,32,.28)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-attachments="true"]>*{position:relative!important;z-index:2!important;grid-column:2!important;grid-row:1!important;min-width:0!important;align-self:start!important;justify-self:stretch!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"][data-dsh-fairy-composer-attachments-active="true"]{grid-template-rows:auto minmax(0,1fr)!important}@media(max-width:620px){html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"][data-dsh-fairy-composer-attachments-active="true"]{grid-template-rows:auto minmax(0,1fr)!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-attachments="true"]>*{grid-column:1!important;grid-row:1!important}html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-composer-card="true"][data-dsh-fairy-composer-attachments-active="true"] [data-input-scroll]{grid-column:1!important;grid-row:2!important}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{border:2px solid transparent!important;border-radius:999px!important;background:linear-gradient(#30353a,#30353a) padding-box,linear-gradient(135deg,#555f68 0%,#4e5861 48%,#3d444b 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{background:linear-gradient(#f4f5f6,#f4f5f6) padding-box,linear-gradient(135deg,#dfe5e9 0%,#dce2e6 48%,#c1c8ce 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.46),5px 6px 13px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual][data-dsh-fairy-theme="dark"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{border:2px solid transparent!important;background:linear-gradient(#30353a,#30353a) padding-box,linear-gradient(135deg,#555f68 0%,#4e5861 48%,#3d444b 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.06),5px 6px 13px rgba(0,0,0,.13),inset 1px 1px 0 rgba(255,255,255,.03),inset -1px -1px 0 rgba(0,0,0,.13)!important}html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-composer-dock="true"] [data-dsh-fairy-composer-voice-control="true"]{border:2px solid transparent!important;background:linear-gradient(#f4f5f6,#f4f5f6) padding-box,linear-gradient(135deg,#dfe5e9 0%,#dce2e6 48%,#c1c8ce 100%) border-box!important;box-shadow:-4px -4px 9px rgba(255,255,255,.46),5px 6px 13px rgba(52,63,73,.10),inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(52,63,73,.08)!important}`);
		appendSection("hero", `.dsh-fairy-hero-host{width:100vw}.dsh-fairy-hero-projection-svg{top:-2px;transform:translateX(2px)}.dsh-fairy-hero-sub{transform:translateY(-8px)}.dsh-fairy-hero-sub::before,.dsh-fairy-hero-sub::after{width:240px}@media(max-width:520px){.dsh-fairy-hero-projection-svg{top:1px}.dsh-fairy-hero-sub{transform:translateX(2px)}.dsh-fairy-hero-sub::before,.dsh-fairy-hero-sub::after{width:170px}}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-question-key],html[data-dsh-fairy-visual] [data-approval-key],html[data-dsh-fairy-visual] [data-plan-review-key]{position:fixed!important;left:50%!important;right:auto!important;bottom:calc(var(--dsh-fairy-composer-dock-height,132px) + 12px)!important;top:auto!important;transform:translateX(-50%)!important;width:min(640px,calc(100vw - 32px))!important;min-width:0!important;max-width:calc(100vw - 32px)!important;max-height:min(70vh,calc(100dvh - 180px))!important;overflow-y:auto!important;overflow-x:hidden!important;z-index:60!important;pointer-events:auto!important;visibility:visible!important;opacity:1!important}html[data-dsh-fairy-visual] [data-question-key] *,html[data-dsh-fairy-visual] [data-approval-key] *,html[data-dsh-fairy-visual] [data-plan-review-key] *{pointer-events:auto!important}html[data-dsh-fairy-visual] [data-question-scroll],html[data-dsh-fairy-visual] [data-approval-scroll],html[data-dsh-fairy-visual] [data-plan-review-scroll]{min-height:0!important;overflow-y:auto!important}`);
		appendSection("composer", `html[data-dsh-fairy-visual] [data-question-key],html[data-dsh-fairy-visual] [data-approval-key],html[data-dsh-fairy-visual] [data-plan-review-key]{--dsw-specific-sidebar-nav-item-active-accent:#14304d!important}html[data-dsh-fairy-visual] [data-question-key] [class*="_badge"],html[data-dsh-fairy-visual] [data-approval-key] [class*="_badge"],html[data-dsh-fairy-visual] [data-plan-review-key] [class*="_badge"]{background:var(--dsw-specific-sidebar-nav-item-active-accent)!important;color:#fff!important}`);
		el.textContent = cssSections.map(({ css }) => css).join("");
		(document.head || document.documentElement).appendChild(el);
	}
	var init_style = __esmMin((() => {
		init_constants();
	}));

//#endregion
//#region ../../fairy-contracts/client-dom.cjs
	var require_client_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const FAIRY_VOICE_CONTROL_ATTRIBUTE = "data-dsh-fairy-voice-control";
		module.exports = { FAIRY_VOICE_CONTROL_ATTRIBUTE };
	}));

//#endregion
//#region src/client/dom-adapter.js
	var require_dom_adapter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { FAIRY_VOICE_CONTROL_ATTRIBUTE } = require_client_dom();
		const diagnostics = { warn(operation, context = {}, error) {
			console.warn(`DSH_FAIRY_LOG ${JSON.stringify({
				schema: 1,
				timestamp: (/* @__PURE__ */ new Date()).toISOString(),
				level: "warn",
				module: "dsh-fairy-visual",
				operation,
				event: error ? "failure" : "event",
				context,
				...error ? { error: {
					name: String(error.name || "Error"),
					message: String(error.message || error).slice(0, 320)
				} } : {}
			})}`);
		} };
		const OFFICIAL_SLOT_VALUES = Object.freeze({ composerAttachments: "conversation.input.attachments" });
		const VOICE_CONTROL_FALLBACK_SELECTOR = "[aria-label=\"Fairy 朗读控制\"],input[aria-label=\"朗读音量\"]";
		const ARIA_LABELS = Object.freeze({
			sessionTree: Object.freeze({
				zh: Object.freeze(["会话"]),
				en: Object.freeze(["Sessions"])
			}),
			newSession: Object.freeze({
				zh: Object.freeze(["新建会话"]),
				en: Object.freeze(["New session", "New Session"])
			}),
			openSidebar: Object.freeze({
				zh: Object.freeze(["打开侧边栏"]),
				en: Object.freeze(["Open sidebar"])
			}),
			collapseSidebar: Object.freeze({
				zh: Object.freeze(["收起侧边栏"]),
				en: Object.freeze(["Collapse sidebar"])
			}),
			send: Object.freeze({
				zh: Object.freeze([
					"发送消息",
					"停止生成",
					"停止"
				]),
				en: Object.freeze([
					"Send message",
					"Stop generating",
					"Stop"
				])
			}),
			sendOnly: Object.freeze({
				zh: Object.freeze(["发送消息"]),
				en: Object.freeze(["Send message"])
			}),
			context: Object.freeze({
				zh: Object.freeze(["上下文"]),
				en: Object.freeze(["Context"])
			}),
			command: Object.freeze({
				zh: Object.freeze(["命令"]),
				en: Object.freeze(["Commands", "Command"])
			}),
			access: Object.freeze({
				zh: Object.freeze(["访问模式"]),
				en: Object.freeze(["Access mode"])
			}),
			model: Object.freeze({
				zh: Object.freeze(["选择模型"]),
				en: Object.freeze(["Select model"])
			}),
			reasoning: Object.freeze({
				zh: Object.freeze(["模型 "]),
				en: Object.freeze(["Model "])
			}),
			workspace: Object.freeze({
				zh: Object.freeze(["选择工作区"]),
				en: Object.freeze(["Choose workspace"])
			}),
			balance: Object.freeze({
				zh: Object.freeze(["DeepSeek 余额"]),
				en: Object.freeze(["DeepSeek balance"])
			}),
			undo: Object.freeze({
				zh: Object.freeze(["撤销当前版本效果"]),
				en: Object.freeze(["Undo current version effect"])
			}),
			redo: Object.freeze({
				zh: Object.freeze(["重施加下一版本效果"]),
				en: Object.freeze(["Redo next version effect"])
			}),
			toBottom: Object.freeze({
				zh: Object.freeze(["回到底部"]),
				en: Object.freeze(["Back to bottom"])
			})
		});
		function labelsFor(key) {
			const labels = ARIA_LABELS[key];
			return labels ? [...new Set(Object.values(labels).flat())] : [];
		}
		const ARIA_FUZZY_KEYWORDS = Object.freeze({ sessionTree: Object.freeze([
			"会话",
			"sessions",
			"session"
		]) });
		function ariaLabelSelector(key, { base = "*", match = "exact", suffix = "" } = {}) {
			const attribute = match === "prefix" ? "aria-label^" : "aria-label";
			return labelsFor(key).map((label) => `${base}[${attribute}="${label}"]${suffix}`).join(",");
		}
		function joinSelectors(...selectors) {
			return selectors.filter(Boolean).join(",");
		}
		function appendSelectorSuffix(selector, suffix) {
			return selector.split(",").map((part) => `${part}${suffix}`).join(",");
		}
		function localeOf(value) {
			const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
			if (normalized.startsWith("zh")) return "zh";
			if (normalized.startsWith("en")) return "en";
			return null;
		}
		function detectCurrentLanguage(doc = document, navigatorRef = typeof navigator === "undefined" ? void 0 : navigator) {
			const treeLabel = query(doc, "[role=\"tree\"]")?.getAttribute?.("aria-label");
			for (const [locale, labels] of Object.entries(ARIA_LABELS.sessionTree)) if (labels.includes(treeLabel)) return locale;
			return localeOf(doc?.documentElement?.lang) || localeOf(navigatorRef?.language) || "zh";
		}
		function onLanguageChange(callback, doc = document, navigatorRef = typeof navigator === "undefined" ? void 0 : navigator) {
			const root = doc?.documentElement;
			if (!root || typeof MutationObserver === "undefined") return () => {};
			let current = detectCurrentLanguage(doc, navigatorRef);
			const observer = new MutationObserver(() => {
				const next = detectCurrentLanguage(doc, navigatorRef);
				if (next === current) return;
				current = next;
				callback(next);
			});
			observer.observe(root, {
				attributes: true,
				attributeFilter: ["lang"]
			});
			return () => observer.disconnect();
		}
		const OFFICIAL_SELECTORS = Object.freeze({
			rootSlot: "body > #root > [data-slot=\"root\"]",
			rootSurface: "[data-slot=\"root\"]",
			sidebar: "[data-slot=\"sidebar\"]",
			sidebarResizeHandle: "[data-side=\"sidebar\"]",
			conversation: "[data-slot=\"conversation\"]",
			shellOverlay: "[data-slot=\"shell.overlay\"]",
			settingsDialog: "[data-slot=\"sidebar.settings\"] [role=\"dialog\"]",
			phaseHero: "[data-phase=\"hero\"]",
			phaseActive: "[data-phase=\"active\"]",
			phaseAny: "[data-phase]",
			composerSeat: "[data-composer-seat]",
			composerCard: "[data-composer-card=\"true\"]",
			composerTextarea: "textarea",
			composerAttachmentsSlot: `[data-slot="${OFFICIAL_SLOT_VALUES.composerAttachments}"]`,
			conversationScroll: "[data-conversation-scroll]",
			inputScroll: "[data-input-scroll]",
			conversationComposerDock: "[data-slot=\"conversation.composer.dock\"]",
			chatFlow: "[data-chat-flow]",
			sessionTree: ariaLabelSelector("sessionTree", { base: "[role=\"tree\"]" }),
			sessionItem: "[role=\"treeitem\"]",
			expandedSessionItem: "[role=\"treeitem\"][aria-expanded=\"true\"]",
			selectedSessionItem: "[role=\"treeitem\"][aria-selected=\"true\"]",
			sidebarBrandMark: "[data-slot=\"sidebar.brand.mark\"]",
			openSidebar: ariaLabelSelector("openSidebar", { base: "body > #root > [data-slot=\"root\"] button" }),
			collapseSidebar: ariaLabelSelector("collapseSidebar", { base: "body > #root > [data-slot=\"root\"] button" }),
			newSession: ariaLabelSelector("newSession", { base: "button" }),
			sessionHeader: "[data-slot=\"conversation.session.header\"]",
			sessionHeaderActions: "[data-slot=\"conversation.session.header.actions\"]",
			sessionHeaderUtilities: "[data-slot=\"conversation.session.header.utilities\"]",
			send: ariaLabelSelector("send", { base: "button" }),
			sendOnly: ariaLabelSelector("sendOnly", { base: "button" }),
			context: ariaLabelSelector("context", {
				base: "button",
				match: "prefix"
			}),
			voice: `[${FAIRY_VOICE_CONTROL_ATTRIBUTE}],${VOICE_CONTROL_FALLBACK_SELECTOR}`,
			command: ariaLabelSelector("command", { base: "button" }),
			access: ariaLabelSelector("access", {
				base: "button",
				match: "prefix"
			}),
			model: joinSelectors(ariaLabelSelector("model", {
				base: "select",
				match: "prefix"
			}), ariaLabelSelector("model", {
				base: "button",
				match: "prefix"
			})),
			reasoning: ariaLabelSelector("reasoning", {
				base: "button",
				match: "prefix",
				suffix: "[aria-haspopup=\"menu\"]"
			}),
			workspace: ariaLabelSelector("workspace", { base: "button" }),
			balance: ariaLabelSelector("balance", {
				base: "[data-slot=\"sidebar.footer.action\"] *",
				match: "prefix"
			}),
			undo: ariaLabelSelector("undo", { base: "button" }),
			redo: ariaLabelSelector("redo", { base: "button" }),
			toBottom: ariaLabelSelector("toBottom", { base: "button" }),
			headerElement: ":scope > header"
		});
		const OFFICIAL_ATTRIBUTES = Object.freeze({
			slot: "data-slot",
			phase: "data-phase",
			composerSeat: "data-composer-seat",
			composerCard: "data-composer-card",
			conversationScroll: "data-conversation-scroll",
			inputScroll: "data-input-scroll",
			chatFlow: "data-chat-flow"
		});
		const SEMANTIC_SURFACE_SELECTOR = [
			OFFICIAL_SELECTORS.rootSurface,
			OFFICIAL_SELECTORS.sidebar,
			OFFICIAL_SELECTORS.conversation,
			OFFICIAL_SELECTORS.shellOverlay,
			"[data-slot=\"sidebar.settings\"]",
			"[data-phase]",
			"[role=\"dialog\"]",
			"[role=\"tree\"]",
			"[role=\"treeitem\"]",
			OFFICIAL_SELECTORS.composerSeat,
			OFFICIAL_SELECTORS.composerCard,
			OFFICIAL_SELECTORS.openSidebar,
			OFFICIAL_SELECTORS.collapseSidebar,
			OFFICIAL_SELECTORS.sidebarBrandMark,
			OFFICIAL_SELECTORS.newSession
		].join(", ");
		const OFFICIAL_NODE_CONTRACTS = Object.freeze(Object.fromEntries(Object.entries(OFFICIAL_SELECTORS).map(([name, selector]) => [name, Object.freeze({ selector })])));
		const HDD_SCROLL_TARGETS = Object.freeze([
			{
				key: "history",
				selector: `${OFFICIAL_SELECTORS.sidebar} ${OFFICIAL_SELECTORS.sessionTree}`
			},
			{
				key: "conversation",
				selector: `${OFFICIAL_SELECTORS.conversation} ${OFFICIAL_SELECTORS.conversationScroll}`
			},
			{
				key: "input",
				selector: `${OFFICIAL_SELECTORS.conversation} ${OFFICIAL_SELECTORS.inputScroll}`
			}
		]);
		const HDD_SCROLL_TARGET_SELECTOR = HDD_SCROLL_TARGETS.map(({ selector }) => selector).join(",");
		const CAPABILITY_LEVEL = Object.freeze({
			CRITICAL: Object.freeze([
				"rootSlot",
				"shellOverlay",
				"conversation"
			]),
			CORE: Object.freeze([
				"sidebar",
				"composerSeat",
				"composerCard",
				"sessionHeader",
				"phaseSurface",
				"conversationScroll",
				"inputScroll"
			]),
			ENHANCEMENT: Object.freeze([
				"sessionTree",
				"sidebarBrandMark",
				"balanceAction",
				"undoControl",
				"redoControl",
				"composerAttachmentsSlot",
				"modelSelection"
			]),
			OPTIONAL: Object.freeze(["toBottom"])
		});
		const CAPABILITY_LEVEL_BY_NAME = Object.freeze(Object.fromEntries(Object.entries(CAPABILITY_LEVEL).flatMap(([level, names]) => names.map((name) => [name, level]))));
		const CAPABILITY_DEFINITIONS = Object.freeze({
			rootSlot: {
				selector: OFFICIAL_SELECTORS.rootSlot,
				level: CAPABILITY_LEVEL_BY_NAME.rootSlot,
				required: true,
				resolve: rootSlot
			},
			shellOverlay: {
				selector: OFFICIAL_SELECTORS.shellOverlay,
				level: CAPABILITY_LEVEL_BY_NAME.shellOverlay,
				required: true,
				resolve: shellOverlay
			},
			conversation: {
				selector: OFFICIAL_SELECTORS.conversation,
				level: CAPABILITY_LEVEL_BY_NAME.conversation,
				required: true,
				resolve: conversation
			},
			sidebar: {
				selector: OFFICIAL_SELECTORS.sidebar,
				level: CAPABILITY_LEVEL_BY_NAME.sidebar,
				required: true,
				resolve: sidebar
			},
			composerSeat: {
				selector: OFFICIAL_SELECTORS.composerSeat,
				level: CAPABILITY_LEVEL_BY_NAME.composerSeat,
				required: true,
				resolve: (doc) => composerSeat(conversation(doc))
			},
			composerCard: {
				selector: OFFICIAL_SELECTORS.composerCard,
				level: CAPABILITY_LEVEL_BY_NAME.composerCard,
				required: true,
				resolve: (doc) => composerCard(composerSeat(conversation(doc)))
			},
			sessionHeader: {
				selector: OFFICIAL_SELECTORS.sessionHeader,
				level: CAPABILITY_LEVEL_BY_NAME.sessionHeader,
				required: true,
				applicable: (doc) => Boolean(phase(conversation(doc), "active")),
				resolve: sessionHeader
			},
			phaseSurface: {
				selector: `${OFFICIAL_SELECTORS.phaseHero},${OFFICIAL_SELECTORS.phaseActive}`,
				level: CAPABILITY_LEVEL_BY_NAME.phaseSurface,
				required: true,
				resolve: (doc) => anyPhase(conversation(doc))
			},
			conversationScroll: {
				selector: OFFICIAL_SELECTORS.conversationScroll,
				level: CAPABILITY_LEVEL_BY_NAME.conversationScroll,
				required: true,
				applicable: (doc) => Boolean(phase(conversation(doc), "active")),
				resolve: (doc) => conversationScroll(conversation(doc))
			},
			inputScroll: {
				selector: OFFICIAL_SELECTORS.inputScroll,
				level: CAPABILITY_LEVEL_BY_NAME.inputScroll,
				required: true,
				resolve: (doc) => inputScroll(composerCard(composerSeat(conversation(doc))))
			},
			sessionTree: {
				selector: OFFICIAL_SELECTORS.sessionTree,
				level: CAPABILITY_LEVEL_BY_NAME.sessionTree,
				required: false,
				resolve: sessionTree
			},
			sidebarBrandMark: {
				selector: OFFICIAL_SELECTORS.sidebarBrandMark,
				level: CAPABILITY_LEVEL_BY_NAME.sidebarBrandMark,
				required: false,
				resolve: (doc) => officialNode("sidebarBrandMark", doc)
			},
			balanceAction: {
				selector: OFFICIAL_SELECTORS.balance,
				level: CAPABILITY_LEVEL_BY_NAME.balanceAction,
				required: false,
				resolve: balanceAction
			},
			undoControl: {
				selector: OFFICIAL_SELECTORS.undo,
				level: CAPABILITY_LEVEL_BY_NAME.undoControl,
				required: false,
				applicable: (doc) => Boolean(phase(conversation(doc), "active")),
				resolve: undoControl
			},
			redoControl: {
				selector: OFFICIAL_SELECTORS.redo,
				level: CAPABILITY_LEVEL_BY_NAME.redoControl,
				required: false,
				applicable: (doc) => Boolean(phase(conversation(doc), "active")),
				resolve: redoControl
			},
			toBottom: {
				selector: OFFICIAL_SELECTORS.toBottom,
				level: CAPABILITY_LEVEL_BY_NAME.toBottom,
				required: false,
				resolve: toBottomControl
			},
			composerAttachmentsSlot: {
				selector: OFFICIAL_SELECTORS.composerAttachmentsSlot,
				level: CAPABILITY_LEVEL_BY_NAME.composerAttachmentsSlot,
				required: false,
				resolve: (doc) => composerAttachmentsSlot(composerCard(composerSeat(conversation(doc))))
			},
			modelSelection: {
				selector: OFFICIAL_SELECTORS.model,
				level: CAPABILITY_LEVEL_BY_NAME.modelSelection,
				required: false,
				applicable: (doc) => Boolean(phase(conversation(doc), "active")),
				resolve: (doc) => modelControl(composerCard(composerSeat(conversation(doc))))
			}
		});
		const capabilityStatus = {
			missing: /* @__PURE__ */ new Set(),
			degraded: /* @__PURE__ */ new Set(),
			timestamp: null
		};
		const reportedMissing = /* @__PURE__ */ new Set();
		function query(scope, selector) {
			if (!selector) return null;
			return scope?.querySelector?.(selector) || null;
		}
		function queryAll(scope, selector) {
			if (!selector) return [];
			return scope?.querySelectorAll ? [...scope.querySelectorAll(selector)] : [];
		}
		function officialNode(name, scope = document) {
			return query(scope, OFFICIAL_NODE_CONTRACTS[name]?.selector);
		}
		function hasOfficialNode(name, scope = document) {
			return Boolean(officialNode(name, scope));
		}
		function officialNodes(name, scope = document) {
			return queryAll(scope, OFFICIAL_NODE_CONTRACTS[name]?.selector);
		}
		function rootSlot(doc = document) {
			return officialNode("rootSlot", doc);
		}
		function sidebar(doc = document) {
			return officialNode("sidebar", doc);
		}
		function conversation(doc = document) {
			return officialNode("conversation", doc);
		}
		function shellOverlay(doc = document) {
			return officialNode("shellOverlay", doc);
		}
		function settingsDialog(doc = document) {
			return officialNode("settingsDialog", doc);
		}
		function sidebarResizeHandle(scope = document) {
			return officialNode("sidebarResizeHandle", scope);
		}
		function sidebarOpenControl(doc = document) {
			return officialNode("openSidebar", doc);
		}
		function sidebarCollapseControl(doc = document) {
			return officialNode("collapseSidebar", doc);
		}
		const reportedFuzzyMatches = /* @__PURE__ */ new Set();
		function findByAriaLabelFuzzy(scope, { role, labels }) {
			const candidates = queryAll(scope, `[role="${role}"]`);
			const keywords = labels.map((label) => label.toLocaleLowerCase());
			return candidates.find((node) => {
				const label = node.getAttribute?.("aria-label")?.toLocaleLowerCase();
				return label && keywords.some((keyword) => label.includes(keyword));
			}) || null;
		}
		function sessionTree(scope = document, { silent = false } = {}) {
			const exact = officialNode("sessionTree", scope);
			if (exact) return exact;
			const fuzzy = findByAriaLabelFuzzy(scope, {
				role: "tree",
				labels: ARIA_FUZZY_KEYWORDS.sessionTree
			});
			if (fuzzy && !silent && !reportedFuzzyMatches.has("sessionTree")) {
				reportedFuzzyMatches.add("sessionTree");
				diagnostics.warn("capability.fuzzy-fallback", { capability: "sessionTree" });
			}
			return fuzzy;
		}
		function sessionItems(scope) {
			return officialNodes("sessionItem", scope);
		}
		function expandedSessionItems(scope) {
			return officialNodes("expandedSessionItem", scope);
		}
		function selectedSessionItems(scope) {
			return officialNodes("selectedSessionItem", scope);
		}
		function newSessionButtons(scope) {
			return officialNodes("newSession", scope);
		}
		function sidebarBrandButton(scope = document) {
			const explicit = officialNode("sidebarBrandMark", scope)?.closest?.(OFFICIAL_NODE_CONTRACTS.newSession.selector);
			if (explicit) return explicit;
			return newSessionButtons(scope).find((button) => button.firstElementChild?.tagName === "svg") || null;
		}
		function phase(scope = document, name) {
			if (!scope) return null;
			if (name === "hero") return officialNode("phaseHero", scope);
			if (name === "active") return officialNode("phaseActive", scope);
			return officialNode("phaseActive", scope) || officialNode("phaseHero", scope);
		}
		function anyPhase(scope = document) {
			return officialNode("phaseAny", scope);
		}
		function sessionHeader(scope) {
			return officialNode("sessionHeader", scope);
		}
		function sessionHeaderActions(scope) {
			return officialNode("sessionHeaderActions", scope);
		}
		function sessionHeaderUtilities(scope) {
			return officialNode("sessionHeaderUtilities", scope);
		}
		function sessionAgentPresetLabel(scope) {
			return [...sessionHeaderActions(scope)?.children || []].find((node) => node?.getAttribute?.("title") && !node.querySelector?.("button, input, select, textarea, a") && Boolean(node.textContent?.trim())) || null;
		}
		function headerElement(scope) {
			return officialNode("headerElement", scope);
		}
		function composerSeat(scope = document) {
			return officialNode("composerSeat", scope);
		}
		function composerCard(scope) {
			return officialNode("composerCard", scope);
		}
		function composerTextarea(scope) {
			return officialNode("composerTextarea", scope);
		}
		function composerAttachmentsSlot(scope) {
			const selector = OFFICIAL_NODE_CONTRACTS.composerAttachmentsSlot.selector;
			return [...scope?.children || []].find((node) => node?.matches?.(selector) || node?.getAttribute?.(OFFICIAL_ATTRIBUTES.slot) === OFFICIAL_SLOT_VALUES.composerAttachments) || null;
		}
		function conversationScroll(scope) {
			return officialNode("conversationScroll", scope);
		}
		function conversationScrolls(scope) {
			return officialNodes("conversationScroll", scope);
		}
		function inputScroll(scope) {
			return officialNode("inputScroll", scope);
		}
		function conversationComposerDock(scope) {
			return officialNode("conversationComposerDock", scope);
		}
		function chatFlows(doc = document) {
			return officialNodes("chatFlow", doc);
		}
		function sendButton(scope) {
			return officialNode("send", scope);
		}
		function sendOnlyButton(scope) {
			return officialNode("sendOnly", scope);
		}
		function contextControl(scope) {
			return officialNode("context", scope);
		}
		function voiceControl(scope) {
			return query(scope, `[${FAIRY_VOICE_CONTROL_ATTRIBUTE}]`) || query(scope, VOICE_CONTROL_FALLBACK_SELECTOR);
		}
		function commandControl(scope) {
			return officialNode("command", scope);
		}
		function accessControl(scope) {
			return officialNode("access", scope);
		}
		function modelControl(scope) {
			return officialNode("model", scope);
		}
		function reasoningControl(scope) {
			return officialNode("reasoning", scope);
		}
		function modelAndReasoningShareNode(scope) {
			const model = modelControl(scope);
			const reasoning = reasoningControl(scope);
			return Boolean(model && reasoning && model === reasoning);
		}
		function workspaceControl(scope) {
			return officialNode("workspace", scope);
		}
		function balanceAction(doc = document) {
			return officialNode("balance", doc);
		}
		function undoControl(scope) {
			return officialNode("undo", scope);
		}
		function redoControl(scope) {
			return officialNode("redo", scope);
		}
		function toBottomControl(scope) {
			return officialNode("toBottom", scope);
		}
		function hddScrollTargets(scope = document) {
			return HDD_SCROLL_TARGETS.map(({ key, selector }) => ({
				key,
				target: query(scope, selector)
			})).filter(({ target }) => target?.isConnected);
		}
		function capabilityNode(name, doc = document) {
			return CAPABILITY_DEFINITIONS[name]?.resolve?.(doc) || null;
		}
		function hasCapability(name, doc = document) {
			return Boolean(capabilityNode(name, doc));
		}
		function capabilitySnapshot(doc = document) {
			const snapshot = {};
			Object.entries(CAPABILITY_DEFINITIONS).forEach(([name, definition]) => {
				const applicable = definition.applicable?.(doc) ?? true;
				const node = applicable ? capabilityNode(name, doc) : null;
				snapshot[name] = {
					available: !applicable || Boolean(node),
					applicable,
					required: definition.required,
					level: definition.level,
					selector: definition.selector
				};
			});
			return snapshot;
		}
		function syncCapabilityStatus(snapshot, { includeOptional = false } = {}) {
			capabilityStatus.missing.clear();
			capabilityStatus.degraded.clear();
			Object.entries(snapshot).forEach(([name, capability]) => {
				if (capability.available) return;
				if (capability.required) capabilityStatus.missing.add(name);
				else if (includeOptional || capability.level === "ENHANCEMENT") capabilityStatus.degraded.add(name);
			});
			capabilityStatus.timestamp = Date.now();
		}
		function getCapabilityStatus() {
			return {
				missing: [...capabilityStatus.missing].sort(),
				degraded: [...capabilityStatus.degraded].sort(),
				timestamp: capabilityStatus.timestamp
			};
		}
		function resetCapabilityStatus() {
			capabilityStatus.missing.clear();
			capabilityStatus.degraded.clear();
			capabilityStatus.timestamp = null;
			reportedMissing.clear();
			reportedFuzzyMatches.clear();
		}
		function missingCapabilities(doc = document, { includeOptional = false } = {}) {
			const snapshot = capabilitySnapshot(doc);
			return Object.entries(snapshot).filter(([, capability]) => !capability.available && (capability.required || includeOptional || capability.level === "ENHANCEMENT")).map(([name, capability]) => ({
				name,
				...capability
			}));
		}
		function reportMissingCapabilities(doc = document, { report = (message) => diagnostics.warn("capability.missing", { message }), includeOptional = false, allowBeforeMount = false } = {}) {
			if (!allowBeforeMount && (!rootSlot(doc) || !conversation(doc))) return [];
			const snapshot = capabilitySnapshot(doc);
			syncCapabilityStatus(snapshot, { includeOptional });
			const missing = Object.entries(snapshot).filter(([, capability]) => !capability.available && (capability.required || includeOptional || capability.level === "ENHANCEMENT")).map(([name, capability]) => ({
				name,
				...capability
			}));
			missing.forEach(({ name, selector, required, level }) => {
				if (reportedMissing.has(name)) return;
				reportedMissing.add(name);
				report(`[dsh-fairy-visual] ${required ? "missing required" : "degraded"} official capability [${level}]: ${name} (${selector})`);
			});
			return missing;
		}
		if (typeof window !== "undefined" && globalThis.process?.env?.NODE_ENV === "development") window.__fairyVisualCapability = Object.freeze({
			getStatus: getCapabilityStatus,
			reset: resetCapabilityStatus
		});
		module.exports = {
			OFFICIAL_SELECTORS,
			OFFICIAL_SLOT_VALUES,
			FAIRY_VOICE_CONTROL_ATTRIBUTE,
			VOICE_CONTROL_FALLBACK_SELECTOR,
			ARIA_LABELS,
			ARIA_FUZZY_KEYWORDS,
			labelsFor,
			ariaLabelSelector,
			appendSelectorSuffix,
			detectCurrentLanguage,
			onLanguageChange,
			OFFICIAL_ATTRIBUTES,
			SEMANTIC_SURFACE_SELECTOR,
			OFFICIAL_NODE_CONTRACTS,
			HDD_SCROLL_TARGETS,
			HDD_SCROLL_TARGET_SELECTOR,
			CAPABILITY_LEVEL,
			CAPABILITY_LEVEL_BY_NAME,
			CAPABILITY_DEFINITIONS,
			getCapabilityStatus,
			resetCapabilityStatus,
			officialNode,
			hasOfficialNode,
			officialNodes,
			capabilityNode,
			hasCapability,
			rootSlot,
			sidebar,
			conversation,
			shellOverlay,
			settingsDialog,
			sidebarResizeHandle,
			sidebarOpenControl,
			sidebarCollapseControl,
			sessionTree,
			sessionItems,
			expandedSessionItems,
			selectedSessionItems,
			newSessionButtons,
			sidebarBrandButton,
			phase,
			anyPhase,
			sessionHeader,
			sessionHeaderActions,
			sessionHeaderUtilities,
			sessionAgentPresetLabel,
			headerElement,
			composerSeat,
			composerCard,
			composerTextarea,
			composerAttachmentsSlot,
			conversationScroll,
			conversationScrolls,
			inputScroll,
			conversationComposerDock,
			chatFlows,
			sendButton,
			sendOnlyButton,
			contextControl,
			voiceControl,
			commandControl,
			accessControl,
			modelControl,
			reasoningControl,
			modelAndReasoningShareNode,
			workspaceControl,
			balanceAction,
			undoControl,
			redoControl,
			toBottomControl,
			hddScrollTargets,
			capabilitySnapshot,
			missingCapabilities,
			reportMissingCapabilities
		};
	}));

//#endregion
//#region src/client/composer-attachments.js
	var require_composer_attachments = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { OFFICIAL_SELECTORS, composerAttachmentsSlot } = require_dom_adapter();
		const ATTACHMENTS_SLOT = OFFICIAL_SELECTORS.composerAttachmentsSlot;
		function attachmentSlot(card) {
			return composerAttachmentsSlot(card);
		}
		function attachmentRail(slot) {
			return slot?.firstElementChild || null;
		}
		function attachmentRailHeight(slot) {
			const height = Number(attachmentRail(slot)?.getBoundingClientRect?.().height);
			return Number.isFinite(height) ? Math.max(0, Math.ceil(height)) : 0;
		}
		function attachmentDockHeight(baseHeight, railHeight, minimum, maximum) {
			return Math.min(maximum, Math.max(minimum, baseHeight + railHeight));
		}
		module.exports = {
			ATTACHMENTS_SLOT,
			attachmentSlot,
			attachmentRail,
			attachmentRailHeight,
			attachmentDockHeight
		};
	}));

//#endregion
//#region src/client/lifecycle.js
	var require_lifecycle = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const diagnostics = { error(operation, error, context = {}) {
			console.error(`DSH_FAIRY_LOG ${JSON.stringify({
				schema: 1,
				timestamp: (/* @__PURE__ */ new Date()).toISOString(),
				level: "error",
				module: "dsh-fairy-visual",
				operation,
				event: "failure",
				context,
				error: {
					name: String(error?.name || "Error"),
					message: String(error?.message || error).slice(0, 320)
				}
			})}`);
		} };
		const singletonOwners = /* @__PURE__ */ new WeakMap();
		function createLifecycleScope(name = "fairy-visual") {
			let disposed = false;
			const cleanups = [];
			const cleanupLabels = /* @__PURE__ */ new WeakMap();
			const rafs = /* @__PURE__ */ new Set();
			const timers = /* @__PURE__ */ new Set();
			const intervals = /* @__PURE__ */ new Set();
			const abortControllers = /* @__PURE__ */ new Set();
			const keyedRafs = /* @__PURE__ */ new Map();
			const bindings = /* @__PURE__ */ new Map();
			const removeCleanup = (cleanup) => {
				const index = cleanups.indexOf(cleanup);
				if (index >= 0) cleanups.splice(index, 1);
			};
			const add = (cleanup, label = null) => {
				if (typeof cleanup !== "function") return cleanup;
				if (disposed) {
					cleanup();
					return cleanup;
				}
				if (typeof label === "string" && label.trim()) cleanupLabels.set(cleanup, label.trim());
				cleanups.push(cleanup);
				return cleanup;
			};
			const registrationOptions = (options, explicitLabel = null) => {
				if (!options || typeof options !== "object" || !Object.prototype.hasOwnProperty.call(options, "label")) return {
					nativeOptions: options,
					label: explicitLabel
				};
				const { label, ...nativeOptions } = options;
				return {
					nativeOptions: Object.keys(nativeOptions).length ? nativeOptions : void 0,
					label: explicitLabel ?? label
				};
			};
			const on = (target, type, listener, options, label = null) => {
				if (!target?.addEventListener) return () => {};
				const { nativeOptions, label: registrationLabel } = registrationOptions(options, label);
				target.addEventListener(type, listener, nativeOptions);
				return add(() => target.removeEventListener(type, listener, nativeOptions), registrationLabel || `event:${type}`);
			};
			const observe = (observer, target, options, label = null) => {
				if (!observer || !target) return () => {};
				const { nativeOptions, label: registrationLabel } = registrationOptions(options, label);
				observer.observe(target, nativeOptions);
				return add(() => observer.disconnect(), registrationLabel || "observer");
			};
			const frame = (callback, label = null) => {
				if (disposed) return 0;
				const request = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout;
				const cancel = typeof cancelAnimationFrame === "function" ? cancelAnimationFrame : clearTimeout;
				let cleanup = null;
				const id = request(() => {
					rafs.delete(id);
					removeCleanup(cleanup);
					if (!disposed) callback();
				});
				rafs.add(id);
				cleanup = () => {
					if (!rafs.delete(id)) return;
					cancel(id);
					removeCleanup(cleanup);
				};
				add(cleanup, label || "frame");
				return id;
			};
			const scheduleFrame = (key, callback, label = null) => {
				if (disposed) return 0;
				const pending = keyedRafs.get(key);
				if (pending) {
					pending.callback = callback;
					return pending.id;
				}
				const record = {
					id: 0,
					callback
				};
				const id = frame(() => {
					keyedRafs.delete(key);
					record.callback();
				}, label || `frame:${key}`);
				record.id = id;
				keyedRafs.set(key, record);
				return id;
			};
			const timeout = (callback, delay, label = null) => {
				if (disposed) return 0;
				let cleanup = null;
				const id = setTimeout(() => {
					timers.delete(id);
					removeCleanup(cleanup);
					if (!disposed) callback();
				}, delay);
				timers.add(id);
				cleanup = () => {
					if (!timers.delete(id)) return;
					clearTimeout(id);
					removeCleanup(cleanup);
				};
				add(cleanup, label || "timeout");
				return id;
			};
			const interval = (callback, delay, label = null) => {
				if (disposed) return 0;
				const id = setInterval(() => {
					if (!disposed) callback();
				}, delay);
				intervals.add(id);
				add(() => {
					if (!intervals.delete(id)) return;
					clearInterval(id);
				}, label || "interval");
				return id;
			};
			const abortController = (label = null) => {
				const controller = new AbortController();
				abortControllers.add(controller);
				add(() => {
					if (!abortControllers.delete(controller)) return;
					controller.abort();
				}, label || "abort-controller");
				return controller;
			};
			const replaceBinding = (key, cleanup, label = null) => {
				bindings.get(key)?.();
				bindings.delete(key);
				if (typeof cleanup !== "function") return cleanup;
				if (disposed) {
					let active = true;
					const disposeImmediately = () => {
						if (!active) return;
						active = false;
						cleanup();
					};
					disposeImmediately();
					return disposeImmediately;
				}
				let active = true;
				const binding = () => {
					if (!active) return;
					active = false;
					if (bindings.get(key) === binding) bindings.delete(key);
					removeCleanup(binding);
					cleanup();
				};
				bindings.set(key, binding);
				add(binding, label || `binding:${key}`);
				return binding;
			};
			const inspect = () => cleanups.map((cleanup, index) => ({
				index,
				label: cleanupLabels.get(cleanup) || "(unlabeled)",
				hasCustomName: cleanup.name !== "" && cleanup.name !== "cleanup"
			}));
			const dispose = () => {
				if (disposed) return;
				disposed = true;
				[...rafs].forEach((id) => {
					if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
					else clearTimeout(id);
				});
				[...timers].forEach((id) => clearTimeout(id));
				[...intervals].forEach((id) => clearInterval(id));
				[...abortControllers].forEach((controller) => controller.abort());
				rafs.clear();
				keyedRafs.clear();
				bindings.clear();
				timers.clear();
				intervals.clear();
				abortControllers.clear();
				while (cleanups.length) {
					const cleanup = cleanups.pop();
					try {
						cleanup?.();
					} catch (error) {
						diagnostics.error("lifecycle.cleanup", error, { owner: name });
					}
				}
			};
			return {
				get disposed() {
					return disposed;
				},
				add,
				on,
				observe,
				frame,
				scheduleFrame,
				timeout,
				interval,
				abortController,
				replaceBinding,
				inspect,
				dispose
			};
		}
		function claimSingleton(owner, key, scope) {
			if (!owner || !key || !scope) return scope;
			(singletonOwners.get(owner)?.get(key))?.dispose?.();
			let entries = singletonOwners.get(owner);
			if (!entries) {
				entries = /* @__PURE__ */ new Map();
				singletonOwners.set(owner, entries);
			}
			entries.set(key, scope);
			scope.add(() => {
				if (entries.get(key) === scope) entries.delete(key);
				if (!entries.size) singletonOwners.delete(owner);
			}, `singleton:${key}`);
			return scope;
		}
		module.exports = {
			createLifecycleScope,
			claimSingleton
		};
	}));

//#endregion
//#region src/client/dom-observer-manager.js
	var require_dom_observer_manager = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const managers = /* @__PURE__ */ new WeakMap();
		const diagnostics = {
			start: () => typeof performance === "object" && performance?.now ? performance.now() : Date.now(),
			metric(operation, startedAt, context = {}, thresholdMs = 0) {
				const duration = (typeof performance === "object" && performance?.now ? performance.now() : Date.now()) - startedAt;
				if (duration < thresholdMs) return;
				console.info(`DSH_FAIRY_LOG ${JSON.stringify({
					schema: 1,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					level: "info",
					module: "dsh-fairy-visual",
					operation,
					event: "metric",
					context,
					duration_ms: Number(duration.toFixed(3))
				})}`);
			},
			error(operation, error, context = {}) {
				console.error(`DSH_FAIRY_LOG ${JSON.stringify({
					schema: 1,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					level: "error",
					module: "dsh-fairy-visual",
					operation,
					event: "failure",
					context,
					error: {
						name: String(error?.name || "Error"),
						message: String(error?.message || error).slice(0, 320)
					}
				})}`);
			}
		};
		function containsTarget(root, target, subtree) {
			if (root === target) return true;
			return subtree === true && Boolean(root?.contains?.(target));
		}
		function acceptsRecord(subscription, record) {
			const options = subscription.options;
			if (!containsTarget(subscription.target, record.target, options.subtree)) return false;
			if (record.type === "childList") return options.childList === true;
			if (record.type === "characterData") return options.characterData === true;
			if (record.type !== "attributes" || options.attributes !== true) return false;
			return !options.attributeFilter?.length || options.attributeFilter.includes(record.attributeName);
		}
		function createDomObserverManager(documentRef) {
			const subscriptions = /* @__PURE__ */ new Set();
			const subscriptionsByTarget = /* @__PURE__ */ new WeakMap();
			const frameCallbacks = /* @__PURE__ */ new Map();
			let bodyObserver = null;
			let rootObserver = null;
			let frame = 0;
			let callbackCount = 0;
			let deliveredRecordCount = 0;
			let suspended = false;
			const dispatch = (records, rootOnly) => {
				callbackCount += 1;
				deliveredRecordCount += records.length;
				subscriptions.forEach((subscription) => {
					if (!subscription.active || subscription.rootOnly !== rootOnly) return;
					const accepted = records.filter((record) => acceptsRecord(subscription, record));
					if (!accepted.length) return;
					const startedAt = diagnostics.start();
					try {
						subscription.callback(accepted, subscription.virtualObserver);
					} catch (error) {
						diagnostics.error("observer.callback", error, {
							record_count: accepted.length,
							root_only: rootOnly
						});
						if (typeof reportError === "function") reportError(error);
						else setTimeout(() => {
							throw error;
						}, 0);
					} finally {
						diagnostics.metric("observer.callback", startedAt, {
							record_count: accepted.length,
							root_only: rootOnly
						}, 8);
					}
				});
			};
			const mergedOptions = (entries) => {
				const attributeEntries = entries.filter((entry) => entry.options.attributes);
				const observesAllAttributes = attributeEntries.some((entry) => !entry.options.attributeFilter?.length);
				const filters = new Set(attributeEntries.flatMap((entry) => entry.options.attributeFilter || []));
				return {
					childList: entries.some((entry) => entry.options.childList),
					subtree: entries.some((entry) => entry.options.subtree),
					attributes: attributeEntries.length > 0,
					...!observesAllAttributes && filters.size ? { attributeFilter: [...filters] } : {},
					characterData: entries.some((entry) => entry.options.characterData)
				};
			};
			const rebuildObserver = (rootOnly) => {
				if (!rootOnly && suspended) {
					bodyObserver?.disconnect();
					bodyObserver = null;
					return;
				}
				const entries = [...subscriptions].filter((entry) => entry.active && entry.rootOnly === rootOnly);
				let observer = rootOnly ? rootObserver : bodyObserver;
				observer?.disconnect();
				if (!entries.length || typeof MutationObserver !== "function") {
					if (rootOnly) rootObserver = null;
					else bodyObserver = null;
					return;
				}
				if (!observer) observer = new MutationObserver((records) => dispatch(records, rootOnly));
				const entriesByTarget = /* @__PURE__ */ new Map();
				entries.forEach((entry) => {
					const targetEntries = entriesByTarget.get(entry.target) || [];
					targetEntries.push(entry);
					entriesByTarget.set(entry.target, targetEntries);
				});
				entriesByTarget.forEach((targetEntries, target) => observer.observe(target, mergedOptions(targetEntries)));
				if (rootOnly) rootObserver = observer;
				else bodyObserver = observer;
			};
			const removeSubscription = (subscription) => {
				if (!subscription.active) return;
				subscription.active = false;
				subscriptions.delete(subscription);
				subscriptionsByTarget.get(subscription.target)?.delete(subscription);
				rebuildObserver(subscription.rootOnly);
			};
			const observe = (virtualObserver, target, options = {}) => {
				if (!target || typeof options !== "object") throw new TypeError("MutationObserver target and options are required");
				const normalized = {
					childList: options.childList === true,
					subtree: options.subtree === true,
					attributes: options.attributes === true || Array.isArray(options.attributeFilter),
					attributeFilter: Array.isArray(options.attributeFilter) ? [...new Set(options.attributeFilter)] : null,
					characterData: options.characterData === true
				};
				if (!normalized.childList && !normalized.attributes && !normalized.characterData) throw new TypeError("MutationObserver requires childList, attributes, or characterData");
				const previous = virtualObserver._subscriptions.get(target);
				if (previous) removeSubscription(previous);
				const rootOnly = target === documentRef.documentElement && normalized.subtree !== true;
				const subscription = {
					active: true,
					callback: virtualObserver._callback,
					options: normalized,
					rootOnly,
					target,
					virtualObserver
				};
				virtualObserver._subscriptions.set(target, subscription);
				subscriptions.add(subscription);
				let targetSubscriptions = subscriptionsByTarget.get(target);
				if (!targetSubscriptions) {
					targetSubscriptions = /* @__PURE__ */ new Set();
					subscriptionsByTarget.set(target, targetSubscriptions);
				}
				targetSubscriptions.add(subscription);
				rebuildObserver(rootOnly);
			};
			const disconnect = (virtualObserver) => {
				[...virtualObserver._subscriptions.values()].forEach(removeSubscription);
				virtualObserver._subscriptions.clear();
			};
			const scheduleFrame = (key, callback) => {
				frameCallbacks.set(key, callback);
				if (!frame) frame = requestAnimationFrame(() => {
					frame = 0;
					const callbacks = [...frameCallbacks.values()];
					frameCallbacks.clear();
					callbacks.forEach((run) => run());
				});
				return frame;
			};
			const cancelFrame = (key) => {
				frameCallbacks.delete(key);
				if (!frameCallbacks.size && frame) {
					cancelAnimationFrame(frame);
					frame = 0;
				}
			};
			return {
				observe,
				disconnect,
				scheduleFrame,
				cancelFrame,
				suspend() {
					if (suspended) return;
					suspended = true;
					rebuildObserver(false);
				},
				resume() {
					if (!suspended) return;
					suspended = false;
					rebuildObserver(false);
				},
				inspect() {
					return {
						nativeObserverCount: Number(Boolean(bodyObserver)) + Number(Boolean(rootObserver)),
						bodyObserverCount: Number(Boolean(bodyObserver)),
						rootObserverCount: Number(Boolean(rootObserver)),
						subscriptionCount: subscriptions.size,
						callbackCount,
						deliveredRecordCount,
						pendingFrameCount: frameCallbacks.size,
						suspended
					};
				}
			};
		}
		function getDomObserverManager(documentRef = document) {
			let manager = managers.get(documentRef);
			if (!manager) {
				manager = createDomObserverManager(documentRef);
				managers.set(documentRef, manager);
			}
			return manager;
		}
		function createManagedMutationObserver(callback, documentRef = document) {
			if (typeof callback !== "function") throw new TypeError("MutationObserver callback must be a function");
			const manager = getDomObserverManager(documentRef);
			return {
				_callback: callback,
				_subscriptions: /* @__PURE__ */ new Map(),
				observe(target, options) {
					manager.observe(this, target, options);
				},
				disconnect() {
					manager.disconnect(this);
				},
				takeRecords() {
					return [];
				}
			};
		}
		module.exports = {
			createDomObserverManager,
			getDomObserverManager,
			createManagedMutationObserver
		};
	}));

//#endregion
//#region src/client/composer-marker-projection.js
	var require_composer_marker_projection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { OFFICIAL_ATTRIBUTES, inputScroll, sendButton, contextControl, voiceControl, commandControl, accessControl, modelControl, reasoningControl, modelAndReasoningShareNode, workspaceControl } = require_dom_adapter();
		const { attachmentSlot, attachmentRail } = require_composer_attachments();
		const COMPOSER_ATTR = "data-dsh-fairy-composer-dock";
		const MARKER_ATTRS = [
			COMPOSER_ATTR,
			"data-dsh-fairy-composer-row",
			"data-dsh-fairy-composer-tools",
			"data-dsh-fairy-composer-trailing",
			"data-dsh-fairy-composer-accessory",
			"data-dsh-fairy-composer-attachments",
			"data-dsh-fairy-composer-attachments-active",
			"data-dsh-fairy-composer-bar-root",
			"data-dsh-fairy-composer-bar-host",
			"data-dsh-fairy-composer-stack",
			"data-dsh-fairy-composer-workspace",
			"data-dsh-fairy-composer-chrome",
			"data-dsh-fairy-composer-send-control",
			"data-dsh-fairy-composer-context-control",
			"data-dsh-fairy-composer-output-control",
			"data-dsh-fairy-composer-voice-control",
			"data-dsh-fairy-composer-model-control",
			"data-dsh-fairy-composer-native-model-control",
			"data-dsh-fairy-composer-reasoning-control",
			"data-dsh-fairy-composer-command-control",
			"data-dsh-fairy-composer-access-control",
			"data-dsh-fairy-composer-workspace-control",
			"data-dsh-fairy-composer-mode-control"
		];
		function clearMarker(node, name) {
			if (node?.isConnected) node.removeAttribute(name);
		}
		function markControls(card) {
			if (!card) return () => {};
			const owned = [];
			const mark = (node, name) => {
				if (!node) return;
				node.setAttribute(name, "true");
				owned.push([node, name]);
			};
			const scroll = inputScroll(card);
			const send = sendButton(card);
			const row = [...card.children].find((node) => node !== scroll && node.contains?.(send));
			const tools = row?.children?.[0] || null;
			const trailing = row?.children?.[1] || null;
			mark(row, "data-dsh-fairy-composer-row");
			mark(tools, "data-dsh-fairy-composer-tools");
			mark(trailing, "data-dsh-fairy-composer-trailing");
			const attachments = attachmentSlot(card);
			mark(attachments, "data-dsh-fairy-composer-attachments");
			if (attachmentRail(attachments)) mark(card, "data-dsh-fairy-composer-attachments-active");
			[...card.children].filter((node) => node !== scroll && node !== row && node !== attachments).forEach((node) => mark(node, "data-dsh-fairy-composer-accessory"));
			const contextTarget = contextControl(card);
			if (send && trailing) [...trailing.children].forEach((node) => {
				if (contextTarget && node.contains?.(contextTarget)) return;
				mark(node, node.contains?.(send) ? "data-dsh-fairy-composer-send-control" : "data-dsh-fairy-composer-output-control");
			});
			else if (send) mark(send, "data-dsh-fairy-composer-send-control");
			if (contextTarget) {
				let contextOwner = contextTarget.parentElement;
				while (contextOwner && contextOwner !== trailing && getComputedStyle(contextOwner).display === "contents") contextOwner = contextOwner.parentElement;
				mark(contextOwner || contextTarget, "data-dsh-fairy-composer-context-control");
			}
			const voiceTarget = voiceControl(tools);
			if (voiceTarget && tools) mark(voiceTarget, "data-dsh-fairy-composer-voice-control");
			mark(commandControl(tools), "data-dsh-fairy-composer-command-control");
			let accessOwner = accessControl(tools);
			while (accessOwner?.parentElement && accessOwner.parentElement !== tools) accessOwner = accessOwner.parentElement;
			mark(accessOwner, "data-dsh-fairy-composer-access-control");
			const modelTarget = modelControl(card);
			const mergedModelReasoning = modelAndReasoningShareNode(card);
			if (modelTarget && trailing && !mergedModelReasoning) {
				let modelOwner = modelTarget.parentElement;
				let modelShell = null;
				while (modelOwner && modelOwner !== trailing) {
					if (!modelShell && getComputedStyle(modelOwner).display !== "contents") modelShell = modelOwner;
					modelOwner = modelOwner.parentElement;
				}
				if (modelShell) {
					mark(modelShell, "data-dsh-fairy-composer-model-control");
					mark(modelShell, "data-dsh-fairy-composer-native-model-control");
				}
			}
			const reasoningTarget = reasoningControl(card);
			if (reasoningTarget) {
				let reasoningOwner = reasoningTarget.parentElement;
				while (reasoningOwner && reasoningOwner !== card && getComputedStyle(reasoningOwner).display === "contents") reasoningOwner = reasoningOwner.parentElement;
				if (reasoningOwner && reasoningOwner !== card) mark(reasoningOwner, "data-dsh-fairy-composer-reasoning-control");
			}
			const barRoot = card.parentElement;
			mark(barRoot, "data-dsh-fairy-composer-bar-root");
			const seat = card.closest("[" + OFFICIAL_ATTRIBUTES.composerSeat + "]");
			const workspaceButton = workspaceControl(seat);
			let stack = barRoot?.parentElement || null;
			while (stack && stack !== seat && !(stack.children.length > 1 && (!workspaceButton || stack.contains(workspaceButton)))) stack = stack.parentElement;
			if (stack && stack !== seat) {
				mark(stack, "data-dsh-fairy-composer-stack");
				let barHost = barRoot;
				while (barHost.parentElement && barHost.parentElement !== stack) barHost = barHost.parentElement;
				mark(barHost, "data-dsh-fairy-composer-bar-host");
				let workspaceRow = workspaceButton;
				while (workspaceRow?.parentElement && workspaceRow.parentElement !== stack) workspaceRow = workspaceRow.parentElement;
				[...stack.children].filter((node) => node !== barHost && node !== workspaceRow).forEach((node) => mark(node, "data-dsh-fairy-composer-chrome"));
				mark(workspaceRow, "data-dsh-fairy-composer-workspace");
				mark(workspaceButton, "data-dsh-fairy-composer-workspace-control");
				const modeButton = workspaceRow ? [...workspaceRow.querySelectorAll("button")].find((button) => button !== workspaceButton) : null;
				let modeOwner = modeButton;
				let modeAncestor = modeButton?.parentElement;
				while (modeAncestor && modeAncestor !== workspaceRow) {
					if (getComputedStyle(modeAncestor).display !== "contents") modeOwner = modeAncestor;
					modeAncestor = modeAncestor.parentElement;
				}
				mark(modeOwner, "data-dsh-fairy-composer-mode-control");
			}
			return () => owned.forEach(([node, name]) => clearMarker(node, name));
		}
		module.exports = {
			COMPOSER_ATTR,
			MARKER_ATTRS,
			clearMarker,
			markControls
		};
	}));

//#endregion
//#region src/client/composer-native-controls.js
	var require_composer_native_controls = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { markControls } = require_composer_marker_projection();
		function placeNativeControlMarkers(card) {
			return markControls(card);
		}
		module.exports = { placeNativeControlMarkers };
	}));

//#endregion
//#region src/client/composer-material-layer.js
	var require_composer_material_layer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
		let materialLayerSeed = 0;
		function createMaterialLayer(card) {
			if (!card) return null;
			const materialLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			const instanceId = `dsh-fairy-composer-${++materialLayerSeed}`;
			const patternId = `${instanceId}-polymer-pattern`;
			const sheenId = `${instanceId}-polymer-sheen`;
			const ambientId = `${instanceId}-polymer-ambient`;
			materialLayer.setAttribute("data-dsh-fairy-composer-material", "true");
			materialLayer.setAttribute("data-dsh-fairy-composer-material-instance", instanceId);
			materialLayer.setAttribute("preserveAspectRatio", "none");
			const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
			const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
			mask.setAttribute("data-dsh-fairy-composer-material-mask", "true");
			mask.setAttribute("maskUnits", "userSpaceOnUse");
			const outer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			outer.setAttribute("fill", "white");
			const hole = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			hole.setAttribute("fill", "black");
			mask.append(outer, hole);
			defs.appendChild(mask);
			const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
			pattern.setAttribute("id", patternId);
			pattern.setAttribute("patternUnits", "userSpaceOnUse");
			pattern.setAttribute("width", "12");
			pattern.setAttribute("height", "12");
			const patternBase = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			patternBase.setAttribute("width", "12");
			patternBase.setAttribute("height", "12");
			patternBase.setAttribute("fill", "var(--dsh-composer-polymer)");
			const patternGrainLight = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			patternGrainLight.setAttribute("cx", "1.4");
			patternGrainLight.setAttribute("cy", "1.4");
			patternGrainLight.setAttribute("r", ".72");
			patternGrainLight.setAttribute("fill", "var(--dsh-composer-polymer-light)");
			const patternGrainDark = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			patternGrainDark.setAttribute("cx", "6.5");
			patternGrainDark.setAttribute("cy", "8.5");
			patternGrainDark.setAttribute("r", ".78");
			patternGrainDark.setAttribute("fill", "var(--dsh-composer-polymer-dark)");
			const patternLight = document.createElementNS("http://www.w3.org/2000/svg", "path");
			patternLight.setAttribute("d", "M 0 3.5 H 12 M 0 9.5 H 12");
			patternLight.setAttribute("stroke", "var(--dsh-composer-polymer-stripe)");
			patternLight.setAttribute("stroke-width", ".82");
			patternLight.setAttribute("opacity", ".9");
			pattern.append(patternBase, patternGrainLight, patternGrainDark, patternLight);
			defs.appendChild(pattern);
			const sheen = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			sheen.setAttribute("id", sheenId);
			sheen.setAttribute("gradientUnits", "userSpaceOnUse");
			const sheenLight = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			sheenLight.setAttribute("offset", "0%");
			const sheenMid = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			sheenMid.setAttribute("offset", "46%");
			const sheenDark = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			sheenDark.setAttribute("offset", "100%");
			sheen.append(sheenLight, sheenMid, sheenDark);
			defs.appendChild(sheen);
			const ambient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
			ambient.setAttribute("id", ambientId);
			ambient.setAttribute("gradientUnits", "userSpaceOnUse");
			const ambientLight = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ambientLight.setAttribute("offset", "0%");
			const ambientFade = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ambientFade.setAttribute("offset", "68%");
			const ambientEnd = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ambientEnd.setAttribute("offset", "100%");
			ambient.append(ambientLight, ambientFade, ambientEnd);
			defs.appendChild(ambient);
			const face = document.createElementNS("http://www.w3.org/2000/svg", "path");
			face.setAttribute("data-dsh-fairy-composer-material-face", "continuous");
			face.setAttribute("fill", `url(#${patternId})`);
			face.setAttribute("fill-rule", "evenodd");
			face.setAttribute("clip-rule", "evenodd");
			const sheenFace = document.createElementNS("http://www.w3.org/2000/svg", "path");
			sheenFace.setAttribute("data-dsh-fairy-composer-material-sheen", "true");
			sheenFace.setAttribute("fill", `url(#${sheenId})`);
			sheenFace.setAttribute("fill-rule", "evenodd");
			sheenFace.setAttribute("clip-rule", "evenodd");
			const ambientFace = document.createElementNS("http://www.w3.org/2000/svg", "path");
			ambientFace.setAttribute("data-dsh-fairy-composer-material-ambient", "true");
			ambientFace.setAttribute("fill", `url(#${ambientId})`);
			ambientFace.setAttribute("fill-rule", "evenodd");
			ambientFace.setAttribute("clip-rule", "evenodd");
			materialLayer.append(defs, face, sheenFace, ambientFace);
			materialLayer._dshMaterial = {
				outer,
				hole,
				face,
				sheenFace,
				ambientFace,
				patternBase,
				patternGrainLight,
				patternGrainDark,
				patternLight,
				sheen,
				sheenLight,
				sheenMid,
				sheenDark,
				ambient,
				ambientLight,
				ambientFade,
				ambientEnd
			};
			card.appendChild(materialLayer);
			return materialLayer;
		}
		function unionRect(nodes) {
			const rects = nodes.map((node) => node?.getBoundingClientRect?.()).filter((rect) => rect && Number.isFinite(rect.left) && Number.isFinite(rect.top) && Number.isFinite(rect.right) && Number.isFinite(rect.bottom));
			if (!rects.length) return null;
			return {
				left: Math.min(...rects.map((rect) => rect.left)),
				top: Math.min(...rects.map((rect) => rect.top)),
				right: Math.max(...rects.map((rect) => rect.right)),
				bottom: Math.max(...rects.map((rect) => rect.bottom))
			};
		}
		function syncHoleContactGeometry(card, inputRect, clampValue = clamp) {
			if (!card?.style || !inputRect) return null;
			const cardRect = card.getBoundingClientRect?.();
			if (!cardRect || !Number.isFinite(cardRect.left) || !Number.isFinite(cardRect.top) || !Number.isFinite(cardRect.width) || !Number.isFinite(cardRect.height)) return null;
			const borderLeft = Number(card.clientLeft) || 0;
			const borderTop = Number(card.clientTop) || 0;
			const width = Number(card.clientWidth) || cardRect.width - borderLeft * 2;
			const height = Number(card.clientHeight) || cardRect.height - borderTop * 2;
			const originLeft = cardRect.left + borderLeft;
			const originTop = cardRect.top + borderTop;
			const left = clampValue(inputRect.left - originLeft, 0, width);
			const top = clampValue(inputRect.top - originTop, 0, height);
			const right = clampValue(inputRect.right - originLeft, left, width);
			const bottom = clampValue(inputRect.bottom - originTop, top, height);
			const geometry = {
				left,
				top,
				width: Math.max(0, right - left),
				height: Math.max(0, bottom - top)
			};
			card.style.setProperty("--dsh-fairy-composer-hole-contact-left", geometry.left + "px");
			card.style.setProperty("--dsh-fairy-composer-hole-contact-top", geometry.top + "px");
			card.style.setProperty("--dsh-fairy-composer-hole-contact-width", geometry.width + "px");
			card.style.setProperty("--dsh-fairy-composer-hole-contact-height", geometry.height + "px");
			return geometry;
		}
		function clearHoleContactGeometry(card) {
			[
				"--dsh-fairy-composer-hole-contact-left",
				"--dsh-fairy-composer-hole-contact-top",
				"--dsh-fairy-composer-hole-contact-width",
				"--dsh-fairy-composer-hole-contact-height"
			].forEach((name) => card?.style?.removeProperty(name));
		}
		function syncMaterialLayer(layer, input, relatedInputs = [], clampValue = clamp) {
			if (typeof relatedInputs === "function") {
				clampValue = relatedInputs;
				relatedInputs = [];
			}
			if (!layer || !input) return;
			const layerRect = layer.getBoundingClientRect();
			const inputRect = unionRect([input, ...relatedInputs]);
			if (!inputRect) return;
			const left = clampValue(inputRect.left - layerRect.left, 0, layerRect.width);
			const top = clampValue(inputRect.top - layerRect.top, 0, layerRect.height);
			const right = clampValue(inputRect.right - layerRect.left, left, layerRect.width);
			const bottom = clampValue(inputRect.bottom - layerRect.top, top, layerRect.height);
			const geometry = layer._dshMaterial;
			if (!geometry) return;
			const styles = getComputedStyle(layer);
			const color = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
			geometry.patternBase.setAttribute("fill", color("--dsh-composer-polymer", "#3b4148"));
			geometry.patternGrainLight.setAttribute("fill", color("--dsh-composer-polymer-light", "rgba(255,255,255,.06)"));
			geometry.patternGrainDark.setAttribute("fill", color("--dsh-composer-polymer-dark", "rgba(0,0,0,.06)"));
			geometry.patternLight.setAttribute("stroke", color("--dsh-composer-polymer-stripe", "rgba(255,255,255,.12)"));
			const panelWidth = Math.max(1, layerRect.width);
			const panelHeight = Math.max(1, layerRect.height);
			geometry.sheen.setAttribute("x1", "0");
			geometry.sheen.setAttribute("y1", "0");
			geometry.sheen.setAttribute("x2", String(panelWidth));
			geometry.sheen.setAttribute("y2", String(panelHeight));
			geometry.sheenLight.setAttribute("stop-color", color("--dsh-composer-sheen-light", "rgba(255,255,255,.06)"));
			geometry.sheenMid.setAttribute("stop-color", "rgba(255,255,255,0)");
			geometry.sheenDark.setAttribute("stop-color", color("--dsh-composer-sheen-dark", "rgba(0,0,0,.07)"));
			geometry.ambient.setAttribute("cx", String(panelWidth * .16));
			geometry.ambient.setAttribute("cy", String(panelHeight * .04));
			geometry.ambient.setAttribute("r", String(Math.max(panelWidth, panelHeight) * .72));
			geometry.ambientLight.setAttribute("stop-color", color("--dsh-composer-ambient-light", "rgba(255,255,255,.045)"));
			geometry.ambientFade.setAttribute("stop-color", "rgba(255,255,255,0)");
			geometry.ambientEnd.setAttribute("stop-color", color("--dsh-composer-ambient-dark", "rgba(0,0,0,.035)"));
			layer.setAttribute("viewBox", "0 0 " + layerRect.width + " " + layerRect.height);
			geometry.outer.setAttribute("width", String(layerRect.width));
			geometry.outer.setAttribute("height", String(layerRect.height));
			geometry.hole.setAttribute("x", String(left));
			geometry.hole.setAttribute("y", String(top));
			geometry.hole.setAttribute("width", String(Math.max(0, right - left)));
			geometry.hole.setAttribute("height", String(Math.max(0, bottom - top)));
			geometry.hole.setAttribute("rx", "10");
			geometry.hole.setAttribute("ry", "10");
			const width = Math.max(0, right - left);
			const height = Math.max(0, bottom - top);
			const radius = Math.min(10, width / 2, height / 2);
			const roundedHole = [
				"M " + (left + radius) + " " + top,
				"H " + (right - radius),
				"A " + radius + " " + radius + " 0 0 1 " + right + " " + (top + radius),
				"V " + (bottom - radius),
				"A " + radius + " " + radius + " 0 0 1 " + (right - radius) + " " + bottom,
				"H " + (left + radius),
				"A " + radius + " " + radius + " 0 0 1 " + left + " " + (bottom - radius),
				"V " + (top + radius),
				"A " + radius + " " + radius + " 0 0 1 " + (left + radius) + " " + top,
				"Z"
			].join(" ");
			const facePath = "M 0 0 H " + layerRect.width + " V " + layerRect.height + " H 0 Z " + roundedHole;
			geometry.face.setAttribute("d", facePath);
			geometry.sheenFace.setAttribute("d", facePath);
			geometry.ambientFace.setAttribute("d", facePath);
			syncHoleContactGeometry(layer.parentElement, inputRect, clampValue);
			layer.style.setProperty("--dsh-fairy-composer-hole-left", left + "px");
			layer.style.setProperty("--dsh-fairy-composer-hole-top", top + "px");
			layer.style.setProperty("--dsh-fairy-composer-hole-right", right + "px");
			layer.style.setProperty("--dsh-fairy-composer-hole-bottom", bottom + "px");
		}
		module.exports = {
			createMaterialLayer,
			syncMaterialLayer,
			unionRect,
			syncHoleContactGeometry,
			clearHoleContactGeometry
		};
	}));

//#endregion
//#region src/client/composer-workspace-projection.js
	var require_composer_workspace_projection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		function lastVisibleTextNode(node) {
			let textNode = null;
			const visit = (current) => {
				[...current?.childNodes || []].forEach((child) => {
					if (child.nodeType === 3) {
						if (child.nodeValue?.trim()) textNode = child;
						return;
					}
					visit(child);
				});
			};
			visit(node);
			return textNode;
		}
		function syncWorkspaceProjectionMode(projection, sessionLabel) {
			const modeOwner = projection?.querySelector?.("[data-dsh-fairy-composer-mode-control=\"true\"]") || null;
			const button = modeOwner?.querySelector?.("button") || null;
			const text = sessionLabel?.textContent?.trim() || "";
			if (!modeOwner || !button) return false;
			if (!text) {
				modeOwner.setAttribute("data-dsh-fairy-composer-mode-pending", "true");
				return false;
			}
			const textNode = lastVisibleTextNode(button);
			if (!textNode) {
				modeOwner.setAttribute("data-dsh-fairy-composer-mode-pending", "true");
				return false;
			}
			textNode.nodeValue = text;
			button.setAttribute("aria-label", text);
			button.setAttribute("title", sessionLabel.getAttribute?.("title") || text);
			modeOwner.removeAttribute("data-dsh-fairy-composer-mode-pending");
			return true;
		}
		function stripProjectionIdentity(node) {
			if (!node) return;
			node.removeAttribute("id");
			node.querySelectorAll("[id]").forEach((child) => child.removeAttribute("id"));
			node.setAttribute("aria-hidden", "true");
			node.setAttribute("inert", "");
		}
		function captureWorkspaceTemplate(workspaceRow) {
			if (!workspaceRow || workspaceRow.hasAttribute("data-dsh-fairy-composer-workspace-projection")) return null;
			const template = workspaceRow.cloneNode(true);
			stripProjectionIdentity(template);
			template.removeAttribute("data-dsh-fairy-composer-workspace");
			template.removeAttribute("data-dsh-fairy-composer-workspace-projection");
			template.querySelectorAll("[data-dsh-fairy-composer-workspace]").forEach((node) => node.removeAttribute("data-dsh-fairy-composer-workspace"));
			return template;
		}
		function ensureWorkspaceProjection(stack, workspaceRow, workspaceTemplate, existingProjection) {
			if (workspaceRow) {
				existingProjection?.remove();
				return null;
			}
			if (!stack || !workspaceTemplate) {
				existingProjection?.remove();
				return null;
			}
			if (existingProjection?.isConnected && existingProjection.parentElement === stack) return existingProjection;
			existingProjection?.remove();
			const projection = workspaceTemplate.cloneNode(true);
			projection.setAttribute("data-dsh-fairy-composer-workspace", "true");
			projection.setAttribute("data-dsh-fairy-composer-workspace-projection", "true");
			stripProjectionIdentity(projection);
			projection.querySelectorAll("button").forEach((button) => {
				button.disabled = true;
				button.setAttribute("aria-disabled", "true");
				button.tabIndex = -1;
			});
			stack.appendChild(projection);
			return projection;
		}
		module.exports = {
			captureWorkspaceTemplate,
			ensureWorkspaceProjection,
			syncWorkspaceProjectionMode
		};
	}));

//#endregion
//#region src/client/composer-inset-synchronizer.js
	var require_composer_inset_synchronizer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		function createInsetSynchronizer({ getScrollNodes, getHeight, requestFrame, cancelFrame, isDisposed }) {
			let frame = 0;
			let tracked = /* @__PURE__ */ new Map();
			const restorePadding = ({ node, padding, paddingPriority }) => {
				if (!node?.isConnected) return;
				if (padding === "") node.style.removeProperty("padding-bottom");
				else node.style.setProperty("padding-bottom", padding, paddingPriority);
				node.style.removeProperty("--dsh-fairy-composer-inset");
			};
			const sync = () => {
				frame = 0;
				const height = getHeight();
				const next = /* @__PURE__ */ new Map();
				getScrollNodes().forEach((node) => {
					const existing = tracked.get(node);
					const padding = existing?.padding ?? node.style.getPropertyValue("padding-bottom");
					const paddingPriority = existing?.paddingPriority ?? node.style.getPropertyPriority("padding-bottom");
					const basePadding = existing?.basePadding ?? getComputedStyle(node).paddingBottom;
					next.set(node, {
						node,
						padding,
						paddingPriority,
						basePadding
					});
					node.style.setProperty("--dsh-fairy-composer-inset", String(height) + "px");
					node.style.setProperty("padding-bottom", "calc(" + basePadding + " + " + height + "px)", "important");
				});
				tracked.forEach((previous, node) => {
					if (next.has(node)) return;
					restorePadding(previous);
				});
				tracked = next;
			};
			const schedule = () => {
				if (!frame && !isDisposed()) frame = requestFrame(sync);
			};
			const flush = () => {
				if (frame) cancelFrame(frame);
				frame = 0;
				sync();
			};
			const clear = () => {
				if (frame) cancelFrame(frame);
				frame = 0;
				tracked.forEach(restorePadding);
				tracked.clear();
			};
			return {
				schedule,
				flush,
				clear
			};
		}
		module.exports = { createInsetSynchronizer };
	}));

//#endregion
//#region src/client/chat-content-anchor.js
	var require_chat_content_anchor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { OFFICIAL_SELECTORS } = require_dom_adapter();
		const ANCHORED_CLASS = "dsh-fairy-chat-content-anchored";
		const ANCHOR_MIN_HEIGHT = "--dsh-fairy-chat-anchor-min-height";
		function createChatContentAnchor({ getFlowNodes, getComposerNode, requestFrame, cancelFrame, isDisposed }) {
			let frame = 0;
			let tracked = /* @__PURE__ */ new Map();
			let resizeObserver = null;
			let resizeNodes = /* @__PURE__ */ new Set();
			const restore = (node, previous) => {
				if (!node?.isConnected) return;
				node.classList.remove(ANCHORED_CLASS);
				if (previous.anchorMinHeight === "") node.style.removeProperty(ANCHOR_MIN_HEIGHT);
				else node.style.setProperty(ANCHOR_MIN_HEIGHT, previous.anchorMinHeight);
			};
			const bindResizeNodes = () => {
				if (typeof ResizeObserver !== "function") return;
				const next = new Set([...getFlowNodes?.() || [], getComposerNode?.()].filter(Boolean));
				if (next.size === resizeNodes.size && [...next].every((node) => resizeNodes.has(node))) return;
				resizeObserver?.disconnect();
				resizeObserver = new ResizeObserver(schedule);
				next.forEach((node) => resizeObserver.observe(node));
				resizeNodes = next;
			};
			const sync = () => {
				frame = 0;
				bindResizeNodes();
				const composerRect = getComposerNode?.()?.getBoundingClientRect?.();
				const next = /* @__PURE__ */ new Map();
				if (!composerRect || composerRect.width < 1 || composerRect.height < 1) {
					tracked.forEach((previous, node) => restore(node, previous));
					tracked.clear();
					return;
				}
				(getFlowNodes?.() || []).forEach((node) => {
					if (!node?.isConnected) return;
					const previous = tracked.get(node) || {
						anchorMinHeight: node.style.getPropertyValue(ANCHOR_MIN_HEIGHT),
						anchored: false
					};
					if (previous.anchored) {
						node.classList.remove(ANCHORED_CLASS);
						if (previous.anchorMinHeight === "") node.style.removeProperty(ANCHOR_MIN_HEIGHT);
						else node.style.setProperty(ANCHOR_MIN_HEIGHT, previous.anchorMinHeight);
					}
					const rect = node.getBoundingClientRect();
					if (rect.width < 1 || rect.height < 1) return;
					next.set(node, previous);
					const scrollRect = (node.closest?.(OFFICIAL_SELECTORS.conversationScroll))?.getBoundingClientRect?.();
					const availableHeight = scrollRect ? Math.max(0, composerRect.top - scrollRect.top) : composerRect.top;
					const parentStyle = node.parentElement ? getComputedStyle(node.parentElement) : null;
					const parentBottomPadding = Number.parseFloat(parentStyle?.paddingBottom || "0") || 0;
					if (rect.height <= availableHeight + parentBottomPadding + 1) {
						const minHeight = Math.max(0, Math.ceil(rect.height + composerRect.top - rect.bottom));
						node.style.setProperty(ANCHOR_MIN_HEIGHT, `${minHeight}px`);
						node.classList.add(ANCHORED_CLASS);
						previous.anchored = true;
					} else previous.anchored = false;
				});
				tracked.forEach((previous, node) => {
					if (!next.has(node)) restore(node, previous);
				});
				tracked = next;
			};
			function schedule() {
				if (!frame && !isDisposed?.()) frame = requestFrame(sync);
			}
			const flush = () => {
				if (frame) cancelFrame(frame);
				frame = 0;
				sync();
			};
			const clear = () => {
				if (frame) cancelFrame(frame);
				frame = 0;
				resizeObserver?.disconnect();
				resizeObserver = null;
				resizeNodes.clear();
				tracked.forEach((previous, node) => restore(node, previous));
				tracked.clear();
			};
			return {
				schedule,
				flush,
				clear
			};
		}
		module.exports = { createChatContentAnchor };
	}));

//#endregion
//#region src/client/to-bottom-positioner.js
	var require_to_bottom_positioner = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const SLOT_MARKER = "data-dsh-fairy-to-bottom-slot";
		const CONTROL_MARKER = "data-dsh-fairy-to-bottom-control";
		const OFFSET_PROPERTY = "--dsh-fairy-to-bottom-offset";
		const ROOT_BOTTOM_PROPERTY = "--dsh-fairy-to-bottom-bottom";
		const GAP = 12;
		const { toBottomControl } = require_dom_adapter();
		function createToBottomPositioner({ getScrollNodes, getComposerNode, requestFrame, cancelFrame, isDisposed }) {
			let frame = 0;
			let tracked = /* @__PURE__ */ new Map();
			let scrollNodes = /* @__PURE__ */ new Set();
			const controlMarkers = /* @__PURE__ */ new Map();
			let rootProperty = null;
			let rootPriority = "";
			const schedule = () => {
				if (!frame && !isDisposed()) frame = requestFrame(sync);
			};
			const bindScrollNodes = () => {
				const next = new Set((getScrollNodes?.() || []).filter(Boolean));
				scrollNodes.forEach((node) => {
					if (!next.has(node)) node.removeEventListener("scroll", schedule);
				});
				next.forEach((node) => {
					if (!scrollNodes.has(node)) node.addEventListener("scroll", schedule, { passive: true });
				});
				scrollNodes = next;
			};
			const restoreNode = ({ node, slot, property, priority }) => {
				if (slot?.isConnected) slot.removeAttribute(SLOT_MARKER);
				if (!node?.isConnected) return;
				if (property === "") node.style.removeProperty(OFFSET_PROPERTY);
				else node.style.setProperty(OFFSET_PROPERTY, property, priority);
			};
			const syncControlMarkers = (activeControls) => {
				activeControls.forEach((control) => {
					if (!controlMarkers.has(control)) controlMarkers.set(control, control.getAttribute(CONTROL_MARKER));
					control.setAttribute(CONTROL_MARKER, "true");
				});
				controlMarkers.forEach((previousValue, control) => {
					if (activeControls.has(control)) return;
					if (control.isConnected) {
						if (previousValue === null) control.removeAttribute(CONTROL_MARKER);
						else control.setAttribute(CONTROL_MARKER, previousValue);
					}
					controlMarkers.delete(control);
				});
			};
			const restoreRoot = () => {
				const root = document.documentElement;
				if (rootProperty === null) root.style.removeProperty(ROOT_BOTTOM_PROPERTY);
				else root.style.setProperty(ROOT_BOTTOM_PROPERTY, rootProperty, rootPriority);
				rootProperty = null;
				rootPriority = "";
			};
			function sync() {
				frame = 0;
				bindScrollNodes();
				const composerRect = getComposerNode?.()?.getBoundingClientRect?.();
				const next = /* @__PURE__ */ new Map();
				const activeControls = /* @__PURE__ */ new Set();
				let bottom = null;
				scrollNodes.forEach((node) => {
					const previous = tracked.get(node) || {
						node,
						slot: null,
						property: node.style.getPropertyValue(OFFSET_PROPERTY),
						priority: node.style.getPropertyPriority(OFFSET_PROPERTY)
					};
					const button = toBottomControl(node) || toBottomControl(document);
					if (button) activeControls.add(button);
					const slot = button?.closest?.(".toBottomSlot") || button?.parentElement || null;
					if (slot) slot.setAttribute(SLOT_MARKER, "true");
					if (previous.slot && previous.slot !== slot && previous.slot.isConnected) previous.slot.removeAttribute(SLOT_MARKER);
					if (composerRect && composerRect.height > 0) {
						const scrollRect = node.getBoundingClientRect();
						const inset = Math.ceil(Math.max(0, scrollRect.bottom - composerRect.top) + GAP);
						node.style.setProperty(OFFSET_PROPERTY, `${inset}px`, "important");
						bottom = Math.max(bottom ?? 0, inset);
					}
					next.set(node, {
						node,
						slot,
						property: previous.property,
						priority: previous.priority
					});
				});
				syncControlMarkers(activeControls);
				if (bottom !== null) {
					const root = document.documentElement;
					if (rootProperty === null) {
						rootProperty = root.style.getPropertyValue(ROOT_BOTTOM_PROPERTY);
						rootPriority = root.style.getPropertyPriority(ROOT_BOTTOM_PROPERTY);
					}
					root.style.setProperty(ROOT_BOTTOM_PROPERTY, `${bottom}px`, "important");
				} else restoreRoot();
				tracked.forEach((previous, node) => {
					if (!next.has(node) || !node.isConnected) restoreNode(previous);
				});
				tracked = next;
			}
			const flush = () => {
				if (frame) cancelFrame(frame);
				frame = 0;
				sync();
			};
			const clear = () => {
				if (frame) cancelFrame(frame);
				frame = 0;
				scrollNodes.forEach((node) => node.removeEventListener("scroll", schedule));
				scrollNodes.clear();
				tracked.forEach(restoreNode);
				tracked.clear();
				syncControlMarkers(/* @__PURE__ */ new Set());
				restoreRoot();
			};
			return {
				schedule,
				flush,
				clear
			};
		}
		module.exports = { createToBottomPositioner };
	}));

//#endregion
//#region src/client/composer-session-rebinding.js
	var require_composer_session_rebinding = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { conversation, composerSeat, composerCard, anyPhase, conversationScrolls } = require_dom_adapter();
		function createComposerSessionResolver(documentRef = document) {
			const resolve = () => {
				const currentConversation = conversation(documentRef);
				const currentSeat = composerSeat(currentConversation);
				return {
					conversation: currentConversation,
					seat: currentSeat,
					card: composerCard(currentSeat),
					surface: anyPhase(currentConversation) || conversationScrolls(currentConversation)[0] || null
				};
			};
			return { resolve };
		}
		module.exports = { createComposerSessionResolver };
	}));

//#endregion
//#region src/client/pointer-drag.js
	var require_pointer_drag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const diagnostics = { error(operation, error, context = {}) {
			console.error(`DSH_FAIRY_LOG ${JSON.stringify({
				schema: 1,
				timestamp: (/* @__PURE__ */ new Date()).toISOString(),
				level: "error",
				module: "dsh-fairy-visual",
				operation,
				event: "failure",
				context,
				error: {
					name: String(error?.name || "Error"),
					message: String(error?.message || error).slice(0, 320)
				}
			})}`);
		} };
		function createPointerDrag({ getTarget, getLockNodes = () => [], onStart, onMove, onEnd, onCancel }) {
			let active = null;
			let releaseFrame = 0;
			let pendingLockNodes = [];
			const documentRef = typeof document !== "undefined" ? document : null;
			const scheduleFrame = (callback) => {
				if (typeof requestAnimationFrame === "function") return requestAnimationFrame(callback);
				return setTimeout(callback, 0);
			};
			const cancelFrame = (id) => {
				if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
				else clearTimeout(id);
			};
			const cancelRelease = () => {
				if (!releaseFrame) return;
				cancelFrame(releaseFrame);
				releaseFrame = 0;
			};
			const releaseLocks = (nodes) => {
				cancelRelease();
				pendingLockNodes = nodes;
				const release = () => {
					releaseFrame = 0;
					nodes.forEach((node) => node?.removeAttribute("data-dragging"));
					if (pendingLockNodes === nodes) pendingLockNodes = [];
				};
				releaseFrame = scheduleFrame(release);
			};
			const releaseLocksImmediately = (nodes) => {
				nodes.forEach((node) => node?.removeAttribute("data-dragging"));
				if (pendingLockNodes === nodes) pendingLockNodes = [];
			};
			const removeWindowListeners = () => {
				window.removeEventListener("pointermove", onPointerMove, true);
				window.removeEventListener("pointerup", onPointerUp, true);
				window.removeEventListener("pointercancel", onPointerCancel, true);
				window.removeEventListener("blur", onWindowBlur, true);
				documentRef?.removeEventListener("visibilitychange", onDocumentVisibilityChange, true);
				window.removeEventListener("pagehide", onPageHide, true);
			};
			const finish = (event, commit, reason) => {
				if (!active) return false;
				const session = active;
				active = null;
				removeWindowListeners();
				try {
					if (commit) onEnd?.(event, session, reason);
					else onCancel?.(event, session, reason);
				} catch (error) {
					diagnostics.error("pointer-drag.finish", error, {});
				} finally {
					try {
						session.target?.releasePointerCapture?.(event?.pointerId ?? session.pointerId);
					} catch {}
					releaseLocks(session.lockNodes);
				}
				return true;
			};
			const onPointerMove = (event) => {
				if (!active || event.pointerId !== active.pointerId) return;
				event.preventDefault();
				try {
					onMove?.(event, active);
				} catch (error) {
					diagnostics.error("pointer-drag.move", error, {});
					finish(event, false, "error");
				}
			};
			const onPointerUp = (event) => {
				if (!active || event.pointerId !== active.pointerId) return;
				finish(event, true, "pointerup");
			};
			const onPointerCancel = (event) => {
				if (!active || event.pointerId !== active.pointerId) return;
				finish(event, false, "pointercancel");
			};
			const onWindowBlur = () => {
				finish(null, false, "blur");
			};
			const onDocumentVisibilityChange = () => {
				if (documentRef?.visibilityState === "hidden") finish(null, false, "visibilitychange");
			};
			const onPageHide = () => {
				finish(null, false, "pagehide");
			};
			const start = (event, payload) => {
				const target = getTarget();
				if (!target || event.button != null && event.button !== 0) return false;
				if (active) finish(null, false, "replaced");
				cancelRelease();
				event.preventDefault();
				const lockNodes = [.../* @__PURE__ */ new Set([target, ...getLockNodes()])].filter(Boolean);
				active = {
					pointerId: event.pointerId,
					target,
					payload,
					lockNodes
				};
				lockNodes.forEach((node) => node.setAttribute("data-dragging", "true"));
				try {
					target.setPointerCapture?.(event.pointerId);
				} catch {}
				window.addEventListener("pointermove", onPointerMove, true);
				window.addEventListener("pointerup", onPointerUp, true);
				window.addEventListener("pointercancel", onPointerCancel, true);
				window.addEventListener("blur", onWindowBlur, true);
				documentRef?.addEventListener("visibilitychange", onDocumentVisibilityChange, true);
				window.addEventListener("pagehide", onPageHide, true);
				try {
					onStart?.(event, active);
				} catch (error) {
					diagnostics.error("pointer-drag.start", error, {});
					finish(event, false, "error");
					return false;
				}
				return true;
			};
			const dispose = () => {
				const session = active;
				if (session) finish(null, false, "dispose");
				cancelRelease();
				releaseLocksImmediately(session?.lockNodes || pendingLockNodes);
				removeWindowListeners();
			};
			return {
				start,
				finish,
				dispose,
				get active() {
					return active;
				}
			};
		}
		module.exports = { createPointerDrag };
	}));

//#endregion
//#region src/client/composer-resize-controller.js
	var require_composer_resize_controller = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const HEIGHT_MIN = 132;
		const HEIGHT_MAX = 420;
		const CONTENT_MIN = 176;
		const { createPointerDrag } = require_pointer_drag();
		const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
		function createResizeController({ isEnabled, getSeat, getHeight, getRenderedHeight = getHeight, setHeight, schedule, scheduleInsets, flushInsets, persistHeight }) {
			let handle = null;
			let dragging = null;
			let pointerDrag = null;
			const maxHeight = () => {
				const viewportHeight = window.visualViewport?.height || window.innerHeight;
				return Math.max(HEIGHT_MIN, Math.min(HEIGHT_MAX, viewportHeight - CONTENT_MIN));
			};
			const updateHandle = () => {
				if (!handle) return;
				handle.setAttribute("aria-valuemin", String(HEIGHT_MIN));
				handle.setAttribute("aria-valuemax", String(Math.round(maxHeight())));
				handle.setAttribute("aria-valuenow", String(Math.round(getRenderedHeight())));
			};
			const updateHeight = (next, persist = false) => {
				const height = clamp(next, HEIGHT_MIN, maxHeight());
				setHeight(height);
				const seat = getSeat();
				if (seat) {
					const value = String(Math.round(getRenderedHeight())) + "px";
					seat.style.setProperty("height", value);
					seat.style.setProperty("--dsh-fairy-composer-height", value);
				}
				scheduleInsets();
				schedule();
				updateHandle();
				if (persist) {
					flushInsets();
					persistHeight(Math.round(height));
				}
			};
			function onPointerDown(event) {
				if (!isEnabled() || !handle) return;
				const payload = {
					pointerId: event.pointerId,
					startY: event.clientY,
					startHeight: getHeight(),
					handle
				};
				pointerDrag.start(event, payload);
			}
			const finishDragging = (event, persist) => {
				if (!pointerDrag?.active) return;
				pointerDrag.finish(event, persist, persist ? "manual" : "cancel");
			};
			pointerDrag = createPointerDrag({
				getTarget: () => handle,
				getLockNodes: () => [getSeat()],
				onStart: (_event, session) => {
					dragging = session.payload;
				},
				onMove: (event, session) => {
					const drag = session.payload;
					updateHeight(drag.startHeight - (event.clientY - drag.startY));
				},
				onEnd: () => {
					updateHeight(getHeight(), true);
					dragging = null;
				},
				onCancel: (_event, _session, reason) => {
					if (reason === "blur" || reason === "pointercancel") updateHeight(getHeight(), true);
					dragging = null;
				}
			});
			function onKeyDown(event) {
				if (!isEnabled()) return;
				if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Home" || event.key === "End") {
					event.preventDefault();
					const delta = event.key === "ArrowUp" ? 8 : event.key === "ArrowDown" ? -8 : 0;
					const next = event.key === "Home" ? HEIGHT_MIN : event.key === "End" ? HEIGHT_MAX : getHeight() + delta;
					updateHeight(next, true);
				}
			}
			const mount = () => {
				const seat = getSeat();
				if (!seat || handle) return;
				handle = document.createElement("div");
				handle.className = "dsh-fairy-composer-resizer";
				handle.setAttribute("role", "separator");
				handle.setAttribute("aria-orientation", "horizontal");
				handle.setAttribute("aria-label", "调整输入控制台高度");
				handle.tabIndex = 0;
				seat.appendChild(handle);
				handle.addEventListener("pointerdown", onPointerDown);
				handle.addEventListener("keydown", onKeyDown);
				updateHandle();
			};
			const unmount = () => {
				pointerDrag?.dispose();
				dragging = null;
				handle?.removeEventListener("pointerdown", onPointerDown);
				handle?.removeEventListener("keydown", onKeyDown);
				handle?.remove();
				handle = null;
			};
			return {
				mount,
				unmount,
				updateHeight,
				updateHandle,
				finishDragging,
				get handle() {
					return handle;
				},
				get dragging() {
					return dragging;
				}
			};
		}
		module.exports = {
			createResizeController,
			HEIGHT_MIN,
			HEIGHT_MAX,
			CONTENT_MIN
		};
	}));

//#endregion
//#region src/client/settings-write.js
	var require_settings_write = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const diagnostics = { error(operation, error, context = {}) {
			console.error(`DSH_FAIRY_LOG ${JSON.stringify({
				schema: 1,
				timestamp: (/* @__PURE__ */ new Date()).toISOString(),
				level: "error",
				module: "dsh-fairy-visual",
				operation,
				event: "failure",
				context,
				error: {
					name: String(error?.name || "Error"),
					message: String(error?.message || error).slice(0, 320)
				}
			})}`);
		} };
		function settingError(field, error) {
			diagnostics.error("settings.persist", error, { field });
		}
		function setControllerSetting(controller, field, value) {
			try {
				return Promise.resolve(controller.set(field, value));
			} catch (error) {
				return Promise.reject(error);
			}
		}
		function saveControllerSetting(controller, field, value) {
			return setControllerSetting(controller, field, value).catch((error) => {
				settingError(field, error);
			});
		}
		module.exports = {
			setControllerSetting,
			saveControllerSetting,
			settingError
		};
	}));

//#endregion
//#region src/client/mascot-scale-control.js
	var require_mascot_scale_control = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const CONTROL_ATTR = "data-dsh-fairy-mascot-scale-control";
		const BASE_ATTR = "data-dsh-fairy-mascot-scale-base";
		const INPUT_ATTR = "data-dsh-fairy-mascot-scale-input";
		const ROOT_ID = "dsh-fairy-root";
		const MASCOT_SCALE_MIN = .55;
		const MASCOT_SCALE_MAX = 1;
		const MASCOT_SCALE_STEP = .01;
		const MASCOT_SCALE_DEFAULT = 1;
		const MASCOT_GEOMETRY_EVENT = "dsh-fairy-mascot-geometry";
		const { setControllerSetting, settingError } = require_settings_write();
		function scaleProgress(value) {
			return (clampScale(value) - MASCOT_SCALE_MIN) / .44999999999999996 * 100;
		}
		function clampScale(value) {
			const numeric = Number(value);
			if (!Number.isFinite(numeric)) return MASCOT_SCALE_DEFAULT;
			const stepped = Math.round(numeric / MASCOT_SCALE_STEP) * MASCOT_SCALE_STEP;
			return Math.min(MASCOT_SCALE_MAX, Math.max(MASCOT_SCALE_MIN, Number(stepped.toFixed(2))));
		}
		function mascotRoot(documentRef = document) {
			return documentRef?.getElementById(ROOT_ID) || null;
		}
		function notifyMascotGeometry(documentRef = document, scale = MASCOT_SCALE_DEFAULT) {
			const target = documentRef?.defaultView || (typeof window !== "undefined" ? window : null);
			if (!target?.dispatchEvent || typeof CustomEvent !== "function") return;
			target.dispatchEvent(new CustomEvent(MASCOT_GEOMETRY_EVENT, { detail: { scale } }));
		}
		function applyMascotScale(value, documentRef = document) {
			const root = mascotRoot(documentRef);
			const float = root?.querySelector(".dsh-fairy-float");
			const eye = root?.querySelector(".dsh-fairy-outer-disc");
			if (!root || !float || !eye) return false;
			const scale = clampScale(value);
			float.style.transform = "none";
			const floatRect = float.getBoundingClientRect();
			const eyeRect = eye.getBoundingClientRect();
			const layoutWidth = float.offsetWidth || floatRect.width || 1;
			const layoutHeight = float.offsetHeight || floatRect.height || 1;
			const viewportScaleX = floatRect.width / layoutWidth || 1;
			const viewportScaleY = floatRect.height / layoutHeight || 1;
			const originX = (eyeRect.left + eyeRect.width * .5 - floatRect.left) / viewportScaleX;
			const originY = (eyeRect.top - floatRect.top) / viewportScaleY;
			float.style.transformOrigin = `${originX.toFixed(2)}px ${originY.toFixed(2)}px`;
			float.style.transform = `scale(${scale})`;
			root.style.setProperty("--dsh-fairy-mascot-scale", String(scale));
			root.setAttribute("data-dsh-fairy-mascot-scale", String(scale));
			notifyMascotGeometry(documentRef, scale);
			return true;
		}
		function scheduleMascotScale(value, documentRef = document) {
			let frame = 0;
			let attempts = 0;
			const run = () => {
				frame = 0;
				if (applyMascotScale(value, documentRef) || attempts++ >= 24) return;
				frame = requestAnimationFrame(run);
			};
			run();
			return () => {
				if (frame) cancelAnimationFrame(frame);
			};
		}
		function createMascotScaleBase(host, controller, documentRef = document) {
			if (!host) return null;
			const existing = host.querySelector?.(`[${BASE_ATTR}="true"]`);
			if (existing) {
				existing.removeAttribute("aria-hidden");
				const control = controller && !existing.querySelector(`[${CONTROL_ATTR}="true"]`) ? createMascotScaleControl(existing, controller, documentRef) : null;
				return {
					host,
					node: existing,
					dispose() {
						control?.dispose?.();
					}
				};
			}
			const shell = documentRef.createElement("span");
			shell.setAttribute(BASE_ATTR, "true");
			host.appendChild(shell);
			const control = controller ? createMascotScaleControl(shell, controller, documentRef) : null;
			return {
				host,
				node: shell,
				dispose() {
					control?.dispose?.();
					if (shell.parentElement === host) shell.remove();
				}
			};
		}
		function createMascotScaleControl(host, controller, documentRef = document) {
			if (!host || !controller) return null;
			const existing = host.querySelector(`[${CONTROL_ATTR}="true"]`);
			if (existing) return {
				host,
				node: existing,
				dispose() {}
			};
			const shell = documentRef.createElement("span");
			shell.setAttribute(CONTROL_ATTR, "true");
			shell.setAttribute("role", "group");
			shell.setAttribute("aria-label", "Fairy 眼睛大小");
			const input = documentRef.createElement("input");
			input.type = "range";
			input.setAttribute(INPUT_ATTR, "true");
			input.min = String(MASCOT_SCALE_MIN);
			input.max = String(MASCOT_SCALE_MAX);
			input.step = String(MASCOT_SCALE_STEP);
			input.setAttribute("aria-label", "Fairy 眼睛大小");
			shell.appendChild(input);
			host.appendChild(shell);
			let committed = clampScale(controller.getSnapshot?.().settings?.mascotScale);
			let interacting = false;
			let cancelPendingScale = null;
			const updateInput = (value) => {
				const scale = clampScale(value);
				input.value = String(scale);
				const progress = `${scaleProgress(scale).toFixed(2)}%`;
				input.style.setProperty("--dsh-fairy-scale", progress);
				shell.style.setProperty("--dsh-fairy-scale", progress);
				input.setAttribute("aria-valuetext", `${Math.round(scale * 100)}%`);
				input.title = `Fairy 眼睛大小 ${Math.round(scale * 100)}%`;
				cancelPendingScale?.();
				cancelPendingScale = scheduleMascotScale(scale, documentRef);
			};
			const commit = () => {
				const next = clampScale(input.value);
				input.value = String(next);
				if (next === committed) {
					interacting = false;
					return;
				}
				committed = next;
				interacting = false;
				setControllerSetting(controller, "mascotScale", next).catch((error) => {
					settingError("mascotScale", error);
					committed = clampScale(controller.getSnapshot?.().settings?.mascotScale);
					updateInput(committed);
				});
			};
			const onInput = () => updateInput(input.value);
			const onPointerDown = () => {
				interacting = true;
			};
			const onPointerUp = () => commit();
			const onPointerCancel = () => commit();
			const onBlur = () => {
				if (interacting) commit();
			};
			const onKeyDown = () => {
				interacting = true;
			};
			const onKeyUp = () => commit();
			const onChange = () => commit();
			input.addEventListener("input", onInput);
			input.addEventListener("pointerdown", onPointerDown);
			input.addEventListener("pointerup", onPointerUp);
			input.addEventListener("pointercancel", onPointerCancel);
			input.addEventListener("keydown", onKeyDown);
			input.addEventListener("keyup", onKeyUp);
			input.addEventListener("change", onChange);
			input.addEventListener("blur", onBlur);
			const off = controller.subscribe?.(() => {
				if (interacting) return;
				const next = clampScale(controller.getSnapshot?.().settings?.mascotScale);
				committed = next;
				updateInput(next);
			});
			updateInput(committed);
			return {
				host,
				node: shell,
				dispose() {
					cancelPendingScale?.();
					cancelPendingScale = null;
					off?.();
					input.removeEventListener("input", onInput);
					input.removeEventListener("pointerdown", onPointerDown);
					input.removeEventListener("pointerup", onPointerUp);
					input.removeEventListener("pointercancel", onPointerCancel);
					input.removeEventListener("keydown", onKeyDown);
					input.removeEventListener("keyup", onKeyUp);
					input.removeEventListener("change", onChange);
					input.removeEventListener("blur", onBlur);
					shell.remove();
				}
			};
		}
		module.exports = {
			MASCOT_SCALE_MIN,
			MASCOT_SCALE_MAX,
			MASCOT_SCALE_STEP,
			MASCOT_SCALE_DEFAULT,
			MASCOT_GEOMETRY_EVENT,
			applyMascotScale,
			scheduleMascotScale,
			createMascotScaleBase,
			createMascotScaleControl
		};
	}));

//#endregion
//#region src/client/mascot-animation-speed-control.js
	var require_mascot_animation_speed_control = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const BASE_ATTR = "data-dsh-fairy-mascot-animation-speed-base";
		const CONTROL_ATTR = "data-dsh-fairy-mascot-animation-speed-control";
		const TICK_ATTR = "data-dsh-fairy-mascot-animation-speed-tick";
		const THUMB_ATTR = "data-dsh-fairy-mascot-animation-speed-thumb";
		const POSITION_ATTR = "data-dsh-fairy-mascot-animation-speed-position";
		const SPEED_EVENT = "dsh-fairy-mascot-animation-speed";
		const SPEED_STOPS = Object.freeze([
			Object.freeze({
				position: 0,
				rate: .7,
				label: "0.7"
			}),
			Object.freeze({
				position: .5,
				rate: 1,
				label: "1"
			}),
			Object.freeze({
				position: 1,
				rate: 1.5,
				label: "1.5"
			})
		]);
		let selectedPosition = .5;
		function positionForRate(rate) {
			return SPEED_STOPS.find((stop) => stop.rate === rate)?.position ?? .5;
		}
		function bindVisualDrag(control, documentRef, options = {}) {
			if (!control || control.__dshFairySpeedDrag) return () => {};
			const positions = [
				0,
				.5,
				1
			];
			selectedPosition = positionForRate(options.initialRate);
			let dragging = false;
			const emitSpeed = (position) => {
				const stop = SPEED_STOPS.find((candidate) => candidate.position === position) || SPEED_STOPS[1];
				selectedPosition = stop.position;
				options.onChange?.(stop.rate);
				const target = documentRef?.defaultView || (typeof window !== "undefined" ? window : null);
				if (typeof CustomEvent !== "function" || !target?.dispatchEvent) return;
				target.dispatchEvent(new CustomEvent(SPEED_EVENT, { detail: {
					rate: stop.rate,
					position: stop.position
				} }));
			};
			const setPosition = (position, animate = true) => {
				control.setAttribute(POSITION_ATTR, String(position));
				control.setAttribute("data-dragging", animate ? "false" : "true");
			};
			const positionFromEvent = (event) => {
				const rect = control.getBoundingClientRect();
				if (!rect.width) return .5;
				return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
			};
			const snap = (value) => positions.reduce((closest, candidate) => Math.abs(candidate - value) < Math.abs(closest - value) ? candidate : closest, positions[0]);
			const onPointerMove = (event) => {
				if (!dragging) return;
				event.preventDefault();
				setPosition(snap(positionFromEvent(event)), false);
			};
			const onPointerUp = (event) => {
				if (!dragging) return;
				dragging = false;
				control.releasePointerCapture?.(event.pointerId);
				documentRef.removeEventListener("pointermove", onPointerMove);
				documentRef.removeEventListener("pointerup", onPointerUp);
				documentRef.removeEventListener("pointercancel", onPointerUp);
				const position = snap(positionFromEvent(event));
				setPosition(position, true);
				emitSpeed(position);
			};
			const onPointerDown = (event) => {
				if (event.button !== void 0 && event.button !== 0) return;
				dragging = true;
				control.setPointerCapture?.(event.pointerId);
				documentRef.addEventListener("pointermove", onPointerMove, { passive: false });
				documentRef.addEventListener("pointerup", onPointerUp);
				documentRef.addEventListener("pointercancel", onPointerUp);
				const position = snap(positionFromEvent(event));
				setPosition(position, false);
				emitSpeed(position);
				event.preventDefault();
			};
			control.addEventListener("pointerdown", onPointerDown, { passive: false });
			control.__dshFairySpeedDrag = true;
			setPosition(selectedPosition, true);
			return () => {
				control.removeEventListener("pointerdown", onPointerDown);
				documentRef.removeEventListener("pointermove", onPointerMove);
				documentRef.removeEventListener("pointerup", onPointerUp);
				documentRef.removeEventListener("pointercancel", onPointerUp);
				delete control.__dshFairySpeedDrag;
			};
		}
		function createMascotAnimationSpeedBase(host, documentRef = document, options = {}) {
			if (!host) return null;
			const existing = host.querySelector?.(`[${BASE_ATTR}="true"]`);
			if (existing) {
				const disposeDrag = bindVisualDrag(existing.querySelector(`[${CONTROL_ATTR}="true"]`), documentRef, options);
				return {
					host,
					node: existing,
					dispose() {
						disposeDrag();
						if (existing.parentElement === host) existing.remove();
					}
				};
			}
			const base = documentRef.createElement("span");
			base.setAttribute(BASE_ATTR, "true");
			base.setAttribute("aria-hidden", "true");
			const control = documentRef.createElement("span");
			control.setAttribute(CONTROL_ATTR, "true");
			[
				"0.7",
				"1",
				"1.5"
			].forEach((speed) => {
				const tick = documentRef.createElement("span");
				tick.setAttribute(TICK_ATTR, speed);
				tick.setAttribute("aria-hidden", "true");
				control.appendChild(tick);
			});
			const thumb = documentRef.createElement("span");
			thumb.setAttribute(THUMB_ATTR, "1");
			thumb.setAttribute("aria-hidden", "true");
			control.appendChild(thumb);
			base.appendChild(control);
			const disposeDrag = bindVisualDrag(control, documentRef, options);
			host.appendChild(base);
			return {
				host,
				node: base,
				dispose() {
					disposeDrag();
					if (base.parentElement === host) base.remove();
				}
			};
		}
		module.exports = {
			BASE_ATTR,
			CONTROL_ATTR,
			TICK_ATTR,
			THUMB_ATTR,
			POSITION_ATTR,
			SPEED_EVENT,
			SPEED_STOPS,
			createMascotAnimationSpeedBase
		};
	}));

//#endregion
//#region src/client/composer-dock.js
	var require_composer_dock = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const COMPOSER_ATTR = "data-dsh-fairy-composer-dock";
		const { OFFICIAL_ATTRIBUTES, conversationScrolls, chatFlows, inputScroll, sessionAgentPresetLabel, sessionHeaderActions } = require_dom_adapter();
		const { attachmentSlot, attachmentRail, attachmentRailHeight, attachmentDockHeight } = require_composer_attachments();
		const { createLifecycleScope, claimSingleton } = require_lifecycle();
		const { createManagedMutationObserver, getDomObserverManager } = require_dom_observer_manager();
		const { placeNativeControlMarkers } = require_composer_native_controls();
		const { createMaterialLayer, syncMaterialLayer: syncMaterialLayerModule, clearHoleContactGeometry } = require_composer_material_layer();
		const { captureWorkspaceTemplate: captureWorkspaceTemplateModule, ensureWorkspaceProjection: ensureWorkspaceProjectionModule, syncWorkspaceProjectionMode: syncWorkspaceProjectionModeModule } = require_composer_workspace_projection();
		const { createInsetSynchronizer } = require_composer_inset_synchronizer();
		const { createChatContentAnchor } = require_chat_content_anchor();
		const { createToBottomPositioner } = require_to_bottom_positioner();
		const { createComposerSessionResolver } = require_composer_session_rebinding();
		const { createResizeController, HEIGHT_MIN, HEIGHT_MAX, CONTENT_MIN } = require_composer_resize_controller();
		const { setControllerSetting, settingError } = require_settings_write();
		const { createMascotScaleBase } = require_mascot_scale_control();
		const { createMascotAnimationSpeedBase } = require_mascot_animation_speed_control();
		const MARKER_ATTRS = [
			COMPOSER_ATTR,
			"data-dsh-fairy-composer-row",
			"data-dsh-fairy-composer-tools",
			"data-dsh-fairy-composer-trailing",
			"data-dsh-fairy-composer-accessory",
			"data-dsh-fairy-composer-attachments",
			"data-dsh-fairy-composer-attachments-active",
			"data-dsh-fairy-composer-bar-root",
			"data-dsh-fairy-composer-bar-host",
			"data-dsh-fairy-composer-stack",
			"data-dsh-fairy-composer-workspace",
			"data-dsh-fairy-composer-chrome",
			"data-dsh-fairy-composer-send-control",
			"data-dsh-fairy-composer-context-control",
			"data-dsh-fairy-composer-output-control",
			"data-dsh-fairy-composer-voice-control",
			"data-dsh-fairy-composer-model-control",
			"data-dsh-fairy-composer-native-model-control",
			"data-dsh-fairy-composer-reasoning-control",
			"data-dsh-fairy-composer-command-control",
			"data-dsh-fairy-composer-access-control",
			"data-dsh-fairy-composer-workspace-control",
			"data-dsh-fairy-composer-mode-control",
			"data-dsh-fairy-model-menu-open"
		];
		const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
		function clearMarker(node, name) {
			if (node?.isConnected) node.removeAttribute(name);
		}
		function clearMarkerTree(root, name) {
			clearMarker(root, name);
			root?.querySelectorAll?.(`[${name}]`).forEach((node) => clearMarker(node, name));
		}
		function mountComposerDock(controller) {
			const lifecycle = claimSingleton(document, "composer-dock", createLifecycleScope("composer-dock"));
			const domObserverManager = getDomObserverManager(document);
			let disposed = false;
			let frame = 0;
			let structureFrame = 0;
			let observer = null;
			let headerObserver = null;
			let resizeObserver = null;
			let conversation = null;
			let surface = null;
			let observedHeaderActions = null;
			let seat = null;
			let card = null;
			let clearControls = () => {};
			let mascotScaleBase = null;
			let mascotAnimationSpeedBase = null;
			let previousSeatStyle = null;
			let height = HEIGHT_MIN;
			let workspaceTemplate = null;
			let workspaceProjection = null;
			let materialLayer = null;
			let pendingPersistedHeight = null;
			const layoutFrameKey = {};
			const structureFrameKey = {};
			const sessionResolver = createComposerSessionResolver(document);
			const snapshot = () => controller.getSnapshot?.() || { settings: {} };
			const enabled = () => Boolean(snapshot().settings?.enabled);
			const readHeight = () => clamp(Number(snapshot().settings?.composerDockHeight) || HEIGHT_MIN, HEIGHT_MIN, HEIGHT_MAX);
			const effectiveHeight = () => pendingPersistedHeight ?? readHeight();
			const maximumDockHeight = () => {
				const viewportHeight = window.visualViewport?.height || window.innerHeight;
				return Math.max(HEIGHT_MIN, Math.min(HEIGHT_MAX, viewportHeight - CONTENT_MIN));
			};
			const renderedHeight = () => attachmentDockHeight(height, attachmentRailHeight(attachmentSlot(card)), HEIGHT_MIN, maximumDockHeight());
			const schedule = () => {
				if (!frame && !disposed) frame = domObserverManager.scheduleFrame(layoutFrameKey, sync);
			};
			const scheduleStructure = () => {
				if (!structureFrame && !disposed) structureFrame = domObserverManager.scheduleFrame(structureFrameKey, bind);
			};
			const bindHeaderObserver = () => {
				const nextHeaderActions = sessionHeaderActions(conversation);
				if (nextHeaderActions === observedHeaderActions) return;
				headerObserver?.disconnect();
				observedHeaderActions = nextHeaderActions;
				if (headerObserver && observedHeaderActions) headerObserver.observe(observedHeaderActions, {
					characterData: true,
					subtree: true
				});
			};
			const insetSynchronizer = createInsetSynchronizer({
				getScrollNodes: () => conversationScrolls(conversation),
				getHeight: renderedHeight,
				requestFrame: (callback) => requestAnimationFrame(callback),
				cancelFrame: (id) => cancelAnimationFrame(id),
				isDisposed: () => disposed
			});
			const clearScrollInsets = () => insetSynchronizer.clear();
			const scheduleScrollInsets = () => insetSynchronizer.schedule();
			const flushScrollInsets = () => insetSynchronizer.flush();
			const contentAnchor = createChatContentAnchor({
				getFlowNodes: () => chatFlows(conversation),
				getComposerNode: () => seat,
				requestFrame: (callback) => requestAnimationFrame(callback),
				cancelFrame: (id) => cancelAnimationFrame(id),
				isDisposed: () => disposed
			});
			const toBottomPositioner = createToBottomPositioner({
				getScrollNodes: () => conversationScrolls(conversation),
				getComposerNode: () => seat,
				requestFrame: (callback) => requestAnimationFrame(callback),
				cancelFrame: (id) => cancelAnimationFrame(id),
				isDisposed: () => disposed
			});
			const removeMaterialLayer = () => {
				materialLayer?.remove();
				clearHoleContactGeometry(card);
				materialLayer = null;
			};
			const ensureMaterialLayer = () => {
				if (!card) return null;
				if (materialLayer?.isConnected && materialLayer.parentElement === card) return materialLayer;
				removeMaterialLayer();
				materialLayer = createMaterialLayer(card);
				return materialLayer;
			};
			const syncMaterialLayer = () => {
				const layer = ensureMaterialLayer();
				syncMaterialLayerModule(layer, inputScroll(card), [attachmentRail(attachmentSlot(card))]);
			};
			const restoreSeat = ({ clearWorkspaceTemplate = false } = {}) => {
				contentAnchor.clear();
				toBottomPositioner.clear();
				clearScrollInsets();
				resizeObserver?.disconnect();
				resizeObserver = null;
				conversation = null;
				surface = null;
				if (clearWorkspaceTemplate) workspaceTemplate = null;
				if (!seat) return;
				workspaceProjection?.remove();
				workspaceProjection = null;
				removeMaterialLayer();
				removeMascotScaleBase();
				removeMascotAnimationSpeedBase();
				removeLegacyVoiceDensityMarker();
				seat.querySelector("[data-dsh-fairy-composer-stack=\"true\"]")?.removeAttribute("data-dsh-fairy-model-menu-open");
				MARKER_ATTRS.forEach((name) => clearMarkerTree(seat, name));
				clearControls();
				if (previousSeatStyle) Object.entries(previousSeatStyle).forEach(([name, { value, priority }]) => {
					if (value) seat.style.setProperty(name, value, priority);
					else seat.style.removeProperty(name);
				});
				else [
					"left",
					"width",
					"height",
					"bottom",
					"top",
					"position",
					"z-index",
					"--dsh-fairy-composer-height"
				].forEach((name) => seat.style.removeProperty(name));
				previousSeatStyle = null;
				removeHandle();
				seat = null;
				card = null;
			};
			const resizeController = createResizeController({
				isEnabled: enabled,
				getSeat: () => seat,
				getHeight: () => height,
				getRenderedHeight: renderedHeight,
				setHeight: (next) => {
					height = next;
				},
				schedule,
				scheduleInsets: scheduleScrollInsets,
				flushInsets: flushScrollInsets,
				persistHeight: (next) => {
					pendingPersistedHeight = next;
					const result = setControllerSetting(controller, "composerDockHeight", next);
					result.then(() => {
						if (readHeight() === next) pendingPersistedHeight = null;
						schedule();
					}).catch((error) => {
						settingError("composerDockHeight", error);
						pendingPersistedHeight = null;
						schedule();
					});
					return result;
				}
			});
			const removeHandle = () => resizeController.unmount();
			const createHandle = () => resizeController.mount();
			const updateHandle = () => resizeController.updateHandle();
			const removeLegacyMascotScaleControl = () => {
				seat?.querySelectorAll?.("[data-dsh-fairy-mascot-scale-control=\"true\"]").forEach((node) => {
					if (!node.closest?.("[data-dsh-fairy-mascot-scale-base=\"true\"]")) node.remove();
				});
			};
			const removeMascotScaleBase = () => {
				mascotScaleBase?.dispose?.();
				mascotScaleBase = null;
				seat?.querySelectorAll?.("[data-dsh-fairy-mascot-scale-base=\"true\"]").forEach((node) => node.remove());
			};
			const removeMascotAnimationSpeedBase = () => {
				mascotAnimationSpeedBase?.dispose?.();
				mascotAnimationSpeedBase = null;
				seat?.querySelectorAll?.("[data-dsh-fairy-mascot-animation-speed-base=\"true\"]").forEach((node) => node.remove());
			};
			const ensureMascotAnimationSpeedBase = () => {
				if (!card) return;
				if (mascotAnimationSpeedBase?.node?.isConnected && mascotAnimationSpeedBase.host === card) return;
				removeMascotAnimationSpeedBase();
				mascotAnimationSpeedBase = createMascotAnimationSpeedBase(card, document, {
					initialRate: Number(snapshot().settings?.mascotAnimationSpeed) || 1,
					onChange: (rate) => {
						const result = setControllerSetting(controller, "mascotAnimationSpeed", rate);
						result.catch((error) => settingError("mascotAnimationSpeed", error));
						return result;
					}
				});
			};
			const ensureMascotScaleBase = () => {
				if (!card) return;
				if (mascotScaleBase?.node?.isConnected && mascotScaleBase.host === card) return;
				removeMascotScaleBase();
				mascotScaleBase = createMascotScaleBase(card, controller);
			};
			const removeLegacyVoiceDensityMarker = (node = card) => {
				node?.removeAttribute?.("data-dsh-fairy-composer-voice-density");
			};
			const syncReasoningMenuLayer = () => {
				const stack = seat?.querySelector("[data-dsh-fairy-composer-stack=\"true\"]");
				if (!stack) return;
				if (Boolean(stack.querySelector("[data-dsh-fairy-composer-reasoning-control=\"true\"] [role=\"menu\"], [data-dsh-fairy-composer-reasoning-control=\"true\"] [aria-expanded=\"true\"]"))) {
					stack.setAttribute("data-dsh-fairy-model-menu-open", "true");
					seat.setAttribute("data-dsh-fairy-model-menu-open", "true");
				} else {
					stack.removeAttribute("data-dsh-fairy-model-menu-open");
					seat.removeAttribute("data-dsh-fairy-model-menu-open");
				}
			};
			const captureWorkspaceTemplate = (workspaceRow) => {
				const nextTemplate = captureWorkspaceTemplateModule(workspaceRow);
				if (nextTemplate) workspaceTemplate = nextTemplate;
			};
			const ensureWorkspaceProjection = (stack, workspaceRow) => {
				workspaceProjection = ensureWorkspaceProjectionModule(stack, workspaceRow, workspaceTemplate, workspaceProjection);
				syncWorkspaceProjectionModeModule(workspaceProjection, sessionAgentPresetLabel(conversation));
			};
			function sync() {
				frame = 0;
				if (!enabled()) {
					restoreSeat();
					return;
				}
				const resolvedSession = sessionResolver.resolve();
				const currentConversation = resolvedSession.conversation;
				const currentSeat = resolvedSession.seat;
				const currentCard = resolvedSession.card;
				if (!currentConversation || !currentSeat || !currentCard) {
					if (seat && (!seat.isConnected || !card?.isConnected)) restoreSeat();
					contentAnchor.clear();
					return;
				}
				if (currentConversation !== conversation || currentSeat !== seat) {
					restoreSeat();
					conversation = currentConversation;
					seat = currentSeat;
					card = currentCard;
					removeLegacyVoiceDensityMarker();
					previousSeatStyle = {};
					[
						"left",
						"width",
						"height",
						"bottom",
						"top",
						"position",
						"z-index",
						"--dsh-fairy-composer-height"
					].forEach((name) => {
						previousSeatStyle[name] = {
							value: seat.style.getPropertyValue(name),
							priority: seat.style.getPropertyPriority(name)
						};
					});
					seat.setAttribute(COMPOSER_ATTR, "true");
					clearControls = placeNativeControlMarkers(card);
					createHandle();
				} else if (currentCard !== card) {
					clearControls();
					workspaceProjection?.remove();
					workspaceProjection = null;
					removeMaterialLayer();
					removeMascotScaleBase();
					removeMascotAnimationSpeedBase();
					removeLegacyVoiceDensityMarker(card);
					card = currentCard;
					removeLegacyVoiceDensityMarker();
					clearControls = placeNativeControlMarkers(card);
				}
				removeLegacyMascotScaleControl();
				ensureMascotScaleBase();
				ensureMascotAnimationSpeedBase();
				const workspaceRow = seat?.querySelector("[data-dsh-fairy-composer-workspace=\"true\"]:not([data-dsh-fairy-composer-workspace-projection=\"true\"])");
				if (workspaceRow) captureWorkspaceTemplate(workspaceRow);
				const stack = seat?.querySelector("[data-dsh-fairy-composer-stack=\"true\"]");
				ensureWorkspaceProjection(stack, workspaceRow);
				syncReasoningMenuLayer();
				const currentSurface = resolvedSession.surface;
				if (currentSurface !== surface) {
					resizeObserver?.disconnect();
					surface = currentSurface;
					if (surface && typeof ResizeObserver === "function") {
						resizeObserver = new ResizeObserver(schedule);
						resizeObserver.observe(surface);
					}
				}
				const rect = surface?.getBoundingClientRect();
				if (!rect || rect.width < 1 || rect.height < 1) return;
				if (!resizeController.dragging) height = readHeight();
				if (!resizeController.dragging && pendingPersistedHeight !== null) height = pendingPersistedHeight;
				seat.style.setProperty("left", `${Math.round(rect.left)}px`);
				seat.style.setProperty("width", `${Math.round(rect.width)}px`);
				const displayHeight = renderedHeight();
				seat.style.setProperty("height", `${Math.round(displayHeight)}px`);
				seat.style.setProperty("--dsh-fairy-composer-height", `${Math.round(displayHeight)}px`);
				syncMaterialLayer();
				insetSynchronizer.flush();
				contentAnchor.flush();
				toBottomPositioner.flush();
				updateHandle();
			}
			function bind() {
				structureFrame = 0;
				if (!enabled()) return;
				const nextSession = sessionResolver.resolve();
				const nextConversation = nextSession.conversation;
				const nextSurface = nextSession.surface;
				if (nextConversation !== conversation || nextSurface !== surface) {
					resizeObserver?.disconnect();
					conversation = nextConversation;
					surface = nextSurface;
					if (conversation && typeof ResizeObserver === "function") {
						resizeObserver = new ResizeObserver(schedule);
						if (surface) resizeObserver.observe(surface);
					}
				}
				bindHeaderObserver();
				if (seat && card) {
					clearControls();
					clearControls = placeNativeControlMarkers(card);
					removeLegacyMascotScaleControl();
				}
				const workspaceRow = seat?.querySelector("[data-dsh-fairy-composer-workspace=\"true\"]:not([data-dsh-fairy-composer-workspace-projection=\"true\"])");
				if (workspaceRow) captureWorkspaceTemplate(workspaceRow);
				ensureWorkspaceProjection(seat?.querySelector("[data-dsh-fairy-composer-stack=\"true\"]"), workspaceRow);
				syncReasoningMenuLayer();
				contentAnchor.schedule();
				toBottomPositioner.schedule();
				schedule();
			}
			const mutationObserver = createManagedMutationObserver((records) => {
				const headerPresetChanged = (record) => {
					const actions = sessionHeaderActions(conversation);
					const target = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
					return Boolean(actions && target && (target === actions || actions.contains?.(target)));
				};
				const composerStructureChanged = (record) => {
					if (record.type === "characterData") return headerPresetChanged(record);
					if (record.type === "childList") {
						if ((record.target?.nodeType === 1 ? record.target : record.target?.parentElement)?.closest?.(`[${OFFICIAL_ATTRIBUTES.composerSeat}]`)) return true;
						return [...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1 && (node.matches?.(`[${OFFICIAL_ATTRIBUTES.composerSeat}]`) || node.querySelector?.(`[${OFFICIAL_ATTRIBUTES.composerSeat}]`)));
					}
					return record.attributeName === OFFICIAL_ATTRIBUTES.phase || record.attributeName === OFFICIAL_ATTRIBUTES.composerSeat || record.attributeName === OFFICIAL_ATTRIBUTES.slot || record.attributeName === "aria-expanded";
				};
				if (records.some((record) => headerPresetChanged(record) || composerStructureChanged(record))) scheduleStructure();
				if (records.some((record) => record.attributeName === "aria-expanded" || record.type === "childList")) syncReasoningMenuLayer();
			});
			observer = mutationObserver;
			mutationObserver.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: [
					OFFICIAL_ATTRIBUTES.phase,
					OFFICIAL_ATTRIBUTES.composerSeat,
					OFFICIAL_ATTRIBUTES.slot,
					"aria-expanded"
				]
			});
			headerObserver = createManagedMutationObserver(scheduleStructure);
			lifecycle.add(() => mutationObserver.disconnect(), "composer-dock:structure-observer");
			window.addEventListener("resize", schedule, { passive: true });
			window.visualViewport?.addEventListener("resize", schedule, { passive: true });
			lifecycle.add(() => window.removeEventListener("resize", schedule), "composer-dock:window-resize");
			lifecycle.add(() => window.visualViewport?.removeEventListener("resize", schedule), "composer-dock:viewport-resize");
			const off = controller.subscribe?.(() => {
				height = effectiveHeight();
				if (pendingPersistedHeight !== null && readHeight() === pendingPersistedHeight) pendingPersistedHeight = null;
				schedule();
			});
			bind();
			const cleanup = () => {
				disposed = true;
				domObserverManager.cancelFrame(layoutFrameKey);
				domObserverManager.cancelFrame(structureFrameKey);
				observer?.disconnect();
				headerObserver?.disconnect();
				observedHeaderActions = null;
				resizeObserver?.disconnect();
				off?.();
				window.removeEventListener("resize", schedule);
				window.visualViewport?.removeEventListener("resize", schedule);
				toBottomPositioner.clear();
				restoreSeat({ clearWorkspaceTemplate: true });
			};
			lifecycle.add(cleanup, "composer-dock:dispose");
			return () => lifecycle.dispose();
		}
		module.exports = { mountComposerDock };
	}));

//#endregion
//#region src/client/mascot-style.js
	var require_mascot_style = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const CSS = `
/* The host owns fixed positioning; this child fills the centered stage without intercepting input. */
[data-dsh-fairy-mascot-root="true"] {
	position: relative;
	width: min(76%, 36vh, 450px);
	height: min(76%, 36vh);
	aspect-ratio: 1;
	z-index: 99999;
	pointer-events: none;
	user-select: none;
	/* Keep the root as a non-composited overflow host. Safari clips transformed
	 * descendants to an ancestor's layout box when that ancestor owns opacity,
	 * isolation, or containment. Opacity is applied per visual SVG below. */
	overflow: visible;
}
[data-dsh-fairy-mascot-root="true"], [data-dsh-fairy-mascot-root="true"] * { box-sizing: border-box; }
html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-mascot-root="true"] .dsh-fairy-halo path,
html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-mascot-root="true"] .dsh-fairy-lash-pulse {
	stroke: #172531;
}
[data-dsh-fairy-mascot-root="true"] { --dsh-fairy-outer-halo-color: #c9f8ff; }
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-halo { color: #c9efff; }
html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-mascot-root="true"] { --dsh-fairy-outer-halo-color: #172531; }
html[data-dsh-fairy-visual][data-dsh-fairy-theme="light"] [data-dsh-fairy-mascot-root="true"] .dsh-fairy-halo { color: #172531; }
/* Low-power mode removes only the expensive decorative raster work. */
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-outer-disc,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-sclera,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-highlight-glow {
	filter: none;
}
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-outer-halo,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-sclera-halo,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-sclera-contact,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-highlight-halo {
	display: none;
}
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-halo,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-lash-pulse {
	display: none;
}
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-corners,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-lash-pulse-wave,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-sclera,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-layer-three,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-layer-two,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-layer-one,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-thinking-clip-shape,
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-comforting-clip-shape {
	will-change: auto;
}
/* The source image remains legible while a regular glitch is active. */
[data-dsh-fairy-mascot-root="true"][data-transition-glitch] .dsh-fairy-outer-disc,
[data-dsh-fairy-mascot-root="true"][data-transition-glitch] .dsh-fairy-sclera,
[data-dsh-fairy-mascot-root="true"][data-transition-glitch] .dsh-fairy-highlight-glow,
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch] .dsh-fairy-outer-disc,
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch] .dsh-fairy-sclera,
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch] .dsh-fairy-highlight-glow {
	filter: none;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-float {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: visible;
}
[data-dsh-fairy-mascot-root="true"] svg {
	display: block;
	width: 100%;
	height: 100%;
	overflow: visible;
}
/* The expanding pulse has its own three-times viewport.  Its largest frame now
 * stays inside a real SVG viewport instead of relying on root-SVG overflow,
 * whose first-layout clipping differs across browser raster paths. */
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-pulse-layer {
	position: absolute;
	left: -100%;
	top: -100%;
	width: 300%;
	height: 300%;
	z-index: 0;
	opacity: .92;
	display: block;
	visibility: visible;
	pointer-events: none;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-halo-layer {
	position: absolute;
	left: -112.5%;
	top: -43.75%;
	width: 325%;
	height: 200%;
	z-index: 0;
	pointer-events: none;
	opacity: .92;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-main {
	position: relative;
	z-index: 1;
	/* The main eye is the opaque boundary; halo/pulse layers stay behind it. */
	opacity: 1;
}
/* The two glitch modes are mutually exclusive and selected by data-glitch. */
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal {
	transform-origin: 80px 80px;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch],
[data-dsh-fairy-mascot-root="true"][data-transition-glitch] .dsh-fairy-signal {
	/* Two full-surface chromatic drop shadows were the most expensive transient
	 * part of a fault. The retained level shift plus displacement preserves the
	 * glitch expression without rasterizing the eye two additional times. */
	will-change: transform, filter;
	filter:
		brightness(var(--dsh-g-bright, 1.12))
		contrast(var(--dsh-g-contrast, 1.18));
	transform: translateX(var(--dsh-g-x, 0)) skewX(var(--dsh-g-skew, 0deg));
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-image {
	opacity: 1;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-glitch-blocks {
	opacity: 0;
	display: none;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch="threads"] > .dsh-fairy-image,
[data-dsh-fairy-mascot-root="true"][data-transition-glitch] .dsh-fairy-signal > .dsh-fairy-image {
	filter: url(#dsh-fairy-interference);
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch="blocks"] .dsh-fairy-glitch-blocks {
	opacity: 1;
	display: block;
}
/* Block clones contain their own lash animation; freeze all copies on one frame. */
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch="blocks"] .dsh-fairy-corners {
	animation: none !important;
	transform: rotate(var(--dsh-lash-angle, 0deg));
}
/* The five <use> slices inherit the eye's continuous animations. Pausing their
 * copies at the current frame keeps the same fractured image while avoiding five
 * extra pulse timelines and compositor layers for each short block fault. */
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch="blocks"] .dsh-fairy-glitch-blocks .dsh-fairy-sclera,
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch="blocks"] .dsh-fairy-glitch-blocks .dsh-fairy-layer-three,
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch="blocks"] .dsh-fairy-glitch-blocks .dsh-fairy-layer-two,
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal[data-glitch="blocks"] .dsh-fairy-glitch-blocks .dsh-fairy-layer-one {
	animation-play-state: paused !important;
	will-change: auto;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-glitch-1 { transform: translateX(var(--dsh-g-s1-x, 0)); }
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-glitch-2 { transform: translateX(var(--dsh-g-s2-x, 0)); }
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-glitch-3 { transform: translateX(var(--dsh-g-s3-x, 0)); }
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-glitch-4 { transform: translateX(var(--dsh-g-s4-x, 0)); }
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-glitch-5 { transform: translateX(var(--dsh-g-s5-x, 0)); }
/* Constant lash rotation plus staggered, continuous inside-to-outside eye breathing. */
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-corners {
	animation: dsh-fairy-lashes calc(15s / var(--dsh-fairy-steady-rate, 1)) linear infinite;
	animation-delay: var(--dsh-lash-delay, 0s);
	transform-origin: 80px 80px;
	will-change: transform;
}
/* Five nested strokes share one transform/opacity timeline. Their individual
 * stroke widths and opacities still form the same soft pulse without keeping
 * five identical SVG animation timelines alive. */
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-lash-pulse-wave {
	animation: dsh-fairy-lash-pulse var(--dsh-fairy-pulse-cycle, 4s) cubic-bezier(.42, 0, .22, 1) infinite;
	display: block;
	visibility: visible;
	opacity: 1;
	transform-box: view-box;
	transform-origin: 80px 80px;
	will-change: opacity, transform;
}
[data-dsh-fairy-mascot-root="true"][data-dsh-fairy-animation-rate=".7"] .dsh-fairy-lash-pulse-wave { animation-name: dsh-fairy-lash-pulse-slow; }
[data-dsh-fairy-mascot-root="true"][data-dsh-fairy-animation-rate="1.5"] .dsh-fairy-lash-pulse-wave { animation-name: dsh-fairy-lash-pulse-fast; }
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-eye {
	transform: scale(.90);
	transform-origin: 80px 80px;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-eye-flicker {
	opacity: 0;
	animation: none;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-image[data-flicker="true"] ~ .dsh-fairy-eye-flicker,
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-image[data-flicker="true"] .dsh-fairy-eye-flicker {
	animation: dsh-fairy-eye-flicker-overlay var(--dsh-fairy-flicker-duration, 210ms) cubic-bezier(.32, 0, .68, 1) both;
	will-change: opacity;
}
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-eye {
	animation: none !important;
	filter: none !important;
}
[data-dsh-fairy-mascot-root="true"][data-low-power] .dsh-fairy-eye-flicker {
	display: none !important;
}
[data-dsh-fairy-mascot-root="true"][data-state="thinking"] .dsh-fairy-eye {
	clip-path: url(#dsh-fairy-thinking-eye-clip);
}
[data-dsh-fairy-mascot-root="true"][data-state="comforting"] .dsh-fairy-eye {
	clip-path: url(#dsh-fairy-comforting-eye-clip);
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-thinking-clip-shape {
	animation: dsh-fairy-thinking-clip calc(.72s / var(--dsh-fairy-steady-rate, 1)) cubic-bezier(.72, 0, .28, 1) 0s infinite alternate;
	animation-play-state: paused;
	transform-box: view-box;
	transform-origin: 80px 60px;
	will-change: auto;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-comforting-clip-shape {
	animation: dsh-fairy-comforting-clip calc(.72s / var(--dsh-fairy-steady-rate, 1)) cubic-bezier(.72, 0, .28, 1) 0s infinite alternate;
	animation-play-state: paused;
	transform-box: view-box;
	transform-origin: 80px 60px;
	will-change: auto;
}
/* The runtime disables these fallback timelines and evaluates the active eyelid
 * path from MascotMotionClock, keeping thinking/comfort on the same phase as the eye. */
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-sclera {
	animation: dsh-fairy-pulse-outer calc(.72s / var(--dsh-fairy-steady-rate, 1)) cubic-bezier(.72, 0, .28, 1) 0s infinite alternate;
	transform-box: view-box;
	transform-origin: 80px 80px;
	will-change: transform;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-layer-three {
	animation: dsh-fairy-pulse-three calc(.72s / var(--dsh-fairy-steady-rate, 1)) cubic-bezier(.72, 0, .28, 1) calc(-.045s / var(--dsh-fairy-steady-rate, 1)) infinite alternate;
	transform-origin: 80px 80px;
	will-change: transform;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-layer-two {
	animation: dsh-fairy-pulse-two calc(.72s / var(--dsh-fairy-steady-rate, 1)) cubic-bezier(.72, 0, .28, 1) calc(-.09s / var(--dsh-fairy-steady-rate, 1)) infinite alternate;
	transform-origin: 80px 80px;
	will-change: transform;
}
[data-dsh-fairy-mascot-root="true"] .dsh-fairy-layer-one {
	animation: dsh-fairy-pulse-inner calc(.72s / var(--dsh-fairy-steady-rate, 1)) cubic-bezier(.72, 0, .28, 1) calc(-.18s / var(--dsh-fairy-steady-rate, 1)) infinite alternate;
	transform-origin: 80px 80px;
	will-change: transform;
}
/* Visual lifecycle is owned by the HDD host contract. Pausing the whole SVG
 * freezes every eye layer on its exact frame; resume code realigns the active
 * eyelid clip to the retained sclera phase before scheduling faults again. */
[data-dsh-fairy-mascot-root="true"][data-visual-suspended],
[data-dsh-fairy-mascot-root="true"][data-visual-suspended] * {
	animation-play-state: paused !important;
	will-change: auto !important;
}
/* Scanline texture stays static; moving this full-size rect continuously causes
 * a needless SVG repaint without changing the state expression. */
/* Correct Fairy arc: the center of the upper lid pushes downward, not upward. */
@keyframes dsh-fairy-thinking-clip {
	from { transform: translateY(14.5px) scaleY(.55); }
	to { transform: translateY(15.5px); }
}
@keyframes dsh-fairy-comforting-clip {
	from { transform: translateY(-4px); }
	to { transform: translateY(4px); }
}
@keyframes dsh-fairy-lash-pulse {
	0% { opacity: 0; transform: scale(.98); }
	/* Transform stays on one continuous 0%-36% path; only opacity steps down. */
	5% { opacity: .72; }
	12% { opacity: .52; }
	20% { opacity: .19; }
	27% { opacity: 0; }
	36%, 100% { opacity: 0; transform: scale(2.78); }
}
@keyframes dsh-fairy-lash-pulse-slow {
	0% { opacity: 0; transform: scale(.98); }
	3.9% { opacity: .72; }
	9.4% { opacity: .52; }
	15.7% { opacity: .19; }
	21.2% { opacity: 0; }
	28.3%, 100% { opacity: 0; transform: scale(2.78); }
}
@keyframes dsh-fairy-lash-pulse-fast {
	0% { opacity: 0; transform: scale(.98); }
	6.4% { opacity: .72; }
	15.3% { opacity: .52; }
	25.4% { opacity: .19; }
	34.3% { opacity: 0; }
	45.8%, 100% { opacity: 0; transform: scale(2.78); }
}
@keyframes dsh-fairy-lashes { to { transform: rotate(360deg); } }
@keyframes dsh-fairy-pulse-outer {
	/* Keep the fully expanded sclera just inside the lid edge so the ring
	 * never becomes visibly thinner than the calibrated resting thickness. */
	from { transform: scale(.985); }
	to { transform: scale(.91); }
}
@keyframes dsh-fairy-pulse-three {
	from { transform: scale(1); }
	to { transform: scale(.90); }
}
@keyframes dsh-fairy-pulse-two {
	from { transform: scale(1); }
	to { transform: scale(.87); }
}
@keyframes dsh-fairy-pulse-inner {
	from { transform: scale(1); }
	to { transform: scale(.85); }
}
@keyframes dsh-fairy-eye-flicker-overlay {
	0%, 100% { opacity: 0; }
	22% { opacity: var(--dsh-fairy-flicker-opacity-1, .04); }
	48% { opacity: var(--dsh-fairy-flicker-opacity-mid, .012); }
	72% { opacity: var(--dsh-fairy-flicker-opacity-2, .03); }
}
@media (max-width: 520px) {
	[data-dsh-fairy-mascot-root="true"] { width: min(76%, 31vh, 324px); height: min(76%, 31vh); }
}
@media (prefers-reduced-motion: reduce) {
	[data-dsh-fairy-mascot-root="true"] *, [data-dsh-fairy-mascot-root="true"] *::before, [data-dsh-fairy-mascot-root="true"] *::after {
		animation: none !important;
	}
		[data-dsh-fairy-mascot-root="true"] .dsh-fairy-signal {
			opacity: 1 !important;
			filter: none !important;
		transform: none !important;
	}
	[data-dsh-fairy-mascot-root="true"] .dsh-fairy-image { opacity: 1 !important; }
	[data-dsh-fairy-mascot-root="true"] .dsh-fairy-glitch-blocks { opacity: 0 !important; }
}
`;
		module.exports = CSS;
	}));

//#endregion
//#region src/client/mascot-effects-svg.js
	var require_mascot_effects_svg = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		function buildHaloLines() {
			const paths = /* @__PURE__ */ new Map();
			for (let y = -34; y <= 194; y += 1) {
				const t = y + 34;
				const leftWave = (Math.sin(t * .082 - 1.1) + .55 * Math.sin(t * .151 + 2.4) + 1.55) / 3.1;
				const rightWave = (Math.sin(t * .097 + 2.2) + .5 * Math.sin(t * .137 - 1.7) + 1.5) / 3;
				const leftLength = 158 + leftWave * 56;
				const length = leftLength + (158 + rightWave * 56);
				const brightness = .5 + (leftWave + rightWave) * .5 * .5;
				const x = 80 - leftLength;
				const key = Math.max(.5, Math.min(1, Math.round(brightness * 8) / 8)).toFixed(3);
				if (!paths.has(key)) paths.set(key, []);
				paths.get(key).push("M" + x.toFixed(2) + " " + (y + .25).toFixed(2) + "h" + length.toFixed(2));
			}
			return Array.from(paths.entries()).map(function(entry) {
				return "<path d=\"" + entry[1].join("") + "\" fill=\"none\" stroke=\"currentColor\" stroke-width=\".62\" stroke-linecap=\"butt\" opacity=\"" + entry[0] + "\"/>";
			}).join("");
		}
		const HALO_LINES = buildHaloLines();
		const PULSE_SVG = `
<svg class="dsh-fairy-pulse-layer" viewBox="-160 -160 480 480" xmlns="http://www.w3.org/2000/svg" role="presentation">
	<g class="dsh-fairy-lash-pulse" fill="none" stroke="#f4fdff">
		<g class="dsh-fairy-lash-pulse-wave">
			<circle cx="80" cy="80" r="52" stroke-width="20" stroke-opacity=".05"/>
			<circle cx="80" cy="80" r="52" stroke-width="16" stroke-opacity=".06"/>
			<circle cx="80" cy="80" r="52" stroke-width="12" stroke-opacity=".08"/>
			<circle cx="80" cy="80" r="52" stroke-width="8" stroke-opacity=".10"/>
			<circle cx="80" cy="80" r="52" stroke-width="4.5" stroke-opacity=".09"/>
		</g>
	</g>
</svg>`;
		const HALO_SVG = `
<svg class="dsh-fairy-halo dsh-fairy-halo-layer" viewBox="-180 -70 520 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
	<defs>
		<radialGradient id="dsh-fairy-halo-layer-fade" gradientUnits="userSpaceOnUse" color-interpolation="linearRGB" cx="80" cy="80" r="124">
			<stop offset="0" stop-color="black"/>
			<stop offset=".44" stop-color="black"/>
			<stop offset=".45" stop-color="white" stop-opacity=".08"/>
			<stop offset=".46" stop-color="white" stop-opacity=".30"/>
			<stop offset=".47" stop-color="white" stop-opacity=".65"/>
			<stop offset=".48" stop-color="white"/>
			<stop offset=".52" stop-color="white" stop-opacity=".72"/>
			<stop offset=".56" stop-color="white" stop-opacity=".56"/>
			<stop offset=".60" stop-color="white" stop-opacity=".44"/>
			<stop offset=".65" stop-color="white" stop-opacity=".30"/>
			<stop offset=".71" stop-color="white" stop-opacity=".19"/>
			<stop offset=".77" stop-color="white" stop-opacity=".135"/>
			<stop offset=".83" stop-color="white" stop-opacity=".09"/>
			<stop offset=".89" stop-color="white" stop-opacity=".058"/>
			<stop offset=".90" stop-color="white" stop-opacity=".052"/>
			<stop offset=".91" stop-color="white" stop-opacity=".046"/>
			<stop offset=".92" stop-color="white" stop-opacity=".039"/>
			<stop offset=".93" stop-color="white" stop-opacity=".032"/>
			<stop offset=".94" stop-color="white" stop-opacity=".025"/>
			<stop offset=".95" stop-color="white" stop-opacity=".019"/>
			<stop offset=".96" stop-color="white" stop-opacity=".013"/>
			<stop offset=".97" stop-color="white" stop-opacity=".0075"/>
			<stop offset=".98" stop-color="white" stop-opacity=".0035"/>
			<stop offset=".99" stop-color="white" stop-opacity=".001"/>
			<stop offset="1" stop-color="white" stop-opacity="0"/>
		</radialGradient>
		<mask id="dsh-fairy-halo-layer-mask" mask-type="luminance" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="-260" y="-120" width="680" height="440">
			<rect x="-260" y="-120" width="680" height="440" fill="url(#dsh-fairy-halo-layer-fade)"/>
		</mask>
	</defs>
	<g mask="url(#dsh-fairy-halo-layer-mask)" opacity=".99">${HALO_LINES}</g>
</svg>`;
		module.exports = Object.freeze({
			PULSE_SVG,
			HALO_SVG
		});
	}));

//#endregion
//#region src/client/mascot-geometry.js
	var require_mascot_geometry = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const MASCOT_GEOMETRY = Object.freeze({
			outerDiscRadius: 68,
			outerStrokeWidth: 1.2,
			outerHaloRadius: 79,
			scleraRadius: 48,
			scleraContactStrokeWidth: .8,
			scleraHaloRadius: 56,
			pupilRadius: 16,
			highlightCenter: Object.freeze({
				x: 98,
				y: 100.5
			}),
			highlightRadius: 11,
			highlightHaloRadius: 18
		});
		const finitePositive = (name, value) => {
			if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid Fairy geometry: ${name}`);
			return value;
		};
		for (const [name, value] of Object.entries(MASCOT_GEOMETRY)) {
			if (name === "highlightCenter") continue;
			finitePositive(name, value);
		}
		const outerVisibleEdge = finitePositive("outerVisibleEdge", MASCOT_GEOMETRY.outerDiscRadius + MASCOT_GEOMETRY.outerStrokeWidth / 2);
		const scleraVisibleEdge = finitePositive("scleraVisibleEdge", MASCOT_GEOMETRY.scleraRadius + MASCOT_GEOMETRY.scleraContactStrokeWidth / 2);
		const outerHaloPeak = outerVisibleEdge / finitePositive("outerHaloRadius", MASCOT_GEOMETRY.outerHaloRadius);
		const scleraHaloPeak = scleraVisibleEdge / finitePositive("scleraHaloRadius", MASCOT_GEOMETRY.scleraHaloRadius);
		const highlightHaloPeak = MASCOT_GEOMETRY.highlightRadius / finitePositive("highlightHaloRadius", MASCOT_GEOMETRY.highlightHaloRadius);
		for (const [edge, halo] of [
			[outerVisibleEdge, MASCOT_GEOMETRY.outerHaloRadius],
			[scleraVisibleEdge, MASCOT_GEOMETRY.scleraHaloRadius],
			[MASCOT_GEOMETRY.highlightRadius, MASCOT_GEOMETRY.highlightHaloRadius]
		]) if (edge >= halo) throw new Error("Invalid Fairy geometry: visible edge must be inside its halo radius");
		for (const [name, value] of Object.entries(MASCOT_GEOMETRY.highlightCenter)) if (!Number.isFinite(value)) throw new Error(`Invalid Fairy geometry: highlightCenter.${name}`);
		for (const [name, value] of Object.entries({
			outerHaloPeak,
			scleraHaloPeak,
			highlightHaloPeak
		})) if (!(value > 0 && value < 1)) throw new Error(`Invalid Fairy geometry ratio: ${name}`);
		const formatRatio = (value) => value.toFixed(3).replace(/^0/, "");
		module.exports = Object.freeze({
			...MASCOT_GEOMETRY,
			outerVisibleEdge,
			scleraVisibleEdge,
			outerHaloPeak,
			scleraHaloPeak,
			highlightHaloPeak,
			formatRatio
		});
	}));

//#endregion
//#region src/client/mascot-eye-svg.js
	var require_mascot_eye_svg = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { outerDiscRadius, outerStrokeWidth, outerHaloRadius, outerVisibleEdge, outerHaloPeak, scleraRadius, scleraContactStrokeWidth, scleraHaloRadius, scleraHaloPeak, pupilRadius, highlightCenter, highlightRadius, highlightHaloRadius, highlightHaloPeak, formatRatio } = require_mascot_geometry();
		const SVG = `
<svg class="dsh-fairy-main" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" role="presentation">
	<defs>
		<!-- Color, glow, scanline, and horizontal-only displacement resources. -->
		<linearGradient id="dsh-fairy-outer-gradient" x1=".2" y1="0" x2=".8" y2="1">
			<stop stop-color="#4053f0"/>
			<stop offset=".54" stop-color="#3045dc"/>
			<stop offset="1" stop-color="#3d50c8"/>
		</linearGradient>
		<!-- One static radial field replaces separate halo strokes, avoiding alpha seams. -->
		<radialGradient id="dsh-fairy-sclera-halo-gradient" gradientUnits="userSpaceOnUse" cx="80" cy="80" r="${scleraHaloRadius}" color-interpolation="linearRGB">
			<stop offset=".82" stop-color="#ffffff" stop-opacity="0"/>
			<stop offset="${formatRatio(scleraHaloPeak)}" stop-color="#ffffff" stop-opacity=".22"/>
			<stop offset=".875" stop-color="#ffffff" stop-opacity=".28"/>
			<stop offset=".89" stop-color="#ffffff" stop-opacity=".19"/>
			<stop offset=".91" stop-color="#ffffff" stop-opacity=".11"/>
			<stop offset=".94" stop-color="#ffffff" stop-opacity=".07"/>
			<stop offset=".96" stop-color="#ffffff" stop-opacity=".035"/>
			<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
		</radialGradient>
		<radialGradient id="dsh-fairy-outer-halo-gradient" gradientUnits="userSpaceOnUse" cx="80" cy="80" r="${outerHaloRadius}" color-interpolation="linearRGB">
			<stop offset=".80" stop-color="var(--dsh-fairy-outer-halo-color)" stop-opacity="0"/>
			<stop offset=".84" stop-color="var(--dsh-fairy-outer-halo-color)" stop-opacity=".10"/>
			<stop offset="${formatRatio(outerHaloPeak)}" stop-color="var(--dsh-fairy-outer-halo-color)" stop-opacity=".28"/>
			<stop offset=".90" stop-color="var(--dsh-fairy-outer-halo-color)" stop-opacity=".18"/>
			<stop offset=".95" stop-color="var(--dsh-fairy-outer-halo-color)" stop-opacity=".06"/>
			<stop offset=".99" stop-color="var(--dsh-fairy-outer-halo-color)" stop-opacity=".02"/>
			<stop offset="1" stop-color="var(--dsh-fairy-outer-halo-color)" stop-opacity="0"/>
		</radialGradient>
		<radialGradient id="dsh-fairy-highlight-halo-gradient" gradientUnits="userSpaceOnUse" cx="${highlightCenter.x}" cy="${highlightCenter.y}" r="${highlightHaloRadius}" color-interpolation="linearRGB">
			<stop offset=".53" stop-color="#f5f8fd" stop-opacity="0"/>
			<stop offset=".56" stop-color="#f5f8fd" stop-opacity=".16"/>
			<stop offset="${formatRatio(highlightHaloPeak)}" stop-color="#f5f8fd" stop-opacity=".43"/>
			<stop offset=".72" stop-color="#f5f8fd" stop-opacity=".19"/>
			<stop offset=".77" stop-color="#f5f8fd" stop-opacity=".12"/>
			<stop offset=".83" stop-color="#f5f8fd" stop-opacity=".055"/>
			<stop offset=".89" stop-color="#f5f8fd" stop-opacity=".02"/>
			<stop offset=".96" stop-color="#f5f8fd" stop-opacity=".004"/>
			<stop offset="1" stop-color="#f5f8fd" stop-opacity="0"/>
		</radialGradient>
		<pattern id="dsh-fairy-lines" width="4" height="4" patternUnits="userSpaceOnUse">
			<!-- Keep the internal scanline texture present but quieter against the eye. -->
			<rect width="4" height="1" fill="#c9f8ff" opacity=".055"/>
		</pattern>
			<!-- Blue is forced to 0.5 so the displacement map moves pixels horizontally only. -->
			<!-- Horizontal glitch noise is intentionally low-resolution. The map never
			     moves pixels vertically, so its filter cache needs less vertical coverage
			     and resolution while interpolation keeps the tear continuous. -->
			<filter id="dsh-fairy-interference" x="-30%" y="0%" width="160%" height="100%" filterRes="96 72" color-interpolation-filters="sRGB">
			<feTurbulence id="dsh-fairy-noise" type="fractalNoise" baseFrequency=".012 .72" numOctaves="1" seed="1" result="noise"/>
			<feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 0 0 .5  0 0 0 1 0" result="horizontal-noise"/>
			<feDisplacementMap id="dsh-fairy-displace" in="SourceGraphic" in2="horizontal-noise" scale="5" xChannelSelector="R" yChannelSelector="B"/>
		</filter>
		<clipPath id="dsh-fairy-disc-clip"><circle cx="80" cy="80" r="${outerDiscRadius - 1}"/></clipPath>
		<clipPath id="dsh-fairy-thinking-eye-clip">
			<path class="dsh-fairy-thinking-clip-shape" d="M20 60 Q80 90 140 60 V160 H20 Z"/>
			<!-- This fixed lower region prevents curve scaling from clipping the lower eye. -->
			<rect x="0" y="108" width="160" height="52"/>
		</clipPath>
		<!-- A shallow reversed arc gives Fairy the gentle, slightly drooped brow. -->
		<clipPath id="dsh-fairy-comforting-eye-clip">
			<path class="dsh-fairy-comforting-clip-shape" d="M20 60 Q80 30 140 60 V160 H20 Z"/>
			<rect x="0" y="108" width="160" height="52"/>
		</clipPath>
		<!-- These five rectangles are resized slightly for every block-glitch event. -->
		<clipPath id="dsh-fairy-slice-1"><rect x="4" y="12" width="152" height="25"/></clipPath>
		<clipPath id="dsh-fairy-slice-2"><rect x="4" y="37" width="152" height="28"/></clipPath>
		<clipPath id="dsh-fairy-slice-3"><rect x="4" y="65" width="152" height="26"/></clipPath>
		<clipPath id="dsh-fairy-slice-4"><rect x="4" y="91" width="152" height="30"/></clipPath>
		<clipPath id="dsh-fairy-slice-5"><rect x="4" y="121" width="152" height="27"/></clipPath>
		</defs>
	
		<g class="dsh-fairy-body">
	<!-- Stable outer radial halo stays outside the fault signal so it is not
	     filtered or duplicated by the block-glitch clones. -->
		<circle class="dsh-fairy-outer-halo" cx="80" cy="80" r="${outerHaloRadius}" fill="url(#dsh-fairy-outer-halo-gradient)"/>
	<g class="dsh-fairy-signal" data-fault-source="true">
	<!-- The complete normal visual. Glitch modes filter or slice this entire group. -->
	<g id="dsh-fairy-image" class="dsh-fairy-image">
		<circle class="dsh-fairy-outer-disc" cx="80" cy="80" r="${outerDiscRadius}" fill="url(#dsh-fairy-outer-gradient)" stroke="#f2fbff" stroke-width="${outerStrokeWidth}"/>
	<!-- Dark circle + square form the four rotating lashes / eyelids. -->
	<g class="dsh-fairy-corners" clip-path="url(#dsh-fairy-disc-clip)" fill="#2b3388">
		<!-- Slightly open the eye: reduce the lid ring without changing its silhouette. -->
		<circle cx="80" cy="80" r="51.75"/>
		<rect x="37" y="37" width="86" height="86" rx="2" transform="rotate(3 80 80)"/>
	</g>

	<!-- Eye anatomy: sclera, layered eyeball, pupil, then highlight. -->
	<g class="dsh-fairy-eye">
			<!-- One animated group keeps the vector rim pixel-locked to the sclera. -->
			<g class="dsh-fairy-sclera">
				<circle cx="80" cy="80" r="${scleraRadius}" fill="#eef0f5"/>
				<circle class="dsh-fairy-sclera-halo" cx="80" cy="80" r="${scleraHaloRadius}" fill="url(#dsh-fairy-sclera-halo-gradient)"/>
				<!-- A thin contact rim closes subpixel seams at the sclera/halo boundary. -->
				<circle class="dsh-fairy-sclera-contact" cx="80" cy="80" r="${scleraRadius}" fill="none" stroke="#ffffff" stroke-width="${scleraContactStrokeWidth}" stroke-opacity=".16"/>
			</g>
		<g class="dsh-fairy-eyeball">
			<circle class="dsh-fairy-layer-three" cx="80" cy="80" r="33" fill="#9daee0"/>
			<circle class="dsh-fairy-layer-two" cx="80" cy="80" r="24.15" fill="#eef0f5"/>
			<circle class="dsh-fairy-layer-two" cx="80" cy="80" r="23.5" fill="#317bcf"/>
			<circle class="dsh-fairy-layer-one" cx="80" cy="80" r="16.6" fill="none" stroke="#f5f8fd" stroke-width=".1"/>
			<circle class="dsh-fairy-layer-one" cx="80" cy="80" r="${pupilRadius}" fill="#3b3d8a"/>
				<g class="dsh-fairy-highlight dsh-fairy-layer-two">
					<circle class="dsh-fairy-highlight-halo" cx="${highlightCenter.x}" cy="${highlightCenter.y}" r="${highlightHaloRadius}" fill="url(#dsh-fairy-highlight-halo-gradient)"/>
					<circle class="dsh-fairy-highlight-glow" cx="${highlightCenter.x}" cy="${highlightCenter.y}" r="${highlightRadius}" fill="#f5f8fd"/>
			</g>
		</g>
	</g>
	<!-- Full-eye flicker layer stays outside the scaled eye group and is not part
	     of the fault clone source; it covers the disc and brows only. -->
	<circle class="dsh-fairy-eye-flicker" cx="80" cy="80" r="${outerVisibleEdge}" fill="#ffffff" pointer-events="none"/>

	<g clip-path="url(#dsh-fairy-disc-clip)" opacity=".42">
		<rect class="dsh-fairy-scanlines" x="12" y="10" width="136" height="146" fill="url(#dsh-fairy-lines)"/>
	</g>
	</g>
	<!-- Five complete-image clones clipped into horizontal blocks for left/right displacement. -->
	<g class="dsh-fairy-glitch-blocks">
		<use href="#dsh-fairy-image" class="dsh-fairy-glitch-1" clip-path="url(#dsh-fairy-slice-1)"/>
		<use href="#dsh-fairy-image" class="dsh-fairy-glitch-2" clip-path="url(#dsh-fairy-slice-2)"/>
		<use href="#dsh-fairy-image" class="dsh-fairy-glitch-3" clip-path="url(#dsh-fairy-slice-3)"/>
		<use href="#dsh-fairy-image" class="dsh-fairy-glitch-4" clip-path="url(#dsh-fairy-slice-4)"/>
		<use href="#dsh-fairy-image" class="dsh-fairy-glitch-5" clip-path="url(#dsh-fairy-slice-5)"/>
	</g>
	</g>
	</g>
		</svg>`;
		module.exports = SVG;
	}));

//#endregion
//#region src/client/mascot-assets.js
	var require_mascot_assets = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const CSS = require_mascot_style();
		const { PULSE_SVG, HALO_SVG } = require_mascot_effects_svg();
		const SVG = require_mascot_eye_svg();
		const geometry = require_mascot_geometry();
		module.exports = Object.freeze({
			CSS,
			PULSE_SVG,
			HALO_SVG,
			SVG,
			geometry
		});
	}));

//#endregion
//#region src/client/mascot-motion-clock.js
	var require_mascot_motion_clock = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		function createMascotMotionClock({ now = () => typeof performance !== "undefined" ? performance.now() : Date.now(), cycleMs = 1440, rate = 1 } = {}) {
			if (!Number.isFinite(cycleMs) || cycleMs <= 0) throw new Error("Invalid Fairy motion clock cycle");
			let epoch = now();
			let phase = 0;
			let currentRate = Number.isFinite(rate) && rate > 0 ? rate : 1;
			let paused = false;
			let pausedAt = epoch;
			const read = () => {
				if (paused) return phase;
				const elapsed = Math.max(0, now() - epoch) * currentRate;
				return ((phase + elapsed / cycleMs) % 1 + 1) % 1;
			};
			return Object.freeze({
				phase: read,
				timeline: (nextCycleMs = cycleMs) => read() * nextCycleMs,
				rate: () => currentRate,
				setRate: (nextRate) => {
					const timestamp = now();
					phase = read();
					currentRate = Number.isFinite(nextRate) && nextRate > 0 ? nextRate : 1;
					epoch = timestamp;
					pausedAt = timestamp;
				},
				pause: () => {
					if (paused) return;
					pausedAt = now();
					phase = read();
					paused = true;
				},
				resume: () => {
					if (!paused) return;
					epoch = now();
					paused = false;
				},
				reset: () => {
					epoch = now();
					phase = 0;
					pausedAt = epoch;
					paused = false;
				},
				isPaused: () => paused,
				pausedAt: () => pausedAt
			});
		}
		module.exports = { createMascotMotionClock };
	}));

//#endregion
//#region src/client/mascot-event-scheduler.js
	var require_mascot_event_scheduler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		function createMascotEventScheduler() {
			const tasks = /* @__PURE__ */ new Map();
			const schedule = (name, callback, delay) => {
				const previous = tasks.get(name);
				if (previous) clearTimeout(previous.timer);
				const entry = {
					token: (previous?.token || 0) + 1,
					timer: null
				};
				entry.timer = setTimeout(() => {
					if (tasks.get(name) !== entry) return;
					tasks.delete(name);
					callback();
				}, Math.max(0, Number(delay) || 0));
				tasks.set(name, entry);
				return entry.timer;
			};
			const cancel = (name) => {
				const entry = tasks.get(name);
				if (!entry) return;
				clearTimeout(entry.timer);
				tasks.delete(name);
			};
			return Object.freeze({
				schedule,
				cancel,
				cancelAll: () => [...tasks.keys()].forEach(cancel),
				has: (name) => tasks.has(name),
				activeCount: () => tasks.size
			});
		}
		module.exports = { createMascotEventScheduler };
	}));

//#endregion
//#region src/client/mascot-runtime.js
	var require_mascot_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { createManagedMutationObserver } = require_dom_observer_manager();
		const { CSS, PULSE_SVG, HALO_SVG, SVG } = require_mascot_assets();
		const { createMascotMotionClock } = require_mascot_motion_clock();
		const { createMascotEventScheduler } = require_mascot_event_scheduler();
		function createMascotRuntime() {
			let mascotRuntime = null;
			(function fairyVisualRuntime() {
				if (typeof document === "undefined") return;
				const ROOT_ID = "dsh-fairy-root";
				const HOST_SELECTOR = ".dsh-fairy-stage";
				const STYLE_ID = "dsh-fairy-mascot-style";
				let root = null;
				let mountedHost = null;
				let mountedOwner = null;
				let mountGeneration = 0;
				let hostObserver = null;
				let observedHost = null;
				let glitchTimer = null;
				let animationRate = 1;
				let speedListener = null;
				let eyeFlickerToken = 0;
				let glitchToken = 0;
				let stateTransitionToken = 0;
				let appliedState = null;
				let signalElement = null;
				let scleraElement = null;
				let layerThreeElements = [];
				let layerTwoElements = [];
				let layerOneElements = [];
				let imageElement = null;
				let thinkingClipShape = null;
				let comfortingClipShape = null;
				let noiseElement = null;
				let displacementElement = null;
				let blockSliceRects = [];
				let motionQuery = null;
				let motionOwner = null;
				let motionGeneration = 0;
				const motionClock = createMascotMotionClock();
				const eventScheduler = createMascotEventScheduler();
				let visualSuspended = false;
				let requestedVisualActive = false;
				function isLifecycleVisible() {
					return document.visibilityState !== "hidden";
				}
				let lifecycleVisible = isLifecycleVisible();
				function isCurrentMount(owner, generation, stage) {
					return Boolean(owner && owner.active !== false && mountedOwner === owner && mountGeneration === generation && (!stage || mountedHost === stage));
				}
				function isValidOwner(owner, stage) {
					return Boolean(owner && owner.active !== false && owner.stage === stage);
				}
				function unbindMotionListener() {
					if (motionQuery && motionChangeListener) {
						if (typeof motionQuery.removeEventListener === "function") motionQuery.removeEventListener("change", motionChangeListener);
						else if (typeof motionQuery.removeListener === "function") motionQuery.removeListener(motionChangeListener);
					}
					motionQuery = null;
					motionChangeListener = null;
					motionOwner = null;
					motionGeneration = 0;
				}
				function cancelLifecycleResume() {
					if (lifecycleResumeFrame) cancelAnimationFrame(lifecycleResumeFrame);
					lifecycleResumeFrame = 0;
					lifecycleToken += 1;
				}
				function invalidateMountResources() {
					stopGlitch();
					cancelLifecycleResume();
					hostObserver?.disconnect();
					hostObserver = null;
					observedHost = null;
					unbindMotionListener();
					unbindLifecycleListeners();
					if (speedListener) window.removeEventListener("dsh-fairy-mascot-animation-speed", speedListener);
					speedListener = null;
					mountGeneration += 1;
				}
				let visualActiveInitialized = false;
				let lifecycleResumeFrame = 0;
				let motionFrame = 0;
				let lifecycleToken = 0;
				let motionChangeListener = null;
				let lifecycleVisibilityListener = null;
				let lifecyclePageHideListener = null;
				let lifecyclePageShowListener = null;
				let lifecycleListenerOwner = null;
				let lifecycleListenerGeneration = 0;
				let lastGlitchMode = Math.random() < .5 ? "threads" : "blocks";
				const FAULT_TIMING = Object.freeze({
					threads: Object.freeze({
						pulses: 4,
						gapMin: 30,
						gapMax: 42,
						fadeMin: 34,
						fadeMax: 76
					}),
					blocks: Object.freeze({
						gapMin: 56,
						gapMax: 104,
						fadeMin: 48,
						fadeMax: 96
					})
				});
				function randomBetween(min, max) {
					return min + Math.random() * (max - min);
				}
				function cacheVisualNodes() {
					signalElement = root ? root.querySelector(".dsh-fairy-signal") : null;
					scleraElement = root ? root.querySelector(".dsh-fairy-sclera") : null;
					imageElement = root ? root.querySelector(".dsh-fairy-image") : null;
					thinkingClipShape = root ? root.querySelector(".dsh-fairy-thinking-clip-shape") : null;
					comfortingClipShape = root ? root.querySelector(".dsh-fairy-comforting-clip-shape") : null;
					noiseElement = root ? root.querySelector("#dsh-fairy-noise") : null;
					displacementElement = root ? root.querySelector("#dsh-fairy-displace") : null;
					blockSliceRects = root ? Array.from(root.querySelectorAll("[id^=dsh-fairy-slice-] rect")) : [];
					layerThreeElements = root ? Array.from(root.querySelectorAll(".dsh-fairy-layer-three")) : [];
					layerTwoElements = root ? Array.from(root.querySelectorAll(".dsh-fairy-layer-two")) : [];
					layerOneElements = root ? Array.from(root.querySelectorAll(".dsh-fairy-layer-one")) : [];
					[
						scleraElement,
						...layerThreeElements,
						...layerTwoElements,
						...layerOneElements
					].forEach((element) => {
						if (element) element.style.animation = "none";
					});
					[thinkingClipShape, comfortingClipShape].forEach((element) => {
						if (element) element.style.animation = "none";
					});
				}
				function currentEyeMotionPhase() {
					return motionClock.phase();
				}
				function easeEyePhase(value) {
					const x = Math.max(0, Math.min(1, value));
					let low = 0;
					let high = 1;
					for (let i = 0; i < 12; i += 1) {
						const t = (low + high) / 2;
						if (3 * (1 - t) * (1 - t) * t * .72 + 3 * (1 - t) * t * t * .28 + t * t * t < x) low = t;
						else high = t;
					}
					const t = (low + high) / 2;
					return 3 * (1 - t) * t * t + t * t * t;
				}
				function readEyeProgress(phase) {
					const cyclePhase = (phase % 1 + 1) % 1;
					return easeEyePhase(cyclePhase <= .5 ? cyclePhase * 2 : 2 - cyclePhase * 2);
				}
				function normalizeMotionTargets(value) {
					return Array.isArray(value) ? value : value ? [value] : [];
				}
				function renderMotionFrame() {
					if (!root || visualSuspended) return;
					const phase = currentEyeMotionPhase();
					[
						[
							scleraElement,
							.985,
							.91,
							0
						],
						[
							layerThreeElements,
							1,
							.9,
							45
						],
						[
							layerTwoElements,
							1,
							.87,
							90
						],
						[
							layerOneElements,
							1,
							.85,
							180
						]
					].forEach(([elements, from, to, leadMs]) => {
						const targets = normalizeMotionTargets(elements);
						if (!targets.length) return;
						const progress = readEyeProgress(phase + leadMs / 1440);
						const transform = "scale(" + (from + (to - from) * progress).toFixed(6) + ")";
						targets.forEach((element) => {
							element.style.transform = transform;
						});
					});
					const state = root.getAttribute("data-state");
					const clip = state === "thinking" ? thinkingClipShape : state === "comforting" ? comfortingClipShape : null;
					[thinkingClipShape, comfortingClipShape].forEach((element) => {
						if (element && element !== clip) element.style.transform = "";
					});
					if (clip) {
						const clipProgress = readEyeProgress(phase);
						clip.style.willChange = "transform";
						clip.style.transform = state === "thinking" ? "translateY(" + (14.5 + clipProgress).toFixed(6) + "px) scaleY(" + (.55 + .45 * clipProgress).toFixed(6) + ")" : "translateY(" + (-4 + 8 * clipProgress).toFixed(6) + "px)";
					}
				}
				function startMotionLoop() {
					if (motionFrame || visualSuspended || !root) return;
					const tick = () => {
						motionFrame = 0;
						if (!root || visualSuspended) return;
						renderMotionFrame();
						motionFrame = requestAnimationFrame(tick);
					};
					renderMotionFrame();
					motionFrame = requestAnimationFrame(tick);
				}
				function stopMotionLoop() {
					if (motionFrame) cancelAnimationFrame(motionFrame);
					motionFrame = 0;
				}
				function alignEyeLayersToClock() {
					renderMotionFrame();
				}
				function pauseClipAnimation(shape) {
					if (!shape) return;
					shape.style.animationDelay = "0s";
					shape.style.animationPlayState = "paused";
					shape.style.willChange = "auto";
				}
				function synchronizeActiveClipPhase(nextState) {
					if (!root) return;
					alignEyeLayersToClock();
					pauseClipAnimation(thinkingClipShape);
					pauseClipAnimation(comfortingClipShape);
					if (nextState !== "normal" && !(motionQuery && motionQuery.matches)) renderMotionFrame();
				}
				function setBlockLayout() {
					const weights = [];
					let weightTotal = 0;
					for (let i = 0; i < 5; i += 1) {
						const weight = randomBetween(.9, 1.1);
						weights.push(weight);
						weightTotal += weight;
					}
					let y = 12;
					for (let i = 0; i < 5; i += 1) {
						const rect = blockSliceRects[i] || root && root.querySelector("#dsh-fairy-slice-" + (i + 1) + " rect");
						if (!rect) continue;
						const height = i === 4 ? 148 - y : 136 * weights[i] / weightTotal;
						rect.setAttribute("y", y.toFixed(1));
						rect.setAttribute("height", height.toFixed(1));
						y += height;
					}
				}
				function clearGlitchVisual() {
					if (!root) return;
					const signal = signalElement || root.querySelector(".dsh-fairy-signal");
					if (!signal) return;
					signal.removeAttribute("data-glitch");
					[
						"--dsh-g-x",
						"--dsh-g-skew",
						"--dsh-g-bright",
						"--dsh-g-contrast",
						"--dsh-g-s1-x",
						"--dsh-g-s2-x",
						"--dsh-g-s3-x",
						"--dsh-g-s4-x",
						"--dsh-g-s5-x"
					].forEach(function(name) {
						signal.style.removeProperty(name);
					});
				}
				function stopEyeFlicker() {
					eyeFlickerToken += 1;
					eventScheduler.cancel("flicker");
					if (imageElement) imageElement.removeAttribute("data-flicker");
					if (imageElement) [
						"--dsh-fairy-flicker-duration",
						"--dsh-fairy-flicker-opacity-1",
						"--dsh-fairy-flicker-opacity-mid",
						"--dsh-fairy-flicker-opacity-2"
					].forEach(function(name) {
						imageElement.style.removeProperty(name);
					});
				}
				function scheduleEyeFlicker(owner, generation) {
					if (!isCurrentMount(owner, generation) || eventScheduler.has("flicker") || !root || root.getAttribute("data-state") !== "normal" || root.hasAttribute("data-low-power") || visualSuspended || motionQuery && motionQuery.matches) return;
					const token = eyeFlickerToken;
					eventScheduler.schedule("flicker", function() {
						if (!isCurrentMount(owner, generation) || token !== eyeFlickerToken || !root || root.getAttribute("data-state") !== "normal" || root.hasAttribute("data-low-power") || visualSuspended || motionQuery && motionQuery.matches) return;
						if (!imageElement) imageElement = root.querySelector(".dsh-fairy-image");
						if (!imageElement) return;
						const duration = randomBetween(155, 255);
						imageElement.style.setProperty("--dsh-fairy-flicker-duration", duration.toFixed(0) + "ms");
						imageElement.style.setProperty("--dsh-fairy-flicker-opacity-1", randomBetween(.026, .048).toFixed(3));
						imageElement.style.setProperty("--dsh-fairy-flicker-opacity-mid", randomBetween(.006, .016).toFixed(3));
						imageElement.style.setProperty("--dsh-fairy-flicker-opacity-2", randomBetween(.018, .04).toFixed(3));
						imageElement.setAttribute("data-flicker", "true");
						eventScheduler.schedule("flicker", function() {
							if (imageElement) imageElement.removeAttribute("data-flicker");
							if (token === eyeFlickerToken) scheduleEyeFlicker(owner, generation);
						}, duration);
					}, randomBetween(1750, 3600) / animationRate);
				}
				function lockLashFrame(signal) {
					const corners = signal && signal.querySelector(".dsh-fairy-image .dsh-fairy-corners");
					if (!signal || !corners) return;
					const transform = window.getComputedStyle(corners).transform;
					let angle = 0;
					const match = transform && transform.match(/^matrix\(([^)]+)\)$/);
					if (match) {
						const values = match[1].split(",");
						const a = parseFloat(values[0]);
						const b = parseFloat(values[1]);
						if (Number.isFinite(a) && Number.isFinite(b)) angle = Math.atan2(b, a) * 180 / Math.PI;
					}
					const normalized = (angle + 360) % 360;
					signal.style.setProperty("--dsh-lash-angle", normalized.toFixed(3) + "deg");
					signal.style.setProperty("--dsh-lash-delay", (-normalized / 360 * 15).toFixed(4) + "s");
				}
				function setGlitchPulse(signal, mode, isTransition) {
					const style = signal.style;
					style.setProperty("--dsh-g-x", randomBetween(isTransition ? -1.6 : -.9, isTransition ? 1.6 : .9).toFixed(2) + "px");
					style.setProperty("--dsh-g-skew", randomBetween(isTransition ? -.32 : -.24, isTransition ? .32 : .24).toFixed(2) + "deg");
					style.setProperty("--dsh-g-bright", randomBetween(isTransition ? 1.06 : 1.02, isTransition ? 1.18 : 1.14).toFixed(2));
					style.setProperty("--dsh-g-contrast", randomBetween(isTransition ? 1.08 : 1.02, isTransition ? 1.22 : 1.16).toFixed(2));
					const noise = noiseElement;
					const displacement = displacementElement;
					if (mode === "threads") {
						const beginsThreadBurst = signal.getAttribute("data-glitch") !== "threads";
						if (beginsThreadBurst && noise) {
							noise.setAttribute("seed", String(Math.floor(randomBetween(1, 999))));
							noise.setAttribute("baseFrequency", randomBetween(.004, .011).toFixed(3) + " " + randomBetween(isTransition ? .78 : .65, isTransition ? 1.18 : 1).toFixed(2));
						}
						if (beginsThreadBurst && displacement) displacement.setAttribute("scale", randomBetween(isTransition ? 30 : 17, isTransition ? 46 : 29).toFixed(1));
					} else {
						if (!signal.hasAttribute("data-glitch")) lockLashFrame(signal);
						const slicePolarity = Math.random() < .5 ? -1 : 1;
						const sliceStrength = randomBetween(isTransition ? 4.2 : 1.4, isTransition ? 6.8 : 3);
						for (let i = 1; i <= 5; i += 1) {
							const offset = (i % 2 === 0 ? slicePolarity : -slicePolarity) * (sliceStrength + randomBetween(-.35, .35));
							style.setProperty("--dsh-g-s" + i + "-x", offset.toFixed(2) + "px");
						}
					}
					signal.setAttribute("data-glitch", mode);
				}
				function playStateTransition(nextState, owner, generation) {
					if (!isCurrentMount(owner, generation) || !root || visualSuspended || motionQuery && motionQuery.matches) return;
					stopGlitch();
					const signal = signalElement || root.querySelector(".dsh-fairy-signal");
					if (!signal) return;
					const token = ++stateTransitionToken;
					root.setAttribute("data-transition-target", nextState);
					function runBurst(pulseCount, blockPulseCount, keepVisual, onComplete) {
						let pulseIndex = 0;
						root.setAttribute("data-transition-glitch", "true");
						function pulse() {
							if (!isCurrentMount(owner, generation) || token !== stateTransitionToken || motionQuery && motionQuery.matches) return;
							if (pulseIndex < blockPulseCount) {
								if (pulseIndex === 0) setBlockLayout();
								setGlitchPulse(signal, "blocks", true);
							} else setGlitchPulse(signal, "threads", true);
							pulseIndex += 1;
							if (pulseIndex < pulseCount) {
								eventScheduler.schedule("transition", pulse, 40);
								return;
							}
							eventScheduler.schedule("transition", function() {
								if (!isCurrentMount(owner, generation) || token !== stateTransitionToken) return;
								if (!keepVisual) {
									root.removeAttribute("data-transition-glitch");
									clearGlitchVisual();
								}
								onComplete();
							}, 28);
						}
						pulse();
					}
					runBurst(2, 0, true, function() {
						if (!isCurrentMount(owner, generation) || token !== stateTransitionToken || motionQuery && motionQuery.matches) return;
						runBurst(6, 2, false, function() {
							if (!isCurrentMount(owner, generation) || token !== stateTransitionToken) return;
							root.removeAttribute("data-transition-target");
							scheduleGlitch(owner, generation);
							scheduleEyeFlicker(owner, generation);
						});
					});
				}
				function armGlitchTimer(callback, delay) {
					let timer = null;
					timer = eventScheduler.schedule("glitch", function() {
						if (glitchTimer === timer) glitchTimer = null;
						callback();
					}, delay);
					glitchTimer = timer;
					return timer;
				}
				function scheduleGlitch(owner, generation) {
					if (!isCurrentMount(owner, generation) || eventScheduler.has("glitch") || !root || visualSuspended || motionQuery && motionQuery.matches) return;
					const token = glitchToken;
					armGlitchTimer(function() {
						if (!isCurrentMount(owner, generation) || token !== glitchToken || !root || visualSuspended || motionQuery && motionQuery.matches) return;
						const signal = signalElement || root.querySelector(".dsh-fairy-signal");
						if (!signal) return;
						const mode = lastGlitchMode === "threads" ? "blocks" : "threads";
						lastGlitchMode = mode;
						if (mode === "blocks") setBlockLayout();
						const pulseCount = mode === "threads" ? FAULT_TIMING.threads.pulses : 2 * (1 + Math.floor(Math.random() * 2));
						let pulseIndex = 0;
						function pulse() {
							if (!isCurrentMount(owner, generation) || token !== glitchToken || visualSuspended || motionQuery && motionQuery.matches) return;
							setGlitchPulse(signal, mode);
							pulseIndex += 1;
							if (pulseIndex < pulseCount) {
								const timing = FAULT_TIMING[mode];
								armGlitchTimer(pulse, randomBetween(timing.gapMin, timing.gapMax));
							} else armGlitchTimer(function() {
								if (!isCurrentMount(owner, generation) || token !== glitchToken) return;
								clearGlitchVisual();
								scheduleGlitch(owner, generation);
							}, mode === "threads" ? randomBetween(FAULT_TIMING.threads.fadeMin, FAULT_TIMING.threads.fadeMax) : randomBetween(FAULT_TIMING.blocks.fadeMin, FAULT_TIMING.blocks.fadeMax));
						}
						pulse();
					}, randomBetween(2300, 4600) / animationRate);
				}
				function stopGlitch() {
					glitchToken += 1;
					stateTransitionToken += 1;
					eventScheduler.cancel("glitch");
					eventScheduler.cancel("transition");
					glitchTimer = null;
					if (root) root.removeAttribute("data-transition-glitch");
					if (root) root.removeAttribute("data-transition-target");
					clearGlitchVisual();
					stopEyeFlicker();
				}
				function ensureGlitchScheduler(owner, generation) {
					if (!isCurrentMount(owner, generation)) return;
					if (motionQuery && (motionOwner !== owner || motionGeneration !== generation)) unbindMotionListener();
					if (!motionQuery && typeof window !== "undefined" && typeof window.matchMedia === "function") {
						motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
						motionOwner = owner;
						motionGeneration = generation;
						motionChangeListener = function() {
							if (!isCurrentMount(owner, generation)) return;
							if (motionQuery.matches) {
								stopGlitch();
								synchronizeActiveClipPhase("normal");
							} else {
								synchronizeActiveClipPhase(root && root.getAttribute("data-state"));
								scheduleGlitch(owner, generation);
							}
						};
						if (typeof motionQuery.addEventListener === "function") motionQuery.addEventListener("change", motionChangeListener);
						else if (typeof motionQuery.addListener === "function") motionQuery.addListener(motionChangeListener);
					}
					if (visualSuspended || motionQuery && motionQuery.matches) {
						synchronizeActiveClipPhase("normal");
						return;
					}
					scheduleGlitch(owner, generation);
					scheduleEyeFlicker(owner, generation);
				}
				function ensureStyle() {
					if (document.getElementById(STYLE_ID)) return;
					const style = document.createElement("style");
					style.id = STYLE_ID;
					style.setAttribute("data-plugin", "dsh-fairy-visual");
					style.textContent = CSS;
					(document.head || document.documentElement).appendChild(style);
				}
				function setAnimationRate(nextRate) {
					const numericRate = typeof nextRate === "string" ? Number(nextRate) : nextRate;
					const rate = numericRate === .7 || numericRate === 1.5 ? numericRate : 1;
					const changed = rate !== animationRate;
					if (changed) motionClock.setRate(rate);
					animationRate = rate;
					if (!root) return;
					root.setAttribute("data-dsh-fairy-animation-rate", String(rate));
					root.style.setProperty("--dsh-fairy-steady-rate", String(rate));
					root.style.setProperty("--dsh-fairy-pulse-cycle", 1.44 + 2.56 / rate + "s");
					if (changed) {
						alignEyeLayersToClock();
						synchronizeActiveClipPhase(root.getAttribute("data-state"));
					}
					if (changed && !root.hasAttribute("data-transition-glitch") && !visualSuspended) {
						stopGlitch();
						if (root.getAttribute("data-state") === "normal") {
							scheduleGlitch(mountedOwner, mountGeneration);
							scheduleEyeFlicker(mountedOwner, mountGeneration);
						}
					}
				}
				function bindSpeedListener() {
					if (speedListener) return;
					speedListener = function(event) {
						setAnimationRate(event?.detail?.rate);
					};
					window.addEventListener("dsh-fairy-mascot-animation-speed", speedListener);
				}
				function build() {
					root = document.createElement("div");
					root.id = ROOT_ID;
					root.setAttribute("data-dsh-fairy-mascot-root", "true");
					root.setAttribute("aria-hidden", "true");
					root.innerHTML = "<div class=\"dsh-fairy-float\">" + HALO_SVG + PULSE_SVG + SVG + "</div>";
					return root;
				}
				function applyVisualState(nextState, playTransition, owner, generation) {
					if (!isCurrentMount(owner, generation) || !root) return;
					const normalized = nextState === "comforting" ? "comforting" : nextState === "thinking" ? "thinking" : "normal";
					if (appliedState === normalized && root.getAttribute("data-state") === normalized) {
						if (!visualSuspended) ensureGlitchScheduler(owner, generation);
						return;
					}
					const stateChanged = appliedState !== null && appliedState !== normalized;
					root.setAttribute("data-state", normalized);
					appliedState = normalized;
					if (visualSuspended) return;
					synchronizeActiveClipPhase(normalized);
					if (stateChanged && playTransition !== false) playStateTransition(normalized, owner, generation);
					else ensureGlitchScheduler(owner, generation);
				}
				function setVisualActive(active, owner, generation = mountGeneration) {
					if (!isCurrentMount(owner, generation)) return;
					requestedVisualActive = active === true;
					const nextActive = requestedVisualActive && lifecycleVisible;
					if (!root) {
						visualSuspended = !nextActive;
						return;
					}
					if (!nextActive) {
						stopMotionLoop();
						motionClock.pause();
						visualSuspended = true;
						lifecycleToken += 1;
						if (lifecycleResumeFrame) cancelAnimationFrame(lifecycleResumeFrame);
						lifecycleResumeFrame = 0;
						stopGlitch();
						root.setAttribute("data-visual-suspended", "true");
						return;
					}
					const shouldResume = !visualActiveInitialized || visualSuspended || root.hasAttribute("data-visual-suspended");
					visualActiveInitialized = true;
					if (!shouldResume) return;
					visualSuspended = false;
					motionClock.resume();
					root.removeAttribute("data-visual-suspended");
					startMotionLoop();
					const token = ++lifecycleToken;
					lifecycleResumeFrame = requestAnimationFrame(function() {
						if (!isCurrentMount(owner, generation) || token !== lifecycleToken || visualSuspended || !root) return;
						lifecycleResumeFrame = 0;
						synchronizeActiveClipPhase(root.getAttribute("data-state"));
						startMotionLoop();
						ensureGlitchScheduler(owner, generation);
					});
				}
				function bindLifecycleListeners(owner, generation) {
					if (lifecycleVisibilityListener && lifecycleListenerOwner === owner && lifecycleListenerGeneration === generation) return;
					unbindLifecycleListeners();
					lifecycleListenerOwner = owner;
					lifecycleListenerGeneration = generation;
					lifecycleVisibilityListener = function() {
						if (!isCurrentMount(owner, generation)) return;
						lifecycleVisible = isLifecycleVisible();
						setVisualActive(requestedVisualActive, owner, generation);
					};
					lifecyclePageHideListener = function() {
						if (!isCurrentMount(owner, generation)) return;
						lifecycleVisible = false;
						setVisualActive(requestedVisualActive, owner, generation);
					};
					lifecyclePageShowListener = function() {
						if (!isCurrentMount(owner, generation)) return;
						lifecycleVisible = isLifecycleVisible();
						setVisualActive(requestedVisualActive, owner, generation);
					};
					document.addEventListener("visibilitychange", lifecycleVisibilityListener);
					window.addEventListener("pagehide", lifecyclePageHideListener);
					window.addEventListener("pageshow", lifecyclePageShowListener);
				}
				function unbindLifecycleListeners() {
					if (!lifecycleVisibilityListener) return;
					document.removeEventListener("visibilitychange", lifecycleVisibilityListener);
					window.removeEventListener("pagehide", lifecyclePageHideListener);
					window.removeEventListener("pageshow", lifecyclePageShowListener);
					lifecycleVisibilityListener = null;
					lifecyclePageHideListener = null;
					lifecyclePageShowListener = null;
					lifecycleListenerOwner = null;
					lifecycleListenerGeneration = 0;
				}
				function mount(stageNode, owner, persistedRate) {
					if (!document.body) return;
					const stage = stageNode || owner?.stage;
					if (!isValidOwner(owner, stage) || stage.isConnected === false || typeof stage.matches === "function" && !stage.matches(HOST_SELECTOR)) return;
					if (mountedOwner && mountedOwner !== owner) dispose(mountedOwner);
					if (mountedOwner !== owner || mountedHost !== stage) {
						mountedOwner = owner;
						mountedHost = stage;
						mountGeneration += 1;
					}
					const stageRoot = stage.id !== ROOT_ID ? stage.querySelector("#" + ROOT_ID) : null;
					const previousRoot = root;
					const rootWasReparented = Boolean(root && root.parentNode !== stage);
					const nextRoot = stageRoot || root || build();
					if (previousRoot && nextRoot !== previousRoot || rootWasReparented) invalidateMountResources();
					root = nextRoot;
					root.setAttribute("data-dsh-fairy-mascot-root", "true");
					if (root.parentNode !== stage) {
						stage.appendChild(root);
						motionClock.reset();
						visualActiveInitialized = false;
					}
					if (root !== previousRoot) visualActiveInitialized = false;
					const generation = mountGeneration;
					bindLifecycleListeners(owner, generation);
					lifecycleVisible = isLifecycleVisible();
					ensureStyle();
					bindSpeedListener();
					cacheVisualNodes();
					setAnimationRate(persistedRate === void 0 ? animationRate : persistedRate);
					setVisualActive(stage.getAttribute("data-fairy-visual-active") === "true", owner, generation);
					const requestedState = stage.getAttribute("data-fairy-state");
					if (stage.getAttribute("data-fairy-low-power") === "true") root.setAttribute("data-low-power", "");
					else root.removeAttribute("data-low-power");
					applyVisualState(requestedState, true, owner, generation);
					if (!visualSuspended) startMotionLoop();
					if (stage !== observedHost || !hostObserver) {
						if (hostObserver) hostObserver.disconnect();
						observedHost = stage;
						if (typeof MutationObserver !== "undefined") {
							const observedGeneration = generation;
							hostObserver = createManagedMutationObserver(function() {
								if (isCurrentMount(owner, observedGeneration, stage)) mount(stage, owner);
							});
							hostObserver.observe(stage, { childList: true });
						}
					}
				}
				function dispose(owner) {
					if (owner && mountedOwner !== owner) return;
					if (mountedOwner) mountedOwner.active = false;
					invalidateMountResources();
					stopMotionLoop();
					mountedOwner = null;
					mountedHost = null;
					root?.remove();
					root = null;
					cacheVisualNodes();
					appliedState = null;
					motionClock.pause();
					visualSuspended = true;
					requestedVisualActive = false;
					lifecycleVisible = true;
					visualActiveInitialized = false;
					document.getElementById(STYLE_ID)?.remove();
				}
				mascotRuntime = {
					mount,
					setVisualActive,
					ownsHost: (owner) => mountedOwner === owner || mountedHost === owner,
					ownsOwner: (owner) => mountedOwner === owner,
					activeTimerCount: () => eventScheduler.activeCount(),
					dispose
				};
			})();
			return mascotRuntime;
		}
		module.exports = { createMascotRuntime };
	}));

//#endregion
//#region src/client/semantic-markers.js
	var require_semantic_markers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { createLifecycleScope, claimSingleton } = require_lifecycle();
		const SEMANTIC_MARKERS = Object.freeze([
			"data-dsh-fairy-background-surface",
			"data-dsh-fairy-sidebar-layer",
			"data-dsh-fairy-sidebar-content",
			"data-dsh-fairy-sidebar-collapsed-content",
			"data-dsh-fairy-history-surface",
			"data-dsh-fairy-history-fade",
			"data-dsh-fairy-active-folder",
			"data-dsh-fairy-selected-session",
			"data-dsh-fairy-brand-anchor",
			"data-dsh-fairy-sidebar-open-control",
			"data-dsh-fairy-native-new-session",
			"data-dsh-fairy-hero-native-copy",
			"data-dsh-fairy-version-navigation",
			"data-dsh-fairy-header-row",
			"data-dsh-fairy-header-title-row",
			"data-dsh-fairy-header-title-cluster",
			"data-dsh-fairy-header-utilities-shell",
			"data-dsh-fairy-header-actions-cluster",
			"data-dsh-fairy-header-utilities-cluster",
			"data-dsh-fairy-header-session-log",
			"data-dsh-fairy-header-session-agent-preset",
			"data-dsh-fairy-composer-seat",
			"data-dsh-fairy-composer-controls",
			"data-dsh-fairy-send-button",
			"data-dsh-fairy-overlay-layer"
		]);
		function createSemanticMarkerMap() {
			return new Map(SEMANTIC_MARKERS.map((name) => [name, /* @__PURE__ */ new Set()]));
		}
		function markSemanticNode(markerMap, node, name) {
			const nodes = markerMap.get(name);
			if (!nodes) throw new Error(`[dsh-fairy-visual] unregistered semantic marker: ${name}`);
			if (node) nodes.add(node);
		}
		function mutationTouchesSemanticSurface(records, selector) {
			const visited = /* @__PURE__ */ new WeakSet();
			return records.some((record) => {
				const target = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
				if (record.type === "attributes") return Boolean(target?.closest?.(selector));
				if (record.type !== "childList") return false;
				return [...record.addedNodes, ...record.removedNodes].some((node) => {
					if (node.nodeType !== 1 || visited.has(node)) return false;
					visited.add(node);
					return node.matches?.(selector) || node.querySelector?.(selector);
				});
			});
		}
		function claimSemanticMarkers(documentRef) {
			return claimSingleton(documentRef, "semantic-markers", createLifecycleScope("semantic-markers"));
		}
		module.exports = {
			SEMANTIC_MARKERS,
			createSemanticMarkerMap,
			markSemanticNode,
			mutationTouchesSemanticSurface,
			claimSemanticMarkers
		};
	}));

//#endregion
//#region src/client/semantic-markers-manager.js
	var require_semantic_markers_manager = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { getDomObserverManager, createManagedMutationObserver } = require_dom_observer_manager();
		const { createSemanticMarkerMap, markSemanticNode, mutationTouchesSemanticSurface, claimSemanticMarkers } = require_semantic_markers();
		const { OFFICIAL_SELECTORS, OFFICIAL_ATTRIBUTES, SEMANTIC_SURFACE_SELECTOR, rootSlot, sidebar, shellOverlay, settingsDialog, sidebarOpenControl, sidebarCollapseControl, sessionTree, expandedSessionItems, selectedSessionItems, newSessionButtons, sidebarBrandButton, conversation, phase, sessionHeader, sessionHeaderActions, sessionHeaderUtilities, sessionAgentPresetLabel, headerElement, composerSeat, composerCard, sendOnlyButton, undoControl, redoControl, reportMissingCapabilities } = require_dom_adapter();
		const domObserverManager = getDomObserverManager(document);
		function install(lifecycle = claimSemanticMarkers(document)) {
			const semanticFrameKey = {};
			let observer = null;
			const owned = createSemanticMarkerMap();
			let modalOpen = false;
			const clear = () => {
				owned.forEach((nodes, name) => {
					nodes.forEach((node) => {
						if (node.isConnected) node.removeAttribute(name);
					});
					nodes.clear();
				});
			};
			const sync = () => {
				const desired = createSemanticMarkerMap();
				const mark = (node, name) => markSemanticNode(desired, node, name);
				const rootFrame = rootSlot(document)?.firstElementChild;
				mark(rootFrame, "data-dsh-fairy-background-surface");
				mark(shellOverlay(document)?.parentElement, "data-dsh-fairy-overlay-layer");
				const nextModalOpen = Boolean(settingsDialog(document));
				if (nextModalOpen !== modalOpen) {
					modalOpen = nextModalOpen;
					document.documentElement.toggleAttribute("data-dsh-fairy-modal-open", modalOpen);
				}
				const side = sidebar(document);
				const sidebarContent = side?.firstElementChild;
				const sidebarLayer = side?.parentElement;
				const openSidebarControl = sidebarOpenControl(document);
				mark(sidebarLayer, "data-dsh-fairy-sidebar-layer");
				mark(sidebarContent, "data-dsh-fairy-sidebar-content");
				mark(openSidebarControl, "data-dsh-fairy-sidebar-open-control");
				if (openSidebarControl) mark(sidebarContent, "data-dsh-fairy-sidebar-collapsed-content");
				const tree = sessionTree(side);
				const historySurface = tree?.parentElement?.parentElement;
				mark(historySurface, "data-dsh-fairy-history-surface");
				mark(tree?.nextElementSibling, "data-dsh-fairy-history-fade");
				expandedSessionItems(tree).forEach((node) => mark(node, "data-dsh-fairy-active-folder"));
				selectedSessionItems(tree).forEach((node) => mark(node, "data-dsh-fairy-selected-session"));
				const newSessionControls = newSessionButtons(side);
				const brandCandidate = sidebarBrandButton(side);
				const ownedBrand = !(Boolean(openSidebarControl) || !sidebarCollapseControl(document)) ? brandCandidate : null;
				mark(ownedBrand, "data-dsh-fairy-brand-anchor");
				newSessionControls.filter((button) => button !== ownedBrand).forEach((button) => mark(button, "data-dsh-fairy-native-new-session"));
				const stage = conversation(document);
				const currentPhase = phase(stage);
				const header = sessionHeader(currentPhase);
				const actions = sessionHeaderActions(currentPhase);
				const utilities = sessionHeaderUtilities(currentPhase);
				mark(header, "data-dsh-fairy-header-row");
				const titleRow = [...headerElement(header)?.children || []].find((node) => actions && utilities && node.contains(actions) && node.contains(utilities));
				mark(titleRow, "data-dsh-fairy-header-title-row");
				mark([...titleRow?.children || []].find((node) => actions && node.contains(actions) && (!utilities || !node.contains(utilities))), "data-dsh-fairy-header-title-cluster");
				mark(utilities?.parentElement, "data-dsh-fairy-header-utilities-shell");
				mark(actions, "data-dsh-fairy-header-actions-cluster");
				mark(utilities, "data-dsh-fairy-header-utilities-cluster");
				mark([...utilities?.querySelectorAll("button") || []].find((button) => !button.matches(".dsh-fairy-toggle, .dsh-fairy-theme-toggle")), "data-dsh-fairy-header-session-log");
				mark(sessionAgentPresetLabel(currentPhase), "data-dsh-fairy-header-session-agent-preset");
				const undo = undoControl(actions);
				const redo = redoControl(actions);
				if (undo?.parentElement && undo.parentElement === redo?.parentElement) mark(undo.parentElement, "data-dsh-fairy-version-navigation");
				const seat = composerSeat(stage);
				const card = composerCard(seat);
				const sendButton = sendOnlyButton(card);
				mark(seat, "data-dsh-fairy-composer-seat");
				mark(sendButton?.parentElement, "data-dsh-fairy-composer-controls");
				mark(sendButton, "data-dsh-fairy-send-button");
				const nativeCopy = seat?.querySelector(".dsh-fairy-hero-native-headline");
				mark(nativeCopy, "data-dsh-fairy-hero-native-copy");
				desired.forEach((nextNodes, name) => {
					const previousNodes = owned.get(name);
					previousNodes.forEach((node) => {
						if (nextNodes.has(node)) return;
						if (node.isConnected) node.removeAttribute(name);
					});
					nextNodes.forEach((node) => {
						if (!previousNodes.has(node) || node.getAttribute(name) !== "true") node.setAttribute(name, "true");
					});
					owned.set(name, nextNodes);
				});
				reportMissingCapabilities(document);
			};
			const schedule = () => {
				if (!lifecycle.disposed) domObserverManager.scheduleFrame(semanticFrameKey, sync);
			};
			sync();
			if (typeof MutationObserver === "function" && document.body) {
				observer = createManagedMutationObserver((records) => {
					if (mutationTouchesSemanticSurface(records, SEMANTIC_SURFACE_SELECTOR)) schedule();
				});
				lifecycle.add(() => observer?.disconnect(), "semantic-markers:observer");
				observer.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: [
						"aria-expanded",
						"aria-label",
						"aria-selected",
						OFFICIAL_ATTRIBUTES.phase,
						OFFICIAL_ATTRIBUTES.slot
					]
				});
			}
			const cleanup = () => {
				domObserverManager.cancelFrame(semanticFrameKey);
				clear();
				document.documentElement.removeAttribute("data-dsh-fairy-modal-open");
			};
			lifecycle.add(cleanup, "semantic-markers:restore-markers");
			return () => lifecycle.dispose();
		}
		module.exports = { install };
	}));

//#endregion
//#region src/client/geometry-lifecycle.js
	var require_geometry_lifecycle = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { createLifecycleScope, claimSingleton } = require_lifecycle();
		function claimGeometryLifecycle(owner, name) {
			return claimSingleton(owner, name, createLifecycleScope(name));
		}
		module.exports = { claimGeometryLifecycle };
	}));

//#endregion
//#region src/client/surface-utils.js
	var require_surface_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { OFFICIAL_SELECTORS, OFFICIAL_ATTRIBUTES } = require_dom_adapter();
		function mutationTouchesSurface(records, selector, attributes = []) {
			return records.some((record) => {
				const target = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
				if (record.type === "attributes") return (!attributes.length || attributes.includes(record.attributeName)) && Boolean(target?.matches?.(selector) || target?.closest?.(selector));
				if (record.type !== "childList") return false;
				if (target?.matches?.(selector) || target?.closest?.(selector)) return true;
				return [...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1 && (node.matches?.(selector) || node.querySelector?.(selector)));
			});
		}
		function mutationTouchesHeroSurface(records, officialSelectors, officialAttributes) {
			const selector = `${officialSelectors.conversation}, ${officialSelectors.phaseHero}, ${officialSelectors.phaseActive}, ${officialSelectors.composerSeat}`;
			return records.some((record) => {
				const target = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
				if (record.type === "attributes") {
					if (record.attributeName === officialAttributes.phase) return Boolean(target?.matches?.(selector));
					return record.attributeName === "placeholder" && Boolean(target?.matches?.(OFFICIAL_SELECTORS.composerTextarea) && target.closest?.(officialSelectors.phaseHero));
				}
				if (record.type !== "childList") return false;
				if (target?.matches?.(officialSelectors.phaseHero) || target?.closest?.(officialSelectors.phaseHero)) return true;
				return [...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1 && (node.matches?.(selector) || node.querySelector?.(selector)));
			});
		}
		function roundedRectPath(left, top, right, bottom, radius) {
			const r = Math.max(0, Math.min(radius, (right - left) * .5, (bottom - top) * .5));
			if (!r) return `M ${left} ${top} H ${right} V ${bottom} H ${left} Z`;
			return `M ${left + r} ${top} H ${right - r} Q ${right} ${top} ${right} ${top + r} V ${bottom - r} Q ${right} ${bottom} ${right - r} ${bottom} H ${left + r} Q ${left} ${bottom} ${left} ${bottom - r} V ${top + r} Q ${left} ${top} ${left + r} ${top} Z`;
		}
		module.exports = {
			mutationTouchesSurface,
			mutationTouchesHeroSurface,
			roundedRectPath
		};
	}));

//#endregion
//#region src/client/sidebar-geometry-manager.js
	var require_sidebar_geometry_manager = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const React$3 = require("react");
		const { createManagedMutationObserver } = require_dom_observer_manager();
		const { claimGeometryLifecycle } = require_geometry_lifecycle();
		const { mutationTouchesSurface, roundedRectPath } = require_surface_utils();
		const { OFFICIAL_SELECTORS, OFFICIAL_ATTRIBUTES, sidebarResizeHandle } = require_dom_adapter();
		function install(_lifecycle = null) {
			function SidebarBoardCutout({ enabled }) {
				React$3.useLayoutEffect(() => {
					const lifecycle = claimGeometryLifecycle(document, "sidebar-board-cutout");
					let structureObserver = null;
					let layoutObserver = null;
					let resizeObserver = null;
					let observedLayer = null;
					let observedHole = null;
					let observedFrame = null;
					let observedHandle = null;
					const clear = () => {
						document.querySelectorAll("[data-dsh-fairy-sidebar-layer=\"true\"]").forEach((node) => {
							node.style.removeProperty("--dsh-sidebar-board-clip");
							node.removeAttribute("data-dsh-fairy-sidebar-geometry");
						});
					};
					const bindOwners = () => {
						const layer = document.querySelector("[data-dsh-fairy-sidebar-layer=\"true\"]");
						const hole = document.querySelector("[data-dsh-fairy-history-surface=\"true\"]");
						const ownerFrame = layer?.parentElement || null;
						const handle = sidebarResizeHandle(ownerFrame) || sidebarResizeHandle(document);
						if (layer === observedLayer && hole === observedHole && ownerFrame === observedFrame && handle === observedHandle) return;
						lifecycle.replaceBinding("sidebar-owner", () => {
							resizeObserver?.disconnect();
							layoutObserver?.disconnect();
						}, "sidebar-board:owner-observers");
						observedLayer = layer;
						observedHole = hole;
						observedFrame = ownerFrame;
						observedHandle = handle;
						resizeObserver?.disconnect();
						layoutObserver?.disconnect();
						if (resizeObserver) {
							if (layer) resizeObserver.observe(layer);
							if (hole) resizeObserver.observe(hole);
							if (ownerFrame) resizeObserver.observe(ownerFrame);
						}
						if (layoutObserver) {
							if (ownerFrame) layoutObserver.observe(ownerFrame, {
								attributes: true,
								attributeFilter: [
									"style",
									"data-dragging",
									"data-sidebar-collapsed"
								]
							});
							if (handle) layoutObserver.observe(handle, {
								attributes: true,
								attributeFilter: ["style", "data-dragging"]
							});
						}
					};
					const sync = () => {
						bindOwners();
						const layer = document.querySelector("[data-dsh-fairy-sidebar-layer=\"true\"]");
						const hole = document.querySelector("[data-dsh-fairy-history-surface=\"true\"]");
						if (!enabled || !layer) return clear();
						const layerRect = layer.getBoundingClientRect();
						if (layerRect.width < 1 || layerRect.height < 1) return clear();
						const outer = roundedRectPath(0, 0, layerRect.width, layerRect.height, 0);
						const holeRect = hole?.getBoundingClientRect();
						const inner = holeRect && holeRect.width >= 1 && holeRect.height >= 1 ? roundedRectPath(holeRect.left - layerRect.left, holeRect.top - layerRect.top, holeRect.right - layerRect.left, holeRect.bottom - layerRect.top, 10) : null;
						layer.style.setProperty("--dsh-sidebar-board-clip", `path(evenodd, "${outer}${inner ? ` ${inner}` : ""}")`);
						layer.setAttribute("data-dsh-fairy-sidebar-geometry", "ready");
					};
					const schedule = () => {
						if (!lifecycle.disposed) lifecycle.scheduleFrame("sidebar-board-sync", sync, "sidebar-board:sync-frame");
					};
					if (typeof ResizeObserver === "function") resizeObserver = new ResizeObserver(() => {
						bindOwners();
						schedule();
					});
					if (typeof MutationObserver === "function") layoutObserver = createManagedMutationObserver(schedule);
					bindOwners();
					sync();
					if (typeof MutationObserver === "function" && document.body) {
						structureObserver = createManagedMutationObserver((records) => {
							if (mutationTouchesSurface(records, `${OFFICIAL_SELECTORS.sidebar}, [data-dsh-fairy-sidebar-layer="true"], [data-dsh-fairy-history-surface="true"]`, [
								"aria-expanded",
								OFFICIAL_ATTRIBUTES.phase,
								OFFICIAL_ATTRIBUTES.slot,
								"data-dsh-fairy-sidebar-layer",
								"data-dsh-fairy-history-surface"
							])) schedule();
						});
						structureObserver.observe(document.body, {
							childList: true,
							subtree: true,
							attributes: true,
							attributeFilter: [
								"aria-expanded",
								OFFICIAL_ATTRIBUTES.phase,
								OFFICIAL_ATTRIBUTES.slot,
								"data-dsh-fairy-sidebar-layer",
								"data-dsh-fairy-history-surface"
							]
						});
					}
					window.addEventListener("resize", schedule, { passive: true });
					const cleanup = () => {
						resizeObserver?.disconnect();
						structureObserver?.disconnect();
						layoutObserver?.disconnect();
						window.removeEventListener("resize", schedule);
						clear();
					};
					lifecycle.add(cleanup, "sidebar-board:restore-geometry");
					return () => lifecycle.dispose();
				}, [enabled]);
				return null;
			}
			return { SidebarBoardCutout };
		}
		module.exports = { install };
	}));

//#endregion
//#region src/client/scrollbar.js
	var require_scrollbar = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { createLifecycleScope, claimSingleton } = require_lifecycle();
		function claimScrollbarLifecycle(documentRef) {
			return claimSingleton(documentRef, "scrollbars", createLifecycleScope("scrollbars"));
		}
		module.exports = { claimScrollbarLifecycle };
	}));

//#endregion
//#region src/client/scrollbars-manager.js
	var require_scrollbars_manager = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const React$2 = require("react");
		const { createLifecycleScope } = require_lifecycle();
		const { createManagedMutationObserver } = require_dom_observer_manager();
		const { createPointerDrag } = require_pointer_drag();
		const { claimScrollbarLifecycle } = require_scrollbar();
		const { HDD_SCROLL_TARGET_SELECTOR, hddScrollTargets } = require_dom_adapter();
		function install(_lifecycle = null) {
			function HddOverlayScrollbars({ enabled }) {
				React$2.useLayoutEffect(() => {
					if (!enabled || !document.body) return void 0;
					const lifecycle = claimScrollbarLifecycle(document);
					const host = document.createElement("div");
					host.className = "dsh-hdd-scrollbar-layer";
					host.setAttribute("data-plugin", "dsh-fairy-visual");
					host.setAttribute("aria-label", "HDD 滚动条");
					document.body.appendChild(host);
					let structureObserver = null;
					let resizeObserver = null;
					const bindings = /* @__PURE__ */ new Map();
					const TRACK_WIDTH = 12;
					const EDGE_INSET = 1;
					const schedule = () => {
						if (!lifecycle.disposed) lifecycle.scheduleFrame("scrollbar-sync", sync, "scrollbars:sync-frame");
					};
					const scheduleStructure = () => {
						if (!lifecycle.disposed) lifecycle.scheduleFrame("scrollbar-bind", bindTargets, "scrollbars:bind-frame");
					};
					const updateAria = (thumb, target, maxScroll) => {
						thumb.setAttribute("aria-valuemin", "0");
						thumb.setAttribute("aria-valuemax", String(Math.round(maxScroll)));
						thumb.setAttribute("aria-valuenow", String(Math.round(target.scrollTop)));
					};
					const armIdle = (binding) => {
						binding.idleDeadline = Date.now() + 850;
						if (binding.idleTimer) return;
						const settle = () => {
							const remaining = binding.idleDeadline - Date.now();
							if (remaining > 0) {
								binding.idleTimer = binding.lifecycle.timeout(settle, remaining, `scrollbar:${binding.key}:idle-settle`);
								return;
							}
							binding.idleTimer = null;
							binding.track.setAttribute("data-idle", "true");
							binding.track.setAttribute("data-active", "false");
						};
						binding.idleTimer = binding.lifecycle.timeout(settle, 850, `scrollbar:${binding.key}:idle-settle`);
					};
					const show = (binding) => {
						binding.track.setAttribute("data-idle", "false");
						binding.track.setAttribute("data-active", "true");
						armIdle(binding);
					};
					const createBinding = (key, target) => {
						const track = document.createElement("div");
						track.className = "dsh-history-overlay-scrollbar";
						track.setAttribute("data-target", key);
						track.setAttribute("role", "scrollbar");
						track.setAttribute("aria-orientation", "vertical");
						track.setAttribute("tabindex", "0");
						const thumb = document.createElement("div");
						thumb.className = "dsh-history-overlay-scrollbar-thumb";
						track.appendChild(thumb);
						host.appendChild(track);
						const bindingLifecycle = createLifecycleScope(`scrollbar:${key}`);
						const binding = {
							key,
							target,
							track,
							thumb,
							pointerDrag: null,
							idleTimer: null,
							idleDeadline: 0,
							lifecycle: bindingLifecycle
						};
						track.setAttribute("data-idle", "true");
						const onScroll = () => {
							show(binding);
							schedule();
						};
						const onPointerDown = (event) => {
							if (event.button !== 0) return;
							event.preventDefault();
							event.stopPropagation();
							const trackRect = track.getBoundingClientRect();
							const thumbRect = thumb.getBoundingClientRect();
							const travel = Math.max(1, trackRect.height - thumbRect.height);
							const payload = {
								pointerId: event.pointerId,
								startY: event.clientY,
								startScrollTop: target.scrollTop,
								travel,
								maxScroll: Math.max(0, target.scrollHeight - target.clientHeight)
							};
							show(binding);
							binding.pointerDrag.start(event, payload);
						};
						const onPointerMove = (_event, session) => {
							const drag = session.payload;
							const next = drag.startScrollTop + (_event.clientY - drag.startY) * drag.maxScroll / drag.travel;
							target.scrollTop = Math.max(0, Math.min(drag.maxScroll, next));
							schedule();
						};
						binding.pointerDrag = createPointerDrag({
							getTarget: () => thumb,
							getLockNodes: () => [track],
							onMove: onPointerMove,
							onEnd: schedule,
							onCancel: schedule
						});
						const onTrackPointerDown = (event) => {
							if (event.target === thumb || event.button !== 0) return;
							const rect = track.getBoundingClientRect();
							const direction = event.clientY < rect.top + rect.height * .5 ? -1 : 1;
							target.scrollTop += direction * target.clientHeight * .85;
							show(binding);
							schedule();
						};
						const onKeyDown = (event) => {
							const maxScroll = Math.max(0, target.scrollHeight - target.clientHeight);
							const step = event.shiftKey ? target.clientHeight : 48;
							let next = null;
							if (event.key === "ArrowUp") next = target.scrollTop - step;
							else if (event.key === "ArrowDown") next = target.scrollTop + step;
							else if (event.key === "PageUp") next = target.scrollTop - target.clientHeight;
							else if (event.key === "PageDown") next = target.scrollTop + target.clientHeight;
							else if (event.key === "Home") next = 0;
							else if (event.key === "End") next = maxScroll;
							if (next === null) return;
							event.preventDefault();
							target.scrollTop = Math.max(0, Math.min(maxScroll, next));
							show(binding);
							schedule();
						};
						bindingLifecycle.add(() => track.remove(), `scrollbar:${key}:track-node`);
						bindingLifecycle.on(target, "scroll", onScroll, {
							passive: true,
							label: `scrollbar:${key}:target-scroll`
						});
						bindingLifecycle.on(thumb, "pointerdown", onPointerDown, { label: `scrollbar:${key}:thumb-pointerdown` });
						bindingLifecycle.on(track, "pointerdown", onTrackPointerDown, { label: `scrollbar:${key}:track-pointerdown` });
						bindingLifecycle.on(track, "keydown", onKeyDown, { label: `scrollbar:${key}:track-keydown` });
						bindingLifecycle.add(() => binding.pointerDrag?.dispose(), `scrollbar:${key}:pointer-drag`);
						binding.cleanup = () => {
							if (binding.idleTimer) clearTimeout(binding.idleTimer);
							binding.idleTimer = null;
							bindingLifecycle.dispose();
						};
						return binding;
					};
					const resolveTargets = () => hddScrollTargets(document);
					const bindTargets = () => {
						const next = new Map(resolveTargets().map(({ key, target }) => [key, target]));
						bindings.forEach((binding, key) => {
							if (next.get(key) !== binding.target) {
								binding.cleanup();
								bindings.delete(key);
							}
						});
						next.forEach((target, key) => {
							if (!bindings.has(key)) bindings.set(key, createBinding(key, target));
						});
						resizeObserver?.disconnect();
						resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
						bindings.forEach((binding) => {
							resizeObserver?.observe(binding.target);
						});
						schedule();
					};
					const sync = () => {
						const measurements = [];
						bindings.forEach((binding) => {
							const target = binding.target;
							const rect = target.getBoundingClientRect();
							const maxScroll = Math.max(0, target.scrollHeight - target.clientHeight);
							if (!(rect.width > 0 && rect.height > 0 && target.clientHeight > 0 && maxScroll > 1)) {
								measurements.push({
									binding,
									visible: false
								});
								return;
							}
							const trackHeight = Math.max(24, Math.round(rect.height - 4));
							const thumbHeight = Math.max(20, Math.min(trackHeight, Math.round(trackHeight * target.clientHeight / target.scrollHeight)));
							const travel = Math.max(0, trackHeight - thumbHeight);
							const thumbTop = maxScroll ? Math.round(target.scrollTop / maxScroll * travel) : 0;
							measurements.push({
								binding,
								visible: true,
								rect,
								maxScroll,
								trackHeight,
								thumbHeight,
								thumbTop
							});
						});
						measurements.forEach(({ binding, visible, rect, maxScroll, trackHeight, thumbHeight, thumbTop }) => {
							if (!visible) {
								binding.track.setAttribute("data-visible", "false");
								return;
							}
							binding.track.style.left = `${Math.round(rect.right - EDGE_INSET - TRACK_WIDTH)}px`;
							binding.track.style.top = `${Math.round(rect.top + 2)}px`;
							binding.track.style.height = `${trackHeight}px`;
							binding.thumb.style.height = `${thumbHeight}px`;
							binding.thumb.style.transform = `translateY(${thumbTop}px)`;
							binding.track.setAttribute("data-visible", "true");
							updateAria(binding.track, binding.target, maxScroll);
						});
					};
					bindTargets();
					if (typeof MutationObserver === "function" && document.body) {
						structureObserver = createManagedMutationObserver((records) => {
							let targetStructureChanged = false;
							let targetContentChanged = false;
							records.forEach((record) => {
								if (record.type !== "childList") return;
								if ((record.target?.nodeType === 1 ? record.target : record.target?.parentElement)?.closest?.(HDD_SCROLL_TARGET_SELECTOR)) targetContentChanged = true;
								if ([...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1 && (node.matches?.(HDD_SCROLL_TARGET_SELECTOR) || node.querySelector?.(HDD_SCROLL_TARGET_SELECTOR)))) targetStructureChanged = true;
							});
							bindings.forEach((binding) => {
								if (!binding.target.isConnected) targetStructureChanged = true;
							});
							if (targetStructureChanged) scheduleStructure();
							else if (targetContentChanged) schedule();
						});
						structureObserver.observe(document.body, {
							childList: true,
							subtree: true
						});
					}
					window.addEventListener("resize", schedule, { passive: true });
					const cleanup = () => {
						structureObserver?.disconnect();
						resizeObserver?.disconnect();
						window.removeEventListener("resize", schedule);
						bindings.forEach((binding) => binding.cleanup());
						bindings.clear();
						host.remove();
					};
					lifecycle.add(cleanup, "scrollbars:dispose");
					return () => lifecycle.dispose();
				}, [enabled]);
				return null;
			}
			return { HddOverlayScrollbars };
		}
		module.exports = { install };
	}));

//#endregion
//#region src/client/hero-projection-manager.js
	var require_hero_projection_manager = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const React$1 = require("react");
		const { jsx: jsx$1, jsxs: jsxs$1 } = require("react/jsx-runtime");
		const { MODE_ATTR, HERO_PLACEHOLDERS } = (init_constants(), __toCommonJS(constants_exports));
		const { createManagedMutationObserver } = require_dom_observer_manager();
		const { mutationTouchesSurface, mutationTouchesHeroSurface } = require_surface_utils();
		const { OFFICIAL_SELECTORS, OFFICIAL_ATTRIBUTES, sidebar, conversation, phase, composerSeat, composerCard, composerTextarea } = require_dom_adapter();
		let heroMaskInstanceSeed = 0;
		function install(_lifecycle = null, { Toggle, useController }) {
			function HeroToggleHost({ controller }) {
				const hostRef = React$1.useRef(null);
				const [positioned, setPositioned] = React$1.useState(false);
				const { sessionId } = useController(controller);
				React$1.useLayoutEffect(() => {
					const host = hostRef.current;
					if (!host) return;
					let frame = 0;
					let hero = null;
					let resizeObserver = null;
					let structureObserver = null;
					let conversationObserver = null;
					let observedConversation = null;
					const sync = () => {
						frame = 0;
						bindConversation();
						const conversationSurface = conversation(document);
						const nextHero = phase(conversationSurface, "active") ? null : phase(conversationSurface, "hero");
						if (nextHero !== hero) {
							resizeObserver?.disconnect();
							hero = nextHero;
							if (typeof ResizeObserver === "function" && hero) {
								resizeObserver = new ResizeObserver(schedule);
								resizeObserver.observe(hero);
							}
						}
						if (!hero) {
							setPositioned(false);
							host.style.removeProperty("left");
							host.style.removeProperty("top");
							return;
						}
						const rect = hero.getBoundingClientRect();
						if (rect.width < 1 || rect.height < 1) {
							setPositioned(false);
							return;
						}
						host.style.left = Math.round(rect.right - host.offsetWidth - 28) + "px";
						host.style.top = Math.round(rect.top + 8) + "px";
						setPositioned(true);
					};
					const schedule = () => {
						if (!frame) frame = requestAnimationFrame(sync);
					};
					const bindConversation = () => {
						const conversationNode = conversation(document);
						if (conversationNode === observedConversation) return;
						conversationObserver?.disconnect();
						conversationObserver = null;
						observedConversation = conversationNode;
						if (typeof MutationObserver === "function" && conversationNode) {
							conversationObserver = createManagedMutationObserver((records) => {
								const phaseSelector = `${OFFICIAL_SELECTORS.phaseHero}, ${OFFICIAL_SELECTORS.phaseActive}`;
								if (mutationTouchesSurface(records, phaseSelector, [OFFICIAL_ATTRIBUTES.phase])) schedule();
							});
							conversationObserver.observe(conversationNode, {
								childList: true,
								subtree: true,
								attributes: true,
								attributeFilter: [OFFICIAL_ATTRIBUTES.phase]
							});
						}
					};
					if (typeof MutationObserver === "function" && document.body) {
						structureObserver = createManagedMutationObserver((records) => {
							if (mutationTouchesHeroSurface(records, OFFICIAL_SELECTORS, OFFICIAL_ATTRIBUTES)) schedule();
						});
						structureObserver.observe(document.body, {
							childList: true,
							subtree: true,
							attributes: true,
							attributeFilter: [OFFICIAL_ATTRIBUTES.phase, "placeholder"]
						});
					}
					window.addEventListener("resize", schedule, { passive: true });
					bindConversation();
					sync();
					return () => {
						if (frame) cancelAnimationFrame(frame);
						resizeObserver?.disconnect();
						structureObserver?.disconnect();
						conversationObserver?.disconnect();
						observedConversation = null;
						window.removeEventListener("resize", schedule);
						host.style.removeProperty("left");
						host.style.removeProperty("top");
					};
				}, [sessionId]);
				return jsx$1("div", {
					ref: hostRef,
					className: "dsh-fairy-hero-toggle-host",
					"data-positioned": String(positioned),
					hidden: !positioned,
					children: jsx$1(Toggle, { controller })
				});
			}
			function HeroHost({ controller }) {
				const state = useController(controller);
				const stateRef = React$1.useRef(state);
				stateRef.current = state;
				const hostRef = React$1.useRef(null);
				const placeholderRef = React$1.useRef({
					key: null,
					text: null
				});
				const heroMaskIdRef = React$1.useRef(null);
				if (!heroMaskIdRef.current) heroMaskIdRef.current = `dsh-fairy-hero-mask-${++heroMaskInstanceSeed}`;
				const heroMaskId = heroMaskIdRef.current;
				React$1.useLayoutEffect(() => {
					const host = hostRef.current;
					if (!host) return;
					let frame = 0;
					let nativeHeadline = null;
					let textarea = null;
					let originalPlaceholder = null;
					let appliedPlaceholder = null;
					let resizeObserver = null;
					let structureObserver = null;
					let modeObserver = null;
					let sidebarLayoutObserver = null;
					let observedHeadline = null;
					let observedHero = null;
					let observedComposer = null;
					let observedSidebar = null;
					let observedSidebarFrame = null;
					const restoreTextarea = () => {
						if (!textarea) return;
						const current = textarea.getAttribute("placeholder");
						if (appliedPlaceholder !== null && current !== appliedPlaceholder) originalPlaceholder = current;
						if (originalPlaceholder === null) textarea.removeAttribute("placeholder");
						else textarea.setAttribute("placeholder", originalPlaceholder);
						textarea = null;
						originalPlaceholder = null;
						appliedPlaceholder = null;
					};
					const clearHero = (resetHostGeometry = false) => {
						nativeHeadline?.classList.remove("dsh-fairy-hero-native-headline", "dsh-fairy-hero-native-headline-hidden");
						nativeHeadline = null;
						restoreTextarea();
						host.setAttribute("data-active", "false");
						if (resetHostGeometry) {
							host.style.removeProperty("left");
							host.style.removeProperty("top");
						}
						host.style.removeProperty("clip-path");
						host.style.removeProperty("-webkit-clip-path");
						resizeObserver?.disconnect();
						sidebarLayoutObserver?.disconnect();
						observedHeadline = null;
						observedHero = null;
						observedComposer = null;
						observedSidebar = null;
						observedSidebarFrame = null;
					};
					const findLeafText = (root, text) => Array.from(root.querySelectorAll("span,div")).find((node) => node.childElementCount === 0 && (node.textContent || "").trim() === text) || null;
					const syncHero = () => {
						frame = 0;
						const hero = phase(conversation(document), "hero");
						if (!hero) return clearHero();
						const nextHeadline = findLeafText(hero, "探索未至之境")?.parentElement || null;
						const card = composerCard(hero);
						const nextTextarea = composerTextarea(card);
						if (!nextHeadline || !nextTextarea) return clearHero();
						const hddEnabled = document.documentElement.hasAttribute("data-dsh-fairy-visual");
						const placeholderKey = stateRef.current.sessionId || "hero";
						if (placeholderRef.current.key !== placeholderKey || !placeholderRef.current.text) placeholderRef.current = {
							key: placeholderKey,
							text: HERO_PLACEHOLDERS[Math.floor(Math.random() * HERO_PLACEHOLDERS.length)]
						};
						const replacementPlaceholder = placeholderRef.current.text;
						if (nativeHeadline !== nextHeadline) {
							nativeHeadline?.classList.remove("dsh-fairy-hero-native-headline", "dsh-fairy-hero-native-headline-hidden");
							nativeHeadline = nextHeadline;
							nativeHeadline.classList.add("dsh-fairy-hero-native-headline");
						}
						nativeHeadline.classList.toggle("dsh-fairy-hero-native-headline-hidden", hddEnabled);
						if (hddEnabled) {
							if (textarea !== nextTextarea) {
								restoreTextarea();
								textarea = nextTextarea;
								originalPlaceholder = textarea.getAttribute("placeholder");
							}
							if (textarea.getAttribute("placeholder") !== replacementPlaceholder) textarea.setAttribute("placeholder", replacementPlaceholder);
							appliedPlaceholder = replacementPlaceholder;
						} else restoreTextarea();
						const heroRect = hero.getBoundingClientRect();
						const center = heroRect.left + heroRect.width * .5;
						host.style.left = Math.round(center) + "px";
						host.setAttribute("data-active", String(hddEnabled));
						if (hddEnabled) {
							const hostRect = host.getBoundingClientRect();
							const composerRect = card.getBoundingClientRect();
							const bottomInset = hostRect.bottom - composerRect.top;
							const sidebarRect = (document.querySelector("[data-dsh-fairy-sidebar-layer=\"true\"]") || sidebar(document)?.firstElementChild || sidebar(document))?.getBoundingClientRect();
							let leftInset = 0;
							let rightInset = 0;
							if (sidebarRect) {
								if (sidebarRect.right <= heroRect.left + heroRect.width * .5) leftInset = Math.max(0, sidebarRect.right - hostRect.left);
								else rightInset = Math.max(0, hostRect.right - sidebarRect.left);
							}
							host.style.clipPath = `inset(0 ${rightInset}px ${bottomInset}px ${leftInset}px)`;
							host.style.webkitClipPath = `inset(0 ${rightInset}px ${bottomInset}px ${leftInset}px)`;
						} else {
							host.style.removeProperty("clip-path");
							host.style.removeProperty("-webkit-clip-path");
						}
						const nextSidebar = document.querySelector("[data-dsh-fairy-sidebar-layer=\"true\"]") || sidebar(document)?.firstElementChild || sidebar(document);
						const sidebarChanged = observedSidebar !== nextSidebar;
						if (resizeObserver && (observedHeadline !== nativeHeadline || observedHero !== hero || observedComposer !== card || sidebarChanged)) {
							resizeObserver.disconnect();
							observedHeadline = nativeHeadline;
							observedHero = hero;
							observedComposer = card;
							observedSidebar = nextSidebar;
							resizeObserver.observe(nativeHeadline);
							resizeObserver.observe(hero);
							resizeObserver.observe(card);
							if (nextSidebar) resizeObserver.observe(nextSidebar);
						}
						const nextSidebarFrame = nextSidebar?.parentElement || null;
						if (sidebarLayoutObserver && (sidebarChanged || observedSidebarFrame !== nextSidebarFrame)) {
							sidebarLayoutObserver.disconnect();
							observedSidebarFrame = nextSidebarFrame;
							if (nextSidebar) sidebarLayoutObserver.observe(nextSidebar, {
								attributes: true,
								attributeFilter: ["style", "aria-expanded"]
							});
							if (nextSidebarFrame) sidebarLayoutObserver.observe(nextSidebarFrame, {
								attributes: true,
								attributeFilter: ["style", "data-sidebar-collapsed"]
							});
						}
					};
					const scheduleHeroSync = () => {
						if (!frame) frame = requestAnimationFrame(syncHero);
					};
					if (typeof ResizeObserver === "function") resizeObserver = new ResizeObserver(scheduleHeroSync);
					if (typeof MutationObserver === "function") sidebarLayoutObserver = createManagedMutationObserver(scheduleHeroSync);
					if (typeof MutationObserver === "function" && document.body) {
						structureObserver = createManagedMutationObserver((records) => {
							if (mutationTouchesSurface(records, `${OFFICIAL_SELECTORS.conversation}, ${OFFICIAL_SELECTORS.phaseHero}, ${OFFICIAL_SELECTORS.composerSeat}`, [OFFICIAL_ATTRIBUTES.phase, "placeholder"])) scheduleHeroSync();
						});
						structureObserver.observe(document.body, {
							childList: true,
							subtree: true,
							attributes: true,
							attributeFilter: [OFFICIAL_ATTRIBUTES.phase, "placeholder"]
						});
						modeObserver = createManagedMutationObserver(scheduleHeroSync);
						modeObserver.observe(document.documentElement, {
							attributes: true,
							attributeFilter: [MODE_ATTR]
						});
					}
					window.addEventListener("resize", scheduleHeroSync, { passive: true });
					syncHero();
					return () => {
						if (frame) cancelAnimationFrame(frame);
						structureObserver?.disconnect();
						modeObserver?.disconnect();
						sidebarLayoutObserver?.disconnect();
						window.removeEventListener("resize", scheduleHeroSync);
						clearHero(true);
					};
				}, []);
				return jsxs$1("div", {
					ref: hostRef,
					className: "dsh-fairy-hero-host",
					children: [jsxs$1("span", {
						className: "dsh-fairy-hero-main",
						children: [jsxs$1("svg", {
							className: "dsh-fairy-hero-projection-svg",
							width: "100%",
							height: "220",
							"aria-hidden": "true",
							children: [
								jsxs$1("defs", { children: [
									jsx$1("mask", {
										id: `${heroMaskId}-2`,
										maskType: "luminance",
										maskUnits: "userSpaceOnUse",
										maskContentUnits: "userSpaceOnUse",
										x: "0",
										y: "0",
										width: "100%",
										height: "220",
										children: jsxs$1("g", { children: [jsx$1("rect", {
											x: "0",
											y: "0",
											width: "100%",
											height: "220",
											fill: "white"
										}), jsx$1("text", {
											className: "dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-1-for-2",
											x: "50%",
											y: "114",
											fill: "black",
											children: "HOLLOW DEEP DIVE SYSTEM"
										})] })
									}),
									jsx$1("mask", {
										id: `${heroMaskId}-3`,
										maskType: "luminance",
										maskUnits: "userSpaceOnUse",
										maskContentUnits: "userSpaceOnUse",
										x: "0",
										y: "0",
										width: "100%",
										height: "220",
										children: jsxs$1("g", { children: [
											jsx$1("rect", {
												x: "0",
												y: "0",
												width: "100%",
												height: "220",
												fill: "white"
											}),
											jsx$1("text", {
												className: "dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-1-for-3",
												x: "50%",
												y: "174",
												fill: "black",
												children: "HOLLOW DEEP DIVE SYSTEM"
											}),
											jsx$1("text", {
												className: "dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-2-for-3",
												x: "50%",
												y: "150",
												fill: "black",
												children: "HOLLOW DEEP DIVE SYSTEM"
											})
										] })
									}),
									jsx$1("mask", {
										id: `${heroMaskId}-4`,
										maskType: "luminance",
										maskUnits: "userSpaceOnUse",
										maskContentUnits: "userSpaceOnUse",
										x: "0",
										y: "0",
										width: "100%",
										height: "220",
										children: jsxs$1("g", { children: [
											jsx$1("rect", {
												x: "0",
												y: "0",
												width: "100%",
												height: "220",
												fill: "white"
											}),
											jsx$1("text", {
												className: "dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-1-for-4",
												x: "50%",
												y: "246",
												fill: "black",
												children: "HOLLOW DEEP DIVE SYSTEM"
											}),
											jsx$1("text", {
												className: "dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-2-for-4",
												x: "50%",
												y: "222",
												fill: "black",
												children: "HOLLOW DEEP DIVE SYSTEM"
											}),
											jsx$1("text", {
												className: "dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-3-for-4",
												x: "50%",
												y: "192",
												fill: "black",
												children: "HOLLOW DEEP DIVE SYSTEM"
											})
										] })
									})
								] }),
								jsx$1("text", {
									className: "dsh-fairy-hero-projection-text dsh-fairy-hero-projection-text-1",
									x: "50%",
									y: "66",
									transform: "matrix(1 0 0 -1 0 132)",
									children: "HOLLOW DEEP DIVE SYSTEM"
								}),
								jsx$1("text", {
									className: "dsh-fairy-hero-projection-text dsh-fairy-hero-projection-text-2",
									x: "50%",
									y: "90",
									transform: "matrix(1 0 0 -1 0 180)",
									mask: `url(#${heroMaskId}-2)`,
									children: "HOLLOW DEEP DIVE SYSTEM"
								}),
								jsx$1("text", {
									className: "dsh-fairy-hero-projection-text dsh-fairy-hero-projection-text-3",
									x: "50%",
									y: "120",
									transform: "matrix(1 0 0 -1 0 240)",
									mask: `url(#${heroMaskId}-3)`,
									children: "HOLLOW DEEP DIVE SYSTEM"
								}),
								jsx$1("text", {
									className: "dsh-fairy-hero-projection-text dsh-fairy-hero-projection-text-4",
									x: "50%",
									y: "156",
									transform: "matrix(1 0 0 -1 0 312)",
									mask: `url(#${heroMaskId}-4)`,
									children: "HOLLOW DEEP DIVE SYSTEM"
								})
							]
						}), "HOLLOW DEEP DIVE SYSTEM"]
					}), jsx$1("span", {
						className: "dsh-fairy-hero-sub",
						children: Array.from("空洞深潜系统").map((character, index) => jsx$1("span", {
							className: "dsh-fairy-hero-sub-char",
							children: character
						}, index))
					})]
				});
			}
			function ActiveComposerPlaceholder({ controller }) {
				const state = useController(controller);
				const placeholderRef = React$1.useRef({
					key: null,
					text: null
				});
				React$1.useLayoutEffect(() => {
					let frame = 0;
					let textarea = null;
					let originalPlaceholder = null;
					let appliedPlaceholder = null;
					let structureObserver = null;
					let modeObserver = null;
					const placeholderKey = state.sessionId || "active";
					if (placeholderRef.current.key !== placeholderKey || !placeholderRef.current.text) placeholderRef.current = {
						key: placeholderKey,
						text: HERO_PLACEHOLDERS[Math.floor(Math.random() * HERO_PLACEHOLDERS.length)]
					};
					const restoreTextarea = () => {
						if (!textarea) return;
						const current = textarea.getAttribute("placeholder");
						if (appliedPlaceholder !== null && current !== appliedPlaceholder) originalPlaceholder = current;
						if (originalPlaceholder === null) textarea.removeAttribute("placeholder");
						else textarea.setAttribute("placeholder", originalPlaceholder);
						textarea = null;
						originalPlaceholder = null;
						appliedPlaceholder = null;
					};
					const syncPlaceholder = () => {
						frame = 0;
						const hddEnabled = document.documentElement.hasAttribute("data-dsh-fairy-visual");
						const conversationSurface = conversation(document);
						const nextTextarea = phase(conversationSurface, "active") ? composerTextarea(composerCard(composerSeat(conversationSurface))) : null;
						if (!hddEnabled || !nextTextarea) return restoreTextarea();
						if (textarea !== nextTextarea) {
							restoreTextarea();
							textarea = nextTextarea;
							originalPlaceholder = textarea.getAttribute("placeholder");
						}
						const replacement = placeholderRef.current.text;
						const current = textarea.getAttribute("placeholder");
						if (appliedPlaceholder !== null && current !== appliedPlaceholder) originalPlaceholder = current;
						if (current !== replacement) textarea.setAttribute("placeholder", replacement);
						appliedPlaceholder = replacement;
					};
					const schedulePlaceholderSync = () => {
						if (!frame) frame = requestAnimationFrame(syncPlaceholder);
					};
					if (typeof MutationObserver === "function" && document.body) {
						structureObserver = createManagedMutationObserver((records) => {
							if (mutationTouchesSurface(records, `${OFFICIAL_SELECTORS.conversation}, ${OFFICIAL_SELECTORS.phaseActive}, ${OFFICIAL_SELECTORS.composerSeat}`, [
								OFFICIAL_ATTRIBUTES.phase,
								OFFICIAL_ATTRIBUTES.composerSeat,
								"placeholder"
							])) schedulePlaceholderSync();
						});
						structureObserver.observe(document.body, {
							childList: true,
							subtree: true,
							attributes: true,
							attributeFilter: [
								OFFICIAL_ATTRIBUTES.phase,
								OFFICIAL_ATTRIBUTES.composerSeat,
								"placeholder"
							]
						});
						modeObserver = createManagedMutationObserver(schedulePlaceholderSync);
						modeObserver.observe(document.documentElement, {
							attributes: true,
							attributeFilter: [MODE_ATTR]
						});
					}
					syncPlaceholder();
					return () => {
						if (frame) cancelAnimationFrame(frame);
						structureObserver?.disconnect();
						modeObserver?.disconnect();
						restoreTextarea();
					};
				}, [state.sessionId, state.settings.enabled]);
				return null;
			}
			return {
				HeroToggleHost,
				HeroHost,
				ActiveComposerPlaceholder
			};
		}
		module.exports = { install };
	}));

//#endregion
//#region src/client/mode-theme.js
	var require_mode_theme = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		function ownModeTheme(scope, modeTransition, themeTransition, sessionTransition) {
			scope.add(() => modeTransition?.dispose?.(), "mode-theme:mode-transition");
			scope.add(() => themeTransition?.dispose?.(), "mode-theme:theme-transition");
			scope.add(() => sessionTransition?.dispose?.(), "mode-theme:session-transition");
		}
		module.exports = { ownModeTheme };
	}));

//#endregion
//#region src/client/controller-lifecycle.js
	var require_controller_lifecycle = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { createLifecycleScope, claimSingleton } = require_lifecycle();
		const { ownModeTheme } = require_mode_theme();
		function ownControllerLifecycle(controller) {
			const scope = claimSingleton(controller, "controller-dispose", createLifecycleScope("controller"));
			ownModeTheme(scope, controller.modeTransition, controller.themeTransition, controller.sessionTransition);
			scope.add(() => controller.listOff?.(), "controller:session-list-subscription");
			scope.add(() => controller.sessionOff?.(), "controller:session-binding-subscription");
			scope.add(() => controller.settingsOff?.(), "controller:settings-subscription");
			scope.add(() => controller.listeners?.clear?.(), "controller:listener-registry");
			return scope;
		}
		function disposeControllerLifecycle(scope) {
			scope?.dispose?.();
		}
		module.exports = {
			ownControllerLifecycle,
			disposeControllerLifecycle
		};
	}));

//#endregion
//#region src/client/stage-lifecycle.js
	var require_stage_lifecycle = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { createLifecycleScope, claimSingleton } = require_lifecycle();
		function claimStageGeometryLifecycle(stageNode) {
			return claimSingleton(stageNode, "stage-geometry", createLifecycleScope("stage-geometry"));
		}
		function claimContentFadeLifecycle(stageNode) {
			return claimSingleton(stageNode, "content-fade", createLifecycleScope("content-fade"));
		}
		module.exports = {
			claimStageGeometryLifecycle,
			claimContentFadeLifecycle
		};
	}));

//#endregion
//#region src/client/content-fade.js
	var require_content_fade = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { claimContentFadeLifecycle } = require_stage_lifecycle();
		module.exports = { claimContentFadeLifecycle };
	}));

//#endregion
//#region src/client/mascot-lifecycle.js
	var require_mascot_lifecycle = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { createLifecycleScope, claimSingleton } = require_lifecycle();
		function claimMascotLifecycle(stageNode) {
			return claimSingleton(stageNode, "mascot-runtime", createLifecycleScope("mascot-runtime"));
		}
		module.exports = { claimMascotLifecycle };
	}));

//#endregion
//#region src/client/brand-sidebar-geometry.js
	var require_brand_sidebar_geometry = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { claimGeometryLifecycle } = require_geometry_lifecycle();
		function claimBrandSidebarGeometry(owner) {
			return claimGeometryLifecycle(owner, "brand-sidebar-geometry");
		}
		module.exports = { claimBrandSidebarGeometry };
	}));

//#endregion
//#region src/client/power-mode.js
	var require_power_mode = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const { claimGeometryLifecycle } = require_geometry_lifecycle();
		function claimPowerModeGeometry(owner) {
			return claimGeometryLifecycle(owner, "power-mode-geometry");
		}
		module.exports = { claimPowerModeGeometry };
	}));

//#endregion
//#region src/client/selection-guard.js
	var require_selection_guard = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const LOCK_ATTRIBUTE = "data-dsh-fairy-selection-lock";
		function createSelectionGuard({ documentRef, windowRef, selector, maxDuration = 15e3 } = {}) {
			const doc = documentRef || (typeof document !== "undefined" ? document : null);
			const win = windowRef || (typeof window !== "undefined" ? window : null);
			const root = doc?.documentElement;
			if (!doc || !win || !root || !selector) return { dispose() {} };
			let pointerId = null;
			let safetyTimer = 0;
			const clear = () => {
				pointerId = null;
				if (safetyTimer) {
					clearTimeout(safetyTimer);
					safetyTimer = 0;
				}
				root.removeAttribute(LOCK_ATTRIBUTE);
			};
			const arm = (event) => {
				if (!event?.target?.closest?.(selector) || event.button != null && event.button !== 0) return;
				pointerId = event.pointerId ?? "mouse";
				root.setAttribute(LOCK_ATTRIBUTE, "true");
				if (safetyTimer) clearTimeout(safetyTimer);
				safetyTimer = setTimeout(clear, maxDuration);
			};
			const end = (event) => {
				if (pointerId === null) return;
				if (event?.pointerId != null && event.pointerId !== pointerId) return;
				clear();
			};
			const preventSelection = (event) => {
				if (root.hasAttribute(LOCK_ATTRIBUTE)) event.preventDefault();
			};
			const onMouseDown = (event) => {
				if (pointerId === null) arm(event);
			};
			const onDocumentVisibilityChange = () => {
				if (doc.visibilityState === "hidden") clear();
			};
			const onPageHide = () => clear();
			doc.addEventListener("pointerdown", arm, true);
			doc.addEventListener("mousedown", onMouseDown, true);
			doc.addEventListener("selectstart", preventSelection, true);
			doc.addEventListener("dragstart", preventSelection, true);
			doc.addEventListener("visibilitychange", onDocumentVisibilityChange, true);
			win.addEventListener("pointerup", end, true);
			win.addEventListener("pointercancel", end, true);
			win.addEventListener("mouseup", end, true);
			win.addEventListener("blur", clear, true);
			win.addEventListener("pagehide", onPageHide, true);
			return { dispose() {
				doc.removeEventListener("pointerdown", arm, true);
				doc.removeEventListener("mousedown", onMouseDown, true);
				doc.removeEventListener("selectstart", preventSelection, true);
				doc.removeEventListener("dragstart", preventSelection, true);
				doc.removeEventListener("visibilitychange", onDocumentVisibilityChange, true);
				win.removeEventListener("pointerup", end, true);
				win.removeEventListener("pointercancel", end, true);
				win.removeEventListener("mouseup", end, true);
				win.removeEventListener("blur", clear, true);
				win.removeEventListener("pagehide", onPageHide, true);
				clear();
			} };
		}
		module.exports = {
			createSelectionGuard,
			LOCK_ATTRIBUTE
		};
	}));

//#endregion
//#region src/client/settings-normalizer.cjs
	var require_settings_normalizer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		const SETTINGS_VERSION = 2;
		const SPEED_STOPS = Object.freeze([
			.7,
			1,
			1.5
		]);
		const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
		const nearest = (value, values) => values.reduce((best, item) => Math.abs(item - value) < Math.abs(best - value) ? item : best, values[0]);
		const toFiniteNumber = (value) => {
			if (value === "" || value == null || typeof value === "string" && value.trim() === "") return NaN;
			const number = Number(value);
			return Number.isFinite(number) ? number : NaN;
		};
		function migrateVisualSettings(input = {}) {
			const source = input && typeof input === "object" ? input : {};
			const legacyScale = source.mascotScale ?? source.eyeSize ?? source.mascotSize;
			const rawSpeed = source.mascotAnimationSpeed ?? source.animationSpeed;
			const numericSpeed = toFiniteNumber(rawSpeed);
			const numericScale = toFiniteNumber(legacyScale);
			const numericComposerHeight = toFiniteNumber(source.composerDockHeight);
			return {
				version: SETTINGS_VERSION,
				enabled: typeof source.enabled === "boolean" ? source.enabled : false,
				theme: source.theme === "light" ? "light" : "dark",
				mascotVisible: typeof source.mascotVisible === "boolean" ? source.mascotVisible : true,
				mascotScale: Number.isFinite(numericScale) ? clamp(numericScale, .55, 1) : 1,
				mascotAnimationSpeed: Number.isFinite(numericSpeed) ? nearest(numericSpeed, SPEED_STOPS) : 1,
				powerMode: source.powerMode === "low-power" ? "low-power" : "normal",
				composerDockHeight: Number.isFinite(numericComposerHeight) ? Math.round(clamp(numericComposerHeight, 132, 420)) : 132
			};
		}
		function normalizeSetting(field, value, current = {}) {
			return migrateVisualSettings({
				...current,
				[field]: value
			})[field];
		}
		module.exports = {
			SETTINGS_VERSION,
			SPEED_STOPS,
			migrateVisualSettings,
			normalizeSetting
		};
	}));

//#endregion
//#region src/client/visual-transitions.js
	var require_visual_transitions = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		init_defineProperty();
		const diagnostics = {
			start: () => typeof performance === "object" && performance?.now ? performance.now() : Date.now(),
			metric(operation, startedAt, context = {}) {
				const clock = typeof performance === "object" && performance?.now ? performance.now() : Date.now();
				console.info(`DSH_FAIRY_LOG ${JSON.stringify({
					schema: 1,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					level: "info",
					module: "dsh-fairy-visual",
					operation,
					event: "metric",
					context,
					duration_ms: Number((clock - startedAt).toFixed(3))
				})}`);
			},
			warn(operation, context = {}, error) {
				console.warn(`DSH_FAIRY_LOG ${JSON.stringify({
					schema: 1,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					level: "warn",
					module: "dsh-fairy-visual",
					operation,
					event: "failure",
					context,
					error: {
						name: String(error?.name || "Error"),
						message: String(error?.message || error).slice(0, 320)
					}
				})}`);
			}
		};
		function createVisualTransitions({ rootSlot, modeAttr, conversation, anyPhase, composerSeat, composerCard }) {
			const FAIRY_CONTAINER_ID = "dsh-fairy-plugin-container";
			const FAIRY_CONTAINER_STYLE = "position:fixed;inset:0;pointer-events:none;z-index:2147483000;";
			const THEME_TRANSITION_DURATION_MS = 480;
			let fairyContainer = null;
			let cloneIdSeed = 0;
			const clonedElementLists = /* @__PURE__ */ new WeakMap();
			function collectElements(root) {
				return clonedElementLists.get(root) || [root, ...root.querySelectorAll("*")];
			}
			function isDescendantOf(node, ancestor) {
				for (let parent = node?.parentElement || node?.parentNode; parent; parent = parent.parentElement || parent.parentNode) if (parent === ancestor) return true;
				return false;
			}
			function hasClass(node, name) {
				return String(node?.getAttribute?.("class") || "").split(/\s+/).includes(name);
			}
			function ensureFairyContainer() {
				if (!fairyContainer || !fairyContainer.isConnected) {
					fairyContainer = document.getElementById(FAIRY_CONTAINER_ID);
					if (!fairyContainer || !fairyContainer.isConnected) {
						fairyContainer = document.createElement("div");
						fairyContainer.id = FAIRY_CONTAINER_ID;
						fairyContainer.setAttribute("data-fairy-owned", "true");
						document.body.appendChild(fairyContainer);
					}
				}
				fairyContainer.style.cssText = FAIRY_CONTAINER_STYLE;
				return fairyContainer;
			}
			function removeFairyContainer() {
				fairyContainer?.remove();
				fairyContainer = null;
			}
			function settleVisualTransition(promise, label) {
				return promise.catch((error) => {
					if (error?.name !== "AbortError") diagnostics.warn("transition.settle", { label }, error);
				});
			}
			function namespaceCloneReferences(elements) {
				const idMap = /* @__PURE__ */ new Map();
				const prefix = `dsh-fairy-transition-${++cloneIdSeed}`;
				const isSvgElement = (node) => node?.namespaceURI === "http://www.w3.org/2000/svg" || Boolean(node?.ownerSVGElement) || String(node?.tagName || "").toLowerCase() === "svg";
				elements.filter(isSvgElement).forEach((node) => {
					const id = node.getAttribute?.("id");
					if (!id) return;
					const sourceId = id.replace(/^dsh-fairy-transition-\d+-/, "");
					const next = `${prefix}-${sourceId}`;
					idMap.set(id, next);
					idMap.set(sourceId, next);
					node.setAttribute("id", next);
				});
				const rewrite = (value) => {
					if (!value) return value;
					let next = value.replace(/url\(#([^)]+)\)/g, (_match, id) => `url(#${idMap.get(id) || id})`);
					if (next.startsWith("#")) next = `#${idMap.get(next.slice(1)) || next.slice(1)}`;
					return next;
				};
				const attributes = [
					"href",
					"xlink:href",
					"fill",
					"stroke",
					"filter",
					"clip-path",
					"mask",
					"marker-start",
					"marker-mid",
					"marker-end",
					"style"
				];
				elements.forEach((node) => {
					attributes.forEach((attribute) => {
						const value = node.getAttribute?.(attribute);
						if (value) node.setAttribute(attribute, rewrite(value));
					});
				});
				const mascotRoot = elements.find((node) => node.getAttribute?.("data-dsh-fairy-mascot-root") === "true");
				const stateClipId = mascotRoot?.getAttribute?.("data-state") === "thinking" ? "dsh-fairy-thinking-eye-clip" : mascotRoot?.getAttribute?.("data-state") === "comforting" ? "dsh-fairy-comforting-eye-clip" : null;
				const namespacedClipId = stateClipId ? idMap.get(stateClipId) : null;
				if (namespacedClipId) elements.filter((node) => hasClass(node, "dsh-fairy-eye") && isDescendantOf(node, mascotRoot)).forEach((eye) => {
					eye.style?.setProperty?.("clip-path", `url(#${namespacedClipId})`);
					eye.style?.setProperty?.("-webkit-clip-path", `url(#${namespacedClipId})`);
				});
				elements.forEach((node) => {
					if (node.getAttribute?.("data-dsh-fairy-mascot-root") === "true") node.removeAttribute("id");
				});
			}
			function clearClonedFairyFaultState(elements) {
				const mascotRoots = elements.filter((node) => node.getAttribute?.("data-dsh-fairy-mascot-root") === "true");
				mascotRoots.forEach((root) => {
					root.removeAttribute("data-transition-glitch");
					root.removeAttribute("data-transition-target");
					root.removeAttribute("data-visual-suspended");
				});
				elements.filter((node) => hasClass(node, "dsh-fairy-signal") && mascotRoots.some((root) => isDescendantOf(node, root))).forEach((signal) => {
					signal.removeAttribute("data-glitch");
					[
						"--dsh-g-x",
						"--dsh-g-skew",
						"--dsh-g-bright",
						"--dsh-g-contrast",
						"--dsh-g-s1-x",
						"--dsh-g-s2-x",
						"--dsh-g-s3-x",
						"--dsh-g-s4-x",
						"--dsh-g-s5-x"
					].forEach((name) => signal.style.removeProperty(name));
				});
			}
			function isScrollableSnapshotRoot(node) {
				return node?.getAttribute?.("data-conversation-scroll") !== null || node?.getAttribute?.("data-chat-flow") !== null || node?.getAttribute?.("role") === "tree";
			}
			function pruneOffscreenSubtrees(sourceElements, cloneElements) {
				const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
				const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
				if (viewportWidth < 1 || viewportHeight < 1) return cloneElements;
				const removedRoots = [];
				const count = Math.min(sourceElements.length, cloneElements.length);
				for (let index = 1; index < count; index += 1) {
					const source = sourceElements[index];
					const target = cloneElements[index];
					if (!isScrollableSnapshotRoot(source?.parentElement || source?.parentNode)) continue;
					if (!target?.firstElementChild || typeof source.getBoundingClientRect !== "function") continue;
					const rect = source.getBoundingClientRect();
					if (!rect || rect.width <= 0 || rect.height <= 0) continue;
					if (rect.bottom > -2 && rect.top < viewportHeight + 2 && rect.right > -2 && rect.left < viewportWidth + 2) continue;
					target.replaceChildren();
					target.setAttribute("data-dsh-transition-placeholder", "");
					target.style?.setProperty?.("visibility", "hidden", "important");
					target.style?.setProperty?.("content-visibility", "hidden", "important");
					target.style?.setProperty?.("contain", "strict", "important");
					target.style?.setProperty?.("box-sizing", "border-box", "important");
					target.style?.setProperty?.("width", `${rect.width}px`, "important");
					target.style?.setProperty?.("height", `${rect.height}px`, "important");
					target.style?.setProperty?.("min-width", `${rect.width}px`, "important");
					target.style?.setProperty?.("min-height", `${rect.height}px`, "important");
					target.style?.setProperty?.("flex", "none", "important");
					removedRoots.push(target);
				}
				if (!removedRoots.length) return cloneElements;
				return cloneElements.filter((node) => !removedRoots.some((root) => node !== root && isDescendantOf(node, root)));
			}
			function cloneTransitionFrame(frame) {
				const clone = frame.cloneNode(true);
				clone.setAttribute("data-dsh-transition-frame", "");
				const sourceElements = collectElements(frame);
				const cloneElements = [clone, ...clone.querySelectorAll("*")];
				namespaceCloneReferences(cloneElements);
				clearClonedFairyFaultState(cloneElements);
				clone.setAttribute("inert", "");
				cloneElements.forEach((node) => {
					if (node.getAttribute?.("data-dsh-fairy-brand-anchor") !== "true") return;
					node.removeAttribute("data-dsh-fairy-brand-anchor");
					node.removeAttribute("data-dsh-fairy-native-new-session");
				});
				for (let index = 0; index < Math.min(sourceElements.length, cloneElements.length); index += 1) {
					const source = sourceElements[index];
					const target = cloneElements[index];
					if (source.getAttribute?.("data-dsh-fairy-brand-anchor") === "true") {
						target.removeAttribute("data-dsh-fairy-brand-anchor");
						target.removeAttribute("data-dsh-fairy-native-new-session");
					}
					if (source.scrollTop) target.scrollTop = source.scrollTop;
					if (source.scrollLeft) target.scrollLeft = source.scrollLeft;
					if ("value" in source && "value" in target) target.value = source.value;
					if ("checked" in source && "checked" in target) target.checked = source.checked;
				}
				clonedElementLists.set(clone, pruneOffscreenSubtrees(sourceElements, cloneElements));
				return clone;
			}
			class ModeTransition {
				constructor() {
					_defineProperty(this, "cleanup", () => {
						if (this.cleanupTimer !== null) clearTimeout(this.cleanupTimer);
						this.cleanupTimer = null;
						this.frameAnimation?.cancel?.();
						this.frameAnimation = null;
						if (this.sliceFrame !== null) cancelAnimationFrame(this.sliceFrame);
						this.sliceFrame = null;
						this.overlay?.remove();
						this.overlay = null;
					});
					this.overlay = null;
					this.cleanupTimer = null;
					this.frameAnimation = null;
					this.sliceFrame = null;
				}
				resolveFrame() {
					const frame = rootSlot(document)?.firstElementChild || null;
					if (!frame) return null;
					const rect = frame.getBoundingClientRect();
					return rect.width > 0 && rect.height > 0 ? frame : null;
				}
				cloneFrame(frame) {
					return cloneTransitionFrame(frame);
				}
				trigger() {
					const startedAt = diagnostics.start();
					if (!document.body || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
					const frame = this.resolveFrame();
					if (!frame || typeof frame.animate !== "function") return;
					this.cleanup();
					const duration = 420;
					const overlay = document.createElement("div");
					overlay.className = "dsh-hdd-mode-transition";
					overlay.setAttribute("data-from-mode", document.documentElement.getAttribute(modeAttr) || "normal");
					overlay.setAttribute("aria-hidden", "true");
					ensureFairyContainer().appendChild(overlay);
					this.overlay = overlay;
					const oldBackground = getComputedStyle(document.body).backgroundColor;
					const random = (min, max) => min + Math.random() * (max - min);
					const band = () => {
						const top = random(0, 82);
						const height = random(2, 13);
						return `polygon(0% ${top.toFixed(1)}%,100% ${top.toFixed(1)}%,100% ${(top + height).toFixed(1)}%,0% ${(top + height).toFixed(1)}%)`;
					};
					const shakeFrames = Array.from({ length: 9 }, () => ({ transform: `translate3d(${random(-.35, .35).toFixed(3)}%,${random(-.25, .25).toFixed(3)}%,0)` }));
					this.frameAnimation = frame.animate(shakeFrames, {
						duration,
						easing: "steps(9, jump-start)",
						fill: "none"
					});
					const capturedFrame = this.cloneFrame(frame);
					const addSlice = (slice, layer) => {
						layer.setAttribute("data-dsh-transition-layer", "slice");
						if (firstBar) overlay.insertBefore(layer, firstBar);
						else overlay.appendChild(layer);
						const keyframes = Array.from({ length: 8 }, (_, index) => {
							if (index === 7 || Math.random() > .5) return { opacity: 0 };
							return {
								opacity: 1,
								clipPath: band(),
								transform: `translate3d(${random(-8, 8).toFixed(2)}%,0,0)`
							};
						});
						layer.animate(keyframes, {
							duration,
							easing: "steps(8, jump-start)",
							fill: "forwards"
						});
					};
					let firstBar = null;
					addSlice(0, capturedFrame);
					const addDeferredSlices = () => {
						this.sliceFrame = null;
						if (this.overlay !== overlay) return;
						for (let slice = 1; slice < 3; slice += 1) addSlice(slice, this.cloneFrame(capturedFrame));
					};
					if (typeof requestAnimationFrame === "function") this.sliceFrame = requestAnimationFrame(addDeferredSlices);
					else addDeferredSlices();
					const colors = [
						"#38bdf8",
						"#ff2bd6",
						"#ff3b30",
						"#2bd97c",
						"#4d7cff",
						"#f5f7fa",
						"#ffe94a"
					];
					for (let index = 0; index < 4; index += 1) {
						const bar = document.createElement("div");
						if (!firstBar) firstBar = bar;
						bar.setAttribute("data-dsh-transition-layer", "bar");
						bar.style.top = `${random(0, 88).toFixed(1)}%`;
						bar.style.left = "-5%";
						bar.style.width = "110%";
						bar.style.height = `${random(2, 11).toFixed(1)}%`;
						bar.style.background = colors[Math.floor(Math.random() * colors.length)];
						overlay.appendChild(bar);
						const keyframes = Array.from({ length: 7 }, (_, step) => step === 6 || Math.random() < .25 ? { opacity: 0 } : {
							opacity: random(.3, .75).toFixed(2),
							transform: `translate3d(${random(-11, 11).toFixed(1)}%,0,0)`
						});
						bar.animate(keyframes, {
							duration,
							easing: "steps(7, jump-start)",
							fill: "forwards"
						});
					}
					const background = document.createElement("div");
					background.setAttribute("data-dsh-transition-layer", "background");
					background.style.background = oldBackground;
					overlay.appendChild(background);
					const backgroundFrames = Array.from({ length: 9 }, (_, index) => index === 8 ? { opacity: 0 } : {
						opacity: random(.12, .32).toFixed(2),
						clipPath: Math.random() < .5 ? band() : "none"
					});
					background.animate(backgroundFrames, {
						duration,
						easing: "steps(9, jump-start)",
						fill: "forwards"
					});
					this.cleanupTimer = setTimeout(this.cleanup, 470);
					diagnostics.metric("transition.mode.capture", startedAt, { source_mode: overlay.getAttribute("data-from-mode") });
				}
				dispose() {
					this.cleanup();
				}
			}
			class SessionTransition {
				constructor() {
					_defineProperty(this, "cleanup", () => {
						if (this.cleanupTimer !== null) clearTimeout(this.cleanupTimer);
						this.cleanupTimer = null;
						this.animations.forEach((animation) => animation?.cancel?.());
						this.animations = [];
						if (this.sliceFrame !== null) cancelAnimationFrame(this.sliceFrame);
						this.sliceFrame = null;
						this.overlay?.remove();
						this.overlay = null;
					});
					this.overlay = null;
					this.cleanupTimer = null;
					this.animations = [];
					this.sliceFrame = null;
				}
				cloneFrame(frame) {
					return cloneTransitionFrame(frame);
				}
				resolveRegion() {
					const frame = rootSlot(document)?.firstElementChild || null;
					const surface = conversation?.(document);
					const regionSurface = anyPhase?.(surface) || surface;
					const composer = composerCard?.(composerSeat?.(surface));
					if (!frame || !surface || !regionSurface || !composer || typeof frame.animate !== "function") return null;
					const frameRect = frame.getBoundingClientRect();
					const surfaceRect = regionSurface.getBoundingClientRect();
					const composerRect = composer.getBoundingClientRect();
					const width = window.innerWidth || document.documentElement.clientWidth;
					const height = window.innerHeight || document.documentElement.clientHeight;
					const bottomEdge = Math.min(surfaceRect.bottom, Math.max(surfaceRect.top, composerRect.top));
					const top = Math.max(0, surfaceRect.top);
					const right = Math.max(0, width - surfaceRect.right);
					const bottom = Math.max(0, height - bottomEdge);
					const left = Math.max(0, surfaceRect.left);
					if (frameRect.width < 1 || frameRect.height < 1 || width < 1 || height < 1 || width - left - right < 1 || height - top - bottom < 1) return null;
					return {
						frame,
						clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px)`
					};
				}
				animate(node, keyframes, options) {
					const animation = node.animate(keyframes, options);
					this.animations.push(animation);
					return animation;
				}
				trigger() {
					const startedAt = diagnostics.start();
					if (!document.body || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
					const region = this.resolveRegion();
					if (!region) return;
					this.cleanup();
					const duration = 420;
					const overlay = document.createElement("div");
					overlay.className = "dsh-hdd-session-transition";
					overlay.setAttribute("aria-hidden", "true");
					const clippedRegion = document.createElement("div");
					clippedRegion.setAttribute("data-dsh-session-transition-region", "");
					clippedRegion.style.cssText = `position:absolute;inset:0;overflow:hidden;pointer-events:none;clip-path:${region.clipPath};-webkit-clip-path:${region.clipPath};`;
					overlay.appendChild(clippedRegion);
					ensureFairyContainer().appendChild(overlay);
					this.overlay = overlay;
					const random = (min, max) => min + Math.random() * (max - min);
					const band = () => {
						const top = random(0, 82);
						const height = random(2, 13);
						return `polygon(0% ${top.toFixed(1)}%,100% ${top.toFixed(1)}%,100% ${(top + height).toFixed(1)}%,0% ${(top + height).toFixed(1)}%)`;
					};
					const base = this.cloneFrame(region.frame);
					clippedRegion.appendChild(base);
					const baseFrames = Array.from({ length: 9 }, (_, index) => index === 8 ? { opacity: 0 } : {
						opacity: 1,
						transform: `translate3d(${random(-.35, .35).toFixed(3)}%,${random(-.25, .25).toFixed(3)}%,0)`
					});
					this.animate(base, baseFrames, {
						duration,
						easing: "steps(9, jump-start)",
						fill: "forwards"
					});
					const addSlices = () => {
						this.sliceFrame = null;
						if (this.overlay !== overlay) return;
						for (let slice = 0; slice < 3; slice += 1) {
							const layer = this.cloneFrame(base);
							layer.setAttribute("data-dsh-transition-layer", "slice");
							clippedRegion.appendChild(layer);
							const keyframes = Array.from({ length: 8 }, (_, index) => {
								if (index === 7 || Math.random() > .5) return { opacity: 0 };
								return {
									opacity: 1,
									clipPath: band(),
									transform: `translate3d(${random(-8, 8).toFixed(2)}%,0,0)`
								};
							});
							this.animate(layer, keyframes, {
								duration,
								easing: "steps(8, jump-start)",
								fill: "forwards"
							});
						}
					};
					if (typeof requestAnimationFrame === "function") this.sliceFrame = requestAnimationFrame(addSlices);
					else addSlices();
					this.cleanupTimer = setTimeout(this.cleanup, 470);
					diagnostics.metric("transition.session.capture", startedAt, {});
				}
				dispose() {
					this.cleanup();
				}
			}
			class ThemeTransition {
				constructor(frameTransition) {
					this.frameTransition = frameTransition;
					this.current = null;
					this.overlay = null;
					this.animation = null;
				}
				run(update) {
					const startedAt = diagnostics.start();
					const root = document.documentElement;
					if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return update();
					this.cleanup();
					if (typeof document.startViewTransition !== "function") return this.runFallback(update);
					root.setAttribute("data-dsh-fairy-theme-transition", "");
					let transition;
					try {
						transition = document.startViewTransition(() => Promise.resolve(update()));
					} catch {
						root.removeAttribute("data-dsh-fairy-theme-transition");
						return update();
					}
					this.current = transition;
					settleVisualTransition(transition.finished, "view transition").finally(() => {
						diagnostics.metric("transition.theme", startedAt, { implementation: "view-transition" });
						if (this.current !== transition) return;
						this.current = null;
						root.removeAttribute("data-dsh-fairy-theme-transition");
					});
					return transition.updateCallbackDone;
				}
				runFallback(update) {
					const frame = this.frameTransition.resolveFrame();
					if (!document.body || !frame || typeof frame.animate !== "function") return update();
					const overlay = document.createElement("div");
					overlay.className = "dsh-fairy-theme-fade-transition";
					overlay.setAttribute("aria-hidden", "true");
					overlay.style.background = getComputedStyle(document.body).backgroundColor;
					overlay.appendChild(this.frameTransition.cloneFrame(frame));
					ensureFairyContainer().appendChild(overlay);
					this.overlay = overlay;
					let result;
					try {
						result = Promise.resolve(update());
					} catch (error) {
						this.cleanup();
						throw error;
					}
					return result.then((value) => {
						if (this.overlay !== overlay) return value;
						const animation = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
							duration: THEME_TRANSITION_DURATION_MS,
							easing: "cubic-bezier(.22,1,.36,1)",
							fill: "forwards"
						});
						this.animation = animation;
						settleVisualTransition(animation.finished, "theme fade").finally(() => {
							if (this.overlay === overlay) this.cleanup();
						});
						return value;
					}, (error) => {
						if (this.overlay === overlay) this.cleanup();
						throw error;
					});
				}
				cleanup() {
					this.current?.skipTransition?.();
					this.current = null;
					this.animation?.cancel?.();
					this.animation = null;
					this.overlay?.remove();
					this.overlay = null;
					document.documentElement.removeAttribute("data-dsh-fairy-theme-transition");
				}
				dispose() {
					this.cleanup();
				}
			}
			return {
				createModeTransition: () => new ModeTransition(),
				createSessionTransition: () => new SessionTransition(),
				createThemeTransition: (frameTransition) => new ThemeTransition(frameTransition),
				removeFairyContainer
			};
		}
		module.exports = { createVisualTransitions };
	}));

//#endregion
//#region src/client/index.js
	var require_client = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		init_defineProperty();
		const React = require("react");
		const { jsx, jsxs } = require("react/jsx-runtime");
		const { createFairyDiagnostics } = require_client_diagnostics();
		const { SETTINGS_NAMESPACE, STYLE_ID, MODE_ATTR, POWER_MODE_ATTR, THEME_ATTR, POWER_TOGGLE_WIDTH, POWER_TOGGLE_HEIGHT, DEFAULT } = (init_constants(), __toCommonJS(constants_exports));
		const IDENTITY_SETTINGS_NAMESPACE = "fairy-identity";
		const { deriveSessionActivity, syncDocumentMode } = (init_utils(), __toCommonJS(utils_exports));
		const { injectStyles } = (init_style(), __toCommonJS(style_exports));
		const { mountComposerDock } = require_composer_dock();
		const { createLifecycleScope, claimSingleton } = require_lifecycle();
		const { createManagedMutationObserver, getDomObserverManager } = require_dom_observer_manager();
		const { createMascotRuntime } = require_mascot_runtime();
		const semanticMarkersManager = require_semantic_markers_manager();
		const sidebarGeometryManager = require_sidebar_geometry_manager();
		const scrollbarsManager = require_scrollbars_manager();
		const heroProjectionManager = require_hero_projection_manager();
		const { ownControllerLifecycle, disposeControllerLifecycle } = require_controller_lifecycle();
		const { claimStageGeometryLifecycle } = require_stage_lifecycle();
		const { claimContentFadeLifecycle } = require_content_fade();
		const { claimMascotLifecycle } = require_mascot_lifecycle();
		const { claimBrandSidebarGeometry } = require_brand_sidebar_geometry();
		const { claimPowerModeGeometry } = require_power_mode();
		const { createSelectionGuard } = require_selection_guard();
		const { scheduleMascotScale, MASCOT_GEOMETRY_EVENT } = require_mascot_scale_control();
		const { saveControllerSetting } = require_settings_write();
		const { mutationTouchesSurface } = require_surface_utils();
		const { migrateVisualSettings, normalizeSetting } = require_settings_normalizer();
		const { createVisualTransitions } = require_visual_transitions();
		const { OFFICIAL_SELECTORS, OFFICIAL_ATTRIBUTES, rootSlot, sidebar, conversation, conversationScroll, anyPhase, composerSeat, composerCard, conversationComposerDock, chatFlows, balanceAction, sidebarResizeHandle, reportMissingCapabilities } = require_dom_adapter();
		const visualTransitions = createVisualTransitions({
			rootSlot,
			modeAttr: MODE_ATTR,
			conversation,
			anyPhase,
			composerSeat,
			composerCard
		});
		const mascotRuntime = createMascotRuntime();
		const diagnostics = createFairyDiagnostics("dsh-fairy-visual");
		var Controller = class {
			constructor(settings, sessions) {
				_defineProperty(this, "subscribe", (listener) => {
					this.listeners.add(listener);
					return () => this.listeners.delete(listener);
				});
				_defineProperty(this, "getSnapshot", () => this.state);
				this.settings = settings;
				this.sessions = sessions;
				this.modeTransition = visualTransitions.createModeTransition();
				this.sessionTransition = visualTransitions.createSessionTransition();
				this.themeTransition = visualTransitions.createThemeTransition(this.modeTransition);
				this.listeners = /* @__PURE__ */ new Set();
				this.session = null;
				this.boundSessionId = void 0;
				this.hasBoundSession = false;
				this.state = {
					settings: migrateVisualSettings({
						...DEFAULT,
						...settings.getSnapshot().value || {}
					}),
					activity: "normal",
					lifecycle: "idle",
					sessionId: void 0
				};
				this.lastGoodSettings = this.state.settings;
				this.listOff = sessions.list.subscribe(() => this.bind());
				this.settingsOff = settings.subscribe(() => {
					const next = settings.getSnapshot();
					const normalized = migrateVisualSettings({
						...DEFAULT,
						...next.value || {}
					});
					syncDocumentMode({
						...next,
						value: normalized
					});
					this.state = {
						...this.state,
						settings: normalized
					};
					this.lastGoodSettings = normalized;
					this.emit();
				});
				this.lifecycle = ownControllerLifecycle(this);
				this.bind();
			}
			emit() {
				this.listeners.forEach((listener) => listener());
			}
			bind() {
				const id = this.sessions.list.getSnapshot().current;
				const next = id == null ? null : this.sessions.binding(id)?.session || null;
				if (this.hasBoundSession && id !== this.boundSessionId && this.state.settings.enabled) this.sessionTransition.trigger();
				this.boundSessionId = id;
				this.hasBoundSession = true;
				if (next === this.session) return this.update();
				this.sessionOff?.();
				this.session = next;
				this.sessionOff = next?.subscribe(() => this.update()) || null;
				this.update();
			}
			update() {
				const snap = this.session?.getSnapshot?.();
				let activity = "normal";
				let lifecycle = "idle";
				const sessionId = this.session?.sessionId;
				if (snap) {
					lifecycle = snap.running ? "running" : snap.blank ? "idle" : "completed";
					activity = deriveSessionActivity(snap);
				}
				if (this.state.activity === activity && this.state.lifecycle === lifecycle && this.state.sessionId === sessionId) return;
				this.state = {
					...this.state,
					activity,
					lifecycle,
					sessionId
				};
				this.emit();
			}
			set(field, value) {
				const normalized = normalizeSetting(field, value, this.state.settings);
				if (field === "enabled" && normalized !== this.state.settings.enabled) this.modeTransition.trigger();
				const write = () => this.settings.set(field, normalized);
				return Promise.resolve().then(() => field === "theme" && normalized !== this.state.settings.theme ? this.themeTransition.run(write) : write()).catch((error) => {
					this.state = {
						...this.state,
						settings: this.lastGoodSettings || migrateVisualSettings(DEFAULT)
					};
					this.emit();
					throw error;
				});
			}
			dispose() {
				disposeControllerLifecycle(this.lifecycle);
				mascotRuntime?.dispose?.();
				document.documentElement.removeAttribute("data-dsh-fairy-visual");
				document.documentElement.removeAttribute(MODE_ATTR);
				document.documentElement.removeAttribute(POWER_MODE_ATTR);
				document.documentElement.removeAttribute(THEME_ATTR);
				document.getElementById(STYLE_ID)?.remove();
				visualTransitions.removeFairyContainer();
			}
		};
		const { SidebarBoardCutout } = sidebarGeometryManager.install();
		const { HddOverlayScrollbars } = scrollbarsManager.install();
		function HddBackgroundFxHost({ enabled }) {
			React.useLayoutEffect(() => {
				if (!enabled || !document.body) return void 0;
				const host = document.createElement("div");
				host.className = "dsh-hdd-background-host";
				host.setAttribute("data-dsh-fairy-background-host", "true");
				host.setAttribute("aria-hidden", "true");
				const fx = document.createElement("div");
				fx.className = "dsh-hdd-fx";
				for (const variant of [
					"a",
					"b",
					"c"
				]) {
					const glow = document.createElement("div");
					glow.className = `dsh-hdd-glow dsh-hdd-glow-${variant}`;
					fx.appendChild(glow);
				}
				host.appendChild(fx);
				document.body.insertBefore(host, document.body.firstElementChild);
				return () => host.remove();
			}, [enabled]);
			return null;
		}
		const useController = (controller) => React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
		const save = saveControllerSetting;
		function Toggle({ controller }) {
			const state = useController(controller);
			const on = state.settings.enabled;
			const theme = state.settings.theme === "light" ? "light" : "dark";
			return jsxs("div", {
				className: "dsh-fairy-toggle-group",
				role: "group",
				"aria-label": "H.D.D 视觉控制",
				children: [jsxs("button", {
					type: "button",
					className: "dsh-fairy-toggle",
					"data-on": String(on),
					"aria-pressed": String(on),
					"aria-label": on ? "关闭 H.D.D 视觉" : "启用 H.D.D 视觉",
					onClick: () => save(controller, "enabled", !on),
					children: [jsx("span", { className: "dsh-fairy-dot" }), "H.D.D"]
				}), jsx("button", {
					type: "button",
					className: "dsh-fairy-theme-toggle",
					"data-theme": theme,
					disabled: !on,
					"aria-label": theme === "dark" ? "切换到日间模式" : "切换到夜间模式",
					title: theme === "dark" ? "切换到日间模式" : "切换到夜间模式",
					onClick: () => save(controller, "theme", theme === "dark" ? "light" : "dark"),
					children: jsx("span", {
						className: "dsh-fairy-theme-icon",
						"aria-hidden": "true"
					})
				})]
			});
		}
		const { HeroToggleHost, HeroHost, ActiveComposerPlaceholder } = heroProjectionManager.install(null, {
			Toggle,
			useController
		});
		function FairyMarkEye() {
			return jsxs("span", {
				className: "dsh-fairy-mark-eye",
				"aria-hidden": "true",
				children: [
					"top",
					"right",
					"bottom",
					"left"
				].map((side) => jsx("span", {
					className: "dsh-fairy-mark-brow",
					"data-side": side
				}, side))
			});
		}
		function FairyMarkCopy() {
			return jsxs("span", {
				className: "dsh-fairy-mark-copy",
				children: [jsx("span", {
					className: "dsh-fairy-mark-title",
					children: "Fairy"
				}), jsx("span", {
					className: "dsh-fairy-mark-sub",
					children: "Ⅲ型总序式集成泛用人工智能"
				})]
			});
		}
		function FairyMark({ controller }) {
			const state = useController(controller);
			const on = state.settings.enabled;
			const markRef = React.useRef(null);
			const glitchTimers = React.useRef(/* @__PURE__ */ new Set());
			const glitchToken = React.useRef(0);
			React.useEffect(() => () => {
				glitchToken.current += 1;
				glitchTimers.current.forEach((timer) => clearTimeout(timer));
				glitchTimers.current.clear();
				const mark = markRef.current;
				if (mark) {
					mark.removeAttribute("data-glitch");
					[
						"--dsh-fairy-mark-g-x",
						"--dsh-fairy-mark-thread-x",
						"--dsh-fairy-mark-thread-2-x",
						"--dsh-fairy-mark-thread-3-x",
						"--dsh-fairy-mark-s1-x",
						"--dsh-fairy-mark-s2-x",
						"--dsh-fairy-mark-s3-x"
					].forEach((name) => mark.style.removeProperty(name));
				}
			}, []);
			const clearGlitch = () => {
				glitchTimers.current.forEach((timer) => clearTimeout(timer));
				glitchTimers.current.clear();
				const mark = markRef.current;
				if (!mark) return;
				mark.removeAttribute("data-glitch");
				[
					"--dsh-fairy-mark-g-x",
					"--dsh-fairy-mark-thread-x",
					"--dsh-fairy-mark-thread-2-x",
					"--dsh-fairy-mark-thread-3-x",
					"--dsh-fairy-mark-s1-x",
					"--dsh-fairy-mark-s2-x",
					"--dsh-fairy-mark-s3-x"
				].forEach((name) => mark.style.removeProperty(name));
			};
			const pulseGlitch = (mode) => {
				const mark = markRef.current;
				if (!mark) return;
				const random = (min, max) => min + Math.random() * (max - min);
				const next = { "--dsh-fairy-mark-g-x": `${random(-1.2, 1.2).toFixed(2)}px` };
				if (mode === "blocks") {
					const polarity = Math.random() < .5 ? -1 : 1;
					for (let index = 1; index <= 3; index += 1) {
						const direction = index % 2 === 0 ? polarity : -polarity;
						next[`--dsh-fairy-mark-s${index}-x`] = `${(direction * random(4.2, 6.2)).toFixed(2)}px`;
					}
				} else {
					const offset = random(-9, 9);
					next["--dsh-fairy-mark-thread-x"] = `${offset.toFixed(2)}px`;
					next["--dsh-fairy-mark-thread-2-x"] = `${(-offset * .8).toFixed(2)}px`;
					next["--dsh-fairy-mark-thread-3-x"] = `${(offset * .45).toFixed(2)}px`;
				}
				Object.entries(next).forEach(([name, value]) => mark.style.setProperty(name, value));
				mark.setAttribute("data-glitch", mode);
			};
			const triggerGlitch = () => {
				clearGlitch();
				const token = ++glitchToken.current;
				const schedule = (delay, callback) => {
					const timer = setTimeout(() => {
						glitchTimers.current.delete(timer);
						if (token === glitchToken.current) callback();
					}, delay);
					glitchTimers.current.add(timer);
				};
				[
					["threads", 0],
					["threads", 40],
					["blocks", 68],
					["blocks", 108],
					["threads", 148],
					["threads", 188],
					["threads", 228],
					["threads", 268]
				].forEach(([mode, delay]) => {
					schedule(delay, () => pulseGlitch(mode));
				});
				schedule(296, clearGlitch);
			};
			return jsxs("button", {
				ref: markRef,
				type: "button",
				className: "dsh-fairy-mark",
				"data-enabled": String(on),
				"data-on": String(state.settings.mascotVisible),
				"aria-pressed": String(state.settings.mascotVisible),
				"aria-label": state.settings.mascotVisible ? "隐藏 Fairy 主视觉" : "显示 Fairy 主视觉",
				onPointerDown: (event) => event.stopPropagation(),
				onMouseDown: (event) => event.stopPropagation(),
				onTouchStart: (event) => event.stopPropagation(),
				onClick: (event) => {
					event.preventDefault();
					event.stopPropagation();
					const nextVisible = !state.settings.mascotVisible;
					triggerGlitch();
					save(controller, "mascotVisible", nextVisible);
				},
				children: [
					jsx(FairyMarkEye, {}),
					jsx(FairyMarkCopy, {}),
					...[
						1,
						2,
						3
					].map((index) => jsxs("span", {
						className: "dsh-fairy-mark-glitch-slice",
						"data-slice": String(index),
						"aria-hidden": "true",
						children: [jsx(FairyMarkEye, {}), jsx(FairyMarkCopy, {})]
					}, index))
				]
			});
		}
		const CHAT_SURFACE_SELECTOR = `${OFFICIAL_SELECTORS.chatFlow}, ${OFFICIAL_SELECTORS.conversationScroll}`;
		const STAGE_SURFACE_SELECTOR = OFFICIAL_SELECTORS.conversation;
		const resolveStageSurface = () => anyPhase(conversation(document));
		const hasChatSurfaceMutation = (records) => records.some((record) => record.type === "attributes" && record.target.matches?.(CHAT_SURFACE_SELECTOR) || [...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1 && (node.matches?.(CHAT_SURFACE_SELECTOR) || node.querySelector?.(CHAT_SURFACE_SELECTOR))));
		const hasStageSurfaceMutation = (records) => records.some((record) => [...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1 && (node.matches?.(STAGE_SURFACE_SELECTOR) || node.querySelector?.(STAGE_SURFACE_SELECTOR))));
		function Stage({ state }) {
			const stageRef = React.useRef(null);
			const mascotOwnerRef = React.useRef(null);
			const enabled = state.settings.enabled;
			const visible = enabled && state.settings.mascotVisible;
			const visibleRef = React.useRef(visible);
			const fadeLifecycleRef = React.useRef(null);
			visibleRef.current = visible;
			React.useLayoutEffect(() => {
				const stageNode = stageRef.current;
				if (!stageNode) return;
				const owner = {
					stage: stageNode,
					active: true
				};
				mascotOwnerRef.current = owner;
				const lifecycle = claimMascotLifecycle(stageNode);
				lifecycle.add(() => {
					owner.active = false;
					if (mascotOwnerRef.current === owner) mascotOwnerRef.current = null;
					mascotRuntime?.dispose?.(owner);
				}, "mascot-runtime:owner-dispose");
				return () => lifecycle.dispose();
			}, []);
			React.useEffect(() => {
				const stageNode = stageRef.current;
				if (!stageNode) return;
				const owner = mascotOwnerRef.current;
				if (!owner?.active) return;
				stageNode.setAttribute("data-fairy-visual-active", visible ? "true" : "false");
				stageNode.setAttribute("data-fairy-state", state.activity);
				if (state.settings.powerMode === "low-power") stageNode.setAttribute("data-fairy-low-power", "true");
				else stageNode.removeAttribute("data-fairy-low-power");
				const mascot = mascotRuntime;
				mascot?.mount?.(stageNode, owner, state.settings.mascotAnimationSpeed);
				mascot?.setVisualActive?.(visible, owner);
			}, [
				visible,
				state.activity,
				state.settings.powerMode,
				state.settings.mascotAnimationSpeed
			]);
			React.useLayoutEffect(() => {
				if (!enabled) return void 0;
				return scheduleMascotScale(state.settings.mascotScale);
			}, [enabled, state.settings.mascotScale]);
			React.useEffect(() => {
				if (!enabled) return;
				const stageNode = stageRef.current;
				if (!stageNode) return;
				const lifecycle = claimStageGeometryLifecycle(stageNode);
				let surface = null;
				let resizeObserver = null;
				let structureObserver = null;
				const syncStageGeometry = () => {
					const rect = surface?.getBoundingClientRect();
					if (!rect || rect.width < 240 || rect.height < 1) return;
					stageNode.style.left = Math.round(rect.left) + "px";
					stageNode.style.width = Math.round(rect.width) + "px";
				};
				const scheduleStageGeometry = () => {
					if (!lifecycle.disposed) lifecycle.scheduleFrame("stage-geometry-sync", syncStageGeometry, "stage-geometry:sync-frame");
				};
				const bindSurface = () => {
					const nextSurface = resolveStageSurface();
					if (nextSurface === surface) return;
					lifecycle.replaceBinding("stage-surface", () => resizeObserver?.disconnect(), "stage-geometry:surface-resize-observer");
					resizeObserver?.disconnect();
					surface = nextSurface;
					if (typeof ResizeObserver === "function" && surface) {
						resizeObserver = new ResizeObserver(scheduleStageGeometry);
						resizeObserver.observe(surface);
					}
					scheduleStageGeometry();
				};
				const scheduleSurfaceBind = () => {
					if (!lifecycle.disposed) lifecycle.scheduleFrame("stage-surface-bind", bindSurface, "stage-geometry:bind-surface-frame");
				};
				bindSurface();
				if (typeof MutationObserver === "function" && document.body) {
					structureObserver = createManagedMutationObserver((records) => {
						if (hasStageSurfaceMutation(records)) scheduleSurfaceBind();
					});
					structureObserver.observe(document.body, {
						childList: true,
						subtree: true
					});
				}
				window.addEventListener("resize", scheduleStageGeometry, { passive: true });
				const cleanup = () => {
					resizeObserver?.disconnect();
					structureObserver?.disconnect();
					window.removeEventListener("resize", scheduleStageGeometry);
					stageNode.style.removeProperty("left");
					stageNode.style.removeProperty("width");
				};
				lifecycle.add(cleanup, "stage-geometry:restore-surface");
				return () => lifecycle.dispose();
			}, [enabled, state.sessionId]);
			React.useEffect(() => {
				if (!enabled) return;
				const stageNode = stageRef.current;
				if (!stageNode) return;
				const lifecycle = claimContentFadeLifecycle(stageNode);
				let revealFrame = 0;
				let resizeObserver = null;
				let structureObserver = null;
				let cleanupTimer = 0;
				let observedEye = null;
				let observedSurface = null;
				let surface = null;
				const cancelFrames = () => {
					if (revealFrame) cancelAnimationFrame(revealFrame);
					revealFrame = 0;
				};
				const cancelCleanup = () => {
					if (!cleanupTimer) return;
					clearTimeout(cleanupTimer);
					cleanupTimer = 0;
				};
				const restoreSurface = () => {
					if (!surface) return;
					surface.classList.remove("dsh-fairy-content-mask", "dsh-fairy-content-fade");
					[
						"--dsh-fade-x",
						"--dsh-fade-y",
						"--dsh-fade-rx",
						"--dsh-fade-ry",
						"--dsh-fade-core",
						"--dsh-fade-soft-1",
						"--dsh-fade-soft-2",
						"--dsh-fade-soft-3"
					].forEach((name) => surface.style.removeProperty(name));
					surface = null;
				};
				const clearContentFade = (delayed = false) => {
					cancelFrames();
					surface?.classList.remove("dsh-fairy-content-fade");
					if (!delayed) {
						cancelCleanup();
						restoreSurface();
						return;
					}
					if (cleanupTimer) return;
					cleanupTimer = window.setTimeout(() => {
						cleanupTimer = 0;
						if (!visibleRef.current) restoreSurface();
					}, 360);
				};
				const scheduleContentFade = () => {
					if (!lifecycle.disposed) lifecycle.scheduleFrame("content-fade-sync", applyContentFade, "content-fade:sync-frame");
				};
				const asFadePercent = (ratio) => Math.round(ratio * 1e3) / 10 + "%";
				const applyContentFade = () => {
					const eye = stageNode.querySelector("#dsh-fairy-root");
					const nextSurface = chatFlows(document)[0] || conversationScroll(conversation(document));
					if (!visibleRef.current) return clearContentFade(true);
					if (!eye || !nextSurface) return clearContentFade();
					if (!chatFlows(document).some((flow) => {
						const rect = flow.getBoundingClientRect();
						return flow.isConnected && rect.width > 0 && rect.height > 0;
					})) return clearContentFade();
					cancelCleanup();
					if (surface !== nextSurface) {
						restoreSurface();
						surface = nextSurface;
						surface.classList.add("dsh-fairy-content-mask");
					}
					const eyeBoundary = eye.querySelector(".dsh-fairy-outer-disc") || eye;
					const eyeRect = eyeBoundary.getBoundingClientRect();
					const eyeX = eyeRect.left + eyeRect.width * .5;
					const eyeY = eyeRect.top + eyeRect.height * .5;
					const surfaceRect = surface.getBoundingClientRect();
					const fadeFeatherX = Math.max(56, Math.min(76, eyeRect.width * .24));
					const fadeFeatherY = Math.max(46, Math.min(64, eyeRect.height * .2));
					const fadeRadiusX = Math.round(eyeRect.width * .5 + fadeFeatherX);
					const fadeRadiusY = Math.round(eyeRect.height * .5 + fadeFeatherY);
					const eyeBoundaryRatio = Math.min(.88, Math.max(eyeRect.width * .5 / fadeRadiusX, eyeRect.height * .5 / fadeRadiusY));
					const featherRatio = 1 - eyeBoundaryRatio;
					surface.style.setProperty("--dsh-fade-x", Math.round(eyeX - surfaceRect.left) + "px");
					surface.style.setProperty("--dsh-fade-y", Math.round(eyeY - surfaceRect.top) + "px");
					surface.style.setProperty("--dsh-fade-rx", fadeRadiusX + "px");
					surface.style.setProperty("--dsh-fade-ry", fadeRadiusY + "px");
					surface.style.setProperty("--dsh-fade-core", asFadePercent(eyeBoundaryRatio));
					surface.style.setProperty("--dsh-fade-soft-1", asFadePercent(eyeBoundaryRatio + featherRatio * .28));
					surface.style.setProperty("--dsh-fade-soft-2", asFadePercent(eyeBoundaryRatio + featherRatio * .58));
					surface.style.setProperty("--dsh-fade-soft-3", asFadePercent(eyeBoundaryRatio + featherRatio * .84));
					if (revealFrame) cancelAnimationFrame(revealFrame);
					revealFrame = requestAnimationFrame(() => {
						revealFrame = 0;
						if (visibleRef.current && surface?.isConnected) surface.classList.add("dsh-fairy-content-fade");
					});
					if (resizeObserver && (observedEye !== eyeBoundary || observedSurface !== surface)) {
						resizeObserver.disconnect();
						observedEye = eyeBoundary;
						observedSurface = surface;
						resizeObserver.observe(eyeBoundary);
						resizeObserver.observe(surface);
					}
				};
				if (typeof ResizeObserver === "function") resizeObserver = new ResizeObserver(scheduleContentFade);
				if (typeof MutationObserver === "function" && document.body) {
					structureObserver = createManagedMutationObserver((records) => {
						if (hasChatSurfaceMutation(records)) scheduleContentFade();
					});
					structureObserver.observe(document.body, {
						childList: true,
						subtree: true,
						attributes: true,
						attributeFilter: [OFFICIAL_ATTRIBUTES.chatFlow, OFFICIAL_ATTRIBUTES.conversationScroll]
					});
				}
				window.addEventListener("resize", scheduleContentFade, { passive: true });
				window.addEventListener(MASCOT_GEOMETRY_EVENT, scheduleContentFade, { passive: true });
				fadeLifecycleRef.current = (nextVisible) => {
					if (nextVisible) {
						cancelCleanup();
						scheduleContentFade();
					} else clearContentFade(true);
				};
				scheduleContentFade();
				const cleanup = () => {
					fadeLifecycleRef.current = null;
					cancelFrames();
					resizeObserver?.disconnect();
					structureObserver?.disconnect();
					if (cleanupTimer) clearTimeout(cleanupTimer);
					restoreSurface();
					window.removeEventListener("resize", scheduleContentFade);
					window.removeEventListener(MASCOT_GEOMETRY_EVENT, scheduleContentFade);
				};
				lifecycle.add(cleanup, "content-fade:restore-surface");
				return () => lifecycle.dispose();
			}, [enabled, state.sessionId]);
			React.useEffect(() => {
				fadeLifecycleRef.current?.(visible);
			}, [visible]);
			return jsx("div", {
				ref: stageRef,
				className: "dsh-fairy-root dsh-fairy-stage",
				hidden: !enabled,
				"data-visible": String(visible),
				"data-fairy-visual-active": visible ? "true" : "false",
				"data-fairy-state": state.activity,
				"data-fairy-low-power": state.settings.powerMode === "low-power" ? "true" : void 0,
				"aria-hidden": "true"
			});
		}
		function StageHost({ controller }) {
			const state = useController(controller);
			React.useLayoutEffect(() => {
				const lifecycle = claimSingleton(document, "stage-host", createLifecycleScope("stage-host"));
				injectStyles();
				lifecycle.add(semanticMarkersManager.install(), "stage-host:semantic-markers");
				lifecycle.add(mountComposerDock(controller), "stage-host:composer-dock");
				return () => lifecycle.dispose();
			}, [controller]);
			return jsxs(React.Fragment, { children: [
				jsx(HddBackgroundFxHost, { enabled: state.settings.enabled }),
				jsx(SidebarBoardCutout, { enabled: state.settings.enabled }),
				jsx(HddOverlayScrollbars, { enabled: state.settings.enabled }),
				jsx(Stage, { state }),
				jsx(HeroHost, { controller }),
				jsx(ActiveComposerPlaceholder, { controller }),
				jsx(HeroToggleHost, { controller }),
				jsx(BrandHost, { controller }),
				jsx(PowerHost, { controller })
			] });
		}
		function BrandHost({ controller }) {
			const state = useController(controller);
			const hostRef = React.useRef(null);
			const enabled = state.settings.enabled;
			const [positioned, setPositioned] = React.useState(false);
			React.useEffect(() => {
				const host = hostRef.current;
				if (!host || !enabled) {
					setPositioned(false);
					return;
				}
				const lifecycle = claimBrandSidebarGeometry(host);
				let brand = null;
				let resizeObserver = null;
				let structureObserver = null;
				const syncBrandGeometry = () => {
					const next = sidebar(document)?.querySelector("[data-dsh-fairy-brand-anchor=\"true\"]") || null;
					if (next !== brand) {
						lifecycle.replaceBinding("brand-node", () => resizeObserver?.disconnect(), "brand-geometry:node-resize-observer");
						resizeObserver?.disconnect();
						brand = next;
						if (typeof ResizeObserver === "function" && brand) {
							resizeObserver = new ResizeObserver(scheduleBrandGeometry);
							resizeObserver.observe(brand);
							if (brand.parentElement) resizeObserver.observe(brand.parentElement);
						}
					}
					if (!brand) {
						setPositioned(false);
						return;
					}
					const rect = brand.getBoundingClientRect();
					if (rect.width < 1 || rect.height < 1) {
						setPositioned(false);
						return;
					}
					host.style.left = Math.round(rect.left) + "px";
					host.style.top = Math.round(rect.top + rect.height * .5 - 21) + "px";
					setPositioned(true);
				};
				const scheduleBrandGeometry = () => {
					if (!lifecycle.disposed) lifecycle.scheduleFrame("brand-geometry-sync", syncBrandGeometry, "brand-geometry:sync-frame");
				};
				syncBrandGeometry();
				if (typeof MutationObserver === "function" && document.body) {
					structureObserver = createManagedMutationObserver((records) => {
						if (mutationTouchesSurface(records, `${OFFICIAL_SELECTORS.sidebar}, ${OFFICIAL_SELECTORS.sidebarBrandMark}, ${OFFICIAL_SELECTORS.newSession}`, ["aria-label", "data-dsh-fairy-brand-anchor"])) scheduleBrandGeometry();
					});
					structureObserver.observe(document.body, {
						childList: true,
						subtree: true,
						attributes: true,
						attributeFilter: ["aria-label", "data-dsh-fairy-brand-anchor"]
					});
				}
				window.addEventListener("resize", scheduleBrandGeometry, { passive: true });
				const cleanup = () => {
					resizeObserver?.disconnect();
					structureObserver?.disconnect();
					window.removeEventListener("resize", scheduleBrandGeometry);
					host.style.removeProperty("left");
					host.style.removeProperty("top");
				};
				lifecycle.add(cleanup, "brand-geometry:restore-host");
				return () => lifecycle.dispose();
			}, [enabled]);
			return jsx("div", {
				ref: hostRef,
				className: "dsh-fairy-brand-host",
				"data-positioned": String(positioned),
				hidden: !enabled || !positioned,
				children: jsx(FairyMark, { controller })
			});
		}
		function PowerToggle({ controller }) {
			const on = useController(controller).settings.powerMode === "low-power";
			return jsxs("button", {
				type: "button",
				className: "dsh-fairy-power-toggle",
				"data-on": String(on),
				"aria-pressed": String(on),
				"aria-label": on ? "关闭省电模式" : "开启省电模式",
				onClick: () => save(controller, "powerMode", on ? "normal" : "low-power"),
				children: [jsx("span", { className: "dsh-fairy-power-dot" }), on ? "省电模式" : "普通模式"]
			});
		}
		function PowerHost({ controller }) {
			const state = useController(controller);
			const hostRef = React.useRef(null);
			const [positioned, setPositioned] = React.useState(false);
			const enabled = state.settings.enabled;
			React.useLayoutEffect(() => {
				const host = hostRef.current;
				if (!host || !enabled) {
					setPositioned(false);
					return;
				}
				const lifecycle = claimPowerModeGeometry(host);
				let balance = null;
				let conversation = null;
				let resizeObserver = null;
				let structureObserver = null;
				const syncPowerGeometry = () => {
					const nextBalance = balanceAction(document);
					const nextConversation = resolveStageSurface();
					if (nextBalance !== balance || nextConversation !== conversation) {
						resizeObserver?.disconnect();
						balance = nextBalance;
						conversation = nextConversation;
						if (typeof ResizeObserver === "function") {
							resizeObserver = new ResizeObserver(schedulePowerGeometry);
							if (balance) resizeObserver.observe(balance);
							if (conversation) resizeObserver.observe(conversation);
						}
					}
					if (!balance || !conversation) return setPositioned(false);
					const balanceRect = balance.getBoundingClientRect();
					const conversationRect = conversation.getBoundingClientRect();
					const dailyRow = balance.children[1];
					const amountRow = balance.children[2];
					if (!dailyRow || !amountRow) return setPositioned(false);
					const rectUnion = (nodes) => {
						const rects = nodes.map((node) => node?.getBoundingClientRect()).filter((rect) => rect && rect.width > 0 && rect.height > 0);
						if (!rects.length) return null;
						const left = Math.min(...rects.map((rect) => rect.left));
						const top = Math.min(...rects.map((rect) => rect.top));
						const right = Math.max(...rects.map((rect) => rect.right));
						const bottom = Math.max(...rects.map((rect) => rect.bottom));
						return {
							left,
							top,
							right,
							bottom,
							width: right - left,
							height: bottom - top
						};
					};
					const dailyRect = rectUnion([...dailyRow.children]) || rectUnion([dailyRow]);
					const amountRect = amountRow.getBoundingClientRect();
					if (!dailyRect || amountRect.width <= 0 || amountRect.height <= 0) return setPositioned(false);
					const left = Math.round(dailyRect.left + (dailyRect.width - POWER_TOGGLE_WIDTH) / 2);
					const top = Math.round(amountRect.top + (amountRect.height - POWER_TOGGLE_HEIGHT) / 2);
					if (!(balanceRect.width >= 180 && left >= balanceRect.left + 8 && left + POWER_TOGGLE_WIDTH <= balanceRect.right - 4 && left + POWER_TOGGLE_WIDTH <= conversationRect.left - 4 && top >= balanceRect.top + 4 && top + POWER_TOGGLE_HEIGHT <= balanceRect.bottom - 4) || balanceRect.height < 26) return setPositioned(false);
					host.style.left = left + "px";
					host.style.top = top + "px";
					setPositioned(true);
				};
				const schedulePowerGeometry = () => {
					if (!lifecycle.disposed) lifecycle.scheduleFrame("power-geometry-sync", syncPowerGeometry, "power-geometry:sync-frame");
				};
				syncPowerGeometry();
				if (typeof MutationObserver === "function" && document.body) {
					structureObserver = createManagedMutationObserver((records) => {
						if (mutationTouchesSurface(records, `${OFFICIAL_SELECTORS.sidebar}, ${OFFICIAL_SELECTORS.conversation}, ${OFFICIAL_SELECTORS.balance}`)) schedulePowerGeometry();
					});
					structureObserver.observe(document.body, {
						childList: true,
						subtree: true
					});
				}
				window.addEventListener("resize", schedulePowerGeometry, { passive: true });
				const cleanup = () => {
					resizeObserver?.disconnect();
					structureObserver?.disconnect();
					window.removeEventListener("resize", schedulePowerGeometry);
					host.style.removeProperty("left");
					host.style.removeProperty("top");
				};
				lifecycle.add(cleanup, "power-geometry:restore-host");
				return () => lifecycle.dispose();
			}, [enabled]);
			return jsx("div", {
				ref: hostRef,
				className: "dsh-fairy-power-host",
				hidden: !enabled || !positioned,
				children: jsx(PowerToggle, { controller })
			});
		}
		function useHddVisualMode() {
			const readMode = () => document.documentElement?.hasAttribute("data-dsh-fairy-visual") === true;
			const observerManager = getDomObserverManager(document);
			React.useEffect(() => {
				if (readMode()) observerManager.resume();
				else observerManager.suspend();
			});
			return React.useSyncExternalStore((notify) => {
				if (typeof MutationObserver !== "function" || !document.documentElement) return () => {};
				const observer = createManagedMutationObserver(notify);
				observer.observe(document.documentElement, {
					attributes: true,
					attributeFilter: ["data-dsh-fairy-visual"]
				});
				return () => observer.disconnect();
			}, readMode, readMode);
		}
		function SessionMetricsControl() {
			const [open, setOpen] = React.useState(false);
			const [, setRevision] = React.useState(0);
			const buttonRef = React.useRef(null);
			const panelRef = React.useRef(null);
			const hdd = useHddVisualMode();
			const readStats = () => conversationComposerDock()?.textContent?.trim().replace(/\s+/g, " ") || "";
			const statItems = readStats().split(/\s*\|\s*/).map((item) => item.trim()).filter(Boolean);
			React.useEffect(() => {
				if (!hdd) return void 0;
				const source = conversationComposerDock();
				if (!source || typeof MutationObserver !== "function") return void 0;
				const observer = createManagedMutationObserver(() => setRevision((value) => value + 1));
				observer.observe(source, {
					childList: true,
					subtree: true,
					characterData: true
				});
				return () => observer.disconnect();
			}, [hdd]);
			React.useEffect(() => {
				if (!open) return void 0;
				const onPointerDown = (event) => {
					if (buttonRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return;
					setOpen(false);
				};
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						setOpen(false);
						buttonRef.current?.focus();
					}
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [open]);
			if (!hdd) return null;
			const panelId = "dsh-fairy-session-metrics-panel";
			return jsxs("span", {
				className: "dsh-fairy-session-metrics",
				children: [jsx("button", {
					ref: buttonRef,
					type: "button",
					className: "dsh-fairy-session-metrics-button",
					"aria-expanded": open,
					"aria-controls": panelId,
					onClick: () => setOpen((value) => !value),
					children: "统计"
				}), open ? jsx("div", {
					ref: panelRef,
					id: panelId,
					className: "dsh-fairy-session-metrics-panel",
					role: "dialog",
					"aria-label": "会话统计",
					children: statItems.length ? statItems.map((item, index) => jsx("div", {
						className: "dsh-fairy-session-metrics-item",
						children: item
					}, `${index}:${item}`)) : "暂无会话统计"
				}) : null]
			});
		}
		function Settings({ controller, identitySettings }) {
			const state = useController(controller);
			const readIdentity = () => identitySettings.getSnapshot()?.value || {};
			const [identityValue, setIdentityValue] = React.useState(readIdentity);
			React.useEffect(() => {
				const refresh = () => setIdentityValue(readIdentity());
				refresh();
				return identitySettings.subscribe(refresh);
			}, [identitySettings]);
			const mode = identityValue.mode || "ling";
			return jsxs("div", {
				style: {
					display: "grid",
					gap: 12,
					padding: 16
				},
				children: [
					jsx("label", { children: [jsx("input", {
						type: "checkbox",
						checked: state.settings.enabled,
						onChange: (event) => save(controller, "enabled", event.target.checked)
					}), " 启用 HDD 视觉"] }),
					jsx("label", { children: [jsx("input", {
						type: "checkbox",
						checked: state.settings.theme === "light",
						onChange: (event) => save(controller, "theme", event.target.checked ? "light" : "dark")
					}), " HDD 日间模式"] }),
					jsx("label", { children: [jsx("input", {
						type: "checkbox",
						checked: state.settings.mascotVisible,
						onChange: (event) => save(controller, "mascotVisible", event.target.checked)
					}), " 显示 Fairy 主视觉"] }),
					jsx("label", { children: [jsx("input", {
						type: "checkbox",
						checked: state.settings.powerMode === "low-power",
						onChange: (event) => save(controller, "powerMode", event.target.checked ? "low-power" : "normal")
					}), " 低功耗模式"] }),
					jsx("hr", {}),
					jsx("label", { children: ["Fairy 当前将我识别为：", jsx("select", {
						value: mode,
						onChange: (event) => save(identitySettings, "mode", event.target.value),
						children: [
							jsx("option", {
								value: "ling",
								children: "铃"
							}),
							jsx("option", {
								value: "zhe",
								children: "哲"
							}),
							jsx("option", {
								value: "custom",
								children: "自定义"
							})
						]
					})] }),
					mode === "custom" ? jsx("label", { children: ["自定义称呼：", jsx("input", {
						value: identityValue.customName || "",
						maxLength: 40,
						onChange: (event) => save(identitySettings, "customName", event.target.value)
					})] }) : null,
					mode === "custom" ? jsx("label", { children: ["第二助手（可选）：", jsx("input", {
						value: identityValue.secondAssistant || "",
						maxLength: 40,
						onChange: (event) => save(identitySettings, "secondAssistant", event.target.value)
					})] }) : null,
					mode === "custom" ? jsx("label", { children: ["家庭成员（可选，逗号分隔）：", jsx("input", {
						value: Array.isArray(identityValue.household) ? identityValue.household.join("、") : "",
						maxLength: 240,
						onChange: (event) => save(identitySettings, "household", event.target.value.split(/[、,，]/).map((value) => value.trim()).filter(Boolean).slice(0, 12))
					})] }) : null
				]
			});
		}
		function apply(ctx) {
			return diagnostics.guard("apply", () => {
				const settings = ctx.settingsScope.bind({ namespace: SETTINGS_NAMESPACE });
				const identitySettings = ctx.settingsScope.bind({ namespace: IDENTITY_SETTINGS_NAMESPACE });
				syncDocumentMode(settings.getSnapshot());
				injectStyles();
				const selectionGuard = createSelectionGuard({ selector: [
					OFFICIAL_SELECTORS.sidebarResizeHandle,
					".dsh-fairy-composer-resizer",
					".dsh-history-overlay-scrollbar-thumb"
				].join(",") });
				ctx.effect(() => () => selectionGuard.dispose(), "dsh-fairy-visual selection guard");
				const controller = new Controller(settings, ctx.sessions);
				if (typeof window !== "undefined" && typeof process !== "undefined" && true) window.__fairyVisualLifecycle = { inspectController: () => controller.lifecycle?.inspect?.() || [] };
				ctx.effect(() => () => controller.dispose(), "dsh-fairy-visual controller");
				ctx.slots.inject("shell.overlay", () => ctx.slots.register({
					name: "shell.overlay",
					id: "dsh-fairy-visual-stage",
					order: 10
				}, () => jsx(StageHost, { controller })));
				ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
					name: "conversation.session.header.utilities",
					id: "dsh-fairy-session-metrics",
					order: 80
				}, () => jsx(SessionMetricsControl, {})));
				ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
					name: "conversation.session.header.utilities",
					id: "dsh-fairy-visual-toggle",
					order: 90
				}, () => jsx(Toggle, { controller })));
				ctx.slots.inject("settings.section", () => ctx.slots.register({
					name: "settings.section",
					id: "dsh-fairy-visual",
					order: 45,
					label: () => "HDD 视觉与 Fairy 身份"
				}, () => jsx(Settings, {
					controller,
					identitySettings
				})));
			}, { surface: "client" });
		}
		module.exports = {
			apply,
			inject: [
				"slots",
				"sessions",
				"settingsScope"
			],
			name: "dsh-fairy-visual"
		};
	}));

//#endregion
return require_client();

})();
  },
});