
import { METAL_TABLE, CONCRETE_TABLE, WDB_63, WDS_48 } from './data.js';

const DOM = {
    roofType: $('#rodzaj_dachu'),
    hasOldInsulation: $('#stare_toggle'),
    oldThickness: $('#stare_grubosc'),
    newThickness: $('#nowa_grubosc'),
    calculation: $('.calculation'),
    results: $('.results'),
};

function updateDisplayValues() {
    const displays = $('.value-display');
    displays.eq(0).text(`${DOM.newThickness.val()} mm`);
    displays.eq(1).text(`${DOM.oldThickness.val()} mm`);
}

function calculate() {
    updateDisplayValues();

    const roofType = DOM.roofType.val();
    let hasOld = DOM.hasOldInsulation.is(':checked');
    let totalOldThickness = hasOld ? parseInt(DOM.oldThickness.val()) : 0;
    const newThickness = parseInt(DOM.newThickness.val());

    if (roofType === 'metal') {
        $('#stare_toggle_section').hide();
        $('#stare_warstwy_section').hide();
        DOM.hasOldInsulation.prop('checked', false);
        hasOld = false;
        totalOldThickness = 0;
    } else {
        $('#stare_toggle_section').show();
        $('#stare_warstwy_section').toggle(hasOld);
    }

    if (newThickness <= 40) {
        DOM.calculation.empty();
        DOM.results.empty();
        return;
    }

    const anchorDepth = roofType === 'concrete' ? 50 : 14;

    const lookupTable = roofType === 'metal' ? METAL_TABLE : CONCRETE_TABLE;

    const tableRow = lookupTable.find(row => row.insulation >= newThickness);
    if (!tableRow) {
        DOM.calculation.html('<p style="color:#c62828;font-weight:600;">Grubość poza zakresem tabeli</p>');
        DOM.results.empty();
        return;
    }

    const baseScrewLength = tableRow.screw;
    const calculatedScrewLength = baseScrewLength + totalOldThickness;

    const screwArray = roofType === 'metal' ? WDS_48 : WDB_63;

    const matchedScrew = screwArray.find(screw => screw.length >= calculatedScrewLength);
    const screwCode = matchedScrew
        ? matchedScrew.code
        : 'Brak pasującego wkrętu – przekroczono maksymalną długość';

    displayCalculationPanel(roofType, hasOld, totalOldThickness, newThickness, tableRow, anchorDepth, screwCode);

    displayResults(tableRow, screwCode);
}

function displayCalculationPanel(roofType, hasOld, total, newThickness, row, anchor, screwCode) {
    const roofLabel = roofType === 'metal' ? 'Metalowy' : 'Betonowy';
    const oldLayersInfo = hasOld
        ? `TAK (${total} mm)`
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

DOM.hasOldInsulation.on('change', calculate);
DOM.oldThickness.on('input', calculate);
DOM.newThickness.on('input', calculate);
DOM.roofType.on('change', calculate);
$('.suggest_step').on('click', calculate);
$(document).ready(calculate);