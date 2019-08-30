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

// Displays details about people and links to survey form
function display(result) {
    console.log(result.get('photo'));

    // Details - Person id, age
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

    // Create button which will launch a new survey with person ID supplied
    var newSurveyBtn = document.createElement('p');
    newSurveyBtn.innerHTML = 'New Survey';
    newSurveyBtn.setAttribute('class', 'forms');
    newSurveyBtn.onclick = function() {
        odkTables.addRowWithSurvey(
				null,
                'survey',
                'survey',
                null,
                elementKeyToValueMapId);
    };

    document.getElementById('wrapper').appendChild(newSurveyBtn);

    // Create button which will launch a new sample with person ID supplied
    var newSampleBtn = document.createElement('p');
    newSampleBtn.innerHTML = 'New Biological Sample';
    newSampleBtn.setAttribute('class', 'forms');
    newSampleBtn.onclick = function() {
        odkTables.addRowWithSurvey(
				null,
                'sample',
                'sample',
                null,
                elementKeyToValueMapId);
    };

    document.getElementById('wrapper').appendChild(newSampleBtn);
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


