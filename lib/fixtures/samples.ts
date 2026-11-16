// Sample images with curated verdicts. Photos come from Wikimedia Commons under CC0,
// public domain or CC BY 2.0, resized to 1200 px wide in public/samples (credits in
// public/samples/CREDITS.md). CC BY needs the author credited, so every sample carries
// its credit and the Classify screen shows it under the photo.
import type { Verdict } from "@/lib/fixtures/classification"

export type PhotoCredit = {
  author: string
  license: "CC0" | "Public domain" | "CC BY 2.0"
  /** The file's page on Wikimedia Commons: license, author and original resolution. */
  sourceUrl: string
}

export type SampleImage = {
  id: string
  label: string
  src: string
  alt: string
  verdict: Verdict
  credit: PhotoCredit
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`

export const samples: readonly SampleImage[] = [
  {
    id: "sample-01",
    label: "Classic",
    src: "/samples/hot-dog-mustard.jpg",
    alt: "A hot dog in a bun with a zigzag of yellow mustard, on a white background",
    verdict: "hot-dog",
    credit: { author: "Renee Comet", license: "Public domain", sourceUrl: commons("Hot_dog_with_mustard.png") },
  },
  {
    id: "sample-02",
    label: "Burger",
    src: "/samples/burger.jpg",
    alt: "A double-patty burger with lettuce, cheese and pickles, on a white background",
    verdict: "not-hot-dog",
    credit: { author: "Evan-Amos", license: "CC0", sourceUrl: commons("Big_Mac_hamburger.jpg") },
  },
  {
    id: "sample-03",
    label: "Corn dog",
    src: "/samples/corn-dog.jpg",
    alt: "Two corn dogs on sticks on a white plate, one with ketchup",
    verdict: "not-hot-dog",
    credit: { author: "Ocdp", license: "CC0", sourceUrl: commons("Corn_dog_001.jpg") },
  },
  {
    id: "sample-04",
    label: "Chicago style",
    src: "/samples/hot-dog-chicago.jpg",
    alt: "A Chicago-style hot dog with a pickle spear and onions in a paper tray",
    verdict: "hot-dog",
    credit: { author: "Benimoto", license: "CC BY 2.0", sourceUrl: commons("My_hot_dog_at_Hot_Doug%27s.jpg") },
  },
  {
    id: "sample-05",
    label: "Pizza",
    src: "/samples/pizza.jpg",
    alt: "Square slices of pizza with tomato sauce on a baking rack",
    verdict: "not-hot-dog",
    credit: { author: "Kurt Kaiser", license: "CC0", sourceUrl: commons("Pizza_25.jpg") },
  },
  {
    id: "sample-06",
    label: "Tacos",
    src: "/samples/tacos.jpg",
    alt: "Two shrimp tacos topped with grated cheese and greens",
    verdict: "not-hot-dog",
    credit: { author: "Alan Levine", license: "CC0", sourceUrl: commons("151_Dos_Tacos_de_Camarone.jpg") },
  },
  {
    id: "sample-07",
    label: "Loaded",
    src: "/samples/hot-dog-homemade-bun.jpg",
    alt: "A sausage in a homemade bun with relish and sauce, with sliced peppers on the plate",
    verdict: "hot-dog",
    credit: { author: "jeffreyw", license: "CC BY 2.0", sourceUrl: commons("Hot_dog_with_homemade_hot_dog_bun.jpg") },
  },
  {
    id: "sample-08",
    label: "Sushi",
    src: "/samples/sushi.jpg",
    alt: "Plates of sushi rolls on a steel counter",
    verdict: "not-hot-dog",
    credit: {
      author: "El Nuevo Doge",
      license: "CC0",
      sourceUrl: commons("Sushi,_Mazatl%C3%A1n,_14_de_junio_de_2023_02.jpg"),
    },
  },
  {
    id: "sample-09",
    label: "Salad",
    src: "/samples/salad.jpg",
    alt: "A falafel salad bowl with rice, greens and peppers",
    verdict: "not-hot-dog",
    credit: { author: "Andy Li", license: "CC0", sourceUrl: commons("Falafel_Super_Bowl_Salad_-_Leon_2025-10-27.jpg") },
  },
]

/** The credit for a preview URL, if it is one of the samples (uploads have none). */
export function creditFor(src: string): PhotoCredit | undefined {
  return samples.find((sample) => sample.src === src)?.credit
}
