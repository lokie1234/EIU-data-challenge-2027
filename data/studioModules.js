const owners = {
  blue: { robot: 'blue', label: 'Blue', color: '#3989ec' },
  mint: { robot: 'mint', label: 'Green', color: '#35b875' },
  coral: { robot: 'coral', label: 'Orange', color: '#f3a13b' },
  orchid: { robot: 'orchid', label: 'Pink', color: '#df58a9' },
};
const assignments = { about: 'blue', 'why-join': 'mint', format: 'coral', timeline: 'coral', prizes: 'mint', faq: 'blue', partners: 'orchid', register: 'orchid' };
export const getModuleOwner = id => owners[assignments[id]] || null;
