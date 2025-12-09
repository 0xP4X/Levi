
import { StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    height: 70,
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    borderTopWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  profileBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  calendarButton: {
    padding: 8,
    backgroundColor: Colors.surfaceBackground,
    borderRadius: 8,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
