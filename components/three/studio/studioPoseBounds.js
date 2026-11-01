// Baked from the full idle/hover/action sweep. The geometry signature invalidates
// these bounds when mesh dimensions or bind transforms change. Tests compare the
// fast path against the complete sweep, which remains the fallback.
export const bakedPoseBounds = {
  mint: { signature: 'eca5f6cc', scale: .98, yaw: 1.2,
    min: [-.6924919282383626, -.6337111112733681, -.6686997174915645],
    max: [.904592616134527, 1.4133823779632784, .8062872340608918] },
  orchid: { signature: 'c8de8d7', scale: .98, yaw: 1.2,
    min: [-.7008548729146629, -.6337111112733681, -.6699523544487203],
    max: [.9045926161345266, 1.3874532901813796, .8062872340608915] },
  coral: { signature: '142d0cf2', scale: .98, yaw: 2,
    min: [-.7790998983686153, -.6337111112733681, -.7290285709618878],
    max: [.9015800244713517, 1.3924997349284918, .7006842664711422] },
};

export function poseBoundsSignature(rig) {
  let hash = 2166136261;
  const append = value => {
    for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  };
  append(rig.chair.position.clone().sub(rig.root.position).toArray());
  append(rig.chair.scale.toArray());
  for (const root of [rig.root, rig.chair]) root.traverse(object => {
    if (object === root) return;
    object.updateMatrix(); append(object.name); append(object.matrix.elements);
    if (object.geometry) {
      object.geometry.computeBoundingBox();
      append(object.geometry.attributes.position.count);
      append(object.geometry.boundingBox.min.toArray()); append(object.geometry.boundingBox.max.toArray());
    }
  });
  return (hash >>> 0).toString(16);
}
