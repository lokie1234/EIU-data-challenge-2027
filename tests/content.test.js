import { describe, expect, it } from 'vitest';
import { competition2026 } from '../data/competition2026';
import { eventContent, portals } from '../data/eventContent';
import { contentSources } from '../data/contentSources';
describe('edition and verification integrity', () => {
  it('keeps the future registration concept unconfirmed and without a live URL', () => {
    expect(eventContent.registration.editionYear).toBe(2027);
    expect(eventContent.registration.verificationStatus).toBe('unconfirmed-preview');
    expect(eventContent.registration.sourceUrl).toBeNull();
  });
  it('records source provenance on factual items', () => {
    for (const items of [competition2026.rounds, competition2026.milestones, competition2026.prizes, competition2026.recognition, competition2026.collaborators]) for (const item of items) {
      expect(item.editionYear).toBe(2026);
      expect(item.sourceUrl).toMatch(/^https:\/\/eiudatachallenge.com\//);
      expect(item.verificationStatus).toMatch(/^verified/);
      expect(item.details).toBeInstanceOf(Array);
    }
    expect(new Set(portals.map(p => p.id)).size).toBe(8);
  });
  it('does not mark failed sources or the email as independently verified', () => {
    expect(contentSources.contact.verificationStatus).toBe('unavailable-timeout');
    expect(contentSources.registration.verificationStatus).toBe('unavailable-timeout');
    expect(competition2026.contact.verificationStatus).toContain('not-independently-verified');
  });
});
