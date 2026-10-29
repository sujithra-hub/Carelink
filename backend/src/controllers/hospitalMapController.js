import { supabase, isSupabaseConfigured } from '../supabaseClient.js';

// Get full floor map (locations + routes) for a hospital branch
export async function getHospitalMap(req, res) {
  try {
    const { id } = req.params; // hospital branch id
    const branchId = Number(id);
    let locations = [];
    let routes = [];

    if (isSupabaseConfigured) {
      const { data: locData, error: locErr } = await supabase
        .from('hospital_locations')
        .select('*')
        .eq('hospital_id', branchId);
      if (!locErr && locData) locations = locData;

      const { data: routeData, error: routeErr } = await supabase
        .from('hospital_routes')
        .select('*')
        .or(`from_location_id.in.(${locations.map(l => l.id).join(',')}),to_location_id.in.(${locations.map(l => l.id).join(',')})`);
      if (!routeErr && routeData) routes = routeData;
    }

    // Fallback – use in‑memory data from fallbackOrganizations if Supabase not configured
    if (!isSupabaseConfigured || locations.length === 0) {
      // Find branch in fallback data
      const { getFlatHospitals } = await import('../controllers/hospitalController.js');
      const flat = getFlatHospitals();
      const branch = flat.find(b => b.id === branchId);
      if (branch) {
        // Mock locations from departments (simple placeholder)
        locations = branch.departments.map((dept, idx) => ({
          id: idx + 1,
          hospital_id: branchId,
          name: dept.name,
          floor: 1,
          x_coord: Math.random() * 100,
          y_coord: Math.random() * 100,
          department_id: null,
        }));
        routes = [];
      }
    }

    return res.json({ success: true, data: { locations, routes } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Admin: upsert locations (create / update)
export async function upsertHospitalLocations(req, res) {
  try {
    const { id } = req.params; // branch id
    const branchId = Number(id);
    const locations = req.body; // array of location objects
    const upserted = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('hospital_locations')
        .upsert(locations.map(loc => ({ ...loc, hospital_id: branchId })), { onConflict: 'id' })
        .select();
      if (error) throw error;
      upserted.push(...data);
    } else {
      // In fallback mode we simply echo back
      upserted.push(...locations);
    }
    return res.json({ success: true, data: upserted });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Admin: upsert routes (create / update)
export async function upsertHospitalRoutes(req, res) {
  try {
    const routes = req.body; // array of { from_location_id, to_location_id, path }
    const upserted = [];
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('hospital_routes')
        .upsert(routes, { onConflict: 'id' })
        .select();
      if (error) throw error;
      upserted.push(...data);
    } else {
      upserted.push(...routes);
    }
    return res.json({ success: true, data: upserted });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Simple shortest‑path (BFS) – returns array of location ids
export async function getShortestRoute(req, res) {
  try {
    const { id } = req.params; // branch id
    const { from, to } = req.query; // location ids
    const branchId = Number(id);
    const fromId = Number(from);
    const toId = Number(to);

    // Load graph
    const { data: locData, error: locErr } = await supabase
      .from('hospital_locations')
      .select('id')
      .eq('hospital_id', branchId);
    if (locErr) throw locErr;
    const locationIds = locData.map(l => l.id);

    const { data: routeData, error: routeErr } = await supabase
      .from('hospital_routes')
      .select('from_location_id, to_location_id')
      .or(`from_location_id.in.(${locationIds.join(',')}),to_location_id.in.(${locationIds.join(',')})`);
    if (routeErr) throw routeErr;

    // Build adjacency list
    const adj = {};
    locationIds.forEach(id => (adj[id] = []));
    routeData.forEach(r => {
      adj[r.from_location_id].push(r.to_location_id);
      adj[r.to_location_id].push(r.from_location_id);
    });

    // BFS
    const queue = [fromId];
    const visited = new Set([fromId]);
    const prev = {};
    while (queue.length) {
      const cur = queue.shift();
      if (cur === toId) break;
      for (const n of adj[cur] || []) {
        if (!visited.has(n)) {
          visited.add(n);
          prev[n] = cur;
          queue.push(n);
        }
      }
    }
    // Reconstruct path
    const path = [];
    let cur = toId;
    while (cur !== undefined) {
      path.unshift(cur);
      cur = prev[cur];
      if (cur === fromId) { path.unshift(cur); break; }
    }
    return res.json({ success: true, data: { path } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
