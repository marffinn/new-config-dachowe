// main.js – Adapted to fixed table values from CSV
import { METAL_TABLE, CONCRETE_TABLE } from './data.js';

const $dach = $('#rodzaj_dachu');
const $stareToggle = $('#stare_toggle');
const $stareGrubosc = $('#stare_grubosc');
const $nowaGrubosc = $('#nowa_grubosc');
const $calculation = $('.calculation');
const $results = $('.results');

function updateDisplays() {
    $('.value-display').eq(0).text($stareGrubosc.val() + ' mm');
    $('.value-display').eq(1).text($nowaGrubosc.val() + ' mm');
}

function calculate() {
    updateDisplays();

    const dach = $dach.val();
    const stareJest = $stareToggle.is(':checked');
    const stareGrubosc = stareJest ? parseInt($stareGrubosc.val()) : 0;
    const nowaGrubosc = parseInt($nowaGrubosc.val());
    const effectiveInsulation = nowaGrubosc + stareGrubosc;  // Add old to effective for lookup
    const kotwa = dach === 'concrete' ? 50 : 14;

    $('#stare_grubosc_section').toggle(stareJest);

    const table = dach === 'metal' ? METAL_TABLE : CONCRETE_TABLE;

    const row = table.find(r => r.insulation >= effectiveInsulation);
    if (!row) {
        $calculation.html('<p style="color:#c62828;font-weight:600;">Grubość poza zakresem tabeli</p>');
        $results.empty();
        return;
    }

    const screwCode = dach === 'metal' ? `WDS 48 ${row.screw}` : `WDB 63 ${row.screw}`;

    $calculation.html(`
        <strong>Parametry:</strong><br>
        Rodzaj dachu: <strong>${$dach.find('option:selected').text()}</strong><br>
        Stare ocieplenie: <strong>${stareJest ? 'TAK (' + stareGrubosc + ' mm)' : 'NIE'}</strong><br>
        Skuteczna grubość: <strong>${effectiveInsulation} mm</strong><br><br>

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
$stareGrubosc.on('input', calculate);
$nowaGrubosc.on('input', calculate);
$dach.on('change', calculate);
$('.suggest_step').on('click', calculate);
$(document).ready(calculate);