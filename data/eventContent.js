export const portals = [
  { id: 'about', number: '01', label: 'About', title: 'The intelligence network', teaser: 'Different majors. One shared curiosity.', icon: 'Sparkles', accent: 'violet', x: 14, y: 28, shape: 'circle' },
  { id: 'why-join', number: '02', label: 'Why join', title: 'Human + machine', teaser: 'Connect the skills you have not met yet.', icon: 'Orbit', accent: 'cyan', x: 30, y: 13, shape: 'diamond' },
  { id: 'format', number: '03', label: 'Challenge format', title: 'The analytics pipeline', teaser: 'Three rounds. An evolving point of view.', icon: 'Layers3', accent: 'lime', x: 78, y: 17, shape: 'levels' },
  { id: 'timeline', number: '04', label: 'Timeline', title: 'Transformation timeline', teaser: 'Travel through the historical 2026 season.', icon: 'Waypoints', accent: 'coral', x: 87, y: 46, shape: 'orbit' },
  { id: 'prizes', number: '05', label: 'Prizes', title: 'The robotic reward vault', teaser: 'Open the archive. Reveal the rewards.', icon: 'Gem', accent: 'lime', x: 76, y: 76, shape: 'gem' },
  { id: 'faq', number: '06', label: 'FAQ', title: 'The knowledge terminal', teaser: 'Good questions deserve useful answers.', icon: 'MessageCircle', accent: 'cyan', x: 12, y: 64, shape: 'bubble' },
  { id: 'partners', number: '07', label: 'Partners', title: 'The intelligence ecosystem', teaser: 'Meet the names behind the 2026 rewards.', icon: 'Shapes', accent: 'violet', x: 31, y: 85, shape: 'network' },
  { id: 'register', number: '08', label: 'Register', title: 'The transformation gateway', teaser: 'Your next perspective is on the horizon.', icon: 'ArrowUpRight', accent: 'coral', x: 54, y: 87, shape: 'ticket' },
];
export const eventContent = {
  name: 'EIU Data Challenge', year: '2027', concept: 'INTELLIGENCE LAB', tagline: 'Think. Analyze. Transform.',
  description: 'An interactive exhibition of curiosity, business thinking and data. A 2027 concept with an honest archive of the 2026 competition.',
  theme: { background: '#070B16', surface: '#17243A', violet: '#9B7CFF', cyan: '#60EFFF', lime: '#C9FF5D', coral: '#FF729F', text: '#F5F8FF', muted: '#A6B8CE' },
  intro: ['THINK BIG.', 'READ THE DATA.', 'CHANGE THE GAME.'],
  labels: { join: 'Enter the portal', explore: 'Explore the universe', close: 'Return to intelligence lab', next: 'Next portal', previous: 'Previous portal', skip: 'Skip to portals', archive: '2026 archive', preview: '2027 concept', search: 'Search the question lab', source: 'View historical source', contact: 'Contact the event', motionOn: 'Pause robotic scene', motionOff: 'Resume robotic scene', reset: 'Recenter robotic scene' },
  registration: { id: 'registration-preview', category: 'register', heading: 'Your next chapter is unwritten.', summary: 'Registration details coming soon.', details: ['This is an unconfirmed 2027 concept. Entry dates, eligibility, awards and rules have not been announced here.', 'No registration form is active. Explore the historical experience while the next season takes shape.'], sourceUrl: null, editionYear: 2027, verificationStatus: 'unconfirmed-preview' },
  motion: { micro: .18, portal: .48, cinematic: .85 },
};
export const getPortal = id => portals.find(portal => portal.id === id);
