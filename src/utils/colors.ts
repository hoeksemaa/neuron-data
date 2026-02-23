/**
 * Map an angle [0, 2π) to an HSL color — circular hue mapping.
 * Gives each neuron a unique color based on its preferred direction.
 */
export function directionToColor(angle: number, saturation = 70, lightness = 60): string {
  const hue = (angle / (2 * Math.PI)) * 360
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
