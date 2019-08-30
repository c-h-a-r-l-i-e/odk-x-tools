/**
 * The file for displaying a detail view.
 */
/* global $, odkTables, odkData */
'use strict';

var householdID;


/** Handles clicking on a list item. Applied via a string. */
function handleClick(index) {
    odkTables.openDetailView(null,
        'person',
        index,
        'config/tables/person/html/person_detail.html');
}

//Triggered by Go Back button
function goBack() {
    odkCommon.closeWindow();
}

function convertName(firstName, otherName, surname) {
    var name = firstName;
    if (otherName !== null && otherName!== '') {
        name += ' (' + otherName + ')';
    }
    name += ' ' + surname;
    return name;
}


// Add a single person to the list on-screen
function displayPerson(firstName, otherName, surname, age, gender, rowID) {
    /*    Creating the item space    */
    var item = document.createElement('li');
    item.setAttribute('class', 'item_space');
    item.setAttribute(
            'onClick',
            'handleClick("' + rowID + '")');
    item.innerHTML = convertName(firstName, otherName, surname);

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


// Called when we succesfully retrieve household members from the database
// - displays members within the list
function cbMemberSuccess(members) {
    console.log('member success data is' + members);
    for (var i = 0; i < members.getCount(); i++) {
        var firstName = members.getData(i, 'first_name');
        var otherName = members.getData(i, 'other_name');
        var surname = members.getData(i, 'surname');
        var age = members.getData(i, 'age');
        var gender = members.getData(i, 'gender');
        var rowID = members.getRowId(i);

        // Only include entries with first and surname defined
        if (firstName !== null &&
            firstName !== '' &&
            surname !== null &&
            surname !== '') {
            displayPerson(firstName, otherName, surname, age, gender, rowID);
        }
    }
}



// Called when we fail to retrieve household members from the database
function cbMemberFailure(error) {
    console.log('member fetch failed with error' + error);
}
    

// Displays details about the household, including members and links to survey form
function display(result) {
    householdID = result.get('id');
    
    var head = convertName(result.get('head_first_name'), 
        result.get('head_other_name'), result.get('head_surname'));

    document.getElementById('title').innerHTML = head + "'s Household";
    document.getElementById('members').innerHTML = result.get('members');

    // Create button which will launch a new survey with house id provided
    var newPersonButton = document.createElement('p');
    newPersonButton.innerHTML = 'New Person In Household';
    newPersonButton.setAttribute('class', 'forms');

    newPersonButton.onclick = function() {
        var id = odkCommon.genUUID();
        odkCommon.setSessionVariable('person_id', id);

        var elementKeyToValueMapId = {'household_id' : householdID, 'id' : id};
        odkTables.addRowWithSurvey(
				null,
                'person',
                'person',
                null,
                elementKeyToValueMapId);
    };

    document.getElementById('wrapper').prepend(newPersonButton);


    // Now get all members and display them on the page - do 
    // this by querying the people database on household_id
    odkData.query('person', 'household_id = ?', [householdID], null, 
        null, null, null, null, null, true, cbMemberSuccess, cbMemberFailure);
    
}

// Triggered when new person is succesfully enterred.
function foundPerson(searchData) {
    console.log(searchData);
    if(searchData.getCount() > 0) {
        var firstName = searchData.getData(0, 'first_name');
        if (firstName !== null && firstName !== '') {
            // open filtered list view if client found
            var rowId = searchData.getRowId(0);
            odkTables.openTableToListView(null,
                'person',
                '_id = ?',
                [rowId],
                'config/tables/person/html/person_detail.html');
        }
    }
}




// callback success - called when this is first shown
function cbSuccess(result) {

    display(result);
}

function cbFailure(error) {
    console.log('household_detail: failed with error: ' + error);
}

// handles events from html page
function setup() {
    var newPersonID = odkCommon.getSessionVariable('person_id');
    console.log(newPersonID);

    //If we just registered a new house
    // TODO: deal with case new house is null!!!
    if (newPersonID != null) {
        odkCommon.setSessionVariable('person_id', null);
        odkData.query('person', 'id = ?', [newPersonID],
            null, null, null, null, null, null, true, foundPerson, null);
    }

    odkData.getViewData(cbSuccess, cbFailure);
}

$(document).ready(setup);


