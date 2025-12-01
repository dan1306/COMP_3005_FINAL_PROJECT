import { pool } from "./db/main"; 
import { validateEmail, validateDateTime } from "./validation";
// package for taking in terminal inputs
let trainerReadline = require("readline-sync");


interface trainer {
    trainerid: number;
    firstname: string;
    lastname: string;
    phonenumber: string;
    email: string;
}


export async function mainTrainerFunction() {
    let input: string;
    while(1){
        console.log("\n--- Trainer View ---\n");
        console.log(`1) Log in as a Trainer.\n`);
        console.log("2) Exit.\n")
        input = trainerReadline.question("Select an option: ").trim();
        console.log("")
    
        switch(input){
            case "1":
                await trainerLogin();        
                break;
            case "2":
                console.log("Exiting trainer view...\n");
                return;  // exit trainer loop
            default:
                console.log("Invalid Option");
                break;
        }
    }    


}


async function trainerLogin() {
    let email: string = trainerReadline.question("What is your email (in the format email@gmail.com): ").trim();
    console.log("");
    while(!validateEmail(email)){
        email = trainerReadline.question("What is your email (in the format email@gmail.com): ").trim();
        console.log("");    
    }

    try{
        let result = await pool.query(
            `SELECT *
            FROM trainer
            WHERE email = $1`,
            [email]
        );
        // console.log(result.rows); 
        if(result.rows.length == 0){
            console.log("   No trainer found with that email.\n");
        } else {
            await trainerView(result.rows[0])
        }
    } catch(e: any){
        console.log(`   Error: ${e.message}\n`);        
    }
}

async function trainerView(trainerData: trainer) {
    let inputTrainerView: string = "";
    
    while(1){
        console.log("\n--- Available Trainer Functionality ---\n");
        console.log(`1) Add Availability.\n`);
        console.log("2) View Schedule.\n");
        console.log("3) Member Lookup.\n");
        console.log("4) Logout.\n")
        inputTrainerView = trainerReadline.question("Select an option: ").trim();
        
        switch (inputTrainerView) {

            case "1":
                // Add Availability
                await addTrainerAvailability(trainerData.trainerid);
                break;

            case "2":
                // View Schedule
                await viewUpcomingClasses(trainerData.trainerid);
                break;
            case "3":
                // Member Lookup
                await memberLookup();
                break;
            case "4":
                console.log("Logging out...\n");
                return;  // exit member loop

            default:
                console.log("Invalid option. Try again.\n");
                break;
        }
    }

}

async function viewUpcomingClasses(trainerid: number) {
    await viewTrainerAvailability(trainerid);
    try {
        let result = await pool.query(
            `SELECT 
                c.classsessionid,
                c.sessionname,
                c.sessionstarttime,
                c.sessionendtime,
                r.building,
                r.roomnumber
            FROM classsession c
            JOIN room r ON c.roomid = r.roomid
            WHERE c.trainerid = $1
            ORDER BY c.sessionstarttime`,
            [trainerid]
        );

        if (result.rowCount === 0) {
            console.log("\nYou have no upcoming classes.\n");
            return;
        }

        console.log("\n--- Trainer Upcoming Classes ---\n");
        let count: number = 1;
        for(let i of result.rows){
            console.log(
                `${count}) ${i.sessionname} | ` +
                `${i.sessionstarttime} - ${i.sessionendtime} | ` +
                `${i.building} ${i.roomnumber}\n`
            );
            count++;
        }; 

    } catch (e: any) {
        console.log(`Error: ${e.message}\n`);
    }
}


async function addTrainerAvailability(trainerid: number) {
    await viewTrainerAvailability(trainerid);
    console.log("\n--- Conflicts are not permitted ---\n");
    let startTime: string = trainerReadline.question("What is your start time (YYYY-MM-DD HH:MM): ").trim();
    console.log("");
    while (!validateDateTime(startTime)) {
        startTime = trainerReadline.question("What is your start time (YYYY-MM-DD HH:MM): ").trim();
        console.log("");
    }

    let endTime = trainerReadline.question("What is your end time (YYYY-MM-DD HH:MM): ").trim();
    console.log("");
    while (!validateDateTime(endTime)) {
        endTime = trainerReadline.question("What is your end time (YYYY-MM-DD HH:MM): ").trim();
        console.log("");
    }

    if (new Date(startTime) >= new Date(endTime)) {
        console.log("   End time must be AFTER start time.\n");
        return;
    }

    try {
        const overlapCheck = await pool.query(
            `SELECT * FROM traineravailability
             WHERE trainerid = $1
             AND availabilitystarttime < $3
             AND availabilityendtime > $2`,
            [trainerid, startTime, endTime]
        );

        if (overlapCheck.rowCount > 0) {
            console.log("   This availability comes in conflict with existing availabilities.\n");
            return;
        }

        // Insert new availability
        await pool.query(
            `INSERT INTO traineravailability (trainerid, availabilitystarttime, availabilityendtime)
             VALUES ($1, $2, $3)`,
            [trainerid, startTime, endTime]
        );

        console.log("   Availability added successfully!\n");

    } catch (err: any) {
        console.log(`   Error: ${err.message}`);
    }
}

