import { ServiceProvider, Booking, UserProfile } from '../types';

// API Configuration
const API_BASE_URL = __DEV__
    ? 'http://localhost:8000/api'
    : 'https://your-production-api.com/api';

// Token storage
let authToken: string | null = null;
let refreshToken: string | null = null;

// Helper function to get auth headers
const getAuthHeaders = () => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
};

// Helper function for API calls
const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Network error occurred');
    }
};

// Authentication
export const auth = {
    async login(email: string, password: string): Promise<{ user: any; token: string }> {
        const response = await apiCall<{ user: any; token: string }>('/users/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.token) {
            authToken = response.token;
            // Store token in AsyncStorage in a real app
        }

        return response;
    },

    async register(userData: {
        username: string;
        email: string;
        password: string;
        confirm_password: string;
        first_name?: string;
        last_name?: string;
        phone_number?: string;
        is_provider?: boolean;
    }): Promise<{ user: any; token: string }> {
        const response = await apiCall<{ user: any; token: string }>('/users/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        if (response.token) {
            authToken = response.token;
        }

        return response;
    },

    async logout(): Promise<void> {
        authToken = null;
        refreshToken = null;
        // Clear AsyncStorage in a real app
    },

    setToken(token: string): void {
        authToken = token;
    },

    getToken(): string | null {
        return authToken;
    },
};

// Transform backend Service to frontend ServiceProvider
const transformServiceToProvider = (service: any, user: any): ServiceProvider => {
    // Calculate distance (mock for now, would use real location in production)
    const distance = Math.random() * 20 + 1; // 1-21 km

    return {
        id: service.id.toString(),
        name: service.provider_name || user?.get_full_name || 'Unknown',
        service: service.category_name || service.title,
        rating: service.average_rating || 4.5,
        distance: distance,
        latitude: 0,
        longitude: 0,
        isAvailable: service.is_available,
        avatar: user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider_name)}`,
        hourlyRate: parseFloat(service.price) || 50,
        completedJobs: service.review_count || 0,
        phone: user?.phone_number,
        isServiceProvider: true,
    };
};

// Transform backend Booking to frontend Booking
const transformBooking = (booking: any): Booking => {
    const startDate = new Date(booking.start_time);

    return {
        id: booking.id.toString(),
        serviceProviderId: booking.provider?.toString() || booking.provider_name,
        serviceProviderName: booking.provider_name || 'Unknown',
        serviceType: booking.service_title || 'Service',
        date: startDate.toLocaleDateString(),
        time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: booking.status as Booking['status'],
        price: parseFloat(booking.price) || 0,
        avatar: booking.provider?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.provider_name)}`,
        clientId: booking.client?.toString(),
        clientName: booking.client_name,
    };
};

class ApiService {
    // --- Providers/Services ---

    async getProviders(query: string = '', sortBy: 'distance' | 'rating' | 'price' = 'distance'): Promise<ServiceProvider[]> {
        try {
            const params = new URLSearchParams();
            if (query) params.append('search', query);
            if (sortBy) params.append('ordering', sortBy === 'distance' ? 'id' : sortBy);

            const services = await apiCall<any[]>(`/services/services/?${params.toString()}`);
            return services.map(service => transformServiceToProvider(service, null));
        } catch (error) {
            console.warn("API Error: fetching providers. Falling back to mock data.");
            await new Promise(resolve => setTimeout(resolve, 500));

            let results = [...this.MOCK_PROVIDERS];
            if (query) {
                const q = query.toLowerCase();
                results = results.filter(p => p.name.toLowerCase().includes(q) || p.service.toLowerCase().includes(q));
            }
            if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
            if (sortBy === 'price') results.sort((a, b) => a.hourlyRate - b.hourlyRate);
            // Default/distance sort - simplified
            return results;
        }
    }

    async getProviderById(id: string): Promise<ServiceProvider | undefined> {
        const service = await apiCall<any>(`/services/services/${id}/`);
        return transformServiceToProvider(service, null);
    }

    // --- Bookings ---

    async getUserBookings(status: 'all' | 'pending' | 'confirmed' | 'completed' = 'all'): Promise<Booking[]> {
        const params = new URLSearchParams();
        if (status !== 'all') {
            params.append('status', status);
        }

        const bookings = await apiCall<any[]>(`/bookings/bookings/?${params.toString()}`);
        return bookings.map(transformBooking);
    }

