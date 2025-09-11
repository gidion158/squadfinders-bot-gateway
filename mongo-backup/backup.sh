#!/bin/bash

# Define backup directory and filename
BACKUP_DIR="/data/backup/players_$(date +\%Y\%m\%d)"
BACKUP_FILE="$BACKUP_DIR.tar.gz"

# Create backup using mongodump
docker exec -it finder-mongo mongodump --host localhost --port 27017 --username admin --password 'R0XP2UBw75muBr39' --authenticationDatabase admin --db players --out $BACKUP_DIR

# Check if the backup directory was created
if [ -d "$BACKUP_DIR" ]; then
    echo "Backup directory created: $BACKUP_DIR"

    # Compress the backup directory to a tar.gz file
    tar -czf $BACKUP_FILE -C /data/backup $(basename $BACKUP_DIR)

    # Check if compression was successful
    if [ -f "$BACKUP_FILE" ]; then
        echo "Backup compressed to: $BACKUP_FILE"

        # Delete the original backup directory
        rm -rf $BACKUP_DIR
        echo "Original backup directory removed."
    else
        echo "Compression failed."
    fi
else
    echo "Backup directory not created. Check the mongodump command."
fi

