import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export { formatNumber } from './utils-advanced'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
