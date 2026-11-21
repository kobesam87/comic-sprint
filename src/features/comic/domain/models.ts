export const LOCAL_DRAFT_STORE_SCHEMA_VERSION = 1;

export interface LocalDraftStore {
  schemaVersion: number;
  drafts: ComicDraft[];
}

export interface ComicDraft {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  position: number;
  panels: Panel[];
}

export interface Panel {
  id: string;
  position: number;
  visualDescription: string;
  dialogue: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDateTime(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const parts = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/,
  );
  if (!parts || !Number.isFinite(Date.parse(value))) {
    return false;
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, zone, offsetHourText, offsetMinuteText] =
    parts;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth[month - 1] ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return false;
  }

  return (
    zone === 'Z' ||
    (Number(offsetHourText) <= 23 && Number(offsetMinuteText) <= 59)
  );
}

function hasUniquePositivePositions(items: readonly { position: unknown }[]) {
  const positions = items.map(({ position }) => position);
  return (
    positions.every(
      (position) => Number.isSafeInteger(position) && Number(position) > 0,
    ) && new Set(positions).size === positions.length
  );
}

function isPanel(value: unknown): value is Panel {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    Number.isSafeInteger(value.position) &&
    Number(value.position) > 0 &&
    typeof value.visualDescription === 'string' &&
    typeof value.dialogue === 'string'
  );
}

function isChapter(value: unknown): value is Chapter {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    !Array.isArray(value.panels) ||
    !value.panels.every(isPanel) ||
    !hasUniquePositivePositions(value.panels)
  ) {
    return false;
  }

  const panels = value.panels as Panel[];
  return new Set(panels.map(({ id }) => id)).size === panels.length;
}

export function isComicDraft(value: unknown): value is ComicDraft {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    !isIsoDateTime(value.createdAt) ||
    !isIsoDateTime(value.updatedAt) ||
    !Array.isArray(value.chapters) ||
    !value.chapters.every(isChapter) ||
    !hasUniquePositivePositions(value.chapters)
  ) {
    return false;
  }

  const chapters = value.chapters as Chapter[];
  return new Set(chapters.map(({ id }) => id)).size === chapters.length;
}

export function isLocalDraftStore(value: unknown): value is LocalDraftStore {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.schemaVersion) ||
    Number(value.schemaVersion) < 1 ||
    !Array.isArray(value.drafts) ||
    !value.drafts.every(isComicDraft)
  ) {
    return false;
  }

  const drafts = value.drafts as ComicDraft[];
  return new Set(drafts.map(({ id }) => id)).size === drafts.length;
}
