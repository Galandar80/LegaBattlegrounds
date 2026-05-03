(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AppCore = factory();
    }
})(typeof window !== 'undefined' ? window : globalThis, function () {
    function escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function aggregatePlayerPoints(torneiData) {
        const totals = {};
        Object.values(torneiData || {}).forEach(torneo => {
            Object.values((torneo && torneo.giocatori) || {}).forEach(giocatore => {
                const nome = String(giocatore.nome || '').trim();
                if (!nome) return;
                totals[nome] = (totals[nome] || 0) + (parseInt(giocatore.punti, 10) || 0);
            });
        });

        return Object.entries(totals)
            .map(([nome, punti]) => ({ nome, punti }))
            .sort((a, b) => b.punti - a.punti || a.nome.localeCompare(b.nome));
    }

    function splitEventsByDate(eventiData, today = new Date()) {
        const start = new Date(today);
        start.setHours(0, 0, 0, 0);
        const futuri = [];
        const passati = [];

        Object.entries(eventiData || {}).forEach(([id, evento]) => {
            if (!evento || !evento.data) return;
            const eventDate = new Date(evento.data);
            if (Number.isNaN(eventDate.getTime())) return;
            const item = { id, ...evento };
            if (eventDate >= start) {
                futuri.push(item);
            } else {
                passati.push(item);
            }
        });

        futuri.sort((a, b) => new Date(a.data) - new Date(b.data));
        passati.sort((a, b) => new Date(b.data) - new Date(a.data));
        return { futuri, passati };
    }

    return {
        escapeHTML,
        aggregatePlayerPoints,
        splitEventsByDate
    };
});
