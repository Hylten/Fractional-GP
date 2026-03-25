# LÄRDOM: Hantering av artiklar

## Regel: RADERA ALDRIG ARTIKLAR

Vid fel → BAKDATERA, aldrig radera.

## Regler

1. **Aldrig radera** - Bakdata istället
2. **Byggda filer** (docs/) → Bakdata till före äldsta artikeln
3. **Källfiler** (content/) → Bakdata sekventiellt
4. **Framtidsdatum** → Byt till idag eller tidigare
5. **Dubbletter** → Behåll nyaste, ta bort äldre

## Verktyg
- `scripts/backdate-future-articles.cjs` - Bakdaterar framtida artiklar
- `scripts/remove-duplicates.cjs` - Tar bort dubbletter
- `scripts/fix-all-dates.cjs` - Fixar alla datum

## Pre-build check
Build-skriptet Kontrollerar automatiskt framtidsdatum och avbryter bygget.

## Datumintervall
Nyaste artikel = idag (max)
Äldsta artikel = godtyckligt (förra året)
