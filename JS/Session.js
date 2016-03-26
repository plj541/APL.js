var thisInput, thisOutput, thisAPL, thisKeyboard
var thisContext = thisLog = thisPrompt = thisLast = ""
var thisClean = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"

function loadAPL(aContext) {
 //  Create a new APL workspace, and load thisContext
 var myInclude = ""
 thisAPL = apl.ws({out: quadOutput, in: quadInput})
 thisContext = aContext.trim()
 thisAPL(_PRELUDE_)  // I know this looks dumb, but it insures name isolation!
 if (thisContext.length == 0) return ""
 if (thisContext.substring(0, 9) == "#include ") {
  myInclude = thisContext.split("\n")[0].substring(9).trim()
  myInclude = _LIB_[myInclude]
 }
 return thisAPL(myInclude + thisContext).toString()
}

function callAPL(anExpression) {
 //  Evaluate an APL expression in the current context
 return thisAPL(anExpression).toString()
}

var thisCompose = false
var thisDebug = false
var thisKey = 0
var thisMap = {
 "`": "`",		"~": "⍨",
 "1": "¨",		"!": "∞",
 "2": "¯",		"@": "⍁",
 "3": "<",		"#": "⍂",
 "4": "≤",		"$": "⍠",
 "5": "=",		"%": "≈",
 "6": "≥",		"^": "⌸",
 "7": ">",		"&": "⍯",
 "8": "≠",		"*": "⍣",
 "9": "∨",		"(": "⍱",
 "0": "∧",		")": "⍲",
 "-": "÷",		"_": "≢",
 "=": "×",		"+": "≡",
 "q": "q",		"Q": "⌹", 
 "w": "⍵",		"W": "⍹",
 "e": "∊",		"E": "⍷",
 "r": "⍴",		"R": "⍤",
 "t": "~",		"T": "⍭",
 "y": "↑",		"Y": "Y",
 "u": "↓",		"U": "⊖",
 "i": "⍳",		"I": "⍸",
 "o": "○",		"O": "⍬",
 "p": "⍟",		"P": "⌽",
 "[": "←",		"{": "⊣",
 "]": "→",		"}": "⊢",
 "\\": "⍀",		"|": "⍉",
 "a": "⍺",		"A": "⍶",
 "s": "⌈",		"S": "S",
 "d": "⌊",		"D": "D",
 "f": "f",		"F": "F",
 "g": "∇",		"G": "⍒",
 "h": "∆",		"H": "⍋",
 "j": "∘",		"J": "⍝",
 "k": "k",		"K": "K",
 "l": "⎕",		"L": "⍞",
 ";": "⋄",		":": "⍮",
 "z": "⊂",		"Z": "⊆",
 "x": "⊃",		"X": "⊇",
 "c": "∩",		"C": "⋔",
 "v": "∪",		"V": "⍦",
 "b": "⊥",		"B": "⍎",
 "n": "⊤",		"N": "⍕",
 "m": "∣",		"M": "⌷",
 ",": "⍪",		"<": "«",
 ".": ".",		">": "»",
 "/": "⌿",		"?": "↗"
}

function runInputs(anEvent) {
  if (thisDebug) {
    thisOutput.value += "Event:  " + anEvent.keyCode + "\n"
  }

  if (thisCompose) {
    anEvent.preventDefault()
    thisCompose = false
    thisInput.style.backgroundColor = "White"
    var myValue = thisInput.value
    var myStart = thisInput.selectionStart
    var myEnd   = thisInput.selectionEnd
    var myChar  = String.fromCharCode(anEvent.keyCode)
    myChar = thisMap[myChar] || myChar
    thisInput.value = myValue.slice(0, myStart) + 
      myChar + myValue.slice(myEnd)
    thisInput.selectionStart =
      thisInput.selectionEnd = myStart + 1
  } else if (anEvent.keyCode == thisKey) {
    anEvent.preventDefault()
    thisCompose = true
//  http://www.w3schools.com/cssref/pr_background-color.asp
//  http://www.w3schools.com/cssref/css_colornames.asp
    thisInput.style.backgroundColor = "Yellow"
  } else {
    runInput(anEvent)
  }
}

function runInput(anEvent) {
  if (anEvent.keyCode == 13) {
    var myRequest
    anEvent.preventDefault()
    myRequest = thisInput.value.trim()
    thisInput.value = ""
    if (myRequest.indexOf("\n") == -1) {
      runLine(myRequest)
    } else {
      addOutput("   ⍝   NB.  The lines below are a comment!\n" +
      myRequest + "\n   ⍝   NB.  The lines above are a comment!")
      thisInput.focus()
    }
  }
}

function runLine(aRequest) {
 if (aRequest.length != 0) {
  try {
   addOutput("\n" + "   " + aRequest)
   thisInput.focus()
   if (aRequest.substring(0, 1) == ")") {
    addOutput(runCommand(aRequest.substring(1).trim()))
   } else {
    thisLast = aRequest
    if (aRequest.substring(0, 1) == "}") {
     keepStatement(defineActive(aRequest.substring(1).trim()))
	 } else {
	  addOutput(callAPL(aRequest))
	  keepStatement(aRequest)   // NB.  Only keep when successful
    }
   }
  } catch (err) {
   addOutput(err)
  }
 }
 thisInput.focus()
}

