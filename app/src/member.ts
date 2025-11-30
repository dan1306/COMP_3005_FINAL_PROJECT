import { pool } from "./db/main"; 
import { validateEmail, validatePhoneNumber, validateDateOfBirth, 
        validateHeightInFeet, validateWeightLBS, validateHeartRateBpm, 
        validateBodyFatPercentage, validateBloodPressure } from "./validation";

// package for taking in terminal inputs
let memberReadline = require("readline-sync");
 
// connection for PostgreSQL queries
// let { pool } = require("./db/main");

interface Member {
    memberid: number;
    firstname: string;
    lastname: string;
    dateofbirth: Date;      
    gender: string;
    phonenumber: string;
    email: string;
}

export async function mainMemberFunction() {
    let input: string; 
    while(1){
        console.log("\n--- Select User Function ---\n");
        // console.log('');
        console.log(`1) Register as a new Member.\n`);
        console.log(`2) Log in as an existing Member.\n`);
        console.log("3) Exit.\n")
        input = memberReadline.question("Select an option:");
    
        switch(input){
            case "1":
                await createNewMember();        
                break;
            case "2":
                await logIn();
                break;
            case "3":
                console.log("Exiting program...");
                return;
            default:
                console.log("Invalid Option");
                break;
        }
    }    


};

async function logIn() {
    let email: string = memberReadline.question("What is your email (in the format myEmail@gmail.com): ").trim();
    while(!validateEmail(email)){
        email = memberReadline.question("What is your email (in the format myEmail@gmail.com): ").trim();    
    }

    try{
        let result = await pool.query(
            `SELECT *
            FROM member
            WHERE email = $1`,
            [email]
        
        );
        // console.log(result.rows); 
        if(result.rows.length == 0){
            console.log("No member found with that email.\n");
        } else {
            await memberView(result.rows[0])
        }
    } catch(e: any){
        console.log(e.message);        
    }
}

async function memberView(memberData: Member) {
    // console.log(memberData);    
    let option: string = ""; 

    while(option !== "8"){
        
        console.log("1) Update Account Details.\n");
        console.log("2) Fitness Goals Operations.\n");
        console.log("3) Health Metric Operations.\n");
        console.log("4) Group Class Operations.\n");
        console.log("5) Logout.\n");

        option = memberReadline.question("Select an option (1-5): ").trim();
        switch (option) {
            case "1":
                // Update Profile
                let resultOfUpdate: boolean = await updateAccountDetails(memberData.memberid);
                if(resultOfUpdate === true){
                    console.log("We are logging you out after an update to account details, please log in again.\n")
                    return;
                } else {
                    break;
                }
            case "2":
                await FitnessGoals(memberData.memberid);
                break                
            case "3":
                await healthHistory(memberData.memberid);
                break;
            case "4":
                groupClassOperations(memberData.memberid);
                break;
            case "5":
                console.log("Logging out...\n");
                return;  // exit member loop

            default:
                console.log("Invalid option. Try again.\n");
                break;
        }
    }

}

async function FitnessGoals(memberid: number){
    let option: string = ""; 

    while(option !== "3"){
        console.log("\n--- Fitness Goals Operations ---\n");
        console.log("1) Log New Fitness Goal.\n");
        console.log("2) View and Update Achievement of Fitness Goals.\n");    
        console.log("3) Exit.\n");
        
        option = memberReadline.question("Select an option (1-3): ").trim();
        switch(option){
            case "1":
                await createFitnessGoals(memberid);
                break;
            case "2":
                // View Health History
                await viewAndUpdateFitnessGoal(memberid);
                break;
            case "3":
                console.log("Exiting...")
                return;
            default:
                console.log("Invalid option. Try again.\n");
                break;
        }
    }
 
}

