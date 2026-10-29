import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Edit, Save, Trash2, CheckCircle, Plus, Move } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';

// Re‑use the same floor layout definition from HospitalMap
const FLOORS = {
  1: [
    { id: 'entrance',   label: 'Main Entrance',     x: 290, y: 220, w: 100, h: 44, color: '#3b82f6', dept: 'Entrance' },
    // ... other rooms (same as HospitalMap) ...
  ],
  2: [
    // floor‑2 rooms
  ],
  3: [
    // floor‑3 rooms
  ],
};

const CORRIDOR_Y = { 1: 114, 2: 112, 3: 140 };

function buildGraph() {
  const nodes = {};
  Object.entries(FLOORS).forEach(([floor, rooms]) => {
    rooms.forEach(r => {
      nodes[r.id] = { ...r, floor: Number(floor), cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
    });
  });
  // corridor waypoints
  nodes['cor1'] = { id: 'cor1', floor: 1, cx: 295, cy: CORRIDOR_Y[1], label: 'Corridor F1' };
  nodes['cor2'] = { id: 'cor2', floor: 2, cx: 295, cy: CORRIDOR_Y[2], label: 'Corridor F2' };
  nodes['cor3'] = { id: 'cor3', floor: 3, cx: 295, cy: CORRIDOR_Y[3], label: 'Corridor F3' };
  // edges (same as HospitalMap – omitted for brevity)
  const edges = {};
  return { nodes, edges };
}

export default function StaffMapEditor({ hospitalId }) {
  const { nodes, edges } = buildGraph();
  const [activeFloor, setActiveFloor] = useState(1);
  const [rooms, setRooms] = useState(FLOORS[activeFloor] || []);
  const [editMode, setEditMode] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [dragging, setDragging] = useState(null); // {roomId, offsetX, offsetY}

  // Load stored map data from backend when component mounts
  useEffect(() => {
    const fetchMap = async () => {
      const data = await api.getHospitalMap(hospitalId);
      if (data && data.locations) {
        // data.locations expected shape: [{ floor, id, label, x, y, w, h, color, dept }]
        const floorMap = {};
        data.locations.forEach(loc => {
          if (!floorMap[loc.floor]) floorMap[loc.floor] = [];
          floorMap[loc.floor].push(loc);
        });
        Object.keys(floorMap).forEach(f => (FLOORS[f] = floorMap[f]));
        setRooms(FLOORS[activeFloor] || []);
      }
    };
    fetchMap();
  }, [hospitalId, activeFloor]);

  const handleRoomClick = (room) => {
    if (!editMode) return;
    // Push current state to undo stack before any change
    setUndoStack(prev => [...prev, rooms]);
    setRedoStack([]);
    const newLabel = prompt('Edit room label', room.label);
    if (newLabel !== null) {
      const updated = { ...room, label: newLabel };
      const newFloor = rooms.map(r => (r.id === room.id ? updated : r));
      setRooms(newFloor);
    }
  };

  // Add a new room to the current floor
  const handleAddRoom = () => {
    if (!editMode) return;
    const label = prompt('Enter new room label', 'New Room');
    if (label === null) return;
    const color = prompt('Enter room color (hex)', '#34d399');
    const newRoom = {
      id: uuidv4(),
      label,
      x: 50,
      y: 50,
      w: 80,
      h: 44,
      color: color || '#34d399',
      dept: ''
    };
    setUndoStack(prev => [...prev, rooms]);
    setRedoStack([]);
    setRooms(prev => [...prev, newRoom]);
  };

  const handleRoomDelete = (room) => {
    // push current state to undo stack
    setUndoStack(prev => [...prev, rooms]);
    setRedoStack([]);
    setRooms(rooms.filter(r => r.id !== room.id));
    if (selectedRoom && selectedRoom.id === room.id) setSelectedRoom(null);
  };

  const handleMouseDown = (e, room) => {
    if (!dragMode) return;
    e.stopPropagation();
    const svgRect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - svgRect.x;
    const offsetY = e.clientY - svgRect.y;
    setDragging({ roomId: room.id, offsetX, offsetY });
    // Save state for undo
    setUndoStack(prev => [...prev, rooms]);
    setRedoStack([]);
  };

  // Drag move handler (re‑added)
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const { roomId, offsetX, offsetY } = dragging;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX - offsetX;
    pt.y = e.clientY - offsetY;
    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        return { ...r, x: Math.round(pt.x), y: Math.round(pt.y) };
      }
      return r;
    });
    setRooms(updatedRooms);
  };



  const handleMouseUp = () => {
    if (dragging) setDragging(null);
  };

  const saveChanges = async () => {
    // flatten all floors into a single array for the API
    const allLocations = [];
    Object.entries(FLOORS).forEach(([floor, list]) => {
      list.forEach(r => {
        allLocations.push({ ...r, floor: Number(floor) });
      });
    });
    try {
      await api.upsertHospitalLocations(hospitalId, allLocations);
      toast.success('Map saved successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save map');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button onClick={() => setEditMode(!editMode)} style={{ background: editMode ? '#10b981' : '#64748b', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
          {editMode ? 'Exit Edit' : 'Edit Map'}
        </button>
          <button onClick={() => setDragMode(!dragMode)} style={{ background: dragMode ? '#10b981' : '#64748b', color: 'white', padding: '0.4rem 0.8rem', marginLeft: '0.5rem', borderRadius: '4px' }}>
            {dragMode ? 'Stop Drag' : 'Drag Mode'}
          </button>
        {editMode && (
          <>
            <button onClick={handleAddRoom} style={{ background: '#3b82f6', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', marginLeft: '0.5rem' }}>
              <Plus size={14} /> Add Room
            </button>
            <button onClick={saveChanges} style={{ background: '#3b82f6', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
              <Save size={14} /> Save Changes
            </button>
            <button onClick={() => {
              if (undoStack.length) {
                const prev = undoStack[undoStack.length - 1];
                setRedoStack(r => [...r, rooms]);
                setRooms(prev);
                setUndoStack(u => u.slice(0, -1));
              }
            }} style={{ background: '#f59e0b', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
              Undo
            </button>
            <button onClick={() => {
              if (redoStack.length) {
                const next = redoStack[redoStack.length - 1];
                setUndoStack(u => [...u, rooms]);
                setRooms(next);
                setRedoStack(r => r.slice(0, -1));
              }
            }} style={{ background: '#10b981', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
              Redo
            </button>
          </>
        )}
      </div>
      {/* Floor tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        {Object.keys(FLOORS).map(f => (
          <button key={f} onClick={() => { setActiveFloor(Number(f)); setRooms(FLOORS[f] || []); }}
            style={{ padding: '0.5rem 1rem', border: 'none', borderBottom: activeFloor === Number(f) ? '2px solid var(--primary-color)' : 'transparent', background: 'transparent', color: activeFloor === Number(f) ? 'var(--primary-color)' : 'var(--text-muted)' }}>
            Floor {f}
          </button>
        ))}
      </div>
      {/* SVG floor plan */}
      <div style={{ padding: '1rem', overflowX: 'auto' }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <svg viewBox="0 0 680 290" style={{ width: '100%', minWidth: 480, display: 'block' }}>
          <rect width="680" height="290" rx="8" fill="#f8fafc" />
          <rect x="30" y={CORRIDOR_Y[activeFloor] - 14} width="620" height="28" fill="#e2e8f0" rx="4" />
          <text x="335" y={CORRIDOR_Y[activeFloor] + 5} textAnchor="middle" fontSize="9" fill="#94a3b8" letterSpacing="2">
            CORRIDOR — FLOOR {activeFloor}
          </text>
          {rooms.map(room => {
            const isSelected = selectedRoom?.id === room.id;
            return (
              <g key={room.id}
                 onClick={() => handleRoomClick(room)}
                 onMouseDown={(e) => handleMouseDown(e, room)}
                 style={{ cursor: dragMode ? 'move' : 'default' }}>
                <rect x={room.x} y={room.y} width={room.w} height={room.h} rx="7"
                  fill={`${room.color}22`}
                  stroke={isSelected ? room.color : '#3b82f6'}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                />
                <text x={room.x + room.w / 2} y={room.y + room.h / 2} textAnchor="middle" fontSize="11" fill="#1e293b">
                  {room.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
