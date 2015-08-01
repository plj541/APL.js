// Called by )load
function storeGet(aStore) {
 return window.localStorage.getItem(aStore) || "" 
}

// Called by )save
function storePut(aStore, aString) {
 legalNames(aStore)
 window.localStorage.setItem(aStore, aString)
 return "Saved"
}

function legalNames(aName) {
 // These tests prevent problems saving in a file system
 // and also in Config XML, it does still allow Unicode characters
 var myErr = "DOMAIN ERROR:  Illegal character in file name"
 if (aName.indexOf("/") != -1) {throw myErr}
 if (aName.indexOf("\\") != -1) {throw myErr}
 if (aName.indexOf(":") != -1) {throw myErr}
 if (aName.indexOf("<") != -1) {throw myErr}
 if (aName.indexOf(">") != -1) {throw myErr}
 if (aName.indexOf("&") != -1) {throw myErr}
 if (aName.indexOf("|") != -1) {throw myErr}
}

// Called by )drop
function storeDelete(aStore) {
 window.localStorage.removeItem(aStore)
 return "Dropped"
}

// Called by )lib
function storeLib(aPrefix) {
 var myItems, myItem

 myItems = []
 for (myIndex = 0; myIndex < localStorage.length; myIndex++) {
  myItem = window.localStorage.key(myIndex)
  if (aPrefix == myItem.substring(0, aPrefix.length)) {
   myItems.push(myItem.substring(aPrefix.length))
  }
 }
 myItems.sort()
 return myItems
}

// Called by )edit
function pageLink(aUrl) {
 window.open(aUrl)
 return ""
}

function pageGet(aUrl) {
 // Warning:  This only works when the initial HTML page is on the Web!
 var myHttp = new XMLHttpRequest()
 myHttp.open("GET", aUrl, false)
 myHttp.send(null)
 return myHttp.responseText
}

//  An example of how to extend APL with Javascript
function sendMail(anAddress, aSubject, anExtra, aMessage) {
 window.location.href = 
    "mailto:" + anAddress.toString()
  + "?" + anExtra.toString()
  + "&subject=" + hrefArg(aSubject.toString())
  + "&body=" + hrefArg(aMessage.toString())
 return "Sent"
}

function splitLines(aLines, aWidth) {
 // Returns a vector of vectors, can be used as is, or joined any number of ways
 var myResult, myLine, myNext, myStart
 myResult = []
 myStart = 0
 while (aLines.length > myStart + aWidth) {
  myLine = aLines.substring(myStart, myStart + aWidth)
  myNext = myLine.lastIndexOf(' ')
  if (myNext == -1) myNext = aWidth
  myLine = myLine.substring(0, myNext)
  myResult.push(myLine)
  myStart += (myNext + 1)
 }
 myResult.push(aLines.substring(myStart))
 return myResult
}

function Arguments() {
 var myUrl, myParts, myArgs, myIndex, myResult
 myUrl = window.location.href
 myParts = myUrl.split("?")
 myResult = []
 myResult.push("")
 myResult.push(decodeURIComponent(myParts[0]))
 if (myParts.length != 1) {
  myArgs = myUrl.substring(myParts[0].length + 1).split("&")
  for (myIndex = 0; myIndex < myArgs.length; myIndex++) {
   myParts = myArgs[myIndex].split("=")
   myResult.push(myParts[0])
   if (myParts.length == 1) {
    myResult.push("")
	} else {
	 myParts= myArgs[myIndex].substring(myParts[0].length + 1)
    myResult.push (decodeURIComponent(myParts))
	}
  }
 }
 return myResult
}

function hrefArg(anArg) {
 // encodeURIComponent encodes far more than is needed here;
 // and % becomes %25, which fails with gMail on Android
 return anArg
  .replace(new RegExp("%", "g"), "%25")
  .replace(new RegExp("#", "g"), "%23")
  .replace(new RegExp("&", "g"), "%26")
  .replace(new RegExp("\n", "g"), "%0A")
  .replace(/\\/g, "%5C")
  .replace(new RegExp("%25", "g"), "&#37;")
}

//  Called by dynamic variables, created by }
var _VARS_ = {}
function ValueOf(aName, aValue) {
 if (aValue == null) {
  aValue = _VARS_[aName]
  if (aValue == null) { throw "VALUE ERROR:  " + aName }
 } else {
  _VARS_[aName] = aValue
 }
 return aValue
}

