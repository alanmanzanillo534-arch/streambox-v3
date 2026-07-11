const API_KEY = '3b16c961cf16815cd9f77b43e5bb74e5'; // <-- ¡No olvides poner tu API KEY aquí!
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

// 1. Cargar películas populares al iniciar
async function cargarPeliculasPopulares() {
    try {
        const respuesta = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-MX`);
        const datos = await respuesta.json();
        mostrarPeliculas(datos.results);
    } catch (error) {
        console.error("Error obteniendo películas:", error);
    }
}

// 2. Pintar las tarjetas en la pantalla
function mostrarPeliculas(peliculas) {
    const contenedor = document.getElementById('contenedor-peliculas');
    contenedor.innerHTML = '';

    if (peliculas.length === 0) {
        contenedor.innerHTML = `<p style="padding: 20px; color: #aaa;">No se encontraron resultados.</p>`;
        return;
    }

    peliculas.forEach(pelicula => {
        if (!pelicula.poster_path) return; // Se salta las que no tengan portada
        
        const card = document.createElement('div');
        card.classList.add('pelicula-card');
        card.innerHTML = `
            <img src="${IMG_URL}${pelicula.poster_path}" alt="${pelicula.title || pelicula.name}">
        `;
        
        // Detecta inteligentemente si es película o serie usando los datos de TMDB
        const tipo = pelicula.title ? 'movie' : 'tv';
        
        card.addEventListener('click', () => abrirModalDetalle(pelicula.id, tipo));
        contenedor.appendChild(card);
    });
}

// 3. Buscar Películas o Series
async function buscarContenido() {
    const query = document.getElementById('input-busqueda').value.trim();
    if (!query) return;

    try {
        document.getElementById('titulo-seccion').textContent = `Resultados para: "${query}"`;
        // El endpoint 'search/multi' busca tanto películas como series a la vez
        const respuesta = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-MX&query=${encodeURIComponent(query)}`);
        const datos = await respuesta.json();
        mostrarPeliculas(datos.results);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
    }
}

// Escuchas para activar la búsqueda (clic al botón o presionar Enter)
document.getElementById('btn-buscar').addEventListener('click', buscarContenido);
document.getElementById('input-busqueda').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscarContenido();
});

// 4. Abrir ventana de detalles
async function abrirModalDetalle(id, tipo) {
    try {
        const respuesta = await fetch(`${BASE_URL}/${tipo}/${id}?api_key=${API_KEY}&language=es-MX`);
        const contenido = await respuesta.json();

        // Llenar información (Maneja título de película o nombre de serie)
        document.getElementById('modal-titulo').textContent = contenido.title || contenido.name;
        document.getElementById('modal-sinopsis').textContent = contenido.overview || "Sin descripción disponible.";
        document.getElementById('modal-banner').style.backgroundImage = `url('${BACKDROP_URL}${contenido.backdrop_path}')`;

        // Configurar acción del botón reproducir
        const btnPlay = document.getElementById('modal-btn-reproducir');
        btnPlay.onclick = () => activarReproductor(contenido.id, tipo);

        // Mostrar el modal
        document.getElementById('modal-detalle').style.display = 'flex';
    } catch (error) {
        console.error("Error abriendo detalles:", error);
    }
}

// 5. Activar el Reproductor
function activarReproductor(id, tipo) {
    const contenedorRepro = document.getElementById('contenedor-reproductor');
    const iframeRepro = document.getElementById('reproductor-video');
    
    if (contenedorRepro && iframeRepro) {
        // Servidor emby de autoembed limpio
        iframeRepro.src = `https://vidsrc.su/embed/${tipo}/${id}`; 
        contenedorRepro.style.display = 'block';
        
            // Hacemos scroll automático hacia el reproductor para ver el video de una vez
        contenedorRepro.scrollIntoView({ behavior: 'smooth' });
    }
}

// 6. Cerrar el modal (Botón atrás) y apagar el video
function cerrarModalDetalle() {
    document.getElementById('modal-detalle').style.display = 'none';
    
    const contenedorRepro = document.getElementById('contenedor-reproductor');
    const iframeRepro = document.getElementById('reproductor-video');
    
    if (contenedorRepro && iframeRepro) {
        iframeRepro.src = 'https://vidsrc.to/embed/${tipo}/${id}'; 
        contenedorRepro.style.display = 'none';
    }
}

// Arrancar la aplicación
cargarPeliculasPopulares();
