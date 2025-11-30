export function validateNumber(x: string): boolean{
    let regexNumber = /^[0-9]+$/;
    if(!regexNumber.test(x)){
        return false;        
    }
    return true
}

export function validateEmail(email:string): boolean {
    let errMsg: string = "  Try again, email can not be empty.\n"; 
    if(email == ""){
        console.log(errMsg);
        return false;
    }

    let regex_for_validating_emails = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    errMsg = "   Invalid email format, try again.\n";
    if(!regex_for_validating_emails.test(email)){
        console.log(errMsg);
        return false;
    }

    return true;

}

export function validateDateOfBirth(dateOfBirth: string): boolean {
    // Must match YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(dateOfBirth)) {
        console.log("Try again. Invalid date format. Must be in the form YYYY-MM-DD.\n");
        return false;
    }

    const date = new Date(dateOfBirth);

    // Check if the date object is valid
    if (isNaN(date.getTime())) {
        console.log("Try again. Invalid date. Please enter a real calendar date.\n");
        return false;
    }

    // Age validation
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();

    if (age < 10 || age > 91) {
        console.log("Try again. Invalid date of birth. Age must be between 10 and 91, not inclusive.\n");
        return false;
    }

    return true;
}

export function validatePhoneNumber(phoneNumber: string): boolean {
    // Removes non-digits chars spaces, dashes, parentheses
    const digits = phoneNumber.replace(/\D/g, "");  

    if (digits.length !== 10) {
        console.log("Try again. Invalid phone number. Must be 10 digits (e.g., 123-456-7891).\n");
        return false;
    }

    return true;
}

export function validateHeightInFeet(heightFeet: string): boolean {

    const heightRegEx = /^[0-9]+(\.[0-9]{1,2})?$/;
    
    if (!heightRegEx.test(heightFeet)){
        console.log("Try again. Invalid height format. Example: 5.92\n");
        return false;
    }
    
    return true;
}

export function validateWeightLBS(weightLBS: string): boolean {

    const weightRegEx = /^[0-9]+(\.[0-9]{1,2})?$/;
    
    if (!weightRegEx.test(weightLBS)){
        console.log("Try again. Invalid weight format. Example: 180.12\n");
        return false;
    }
    
    return true;
}

export function validateHeartRateBpm(heartRateBpm: string): boolean {

    const heartRateBpmRegEx = /^[0-9]{2,3}$/;
    
    if (!heartRateBpmRegEx.test(heartRateBpm)){
        console.log(`Try again. Heart rate must be a positive 2–3 digit number, e.g. 72\n`);
        return false;
    }
    
    return true;
}

export function validateBodyFatPercentage(bodyFat: string): boolean {

    const bodyFatRegEx = /^([0-9]|[1-9][0-9]|100)(\.[0-9]{1,2})?$/;

    if (!bodyFatRegEx.test(bodyFat)) {
        console.log(`Try again. Body fat must be a number between 0 and 100 (e.g. 19.8)\n`);
        return false;
    }

    return true;
}


export function validateBloodPressure(bp: string): boolean {

    const bpRegEx = /^[0-9]{2,3}\/[0-9]{2,3}$/;

    if (!bpRegEx.test(bp)) {
        console.log(`Try again. Blood pressure must be in the format, for example 120/80\n`);
        return false;
    }

    return true;
}

export function validateDateTime(dateTime: string): boolean {
    let dateTimeRegEx = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

    if (!dateTimeRegEx.test(dateTime)) {
        console.log("   Invalid Date Time format (Must be in the form YYYY-MM-DD HH:MM)\n");
        return false;
    }

    return true;
}