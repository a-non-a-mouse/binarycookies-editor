export function appleDate(secondsSince2001: number): Date {
  const appleEpoch = new Date('2001-01-01T00:00:00Z').getTime();
  const milliseconds = appleEpoch + secondsSince2001 * 1000;
  const date = new Date(milliseconds);

  return date;
}
