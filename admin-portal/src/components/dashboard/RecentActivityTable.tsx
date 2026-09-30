import { ArrowRight } from 'lucide-react'

const activities = [
  { student: 'Ankit Sharma', item: 'Atomic Habits',  status: 'Reserved',    date: '13 Sep, 10:24', tone: 'blue'    },
  { student: 'Meera Patel',  item: 'Seat G-14',      status: 'Occupied',    date: '13 Sep, 10:19', tone: 'amber'   },
  { student: 'Rohit Das',    item: 'The Alchemist',  status: 'Returned',    date: '13 Sep, 09:54', tone: 'emerald' },
  { student: 'Zoya Khan',    item: 'Fine Rs. 250',   status: 'Payment due', date: '13 Sep, 09:43', tone: 'rose'    },
  { student: 'Vikash Role',  item: 'Seat A-09',      status: 'Released',    date: '13 Sep, 08:01', tone: 'slate'   },
] as const

function RecentActivityTable() {
  return (
    <section className="activity-card">
      <div className="widget-heading">
        <h2>Recent Activity</h2>
        <button className="view-all-btn" type="button">View all</button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Item</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(({ student, item, status, date, tone }) => (
              <tr key={`${student}-${date}`}>
                <td className="student-name">{student}</td>
                <td>{item}</td>
                <td><span className={`status-tag ${tone}`}>{status}</span></td>
                <td>{date}</td>
                <td>
                  <button className="view-button" type="button">
                    View <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RecentActivityTable
