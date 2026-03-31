export function formatReadCount(n: number): string {
  return n.toLocaleString('en-US')
}

export function formatRPM(n: number): string {
  return n.toFixed(3)
}

export function formatPadj(n: number): string {
  if (n < 0.001) return n.toExponential(2)
  return n.toFixed(4)
}

export function formatLog2FC(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}`
}

export function formatExpression(n: number): string {
  return n.toFixed(1)
}

export function formatScore(n: number): string {
  return n.toFixed(2)
}
