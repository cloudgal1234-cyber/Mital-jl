type CalendarEvent = {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
};

function toIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(text: string): string {
  return text.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}

export function buildIcsContent({ title, description, location, start, end }: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mital Gel//Booking//HE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@mital-gel`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : null,
    location ? `LOCATION:${escapeIcsText(location)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);
  return lines.join("\r\n");
}

export function downloadIcsFile(event: CalendarEvent, fileName: string) {
  const blob = new Blob([buildIcsContent(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl({ title, description, location, start, end }: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
  });
  if (description) params.set("details", description);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
