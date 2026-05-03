(function () {
    "use strict";

    const LOGIN_PAGE = "admin-login.html";
    const DASHBOARD_PAGE = "admin-dashboard.html";

    function hasFirebaseAuth() {
        return typeof firebase !== "undefined" && typeof firebase.auth === "function";
    }

    function redirectToLogin() {
        const current = encodeURIComponent(window.location.pathname.split("/").pop() || "admin-dashboard.html");
        window.location.href = `${LOGIN_PAGE}?next=${current}`;
    }

    function nextUrl() {
        const params = new URLSearchParams(window.location.search);
        const requested = params.get("next");
        if (requested && /^[a-z0-9._-]+\.html$/i.test(requested)) {
            return requested;
        }
        return DASHBOARD_PAGE;
    }

    window.AdminAuth = {
        requireAuth() {
            if (!hasFirebaseAuth()) {
                console.error("Firebase Auth non caricato.");
                redirectToLogin();
                return;
            }

            firebase.auth().onAuthStateChanged(user => {
                if (!user) {
                    redirectToLogin();
                }
            });
        },

        login(email, password) {
            if (!hasFirebaseAuth()) {
                return Promise.reject(new Error("Firebase Auth non disponibile"));
            }
            return firebase.auth().signInWithEmailAndPassword(email, password)
                .then(() => {
                    window.location.href = nextUrl();
                });
        },

        logout() {
            if (!hasFirebaseAuth()) {
                window.location.href = LOGIN_PAGE;
                return;
            }
            firebase.auth().signOut().finally(() => {
                window.location.href = LOGIN_PAGE;
            });
        }
    };
})();
