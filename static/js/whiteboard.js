var options = {
    method: "POST",
    headers: {
      token: "NETLESSSDK_YWs9amZFbjZTX3hnQVZJRThZdyZub25jZT0yN2MzOGYwMC0yMmZhLTExZWUtYTEzOS02OTk3ZjkwNzdkYTImcm9sZT0wJnNpZz03OTcwOTBlMmYwMDhiMDQxNzNjNDY0NjhjYzBjNDI1ZDA3NjVjYTBiYmVkMDY1NmEwNjI0ODZlNmIxNTYwYjIw",
      "Content-Type": "application/json",
      region: "us-sv"
    },
    body: JSON.stringify({
      isRecord: false
    })
  };
  
  var uuid;
  
  fetch("https://api.netless.link/v5/rooms", options)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Request failed with status: " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      uuid = data.uuid;
      console.log("room_data  :", data);
      console.log("white_uuid : ", data.uuid);
      sessionStorage.setItem('white_room : ', data.uuid);
      var secondOptions = {
        method: "POST",
        headers: {
          token: "NETLESSSDK_YWs9amZFbjZTX3hnQVZJRThZdyZub25jZT0yN2MzOGYwMC0yMmZhLTExZWUtYTEzOS02OTk3ZjkwNzdkYTImcm9sZT0wJnNpZz03OTcwOTBlMmYwMDhiMDQxNzNjNDY0NjhjYzBjNDI1ZDA3NjVjYTBiYmVkMDY1NmEwNjI0ODZlNmIxNTYwYjIw",
          "Content-Type": "application/json",
          region: "us-sv"
        },
        body: JSON.stringify({ lifespan: 3600000, role: "admin" })
      };
  
      return fetch(
        "https://api.netless.link/v5/tokens/rooms/" + data.uuid,
        secondOptions
      );
    })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Request failed with status: " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      console.log("new_data : ", data);
      const token = data
      sessionStorage.setItem('white_token : ', data);
      console.log(data);
      var whiteWebSdk = new WhiteWebSdk({
        // Pass in your App Identifier.
        appIdentifier: "WQK0QCL3Ee6hOWmX-Qd9og/6_uUjNbYDRW2kA",
        // Set the data center as Silicon Valley, US.
        region: "us-sv",
      })
  
      const joinRoomParams = {
        uuid: uuid,
        // The unique identifier of a user. If you use versions earlier than v2.15.0, do not add this line.
        uid: sessionStorage.getItem('UID'),
        roomToken: token,
      };
  
      console.log("white_params : ", joinRoomParams)
  
      // Join the whiteboard room and display the whiteboard on the web page.
      whiteWebSdk.joinRoom(joinRoomParams).then(function (room) {
        console.log("white_working : ");
        room.bindHtmlElement(document.getElementById("whiteboard"));
      }).catch(function (err) {
        console.error(err);
      });
    })
    .catch(function (error) {
      console.error(error);
    });
  