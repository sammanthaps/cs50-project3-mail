from django.contrib import admin
from .models import User, Email
# Register your models here.

@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ('sender', 'subject', 'body')

admin.site.register(User)
