import { pool } from "./db/main";
import { validateEmail, validatePhoneNumber, validateNumber, validateDateTime} from "./validation";

let adminReadline = require("readline-sync");

export async function mainAdminFunction(){
    let input: string;
    while(1){
        console.log("\n--- Admin View ---\n");
        console.log(`1) Create A Trainer.\n`);
        console.log(`2) Add Room.\n`);
        console.log(`3) Create and associate a Trainer with a class session.\n`);
        console.log(`4) Cancel Group Class Session.\n`);
        console.log(`5) Update Group Class session start and end time.\n`);
        console.log(`6) Create and associate equipment to a room.\n`);
        console.log("7) Exit Admin View.\n");
        input = adminReadline.question("Select an option: ").trim();
        console.log("")
    
        switch(input){
            case "1":
                await adminAddATrainer();        
                break;
            case "2":
                await addRoom();
                break;
            case "3":
                await createClassSession();
                break
            case "4":
                await cancelClassSession();
                break;
            case "5":
                await updateClassSession();
                break;
            case "6":
                await createAndAssociateEquipment();
                break;
            case "7":
                console.log("Exiting Admin View.")
                return
            default:
                console.log("Invalid Option");
                break;
        } 
    }    

}

async function createAndAssociateEquipment() {
    console.log("\n--- Create and Associate New Equipment with a Room ---\n");

    try {
        
        let rooms = await pool.query(
            `SELECT roomid, building, roomnumber, capacity
             FROM room
             ORDER BY roomid;`
        );

        if (rooms.rowCount === 0) {
            console.log("No rooms exist.\n");
            return;
        }

        console.log("\n--- Available Rooms ---\n");
        for (let r of rooms.rows) {
            console.log(
                `RoomID: ${r.roomid} | ${r.building} ${r.roomnumber} (Capacity ${r.capacity})`
            );
        }

        let roomID: string = adminReadline.question("\nEnter the RoomID to place equipment in: ").trim();
        while (true) {
            let match: boolean = false;
            for(let r of rooms.rows){
                if(r.roomid === Number(roomID)){
                    match = true;
                    break;
                }
            }
            if (!match) {
                roomID = adminReadline.question("Invalid RoomID. Try again: ").trim();
            } else {
                break;
            }
        }

        let equipmentName = adminReadline.question(
            "Enter equipment name (e.g. dumbells #4): "
        ).trim();
        while (equipmentName === "") {
            equipmentName = adminReadline.question("Invalid. Enter equipment name: ").trim();
        }

        let status: string =  "available" ;

        await pool.query(
            `INSERT INTO equipment (roomid, equipmentname, status)
             VALUES ($1, $2, $3)`,
            [roomID, equipmentName, status]
        );

        console.log("\n Equipment created and associated with room!\n");

    } catch (err: any) {
        console.log("Error:", err.message);
    }
}


