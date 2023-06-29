// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function getDirectories(filesToSearch: string[], fsPath: string) {
  const directories: string[] = [];
  const files: string[] = [];

  filesToSearch.forEach((file) => {
    const filePath = path.join(fsPath, file);

    console.log(filePath);

    if (fs.statSync(filePath).isDirectory()) {
      const directory = filePath.slice(filePath.lastIndexOf('\\') + 1);
      console.log(directory);
      directories.push(directory);
    } else {
      console.log(file);
      files.push(file);
    }
  });

  console.log(directories);
  console.log(files);

  return { directories, files };
}

function getFolders() {
  const folders = vscode.workspace.workspaceFolders;
  const fsPaths: string[] = [];

  if (!folders) {
    return undefined;
  }

  console.log(folders);

  return folders.reduce<{
    directories: string[];
    files: string[];
    fsPaths: string[];
  }>(
    (acc, folder) => {
      const { fsPath } = folder.uri;
      const filesOfFolder = fs.readdirSync(fsPath);
      console.log(filesOfFolder);
      const { directories, files } = getDirectories(filesOfFolder, fsPath);

      console.log(filesOfFolder);
      console.log(fsPath);
      console.log(folder.uri);

      fsPaths.push(fsPath);

      return {
        directories: [...acc.directories, ...directories],
        files: [...acc.files, ...files],
        fsPaths: [...acc.fsPaths, fsPath],
      };
    },
    { directories: [], files: [], fsPaths: [] }
  );
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const generateCommand = vscode.commands.registerCommand(
    'template-generator.generate',
    async () => {
      const folders = getFolders();

      if (folders) {
        const { directories, fsPaths } = folders;
        const folder = await vscode.window.showQuickPick(directories, {
          canPickMany: false,
          placeHolder: 'Select the location to generate the template',
        });

        if (folder) {
          vscode.window.showInformationMessage(
            `You selected: ${folder} which is in ${fsPaths[0]}`
          );

          const selectedDirectory = await vscode.workspace.fs.readDirectory(
            vscode.Uri.file(`${fsPaths[0]}/${folder}`)
          );
          const sub = selectedDirectory.map(([item]) => item);
          const { directories } = getDirectories(
            sub,
            `${fsPaths[0]}/${folder}`
          );
          const f = await vscode.window.showQuickPick(directories, {
            canPickMany: false,
            placeHolder: 'Select the location to generate the template',
          });
        }
      } else {
        vscode.window.showInformationMessage(
          'No files found in the current workspace'
        );
      }
    }
  );

  context.subscriptions.push(generateCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
