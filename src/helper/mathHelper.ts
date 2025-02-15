
export function getRandom(min: number, max: number) {
  const floatRandom = Math.random()
  const difference = max - min
  const random = Math.round(difference * floatRandom)
  const randomWithinRange = random + min
  return randomWithinRange
}
