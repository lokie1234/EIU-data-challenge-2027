export const contentSources = {
  home: { id: 'home', url: 'https://eiudatachallenge.com/', title: '2026 event overview, prizes, timeline and FAQ', editionYear: 2026, verificationStatus: 'verified-public-page', checkedAt: '2026-10-30' },
  structure: { id: 'structure', url: 'https://eiudatachallenge.com/challenge-structure/', title: '2026 challenge structure', editionYear: 2026, verificationStatus: 'verified-public-page', checkedAt: '2026-10-30' },
  round2: { id: 'round2', url: 'https://eiudatachallenge.com/round-2-teams/', title: '2026 Round 2 update', editionYear: 2026, verificationStatus: 'verified-public-page', checkedAt: '2026-10-30' },
  registration: { id: 'registration', url: 'https://eiudatachallenge.com/registration/', title: 'Historical registration', editionYear: 2026, verificationStatus: 'unavailable-timeout', checkedAt: '2026-10-30' },
  contact: { id: 'contact', url: 'https://eiudatachallenge.com/contact/', title: 'Contact page', editionYear: 2026, verificationStatus: 'unavailable-timeout', checkedAt: '2026-10-30' },
  final: { id: 'final', url: 'https://eiudatachallenge.com/round-3-submission/', title: 'Final submission page', editionYear: 2026, verificationStatus: 'unavailable-verification-gate', checkedAt: '2026-10-30' },
};
export const fact = (id, category, heading, summary, details = [], source = 'home') => ({ id, category, heading, summary, details, sourceUrl: contentSources[source].url, editionYear: 2026, verificationStatus: contentSources[source].verificationStatus });
export const historicalNotice = '2026 ARCHIVE · VERIFIED HISTORICAL INFORMATION';
export const previewNotice = '2027 CONCEPT · DETAILS NOT YET CONFIRMED';
