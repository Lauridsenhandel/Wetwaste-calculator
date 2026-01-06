# Wetwaste Calculator - Dokumentation

Dette værktøj hjælper virksomheder med at beregne deres nuværende omkostninger ved håndtering af madaffald (wet waste) og estimere potentielle CO2-besparelser ved at skifte til en wet-waste løsning. Derudover tilbyder værktøjet en "Tilbud & Break-Even" beregning.

Herunder finder du en detaljeret beskrivelse af, hvordan beregningerne foretages.

## 1. Økonomiske Beregninger (Nuværende Løsning)

Beregneren summerer fire hovedkategorier for at finde de totale årlige omkostninger.

### A. Lønomkostninger
Dette er prisen for den tid, medarbejderne bruger på at håndtere affaldet manuelt.
*   **Formel:** `Tid brugt pr. dag (timer)` × `Arbejdsdage pr. år (indtastet under generelt)` × `Timeløn (DKK)`

### B. Køleomkostninger (Valgfri)
Hvis affaldet opbevares på køl, beregnes strømforbruget.
*   **Formel:** `Effekt (kWh)` × `Aktive timer pr. dag` × `Aktive dage pr. år` × `Pris pr. kWh`

### C. Bortskaffelse
Prisen for at få hentet affaldet. Denne beregnes nu udelukkende på antallet af besøg/tømninger, uafhængigt af antallet af beholdere eller arbejdsdage.
*   **Formel:** `Pris pr. tømning` × `Antal tømninger på et år`

### D. Andre Udgifter
Et fast beløb, som brugeren selv kan indtaste for diverse ekstraudgifter.

---

## 2. Tilbud & Break-Even Analyse

Denne sektion giver brugeren mulighed for at sammenligne de nuværende driftsomkostninger med en investering i en ny løsning (f.eks. wet-waste løsning).

### Inputs
*   **Engangsinvestering:** Det beløb det koster at etablere den nye løsning.
*   **Årlige omkostninger (Ny løsning):** Den forventede årlige drift af den nye løsning.

### Grafer
1.  **Break-Even Graf (Linjegraf):**
    *   Viser den akkumulerede totalomkostning over tid (op til 25 år).
    *   **Nuværende løsning (Grå):** Starter i 0 og stiger med den beregnede årlige omkostning.
    *   **Ny Løsning (Grøn):** Starter ved investeringsbeløbet og stiger med den nye årlige omkostning.
    *   Skæringspunktet markerer "Break-Even" – tidspunktet hvor investeringen er tjent hjem.

2.  **Besparelsesdiagram (Søjlegraf):**
    *   Viser forskellen i akkumuleret økonomi år for år (`Nuværende - Ny`).
    *   **Røde søjler:** Negativ værdi (Du har endnu ikke tjent investeringen hjem).
    *   **Grønne søjler:** Positiv værdi (Du har tjent investeringen hjem og sparer penge).

---

## 3. CO2-Beregninger

Beregneren estimerer miljøgevinsten ved at omdanne madaffaldet til biogas frem for konventionel bortskaffelse.

### A. Basis CO2-besparelse
Vi antager en standardbesparelse ved at genanvende madaffaldet korrekt.
*   **Faktor:** 0,37 kg CO2 sparet pr. kg madaffald.
*   **Formel:** `Årlig mængde madaffald (kg)` × `0,37`

### B. Transportfradrag (Transportemissioner)
For at give et mere præcist billede, fratrækkes CO2-udledningen fra transporten til nærmeste biogasanlæg.

1.  **Find nærmeste anlæg:**
    *   Systemet slår brugerens adresse op og finder det nærmeste biogasanlæg fra en liste over danske anlæg.
    *   Afstanden beregnes som faktisk køreafstand via vejnettet (hvis muligt), ellers som fugleflugtslinje + 20%.

2.  **Beregn udledning:**
    *   **Faktor:** 0,1 kg CO2 pr. ton affald pr. km transporteret.
    *   **Formel:** `(Affaldsmængde i tons)` × `Afstand (km)` × `0,1`

### C. Netto CO2-besparelse
Det endelige tal, der vises til brugeren.
*   **Resultat:** `Basis besparelse` - `Transportfradrag`

---

## Teknisk Info
*   **Sprog:** HTML, CSS, JavaScript.
*   **Biblioteker:** 
    *   *Chart.js* (via CDN) til tegning af grafer.
*   **API:**
    *   *Nominatim (OpenStreetMap)* til geocoding af adresser.
    *   *OSRM* til ruteberegning.
