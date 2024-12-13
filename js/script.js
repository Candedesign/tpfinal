const pokemon = [
    { nombre: "Alakazam", tipo: "Psiquico", id: 65, habilidad: "Psyco-rayo", imagen: "img/alakazam.png" },
    { nombre: "Charizard", tipo: "Fuego", id: 6, habilidad: "Lanzallama", imagen: "img/charizard.png" },
    { nombre: "Eevee", tipo: "Normal", id: 133, habilidad: "Ataque rapido", imagen: "img/eevee.png" },
    { nombre: "Garchomp", tipo: "Dragon", id: 445, habilidad: "Hyperrayo", imagen: "img/garchomp.png" },
    { nombre: "Gengar", tipo: "Fantasma", id: 94, habilidad: "Hipnosis", imagen: "img/gengar.png" },
    { nombre: "Lucario", tipo: "Lucha", id: 448, habilidad: "Esfera aurea", imagen: "img/lucario.png" },
    { nombre: "Nidorino", tipo: "Veneno", id: 33, habilidad: "Cuerno taladro", imagen: "img/nidorino.png" },
    { nombre: "Pikachu", tipo: "Electrico", id: 25, habilidad: "Rayo", imagen: "img/pikachu.png" },
];

async function obtenerInformacionPokemon(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        const salud = data.stats.find(stat => stat.stat.name === 'hp').base_stat;
        const ataque = data.stats.find(stat => stat.stat.name === 'attack').base_stat;
        return { salud, ataque };
    } catch (error) {
        console.error('Tenemos problemas con la info de este Pokémon:', error);
        return { salud: 'Desconocido', ataque: 'Desconocido' };
    }
}

async function crearCard(pokemon, conBoton = true, esEquipoElegido = false) {
    try {
        const { salud, ataque } = await obtenerInformacionPokemon(pokemon.id);
        const card = document.createElement('div');
        card.classList.add('card');
        if (esEquipoElegido) card.classList.add('equipo-elegido');

        const textoContenedor = document.createElement('div');
        textoContenedor.classList.add('texto-contenedor');
        
        const nombre = document.createElement('h3');
        nombre.textContent = pokemon.nombre.toUpperCase();
        nombre.classList.add('nombre-pokemon');

        const tipo = document.createElement('h2');
        tipo.textContent = `Tipo ${pokemon.tipo.toUpperCase()}`;
        tipo.classList.add('tipo-pokemon');

        const statsContenedor = document.createElement('div');
        statsContenedor.classList.add('stats-contenedor');

        const saludElement = document.createElement('p');
        saludElement.textContent = `Salud: ${salud} HP`;
        saludElement.classList.add('info');

        const ataqueElement = document.createElement('p');
        ataqueElement.textContent = `Ataque: ${ataque} PP`;
        ataqueElement.classList.add('info');

        const habilidad = document.createElement('p');
        habilidad.textContent = `Habilidad: ${pokemon.habilidad || 'Desconocida'}`;
        habilidad.classList.add('info');

        statsContenedor.appendChild(saludElement);
        statsContenedor.appendChild(ataqueElement);
        statsContenedor.appendChild(habilidad);

        textoContenedor.appendChild(nombre);
        textoContenedor.appendChild(tipo);
        textoContenedor.appendChild(statsContenedor);

        if (conBoton) {
            const boton = document.createElement('button');
            boton.textContent = "Agregar al equipo".toUpperCase();
            boton.classList.add('agregar-boton');
            boton.addEventListener('click', () => agregarAlEquipo(pokemon));
            textoContenedor.appendChild(boton);
        }

        const imagen = document.createElement('img');
        imagen.src = pokemon.imagen;
        card.appendChild(textoContenedor);
        card.appendChild(imagen);

        return card;
    } catch (error) {
        console.error("Error al crear la tarjeta para el Pokémon:", pokemon.nombre, error);
        return null;
    }
}

