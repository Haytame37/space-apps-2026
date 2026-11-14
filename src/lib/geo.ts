/**
 * Unit direction of a latitude/longitude on NASA's Moon and Mars globe models.
 * The models are cube-spheres whose prime meridian faces -X and whose east
 * longitudes turn toward +Z (checked against Mare Crisium, Hellas and
 * Olympus Mons in the models' own textures).
 */
export function dirFromLatLon(latDeg: number, lonDeg: number): [number, number, number] {
  const lat = (latDeg * Math.PI) / 180
  const lon = (lonDeg * Math.PI) / 180
  return [-Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)]
}
