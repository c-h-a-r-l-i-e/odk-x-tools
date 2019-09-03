/**
 * This is the file that will be creating the list view.
 */
/* global $, odkTables, odkData, odkCommon */
/*exported display, handleClick, getResults */
'use strict';

var householdList = [];
// Map from household ID to list of people in that household
var householdToPersonMap = {}
var fuse; // Used by Fuse.js for fuzzy searching

/** Handles clicking on a list item. Applied via a string. */
function handleClick(index) {
    odkTables.openDetailView(null,
        'household', 
        index,
        'config/tables/household/html/household_detail.html');
}

//Triggered by Go Back button
function goBack() {
    odkCommon.closeWindow();
}

//Triggered by New Household button
function newHousehold() {
    var id = odkCommon.genUUID();
    odkCommon.setSessionVariable('household_id', id);
    var map = {'id': id};
    odkTables.addRowWithSurvey(null,
                                'household',
                                'household',
                                null,
                                map);

}

// filters list view by client id entered by user
function getResults() {
    var searchText = document.getElementById('search').value;
    
    //If no search query, display no-one
    if (searchText == "") {
        clearHouseholds();
        document.getElementById("newHouseholdButton").style.display = "none";
    }

    else {
        //TODO: message if no results
        var resultList = fuse.search(searchText);
        displayHouseholds(resultList);
        document.getElementById("newHouseholdButton").style.display = "block";
    }
}


// Clear the on-screen list of households
function clearHouseholds() {
    var list = document.getElementById('list');
    while (list.firstChild) {
        list.removeChild(list.firstChild)
    }
}

// Add a single household to the list on-screen
function displayHousehold(name, householdID, rowID) {
    /*    Creating the item space    */
    var item = document.createElement('li');

    var chevron = document.createElement('img');
    chevron.setAttribute(
            'src',
            odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
    chevron.setAttribute('class', 'chevron');
    item.appendChild(chevron);


    item.setAttribute('class', 'item_space');
    item.setAttribute(
            'onClick',
            'handleClick("' + rowID + '")');
    item.innerHTML = name + "'s Household";

    // create sub-list in item space to display members
    if (householdToPersonMap.hasOwnProperty(householdID)) {
        var members = householdToPersonMap[householdID];

        for (var i = 0; i < members.length; i++) {
            var member = members[i];
            var name = convertName(member.firstName, member.otherName, member.surname);

            var membersElement = document.createElement('li');
            membersElement.setAttribute('class', 'detail');
            membersElement.innerHTML = '*' + name + ' - ' + member.age + ' (' + member.gender + ')';
            item.appendChild(membersElement);
        }
    }

    document.getElementById('list').appendChild(item);
}

function convertName(firstName, otherName, surname) {
    var name = firstName;
    if (otherName !== null && otherName!== '') {
        name += ' (' + otherName + ')';
    }
    name += ' ' + surname;
    return name;
}


function displayHouseholds(households) {
    clearHouseholds();
    for (var i = 0; i < households.length; i++) {
        var household = households[i];
        var name = convertName(household.headFirstName, household.headOtherName, household.headSurname);
        displayHousehold(name, household.householdID, household.rowID);
    }
}


// displays list view of households
function render() {
    //Automatically search whenever search content changed
    document.getElementsByName("query")[0].addEventListener("input", getResults);

    // Set up fuzzy searching using Fuse.js
    var options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
            "headFirstName",
            "headOtherName",
            "headSurname"
        ]
    };
    fuse = new Fuse(householdList, options);
}

// Triggered when new house is succesfully enterred.
function foundHouse(searchData) {
    if(searchData.getCount() > 0) {
        // Use headname to check whether household has actually been registered
        var headName = searchData.getData(0, 'head_first_name');
        console.log(headName);

        if (headName !== null & headName !== '') {       // open filtered list view if client found
            var rowId = searchData.getRowId(0);
            odkTables.openTableToListView(null,
                'household',
                '_id = ?',
                [rowId],
                'config/tables/household/html/household_detail.html');
        }
    }
}


// these are called when the page is first loaded

// 1. this is called first, and either displays the house we just registered or
// gets the household data
function display() {
    var newHouseID = odkCommon.getSessionVariable('household_id');

    //If we just registered a new house
    if (newHouseID != null) {
        odkCommon.setSessionVariable('household_id', null);
        odkData.query('household', 'id = ?', [newHouseID],
            null, null, null, null, null, null, true, foundHouse, null);
    }
    
    odkData.getViewData(householdSuccess, failure);
}


// 2. This is called once we get the household data, it formats the data into a list of households
//    and then retrieves data about the people
function householdSuccess(result) {
    var households = result;

    // Go through households, adding everyone's information to a list of households
    for (var i = 0; i < households.getCount(); i++) {
        var headFirstName = households.getData(i, 'head_first_name');
        var headOtherName = households.getData(i, 'head_other_name');
        var headSurname = households.getData(i, 'head_surname');
        var members = households.getData(i, 'members');
        var householdID = households.getData(i, 'id');
        var rowID = households.getRowId(i);
       
        if (headFirstName !== null && headFirstName !== '') {
            householdList.push({
                'headFirstName' : headFirstName,
                'headOtherName' : headOtherName,
                'headSurname' : headSurname,
                'members' : members,
                'householdID' : householdID,
                'rowID' : rowID});
        }
    }

    // Get people data
    odkData.query('person', '', 
        null, null, null, null, null, null, null, null, 
        personSuccess, failure);
}

// 3. This is called once we get the list of people, and it starts the page rendering
function personSuccess(result) {
    var persons = result;

    // Go through people
    for (var i = 0; i < persons.getCount(); i++) {
        var firstName = persons.getData(i, 'first_name');
        var otherName = persons.getData(i, 'other_name');
        var surname = persons.getData(i, 'surname');
        var age = persons.getData(i, 'age');
        var gender = persons.getData(i, 'gender');
        var householdID = persons.getData(i, 'household_id');
        var rowID = persons.getRowId(i);
       
        // Add person to the list of people in their household 
        if (firstName !== null && firstName !== '') {
            if (!householdToPersonMap.hasOwnProperty(householdID)) {
                householdToPersonMap[householdID] = []
            }
            
            householdToPersonMap[householdID].push({
                'firstName' : firstName,
                'otherName' : otherName,
                'surname' : surname,
                'age' : age,
                'gender' : gender,
                'rowID' : rowID});
        }
    }

    console.log(householdToPersonMap);

    render();
}

function failure(error) {
    console.log('household_list: failed with error: ' + error);
}
