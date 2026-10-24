// Stand-in for the hosted dashboard runtime: loads the JSON files in /data,
// runs the page's calculations, and keeps the waste-type filter in memory.
(function () {
  const FILES = {
    ar_enforcement: 'ar_enforcement.json',
    ar_monitoring: 'ar_monitoring.json',
    ar_pm10: 'ar_pm10.json',
    ar_zones: 'ar_zones.json',
    ar_labs: 'ar_labs.json',
    ar_flc: 'ar_finance_legal_citizen.json',
    s_pipeline: 'sample_pipeline.json',
    s_pipeline_ro: 'sample_pipeline_ro.json',
    s_validity: 'sample_validity.json',
    s_inspections: 'sample_inspections.json',
    s_waste: 'sample_waste.json',
    s_quality: 'sample_quality.json',
    s_labs_sites: 'sample_labs_sites.json',
    s_legal_fin_cit: 'sample_legal_fin_cit.json',
    s_auth: 'sample_auth.json',
    ref_offices: 'ref_offices.json',
    geo_districts: 'geo_districts.json',
  };
  const DEFAULT_PARAMS = { waste: 'All' };

  const store = {};
  Object.keys(FILES).forEach((id) => { store[id] = { status: 'loading', data: [] }; });
  const calcs = {};
  let cache = {};
  const callbacks = [];
  let params = Object.assign({}, DEFAULT_PARAMS);

  const runAll = () => {
    cache = {};
    callbacks.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
  };

  const result = (id) => {
    const s = store[id];
    if (s) return { status: s.status, data: s.data, message: s.message, refreshing: false, meta: [], columns: s.data[0] ? Object.keys(s.data[0]) : [] };
    const c = calcs[id];
    if (!c) return { status: 'missing', data: [], meta: [] };
    if (cache[id]) return cache[id];
    const inputs = c.inputs.map(result);
    const notReady = inputs.find((r) => r.status !== 'ok');
    let out;
    if (notReady) out = { status: notReady.status === 'loading' ? 'loading' : 'error', data: [], meta: [] };
    else {
      try { out = { status: 'ok', data: c.fn(...inputs.map((r) => r.data)), meta: [] }; }
      catch (e) { console.error('calculation ' + id, e); out = { status: 'error', data: [], message: e.message, meta: [] }; }
    }
    cache[id] = out;
    return out;
  };

  window.dash = {
    colors: ['#2f6fb3', '#d9822b', '#3a9a5b', '#8a63b8', '#c0504d', '#2a9d9d', '#b5893a', '#6b7a8f'],
    data: result,
    calc: (id, o) => { calcs[id] = o; cache = {}; },
    loader: () => {},
    onData: (fn) => { callbacks.push(fn); try { fn(); } catch (e) { console.error(e); } },
    params: () => Object.assign({}, params),
    setParams: (p) => { Object.assign(params, p); runAll(); },
    resetParams: () => { params = Object.assign({}, DEFAULT_PARAMS); runAll(); },
    setLink: (name) => { try { history.replaceState(null, '', '#' + name); } catch (e) { /* ignore */ } },
    refresh: () => {},
  };

  const load = () => Promise.all(Object.entries(FILES).map(([id, file]) =>
    fetch('data/' + file)
      .then((r) => { if (!r.ok) throw new Error(r.status + ' ' + r.statusText); return r.json(); })
      .then((j) => { store[id] = { status: 'ok', data: Array.isArray(j) ? j : (j.rows || j.data || j.results || []) }; })
      .catch((e) => { console.error('Failed to load ' + file, e); store[id] = { status: 'error', data: [], message: e.message }; })
      .then(runAll)));

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(runAll, 150); });
})();
