# BREAD(Browse, Read, Edit, Add, Delete) With PostgreSql

## Getting Started

These instructions will help you set up the project on your local machine for development and testing. Refer to the deployment section for details on deploying the project to a live environment.

### Prerequisites
Before running this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later) - JavaScript runtime environment.
- [Postgre4](https://www.PgAdmin.com/) - Sql database.
- [Git](https://git-scm.com/) - Version control system.

### installing

Clone the repository:

- http : <pre> https://github.com/ramdaniprnm/challange-21.git </pre>

OR
 
- SSH : <pre> git@github.com:ramdaniprnm/challange-21.git </pre>

install depedencies:
<pre> npm install </pre>

Configure environment variables:

Create a .env file in the root directory and add

<pre> DATABASES_URI=<your-Pgadmin4-uri>
DB_NAME=<database-name>
USERS_TABLES=<tables-name-for-users>
TODOS_TABLES=<tables-name-for-todos>
</pre>


### Check Version

To check if Node.js is installed, run:

- Bash/Zsh
<pre> node -v </pre>

### Usage

To start the application in development mode:

<pre> npm run dev </pre>

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

