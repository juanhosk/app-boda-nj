export function isValidLocations(locations: any): boolean {
  return (
    Array.isArray(locations) &&
    locations.every(
      loc =>
        typeof loc.name === 'string' &&
        (loc.type === 'CEREMONY' || loc.type === 'BANQUET') &&
        typeof loc.latitude === 'number' &&
        typeof loc.longitude === 'number'
    )
  )
}
