import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";   

const app = express();
const port = 3000;

let posts = [];
let lastAssignedId = 0;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

function generateUniqueId() {
    lastAssignedId += 1;
    return lastAssignedId.toString();
}

app.get("/", (req, res) => {
    res.render("Blog Front.ejs");
});

app.get("/main", (req, res) => {
    const sortedPosts = posts.slice().reverse();
    res.render("Blog Main.ejs", { posts: sortedPosts, newPostTitle: undefined });
});

app.get("/create", (req, res) => {
    res.render("Create.ejs");
});

app.post('/create', (req, res) => {
    const { title, content } = req.body;
    const postId = generateUniqueId();
    posts.push({ id: postId, title, content });
    res.redirect("/main");
});

app.get('/edit/:postId', (req, res) => {
    const { postId } = req.params;
    const post = posts.find(post => post.id === postId);
    if (!post) {
        return res.status(404).render('error.ejs', { message: 'Post not found' });
    }
    res.render('Edit.ejs', { post });
});

app.patch('/edit/:postId', (req, res) => {
    const { postId } = req.params;
    const { title, content } = req.body;

    const postIndex = posts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
        posts[postIndex].title = title;
        posts[postIndex].content = content;
    }

    res.redirect('/main');
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