async function viewTrainerAvailability(trainerid: number) {
    console.log("\n--- Your Availability Schedule ---\n");

    try {
        let result = await pool.query(
            `SELECT
                availabilityid, 
                availabilitystarttime,
                availabilityendtime
             FROM traineravailability
             WHERE trainerid = $1
             ORDER BY availabilitystarttime`,
            [trainerid]
        );

        if (result.rowCount === 0) {
            console.log("You have not yet set your availability.\n");
            return;
        }

        for (let i of result.rows) {
            console.log(
                `ID: ${i.availabilityid} | ` +
                `Start: ${i.availabilitystarttime} | ` +
                `End:   ${i.availabilityendtime}`
                
            );
            console.log("");
        }

        // console.log("");

    } catch (err: any) {
        console.log(`   Error: ${err.message}`);
    }
}


async function memberLookup() {
    console.log("\n--- Member Lookup ---\n");

    let searchQuery = trainerReadline.question("Enter member name for lookup: ").trim();
    if (searchQuery === "") {
        console.log("Query cannot be empty.\n");
        return;
    }
    console.log("");

    try {
        console.log("---\n Searching for a member with the provided name (case-insensitive) ---\n");

        let foundMembers = await pool.query(
            `SELECT *
             FROM member
             WHERE LOWER(firstname || ' ' || lastname) LIKE '%' ||  LOWER($1) ||  '%'`,
            [searchQuery]
        );

        if (foundMembers.rowCount === 0) {
            console.log("No members found matching that name.\n");
            return;
        }

        console.log("\n--- Matches ---\n");
        for (let m of foundMembers.rows) {
            console.log(`MemberID: ${m.memberid} | ${m.firstname} ${m.lastname} | ${m.email}`);
        }

        let decision = trainerReadline.question("\nEnter MemberID to view their details (leave blank to cancel): ").trim();
        if (decision === "") return;

        let decisionid = Number(decision);
        if (isNaN(decisionid)) {
            console.log("MemberID is Invalid.\n");
            return;
        }

        let foundSelectedOption = foundMembers.rows.find((m: any) => m.memberid === decisionid);
        if (!foundSelectedOption) {
            console.log("MemberID is not in the Database.\n");
            return;
        }

        console.log(`\n--- Details for ${foundSelectedOption.firstname} ${foundSelectedOption.lastname} ---\n`);

        console.log(`\n--- Getting recent fitness goal ---\n`);
        let recentGoal = await pool.query(
            `SELECT *
             FROM fitnessgoals
             WHERE memberid = $1
             ORDER BY datelogged DESC
             LIMIT 1`,
            [decisionid]
        );

        if (recentGoal.rowCount === 0) {
            console.log("\nNo recent fitness goals to show for selected member.");
        } else {
            let recent = recentGoal.rows[0];
            console.log("\nRecent Fitness Goal:");
            console.log(`Goal: ${recent.goal}`);
            console.log(`Description: ${recent.description}`);
            console.log(`Achieved: ${recent.achieved ? "Yes" : "No"}`);
            console.log(`Date Logged: ${recent.datelogged}`);
            console.log(`Date Achieved: ${recent.dateachieved === null ? "Not achieved yet" : recent.dateachieved}`);
        }

        console.log(`\n--- Most recent health metric ---\n`);
        const recentMetric = await pool.query(
            `SELECT *
             FROM healthmetric
             WHERE memberid = $1
             ORDER BY timerecorded DESC
             LIMIT 1`,
            [decisionid]
        );

        if (recentMetric.rowCount === 0) {
            console.log("\nNo health metrics recorded.\n");
        } else {
            let recentH = recentMetric.rows[0];
            console.log(`Date: ${recentH.daterecorded} ${recentH.timerecorded}`);
            console.log(`Height: ${recentH.heightfeet} ft`);
            console.log(`Weight: ${recentH.weightlbs} lbs`);
            console.log(`Heart Rate: ${recentH.heartratebpm} bpm`);
            console.log(`Body Fat: ${recentH.bodyfatpercentage}%`);
            console.log(`Blood Pressure: ${recentH.bloodpressure}`);
        }

        console.log("\n(No writes or update rights.)\n");

    } catch (e: any) {
        console.log("Error:", e.message);
    }
}
