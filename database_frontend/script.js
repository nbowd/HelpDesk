const baseUrl = `http://localhost:4593/`;

// This is a monster function, I plan to break it up into more managable functions but I just need to get it working
const makeRow = (row) => {

    let rowInputs = [];  // used for disabling later

    let tbody = document.querySelector('#tbody');
    let tr = tbody.appendChild(document.createElement('tr'));
    // Assign table id as row name
    tr.id = 'row'+row.id;

    // Create name input with value from database(db)
    let tdName = tr.appendChild(document.createElement('td'));
    let name = tdName.appendChild(document.createElement('input'));
    name.value = row.name;
    name.placeholder = 'Name';
    name.type = 'text';
    rowInputs.push(name);
    
    // Subject input with value from db
    let tdSubject = tr.appendChild(document.createElement('td'));
    let subject = tdSubject.appendChild(document.createElement('input'));
    subject.value = row.subject;
    subject.placeholder = 'Ticket Subject';
    subject.type = 'text';
    rowInputs.push(subject);

    // Issue input with value from db
    let tdIssue = tr.appendChild(document.createElement('td'));
    let issue = tdIssue.appendChild(document.createElement('input'));
    issue.value = row.issue;
    issue.placeholder = 'Ticket Issue';
    issue.type = 'text';
    rowInputs.push(issue);

    // Contact input with value from db
    let tdContact = tr.appendChild(document.createElement('td'));
    let contact = tdContact.appendChild(document.createElement('input'));
    contact.value = row.contact;
    contact.placeholder = 'Contact Info';
    contact.type = 'text';
    rowInputs.push(contact);

    // Open status
    let tdStatus = tr.appendChild(document.createElement('td'));
    let statusLabelOpen = tdStatus.appendChild(document.createElement('label'));
    statusLabelOpen.for = 'open'+row.id;
    statusLabelOpen.textContent = 'Open';
    statusLabelOpen.classList.add('status-label');
    let statusOpen = tdStatus.appendChild(document.createElement('input'));
    statusOpen.type = 'radio';
    statusOpen.id = 'open'+row.id;
    statusOpen.name = 'status'+row.id;
    statusOpen.value = 0;
    rowInputs.push(statusOpen);

    // Closed status
    let statusLabelClosed = tdStatus.appendChild(document.createElement('label'));
    statusLabelClosed.for = 'closed'+row.id;
    statusLabelClosed.textContent = 'Closed';
    statusLabelClosed.classList.add('status-label');
    let statusClosed = tdStatus.appendChild(document.createElement('input'));
    statusClosed.type = 'radio';
    statusClosed.id = 'closed'+row.id;
    statusClosed.name = 'status'+row.id;
    statusClosed.value = 1;
    rowInputs.push(statusClosed);
    
    // Indicates current status
    if (row.status == 0) {
        statusOpen.checked = true;
    } else if (row.status == 1) {
        statusClosed.checked = true;
    }; 

    // Date input with value from db
    let tdDate = tr.appendChild(document.createElement('td'));
    let date = tdDate.appendChild(document.createElement('input'));
    date.type = 'date';
    date.value = row.date;
    date.name = 'date';
    rowInputs.push(date);

    // Disables the row inputs until the edit button is pressed
    disableRow(rowInputs);
    
    // Creates edit button for the row
    let tdEdit = tr.appendChild(document.createElement('td'));
    editButton = tdEdit.appendChild(document.createElement('input'));
    editButton.type = 'submit';
    editButton.value = 'Edit';
    editButton.id = row.id;
    editButton.classList.add('edit-btn');

    // Creates delete button for the row
    let tdDelete = tr.appendChild(document.createElement('td'));
    deleteButton = tdEdit.appendChild(document.createElement('input'));
    deleteButton.type = 'submit';
    deleteButton.value = 'Delete';
    deleteButton.id = row.id;
    deleteButton.classList.add('edit-btn');

    // Creates submit button for edited row, disabled until edit is pressed
    let tdSubmit = tr.appendChild(document.createElement('td'));
    submitButton = tdEdit.appendChild(document.createElement('input'));
    submitButton.type = 'submit';
    submitButton.value = 'Submit';
    submitButton.id = row.id;
    submitButton.disabled = true;
    submitButton.classList.add('edit-btn');
    
};

// Disables every input in passed list
const disableRow = (inputList) => {
    for (let inputs in inputList) {
        inputList[inputs].disabled = true
    };
};

// Enables every disabled input in the row, including submit button
// disables edit button
const enableRow = (rowTarget) => {
  let row = document.querySelector('#row'+rowTarget);
  let rowInputs = row.querySelectorAll('input');
    for (let ips in rowInputs){
        if (rowInputs[ips].disabled === true){
            rowInputs[ips].disabled = false;
        }

        if (rowInputs[ips].value === 'Edit'){
            rowInputs[ips].disabled = true;
        }
    };
};   

// get data (async) on window load gets current row data from db
window.onload = async (e) => {
    const res = await axios.get(baseUrl);
    const rowsArray = res.data.rows;
    for (let row in rowsArray) {
        makeRow(rowsArray[row]);
    }; 
};

// Add form at the top to submit new row information to the db, does not refresh the page, awaits response
// and displays the updated table in the browser
const addForm = document.getElementById('new_ticket');
addForm.addEventListener('submit', async (e) => {
    // Stops page from refreshing on submit
    e.preventDefault();

    // Creates a place to store form data for request
    let context = {name:new_ticket.elements.name.value, subject:new_ticket.elements.subject.value, issue:new_ticket.elements.issue.value,
        contact:new_ticket.elements.contact.value, status:new_ticket.elements.status.value, date:new_ticket.elements.date.value};
    const res = await axios.post(baseUrl, context);
    const rows = res.data.rows;
    makeRow(rows[rows.length -1]);
    addForm.reset();  
});

// Single event listener on the table element, action in response depends on the target clicked
// Edit button presses will enable the row and submit button
// Submit button gets the current values of the inputs and makes a put request with the row id as part of the query
// Delete button takes the row id and sends a delete request with the row id as the query string
const table = document.getElementById('table');
table.addEventListener('click', async (event) => {
    let target = event.target;

    // Edit button, enables row for editing
    if (target.value === 'Edit'){
        enableRow(target.id);
    }
    // Submit button, send a put request to the server
    if (target.value === 'Submit'){
        let targetRow = document.querySelector(`#row${target.id}`);
        let revision = targetRow.querySelectorAll('input');
        console.log(revision)
        let context = {name:revision[0].value, subject:revision[1].value, issue:revision[2].value, contact:revision[3].value};

        let radio = document.querySelector(`#open${target.id}`);
        if (radio.checked) {
            context.status = 0
        } else {
            context.status = 1
        };
        context.date = revision[6].value;

        document.getElementById('tbody').innerHTML = '';  // Resets table for repopulation

        let res = await axios.put(baseUrl+`?id=${target.id}`, context);
        const rowsArray = res.data.rows;
        for (let row in rowsArray) {
            makeRow(rowsArray[row]);        
    }        
        
    }
    // Delete button, sends a delete request to server
    if (target.value === 'Delete'){
        document.getElementById('tbody').innerHTML = '';  // Resets table for repopulation

        let res = await axios.delete(baseUrl+`?id=${target.id}`);
        const rowsArray = res.data.rows;
        for (let row in rowsArray) {
            makeRow(rowsArray[row]);        
    }
}});
