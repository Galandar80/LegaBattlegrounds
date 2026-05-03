// Supabase Configuration
const SUPABASE_URL = "https://gjptnqegyqbsmnywigqj.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcHRucWVneXFic21ueXdpZ3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Mzk1NDMsImV4cCI6MjA3NjExNTU0M30.Yx4dGkGh2tBTW1e_8yRxnO9geJ9_0tMiXMuhHGugsC4";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// DOM Elements
const cardForm = document.getElementById("cardForm");
const nomeInput = document.getElementById("nome");
const cognomeInput = document.getElementById("cognome");
const torneoInput = document.getElementById("torneo");
const imgInput = document.getElementById("immagine");
const nomeError = document.getElementById("nomeError");
const cognomeError = document.getElementById("cognomeError");
const immagineError = document.getElementById("immagineError");
const previewWrapper = document.getElementById("previewWrapper");
const previewImg = document.getElementById("previewImg");
const submitBtn = document.getElementById("submitBtn");
const editingId = document.getElementById("editingId");
const codeSection = document.getElementById("codeSection");
const codeValue = document.getElementById("codeValue");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const codeInput = document.getElementById("codeInput");
const loadBtn = document.getElementById("loadBtn");
const openImageBtn = document.getElementById("openImageBtn");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.getElementById("closeBtn");
const resetBtn = document.getElementById("resetBtn");

// Database Functions
async function dbGet(id) {
    const { data, error } = await supabase.from('cards').select('*').eq('id', id).single();
    if (error) return null;
    return data;
}

async function dbPut(card) {
    const { error } = await supabase.from('cards').upsert(card, { onConflict: 'id' });
    if (error) throw error;
}

// Utility Functions
function generateId() { return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`; }

function showFeedback(message, type) {
    const el = document.getElementById("formFeedback");
    if (el) {
        el.textContent = message;
        el.className = `banner ${type}`;
        el.hidden = false;
        window.clearTimeout(el._t);
        el._t = window.setTimeout(() => (el.hidden = true), 4000);
    }
}

function clearFormErrors() {
    if (nomeError) nomeError.textContent = "";
    if (cognomeError) cognomeError.textContent = "";
    if (immagineError) immagineError.textContent = "";
}

function validateForm() {
    clearFormErrors();
    const nome = nomeInput.value.trim();
    const cognome = cognomeInput.value.trim();
    let valid = true;
    if (!nome) { if (nomeError) nomeError.textContent = "Il nome è obbligatorio."; valid = false; }
    if (!cognome) { if (cognomeError) cognomeError.textContent = "Il cognome è obbligatorio."; valid = false; }
    return valid;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve("");
        if (file.size > MAX_IMAGE_BYTES) return reject(new Error("L'immagine supera il limite di 10MB."));
        if (!file.type.startsWith("image/")) return reject(new Error("Il file selezionato non è un'immagine valida."));
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Errore durante la lettura dell'immagine."));
        reader.readAsDataURL(file);
    });
}

function resetForm() {
    if (cardForm) cardForm.reset();
    if (editingId) editingId.value = "";
    if (submitBtn) submitBtn.textContent = "Salva scheda";
    if (previewWrapper) previewWrapper.hidden = true;
    clearFormErrors();
}

// Imgur Functions
async function uploadToImgur(file) {
    const clientId = '06127cb96dfdf99';
    const fd = new FormData(); fd.append('image', file);
    const statusEl = document.getElementById('uploadStatus');
    const barWrap = document.getElementById('uploadProgress');
    const bar = document.getElementById('uploadProgressBar');

    if (statusEl && barWrap && bar) {
        statusEl.style.display = 'block';
        barWrap.style.display = 'block';
        bar.style.width = '0%';
        statusEl.textContent = 'Caricamento su Imgur...';
    }

    let progress = 0;
    const timer = setInterval(() => {
        progress = Math.min(90, progress + 5);
        if (bar) bar.style.width = progress + '%';
    }, 120);

    try {
        const res = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: { 'Authorization': `Client-ID ${clientId}` },
            body: fd
        });
        const data = await res.json();
        clearInterval(timer);

        if (data && data.success && data.data && data.data.link) {
            if (bar && barWrap && statusEl) {
                bar.style.width = '100%';
                statusEl.textContent = 'Caricamento completato!';
                setTimeout(() => {
                    barWrap.style.display = 'none';
                    statusEl.style.display = 'none';
                }, 1200);
            }
            return { link: data.data.link, deletehash: data.data.deletehash };
        }
        if (statusEl) statusEl.textContent = 'Errore upload';
        throw new Error('Upload Imgur fallito');
    } catch (error) {
        clearInterval(timer);
        if (statusEl) statusEl.textContent = 'Errore di connessione';
        throw error;
    }
}

async function deleteFromImgur(deleteHash) {
    const clientId = '06127cb96dfdf99';
    await fetch(`https://api.imgur.com/3/image/${deleteHash}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Client-ID ${clientId}` }
    });
}

