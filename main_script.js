//service worker

const registerServiceWorker = async () => { //function to install service workers
  if ("serviceWorker" in navigator) {
    try {
        await navigator.serviceWorker.register("./service-worker.js", { //service worker path inside folder
        scope: "/",
      });
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

registerServiceWorker(); //register service worker


//inventory

//object constructor function for each product
function itemInformation(title, quantity, price, IDtag) { 
    this.title = title;
    this.quantity = quantity;
    this.price = price;
    this.tag = IDtag
}

//all inventory items as objects with their properties
let cheese1 = new itemInformation("Normal Cheese", "0", "3.99", "cheese1"); 
let cheese2 = new itemInformation("Extra-happy Cheese", "0", "5.99", "cheese2");
let cheese3 = new itemInformation("Cheesetring", "0", "2.99", "cheese3");
let spud1 = new itemInformation("Normal Spud", "0", "3.99", "spud1");
let spud2 = new itemInformation("Dangerous Spud", "0", "4.99", "spud2");
let spud3 = new itemInformation("Miniature Spud", "0", "499.00", "spud3");
let rinna1 = new itemInformation("Normal Rinna", "0", "3.99", "rinna1");
let rinna2 = new itemInformation("Observant Rinna", "0", "5.99", "rinna2");
let rinna3 = new itemInformation("Rinna [Special Shape]", "0", "11.99", "rinna3");
let notAKitty = new itemInformation("Perfectly Normal Standard Cat", "0", "4.99", "notAKitty");



//global variables

//array storing the products of the whole inventory
let fullInventory = [cheese1, cheese2, cheese3, spud1, spud2, spud3, rinna1, rinna2, rinna3, notAKitty] 

//array to keep track of the quantity of products the user has chosen without altering fullInventory
let availableObjects = fullInventory; 

//array to store the products chosen by the user
let objectsInCart = []; 

//placeholder username
let currentUser = "nobody"; 

//default currency
let prefCurrency = "gbp"; 



//create cart

//function to get the products chosen by the user
const addItem = (event) => { 
    
    let newElement = event.target.parentElement.id;
    
    //iterate through inventory and compare id against clicked item's id
    for (let i = 0; i < fullInventory.length; i++) {
        let addClicksUp = fullInventory[i].tag;

        //when clicked element is matched to the correct inventory item, increment its quantity in the cart and, if not already in the cart, add it to the cart
        if (addClicksUp === newElement) {

            if (availableObjects[i].quantity < 1) {

               objectsInCart.push(fullInventory[i]);
            }

            availableObjects[i].quantity ++;
        }
    }

    localStorage.setItem("objectsInCart", JSON.stringify(objectsInCart)); //overwrite local storage with the new cart information
}

//construct cart as a table in the DOM by iterating through cart array and adding a new row for each item
//object title, quantity, and total price of objects are displayed
//calculate cart price by adding up objects' prices and store total in cartTotalPrice
const cartItems = () => {
    let cartTotalPrice = 0;

    for (i = 0; i < objectsInCart.length; i++) { 

        let newRow = document.getElementById("cartItems").insertRow(1);
        let title = newRow.insertCell(0);
        let price = newRow.insertCell(1);
        title.innerText = objectsInCart[i].title + " " + " [" + objectsInCart[i].quantity + "]";
        let priceCalc = objectsInCart[i].quantity * objectsInCart[i].price;
        
        //price is rounded to two decimals
        let totalPrice = Number(priceCalc.toFixed(2));
        let totalPriceWithDecimals = (Math.round(totalPrice * 100) / 100).toFixed(2);
        
        let whatCurrency = document.getElementById("currencySymbol").innerHTML;
        price.innerText = whatCurrency + totalPriceWithDecimals;
        cartTotalPrice += totalPrice;
    }

    //display the total price of all items in the cart under the table
    document.getElementById("cartPrice").innerHTML = cartTotalPrice.toFixed(2); 
    
    //show the cart overlay
    document.getElementById("cartDIVOverlay").style.display = "block"; 

    //if the cart is empty, display an empty message and no cart structure or price
    if (objectsInCart.length === 0) {
        document.getElementById("emptyCartMSG").innerHTML = "Your cart is empty! Better pick a kitty!";
        document.getElementById("totalCart").style.display = "none";
        document.getElementById("cartItems").style.display = "none";
        } else { //if the cart isn't empty, show cart structure and price but no empty cart message
        document.getElementById("totalCart").style.display = "block";
        document.getElementById("cartItems").style.display = "block";
        document.getElementById("emptyCartMSG").innerHTML = "";
    }
}



//leaving the cart hides the overlay and removes all cart items from the DOM to avoid duplicates upon rerendering
const leaveCart = (event) => {
    document.getElementById("cartDIVOverlay").style.display = "none";
    document.querySelectorAll("td").forEach(e => e.remove());
}

//emptying the cart empties objectsInCart, removes cart objects from the DOM, removes the cart structure and price and displays the empty cart message
const emptyCart = (event) => {
    objectsInCart.length = 0;
    document.querySelectorAll("td").forEach(e => e.remove());
    document.getElementById("emptyCartMSG").innerHTML = "Your cart is empty! Better pick a kitty!";
    document.getElementById("totalCart").style.display = "none"; 
    
    //remove objectsInCart from local storage
    localStorage.removeItem("objectsInCart");
}



//username form

const formSubmit = (event) => {
    //check for existing username cookie first
    let oldUsername = getUserCookie(); //check for existing cookie with username
    //get the new name the user entered
    let newUsername = document.getElementById("firstname").value + " " + document.getElementById("lastname").value; 
    
    //empty the form
    document.getElementById("firstname").value = "";
    document.getElementById("lastname").value = "";
    
    //if no username is stored, inform user that new username has been recorded and create a new cookie with the username information
    if (oldUsername === "nobody" || oldUsername === undefined) { 
        alert("Thank you! Your information has been recorded to fulfil your order!");
        let currentUser = newUsername;
        createUserCookie(currentUser);
    }

    //TODO: else if here???
    //ensure user meant to change username, then either record new username or keep old username and create cookie accordingly
    if (oldUsername != newUsername && oldUsername != undefined) {
        let answer = confirm(`Do you really want to overwrite the existing details of ` + oldUsername + `?`);
        if (answer === true) {
            alert("Thank you! Your information has been recorded to fulfil your order!");
            let currentUser = newUsername;
            createUserCookie(currentUser);
        } else {
            alert(`Okay, we'll keep ` + oldUsername + ` in our records!`);
            
            //TODO: is this necessary?
            let currentUser = oldUsername;
            createUserCookie(currentUser);
        }

        //let the user know their username is already stored
    } else if (oldUsername === newUsername) {
        alert("Hey! You're already logged in! Good to see you again :)"); 
    }
}

//enter key works as submit button
const submitFN = () => { 
    if (event.key === "Enter") {
        document.getElementById("submitBtn").click();
    }
}



//cookie functions

const createUserCookie = (currentUser) => { //function to create a cookie, either using a placeholder or a known username
    if (currentUser === undefined || currentUser === "nobody") {
        document.cookie = "name=nobody; expires=Tue, 27 Jul 2027 00:00:00GMT ;path=/";
    } else {
        document.cookie = "name=" + currentUser + "; expires=Tue, 27 Jul 2027 00:00:00GMT ;path=/";
    }
}

const createCurrencyCookie = (prefCurrency) => {
    document.cookie = "prefCurrency=" + prefCurrency + "; expires=Tue, 27 Jul 2027 00:00:00GMT ;path=/"; //create a cookie for the preferred currency
}

const getUserCookie = (name) => { //check for existing cookie with a username
    let cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }
}

const getCurrencyCookie = () => { //check for existing cookie with a preferred currency
    console.log(document.cookie);
    let cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(prefCurrency + "=")) {
            console.log(cookie.substring(prefCurrency.length +1));
            let cookieCurrency = cookie.substring(prefCurrency.length +1);
            return cookieCurrency;
        }
    }
}