async function createFitnessGoals(memberid: number) {
    console.log("\n--- Creating A new fitness goal ---\n");
    let goal:string = memberReadline.question("What is your goal, keep it simple do not add too much detail here (e.g. lose weight): ").trim();
    while(goal === ""){
        console.log("   Invalid goal can not be empty.")
        goal = memberReadline.question("What is your goal (e.g. lose weight): ").trim();
    }
    let description: string = memberReadline.question("Add more detail to your goal (e.g. Lose 20 pounds in a month): ").trim();
    while(description == ""){
        console.log("   Invalid description can not be empty.");
        description= memberReadline.question("Add more detail to your goal (e.g. Lose 20 pounds in a month): ").trim(); 
    }

    try {
        await pool.query(
            `INSERT INTO fitnessgoals (memberid, goal, description)
             VALUES ($1, $2, $3)`,
            [memberid, goal, description]
        );

        console.log("Fitness goal created!\n");

    } catch (err: any) {
        console.log("ERROR: ", err.message);
    }
}

async function viewAndUpdateFitnessGoal(memberid: number) {
    console.log("\n--- Your Fitness Goals ---\n");

    try {
        let result = await pool.query(
            `SELECT goalid, goal, description, achieved, datelogged, dateachieved
             FROM fitnessgoals
             WHERE memberid = $1
             ORDER BY goalid ASC`,
            [memberid]
        );

        if (result.rowCount === 0) {
            console.log("You have not set any fitness goals.\n");
            return;
        }

        console.log(result)

        for(let g of result.rows){
            if(g.achieved){
                console.log("\n--- Fitness Goals You Have Achieved ---\n");
                console.log(`GoalID: ${g.goalid}`);
                console.log(`Goal: ${g.goal}`);
                console.log(`Description: ${g.description}`);
                console.log(`Achieved: ${g.achieved ? "Yes" : "No"}`);
                console.log(`Date Set: ${g.datelogged}`);
                console.log(`Date Achieved: ${g.dateachieved === null? "You have not yet achieved this goal": g.dateachieved }`);
                console.log("");
            } else {
                console.log("\n--- Fitness Goals You Have Not Yet Achieved ---\n");
                console.log(`GoalID: ${g.goalid}`);
                console.log(`Goal: ${g.goal}`);
                console.log(`Description: ${g.description}`);
                console.log(`Achieved: ${g.achieved ? "Yes" : "No"}`);
                console.log(`Date Set: ${g.datelogged}`);
                console.log(`Date Achieved: ${g.dateachieved === null? "You have not yet achieved this goal": g.dateachieved }`);
                console.log("");               
            }
        };

        let updateOption: string = memberReadline.question("Enter a GoalID to update its status or type 'Exit' or simply type nothing: ").trim();
        if(updateOption !== "" || updateOption.toLowerCase() !== "exit" ){
         await updateStatusOfFitnessGoal(memberid, updateOption);   
        }

    } catch (err: any) {
        console.log("Database error:", err.message);
    }
}

async function updateStatusOfFitnessGoal(memberid: number, goalid: string){
    console.log("\n--- Updating The Status Of A Goal ---\n");

    let goalidtoint: number = Number(goalid);

    if(isNaN(goalidtoint)){
        console.log("Invalid, goalid is not a number.\n");
        return;
    }

    let isIdInFitnessGoals = await pool.query(
        `SELECT goalid FROM fitnessgoals WHERE goalid = $1 AND memberid = $2`,
        [goalid, memberid]
    );

    if (isIdInFitnessGoals.rowCount === 0) {
        console.log("No goal found matching the goalid provided for your userid.\n");
        return;
    }


    console.log("\n--- Update Status Of Goal ---\n");

    let decision: string = memberReadline.question(`Mark the goal with id ${goalid} as completed. This is Final you can't modify after you type yes. (yes/no): `).trim().toLowerCase();

    if(decision == "no"){
        console.log("Your decision of no will be respected.\n");
    }
    if (decision !== "yes" && decision !== "no") {
        console.log("Invalid input.\n");
        return;
    }
    if(decision == "yes"){
        try {
                await pool.query(
                    `UPDATE fitnessgoals
                    SET achieved = TRUE, dateachieved = CURRENT_TIMESTAMP
                    WHERE goalid = $1 AND memberid = $2`,
                    [goalid, memberid]
                );
                console.log("Goal with id " + goalid + " marked as achieved, and will be reflected when you view your fitness goals.\n");

        } catch (err: any) {
            console.log("Error: ", err.message);
        }

    }
}

