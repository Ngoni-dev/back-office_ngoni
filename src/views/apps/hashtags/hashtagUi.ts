import type { HashtagRecord } from '@/services/hashtag.service'

export function displayHashtagLabel(h: HashtagRecord): string {
  return String(h.name ?? h.display_tag ?? h.tag ?? h.id)
}

