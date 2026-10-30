import { fact } from './contentSources';
export const competition2026 = {
  overview: fact('overview', 'about', 'Different majors. Shared curiosity.', 'The 2026 challenge welcomed EIU students across majors to interpret practical business data, reason analytically and recommend decisions without requiring code.', ['The emphasis was business understanding, insight and communication rather than advanced formulas or technical experience.']),
  benefits: [
    fact('real-cases', 'why-join', 'Real business cases', 'Turn a practical business question into a reasoned recommendation.'),
    fact('reasoning', 'why-join', 'Analytical thinking', 'Find patterns, interpret evidence and challenge your first assumption.'),
    fact('teamwork', 'why-join', 'Teamwork', 'Combine different disciplines and build a shared point of view.'),
    fact('story', 'why-join', 'Communication', 'Make insights understandable through storytelling and presentations.'),
    fact('workshops', 'why-join', 'Workshops', 'The source lists critical thinking, AI tools, Excel, Power BI and data storytelling; the actual workshop schedule was to be confirmed.'),
    fact('network', 'why-join', 'Mentors & connections', 'The 2026 overview describes faculty/industry mentoring and opportunities to connect with students and business leaders.'),
    fact('consulting', 'why-join', 'Consulting mindset', 'Work from a business problem to clear, evidence-backed advice.'),
  ],
  rounds: [
    { ...fact('round-1', 'format', 'Online Test', 'An individual assessment of data, charts and everyday business scenarios.', ['30 multiple-choice questions in 35 minutes.', 'Four sequential parts, each with its own time limit. No complex formulas or advanced academic knowledge required.', 'Every member must complete Round 1 for their team to advance. The organizing committee supports participants who need teammates.'], 'structure'), stats: ['30 questions', '35 minutes', 'Individual'], symbol: 'ScanLine' },
    { ...fact('round-2', 'format', 'Video Case Challenge', 'Teams analyze an assigned dataset and turn findings into practical recommendations.', ['Teams contain 3–4 students; submission is online.', 'Submit a 150–180 second video. Introduce the team and identify participation in EIU Data Challenge 2026.', 'Share on TikTok with #EIU #EIUDataChallenge #BBS #trending #viral.', 'Judging considers data understanding, meaningful insights and a logical, engaging, creative presentation. Only five teams advance.', 'Updated Round 2 page: uploads from 28 January through 14:00 on 4 February 2026; final submission at the same deadline.'], 'round2'), stats: ['3–4 students', '150–180 sec', 'Top 5 advance'], symbol: 'Network', secondarySourceUrl: 'https://eiudatachallenge.com/challenge-structure/' },
    { ...fact('round-3', 'format', 'Final Presentation', 'Finalists present live to a judging panel, explain their analysis and defend their recommendations.', ['All finalist teams receive the same dataset from a partner organization.', 'Interpret the business context, present findings, make practical data-backed recommendations and answer the judges’ questions.', 'Evaluation focuses on evidence, feasibility, presentation and teamwork.'], 'structure'), stats: ['Live presentation', 'Shared dataset', 'Judges’ Q&A'], symbol: 'ArrowUpRight' },
  ],
  milestones: [
    { ...fact('registration', 'timeline', 'Registration', 'Historical entry window.', ['The registration page could not be retrieved; the date is verified from the 2026 homepage.']), date: '09–16 JAN', order: '01' },
    { ...fact('kickoff', 'timeline', 'Kick-off', 'The 2026 season introduction.'), date: '14 JAN', order: '02' },
    { ...fact('assessment', 'timeline', 'Round 1', 'Individual online assessment.', ['08:00 on 17 January to 08:00 on 18 January 2026.']), date: '17–18 JAN', order: '03' },
    { ...fact('team-formation', 'timeline', 'Find your team', 'Team formation period.', ['The FAQ gives the final team-list deadline as 11:00 on 20 January 2026.']), date: '19–20 JAN', order: '04' },
    { ...fact('video', 'timeline', 'Round 2 update', 'Video uploads and final submission.', ['Dedicated Round 2 page: 28 January–4 February 2026, closing 14:00 on 4 February.', 'The homepage still lists 21–31 January. This experience uses the more specific Round 2 update and preserves the discrepancy here.'], 'round2'), date: '28 JAN–04 FEB', order: '05' },
    { ...fact('workshop-dates', 'timeline', 'Workshops', 'Exact historical date range unavailable.', ['The homepage prints “21-18 Feb, 2026”, which does not establish a valid chronological range. We do not infer corrected dates.', 'The FAQ says the actual workshop schedule is to be confirmed.']), date: 'RANGE UNCLEAR', order: '06', verificationStatus: 'verified-ambiguous-date' },
    { ...fact('final-date', 'timeline', 'The final', 'Final round date listed on the historical homepage.', ['11 March 2026. The final submission page is behind a verification gate; no further timing was verified.', 'The homepage notes that dates may change and that reminders are sent by email.']), date: '11 MAR', order: '07' },
  ],
  prizes: [
    { ...fact('champion', 'prizes', 'Champion', 'Cash plus a two-hour badminton voucher.', ['5,000,000 VND and a two-hour voucher at Manh Cuong Badminton.']), amount: '5,000,000', shortAmount: '5M', rank: '01' },
    { ...fact('runner-up', 'prizes', 'Runner-up', 'Cash plus a two-hour badminton voucher.', ['2,000,000 VND and a two-hour voucher at Manh Cuong Badminton.']), amount: '2,000,000', shortAmount: '2M', rank: '02' },
    { ...fact('third', 'prizes', 'Third prize', 'Cash plus a two-hour badminton voucher.', ['1,000,000 VND and a two-hour voucher at Manh Cuong Badminton.']), amount: '1,000,000', shortAmount: '1M', rank: '03' },
  ],
  recognition: [
    fact('special', 'prizes', 'Two special recognition awards', '500,000 VND each, with two-hour Manh Cuong Badminton vouchers.'),
    fact('video-awards', 'prizes', 'Video recognition', 'One Most Viral Video award and two Judge’s Choice awards.', ['The homepage groups these under a 500,000 VND cash + Gems Zone Pickleball social-pass heading; it does not explicitly state the per-award allocation.', 'A special recognition is also listed for the most creative team introduction, without a stated amount.']),
    fact('foodcity', 'prizes', '45 FoodCity EIU vouchers', '50,000 VND per voucher across three participant groups.', ['15 vouchers: first 15 test finishers. 10 vouchers: top scorers, with earliest completion also considered. 20 vouchers: first 20 certificate posts on social media, with a screenshot uploaded to the competition page.', 'The first 15 finishers may also receive the certificate-post award. Required hashtags: #EIU #EIUDataChallenge #BBS #trending #viral.']),
  ],
  questions: [
    { ...fact('eligibility', 'faq', 'Who could join?', 'The 2026 competition welcomed EIU students from all majors without a coding or technical-experience requirement.'), group: 'Getting started' },
    { ...fact('individual', 'faq', 'Did I need a team for Round 1?', 'No. The first round was individual; teams of 3–4 were needed for Round 2.'), group: 'Teams' },
    { ...fact('formation', 'faq', 'How did teams form?', 'Students could organize teams after their individual round, including across majors and year groups.', ['Each student could join only one team. Final lists were due 11:00 on 20 January 2026; composition could not change after the deadline.', 'Team matching was available, and organizers could place unmatched participants if needed.']), group: 'Teams' },
    { ...fact('tools', 'faq', 'Was code required? Which tools were allowed?', 'No code was required. The source lists Excel, Power BI, Python, AI tools, manual reasoning and process mapping.', ['The goal was insight, structured thinking, teamwork and storytelling rather than technical proficiency. These are historical 2026 permissions, not 2027 rules.']), group: 'Tools & learning' },
    { ...fact('training', 'faq', 'What learning support was listed?', 'Workshops on critical thinking, AI tools, Excel, Power BI and data storytelling.', ['The source said the actual workshop schedule was to be confirmed.']), group: 'Tools & learning' },
    { ...fact('bonus', 'faq', 'What were the team incentives?', 'The homepage lists Round 1 merit bonuses and early team-formation incentives.', ['Top 20% scores and top 20% earliest submissions in Round 1 were listed as eligible for +2 points added to the Round 2 team score, capped at 5 points per team for this Round 1 bonus. The source does not clarify double eligibility.', 'Teams registered within 48 hours of the Round 2 announcement received +3 points.', 'The first submitted team received an EIU Media Channel shout-out. The most creative team introduction had a special award.']), group: 'Teams' },
    { ...fact('advancing', 'faq', 'How did teams qualify for the final?', 'All team members had to finish Round 1. Five teams advanced from the video case round.', [], 'structure'), group: 'Teams' },
    { id: '2027-entry', category: 'faq', heading: 'Can I register for 2027 here?', summary: 'No. This is an unconfirmed 2027 design concept. Registration details are coming soon; no form or personal-data submission is enabled.', details: [], editionYear: 2027, sourceUrl: null, verificationStatus: 'unconfirmed-preview', group: 'Getting started' },
  ],
  collaborators: [
    fact('foodcity-network', 'partners', 'FoodCity EIU', 'Named in the 2026 voucher awards. Not a confirmed 2027 partner.', ['The homepage lists 45 vouchers worth 50,000 VND each; see Reward Vault for conditions.']),
    fact('gems-network', 'partners', 'Gems Zone Pickleball', 'Named as the provider of social-pass vouchers in the 2026 video-award grouping. Not a confirmed 2027 partner.'),
    fact('badminton-network', 'partners', 'Manh Cuong Badminton', 'Named for two-hour vouchers accompanying 2026 podium and special recognition awards. Not a confirmed 2027 partner.'),
  ],
  contact: { id: 'contact-email', category: 'contact', heading: 'Event contact', summary: 'contact@eiudatachallenge.com', details: ['Address supplied in the project brief. The contact page timed out, so it was not independently verified in this session.'], sourceUrl: 'https://eiudatachallenge.com/contact/', editionYear: 2026, verificationStatus: 'provided-in-brief-not-independently-verified' },
};
