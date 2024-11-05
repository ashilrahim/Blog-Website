import { useState } from "react";
import "react-quill/dist/quill.snow.css";
import { Navigate } from "react-router-dom";
import Editor from "./Editor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setReDirect] = useState(false);

  async function handlePostSubmit(ev) {
    ev.preventDefault();

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("files", files[0]);

    const response = await fetch("http://localhost:5000/post", {
      method: "POST",
      body: data,
      credentials: "include",
    });

    if (response.ok) {
      toast.success("Post created Successfully");
      setTimeout(() => {
        setReDirect(true);
      },2000)
      
    }
  }
  if (redirect) {
    return <Navigate to={"/"} />;
  }
  return (
    <form onSubmit={handlePostSubmit}>
      <input
        type="title"
        value={title}
        placeholder="title"
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <input
        type="summary"
        value={summary}
        placeholder="summary"
        onChange={(ev) => setSummary(ev.target.value)}
      />
      <input type="file" onChange={(ev) => setFiles(ev.target.files)} />
      <Editor onChange={setContent} value={content} />
      <button style={{ marginTop: "5px" }}>Create Post</button>
      <ToastContainer />
    </form>
  );
}