async function healthHistory(memberid: number) {
    let option: string = ""; 

    while(option !== "4"){
        console.log("\n--- Health Metric Operations ---\n");
        console.log("1) Log New Health Metric.\n");
        console.log("2) view Health History.\n");    
        console.log("3) Exit.\n");
        
        option = memberReadline.question("Select an option (1-4): ").trim();
        switch(option){
            case "1":
                await recordHealthMetric(memberid);
                break;
            case "2":
                // View Health History
                await viewHealthHistory(memberid);
                break;
            case "3":
                console.log("Exiting...")
                return;
            default:
                console.log("Invalid option. Try again.\n");
                break;
        }
    }
    
}

async function viewHealthHistory(memberid: number) {
        try {
        const result = await pool.query(
            `SELECT *
             FROM healthmetric
             WHERE memberid = $1;`,
            [memberid]
        );

        if (result.rowCount === 0) {
            console.log("\nNo recorded health metrics to show.\n");
            return;
        }

        console.log("\n--- Your Health Metrics ---\n");
        for(let i of result.rows){
            console.log(`MetricID: ${i.metricID}`);
            console.log(`Date Recorded: ${i.daterecorded}`);
            console.log(`Time Recorded: ${i.timerecorded}`);
            console.log(`Height (in feet): ${i.heightfeet}`);
            console.log(`Weight (in lbs): ${i.weightlbs}`);
            console.log(`Heart Rate (bpm): ${i.heartratebpm}`);
            console.log(`Body Fat (in %): ${i.bodyfatpercentage}`);
            console.log(`Blood Pressure: ${i.bloodpressure}`);
            console.log("");
        };

    } catch (e: any) {
        console.log(`Error: ${e.message}\n`);
    }
}
async function groupClassOperations(memberid: number){
  
    let option: string = ""; 

    while(option !== "4"){
        console.log("\n--- Group Classes Functionality ---\n");
        console.log("1) Group Class Registration.\n");
        console.log("2) Cancel Group Class Registration.\n");    
        console.log("3) View Group Upcoming Classes.\n");
        console.log("4) Exit.\n");
        
        option = memberReadline.question("Select an option (1-4): ").trim();
        switch(option){
            case "1":
                await registerForAClass(memberid);
                break;
            case "2":
                await cancelClassRegistration(memberid);
                break;
            case "3":
                // View upcoming group classes
                break;
            case "4":
                console.log("Exiting...")
                return;
            default:
                console.log("Invalid option. Try again.\n");
                break;
        }
    }
 
}
async function cancelClassRegistration(memberid: number) {
    try {
        const result = await pool.query(
               `SELECT 
                c.classsessionid,
                c.sessionname,
                c.sessionstarttime,
                c.sessionendtime,
                e.enrolledat,
                r.building,
                r.roomnumber,

                t.firstname || ' ' || t.lastname AS trainer_name


                FROM enrollment e
                JOIN classsession c  
                ON c.classsessionid = e.classsessionid
                JOIN room r 
                ON c.roomid = r.roomid
                JOIN trainer t 
                    ON c.trainerid = t.trainerid

                WHERE e.memberid = $1

                GROUP BY
                c.classsessionid,
                c.sessionname,
                c.sessionstarttime,
                c.sessionendtime,
                e.enrolledat,
                r.building,
                r.roomnumber,
                r.capacity,
                t.firstname, t.lastname

                ORDER BY c.sessionstarttime;
             `,
            [memberid]
        );

        if (result.rows.length === 0) {
            console.log("You have not registered in any classes.\n");
            return;
        }

        console.log("\n--- Classes you are registered in ---\n");
        for(let i of result.rows){
            console.log(
                `classID: ${i.classsessionid}\n` +
                `Name: ${i.sessionname}\n` +
                `Trainer: ${i.trainer_name}\n` +
                `Room: ${i.building} - ${i.roomnumber}\n` +
                `Time Enrolled: ${i.enrolledat}\n` +
                `Start: ${i.sessionstarttime}\n` +
                `End: ${i.sessionendtime}\n` 
            );
        };

        // Ask which class user wants
        const chosenID = memberReadline.question("Enter the ClassID to you would like to cancel: ").trim();
        const numericID = Number(chosenID);

        if (isNaN(numericID)) {
            console.log("Invalid input. Must be a number.\n");
            return;
        }

        // Find class
        const chosenClass = result.rows.find((i: any) => i.classsessionid === numericID);

        if (!chosenClass) {
            console.log("Class not found.\n");
            return;
        }

        // Check if member is not already enrolled
        const isMemberNotEnrolledInClassSession = await pool.query(
            `SELECT 1 
            FROM enrollment 
            WHERE memberid = $1 AND classsessionid = $2`,
            [memberid, numericID]
        );

        if (isMemberNotEnrolledInClassSession.rows.length <= 0) {
            console.log("You can't cancel a class, you are not registered in.\n");
            return;
        }
        
        // Attempt cancellation 
        await pool.query(
            `DELETE FROM enrollment
            WHERE memberid = $1 AND classsessionid = $2`,
            [memberid, numericID]
        );

        console.log(`You have successfully cancelled registration for class with ID ${chosenID}!\n`);


    } catch (e: any) {
        console.log("Error:", e.message);
    }
   
}


