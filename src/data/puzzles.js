// ponytail: numero puzzle statico, nessun sistema di numerazione giornaliera reale
export const PUZZLES = [
  {
    slug: 'zip',
    name: 'Zip',
    number: 493,
    subtitle: 'Completa il percorso',
    icon: 'bi-signpost-split-fill',
    color: '#d9622b',
    playable: true,
  },
  {
    slug: 'patches',
    name: 'Patches',
    number: 128,
    subtitle: 'Metti insieme i pezzi',
    icon: 'bi-puzzle-fill',
    color: '#3a6ea5',
    playable: true,
  },
  {
    slug: 'mini-sudoku',
    name: 'Mini Sudoku',
    number: 346,
    subtitle: 'Il gioco classico, in versione mini',
    icon: 'bi-grid-3x3',
    color: '#5c6470',
    playable: true,
  },
  {
    slug: 'tango',
    name: 'Tango',
    number: 654,
    subtitle: 'Armonizza la griglia',
    icon: 'bi-columns-gap',
    color: '#2f6fed',
    playable: true,
  },
]

export function getPuzzleBySlug(slug) {
  return PUZZLES.find((puzzle) => puzzle.slug === slug)
}
