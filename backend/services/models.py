from django.db import models
from users.models import User

class Category(models.Model):
    """
    Service category model
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

class Service(models.Model):
    """
    Service listing model
    """
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='services')
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    location_type = models.CharField(
        max_length=20,
        choices=[
            ('in_person', 'In Person'),
            ('online', 'Online'),
            ('both', 'Both')
        ],
        default='both'
    )
    service_area = models.CharField(max_length=200, blank=True, help_text="Service area for in-person services")
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class ServiceImage(models.Model):
    """
    Service images model
    """
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='service_images/')
    is_primary = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Image for {self.service.title}'

    class Meta:
        ordering = ['created_at']

class Availability(models.Model):
    """
    Service availability model
    """
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.IntegerField(choices=[
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday')
    ])
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['service', 'day_of_week', 'start_time', 'end_time']
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f'{self.get_day_of_week_display()} {self.start_time}-{self.end_time}'