import inquirer, {Answers} from 'inquirer';

interface IUser {
    [key: string]: string | number | boolean
}

type TAnswersParent = {
    [key: string]: { answ: string[], showIf: string, parent: string }
}

interface TreeNode {
    question: string
    answers: string[]
    childLeft?: TreeNode
    childRight?: TreeNode
    parent?: TreeNode
    showIf: string
}

async function getFromConsole(): Promise<Answers> {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'inputData',
            message: 'Enter dependency in JSON :',
        }
    ])
}

/*incoming - {
  'What is your marital status?': { answ: [ 'Single', 'Married' ], parent: '', showIf: '' },
  'Are you planning on getting married next year?': {
    answ: [ 'Yes', 'No' ],
    showIf: 'Single',
    parent: 'What is your marital status?'
  },
  'How long have you been married?': {
    answ: [ 'Less than a year', 'More than a year' ],
    showIf: 'Married',
    parent: 'What is your marital status?'
  },
  'Have you celebrated your one year anniversary?': {
    answ: [ 'Yes', 'No' ],
    showIf: 'More than a year',
    parent: 'How long have you been married?'
  }
}
*/
function buildTree(questAndData: TAnswersParent): TreeNode {
    const resultTree: TreeNode = {
        question: '',
        showIf: '',
        answers: []
    };
    const questions: string[] = Object.keys(questAndData);

    /*"What is your marital status?"*/
    questions.forEach((question: string) => {
        /*find and paste root node it will be once*/
        if (!resultTree.question) {
            const root: TreeNode | undefined = questAndData[question].parent === '' ? {
                question,
                answers: questAndData[question].answ,
                showIf: questAndData[question].showIf
            } : undefined;
            if (root) {
                resultTree.question = root.question;
                resultTree.answers = root.answers;
            } else throw new Error('Root node not found!');
        } else {
            /*cteate one chlidNode*/
            const childNode: TreeNode = {
                question,
                answers: questAndData[question].answ,
                showIf: questAndData[question].showIf
            }

            /*find parent for paste child node*/
            const parent: TreeNode = findParent(resultTree, questAndData[question].parent);

            /*paste child node*/
            if (parent.answers[0] === questAndData[question].showIf) {
                parent.childLeft = childNode;
            } else {
                parent.childRight = childNode;
            }
        }
    });
    return resultTree;
}

function findParent(currentLeaf: TreeNode, parentQuestion: string): TreeNode | undefined {
    if (currentLeaf.question === parentQuestion) return currentLeaf;
    else {
        if (currentLeaf.childLeft) {
            const result: TreeNode | undefined = findParent(currentLeaf.childLeft, parentQuestion);
            if (result) return result;
        }
        if (currentLeaf.childRight) {
            const result: TreeNode | undefined = findParent(currentLeaf.childRight, parentQuestion);
            if (result) return result;
        }
    }
    return undefined;
}

!async function run(): Promise<void> {
    const fromConsole: Answers = await getFromConsole();
    /* Recheck console and get out from another functions which has empty inputData*/
    if (!fromConsole.inputData) {
        await run();
        return;
    }

    // Parse the user input
    const inputConditions: TAnswersParent = JSON.parse(fromConsole.inputData);

    /*build Huffman Tree dependencies*/
    const result: TreeNode = buildTree(inputConditions);
    console.log(JSON.stringify(result, null, 2));
    // Display the result
    console.log('{result:', result, '}');
}()









