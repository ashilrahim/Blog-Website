import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { usercontext } from "../UserContext";
import { toast, ToastContainer } from "react-toastify";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/post/${id}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setPostInfo(data.post);
        setIsAuthor(data.isAuthor); // Check if the logged-in user is the author
      })
      .catch((error) => console.error("Error fetching post:", error));
  }, [id]);

  function confirmDeletePost() {
    return new Promise((resolve) => {
      const ToastContent = (
        <div className="text-center p-0 m-0">
        <p className="m-0 text-sm leading-tight">Are you sure you want to delete this post?</p>
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={() => {
              resolve(true);
              toast.dismiss();
            }}
            className="bg-red-500 text-white px-1 py-1 text-sm rounded"
          >
            Confirm
          </button>
          <button
            onClick={() => {
              resolve(false);
              toast.dismiss();
            }}
            className="bg-gray-300 text-black px-1 py-1 text-sm rounded"
          >
            Cancel
          </button>
        </div>
      </div>
      );

      toast(ToastContent, {
        autoClose: false,
        closeOnClick: false,
        position: "top-center",
        className: "p-0 m-0", // Remove padding and margin from toast itself
        style: { minWidth: "200px", margin: 0, padding: 0  }, // Adjust width to make it more compact
      });
    });
  }

  const handleDelete = async () => {
    const isConfirmed = await confirmDeletePost();
    if (isConfirmed) {
      const response = await fetch(`http://localhost:5000/post/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        toast.success("Deleted Successfully");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        console.error("Failed to delete post");
      }
    }
  };

  if (!postInfo) return "No response";

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
      <div className="author">by @{postInfo.author.username}</div>
      <div className="edit-row">
        {isAuthor && (
          <>
            <Link to={`/edit/${postInfo._id}`} className="edit-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Edit the post
            </Link>
            <div className="delete-row">
              <button onClick={handleDelete} className="delete-btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
                Delete the post
              </button>
            </div>
          </>
        )}
      </div>

      <div className="image">
        <img src={`http://localhost:5000/${postInfo.cover}`} alt="post cover" />
      </div>
      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: postInfo.content }}
      />
      <ToastContainer position="top-center"
  className="!m-0 !p-0"
  style={{ margin: 0, padding: 0 }}/>
    </div>
  );
}