async function updateClassSession() {
    console.log("\n--- Update Class Session Start And End Time ---\n");

    try {
        let classes = await pool.query(
            `SELECT 
                classsessionid,
                sessionname,
                sessionstarttime,
                sessionendtime
             FROM classsession
             ORDER BY classsessionid;`
        );

        if (classes.rowCount === 0) {
            console.log("No classes to update.\n");
            return;
        }

        console.log("\n--- Available Classes ---\n");
        for (let c of classes.rows) {
            console.log(
                `ClassSessionID: ${c.classsessionid} | Session Name: ${c.sessionname}\n` +
                `Start-Time: ${c.sessionstarttime} | End-Time: ${c.sessionendtime}\n`
            );
        }

        let chosen: string = adminReadline.question("Enter the ClassSessionID to update: ").trim();
        let classSessionID: number = Number(chosen);

        if (isNaN(classSessionID)) {
            console.log("Invalid ID.\n");
            return;
        }

        let selectedClass = await pool.query(
            `SELECT trainerid, roomid FROM classsession WHERE classsessionid = $1`,
            [classSessionID]
        );

        if (selectedClass.rowCount === 0) {
            console.log("Class ID does not exist.\n");
            return;
        }

        let trainerID:number = selectedClass.rows[0].trainerid;
        let roomID:number = selectedClass.rows[0].roomid;

        console.log("\n-- New Times ---\n");
        let newStartTime = adminReadline.question("New start time (YYYY-MM-DD HH:MM): ").trim();
        while (!validateDateTime(newStartTime)) {
            newStartTime = adminReadline.question("Invalid. Try again (e.g. 2025-12-12 12:00): ").trim();
        }

        let newEndTime = adminReadline.question("New end time (YYYY-MM-DD HH:MM): ").trim();
        while (!validateDateTime(newEndTime)) {
            newEndTime = adminReadline.question("Invalid. Try again (e.g. 2025-12-12 12:00): ").trim();
        }

        if (new Date(newStartTime) >= new Date(newEndTime)) {
            console.log("End time must be AFTER start time.\n");
            return;
        }

        console.log("\n--- Trainer Availability Check ---\n")
        let trainerAvailable = await pool.query(
            `SELECT 1 FROM traineravailability
             WHERE trainerid = $1
             AND availabilitystarttime <= $2
             AND availabilityendtime >= $3`,
            [trainerID, newStartTime, newEndTime]
        );

        if (trainerAvailable.rowCount === 0) {
            console.log("Trainer is NOT available at given time.\n");
            return;
        }

        console.log("\n--- Trainer schedule conflict check ---\n");
        let trainerConflict = await pool.query(
            `SELECT 1 FROM classsession
             WHERE trainerid = $1
             AND classsessionid <> $2
             AND sessionstarttime < $4
             AND sessionendtime > $3`,
            [trainerID, classSessionID, newStartTime, newEndTime]
        );

        if (trainerConflict.rowCount > 0) {
            console.log("Trainer already has another class during that time.\n");
            return;
        }

        console.log("\n--- Room Conflict Check ---\n");
        let roomConflict = await pool.query(
            `SELECT 1 FROM classsession
             WHERE roomid = $1
             AND classsessionid <> $2
             AND sessionstarttime < $4
             AND sessionendtime > $3`,
            [roomID, classSessionID, newStartTime, newEndTime]
        );

        if (roomConflict.rowCount > 0) {
            console.log("Room is booked at that time.\n");
            return;
        }

        console.log("\n--- All Checks Passes Now Updating ---\n");
        await pool.query(
            `UPDATE classsession
             SET sessionstarttime = $2, sessionendtime = $3
             WHERE classsessionid = $1`,
            [classSessionID, newStartTime, newEndTime]
        );

        console.log("Class time successfully updated!\n");

    } catch (err: any) {
        console.log("Error:", err.message);
    }
}


async function cancelClassSession() {
    console.log("\n--- Cancel a Class Session ---\n");

    try {
        let result = await pool.query(
            `SELECT 
                c.classsessionid,
                c.sessionname,
                c.sessionstarttime,
                c.sessionendtime,
                t.firstname || ' ' || t.lastname AS trainer_name,
                r.building,
                r.roomnumber
             FROM classsession c
             JOIN trainer t ON c.trainerid = t.trainerid
             JOIN room r ON c.roomid = r.roomid
             ORDER BY c.sessionstarttime;`
        );

        if (result.rowCount === 0) {
            console.log("There are no class sessions  availale to cancel.\n");
            return;
        }

        console.log("\n--- Group Classes  Scheduled ---\n");
        for (let c of result.rows) {
            console.log(
                `ClassID: ${c.classsessionid}\n` +
                `Name: ${c.sessionname}\n` +
                `Trainer: ${c.trainer_name}\n` +
                `Room: ${c.building} ${c.roomnumber}\n` +
                `Start: ${c.sessionstarttime}\n` +
                `End: ${c.sessionendtime}\n`
            );
        }

        let decision: string = adminReadline.question("Enter the ClassID to cancel: ").trim();
        let classIDtoCancel: number = Number(decision);

        if (isNaN(classIDtoCancel)) {
            console.log("Invalid ID.\n");
            return;
        }

        // Check the class exists
        const check = await pool.query(
            `SELECT 1 FROM classsession WHERE classsessionid = $1`,
            [classIDtoCancel]
        );

        if (check.rowCount === 0) {
            console.log("No class exists with that ID.\n");
            return;
        }

        let confirmDecision: string = adminReadline.question(
            `Are you sure you want to permanently DELETE class ${classIDtoCancel}? (yes/no): `
        ).trim().toLowerCase();

        if (confirmDecision !== "yes") {
            console.log("Ok we will not proceed with the cancellation.\n");
            return;
        }

        await pool.query(`DELETE FROM classsession WHERE classsessionid = $1`, [classIDtoCancel]);

        console.log("Class session deleted successfully.\n");

    } catch (err: any) {
        console.log("Error:", err.message);
    }
}

