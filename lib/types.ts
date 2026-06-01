export type Role = "usuario" | "lider" | "admin"

export type EventCategory = "limpieza" | "reforestacion" | "reciclaje" | "educacion" | "taller"

export type EventStatus = "abierto" | "lleno" | "proximamente" | "finalizado"

export interface CollectiveEvent {
  id: string
  title: string
  category: EventCategory
  date: string
  time: string
  location: string
  description: string
  capacity: number
  enrolled: number
  points: number
  status: EventStatus
  minRole: Role
  image: string
}

export interface Reward {
  id: string
  title: string
  description: string
  cost: number
  category: "cafeteria" | "merch" | "experiencia"
  minRole: Role
  available: boolean
}

export interface Opportunity {
  id: string
  title: string
  org: string
  type: "empleo" | "voluntariado" | "beca" | "convenio"
  location: string
  description: string
}

export interface Member {
  id: string
  name: string
  email: string
  role: Role
  streak: number
  points: number
  eventsAttended: number
  joined: string
}

export interface CurrentUser {
  name: string
  email: string
  role: Role
  streak: number
  points: number
  eventsAttended: number
  treesPlanted: number
  kgRecycled: number
}
