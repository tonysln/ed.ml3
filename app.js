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

const hist_size = 100;

const canvas = document.getElementById('patientCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 300;

let state = {
  'doctors': [...doctimes],
  'patients': [], // {'name/id', 'condition', 'class', 'level', 'wait', 'status'}
  'pbl': [null, 0, 0, 0, 0, 0],
  'speed': 10000,
  'hour': 12,
  'min': 0,
  'stats': { 'aph': 0, 'dph': 0, 'ta': 0,'td': 0, 'rph': 0, 'tr': 0, 'tu': 0},
  'etas': [...etas],
  'upgrade_price': 75.0
};
state['hist'] = Object.fromEntries(Object.keys(state.stats).map(k => [k, []]));

// todo:
// - popups / log to register previous events
// - NB! calculate avg waiting time for each ETA to compare with traditional/expected system
// - "airplane boarding system": instead of bumping up your level you have different docs for different levels/classes
// ie the poor people doctor vs nobility only doc

function tick() {
  // Update existing patients
  for (let i = 0; i < state['patients'].length; i++) {
    state['patients'][i]['wait'] += tick_min;

    let p = state['patients'][i];
    let lvl = p['level'];
    let mw = state["etas"][lvl];

    //kill the hobos
    if(p["stat"] == "killed" && (p["class"]!='Nobility' || p["class"]!='Cryptobro')){
    	state["stats"]["td"] += 1;
    	writeToLog(`Killed: ${p["name"]} with ${p["condition"]}`);
    	state["patients"].splice(i, 1);
    	drawPatientsTable(state);
    }

    if (p["wait"] >= mw) {
      state["patients"].splice(i, 1);

      // else if 'wait' too long (ie 1.6x of nominal time), die
      // todo: if someone gets an upgrade their risk of dying should not go up. currently a bug. 
      if (
        lvl == 1 &&
        p["wait"] >= mw * 30
      ) {
        state["stats"]["td"] += 1;
        p["stat"] = "died";
        writeToLog(`Died: ${p["name"]} with ${p["condition"]} after waiting ${p["wait"]} minutes. Wait time was ${mw}`);
      }
      else if (
        lvl >= 2 &&
        p["wait"] >= mw * 1.6
      ) {
        state["stats"]["td"] += 1;
        p["stat"] = "died";
        writeToLog(`Died: ${p["name"]} with ${p["condition"]} after waiting ${p["wait"]} minutes. Wait time was ${mw}`);
      }
      // Most get admitted but slight chance to be sent home, esp. for higher levels
      if (lvl >= 4 && Math.random() > 0.75 && p['stat'] != "died") {
        p["stat"] = "sent home";
        writeToLog(`Sent home: ${p["name"]} with ${p["condition"]}.`);
      } else if (p['stat'] != "died"){
        state["stats"]["ta"] += 1;
        p["stat"] = "admitted";
        writeToLog(`Admitted: ${p["name"]} with ${p["condition"]}.`);
      }
    }
    
    // If class allows it, pay to bump up the level! Suck it, poor people!
    const pcls = p['class'];
    const upp = state['upgrade_price'];
    if (lvl >= 3 && pcls >= 3 && Math.random() > 0.8 && p['cash'] >= upp) { 
      // TODO follow new distribution, similar to wrand() actually
      state['patients'][i]['level'] -= 1;
      state['patients'][i]['cash'] -= upp;
      state['patients'][i]['upgraded'] = true
      state['stats']['tr'] += upp;
      state['stats']['tu'] += 1;
      p['stat'] = "upgraded"
      writeToLog(`Upgraded: ${p['name']} from ${lvl} to ${lvl-1}.`);
    }
  }

  // Randomly create new patient

  // TODO increase based on time of day,
  // introduce random events that last X hours 
  if (Math.random() > 0.7) {
    const lvl = wrand();
    const pclass = Math.floor(classes.length * Math.random()); // TODO realistic distribution, Gauss should suffice
    const pcash = state['upgrade_price'] * 0.5 * pclass;

    state['patients'].unshift({
      'name': names[Math.floor(names.length * Math.random())],
      'class': pclass,
      'condition': conds[lvl][Math.floor(conds[lvl].length * Math.random())],
      'level': lvl,
      'wait': 0,
      'cash': pcash, // to limit the amount of upgrades per patient
      'status': stat, 
      'upgraded': false
    });

    // Update eta
    state['pbl'][lvl] += 1;
    drawPatients()
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

  // Update histogram info
  for (const stat of Object.keys(state.stats)) {
    state.hist[stat].push(state.stats[stat]);
    if (state.hist[stat].length < hist_size) {
      state.hist[stat].shift();
    }
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
