import ServerAPI from "./server_api.js";

const tableHeader = {
    hotel:
        `<th>Hotel ID</th>
        <th>Name</th>
        <th>Address Line 1</th>
        <th>Address Line 2</th>
        <th>Address Line 3</th>
        <th>Pincode</th>
        <th>Highest Price</th>
        <th>Lowest Price</th>
        <th>Description</th>
        <th>Link</th>
        <th>Image</th>
        <th></th>`,
    vehicle:
        `<th>Vehicle ID</th>
        <th>License Plate</th>
        <th>Colour</th>
        <th>Type</th>
        <th>Driver ID</th>
        <th></th>`,
    driver:
        `<th>Driver ID</th>
        <th>First Name</th>
        <th>Middle Name</th>
        <th>Last Name</th>
        <th>Phone Number</th>
        <th>License Number</th>
        <th></th>`,
    tourist_spot:
        `<th>ID</th>
        <th>Name</th>
        <th>Address Line 1</th>
        <th>Address Line 2</th>
        <th>Address Line 3</th>
        <th>Pincode</th>
        <th>Description</th>
        <th>Opening Time</th>
        <th>Closing Time</th>
        <th></th>`,
    // feedback:
    //     `<th>Feedback ID</th>
    //     <th>Comment</th>
    //     <th>Rating</th>
    //     <th>Given By</th>
    //     <th>Feedback For</th>
    //     <th>Given On</th>
    //     <th>Feedback On</th>
    //     <th></th>`,
    user:
        `<th>UID</th>
        <th>Email</th>
        <th>Phone Number</th>
        <th>Password</th>
        <th>Salt Value</th>
        <th></th>`,
    general_user:
        `<th>UID</th>
        <th>First Name</th>
        <th>Middle Name</th>
        <th>Last Name</th>
        <th></th>`,
    local_business:
        `<th>UID</th>
        <th>Address Line 1</th>
        <th>Address Line 2</th>
        <th>Address Line 3</th>
        <th>Pincode</th>
        <th>Business Name</th>
        <th>Aadhaar Number</th>
        <th></th>`,
    vehicle_booking:
        `<th>Booking ID</th>
        <th>Booked By</th>
        <th>From Date</th>
        <th>Till Date</th>
        <th>Vehicle ID</th>
        <th></th>`,
    lb_certificate:
        `<th>UID</th>
        <th>Certificate</th>
        <th>Is Verified?</th>
        <th>Verified By</th>
        <th></th>`,
    job_posting:
        `<th>Posted By</th>
        <th>Posted On</th>
        <th>Job Title</th>
        <th>Description</th>
        <th>Experience</th>
        <th>Salary</th>
        <th>Starts By</th>
        <th>Ends By</th>
        <th></th>`,
    verify_lb_certificate:
        `<th>UID</th>
        <th>Certificate</th>
        <th>Is Verified?</th>
        <th>Verified By</th>
        <th></th>`,
    upload_hotel_image:
        `<th>Hotel ID</th>
        <th>Hotel Name</th>
        <th>Current Image</th>
        <th></th>`
};

// only needed for tables where data can be added by the admin
const tableCols = {
    hotel: [ "hotel_id", "name", "address_line1", "address_line2", "address_line3", "pincode", 'highest_price', 
        "lowest_price", "description", "link", "image" ],
    vehicle: [ "vehicle_id", "license_plate", "colour", "type", "driver_id" ],
    driver: [ "driver_id", "fname", "mname", "lname", "phone_num", "license_num" ],
    tourist_spot: [ "id", "name", "address_line1", "address_line2", "address_line3", "pincode", 'description', 
    "opening_time", "closing_time" ],
    user: [ "uid", "email", "phone_num", "password", "salt_value" ],
    general_user: [ "uid", "fname", "mname", "lname" ],
    local_business: [ "uid", "address_line1", "address_line2", "address_line3", "pincode", "business_name", "aadhaar_num" ],
    vehicle_booking: [ "booking_id", "booked_by", "from_date", "till_date", "vehicle_id" ]
}

// for tables where admin shouldn't be able to edit values
const excludeEdit = [ "feedback", "lb_certificate" ];

let currentTableData = undefined;

const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

$(window).on('unload', window, () => {
    $(window).off('unload', window);
});

$(document).ready(() => {
    console.log(sessionStorage.getItem("uid") == location.href.substring(location.href.lastIndexOf("/") + 1));
    if (sessionStorage.getItem("name") === null) {
        alert("Access denied, not logged in!");
        window.open('/', "_self");

        return;
    } 

    if (sessionStorage.getItem("uid") !== location.href.substring(location.href.lastIndexOf("/") + 1)) {
        alert("Access denied, non-admin user!");
        window.open('/', "_self");

        return;
    }

    console.log(Object.keys(tableCols));

    $("#logout").click(() => {
        sessionStorage.removeItem("name");
        sessionStorage.removeItem("uid");
        sessionStorage.removeItem("isadmin");
        sessionStorage.removeItem("isbusiness");

        window.open("/", "_self");
    });

    $("#admin-name").text(`${ sessionStorage.getItem("name") }!`);
    $(".action-button").click(showAddPopup);
    
    displayTableHeader("user");

    $(".popup-container").on('click', '#close-popup', () => {
        $(".popup-container").hide();
    });

    $(".menu").on('click', '.menu-item', (evt) => {
        console.log(evt);
        const menuItems = document.getElementsByClassName("menu-item");

        for (let i = 0; i < menuItems.length; i++) {
            menuItems[i].className = "menu-item";
        }

        evt.target.className = "menu-item selected";

        if (Object.keys(tableCols).includes(evt.target.id)) {
            $(".table-actions").show();
        } else {
            $(".table-actions").hide();
        }

        displayTableHeader(evt.target.id);
    });
});

