const fileSystem = require('node:fs');
// "File System Module" this module is built in Node.js Module, it provide an API for interacting with the filesystem (Fir hum file aur directories ke sath work kr sakte hai ).

const path = require('node:path'); // path is also built in Node.js Module, the path module allow you to interact with file and directory paths in a way that is consistent across different operating systems

const tasksFilePath = path.join(__dirname, 'tasks.json');
// yha tasks.json ki path ko tasksFilePath variable me store karaye hai 

const colors = {
    magenta: '\x1b[35m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
}

//Function, which reading data from tasks.json file 
function readTasks() {
    if (fileSystem.existsSync(tasksFilePath)) {
        // console.log("Task files exist:", tasksFilePath)
        const taskData = fileSystem.readFileSync(tasksFilePath, 'utf-8');
        return JSON.parse(taskData);
    }
    return [];

    // existsSync method in Node.js is used to check synchronously  if a file or directory exists at a given path. ( Sync matlab pahle check karega fir aage code execute hoga)
    // readFileSync Reads a file synchronously, blocking the execution until the file is read.
}


// Function, which writing data to tasks.json file
function writeTasks(tasks) {
    fileSystem.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 3), "utf-8");
}
//.writeFileSync ka use kiya ja raha hai file mein data likhne ke liye. Yeh synchronously kaam karta hai, yaani code tab tak wait karega jab tak file mein data likh nahi diya jata.

// JSON.stringify(tasks, null, 3) function tasks array ya object ko JSON string mein convert karta hai.  //null ka matlab hai ke koi specific replacer function nahi use kiya gaya hai.  // '3' (har level pe 3 spaces ka indent hoga). taaki file mein data readable ho 





// Function, which get unique ID for task
function getNextId(tasks) {
    const ids = tasks.map((task) => task.id);  //Saare tasks ke IDs ko ek nayi array 'ids' mein store karta hai
    return ids.length >= 0 ? Math.max(...ids) + 1 : 1; //Sabse bada ID nikal ke uska agla ID return karna, ya agar koi task nahi hai to '1' return karna.
}

// Function, which list tasks by status
function listTasks(status) {
    const tasks = readTasks();   //readTasks() function ko call kr rhe jo file se saare tasks ko read kar ke ek array tasks mein store karega 
    let filteredTasks = tasks;

    if (status) {
        if (status.toLowerCase() === "done") {
            filteredTasks = tasks.filter((task) => task.completed);
        } else if (status.toLowerCase() === "to-do") {
            filteredTasks = tasks.filter((task) => !task.completed && !task.inProgress);
        } else if (status.toLowerCase() === "in-progress") {
            filteredTasks = tasks.filter((task) => task.inProgress);
        } else {
            console.log(`${colors.red}Invalid Status. Please Use 'done' or 'to=do' or 'in-proress'.${colors.reset}`);
            return;
        }

    }

    if (filteredTasks.length === 0) {
        console.log(`${colors.yellow}No Task found. ${colors.reset}`);
    } else {
        console.log(`${colors.magenta}Listing ${status ? status : "all"} tasks: ${colors.reset}`);

        filteredTasks.forEach((task) => {
            console.log(`${task.id}. ${task.description} [${task.completed ? colors.green + "Done" : task.inProgress ? colors.yellow + "In-Progress" : colors.red + "To-do"} ${colors.reset}]`)
        });

    }
}

//Function, which add new tasks to the list
function addTask(description) {
    const tasks = readTasks();
    const newTask = {
        id: getNextId(tasks),
        description: description,
        completed: false,
        inProgress: false
    };
    tasks.push(newTask);
    writeTasks(tasks);
    console.log(`${colors.green}Task added successfully! (ID: ${newTask.id}) ${colors.reset}`);
}

// Function, which update description of a task
function updateTask(id, newDescription) {
    const tasks = readTasks();
    const task = tasks.findIndex((task) => task.id === parseInt(id));

    if (task) {
        task[task].description = newDescription;
        writeTasks(tasks);
        console.log(`${colors.green}Task ID: ${id} updated successfully! ${colors.reset}`);
    } else {
        console.log(`${colors.red}Task  ID : ${id} not found. Please provide valid task ID. ${colors.reset}`);
    }
}


