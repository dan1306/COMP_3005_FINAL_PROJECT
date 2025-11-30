INSERT INTO Member (firstName, lastName, dateOfBirth, gender, phoneNumber, email)
VALUES
('LeBron', 'James', '1984-12-30', 'male', '121-121-8888', 'lebronJames@gmail.com'),
('Ayesha', 'Curry', '1989-03-23', 'female', '123-123-4444', 'ayeshaCurry@gmail.com'),
('Stephen', 'Curry', '1988-03-14', 'male', '333-333-5555', 'stephenCurry@gmail.com'),
('Michael', 'Jordan', '1963-02-17', 'male', '412-532-6343', 'mJordan@gmail.com'),
('Serena', 'Williams', '1981-09-26', 'female', '531-636-7557', 'serenaWilliams@gmail.com');



INSERT INTO Trainer (firstName, lastName, phoneNumber, email)
VALUES
('James', 'Harden', '999-888-1010', 'jamesHarden@gmail.com'),
('Tyler', 'Herro', '818-653-6666', 'tylerHerro@gmail.com'),
('Kobe', 'Bryant', '777-444-3333', 'kobeBryant@gmail.com'),
('Giannis', 'Antetokounmpo', '999-111-2222', 'giannisAntetokounmpo@gmail.com'),
('Klay', 'Thompson', '666-777-8888', 'klayThompson@gmail.com');


INSERT INTO Room (building, roomNumber, capacity)
VALUES
('Main', 100, 30),
('Secondary', 101, 20),
('Main', 200, 40),
('Secondary', 300, 25);


INSERT INTO ClassSession (sessionName, trainerID, roomID, sessionStartTime, sessionEndTime)
VALUES
('Bike Cycling', 1, 1, '2025-12-01 09:00', '2025-12-01 10:00'),
('Yoga', 2, 2, '2025-12-02 18:00', '2025-12-02 19:00'),
('Strength Training', 3, 3, '2025-12-03 10:00', '2025-12-03 11:00'),
('Pilates', 4, 4, '2025-12-04 14:00', '2025-12-04 15:00'),
('Boxing', 5, 1, '2025-12-05 16:00', '2025-12-05 17:00');



INSERT INTO TrainerAvailability (trainerID, availabilityStartTime, availabilityEndTime)
VALUES
(1, '2025-12-01 08:00', '2025-12-01 12:00'),
(2, '2025-12-02 16:00', '2025-12-02 20:00'),
(3, '2025-12-03 09:00', '2025-12-03 13:00'),
(4, '2025-12-04 12:00', '2025-12-04 16:00'),
(5, '2025-12-05 15:00', '2025-12-05 19:00');


INSERT INTO HealthMetric (memberID, heightFeet, weightLBS, heartRateBpm, bodyFatPercentage, bloodPressure)
VALUES
(1, 6.20, 210.4, 70, 14.0, '110/70'),
(2, 5.50, 132.8, 82, 22.0, '110/80'),
(3, 6.30, 185.1, 68, 17.3, '110/60'),
(4, 6.60, 198.5, 73, 15.8, '110/70'),
(5, 5.90, 156.2, 76, 20.5, '110/90');


INSERT INTO Equipment (roomID, equipmentName, status)
VALUES
(1, 'Treadmill', 'available'),
(2, 'Dumbbells #1', 'available'),
(3, 'Bench Press', 'available'),
(4, 'Rowing Machine', 'available'),
(1, 'Stationary Bike', 'available');



INSERT INTO Enrollment (memberID, classSessionID)
VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 3),
(5, 5);


INSERT INTO FitnessGoals (memberID, goal, description)
VALUES
(1, 'Lose Weight', 'Lose 10 pounds in 1 month'),
(2, 'Build Muscle', 'Train legs twice weekly'),
(3, 'Improve Stamina', 'Run 1 km in under 10 minutes'),
(4, 'Bench', 'Be able to bench double my body weight by the end of the year'),
(5, 'Lower Body Fat', 'Reduce body fat by 3%');
