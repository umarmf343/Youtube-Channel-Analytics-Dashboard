import { createContext } from "react"
import type { User } from "./types"

export interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
}

export const AppContext = createContext<AppContextType | undefined>(undefined)
