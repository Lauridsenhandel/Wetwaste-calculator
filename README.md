# Wetwaste Calculator - Dokumentation

Dette værktøj hjælper virksomheder med at beregne deres nuværende omkostninger ved håndtering af madaffald (wet waste) og estimere potentielle CO2-besparelser ved at skifte til en BioTrans-løsning.

Herunder finder du en detaljeret beskrivelse af, hvordan beregningerne foretages.

## 1. Økonomiske Beregninger

Beregneren summerer fire hovedkategorier for at finde de totale årlige omkostninger.

### A. Lønomkostninger
Dette er prisen for den tid, medarbejderne bruger på at håndtere affaldet manuelt.
*   **Formel:** `Tid brugt pr. dag (timer)` × `Arbejdsdage pr. år (standard 260)` × `Timeløn (DKK)`

### B. Køleomkostninger (Valgfri)
Hvis affaldet opbevares på køl, beregnes strømforbruget.
*   **Formel:** `Effekt (kWh)` × `Aktive timer pr. dag` × `Aktive dage pr. år` × `Pris pr. kWh`

### C. Bortskaffelse
Prisen for at få hentet og tømt affaldsbeholderne.
*   **Formel:** `Antal tømninger dagligt` × `Pris pr. tømning` × `Arbejdsdage pr. år`
    *   *Bemærk:* Hvis man ændrer den årlige mængde madaffald, giver systemet et automatisk bud på antal daglige tømninger baseret på en standardvolumen.

### D. Andre Udgifter
Et fast beløb, som brugeren selv kan indtaste for diverse ekstraudgifter.

---

## 2. CO2-Beregninger

Beregneren estimerer miljøgevinsten ved at omdanne madaffaldet til biogas frem for konventionel bortskaffelse.

### A. Basis CO2-besparelse
Vi antager en standardbesparelse ved at genanvende madaffaldet korrekt.
*   **Faktor:** 0,37 kg CO2 sparet pr. kg madaffald.
*   **Formel:** `Årlig mængde madaffald (kg)` × `0,37`

### B. Transportfradrag (Transportemissioner)
For at give et mere præcist billede, fratrækkes CO2-udledningen fra transporten til nærmeste biogasanlæg.

1.  **Find nærmeste anlæg:**
    *   Systemet slår brugerens adresse op og finder det nærmeste biogasanlæg fra en liste over danske anlæg (f.eks. Nature Energy Fyn, Solrød Biogas, m.fl.).
    *   Afstanden beregnes som faktisk køreafstand via vejnettet (hvis muligt), ellers som fugleflugtslinje + 20%.

2.  **Beregn udledning:**
    *   **Faktor:** 0,1 kg CO2 pr. ton affald pr. km transporteret.
    *   **Formel:** `(Affaldsmængde i tons)` × `Afstand (km)` × `0,1`

### C. Netto CO2-besparelse
Det endelige tal, der vises til brugeren.
*   **Resultat:** `Basis besparelse` - `Transportfradrag`

---

## Teknisk Info
*   **Sprog:** HTML, CSS, JavaScript (Ingen backend/database krævet).
*   **Kortdata:** Bruger OpenStreetMap (OSRM) til at beregne ruteafstande.
