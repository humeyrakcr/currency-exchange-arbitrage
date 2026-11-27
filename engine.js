'use strict';

const CurrencyEngine = (() => {
  const tolerance = 1e-12;

  function solve(vertices, edges, source) {
    const distances = new Map(vertices.map(vertex => [vertex, source === undefined || vertex === source ? 0 : Infinity]));
    const parent = new Map();
    let changed;
    // An undefined source acts as a super-source, so disconnected components are checked too.
    for (let pass = 0; pass < vertices.length; pass++) {
      changed = undefined;
      for (const edge of edges) {
        const candidate = distances.get(edge.from) - Math.log(edge.rate);
        if (candidate < distances.get(edge.to) - tolerance) {
          distances.set(edge.to, candidate);
          parent.set(edge.to, edge);
          changed = edge.to;
        }
      }
      if (changed === undefined) return {parent, cycle: []};
    }
    if (changed === undefined) return {parent, cycle: []};

    // Step into the cycle before following predecessor edges around it.
    let vertex = changed;
    for (let i = 0; i < vertices.length; i++) vertex = parent.get(vertex).from;
    const start = vertex;
    const cycle = [];
    do {
      const edge = parent.get(vertex);
      cycle.push(edge);
      vertex = edge.from;
    } while (vertex !== start);
    return {parent, cycle: cycle.reverse()};
  }

  function findArbitrage(vertices, edges) {
    const {cycle} = solve(vertices, edges);
    const first = cycle.findIndex(edge => edge.from === vertices[0]);
    return first > 0 ? cycle.slice(first).concat(cycle.slice(0, first)) : cycle;
  }

  function bestRoute(vertices, edges, from, to) {
    if (!vertices.includes(from) || !vertices.includes(to)) return null;
    const {parent, cycle} = solve(vertices, edges, from);
    if (cycle.length) return null;
    const route = [];
    for (let vertex = to; vertex !== from;) {
      const edge = parent.get(vertex);
      if (!edge) return null;
      route.push(edge);
      vertex = edge.from;
    }
    return route.reverse();
  }

  return {findArbitrage, bestRoute};
})();

if (typeof module !== 'undefined') module.exports = CurrencyEngine;
