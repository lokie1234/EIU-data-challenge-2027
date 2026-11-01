const smooth = (start, end, t) => {
  const u = Math.max(0, Math.min(1, (t - start) / (end - start)));
  return u * u * (3 - 2 * u);
};
const window = (start, end, t) => smooth(start, start + .8, t) * (1 - smooth(end - .8, end, t));

// Replies begin only after BLUE has completed its turn toward that group.
export function getConversationCue(time) {
  const t = ((time % 18) + 18) % 18;
  return {
    pairLook: window(1.5, 8, t), pairShake: window(3.2, 7.5, t),
    orangeLook: window(9, 16.5, t), orangePoint: window(10.7, 16, t), time,
  };
}
export const presentationYaw = { blue: .52, mint: 0, orchid: 0, coral: 0 };
