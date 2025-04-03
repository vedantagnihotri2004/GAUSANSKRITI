from django.db import models
from farmers.models import Farmer

class CowBreed(models.Model):
    """Model for different indigenous cow breeds"""
    name = models.CharField(max_length=100)
    origin = models.CharField(max_length=200)
    description = models.TextField()
    characteristics = models.TextField()
    image = models.ImageField(upload_to='breed_images/', null=True, blank=True)
    
    def __str__(self):
        return self.name

class Cow(models.Model):
    """Model for individual cows"""
    name = models.CharField(max_length=100)
    breed = models.ForeignKey(CowBreed, on_delete=models.CASCADE, related_name='cows')
    owner = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='cows')
    date_of_birth = models.DateField()
    weight = models.FloatField(help_text="Weight in kg")
    height = models.FloatField(help_text="Height in cm")
    color = models.CharField(max_length=50)
    milk_production = models.FloatField(help_text="Daily milk production in liters", null=True, blank=True)
    is_pregnant = models.BooleanField(default=False)
    image = models.ImageField(upload_to='cow_images/', null=True, blank=True)
    registration_number = models.CharField(max_length=100, unique=True)
    pure_breed_percentage = models.FloatField(default=100.0, help_text="Percentage of pure breeding")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.breed.name}"

class CowHealth(models.Model):
    """Model for tracking cow health records"""
    cow = models.ForeignKey(Cow, on_delete=models.CASCADE, related_name='health_records')
    date = models.DateField()
    temperature = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    body_condition_score = models.FloatField(null=True, blank=True, help_text="Score from 1-5")
    symptoms = models.TextField(null=True, blank=True)
    diagnosis = models.TextField(null=True, blank=True)
    treatment = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"Health record for {self.cow.name} on {self.date}"

class Vaccination(models.Model):
    """Model for cow vaccinations"""
    cow = models.ForeignKey(Cow, on_delete=models.CASCADE, related_name='vaccinations')
    name = models.CharField(max_length=100)
    date_administered = models.DateField()
    next_due_date = models.DateField()
    administered_by = models.CharField(max_length=100)
    notes = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} for {self.cow.name} on {self.date_administered}"

class MilkProduction(models.Model):
    """Model for tracking milk production"""
    cow = models.ForeignKey(Cow, on_delete=models.CASCADE, related_name='milk_records')
    date = models.DateField()
    morning_amount = models.FloatField(help_text="Liters of milk in morning")
    evening_amount = models.FloatField(help_text="Liters of milk in evening")
    fat_content = models.FloatField(null=True, blank=True)
    
    @property
    def total_amount(self):
        return self.morning_amount + self.evening_amount
    
    def __str__(self):
        return f"Milk record for {self.cow.name} on {self.date}"
