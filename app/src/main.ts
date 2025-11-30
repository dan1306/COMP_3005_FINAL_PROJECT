import {mainMemberFunction} from './member'
import {mainTrainerFunction} from './trainer'
import {mainAdminFunction} from "./admin"
// package for taking in terminal inputs
let readline = require("readline-sync");

/*
The function main is the main loop for the program
which maps user choices to their designated CRUD operations.
*/
async function main() {
  
  while(1){
    console.log("\n--- Select User Type ---\n");
    console.log(`1) Member.\n`);
    console.log(`2) Trainer.\n`);
    console.log(`3) Admin.\n`);
    console.log(`4) End Program.\n`)
    const input = readline.question("Select the type of User you are, or end the program: ").trim();
    console.log("")
    
    switch(input){
      case "1":
        await mainMemberFunction();        
        break;
      case "2":
        await mainTrainerFunction();
        break;
      case "3":
        await mainAdminFunction();
        break;
      case "4":
        console.log("Ending program.");
        return;
      default:
        console.log("Invalid Option");
        break;
    }
  }    

}

main();

