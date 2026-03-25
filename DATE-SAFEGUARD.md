# DATE-SAFEGUARD.MD

## Rule: Alla bloggar MÅSTE ha korrekta artikeldatum

### Problem
Artiklar med framtidsdatum ser oprofessionellt ut och förstör trovärdighet.

### Lösning

**Vid publicering av artiklar:**
1. Kontrollera att inget datum är senare än idag
2. 1 artikel per dag, sekventiell ordning
3. Börja från tidigaste möjliga datum

**Om framtidsdatum upptäcks:**
1. Kör `scripts/fix-all-dates.cjs` (finns i varje blogg)
2. Bygg om: `npm run build`
3. Push: `git add . && git commit -m "Fix dates" && git push`

**Säkerhetsåtgärder:**
- Bygg-script ska AVBRYTAS om något artikel-datum är i framtiden
- Lägg till pre-build check i `build-seo.js`

### BLoggar att övervaka
- Alpha-Architect
- Roials-Alpha
- Roials-Martech
- Roials-Capital
- Hylten-Invest
- Pathmaker
- Pathmakers
