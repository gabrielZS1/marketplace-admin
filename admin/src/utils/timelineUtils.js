export const HOUR_HEIGHT = 80;
export const START_HOUR = 6;
export const END_HOUR = 22;

export function generateHourSlots() {
  const slots = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) slots.push(hour);
  return slots;
}

export function formatHourLabel(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

export function getMinutesFromStart(date) {
  return (date.getHours() - START_HOUR) * 60 + date.getMinutes();
}

export function minutesToY(minutes) {
  return (minutes / 60) * HOUR_HEIGHT;
}