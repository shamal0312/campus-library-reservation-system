import StatCards from '../components/dashboard/StatCards'
import RecentActivityTable from '../components/dashboard/RecentActivityTable'
import QuickActions from '../components/dashboard/QuickActions'

function getFormattedDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

function Dashboard() {
  return (
    <main className="dashboard-page">
      <div className="page-heading">
        <h1>Library Dashboard</h1>
        <p>Library operations overview &middot; {getFormattedDate()}</p>
      </div>
      <StatCards />
      <div className="dashboard-widgets">
        <RecentActivityTable />
        <QuickActions />
      </div>
    </main>
  )
}

export default Dashboard
