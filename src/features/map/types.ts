export interface BurritoLocation {
    latitude: number;   
    longitude: number;  
    heading: number;    
    isActive: boolean;  
    timestamp?: number;  
    // C4.6 experimental: speed que publica la DriverApp en RTDB. Señal
    // complementaria para la estrategia C (nunca decide por sí sola).
    speed?: number;
}


export interface MapRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number; 
    longitudeDelta: number; 
}


