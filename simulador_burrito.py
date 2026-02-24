import firebase_admin
from firebase_admin import credentials, db
import time
import math

DB_URL = 'https://burritounmsm-default-rtdb.firebaseio.com/'
REF_PATH = 'ubicacion_burrito'

# 🚀 IMITANDO LA APP CONDUCTOR (Envío cada 3 segundos exactos)
VELOCIDAD_METROS_POR_SEGUNDO = 8.0 
INTERVALO_ENVIO = 3.0  

PARADEROS = {
    "Odontología": (-12.054874, -77.085864), "Plaza Cívica": (-12.056032, -77.084961),
    "Gimnasio": (-12.059645, -77.084506), "Comedor": (-12.060779, -77.082937),
    "Ing. Industrial": (-12.060286, -77.080576), "Puerta 2": (-12.059591, -77.079673),
    "F. de Derecho": (-12.057659, -77.080160), "Clínica": (-12.055556, -77.082098),
    "Puerta 7": (-12.054729, -77.083637), "Sistemas": (-12.053732, -77.085652),
}

RUTA_BASE = [
    [-77.085862, -12.054858], [-77.085402, -12.054911], [-77.085367, -12.05492], [-77.085332, -12.054926], 
    [-77.085332, -12.054926], [-77.085359, -12.054955], [-77.08537, -12.054992], [-77.085363, -12.055031], 
    [-77.08534, -12.055063], [-77.085305, -12.055082], [-77.085305, -12.055082], [-77.085265, -12.055084], 
    [-77.085228, -12.055069], [-77.085096, -12.055159], [-77.084988, -12.055224], [-77.084775, -12.055352], 
    [-77.084775, -12.055352], [-77.084805, -12.055618], [-77.084813, -12.055689], [-77.084819, -12.05574], 
    [-77.084902, -12.055934], [-77.084963, -12.056031], [-77.085105, -12.056259], [-77.085133, -12.056304], 
    [-77.085145, -12.056323], [-77.085208, -12.056445], [-77.08539, -12.056868], [-77.08556, -12.057307], 
    [-77.085636, -12.05751], [-77.085636, -12.05751], [-77.085749, -12.057781], [-77.085761, -12.057855], 
    [-77.085757, -12.057911], [-77.085736, -12.057984], [-77.085692, -12.058066], [-77.085652, -12.058127], 
    [-77.085464, -12.058237], [-77.085153, -12.058412], [-77.084908, -12.058541], [-77.084908, -12.058541], 
    [-77.084887, -12.058677], [-77.084652, -12.058848], [-77.084627, -12.058889], [-77.08461, -12.058935], 
    [-77.084617, -12.058987], [-77.084617, -12.058987], [-77.084631, -12.059078], [-77.084506, -12.059645], 
    [-77.084417, -12.060045], [-77.084397, -12.060126], [-77.084364, -12.060269], [-77.084277, -12.06064], 
    [-77.084239, -12.060821], [-77.084215, -12.060934], [-77.084215, -12.060934], [-77.082938, -12.060772], 
    [-77.082857, -12.060762], [-77.08283, -12.060759], [-77.082438, -12.060707], [-77.082306, -12.06069], 
    [-77.081359, -12.060482], [-77.081255, -12.060456], [-77.080783, -12.060335], [-77.080669, -12.060306], 
    [-77.080574, -12.06028], [-77.079945, -12.060111], [-77.079831, -12.060067], [-77.079735, -12.059978], 
    [-77.07968, -12.059903], [-77.079653, -12.059809], [-77.079653, -12.059711], [-77.079666, -12.059623], 
    [-77.079676, -12.059592], [-77.079703, -12.059506], [-77.07971, -12.059486], [-77.079824, -12.059032], 
    [-77.079917, -12.058638], [-77.080096, -12.057904], [-77.08016, -12.057659], [-77.08018, -12.057585], 
    [-77.080223, -12.05742], [-77.080268, -12.05725], [-77.080279, -12.057208], [-77.080288, -12.057176], 
    [-77.080296, -12.057145], [-77.080332, -12.056956], [-77.080389, -12.056686], [-77.08044, -12.056579], 
    [-77.080476, -12.056523], [-77.080589, -12.056413], [-77.080754, -12.056413], [-77.080815, -12.056374], 
    [-77.080872, -12.056335], [-77.081185, -12.05613], [-77.081606, -12.055868], [-77.081707, -12.055798], 
    [-77.08192, -12.055667], [-77.082099, -12.055555], [-77.082246, -12.055464], [-77.08236, -12.0554], 
    [-77.082381, -12.055385], [-77.082424, -12.055361], [-77.082467, -12.055341], [-77.0825, -12.055333], 
    [-77.082516, -12.055329], [-77.082554, -12.055335], [-77.082574, -12.055342], [-77.082586, -12.055347], 
    [-77.082685, -12.055413], [-77.082762, -12.05547], [-77.082834, -12.055494], [-77.082908, -12.055496], 
    [-77.083235, -12.055458], [-77.083298, -12.055413], [-77.083402, -12.055208], [-77.083542, -12.05489], 
    [-77.083606, -12.054768], [-77.083639, -12.054722], [-77.083682, -12.054677], [-77.083766, -12.054641], 
    [-77.083772, -12.054638], [-77.083923, -12.054554], [-77.083935, -12.054547], [-77.083976, -12.054502], 
    [-77.084386, -12.054267], [-77.084727, -12.054064], [-77.084756, -12.054043], [-77.084986, -12.053903], 
    [-77.085024, -12.053861], [-77.085099, -12.053806], [-77.085139, -12.053786], [-77.085194, -12.053775], 
    [-77.08529, -12.053765], [-77.085499, -12.053743], [-77.085651, -12.053727], [-77.085676, -12.053724], 
    [-77.085893, -12.053702], [-77.085966, -12.053691], [-77.086041, -12.053674], [-77.086101, -12.053632], 
    [-77.086139, -12.053599], [-77.08621, -12.053533], [-77.086288, -12.053502], [-77.086398, -12.053483], 
    [-77.086405, -12.053511], [-77.086453, -12.053882], [-77.08649, -12.054172], [-77.086523, -12.054426], 
    [-77.086546, -12.054616], [-77.086571, -12.054667], [-77.086606, -12.054744], [-77.086521, -12.054783], 
    [-77.086224, -12.054818], [-77.085942, -12.054849], [-77.085862, -12.054858], [-77.085862, -12.054858]
]

