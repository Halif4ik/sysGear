import {stdin as input, stdout as output,} from 'node:process';
import inquirer, {Answers} from 'inquirer';

const rulesFile: string = 'db.json';

interface IUser {
    [key: string]: string | number | boolean
}

/*{"data": [{"user": "mike@mail.com", "rating": 20, "disabled": false},
{"user": "greg@mail.com", "rating": 14, "disabled": false},
{"user": "john@mail.com", "rating": 25, "disabled": true}],
"condition": {"exclude": [{"disabled": true}], "sortBy": ["rating"]}}*/
type TConditionsAndData = {
    "data": IUser[],
    "condition": {
        "include"?: IUser[],
        "exclude"?: IUser[],
        "sortBy": string[]
    }
}
type  TNewRules = {
    "distance": {
        "unit": string,
        "value": number
    },
    "convertTo": string
}

async function tookAndSorting(parsedData: TConditionsAndData, changedRules: string | null): Promise<IUser[]> {

    // Return the result
    return [{"user": "greg@mail.com", "rating": 14, "disabled": false},
        {"user": "mike@mail.com", "rating": 20, "disabled": false}];
}

async function getFromConsole(): Promise<Answers> {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'inputData',
            message: 'Enter condition and data in JSON :',
        },
        {
            type: 'input',
            name: 'additionalRule',
            message: 'Additional Extension: ',
            when: (answers: any) => answers.name !== '',
        }
    ])
}

/* inputData in format- {"condition": {"include": [{"name": "John"}], "sortBy": ["email"]}}  */
!async function run(): Promise<void> {
    // Get user input for distance and conversion
    const fromConsole: Answers = await getFromConsole();
    if (!fromConsole.inputData) {
        await run();
        // Get out from another functions wich has empty inputData
        return;
    }

    // Parse the user input
    const inputConditions: TConditionsAndData = JSON.parse(fromConsole.inputData);
    const conversionRulesParsed: TNewRules | null = fromConsole.additionalRule ? JSON.parse(fromConsole.additionalRule) : null;
    let result: IUser[] = [];

    // Combine user input with conversion rules with additional rules in file
    if (conversionRulesParsed) {
        /*temporary empty*/
    } else
        result = await tookAndSorting(inputConditions, null);

    // Display the result
    console.log(`Result: ${{'result': result}}`);
}()




