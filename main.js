/**
 * LDTK Roof Configurator - Main Application Logic
 * Handles user input, calculations, and display updates for roof specifications
 */

import { METAL_TABLE, CONCRETE_TABLE, WDB_63, WDS_48 } from './data.js';

// ─────────────────────────────────────────────────────────────────
// DOM ELEMENTS
// ─────────────────────────────────────────────────────────────────

const DOM = {
    roofType: $('#rodzaj_dachu'),
    hasOldInsulation: $('#stare_toggle'),
    oldWaterproofing: $('#stare_papa'),
    oldInsulation: $('#stare_ocieplenie'),
    newThickness: $('#nowa_grubosc'),
    calculation: $('.calculation'),
    results: $('.results'),
};

// ─────────────────────────────────────────────────────────────────
// UI UPDATES
// ─────────────────────────────────────────────────────────────────

function updateDisplayValues() {
    const displays = $('.value-display');
    displays.eq(0).text(`${DOM.newThickness.val()} mm`);
    displays.eq(1).text(`${DOM.oldWaterproofing.val()} mm`);
    displays.eq(2).text(`${DOM.oldInsulation.val()} mm`);
}

function calculate() {
    updateDisplayValues();

    // ─ Get form inputs
    const roofType = DOM.roofType.val();
    const hasOld = DOM.hasOldInsulation.is(':checked');
    const waterproofingThickness = hasOld ? parseInt(DOM.oldWaterproofing.val()) : 0;
    const insultionThickness = hasOld ? parseInt(DOM.oldInsulation.val()) : 0;
    const totalOldThickness = waterproofingThickness + insultionThickness;
    const newThickness = parseInt(DOM.newThickness.val());

    // ─ Determine anchor depth based on roof type
    const anchorDepth = roofType === 'concrete' ? 50 : 14;

    // ─ Toggle visibility of old layers sections
    $('#stare_papa_section').toggle(hasOld);
    $('#stare_ocieplenie_section').toggle(hasOld);

    // ─ Select lookup table
    const lookupTable = roofType === 'metal' ? METAL_TABLE : CONCRETE_TABLE;

    // ─ Find row for current thickness
    const tableRow = lookupTable.find(row => row.insulation >= newThickness);
    if (!tableRow) {
        DOM.calculation.html('<p style="color:#c62828;font-weight:600;">Grubość poza zakresem tabeli</p>');
        DOM.results.empty();
        return;
    }

    // ─ Calculate screw length
    const baseScrewLength = tableRow.screw;
    const calculatedScrewLength = baseScrewLength + totalOldThickness;

    // ─ Select screw array (WDS_48 for metal, WDB_63 for concrete)
    const screwArray = roofType === 'metal' ? WDS_48 : WDB_63;

    // ─ Find matching screw
    const matchedScrew = screwArray.find(screw => screw.length >= calculatedScrewLength);
    const screwCode = matchedScrew
        ? matchedScrew.code
        : 'Brak pasującego wkrętu – przekroczono maksymalną długość';

    // ─ Display calculation parameters
    displayCalculationPanel(roofType, hasOld, waterproofingThickness, insultionThickness, totalOldThickness, newThickness, tableRow, anchorDepth, screwCode);

    // ─ Display order summary
    displayResults(tableRow, screwCode);
}

function displayCalculationPanel(roofType, hasOld, waterproofing, insulation, total, newThickness, row, anchor, screwCode) {
    const roofLabel = roofType === 'metal' ? 'Metalowy' : 'Betonowy';
    const oldLayersInfo = hasOld
        ? `TAK (papa ${waterproofing} mm + ocieplenie ${insulation} mm = ${total} mm)`
        : 'NIE';

    DOM.calculation.html(`
        <strong>Parametry:</strong><br>
        Rodzaj dachu: <strong>${roofLabel}</strong><br>
        Stare ocieplenie: <strong>${oldLayersInfo}</strong><br>
        Nowa izolacja + pokrycie: <strong>${newThickness} mm</strong><br><br>

        • Tuleja: <strong style="font-size:2.1rem;color:#1565c0;">LDTK ${row.length}</strong><br>
        • Wkręt: <strong style="font-size:.8rem;color:#d32f2f;">${screwCode}</strong><br>
        • Kotwa w podłożu: <strong>${anchor} mm</strong>
    `);
}

function displayResults(row, screwCode) {
    DOM.results.html(`
        <h4>Zamów ten zestaw:</h4>
        <div style="text-align:center;padding:2.5rem;background:#e3f2fd;border-radius:16px;">
            <div style="font-size:2rem;font-weight:800;color:#1565c0;margin:1rem 0;">
                LDTK ${row.length}
            </div>
            <div style="font-size:1.5rem;color:#d32f2f;margin:1rem 0;">
                + ${screwCode}
            </div>
        </div>
    `);
}

// ─────────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────────────────────────

DOM.hasOldInsulation.on('change', calculate);
DOM.oldWaterproofing.on('input', calculate);
DOM.oldInsulation.on('input', calculate);
DOM.newThickness.on('input', calculate);
DOM.roofType.on('change', calculate);
$('.suggest_step').on('click', calculate);
$(document).ready(calculate);