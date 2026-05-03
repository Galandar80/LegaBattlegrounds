(function () {
    "use strict";

    const CUPS_REST_URL = "https://legabattlegrounds-default-rtdb.europe-west1.firebasedatabase.app/cups.json";
    const LOAD_TIMEOUT_MS = 7000;

    function db() {
        return typeof database !== "undefined" && database ? database : null;
    }

    function el(id) {
        return document.getElementById(id);
    }

    function setStatus(message, className) {
        const container = el("coppeList");
        if (!container) return;
        container.innerHTML = "";
        const state = document.createElement("div");
        state.className = className || "info";
        state.style.padding = "14px";
        state.style.border = "1px solid rgba(243, 206, 52, 0.35)";
        state.style.borderRadius = "6px";
        state.style.background = "rgba(0, 0, 0, 0.22)";
        state.style.color = "#fff";
        state.innerHTML = message;
        container.appendChild(state);
    }

    function render(coppe) {
        const container = el("coppeList");
        const selectTorneo = el("nuovoTorneoCoppa");
        const selectEdit = el("editTorneoCoppa");
        if (!container) return;

        container.innerHTML = "";
        if (selectTorneo) selectTorneo.innerHTML = '<option value="">Nessuna Coppa</option>';
        if (selectEdit) selectEdit.innerHTML = '<option value="">Nessuna Coppa</option>';

        const entries = Object.entries(coppe || {})
            .sort((a, b) => (a[1].name || a[1].nome || "").localeCompare(b[1].name || b[1].nome || "", "it"));

        if (entries.length === 0) {
            setStatus("Nessuna coppa creata", "no-data");
            return;
        }

        entries.forEach(([id, coppa]) => {
            const cupName = coppa.name || coppa.nome || "Coppa senza nome";

            const item = document.createElement("div");
            item.className = "event-card admin-cup-card";
            item.style.marginBottom = "10px";
            item.style.display = "flex";
            item.style.justifyContent = "space-between";
            item.style.alignItems = "center";
            item.style.padding = "14px";
            item.style.border = "1px solid rgba(243, 206, 52, 0.35)";
            item.style.borderRadius = "6px";
            item.style.background = "rgba(0, 0, 0, 0.26)";
            item.style.color = "#fff";

            const name = document.createElement("strong");
            name.textContent = cupName;
            item.appendChild(name);

            const button = document.createElement("button");
            button.type = "button";
            button.className = "small-button";
            button.style.background = "#dc3545";
            button.style.color = "#fff";
            button.innerHTML = '<i class="fas fa-trash"></i>';
            button.title = "Elimina coppa";
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                removeCup(id);
            });
            item.appendChild(button);
            container.appendChild(item);

            const option = `<option value="${id}">${cupName}</option>`;
            if (selectTorneo) selectTorneo.innerHTML += option;
            if (selectEdit) selectEdit.innerHTML += option;
        });
    }

    function withTimeout(promise, message) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(message)), LOAD_TIMEOUT_MS);
            promise
                .then(value => {
                    clearTimeout(timer);
                    resolve(value);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }

    function loadViaFetch() {
        return withTimeout(
            fetch(`${CUPS_REST_URL}?t=${Date.now()}`, { cache: "no-store" })
                .then(response => {
                    if (!response.ok) throw new Error(`Firebase REST ${response.status}`);
                    return response.json();
                }),
            "Timeout REST coppe"
        );
    }

    function loadViaXhr() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `${CUPS_REST_URL}?t=${Date.now()}`, true);
            xhr.timeout = LOAD_TIMEOUT_MS;
            xhr.onload = () => {
                if (xhr.status < 200 || xhr.status >= 300) {
                    reject(new Error(`Firebase XHR ${xhr.status}`));
                    return;
                }
                try {
                    resolve(JSON.parse(xhr.responseText || "{}"));
                } catch (error) {
                    reject(error);
                }
            };
            xhr.onerror = () => reject(new Error("Errore rete XHR coppe"));
            xhr.ontimeout = () => reject(new Error("Timeout XHR coppe"));
            xhr.send();
        });
    }

    function loadViaSdk() {
        const databaseRef = db();
        if (!databaseRef) return Promise.reject(new Error("Database Firebase non disponibile"));
        return withTimeout(
            databaseRef.ref("cups").once("value").then(snapshot => snapshot.val() || {}),
            "Timeout Firebase SDK coppe"
        );
    }

    function loadCups() {
        setStatus('<i class="fas fa-spinner"></i> Caricamento coppe...', "loading");

        return loadViaFetch()
            .then(data => {
                render(data || {});
                return data || {};
            })
            .catch(fetchError => {
                console.warn("Lettura coppe via fetch non riuscita:", fetchError);
                return loadViaXhr()
                    .then(data => {
                        render(data || {});
                        return data || {};
                    });
            })
            .catch(xhrError => {
                console.warn("Lettura coppe via XHR non riuscita:", xhrError);
                return loadViaSdk()
                    .then(data => {
                        render(data || {});
                        return data || {};
                    });
            })
            .catch(error => {
                setStatus(`Errore nel caricamento delle coppe: ${error.message}`, "error");
                return {};
            });
    }

    function showCupsSection() {
        document.querySelectorAll(".sidebar-menu a").forEach(link => link.classList.remove("active"));
        const menu = el("menuCoppe");
        if (menu) menu.classList.add("active");

        ["sezioneTornei", "sezioneStatistiche", "gestioneTorneo", "sezioneEventi", "sezioneHOF"].forEach(id => {
            const section = el(id);
            if (section) section.style.display = "none";
        });

        const cups = el("sezioneCoppe");
        if (cups) cups.style.display = "block";
        loadCups();
    }

    function createCup() {
        const input = el("nuovaCoppaNome");
        const name = input ? input.value.trim() : "";
        const databaseRef = db();

        if (!name) {
            if (typeof showAlert === "function") showAlert("Inserisci un nome per la coppa", "error");
            return;
        }
        if (!databaseRef) {
            setStatus("Database Firebase non disponibile", "error");
            return;
        }

        databaseRef.ref("cups").push({ name, creatoIl: new Date().toISOString() })
            .then(() => {
                if (input) input.value = "";
                if (typeof showAlert === "function") showAlert("Coppa creata!");
                return loadCups();
            })
            .catch(error => setStatus(`Errore creazione coppa: ${error.message}`, "error"));
    }

    function removeCup(id) {
        const databaseRef = db();
        if (!databaseRef) {
            setStatus("Database Firebase non disponibile", "error");
            return;
        }
        if (!window.confirm("Eliminare questa coppa? I tornei associati non verranno eliminati ma non saranno più collegati.")) {
            return;
        }

        databaseRef.ref(`cups/${id}`).remove()
            .then(() => {
                if (typeof showAlert === "function") showAlert("Coppa eliminata");
                return loadCups();
            })
            .catch(error => setStatus(`Errore eliminazione coppa: ${error.message}`, "error"));
    }

    function handleClick(event) {
        const target = event.target.closest("#menuCoppe, #btnAggiornaCoppe, #btnCreaCoppa");
        if (!target) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (target.id === "btnCreaCoppa") {
            createCup();
            return;
        }
        if (target.id === "menuCoppe") {
            showCupsSection();
            return;
        }
        loadCups();
    }

    function install() {
        document.addEventListener("click", handleClick, true);
        loadCups();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", install);
    } else {
        install();
    }

    window.AdminCups = {
        load: loadCups,
        render,
        show: showCupsSection
    };
})();
