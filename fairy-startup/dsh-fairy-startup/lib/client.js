window.__ModuleLoader__.load({
  id: 'dsh-fairy-startup',
  factory: () => {
    const STARTUP_RESET_ATTR = 'data-dsh-fairy-startup-reset';
    const createFairyDiagnostics = (() => {
      const module = { exports: {} };
// DSH_FAIRY_CLIENT_DIAGNOSTICS_BEGIN
const FAIRY_LOG_PREFIX = 'DSH_FAIRY_LOG';
const SENSITIVE_KEY = /authorization|credential|password|secret|token|api[_-]?key|cookie/i;

function sanitize(value, key = '', depth = 0) {
  if (SENSITIVE_KEY.test(key)) return '[redacted]';
  if (value == null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return value.length > 320 ? `${value.slice(0, 320)}…` : value;
  if (depth >= 2) return '[truncated]';
  if (Array.isArray(value)) return value.slice(0, 12).map((item) => sanitize(item, '', depth + 1));
  if (typeof value === 'object') return Object.fromEntries(Object.entries(value).slice(0, 24).map(([name, item]) => [name, sanitize(item, name, depth + 1)]));
  return String(value);
}

function createFairyDiagnostics(moduleName, sink = console) {
  const recentErrors = new Map();
  const clock = () => typeof performance === 'object' && performance?.now ? performance.now() : Date.now();
  const emit = (level, operation, event, context = {}, error, durationMs) => {
    const normalizedError = error ? { name: String(error.name || 'Error'), code: error.code == null ? undefined : String(error.code), message: String(error.message || error).slice(0, 320) } : undefined;
    if (normalizedError) {
      const signature = `${operation}:${normalizedError.code || normalizedError.message}`;
      const now = Date.now();
      if (now - (recentErrors.get(signature) || 0) < 60_000) return null;
      recentErrors.set(signature, now);
    }
    const record = { schema: 1, timestamp: new Date().toISOString(), level, module: moduleName, operation, event, context: sanitize(context), ...(normalizedError ? { error: normalizedError } : {}), ...(Number.isFinite(durationMs) ? { duration_ms: Number(durationMs.toFixed(3)) } : {}) };
    const writer = level === 'error' ? sink.error : level === 'warn' ? sink.warn : sink.info || sink.log;
    writer.call(sink, `${FAIRY_LOG_PREFIX} ${JSON.stringify(record)}`);
    return record;
  };
  const start = () => clock();
  const metric = (operation, startedAt, context = {}, options = {}) => {
    const duration = clock() - startedAt;
    return duration < (options.thresholdMs || 0) ? null : emit('info', operation, 'metric', context, undefined, duration);
  };
  const guard = (operation, callback, context = {}) => {
    const startedAt = start();
    try {
      const result = callback();
      metric(operation, startedAt, { ...context, outcome: 'success' });
      return result;
    } catch (error) {
      emit('error', operation, 'failure', context, error);
      metric(operation, startedAt, { ...context, outcome: 'failure' });
      throw error;
    }
  };
  return { start, metric, guard, info: (operation, context) => emit('info', operation, 'event', context), warn: (operation, context, error) => emit('warn', operation, 'failure', context, error), error: (operation, error, context) => emit('error', operation, 'failure', context, error) };
}

module.exports = { FAIRY_LOG_PREFIX, createFairyDiagnostics };
// DSH_FAIRY_CLIENT_DIAGNOSTICS_END
      return module.exports.createFairyDiagnostics;
    })();
    const diagnostics = createFairyDiagnostics('dsh-fairy-startup');

    function createWorkspaceStarter(uiWorkspace, workspaces, sessions) {
      let unsubscribeWorkspaces = null;
      let unsubscribeSessions = null;
      let timer = null;
      let deadline = 0;
      let started = false;
      const stop = () => {
        unsubscribeWorkspaces?.();
        unsubscribeSessions?.();
        if (timer !== null) clearTimeout(timer);
        timer = null;
        unsubscribeWorkspaces = null;
        unsubscribeSessions = null;
      };
      const currentId = () => uiWorkspace.mainReference?.sessionId
        ?? Object.values(sessions.list.getSnapshot().byId || {})
          .find((row) => (row?.retainedBy?.mainView ?? 0) > 0)?.id;
      const startWhenReady = () => {
        if (started) return false;
        // The official uiWorkspace restore may already have selected the last
        // session. A blank session is already the fresh-document state; any
        // restored conversation must be released before starting a new blank.
        const mainId = currentId();
        if (mainId !== undefined) {
          const summary = sessions.list.getSnapshot().byId?.[mainId];
          if (summary?.blank) {
            started = true;
            stop();
            return true;
          }
          started = true;
          stop();
          try {
            if (typeof uiWorkspace.clearMain === 'function') uiWorkspace.clearMain();
            if (typeof uiWorkspace.startSession === 'function') uiWorkspace.startSession();
            else diagnostics.warn('session.start-fresh.unsupported', { surface: 'client' });
          } catch (error) {
            diagnostics.error('session.start-fresh', error, {});
          }
          return true;
        }
        const workspace = workspaces.list.getSnapshot();
        const session = sessions.list.getSnapshot();
        if (workspace.phase !== 'ready' || session.phase !== 'ready') return false;
        if (deadline === 0) deadline = Date.now() + 1500;
        if (Date.now() < deadline) {
          timer = setTimeout(startWhenReady, 100);
          return false;
        }
        started = true;
        stop();
        try {
          // No official restore is coming (for example, it already settled
          // before this plugin loaded). Without a target this opens a fresh
          // Session in the current or most recent Workspace, or stays on Hero.
          if (typeof uiWorkspace.startSession === 'function') uiWorkspace.startSession();
          else diagnostics.warn('session.start-fresh.unsupported', { surface: 'client' });
        } catch (error) {
          diagnostics.error('session.start-fresh', error, {});
        }
        return true;
      };
      return {
        startOrSubscribe() {
          if (startWhenReady()) return;
          unsubscribeWorkspaces = workspaces.list.subscribe(startWhenReady);
          unsubscribeSessions = sessions.list.subscribe(startWhenReady);
        },
        dispose() {
          stop();
        },
      };
    }

    function resetStartupSelection(ctx) {
      const root = document.documentElement;
      if (root.hasAttribute(STARTUP_RESET_ATTR)) return null;
      root.setAttribute(STARTUP_RESET_ATTR, 'true');

      // Clear the persisted selection before the official restore settles so a
      // previous conversation never flashes on a fresh document.
      try {
        if (typeof ctx.uiWorkspace.clearMain === 'function') ctx.uiWorkspace.clearMain();
        else diagnostics.warn('session.clear-restored.unsupported', { surface: 'client' });
      } catch (error) {
        root.removeAttribute(STARTUP_RESET_ATTR);
        diagnostics.error('session.clear-restored', error, {});
        throw error;
      }
      const starter = createWorkspaceStarter(ctx.uiWorkspace, ctx.workspaces, ctx.sessions);
      starter.startOrSubscribe();
      return () => starter.dispose();
    }

    function apply(ctx) {
      return diagnostics.guard('apply', () => {
        const disposeReset = resetStartupSelection(ctx);
        if (disposeReset) ctx.effect(() => disposeReset, 'dsh-fairy-startup reset selection');
      }, { surface: 'client' });
    }

    return { apply, inject: ['sessions', 'workspaces', 'uiWorkspace'], name: 'dsh-fairy-startup' };
  },
});
