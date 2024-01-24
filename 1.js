import {stdin as input, stdout as output,} from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import inquirer from 'inquirer';


async function createUser() {
  const createdUser = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter a name. To cancel Press Enter: ',
    },
  ])
  return createdUser;
}


!async function run() {
  const createdUser = await createUser();
  console.log('Hello-.', createdUser);
}()




