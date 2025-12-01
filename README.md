# COMP3005 Final Project — Health & Fitness Club Management System

This project is a TypeScript, terminal-based application that uses PostgreSQL as its database to support the core operations of a Health & Fitness Club Management System.

There are three main roles: Member, Trainer, and Admin. Each with their own menu and set of functionalities.

The database was designed using an ER model, converted into a relational schema, normalized to 3NF, and implemented using PostgreSQL. As required by the Final Project spec, the system also includes triggers, views, indexes, and a full set of sample data.

Project folder structure:

    an app folder containing all source code,

    a docs folder containing the ERD.pdf, which has the ER model, relational schema (and the note confirming the schema is already in 3NF), and, mapping table,

    and an sql folder containing the DDL and DML files used to build and populate the database in pgAdmin.


# Prerequisites (must be performed before running source code)

    Node.js and npm installed

    https://nodejs.org

    PostgreSQL and pgAdmin installed


# How to Install and Run

Clone the repository

    Open a terminal and run:

    git clone https://github.com/dan1306/COMP_3005_FINAL_PROJECT.git


Install dependencies

    Navigate into the app directory and run:

    npm install


Set up the database

    Create your database in pgAdmin, then execute both DDL.sql and DML.sql from the sql folder.


Create a .env file in the app directory

    It should contain:

    database_password = "your_postgres_password"
    database_name = "your_database_name"


Run the application

    Inside the app directory:

    npm run start

You will then be prompted to choose:

    Member View

    Trainer View

    Admin View


Each role comes with the operations required by the project specification.


# What the Application Does

Member View

    Members can:

        Register as a new member

        Log in as an existing member

        Update account details

        Log health metrics and view health history

        Create fitness goals and mark them as achieved

        View all group classes

        Register for and cancel class enrollments


All inputs are validated and written to the database.

Trainer View

    Trainers can:

        Log in using their email

        Add availability

        View their scheduled upcoming classes

        Look up member fitness goals and recent health metrics


(Trainers cannot modify member data thought they may look them up.)

Admin View

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

3) Fully normalized (3NF) — justified in the relational schema

4) DDL.sql with:

    All tables

    Primary & foreign keys

    CHECK constraints

    M:N relationship (Enrollment)

    Triggers validation

    Indexes 

    A View 


5) DML.sql with sample records


6) All functionality implemented and tested through the CLI menus


Matching requirements listed in the project rubric.

# Video Demonstration And Link To Repo

1) Video Link: https://youtu.be/_JHBXdqZvIc 
2) Link To Main Submitted Project Repo: https://github.com/dan1306/COMP_3005_FINAL_PROJECT
3) This is the repo that contains all my commit history in regards to source code: https://github.com/dan1306/COMP3005_FINAL_PROJECT 


# Notes

1) Admin is implemented as a role, not as a stored entity, because it has no persistent attributes that relate to other entities.

2) All validation is handled in TypeScript before running SQL commands.

3) All database actions are visible through pgAdmin during testing.
## End of README