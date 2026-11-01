import { getModuleOwner } from '../../../data/studioModules';

// UI input queues through the entrance; existing rig controllers own every pose.
export function createModuleResponse(controllers) {
  let selection = null, started = false;
  const apply = () => {
    if (!started) return;
    const owner = getModuleOwner(selection?.id);
    Object.entries(controllers).forEach(([id, controller]) => {
      const selected = owner?.robot === id;
      controller.onHover(selected, { interrupt: selected });
      controller.root.userData.moduleId = selected ? selection.id : null;
      if (selected && selection.mode === 'active') controller.onClick();
      if (selected) controller.root.userData.interactionSource = 'module';
    });
  };
  return {
    set(signal) {
      const next = getModuleOwner(signal?.id) ? { id: signal.id, mode: signal.mode === 'active' ? 'active' : 'hover' } : null;
      if (next?.id === selection?.id && next?.mode === selection?.mode) return;
      selection = next; apply();
    },
    start() { started = true; apply(); },
    hasSelection: () => Boolean(selection),
  };
}
