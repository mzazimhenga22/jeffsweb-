import data from './placeholder-images.json'

const imageMap = new Map(data.placeholderImages.map((image) => [image.id, image]))

export const PlaceHolderImages = {
  find: (predicate: (image: (typeof data.placeholderImages)[number]) => boolean) =>
    data.placeholderImages.find(predicate),
  getById: (id: string) => imageMap.get(id),
  all: data.placeholderImages,
}