const checkUserCookie = () => {
    let currentUser = getUserCookie("name"); //try to get username from existing cookie
    if (currentUser != undefined) {
        document.getElementById("welcomeHeader").innerHTML = "Welcome back, " + currentUser + "!"; //if cookie exists, use existing username to greet user.
    }
}

const noCookiesFN = () => {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"; //delete cookie if the user opts out
}


//welcome overlay

const getUserPref = () => {
    //get selected font
    let selectFont = document.getElementById("font").value;
    
    //apply selected fonts
    if (selectFont === "arial") { 
        document.getElementById("everyThing").style.fontFamily = "Arial,Helvetica,sans-serif";
    
    } else if (selectFont === "timesnewroman") {
        document.getElementById("everyThing").style.fontFamily = "'Times New Roman',Times,serif";
    
    } else if (selectFont === "courier") {
        document.getElementById("everyThing").style.fontFamily = "'Courier New',Courier,monospace";
        //overlay is too small for the text in monofont, so it needs to be smaller
        document.getElementById("biscuitText").style.fontSize = "14px";
    }

    //store font preference
    sessionStorage.setItem("font", selectFont);

    //get selected currency
    let newPrefCurrency = document.getElementById("currencyForm").value;

    //get old preferred currency
    let cookieCrumb = document.cookie.split(";")[0].split("=");
    let prefCurrency = cookieCrumb[1];
    
    //insert preferred currency symbol for every shown price as well as in the cart
    if (prefCurrency === newPrefCurrency) {

        if (newPrefCurrency === "usd") {

            let dollars = document.querySelectorAll(".currencySymbol");
            for (let i = 0; i < dollars.length; i++) {
                dollars[i].innerHTML = "$";
            }

            document.getElementById("currencySymbolCart").innerHTML = "$";
            document.getElementById("currencyForm").selectedIndex = 2;


        } else if (newPrefCurrency === "rand") {

            let rand = document.querySelectorAll(".currencySymbol")
            for (let i = 0; i < rand.length; i++) {
                rand[i].innerHTML = "R";
            }

            document.getElementById("currencySymbolCart").innerHTML = "R";
            document.getElementById("currencyForm").selectedIndex = 3;

        } else if (newPrefCurrency === "beans") {

            let beans = document.querySelectorAll(".currencySymbol")
            for (let i = 0; i < beans.length; i++) {
                beans[i].innerHTML = "&#x1F43E;";
            }

            document.getElementById("currencySymbolCart").innerHTML = "&#x1F43E;";
            document.getElementById("currencyForm").selectedIndex = 4;
        }

        //close welcome overlay
        document.getElementById("close").click();

    //if new currency was chosen, check this was the user's intention and if yes, apply the new currency    
    } else if (newPrefCurrency != prefCurrency) {

        let answer = confirm("Do you want to change the currency you see our products in?");
        if (answer === true) { 

            if (newPrefCurrency === "usd") {

                let dollars = document.querySelectorAll(".currencySymbol");
                for (let i = 0; i < dollars.length; i++) {
                    dollars[i].innerHTML = "$";
                }

                document.getElementById("currencySymbolCart").innerHTML = "$";
                document.getElementById("currencyForm").selectedIndex = 2;
            } else if (newPrefCurrency === "rand") {

                let rand = document.querySelectorAll(".currencySymbol")
                for (let i = 0; i < rand.length; i++) {
                    rand[i].innerHTML = "R";
                }

                document.getElementById("currencySymbolCart").innerHTML = "R";
                document.getElementById("currencyForm").selectedIndex = 3;

            } else if (newPrefCurrency === "beans") {

                let beans = document.querySelectorAll(".currencySymbol")
                for (let i = 0; i < beans.length; i++) {
                    beans[i].innerHTML = "&#x1F43E;";
                }

                document.getElementById("currencySymbolCart").innerHTML = "&#x1F43E;";
                document.getElementById("currencyForm").selectedIndex = 4;
            }

            //close welcome overlay
            document.getElementById("close").click();

            //accept new currency as standard and store it in a cookie
            let prefCurrency = newPrefCurrency;

            createCurrencyCookie(prefCurrency);
            
            return prefCurrency;

        } else if (answer != true) {
            //close welcome overlay
            document.getElementById("close").click();

            createCurrencyCookie(prefCurrency);
            
            return prefCurrency;
        }
    }
}



