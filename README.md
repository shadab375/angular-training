# TaskMaster Pro Todo App

This is an Angular-based Todo application that uses JSON Server as a backend.

## Setup and Installation

1. Install dependencies:
```
npm install
```

2. JSON Server has already been installed globally:
```
npm install -g json-server
```

## Running the Application

1. Start JSON Server (in one terminal):
```
json-server --watch db.json
```

This will start the API server at http://localhost:3000/tasks

2. Start the Angular application (in another terminal):
```
ng serve
```

This will start the Angular app at http://localhost:4200

## Features

- Add, edit, and delete tasks
- Mark tasks as completed
- Set deadlines for tasks
- Filter and sort tasks
- Search tasks by name or description

## API Endpoints

- GET /tasks - Get all tasks
- POST /tasks - Create a new task
- PUT /tasks/:id - Update a task
- DELETE /tasks/:id - Delete a task

## Initial Data

The db.json file contains some initial tasks to get you started.

## Note

This application uses JSON Server as a fake REST API backend. In a production environment, you would replace it with a real backend server.


1. Add routing in this app, pass arguments from one page to another
2. Add user authentication
