import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, catchError } from 'rxjs';
import { Zone } from '../models/zone.entity';
import { Location } from '../models/location.entity';
import { ZoneResource, CreateZoneResource, LocationResource, CreateLocationResource, UpdateLocationStatusResource } from '../models/zone.resource';
import { ZoneAssembler } from '../mappers/zone.assembler';
import { LocationAssembler } from '../mappers/location.assembler';
import { environment } from '../../../../environments/environment';
import { of } from 'rxjs';

/**
 * Interface for Zone with its locations
 */
export interface ZoneWithLocations {
  zone: Zone;
  locations: Location[];
}

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private baseUrl = `${environment.apiBaseUrl}/zones`;

  constructor(private http: HttpClient) {}

  // Zone operations
  getAllZones(): Observable<Zone[]> {
    return this.http.get<ZoneResource[]>(this.baseUrl).pipe(
      map(resources => resources.map(resource => ZoneAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error('Error in getAllZones:', error);
        // Return mock data for development
        return of(this.getMockZones());
      })
    );
  }

  /**
   * Get all zones with their locations included
   * This is more efficient than loading zones and locations separately
   */
  getZonesWithLocations(): Observable<ZoneWithLocations[]> {
    return forkJoin({
      zones: this.getAllZones(),
      allLocations: this.getAllLocations()
    }).pipe(
      map(({ zones, allLocations }) => {
        return zones.map(zone => ({
          zone,
          locations: allLocations.filter(location => location.zoneId === zone.id)
        }));
      }),
      catchError(error => {
        console.error('Error in getZonesWithLocations:', error);
        // Return mock data structure
        return of(this.getMockZonesWithLocations());
      })
    );
  }

  getZoneById(id: number): Observable<Zone> {
    return this.http.get<ZoneResource>(`${this.baseUrl}/${id}`).pipe(
      map(resource => ZoneAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error getting zone ${id}:`, error);
        // Return mock zone
        const mockZones = this.getMockZones();
        const mockZone = mockZones.find(z => z.id === id) || mockZones[0];
        return of(mockZone);
      })
    );
  }

  /**
   * Get a zone with its locations included
   */
  getZoneWithLocations(zoneId: number): Observable<ZoneWithLocations> {
    return forkJoin({
      zone: this.getZoneById(zoneId),
      locations: this.getLocationsByZoneId(zoneId)
    }).pipe(
      map(({ zone, locations }) => ({
        zone,
        locations
      })),
      catchError(error => {
        console.error(`Error getting zone ${zoneId} with locations:`, error);
        const mockData = this.getMockZonesWithLocations();
        return of(mockData.find(z => z.zone.id === zoneId) || mockData[0]);
      })
    );
  }

  createZone(zone: Zone): Observable<Zone> {
    const createResource = ZoneAssembler.toResourceFromEntity(zone);
    return this.http.post<ZoneResource>(this.baseUrl, createResource).pipe(
      map(resource => ZoneAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error('Error creating zone:', error);
        // For development, simulate creation
        const newZone = new Zone(Date.now(), zone.tenantId, zone.name);
        return of(newZone);
      })
    );
  }

  // Location operations
  getAllLocations(): Observable<Location[]> {
    // Correct API endpoint for all locations
    return this.http.get<LocationResource[]>(`${environment.apiBaseUrl}/zones/zones/locations`).pipe(
      map(resources => resources.map(resource => LocationAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error('Error in getAllLocations:', error);
        // Return mock locations for development
        return of(this.getMockLocations());
      })
    );
  }

  getLocationById(id: number): Observable<Location> {
    return this.http.get<LocationResource>(`${environment.apiBaseUrl}/locations/${id}`).pipe(
      map(resource => LocationAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error getting location ${id}:`, error);
        const mockLocations = this.getMockLocations();
        const mockLocation = mockLocations.find(l => l.id === id) || mockLocations[0];
        return of(mockLocation);
      })
    );
  }

  getLocationsByZoneId(zoneId: number): Observable<Location[]> {
    return this.http.get<LocationResource[]>(`${this.baseUrl}/${zoneId}/locations`).pipe(
      map(resources => resources.map(resource => LocationAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error(`Error getting locations for zone ${zoneId}:`, error);
        // Return mock locations filtered by zone
        const mockLocations = this.getMockLocations();
        return of(mockLocations.filter(l => l.zoneId === zoneId));
      })
    );
  }

  addLocationToZone(zoneId: number, location: Location): Observable<Location> {
    const createResource = LocationAssembler.toResourceFromEntity(location);
    return this.http.post<LocationResource>(`${this.baseUrl}/${zoneId}/locations`, createResource).pipe(
      map(resource => LocationAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error('Error adding location to zone:', error);
        // For development, simulate creation
        const newLocation = new Location(
          Date.now(),
          zoneId,
          location.address,
          location.city,
          location.country,
          location.latitude,
          location.longitude,
          location.status
        );
        return of(newLocation);
      })
    );
  }

  updateLocationStatus(id: number, status: string): Observable<Location> {
    const updateResource: UpdateLocationStatusResource = { status };
    return this.http.patch<LocationResource>(`${environment.apiBaseUrl}/locations/${id}/status`, updateResource).pipe(
      map(resource => LocationAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error('Error updating location status:', error);
        // For development, return updated mock location
        const mockLocations = this.getMockLocations();
        const mockLocation = mockLocations.find(l => l.id === id) || mockLocations[0];
        return of(new Location(
          mockLocation.id,
          mockLocation.zoneId,
          mockLocation.address,
          mockLocation.city,
          mockLocation.country,
          mockLocation.latitude,
          mockLocation.longitude,
          status
        ));
      })
    );
  }

  getLocationsByStatus(status: string): Observable<Location[]> {
    return this.http.get<LocationResource[]>(`${environment.apiBaseUrl}/locations/status/${status}`).pipe(
      map(resources => resources.map(resource => LocationAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error(`Error getting locations by status ${status}:`, error);
        const mockLocations = this.getMockLocations();
        return of(mockLocations.filter(l => l.status === status));
      })
    );
  }

  // Mock data for development
  private getMockZones(): Zone[] {
    return [
      new Zone(1, 1, 'Zona Norte'),
      new Zone(2, 1, 'Zona Sur'),
      new Zone(3, 1, 'Zona Este'),
      new Zone(4, 1, 'Zona Oeste'),
      new Zone(5, 1, 'Zona Central')
    ];
  }

  private getMockLocations(): Location[] {
    return [
      new Location(1, 1, 'Av. Principal 123', 'Lima', 'Perú', -12.0464, -77.0428, 'ACTIVE'),
      new Location(2, 1, 'Jr. Comercio 456', 'Lima', 'Perú', -12.0565, -77.0428, 'ACTIVE'),
      new Location(3, 2, 'Av. El Sol 789', 'Cusco', 'Perú', -13.5319, -71.9675, 'ACTIVE'),
      new Location(4, 2, 'Jr. Triunfo 321', 'Cusco', 'Perú', -13.5170, -71.9785, 'INACTIVE'),
      new Location(5, 3, 'Av. Brasil 654', 'Arequipa', 'Perú', -16.4090, -71.5375, 'ACTIVE'),
      new Location(6, 4, 'Jr. Unión 987', 'Trujillo', 'Perú', -8.1116, -79.0290, 'ACTIVE'),
      new Location(7, 5, 'Av. Garcilazo 147', 'Lima', 'Perú', -12.0720, -77.0850, 'ACTIVE')
    ];
  }

  private getMockZonesWithLocations(): ZoneWithLocations[] {
    const zones = this.getMockZones();
    const locations = this.getMockLocations();
    
    return zones.map(zone => ({
      zone,
      locations: locations.filter(location => location.zoneId === zone.id)
    }));
  }
}
