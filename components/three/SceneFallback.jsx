import { eventContent as c } from '../../data/eventContent';

export default function SceneFallback({ loading = false, colored = true, failed = false }) {
  return (
    <div
      className="scene-fallback scene-fallback--minimal"
      role="img"
      aria-busy={loading}
      data-colorized={colored}
      aria-label={`${c.concept}: four colored-pencil robots seated around a workstation`}
    >
      {failed && <p className="studio-fallback-note">3D view unavailable. Showing the static studio.</p>}
      <svg className="studio-static-preview" viewBox="0 0 640 480" aria-hidden="true">
        <defs>
          <pattern id="studio-static-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V6" stroke="#39343a" strokeWidth=".6" opacity=".20" /></pattern>
          <linearGradient id="studio-static-paper" x2="1" y2="1"><stop stopColor="#dbe4ed" /><stop offset=".42" stopColor="#d7d6d1" /><stop offset=".65" stopColor="#e1def0" /><stop offset="1" stopColor="#c6c5c0" /></linearGradient>
          <g id="studio-static-chair" stroke="#181818" strokeWidth="3"><path d="M-39 2V-69Q0-84 39-69V2" fill="#292929" /><path d="M-40 3H40V17H-40Z" fill="currentColor" /><path d="M0 17V52M-34 61 0 52 34 61M-30 57v8M30 57v8" fill="none" /></g>
          <g id="studio-static-bot" stroke="#39343a" strokeWidth="1.5">
            <path d="M-21 8-26 39-12 45M21 8 26 39 12 45" fill="none" stroke="url(#studio-static-paper)" strokeWidth="12" />
            <path d="M-19 7H19L23 31H-23Z" fill="url(#studio-static-paper)" /><path d="M-15 32v27h-10M15 32v27h10" fill="none" stroke="url(#studio-static-paper)" strokeWidth="12" />
            <rect x="-42" y="-69" width="84" height="72" rx="24" fill="url(#studio-static-paper)" />
            <rect x="-42" y="-69" width="84" height="72" rx="24" fill="url(#studio-static-hatch)" stroke="none" />
            <path d="M-37-50Q0-93 37-50" fill="none" stroke="currentColor" strokeWidth="8" />
            <rect x="-33" y="-48" width="66" height="34" rx="12" fill="#09121d" />
            <path d="M-22-32h13M9-32h13" stroke="#f4fbff" strokeWidth="7" strokeLinecap="round" />
            <path d="M-43-44v24M43-44v24M-25 62h17M8 62h17" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          </g>
        </defs>
        <g stroke="#484848" strokeWidth="2"><path d="M120 185 310 135 492 207 292 270Z" fill="url(#studio-static-paper)" /><path d="M137 196v110M473 219v86" /><path d="M267 158v-60h120v69l-65 16Z" fill="#343434" /><path d="m278 112 47-2v48l-47 7Z" fill="#a6cac8" /><path d="m334 111 39 5v39l-39 4Z" fill="#242424" /><path d="m403 178 40-12 24 13v44l-39 13-25-13Z" fill="#aaa5cd" /></g>
        {[[184,220,'#497bbd'],[140,330,'#398b78'],[354,350,'#a25c91'],[498,268,'#b7793b']].map(([x,y,color]) => <g key={color} transform={`translate(${x} ${y})`} style={{ color }}><use href="#studio-static-chair" y="24" /><use href="#studio-static-bot" /></g>)}
      </svg>

    </div>
  );
}
