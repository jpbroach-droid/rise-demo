/* =====================================================================
   Rise Elevator × Monopole Labs — shared demo data + store
   Every page loads this file. State persists in localStorage under
   KEY so a request made on the website shows up on the dispatch board,
   a mechanic close-out shows up in the customer portal, etc.
   TEST MODE: all names, buildings and figures are demo values.
   ===================================================================== */
(function () {
  'use strict';
  var KEY = 'rise-demo-v1';
  var TODAY = '2026-11-04';            // demo "today" (Wednesday)
  var NOW_TIME = '10:42';

  /* ---------- seeded random so every viewer sees the same data ---------- */
  var seed = 51;
  function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function int(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }

  /* ---------- date helpers ---------- */
  function d(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(dt) { var m = dt.getMonth() + 1, dd = dt.getDate(); return dt.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd; }
  function addDays(s, n) { var x = d(s); x.setDate(x.getDate() + n); return iso(x); }
  function wk(s) { var x = d(s); var g = x.getDay(); if (g === 6) return addDays(s, 2); if (g === 0) return addDays(s, 1); return s; }
  function daysBetween(a, b) { return Math.round((d(b) - d(a)) / 864e5); }

  /* ---------- org ---------- */
  var owners = [
    { id: 'own-a', name: 'James', role: 'Principal owner', share: 'All territories except Hampton Roads', holding: true },
    { id: 'own-b', name: 'Marcus Hale', role: 'Territory owner', share: 'Hampton Roads', holding: true }
  ];
  var territories = [
    { id: 'RIC', name: 'Richmond & Central VA', owner: 'own-a', color: '#3A6EA5', office: 'Richmond (HQ)' },
    { id: 'NOVA', name: 'Northern Virginia', owner: 'own-a', color: '#1F8A85', office: 'Alexandria' },
    { id: 'DCMD', name: 'DC & Maryland', owner: 'own-a', color: '#7A4E9C', office: 'Alexandria' },
    { id: 'HR', name: 'Hampton Roads', owner: 'own-b', color: '#6E7F2A', office: 'Norfolk' }
  ];
  var locals = [
    { id: 'L-DC', name: 'IUEC local — DC / MD / NoVA', baseRate: 64.85, fringe: 38.12, hall: 'Alexandria, VA', zoneMiles: 35, zonePay: 5.25, perDiemMiles: 75, perDiem: 85, holding: true },
    { id: 'L-VA', name: 'IUEC local — Richmond / Tidewater', baseRate: 56.40, fringe: 33.70, hall: 'Richmond, VA (Tidewater sub-zone: Norfolk)', zoneMiles: 35, zonePay: 4.50, perDiemMiles: 75, perDiem: 75, holding: true }
  ];

  var mechNames = [
    ['Ron Whitfield', 'RIC', 'Mechanic', 'L-VA'], ['Tasha Greene', 'RIC', 'Mechanic', 'L-VA'], ['Luis Ortega', 'RIC', 'Mechanic', 'L-VA'],
    ['Kevin Doyle', 'RIC', 'Apprentice', 'L-VA'], ['Andre Massey', 'NOVA', 'Mechanic', 'L-DC'], ['Brian Kowalski', 'NOVA', 'Mechanic', 'L-DC'],
    ['Samir Haddad', 'NOVA', 'Adjuster', 'L-DC'], ['Chris Pennington', 'NOVA', 'Apprentice', 'L-DC'], ['Darnell Price', 'DCMD', 'Mechanic', 'L-DC'],
    ['Erin Callahan', 'DCMD', 'Mechanic', 'L-DC'], ['Mike Szabo', 'DCMD', 'Mod Mechanic', 'L-DC'], ['Jamal Whitaker', 'HR', 'Mechanic', 'L-VA'],
    ['Patrick Nguyen', 'HR', 'Mechanic', 'L-VA'], ['Gary Holloway', 'HR', 'Mod Mechanic', 'L-VA'], ['Dylan Rhodes', 'HR', 'Apprentice', 'L-VA']
  ];
  var mechanics = mechNames.map(function (m, i) {
    var loc = locals.filter(function (l) { return l.id === m[3]; })[0];
    var mult = m[2] === 'Apprentice' ? 0.65 : m[2] === 'Adjuster' ? 1.12 : 1;
    var base = Math.round(loc.baseRate * mult * 100) / 100;
    return {
      id: 'M' + (101 + i), name: m[0], initials: m[0].split(' ').map(function (s) { return s[0]; }).join(''),
      territory: m[1], title: m[2], local: m[3], phone: '(804) 555-0' + (110 + i),
      baseRate: base, fringe: loc.fringe, burden: 0.142, vehicle: 9.5,
      loaded: Math.round((base * 1.142 + loc.fringe + 9.5) * 100) / 100,
      route: m[2] === 'Mod Mechanic' || m[2] === 'Apprentice' ? null : 'R-' + m[1] + '-' + (i % 3 + 1),
      status: 'available', ptoDates: []
    };
  });
  mechanics[1].status = 'pto'; mechanics[1].ptoDates = ['2026-11-03', '2026-11-04', '2026-11-05'];
  mechanics[1].coveredBy = 'M103';

  var office = [
    { id: 'U1', name: 'James', role: 'Owner', scope: 'ALL' },
    { id: 'U2', name: 'Marcus Hale', role: 'Owner', scope: ['HR'] },
    { id: 'U3', name: 'Dana Whitmore', role: 'Office manager', scope: 'ALL' },
    { id: 'U4', name: 'Keisha Barnes', role: 'Dispatcher', scope: 'ALL' },
    { id: 'U5', name: 'Tom Reilly', role: 'Ops manager — estimates approver', scope: 'ALL' },
    { id: 'U6', name: 'Laura Chen', role: 'Sales — NoVA / DC', scope: ['NOVA', 'DCMD'] },
    { id: 'U7', name: 'Ben Atkins', role: 'Sales — Richmond', scope: ['RIC'] },
    { id: 'U8', name: 'Priya Shah', role: 'Accounting', scope: 'ALL' }
  ];

  // road miles between territory hubs — used for zone pay / per diem when a mechanic works away from home
  var hubMiles = { RIC: { RIC: 0, NOVA: 105, DCMD: 112, HR: 95 }, NOVA: { RIC: 105, NOVA: 0, DCMD: 14, HR: 190 }, DCMD: { RIC: 112, NOVA: 14, DCMD: 0, HR: 200 }, HR: { RIC: 95, NOVA: 190, DCMD: 200, HR: 0 } };

  /* ---------- AHJs ---------- */
  var ahjs = [
    { id: 'AHJ-RIC', name: 'City of Richmond', kind: 'Jurisdiction', territory: 'RIC', contact: 'Elevator Inspections Unit', email: 'elevators@richmond.example.gov', method: 'Email request' },
    { id: 'AHJ-FFX', name: 'Fairfax County', kind: 'Jurisdiction', territory: 'NOVA', contact: 'Elevator Inspections Branch', email: 'elevator@fairfax.example.gov', method: 'Email request' },
    { id: 'AHJ-ARL', name: 'Arlington County', kind: 'Jurisdiction', territory: 'NOVA', contact: 'Inspection Services', email: 'inspections@arlington.example.gov', method: 'Email request' },
    { id: 'AHJ-ALX', name: 'City of Alexandria', kind: 'Jurisdiction', territory: 'NOVA', contact: 'Code Administration', email: 'elevators@alexandria.example.gov', method: 'Email request' },
    { id: 'AHJ-VB', name: 'City of Virginia Beach', kind: 'Jurisdiction', territory: 'HR', contact: 'Permits & Inspections', email: 'elevators@vbgov.example.gov', method: 'Email request' },
    { id: 'AHJ-NOR', name: 'City of Norfolk', kind: 'Jurisdiction', territory: 'HR', contact: 'Elevator Inspections', email: 'elevators@norfolk.example.gov', method: 'Email request' },
    { id: 'AHJ-DOM', name: 'Dominion (3rd party)', kind: '3rd party', territory: 'DCMD', contact: 'Scheduling desk', email: 'schedule@dominion.example.com', method: 'API sync (planned)' },
    { id: 'AHJ-MD3', name: 'MD 3rd-party inspector', kind: '3rd party', territory: 'DCMD', contact: 'Chesapeake Lift Inspections', email: 'book@chesapeakelift.example.com', method: 'Email request' }
  ];

  /* ---------- customers / buildings ---------- */
  var customerSeed = [
    ['C01', 'James River Property Group', 'RIC', 'Portfolio', 'Mel Santos', 'msantos@jrpg.example.com', 'Net 30', 'autopay'],
    ['C02', 'Capitol Square Partners', 'RIC', 'Portfolio', 'Gwen Talley', 'gtalley@capsq.example.com', 'Net 30', 'ach'],
    ['C03', 'Old Dominion Senior Living', 'RIC', 'Portfolio', 'Harold Briggs', 'hbriggs@odsl.example.com', 'Net 45', 'check'],
    ['C04', 'Fan District Lofts HOA', 'RIC', 'Single', 'Carla Webb', 'board@fanlofts.example.com', 'Net 30', 'card'],
    ['C05', 'Potomac Yard Residential', 'NOVA', 'Portfolio', 'Ethan Moore', 'emoore@pyres.example.com', 'Net 30', 'autopay'],
    ['C06', 'Tysons Gateway Office Trust', 'NOVA', 'Portfolio', 'Rachel Kim', 'rkim@tgot.example.com', 'Net 45', 'ach'],
    ['C07', 'Ballston Medical Partners', 'NOVA', 'Single', 'Dr. Alan Pierce', 'facilities@bmp.example.com', 'Net 30', 'card'],
    ['C08', 'Old Town Hospitality LLC', 'NOVA', 'Single', 'Nina Patel', 'npatel@oth.example.com', 'Net 30', 'ach'],
    ['C09', 'Anacostia Riverside Apartments', 'DCMD', 'Portfolio', 'Marcus Bell', 'mbell@ara.example.com', 'Net 30', 'ach'],
    ['C10', 'Bethesda Row Commercial', 'DCMD', 'Portfolio', 'Sofia Ramirez', 'sramirez@brc.example.com', 'Net 45', 'autopay'],
    ['C11', 'Silver Spring Civic Holdings', 'DCMD', 'Single', 'Owen Grant', 'ogrant@sscivic.example.com', 'Net 30', 'check'],
    ['C12', 'Tidewater Medical Partners', 'HR', 'Portfolio', 'Lynn Foster', 'lfoster@twmed.example.com', 'Net 45', 'ach'],
    ['C13', 'Oceanfront Resorts Group', 'HR', 'Portfolio', 'Derek Shaw', 'dshaw@ofrg.example.com', 'Net 30', 'autopay'],
    ['C14', 'Ghent Square Condominium', 'HR', 'Single', 'Board of Directors', 'board@ghentsq.example.com', 'Net 30', 'card']
  ];
  var customers = customerSeed.map(function (c) {
    return { id: c[0], name: c[1], territory: c[2], kind: c[3], contact: c[4], email: c[5], terms: c[6], payMethod: c[7], creditHold: false, holdOverride: false, balance: 0, portalUsers: [c[4]] };
  });

  var bldSeed = [
    ['B01', 'C01', 'Riverside Commons', '1200 E Cary St', 'Richmond, VA', 'AHJ-RIC', 'RIC', 4],
    ['B02', 'C01', 'Canal Walk Lofts', '410 S 14th St', 'Richmond, VA', 'AHJ-RIC', 'RIC', 2],
    ['B03', 'C01', 'Shockoe Exchange', '1700 E Main St', 'Richmond, VA', 'AHJ-RIC', 'RIC', 2],
    ['B04', 'C02', 'Capitol Square Tower', '900 E Broad St', 'Richmond, VA', 'AHJ-RIC', 'RIC', 6],
    ['B05', 'C02', 'Franklin & 8th Office', '801 E Franklin St', 'Richmond, VA', 'AHJ-RIC', 'RIC', 2],
    ['B06', 'C03', 'The Willows at Westhampton', '6500 Patterson Ave', 'Richmond, VA', 'AHJ-RIC', 'RIC', 3],
    ['B07', 'C03', 'Bon Air Commons', '2300 Buford Rd', 'North Chesterfield, VA', 'AHJ-RIC', 'RIC', 2],
    ['B08', 'C04', 'Fan District Lofts', '1621 W Main St', 'Richmond, VA', 'AHJ-RIC', 'RIC', 1],
    ['B09', 'C05', 'Potomac Yard North', '2800 Main Line Blvd', 'Alexandria, VA', 'AHJ-ALX', 'NOVA', 4],
    ['B10', 'C05', 'Braddock Station Flats', '1300 Braddock Pl', 'Alexandria, VA', 'AHJ-ALX', 'NOVA', 2],
    ['B11', 'C06', 'Tysons Gateway I', '8200 Greensboro Dr', 'Tysons, VA', 'AHJ-FFX', 'NOVA', 6],
    ['B12', 'C06', 'Tysons Gateway II', '8250 Greensboro Dr', 'Tysons, VA', 'AHJ-FFX', 'NOVA', 4],
    ['B13', 'C06', 'Reston Parkway Center', '11900 Sunrise Valley Dr', 'Reston, VA', 'AHJ-FFX', 'NOVA', 3],
    ['B14', 'C07', 'Ballston Medical Pavilion', '4600 Fairfax Dr', 'Arlington, VA', 'AHJ-ARL', 'NOVA', 3],
    ['B15', 'C08', 'King Street Inn', '600 King St', 'Alexandria, VA', 'AHJ-ALX', 'NOVA', 2],
    ['B16', 'C09', 'Anacostia Riverside', '1300 Good Hope Rd SE', 'Washington, DC', 'AHJ-DOM', 'DCMD', 4],
    ['B17', 'C09', 'Navy Yard Commons', '1100 First St SE', 'Washington, DC', 'AHJ-DOM', 'DCMD', 3],
    ['B18', 'C10', 'Bethesda Row Plaza', '7200 Woodmont Ave', 'Bethesda, MD', 'AHJ-MD3', 'DCMD', 4],
    ['B19', 'C10', 'Wisconsin Ave Center', '7700 Wisconsin Ave', 'Bethesda, MD', 'AHJ-MD3', 'DCMD', 2],
    ['B20', 'C11', 'Silver Spring Civic Building', '8525 Fenton St', 'Silver Spring, MD', 'AHJ-MD3', 'DCMD', 2],
    ['B21', 'C12', 'Tidewater Medical Tower', '880 Kempsville Rd', 'Norfolk, VA', 'AHJ-NOR', 'HR', 4],
    ['B22', 'C12', 'Lynnhaven Outpatient Center', '2100 Lynnhaven Pkwy', 'Virginia Beach, VA', 'AHJ-VB', 'HR', 2],
    ['B23', 'C13', 'Oceanfront Grand', '3100 Atlantic Ave', 'Virginia Beach, VA', 'AHJ-VB', 'HR', 5],
    ['B24', 'C13', 'Shore Drive Suites', '4300 Shore Dr', 'Virginia Beach, VA', 'AHJ-VB', 'HR', 2],
    ['B25', 'C14', 'Ghent Square Condominium', '700 W Olney Rd', 'Norfolk, VA', 'AHJ-NOR', 'HR', 2]
  ];
  var buildings = bldSeed.map(function (b) { return { id: b[0], customer: b[1], name: b[2], address: b[3], city: b[4], ahj: b[5], territory: b[6], unitCount: Math.max(2, b[7] * 4) }; });

  /* ---------- units ---------- */
  var makes = [
    ['Otis', 'Traction — geared', 'Elevonic 401'], ['Otis', 'Traction — gearless', 'Gen2 MRL'], ['Schindler', 'Hydraulic — holeless', '330A'],
    ['KONE', 'Traction — MRL', 'MonoSpace 500'], ['TKE', 'Hydraulic — in-ground', 'Endura'], ['Dover', 'Hydraulic — in-ground', 'Oildraulic (legacy)'],
    ['Motion Control', 'Traction — geared', 'MCE HMC-1000 retrofit'], ['Schindler', 'Traction — MRL', '3300'], ['TKE', 'Traction — gearless', 'Evolution']
  ];
  var units = [], uid = 1;
  buildings.forEach(function (b) {
    for (var i = 0; i < b.unitCount; i++) {
      var mk = pick(makes), hyd = mk[1].indexOf('Hydraulic') === 0;
      var year = int(1978, 2021); if (mk[2].indexOf('legacy') > -1) year = int(1974, 1992);
      var stops = hyd ? int(2, 5) : int(5, 22);
      var cat1 = addDays(TODAY, int(-4, 340));
      var lastCat5 = int(2021, 2025);
      var u = {
        id: 'U-' + (1000 + uid), building: b.id, customer: b.customer, territory: b.territory, ahj: b.ahj,
        name: (i === b.unitCount - 1 && b.unitCount > 3 ? 'Service car' : 'Car ' + (i + 1)),
        stateId: (b.territory === 'DCMD' ? (b.city.indexOf('DC') > -1 ? 'DC-' : 'MD-') : 'VA-') + (40000 + int(100, 9999)),
        make: mk[0], type: mk[1], model: mk[2], year: year, stops: stops, capacity: pick([2500, 3000, 3500, 4000, 4500]),
        speed: hyd ? pick([100, 125, 150]) : pick([200, 350, 500, 700]),
        cat1Due: cat1, cat5Due: hyd ? null : (lastCat5 + 5) + '-' + cat1.slice(5),
        cat3Due: hyd ? (int(2026, 2028)) + '-' + cat1.slice(5) : null,
        certExpires: addDays(cat1, int(10, 40)), mcpOnSite: true,
        hoursPerVisit: hyd ? 1 : (stops > 12 ? 1.75 : 1.25), visitsPerMonth: hyd ? 1 : 1,
        status: 'running', obsolete: [], callbacks90: 0
      };
      if (year < 1995) u.obsolete.push(pick(['Door operator', 'Controller', 'Hoist motor', 'Hydraulic valve', 'Fixtures (non-ADA)']));
      if (year < 1990 && rnd() > 0.4) u.obsolete.push('Controller');
      units.push(u); uid++;
    }
  });
  function uof(bid, i) { return units.filter(function (u) { return u.building === bid; })[i || 0]; }
  // scripted states (by building so the story holds together)
  var U_ENT = uof('B04', 1), U_DOWN = uof('B12', 0), U_RESTR = uof('B06', 1);
  U_ENT.status = 'down'; U_DOWN.status = 'down'; U_RESTR.status = 'restricted';
  var U_CB1 = uof('B11', 2), U_CB2 = uof('B12', 1), U_CB3 = uof('B23', 3);
  U_CB1.callbacks90 = 4; U_CB2.callbacks90 = 3; U_CB3.callbacks90 = 3;
  uof('B08', 0).certExpires = addDays(TODAY, 9); uof('B14', 0).certExpires = addDays(TODAY, 4); uof('B21', 2).certExpires = addDays(TODAY, -3);

  /* ---------- government customer with an invoice package requirement (deterministic, no rnd) ---------- */
  customers.push({ id: 'C15', name: 'Capital Region Public Schools', territory: 'RIC', kind: 'Portfolio', contact: 'Denise Carter, Facilities Contracts', email: 'facilities.ap@crps.example.k12.va.us', terms: 'Net 45', payMethod: 'ach', creditHold: false, holdOverride: false, balance: 0, portalUsers: ['Denise Carter'],
    gov: true, billingRules: { mcp: true, po: 'PO 4500-2026-0417', perUnitLines: true, holdUntilComplete: true, delivery: 'Email to AP + upload to eVA vendor portal', contractRef: 'IFB #26-118 Elevator Maintenance' } });
  [['B26', 'Westbrook Middle School', '4100 Westbrook Rd', 'Henrico, VA'], ['B27', 'Meadowview Elementary', '9200 Meadowview Ln', 'Chesterfield, VA'], ['B28', 'Laurel Ridge High School', '1500 Laurel Ridge Pkwy', 'Henrico, VA']].forEach(function (b, bi) {
    buildings.push({ id: b[0], customer: 'C15', name: b[1], address: b[2], city: b[3], ahj: 'AHJ-RIC', territory: 'RIC', unitCount: 2 });
    for (var k = 0; k < 2; k++) {
      var hydS = !(bi === 2 && k === 0);
      units.push({ id: 'U-' + (1000 + uid++), building: b[0], customer: 'C15', territory: 'RIC', ahj: 'AHJ-RIC', name: 'Car ' + (k + 1), stateId: 'VA-' + (47210 + bi * 10 + k),
        make: hydS ? (k ? 'Dover' : 'TKE') : 'Otis', type: hydS ? 'Hydraulic — in-ground' : 'Traction — MRL', model: hydS ? (k ? 'Oildraulic (legacy)' : 'Endura') : 'Gen2 MRL', year: hydS ? 1994 + bi * 4 + k : 2016,
        stops: hydS ? 2 + (bi === 2 ? 1 : 0) : 4, capacity: hydS ? 3500 : 4000, speed: hydS ? 125 : 350, cat1Due: addDays(TODAY, 40 + bi * 30 + k * 7), cat5Due: hydS ? null : '2027-03-15', cat3Due: hydS ? '2027-0' + (3 + bi) + '-10' : null,
        certExpires: addDays(TODAY, 70 + bi * 30), mcpOnSite: true, hoursPerVisit: hydS ? 1 : 1.25, visitsPerMonth: 1, status: 'running', obsolete: hydS && k ? ['Hydraulic valve'] : [], callbacks90: bi === 1 && k ? 2 : 0 });
    }
  });

  /* ---------- contracts ---------- */
  var cTypes = ['Full Service', 'Full Service', 'Oil & Grease (lube only)', 'Parts, Oil & Grease', 'Full Service'];
  var contracts = customers.filter(function (c) { return !c.gov; }).map(function (c, i) {
    var cu = units.filter(function (u) { return u.customer === c.id; });
    var type = cTypes[i % cTypes.length];
    var perUnit = type === 'Full Service' ? int(430, 620) : type.indexOf('Parts') === 0 ? int(300, 400) : int(190, 260);
    var start = addDays(TODAY, -int(120, 1500));
    var termMonths = pick([12, 36, 60, 60, 36]);
    var end = addDays(start, Math.round(termMonths * 30.4));
    while (d(end) < d(TODAY)) end = addDays(end, 365); // auto-renewed
    return {
      id: 'MA-' + (2400 + i), customer: c.id, territory: c.territory, type: type, units: cu.map(function (u) { return u.id; }),
      monthly: perUnit * cu.length, perUnit: perUnit, billing: pick(['Monthly', 'Quarterly', 'Monthly', 'Annual']),
      start: start, end: end, termMonths: termMonths, autoRenew: rnd() > 0.25,
      cancelClause: rnd() > 0.7 ? '30-day for convenience' : (termMonths === 12 && rnd() > 0.5 ? 'Month-to-month (30-day)' : 'None'),
      escalation: { pct: pick([3, 3.5, 4, 5]), every: 'Annual', next: addDays(start, 365 * Math.ceil(daysBetween(start, TODAY) / 365)), indexed: rnd() > 0.6 ? 'CPI-U, 3% floor' : 'Fixed' },
      tcVersion: 'MA-TC v4.2', cost90: 0, revenue90: 0
    };
  });
  contracts[5].billing = 'Monthly'; contracts[4].billing = 'Monthly';
  contracts[3].end = addDays(TODAY, 41); contracts[3].autoRenew = false;
  contracts[7].end = addDays(TODAY, 67);
  contracts[12].end = addDays(TODAY, 24); contracts[12].autoRenew = false;
  contracts.push({ id: 'MA-2414', customer: 'C15', territory: 'RIC', type: 'Full Service', units: units.filter(function (x) { return x.customer === 'C15'; }).map(function (x) { return x.id; }), monthly: 395 * 6, perUnit: 395, billing: 'Monthly', start: '2025-07-01', end: '2028-06-30', termMonths: 36, autoRenew: false, cancelClause: 'Non-appropriation (public funds)', escalation: { pct: 3, every: 'Annual', next: '2027-07-01', indexed: 'Fixed' }, tcVersion: 'MA-TC v4.2 + IFB #26-118 terms', cost90: 0, revenue90: 0 });
  contracts[10].cancelClause = '30-day for convenience';

  /* ---------- PM visits this month (auto-generated from routes) ---------- */
  var visits = [], vid = 1;
  var months = [['2026-11-', 30], ['2026-12-', 31], ['2027-01-', 31]];
  units.forEach(function (u, i) {
    var mechs = mechanics.filter(function (m) { return m.territory === u.territory && m.route; });
    var m = mechs[i % mechs.length];
    var con = contracts.filter(function (c) { return c.units.indexOf(u.id) > -1; })[0];
    months.forEach(function (mo, mi) {
      var day = 3 + (i * 7 + mi * 2) % 24; // spread through the month, shifts a little each month
      var date = mo[0] + (day < 10 ? '0' : '') + day;
      var dow = d(date).getDay(); if (dow === 0) date = addDays(date, 1); if (dow === 6) date = addDays(date, -1);
      visits.push({
        id: 'PM-' + (5000 + vid++), unit: u.id, building: u.building, territory: u.territory, mechanic: m.id, date: date,
        estHours: u.hoursPerVisit, kind: con && con.type.indexOf('Oil') === 0 ? 'Lube route' : 'PM — ' + (con ? con.type : 'Full Service'),
        status: d(date) < d(TODAY) ? 'complete' : (date === TODAY ? 'in progress' : 'scheduled'),
        notified: d(date) <= d(addDays(TODAY, 7)),
        tasks: u.type.indexOf('Hydraulic') === 0 ?
          ['Check oil level & log loss', 'Inspect valve & pump unit', 'Door operator & clutch', 'Car top inspection', 'Pit inspection', 'Phase I/II fire service test', 'Emergency phone / lights', 'Update MCP log'] :
          ['Machine room: brake & sheave', 'Controller & fault log review', 'Door operator & clutch', 'Hoistway & car top', 'Pit inspection & buffers', 'Phase I/II fire service test', 'Emergency phone / lights', 'Update MCP log']
      });
    });
  });

  /* ---------- callbacks / service calls ---------- */
  var calls = [
    { id: 'SC-8841', unit: U_ENT.id, building: U_ENT.building, territory: 'RIC', priority: 'entrapment', source: 'Phone', reportedBy: 'Lobby security — Capitol Square Tower', summary: 'Passenger trapped, car stopped between 9 and 10', received: TODAY + 'T10:31', assigned: 'M101', ack: TODAY + 'T10:33', eta: '10:52', status: 'en route', billable: false, afterHours: false },
    { id: 'SC-8840', unit: U_DOWN.id, building: U_DOWN.building, territory: 'NOVA', priority: 'down', source: 'Customer portal', reportedBy: 'Rachel Kim', summary: 'Car out of service, doors will not close on 3', received: TODAY + 'T08:14', assigned: 'M105', ack: TODAY + 'T08:16', eta: '09:05', status: 'on site', billable: false, afterHours: false },
    { id: 'SC-8839', unit: U_CB1.id, building: U_CB1.building, territory: 'NOVA', priority: 'routine', source: 'Text', reportedBy: 'Front desk', summary: 'Leveling off by ~1 inch at lobby', received: TODAY + 'T07:52', assigned: 'M106', ack: null, eta: null, status: 'awaiting ack', billable: false, afterHours: false },
    { id: 'SC-8838', unit: U_RESTR.id, building: U_RESTR.building, territory: 'RIC', priority: 'routine', source: 'Email', reportedBy: 'Harold Briggs', summary: 'Hall lantern out on 2nd floor', received: addDays(TODAY, -1) + 'T16:40', assigned: null, ack: null, eta: null, status: 'new', billable: true, afterHours: false },
    { id: 'SC-8837', unit: U_CB3.id, building: U_CB3.building, territory: 'HR', priority: 'down', source: 'Phone (after hours)', reportedBy: 'Night manager', summary: 'Car stuck at 4, no passengers', received: addDays(TODAY, -1) + 'T23:12', assigned: 'M112', ack: addDays(TODAY, -1) + 'T23:14', eta: '23:55', status: 'complete', billable: false, afterHours: true },
    { id: 'SC-8836', unit: U_CB2.id, building: U_CB2.building, territory: 'NOVA', priority: 'routine', source: 'Customer portal', reportedBy: 'Rachel Kim', summary: 'Door reopening repeatedly', received: addDays(TODAY, -2) + 'T13:05', assigned: 'M106', ack: addDays(TODAY, -2) + 'T13:07', eta: '14:00', status: 'complete', billable: false, afterHours: false }
  ];

  /* ---------- on-call schedule (rotating, per territory) ---------- */
  var onCall = [];
  territories.forEach(function (t) {
    var ms = mechanics.filter(function (m) { return m.territory === t.id && m.title !== 'Apprentice'; });
    for (var w = 0; w < 4; w++) {
      var startW = addDays('2026-11-02', w * 7);
      onCall.push({ territory: t.id, weekOf: startW, primary: ms[w % ms.length].id, backup: ms[(w + 1) % ms.length].id, window: 'Weeknights 4:30p–7a, weekends 24h' });
    }
  });

  /* ---------- jobs: mods, installs, repairs (job costing) ---------- */
  var jobs = [
    { id: 'J-26031', name: 'Capitol Square Tower — Cars 1-3 modernization', customer: 'C02', building: 'B04', territory: 'RIC', type: 'Modernization', contract: 1186400, billedPct: 35, retainage: 10, status: 'In progress', pm: 'Tom Reilly', start: '2026-08-11', end: '2027-02-26',
      budget: { labor: 412000, material: 538000, subs: 46000, misc: 18000 }, actual: { labor: 151800, material: 309400, subs: 12000, misc: 6420 }, crew: ['M103', 'M104'], changeOrders: [{ id: 'CO-1', desc: 'Add card-reader integration at lobby', amt: 14200, status: 'Approved' }, { id: 'CO-2', desc: 'Pit ladder replacement (code)', amt: 3850, status: 'Pending' }] },
    { id: 'J-26034', name: 'Tysons Gateway I — destination dispatch upgrade', customer: 'C06', building: 'B11', territory: 'NOVA', type: 'Modernization', contract: 642000, billedPct: 60, retainage: 5, status: 'In progress', pm: 'Tom Reilly', start: '2026-06-02', end: '2026-12-18',
      budget: { labor: 198000, material: 312000, subs: 22000, misc: 9000 }, actual: { labor: 141200, material: 296300, subs: 21500, misc: 7600 }, crew: ['M107', 'M111'], changeOrders: [] },
    { id: 'J-26038', name: 'Oceanfront Grand — new MRL install (Tower B)', customer: 'C13', building: 'B23', territory: 'HR', type: 'New installation', contract: 318500, billedPct: 20, retainage: 10, status: 'Material on order', pm: 'Tom Reilly', start: '2026-10-06', end: '2027-04-30',
      budget: { labor: 96000, material: 171000, subs: 14000, misc: 6000 }, actual: { labor: 8200, material: 61800, subs: 0, misc: 900 }, crew: ['M114', 'M115'], changeOrders: [] },
    { id: 'J-26041', name: 'Willows at Westhampton — hydraulic jack replacement', customer: 'C03', building: 'B06', territory: 'RIC', type: 'Repair', contract: 48600, billedPct: 0, retainage: 0, status: 'Scheduled', pm: 'Tom Reilly', start: '2026-11-17', end: '2026-11-21',
      budget: { labor: 14200, material: 21800, subs: 3200, misc: 800 }, actual: { labor: 0, material: 21800, subs: 0, misc: 0 }, crew: ['M101', 'M104'], changeOrders: [] },
    { id: 'J-26043', name: 'Anacostia Riverside — door operator upgrade (2 cars)', customer: 'C09', building: 'B16', territory: 'DCMD', type: 'Repair', contract: 36400, billedPct: 50, retainage: 0, status: 'In progress', pm: 'Tom Reilly', start: '2026-10-27', end: '2026-11-13',
      budget: { labor: 11600, material: 15200, subs: 0, misc: 600 }, actual: { labor: 7900, material: 15200, subs: 0, misc: 340 }, crew: ['M109', 'M101'], changeOrders: [] }
  ];

  /* ---------- time entries (feed payroll + job cost + Crossover Ledger) ---------- */
  var timeEntries = [];
  var tid = 1;
  var weekDays = []; for (var wd = 0; wd < 28; wd++) { var dd = addDays('2026-10-05', wd); var dw = d(dd).getDay(); if (dw > 0 && dw < 6) weekDays.push(dd); }
  // each mechanic has a callback tendency: a few routes eat hours on callbacks
  var cbBias = { M101: .22, M102: .14, M103: .18, M105: .31, M106: .36, M109: .19, M110: .15, M112: .27, M113: .12 };
  mechanics.forEach(function (m) {
    var monthlyMaint = visits.filter(function (v) { return v.mechanic === m.id && v.date.slice(0, 7) === '2026-11'; }).reduce(function (a, v) { return a + v.estHours; }, 0);
    var dailyMaint = Math.round(monthlyMaint / 21 * 4) / 4;
    weekDays.forEach(function (day) {
      if (m.ptoDates.indexOf(day) > -1) return;
      var travel = Math.round((0.6 + rnd() * 1.2) * 4) / 4;
      var work = Math.round((6.4 - travel + rnd()) * 4) / 4;
      var job = null, terr = m.territory, kind = 'Route maintenance';
      jobs.forEach(function (j) { if (j.crew.indexOf(m.id) > -1 && rnd() > (m.route ? 0.82 : 0.3)) { job = j.id; terr = j.territory; kind = j.type; } });
      var bd;
      if (job) { bd = { maint: 0, callback: 0, repair: 0, project: work }; }
      else if (!m.route) { bd = { maint: 0, callback: Math.round(work * .3 * 4) / 4, repair: 0, project: 0 }; bd.repair = work - bd.callback; }
      else { var mt = Math.min(work, dailyMaint + Math.round((rnd() - 0.5) * 4) / 4); var cb = Math.min(work - mt, Math.round(work * (cbBias[m.id] || .2) * (0.6 + rnd() * .8) * 4) / 4); var rp = Math.max(0, work - mt - cb); bd = { maint: mt, callback: cb, repair: rp, project: 0 }; }
      timeEntries.push({ id: 'T' + (tid++), mechanic: m.id, date: day, work: work, travel: travel, ot: rnd() > 0.85 ? 2 : 0, job: job, territory: terr, homeTerritory: m.territory, kind: kind, breakdown: bd, source: 'Mechanic app' });
    });
  });
  // the scripted crossover: Ron (RIC/own-a) worked Anacostia (DCMD) - same owner; Gary/Dylan? make an HR (own-b) mechanic work in RIC
  timeEntries.push({ id: 'T' + (tid++), mechanic: 'M114', date: '2026-10-29', work: 8, travel: 3.5, ot: 0, job: 'J-26031', territory: 'RIC', homeTerritory: 'HR', kind: 'Modernization', source: 'Mechanic app', note: 'Loaned to Capitol Square mod — rigging day' });
  timeEntries.push({ id: 'T' + (tid++), mechanic: 'M114', date: '2026-10-30', work: 8, travel: 3.5, ot: 1.5, job: 'J-26031', territory: 'RIC', homeTerritory: 'HR', kind: 'Modernization', source: 'Mechanic app', note: 'Loaned to Capitol Square mod' });
  timeEntries.push({ id: 'T' + (tid++), mechanic: 'M103', date: '2026-11-02', work: 6, travel: 3, ot: 0, job: 'J-26038', territory: 'HR', homeTerritory: 'RIC', kind: 'New installation', source: 'Mechanic app', note: 'Rail alignment assist — Oceanfront Grand' });
  timeEntries.push({ id: 'T' + (tid++), mechanic: 'M112', date: '2026-10-28', work: 4, travel: 2.5, ot: 0, job: null, territory: 'RIC', homeTerritory: 'HR', kind: 'Callback coverage', source: 'Dispatch', note: 'Covered Richmond callbacks during Tasha PTO' });

  // zone pay / per diem on every entry worked away from the mechanic's home zone
  function zoneFor(te) {
    var m = mechanics.filter(function (x) { return x.id === te.mechanic; })[0];
    var loc = locals.filter(function (l) { return l.id === m.local; })[0];
    var miles = hubMiles[te.homeTerritory][te.territory] + (te.territory === te.homeTerritory ? int(4, 28) : 0);
    var z = { miles: miles, zonePay: 0, perDiem: 0 };
    if (miles > loc.zoneMiles) z.zonePay = Math.round((te.work + te.ot) * loc.zonePay * 100) / 100;
    if (miles > loc.perDiemMiles) z.perDiem = loc.perDiem;
    return z;
  }
  timeEntries.forEach(function (te) { te.zone = zoneFor(te); });

  /* ---------- expenses: receipts, mileage, hauling (mechanic app → office → payroll) ---------- */
  var expenses = [
    { id: 'EX-2041', mechanic: 'M101', date: addDays(TODAY, -2), kind: 'Receipt', vendor: 'Home Depot #4615 (Glen Allen)', desc: 'Pit light fixture + bulbs', amount: 86.42, chargeTo: 'J-26041', paidWith: 'Company card', po: 'PO-26-0412', receipt: true, status: 'Matched to PO' },
    { id: 'EX-2042', mechanic: 'M105', date: addDays(TODAY, -1), kind: 'Receipt', vendor: 'Fastenal — Alexandria', desc: 'Door gib pack, anchors', amount: 47.18, chargeTo: 'OH-SHOP', paidWith: 'Personal card', po: null, receipt: true, status: 'Pending approval' },
    { id: 'EX-2043', mechanic: 'M114', date: '2026-10-30', kind: 'Mileage', vendor: null, desc: 'Norfolk shop → Capitol Square Tower (Richmond) and back', miles: 188, rate: 0.70, amount: 131.60, chargeTo: 'J-26031', paidWith: 'Reimburse', po: null, receipt: false, status: 'Approved' },
    { id: 'EX-2044', mechanic: 'M114', date: '2026-10-29', kind: 'Hauling', vendor: null, desc: 'Trailer — rail sections to Capitol Square', amount: 140, chargeTo: 'J-26031', paidWith: 'Reimburse', po: null, receipt: true, status: 'Approved' },
    { id: 'EX-2045', mechanic: 'M112', date: addDays(TODAY, -3), kind: 'Receipt', vendor: 'Grainger', desc: 'Emergency light batteries (4)', amount: 211.37, chargeTo: 'OH-SHOP', paidWith: 'Company card', po: 'PO-26-0409', receipt: false, status: 'Needs receipt photo' }
  ];

  /* ---------- proposals ---------- */
  var tcTemplates = [
    { id: 'MA-TC v4.2', kind: 'Maintenance agreement', updated: '2026-07-14', clauses: ['Term & auto-renewal', 'Annual price adjustment', 'Exclusions (vandalism, misuse, obsolete parts)', 'Callback hours & overtime', 'Cancellation for convenience', 'Limitation of liability'] },
    { id: 'REP-TC v2.0', kind: 'Repair (non-contract)', updated: '2026-03-02', clauses: ['Pricing valid 30 days', '50% deposit for parts over $5,000', 'Parts lead times', 'Warranty — 90 days parts & labor'] },
    { id: 'MOD-TC v3.1', kind: 'Modernization', updated: '2026-05-20', clauses: ['Progress billing (AIA G702/G703)', 'Retainage', 'Delay & escalation clause', 'Owner-furnished items', 'Permits & AHJ acceptance', 'Change order procedure'] },
    { id: 'NI-TC v1.4', kind: 'New construction', updated: '2026-01-09', clauses: ['Schedule of values', 'Hoistway turnover requirements', 'Temporary use / construction service', 'Retainage', 'Lien waivers', 'Delay & escalation clause'] }
  ];
  var proposals = [
    { id: 'P-7712', title: 'Door operator replacement — Car 2', customer: 'C06', building: 'B12', territory: 'NOVA', type: 'Repair', tc: 'REP-TC v2.0', owner: 'U6', amount: 18450, cost: 11230, status: 'Viewed', approvedBy: 'U5', approvedOn: '2026-10-30', sent: '2026-10-31', channel: 'Email + text', options: null,
      tracking: [{ t: '2026-10-31T09:02', e: 'Sent to Rachel Kim (email + SMS)' }, { t: '2026-10-31T09:40', e: 'Opened — 4 min on page' }, { t: '2026-11-02T14:11', e: 'Forwarded to accounts@tgot.example.com' }, { t: '2026-11-03T08:27', e: 'Opened by forward recipient — viewed pricing twice' }], source: 'Field lead — Brian Kowalski' },
    { id: 'P-7715', title: 'Full-service maintenance — 3 cars', customer: 'C14', building: 'B25', territory: 'HR', type: 'Maintenance', tc: 'MA-TC v4.2', owner: 'U2', amount: 1350, cost: 790, monthly: true, status: 'Pending ops approval', approvedBy: null, sent: null, channel: null,
      tracking: [], source: 'Website quote request' },
    { id: 'P-7709', title: 'Hydraulic modernization — Bon Air Commons', customer: 'C03', building: 'B07', territory: 'RIC', type: 'Modernization', tc: 'MOD-TC v3.1', owner: 'U7', amount: 214000, cost: 151900, status: 'Sent', approvedBy: 'U5', approvedOn: '2026-10-22', sent: '2026-10-24', channel: 'Email',
      options: [{ name: 'Good — controller & valve only', amt: 138500 }, { name: 'Better — controller, valve, door equipment', amt: 176200 }, { name: 'Best — full modernization + ADA fixtures', amt: 214000 }],
      tracking: [{ t: '2026-10-24T10:15', e: 'Sent to Harold Briggs' }, { t: '2026-10-24T15:52', e: 'Opened — 11 min, compared options' }], source: 'ModRadar' },
    { id: 'P-7701', title: 'Annual Cat 5 full-load test — 4 cars', customer: 'C10', building: 'B18', territory: 'DCMD', type: 'Repair', tc: 'REP-TC v2.0', owner: 'U6', amount: 9800, cost: 5400, status: 'Signed', approvedBy: 'U5', approvedOn: '2026-10-12', sent: '2026-10-13', signed: '2026-10-15', channel: 'Email',
      tracking: [{ t: '2026-10-13T08:30', e: 'Sent' }, { t: '2026-10-13T11:02', e: 'Opened' }, { t: '2026-10-15T09:44', e: 'Signed by Sofia Ramirez · card on file captured' }], source: 'Compliance — Cat 5 due' },
    { id: 'P-7718', title: 'Pit ladder & lighting — citation correction', customer: 'C09', building: 'B17', territory: 'DCMD', type: 'Repair', tc: 'REP-TC v2.0', owner: 'U6', amount: 4280, cost: 2310, status: 'Draft', approvedBy: null, sent: null, channel: null, tracking: [], source: 'FixFlow — Dominion citation' }
  ];

  /* ---------- CRM leads / pipeline ---------- */
  var leads = [
    { id: 'LD-301', company: 'Scott\'s Addition Lofts', contact: 'Jenna Ruiz', territory: 'RIC', stage: 'Qualified', value: 21600, kind: 'Maintenance takeover', source: 'Website', owner: 'U7', next: 'Site survey 11/6' },
    { id: 'LD-302', company: 'Arlington Gateway Hotel', contact: 'Paul Iverson', territory: 'NOVA', stage: 'Survey', value: 388000, kind: 'Modernization', source: 'Referral', owner: 'U6', next: 'Proposal draft due 11/12' },
    { id: 'LD-303', company: 'Navy Yard Commons', contact: 'Marcus Bell', territory: 'DCMD', stage: 'Proposal', value: 4280, kind: 'Repair', source: 'FixFlow', owner: 'U6', next: 'Ops approval' },
    { id: 'LD-304', company: 'Town Point Office Center', contact: 'Alicia Monroe', territory: 'HR', stage: 'New', value: 48000, kind: 'Maintenance takeover', source: 'Website', owner: 'U2', next: 'Call back today' },
    { id: 'LD-305', company: 'Tysons Gateway II', contact: 'Rachel Kim', territory: 'NOVA', stage: 'Proposal', value: 18450, kind: 'Repair', source: 'Field lead', owner: 'U6', next: 'Follow-up — forwarded to AP' },
    { id: 'LD-306', company: 'Bon Air Commons', contact: 'Harold Briggs', territory: 'RIC', stage: 'Proposal', value: 214000, kind: 'Modernization', source: 'ModRadar', owner: 'U7', next: 'Board meeting 11/19' },
    { id: 'LD-307', company: 'Wisconsin Ave Center', contact: 'Sofia Ramirez', territory: 'DCMD', stage: 'Won', value: 9800, kind: 'Testing', source: 'Compliance', owner: 'U6', next: 'Schedule test' },
    { id: 'LD-308', company: 'Hampton Roads Convention Annex', contact: 'Greg Dunn', territory: 'HR', stage: 'Lost', value: 72000, kind: 'Maintenance takeover', source: 'Cold outreach', owner: 'U2', next: 'Lost to OEM pricing' }
  ];
  var fieldLeads = [
    { id: 'FL-91', mechanic: 'M106', unit: uof('B12',0).id, building: 'B12', date: '2026-10-28', note: 'Door operator obsolete — parts no longer stocked by OEM. Recommend full operator replacement.', photo: true, status: 'Proposed', proposal: 'P-7712', value: 18450 },
    { id: 'FL-92', mechanic: 'M112', unit: U_CB3.id, building: U_CB3.building, date: '2026-11-01', note: 'Controller faulting weekly, 1988 relay logic. Good mod candidate.', photo: true, status: 'New', proposal: null, value: null },
    { id: 'FL-93', mechanic: 'M101', unit: uof('B04',0).id, building: 'B04', date: '2026-10-19', note: 'Hall fixtures not ADA compliant — Braille plates missing on 3 floors.', photo: false, status: 'Sold', proposal: 'P-7690', value: 6200 },
    { id: 'FL-94', mechanic: 'M109', unit: uof('B06',0).id, building: 'B06', date: '2026-10-11', note: 'Hydraulic oil loss trending up — 3 gal/month. Possible jack leak.', photo: true, status: 'Sold', proposal: 'P-7682', value: 48600 }
  ];

  /* ---------- FixFlow findings (deficiencies + AHJ citations) ---------- */
  var findings = [
    { id: 'FX-401', unit: uof('B17',0).id, building: 'B17', source: 'Dominion inspection 10/21', kind: 'Citation', item: 'Pit ladder does not extend 48" above sill — A17.1 2.2.4.2', correctBy: addDays(TODAY, 17), status: 'Quote drafted', proposal: 'P-7718', amount: 4280 },
    { id: 'FX-402', unit: uof('B11',0).id, building: 'B11', source: 'Fairfax County inspection 10/14', kind: 'Citation', item: 'Car emergency light below 1 lux after 4 hr test', correctBy: addDays(TODAY, 6), status: 'Customer approved', proposal: null, amount: 640 },
    { id: 'FX-403', unit: uof('B13',1).id, building: 'B13', source: 'PM visit — Andre Massey', kind: 'Mechanic finding', item: 'Governor rope showing wear at sheave — replace within 60 days', correctBy: addDays(TODAY, 55), status: 'Awaiting customer', proposal: null, amount: 3900 },
    { id: 'FX-404', unit: uof('B01',2).id, building: 'B01', source: 'City of Richmond inspection 10/30', kind: 'Citation', item: 'Machine room lacks permanent lighting guard', correctBy: addDays(TODAY, 26), status: 'New', proposal: null, amount: null },
    { id: 'FX-405', unit: uof('B20',0).id, building: 'B20', source: 'Cat 1 test 10/09', kind: 'Test deficiency', item: 'Buffer oil low; buffer switch fails to open', correctBy: addDays(TODAY, -2), status: 'Overdue', proposal: null, amount: 520 }
  ];

  /* ---------- inspections (Inspection Booker) ---------- */
  var inspections = [
    { id: 'IN-616', unit: uof('B01', 1).id, building: 'B01', ahj: 'AHJ-RIC', test: 'Cat 1 annual', mechanic: 'M101', proposed: [TODAY + ' 13:00'], confirmed: TODAY + ' 13:00', status: 'Confirmed', sent: addDays(TODAY, -8), reminders: 0, nextReminder: null, approvalForChanges: true },
    { id: 'IN-611', unit: uof('B08',0).id, building: 'B08', ahj: 'AHJ-RIC', test: 'Cat 1 annual', mechanic: 'M101', proposed: [wk(addDays(TODAY, 8)) + ' 09:00', wk(addDays(TODAY, 9)) + ' 13:00', wk(addDays(TODAY, 13)) + ' 09:00'], confirmed: null, status: 'Awaiting AHJ', sent: addDays(TODAY, -3), reminders: 1, nextReminder: addDays(TODAY, 1), approvalForChanges: true },
    { id: 'IN-612', unit: uof('B14',0).id, building: 'B14', ahj: 'AHJ-ARL', test: 'Cat 1 annual', mechanic: 'M105', proposed: [wk(addDays(TODAY, 2)) + ' 08:30'], confirmed: wk(addDays(TODAY, 2)) + ' 08:30', status: 'Confirmed', sent: addDays(TODAY, -6), reminders: 0, nextReminder: null, approvalForChanges: true },
    { id: 'IN-613', unit: uof('B17',0).id, building: 'B17', ahj: 'AHJ-DOM', test: 'Cat 5 five-year', mechanic: 'M109', proposed: [wk(addDays(TODAY, 15)) + ' 07:30'], confirmed: null, status: 'Change requested', counter: wk(addDays(TODAY, 16)) + ' 10:00', sent: addDays(TODAY, -4), reminders: 0, nextReminder: null, approvalForChanges: true },
    { id: 'IN-614', unit: uof('B10',0).id, building: 'B10', ahj: 'AHJ-ALX', test: 'Re-inspection (citation)', mechanic: 'M106', proposed: [wk(addDays(TODAY, 5)) + ' 10:00', wk(addDays(TODAY, 6)) + ' 10:00'], confirmed: null, status: 'No response', sent: addDays(TODAY, -9), reminders: 3, nextReminder: TODAY, approvalForChanges: false },
    { id: 'IN-615', unit: uof('B22',0).id, building: 'B22', ahj: 'AHJ-VB', test: 'Cat 3 hydraulic', mechanic: 'M113', proposed: [wk(addDays(TODAY, 11)) + ' 09:00'], confirmed: wk(addDays(TODAY, 11)) + ' 09:00', status: 'Confirmed', sent: addDays(TODAY, -2), reminders: 0, nextReminder: null, approvalForChanges: true }
  ];

  /* ---------- POs ---------- */
  var pos = [
    { id: 'PO-26-0412', date: '2026-11-03', vendor: 'Home Depot #4615 (Glen Allen)', issuedTo: 'M101', job: 'J-26041', split: null, amount: 86.42, status: 'Receipt matched', method: 'Mechanic — company card', receipt: true },
    { id: 'PO-26-0411', date: '2026-11-02', vendor: 'Elevator Controls Supply', issuedTo: 'U5', job: 'J-26031', split: null, amount: 18640, status: 'Open', method: 'Vendor PO', receipt: false },
    { id: 'PO-26-0410', date: '2026-11-01', vendor: 'Snap-on Industrial', issuedTo: 'U1', job: null, split: { RIC: 40, NOVA: 30, DCMD: 20, HR: 10 }, amount: 3412.18, status: 'Receipt matched', method: 'Owner card (James)', receipt: true, overhead: 'OH-TOOLS' },
    { id: 'PO-26-0409', date: '2026-10-31', vendor: 'Grainger', issuedTo: 'M112', job: null, split: { HR: 100 }, amount: 211.37, status: 'Needs receipt', method: 'Mechanic — company card', receipt: false, overhead: 'OH-SHOP' },
    { id: 'PO-26-0408', date: '2026-10-30', vendor: 'Schindler parts desk', issuedTo: 'U5', job: 'J-26043', split: null, amount: 15200, status: 'Received', method: 'Vendor PO', receipt: true }
  ];
  var overheadCodes = [
    { id: 'OH-TOOLS', name: 'Tools & equipment', defaultSplit: { RIC: 40, NOVA: 30, DCMD: 20, HR: 10 } },
    { id: 'OH-SHOP', name: 'Shop & consumables', defaultSplit: 'By labor hours (trailing 30 days)' },
    { id: 'OH-FLEET', name: 'Fleet & fuel', defaultSplit: 'By vehicle assignment' },
    { id: 'OH-OFFICE', name: 'Office & software', defaultSplit: { RIC: 45, NOVA: 25, DCMD: 20, HR: 10 } }
  ];

  /* ---------- parts (Stockroom) ---------- */
  var parts = [
    { sku: 'GAL-MOVFR', name: 'GAL MOVFR door operator', loc: 'Richmond warehouse', qty: 2, min: 1, cost: 4120, job: 'J-26043' },
    { sku: 'HYD-VLV-UV5', name: 'Maxton UC4M valve', loc: 'Richmond warehouse', qty: 1, min: 2, cost: 2380, job: null },
    { sku: 'RST-CHN-04', name: 'Door restrictor kit', loc: 'Truck — Ron Whitfield', qty: 3, min: 2, cost: 145, job: null },
    { sku: 'GIB-STD', name: 'Door gibs (pack of 10)', loc: 'Truck — Andre Massey', qty: 1, min: 2, cost: 62, job: null },
    { sku: 'LED-CAR-01', name: 'Car LED light panel', loc: 'Alexandria shop', qty: 6, min: 4, cost: 210, job: null },
    { sku: 'GOV-ROPE-3/8', name: 'Governor rope 3/8" (per ft)', loc: 'Alexandria shop', qty: 340, min: 200, cost: 2.9, job: null },
    { sku: 'BAT-12V-7', name: 'Emergency light battery 12V 7Ah', loc: 'Norfolk shop', qty: 14, min: 10, cost: 28, job: null },
    { sku: 'MCE-BRD-HMC', name: 'MCE HMC-1000 main board', loc: 'On order', qty: 0, min: 1, cost: 6950, job: 'J-26031' }
  ];

  /* ---------- invoices ---------- */
  var invoices = [];
  var invNo = 31840;
  contracts.forEach(function (c, i) {
    var amt = c.billing === 'Quarterly' ? c.monthly * 3 : c.billing === 'Annual' ? c.monthly * 12 : c.monthly;
    var dueOffset = [-12, -28, 6, 12, 25][i % 5];
    var status = dueOffset < 0 ? (i % 3 === 0 ? 'Paid' : 'Overdue') : 'Sent';
    if (customers[i].payMethod === 'autopay') status = 'Paid';
    invoices.push({ id: 'INV-' + (invNo++), customer: c.customer, territory: c.territory, ref: c.id, kind: 'Maintenance — ' + c.billing, amount: amt, issued: addDays(TODAY, dueOffset - 30), due: addDays(TODAY, dueOffset), status: status, auto: true, qbo: 'Synced' });
  });
  jobs.forEach(function (j) {
    if (!j.billedPct) return;
    invoices.push({ id: 'INV-' + (invNo++), customer: j.customer, territory: j.territory, ref: j.id, kind: j.type === 'Repair' ? 'Repair — progress' : 'Progress billing (G702)', amount: Math.round(j.contract * 0.15), issued: addDays(TODAY, -12), due: addDays(TODAY, 18), status: 'Sent', auto: false, qbo: 'Synced' });
  });
  // invoice packages: school district needs each unit's MCP record attached to the monthly invoice
  invoices.forEach(function (iv) { if (iv.customer === 'C15') { iv.kind = 'Maintenance — October 2026'; iv.period = '2026-10'; iv.status = 'Paid'; iv.issued = '2026-10-01'; iv.due = '2026-11-15'; } });
  invoices.push({ id: 'INV-' + (invNo++), customer: 'C15', territory: 'RIC', ref: 'MA-2414', kind: 'Maintenance — October 2026 (in arrears)', period: '2026-10', amount: 395 * 6, issued: TODAY, due: addDays(TODAY, 45), status: 'Ready — package built', auto: true, draft: true, qbo: 'Pending', package: { mcp: 6, po: 'PO 4500-2026-0417' } });
  invoices.push({ id: 'INV-' + (invNo++), customer: 'C15', territory: 'RIC', ref: 'MA-2414', kind: 'Maintenance — November 2026 (in arrears)', period: '2026-11', amount: 395 * 6, issued: '2026-12-01', due: '2027-01-15', status: 'Holding — visits in progress', auto: true, draft: true, qbo: '—', package: { mcp: 6, po: 'PO 4500-2026-0417' } });
  invoices.forEach(function (iv) { if (iv.customer === 'C15' && iv.status === 'Paid' && !iv.package) { iv.kind = 'Maintenance — September 2026 (in arrears)'; iv.period = '2026-09'; iv.issued = '2026-10-02'; iv.due = '2026-11-16'; iv.package = { mcp: 6, po: 'PO 4500-2026-0417' }; } });
  // credit hold scenario: Old Dominion Senior Living has 2 overdue past 45
  invoices.forEach(function (iv) { if (iv.customer === 'C03') { iv.status = 'Overdue'; iv.due = addDays(TODAY, -52); } });
  customers.forEach(function (c) {
    var open = invoices.filter(function (iv) { return iv.customer === c.id && iv.status !== 'Paid' && !iv.draft; });
    c.balance = open.reduce(function (s, iv) { return s + iv.amount; }, 0);
    var worst = open.reduce(function (w, iv) { return Math.max(w, daysBetween(iv.due, TODAY)); }, -999);
    c.daysPastDue = worst > 0 ? worst : 0;
    c.creditHold = worst > 45;
  });

  /* ---------- ModRadar scores ---------- */
  function modScore(u) {
    var age = 2026 - u.year; var s = Math.min(45, age * 1.1) + u.obsolete.length * 14 + u.callbacks90 * 6 + (u.make === 'Dover' ? 8 : 0);
    return Math.max(4, Math.min(98, Math.round(s)));
  }
  units.forEach(function (u) { u.modScore = modScore(u); });

  /* ---------- MCP log (sample, per unit gets created on visit) ---------- */
  var mcp = [
    { unit: U_ENT.id, date: '2026-10-07', by: 'M101', task: 'Monthly PM — brake inspection, door operator adjust', result: 'Pass' },
    { unit: U_ENT.id, date: '2026-09-09', by: 'M101', task: 'Phase I/II fire service test', result: 'Pass' },
    { unit: U_ENT.id, date: '2026-08-12', by: 'M102', task: 'Cat 1 annual test (with City of Richmond)', result: 'Pass with note — buffer oil topped' }
  ];

  /* ---------- activity feed: shows things moving between surfaces ---------- */
  var activity = [
    { t: TODAY + 'T10:33', who: 'Ron Whitfield', where: 'Mechanic app', what: 'Acknowledged entrapment SC-8841 · ETA 10:52 · customer auto-notified' },
    { t: TODAY + 'T10:31', who: 'Keisha Barnes', where: 'Dispatch', what: 'Logged entrapment at Capitol Square Tower — Entrapment Clock started' },
    { t: TODAY + 'T09:12', who: 'Rachel Kim', where: 'Customer portal', what: 'Opened proposal P-7712 (forwarded copy)' },
    { t: TODAY + 'T08:14', who: 'Rachel Kim', where: 'Customer portal', what: 'Reported Tysons Gateway II car down — routed to Andre Massey' },
    { t: TODAY + 'T07:58', who: 'System', where: 'Inspection Booker', what: '3rd reminder sent to City of Alexandria for IN-614' },
    { t: TODAY + 'T06:00', who: 'System', where: 'Billing', what: '11 maintenance invoices sent per contract terms · synced to QuickBooks Online' }
  ];

  var SEED = {
    version: 3, today: TODAY, now: NOW_TIME,
    owners: owners, territories: territories, locals: locals, mechanics: mechanics, office: office, ahjs: ahjs,
    customers: customers, buildings: buildings, units: units, contracts: contracts, visits: visits, calls: calls,
    onCall: onCall, jobs: jobs, timeEntries: timeEntries, tcTemplates: tcTemplates, proposals: proposals, leads: leads,
    fieldLeads: fieldLeads, findings: findings, inspections: inspections, pos: pos, overheadCodes: overheadCodes,
    parts: parts, invoices: invoices, mcp: mcp, activity: activity, expenses: expenses, hubMiles: hubMiles,
    requests: [],          // website / portal intake not yet triaged
    offlineQueue: []       // mechanic app unsynced entries
  };

  /* =====================================================================
     Store
     ===================================================================== */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var state;
  try { var raw = localStorage.getItem(KEY); state = raw ? JSON.parse(raw) : null; } catch (e) { state = null; }
  if (!state || state.version !== SEED.version) state = clone(SEED);
  var listeners = [];

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } listeners.forEach(function (f) { try { f(state); } catch (e) { console.error(e); } }); }
  window.addEventListener('storage', function (ev) {
    if (ev.key !== KEY || !ev.newValue) return;
    try { state = JSON.parse(ev.newValue); RISE.db = state; } catch (e) { return; }
    listeners.forEach(function (f) { try { f(state); } catch (e) { console.error(e); } });
  });

  function find(col, id, key) { key = key || 'id'; var a = state[col] || []; for (var i = 0; i < a.length; i++) if (a[i][key] === id) return a[i]; return null; }
  function nowStamp() { var dt = new Date(); var h = dt.getHours(), m = dt.getMinutes(); return TODAY + 'T' + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  function money(n, dec) { if (n == null || isNaN(n)) return '—'; return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }); }
  function fmtDate(s, opts) { if (!s) return '—'; var x = d(s.slice(0, 10)); return x.toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric' }); }
  function fmtTime(s) { if (!s || s.indexOf('T') < 0) return ''; var hm = s.split('T')[1].split(':'); var h = +hm[0]; return (h % 12 || 12) + ':' + hm[1] + (h < 12 ? 'a' : 'p'); }

  var RISE = window.RISE = {
    db: state, seed: SEED, KEY: KEY, today: TODAY,
    save: save, onChange: function (f) { listeners.push(f); },
    reset: function () { state = clone(SEED); RISE.db = state; save(); },
    find: find, money: money, fmtDate: fmtDate, fmtTime: fmtTime, addDays: addDays, daysBetween: daysBetween, nowStamp: nowStamp,
    terr: function (id) { return find('territories', id); },
    owner: function (id) { return find('owners', id); },
    mech: function (id) { return find('mechanics', id); },
    cust: function (id) { return find('customers', id); },
    bldg: function (id) { return find('buildings', id); },
    unit: function (id) { return find('units', id); },
    ahj: function (id) { return find('ahjs', id); },
    user: function (id) { return find('office', id); },
    unitLabel: function (id) { var u = find('units', id); if (!u) return id; var b = find('buildings', u.building); return (b ? b.name : '') + ' · ' + u.name; },
    log: function (who, where, what) { state.activity.unshift({ t: nowStamp(), who: who, where: where, what: what }); },
    nextId: function (prefix, col) { var n = 0; (state[col] || []).forEach(function (x) { var m = String(x.id).match(/(\d+)$/); if (m) n = Math.max(n, +m[1]); }); return prefix + (n + 1); },
    /* Who covers a unit right now: route mechanic, or coverage if on PTO, or on-call after hours */
    coverFor: function (unitId, afterHours) {
      var u = find('units', unitId); if (!u) return null;
      if (afterHours) { var oc = state.onCall.filter(function (o) { return o.territory === u.territory && d(o.weekOf) <= d(TODAY) && d(addDays(o.weekOf, 7)) > d(TODAY); })[0]; return oc ? { mech: oc.primary, why: 'On-call this week' } : null; }
      var v = state.visits.filter(function (x) { return x.unit === unitId; })[0];
      var m = v ? find('mechanics', v.mechanic) : null;
      if (m && m.status === 'pto' && m.coveredBy) return { mech: m.coveredBy, why: m.name.split(' ')[0] + ' is on PTO — coverage mechanic' };
      return m ? { mech: m.id, why: 'Route mechanic' } : null;
    },
    /* Crossover Ledger: labor worked outside a mechanic's home territory, at loaded cost */
    crossover: function () {
      var out = [];
      state.timeEntries.forEach(function (te) {
        if (te.territory === te.homeTerritory) return;
        var m = find('mechanics', te.mechanic); var hrs = te.work + te.travel + te.ot;
        var cost = Math.round((te.work + te.travel) * m.loaded + te.ot * (m.baseRate * 1.5 + m.fringe));
        var fromT = find('territories', te.homeTerritory), toT = find('territories', te.territory);
        out.push({ entry: te.id, date: te.date, mechanic: m.id, hours: hrs, cost: cost, from: te.homeTerritory, to: te.territory, fromOwner: fromT.owner, toOwner: toT.owner, crossOwner: fromT.owner !== toT.owner, job: te.job, note: te.note || te.kind });
      });
      return out;
    }
  };

  /* Shared intake: website, portal and dispatch all create requests through here */
  RISE.createRequest = function (r) {
    var id = RISE.nextId('SC-', 'calls');
    var afterHours = !!r.afterHours;
    var cover = r.unit ? RISE.coverFor(r.unit, afterHours) : null;
    var u = r.unit ? find('units', r.unit) : null;
    var call = {
      id: id, unit: r.unit || null, building: u ? u.building : (r.building || null), territory: u ? u.territory : (r.territory || 'RIC'),
      priority: r.priority || 'routine', source: r.source || 'Website', reportedBy: r.name || 'Website visitor', contact: r.contact || '',
      summary: r.summary || '', received: nowStamp(), assigned: r.autoAssign === false ? null : (cover ? cover.mech : null),
      assignReason: cover ? cover.why : null, ack: null, eta: null, status: cover && r.autoAssign !== false ? 'awaiting ack' : 'new',
      billable: !!r.billable, afterHours: afterHours, isNew: true
    };
    if (u && (call.priority === 'entrapment' || call.priority === 'down')) u.status = 'down';
    state.calls.unshift(call);
    RISE.log(call.reportedBy, call.source, (call.priority === 'entrapment' ? 'ENTRAPMENT reported — ' : 'Service request — ') + (u ? RISE.unitLabel(u.id) : (r.building || 'new location')) + (cover ? ' · auto-routed to ' + find('mechanics', cover.mech).name : ''));
    save();
    return call;
  };
  RISE.createLead = function (l) {
    var id = RISE.nextId('LD-', 'leads');
    var lead = { id: id, company: l.company || l.name, contact: l.name, territory: l.territory || 'RIC', stage: 'New', value: l.value || 0, kind: l.kind || 'Maintenance takeover', source: l.source || 'Website', owner: 'U7', next: 'Call back within 1 business day', note: l.note || '', email: l.email || '', phone: l.phone || '', isNew: true };
    state.leads.unshift(lead);
    RISE.log(l.name || 'Website visitor', l.source || 'Website', 'Quote request — ' + lead.kind + ' · ' + lead.company);
    save();
    return lead;
  };
})();