// Function, which mark a task as completed
function markTaskCompleted(id) {
    const tasks = readTasks();
    const task = tasks.findIndex((task) => task.id === parseInt(id));
    if (task) {
        tasks[task].inProgress = false;
        tasks[task].completed = true;
        writeTasks(tasks);
        console.log(`${colors.green}Task ID: ${id} marked as completed successfully! ${colors.reset}`);
    } else {
        console.log(`${colors.red}Task  ID : ${id} not found. Please provide valid task ID. ${colors.reset}`);
    }

}

// Function, which mark a task as in progress
function markTaskInProgress(id) {
    const tasks = readTasks();
    const task = tasks.findIndex((task) => task.id === parseInt(id));
    if (task) {
        tasks[task].inProgress = true;
        tasks[task].completed = false;
        writeTasks(tasks);
        console.log(`${colors.green}Task ID: ${id} marked as in progress successfully! ${colors.reset}`);
    } else {
        console.log(`${colors.red}Task  ID : ${id} not found. Please provide valid task ID. ${colors.reset}`);
    }
}

// Function, which delete a task from the list
function deleteTask(id) {
    const tasks = readTasks();
    const newTask = tasks.filter((task) => task.id !== parseInt(id))
    if (newTask.length < tasks.length) {
        writeTasks(tasks);
        console.log(`${colors.green}Task ID: ${id} deleted successfully! ${colors.reset}`);
    } else {
        console.log(`${colors.red}Task  ID : ${id} not found. Please provide valid task ID. ${colors.reset}`);
    }
}

//Command-Line interface Logic 
const arguments = process.argv.slice(2);   //process.argv command line par diya gaya input (arguments) ko store karta hai.   // slice(2) method array ke pehle 2 elements ko hata kar ek naya array return karta hai
if (arguments.includes("add")) {
    const taskDescription = arguments.slice(1).join("");
    if (!taskDescription) {
        console.log(`${colors.red}Please provide task description. ${colors.reset}`);
        console.log(`${colors.yellow} Sample : node index.js add "Write a Blog post"  ${colors.reset}`);
    } else {
        addTask(taskDescription);
    }

} else if (arguments.includes("list")) {
    const status = arguments[1]; // "done" or "to-do" or"in-progress"  (optional)
    listTasks(status);
} else if (arguments.includes("update")) {
    const id = arguments[1];
    console.log(id)
    const newDescription = arguments.slice(2).join("");
    if (!id || !newDescription) {
        console.log(`${colors.red}Please provide task ID and new description. ${colors.reset}`);
        console.log(`${colors.yellow} Sample : node index.js update 1 "Updated Description"  ${colors.reset}`);
    } else {
        updateTask(id, newDescription);
    }

} else if (arguments.includes("delete")) {
    const id = arguments[1];
    if (!id) {
        console.log(`${colors.red}Please provide task ID. ${colors.reset}`);
        console.log(`${colors.yellow} Sample : node index.js delete 1  ${colors.reset}`);
    } else {
        deleteTask(id);
    }
} else if (arguments.includes("mark-in-progress")) {
    const id = arguments[1];
    if (!id) {
        console.log(`${colors.red}Please provide task ID. ${colors.reset}`);
        console.log(`${colors.yellow} Sample : node index.js mark-in-progress 1  ${colors.reset}`);
    } else {
        markTaskInProgress(id);
    }
} else if (arguments.includes("mark-done")) {
    const id = arguments[1];
    if (!id) {
        console.log(`${colors.red}Please provide task ID. ${colors.reset}`);
        console.log(`${colors.yellow} Sample : node index.js mark-done 1  ${colors.reset}`);
    } else {
        markTaskCompleted(id);
    }
} else {
    console.log(`${colors.magenta} Usage: node index.js <command> [arguments] ${colors.reset}`);
    console.log(`${colors.magenta} Commands: ${colors.reset}`);
    console.log(`${colors.yellow} - add <description>: Add a new task ${colors.reset}`);
    console.log(`${colors.yellow} - list [status]: List all tasks or tasks with a specific status (to-do, in-progress, done) ${colors.reset}`);
    console.log(`${colors.yellow} - update <id> <new description>: Update the description of a task ${colors.reset}`);
    console.log(`${colors.yellow} - delete <id>: Delete a task ${colors.reset}`);
    console.log(`${colors.yellow} - mark-in-progress <id>: Mark a task as in progress ${colors.reset}`);
    console.log(`${colors.yellow} - mark-done <id>: Mark a task as completed ${colors.reset}`);

}
 