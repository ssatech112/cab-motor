/* Coches y carácter del sonido.
   Para añadir uno: copia un bloque, cambia los números y recarga.
   kind: "ice" motor de gasolina, "ev" zumbido eléctrico, "haunt" ambiente. */
const CARS = [
  {
    id: "maniac",
    name: "Shift Maniac",
    tag: "Bóxer de seis cilindros · 9.000 rpm · 10 marchas cortas · tope 120 km/h",
    kind: "ice",
    sample: "mini",
    cylinders: 6,
    idle: 1100,
    redline: 9000,
    gears: 10,
    topKmh: 120,
    tone: 1.22,
    lump: 0.22,
    pull: 34,
    blower: false,
    manual: false,
  },
  {
    id: "gt3",
    name: "Porsche 911 GT3",
    tag: "Bóxer 4.0 · 9.000 rpm · PDK de 7 marchas",
    kind: "ice",
    sample: "mini",
    cylinders: 6,
    idle: 980,
    redline: 9000,
    gears: 7,
    topKmh: 318,
    tone: 1.12,
    lump: 0.16,
    pull: 30,
    blower: false,
    manual: false,
  },
  {
    id: "v8",
    name: "V8 Muscle",
    tag: "V8 6.2 crossplane · escape doble · ralentí irregular",
    kind: "ice",
    sample: "v8",
    cylinders: 8,
    idle: 760,
    redline: 6500,
    gears: 6,
    topKmh: 260,
    tone: 0.52,
    lump: 0.82,
    pull: 24,
    blower: false,
    manual: false,
  },
  {
    id: "v12",
    name: "Ferrari V12",
    tag: "V12 6.5 · aullido hasta 8.900 rpm",
    kind: "ice",
    sample: "i4",
    cylinders: 12,
    idle: 920,
    redline: 8900,
    gears: 7,
    topKmh: 340,
    tone: 1.38,
    lump: 0.06,
    pull: 33,
    blower: false,
    manual: false,
  },
  {
    id: "hellcat",
    name: "Dodge Hellcat",
    tag: "V8 6.2 sobrealimentado · cambios secos de manual",
    kind: "ice",
    sample: "v8",
    cylinders: 8,
    idle: 840,
    redline: 6200,
    gears: 6,
    topKmh: 330,
    tone: 0.48,
    lump: 0.62,
    pull: 32,
    blower: true,
    manual: true,
  },
  {
    id: "hearse",
    name: "Haunted Hearse",
    tag: "Sin motor: latido, viento y un grito si revolucionas parado",
    kind: "haunt",
    cylinders: 8,
    idle: 700,
    redline: 5200,
    gears: 4,
    topKmh: 140,
    tone: 0.4,
    lump: 0.2,
    pull: 12,
    blower: false,
    manual: false,
  },
  {
    id: "zen",
    name: "Electric Zen",
    tag: "Zumbido eléctrico · grave al acelerar, casi silencio al soltar",
    kind: "ev",
    cylinders: 1,
    idle: 0,
    redline: 9000,
    gears: 1,
    topKmh: 250,
    tone: 1,
    lump: 0,
    pull: 36,
    blower: false,
    manual: false,
  },
  {
    id: "rally",
    name: "Rally Cinco",
    tag: "Cinco cilindros · 7.800 rpm · warble de rally",
    kind: "ice",
    sample: "mini",
    cylinders: 5,
    idle: 1050,
    redline: 7800,
    gears: 6,
    topKmh: 230,
    tone: 0.96,
    lump: 0.9,
    pull: 27,
    blower: false,
    manual: false,
  },
];

const PINNED_IDS = ["maniac", "gt3", "v8", "v12", "hellcat", "hearse"];

function makeRatios(count) {
  const first = 3.55;
  const last = 0.72;
  const ratios = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 1 : i / (count - 1);
    ratios.push(first * Math.pow(last / first, t));
  }
  return ratios;
}

function prepareCar(car) {
  const ratios = makeRatios(car.gears);
  const last = ratios[ratios.length - 1];
  return {
    ...car,
    ratios,
    gaugeMax: 10000,
    rpmPerKmh: (car.redline * 0.97) / (car.topKmh * last),
  };
}

const GARAGE = CARS.map(prepareCar);

function carById(id) {
  return GARAGE.find((car) => car.id === id) || GARAGE[0];
}
