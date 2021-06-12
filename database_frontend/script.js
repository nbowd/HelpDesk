const baseUrl = `http://localhost:4593/`;
const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closedModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = document.querySelector(button.dataset.modalTarget)
      openModal(modal)
    })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
      closeModal(modal)
  })
})
closedModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal')
      closeModal(modal)
    })
})

function openModal(modal) {
    if (modal == null) return
    modal.classList.add('active')
    overlay.classList.add('active')
}

function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
}


// 
const makeRow = (row) => {

    let tbody = document.querySelector('#tbody');
    let tr = tbody.appendChild(document.createElement('tr'));
    // Assign table id as row name
    tr.id = 'row'+row.id;

    // Create name cell
    makeCell(tr, row.name);

    // Subject Cell
    makeCell(tr, row.subject);

    // View Issue Button
    issueSetup(tr, row)

    // Contact Cell
    makeCell(tr, row.contact);

    // Status cell
    statusSetup(tr, row); 

    // Date Cell
    makeCell(tr, row.date);
    
    // Edit button for row, returns td element containing button
    let editButton = makeEdit(tr, row);
    
    // Close ticket button, hidden until edit toggle
    makeOptions(editButton, 'Close Ticket', row.id)

    // Creates delete button, hidden
    makeOptions(editButton, 'Delete', row.id)

    // Creates submit button, hidden
    makeOptions(editButton, 'Submit', row.id)

};

const makeCell = (tr, rowProp) => {
    let cell = tr.appendChild(document.createElement('td'));
    cell.textContent = rowProp
}

const issueSetup = (tr, row) => {
    let tdIssue = tr.appendChild(document.createElement('td'));
    let issue = tdIssue.appendChild(document.createElement('input'));
    issue.value = 'View'
    issue.placeholder = row.issue;
    issue.type = 'button';
    issue.dataset.modalTarget = '#issue-modal'
    issue.id = row.id
    issue.classList.add('issue'+row.id)
}

const statusSetup = (tr, row) => {
    let tdStatus = tr.appendChild(document.createElement('td'));
    tdStatus.id = 'status'+row.id
    
    // Indicates current status
    if (row.status == 0) {
        tdStatus.textContent = 'Open';
    } else if (row.status == 1) {
        tdStatus.textContent = 'Closed';
    };   
}

const makeEdit = (tr, row) => {
    let tdEdit = tr.appendChild(document.createElement('td'));
    let editButton = tdEdit.appendChild(document.createElement('input'));
    editButton.type = 'submit';
    editButton.value = 'Edit';
    editButton.id = row.id;
    editButton.classList.add('edit-btn');
    return tdEdit
}
const makeOptions = (td, text, id) => {
    let closeButton = td.appendChild(document.createElement('input'));
    closeButton.type = 'submit';
    closeButton.value = text;
    closeButton.id = id;
    closeButton.hidden = true;
    closeButton.classList.add('edit-btn');
}

// Reveals hidden buttons, hides edit button
const enableRow = (rowTarget) => {
  let row = document.querySelector('#row'+rowTarget);
  let rowInputs = row.querySelectorAll('input');
    for (let ips in rowInputs){
        if (rowInputs[ips].hidden === true){
            rowInputs[ips].hidden = false;
        }

        if (rowInputs[ips].value === 'Edit'){
            rowInputs[ips].hidden = true;
        }
    };
};   

// Add form at the top to submit new row information to the db, does not refresh the page, awaits response
// and displays the updated table in the browser
const addForm = document.getElementById('new_ticket');
addForm.addEventListener('submit', async (e) => {
    // Stops page from refreshing on submit
    e.preventDefault();

    // Current date used for ticket creation
    d = new Date()
    today = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`

    // Request payload
    let context = {name:new_ticket.elements.name.value, subject:new_ticket.elements.subject.value, issue:new_ticket.elements.issue.value,
        contact:new_ticket.elements.contact.value, status:0, date:today};

    const res = await axios.post(baseUrl, context);
    const rows = res.data.rows;

    makeRow(rows[rows.length - 1]);
    
    addForm.reset();  
    closeModal(addForm.closest('.modal'));
});

// Single event listener on the table element, action in response depends on the target clicked
// Edit button reveals hidden buttons, hides itself
// View activates a modal containing the connected issue
// Close Ticket changes the current status of that ticket to closed, still needs to be submitted
// Submit button gets the current table values and makes an update query
// Delete button takes the row id and sends a delete request with the row id as the query string
const table = document.getElementById('table');
table.addEventListener('click', async (event) => {
    let target = event.target;

    // Edit button
    if (target.value === 'Edit'){
        enableRow(target.id);
    }

    // View button
    if (target.value === 'View'){
        
        let modTarget = document.querySelector(target.dataset.modalTarget)
        let targetRow = document.querySelector(`#row${target.id}`);
        let revision = targetRow.querySelectorAll('td')

        let issueHeader = document.querySelector("#issue-header")
        issueHeader.textContent = revision[1].textContent

        let issueBody = document.querySelector('#issue-body')
        issueBody.textContent = target.placeholder

        openModal(modTarget)
    }

    if (target.value === 'Close Ticket'){
        let statusCell = document.querySelector(`#status${target.id}`)
        statusCell.textContent = 'Closed'
    }

    // Submit button, send a put request to the server
    if (target.value === 'Submit'){
        let targetRow = document.querySelector(`#row${target.id}`);
        let revision = targetRow.querySelectorAll('td')
        let texts = Array.prototype.map.call(revision, function(t) { return t.textContent; });

        // Assigns status value
        let statusCell = document.querySelector(`#status${target.id}`)
        let statusValue = 0
        if (statusCell.textContent === 'Closed') {
            statusValue = 1
        } 

        let issueText = document.querySelector(`.issue${target.id}`)
        let context = {name:texts[0], subject: texts[1], issue: issueText.placeholder, contact:texts[3], status: statusValue, date:texts[5]}
        
        document.getElementById('tbody').innerHTML = '';  // Resets table for repopulation

        let res = await axios.put(baseUrl+`?id=${target.id}`, context);
        const rowsArray = res.data.rows;
        for (let row in rowsArray) {
            makeRow(rowsArray[row]); // Repopulates rows       
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
    }
});

// get data (async) on window load gets current row data from db
window.onload = async (e) => {
    const res = await axios.get(baseUrl);
    const rowsArray = res.data.rows;
    for (let row in rowsArray) {
        makeRow(rowsArray[row]);
    }; 
};