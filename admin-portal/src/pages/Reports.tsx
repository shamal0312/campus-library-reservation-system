import { Download, BookOpen, Users, AlertCircle, DollarSign } from 'lucide-react'

const statsData = [
  {
    label: 'Total Checkouts',
    value: '4,821',
    change: '+340 this week',
    changeType: 'positive',
    icon: BookOpen,
  },
  {
    label: 'Active Members',
    value: '1,842',
    change: '94% attendance rate',
    changeType: 'info',
    icon: Users,
  },
  {
    label: 'Overdue Returns',
    value: '47',
    change: '11 critical alerts',
    changeType: 'warning',
    icon: AlertCircle,
  },
  {
    label: 'Revenue Collected',
    value: 'Rs. 12,450',
    change: 'From fines & fees',
    changeType: 'positive',
    icon: DollarSign,
  },
]

const chartData = [
  { month: 'Mar', value: 1200 },
  { month: 'Apr', value: 1800 },
  { month: 'May', value: 1500 },
  { month: 'Jun', value: 2400 },
  { month: 'Jul', value: 2100 },
  { month: 'Aug', value: 2600 },
]

const topBooks = [
  { rank: 1, title: 'The Midnight Library', checkouts: 142 },
  { rank: 2, title: 'Clean Code', checkouts: 128 },
  { rank: 3, title: 'Sapiens', checkouts: 115 },
  { rank: 4, title: 'The Psychology of Money', checkouts: 98 },
  { rank: 5, title: 'Wings of Fire', checkouts: 87 },
]

function Reports() {
  const maxValue = Math.max(...chartData.map((d) => d.value))

  return (
    <main className="reports-page">
      <div className="page-heading reports-heading">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Circulation statistics, historical trends, and member insights</p>
        </div>
        <button className="export-button">
          <Download size={16} />
          <span>Export Report</span>
        </button>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label htmlFor="start-date" className="filter-label">
            Date Range:
          </label>
          <input
            type="text"
            id="start-date"
            className="filter-input"
            defaultValue="01 Aug 2026"
            aria-label="Start date"
          />
          <span className="filter-separator">to</span>
          <input
            type="text"
            id="end-date"
            className="filter-input"
            defaultValue="31 Aug 2026"
            aria-label="End date"
          />
        </div>
        <select className="filter-select" defaultValue="All Categories" aria-label="Category filter">
          <option>All Categories</option>
          <option>Fiction</option>
          <option>Non-Fiction</option>
          <option>Technology</option>
        </select>
        <button className="generate-button">Generate Report</button>
      </div>

      <div className="stats-grid">
        {statsData.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-card-heading">
              <span>{stat.label}</span>
              <div className="stat-icon">
                <stat.icon size={14} strokeWidth={2} />
              </div>
            </div>
            <span className="stat-value">{stat.value}</span>
            <span className={`stat-detail stat-detail-${stat.changeType}`}>{stat.change}</span>
          </div>
        ))}
      </div>

      <div className="reports-widgets">
        <div className="chart-card">
          <div className="widget-heading">
            <h2>Monthly Book Checkouts (Mar - Aug 2026)</h2>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {chartData.map((data) => (
                <div key={data.month} className="chart-bar-wrapper">
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ height: `${(data.value / maxValue) * 100}%` }}
                    >
                      <span className="chart-value">{data.value}</span>
                    </div>
                  </div>
                  <span className="chart-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="top-books-card">
          <div className="widget-heading">
            <h2>Top Borrowed Books</h2>
          </div>
          <div className="top-books-list">
            <table className="top-books-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>TITLE</th>
                  <th className="align-right">CHECKOUTS</th>
                </tr>
              </thead>
              <tbody>
                {topBooks.map((book) => (
                  <tr key={book.rank}>
                    <td className="rank-cell">#{book.rank}</td>
                    <td className="title-cell">{book.title}</td>
                    <td className="checkouts-cell">{book.checkouts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Reports
