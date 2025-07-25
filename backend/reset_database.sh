#!/bin/bash

# Database Reset Script for JobVector
# This script changes the hibernate.ddl-auto property to reset the database

PROPS_FILE="src/main/resources/application.properties"
BACKUP_FILE="src/main/resources/application.properties.backup"

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

# Function to reset database
reset_database() {
    log "🔄 Resetting database..."
    
    # Create backup
    cp "$PROPS_FILE" "$BACKUP_FILE"
    log "📄 Created backup of application.properties"
    
    # Change to create-drop
    sed -i 's/spring.jpa.hibernate.ddl-auto=update/spring.jpa.hibernate.ddl-auto=create-drop/' "$PROPS_FILE"
    log "📝 Changed ddl-auto to create-drop"
    
    echo "⚠️  Please restart your Spring Boot application now."
    echo "   The database will be dropped and recreated on startup."
    read -p "   Press Enter when the application has started and you see the tables created..."
    
    # Change back to update
    sed -i 's/spring.jpa.hibernate.ddl-auto=create-drop/spring.jpa.hibernate.ddl-auto=update/' "$PROPS_FILE"
    log "📝 Changed ddl-auto back to update"
    
    echo "⚠️  Please restart your Spring Boot application one more time."
    read -p "   Press Enter when the application is running again..."
    
    log "✅ Database reset completed!"
}

# Function to restore original settings
restore_backup() {
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$PROPS_FILE"
        rm "$BACKUP_FILE"
        log "✅ Restored original application.properties"
    else
        log "❌ No backup file found"
    fi
}

# Main menu
echo "JobVector Database Reset Tool"
echo "============================"
echo "1. Reset database (create-drop and back to update)"
echo "2. Restore backup"
echo "3. Exit"

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        reset_database
        ;;
    2)
        restore_backup
        ;;
    3)
        echo "Goodbye!"
        ;;
    *)
        echo "Invalid choice!"
        ;;
esac
