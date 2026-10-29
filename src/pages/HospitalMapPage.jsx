import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCareLink } from '../context/CareLinkContext';
import HospitalMap from '../components/HospitalMap';
import { MapPin, ArrowLeft } from 'lucide-react';

export default function HospitalMapPage() {
  const { hospitalId } = useParams();
  const { hospitals } = useCareLink();

  // hospitals is an array of flattened branch objects with numeric ids
  const hospital = hospitals.find(h => String(h.id) === String(hospitalId));

  if (!hospital) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h3 style={{ color: 'var(--danger)' }}>Hospital not found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            No hospital with ID <strong>{hospitalId}</strong> was found.
          </p>
          <Link to="/hospitals" className="btn btn-primary">Back to Facilities</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          to="/hospitals"
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <div>
          <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.6rem' }}>
            {hospital.name}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={13} /> {hospital.address}
          </p>
        </div>
      </div>

      {/* Map */}
      <HospitalMap hospital={hospital} />
    </div>
  );
}
