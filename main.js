// main.js – Adapted to fixed table values from CSV
import { METAL_TABLE, CONCRETE_TABLE, WDB_63, WDS_48 } from './data.js';

const $dach = $('#rodzaj_dachu');
const $stareToggle = $('#stare_toggle');
const $starePapa = $('#stare_papa');
const $stareOcieplenie = $('#stare_ocieplenie');
const $nowaGrubosc = $('#nowa_grubosc');
const $calculation = $('.calculation');
const $results = $('.results');

function updateDisplays() {
    $('.value-display').eq(0).text($starePapa.val() + ' mm');
    $('.value-display').eq(1).text($stareOcieplenie.val() + ' mm');
    $('.value-display').eq(2).text($nowaGrubosc.val() + ' mm');
}

function calculate() {
    updateDisplays();

    const dach = $dach.val();
    const stareJest = $stareToggle.is(':checked');
    const starePapaVal = stareJest ? parseInt($starePapa.val()) : 0;
    const stareOcieplenieVal = stareJest ? parseInt($stareOcieplenie.val()) : 0;
    const stareSum = starePapaVal + stareOcieplenieVal;  // Sum of two sliders
    const nowaGrubosc = parseInt($nowaGrubosc.val());
    const effectiveInsulation = nowaGrubosc;  // Lookup based on new insulation only
    const kotwa = dach === 'concrete' ? 50 : 14;

    $('#stare_papa_section').toggle(stareJest);
    $('#stare_ocieplenie_section').toggle(stareJest);

    const table = dach === 'metal' ? METAL_TABLE : CONCRETE_TABLE;

    const row = table.find(r => r.insulation >= effectiveInsulation);
    if (!row) {
        $calculation.html('<p style="color:#c62828;font-weight:600;">Grubość poza zakresem tabeli</p>');
        $results.empty();
        return;
    }

    // Calculate new screw length = base from table + sum
    const baseScrew = row.screw;
    const calculatedScrew = baseScrew + stareSum;

    // Select the screw array based on roof type
    const screwArray = dach === 'metal' ? WDS_48 : WDB_63;

    // Find the next longer or equal physical screw
    const selectedScrew = screwArray.find(s => s.length >= calculatedScrew);

    let screwCode;
    if (selectedScrew) {
        screwCode = selectedScrew.code;
    } else {
        screwCode = 'Brak pasującego wkrętu – przekroczono maksymalną długość';
    }

    $calculation.html(`
        <strong>Parametry:</strong><br>
        Rodzaj dachu: <strong>${$dach.find('option:selected').text()}</strong><br>
        Stare ocieplenie: <strong>${stareJest ? 'TAK (papa ' + starePapaVal + ' mm + ocieplenie ' + stareOcieplenieVal + ' mm = ' + stareSum + ' mm)' : 'NIE'}</strong><br>
        Nowa izolacja + pokrycie: <strong>${nowaGrubosc} mm</strong><br><br>

        <strong>Zalecany zestaw 2025 (z tabeli):</strong><br>
        • Tuleja: <strong style="font-size:2.1rem;color:#1565c0;">LDTK ${row.length}</strong><br>
        • Wkręt: <strong style="color:#d32f2f;">${screwCode}</strong><br>
        • Kotwa w podłożu: <strong>${kotwa} mm</strong>
    `);

    $results.html(`
        <h4>Zamów ten zestaw:</h4>
        <div style="text-align:center;padding:2.5rem;background:#e3f2fd;border-radius:16px;">
            <div style="font-size:3rem;font-weight:800;color:#1565c0;margin:1rem 0;">
                LDTK ${row.length}
            </div>
            <div style="font-size:2.4rem;color:#d32f2f;margin:1rem 0;">
                + ${screwCode}
            </div>
            <div style="margin-top:1rem;color:#555;">
                Kotwa ${kotwa} mm
            </div>
        </div>
    `);
}

// Events
$stareToggle.on('change', calculate);
$starePapa.on('input', calculate);
$stareOcieplenie.on('input', calculate);
$nowaGrubosc.on('input', calculate);
$dach.on('change', calculate);
$('.suggest_step').on('click', calculate);
$(document).ready(calculate);