def calcular_distancia(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    return 2 * R * math.asin(math.sqrt(math.sin((math.radians(lat2 - lat1))/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin((math.radians(lon2 - lon1))/2)**2))

def calcular_heading(lat1, lon1, lat2, lon2):
    return (math.degrees(math.atan2(math.sin(math.radians(lon2 - lon1)) * math.cos(math.radians(lat2)), math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) - math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(math.radians(lon2 - lon1)))) + 360) % 360

def simular_profesional():
    print("🚌 Simulador (Mimic App Conductor 3s) Activo...")
    try:
        firebase_admin.initialize_app(credentials.Certificate("serviceAccountKey.json"), {'databaseURL': DB_URL})
    except ValueError:
        pass 
        
    bus_ref = db.reference(REF_PATH)
    indice_actual = 0
    distancia_acumulada_segmento = 0
    ultimo_paradero_visitado = None  # ✨ LA MEMORIA DEL BUS

    while True:
        if indice_actual >= len(RUTA_BASE) - 1:
            indice_actual = 0
            distancia_acumulada_segmento = 0

        p1, p2 = RUTA_BASE[indice_actual], RUTA_BASE[indice_actual + 1]
        dist_total = calcular_distancia(p1[1], p1[0], p2[1], p2[0])
        heading = calcular_heading(p1[1], p1[0], p2[1], p2[0])

        if distancia_acumulada_segmento >= dist_total:
            distancia_acumulada_segmento -= dist_total
            indice_actual += 1
            continue 

        frac = distancia_acumulada_segmento / dist_total if dist_total > 0 else 0
        curr_lon = p1[0] + (p2[0] - p1[0]) * frac
        curr_lat = p1[1] + (p2[1] - p1[1]) * frac

        en_paradero = False
        for nombre, coord in PARADEROS.items():
            if calcular_distancia(curr_lat, curr_lon, coord[0], coord[1]) < 20: 
                # ✨ COMPROBAMOS LA MEMORIA: ¿Ya paramos aquí recién?
                if ultimo_paradero_visitado == nombre:
                    continue # Lo ignoramos y pasamos de largo

                print(f"🛑 PARADA: {nombre} (15s)...")
                for _ in range(5): 
                    bus_ref.update({
                        'latitude': coord[0], 'longitude': coord[1], 
                        'speed': 0, 'heading': heading, 'isActive': True, 
                        'timestamp': int(time.time()*1000)
                    })
                    time.sleep(INTERVALO_ENVIO) 
                en_paradero = True
                ultimo_paradero_visitado = nombre # Memorizamos que ya paramos aquí
                distancia_acumulada_segmento += 25 
                break

        if not en_paradero:
            bus_ref.update({
                'latitude': curr_lat, 'longitude': curr_lon, 
                'speed': VELOCIDAD_METROS_POR_SEGUNDO * 3.6, 'heading': heading, 
                'isActive': True, 'timestamp': int(time.time()*1000)
            })
            print(f"🛰️ Avanzando | 📍 {round(curr_lat,5)}, {round(curr_lon,5)} | 🧭 {round(heading,1)}°")
            
            time.sleep(INTERVALO_ENVIO)
            distancia_acumulada_segmento += (VELOCIDAD_METROS_POR_SEGUNDO * INTERVALO_ENVIO)

if __name__ == "__main__":
    try:
        simular_profesional()
    except KeyboardInterrupt:
        print("\n👋 Simulación detenida.")