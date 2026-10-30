'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { eventContent as c } from '../../data/eventContent';
import { competition2026 as data } from '../../data/competition2026';
import MagneticButton from '../animations/MagneticButton';
export default function RegisterExperience({ onOpen }) {
  const [flipped, setFlipped] = useState(false);
  return <div className="gateway-experience"><div className="ticket-perspective"><motion.button className="access-ticket" onClick={() => setFlipped(!flipped)} aria-label={flipped ? 'Show access ticket front' : 'Flip access ticket for status'} aria-pressed={flipped} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 110, damping: 19 }}><span className="ticket-face"><span className="technical-label">TRANSFORMATION GATEWAY / 2027</span><strong>YOUR<br />NEXT<br /><em>CHAPTER.</em></strong><span className="ticket-code" aria-hidden="true">▥ ▥▥ ▥ ▥▥▥ ▥</span><span className="ticket-state">REGISTRATION COMING SOON</span><small>FLIP TO CHECK ACCESS ↗</small></span><span className="ticket-face ticket-back"><span className="technical-label">ACCESS STATUS</span><b>NOT YET<br />ACTIVATED.</b><span>{c.registration.summary}</span><small>2027 CONCEPT · NO PERSONAL DATA COLLECTED</small></span></motion.button></div><div className="gateway-copy"><h3>{c.registration.heading}</h3>{c.registration.details.map(detail => <p key={detail}>{detail}</p>)}<MagneticButton onClick={event => onOpen('format', event)}>Explore the 2026 journey ↗</MagneticButton><a className="contact-link" href={`mailto:${data.contact.summary}`}>{data.contact.summary} ↗</a><p className="contact-caveat">Contact address supplied in the brief; contact page unavailable during verification.</p></div></div>;
}
