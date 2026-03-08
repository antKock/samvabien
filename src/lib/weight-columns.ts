export function buildWeightColumns(currentHg: number) {
  const kgValues = Array.from({ length: 14 }, (_, i) => String(i + 2))
  const hgValues = Array.from({ length: 10 }, (_, i) => String(i))
  const currentKg = Math.floor(currentHg / 10)
  const currentRemainder = currentHg % 10

  return [
    { label: 'kg', values: kgValues, defaultIndex: Math.max(0, kgValues.indexOf(String(currentKg))) },
    { label: 'hg', values: hgValues, defaultIndex: currentRemainder },
  ]
}
