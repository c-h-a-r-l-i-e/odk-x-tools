/**
 * The file for displaying a detail view.
 */
/* global $, odkTables, odkData */
'use strict';

var personId;

//Triggered when Go Back button pressed
function goBack() {
    odkCommon.closeWindow();
}

// Returns a function to add a new row
function createClickFunction(form, elementKeyToValueMapId) {
    return function() {
        odkTables.addRowWithSurvey(
                null,
                form.tableId,
                form.formId,
                null,
                elementKeyToValueMapId);
    };
}


// Displays details about people and links to survey form
function display(result) {
    console.log(result.get('photo'));

    personId = result.get('id');

    var firstName = result.get('first_name');
    var otherName = result.get('other_name');
    var surname = result.get('surname');
    document.getElementById('title').innerHTML = firstName;
    document.getElementById('title').innerHTML += (otherName !== null && otherName !== '') ? (' (' + otherName +')') : '';
    document.getElementById('title').innerHTML += ' ' + surname;

    document.getElementById('age').innerHTML = result.get('age');
    document.getElementById('gender').innerHTML = result.get('gender');

    // date is in format yyyy-mm-dd so reorder to dd/mm/yyyy
    var date = result.get('registration_date').substring(0,10);
    document.getElementById('regdate').innerHTML = date.substring(8,10) + '/' + date.substring(5,7) + '/' + date.substring(0, 4);

    // Creates key-to-value map that can be interpreted by the specified
    // survey form - to prepopulate forms with person id
    var elementKeyToValueMapId = {person_id: personId};

    for (var i = 0; i < forms.length; i++) {
        var form = forms[i];
        // Create button which will launch a new form with person ID supplied
        var newFormButton = document.createElement('p');
        newFormButton.innerHTML = form.label;
        newFormButton.setAttribute('class', 'forms');
        newFormButton.onclick = createClickFunction(form, elementKeyToValueMapId);
        document.getElementById('wrapper').appendChild(newFormButton);
    }
}

function cbSuccess(result) {
    display(result);
}

function cbFailure(error) {
    console.log('person_detail: failed with error: ' + error);
}

// handles events from html page
function setup() {
    odkData.getViewData(cbSuccess, cbFailure);
}

$(document).ready(setup);


