export function getLocalDateValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalDateTimeValue(date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${getLocalDateValue(date)}T${hours}:${minutes}`;
}

export function getLocalDateTimeInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return getLocalDateTimeValue(date);
}

export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isPastDueDate(value: string, now = new Date()): boolean {
  return new Date(`${value.slice(0, 10)}T23:59:59`).getTime() < now.getTime();
}
