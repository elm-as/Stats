import re

filepath = r"c:\Users\elmas\Desktop\Projets\Stats\frontend\src\components\AnalysisWizard.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Line 493: ✓/✗ → OK/N/A
content = content.replace(
    "{a.available ? '✓' : '✗'} {a.label.split",
    "{a.available ? 'OK' : 'N/A'} {a.label.split"
)

# 2. Line 1362: icon: '✓', → icon: 'OK',
content = content.replace(
    "icon: '\u2713',",
    "icon: 'OK',"
)

# 3. Line 1369: icon: cointegrationLikely ? '⊕' : '⚠', → icon: cointegrationLikely ? 'COI' : 'WARN',
content = content.replace(
    "icon: cointegrationLikely ? '\u2295' : '\u26a0',",
    "icon: cointegrationLikely ? 'COI' : 'WARN',"
)

# 4. Line 1421: ⚡ <strong>{configCol}</strong> est non-stationnaire → remove ⚡
content = content.replace(
    '\u26a1 <strong>{configCol}</strong> est non-stationnaire',
    '<strong>{configCol}</strong> est non-stationnaire'
)

# 5. Line 1427: ✓ <strong>{configCol}</strong> est stationnaire → remove ✓
content = content.replace(
    '\u2713 <strong>{configCol}</strong> est stationnaire',
    '<strong>{configCol}</strong> est stationnaire'
)

# 6. Line 1440: const verdictIcon = result.is_stationary ? '✓' : '⚠'; → const verdictIcon = result.is_stationary ? 'OK' : 'WARN';
content = content.replace(
    "const verdictIcon = result.is_stationary ? '\u2713' : '\u26a0';",
    "const verdictIcon = result.is_stationary ? 'OK' : 'WARN';"
)

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("Remplacements effectues avec succes!")

# Verify
with open(filepath, 'r', encoding='utf-8') as f:
    verified = f.read()

emojis_found = []
for ch in ['✓', '✗', '⚡', '⚠', '⊕']:
    if ch in verified:
        emojis_found.append(ch)

if emojis_found:
    print(f"ATTENTION: Emojis restants: {emojis_found}")
else:
    print("Aucun emoji restant detecte.")
