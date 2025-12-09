
import os
import django
import random

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'levi_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import UserProfile
from services.models import Category, Service, ServiceImage, Availability

User = get_user_model()

def seed_data():
    try:
        print("Beginning database seeding...")

        # 1. Create Categories
        print("Creating Categories...")
        categories = [
            ('Plumbing', 'Plumbing services including repairs and installations', 'water-outline'),
            ('Electrical', 'Electrical repairs, wiring, and safety inspections', 'flash-outline'),
            ('House Cleaning', 'Standard and deep cleaning for homes', 'sparkles-outline'),
            ('Gardening', 'Lawn care, landscaping, and gardening', 'leaf-outline'),
            ('Moving', 'Help with moving boxes and furniture', 'car-outline'),
            ('Painting', 'Interior and external painting', 'color-palette-outline'),
            ('Carpentry', 'Woodwork, repairs, and custom furniture', 'construct-outline'),
            ('HVAC', 'Heating, Ventilation, and Air Conditioning services', 'thermometer-outline'),
        ]
        
        cat_objs = {}
        for name, desc, icon in categories:
            try:
                cat, created = Category.objects.get_or_create(
                    name=name,
                    defaults={'description': desc, 'icon': icon}
                )
                cat_objs[name] = cat
                print(f"  Processed category: {name}")
            except Exception as e:
                print(f"  Error creating category {name}: {e}")

        # 2. Create Providers
        print("\nCreating Service Providers...")
        providers_data = [
            {
                'username': 'john_plumber',
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'phone': '+15550011001',
                'category': 'Plumbing',
                'service_title': 'Expert Plumbing Services',
                'price': 85.00,
            },
            {
                'username': 'jane_electric',
                'email': 'jane@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'phone': '+15550011002',
                'category': 'Electrical',
                'service_title': 'Licensed Electrician',
                'price': 95.00,
            },
            {
                'username': 'mike_gardener',
                'email': 'mike@example.com',
                'first_name': 'Mike',
                'last_name': 'Green',
                'phone': '+15550011003',
                'category': 'Gardening',
                'service_title': 'Green Thumb Gardening',
                'price': 60.00,
            },
            {
                'username': 'sarah_cleaner',
                'email': 'sarah@example.com',
                'first_name': 'Sarah',
                'last_name': 'Clean',
                'phone': '+15550011004',
                'category': 'House Cleaning',
                'service_title': 'Spotless Home Cleaning',
                'price': 45.00,
            }
        ]

        for p_data in providers_data:
            try:
                # check if user exists by username or email to avoid duplicates
                if User.objects.filter(email=p_data['email']).exists():
                    user = User.objects.get(email=p_data['email'])
                    print(f"  User {user.email} already exists.")
                else:
                    user = User.objects.create_user(
                        username=p_data['username'],
                        email=p_data['email'],
                        password='password123',
                        first_name=p_data['first_name'],
                        last_name=p_data['last_name'],
                        phone_number=p_data['phone'],
                        is_provider=True
                    )
                    print(f"  Created provider user: {user.username}")
                
                    # Create Profile
                    UserProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            'bio': f"Experienced professional in {p_data['category']}.",
                            'location': "San Francisco, CA"
                        }
                    )
                    
                    # Create Service
                    cat = cat_objs.get(p_data['category'])
                    if cat:
                        Service.objects.get_or_create(
                            provider=user,
                            title=p_data['service_title'],
                            defaults={
                                'category': cat,
                                'description': f"Professional {p_data['category']} services. Quality guaranteed.",
                                'price': p_data['price'],
                                'duration': 60,
                                'location_type': 'in_person',
                                'service_area': 'San Francisco Bay Area'
                            }
                        )
                        print(f"  -> Created service: {p_data['service_title']}")
            except Exception as e:
                import traceback
                traceback.print_exc()
                print(f"  Error processing provider {p_data['username']}: {e}")

        # 3. Create Regular User
        print("\nCreating Regular User...")
        try:
            if User.objects.filter(email='demo@example.com').exists():
                 print("  Demo user already exists.")
            else:
                regular_user = User.objects.create_user(
                    username='demo_user',
                    email='demo@example.com',
                    password='password123',
                    first_name='Demo',
                    last_name='User',
                    phone_number='+15559998888'
                )
                UserProfile.objects.get_or_create(user=regular_user, defaults={'location': "San Francisco, CA"})
                print(f"  Created demo user: {regular_user.username}")
        except Exception as e:
            print(f"  Error creating regular user: {e}")

        print("\nDatabase seeding completed!")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Critical seeding error: {e}")

if __name__ == "__main__":
    seed_data()
