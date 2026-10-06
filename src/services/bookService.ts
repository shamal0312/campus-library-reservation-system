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