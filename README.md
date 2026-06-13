# OpenStats

**Elmas Labs** · _Data. Analyse. Insight._

Plateforme d'analyse de données augmentée par l'intelligence artificielle.
Interface no-code pour l'ingestion, le nettoyage, l'analyse statistique,
la modélisation prédictive et la génération de rapports PDF.

> Fait partie de l'écosystème **Elmas** — _From Data to Systems._

## Architecture

```
Stats/
├── backend/               # API Flask + Python ML
│   ├── app/
│   │   ├── api/v1/        # Routes REST versionnées
│   │   ├── core/          # Modules métier
│   │   │   ├── ingestion.py    # Adaptateurs CSV/XLSX/JSON
│   │   │   ├── profiling.py    # Inférence de types, dictionnaire
│   │   │   ├── cleaning.py     # Pipeline de nettoyage
│   │   │   ├── analysis.py     # Stats descriptives, corrélations, tests
│   │   │   ├── modeling.py     # Régression, classification, boosting
│   │   │   ├── explainability.py  # SHAP
│   │   │   └── reporting.py    # Génération PDF ReportLab
│   │   └── services/      # Orchestration
│   └── requirements.txt
├── frontend/              # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # FileUpload, DataProfile, Cleaning, Analysis, Modeling, Report
│   │   ├── pages/         # Dashboard, WorkflowPage
│   │   ├── store/         # Redux Toolkit + RTK Query
│   │   └── types/         # Interfaces TypeScript
│   └── package.json
└── SpécificationTechnique.txt
```

## Démarrage rapide

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Configurer les variables
python run.py                # Démarre sur http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # Démarre sur http://localhost:3000
```

## API Endpoints (v1)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/datasets/upload` | Upload un fichier CSV/XLSX/JSON |
| GET | `/api/v1/datasets` | Liste les datasets |
| GET | `/api/v1/datasets/:id` | Détail d'un dataset |
| GET | `/api/v1/datasets/:id/preview` | Aperçu des données |
| POST | `/api/v1/datasets/:id/clean` | Pipeline de nettoyage personnalisé |
| POST | `/api/v1/datasets/:id/clean/auto` | Nettoyage automatique |
| POST | `/api/v1/datasets/:id/analysis` | Analyse statistique complète |
| GET | `/api/v1/datasets/:id/analysis/correlations` | Matrice de corrélation |
| POST | `/api/v1/datasets/:id/analysis/test` | Test d'hypothèse |
| POST | `/api/v1/datasets/:id/model/train` | Entraînement multi-algorithmes |
| GET | `/api/v1/datasets/:id/model/results` | Résultats de modélisation |
| POST | `/api/v1/datasets/:id/report` | Générer le rapport PDF |

## MVP v1.0 — Fonctionnalités

- **Ingestion** : CSV, XLSX, XLS, JSON/JSONL avec détection automatique d'encodage et délimiteur
- **Profilage** : Inférence de types (3 niveaux), détection d'unités, dictionnaire de données
- **Nettoyage** : Déduplication, 8 stratégies d'imputation, 3 méthodes de détection d'outliers, normalisation, encodage
- **Analyse** : Statistiques descriptives, corrélations Pearson/Spearman, VIF, tests d'hypothèses avec taille d'effet
- **Modélisation** : 12+ algorithmes (Linéaire, Ridge, Lasso, RF, XGBoost, LightGBM, SVM, KNN, LDA/QDA, AdaBoost) avec GridSearchCV
- **Explicabilité** : Valeurs SHAP globales et locales
- **Rapport** : PDF exécutif 5 sections via ReportLab

## Stack technique

- **Backend** : Python 3.11+, Flask, Pandas, Scikit-learn, XGBoost, LightGBM, SHAP, ReportLab
- **Frontend** : React 18, TypeScript, Redux Toolkit, Recharts, TailwindCSS, Vite

## Deploiement Railway

Le projet est prepare pour un deploiement Railway en **service unique** :

- Railway build le frontend Vite
- Railway lance l'API Flask avec Gunicorn
- Flask sert ensuite les fichiers statiques du frontend depuis `frontend/dist`

### Fichiers de configuration

- `railway.json` : commandes de build et de demarrage
- `nixpacks.toml` : environnement mixte Node.js + Python pour le monorepo

### Variables d'environnement recommandees

- `SECRET_KEY`
- `FLASK_DEBUG=false`
- `ANTHROPIC_API_KEY` si les fonctions LLM sont utilisees
- `CELERY_BROKER_URL` et `CELERY_RESULT_BACKEND` uniquement si vous activez Redis/Celery

### Commandes Railway

Build :

```bash
cd frontend && npm ci && npm run build && cd ../backend && pip install -r requirements.txt
```

Start :

```bash
cd backend && gunicorn run:app --bind 0.0.0.0:$PORT
```

### Remarque

L'API frontend utilise deja des URLs relatives (`/api/v1`). Une fois deployee, le frontend et le backend partagent donc le meme domaine Railway sans configuration CORS supplementaire.
