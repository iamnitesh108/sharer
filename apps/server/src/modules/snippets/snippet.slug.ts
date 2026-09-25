import { customAlphabet } from 'nanoid'

// Lowercase letters and digits without look-alikes (0/o, 1/l/i),
// so a link read out loud or typed by hand still works
const SLUG_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'
const SLUG_LENGTH = 10

export const SLUG_PATTERN = new RegExp(`^[${SLUG_ALPHABET}]{${SLUG_LENGTH}}$`)

export const generateSlug: () => string = customAlphabet(
  SLUG_ALPHABET,
  SLUG_LENGTH,
)
