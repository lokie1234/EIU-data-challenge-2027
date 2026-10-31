import { eventContent as c } from '../../data/eventContent';
export default function SceneFallback({ loading = false }) {
 return <div className="scene-fallback" role="img" aria-busy={loading} aria-label={`${c.concept}: a friendly purple robotic mascot with white LED eyes`}><div className="static-network" /><div className="static-robot"><div className="static-antenna" /><div className="static-antenna second" /><div className="static-head"><div className="static-visor"><i /><i /></div></div><div className="static-body" /><div className="static-arm left" /><div className="static-arm right" /><div className="static-foot left" /><div className="static-foot right" /><div className="static-pedestal" /></div></div>;
}
