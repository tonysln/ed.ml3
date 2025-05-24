const lb = [null, 'badge-important', 'badge-important', 'badge-warning', 'badge-success', 'badge-info']

let app = $('#app');
let wroom = $('#waitingroom');
let log = $('#log');


function drawPatientsTable(state) {
  // TODO higlight latest entry?
  // higlight level 1 patients
  // higlight overdue patients, deaths, leaving patients

  wroom.empty();
  for (let i = 0; i < state['patients'].length; i++) {
    const p = state['patients'][i];
    const tr = $('<tr></tr>');
    tr.append($('<td></td>', {text: p['name']}));
    tr.append($('<td></td>', {text: classes[p['class']]}));
    tr.append($('<td></td>', {text: p['condition']}));
    const lvl = p['level'];
    tr.append($('<td></td>').append($('<span></span>', {text: lvl, 'class': 'badge ' + lb[lvl]})));
    tr.append($('<td></td>', {text: p['wait'] + ' min'}));
    wroom.append(tr);
  }
}

function drawChange(p, c) {
  if (p > c)
    return ' ↓';
  if (p < c)
    return ' ↑';
  return '';
}

// TODO graphs !!
function drawStats(state) {
  const pdaw = $("#daw").text();
  const cdaw = state['doctors'][state['hour']];
  $("#daw").text(cdaw + drawChange(pdaw, cdaw));

  const ppw = $("#pw").text();
  const cpw = state['patients'].length;
  $("#pw").text(cpw + drawChange(ppw, cpw));

  $("#ta").text(state['stats']['ta']);
  $("#td").text(state['stats']['td']);
  $("#aph").text(state['stats']['aph']);
  $("#dph").text(state['stats']['dph']);
  $("#rph").text('$' + state['stats']['rph']);
  $("#tr").text('$' + state['stats']['tr']);
  $("#tu").text(state['stats']['tu']);

  $("#clock").text(state['hour'].toString().padStart(2, '0') + ':' + state['min'].toString().padStart(2, '0'))

  for (let i = 1; i < state['etas'].length; i++) {
    $('#eta'+i).text(state['etas'][i] + ' min');
  }
}

$('.speed-btn').on('click', function () {
  $('.speed-btn').removeClass('btn-success').addClass('btn-secondary');

  $(this).removeClass('btn-secondary').addClass('btn-success');

  const speedMap = {
    'speed-1x': 10000,
    'speed-2x': 5000,
    'speed-40x': 250
  };
  const id = $(this).attr('id');
  state['speed'] = speedMap[id];
});

function writeToLog(str) {
  log.append($('<p></p>', {text: str}))
  log.scrollTop(function() { return this.scrollHeight; });
}