// Event Listeners
function initDeckViewer() {
    // Modal interactions
    function openModalWithImage(src) {
        if (!src) { showFeedback("Nessuna immagine disponibile.", "error"); return; }
        if (modalImg) modalImg.src = src;
        if (modal) {
            modal.style.display = "flex";
            modal.setAttribute("aria-hidden", "false");
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
        }
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

    // Image Input
    if (imgInput) {
        imgInput.addEventListener("change", async () => {
            if (immagineError) immagineError.textContent = "";
            const file = imgInput.files && imgInput.files[0];
            if (!file) {
                if (previewWrapper) previewWrapper.hidden = true;
                if (previewImg) previewImg.removeAttribute("src");
                return;
            }
            try {
                if (file.size > MAX_IMAGE_BYTES) throw new Error("L'immagine supera il limite di 10MB.");
                if (!file.type.startsWith("image/")) throw new Error("Il file selezionato non è un'immagine valida.");
                const base64 = await fileToBase64(file);
                if (previewImg) previewImg.src = base64;
                if (previewWrapper) previewWrapper.hidden = false;
            } catch (err) {
                if (previewWrapper) previewWrapper.hidden = true;
                if (previewImg) previewImg.removeAttribute("src");
                if (immagineError) immagineError.textContent = err.message || String(err);
                showFeedback(err.message || "Errore immagine.", "error");
                imgInput.value = "";
            }
        });
    }

    // Form Submit
    if (cardForm) {
        cardForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!validateForm()) { showFeedback("Compila correttamente i campi obbligatori.", "error"); return; }

            const nome = nomeInput.value.trim();
            const cognome = cognomeInput.value.trim();
            const torneo = torneoInput.value.trim();
            let imageUrl = "";
            let deleteHash = null;

            try {
                const file = imgInput.files && imgInput.files[0];
                if (file) {
                    const up = await uploadToImgur(file);
                    imageUrl = up.link; deleteHash = up.deletehash;
                } else if (editingId.value) {
                    const ex = await dbGet(editingId.value);
                    imageUrl = ex?.image_url || ex?.image_base64 || "";
                    deleteHash = ex?.delete_hash || null;
                }
            } catch (err) {
                if (immagineError) immagineError.textContent = err.message || String(err);
                showFeedback(err.message || "Errore immagine.", "error");
                return;
            }

            if (editingId.value) {
                const id = editingId.value;
                const existing = await dbGet(id);
                if (!existing) { showFeedback("Codice non valido o scheda inesistente.", "error"); return; }

                if (deleteHash && existing?.delete_hash && deleteHash !== existing.delete_hash) {
                    try { await deleteFromImgur(existing.delete_hash); } catch (_) { }
                }

                const updated = { ...existing, nome, cognome, torneo, image_url: imageUrl, delete_hash: deleteHash || existing?.delete_hash || null };
                await dbPut(updated);
                showFeedback("Schieramento aggiornato con successo.", "success");
                if (codeSection) codeSection.style.display = "block";
                if (codeValue) codeValue.textContent = id;
                alert(`IMPORTANTE:\nSalva questo codice per visualizzare o modificare lo schieramento in futuro:\n\n${id}`);
            } else {
                const id = generateId();
                if ((imgInput.files || []).length) {
                    const file = imgInput.files[0];
                    const up = await uploadToImgur(file);
                    imageUrl = up.link; deleteHash = up.deletehash;
                }
                const card = { id, nome, cognome, torneo, image_url: imageUrl, delete_hash: deleteHash };
                await dbPut(card);
                showFeedback("Schieramento creato con successo.", "success");
                if (codeSection) codeSection.style.display = "block";
                if (codeValue) codeValue.textContent = id;
                alert(`IMPORTANTE:\nSalva questo codice per visualizzare o modificare lo schieramento in futuro:\n\n${id}`);
                resetForm();
            }
        });
    }

    // Copy Code
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(codeValue.textContent || "");
                showFeedback("Codice copiato negli appunti.", "success");
            } catch (_) {
                showFeedback("Impossibile copiare il codice.", "error");
            }
        });
    }

    // Reset
    if (resetBtn) resetBtn.addEventListener("click", resetForm);

    // Load Card
    if (loadBtn) {
        loadBtn.addEventListener("click", async () => {
            const id = (codeInput.value || "").trim();
            if (!id) { showFeedback("Inserisci un codice valido.", "error"); return; }

            const card = await dbGet(id);
            if (!card) { showFeedback("Nessuna scheda trovata per questo codice.", "error"); return; }

            editingId.value = id;
            submitBtn.textContent = "Salva Modifiche";
            nomeInput.value = card.nome || "";
            cognomeInput.value = card.cognome || "";
            torneoInput.value = card.torneo || "";

            if (card.image_url || card.image_base64) {
                if (previewImg) previewImg.src = card.image_url || card.image_base64;
                if (previewWrapper) previewWrapper.hidden = false;
            } else {
                if (previewWrapper) previewWrapper.hidden = true;
                if (previewImg) previewImg.removeAttribute("src");
            }

            showFeedback("Scheda caricata. Ora puoi modificarla e salvare.", "success");
            if (codeSection) codeSection.style.display = "block";
            if (codeValue) codeValue.textContent = id;
        });
    }

    // Open Image
    if (openImageBtn) openImageBtn.addEventListener("click", () => openModalWithImage(previewImg.getAttribute("src")));
    if (previewWrapper) previewWrapper.addEventListener("click", () => openModalWithImage(previewImg.getAttribute("src")));
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDeckViewer);
