'use strict';

const currencies = ['USD', 'EUR', 'GBP'];
const balancedRates = [.92, 1.075, .86, 1.14, 1.24, .76];
const pairs = [['USD','EUR'],['EUR','USD'],['EUR','GBP'],['GBP','EUR'],['GBP','USD'],['USD','GBP']];
const graph = document.querySelector('#graph');
const ctx = graph.getContext('2d');
const result = document.querySelector('#result');
const fields = document.querySelector('#rates');
const balanced = document.querySelector('#balanced');
const opportunity = document.querySelector('#opportunity');
let model;

const inputs = pairs.map(([from, to], index) => {
  const row = document.createElement('div');
  row.className = 'rate';
  const label = document.createElement('label');
  label.htmlFor = 'rate-' + index;
  label.textContent = from + ' → ' + to;
  const input = document.createElement('input');
  input.id = label.htmlFor;
  input.type = 'number';
  input.lang = 'en';
  input.min = '.001';
  input.max = '1000';
  input.step = 'any';
  input.addEventListener('input', () => {
    setPressed(null);
    update();
  });
  row.append(label, input);
  fields.append(row);
  return input;
});

function setPressed(active) {
  balanced.setAttribute('aria-pressed', active === balanced);
  opportunity.setAttribute('aria-pressed', active === opportunity);
}

function loadScenario(active) {
  inputs.forEach((input, i) => { input.value = balancedRates[i]; });
  if (active === opportunity) inputs[4].value = 1.29;
  setPressed(active);
  update();
}

function summarize(route) {
  const multiplier = route.reduce((amount, edge) => amount * edge.rate, 1);
  const path = [route[0].from, ...route.map(edge => edge.to)].join(' → ');
  return { multiplier, path };
}

function update() {
  const rates = inputs.map(input => {
    const valid = input.value !== '' && input.validity.valid;
    input.setAttribute('aria-invalid', String(!valid));
    return valid ? input.valueAsNumber : null;
  });
  const edges = pairs.map(([from,to], i) => ({from,to,rate:rates[i]}));
  if (rates.includes(null)) {
    model = {edges, route: [], title:'Enter valid rates', detail:'Use numbers from 0.001 to 1,000.'};
  } else {
    const cycle = CurrencyEngine.findArbitrage(currencies, edges);
    if (cycle.length) {
      const {multiplier,path} = summarize(cycle);
      const start = cycle[0].from;
      const gain = (multiplier - 1) * 100;
      model = {edges, route:cycle, path, title:'Arbitrage detected',
        detail:`1,000.00 ${start} → ${(1000 * multiplier).toFixed(2)} ${start}  ·  +${gain < .01 ? '<0.01' : gain.toFixed(2)}%`};
    } else {
      const route = CurrencyEngine.bestRoute(currencies, edges, 'USD','GBP');
      const {multiplier,path} = summarize(route);
      model = {edges, route, path, title:'No arbitrage detected',
        detail:`Best USD → GBP route  ·  1,000.00 USD → ${(1000 * multiplier).toFixed(2)} GBP`};
    }
  }
  result.replaceChildren();
  const heading = document.createElement('h2');
  const status = document.createElement('strong');
  status.textContent = model.title;
  heading.append(status);
  result.append(heading);
  if (model.path) {
    const route = document.createElement('p');
    route.className = 'route';
    route.textContent = model.path;
    result.append(route);
  }
  const detail = document.createElement('p');
  detail.textContent = model.detail;
  result.append(detail);
  render();
}

function render() {
  const width = graph.clientWidth, height = graph.clientHeight;
  if (!width || !height) return;
  const density = Math.min(devicePixelRatio, 2);
  if (graph.width !== Math.round(width*density) || graph.height !== Math.round(height*density)) {
    graph.width = Math.round(width*density);
    graph.height = Math.round(height*density);
  }
  ctx.setTransform(density,0,0,density,0,0);
  ctx.fillStyle = '#0e1c22';
  ctx.fillRect(0,0,width,height);
  ctx.fillStyle = '#25413f';
  for (let x=14; x<width; x+=22) for (let y=14; y<height; y+=22) ctx.fillRect(x,y,1.25,1.25);

  const gap = Math.min(width*.33, height*.32);
  const positions = {USD:[width*.5,height*.235],EUR:[width*.5+gap,height*.71],GBP:[width*.5-gap,height*.71]};
  const radius = width < 470 ? 24 : 32;
  const offset = width < 470 ? 9 : 13;
  const active = new Set(model.route);
  const ordered = [...model.edges].sort((a,b) => active.has(a) - active.has(b));
  for (const edge of ordered) {
    const [x1,y1] = positions[edge.from];
    const [x2,y2] = positions[edge.to];
    const length = Math.hypot(x2-x1,y2-y1);
    const dx = (x2-x1)/length, dy = (y2-y1)/length;
    const nx = -dy, ny = dx;
    const x = x2-dx*(radius+4)+nx*offset, y = y2-dy*(radius+4)+ny*offset;
    const color = active.has(edge) ? '#78e1ba' : '#789590';
    ctx.strokeStyle = color;
    ctx.lineWidth = active.has(edge) ? 3 : 1.4;
    ctx.beginPath();
    ctx.moveTo(x1+dx*(radius+4)+nx*offset,y1+dy*(radius+4)+ny*offset);
    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x-9*dx+4*nx,y-9*dy+4*ny);
    ctx.lineTo(x-9*dx-4*nx,y-9*dy-4*ny);
    ctx.fill();
    const tx = (x1+x2)/2+nx*(offset+9);
    const ty = (y1+y2)/2+ny*(offset+9);
    ctx.font = `600 ${width < 470 ? 11 : 14}px ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = edge.rate === null ? '–' : String(edge.rate);
    const labelWidth = ctx.measureText(label).width + 10;
    ctx.fillStyle = '#0e1c22';
    ctx.fillRect(tx-labelWidth/2,ty-9,labelWidth,18);
    ctx.fillStyle = color;
    ctx.fillText(label,tx,ty);
  }
  for (const [currency,[x,y]] of Object.entries(positions)) {
    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI*2);
    ctx.fillStyle = '#16352e';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#78e1ba';
    ctx.stroke();
    ctx.font = `700 ${width < 470 ? 13 : 16}px system-ui`;
    ctx.fillStyle = '#dcfff2';
    ctx.fillText(currency,x,y);
  }
}

balanced.addEventListener('click', () => loadScenario(balanced));
opportunity.addEventListener('click', () => loadScenario(opportunity));
loadScenario(opportunity);
new ResizeObserver(render).observe(graph);