    async createBooking(
        providerId: string,
        date: string,
        time: string,
        notes: string,
        serviceId?: string
    ): Promise<Booking> {
        // Parse date and time into datetime
        const [month, day, year] = date.split('/');
        const [hours, minutes] = time.split(':');
        const startTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour default

        const bookingData = {
            provider: parseInt(providerId),
            service: serviceId ? parseInt(serviceId) : null,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration: 60, // minutes
            price: 0, // Will be calculated from service
            location_type: 'in_person',
            address: '',
            special_requests: notes,
        };

        const booking = await apiCall<any>('/bookings/bookings/', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });

        return transformBooking(booking);
    }

    async cancelBooking(bookingId: string): Promise<void> {
        await apiCall(`/bookings/bookings/${bookingId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'cancelled' }),
        });
    }

    async rescheduleBooking(bookingId: string, newDate: string, newTime: string): Promise<Booking> {
        const [month, day, year] = newDate.split('/');
        const [hours, minutes] = newTime.split(':');
        const startTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        const booking = await apiCall<any>(`/bookings/bookings/${bookingId}/`, {
            method: 'PATCH',
            body: JSON.stringify({
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
            }),
        });

        return transformBooking(booking);
    }

    async updateBookingStatus(bookingId: string, status: string, reason: string = ''): Promise<Booking> {
        const booking = await apiCall<any>(`/bookings/bookings/${bookingId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status, reason }),
        });

        return transformBooking(booking);
    }
    // Note: Backend doesn't have favorites model, so we'll use a simple approach
    // In production, you'd create a Favorite model in backend

    async getFavorites(): Promise<ServiceProvider[]> {
        // For now, return empty array - would need backend implementation
        // This could be stored locally or in backend
        return [];
    }

    async toggleFavorite(providerId: string): Promise<boolean> {
        // For now, just return - would need backend implementation
        return true;
    }

    // --- Mock Data Constants ---

    private readonly MOCK_USER: UserProfile = {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '+1 555 123 4567',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
        isServiceProvider: false,
    };

    private readonly MOCK_PROVIDERS: ServiceProvider[] = [
        {
            id: '1',
            name: 'John Doe',
            service: 'Plumber',
            rating: 4.8,
            distance: 2.5,
            latitude: 37.7749,
            longitude: -122.4194,
            isAvailable: true,
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
            hourlyRate: 80,
            completedJobs: 120,
            phone: '555-0101',
            isServiceProvider: true,
        },
        {
            id: '2',
            name: 'Jane Smith',
            service: 'Electrician',
            rating: 4.9,
            distance: 5.0,
            latitude: 37.7849,
            longitude: -122.4094,
            isAvailable: true,
            avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
            hourlyRate: 95,
            completedJobs: 85,
            phone: '555-0102',
            isServiceProvider: true,
        },
        {
            id: '3',
            name: 'Mike Johnson',
            service: 'Carpenter',
            rating: 4.7,
            distance: 3.2,
            latitude: 37.7649,
            longitude: -122.4294,
            isAvailable: false,
            avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=random',
            hourlyRate: 70,
            completedJobs: 45,
            phone: '555-0103',
            isServiceProvider: true,
        }
    ];

    // --- User Profile ---

    async getUserProfile(): Promise<UserProfile> {
        try {
            const profile = await apiCall<any>('/users/profile/');
            const user = profile.user;
            return {
                id: user.id.toString(),
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
                email: user.email,
                phone: user.phone_number || '',
                avatar: user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`,
                isServiceProvider: user.is_provider || false,
            };
        } catch (error) {
            console.warn("API Error: fetching user profile. Falling back to mock data.");
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.MOCK_USER;
        }
    }

    async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
        const profileData: any = {};

        if (updates.name) {
            const nameParts = updates.name.split(' ');
            profileData.first_name = nameParts[0] || '';
            profileData.last_name = nameParts.slice(1).join(' ') || '';
        }
        if (updates.phone) profileData.phone_number = updates.phone;
        if (updates.email) profileData.email = updates.email;

        const updated = await apiCall<any>('/users/profile/', {
            method: 'PATCH',
            body: JSON.stringify(profileData),
        });

        return this.getUserProfile();
    }

    async uploadProfilePicture(imageUri: string): Promise<string> {
        // Create FormData for file upload
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('profile_picture', {
            uri: imageUri,
            name: filename,
            type,
        } as any);

        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.user?.profile_picture || imageUri;
    }

    // --- Categories ---

    async getCategories(): Promise<any[]> {
        return apiCall<any[]>('/services/categories/');
    }

    // --- Share functionality ---

    async shareProvider(providerId: string, method: 'sms' | 'email' | 'link'): Promise<void> {
        // In a real app, this would integrate with native sharing
        // For now, we'll just return success
        return Promise.resolve();
    }
}

export const api = new ApiService();

