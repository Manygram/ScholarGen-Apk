import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { apiClient } from '../services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';

const NotificationScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
      try {
          const response = await apiClient.get('/notifications');
          if (response.data) {
              setNotifications(response.data.data || []);
          }
      } catch (error) {
          console.log('Error fetching notifications:', error);
      } finally {
          setLoading(false);
      }
  };

  const markAllRead = async () => {
      try {
          await apiClient.put('/notifications/all/read');
          // Optimistically update UI
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
          console.log('Error marking all read:', error);
      }
  };

  useEffect(() => {
      fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      {/* Header */}
      <CommonHeader 
        title="Notifications" 
        showBack={true} 
        rightComponent={
          <TouchableOpacity activeOpacity={0.8} onPress={markAllRead}>
            <Text style={[styles.markAllRead, { color: theme.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              { 
                backgroundColor: notification.isRead ? theme.background : theme.card,
                borderBottomColor: theme.border 
              }
            ]}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: (notification.type === 'success' ? '#10B981' : '#6366F1') + '15' }]}>
              <Ionicons 
                name={notification.type === 'success' ? 'checkmark-circle' : 'information-circle'} 
                size={20} 
                color={notification.type === 'success' ? '#10B981' : '#6366F1'} 
              />
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: theme.text }]}>{notification.title}</Text>
                {!notification.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
                {notification.message}
              </Text>
              <Text style={[styles.time, { color: theme.textSecondary }]}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header styles removed

  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'DMSans-SemiBold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: 'DMSans-Regular',
  },
  time: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
  },
});

export default NotificationScreen;
