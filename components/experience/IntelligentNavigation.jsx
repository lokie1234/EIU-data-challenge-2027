'use client';
import { portals } from '../../data/eventContent';
import { getModuleOwner } from '../../data/studioModules';
import Icon from '../ui/Icon';
export default function IntelligentNavigation({ active, hovered, onOpen, onHover }) {
  return <nav className="intelligent-navigation" id="portals" aria-label="AI command modules">
    {portals.map(portal => {
      const owner = getModuleOwner(portal.id);
      return <div key={portal.id} className="module-slot" style={{ '--tile-accent': owner.color }}>
        <button className="module-tile" aria-label={portal.label} aria-haspopup="dialog" aria-expanded={active === portal.id}
          data-robot={owner.robot} data-module-id={portal.id} data-engaged={active === portal.id || hovered === portal.id}
          onClick={event => onOpen(portal.id, event)}
          onPointerEnter={() => onHover(portal.id)}
          onPointerLeave={() => onHover(document.activeElement?.matches?.('.module-tile') ? document.activeElement.dataset.moduleId : null)}
          onFocus={() => onHover(portal.id)} onBlur={() => onHover(null)}>
          <span className="module-tile__face">
            <span className="module-tile__meta" aria-hidden="true"><span>{portal.number} / {owner.label}</span><i /></span>
            <span className="module-tile__body"><span className="module-tile__icon" aria-hidden="true"><Icon name={portal.icon} size={23} /></span><strong>{portal.label}</strong></span>
            <span className="module-tile__edge" aria-hidden="true"><i /><i /><i /></span>
          </span>
        </button>
      </div>;
    })}
  </nav>;
}