function displayTableHeader(id) {
    const thead = document.getElementsByTagName("thead")[0];
    thead.innerHTML = `<tr>${ tableHeader[id] }</tr>`

    getDataFrom(id);
}

function getDataFrom(table) {
    switch (table) {
        case "verify_lb_certificate":
            fetch(`${ ServerAPI.server }/get-certificates`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" }
            }).then(response => {
                response.json().then(data => {
                    currentTableData = data;
                    console.log(currentTableData);
                    displayCertificateVerification();
                });
            });
            break;
        case "upload_hotel_image":
            fetch(`${ ServerAPI.server }/hotel-images-info`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            }).then(response => {
                response.json().then(data => {
                    currentTableData = data;
                    console.log(currentTableData);
                    displayHotelImageUpload();
                });
            });
            break;
        default:
            fetch(`${ ServerAPI.server }/get/${ table }`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" }
            }).then(response => {
                response.json().then(data => {
                    currentTableData = data;
                    currentTableData.currentTable = table;
                    console.log(currentTableData);
                    displayData(data);
                });
            });
    }
}

function displayCertificateVerification() {
    const tbody = document.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    currentTableData.hashMap = {};

    for (let i = 0; currentTableData.certificates.length; i++) {
        tbody.innerHTML += 
        `<tr>
            <td>${ currentTableData.certificates[i].uid }</td>
            <td><a href="${ ServerAPI.server }/${ currentTableData.certificates[i].link }" target="_blank">Click to check</a></td>
            <td>${ currentTableData.certificates[i].isVerified }</td>
            <td>${ currentTableData.certificates[i].verifiedBy }</td>
            <td>${ currentTableData.certificates[i].isVerified ? "" : 
                `<button id=${ cyrb53(currentTableData.certificates[i].link) } class='action-button'>Verify</button>` 
            }</td>
        </tr>`;

        currentTableData.hashMap[cyrb53(currentTableData.certificates[i].link)] = currentTableData.absolute[i];

        $(document).on('click', `#${ cyrb53(currentTableData.certificates[i].link) }`, verifyCertificate);
    }
}

function verifyCertificate(evt) {
    fetch(`${ ServerAPI.server }/verify-certificate/${ sessionStorage.getItem("uid") }`, {
        method: 'PUT',
        headers: {'Content-Type': 'text/plain'},
        body: currentTableData.hashMap[evt.currentTarget.id]
    }).then(response => {
        if (response.status === 200)
            location.reload();
        else
            alert("Could not verify.");
    });
}

function displayHotelImageUpload() {
    const tbody = document.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    for (let i = 0; i < currentTableData.length; i++) {
        tbody.innerHTML += `
        <tr>
            <td>${ currentTableData[i].hotel_id }</td>
            <td>${ currentTableData[i].name }</td>
            <td>
                ${ currentTableData[i].image === null || currentTableData[i].image === "null" 
                ? "Not set" 
                : `<a href="${ ServerAPI.server }/${ currentTableData[i].image }" target="_blank">Image</a>` }
            </td>
            <td>
                <input id="${ currentTableData[i].hotel_id }" type="file" accept="image/*" />
            </td>
        </tr>`;

        $(document).off('change', `#${ currentTableData[i].hotel_id }`, uploadHotelImage);
        $(document).on('change', `#${ currentTableData[i].hotel_id }`, uploadHotelImage);
    }
}

function uploadHotelImage(evt) {
    const formData = new FormData();
    formData.append('img', evt.target.files[0]);

    fetch(`${ ServerAPI.server }/upload-hotel-image/${ evt.currentTarget.id }`, {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.status === 200) {
            alert("Uploaded!");
            getDataFrom("upload_hotel_image");
        } else {
            alert("Could not upload hotel image.");
            response.json().then(data => console.log(data));
        }
    });
}

function displayData(data) {
    const tbody = document.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        var row = '<tr>';

        for (let key in data[i]) {
            row += `<td>${ data[i][key] }</td>`;
        }

        if (excludeEdit.includes(currentTableData.currentTable)) {
            row += `
            <td>
                <span class="material-icons clickable-icon delete" id="delete-${ i }">delete</span>
            </td>
            </tr>`;
        } else {
            row += `
            <td>
                <span class="material-icons clickable-icon edit" id="edit-${ i }">edit</span>
                <span class="material-icons clickable-icon delete" id="delete-${ i }">delete</span>
            </td>
            </tr>`;
        }

        $(document).off('click', `#edit-${ i }`, showEditPopup);
        $(document).off('click', `#delete-${ i }`, deleteRow);

        $(document).on('click', `#edit-${ i }`, showEditPopup);
        $(document).on('click', `#delete-${ i }`, deleteRow);

        tbody.innerHTML += row;
    }
}

