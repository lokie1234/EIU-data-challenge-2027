import { eventContent as c } from '../../data/eventContent';
export default function SceneFallback({ loading = false }) {
 return <div className="scene-fallback" role="img" aria-label={`${c.concept}: a friendly robotic mascot with an illuminated intelligence core`}><div className="static-network" /><div className="static-robot"><div className="static-antenna" /><div className="static-head"><div className="static-visor"><i /><i /><b /></div></div><div className="static-body"><span /></div><div className="static-arm left" /><div className="static-arm right" /></div><div className="renderer-status">{loading ? <><span /><span /><span /> INITIALIZING 3D RENDERER</> : "PROCEDURAL ROBOT / STATIC VIEW"}</div></div>;
}
