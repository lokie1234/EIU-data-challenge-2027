import { contentSources } from '../../data/contentSources';
export function SourceCredit({ item }) {
  if (!item.sourceUrl) return <p className="source-credit">2027 concept · not an official announcement</p>;
  return <p className="source-credit"><span>{item.editionYear} historical information</span><a href={item.sourceUrl} target="_blank" rel="noreferrer">Historical source ↗</a>{!item.verificationStatus.startsWith('verified') && <em>Page unavailable; see verification note.</em>}</p>;
}
export function Details({ item, label = 'Read the details' }) {
  return item.details?.length ? <details className="secondary-details"><summary>{label}<span>+</span></summary><ul>{item.details.map(detail => <li key={detail}>{detail}</li>)}</ul></details> : null;
}
export function SourceAudit() {
  return <details className="source-audit"><summary>Source notes & verification</summary><p>2026 facts are historical. No 2027 dates, rules or rewards are confirmed.</p><ul>{Object.values(contentSources).map(s => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><span>{s.verificationStatus.replaceAll('-', ' ')}</span></li>)}</ul><p>Checked 30 October 2026. The workshop date is ambiguous; the dedicated Round 2 update takes precedence over the older homepage range.</p></details>;
}
