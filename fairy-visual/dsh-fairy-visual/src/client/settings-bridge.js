/**
 * DSH 0.2.x stores plugin preferences in the profile entry's volatile Config.
 * The client reads them through `remote.settings`; there is no settingsScope
 * service in this runtime.
 */
export function createSettingsScope(ctx, { namespace, defaults, path = [] }) {
  let currentView = null;
  let disposed = false;
  let snapshot = {
    status: 'loading',
    value: defaults,
    revision: undefined,
    writable: false,
    error: null,
  };
  const listeners = new Set();

  const emit = () => {
    if (!disposed) for (const listener of [...listeners]) listener();
  };

  const project = (row) => {
    let value = row?.value;
    for (const key of path) value = value && typeof value === 'object' ? value[key] : undefined;
    return {
      status: row === undefined ? 'unavailable' : 'ready',
      value: value && typeof value === 'object' ? value : defaults,
      revision: row?.revision,
      writable: Boolean(currentView?.writable),
      error: null,
    };
  };

  const applyView = (view) => {
    if (!view) return;
    if (Array.isArray(view.namespaces)) {
      currentView = view;
    } else if (view.ns) {
      const namespaces = currentView?.namespaces || [];
      currentView = {
        writable: currentView?.writable ?? true,
        namespaces: namespaces.some((row) => row.ns === view.ns)
          ? namespaces.map((row) => row.ns === view.ns ? view : row)
          : [...namespaces, view],
      };
    }
    snapshot = project((currentView?.namespaces || []).find((row) => row.ns === namespace));
    emit();
  };

  const load = async () => {
    try {
      const response = await ctx.remote.settings.describe();
      if (disposed) return;
      if (!response?.ok) {
        snapshot = { ...snapshot, status: 'error', error: response?.error?.message || 'settings unavailable' };
        emit();
        return;
      }
      applyView(response.value);
    } catch (error) {
      if (disposed) return;
      snapshot = { ...snapshot, status: 'error', error: String(error?.message || error) };
      emit();
    }
  };

  const offDocument = ctx.remote.$on?.('settings/document-updated', (updated) => {
    if (updated === namespace) void load();
  });
  const offReset = ctx.on?.('connection/reset', () => void load());
  void load();

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async setPath(targetPath, value) {
      const response = await ctx.remote.settings.mutate(
        namespace,
        [{ op: 'set', path: targetPath, value }],
        snapshot.revision,
      );
      if (!response?.ok) throw new Error(response?.error?.message || 'settings write failed');
      applyView(response.value);
    },
    set(field, value) {
      return this.setPath([...path, field], value);
    },
    dispose() {
      disposed = true;
      offDocument?.();
      offReset?.();
      listeners.clear();
    },
  };
}

/** Derive a nested settings view from the namespace's single revisioned scope. */
export function createSettingsProjection(root, { path, defaults }) {
  return {
    getSnapshot() {
      const snapshot = root.getSnapshot();
      let value = snapshot.value;
      for (const key of path) value = value && typeof value === 'object' ? value[key] : undefined;
      return {
        ...snapshot,
        value: value && typeof value === 'object' ? value : defaults,
      };
    },
    subscribe: root.subscribe,
    set(field, value) {
      return root.setPath([...path, field], value);
    },
    dispose() {},
  };
}
