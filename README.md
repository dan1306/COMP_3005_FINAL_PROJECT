# COMP3005 Final Project — Health & Fitness Club Management System

This project is a TypeScript, terminal-based application that utilizes PostgreSQL as a database, to carry out the functionalities of a Health & Fitness Club Management System.

There are three essential roles: Member, Trainer, and Admin. Each has their own menu and differing functionalities.

The database was designed using an ER model, converted to a relational schema, normalized to 3NF, and implemented using PostgreSQL DDL. Additional features include triggers, views, sample data inserts, and indexes, as required by the Final Project specification.

The project consists of an app folder where the source code for the project lives. A docs folder which is composed of the ERD.pdf, consisting of the ER model and its relational schema counterpart (It is here that it has been noted that the data is already in 3NF). An sql folder which has the DDL and DML SQL files that can be imported and executed in pgAdmin.

# Prerequisites (must be performed before running source code)

1) Node.js and npm installed

    https://nodejs.org

2) PostgreSQL and pgAdmin installed

# How to Install and Run

How to Install and Run


1) Clone the repository

Open a terminal and run:

git clone https://github.com/dan1306/COMP_3005_FINAL_PROJECT.git

2) CD into the app directory and install dependencies

npm install

3) Create your database and execute the DDL and DML files in the sql folder,
in your created database in pgadmin.

4) A .env file in the app directory with:
database_password = your_database_password_in_quotes (e.g. "password")
database_name = your_database_name_in_quotes (e.g. "final")

5) Start the application by running "npm run start" in the app directory

You will be prompted to choose:

    Member View

    Trainer View

    Admin View


Each role contains a set of operations according to the project specification.


# What the Application Does

1) Member View

Members can:

    Register as a new member

    Update account details

    Log health metrics and view health history

    Create fitness goals and mark them as achieved

    View all group classes

    Register for and cancel class enrollments


All inputs are validated and written to the database.

2) Trainer View

Trainers can:

    Log in using their email

    Add availability

    View their scheduled upcoming classes

    Look up member fitness goals and recent health metrics


(Trainers cannot modify member data thought they may look them up.)

3) Admin View

Admins can:

    Create trainers

    Add rooms

    Schedule group class sessions

    Update class session times

    Cancel classes

    Create and associate equipment with rooms

    View trainer availability and all scheduled classes


All scheduling rules (availability, conflicts, room overlaps) are enforced through the backend logic and database constraints + triggers.

# Database Features Implemented


1) ER Diagram included

2) Relational Schema included

3) Fully normalized (3NF) — justified in the report

4) DDL.sql with:

    All tables

    Primary & foreign keys

    CHECK constraints

    M:N relationship bridge (Enrollment)

    Triggers validating time ranges

    Indexes for performance

    A view (upComingClasses)


5) DML.sql with sample records


6) All functionality implemented and tested through the CLI menus


Matching requirements listed in the project rubric.

# Video Demonstration And Link To Repo

1) Video Link: 
2) Link To Main Submitted Projecct Repo:
3) This is the repo that contains all my commit history in regards to source code: 


# Notes

1) Admin is implemented as a role, not as a stored entity, because it has no persistent attributes that relate to other entities.

2) All validation is handled in TypeScript before running SQL commands.

3) All database actions are visible through pgAdmin during testing.