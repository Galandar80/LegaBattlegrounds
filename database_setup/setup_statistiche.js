// Script per aggiungere i dati delle statistiche al database Firebase - Battlegrounds League
// Eseguire questo script per inizializzare o aggiornare le statistiche

// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB0CLFB0FxRLWvqW-5mwY2XLJ-RwNsbAq0",
    authDomain: "legabattlegrounds.firebaseapp.com",
    databaseURL: "https://legabattlegrounds-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "legabattlegrounds",
    storageBucket: "legabattlegrounds.firebasestorage.app",
    messagingSenderId: "972949103668",
    appId: "1:972949103668:web:1e98b836268c94c7a81661",
    measurementId: "G-HCVP5B0BL8"
};

// Inizializzazione Firebase (esempio con Node.js)
// Richiede: npm install firebase
const firebase = require('firebase/app');
require('firebase/database');

// Inizializza Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

// Dati statistiche reali
const statistiche = {
    giocatori: 120,  // Numero di giocatori registrati
    tornei: 25,      // Numero di tornei organizzati
    citta: 3,        // Numero di città coinvolte
};

// Aggiorna o crea le statistiche nel database
database.ref('statistiche').set(statistiche)
    .then(() => {
        console.log('Statistiche aggiornate con successo nel database!');
        // Chiudi la connessione al database
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    })
    .catch((error) => {
        console.error('Errore durante l\'aggiornamento delle statistiche:', error);
        process.exit(1);
    }); 
