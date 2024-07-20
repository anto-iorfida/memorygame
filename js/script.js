// selezionare il tabellone
const gridGame = document.getElementById('gridGame');

// contatore errori
let errorElement = document.getElementById('errors');
let errorNumber = parseInt(errorElement.textContent);
// contatore mosse
let movesElement = document.getElementById('moves');
let movesNumber = parseInt(movesElement.textContent);
// nome livello
let nameLevel = document.getElementById('levelName');
// punti logici
let point = 0;
// nome utente
let nameUser = '';
// livello selezionato
let selectedLevel = '';
// suono abilitato o no
let soundEnabled = true; // inizialmente il suono è abilitato
// variabile tempo gioco 
let startTime;

// disabilita il suono al click del bottone
document.getElementById('offSound').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    document.getElementById('offSound').textContent = soundEnabled ? 'Disabilita Suono' : 'Abilita Suono';
});





// array
const symbolsNovellino = ['a', 'a', 'b', 'b', 'c', 'c', 'd', 'd', 'e', 'e', 'f', 'f'];
const symbolsMeLaCavo = ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c', 'd', 'd', 'd', 'e', 'e', 'e', 'f', 'f', 'f'];
const symbolsArrogante = ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c', 'd', 'd', 'd', 'e', 'e', 'e', 'f', 'f', 'f', 'g', 'g', 'g', 'h', 'h', 'h'];

let symbols = [];

// larghezza card
let cardWidth = '';

// mescolare array 
let shuffledSymbols = [];

// inizializzare prima seconda carta null e terza variabile come false
let firstCard = null;
let secondCard = null;
let thirdCard = null;
let lockBoard = false;

// creare tabellone
function createBoard() {
    shuffledSymbols.forEach(symbol => {


        const card = document.createElement('div');
        // aggiunta classe standard per la classe
        card.classList.add('card');

        card.dataset.symbol = symbol;

        // al click chiama la funzione di girare la carta 
        card.addEventListener('click', flipCard);

        gridGame.appendChild(card);
    });

    setCardWidth(cardWidth);
}

// click gira la carta 
function flipCard() {
    // se la board è bloccata (in attesa che un controllo di match finisca), non fa nulla
    if (lockBoard) return;

    // se la carta cliccata è già una delle carte selezionate, non fa nulla
    if (this === firstCard || this === secondCard || this === thirdCard) return;

    // Riproduce il suono di click solo se il suono è abilitato
    if (soundEnabled) {
        const clickSound = document.getElementById('clickSound');
        clickSound.play();
    }

    // aggiunge la classe 'turned' alla carta cliccata per visualizzarla come girata
    this.classList.add('turned');

    // imposta il contenuto della carta con il simbolo contenuto nel suo attributo data-symbol
    // this.textContent = this.dataset.symbol;
    this.innerHTML = `<img src="css/img/${this.dataset.symbol}.png" alt="">`;

    // se non c'è ancora una prima carta selezionata, imposta questa carta come prima carta e termina la funzione
    if (!firstCard) {
        firstCard = this;
        return;
    }

    // se non c'è ancora una seconda carta selezionata, imposta questa carta come seconda carta
    if (!secondCard) {
        secondCard = this;
        // se il livello selezionato è 'me-la-cavo' o 'arrogante', termina la funzione qui (perché in questi livelli si gioca con 3 carte)
        if (selectedLevel === 'me-la-cavo' || selectedLevel === 'arrogante') {
            return;
        }
    }

    // se non c'è ancora una terza carta selezionata e il livello selezionato è 'me-la-cavo' o 'arrogante',
    // imposta questa carta come terza carta, blocca la board e controlla se c'è un match
    if (!thirdCard && (selectedLevel === 'me-la-cavo' || selectedLevel === 'arrogante')) {
        thirdCard = this;
        lockBoard = true;
        matchControll();
        return;
    }

    // se si è raggiunto questo punto, significa che il livello non è 'me-la-cavo' o 'arrogante', o si sta giocando con 2 carte.
    // blocca la board e controlla se c'è un match tra le due carte selezionate
    lockBoard = true;
    matchControll();
}

// controllare se le carte girate sono uguali
function matchControll() {
    let match = false;

    if (selectedLevel === 'me-la-cavo' || selectedLevel === 'arrogante') {
        match = firstCard.dataset.symbol === secondCard.dataset.symbol && firstCard.dataset.symbol === thirdCard.dataset.symbol;
    } else {
        match = firstCard.dataset.symbol === secondCard.dataset.symbol;
    }

    // incrementa il contatore delle mosse
    movesNumber++;
    movesElement.textContent = movesNumber;

    if (match) {
        // Riproduce il suono di click solo se il suono è abilitato
        if (soundEnabled) {
            const clickSound = document.getElementById('clickSoundSuccess');
            clickSound.play();
        }
        point++;
        // quando la partita finisce..
        if (point === symbols.length / (selectedLevel === 'me-la-cavo' || selectedLevel === 'arrogante' ? 3 : 2)) {
            // fine tempo
            const endTime = new Date();
            const timeTaken = Math.floor((endTime - startTime) / 1000);
            setTimeout(() => {
                alert(`Complimenti ${nameUser}`);
                addToLeaderboard(timeTaken);
                // addToLeaderboard(); // Aggiungi l'utente alla classifica
            }, 1000);
            gridGame.innerHTML = "";
            document.getElementById('buttonGame').textContent = 'Ricomincia Partita'
        }
        disableCard();
    } else {
        turnOver();
        // incrementa il contatore degli errori
        errorNumber++;
        errorElement.textContent = errorNumber;
    }
}

