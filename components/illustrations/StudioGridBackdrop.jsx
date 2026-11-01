'use client';

import { memo } from 'react';
// The live white architecture is rendered in the robots' scene.
function StudioGridBackdrop() {
  return <div className="studio-grid-backdrop" aria-hidden="true">
    <svg className="studio-grid-static" viewBox="0 0 1600 1000" preserveAspectRatio="none" focusable="false">
      <path d="M0 0H1600V1000H0Z" fill="#fff" />
      <path d="M0 0 510 160V570L0 1000Z" fill="#f5f6f7" />
      <path d="m1600 0-510 160v410l510 430Z" fill="#f0f2f4" />
      <path d="M0 1000 510 570h580l510 430Z" fill="#fafbfc" />
      <path d="M0 1000 510 570V160h580v410l510 430M510 570h580" fill="none" stroke="#dce1e6" />
    </svg>
  </div>;
}

export default memo(StudioGridBackdrop);
