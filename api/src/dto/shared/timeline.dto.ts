type Time = `${number}:${number}`

export interface TimelineEventDto {
  time: Time
  type: 'WELCOME' | 'CEREMONY' | 'COCKTAIL' | 'DINNER' | 'PARTY' | 'FAREWELL'
}
