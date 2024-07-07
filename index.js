import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

env.config();
const app = express();
const port = 3000;
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("Blog Front.ejs");
});

app.get("/main", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM blog");
        res.render("Blog Main.ejs", { posts: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred");
    }
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/create", (req, res) => {
    res.render("create.ejs");
});

app.post("/create", async (req, res) => {
    try {
        const newTitle = req.body.title;
        const newAuthor = req.body.author;
        const newContent = req.body.content;
        const newDate = new Date();

        await db.query(
            "INSERT INTO blog (author, title, content, date) VALUES ($1, $2, $3, $4)",
            [newAuthor, newTitle, newContent, newDate]
        );

        res.redirect("/main");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while creating the blog post");
    }
});

app.get("/edit/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const result = await db.query("SELECT * FROM blog WHERE id = $1", [id]);
        res.render("edit.ejs", { posts: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred");
    }
});

app.post("/edit", async (req, res) => {
    try {
        const newTitle = req.body.title;
        const newAuthor = req.body.author;
        const newContent = req.body.content;
        const newDate = new Date();
        const id = req.body.editId;

        await db.query(
            "UPDATE blog SET author = $1, title = $2, content = $3, date = $4 WHERE id = $5",
            [newAuthor, newTitle, newContent, newDate, id]
        );

        res.redirect("/main");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while editing the blog post");
    }
});

app.post("/delete", async (req, res) => {
    try {
        const id = req.body.deleteblogid;
        await db.query("DELETE FROM blog WHERE id = $1", [id]);
        res.redirect("/main");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while deleting the blog post");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
