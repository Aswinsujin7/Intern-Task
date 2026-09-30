let employees = [
    {
        id: 1,
        name: "Arun",
        department: "Development",
        salary: 30000,
        status: "Active"
    },

    {
        id: 2,
        name: "Priya",
        department: "HR",
        salary: 35000,
        status: "Active"
    },

    {
        id: 3,
        name: "Rahul",
        department: "Development",
        salary: 40000,
        status: "Active"
    },

    {
        id: 4,
        name: "Divya",
        department: "Finance",
        salary: 32000,
        status: "Active"
    },

    {
        id: 5,
        name: "Karthik",
        department: "Marketing",
        salary: 28000,
        status: "Inactive"
    },

    {
        id: 6,
        name: "Meena",
        department: "HR",
        salary: 30000,
        status: "Active"
    },

    {
        id: 7,
        name: "Vijay",
        department: "Development",
        salary: 35000,
        status: "Inactive"
    },

    {
        id: 8,
        name: "Anu",
        department: "Finance",
        salary: 35000,
        status: "Active"
    }
];

function displayEmployees() {

    let table = document.getElementById("employeeTable");

    table.innerHTML = "";

    for (let employee of employees) {

        table.innerHTML += `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.department}</td>
                <td>₹${employee.salary.toLocaleString("en-IN")}</td>
                <td>${employee.status}</td>
            </tr>
        `;
    }
}


function displayDashboard() {

    let totalEmployees = employees.length;

    document.getElementById("totalEmployees").innerText = totalEmployees;


    // Active employees

    let activeEmployees = employees.filter(function(employee) {

        return employee.status === "Active";

    });

    document.getElementById("activeEmployees").innerText =
        activeEmployees.length;


    // Total salary

    let totalSalary = employees.reduce(function(total, employee) {

        return total + employee.salary;

    }, 0);

    document.getElementById("totalSalary").innerText =
        "₹" + totalSalary.toLocaleString("en-IN");

    let averageSalary = totalSalary / employees.length;

    document.getElementById("averageSalary").innerText =
        "₹" + Math.round(averageSalary).toLocaleString("en-IN");
}

    function searchEmployee() {

    let id = Number(
        document.getElementById("employeeId").value
    );

    let employeeDetails =
        document.getElementById("employeeDetails");

    let employee = employees.find(function(employee) {

        return employee.id === id;

    });

    if (employee) {

        employeeDetails.innerHTML = `
            <h3>${employee.name}</h3>

            <p><strong>Employee ID:</strong> ${employee.id}</p>

            <p><strong>Department:</strong> ${employee.department}</p>

            <p><strong>Salary:</strong> ₹${employee.salary.toLocaleString("en-IN")}</p>

            <p><strong>Status:</strong> ${employee.status}</p>
        `;

    } else {

        employeeDetails.innerHTML =
            "Employee not found.";

    }
}

displayEmployees();

displayDashboard();