function deleteRow(evt) {
    console.log(evt.currentTarget.id);
    const row = currentTableData[evt.currentTarget.id.split('-')[1]];

    if (currentTableData.currentTable === 'lb_certificate') {
        fetch(`${ ServerAPI.server }/delete-certificate`, {
            method: 'DELETE',
            headers: { "Content-Type": "text/plain" },
            body: row.certificate
        }).then(response => {
            if (response.status === 200) {
                getDataFrom(currentTableData.currentTable);
            } else {
                response.json().then(data => {
                    alert("Could not delete, check console or server for error.");
                    console.log(data);
                });
            }
        });
    } else {
        fetch(`${ ServerAPI.server }/delete/${ currentTableData.currentTable }/${ Object.keys(row)[0] }/${ row[Object.keys(row)[0]] }`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            if (response.status === 200) {
                getDataFrom(currentTableData.currentTable);
            } else {
                response.json().then(data => {
                    alert("Could not delete, check console or server for error.");
                    console.log(data);
                });
            }
        });
    }
}

function showEditPopup(evt) {
    $(".popup-container").css("display", "flex");

    let rowData = currentTableData[evt.currentTarget.id.split('-')[1]];
    const popup = document.querySelector(".popup");
    popup.innerHTML = `
    <div class="popup-title">
        <span>Edit</span>
        <button id="close-popup"><span class="material-icons">close</span></button>
    </div>
    <div class="popup-fields">
    `;

    var id = null;

    for (let key in rowData) {
        if (id === null) {
            id = key;
        }

        if (key === 'password' || key === 'salt_value' || key === 'image') {
            document.querySelector(".popup-fields").innerHTML += `
            <div>
                ${ key }: <input type="text" id="${ key }" value="${ rowData[key] }" readonly="true" />
            </div>
            `;    
        } else {
            document.querySelector(".popup-fields").innerHTML += `
            <div>
                ${ key }: <input type="text" id="${ key }" value="${ rowData[key] }" />
            </div>
            `;
        }
    }

    document.querySelector(".popup-fields").innerHTML += `<button class="action-button" id=${ rowData[id] }>Save</button>`;

    popup.innerHTML += '</div>';

    $(".popup-container").off('click', `#${ rowData[id] }`, saveEdit);
    $(".popup-container").on('click', `#${ rowData[id] }`, evt => {
        saveEdit(evt, rowData);
    });
}

function showAddPopup() {
    $(".popup-container").css("display", "flex");

    const popup = document.querySelector(".popup");
    popup.innerHTML = `
    <div class="popup-title">
        <span>Add</span>
        <button id="close-popup"><span class="material-icons">close</span></button>
    </div>
    <div class="popup-fields">
    `;

    for (let i = 0; i < tableCols[currentTableData.currentTable].length; i++) {
        document.querySelector(".popup-fields").innerHTML += `
        <div>
            ${ tableCols[currentTableData.currentTable][i] }: <input type="text" id="${ tableCols[currentTableData.currentTable][i] }"/>
        </div>
        `;
    }

    document.querySelector(".popup-fields").innerHTML += `<button class="action-button">Save</button>`;

    popup.innerHTML += '</div>';

    $(".popup-container").off('click', '.action-button', addData);
    $(".popup-container").on('click', '.action-button', addData);
}

function saveEdit(evt, rowData) {
    var bodyData = {};

    for (let key in rowData) {
        bodyData[key] = document.getElementById(key).value.length === 0 ? null : document.getElementById(key).value;
    }

    console.log('Update body:', bodyData);

    fetch(`${ ServerAPI.server }/update/${ currentTableData.currentTable }/${ evt.currentTarget.id }`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
    }).then(response => {
        if (response.status === 200) {
            $(".popup-container").hide();
            getDataFrom(currentTableData.currentTable);
        } else {
            console.log(response);
        }
    });
}

function addData() {
    var bodyData = {};

    for (let i = 0; i < tableCols[currentTableData.currentTable].length; i++) {
        var key = tableCols[currentTableData.currentTable][i];
        bodyData[key] = document.getElementById(key).value.length === 0 ? null : document.getElementById(key).value;
    }

    console.log(bodyData);

    // console.log(currentTableData.currentTable);
    fetch(`${ ServerAPI.server }/add/${ currentTableData.currentTable }`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
    }).then(response => {
        if (response.status === 200) {
            $(".popup-container").hide();
            getDataFrom(currentTableData.currentTable);
        } else if (response.status === 400) {
            response.json().then(data => alert(data));
        } else {
            alert("Internal Server Error");
            response.json().then(data => console.log(data));
        }
    });
}