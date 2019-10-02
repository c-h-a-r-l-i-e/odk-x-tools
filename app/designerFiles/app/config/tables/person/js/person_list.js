/**
 * This is the file that will be creating the list view.
 */
/* global $, odkTables, odkData, odkCommon */
/*exported display, handleClick, getResults */
'use strict';

var persons = {};
var personList = [];
var fuse; // Used by Fuse.js for fuzzy searching

/** Handles clicking on a list item. Applied via a string. */
function handleClick(index) {
    if (!$.isEmptyObject(persons)) {
        odkTables.openDetailView(null,
            persons.getTableId(),
            index,
            'config/tables/person/html/person_detail.html');
    }
}

function cbSRSuccess(searchData) {
    console.log('cbSRSuccess data is' + searchData);
    if(searchData.getCount() > 0) {
        // open filtered list view if client found
        var rowId = searchData.getRowId(0);
        odkTables.openTableToListView(null,
                'person',
                '_id = ?',
                [rowId],
                'config/tables/person/html/person_list.html');
    } else {
        document.getElementById("search").value = "";
        document.getElementsByName("query")[0].placeholder="Person not found";
    }
}

function cbSRFailure(error) {
    console.log('person_list: cbSRFailure failed with error: ' + error);
}

//Triggered by Go Back button
function goBack() {
    odkCommon.closeWindow();
}

// filters list view by client id entered by user
function getResults() {
    var searchText = document.getElementById('search').value;
    
    //If no search query, display no-one
    if (searchText == "") {
        clearPeople();
        document.getElementById("newPersonButton").style.display = "none";
    }

    //TODO: message if nobody found
    else {
        var resultList = fuse.search(searchText);
        displayPeople(resultList);
        document.getElementById("newPersonButton").style.display = "block";
    }
}


// Clear the on-screen list of people
function clearPeople() {
    var list = document.getElementById('list');
    while (list.firstChild) {
        list.removeChild(list.firstChild)
    }
}

// Add a single person to the list on-screen
function displayPerson(firstName, otherName, surname, age, gender, rowID) {
    /*    Creating the item space    */
    var item = document.createElement('li');
    item.setAttribute('class', 'item_space');
    item.setAttribute(
            'onClick',
            'handleClick("' + rowID + '")');
    item.innerHTML = firstName;
    if (otherName !== null && otherName !== '') {
        item.innerHTML += ' (' + otherName + ')';
    }
    item.innerHTML += ' ' + surname;
    
    document.getElementById('list').appendChild(item);

    var chevron = document.createElement('img');
    chevron.setAttribute(
            'src',
            odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
    chevron.setAttribute('class', 'chevron');
    item.appendChild(chevron);

    // create sub-list in item space
    //  Age information
    var ageElement = document.createElement('li');
    ageElement.setAttribute('class', 'detail');
    ageElement.innerHTML = 'Age: ' + age;
    item.appendChild(ageElement);

    var genderElement = document.createElement('li');
    genderElement.setAttribute('class', 'detail');
    genderElement.innerHTML = 'Gender: ' + ((gender !== null && gender !== '') ? 
            gender 
            : 'N/A');
    item.appendChild(genderElement);
}


function displayPeople(people) {
    clearPeople();
    for (var i = 0; i < people.length; i++) {
        var person = people[i];
        displayPerson(person.firstName, person.otherName, person.surname,
            person.age, person.gender, person.rowID);
    }
}


function newPerson() {
        odkTables.openTableToListView(null,
                                'household',
                                null,
                                null,
                                'config/tables/household/html/household_list.html');
}

// displays list view of clients
function render() {

    //Automatically search whenever search content changed
    document.getElementsByName("query")[0].addEventListener("input", getResults);


    // Not registered button, launches the household display list, to check whether household 
//    // has been registered yet
//    var notRegistered = document.createElement('p');
//    notRegistered.onclick = function() {
//        odkTables.openTableToListView(null,
//                                'household',
//                                null,
//                                null,
//                                'config/tables/household/html/household_list.html');
//    };
//    notRegistered.setAttribute('class', 'button');
//    notRegistered.innerHTML = 'Person Not Yet Registered';
//    document.getElementById('searchBox').appendChild(notRegistered);

    // Go through people, adding everyone's information to a list of people
    for (var i = 0; i < persons.getCount(); i++) {
        var firstName = persons.getData(i, 'first_name');
        var otherName = persons.getData(i, 'other_name');
        var surname = persons.getData(i, 'surname');
        var age = persons.getData(i, 'age');
        var gender = persons.getData(i, 'gender');
        var rowID = persons.getRowId(i);

        // Only include entries with first and surname defined
        if (firstName !== null &&
            firstName !== '' &&
            surname !== null &&
            surname !== '') {
            personList.push({
                'firstName' : firstName,
                'otherName' : otherName,
                'surname' : surname,
                'age' : age,
                'gender' : gender,
                'rowID' : rowID});
        }
    }


    // Set up fuzzy searching using Fuse.js
    var options = {
        shouldSort: true,
        threshold: 0.3,
        tokenize: true,
        location: 0,
        distance: 0,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
        "firstName",
        "otherName",
        "surname"
        ]
    };
    fuse = new Fuse(personList, options);
}

function cbSuccess(result) {
    persons = result;
    render();
}

function cbFailure(error) {
    console.log('person_list: failed with error: ' + error);
}

function display() {
    odkData.getViewData(cbSuccess, cbFailure);
}
