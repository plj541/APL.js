var thisAPL

function initAPL(anInit) {
 thisAPL = apl.ws()
 thisAPL(_PRELUDE_)  // I know this looks dumb, but it insures name isolation!
 thisAPL(anInit)
}

function callAPL(anExpression) {
 return thisAPL(anExpression).toString()
}
  
function quote(aLine) {
 aLine = aLine.replace(/\\/g, "\\\\")
 aLine = aLine.replace(/"/g, '\\"')
 return '"' + aLine + '"'
}