async function registerForAClass(memberid: number) {
    try {
        const result = await pool.query(
            `SELECT 
                c.classsessionid,
                c.sessionname,
                c.sessionstarttime,
                c.sessionendtime,
                t.firstname || ' ' || t.lastname AS trainer_name,
                r.building,
                r.roomnumber,
                r.capacity,
                COUNT(e.memberid) AS enrolled_count,
                (r.capacity - COUNT(e.memberid)) AS spots_left
            FROM classsession c
            JOIN trainer t ON c.trainerid = t.trainerid
            JOIN room r ON c.roomid = r.roomid
            LEFT JOIN enrollment e ON c.classsessionid = e.classsessionid
            GROUP BY 
                c.classsessionid, c.sessionname, c.sessionstarttime, c.sessionendtime,
                t.firstname, t.lastname, r.building, r.roomnumber, r.capacity
            ORDER BY c.classsessionid;`
        );

        if (result.rows.length === 0) {
            console.log("No classes are currently scheduled at this tine, try again at a later time.\n");
            return;
        }

        console.log("\n--- Group Classes being held ---\n");
        for(let i of result.rows){
            console.log(
                `classID: ${i.classsessionid}\n` +
                `Name: ${i.sessionname}\n` +
                `Trainer: ${i.trainer_name}\n` +
                `Room: ${i.building} - ${i.roomnumber}\n` +
                `Start: ${i.sessionstarttime}\n` +
                `End: ${i.sessionendtime}\n` +
                `Enrolled: ${i.enrolled_count}/${i.capacity}\n` +
                `Spots Left: ${i.spots_left}\n`
            );
        };

        console.log("--- Register For A Class That Has Spots Remaining ---");
        const chosenID = memberReadline.question("Enter the ClassID to register for: ").trim();
        const numericID = Number(chosenID);

        if (isNaN(numericID)) {
            console.log("Invalid input. Must be a number.\n");
            return;
        }

        // Find class
        const chosenClass = result.rows.find((i: any) => i.classsessionid === numericID);

        if (!chosenClass) {
            console.log("Class not found.\n");
            return;
        }

        // Check capacity
        if (chosenClass.spots_left <= 0) {
            console.log("This class is full. You cannot register.\n");
            return;
        }

        // Check if member is already enrolled
        const isMemberAlreadyEnrolledInClassSession = await pool.query(
            `SELECT 1 
            FROM enrollment 
            WHERE memberid = $1 AND classsessionid = $2`,
            [memberid, numericID]
        );

        if (isMemberAlreadyEnrolledInClassSession.rows.length > 0) {
            console.log("You can't enroll into a class, you have already registered for.\n");
            return;
        }
        // Attempt registration
        await pool.query(
            `INSERT INTO enrollment (memberid, classsessionid)
             VALUES ($1, $2)`,
            [memberid, numericID]
        );

        console.log("You have successfully registered for the class!\n");

    } catch (e: any) {
        console.log("Error:", e.message);
    }
}

