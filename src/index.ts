import inquirer, {Answers} from 'inquirer';

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

interface IAllPossiblePath {
    paths: {
        number: number
        list: Array<TQuestionAnswer>[]
    }

}

type TQuestionAnswer = {
    [key: string]: string
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
                showIf: questAndData[question].showIf,
                parent: undefined
            }

            /*find parent for paste child node*/
            const parent: TreeNode | undefined = findParent(resultTree, questAndData[question].parent);
            if (!parent) throw new Error('Parent node not found!');

            /*create relations*/
            if (parent.answers[0] === questAndData[question].showIf) parent.childLeft = childNode;
            else parent.childRight = childNode;
            childNode.parent = parent;
        }
    });
    return resultTree;
}

function findParent(currentLeaf: TreeNode, parentQuestion: string): TreeNode | undefined {
    if (currentLeaf.question === parentQuestion) return currentLeaf;
    else {
        if (currentLeaf.childLeft) {
            const foundParent: TreeNode | undefined = findParent(currentLeaf.childLeft, parentQuestion);
            if (foundParent) return foundParent;
        }
        if (currentLeaf.childRight) {
            const foundParent: TreeNode | undefined = findParent(currentLeaf.childRight, parentQuestion);
            if (foundParent) return foundParent;
        }
    }
    return undefined;
}

function calculateAllPathRecursion(currentNode: TreeNode | undefined, listPaths: TQuestionAnswer[], result: IAllPossiblePath): IAllPossiblePath | undefined {
    /*if undefined  we saved path in result enr return on one level in recursion */
    if (!currentNode) {
        result.paths.list.push([...listPaths]);
        result.paths.number++;
        return result;
    }
    /*this lead doesn't have ANY child we placed in down this branch and can paste it leaf and go out upper*/
    else if (!currentNode.childLeft && !currentNode.childRight) {
        listPaths.push({[currentNode.question]: `${currentNode.answers[0]}/${currentNode.answers[1]}`});
        result.paths.list.push(listPaths);
        result.paths.number++;
    }     else if (!currentNode.childLeft) {
        listPaths.push({[currentNode.question]: `${currentNode.answers[0]}`});
        calculateAllPathRecursion(currentNode.childLeft, listPaths, result);
        listPaths.pop();
    } else if (!currentNode.childRight) {
        listPaths.push({[currentNode.question]: `${currentNode.answers[1]}`});
        calculateAllPathRecursion(currentNode.childLeft, listPaths, result);
        listPaths.pop();
    }

    if (currentNode.childLeft) {
        const newPath: TQuestionAnswer[] = [...listPaths];
        newPath.push({[currentNode.question]: currentNode.answers[0]});
        calculateAllPathRecursion(currentNode.childLeft, newPath, result);
    }
    /*try another brunch*/
    if (currentNode.childRight) {
        const newPath: TQuestionAnswer[] = [...listPaths];
        newPath.push({[currentNode.question]: currentNode.answers[1]});
        calculateAllPathRecursion(currentNode.childRight, newPath, result);
    }
    return result;
}

function calculateAllPath(currentTree: TreeNode): IAllPossiblePath {
    const allPossiblePath: IAllPossiblePath = {
        paths: {
            number: 0,
            list: []
        }
    }
    const listData: TQuestionAnswer[] = [];
    const resAllPosPath: IAllPossiblePath | undefined = calculateAllPathRecursion(currentTree, listData, allPossiblePath);
    if (!resAllPosPath) throw new Error('Error calculateAllPathRecursion');
    return resAllPosPath;
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
    const resultTree: TreeNode = buildTree(inputConditions);

    /*go around tree and count all path and var*/
    const resultPath: IAllPossiblePath = calculateAllPath(resultTree);
    console.log('RESULT:');
    console.log(JSON.stringify(resultPath, null, 2));
    // Display the result

}()









