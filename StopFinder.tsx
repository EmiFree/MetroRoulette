import RNFS from 'react-native-fs';

type Stop = { id: string; lat: number; lon: number };

async function loadRailStops(): Promise<Stop[]> {
  const csv = await RNFS.readFileAssets('rail/stops.txt', 'utf8');
  const lines = csv.trim().split('\n');
  const header = lines[0].split(',');
  const idIdx = header.indexOf('stop_id');
  const latIdx = header.indexOf('stop_lat');
  const lonIdx = header.indexOf('stop_lon');
  const typeIdx = header.indexOf('location_type');

  return lines.slice(1).reduce<Stop[]>((acc, line) => {
    const fields = line.split(',');
    if (parseInt(fields[typeIdx], 10) === 1) {
      acc.push({
        id: fields[idIdx],
        lat: parseFloat(fields[latIdx]),
        lon: parseFloat(fields[lonIdx]),
      });
    }
    return acc;
  }, []);
}

/**
 * Finds the closest rail stop to the given coordinates.
 * @param lat The latitude of the location.
 * @param long The longitude of the location.
 * @returns The ID of the closest stop.
 */
export async function getClosestStop(lat: number, long: number): Promise<string> {
  const stops = await loadRailStops();
  let closestId = stops[0].id;
  let smallestDelta = Infinity;

  for (const stop of stops) {
    const delta = Math.abs(lat - stop.lat) + Math.abs(long - stop.lon);
    if (delta < smallestDelta) {
      smallestDelta = delta;
      closestId = stop.id;
    }
  }

  return closestId;
}
