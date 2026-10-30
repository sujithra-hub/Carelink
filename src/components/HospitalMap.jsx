import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Search, ChevronRight, Footprints, Layers, LocateFixed, CheckCircle } from 'lucide-react';

// ─── Floor Layout ────────────────────────────────────────────────────────────
const FLOORS = {
  1: [
    { id: 'entrance',   label: 'Main Entrance',     x: 290, y: 220, w: 100, h: 44, color: '#3b82f6', dept: 'Entrance' },
    { id: 'reception',  label: 'Reception',          x: 40,  y: 40,  w: 130, h: 60, color: '#3b82f6', dept: 'Reception' },
    { id: 'emergency',  label: 'Emergency / A&E',    x: 40,  y: 150, w: 130, h: 60, color: '#ef4444', dept: 'Emergency' },
    { id: 'pharmacy',   label: 'Pharmacy',           x: 210, y: 40,  w: 110, h: 60, color: '#10b981', dept: 'Pharmacy' },
    { id: 'radiology',  label: 'Radiology',          x: 210, y: 150, w: 110, h: 60, color: '#8b5cf6', dept: 'Radiology' },
    { id: 'lab',        label: 'Lab / Pathology',    x: 360, y: 40,  w: 110, h: 60, color: '#f59e0b', dept: 'Lab' },
    { id: 'canteen',    label: 'Cafeteria',          x: 360, y: 150, w: 110, h: 60, color: '#64748b', dept: 'Cafeteria' },
    { id: 'toilet1',    label: 'Washroom (G)',       x: 510, y: 40,  w:  80, h: 60, color: '#94a3b8', dept: null },
    { id: 'lift1',      label: 'Lift / Stairs',      x: 510, y: 150, w:  80, h: 60, color: '#475569', dept: null },
  ],
  2: [
    { id: 'opd-card',   label: 'OPD – Cardiology',      x: 40,  y: 40,  w: 140, h: 70, color: '#ef4444', dept: 'Cardiology' },
    { id: 'opd-gmed',   label: 'OPD – Gen. Medicine',   x: 40,  y: 145, w: 140, h: 70, color: '#3b82f6', dept: 'General Medicine' },
    { id: 'opd-ped',    label: 'OPD – Pediatrics',      x: 220, y: 40,  w: 140, h: 70, color: '#10b981', dept: 'Pediatrics' },
    { id: 'opd-orth',   label: 'OPD – Orthopedics',     x: 220, y: 145, w: 140, h: 70, color: '#f59e0b', dept: 'Orthopedics' },
    { id: 'opd-ent',    label: 'OPD – ENT & Allergy',   x: 400, y: 40,  w: 110, h: 70, color: '#8b5cf6', dept: 'ENT & Allergy' },
    { id: 'opd-derm',   label: 'OPD – Dermatology',     x: 400, y: 145, w: 110, h: 70, color: '#ec4899', dept: 'Dermatology' },
    { id: 'nurse2',     label: "Nurse's Station",        x: 550, y: 40,  w:  80, h: 70, color: '#64748b', dept: null },
    { id: 'lift2',      label: 'Lift / Stairs',          x: 550, y: 145, w:  80, h: 70, color: '#475569', dept: null },
  ],
  3: [
    { id: 'icu',        label: 'ICU',                   x: 40,  y: 40,  w: 160, h: 80, color: '#dc2626', dept: 'ICU' },
    { id: 'surgery',    label: 'Surgery / OT',          x: 240, y: 40,  w: 160, h: 80, color: '#7c3aed', dept: 'Surgery' },
    { id: 'maternity',  label: 'Maternity Ward',        x: 440, y: 40,  w: 140, h: 80, color: '#ec4899', dept: 'Maternity' },
    { id: 'nurse3',     label: "Nurse's Station",       x: 40,  y: 160, w: 100, h: 60, color: '#64748b', dept: null },
    { id: 'ward-a',     label: 'General Ward A',        x: 180, y: 160, w: 140, h: 60, color: '#0ea5e9', dept: 'Ward' },
    { id: 'ward-b',     label: 'General Ward B',        x: 360, y: 160, w: 140, h: 60, color: '#06b6d4', dept: 'Ward' },
    { id: 'lift3',      label: 'Lift / Stairs',         x: 540, y: 160, w:  80, h: 60, color: '#475569', dept: null },
  ],
};

