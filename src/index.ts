import {stdin as input, stdout as output,} from 'node:process';
import * as fs from 'node:fs';
import inquirer, {Answers} from 'inquirer';
import path from "path";

const rulesFile: string = 'conversion_rules.json';
type TInputData = {
    "distance": {
        "unit": string,
        "value": number
    },
    "convertTo": string
}
type  TConversionRules = {
    "distance": {
        "unit": string,
        "value": number
    },
    "convertTo": string
}

async function readRules(pathJoin: string): Promise<any> {
    // Load conversion rules from a JSON file
    const conversionRulesBuffer: Buffer = await fs.promises.readFile(pathJoin);
    const conversionRules = JSON.parse(conversionRulesBuffer.toString('utf-8'));
    return conversionRules;
}

async function convertDistance(parsedData: TInputData, pathJoin: string, changedRules: string | null): Promise<{
    unit: string,
    value: number
}> {
    const rules = changedRules ? JSON.parse(changedRules) : await readRules(pathJoin);

    // Perform the conversion based on the rules
    const conversionFactor = rules[parsedData.distance.unit][parsedData.convertTo];
    console.log('conversionFactor-', conversionFactor);
    const convertedValue = parsedData.distance.value * conversionFactor;

    console.log(`Result: `, {unit: parsedData.convertTo, value: parseFloat(convertedValue.toFixed(2))});
    // Return the result
    return {unit: parsedData.convertTo, value: parseFloat(convertedValue.toFixed(2))};
}

async function getFromConsole(): Promise<Answers> {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'inputData',
            message: 'Enter a JSON : ',
        },
        {
            type: 'input',
            name: 'additionalRule',
            message: 'Enter JSON for extend execution: ',
            when: (answers: any) => answers.name !== '',
        }
    ])
}

/* inputData in format- {"distance": {"unit": "mm", "value": 5000}, "convertTo": "m"}  */
!async function run(): Promise<void> {
    // Get user input for distance and conversion
    const fromConsole: Answers = await getFromConsole();
    if (!fromConsole.inputData) {
        await run();
        // Get out from another functions wich has empty inputData
        return;
    }
    const dirname: string = path.dirname(new URL(import.meta.url).pathname);
    const filePath: string = path.join(dirname, '../public');
    const pathJoin: string = path.join(filePath, rulesFile);

    // Parse the user input
    const inputDataParsed: TInputData = JSON.parse(fromConsole.inputData);
    const conversionRulesParsed: TConversionRules | null = fromConsole.additionalRule ? JSON.parse(fromConsole.additionalRule) : null;
    let result: { unit: string; value: number };
    // Combine user input with conversion rules with additional rules in file
    if (conversionRulesParsed) {
        const existRules = await readRules(pathJoin);
        await fs.promises.writeFile(pathJoin, JSON.stringify({...existRules, ...conversionRulesParsed}));
        result = await convertDistance(inputDataParsed, pathJoin, JSON.stringify({...existRules, ...conversionRulesParsed}));
    } else

        // Combine user input with conversion rules and perform the conversion
        result = await convertDistance(inputDataParsed, pathJoin, null);

    // Display the result
    console.log(`Converted distance: ${result.value} ${result.unit}`);
}()




