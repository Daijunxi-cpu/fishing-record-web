declare namespace AMap {
  class Map {
    constructor(container: HTMLElement, options: any)
    on(event: string, callback: (e: any) => void): void
    setCenter(position: [number, number]): void
  }

  class Marker {
    constructor(options: { position: [number, number]; map: Map })
    setPosition(position: [number, number]): void
  }

  class Geocoder {
    getAddress(position: [number, number], callback: (status: string, result: any) => void): void
  }
}

interface Window {
  AMap: typeof AMap
} 