var thisAPL, thisField, thisEvent, thisReturn

function initAPL(anInit) {
 var myInclude = ""
 thisAPL = apl.ws()
 thisAPL(_PRELUDE_)  // I know this looks dumb, but it insures name isolation!
 if (anInit.substring(0, 9) == "#include ") {
  myInclude = anInit.split("\n")[0].substring(9).trim()
  myInclude = _LIB_[myInclude]
 }
 thisAPL(myInclude + anInit)
}

function callAPL(anExpression) {
 return thisAPL(anExpression).toString()
}
  
function quote(aLine) {
 aLine = aLine.replace(/\\/g, "\\\\")
 aLine = aLine.replace(/"/g, '\\"')
 return '"' + aLine + '"'
}

function handleLoad() {
 var myArgs, myLocal, myPage, myConfig, myIndex
 myPage = myConfig = ""
 myLocal = false
 myArgs = Arguments()
 if (myArgs.length != 2) {
  for (myIndex = 2; myIndex < myArgs.length; myIndex += 2) {
   if (myArgs[myIndex] == "File") {
    myFile = myArgs[myIndex + 1]
   } else if (myArgs[myIndex] == "Local") {
	myLocal = true
   } else if (myArgs[myIndex] == "Page") {
    myPage = myArgs[myIndex + 1]
   } else if (myArgs[myIndex] == "Config") {
    myConfig = myArgs[myIndex + 1]
   }
  }
 } else {
  myPage = "APL/Demo"
 }
 
 if (myPage.length != 0) {
  if (myLocal) {
   runPage(storeGet("Code " + myPage))
  } else {
   if (myConfig.length != 0) {
    jsFetch("../APL.js.User/File/" + myConfig + ".jsa")
   }
   myPage += ".jsa"
   if (myPage.substring(0, 4) != "APL/") {
	myPage = "../APL.js.User/" + myPage
   }
   jsFetch(myPage)
  }
 } else if (myFile.length != 0) {
  pageDisplay(storeGet("File " + myFile))
 }  
}

function jsLoad(aType, aName, aString) {
 if (aType == "Code ") {
  runPage (aString)
 } else {
  storePut(aType + aName, aString)
 }
}

function runPage(aString) {
 initAPL(aString)
 if (onFails("{«pageDisplay(_w.toString())»} onDefine", "onDefine")) {
  pageExit()
  return
 }
 fieldInit()
 window.onbeforeunload = handleUnload
 onFails("onLoad", "onLoad")
}

function handleUnload() {
 thisReturn = null
 if (onFails("onUnload", "onUnload")) {
  return "Leaving now will forget your changes!"
 }
 return thisReturn
}

function callFails(aLine, anIgnore) {
 try {
  callAPL(aLine)
 } catch (err) {
  var myError = err.toString()
  if (anIgnore.length != 0 && myError == anIgnore) {return false}
  alert(aLine + "\n Error:  " + myError)
  return true
 }
 return false
}

function onFails(aLine, aName) {
 return callFails(aLine, "VALUE ERROR: Symbol '" +
  aName + "' is referenced before assignment.")
}

function onEvent(aField, anEvent, aLine) {
 thisField = aField
 thisEvent = anEvent
 thisReturn = true
 callFails(aLine, "")
 return thisReturn
}

function fieldInit() {
 var myIndex, myItem, myItems, myName, myFields
 myItems = document.formAPL.elements
 for (myIndex = 0; myIndex < myItems.length; myIndex++) {
  myItem = myItems[myIndex]
  try {
   myName = " " + myItem.id
   myFields = _VARS_[myName]
   if (myFields == null) {
    _VARS_[myName] = []
	 myFields = []
   }
   myFields.push(myItem)
   _VARS_[myName] = myFields
  } catch (err) {
   // alert(myIndex)
  }
 }
}

function fieldNames() {
 // To learn loaded fields
 // #Debug    #fieldNames()
 var myIndex, myItem, myItems, myResult
 myItems = document.formAPL.elements
 myResult = []
 for (myIndex = 0; myIndex < myItems.length; myIndex++) {
  myItem = myItems[myIndex]
  try {
   myResult.push("id=" + myItem.id + " type=" + myItem.type)
  } catch (err) {
   // alert(myIndex)
  }
 }
 return myResult.join("\n")
}

function fieldValues(aName, aValue) {
 var myResult, myFields, myIndex
 myResult = []
 myFields = _VARS_[" " + aName]
 if (aValue == null) {
  for (myIndex = 0; myIndex < myFields.length; myIndex++) {
   myResult.push(myFields[myIndex].value)
  }
  return myResult
 } else {
  myResult = aValue.data
  if (myResult.length == 1) {
   for (myIndex = 0; myIndex < myFields.length; myIndex++) {
    myFields[myIndex].value = myResult[0]
   }
  } else if (myFields.length == myResult.length) {
   for (myIndex = 0; myIndex < myFields.length; myIndex++) {
    myFields[myIndex].value = myResult[myIndex]
   }
  } else {
   throw "LENGTH ERROR:  " + aName
  }
 }
 return ""
}

function fieldChecks(aName, aValue) {
 var myResult, myFields, myIndex
 myResult = []
 myFields = _VARS_[" " + aName]
 if (aValue == null) {
  for (myIndex = 0; myIndex < myFields.length; myIndex++) {
   myResult.push(+myFields[myIndex].checked)
  }
  return myResult
 } else {
  myResult = aValue.data
  if (myResult.length == 1) {
   for (myIndex = 0; myIndex < myFields.length; myIndex++) {
    myFields[myIndex].checked = myResult[0]
   }
  } else if (myFields.length == myResult.length) {
   for (myIndex = 0; myIndex < myFields.length; myIndex++) {
    myFields[myIndex].checked = myResult[myIndex]
   }
  } else {
   throw "LENGTH ERROR:  " + aName
  }
 }
 return ""
}

function fieldDefines(aName, aValue) {
 var myResult, myFields, myIndex
 myResult = []
 myFields = _VARS_[" " + aName]
 if (aValue == null) {
  for (myIndex = 0; myIndex < myFields.length; myIndex++) {
   myResult.push(myFields[myIndex].innerHTML)
  }
  return myResult
 } else {
  myResult = aValue.data
  if (myResult.length == 1) {
   for (myIndex = 0; myIndex < myFields.length; myIndex++) {
    myFields[myIndex].innerHTML = myResult[0]
   }
  } else if (myFields.length == myResult.length) {
   for (myIndex = 0; myIndex < myFields.length; myIndex++) {
    myFields[myIndex].innerHTML = myResult[myIndex]
   }
  } else {
   throw "LENGTH ERROR:  " + aName
  }
 }
 return ""
}

function pageDisplay(aPage) {
 document.formAPL.innerHTML = aPage
 return ""
}

function pageDebug() {
 var myAsk = prompt("APL for #Debug?", "").trim()
 if (myAsk.length != 0) {
  try {
   if (myAsk.substring(0, 1) == "#") {
    myAsk = "«" + myAsk.substring(1) + "»"
   }
   alert("APL response:  " + callAPL(myAsk))
  } catch (err) {
   alert("Error:  " + err)
  }
 }
}

function pageExit() {
 window.close()
 return ""
}