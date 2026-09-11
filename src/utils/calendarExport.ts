import { TravelItinerary } from '../types';

export function exportItineraryToIcs(itinerary: TravelItinerary) {
  const events: string[] = [];
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // 1. Overall travel event
  const tripStartDate = new Date(itinerary.travelDate + 'T08:00:00');
  const tripEndDate = new Date(tripStartDate.getTime() + itinerary.totalDurationHours * 3600 * 1000);

  const formatIcsDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  events.push(`BEGIN:VEVENT
UID:trip-${itinerary.id}-${Date.now()}@safarpra.app
DTSTAMP:${timestamp}
DTSTART:${formatIcsDate(tripStartDate)}
DTEND:${formatIcsDate(tripEndDate)}
SUMMARY:Voyage ${itinerary.origin.name} -> ${itinerary.destination.name} (Safarpra)
DESCRIPTION:Trajet de ${itinerary.totalDistanceKm}km en ${itinerary.totalDurationHours}h.\\nRukhsah : ${itinerary.rukhsahDetails.recommendation}
LOCATION:${itinerary.origin.name}
STATUS:CONFIRMED
END:VEVENT`);

  // 2. Prayer Stop Events
  itinerary.segments.forEach((seg) => {
    seg.prayerStops.forEach((stop) => {
      const stopTime = new Date(`${itinerary.travelDate}T${stop.recommendedTime}:00`);
      const stopEndTime = new Date(stopTime.getTime() + (stop.suggestedDurationMinutes || 25) * 60 * 1000);

      events.push(`BEGIN:VEVENT
UID:prayer-${stop.id}-${Date.now()}@safarpra.app
DTSTAMP:${timestamp}
DTSTART:${formatIcsDate(stopTime)}
DTEND:${formatIcsDate(stopEndTime)}
SUMMARY:Prière de ${stop.prayerName} - Arrêt Voyageur
DESCRIPTION:${stop.locationName}\\nConseil Fiqh : ${stop.fiqhAdvice}\\nQibla : ${stop.qiblaBearing}°
LOCATION:${stop.locationName}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Rappel prière ${stop.prayerName} dans 15 minutes
END:VALARM
END:VEVENT`);
    });
  });

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Safarpra//Islamic Travel Planner//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Voyage & Prières - ${itinerary.title}
${events.join('\n')}
END:VCALENDAR`;

  // Download blob
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `voyage-prieres-${itinerary.origin.name.toLowerCase().replace(/\s+/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