function keepStatement(aRequest) {
 thisLog += aRequest + "\n"
}

function defineActive(aRequest) {
 // } a list of names
 var myParts, myActive, myNames, myItem, myParts
 myParts = deDupBlanks(aRequest).split(" ")
 myActive = "get_X← {«ValueOf('X')»}\n" +
          "set_X← {«ValueOf('X', _w)»}\n"
 myNames = ""
 for (var myItem=0; myItem < myParts.length; myItem++) {
  myNames += myActive.replace(/X/g, myParts[myItem].trim()) 
 }
 callAPL(myNames)
 return myNames
}	

function runCommand(aCommand) {
 var myName, myIndex, myParts, myLib
 myName = aCommand
 if (aCommand == "help") {
  return "\n" +
   ")load     Restart calculations in a name space\n" +
   ")copy     Add a name space to further calculations\n" +
   ")save     Preserve a name space\n" +
   ")drop     Remove a name space\n" +
   ")lib      List the name spaces for  )load  or  )copy\n" +
   ")fetch    List, or with a name, fetch a name space from an external file\n" +
   ")clear    Restart calculations with no name space\n" +
   ")clean    Clean the screen\n" +
   ")edit     Edit the current name space\n" +
   ")reload   Reload the results after  )edit\n" +
   ")redo     Run each command in the log\n" +
   ")help     Provide this list of commands\n"
 }
 if (aCommand.length == 0) {
  thisInput.value = thisLast
  return ""
 }
 if (aCommand == "clear") {
  loadAPL(thisLog = "")
  return "Clear WS"
 }
 if (aCommand == "clean") {
  thisOutput.value = thisClean
  return ""
 }
 if (aCommand == "lib") {
  myLib = storeLib("Code ")
  if (myLib.length != 0) {myLib = "\n" + myLib.join("   ")}
  return "1 Dates   1 Examples   1 Host   1 Html   1 Numbers" + myLib
 }
 if (aCommand == "fetch") {
  myLib = storeGet("Saved Config")
  if (myLib.length != 0) {
   myLib = xmlFind(xmlLoad(myLib), "Config", "Fetch")
   if (myLib.length == 1 && myLib[0].length != 0) {   
    myLib = "\n" + myLib[0].replace(/\t/g, "   ")
	} else {
	 myLib = ""
	}
  } 
  return "APL/Comparisons   APL/Demo   APL/Probability   APL/Statistics   APL/XML" + myLib
 }
 if (aCommand == "edit") {
  loadEdit()
  return ""
 }
 if (aCommand == "reload") {
  thisLog = storeGet("Saved Log")
  timeStamp("Reloaded")
  addOutput(loadAPL(storeGet("Saved Context")))
  return ""
 }
 if (aCommand == "redo") {
  myParts = thisLog.trim().split("\n")
  thisLog = ""
  for (myIndex = 0; myIndex < myParts.length; myIndex++) {
   runLine(myParts[myIndex])
  }
  return ""
 }
 // Arguments should not have multiple blanks
 aCommand = deDupBlanks(aCommand)
 if (aCommand.substring(0, 5) == "load ") {
  timeStamp("Loaded")
  thisLog = ""
  return loadAPL(getNames(aCommand.substring(5)))
 }
 if (aCommand.substring(0, 5) == "save ") {
  return setNames(aCommand.substring(5), thisContext)  
 }
 if (aCommand.substring(0, 5) == "drop ") {
  myName = aCommand.substring(5)
  if (myName.substring(0, 2) == "1 ") {
   return "Cannot drop from lib 1"
  }
  timeStamp(storeDelete("Code " + myName))
  return ""
 }
 if (aCommand.substring(0, 5) == "copy ") {
  myCopy = "\n\n" + getNames(aCommand.substring(5)).trim()
  timeStamp("Copied")
  if (myCopy.length == 2) return ""
  thisContext += myCopy
  return callAPL(myCopy)
 }
 if (aCommand.substring(0, 6) == "fetch ") {
  myName = aCommand.substring(6)
  if (myName.substring(0, 4) != "APL/") {
   myName = "../APL.js.User/" + myName
  }
  timeStamp(jsFetch(myName + ".jsa"))
  return ""
 }
 return "No '" + myName + "' command"
}

function jsLoad(aType, aName, aString) {
 storePut(aType + aName, aString)
 timeStamp("Fetched  " + aName)
 if (aType == "Code ") {
  thisInput.value = ")load " + aName
 } else if (aType == "File ") {
  thisInput.value = "⎕file '" + aName + "'"
 } else { 
  throw aType + " is unknown"
 }
 thisInput.focus()
}

