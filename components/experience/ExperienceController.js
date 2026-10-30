'use client';
import { useRef, useState, useSyncExternalStore } from 'react';
import { getPortal } from '../../data/eventContent';
const subscribe = callback => {
  window.addEventListener('hashchange', callback); window.addEventListener('popstate', callback);
  return () => { window.removeEventListener('hashchange', callback); window.removeEventListener('popstate', callback); };
};
export const readPortalHash = () => getPortal(window.location.hash.slice(1))?.id || '';
export default function useExperienceController() {
  const active = useSyncExternalStore(subscribe, readPortalHash, () => '');
  const opener = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [variation, setVariation] = useState(0);
  const open = (id, event) => {
    if (!getPortal(id) || id === active) return;
    if (!active && event?.currentTarget) opener.current = event.currentTarget;
    setVariation(0); setHovered(null);
    window.history.pushState({}, '', `#${id}`);
    window.dispatchEvent(new Event('hashchange'));
  };
  const close = () => {
    if (!active) return;
    window.history.pushState({}, '', window.location.pathname + window.location.search);
    window.dispatchEvent(new Event('hashchange'));
  };
  return { active, opener, hovered, setHovered, variation, setVariation, open, close };
}
