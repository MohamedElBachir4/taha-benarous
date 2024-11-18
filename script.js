document.addEventListener("DOMContentLoaded", function() {
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');
    let hours = String(currentDate.getHours()).padStart(2, '0');
    let minutes = String(currentDate.getMinutes()).padStart(2, '0');
    let formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById("startTime").value = formattedDate;

    if (localStorage.getItem("services")) {
        let services = JSON.parse(localStorage.getItem("services"));
        services.forEach(service => {
            addRowToTable(service);
        });
    }
});

document.getElementById("serviceForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    let name = document.getElementById("name").value;
    let serviceType = document.getElementById("serviceType").value;
    let source = document.getElementById("source").value;
    let priceDinar = document.getElementById("priceDinar").value;
    let priceDollar = document.getElementById("priceDollar").value;
    let startTime = document.getElementById("startTime").value;
    let endTime = document.getElementById("endTime").value;
    let paymentStatus = document.getElementById("paymentStatus").value;
    let workLocation = document.getElementById("workLocation").value;

    let paymentClass = paymentStatus === "paid" ? "green" : "red";
    let entryDate = new Date();
    let formattedEntryDate = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;

    let serviceData = {
        name,
        serviceType,
        source,
        priceDinar,
        priceDollar,
        startTime,
        endTime,
        paymentStatus,
        workLocation,
        paymentClass,
        formattedEntryDate
    };

    let editingRow = document.getElementById("serviceForm").getAttribute("data-editing-row");

    if (editingRow) {
        let row = document.querySelector("#serviceTable tbody").rows[editingRow - 1];
        row.cells[0].textContent = serviceData.name;
        row.cells[1].textContent = serviceData.serviceType;
        row.cells[2].textContent = serviceData.source;
        row.cells[3].textContent = `${serviceData.priceDinar} دج`;
        row.cells[4].textContent = `${serviceData.priceDollar} دولار`;
        row.cells[5].textContent = serviceData.startTime;
        row.cells[6].textContent = serviceData.endTime || "غير محدد";
        row.cells[7].innerHTML = `<span class="${serviceData.paymentClass}">${serviceData.paymentStatus === "paid" ? "نعم" : "لا"}</span>`;
        row.cells[8].textContent = serviceData.workLocation;
        row.cells[9].textContent = calculateStatus(serviceData.formattedEntryDate);

        let services = JSON.parse(localStorage.getItem("services"));
        services[editingRow - 1] = serviceData;
        localStorage.setItem("services", JSON.stringify(services));

        document.getElementById("serviceForm").removeAttribute("data-editing-row");
    } else {
        addRowToTable(serviceData);
        let services = localStorage.getItem("services") ? JSON.parse(localStorage.getItem("services")) : [];
        services.push(serviceData);
        localStorage.setItem("services", JSON.stringify(services));
    }

    let startTimeValue = document.getElementById("startTime").value;
    document.getElementById("serviceForm").reset();
    document.getElementById("startTime").value = startTimeValue;
});

function addRowToTable(serviceData) {
    let statusClass = calculateStatus(serviceData.formattedEntryDate);
    let tableRow = `
        <tr data-entry-date="${serviceData.formattedEntryDate}">
            <td>${serviceData.name}</td>
            <td>${serviceData.serviceType}</td>
            <td>${serviceData.source}</td>
            <td>${serviceData.priceDinar} DA</td>
            <td>${serviceData.priceDollar} USD</td>
            <td>${serviceData.startTime}</td>
            <td>${serviceData.endTime || "/"}</td>
            <td><span class="${serviceData.paymentClass}">${serviceData.paymentStatus === "paid" ? "Paid" : "Not Paid"}</span></td>
            <td>${serviceData.workLocation}</td>
            <td><button class="edit" onclick="editService(this)">Edit</button></td>
            <td><button class="delete" onclick="deleteService(this)">Delete</button></td>
            <td class="${statusClass}">${statusClass === 'orange' ? 'مر 30 يومًا' : statusClass === 'red' ? 'مر 60 يومًا' : 'أقل من 30 يومًا'}</td>
        </tr>
    `;
    document.querySelector("#serviceTable tbody").innerHTML += tableRow;
}

function calculateStatus(entryDate) {
    let currentDate = new Date();
    let entryDateObj = new Date(entryDate);
    let diffTime = currentDate - entryDateObj;
    let diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    if (diffDays >= 60) {
        return "red";
    } else if (diffDays >= 30) {
        return "orange";
    } else {
        return "green";
    }
}

function editService(button) {
    let row = button.parentElement.parentElement;
    document.getElementById("name").value = row.cells[0].textContent;
    document.getElementById("serviceType").value = row.cells[1].textContent;
    document.getElementById("source").value = row.cells[2].textContent;
    document.getElementById("priceDinar").value = row.cells[3].textContent.split(" ")[0];
    document.getElementById("priceDollar").value = row.cells[4].textContent.split(" ")[0];
    document.getElementById("startTime").value = row.cells[5].textContent;
    document.getElementById("endTime").value = row.cells[6].textContent !== "غير محدد" ? row.cells[6].textContent : "";
    document.getElementById("paymentStatus").value = row.cells[7].textContent === "نعم" ? "paid" : "unpaid";
    document.getElementById("workLocation").value = row.cells[8].textContent;

    let rowIndex = row.rowIndex;
    document.getElementById("serviceForm").setAttribute("data-editing-row", rowIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteService(button) {
    let row = button.parentElement.parentElement;
    row.remove();
    let services = JSON.parse(localStorage.getItem("services"));
    let rowDate = row.getAttribute('data-entry-date');
    services = services.filter(service => service.formattedEntryDate !== rowDate);
    localStorage.setItem("services", JSON.stringify(services));
}

function searchService() {
    let filter = document.getElementById("search").value.toLowerCase();
    let rows = document.querySelector("#serviceTable tbody").rows;
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let name = row.cells[0].textContent.toLowerCase();
        if (name.includes(filter)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    }
}