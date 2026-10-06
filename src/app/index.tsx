import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  Book,
  getBooks,
  searchBooks,
} from '../services/bookService';

export default function HomeScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      setLoading(true);
      setError('');

      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
      setError('Could not load books.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(text: string) {
    setSearchText(text);

    try {
      setError('');

      const data = await searchBooks(text);
      setBooks(data);
    } catch (err) {
      console.error(err);
      setError('Could not search books.');
    }
  }

  function openBookDetails(bookId: string) {
    router.push({
      pathname: '/(student)/book/[id]',
      params: { id: bookId },
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Books</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search title, author, ISBN or category"
        value={searchText}
        onChangeText={handleSearch}
        autoCapitalize="none"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No books found.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.book}
            onPress={() => openBookDetails(item.id)}
          >
            <Text style={styles.bookTitle}>{item.title}</Text>

            <Text>{item.author}</Text>

            <Text>
              Category: {item.category ?? 'N/A'}
            </Text>

            <Text>
              Available: {item.available_copies}
            </Text>

            <Text style={styles.viewDetails}>
              Tap to view details
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },

  book: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },

  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  viewDetails: {
    marginTop: 10,
    fontWeight: '600',
  },

  error: {
    marginBottom: 12,
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
  },
});