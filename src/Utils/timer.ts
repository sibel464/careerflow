/** How the Pomodoro timer looks on the desk. */
export type TimerStyle = 'hourglass' | 'tomato' | 'ring';

export const TIMER_STYLES: { id: TimerStyle; label: string; emoji: string }[] = [
  { id: 'hourglass', label: 'Kum saati', emoji: '⏳' },
  { id: 'tomato', label: 'Domates', emoji: '🍅' },
  { id: 'ring', label: 'Mutfak saati', emoji: '🕰️' },
];
