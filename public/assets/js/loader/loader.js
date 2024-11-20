function addLoader(loader){
    console.log("loader open")
    let loadBox = document.querySelector(`#${loader}`)
    console.log(loadBox)
    if(loadBox){
        loadBox.style.display = 'flex'
    }
}
function removeLoader(loader){
    console.log("loader close")
    let loadBox = document.querySelector(`#${loader}`)
    if(loadBox){
        loadBox.style.display = 'none' 
    }
}