async function createClassSession() {
    console.log("\n--- Create a New Class Session And Assign An Available Room And Trainer ---\n");

    let sessionname = adminReadline.question("Enter a name for the session: ").trim();
    while (sessionname === "") {
        sessionname = adminReadline.question("Invalid. Enter a name for the session: ").trim();
    }

    let sessionstarttime: string = adminReadline.question("Enter a start time (in the form YYYY-MM-DD HH:MM): ").trim();
    while (!validateDateTime(sessionstarttime)) {
        sessionstarttime = adminReadline.question("Wrong format. Enter a start time (e.g. 2025-12-01 13:00): ").trim();
    }

    let sessionendtime = adminReadline.question("Enter an end time (in the form YYYY-MM-DD HH:MM): ").trim();
    while (!validateDateTime(sessionendtime)) {
        sessionendtime = adminReadline.question("Wrong format. Enter a start time (e.g. 2025-12-01 13:00): ").trim();
    }

    if (new Date(sessionstarttime) >= new Date(sessionendtime)) {
        console.log("   Invalid. End time comes before start time\n");
        return;
    }

    console.log("\n--- Checking for available Trainers ---\n");

    let availabletrainers = await pool.query(
        `SELECT t.trainerid, t.firstname, t.lastname
         FROM trainer t
         WHERE t.trainerid IN (
             SELECT trainerid FROM traineravailability
             WHERE availabilitystarttime <= $1
             AND availabilityendtime >= $2
         )
         AND t.trainerid NOT IN (
             SELECT trainerid
             FROM classsession
             WHERE sessionstarttime < $2
             AND sessionendtime > $1
         )`,
        [sessionstarttime, sessionendtime]
    );

    if (availabletrainers.rowCount === 0) {
        console.log("No trainers are available for this specific start and end time.\n");
        return;
    }

    console.log("\n--- Available Trainers ---\n");
    for(let t of availabletrainers.rows){
        console.log(`Trainer ID: ${t.trainerid} — ${t.firstname} ${t.lastname}`);
    };

    let trainerID = adminReadline.question("Enter A Trainer ID from the list: ").trim();
    while (1) {
        let found: boolean = false;
        for(let t of availabletrainers.rows){
            if(t.trainerid === parseInt(trainerID)){
                found = true;
                break;
            }
        }
        if(found === false){
            trainerID = adminReadline.question("Invalid. Select a Trainer ID from the available list: ").trim();
        } else {
            break;
        }
    }
    trainerID=parseInt(trainerID);

    console.log("\n--- Room Available ---\n");

    let freeRooms = await pool.query(
        `SELECT r.roomid, r.building, r.roomnumber, r.capacity
         FROM room r
         WHERE r.roomid NOT IN (
             SELECT roomid
             FROM classsession
             WHERE sessionstarttime < $2
             AND sessionendtime > $1
         )
         ORDER BY r.roomid`,
        [sessionstarttime, sessionendtime ]
    );

    if (freeRooms.rowCount === 0) {
        console.log("No rooms are free at those times.\n");
        return;
    }

    console.log("\n--- Available Rooms ---\n");
    for(let r of freeRooms.rows){
        console.log(`Room ID: ${r.roomid} — ${r.building} ${r.roomnumber} (Capacity: ${r.capacity})`);
    };

    let roomID = adminReadline.question("\nEnter Room ID from the list of available rooms: ").trim();
    while (1) {
        let found: boolean = false;
        for(let r of freeRooms.rows){
            if(r.roomid === parseInt(roomID)){
                found = true;
                break;
            }
        }
        if(found === false){
            roomID = adminReadline.question("Invalid. Select a Room ID from the available list:\n").trim();
        } else {
            break;
        }
    }
    roomID = parseInt(roomID);
    try {
        await pool.query(
            `INSERT INTO classsession (sessionname, trainerid, roomid, sessionstarttime, sessionendtime)
             VALUES ($1, $2, $3, $4, $5)`,
            [sessionname, trainerID, roomID, sessionstarttime, sessionendtime]
        );

        console.log("\nNew class session added successfully!\n");
    } catch (err: any) {
        console.log(`Error: ${err.message}`);
    }
}