// disabilitare il click
function disableCard() {
    setTimeout(() => {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        if (selectedLevel === 'me-la-cavo' || selectedLevel === 'arrogante') {
            thirdCard.removeEventListener('click', flipCard);
            thirdCard.classList.add('matched');
            thirdCard.innerHTML = '';
        }
        firstCard.classList.add('matched');
        firstCard.innerHTML = '';
        secondCard.classList.add('matched');
        secondCard.innerHTML = '';
        resetBoard();
    }, 1000);
}

// se la carta non corrisponde si girano
function turnOver() {
    setTimeout(() => {
        firstCard.classList.remove('turned');
        secondCard.classList.remove('turned');
        firstCard.textContent = '';
        secondCard.textContent = '';
        if (selectedLevel === 'me-la-cavo' || selectedLevel === 'arrogante') {
            thirdCard.classList.remove('turned');
            thirdCard.textContent = '';
        }
        resetBoard();
    }, 1000);
}

// reset 
function resetBoard() {
    [firstCard, secondCard, thirdCard, lockBoard] = [null, null, null, false];
}

// funzione per ottenere il livello di difficoltà selezionato
function difficultyLevel() {
    const level = document.querySelector('#level').value;
    selectedLevel = level; // Imposta il livello selezionato

    if (level === 'me-la-cavo') {
        nameLevel.textContent = "Me la cavo";
        symbols = symbolsMeLaCavo;
        cardWidth = 'calc(100% / 6 - 16px)';
    } else if (level === 'arrogante') {
        nameLevel.textContent = "Arrogante";
        symbols = symbolsArrogante;
        cardWidth = 'calc(100% / 6 - 16px)';
    } else if (level === 'novellino') {
        nameLevel.textContent = "Novellino";
        symbols = symbolsNovellino;
        cardWidth = 'calc(100% / 4 - 16px)';
    }
}

// funzione per impostare la larghezza della carta
function setCardWidth(width) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.width = width;
    });
}

// funzione per avviare il gioco
function startGame() {
    document.getElementById('buttonGame').textContent = 'Rigioca'
    // cerca il nome all'utente usando prompt
    nameUser = prompt('Inserisci il tuo nome');

    // verifica se l'utente ha inserito un nome valido
    if (!nameUser) {
        alert('Devi inserire un nome prima di iniziare il gioco!');
        return;
    }

    // chiama il reset se si riclicca
    resetGame();

    // mostra tutte le carte per 5 secondo
    showAllCards();
    setTimeout(hideAllCards, 5000);
    // inizia il tempo
    startTime = new Date();

    // Esegui showAllCards() ogni 10 secondi e nascondile dopo 3 secondi
    // setInterval(() => {
    //     showAllCards();
    //     setTimeout(hideAllCards, 3000);
    // }, 15000);

}

// Mostra tutte le carte
function showAllCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        // card.classList.add('turned');
        // card.textContent = card.dataset.symbol;
        card.innerHTML = `<img src="css/img/${card.dataset.symbol}.png" alt="">`;
        card.classList.add('turned');
    });
}

// Nascondi tutte le carte
function hideAllCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        // card.classList.remove('turned');
        card.innerHTML = '';
        card.classList.remove('turned');
    });
}

// al click del bottone gioca di nuova si chiama la funzione che resetta tutto
function resetGame() {
    const level = document.querySelector('#level').value;

    if (level === '') {
        alert('Devi selezionare un livello prima di giocare di nuovo!');
        return;
    }

    errorNumber = 0;
    movesNumber = 0;
    point = 0; // Reset dei punti
    errorElement.textContent = errorNumber;
    movesElement.textContent = movesNumber;
    gridGame.innerHTML = '';
    shuffledSymbols = symbols.sort(() => 0.5 - Math.random());
    createBoard();
}

// aggiunta alla classifica
function addToLeaderboard(timeTaken) {
    const gamersList = document.getElementById('gamers');
    const listItem = document.createElement('li');
    // listItem.textContent = `${nameUser} </br> Mosse: ${movesNumber}, Errori: ${errorNumber}, Tempo: ${timeTaken} secondi`;
    listItem.innerHTML = `
        ${nameUser} <br>
        Livello: ${nameLevel.textContent} <br>
        Mosse: ${movesNumber}, Errori: ${errorNumber}, Tempo: ${timeTaken} secondi
    `;
    gamersList.appendChild(listItem);
}

// Inizializza il livello di difficoltà selezionato
difficultyLevel();
