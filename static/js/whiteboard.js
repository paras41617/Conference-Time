fetch("create_whiteboard")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Request failed with status: " + response.status);
        }
        return response.json();
    })
    .then(function (data) {
        var whiteWebSdk = new WhiteWebSdk({
            // Pass in your App Identifier.
            appIdentifier: "WQK0QCL3Ee6hOWmX-Qd9og/6_uUjNbYDRW2kA",
            region: "us-sv",
        })

        const joinRoomParams = {
            uuid: data.uid,
            // The unique identifier of a user. If you use versions earlier than v2.15.0, do not add this line.
            uid: sessionStorage.getItem('UID'),
            roomToken: data.token,
        };

        // Join the whiteboard room and display the whiteboard on the web page.
        whiteWebSdk.joinRoom(joinRoomParams).then(function (room) {
            room.bindHtmlElement(document.getElementById("whiteboard"));
        }).catch(function (err) {
            console.error(err);
        });
    })
    .catch(function (error) {
        console.error(error);
    });