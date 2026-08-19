import type { TimelineEvent } from '../types/brand';

export class TimelineService {
  buildTimeline(events: TimelineEvent[]): TimelineEvent[] {
    const sorted = this.sortByDate(events);
    return this.deduplicate(sorted);
  }

  private sortByDate(events: TimelineEvent[]): TimelineEvent[] {
    return [...events].sort((a, b) => {
      const dateA = this.parseTimelineDate(a.date);
      const dateB = this.parseTimelineDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }

  private deduplicate(events: TimelineEvent[]): TimelineEvent[] {
    const seen = new Set<string>();
    return events.filter((e) => {
      const key = `${e.date}|${e.title.substring(0, 40)}|${e.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private parseTimelineDate(date: string): Date {
    // Handle YYYY, YYYY-MM, YYYY-MM-DD
    if (/^\d{4}$/.test(date)) return new Date(parseInt(date), 0, 1);
    if (/^\d{4}-\d{2}$/.test(date)) {
      const [y, m] = date.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(date);
  }
}