function fileDownload(aFile, aValue) {
 var myBlob = new Blob([aValue], {type:'text/plain'})
 var myLink = document.createElement("a")
 myLink.download = aFile
 myLink.innerHTML = "Download File"
 if (window.webkitURL != null) {
  // Chrome allows the link to be clicked, without actually adding it to the DOM.
  myLink.href = window.webkitURL.createObjectURL(myBlob)
 } else {
  // Firefox requires the link to be added to the DOM, before it can be clicked.
  myLink.href = window.URL.createObjectURL(myBlob)
  myLink.onclick = destroyClickedElement
  myLink.style.display = "none"
  document.body.appendChild(myLink)
 }
 myLink.click()
 return "Downloaded"
}

function destroyClickedElement(event) {
 document.body.removeChild(event.target)
}

// Called by )fetch
function jsFetch(aName) {
 var myRef = document.createElement("script")
 myRef.setAttribute("type", "text/javascript")
 myRef.setAttribute("src", aName)
 document.getElementsByTagName("head")[0].appendChild(myRef)
 return "Fetching"
}

// Build a properly encoded XML element string
function xmlElement(aName, aValue) {
 var myName, myValue
 myValue = aValue.toSimpleString()
 if (myValue.length == 0) {
  return myValue
 } else {
  myName = aName.toSimpleString() + ">"
  return "<" + myName + myValue.encodeHTML() + "</" + myName
 }
}

if (!String.prototype.encodeHTML) {
  String.prototype.encodeHTML = function () {
    return this.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
  };
}

if (!String.prototype.decodeHTML) {
  String.prototype.decodeHTML = function () {
    return this.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
  };
}

function xmlLoad(aString) {
 var myParser = new DOMParser()
 return myParser.parseFromString(aString, "text/xml")
}

var thisCount = 0
function xmlParse(anXML) {
 var myXML, myPath, myLoad, myNode, myName
 myLoad = anXML.toSimpleString().trim()
 if (myLoad.length == 0) return ""
 myLoad = xmlLoad(myLoad)
 myPath = "/"
 myXML = {}
 myXML[myPath] = myLoad
  
 myNode = myLoad.childNodes
 if (myNode.length == 1) {
  myNode = myNode[0]
  myPath += myNode.nodeName
  myXML[myPath] = myNode
 }
 myName = "XML[" + thisCount + "]"
 thisCount += 1
 return xmlVars(myXML, myName, myPath)
}

function xmlNode(anXML) {
 // Returns a node, which cannot be returned to APL
 var myPath = [], myItem = [], myNode, myName, myFound
 xmlArguments(anXML, myPath, myItem)
 myNode = _VARS_[myPath[0]][myPath[1]]
 if (myItem.length == 0) return myNode
 for (var myIndex = 0; myIndex < myItem.length; myIndex++) {
  myName = myItem[myIndex]
  if (typeof myName == "number") {
   if (myName == myNode.childNodes.length) return ""
   myNode = myNode.childNodes[myName]
  } else {
   myFound = false
   for (var myIndex2 = 0; myIndex2 < myNode.childNodes.length; myIndex2++) {
    if (myName == myNode.childNodes[myIndex2].nodeName) {
	  myNode = myNode.childNodes[myIndex2]
	  myFound = true
	 }
   }
   if (!myFound) return ""
  }
 }
 return myNode
}

function xmlValue(anXML) {
 var myNode, myValue
 myNode = xmlNode(anXML)
 try {
  myValue = myNode.childNodes[0].nodeValue
  if (myValue == null) {
   return ""
  } else {
   return myValue.decodeHTML()
  }
 } catch(err) {
  return ""
 }
}

function xmlValues(aNode, aFind) {
 var myPath = [], myItem = [], myParent, myName
 if (aNode.length == 0) return ""
 xmlArguments(aFind, myPath, myItem)
 if (myItem.length < 1 || myItem.length > 2) throw "LENGTH ERROR"
 if (myItem.length == 1) {
  myParent = ""
  myName = myItem[0]
 } else {
  myParent = myItem[0]
  myName = myItem[1]
  if (typeof myParent != "string") throw "DOMAIN ERROR"
 }
 if (typeof myName != "string") throw "DOMAIN ERROR"
 return xmlFind(aNode, myParent, myName)
}