function loadEdit() {
 storePut("Saved Context", thisContext)
 storePut("Saved Log", thisLog)
 window.open("Edit.html")
 thisInput.value = ")reload"
}

function getNames(aName) {
 var myResult
 if (aName.substring(0, 2) == "1 ") {
  myResult = _LIB_[aName.substring(2)]
 } else {
  myResult = window.localStorage.getItem("Code " + aName)
 }
 if (typeof myResult !== "string") {throw aName + " is not available"}
 return myResult
}

function setNames(aName, aValue) {
 if (aName.substring(0, 2) == "1 ") {
  return "Cannot save into Lib 1"
 } else {
  timeStamp(storePut("Code " + aName, aValue))
  return ""
 }
}

function deDupBlanks(aString) {
 var myResult
 aString = aString.trim()
 myResult = aString.replace(/  /g, " ")
 while (myResult != aString) {
  aString = myResult
  myResult = aString.replace(/  /g, " ")
 }
 return myResult
}

function timeStamp(aCommand) {
 addOutput(aCommand + "   " + new Date().toISOString().substring(0, 19).replace(/T/, " "))
}

function addOutput(aResult) {
 if (thisPrompt.length != 0) {
  // Previous output was quoteQuad, flush the buffer
  thisPrompt = ""
  aResult = "\n" + aResult
 }
 if (aResult.length != 0) {
  thisOutput.value += aResult + "\n"
  showOutput()
 }
}

function quadOutput(aResult) {
 thisInput.focus()
 if (aResult.slice(-1) == "\n") {
  thisPrompt = ""       // Quad output flushes prompt
 } else {
  thisPrompt = aResult   // QuoteQuad output keeps prompt
 }
 thisOutput.value += aResult
 showOutput()
 return aResult
}

function quadInput() {
 var myResponse, myParts
 if (thisPrompt.length == 0) {
  myResponse = prompt("Please respond:", "")
 } else {
  myParts = thisPrompt.split("\n")
  thisPrompt = ""
  thisOutput.value += "\n"
  if (myParts.length == 1) {
   myResponse = prompt(myParts[0], "")
  } else {
   myResponse = prompt(myParts[myParts.length - 2], myParts[myParts.length - 1])
  }
 }
 thisInput.focus()
 return myResponse || ""
}

function showOutput() {
 if (typeof thisOutput == "undefined") { return }
 thisOutput.focus()
 if (typeof thisOutput.selectionStart == "number") {
  thisOutput.selectionStart = thisOutput.selectionEnd = thisOutput.value.length
 } else if (typeof thisOutput.createTextRange != "undefined") {
  range = thisOutput.createTextRange()
  range.collapse(false)
  range.select()
 }
}

function handleLoad(anInput, anOutput, aKeyboard) {
 var myCont
 setupArgs()
 thisInput = anInput
 thisOutput = anOutput
 thisKeyboard = keysVisible("Session", thisOutput, thisInput)
 if (thisKeyboard) {aKeyboard.value = "Turn Keyboard Off"}
 thisInput.focus()
 thisOutput.value = thisClean
 myCont = storeGet("Saved Continue")
 if (myCont.length == 0) {
  loadAPL("")
 } else {
  storePut("Saved Context", myCont)
  storePut("Saved Continue", "")
  thisLog = storeGet("Saved Log")
  addOutput(storeGet("Saved Output"))
  addOutput(loadAPL(myCont))
  thisInput.focus()
  timeStamp("Reloaded")
 }
 thisInput.focus() 
}

function setupArgs() {
 var myIndex
 var myArgs = Arguments()
 for (myIndex = 2; myIndex < myArgs.length; myIndex += 2) {
  if (myArgs[myIndex] == "Key") {
   thisKey += myArgs[myIndex + 1]
  } else if (myArgs[myIndex] == "Debug") {
   thisDebug = true
  }
 }
}

function handleContinue() {
 storePut("Saved Continue", thisContext.trim())
 storePut("Saved Log", thisLog.trim())
 storePut("Saved Output", thisOutput.value.trim())
 window.close()  // NB.  On some systems, this fails if it isn't a child window!
}

function handleKeyboard(aButton) {
 thisKeyboard = !thisKeyboard
 if (thisKeyboard) {
  cssFetch("all.css")
  aButton.value = "Turn Keyboard Off"
 } else {
  cssFetch("all-KB.css")
  aButton.value = "Turn Keyboard On "
 }
}

function handleAPL() {
 var myValue = thisInput.value
 var myEnd = thisInput.selectionStart
 if (myEnd == 0) {
  prompt ("Press after a character to transform it into APL.")
 } else {
  var myStart = myEnd - 1
  var myChar  = myValue.substring(myStart, myEnd)
  // thisOutput.value += "]" + myChar + "[\n"
  myChar = thisMap[myChar] || ""
  if (myChar.length != 0) {
   thisInput.value = myValue.slice(0, myStart) +
     myChar + myValue.slice(myEnd)
   thisInput.selectionStart = thisInput.selectionEnd = myStart + 1
  }
 }
 thisInput.focus()
}
