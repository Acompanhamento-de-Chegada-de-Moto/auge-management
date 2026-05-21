import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskChassis(chassis: string): string {
  if (chassis.length <= 6) return chassis;
  return "*".repeat(chassis.length - 6) + chassis.slice(-6);
}
