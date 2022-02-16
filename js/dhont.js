/**
 * @author [Manuel Guillén Gallardo]
 * @email [mguigadev@gmail.com]
 * @create date 22-01-2022 11:09:20
 * @modify date 22-01-2022 20:01:59
 * @desc [Revisión Simulador Ley D'Hont]
 */

let add;
let remove;
let element;
let input;
let seats;

let parties;
let percentResults;
let graphicResults;
let pactometerView;
let pactometerParties;

let totalVotes;
let arrInputs;
let arrParties;
let arrWinnersParties;
let arrWinnersPartiesNames;
let arrWinnersPartiesVotes;

let count = 1;
const keyNoAllowed = ["+", "-", ".", ","];

let errorSeats = "Debe introducir un número de escaños impar y superior a 3.";
let errorEmpty = "Debe introducir un valor.";
let errorName = "El nombre del partido debe tener más de tres caracteres";

document.addEventListener("DOMContentLoaded", assignEvents);

function assignEvents() {

    add = document.getElementById("add");
    add.addEventListener("click", addElement);

    seats = document.getElementById("seats");

    parties = document.getElementById("parties");
    parties.addEventListener("click", function (e) {
        removeElement(e);
        clearPlaceHolder(e);
    });
    parties.addEventListener("keypress", function (e) {
        if (e.target.tagName == "INPUT" && e.target.type == "number" && keyNoAllowed.includes(e.key)) {
            e.preventDefault();
        }
    });
    parties.addEventListener("focusout", function (e) {
        validateData(e);
    });
    parties.addEventListener("input", function (e) {
        getData(e.target);
    });

    percentResults = document.getElementById("percentResults");
    graphicResults = document.getElementById("graphicResults");

    pactometerView = document.getElementById("pactometerView");
    pactometerView.addEventListener("click", function (e) {
        removePartieOfPactometerView(e);
    });
    pactometerParties = document.getElementById("pactometerParties");
    pactometerParties.addEventListener("click", function (e) {
        addPartieInPactometerView(e);
    });
}

/**
 * Añade un partido al grupo de partidos.
 */
function addElement() {
    count++;
    element = `<div class="party">
    <div class="form__group">
        <label for="pN${count}">Nombre</label>
        <input type="tex" name="pN${count}" />
    </div>
    <div class="form__group">
        <label for="pV${count}">Votos</label>
        <input type="number" name="pV${count}" value="0"/>
    </div>
    <button data-accion="remove">Eliminar</button>
</div>`
    parties.insertAdjacentHTML("beforeend", element);
}

/**
 * Elimina un elemento del grupo de partidos. En caso de que existiera el resultado de un cálculo representándose en la vista, será eliminado el partido de la ecuación y del resultado.
 * @param {*} e 
 */
function removeElement(e) {
    if (e.target.dataset.accion == "remove") {
        remove = e.target;
        remove.parentElement.remove();
        getData(e.target);
    }
}

/**
 * Cambia el valor "0" por defecto de los "input[type='number']". Esta función no produce cambios cuando el usuario ha introducido un valor.
 * Todos los "inputs[type='number']" representados en la vista presentarán "0" como valor por defecto en su primer renderizado.
 * @param {*} e 
 */
function clearPlaceHolder(e) {
    if (e.target.type == "number" && e.target.value == "0") {
        input = e.target;
        input.value = input.value == 0 ? "" : input.value;
    }
}

/**
 * Controla la validez de los datos introducidos por el usuario:
 * - No serán nulos.
 * - "input[type='text']": la longitud no será menor a 3.
 * - "[input[id='seats']": no será un número par.  
 * @param {*} e 
 */
function validateData(e) {
    if (e.target.tagName == "INPUT") {
        input = e.target;
        if (input.value == "" || (input.type == "text" && input.value.length < 3) || (input.name == "seats" && input.value % 2 === 0)) {
            switch (true) {
                case input.name == "seats":
                    mensajeError(errorSeats);
                    break;
                case input.type == "text":
                    mensajeError(errorName);
                    break;
                case input.value == "":
                    mensajeError(errorEmpty);
                    break;
            }
            input.classList.add("error");
            input.focus();
        } else {
            input.classList.remove("error");
        }
    }
}

