# Web Application Development
This is a repository made for the purposes of the project on the Web application development course since this project is done in teams. The main goal was to create a web application on which users can play quizzes using Angular, typescript, HTML and SCSS. Instructions for the use of the application are written below. If you want to test the application and its features here is the log in data you should use. 
## Admin
Username: admin
Password: Admin123

## Manager
Username: manager
Password: Manager123

## Verified user
Username: verified
Password: Verified123

## Standard user
Username: standard
Password: Standard123

#### Install Angular (v20) tools
```bash
npm install -g @angular/cli@20
```
NOTE: from some reasons, it is not recommended to install Angular tools (as `ng`) locally (i.e. among the project files). Global installation (`-g` option) may require administrative rights to the system. On Mac and Linuxes, you should precede the command with `sudo`.

##### Install dependecies for both frontend and backend
```bash
npm install && npm --prefix frontend install
```
##### Configure to your needs (changing default settings)
Copy `.env-example` to `.env` and customize the second file if needed.

##### Run both parts of Webapp using development servers
```bash
npm run dev
```
in the second terminal
```bash
cd frontend
npm run dev
```

##### To reinitialize databases
* stop the backend
* simply remove `./db/*.sqlite3` files (all or selected)
* start the backend

