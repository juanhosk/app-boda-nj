import { LocationDto } from './shared/location.dto'
import { TimelineEventDto } from './shared/timeline.dto'

export interface ContactEmailDto {
  email: string
}

export interface ContactPageDto {
  token: string
  title: string
  description?: string
  celebrationDate: string
  locations: LocationDto[]
  timeline: TimelineEventDto[]
}

export interface ContactPasswordDto {
  token: string
  password: string
}
