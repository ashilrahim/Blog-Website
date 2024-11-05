import React from 'react'
import ReactQuill from 'react-quill'
import "react-quill/dist/quill.snow.css";
function Editor({value,onChange}) {

    
const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];
  return (
   <>
   <ReactQuill
        modules={modules}
        formats={formats}
        theme={'snow'}
        value={value}
        onChange={onChange}
      />
   </>
  )
}

export default Editor