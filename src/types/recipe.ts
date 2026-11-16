export interface Recipe {
  id: string,
  title: string,
  description: string,
  ingredients: string[],
  photoUri?: string,
  latitude?: number,
  longitude?: number,
  placeName?: string,
  createdAt: Date,
  updatedAt: Date
}