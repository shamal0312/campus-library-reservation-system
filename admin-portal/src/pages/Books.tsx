import { Bell, Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const dummyBooks = [
  { id: 'BK-1030', title: 'The Midnight Library', author: 'Matt Haig', category: 'Fiction', status: 'Available' },
  { id: 'BK-1047', title: 'Clean Code', author: 'Robert C.. Martin', category: 'Technology', status: 'Reserved' },
  { id: 'BK-1048', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', status: 'Available' },
  { id: 'BK-1045', title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', status: 'Reserved' },
  { id: 'BK-1044', title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', category: 'Biography', status: 'Available' },
  { id: 'BK-1053', title: 'Ikigai', author: 'Héctor García', category: 'Wellness', status: 'Available' },
]

function Books() {
  return (
    <main className="books-page">
      <div className="page-heading books-heading">
        <div>
          <h1>Manage Books</h1>
          <p>Catalog and maintain the library collection</p>
        </div>
        <div className="toolbar-actions">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search title, author or ID" />
          </div>
          <select className="category-select" defaultValue="All Categories" aria-label="Category filter">
            <option>All Categories</option>
            <option>Fiction</option>
            <option>Technology</option>
            <option>History</option>
            <option>Finance</option>
          </select>
          <button className="primary-button add-book-btn">
            <Plus size={16} />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>BOOK ID</th>
              <th>TITLE</th>
              <th>AUTHOR</th>
              <th>CATEGORY</th>
              <th>STATUS</th>
              <th className="align-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {dummyBooks.map((book) => (
              <tr key={book.id}>
                <td className="text-muted">{book.id}</td>
                <td className="fw-medium">{book.title}</td>
                <td className="text-muted">{book.author}</td>
                <td className="text-muted">{book.category}</td>
                <td>
                  <span className={`status-badge ${book.status === 'Available' ? 'status-success' : 'status-warning'}`}>
                    {book.status}
                  </span>
                </td>
                <td className="align-right row-actions">
                  <button className="icon-btn edit-btn" aria-label="Edit book"><Edit2 size={14} /></button>
                  <button className="icon-btn delete-btn" aria-label="Delete book"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="pagination-footer">
          <span className="text-muted">Showing 1-6 of 12,480 books</span>
          <div className="pagination-controls">
            <button className="page-btn"><ChevronLeft size={14} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-dots">...</span>
            <button className="page-btn">2080</button>
            <button className="page-btn"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Books
