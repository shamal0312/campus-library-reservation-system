import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    Book,
    getBookById,
} from '../../../services/bookService';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBook() {
      if (!id) {
        setError('Book ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await getBookById(id);
        setBook(data);
      } catch (err) {
        console.error(err);
        setError('Could not load book details.');
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading book...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.center}>
        <Text>{error || 'Book not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {book.cover_url ? (
        <Image
          source={{ uri: book.cover_url }}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text>No Cover Image</Text>
        </View>
      )}

      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>by {book.author}</Text>

      <View style={styles.details}>
        <Text>Category: {book.category ?? 'N/A'}</Text>
        <Text>ISBN: {book.isbn ?? 'N/A'}</Text>
        <Text>
          Published Year: {book.published_year ?? 'N/A'}
        </Text>
        <Text>Status: {book.status}</Text>
        <Text>Available Copies: {book.available_copies}</Text>
        <Text>Total Copies: {book.total_copies}</Text>
      </View>

      <Text style={styles.heading}>Description</Text>

      <Text style={styles.description}>
        {book.description ?? 'No description available.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 10,
  },

  cover: {
    width: 180,
    height: 260,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },

  coverPlaceholder: {
    width: 180,
    height: 260,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  author: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },

  details: {
    gap: 10,
    marginBottom: 24,
  },

  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});