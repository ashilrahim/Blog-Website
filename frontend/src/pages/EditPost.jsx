import React, { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import { Navigate, useParams } from "react-router-dom";
import Editor from "./Editor";
import { toast } from "react-toastify";

function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/post/${id}`, {
      credentials: "include", // Ensure cookies are sent for authorization
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized access. Please log in.");
          }
          throw new Error("Failed to fetch post");
        }
        return response.json();
      })
      .then((postInfo) => {
        setTitle(postInfo.post.title);
        setContent(postInfo.post.content);
        setSummary(postInfo.post.summary);
      })
      .catch((err) => {
        setError(err.message);
        console.error(err);
      });
  }, [id]);

  async function handleEditSubmit(ev) {
    ev.preventDefault();
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("id", id);
    if (files?.[0]) {
      data.set("files", files[0]);
    }

    const response = await fetch(`http://localhost:5000/post`, {
      method: "PUT",
      body: data,
      credentials: "include",
    });

    if (response.status === 403) {
      alert("Sorry, you're not the author of the post");
    } else if (!response.ok) {
      setError("Failed to update the post.");
    } else {
      toast.success("Post Updated Successfully");
      setTimeout(() => {
        setRedirect(true);

      },2000)
    }
  }

  if (redirect) {
    return <Navigate to={`/post/${id}`} />;
  }

  return (
    <form onSubmit={handleEditSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        value={title}
        placeholder="Title"
        onChange={(ev) => setTitle(ev.target.value)}
        required
      />
      <input
        type="text"
        value={summary}
        placeholder="Summary"
        onChange={(ev) => setSummary(ev.target.value)}
        required
      />
      <input type="file" onChange={(ev) => setFiles(ev.target.files)} />
      <Editor onChange={setContent} value={content} />
      <button style={{ marginTop: "5px" }}>Update Post</button>
    </form>
  );
}

export default EditPost;

