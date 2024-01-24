import inquirer, {Answers} from 'inquirer';

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

function applyCondition(data: IUser[], condition: TConditionsAndData['condition']): IUser[] {
    if (condition.include) {
        data = data.filter((item: IUser) => condition.include!.some((rule: IUser) =>
            Object.entries(rule).every(([key, value]) => item[key] === value)));
        console.log('INC applyCondition-', data);
    }

    if (condition.exclude) {
        data = data.filter(item => !condition.exclude!.some(rule =>
            Object.entries(rule).every(([key, value]) => item[key] === value)));
        console.log('EXc applyCondition-', data);
    }
    return data;
}

function sortByKeys(arrUsers: IUser[], sortKeys: string[]): IUser[] {
    console.log('sortBy-', sortKeys);
    return arrUsers.sort((aUser: IUser, bUser: IUser): number => {
        for (const sorKey of sortKeys) {
            const comparison: number = String(aUser[sorKey]).localeCompare(String(bUser[sorKey]),
                undefined, {numeric: true});
            if (comparison !== 0) return comparison;
        }
        return 0;
    });
}

function tookAndSorting(parsedData: TConditionsAndData, changedRules: string | null): IUser[] {
    let users: IUser[] = parsedData.data;
    console.log('users-', parsedData.data);

    if (parsedData.condition) {
        users = applyCondition(users, parsedData.condition);
    }
    console.log('Before -', users);
    if (parsedData.condition?.sortBy) {
        users = sortByKeys(users, parsedData.condition.sortBy);
        console.log('SORTED-', users);
    }
    return users;
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
    // Get users
    const fromConsole: Answers = await getFromConsole();
    if (!fromConsole.inputData) {
        await run();
        // Get out from another functions wich has empty inputData
        return;
    }

    // Parse the user input
    const inputConditions: TConditionsAndData = JSON.parse(fromConsole.inputData);
    const conversionRulesParsed: TNewRules | null = fromConsole.additionalRule ? JSON.parse(fromConsole.additionalRule) : null;

    // Combine user input with conversion rules with additional rules in file
    let result: IUser[] = [];
    if (conversionRulesParsed) {
        /*temporary empty*/
    } else
        result = await tookAndSorting(inputConditions, fromConsole.additionalRule);

    // Display the result
    console.log('{result:',result,'}');
}()




