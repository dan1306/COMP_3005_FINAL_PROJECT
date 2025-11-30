CREATE TABLE Member (
    memberID      SERIAL PRIMARY KEY,
    firstName     VARCHAR(255) NOT NULL,
    lastName      VARCHAR(255) NOT NULL,
    dateOfBirth   DATE NOT NULL,
    gender        VARCHAR(6) NOT NULL CHECK (gender IN ('male', 'female')),
    phoneNumber   VARCHAR(15) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Trainer (
    trainerID    SERIAL PRIMARY KEY,
    firstName    VARCHAR(255) NOT NULL,
    lastName     VARCHAR(255) NOT NULL,
    phoneNumber  VARCHAR(15) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Room (
    roomID      SERIAL PRIMARY KEY,
    building    VARCHAR(255) NOT NULL,
    roomNumber  INT,
    capacity    INT CHECK (capacity > 0)
);

CREATE TABLE ClassSession (
    classSessionID    SERIAL PRIMARY KEY,
    sessionName       VARCHAR(255) NOT NULL,
    trainerID         INT,
    roomID            INT,
    sessionStartTime  TIMESTAMP NOT NULL,
    sessionEndTime    TIMESTAMP NOT NULL,

    FOREIGN KEY (trainerID) REFERENCES Trainer(trainerID),
    FOREIGN KEY (roomID) REFERENCES Room(roomID),

    CHECK (sessionStartTime < sessionEndTime)
);

CREATE TABLE HealthMetric (
    metricID           SERIAL PRIMARY KEY,
    memberID           INT NOT NULL,
    dateRecorded       DATE NOT NULL DEFAULT CURRENT_DATE,
    timeRecorded       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    heightFeet           NUMERIC(3,2) CHECK (heightFeet > 0),
    weightLBS           NUMERIC(5,2) CHECK (weightLBS > 0),
    heartRateBpm       INT CHECK (heartRateBpm > 0),
    bodyFatPercentage  NUMERIC(5,2) CHECK (bodyFatPercentage >= 0 AND bodyFatPercentage <= 100),
    bloodPressure      TEXT,

    FOREIGN KEY (memberID) REFERENCES Member(memberID) ON DELETE CASCADE
);

CREATE TABLE TrainerAvailability (
    availabilityID         SERIAL PRIMARY KEY,
    trainerID              INT NOT NULL,
    availabilityStartTime  TIMESTAMP NOT NULL,
    availabilityEndTime    TIMESTAMP NOT NULL,

    FOREIGN KEY (trainerID) REFERENCES Trainer(trainerID) ON DELETE CASCADE,
    CHECK (availabilityStartTime < availabilityEndTime)
);

CREATE TABLE Equipment (
    equipmentID    SERIAL PRIMARY KEY,
    roomID         INT NOT NULL,
    equipmentName  VARCHAR(255) NOT NULL,
    status         VARCHAR(255) NOT NULL CHECK (status IN ('available', 'unavailable')),

    FOREIGN KEY (roomID) REFERENCES Room(roomID) ON DELETE CASCADE
);

CREATE TABLE Enrollment (
    memberID        INT NOT NULL,
    classSessionID  INT NOT NULL,
    enrolledAt      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (memberID) REFERENCES Member(memberID) ON DELETE CASCADE,
    FOREIGN KEY (classSessionID) REFERENCES ClassSession(classSessionID) ON DELETE CASCADE,

    PRIMARY KEY (memberID, classSessionID)
);

CREATE TABLE FitnessGoals (
    goalID         SERIAL PRIMARY KEY,
    memberID       INT NOT NULL,
    goal       TEXT NOT NULL,
    description TEXT NOT NULL,

    achieved       BOOLEAN NOT NULL DEFAULT FALSE,
    dateachieved   TIMESTAMP,

    datelogged        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (memberID) REFERENCES Member(memberID) ON DELETE CASCADE
);




CREATE VIEW upComingClasses AS SELECT * FROM ClassSession WHERE sessionStartTime > CURRENT_TIMESTAMP;



CREATE INDEX classsession_start_time ON ClassSession(sessionStartTime);
CREATE INDEX trainer_availability_start_time_index ON TrainerAvailability(availabilityStartTime);
CREATE INDEX trainer_availability_end_time_index  ON TrainerAvailability(availabilityEndTime);



CREATE OR REPLACE FUNCTION class_session_time_check()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.sessionStartTime >= NEW.sessionEndTime THEN
        RAISE EXCEPTION 'A class cannot start after it ends or start when it ends.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER class_sessions_time_validity 
BEFORE INSERT OR UPDATE ON ClassSession
FOR EACH ROW
EXECUTE FUNCTION class_session_time_check();


CREATE OR REPLACE FUNCTION trainer_availability_time_check()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.availabilityStartTime >= NEW.availabilityEndTime THEN
        RAISE EXCEPTION 'Trainer availability start time must be before end time.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER check_trainer_availability_validity
BEFORE INSERT OR UPDATE ON TrainerAvailability
FOR EACH ROW
EXECUTE FUNCTION trainer_availability_time_check();