async function viewRooms() {
    console.log("\n--- View Rooms ---\n");

    try {
        let result = await pool.query(
            `SELECT * FROM room `
        );

        if (result.rowCount === 0) {
            console.log("No rooms to show.\n");
            return;
        }

    
        for(let i of result.rows){
            console.log(
                `Room ID: ${i.roomid} | ` +
                `Building Name: ${i.building} | ` +
                `Room#:   ${i.roomnumber} | ` +
                `Room Capacity: ${i.capacity}` 
            );
            console.log("");
        };
    } catch (err: any) {
        console.log(`   Error: ${err.message}`);
    }
}

export async function addRoom() {
    await viewRooms();
    console.log("\n--- Add a New Room ---\n");
    let buildingname = adminReadline.question("Enter the name of the building: ").trim();
    while (buildingname === "") {
        console.log("   Building name is required.")
        buildingname = adminReadline.question("Enter the name of the building: ").trim();
    }

    let roomnumber = adminReadline.question("Enter the number of the room: ").trim();
    while (!validateNumber(roomnumber)) {
        roomnumber = adminReadline.question("Invalid. Enter a valid number for the room: ").trim();
    }
    let roomNumberToInt: number = parseInt(roomnumber);

    let roomCapacity = adminReadline.question("Enter the room capacity greater than 0: ").trim();
    while (!validateNumber(roomCapacity) || parseInt(roomCapacity) <= 0) {
        roomCapacity = adminReadline.question("Invalid. Enter a numeric value greater than 0: ").trim();
    }
    let roomCapacityToInt: number = parseInt(roomCapacity);

    try {
        await pool.query(
            `INSERT INTO room (building, roomnumber, capacity)
             VALUES ($1, $2, $3)`,
            [buildingname, roomNumberToInt, roomCapacityToInt]
        );

        console.log("   New Room added successfully!\n");

    } catch (err: any) {
        console.log(`   Error: ${err.message}`);
    }
}

async function adminAddATrainer() {

    console.log("\n--- Add a new Trainer ---\n");

    let firstname = adminReadline.question("Enter the trainers first name: ").trim();
    while (firstname === "") {
        console.log("   First name is required.");
        firstname = adminReadline.question("Enter the trainers first name: ").trim();
    }

    let lastname = adminReadline.question("Enter the trainers last name: ").trim();
    while (lastname === "") {
        console.log("   Last name is required.");
        lastname = adminReadline.question("Enter the trainers last name: ").trim();
        console.log("");
    }

    let phonenumber = adminReadline.question("What is the trainers phone number (123-456-7890):\n").trim();
    while (!validatePhoneNumber(phonenumber)) {
        console.log("   Phone number is required.")
        phonenumber = adminReadline.question("What is the trainers phone number (e.g. 123-456-7890):\n").trim();
    }

    let email = adminReadline.question("Enter the trainers email: ").trim();
    while (!validateEmail(email)) {
        console.log("   Email is required.")
        email = adminReadline.question("Enter the trainers email: ").trim();
    }

    try {
        await pool.query(
            `INSERT INTO trainer (firstname, lastname, phonenumber, email)
             VALUES ($1, $2, $3, $4)`,
            [firstname, lastname, phonenumber, email]
        );
        console.log("   New Trainer added successfully!\n");
    } catch (err: any) {
        console.log("   Error:", err.message);
    }
}