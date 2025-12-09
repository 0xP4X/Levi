import { ServiceProvider, Booking, UserProfile } from '../types';

// Mock service providers around a central location
export const mockServiceProviders: ServiceProvider[] = [
    {
        id: '1',
        name: 'John Martinez',
        service: 'Plumber',
        rating: 4.8,
        distance: 0.5,
        latitude: 37.7849,
        longitude: -122.4094,
        isAvailable: true,
        phone: '+1 555-0101',
        avatar: 'https://i.pravatar.cc/150?img=12',
        hourlyRate: 75,
        completedJobs: 156,
        isServiceProvider: true
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        service: 'Electrician',
        rating: 4.9,
        distance: 1.2,
        latitude: 37.7899,
        longitude: -122.4074,
        isAvailable: true,
        phone: '+1 555-0102',
        avatar: 'https://i.pravatar.cc/150?img=47',
        hourlyRate: 85,
        completedJobs: 203,
        isServiceProvider: true
    },
    {
        id: '3',
        name: 'Mike Chen',
        service: 'Carpenter',
        rating: 4.7,
        distance: 2.1,
        latitude: 37.7819,
        longitude: -122.4134,
        isAvailable: false,
        phone: '+1 555-0103',
        avatar: 'https://i.pravatar.cc/150?img=33',
        hourlyRate: 70,
        completedJobs: 98,
        isServiceProvider: true
    },
    {
        id: '4',
        name: 'Emily Davis',
        service: 'House Cleaner',
        rating: 4.9,
        distance: 0.8,
        latitude: 37.7869,
        longitude: -122.4064,
        isAvailable: true,
        phone: '+1 555-0104',
        avatar: 'https://i.pravatar.cc/150?img=32',
        hourlyRate: 45,
        completedJobs: 312,
        isServiceProvider: true
    },
    {
        id: '5',
        name: 'David Wilson',
        service: 'Painter',
        rating: 4.6,
        distance: 3.5,
        latitude: 37.7789,
        longitude: -122.4154,
        isAvailable: true,
        phone: '+1 555-0105',
        avatar: 'https://i.pravatar.cc/150?img=15',
        hourlyRate: 60,
        completedJobs: 127,
        isServiceProvider: true
    },
    {
        id: '6',
        name: 'Lisa Anderson',
        service: 'Gardener',
        rating: 4.8,
        distance: 1.5,
        latitude: 37.7879,
        longitude: -122.4114,
        isAvailable: false,
        phone: '+1 555-0106',
        avatar: 'https://i.pravatar.cc/150?img=45',
        hourlyRate: 50,
        completedJobs: 89,
        isServiceProvider: true
    },
    {
        id: '7',
        name: 'Robert Taylor',
        service: 'HVAC Technician',
        rating: 4.9,
        distance: 2.8,
        latitude: 37.7829,
        longitude: -122.4044,
        isAvailable: true,
        phone: '+1 555-0107',
        avatar: 'https://i.pravatar.cc/150?img=60',
        hourlyRate: 90,
        completedJobs: 176,
        isServiceProvider: true
    },
    {
        id: '8',
        name: 'Jennifer Lee',
        service: 'Locksmith',
        rating: 4.7,
        distance: 1.9,
        latitude: 37.7859,
        longitude: -122.4124,
        isAvailable: true,
        phone: '+1 555-0108',
        avatar: 'https://i.pravatar.cc/150?img=20',
        hourlyRate: 65,
        completedJobs: 142,
        isServiceProvider: true
    },
];

export const mockBookings: Booking[] = [
    {
        id: '1',
        serviceProviderId: '1',
        serviceProviderName: 'John Martinez',
        serviceType: 'Plumber',
        date: '2025-12-10',
        time: '14:00',
        status: 'confirmed',
        price: 150,
        avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
        id: '2',
        serviceProviderId: '4',
        serviceProviderName: 'Emily Davis',
        serviceType: 'House Cleaner',
        date: '2025-12-12',
        time: '10:00',
        status: 'pending',
        price: 90,
        avatar: 'https://i.pravatar.cc/150?img=32'
    },
    {
        id: '3',
        serviceProviderId: '2',
        serviceProviderName: 'Sarah Johnson',
        serviceType: 'Electrician',
        date: '2025-12-05',
        time: '16:00',
        status: 'completed',
        price: 170,
        avatar: 'https://i.pravatar.cc/150?img=47'
    },
];

export const mockUserProfile: UserProfile = {
    id: 'user1',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://i.pravatar.cc/150?img=68',
    isServiceProvider: false,
};

export const mockFavorites: string[] = ['1', '2', '4'];
