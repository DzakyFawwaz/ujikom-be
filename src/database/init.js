const db = require("./db");

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Create Board table
    db.run(
      `CREATE TABLE IF NOT EXISTS Board (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          reject(err);
        } else {
          console.log("Board table created/verified");
          // Create Task table
          db.run(
            `CREATE TABLE IF NOT EXISTS Task (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              position INTEGER NOT NULL,
              board_id INTEGER NOT NULL,
              FOREIGN KEY (board_id) REFERENCES Board(id) ON DELETE CASCADE
            )`,
            (err) => {
              if (err) {
                reject(err);
              } else {
                console.log("Task table created/verified");
                resolve();
              }
            }
          );
        }
      }
    );
  });
};

module.exports = { initializeDatabase };
