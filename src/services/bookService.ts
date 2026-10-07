import { supabase } from '../lib/supabase';

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string | null;
  total_copies: number;
  available_copies: number;
  status: string;
  cover_url: string | null;
  created_at: string;
  published_year: number | null;
  description: string | null;
};

export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }

  return (data ?? []) as Book[];
}

//book search function

export async function searchBooks(searchText: string): Promise<Book[]> {
  const text = searchText.trim();

  if (!text) {
    return getBooks();
  }

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .or(
      `title.ilike.%${text}%,author.ilike.%${text}%,isbn.ilike.%${text}%,category.ilike.%${text}%`
    )
    .order('title', { ascending: true });

  if (error) {
    console.error('Error searching books:', error);
    throw error;
  }

  return (data ?? []) as Book[];
}

//book details function

export async function getBookById(bookId: string): Promise<Book> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single();

  if (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }

  return data as Book;
}

//book reservation function

export type CreateBookReservationInput = {
  userId: string;
  studentId: string;
  studentName: string;
  book: Book;
  pickupDate: string;
  returnDate: string;
};

export async function createBookReservation({
  userId,
  studentId,
  studentName,
  book,
  pickupDate,
  returnDate,
}: CreateBookReservationInput) {
  if (book.available_copies <= 0) {
    throw new Error('This book is currently unavailable.');
  }

  const { data, error } = await supabase.rpc('reserve_book', {
    p_book_id: book.id,
    p_user_id: userId,
    p_student_id: studentId,
    p_student_name: studentName,
    p_pickup_date: pickupDate,
    p_return_date: returnDate,
  });

  if (error) {
    console.error('Error creating book reservation:', error);
    throw error;
  }

  return data;
}


// Get logged-in student's active book reservations

export async function getMyBookReservations(userId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      user_id,
      student_id,
      student_name,
      item_type,
      item_name,
      book_id,
      status,
      start_time,
      end_time,
      created_at,
      books (
        id,
        title,
        author,
        category,
        cover_url
      )
    `)
    .eq('user_id', userId)
    .eq('item_type', 'book')
    .eq('status', 'Reserved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching book reservations:', error);
    throw error;
  }

  return data ?? [];
}

// Edit book reservation dates

export async function updateBookReservation(
  reservationId: string,
  pickupDate: string,
  returnDate: string
) {
  const { data, error } = await supabase
    .from('reservations')
    .update({
      start_time: pickupDate,
      end_time: returnDate,
    })
    .eq('id', reservationId)
    .eq('item_type', 'book')
    .eq('status', 'Reserved')
    .select()
    .single();

  if (error) {
    console.error('Error updating book reservation:', error);
    throw error;
  }

  return data;
}

// Get one book reservation by reservation ID

export async function getBookReservationById(
  reservationId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      user_id,
      student_id,
      student_name,
      item_type,
      item_name,
      book_id,
      status,
      start_time,
      end_time,
      created_at,
      books (
        id,
        title,
        author,
        isbn,
        category,
        cover_url
      )
    `)
    .eq('id', reservationId)
    .eq('user_id', userId)
    .eq('item_type', 'book')
    .single();

  if (error) {
    console.error('Error fetching reservation details:', error);
    throw error;
  }

  return data;
}

// Cancel book reservation

export async function cancelBookReservation(
  reservationId: string,
  userId: string
) {
  const { error } = await supabase.rpc(
    'cancel_book_reservation',
    {
      p_reservation_id: reservationId,
      p_user_id: userId,
    }
  );

  if (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
}

// Get logged-in student's previous book reservations

export async function getPreviousBookReservations(userId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      user_id,
      student_id,
      student_name,
      item_type,
      item_name,
      book_id,
      status,
      start_time,
      end_time,
      created_at,
      books (
        id,
        title,
        author,
        category,
        cover_url
      )
    `)
    .eq('user_id', userId)
    .eq('item_type', 'book')
    .in('status', ['Cancelled', 'Returned'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error(
      'Error fetching previous book reservations:',
      error
    );
    throw error;
  }

  return data ?? [];
}