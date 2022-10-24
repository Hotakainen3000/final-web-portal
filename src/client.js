import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, getDocs, addDoc, doc, deleteDoc, onSnapshot, query, where, updateDoc, getDoc
} from "firebase/firestore"

import { getDatabase, ref, set, get, child, remove } from "firebase/database";

import { 
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import e from "cors";


const firebaseConfig = {
  apiKey: "AIzaSyBXhjU9s56zMZwODNrhhhI2jzCGnGpp3B0",
  authDomain: "grocery-price-tracker-a655d.firebaseapp.com",
  databaseURL: "https://grocery-price-tracker-a655d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "grocery-price-tracker-a655d",
  storageBucket: "grocery-price-tracker-a655d.appspot.com",
  messagingSenderId: "641925523177",
  appId: "1:641925523177:web:c386d2a623df45054f7278"
};

// Hide main page
const indexPage = document.getElementById("indexPage");

const editMenu = document.querySelector(".edit-menu");
indexPage.style.display = "none";

var colName = "ica";
const store1 = "ica";
const store2 = "coop kronoparken";
const store3 = "lidl";
const store4 = "coop välsviken";
var prodId;

// init firebase apps
initializeApp(firebaseConfig);

// realtime database
const rtdb = getDatabase();


// init service
const db = getFirestore();
const auth = getAuth();

// collection ref
const tableUpdate = document.getElementById("select-table");
var colRef = collection(db, document.getElementById("select-table").value);
const colStore1Ref = collection(db, store1);
const colStore2Ref = collection(db, store2);
const colStore3Ref = collection(db, store3);
const colStore4Ref = collection(db, store4);

// get collection data
onSnapshot(colStore3Ref, (snapshot) => {
  let offers = [];
  snapshot.docs.forEach((doc) => {
    offers.push({ ...doc.data(), id: doc.id });
  });
  buildTable(offers);
});

onSnapshot(colStore2Ref, (snapshot) => {
  let offers = [];
  snapshot.docs.forEach((doc) => {
    offers.push({ ...doc.data(), id: doc.id });
  });
  buildTable(offers);
});

onSnapshot(colStore4Ref, (snapshot) => {
  let offers = [];
  snapshot.docs.forEach((doc) => {
    offers.push({ ...doc.data(), id: doc.id });
  });
  buildTable(offers);
});

onSnapshot(colStore1Ref, (snapshot) => {
  let offers = [];
  snapshot.docs.forEach((doc) => {
    offers.push({ ...doc.data(), id: doc.id });
  });
  buildTable(offers);
});


// adding documents
const addOfferForm = document.getElementById("product");
addOfferForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addDoc(colRef, {
    offer: addOfferForm.productName.value,
    price: addOfferForm.productPrice.value,
    store: addOfferForm.productStore.value,
    kategori: addOfferForm.productCategory.value
  })
  .then(() => {
    addOfferForm.reset();
  })
});

// Update table when user changes store
tableUpdate.addEventListener("change", (e) => {
  colName = document.getElementById("select-table").value;
  colRef = collection(db, colName);
  getDocs(colRef)
    .then((snapshot) => {
      let offers = [];
      snapshot.docs.forEach((doc) => {
        offers.push({ ...doc.data(), id: doc.id });
      });
      buildTable(offers);
    });
});

// signing user in
const loginForm = document.getElementById("login");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;
  const loginPage = document.getElementById("loginPage");
  loginForm.reset();

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      indexPage.style.display = "block";
      loginPage.style.display = "none";
    })
    .catch((err) =>{
      console.log(err);
    });
})

// get id from right-clicked row and show contextmenu
const table = document.querySelector("#product-table");
table.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const menu = document.querySelector(".menu");
  const rowSelected = document.querySelector(".selected");
  if(rowSelected !== null){
    rowSelected.classList.remove("selected");
  }
  var row = e.target.parentNode;
  prodId = row.children[4].textContent;
  menu.style.left = e.pageX + "px";
  menu.style.top = e.pageY + "px";
  menu.classList.remove("hide");
  menu.classList.add("show");
  row.classList.add("selected");
})