//onload function

const loadFN = () => {
    //check for existing username cookie 
    checkUserCookie();
    getUserCookie();

    //retrieve cart from local storage
    retrieveCart(availableObjects);

    //retrieve previous preferred font
    let documentFont = sessionStorage.getItem("font");

    //apply prevoius preferred font if applicable
    if (documentFont === "arial") {
        document.getElementById("everyThing").style.fontFamily = "Arial,Helvetica,sans-serif";
    } else if (documentFont === "timesnewroman") {
        document.getElementById("everyThing").style.fontFamily = "'Times New Roman',Times,serif";
    } else if (documentFont === "courier") {
        document.getElementById("everyThing").style.fontFamily = "'Courier New',Courier,monospace"
    };

    //check for stored preferred currency
    let cookieCrumb = document.cookie.split(";")[0].split("=");
    let prefCurrency = cookieCrumb[1];

    //console.log('prefCurrency is ', prefCurrency);

    //apply currency preference
    //if no currency preference is stored because of a first-time user, the generic currency GBP will be applied
    if (prefCurrency === "usd") {
        let dollars = document.querySelectorAll(".currencySymbol");
        for (let i = 0; i < dollars.length; i++) {
            dollars[i].innerHTML = "$";
        }
    } else if (prefCurrency === "rand") {
        let rand = document.querySelectorAll(".currencySymbol")
        for (let i = 0; i < rand.length; i++) {
            rand[i].innerHTML = "R";
        }
    } else if (prefCurrency === "beans") {
        let beans = document.querySelectorAll(".currencySymbol")
        for (let i = 0; i < beans.length; i++) {
            beans[i].innerHTML = "&#x1F43E;";
        }
    }
}

//retrieve cart information from local storage and add it to the current cart
const retrieveCart = (availableObjects) => {
    let oldCart = JSON.parse(localStorage.getItem("objectsInCart"));
    if (oldCart != null) {
        for (let a = 0; a < oldCart.length; a++) {
            let oldItem = oldCart[a].tag;
            let oldQuantity = oldCart[a].quantity;
            for (let i = 0; i < availableObjects.length; i++) {
                let currentObject = availableObjects[i].tag;
                if (oldItem === currentObject) {
                    availableObjects[i].quantity = Number(availableObjects[i].quantity) + Number(oldQuantity);
                    objectsInCart.push(availableObjects[i]);
                }
            }
        }
    }
}

//close welcome overlay
const closeFN = () => {
    document.getElementById("welcomeOverlay").style.display = "none";
}