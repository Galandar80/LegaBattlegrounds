const { escapeHTML, aggregatePlayerPoints, splitEventsByDate } = require('../assets/js/app-core');

describe('AppCore', () => {
    test('escapeHTML neutralizza markup e attributi pericolosi', () => {
        expect(escapeHTML('<img src=x onerror="alert(1)">')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    });

    test('aggregatePlayerPoints somma i punti dei giocatori tra tornei', () => {
        const result = aggregatePlayerPoints({
            torneo1: {
                giocatori: {
                    a: { nome: 'Alex', punti: '10' },
                    b: { nome: 'Bianca', punti: 6 }
                }
            },
            torneo2: {
                giocatori: {
                    c: { nome: 'Alex', punti: 4 },
                    d: { nome: 'Carlo', punti: '0' }
                }
            }
        });

        expect(result).toEqual([
            { nome: 'Alex', punti: 14 },
            { nome: 'Bianca', punti: 6 },
            { nome: 'Carlo', punti: 0 }
        ]);
    });

    test('splitEventsByDate separa e ordina eventi futuri e passati', () => {
        const result = splitEventsByDate({
            old: { nome: 'Passato', data: '2026-04-01' },
            next: { nome: 'Prossimo', data: '2026-05-03' },
            today: { nome: 'Oggi', data: '2026-05-02' }
        }, new Date('2026-05-02T12:00:00'));

        expect(result.futuri.map(evento => evento.id)).toEqual(['today', 'next']);
        expect(result.passati.map(evento => evento.id)).toEqual(['old']);
    });
});
