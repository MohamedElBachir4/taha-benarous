document.addEventListener("DOMContentLoaded", () => {
    const currentDate = new Date().toISOString().slice(0, 16);
    document.getElementById("startTime").value = currentDate;

    const savedServices = JSON.parse(localStorage.getItem("services")) || [];
    savedServices.forEach(service => addRowToTable(service));

    updateDollarAmount(); // تحديث المجموع عند تحميل الصفحة
});

document.getElementById("serviceForm").addEventListener("submit", event => {
    event.preventDefault();

    const form = event.target;
    const editingRowIndex = form.getAttribute("data-editing-row");
    const newService = {
        name: form.name.value,
        serviceType: form.serviceType.value,
        source: form.source.value,
        priceDinar: form.priceDinar.value,
        priceDollar: parseFloat(form.priceDollar.value),  // التأكد من أن المبلغ بالدولار هو عدد عشري
        startTime: form.startTime.value,
        endTime: form.endTime.value || "/",
        paymentStatus: form.paymentStatus.value === "paid" ? "Paid" : "Not Paid",
        workLocation: form.workLocation.value
    };

    if (editingRowIndex) {
        // تعديل الصف الحالي
        const tableBody = document.querySelector("#serviceTable tbody");
        const row = tableBody.rows[editingRowIndex];

        row.cells[0].textContent = newService.name;
        row.cells[1].textContent = newService.serviceType;
        row.cells[2].textContent = newService.source;
        row.cells[3].textContent = `${newService.priceDinar} DA`;
        row.cells[4].textContent = `${newService.priceDollar} USD`;
        row.cells[5].textContent = newService.startTime;
        row.cells[6].textContent = newService.endTime;
        row.cells[7].textContent = newService.paymentStatus;
        row.cells[7].className = newService.paymentStatus === "Paid" ? "green" : "red";
        row.cells[8].textContent = newService.workLocation;

        // تحديث البيانات في LocalStorage
        let services = JSON.parse(localStorage.getItem("services")) || [];
        services[editingRowIndex] = newService;
        localStorage.setItem("services", JSON.stringify(services));

        // إزالة المؤشر على الصف الحالي الذي يتم تعديله
        form.removeAttribute("data-editing-row");
    } else {
        // إضافة صف جديد
        addRowToTable(newService);
        saveServiceToStorage(newService);
    }

    // إعادة ضبط النموذج
    form.reset();
    form.startTime.value = new Date().toISOString().slice(0, 16);

    updateDollarAmount(); // تحديث المجموع بعد إضافة الصف
});

// **إضافة صف جديد إلى الجدول**
const addRowToTable = (service) => {
    const tableBody = document.querySelector("#serviceTable tbody");
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${service.name}</td>
        <td>${service.serviceType}</td>
        <td>${service.source}</td>
        <td>${service.priceDinar} DA</td>
        <td>${service.priceDollar} USD</td>
        <td>${service.startTime}</td>
        <td>${service.endTime}</td>
        <td class="${service.paymentStatus === "Paid" ? "green" : "red"}">${service.paymentStatus}</td>
        <td>${service.workLocation}</td>
        <td><button class="edit-btn" onclick="editService(this)">Edit</button></td>
        <td><button class="delete-btn" onclick="deleteService(this)">Delete</button></td>
        <td class="condition"></td>
    `;

    tableBody.appendChild(row);

    updateDollarAmount(); // تحديث المجموع عند إضافة صف جديد
};

// **تخزين خدمة جديدة في LocalStorage**
const saveServiceToStorage = (service) => {
    const services = JSON.parse(localStorage.getItem("services")) || [];
    services.push(service);
    localStorage.setItem("services", JSON.stringify(services));
};

// **تعديل خدمة**
const editService = (button) => {
    const row = button.closest("tr");
    const form = document.getElementById("serviceForm");
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);

    // تعبئة البيانات في النموذج
    form.name.value = row.cells[0].textContent;
    form.serviceType.value = row.cells[1].textContent;
    form.source.value = row.cells[2].textContent;
    form.priceDinar.value = row.cells[3].textContent.split(" ")[0];
    form.priceDollar.value = row.cells[4].textContent.split(" ")[0];
    form.startTime.value = row.cells[5].textContent;
    form.endTime.value = row.cells[6].textContent !== "/" ? row.cells[6].textContent : "";
    form.paymentStatus.value = row.cells[7].textContent === "Paid" ? "paid" : "unpaid";
    form.workLocation.value = row.cells[8].textContent;

    // تخزين رقم الصف الذي يتم تعديله
    form.setAttribute("data-editing-row", rowIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// **حذف خدمة**
const deleteService = (button) => {
    const row = button.closest("tr");
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);

    let services = JSON.parse(localStorage.getItem("services"));
    services.splice(rowIndex, 1);
    localStorage.setItem("services", JSON.stringify(services));

    row.remove();

    updateDollarAmount(); // تحديث المجموع بعد الحذف
};

// **تحديث المجموع الكلي للدولار**
const updateDollarAmount = () => {
    let totalDollar = 0;
    let rows = document.querySelectorAll("#serviceTable tbody tr");

    rows.forEach(row => {
        const priceDollar = parseFloat(row.cells[4].textContent.split(" ")[0]);
        if (!isNaN(priceDollar)) {
            totalDollar += priceDollar;
        }
    });

    // تطبيق التنسيق (الخط العريض) بين الصفوف عندما يتجاوز المجموع 580 دولار
    let currentSum = 0;
    rows.forEach((row, index) => {
        const priceDollar = parseFloat(row.cells[4].textContent.split(" ")[0]);
        currentSum += priceDollar;

        // تحقق إذا كان المجموع تجاوز 580، ثم إضافة خط غليظ بين الصفوف
        if (currentSum >= 580 && currentSum - priceDollar < 580) {
            // إضافة الخط الغليظ بعد الصف الحالي
            if (rows[index + 1]) {
                rows[index + 1].style.borderTop = "5px solid white"; // إضافة الخط الغليظ
            }
        }
    });
};

// **بحث عن خدمة**
const searchService = () => {
    const query = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#serviceTable tbody tr");

    rows.forEach(row => {
        const name = row.children[0].textContent.toLowerCase();
        row.style.display = name.includes(query) ? "" : "none";
    });
};