var thisOutput, thisType, thisContext, thisLog, thisFile
var thisIsLog = thisDirty = false

function handleLoad(anOutput, aType) {
 thisOutput = anOutput
 thisType = aType
 keysVisible("Edit", thisOutput)
 var myUrl = window.location.href
 var myFile = myUrl.indexOf("?File=")
 if (myFile == -1) { 
  thisFile = "Saved Context"
  thisLog = storeGet("Saved Log")
 } else {
  myFile = myUrl.substring(myFile + 6)
  thisFile = myFile.replace(new RegExp("%20", "g"), " ")
  thisType.style.visibility = "hidden"
 }
 thisContext = storeGet(thisFile)
 window.onbeforeunload = handleUnload
 document.getElementById('fileLoad').addEventListener('change', handleChooseFile, false)
 thisOutput.value = thisContext
}

function handleType() {
 if (thisIsLog) {
  thisType.value = "Edit Log"
  thisLog = thisOutput.value
  thisOutput.value = thisContext
  thisIsLog = false
 } else {
  thisType.value = "Edit Context"
  thisContext = thisOutput.value
  thisOutput.value = thisLog
  thisIsLog = true
 }
 thisOutput.focus()
}

function handleUnload() {
 if (thisDirty) {
  return "Leaving now will forget your changes!"
 } else {
  return null
 }
}
  
function handleResume() {
 if (thisIsLog) {
  thisLog = thisOutput.value
 } else {
  thisContext = thisOutput.value
 }
 storePut(thisFile, thisContext)
 if (thisLog != null) {storePut("Saved Log", thisLog)}
 thisDirty = false
 window.close()
}

function handleChooseFile(evt) {
 var myFile = evt.target.files[0] 

 if (myFile) {
  var myGet = new FileReader()
  myGet.onload = function(anEvent) { 
	thisOutput.value += anEvent.target.result
  }
  myGet.readAsText(myFile)
 }
}