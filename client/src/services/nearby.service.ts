import axios from 'axios';

export interface Place {
  id: number;
  name: string;
  lat: number;
  lon: number;
  type: string;
  address?: string;
}

class NearByService {
  async searchPlace(
    query: string
  ): Promise<{ lat: number; lon: number; display_name: string } | null> {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 1,
        },
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          display_name: response.data[0].display_name,
        };
      }
      return null;
    } catch (_error) {
      console.error(_error);
      throw _error;
    }
  }

  async getSuggestions(
    query: string
  ): Promise<{ display_name: string; lat: string; lon: string }[]> {
    if (!query || query.length < 3) return [];
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 10,
        },
      });
      return response.data || [];
    } catch (_error) {
      console.error(_error);
      return [];
    }
  }

  async getNearbyPlaces(lat: number, lon: number, radius: number = 2000): Promise<Place[]> {
    try {
      const query = `
                [out:json][timeout:25];
                (
                  node["tourism"](around:${radius},${lat},${lon});
                  node["amenity"~"restaurant|cafe|bar|pub"](around:${radius},${lat},${lon});
                  node["leisure"~"park|garden"](around:${radius},${lat},${lon});
                  way["tourism"](around:${radius},${lat},${lon});
                  way["amenity"~"restaurant|cafe|bar|pub"](around:${radius},${lat},${lon});
                );
                out body;
                >;
                out skel qt;
            `;

      const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      interface OverpassElement {
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: {
          name?: string;
          amenity?: string;
          tourism?: string;
          leisure?: string;
          [key: string]: string | undefined;
        };
      }

      return response.data.elements
        .filter(
          (el: OverpassElement) => el.tags && (el.tags.name || el.tags.amenity || el.tags.tourism)
        )
        .map((el: OverpassElement) => ({
          id: el.id,
          name: el.tags?.name || el.tags?.amenity || el.tags?.tourism || 'Unknown',
          lat: el.lat || (el.center ? el.center.lat : 0),
          lon: el.lon || (el.center ? el.center.lon : 0),
          type: el.tags?.tourism || el.tags?.amenity || el.tags?.leisure || 'place',
        }));
    } catch (_error) {
      console.error(_error);
      throw _error;
    }
  }
}

export const nearbyService = new NearByService();