// Corridor waypoints per floor (centre of corridor)
const CORRIDOR_Y = { 1: 114, 2: 112, 3: 140 };

// Graph adjacency — each node: { floor, cx, cy } connected to neighbours
function buildGraph() {
  const nodes = {};
  Object.entries(FLOORS).forEach(([floor, rooms]) => {
    rooms.forEach(r => {
      nodes[r.id] = { id: r.id, floor: Number(floor), cx: r.x + r.w / 2, cy: r.y + r.h / 2, label: r.label };
    });
  });
  // Corridor waypoints
  nodes['cor1'] = { id: 'cor1', floor: 1, cx: 295, cy: CORRIDOR_Y[1], label: 'Corridor F1' };
  nodes['cor2'] = { id: 'cor2', floor: 2, cx: 295, cy: CORRIDOR_Y[2], label: 'Corridor F2' };
  nodes['cor3'] = { id: 'cor3', floor: 3, cx: 295, cy: CORRIDOR_Y[3], label: 'Corridor F3' };

  // Connections
  const edges = {
    // Floor 1 room ↔ corridor
    entrance:  ['cor1', 'reception'],
    reception: ['cor1', 'entrance'],
    emergency: ['cor1'],
    pharmacy:  ['cor1'],
    radiology: ['cor1'],
    lab:       ['cor1'],
    canteen:   ['cor1'],
    toilet1:   ['cor1'],
    lift1:     ['cor1', 'cor2'],   // stairs
    cor1:      ['reception', 'emergency', 'pharmacy', 'radiology', 'lab', 'canteen', 'toilet1', 'lift1', 'entrance'],
    // Floor 2
    'opd-card': ['cor2'], 'opd-gmed': ['cor2'], 'opd-ped': ['cor2'],
    'opd-orth': ['cor2'], 'opd-ent':  ['cor2'], 'opd-derm': ['cor2'],
    nurse2:    ['cor2'], lift2: ['cor2', 'cor1', 'cor3'],
    cor2:      ['opd-card', 'opd-gmed', 'opd-ped', 'opd-orth', 'opd-ent', 'opd-derm', 'nurse2', 'lift2'],
    // Floor 3
    icu:       ['cor3'], surgery: ['cor3'], maternity: ['cor3'],
    nurse3:    ['cor3'], 'ward-a': ['cor3'], 'ward-b': ['cor3'], lift3: ['cor3', 'cor2'],
    cor3:      ['icu', 'surgery', 'maternity', 'nurse3', 'ward-a', 'ward-b', 'lift3'],
  };
  return { nodes, edges };
}

// BFS shortest path
function bfs(startId, endId, edges) {
  const queue = [[startId]];
  const visited = new Set([startId]);
  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === endId) return path;
    for (const neighbour of (edges[node] || [])) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push([...path, neighbour]);
      }
    }
  }
  return null;
}

// Convert node path → SVG waypoints per floor
function pathToSegments(path, nodes) {
  return path.map(id => nodes[id]).filter(Boolean);
}

