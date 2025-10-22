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
  $('.speed-btn').removeClass('btn-success animate__animated animate__pulse').addClass('btn-secondary');

  $(this).removeClass('btn-secondary').addClass('btn-success  animate__animated animate__pulse');

  const speedMap = {
    'speed-1x': 10000,
    'speed-2x': 5000,
    'speed-40x': 250
  };
  const id = $(this).attr('id');
  state['speed'] = speedMap[id];
});

$('.kill_the_hobos').on('click', function () {

  $(this).removeClass('btn-secondary').addClass('btn btn-danger animate__animated animate__pulse');

  for (let i = 0; i < state['patients'].length; i++) {
    const p = state['patients'][i];
    p["stat"] = "killed";
    console.log("test",p)
  }

  const id = $(this).attr('id');

});

const xyValues = [
  {x:50, y:7},
  {x:60, y:8},
  {x:70, y:8},
  {x:80, y:9},
  {x:90, y:9},
  {x:100, y:9},
  {x:110, y:10},
  {x:120, y:11},
  {x:130, y:14},
  {x:140, y:14},
  {x:150, y:15}
];

new Chart("myChart", {
  type: "scatter",
  data: {
    datasets: [{
      pointRadius: 4,
      pointBackgroundColor: "rgb(82, 82, 190)",
      data: xyValues
    }]
  },
});



function writeToLog(str) {
  log.append($('<p></p>', {text: str}))
  log.scrollTop(function() { return this.scrollHeight; });
}

function drawPatients(nrOfPatients) {
  ctx.clearRect(0, 0, 500, 300);
  for (i=0;i<nrOfPatients;i++) {
    const img = new Image();
    img.src = 'bootstrap/img/pixel_guy.png';
    const x = 50 + Math.random() * 400;
    const y = 50 + Math.random() * 200;
    ctx.drawImage(img, x, y);
  }
}
