// Required dependencies ie mysql2, csv-parse, yargs
const fs = require('fs');
const path = require('path'); 
const csv = require('csv-parser');  
const mysql = require('mysql2/promise'); 
const yargs = require('yargs');


/*
- This section uses yargs to parse command-line arguments.
- It allows users to specify the CSV file to be processed, 
- create the database table, run the script in dry-run mode,
- and provide MySQL connection details (username, password, host, port). 
- Each option is defined with a description, type, and whether it’s required. 
*/
const argv = yargs
  .option('file', {
    alias: 'f',
    description: 'Path to the CSV file',
    type: 'string',
  })
  .option('create_table', {
    description: 'Create or rebuild the users table',
    type: 'boolean',
  })
  .option('dry_run', {
    description: 'Parse the CSV without inserting data into the DB',
    type: 'boolean',
  })
  .option('u', {
    description: 'MySQL username',
    type: 'string',
    demandOption: true,
  })
  .option('p', {
    description: 'MySQL password',
    type: 'string',
    demandOption: true,
  })
  .option('h', {
    description: 'MySQL host',
    type: 'string',
    default: 'localhost',
  })
  .option('port', {
    description: 'MySQL port',
    type: 'number',
    default: 3306,
  })
  .argv;



/*
- This function establishes a connection to the MySQL database using the mysql2/promise library.
- The connection parameters are taken from the command-line arguments (host, port, username, password).
- The database name is hardcoded as 'user_upload_db'.
*/ 
const connectToDatabase = async () => {
    try {
      const connection = await mysql.createConnection({
        host: argv.h,
        port: argv.port,
        user: argv.u,
        password: argv.p,
        database: 'user_upload_db',
      });
      return connection;
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
      process.exit(1);
    }
};



/*
- This function creates or rebuilds the users table in the MySQL database. 
- The table has three columns: name, surname, and email. 
- The email column is set to be unique to prevent duplicate entries. 
- The table is created only if it doesn't already exist.
*/ 
const createUsersTable = async (connection) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        surname VARCHAR(255),
        email VARCHAR(255) UNIQUE
      );
    `;
    try {
      await connection.query(createTableQuery);
      console.log('Users table created/rebuilt successfully.');
    } catch (error) {
      console.error('Error creating table:', error.message);
    }
};


/*
- This function processes the CSV file, parsing each row into an object containing name, surname, and email.
- The name and surname are capitalized, and the email is converted to lowercase. 
- The script validates the email format using a regular expression;
- if valid, the data is stored in the results array. 
- If the dry_run option is active, the script simply logs the results without inserting them into the database.
*/ 
const processCSVFile = async (connection, dryRun) => {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname, argv.file))
          .pipe(csv())
          .on('data', (data) => {
            const name = capitalize(data.name);
            const surname = capitalize(data.surname);
            const email = data.email.toLowerCase();
      
            if (validateEmail(email)) {
              results.push({ name, surname, email });
            } else {
              console.error(`Invalid email format: ${email}`);
            }
          })
          .on('end', async () => {
            if (dryRun) {
              console.log('Dry run mode: No data inserted into the database.');
              console.log(results);
            } else {
              try {
                await insertDataIntoDB(connection, results);
              } catch (error) {
                console.error('Error during data insertion:', error.message);
              }
            }
            resolve();
          })
          .on('error', (error) => {
            console.error('Error reading the CSV file:', error.message);
            reject(error);
          });
    });
};


/*
- This helper function capitalizes the first letter of a string and converts the rest of the string to lowercase.
*/ 
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};


/*
- This function checks whether an email is in a valid format using a regular expression. 
- If the email is valid, it returns true; otherwise, it returns false.
*/ 
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.split('@')[1].includes('.');
};


/*
- This function inserts the processed user data into the users table in the database. 
- It uses prepared statements to safely insert each user's name, surname, and email.
- If there’s an error (e.g., due to a duplicate email), the error is logged.
*/ 
const insertDataIntoDB = async (connection, users) => {
    const insertQuery = 'INSERT INTO users (name, surname, email) VALUES (?, ?, ?)';
    for (const user of users) {
      try {
        await connection.execute(insertQuery, [user.name, user.surname, user.email]);
      } catch (error) {
        console.error(`Error inserting user: ${user.email}.`, error.message);
      }
    }
    console.log('Data inserted successfully.');
};


/*
- This is the main entry point of the script.
- It first connects to the MySQL database, then checks if the create_table command-line argument is provided.
- If so, it creates or rebuilds the users table. If the file argument is provided,
- it processes the CSV file (with optional dry-run mode). 
- Finally, it closes the database connection.
*/ 
(async function main() {
    const connection = await connectToDatabase();
  
    try {
      if (argv.create_table) {
        await createUsersTable(connection);
      } else if (argv.file) {
        await processCSVFile(connection, argv.dry_run);
      } else {
        console.log('Please provide the necessary command-line arguments. Use --help for more information.');
      }
    } finally {
      await connection.end();
    }
})();










// node user_upload.js --create_table -u root -p Arera2016# -h localhost --port 3306
// node user_upload.js --file users.csv --dry_run -u root -p Arera2016# -h localhost --port 3306
// node user_upload.js --file users.csv -u root -p Arera2016# -h localhost --port 3306
// USE user_upload_db;
// SELECT * FROM users;



// Set up password in MySQL in Ubuntu
/*
- sudo apt update
- sudo apt install mysql-server
- sudo mysql_secure_installation
- sudo mysql
- mysql -u root -p
- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_new_password';FLUSH PRIVILEGES;
- EXIT;
*/ 


// npm init -y
// npm install mysql2 yargs fs csv-parser