// Firebase configuration handled in firebase-config.js
// database is already initialized in firebase-config.js
const html = window.escapeHTML || (value => String(value ?? ''));

function renderTournamentEmpty(container, title = 'Nessun torneo programmato') {
    container.innerHTML = `
        <div class="premium-empty" style="grid-column: 1/-1;">
            <i class="fas fa-calendar-alt"></i>
            <div class="empty-title">${html(title)}</div>
            <div class="empty-copy">La prossima data verra pubblicata qui appena confermata. Nel frattempo puoi contattare il team per pre-iscrizioni e informazioni.</div>
            <a href="contatti.html" class="btn btn-primary">Contatta il team</a>
        </div>`;
}






// Inizializzazione all'avvio
function init() {


    // Altri inizializzazioni se necessario
    loadUpcomingTournaments();
}

// Carica tornei imminenti da Firebase (se disponibili)
function loadUpcomingTournaments() {
    const container = document.getElementById('nextTournaments');
    if (!container) return;

    // Mostra un indicatore di caricamento
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Caricamento tornei in corso...</div>';

    // Controlla se Firebase è disponibile
    if (!database) {
        console.error("Database Firebase non disponibile");
        renderTournamentEmpty(container, 'Calendario in aggiornamento');
        return;
    }

    // Se Firebase è disponibile, carica i dati
    database.ref('eventi').once('value')
        .then(snapshot => {
            const eventi = snapshot.val() || {};
            const eventiArray = Object.entries(eventi);

            // Se non ci sono eventi, mostra un messaggio
            if (eventiArray.length === 0) {
                renderTournamentEmpty(container);
                return;
            }

            // Filtra solo gli eventi futuri
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0); // Reset dell'ora per confrontare solo le date

            const eventiFuturi = eventiArray
                .filter(([_, evento]) => {
                    if (!evento.data) return false;

                    try {
                        const dataEvento = new Date(evento.data);
                        return dataEvento >= oggi;
                    } catch (e) {
                        console.error("Errore nel parsing della data:", e);
                        return false;
                    }
                })
                .sort((a, b) => new Date(a[1].data) - new Date(b[1].data)); // Ordina per data

            // Se non ci sono eventi futuri, mostra un messaggio
            if (eventiFuturi.length === 0) {
                renderTournamentEmpty(container, 'Nessun torneo futuro programmato');
                return;
            }

            // Crea le card per ogni evento futuro
            container.innerHTML = '';
            eventiFuturi.slice(0, 3).forEach(([eventoId, evento]) => {
                const dataEvento = new Date(evento.data);
                const formattedData = dataEvento.toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                // Crea una card per ogni evento
                const tournamentCard = document.createElement('div');
                tournamentCard.className = 'tournament-card';
                tournamentCard.innerHTML = `
                    <div class="tournament-date">
                        <i class="far fa-calendar"></i> ${formattedData}
                    </div>
                    <h4 class="tournament-title">${html(evento.nome || 'Evento Battlegrounds League')}</h4>
                    <div class="tournament-location">
                        <i class="fas fa-map-marker-alt"></i> ${html(evento.luogo || 'Luogo da definire')}
                    </div>
                    <div class="tournament-details">
                        <p><strong>Formato:</strong> ${html(evento.formato || 'Swiss + Top 8')}</p>
                        <p><strong>Iscrizione:</strong> ${html(evento.quota || '€15')}</p>
                        <p><strong>Premi:</strong> ${html(evento.premi || 'Carte promo esclusive, tappetini di gioco ufficiali')}</p>
                    </div>
                    <div class="tournament-action">
                        <a href="eventi.html" class="btn btn-primary">Dettagli e Iscrizione</a>
                    </div>
                `;

                container.appendChild(tournamentCard);
            });
        })
        .catch(error => {
            console.error("Errore nel caricamento degli eventi:", error);
            renderTournamentEmpty(container, 'Calendario non disponibile');
        });
}

// Inizializza la pagina quando il DOM è caricato
document.addEventListener('DOMContentLoaded', init);