async function updateAccountDetails(memberid: number): Promise<boolean>{

    let updateWasMade: boolean = false;
    console.log("\nLeave any field blank to keep your current value.\n");

    let fName = memberReadline.question("New first name: ").trim();
    let lName = memberReadline.question("New last name: ").trim();

    let phoneNumber = memberReadline.question("New phone number (123-456-7891): ").trim();
    if (phoneNumber !== "") {
        while (!validatePhoneNumber(phoneNumber)) {
            phoneNumber = memberReadline.question("Try again. New phone number: ").trim();
        }
    }

    let email = memberReadline.question("New email: ").trim();
    if (email !== "") {
        while (!validateEmail(email)) {
            email = memberReadline.question("Try again. New email: ").trim();
        }
    }

    if(fName !== ""){
        let resultFname: boolean = await updatefirstname(memberid, fName);
        if(updateWasMade === false){
            updateWasMade = resultFname;
        }
    }

    if(lName !== ""){
        let resultLname: boolean  = await updatelastname(memberid ,lName);
        if(updateWasMade === false){
            updateWasMade = resultLname;
        }
    }

    if(phoneNumber !== ""){
        let resultPhoneNumber: boolean = await updatephonenumber(memberid, phoneNumber);
        if(updateWasMade === false){
            updateWasMade = resultPhoneNumber;
        }
    }

    if(email !== ""){
        let resultEmail: boolean = await updateEmail(memberid, email);
        if(updateWasMade === false){
            updateWasMade = resultEmail;
        }
    }
    return updateWasMade;
}

async function updatefirstname(memberid: number, fname: string): Promise<boolean>{
    let updated: boolean = false;
    try {
        await pool.query(
            `UPDATE member
             SET firstname = $1
             WHERE memberid = $2`,
            [fname, memberid]
        );
        console.log("First name updated successfully.\n");
        updated = true;
    } catch (err: any) {
        console.log("Failed to update first name:", err.message, "\n");
    }
    return updated
}

async function updatelastname(memberid: number,lname: string): Promise<boolean>{
    let updated: boolean = false;
    try {
        await pool.query(
            `UPDATE member
             SET lastname = $1
             WHERE memberid = $2`,
            [lname, memberid]
        );
        console.log("Last name updated successfully.\n");
        updated = true;
    } catch (err: any) {
        console.log("\Failed to update last name:", err.message, "\n");
    }
    return updated
}

async function updatephonenumber(memberid: number, phonenumber: string): Promise<boolean>{
    let updated: boolean = false;
    try {
        await pool.query(
            `UPDATE member
             SET phonenumber = $1
             WHERE memberid = $2`,
            [phonenumber, memberid]
        );
        console.log("Phone number updated successfully.\n");
        updated = true;
    } catch (err: any) {
        console.log("Failed to update phone number:", err.message, "\n");
    }
    return updated;
}

async function updateEmail(memberid: number, email: string): Promise<boolean> {
    let updated: boolean = false;
    try {
        await pool.query(
            `UPDATE member
             SET email = $1
             WHERE memberid = $2`,
            [email, memberid]
        );
        console.log("\n Email updated successfully.\n");
        updated = true;
    } catch (err: any) {
        console.log("Failed to update email:", err.message, "\n");
    }
    return updated;
}

