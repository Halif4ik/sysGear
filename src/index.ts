interface QuestionnaireConfig {
    [question: string]: string[];
}

interface Path {
    [question: string]: string;
}

interface Paths {
    number: number;
    list: Path[][];
}

interface Result {
    paths: Paths;
}

class Questionnaire {
    private config: QuestionnaireConfig;
    private paths: Path[][] = [];

    constructor(config: QuestionnaireConfig) {
        this.config = config;
    }


    private generatePaths(currentPath: Path[], remainingQuestions: string[]): void {
        if (remainingQuestions.length === 0) {
            this.paths.push(currentPath);
            return;
        }

        const currentQuestion = remainingQuestions[0];
        const possibleAnswers = this.config[currentQuestion];

        for (const answer of possibleAnswers) {
            currentPath.push({ [currentQuestion]: answer });
            const nextQuestions = remainingQuestions.slice(1);
            this.generatePaths(currentPath, nextQuestions);
            currentPath.pop();
        }
    }

    private getAllPaths(): Paths {
        const allPaths: Path[][] = [];
        const questions: string[] = Object.keys(this.config);
        console.log('Object.keys-',questions);
        for (const startingQuestion of questions) {
            this.generatePaths([], questions);
        }

        return {
            number: allPaths.length,
            list: allPaths,
        };
    }

    public runTest(): Result {
        this.paths = []; // Reset paths
        const result: Result = {
            paths: this.getAllPaths(),
        };
        return result;
    }
}

// Example usage
const config: QuestionnaireConfig = {
    "What is your marital status?": ["Single", "Married"],
    "Are you planning on getting married next year?": ["Yes", "No"],
    "How long have you been married?": ["Less than a year", "More than a year"],
    "Have you celebrated your one year anniversary?": ["Yes", "No"],
};

const questionnaire = new Questionnaire(config);
const testResult = questionnaire.runTest();
console.log(JSON.stringify(testResult, null, 2));




