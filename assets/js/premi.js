// Script specifico per la pagina premi
const html = window.escapeHTML || (value => String(value ?? ''));

document.addEventListener('DOMContentLoaded', function () {
    // Carica la classifica rating
    loadRatingTotaleConPosizione();
});

// Funzione per caricare i rating totali con posizione
function loadRatingTotaleConPosizione() {
    if (typeof database === 'undefined') {
        console.error("Firebase database non inizializzato.");
        return;
    }

    database.ref('tornei').once('value')
        .then(snapshot => {
            const tornei = snapshot.val() || {};
            const giocatoriRating = {};

            // Calcola i rating totali per ogni giocatore
            Object.values(tornei).forEach(torneo => {
                const giocatori = torneo.giocatori || {};
                Object.keys(giocatori).forEach(giocatoreId => {
                    const giocatore = giocatori[giocatoreId];
                    if (!giocatoriRating[giocatoreId]) {
                        giocatoriRating[giocatoreId] = {
                            nome: giocatore.nome,
                            rating: 0
                        };
                    }
                    giocatoriRating[giocatoreId].rating += giocatore.rating || giocatore.punti || 0;
                });
            });

            // Converti in array e ordina
            const giocatoriArray = Object.keys(giocatoriRating).map(id => {
                return {
                    id: id,
                    nome: giocatoriRating[id].nome,
                    rating: giocatoriRating[id].rating
                };
            });

            giocatoriArray.sort((a, b) => b.rating - a.rating);

            // Aggiorna la tabella
            const tbody = document.getElementById('ratingTotaleBody');

            if (!tbody) return;

            if (giocatoriArray.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" class="no-data">Nessun dato disponibile</td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = '';
            giocatoriArray.forEach((giocatore, index) => {
                const row = document.createElement('tr');

                // Aggiungi classe speciale per i primi 3 posti
                if (index < 3) {
                    row.classList.add(`position-${index + 1}`);
                }

                const posCell = document.createElement('td');
                posCell.textContent = index + 1;
                const nameCell = document.createElement('td');
                nameCell.className = 'player-name';
                nameCell.textContent = giocatore.nome || 'Giocatore';
                nameCell.addEventListener('click', () => showUserProfile(giocatore.id, giocatore.nome || ''));
                const ratingCell = document.createElement('td');
                ratingCell.textContent = giocatore.rating;
                row.append(posCell, nameCell, ratingCell);
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Errore nel caricamento dei rating totali:", error);
            const tbody = document.getElementById('ratingTotaleBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" class="error">Errore nel caricamento dei dati</td>
                    </tr>
                `;
            }
        });
}

// Funzione placeholder per showUserProfile se non definita altrove (o in utils.js)
// Se è definita in utils.js o altrove, questa potrebbe non servire o essere ridondante.
// Controllo se esiste già.
if (typeof showUserProfile !== 'function') {
    window.showUserProfile = function (id, nome) {
        console.log("Visualizza profilo per:", nome, id);
        // Implementazione base o redirect se necessario
        // Potrebbe aprire il modale definito in frontend.html se presente, ma qui siamo su premi.html
        // premi.html non sembra avere il modale userProfileModal.
    };
}
