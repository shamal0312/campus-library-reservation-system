import { Download } from 'lucide-react'
import { useState } from 'react'

const reservationsData = [
  {
    id: 'STU-10241',
    studentName: 'Anaya Singh',
    bookTitle: 'The Book Thief',
    dueDate: '06 Sep 2026',
    overdueDays: 5,
    fineAmount: 250,
    paymentStatus: 'Unpaid',
  },
  {
    id: 'STU-10138',
    studentName: 'Kabir Mehta',
    bookTitle: 'Deep Work',
    dueDate: '10 Sep 2026',
    overdueDays: 3,
    fineAmount: 150,
    paymentStatus: 'Unpaid',
  },
  {
    id: 'STU-10092',
    studentName: 'Ishita Bose',
    bookTitle: '1984',
    dueDate: '12 Sep 2026',
    overdueDays: 1,
    fineAmount: 50,
    paymentStatus: 'Paid',
  },
  {
    id: 'STU-09981',
    studentName: 'Arjun Nair',
    bookTitle: 'Educated',
    dueDate: '05 Sep 2026',
    overdueDays: 8,
    fineAmount: 400,
    paymentStatus: 'Unpaid',
  },
  {
    id: 'STU-09876',
    studentName: 'Sara Joseph',
    bookTitle: 'Dune',
    dueDate: '11 Sep 2026',
    overdueDays: 2,
    fineAmount: 100,
    paymentStatus: 'Paid',
  },
]

function ReservationsFines() {
  const [activeTab, setActiveTab] = useState('Overdue Fines')
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const tabs = [
    { label: 'All', count: 139 },
    { label: 'Pending', count: 14 },
    { label: 'Active', count: 91 },
    { label: 'Overdue Fines', count: 15 },
  ]

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(reservationsData.map((r) => r.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  return (
    <main className="reservations-page">
      <div className="page-heading reservations-heading">
        <div>
          <h1>Reservations & Fine Management</h1>
          <p>Track circulation deadlines, overdue fines, and payments</p>
        </div>
        <button className="export-button">
          <Download size={16} />
          <span>Export Report</span>
        </button>
      </div>

      <div className="data-table-container">
        <div className="tabs-bar">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`tab-button ${activeTab === tab.label ? 'tab-button-active' : ''}`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={selectedRows.length === reservationsData.length}
                  onChange={handleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th>STUDENT ID</th>
              <th>STUDENT NAME</th>
              <th>BOOK TITLE</th>
              <th>DUE DATE</th>
              <th>OVERDUE DAYS</th>
              <th>FINE AMOUNT</th>
              <th>PAYMENT STATUS</th>
            </tr>
          </thead>
          <tbody>
            {reservationsData.map((reservation) => (
              <tr key={reservation.id}>
                <td>
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedRows.includes(reservation.id)}
                    onChange={() => handleSelectRow(reservation.id)}
                    aria-label={`Select ${reservation.studentName}`}
                  />
                </td>
                <td className="text-muted">{reservation.id}</td>
                <td className="fw-medium">{reservation.studentName}</td>
                <td className="text-muted">{reservation.bookTitle}</td>
                <td className="text-muted">{reservation.dueDate}</td>
                <td className="text-muted">{reservation.overdueDays}</td>
                <td className="fw-medium">Rs. {reservation.fineAmount}</td>
                <td>
                  <span
                    className={`payment-badge ${
                      reservation.paymentStatus === 'Paid'
                        ? 'payment-badge-paid'
                        : 'payment-badge-unpaid'
                    }`}
                  >
                    {reservation.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <div className="selection-info">
            <input
              type="checkbox"
              className="table-checkbox"
              checked={selectedRows.length === reservationsData.length}
              onChange={handleSelectAll}
              aria-label="Select all"
            />
            <span className="text-muted">
              Select all · {selectedRows.length} records selected
            </span>
          </div>
          <div className="footer-actions">
            <button className="footer-button footer-button-primary">Mark as Paid</button>
            <button className="footer-button footer-button-secondary">Waive Fine</button>
            <button className="footer-button footer-button-secondary">
              Update Reservation Status
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ReservationsFines
