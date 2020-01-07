function lOut(){
  //redirect the user to the logout path
  window.location.href = "http://localhost:3000/logout/";
}

function sP(){
  //get the value of the privacy drowdown and the username of the lcient
  let pSetting = document.querySelector("#privacy").value;
  let username = document.querySelector("#saveP").getAttribute("uname");
  console.log(pSetting);
  console.log(username);
  let reqObj = {pS: pSetting, uSn: username};
  console.log(reqObj);
  //make a post request to the updateSetting path with the pSetting variable and the username variable
  let req = new XMLHttpRequest();
  req.open("POST", "http://localhost:3000/updateSetting", false);
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify(reqObj));
  let body = req.response;
  console.log(body);
}
