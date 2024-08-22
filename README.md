# User Upload Script

This script processes a CSV file to upload user data into a MySQL database. It supports creating or rebuilding the database table, running in dry-run mode, and inserting user data from a CSV file.

## Table of Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Commands](#commands)
- [Examples](#examples)
- [Notes](#notes)

## Requirements

- Node.js
- MySQL
- Required Node.js modules: `mysql2`, `csv-parser`, `yargs`

## Setup

1. **Install Dependencies**

   Run the following command to install the required Node.js modules:

   ```bash
   npm install mysql2 csv-parser yargs
   ```

## Usage

To run the script, use the command-line interface with the following options:

### Options

- `--file`, `-f`: Path to the CSV file (required for data processing).
- `--create_table`: Create or rebuild the `users` table in the database.
- `--dry_run`: Parse the CSV without inserting data into the database.
- `--u`: MySQL username (required).
- `--p`: MySQL password (required).
- `--h`: MySQL host (default: `localhost`).
- `--port`: MySQL port (default: `3306`).

## Commands

### 1. Create or Rebuild the Users Table

This command creates or rebuilds the `users` table in the MySQL database. If the table already exists, it will be replaced.

```bash
node user_upload.js --create_table -u <username> -p <password> -h <host> --port <port>
```

### 2. Process CSV File (Dry Run Mode)

This command parses the CSV file and logs the results without inserting them into the database.

```bash
node user_upload.js --file <path-to-csv-file> --dry_run -u <username> -p <password> -h <host> --port <port>
```

### 3. Process CSV File (Insert Data)

This command parses the CSV file and inserts the data into the `users` table.

```bash
node user_upload.js --file <path-to-csv-file> -u <username> -p <password> -h <host> --port <port>
```

### 4. Connect to MySQL and Verify Data

You can manually connect to the MySQL database and verify that the data was inserted correctly:

```bash
mysql -u <username> -p -P <port> -h <host>
USE user_upload_db;
SELECT * FROM users;
```

## Examples

1. **Create or Rebuild the Table**

   ```bash
   node user_upload.js --create_table -u root -p Arera2016# -h localhost --port 3306
   ```

2. **Dry Run Mode**

   ```bash
   node user_upload.js --file users.csv --dry_run -u root -p Arera2016# -h localhost --port 3306
   ```

3. **Insert Data**

   ```bash
   node user_upload.js --file users.csv -u root -p Arera2016# -h localhost --port 3306
   ```

## Notes

- **CSV File Format**: The CSV file should contain columns for `name`, `surname`, and `email`. Ensure the CSV file headers match these names.
- **Error Handling**: The script logs errors if they occur during CSV parsing or database operations.
- **Email Validation**: The script validates email formats using a regular expression to ensure they are correctly formatted.
- **Dry Run Mode**: When using dry run mode, no data is inserted into the database; it only logs the processed data.

