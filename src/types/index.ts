export interface ServiceProvider {
    id: string;
    name: string;
    service: string;
    rating: number;
    distance: number; // in kilometers
    latitude: number;
    longitude: number;
    isAvailable: boolean;
    avatar: string;
    hourlyRate: number;
    completedJobs: number;
    phone?: string;
    isServiceProvider?: boolean;
}

export interface Booking {
    id: string;
    serviceProviderId: string;
    serviceProviderName: string;
    serviceType: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
    price: number;
    avatar?: string;
    clientId?: string;
    clientName?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    isServiceProvider: boolean;
    serviceProviderProfile?: {
        service: string;
        hourlyRate: number;
        isAvailable: boolean;
        rating: number;
        completedJobs: number;
    };
}
