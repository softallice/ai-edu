import { createFileRoute } from '@tanstack/react-router'
import { JournalEntriesPage } from '@/features/accounting/journal-entries-page'

export const Route = createFileRoute('/_authenticated/accounting/journal-entries')({
  component: JournalEntriesPage,
})
