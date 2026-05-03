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

// Inizializzazione Firebase
let app;
let database;
let auth;

if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        app = firebase.app();
    }
    if (typeof firebase.database === 'function') {
        database = firebase.database();
    }
    if (typeof firebase.auth === 'function') {
        auth = firebase.auth();
    }
} else {
    console.error("Firebase SDK non caricato!");
}
