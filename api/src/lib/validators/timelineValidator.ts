export function isValidTimeline(timeline: any): boolean {
  const validTypes = [
    'WELCOME',
    'CEREMONY',
    'COCKTAIL',
    'DINNER',
    'PARTY',
    'FAREWELL',
  ]
  return (
    Array.isArray(timeline) &&
    timeline.every(
      ev => typeof ev.time === 'string' && validTypes.includes(ev.type)
    )
  )
}
