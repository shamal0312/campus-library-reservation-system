import { Clock } from 'lucide-react'

const seats = [
  // Row A
  { id: 'A-01', status: 'Occupied', row: 'A' },
  { id: 'A-02', status: 'Available', row: 'A' },
  { id: 'A-03', status: 'Available', row: 'A' },
  { id: 'A-04', status: 'Available', row: 'A' },
  { id: 'A-05', status: 'Occupied', row: 'A' },
  { id: 'A-06', status: 'Available', row: 'A' },
  
  // Row B
  { id: 'B-01', status: 'Available', row: 'B' },
  { id: 'B-02', status: 'Available', row: 'B' },
  { id: 'B-03', status: 'Reserved', row: 'B' },
  { id: 'B-04', status: 'Available', row: 'B' },
  { id: 'B-05', status: 'Available', row: 'B' },
  { id: 'B-06', status: 'Available', row: 'B' },
  
  // Row C
  { id: 'C-01', status: 'Occupied', row: 'C' },
  { id: 'C-02', status: 'Available', row: 'C' },
  { id: 'C-03', status: 'Available', row: 'C' },
  { id: 'C-04', status: 'Available', row: 'C' },
  { id: 'C-05', status: 'Available', row: 'C' },
  { id: 'C-06', status: 'Occupied', row: 'C' },
  
  // Row D
  { id: 'D-01', status: 'Available', row: 'D' },
  { id: 'D-02', status: 'Available', row: 'D' },
  { id: 'D-03', status: 'Occupied', row: 'D' },
  { id: 'D-04', status: 'Available', row: 'D' },
  { id: 'D-05', status: 'Available', row: 'D' },
  { id: 'D-06', status: 'Available', row: 'D' },
  
  // Row E
  { id: 'E-01', status: 'Available', row: 'E' },
  { id: 'E-02', status: 'Available', row: 'E' },
  { id: 'E-03', status: 'Available', row: 'E' },
  { id: 'E-04', status: 'Available', row: 'E' },
  { id: 'E-05', status: 'Occupied', row: 'E' },
  { id: 'E-06', status: 'Available', row: 'E' },
]

function SeatsReadingRoom() {
  const selectedSeat = 'B-03'
  const totalSeats = 45
  const occupiedSeats = 18
  const reservedSeats = 3
  const availableSeats = totalSeats - occupiedSeats - reservedSeats

  return (
    <main className="seats-page">
      <div className="page-heading">
        <div>
          <h1>Seats & Reading Room</h1>
          <p>Monitor occupancy and manage floor availability</p>
        </div>
      </div>

      <div className="seats-layout">
        <div className="floor-map-container">
          <div className="floor-header">
            <div className="floor-info">
              <h2>Main Reading Room - Floor 1</h2>
              <div className="floor-stats">
                <span>{totalSeats} seats</span>
                <span className="stat-divider">•</span>
                <span className="occupied-text">{occupiedSeats} occupied</span>
                <span className="stat-divider">•</span>
                <span className="reserved-text">{reservedSeats} reserved</span>
              </div>
            </div>
            <div className="floor-status">
              <span className="status-indicator status-indicator-open"></span>
              <span className="status-text">OPEN: 08:00-20:00</span>
            </div>
          </div>

          <div className="floor-map">
            <div className="floor-label floor-label-top">WINDOWS</div>
            <div className="floor-label floor-label-right">ENTRANCE →</div>

            <div className="seats-grid">
              {seats.map((seat) => (
                <div
                  key={seat.id}
                  className={`seat seat-${seat.status.toLowerCase()} ${
                    seat.id === selectedSeat ? 'seat-selected' : ''
                  }`}
                >
                  <div className="seat-id">{seat.id}</div>
                  <div className="seat-status">{seat.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="seat-details-panel">
          <div className="legend-section">
            <div className="legend-item">
              <div className="legend-box legend-available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-box legend-occupied"></div>
              <span>Occupied</span>
            </div>
            <div className="legend-item">
              <div className="legend-box legend-reserved"></div>
              <span>Reserved</span>
            </div>
          </div>

          <div className="selected-seat-card">
            <div className="card-label">SELECTED SEAT</div>
            <div className="seat-number">{selectedSeat}</div>
            <span className="seat-badge seat-badge-reserved">Reserved</span>

            <div className="detail-row">
              <span className="detail-label">Student ID</span>
              <span className="detail-value">STU-2026-1842</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Time Slot</span>
              <span className="detail-value">10:00 AM - 12:00 PM</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Student</span>
              <span className="detail-value detail-value-strong">Aamya Verma</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Reading room</span>
              <span className="detail-value">Main Hall</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Reserved at</span>
              <span className="detail-value">
                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                09:42 AM
              </span>
            </div>

            <div className="action-buttons">
              <button className="action-button action-button-secondary">Release Seat</button>
              <button className="action-button action-button-danger">Block Seat</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default SeatsReadingRoom