function agregarAlEquipo(pokemon) {
    let equipo = JSON.parse(localStorage.getItem('equipo')) || [];
    const EnElEquipo = equipo.some(p => p.nombre === pokemon.nombre);
    
    if (equipo.length >= 3) {
        Swal.fire({
            title: 'Error',
            text: 'No puedes agregar más de 3 Pokémon a tu equipo.',
            imageUrl: 'img/pika_error.png',
            imageWidth: 130, 
            imageHeight: 100,
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (!EnElEquipo) {
        equipo.push(pokemon);
        localStorage.setItem('equipo', JSON.stringify(equipo));
        Swal.fire({
            title: '¡Excelente!',
            text: `Agregaste a ${pokemon.nombre} a tu equipo!`,
            imageUrl: 'img/pika_ok.png',
            imageWidth: 100, 
            imageHeight: 150,
            confirmButtonText: 'Genial',
        });
        cargarEquipo();
    } else {
        Swal.fire({
            title: 'Advertencia',
            text: `${pokemon.nombre} ya está en tu equipo.`,
            imageUrl: 'img/pika_error.png',
            imageWidth: 130, 
            imageHeight: 100,
            confirmButtonText: 'Entendido'
        });
    }

    actualizarBotonComenzar();
}

async function cargarEquipo() {
    let equipo = JSON.parse(localStorage.getItem('equipo')) || [];
    const equipoContenedor = document.getElementById('equipoelegido');
    equipoContenedor.innerHTML = ''; 

    for (const pokemon of equipo) {
        const card = await crearCard(pokemon, false, true);
        if (card) equipoContenedor.appendChild(card);
    }

    actualizarBotonComenzar();
}

function actualizarBotonComenzar() {
    const equipo = JSON.parse(localStorage.getItem('equipo')) || [];
    const comenzarBoton = document.getElementById('comenzar-boton');
    if (equipo.length === 3) {
        comenzarBoton.style.display = 'block';
    } else {
        comenzarBoton.style.display = 'none';
    }
}

async function cargarPokemons() {
    const contenedor = document.getElementById('cardpokemon');
    for (const p of pokemon) {
        const card = await crearCard(p);
        contenedor.appendChild(card);
    }
}

async function elegirPokemonsAlAzar() {
    const pokemonAleatorios = [];
    const pokemonCopiados = [...pokemon]; 

    for (let i = 0; i < 3; i++) {
        const indiceAleatorio = Math.floor(Math.random() * pokemonCopiados.length);
        const pokemonSeleccionado = pokemonCopiados.splice(indiceAleatorio, 1)[0];  
        pokemonAleatorios.push(pokemonSeleccionado);
    }

    mostrarPokemonDelOrdenador(pokemonAleatorios); 
}

async function mostrarPokemonDelOrdenador(pokemonAleatorios) {
    const contenedorOrdenador = document.getElementById('equipoordenador');
    contenedorOrdenador.innerHTML = '';  

    for (const pokemon of pokemonAleatorios) {
        const card = await crearCard(pokemon, false, false);
        if (card) {
            const contenedorPokemon = document.createElement('div'); 
            card.classList.add('cardoponente'); 
            contenedorPokemon.appendChild(card);
            contenedorOrdenador.appendChild(contenedorPokemon);
        }
    }
}

document.getElementById('comenzar-boton').addEventListener('click', () => {
    elegirPokemonsAlAzar();

    setTimeout(() => {
        Swal.fire({
            title: 'Comienza la Batalla',
            text: '¡Que comience la pelea!',
            imageUrl: 'img/versus.png',
            imageWidth: 300, 
            imageHeight: 100,
            confirmButtonText: 'Comenzar'
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('La batalla ha comenzado');
                iniciarCombate();
            }
        });
    }, 5000);  // 5000 ms = 5 segundos
});

function iniciarCombate() {
    const equipoJugador = JSON.parse(localStorage.getItem('equipo')) || [];
    const pokemonJugador = equipoJugador[Math.floor(Math.random() * equipoJugador.length)];
    const pokemonOrdenador = pokemon[Math.floor(Math.random() * pokemon.length)];

    Swal.fire({
        title: `${pokemonJugador.nombre} VS ${pokemonOrdenador.nombre}`,
        html: `
            <div style="display: flex; justify-content: space-around; align-items: center;">
                <div>
                    <img src="${pokemonJugador.imagen}" alt="${pokemonJugador.nombre}" style="width: 100px; height: 100px; border-radius: 10px;">
                    <p>${pokemonJugador.nombre}</p>
                </div>
                <p style="font-size: 24px; font-weight: bold;">VS</p>
                <div>
                    <img src="${pokemonOrdenador.imagen}" alt="${pokemonOrdenador.nombre}" style="width: 100px; height: 100px; border-radius: 10px;">
                    <p>${pokemonOrdenador.nombre}</p>
                </div>
            </div>
        `,
        confirmButtonText: 'Comenzar batalla'
    }).then(() => {
        console.log('Inicia el combate entre', pokemonJugador.nombre, 'y', pokemonOrdenador.nombre);
        iniciarBatalla(pokemonJugador, pokemonOrdenador);
    });    
    
}

cargarPokemons();
cargarEquipo();
