# Module 183 — Activité : Programmation défensive & gestion globale des erreurs (Express)

Durée cible : **75 minutes**  
Technos : **Node.js, Express, JSON** (+ tests via Postman/Thunder Client/curl)

Objectif : apprendre à **prévoir les erreurs plutôt que les subir**, et à **centraliser** la gestion des erreurs via un middleware global.

---

## Objectifs pédagogiques

À la fin de l’activité, tu sais :

- appliquer la **programmation défensive** (validation d’entrées, contrôle d’état, *fail fast*)
- différencier une erreur **client (4xx)** d’une erreur **serveur (5xx)**
- implémenter une **gestion globale des erreurs** avec un middleware Express
- renvoyer au client un message **neutre** (pas de fuite d’informations)
- conserver les détails côté serveur via des **logs**

---

## Structure de base (projet)

La structure attendue (ou déjà présente dans ton dossier de départ) :

```
defensive-express/
├─ package.json
└─ server.js
```

> Ton dossier 7zip contient déjà ces fichiers, garde-les et complète simplement les TODO.

---

## Préparation (10’)

### 1) Installer les dépendances

Dans le dossier du projet :

```bash
npm install
```

ou si rien n’est installé :

```bash
npm init -y
npm i express
npm i -D nodemon
```

### 2) Scripts (package.json)

Vérifie que tu as bien :

```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

### 3) Lancer le serveur

```bash
npm run dev
```

---

## Starter `server.js` (à compléter)

Copie/colle si besoin (ou compare avec ton fichier) :

```js
const express = require("express");
const app = express();

app.use(express.json());

// ✅ Route santé
app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * TODO: Routes de l'activité
 * - POST /divide
 * - GET /boom
 * - GET /async-boom
 */

/**
 * TODO: Middleware 404 (not found)
 */

/**
 * TODO: Middleware global de gestion d'erreur
 */

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

---

## Partie A — Programmation défensive (20’)

### A1) Créer `POST /divide`

Requête (JSON) :

```json
{ "a": 10, "b": 2 }
```

Réponse attendue :

```json
{ "result": 5 }
```

### A2) Sécuriser la route (programmation défensive)

Refuser proprement avec **400** :

- `a` ou `b` manquant
- `a` ou `b` non numérique
- division par zéro (`b === 0`)
- (optionnel) valeurs extrêmes

Exemples :

- `b = 0` → `400 { "error": "Division par zéro interdite" }`
- `a = "toto"` → `400 { "error": "a et b doivent être des nombres" }`

> Rappel : une entrée invalide = **erreur client** → **4xx**.

---

## Partie B — Simuler une erreur serveur (10’)

### B1) Créer `GET /boom`

Cette route doit volontairement provoquer une erreur (ex. `throw new Error("BOOM")`).

Objectif : vérifier que ton middleware global capture bien l’erreur.

---

## Partie C — Middleware global d’erreurs (20’)

### C1) Ajouter le middleware global (tout en bas, après les routes)

```js
app.use((err, req, res, next) => {
  console.error("🔥 Erreur capturée:", err);

  res.status(500).send("Erreur interne sécurisée");
});
```

### C2) Test

- Appeler `GET /boom`
- Attendu côté client :
  - **500**
  - texte : `Erreur interne sécurisée`
- Attendu côté serveur :
  - un log d’erreur complet

> Idée sécurité : **le client ne doit pas recevoir de détails** (stack trace), mais le développeur doit pouvoir déboguer via les logs.

---

## Partie D — 404 propre (10’)

Ajouter un middleware 404 **avant** le middleware d’erreur :

```js
app.use((req, res) => {
  res.status(404).json({ error: "Route inexistante" });
});
```

Test :

- `GET /nimportequoi` → **404** JSON propre

---

## Partie E — Erreurs asynchrones (15’)

### E1) Créer `GET /async-boom`

Important : une erreur async doit être passée au middleware via `next(err)` :

```js
app.get("/async-boom", async (req, res, next) => {
  try {
    await Promise.reject(new Error("Async fail"));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
```

Test :

- `GET /async-boom` → **500** + message neutre via le middleware global

---

## Checklist de validation

- [ ] `/health` répond `{ ok: true }`
- [ ] `/divide` fonctionne avec `a` et `b` valides
- [ ] `/divide` renvoie **400** si champs manquants
- [ ] `/divide` renvoie **400** si types invalides
- [ ] `/divide` renvoie **400** si `b === 0`
- [ ] `/boom` renvoie **500** + message neutre
- [ ] les détails de l’erreur sont visibles dans les logs serveur
- [ ] route inconnue → **404** JSON
- [ ] `/async-boom` renvoie **500** via middleware

---

## Bonus

1. **Classe d’erreur HTTP**
   - créer une classe `HttpError` avec `statusCode`
   - dans le middleware global :
     - si `err.statusCode` → répondre avec ce code
     - sinon → 500

2. **Réponses JSON standardisées**
   - renvoyer toujours `{ error: "...", code: "..." }`

3. **Mode dev/prod**
   - en dev : logs détaillés
   - en prod : logs minimaux + identifiant de corrélation

---

## Rappel sécurité

**Les erreurs détaillées sont pour les développeurs, pas pour les utilisateurs.**  
En prod : message neutre côté client + logs côté serveur.
