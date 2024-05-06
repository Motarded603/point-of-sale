# Electron Point-of-Sale System with React and MariaDB

## Description
This project is a simple point-of-sale system built using Electron for the frontend, React for the user interface, and MariaDB for database management.

## Installation
1. Clone the repository: `git clone https://github.com/Motarded603/point-of-sale.git`
2. Install dependencies: `npm install`
3. Install yarn and concurrently if not already installed: `npm install -g yarn concurrently`
4. Configure the database file by creating the following file: `point-of-sale/public/config.json`

## Template config.json
```json
{
    "database": {
        "host": "[host address]",
        "user": "[user]",
        "password": "[password]",
        "database": "[database]"
    }
}
```

## Dependencies
**Note:**
You will require a separate MariaDB SQL Server. These modules are also required to be installed:
- electron
- path
- url
- serialport
- express
- cors
- mariadb
- uuid
- react
- react-dom
- react-scripts
- create-react-app

## Run
Start the application: `yarn electron:start`


## Acknowledgements
- [Electron](https://electronjs.org/)
- [React](https://reactjs.org/)
- [MariaDB](https://mariadb.org/)