function xmlFind(aNode, aParent, aName) {
 var myNodes, myItems, myValue
 myItems = []
 myNodes = aNode.getElementsByTagName(aName)
 for (var myIndex = 0; myIndex < myNodes.length; myIndex++) {
  if (aParent.length == 0 || aParent == myNodes[myIndex].parentNode.nodeName) {
   if (myNodes[myIndex].childNodes.length == 0) {
    myItems.push("")
   } else {
	 myValue = myNodes[myIndex].childNodes[0].nodeValue
	 if (myValue == null) {
	  myItems.push("")
	 } else {
     myItems.push(myValue.decodeHTML())
	 }
   }
  }
 }
 return myItems
}

function xmlNames(anXML) {
 myNode = xmlNode(anXML)
 myResult = []
 for (var myIndex = 0; myIndex < myNode.childNodes.length; myIndex++) {
  myResult.push(myNode.childNodes[myIndex].nodeName)
 }
 return myResult
}

function xmlAttr(anXML) {
 var myNode, myResult
 myNode = xmlNode(anXML)
 myResult = []
 for (var myIndex = 0; myIndex < myNode.attributes.length; myIndex++) {
  myResult.push(myNode.attributes[myIndex].name)
  myResult.push(myNode.attributes[myIndex].value)
 }
 return myResult
}

function xmlPath(anXML) {
 var myPath = [], myItem = [], myNode, myName
 xmlArguments(anXML, myPath, myItem)
 if (myItem.length == 0) return ""
 myNode = xmlNode(anXML)
 if (myNode.length == 0) return ""
 myName = myPath[0]
 myXML = _VARS_[myName]
 myPath = myPath[1] + "/" + myItem.join("/")
 myXML[myPath] = myNode 
 return xmlVars(myXML, myName, myPath)
}

// Helper functions, not for users to call directly
function xmlArguments(anXML, aPath, anItem) {
 // Puts anXML into aPath and anItem.  Not for users!
 var myData = anXML.data, myIndex, myOffset, myShape
 if (typeof myData != "object") throw "DOMAIN ERROR"
 myShape = justVectors(anXML)
 myOffset = anXML.offset
 if (typeof myData[myOffset].data == "object") {
  myIndex = myOffset + 1
  for (; myIndex < myShape; myIndex++) {
   if (typeof myData[myIndex] == "number") {
    anItem.push(myData[myIndex])
	} else {
    anItem.push(myData[myIndex].toSimpleString())
	}
  }
  myData = myData[myOffset]
  myShape = justVectors(myData)
  myOffset = myData.offset
  myData = myData.data
 }
 if (myShape != 2) throw "LENGTH ERROR"
 aPath.push(myData[myOffset].toSimpleString())
 aPath.push(myData[myOffset + 1].toSimpleString())
}

function xmlVars(anXML, aName, aPath) {
 var myResult = []
 _VARS_[aName] = anXML
 myResult.push(aName)
 myResult.push(aPath)
 return  myResult
}

function justVectors(anAPL) {
 var myShape = anAPL.shape
 if (myShape.length != 1) throw "RANK ERROR"
 return myShape[0]
}

function graphData(aValue, aCount) {
 var myResult, myOffset, myData, myItem, myItems, myPair, myPairs, mySet, mySets, myIndex
 myResult = []
 myOffset = aValue.offset
 myData = aValue.data
 if (aValue.shape.length == 2) {
  mySets = aValue.shape[0]
  myItems = aValue.shape[1] 
  for (mySet = 1; mySet < mySets; mySet++) {
   myItem = myItems * mySet
   myPairs = []
   for (myIndex = 0; myIndex < myItems; myIndex++) {
    myPair = []
    myPair.push(myData[myOffset + myIndex])
    myPair.push(myData[myOffset + myIndex + myItem])
    myPairs.push(myPair)
   }
   myResult.push(myPairs)
  }
 } else if (aValue.shape.length == 1) {
  var myNest
  mySets = aValue.shape[0]
  for (mySet = 0; mySet < mySets; mySet++) {
   myNest = myData[myOffset + mySet]
   if (myNest.shape.length != 2) throw "RANK ERROR:  graphData.inner"
   if (myNest.shape[0] != 2) throw "LENGTH ERROR:  graphData.inner"
   myItems = myNest.shape[1]
   myNest = myNest.data
   myPairs = []
   for (myIndex = 0; myIndex < myItems; myIndex++) {
    myPair = []
    myPair.push(myNest[myIndex])
    myPair.push(myNest[myIndex + myItems])
    myPairs.push(myPair)
   }
   myResult.push(myPairs)
  }
 } else {
  throw "RANK ERROR:  graphData.outer"
 }
 myItems = []
 for (myIndex = myResult.length; myIndex < aCount; myIndex++) {
  myResult.push(myItems)
 }
 return myResult
}