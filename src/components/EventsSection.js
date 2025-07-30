import React from 'react';

function EventsSection() {
  return (
    <div>
      <div className="text-center mb-5">
        <h2 className="fw-bold" style={{ color: '#212529' }}>Events & Tickets</h2>
        <p className="text-muted">Explore upcoming events and buy tickets</p>
      </div>
      <div className="row g-4">
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#212529', borderRadius: '15px' }}>
            <div className="card-body p-4 text-light">
              <h5 className="card-title">Event Title #1</h5>
              <p className="card-text">eveniment lalalala</p>
              <button className="btn btn-sm" style={{ backgroundColor: '#ff7a00', color: '#000' }}>
                <i className="bi bi-ticket-perforated me-1"></i>
                Buy Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsSection;