// Human-readable steps from node path
function buildSteps(path, nodes) {
  const steps = [];
  let i = 0;
  while (i < path.length) {
    const node = nodes[path[i]];
    if (!node) { i++; continue; }
    if (path[i].startsWith('cor')) {
      steps.push({ icon: '🚶', text: `Walk along the corridor on Floor ${node.floor}` });
    } else if (path[i].startsWith('lift') || path[i].startsWith('lift')) {
      const nextNode = nodes[path[i + 1]];
      if (nextNode && nextNode.floor !== node.floor) {
        steps.push({ icon: '🛗', text: `Take the lift/stairs to Floor ${nextNode.floor}` });
      }
    } else if (path[i] === 'entrance') {
      steps.push({ icon: '🚪', text: 'Enter through the Main Entrance' });
    } else {
      if (i === path.length - 1) {
        steps.push({ icon: '📍', text: `Arrive at ${node.label}` });
      } else {
        steps.push({ icon: '➡️', text: `Head towards ${node.label}` });
      }
    }
    i++;
  }
  return steps;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function HospitalMap({ hospital }) {
  const { nodes, edges } = buildGraph();
  const [activeFloor, setActiveFloor] = useState(1);
  const [selected, setSelected]       = useState(null);
  const [search, setSearch]           = useState('');
  const [route, setRoute]             = useState(null);   // { path, steps, target }
  const [userPos, setUserPos]         = useState({ id: 'entrance', floor: 1 });
  const [animProgress, setAnimProgress] = useState(0);
  const [locating, setLocating]       = useState(false);
  const [navigationStep, setNavigationStep] = useState(null); // null = not navigating
  const animRef = useRef(null);
  const pathRef = useRef(null);



  const floors = [1, 2, 3];
  const allRooms = Object.values(FLOORS).flat();

  // Animate route progress
  useEffect(() => {
    if (!route) { setAnimProgress(0); return; }
    setAnimProgress(0);
    let start = null;
    const duration = 1800;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setAnimProgress(p);
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [route]);

  // Live location via browser Geolocation (maps to entrance as indoor approximation)
  const locateMe = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      setUserPos({ id: 'entrance', floor: 1 });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        // Indoor GPS not reliable — we place user at entrance
        setUserPos({ id: 'entrance', floor: 1 });
        setLocating(false);
        setActiveFloor(1);
      },
      () => {
        setUserPos({ id: 'entrance', floor: 1 });
        setLocating(false);
      },
      { timeout: 5000 }
    );
  };

  // Start navigation simulation whenever a route is set
  useEffect(() => {
    if (!route) {
      setNavigationStep(null);
      return;
    }
    // Begin at first node (userPos may already be entrance)
    setNavigationStep(0);
  }, [route]);

  // Progress through the path step‑by‑step (2 s per segment)
  useEffect(() => {
    if (navigationStep === null || !route) return;
    if (navigationStep >= route.path.length) {
      // Arrived – stop navigation
      setNavigationStep(null);
      return;
    }
    const nodeId = route.path[navigationStep];
    const node = nodes[nodeId];
    if (node) {
      setUserPos({ id: nodeId, floor: node.floor });
      setActiveFloor(node.floor);
    }
    const timer = setTimeout(() => setNavigationStep(prev => (prev ?? 0) + 1), 2000);
    return () => clearTimeout(timer);
  }, [navigationStep, route, nodes]);



  // Navigate to a room
  const navigateTo = (room) => {
    const floor = Object.keys(FLOORS).find(f => FLOORS[f].some(r => r.id === room.id));
    const path = bfs(userPos.id, room.id, edges);
    if (!path) return;
    const steps = buildSteps(path, nodes);
    setRoute({ path, steps, target: room });
    setSelected(null);
    setActiveFloor(Number(floor));
  };

  // Clear route
  const clearRoute = () => { setRoute(null); setAnimProgress(0); };

  // Filtered search
  const filteredRooms = search.length > 1
    ? allRooms.filter(r =>
        r.label.toLowerCase().includes(search.toLowerCase()) ||
        (r.dept && r.dept.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  // Draw SVG route segments on active floor
  const routeSegmentsOnFloor = () => {
    if (!route) return null;
    const floorNodes = route.path
      .map(id => nodes[id])
      .filter(n => n && n.floor === activeFloor);
    if (floorNodes.length < 2) return null;

    // Build polyline points
    const pts = floorNodes.map(n => `${n.cx},${n.cy}`).join(' ');

    return (
      <g>
        {/* Shadow glow */}
        <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="10" strokeOpacity="0.12" strokeLinecap="round" strokeLinejoin="round" />
        {/* Animated dashed line */}
        <polyline
          ref={pathRef}
          points={pts}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="10 6"
          strokeDashoffset={`${(1 - animProgress) * -300}`}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
        {/* Animated dot along path */}
        {floorNodes.length >= 2 && (() => {
          const idx = Math.min(Math.floor(animProgress * (floorNodes.length - 1)), floorNodes.length - 2);
          const frac = (animProgress * (floorNodes.length - 1)) - idx;
          const a = floorNodes[idx], b = floorNodes[idx + 1];
          const cx = a.cx + (b.cx - a.cx) * frac;
          const cy = a.cy + (b.cy - a.cy) * frac;
          return (
            <g>
              <circle cx={cx} cy={cy} r="10" fill="#3b82f6" opacity="0.2" />
              <circle cx={cx} cy={cy} r="6"  fill="#3b82f6" />
              <circle cx={cx} cy={cy} r="3"  fill="white" />
            </g>
          );
        })()}
        {/* Direction arrows */}
        {floorNodes.slice(0, -1).map((n, i) => {
          const next = floorNodes[i + 1];
          const mx = (n.cx + next.cx) / 2, my = (n.cy + next.cy) / 2;
          const angle = Math.atan2(next.cy - n.cy, next.cx - n.cx) * 180 / Math.PI;
          return (
            <g key={i} transform={`translate(${mx},${my}) rotate(${angle})`}>
              <polygon points="-5,-4 5,0 -5,4" fill="#3b82f6" opacity="0.8" />
            </g>
          );
        })}
      </g>
    );
  };

  const rooms = FLOORS[activeFloor] || [];

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* ── Search ── */}
      <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <Search size={16} color="var(--primary-color)" />
        <input
          type="text"
          placeholder="Search room or department (e.g. Cardiology, Pharmacy…)"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelected(null); }}
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.93rem', background: 'transparent', color: 'var(--text-main)' }}
        />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={15} /></button>}
      </div>

      {/* Search results dropdown */}
      {filteredRooms.length > 0 && (
        <div className="card" style={{ padding: '0.4rem', display: 'grid', gap: '0.2rem', maxHeight: 220, overflowY: 'auto' }}>
          {filteredRooms.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelected(r); setSearch(''); const f = Number(Object.keys(FLOORS).find(fl => FLOORS[fl].some(rm => rm.id === r.id))); setActiveFloor(f); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.5rem 0.8rem', border: 'none', borderRadius: '6px', background: 'var(--bg-light)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 2, background: r.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{r.label}</span>
              {r.dept && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{r.dept}</span>}
            </button>
          ))}
        </div>
      )}

      {/* ── Active Route Banner ── */}
      {route && (
        <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.1))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Navigation size={18} color="#3b82f6" />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: '#3b82f6' }}>Routing to: </span>
            <span style={{ fontWeight: 600 }}>{route.target.label}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}> · {route.steps.length} steps · Floor {Object.keys(FLOORS).find(f => FLOORS[f].some(r => r.id === route.target.id))}</span>
          </div>
          <button onClick={clearRoute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="hospital-map-grid">
        {/* Floor plan */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Floor tabs + Locate Me */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-light)', alignItems: 'center' }}>
            {floors.map(f => (
              <button key={f} onClick={() => { setActiveFloor(f); setSelected(null); }}
                style={{ padding: '0.55rem 1.1rem', border: 'none', borderBottom: activeFloor === f ? '2px solid var(--primary-color)' : '2px solid transparent', background: 'transparent', fontWeight: activeFloor === f ? 700 : 400, color: activeFloor === f ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Layers size={13} /> Floor {f}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', padding: '0 0.8rem' }}>
              <button onClick={locateMe} disabled={locating}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.3rem 0.7rem', borderRadius: '20px', border: '1px solid var(--primary-light)', background: locating ? 'var(--bg-light)' : 'rgba(59,130,246,0.08)', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}>
                <LocateFixed size={13} /> {locating ? 'Locating…' : 'Locate Me'}
              </button>
            </div>
          </div>

          {/* SVG */}
          <div style={{ padding: '1rem', overflowX: 'auto' }}>
            <svg viewBox="0 0 680 290" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <rect width="680" height="290" rx="8" fill="#f8fafc" />

              {/* Corridor */}
              <rect x="30" y={CORRIDOR_Y[activeFloor] - 14} width="620" height="28" fill="#e2e8f0" rx="4" />
              <text x="335" y={CORRIDOR_Y[activeFloor] + 5} textAnchor="middle" fontSize="9" fill="#94a3b8" letterSpacing="2">CORRIDOR — FLOOR {activeFloor}</text>

              {/* Rooms */}
              {rooms.map(room => {
                const isSelected = selected?.id === room.id;
                const isTarget   = route?.target?.id === room.id;
                const onRoute    = route?.path?.includes(room.id);
                return (
                  <g key={room.id} onClick={() => { setSelected(room); setSearch(''); }} style={{ cursor: 'pointer' }}>
                    <rect x={room.x} y={room.y} width={room.w} height={room.h} rx="7"
                      fill={isTarget ? `${room.color}33` : isSelected ? `${room.color}22` : `${room.color}14`}
                      stroke={isTarget ? room.color : isSelected ? room.color : onRoute ? '#3b82f6' : `${room.color}55`}
                      strokeWidth={isTarget || isSelected ? 2.5 : onRoute ? 1.8 : 1.2}
                    />
                    <rect x={room.x} y={room.y} width={5} height={room.h} rx="3" fill={room.color} />
                    {isTarget && <rect x={room.x-3} y={room.y-3} width={room.w+6} height={room.h+6} rx="10" fill="none" stroke={room.color} strokeWidth="2" opacity="0.35" />}
                    <text x={room.x + room.w/2 + 3} y={room.y + room.h/2 - (room.dept ? 7 : 0)} textAnchor="middle" fontSize="11" fontWeight={isSelected || isTarget ? 700 : 600} fill={isSelected || isTarget ? room.color : '#1e293b'}>
                      {room.label.length > 17 ? room.label.slice(0, 16) + '…' : room.label}
                    </text>
                    {room.dept && (
                      <text x={room.x + room.w/2 + 3} y={room.y + room.h/2 + 9} textAnchor="middle" fontSize="9" fill="#64748b">{room.dept}</text>
                    )}
                    {isTarget && <text x={room.x + room.w - 14} y={room.y + 16} fontSize="14">📍</text>}
                  </g>
                );
              })}

              {/* Route overlay */}
              {routeSegmentsOnFloor()}

              {/* You Are Here */}
              {userPos && (
                (() => {
                  const curNode = nodes[userPos.id];
                  if (!curNode) return null;
                  // Only draw on the active floor SVG
                  if (curNode.floor !== activeFloor) return null;
                  return (
                    <g>
                      <circle cx={curNode.cx} cy={curNode.cy} r="8" fill="#22c55e" opacity="0.25" />
                      <circle cx={curNode.cx} cy={curNode.cy} r="5" fill="#22c55e" />
                      <circle cx={curNode.cx} cy={curNode.cy} r="2.5" fill="white" />
                      <text x={curNode.cx + 14} y={curNode.cy + 4} fontSize="10" fill="#166534" fontWeight="600">You are here</text>
                    </g>
                  );
                })()
              )}
            </svg>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {/* Room detail card */}
          {selected ? (
            <div className="card" style={{ borderLeft: `4px solid ${selected.color}`, animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: selected.color }}>{selected.label}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}><X size={14} /></button>
              </div>
              {selected.dept && <p style={{ margin: '0 0 0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dept: <strong>{selected.dept}</strong></p>}
              <p style={{ margin: '0 0 0.9rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Floor: <strong>{activeFloor}</strong></p>
              <button className="btn btn-primary" onClick={() => navigateTo(selected)}
                style={{ width: '100%', fontSize: '0.82rem', padding: '0.42rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Navigation size={13} /> Get Directions
              </button>
            </div>
          ) : !route ? (
            <div className="card" style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-light)' }}>
              <MapPin size={26} color="var(--primary-light)" style={{ marginBottom: '0.4rem' }} />
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tap any room then press <strong>Get Directions</strong> to start routing.</p>
            </div>
          ) : null}

          {/* Step-by-step directions */}
          {route && (
            <div className="card" style={{ padding: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Footprints size={13} /> Directions
                </p>
                <button onClick={clearRoute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem' }}>Clear</button>
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {route.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '14px', lineHeight: 1.5, flexShrink: 0 }}>{step.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', fontSize: '9px', fontWeight: 700, marginRight: '0.4rem', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{step.text}</span>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem', padding: '0.5rem', background: 'rgba(16,185,129,0.08)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle size={14} color="#10b981" />
                  <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>Destination: {route.target.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="card" style={{ padding: '0.8rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend</p>
            {[
              { color: '#3b82f6', label: 'Reception / OPD' },
              { color: '#ef4444', label: 'Emergency / ICU' },
              { color: '#10b981', label: 'Pharmacy / Services' },
              { color: '#8b5cf6', label: 'Diagnostics' },
              { color: '#f59e0b', label: 'Lab / Testing' },
              { color: '#475569', label: 'Lift / Stairs' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.28rem' }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.label}</span>
              </div>
            ))}
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4 3" /></svg>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Your route</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
