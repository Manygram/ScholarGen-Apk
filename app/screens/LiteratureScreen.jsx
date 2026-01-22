import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
    ActivityIndicator,
    TextInput,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = "https://api.scholargens.com/api";

const LiteratureScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                // Attempt to fetch literature books
                const response = await axios.get(`${API_BASE_URL}/literature-texts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data || [];
                // Handle different array structures if necessary (e.g. data.texts)
                const booksData = Array.isArray(data) ? data : (data.texts || []);

                setBooks(booksData);
                setFilteredBooks(booksData);
            } catch (error) {
                console.log("Error fetching literature:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Could not load literature texts.'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text) {
            const filtered = books.filter(book =>
                book.title.toLowerCase().includes(text.toLowerCase()) ||
                book.author.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredBooks(filtered);
        } else {
            setFilteredBooks(books);
        }
    };

    const renderBookItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.bookCard, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('LiteratureDetail', { bookId: item.id, bookTitle: item.title, author: item.author })}
                activeOpacity={0.8}
            >
                <View style={[styles.coverContainer, { backgroundColor: theme.mode === 'dark' ? '#333' : '#E0E7FF' }]}>
                    {/* Placeholder cover if no image */}
                    <Ionicons name="book" size={32} color={theme.primary} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.bookAuthor, { color: theme.textSecondary }]}>by {item.author}</Text>
                    <View style={[styles.genreBadge, { borderColor: theme.border }]}>
                        <Text style={[styles.genreText, { color: theme.textSecondary }]}>{item.category || 'Literature'}</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* Header */}
            <CommonHeader title="Literature Library" showBack={true} />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Search books, authors..."
                        placeholderTextColor={theme.textSecondary}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            {/* Content */}
            <FlatList
                data={filteredBooks}
                renderItem={renderBookItem}
                keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="library-outline" size={48} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No books found.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        borderBottomWidth: 1,
    },
    // backBtn style removed, headerTitle style removed - handled by CommonHeader
    // Note: header style is still declared for the View replacement? 
    // Actually CommonHeader wraps it, so we can remove header style too if we replaced the View.
    // My replacement chunk replaced the View, so I can remove header style.

    // searchContainer: ...

    searchContainer: { paddingHorizontal: 20, paddingVertical: 12 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderRadius: 12,
        paddingHorizontal: 12, height: 48,
    },
    searchInput: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 16 },

    listContent: { padding: 20 },
    bookCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: 12, borderRadius: 16, marginBottom: 12,
    },
    coverContainer: {
        width: 60, height: 80, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16,
    },
    textContainer: { flex: 1 },
    bookTitle: { fontSize: 16, fontFamily: 'DMSans-Bold', marginBottom: 4 },
    bookAuthor: { fontSize: 14, fontFamily: 'DMSans-Medium', marginBottom: 8 },
    genreBadge: {
        alignSelf: 'flex-start', borderWidth: 1,
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6
    },
    genreText: { fontSize: 12, fontFamily: 'DMSans-Regular' },

    emptyContainer: { alignItems: 'center', marginTop: 50, gap: 10 },
    emptyText: { fontFamily: 'DMSans-Medium', fontSize: 16 }
});

export default LiteratureScreen;
