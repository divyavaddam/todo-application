const express = require("express");
const app = express();
app.use(express.json());
module.exports = app;
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
// API 1
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  if (priority !== undefined && status !== undefined) {
    const getTodos = `
      SELECT 
        * 
      FROM 
        todo 
    WHERE todo LIKE '%${search_q}%'
      AND priority LIKE "HIGH" 
      AND status LIKE "IN PROGRESS";
      
      `;
    const todos = await db.all(getTodos);
    response.send(todos);
    return;
  }
  if (status) {
    const getTodos = `
      SELECT 
        * 
      FROM 
        todo 
      WHERE status LIKE "TO DO" 
      ORDER BY id;
      `;
    const todos = await db.all(getTodos);
    response.send(todos);
    return;
  }

  if (priority) {
    const getTodos = `
      SELECT 
        * 
      FROM 
        todo
      WHERE priority LIKE "HIGH" 
      ORDER BY id;
      `;
    const todos = await db.all(getTodos);
    response.send(todos);
    return;
  }

  if (search_q !== undefined) {
    const getTodos = `
      SELECT * FROM todo 
      WHERE todo LIKE "%${search_q}%";
      `;
    const todos = await db.all(getTodos);
    response.send(todos);
    return;
  }
});
// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodos = `
    SELECT * FROM todo 
    WHERE id="${todoId}";
    `;
  const todos = await db.get(getTodos);
  response.send(todos);
});
//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodo = `
    INSERT INTO todo(id,todo,priority,status)
    VALUES(${id},"${todo}","${priority}","${status}");
    `;
  await db.run(postTodo);
  response.send("Todo Successfully Added");
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todo, priority, status } = request.body;
  const { todoId } = request.params;
  if (status) {
    const updateTodo = `
  UPDATE todo 
  SET status='${status}'
  WHERE id=${todoId};
  `;
    await db.run(updateTodo);
    response.send("Status Updated");
  }
  if (priority) {
    const updateTodo = `
  UPDATE todo 
  SET priority='${priority}'
  WHERE id=${todoId};
  `;
    await db.run(updateTodo);
    response.send("Priority Updated");
  }
  if (todo) {
    const updateTodo = `
  UPDATE todo 
  SET todo='${todo}'
  WHERE id=${todoId};
  `;
    await db.run(updateTodo);
    response.send("Todo Updated");
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE FROM todo 
    WHERE id=${todoId};
    `;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});