// delete row when delete-btn is clicked or open edit menu if edit-btn is clicked
document.addEventListener("click", (e) => {
  const menu = document.querySelector(".menu");
  menu.classList.remove("show");
  menu.classList.add("hide");
  
  const row = document.querySelector(".selected");
  if(row !== null && e.target.className !== "edit-btn" && !editMenu.contains(e.target)){
    row.classList.remove("selected");
  }
  else if(e.target.className === "btn btn-primary edit-btn"){
    row.classList.remove("selected");
  }
  let t = e.target.className;
  const docRef = doc(db, colName, prodId);
  if(t === "delete-btn"){
  
    deleteDoc(docRef)
    .then(() => {
      console.log("Deleted");
    });
  }
  else if(t === "edit-btn"){
    getDoc(docRef)
      .then((doc) => {
        var d = doc.data();
        document.querySelector("#productNameEdit").value = d.offer;
        document.querySelector("#productPriceEdit").value = d.price;
        document.querySelector("#productStoreEdit").value = d.store;
        document.querySelector("#productCategoryEdit").value = d.kategori;
    });
    editMenu.style.left = e.pageX + "px";
    editMenu.style.top = e.pageY + "px";
    editMenu.classList.remove("hide");
    editMenu.classList.add("show");
  }
});

// update doc
const editForm = document.querySelector(".edit-menu-form");
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const docRef = doc(db, colName, prodId);
  updateDoc(docRef, {
    offer: editForm.productNameEdit.value,
    price: editForm.productPriceEdit.value,
    store: editForm.productStoreEdit.value,
    kategori: editForm.productCategoryEdit.value
  })
  editMenu.classList.remove("show");
  editMenu.classList.add("hide");
})

// cancel button for edit menu
const cancelButton = document.getElementById("cancel-btn");
cancelButton.addEventListener("click", (e) => {
  e.preventDefault();
  editMenu.classList.remove("show");
  editMenu.classList.add("hide");
});

// add database items to table in the webpage
function buildTable(data){
var table = document.getElementById("databaseTable");

table.innerHTML = "";
for (let i = 0; i < data.length; i++){
  let row =  `<tr>
                <td>${data[i].offer}</td>
                <td>${data[i].price}</td>
                <td>${data[i].store}</td>
                <td>${data[i].kategori}</td>
                <td class="hide">${data[i].id}</td>
              </tr>`
  table.innerHTML += row;
}
}


/* 
FROM OTHER SERVER -- User management
---------------------------------------------------------------------------------------------------------------------------------------------
*/

$(document).ready(() => {
  let userEmail;
  let selectedUser;

  // change "tab" when user selects value from select
  const selectTab = document.querySelector("#select-tab");
  selectTab.addEventListener("change", (e) => {
    const tab = selectTab.value;
    if(tab === "database"){
      const dbPage = document.querySelector("#db-page");
      dbPage.classList.remove("hide");

      const usersPage = document.querySelector("#users-page");
      usersPage.classList.add("hide");
    }
    else if(tab === "users"){
      const dbPage = document.querySelector("#db-page");
      dbPage.classList.add("hide");

      const usersPage = document.querySelector("#users-page");
      usersPage.classList.remove("hide");
      getUserData();
    }
  })
  
  $("#update-btn").click(function() {
    getUserData();
  });

  $("#reset-password-user").click(function() {
    sendPasswordResetEmail(auth, selectedUser["email"])
  .then(() => {
    alert("Password reset mail sent to " + selectedUser["email"]);
  })
  .catch((error) => {
    console.log(error.code);
    console.log(error.message);
  });
  });
  
  $("#db-table").contextmenu(function(e) {
    e.preventDefault();
    if($("#contextmenu").hasClass("show")){
      $("#contextmenu").removeClass("show");
      $("#contextmenu").addClass("hide");
    }
    else {
      userEmail = e.target.textContent;
      $("#contextmenu").removeClass("hide");
      $("#contextmenu").addClass("show");
      $("#contextmenu").css({top: e.pageY, left: e.pageX, position: "absolute"});
      e.target.parentNode.classList.add("selected");
      selectedUser = {
        email: e.target.parentNode.children[0].textContent,
        name: e.target.parentNode.children[1].textContent,
        address: e.target.parentNode.children[2].textContent,
        dateOfBirth: e.target.parentNode.children[3].textContent,
        phoneNr: e.target.parentNode.children[4].textContent,
        uid: e.target.parentNode.children[5].textContent
      }
    }
  })

  $("#delete-user").click(function() {
    $.post("delete_user", {email: userEmail}, function(data, status){
      const reference = ref(rtdb, "user/" + selectedUser["uid"]);
      remove(reference).then(() => {
        alert(selectedUser["email"] + " removed from database");
        getUserData();
      });
    });
  });
  

  $("html").click(function() {
    if($("#contextmenu").hasClass("show")){
      $("#contextmenu").removeClass("show");
      $("#contextmenu").addClass("hide");
    }
    /* const editUserMenu = $(".user-edit-menu");
    if(editUserMenu.hasClass("show-menu")){
      editUserMenu.removeClass("show-menu");
      editUserMenu.addClass("hide");
    } */
  })

  $("#edit-user").click(function(e) {
    openEditUserMenu(e);
    $("#userEmailEdit").val(selectedUser["email"]);
    $("#userNameEdit").val(selectedUser["name"]);
    $("#userAddressEdit").val(selectedUser["address"]);
    $("#dateofbirthEdit").val(selectedUser["dateOfBirth"]);
    $("#userPhonenrEdit").val(selectedUser["phoneNr"]);
    $("#uid").val(selectedUser["uid"]);
    selectedUser = {};

    /* e.target.parentNode.classList.add("selected"); */
  })

  const userEditForm = $(".user-edit-menu-form");
  userEditForm.submit(function(e) {
    e.preventDefault();
    
    const email = $("#userEmailEdit").val();
    const name = $("#userNameEdit").val();
    const address = $("#userAddressEdit").val();
    const dateOfBirth = $("#dateofbirthEdit").val();
    const phoneNr = $("#userPhonenrEdit").val();
    const uid = $("#uid").val();

    writeUserData(uid, email, name, address, dateOfBirth, phoneNr);
  })

  const userEditCancelBtn = $("#user-cancel-btn");
  userEditCancelBtn.click(function() {
    hideUserMenu();
  })

  const addUserBtn = $("#add-user-btn");
  addUserBtn.click(function(e) {
    openEditUserMenu(e)
    // SET USER ID HERE TO SOME RANDOM SEQUENCE
    
  })

  function hideUserMenu() {
    const userEditMenu = $(".user-edit-menu");
    userEditMenu.removeClass("show");
    userEditMenu.addClass("hide");
  }

  async function writeUserData(userId, email, name, adress, birthDate, phoneNr) {
    const reference = ref(rtdb, "user/" + userId);
  
    await set(reference, {
      dateOfBirth: birthDate,
      email: email,
      homeAdress: adress,
      mobileNumber: phoneNr,
      name: name
    }).then((e) => {
      hideUserMenu();
      alert("User " + email + " has been updated");
      getUserData();
    })
  }
});