/**
 * Emite una alerta que advierte sobre un error en una ventana emergente.
 * @param {*} tipoError 
 */
function mensajeError(tipoError) {
    new AWN().alert(tipoError, {
        durations: {
            success: 0
        }
    })
}
/**
 * Recoge los datos introducidos por el usuario y ejecuta la función @runDhont en caso de que cumplan las restricciones, o @removeResults en caso de que no cumplan las mismas.
 * @param {*} e 
 */
function getData(e) {
    arrInputs = new Array();
    arrInputsText = new Array();
    arrInputsNumber = new Array();
    arrInputs = Array.from(parties.getElementsByTagName("input"));
    if ((e.tagName == "INPUT" || e.tagName == "BUTTON")) {
        console.log(e)
        if (arrInputs.length >= 4) {
            runDhont();
        } else {
            removeResults();
        }
    }
}

/**
 * Llama a las funciones necesarias para el cálculo de los datos y la representación de los resultados.
 */
function runDhont() {
    removeResults();
    loadParties();
    calculateSeats();
    printPercentResults();
    printGraphicResults();
    printPartiesToPact();
}

/**
 * Carga los datos de los partidos en las estructuras que serán empleadas para realizar cálculos y representaciones. Diferenciamos:
 * - @party = objeto JSON (name, initialVotes, calculatedVotes, seats)
 * - @arrParties = array de objetos JSON (party...);
 */
function loadParties() {
    arrParties = new Array();
    let colecctionParties = Array.from(parties.querySelectorAll(".party"));
    for (let p of colecctionParties) {
        let valuesParty = Array.from(p.querySelectorAll("input"));
        let party = {
            name: "",
            initialVotes: "",
            calculatedVotes: "",
            seats: ""
        };
        party.name = valuesParty[0].value;
        party.initialVotes = valuesParty[1].value;
        party.calculatedVotes = party.initialVotes;
        arrParties.push(party);
    }
}

/**
 * Realiza el cálculo de los escaños correspondientes a los partidos según el número de escaños y cantidad de votos. 
 */
function calculateSeats() {
    let seatsCharged = seats.value;
    do {
        orderByCalculatedVotes(arrParties);
        arrParties[0].seats++;
        arrParties[0].calculatedVotes = arrParties[0].initialVotes / (arrParties[0].seats + 1);
        seatsCharged--;
    } while (seatsCharged > 0);
}

/**
 * Ordena la estructura de datos @arrParties según sus votos calculados.
 * @param {*} array 
 */
function orderByCalculatedVotes(array) {
    array.sort((a, b) => {
        if (a.calculatedVotes < b.calculatedVotes) {
            return 1;
        } else if (a.calculatedVotes > b.calculatedVotes) {
            return -1;
        } else {
            return 0;
        }
    });
}

/**
 * Ordena la estructura de datos @arrParties según sus votos calculados.
 * @param {*} array 
 */
function orderByInitialVotes(array) {
    array.sort((a, b) => {
        if (a.initialVotes > b.initialVotes) {
            return 1;
        } else if (a.initialVotes < b.initialVotes) {
            return -1;
        } else {
            return 0;
        }
    });
}

/**
 * Genera elementos HTML en los que se representarán los resultados porcentuales obtenidos de los cálculos y los añade a la vista. Solo serán representados aquellos partidos que hayan obtenido votos.
 */
function printPercentResults() {
    arrWinnersParties = new Array();
    arrWinnersPartiesNames = new Array();
    arrWinnersPartiesVotes = new Array();
    totalVotes = arrParties
        .map(element => parseInt(element.initialVotes))
        .reduce((element, accumulator) => element + accumulator);
    arrWinnersParties = new Array();
    arrWinnersParties = arrParties.filter(element => element.seats > 0);
    orderByInitialVotes(arrWinnersParties);
    for (let partie of arrWinnersParties) {
        percentResults.insertAdjacentHTML('beforeend', `<tr><td>El partido <strong>${partie.name}</strong> obtiene <strong>${partie.seats} escaños</strong> con un <strong>${(100*partie.initialVotes/totalVotes).toFixed(2)} %</strong> de los votos.</td></tr>`);
        arrWinnersPartiesNames.push(partie.name);
        arrWinnersPartiesVotes.push(partie.initialVotes);
    }
}

