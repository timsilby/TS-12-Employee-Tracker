const inquirer = require('inquirer');
const queryDB = require("./queryDB");
const { writeHeader } = require('./renderHeaders');
const renderTable = require("./renderTable");


// Function to get manager id. Returns manager id to view employees by manager.
const getManagerID = async () => {

	// Query db for a list of managers.
	const strQuery = `
		SELECT id AS value, CONCAT(first_name, " ", last_name) AS name
		FROM employee
		WHERE ISNULL(manager_id)
		ORDER BY name
	`;

	const arrManagers = await queryDB(strQuery);

	// Configure inquirer parameters.
	const objQuestion = {
		type: "list",
		name: "id",
		message: "Choose a manager:\n",
		pageSize: 30,
		choices: arrManagers,
	};

	// Return the employee id of the manager.
	const answers = await inquirer.prompt(objQuestion);
	return answers.id;

}


// Function to run SELECT queries on the db and show results.
const viewRecords = async (strRecordType) => {


	// Declare the db query string and table title variables.
	let strQuery;
	let strTitle;


	// Set db query string according to what we want to view.
	switch (strRecordType) {

		// View all employees.
		case "employees":
			strQuery = `
				SELECT CONCAT(e.first_name, " ", e.last_name) Name, e.id ID, r.title Role, d.name Department, CONCAT(m.first_name, " ", m.last_name) Manager, r.salary Salary
				FROM employee e
				LEFT JOIN employee m ON m.id = e.manager_id
				INNER JOIN role r ON r.id = e.role_id
				INNER JOIN department d ON d.id = r.department_id
				ORDER BY Name`;
			strTitle = "All Employees";
			break;

		// View employees by manager.
		case "employeesbymanager":
			console.clear();
			writeHeader("Employees by Manager");
			const managerID = await getManagerID();
			strQuery = `
				SELECT CONCAT(e.first_name, " ", e.last_name) Name, e.id ID, CONCAT(e.first_name, " ", e.last_name) Name, r.title Role, d.name Department, CONCAT(m.first_name, " ", m.last_name) Manager, r.salary Salary
				FROM employee e
				LEFT JOIN employee m ON m.id = e.manager_id
				INNER JOIN role r ON r.id = e.role_id
				INNER JOIN department d ON d.id = r.department_id
				WHERE e.manager_id = ${managerID}
				ORDER BY Name`;
			strTitle = "Employees by Manager";
			break;

		// View all roles
		case "roles":
			strQuery = `
				SELECT r.title Role, r.id ID, d.name Department, r.salary Salary
				FROM role r
				LEFT JOIN department d ON d.id = r.department_id
				ORDER BY Department, Title`;
			strTitle = "All Roles";
			break;

		// View all departments.
		case "departments":
			strQuery = `
				SELECT name Department, id ID
				FROM department
				ORDER BY Department`;
			strTitle = "All Departments"
			break;

		// View utilised budget for each department.
		case "utilisedbudget":
			strQuery = `
				SELECT d.name Department, d.id ID, SUM(r.salary) "Utilised Budget"
				FROM employee e
				INNER JOIN role r ON e.role_id = r.id
				INNER JOIN department d ON r.department_id = d.id
				GROUP BY d.id
				ORDER BY Department`;
			strTitle = "Utilised Budget"
			break;

	}


	// Call queryDB to run the query.
	const arrResults = await queryDB(strQuery);


	// Call renderTable to show the results.
	renderTable(strTitle, arrResults);


}


// Export the function.
module.exports = viewRecords;