const express = require("express");
const path = require("path");

const app = express();

const { initializeApp } = require('firebase-admin/app');
/* initializeApp({credential: applicationDefault()}); */
const { getAuth } = require("firebase-admin/auth");
//--------------------------------------------------------------------

var admin = require("firebase-admin");

var serviceAccount = require("/home/johanHotakainen/web-dev/admin-web-portal/service-account-file.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://grocery-price-tracker-a655d-default-rtdb.europe-west1.firebasedatabase.app"
});

//--------------------------------------------------------------------

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server started at port ", PORT));




  app.get("/users", (req, res) => {
    res.json({ message: "Some message" });
  })
  
  let r = [];
  let userData = [];
  app.get("/process_get", async (req, res) => {
    // Start listing users from the beginning, 1000 at a time.
    
    await listAllUsers();
    res.json(r);
  })
  
  app.post("/delete_user", (req, res) => {
    console.log("Delete user " + req.body["email"]);
    let user = userData.find(item => item.email === req.body["email"]);
    getAuth()
    .deleteUser(user.uid)
    .then(() => {
      console.log('Successfully deleted user ' + user.email);
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log('Error deleting user:', error);
      res.end("Failed to delete user");
    });
  })
  
  const listAllUsers =  (nextPageToken) => {
    // List batch of users, 1000 at a time.
    r = [];
    userData = [];
    return getAuth()
    .listUsers(1000, nextPageToken)
    .then((listUsersResult) => {
        listUsersResult.users.forEach((userRecord) => {
          r.push(userRecord);
          userData.push(userRecord);
        });
        if (listUsersResult.pageToken) {
          // List next batch of users.
          listAllUsers(listUsersResult.pageToken);
        }
      })
      .catch((error) => {
        console.log('Error listing users:', error);
      });
    };  