/**
 * Genera elementos HTML en los que se representarán los resultados obtenidos de los cálculos y los añade a la vista en modo de gráfico. Solo serán representados aquellos partidos que hayan obtenido votos.
 */
function printGraphicResults() {
    let char = `<canvas id="myChart"></canvas>`;
    graphicResults.insertAdjacentHTML('afterbegin', char);
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: arrWinnersPartiesNames,
            datasets: [{
                label: 'Resultado de la votación',
                data: arrWinnersPartiesVotes,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grace: 60,
                    ticks: {
                        min: 0,
                        stepSize: 1000
                    }
                }

            }
        }
    });
}

/**
 * Añade automáticamente los partidos que han obtenido escaños al "componente" @pactometerParties .
 */
function printPartiesToPact() {
    let calculatedSize = totalVotes / 500;
    for (let p of arrWinnersParties) {
        let randomColor = getRandomColor();
        let width = p.initialVotes / calculatedSize;
        let partyToPact = `<div class='partyToPact' style="background-color: ${randomColor};" data-width='${width}' data-color='${randomColor}' data-nombre='${p.name}'>
${p.name}
</div>`;
        pactometerParties.insertAdjacentHTML('afterbegin', partyToPact);

    }
}

/**
 * Captura el partido seleccionado por el usuario en el "componente" @pactometerPartie y lo añade a @pactometerView .
 * @param {*} evento 
 */
function addPartieInPactometerView(evento) {
    if (evento.target.id != "pactometerParties") {
        let party = evento.target;
        let partyPactometer = `<div class="partyPact" style="width: ${party.dataset.width}px; height: 80px; background: ${party.dataset.color};" data-color="${party.dataset.color}" data-width="${party.dataset.width}" data-nombre="${party.dataset.nombre}">${party.dataset.nombre}</div>`;
        pactometerView.insertAdjacentHTML("beforeend", partyPactometer);
        party.remove();
    }
}

/**
 * Captura el partido seleccionado por el usuario en el "componente" @pactometerView y lo añade a @pactometerPartie .
 * @param {*} evento 
 */
function removePartieOfPactometerView(evento) {
    if (evento.target.id != "pactometerView") {
        let party = evento.target;
        let partyPactometer = `<div class='partyToPact' style="background-color: ${party.dataset.color};" data-width='${party.dataset.width}' data-color='${party.dataset.color};' data-nombre="${party.dataset.nombre}">
        ${party.dataset.nombre}
    </div>`;
        pactometerParties.insertAdjacentHTML('beforeend', partyPactometer);
        party.remove();
    }

}

/**
 * Genera un color aleatorio que será asignado a un partido mediante el uso de números aleatorios para asignar la nomenclatura hexadecimal del mismo.
 * @returns 
 */
function getRandomColor() {
    hexadecimal = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
    randomColor = "#";
    for (i = 0; i < 6; i++) {
        let posarray = generateRandom(0, hexadecimal.length);
        randomColor += hexadecimal[posarray];
    }
    if (randomColor == "#FFFFFF") {
        randomColor = "#000000";
    }
    return randomColor;
}

/**
 * Genera un número aleatorio.
 * @param {*} inferior 
 * @param {*} superior 
 * @returns 
 */
function generateRandom(inferior, superior) {
    numPosibilidades = superior - inferior
    aleat = Math.random() * numPosibilidades
    aleat = Math.floor(aleat)
    return parseInt(inferior) + aleat;
}

/**
 * Restablece el vacío en la representación de resultados.
 */
function removeResults() {
    percentResults.innerText = "";
    graphicResults.innerText = "";
    pactometerView.innerHTML = `<p class="most">Mayoría Absoluta</p>`;
    pactometerParties.innerText = "";
}