/*
REALTIME DATABASE -- User management
-----------------------------------------------------------------------------------------------------------------------------------------------
*/
function getUserData() {
  const dbRef = ref(rtdb);
  get(child(dbRef, `user`)).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      createUserTable(data);
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
}

/* function writeUserData(userId, email, name, adress, birthDate, phoneNr, callback) {
  const reference = ref(rtdb, "user/" + userId);

  set(reference, {
    dateOfBirth: birthDate,
    email: email,
    homeAdress: adress,
    mobileNumber: phoneNr,
    name: name
  });
  callback();
} */

function createUserTable(userData){
  $("#db-table").empty();
    $.get("process_get", function(data, status) {
      if(status === "success"){
        /* cleanRtDb(userData, data); */
        for (const key of Object.keys(userData)){
          delete Object.assign(userData, {[userData[key].email]: userData[key]})[key];
        }
        data.forEach((value) => {
          if(userData[value.email] != undefined){
          $("#db-table").append(`<tr>
                            <td>${value.email}</td>
                            <td>${userData[value.email].name}</td>
                            <td>${userData[value.email].homeAdress}</td>
                            <td>${userData[value.email].dateOfBirth}</td>
                            <td>${userData[value.email].mobileNumber}</td>
                            <td class="hide">${value.uid}</td>
                            </tr>`);
          }
        });
        };
      })
}

function cleanRtDb(userData, authData){
  let isInAuth;
  Object.entries(userData).forEach(([key, value]) => {
    isInAuth = false;
    authData.forEach((a) => {
      if(value["email"] === a){
        isInAuth = true;
      }
    })
    if(!isInAuth){
      const reference = ref(rtdb, "user/" + key);
      remove(reference).then(() => {
        console.log(reference.key + " removed from database");
        alert(value["email"] + " removed from database");
      })
    }
  })
}

function openEditUserMenu(e){
  const userEditMenu = $(".user-edit-menu");
  $("#userEmailEdit").val("");
  $("#userNameEdit").val("");
  $("#userAddressEdit").val("");
  $("#dateofbirthEdit").val("");
  $("#userPhonenrEdit").val("");

  userEditMenu.css({top: e.pageY, left: e.pageX});
  userEditMenu.removeClass("hide");
  userEditMenu.addClass("show");
}

