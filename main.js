// main.js – finalna, czysta wersja (wszystkie dane w data.js)
import { LDTK_TABLE, WDB_63, WDS_48 } from './data.js';

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
    const kotwa = dach === 'concrete' ? 50 : 14;

    $('#stare_grubosc_section').toggle(stareJest);

    const ldtk = LDTK_TABLE.find(r => r.insulation >= nowaGrubosc);
    if (!ldtk) {
        $calculation.html('<p style="color:#c62828;font-weight:600;">Grubość nowej izolacji poza zakresem (70–700 mm)</p>');
        $results.empty();
        return;
    }

    let wkretKod;

    if (dach === 'metal') {
        // Metal: +20 mm (zgubione) + 20 mm (minimalne zakotwienie w blasze)
        const wymagana = nowaGrubosc + 40;
        const wybrany = WDS_48.find(w => w.length >= wymagana) || WDS_48[WDS_48.length - 1];
        wkretKod = wybrany.code;
    } else {
        // Beton: (nowa − LDTK) + 20 mm (zgubione) + 30 mm (zakotwienie) + stare ocieplenie
        const wymagana = (nowaGrubosc - ldtk.length) + 20 + 30 + stareGrubosc;
        const wybrany = WDB_63.find(w => w.length >= wymagana) || WDB_63[WDB_63.length - 1];
        wkretKod = wybrany.code;
    }

    $calculation.html(`
        <strong>Parametry:</strong><br>
        Rodzaj dachu: <strong>${$dach.find('option:selected').text()}</strong><br>
        Stare ocieplenie: <strong>${stareJest ? 'TAK (' + stareGrubosc + ' mm)' : 'NIE'}</strong><br>
        Nowa izolacja + pokrycie: <strong>${nowaGrubosc} mm</strong><br><br>

        <strong>Zalecany zestaw 2025:</strong><br>
        • Tuleja: <strong style="font-size:2.1rem;color:#1565c0;">LDTK ${ldtk.length}</strong><br>
        • Wkręt: <strong style="color:#d32f2f;">${wkretKod}</strong><br>
        • Kotwa w podłożu: <strong>${kotwa} mm</strong>
        <small>(${dach === 'concrete' ? 'min. 30 mm w betonie' : 'min. 20 mm w blasze'})</small>
    `);

    $results.html(`
        <div style="text-align:center;padding:2.5rem;background:#e3f2fd;border-radius:16px;">
            <div style="font-size:3rem;font-weight:800;color:#1565c0;margin:1rem 0;">
                LDTK ${ldtk.length}
            </div>
            <div style="font-size:2.4rem;color:#d32f2f;margin:1rem 0;">
                + ${wkretKod}
            </div>
        </div>
    `);
}

$stareToggle.on('change', calculate);
$stareGrubosc.on('input', calculate);
$nowaGrubosc.on('input', calculate);
$dach.on('change', calculate);
$('.suggest_step').on('click', calculate);
$(document).ready(calculate);