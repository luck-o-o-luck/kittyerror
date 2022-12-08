import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "kittyerror" is now active!');

	const provider = new CustomSidebarViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		  CustomSidebarViewProvider.viewType,
		  provider
		)
	);
}

class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "kittyerror.openview";
  
	private _view?: vscode.WebviewView;
  
	constructor(private readonly _extensionUri: vscode.Uri) {}
  
	resolveWebviewView(
	  webviewView: vscode.WebviewView
	): void | Thenable<void> {
	  this._view = webviewView;
  
	  webviewView.webview.options = {
		// Allow scripts in the webview
		enableScripts: true,
		localResourceRoots: [this._extensionUri],
	  };
  
	  webviewView.webview.html = this.getHtmlContent(webviewView.webview, 0);
  
	  // This is called every second is decides which doom face to show in the webview
	  setInterval(() => {
		let errors = getNumErrors();
		if (errors[0] === 0 && errors[1] === 0) {
		  webviewView.webview.html = this.getHtmlContent(webviewView.webview, 0);
		} else {
		  webviewView.webview.html = this.getHtmlContent(webviewView.webview, 2);
		}
	  }, 1000);
	}
  
	private getHtmlContent(webview: vscode.Webview, picNumber: number): string {
	  const stylesheetUri = webview.asWebviewUri(
		vscode.Uri.joinPath(this._extensionUri, "assets", "main.css")
	  );
  
	  const kittyFace = webview.asWebviewUri(
		vscode.Uri.joinPath(this._extensionUri, "assets", "kitty" + String(picNumber) + ".png")
	  );
  
	  return getHtml(kittyFace);
	}
}
  
function getHtml(kitty: any) {
	return `
		<!DOCTYPE html>
				<html lang="en">
				<head>
				</head>
				<body>
				<section class="wrapper">
		<img class="kitties" src="${kitty}" alt="" >
		<h1 id="errorNum">${getTextForErrorNumbers()}</h1>
		<ul> ${getTextForErrorLines()} </ul>

		<h1 id="errorNum">${getTextForWarningsNumbers()}</h1>
		<ul> ${getTextForWarningLines()} </ul>
				</section>
		</body>
			</html>
	`;
}

function getTextForErrorNumbers() {
	var errorNumber = getNumErrors();

	if(errorNumber[0] === 0 && errorNumber[1] === 0) {
		return "No errors and warnings in this file. You're a good kitty!";
	} else {
		return "You have " + errorNumber[0] + " errors in this file. You're a bad kitty!";
	}
}

function getTextForWarningsNumbers() {
	var errorNumber = getNumErrors();

	if(errorNumber[1] !== 0) {
		return "You have " + errorNumber[1] + " warnings in this file. You're a naughty kitty!";
	}
	else if (errorNumber[1] === 0 && errorNumber[0] !== 0){
		return "You have " + errorNumber[1] + " warnings in this file. You're a good kitty!";
	}
	else {
		return " ";
	}
}

function getTextForErrorLines() {
	var errorLines = getErrorLines();

	if(errorLines.size !== 0) {
		var text = "";
		errorLines.forEach((value, key) => {
			text += "<li>Line " + (key + 1) + " has " + (value) + " errors.</li>";
		});
		return text;
	} else {
		return "";
	}
}

function getTextForWarningLines() {
	var errorLines = getWarningLines();

	if(errorLines.size !== 0) {
		var text = "";
		errorLines.forEach((value, key) => {
			text += "<li>Line " + (key + 1) + " has " + (value) + " warning.</li>";
		});
		return text;
	} else {
		return "";
	}
}

function getNumErrors(): [number, number] {
	const activeTextEditor: vscode.TextEditor | undefined =
		vscode.window.activeTextEditor;

	if (!activeTextEditor) {
		return [0, 0];
	}

	const document: vscode.TextDocument = activeTextEditor.document;

	let numErrors = 0;
	let numWarnings = 0;

	let diagnostic: vscode.Diagnostic;

	// Iterate over each diagnostic that VS Code has reported for this file. For each one, add to
	// a list of objects, grouping together diagnostics which occur on a single line.
	for (diagnostic of vscode.languages.getDiagnostics(document.uri)) {
		switch (diagnostic.severity) {
		case 0:
			numErrors += 1;
			break;

		case 1:
			numWarnings += 1;
			break;
		}
	}

	return [numErrors, numWarnings];
}

function getErrorLines(): Map<number, number> {
	const activeTextEditor: vscode.TextEditor | undefined =
		vscode.window.activeTextEditor;

	if (!activeTextEditor) {
		return new Map<number, number>();
	}

	const document: vscode.TextDocument = activeTextEditor.document;

	let aggregatedDiagnostics = new Map<number, number>();

	let diagnostic: vscode.Diagnostic;

	// Iterate over each diagnostic that VS Code has reported for this file. For each one, add to
	// a list of objects, grouping together diagnostics which occur on a single line.
	for (diagnostic of vscode.languages.getDiagnostics(document.uri)) {
		if (diagnostic.severity === 0) {
		let key = diagnostic.range.start.line;

		if (aggregatedDiagnostics.has(key)) {
			// get value and add 1
			var value = aggregatedDiagnostics.get(key);
			if (value) {
				aggregatedDiagnostics.set(key, value + 1);
			}
		} else {
			aggregatedDiagnostics.set(key, 1);
		}
	}
	}

	return aggregatedDiagnostics;
}

function getWarningLines(): Map<number, number> {
	const activeTextEditor: vscode.TextEditor | undefined =
		vscode.window.activeTextEditor;

	if (!activeTextEditor) {
		return new Map<number, number>();
	}

	const document: vscode.TextDocument = activeTextEditor.document;

	let aggregatedDiagnostics = new Map<number, number>();

	let diagnostic: vscode.Diagnostic;

	// Iterate over each diagnostic that VS Code has reported for this file. For each one, add to
	// a list of objects, grouping together diagnostics which occur on a single line.
	for (diagnostic of vscode.languages.getDiagnostics(document.uri)) {
		if (diagnostic.severity === 1) {
		let key = diagnostic.range.start.line;

		if (aggregatedDiagnostics.has(key)) {
			// get value and add 1
			var value = aggregatedDiagnostics.get(key);
			if (value) {
				aggregatedDiagnostics.set(key, value + 1);
			}
		} else {
			aggregatedDiagnostics.set(key, 1);
		}
	}
	}

	return aggregatedDiagnostics;
}

export function deactivate() {}
