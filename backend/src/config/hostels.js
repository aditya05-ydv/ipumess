export const HOSTEL_ID_TO_NAME = {
  bh1: 'Shivalik BH1',
  bh2: 'Aravali BH2',
  gh1: 'Satpura GH1',
  gh2: 'Nilgiri GH2',
};

export const HOSTEL_NAMES = Object.values(HOSTEL_ID_TO_NAME);

export const normalizeHostel = (input) => {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (HOSTEL_ID_TO_NAME[lower]) {
    return HOSTEL_ID_TO_NAME[lower];
  }

  const byName = HOSTEL_NAMES.find((name) => name.toLowerCase() === lower);
  return byName || null;
};

export const getHostelId = (name) => {
  const found = Object.entries(HOSTEL_ID_TO_NAME).find(([, fullName]) => fullName === name);
  return found ? found[0] : null;
};
