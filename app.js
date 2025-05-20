function wrand() {
  const weights = [1, 2, 3, 4, 5];
  const rand = Math.random() * 15;

  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) 
      return i + 1;
  }
}

const doctimes = [5, 5, 5, 5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 10, 10, 10, 10, 10, 10, 9, 9, 8, 7, 6, 5];
const etas = [null, 1, 15, 60, 120, 300]; // default ETAs
const eta_div = 5;  // ETA calculation divisor for each new patient
const tick_min = 10; // In-game minutes per tick

let state = {
  'doctors': [...doctimes],
  'patients': [], // {'name/id', 'condition', 'class', 'level', 'wait'}
  'pbl': [null, 0, 0, 0, 0, 0],
  'speed': 10000,
  'hour': 12,
  'min': 0,
  'stats': { 'aph': 0, 'dph': 0, 'ta': 0,'td': 0, 'rph': 0, 'tr': 0 },
  'etas': [...etas]
};

// todo:
// - popups / log to register previous events

function tick() {
  // Update existing patients
  for (let i = 0; i < state['patients'].length; i++) {
    state['patients'][i]['wait'] += tick_min;

    let p = state['patients'][i];
    let lvl = p['level'];
    let mw = state['etas'][lvl];
    if (p['wait'] >= mw) {
      console.log('discharging:',p,mw);
      state['patients'].splice(i, 1);

      // Most get admitted but slight chance to be sent home, esp. for higher levels
      if (lvl >= 4 && Math.random() > 0.75) {
        writeToLog(`Sent home: ${p['name']} with ${p['condition']}.`);
      } else {
        state['stats']['ta'] += 1;
        writeToLog(`Admitted: ${p['name']} with ${p['condition']}.`);
      }
    }
    // else if 'wait' too long, die
  }


  // Randomly create new patient

  // TODO increase based on time of day,
  // introduce random events that last X hours 
  if (Math.random() > 0.7) {
    const lvl = wrand();
    state['patients'].unshift({
      'name': names[Math.floor(names.length * Math.random())],
      'condition': conds[lvl][Math.floor(conds[lvl].length * Math.random())],
      'level': lvl,
      'wait': 0
    });

    // Update eta
    state['pbl'][lvl] += 1;
  }

  // Re-load patients table
  drawPatientsTable(state);

  // Update stats
  state['min'] += tick_min;
  if (state['min'] >= 60) {
    state['min'] = 0;
    state['hour'] = (state['hour'] + 1) % 24;

    // Next hour updates
  }

  // Update ETAs
  for (let i = 1; i < state['etas'].length; i++) {
    state['etas'][i] = Math.round(etas[i] + etas[i]*state['pbl'][i] / eta_div / state['doctors'][state['hour']]);
  }

  drawStats(state);

  window.setTimeout(tick, state['speed']);
}

// Init
$(function() {
  drawPatientsTable(state);
  drawStats(state);
  window.setTimeout(tick, state['speed']);
});
