/**
 * App-facing domain models / DTOs — composed shapes the presentation layer
 * consumes. Built from the raw row types in `database.ts`. Keep view-specific
 * composition here so pages never assemble nested DB shapes themselves.
 */
import type {
  ContentRow,
  ContentTranslationRow,
  EventRow,
  EventTranslationRow,
} from "./database";

/** A content item joined with all of its language translations. */
export type ContentWithTranslations = ContentRow & {
  content_translations: ContentTranslationRow[];
};

/** An event joined with all of its language translations. */
export type EventWithTranslations = EventRow & {
  event_translations: EventTranslationRow[];
};
