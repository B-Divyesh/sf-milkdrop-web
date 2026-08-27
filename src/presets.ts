export interface Preset {
  name: string;
  latin: string;
  premium: boolean;
}

export const PRESETS: Preset[] = [
  { name: 'Fern echo', latin: 'Dryopteris sonora', premium: false },
  { name: 'Pollen orbit', latin: 'Lumen pollinis', premium: false },
  { name: 'Moss tide', latin: 'Bryum undata', premium: false },
  { name: 'Night bloom', latin: 'Vespera audio', premium: false },
  { name: 'Root signal', latin: 'Rhiza pulsum', premium: false },
  { name: 'Spore atlas', latin: 'Spora caelum', premium: false },
  { name: 'Reed mirror', latin: 'Arundo duplex', premium: false },
  { name: 'Lichen rings', latin: 'Lichen resonans', premium: false },
  { name: 'Foxglove veil', latin: 'Digitalis velum', premium: true },
  { name: 'Canopy current', latin: 'Silva fluxum', premium: true },
  { name: 'Moon orchid', latin: 'Orchis lunaris', premium: true },
  { name: 'Mycelium map', latin: 'Mycelia sonans', premium: true },
];

export const PALETTES: Record<string, [[number, number, number], [number, number, number], [number, number, number]]> = {
  lichen: [[0.03, 0.07, 0.06], [0.72, 0.83, 0.42], [0.95, 0.74, 0.34]],
  coral: [[0.03, 0.08, 0.06], [0.93, 0.47, 0.41], [0.36, 0.75, 0.54]],
  moon: [[0.02, 0.05, 0.10], [0.42, 0.78, 0.82], [0.90, 0.91, 0.76]],
  plum: [[0.08, 0.03, 0.08], [0.79, 0.47, 0.67], [0.72, 0.83, 0.42]],
};
