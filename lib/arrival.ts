export type ArrivalStatus = "NO_INFORMATION" | "ARRIVED" | "DELAYED";

// Forecasts are calendar dates, represented by the UTC date portion throughout
// the existing forms/formatters. Only the current business day uses local time.
export function businessDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function forecastCutoff(now = new Date()) {
  return new Date(`${businessDate(now)}T00:00:00.000Z`);
}

export function effectiveArrivalStatus(
  motorcycle: {
    forecastArrival: Date | null;
    forecastArrivalStatus: string | null;
    arrivedAt?: Date | null;
  },
  now = new Date(),
): ArrivalStatus {
  if (motorcycle.arrivedAt || motorcycle.forecastArrivalStatus === "ARRIVED")
    return "ARRIVED";
  return motorcycle.forecastArrival &&
    motorcycle.forecastArrival < forecastCutoff(now)
    ? "DELAYED"
    : "NO_INFORMATION";
}

export function withArrivalStatus<
  T extends {
    forecastArrival: Date | null;
    forecastArrivalStatus: string | null;
    arrivedAt?: Date | null;
  },
>(motorcycle: T) {
  return {
    ...motorcycle,
    forecastArrivalStatus: effectiveArrivalStatus(motorcycle),
  };
}