async function recordHealthMetric(memberid: number){
    let heightfeet: string = memberReadline.question("What is your height in feet (e.g. 5.10): ").trim();
    while(!validateHeightInFeet(heightfeet)){
       heightfeet= memberReadline.question("What is your height in feet (e.g. 5.10): ").trim(); 
    }    
    let weightlbs: string = memberReadline.question("What is your weight in pounds (e.g. 165.40): ").trim(); 
    while(!validateWeightLBS(weightlbs)){
       weightlbs = memberReadline.question("What is your weight in pounds (e.g. 165.40): ").trim(); 
    } 
    let heartratebpm: string = memberReadline.question("What is your heart rate in beats per min (e.g. 72): ").trim();
    while(!validateHeartRateBpm(heartratebpm)){
        heartratebpm = memberReadline.question("What is your heart rate in beats per min (e.g. 72): ").trim();
    }
    let bodyfatpercentage: string = memberReadline.question("What is your body fat percentage (e.g. 15.8): ").trim();
    while(!validateBodyFatPercentage(bodyfatpercentage)){
        bodyfatpercentage = memberReadline.question("What is your body fat percentage (e.g. 15.8): ").trim();
    }
    let bloodpressure: string = memberReadline.question("What is your blood pressure (e.g. 120/80): ").trim(); 
    while(!validateBloodPressure(bloodpressure)){
        bloodpressure = memberReadline.question("What is your blood pressure (e.g. 120/80): ").trim();
    }

    try{
        console.log("Adding new Health Metric...\n")
        await pool.query(
            `INSERT INTO healthmetric(memberid, heightfeet, weightlbs, heartratebpm, bodyfatpercentage, bloodpressure)
            VALUES ($1, $2, $3, $4, $5, $6)`, [memberid, heightfeet, weightlbs, heartratebpm, bodyfatpercentage, bloodpressure]
        );
        console.log("New Health Metric Added!\n");
    } catch(e: any){
        console.log(e.message);
    }   
}

async function createNewMember(){
    let fName: string = memberReadline.question("What is your first name: ").trim();
    let lName: string =  memberReadline.question("What is your last name: ").trim();
    while(fName === "" || lName === ""){
        if (fName === ""){
            console.log("Try again your first name can not be empty.") 
            fName = memberReadline.question("What is your first name: ").trim();    
        }

        if(lName === ""){
            console.log("Try again your last name can not be empty.") 
            lName=  memberReadline.question("What is your last name: ").trim();
        } 
    }
    let dateOfBirth: string = memberReadline.question("What is your date of birth (in format YYYY-MM-DD): ").trim();
    while(!validateDateOfBirth(dateOfBirth)){
        dateOfBirth = memberReadline.question  ("What is your date of birth (in format YYYY-MM-DD): ").trim(); 
    }
    let gender: string = memberReadline.question("What is your gender (male/female): ").trim().toLowerCase();
    while (gender !== "male" && gender !== "female") {
        console.log("Try again. Gender must be 'male' or 'female'.");   
        gender = memberReadline.question("What is your gender (male/female): ").trim().toLowerCase();
    }
    let phoneNumber: string = memberReadline.question("What is your phone number (in the format 123-456-7891): ").trim();
    while(!validatePhoneNumber(phoneNumber)) {
         phoneNumber= memberReadline.question("What is your phone number (in the format 123-456-7891): ").trim();
    }
    let email: string = memberReadline.question("What is your email (in the format myEmail@gmail.com): ").trim();
    while(!validateEmail(email)){
        email = memberReadline.question("What is your email (in the format myEmail@gmail.com): ").trim();    
    }
    
    try{
        console.log("Adding new member...\n")
        await pool.query(
            `INSERT INTO member (firstName, lastName, dateOfBirth, gender, phoneNumber, email)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [fName, lName, dateOfBirth, gender, phoneNumber, email]
        );
        console.log("New member added successfully!\n");
    } catch(e: any){
        console.log("ERROR: ", e.message);
    }
}