## Données runtime (à ne pas committer)

Ce dépôt génère des fichiers **runtime** (données importées, caches, rapports, résultats de tests) qui ne doivent pas être versionnés.

### Dossiers concernés

Backend :
- `backend/uploads/` : fichiers importés (CSV/XLSX)
- `backend/data/` : base locale (`openstats.db`), datasets Parquet, partages canvas, etc.
- `backend/reports/` : exports et rapports générés (PDF/DOCX/PPTX/HTML/XLSX)

Frontend :
- `frontend/test-results/` : artefacts Playwright/Vitest
- `frontend/playwright-report/` : rapports Playwright
- `**/*.tsbuildinfo` : cache TypeScript

Ces chemins sont ignorés via `.gitignore` (les dossiers peuvent contenir un `.gitkeep` pour rester présents).

### Nettoyage local

Vous pouvez supprimer le contenu runtime sans casser le code (uniquement les outputs) :

```bash
# Backend
rm -rf backend/uploads/* backend/reports/* backend/data/*

# Frontend
rm -rf frontend/test-results frontend/playwright-report
rm -f frontend/tsconfig.tsbuildinfo
```

Conseil : gardez les fichiers d’exemple (fixtures) dans un répertoire dédié (ex. `samples/`) si vous voulez les versionner.

