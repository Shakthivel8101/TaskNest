import { useEffect, useState } from "react"

export default function Todo() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [todos, setTodos] = useState([]);
    const [error, setErrors] = useState("");
    const [message, setMessage] = useState("");
    const [editId, setEditId] = useState(-1);

    // edit
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const apiUrl = "http://localhost:8000"

    const getItems = () => {
        fetch(apiUrl + "/todos")
            .then(res => res.json())
            .then(res => setTodos(res))
            .catch(() => setErrors("Unable to fetch todos"))
    }

    useEffect(() => {
        getItems()
    }, [])

    const handleSubmit = () => {
        setErrors("")
        if (title.trim() !== '' && description.trim() !== '') {
            fetch(apiUrl + "/todos", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            })
                .then(res => {
                    if (res.ok) {
                        res.json().then(newTodo => {
                            setTodos([...todos, newTodo]) // include _id from backend
                        })
                        setTitle("");
                        setDescription("");
                        setMessage("Item added successfully")
                        setTimeout(() => setMessage(""), 3000)
                    } else {
                        setErrors("Unable to create TODO item")
                    }
                })
                .catch(() => setErrors("Unable to create TODO item"))
        }
    }

    const handleEdit = (item) => {
        setEditId(item._id);
        setEditTitle(item.title);
        setEditDescription(item.description)
    }

    const handleUpdate = () => {
        setErrors("")
        if (editTitle.trim() !== '' && editDescription.trim() !== '') {
            fetch(apiUrl + "/todos/" + editId, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle, description: editDescription })
            })
                .then(res => {
                    if (res.ok) {
                        const updatedTodo = todos.map(item => {
                            if (item._id === editId) {
                                item.title = editTitle;           // ✅ fixed comma operator issue
                                item.description = editDescription;
                            }
                            return item;
                        })
                        setTodos(updatedTodo)
                        setEditTitle("");
                        setEditDescription("");
                        setMessage("Item Updated successfully")
                        setTimeout(() => setMessage(""), 3000)
                        setEditId(-1)
                    } else {
                        setErrors("Unable to update TODO item")
                    }
                })
                .catch(() => setErrors("Unable to update TODO item"))
        }
    }

    const handleEditCancel = () => setEditId(-1)

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            fetch(apiUrl + '/todos/' + id, { method: "DELETE" })
                .then(() => {
                    getItems(); // fetch latest todos from backend
                    setMessage("Item deleted successfully");
                    setTimeout(() => setMessage(""), 3000);
                })
                .catch(() => setErrors("Unable to delete item"))
        }
    }

    return <>
        <div className="row p-3 bg-success text-light">
            <h1>Todo Project with MERN Stack</h1>
        </div>

        <div className="row">
            <h3>Add item</h3>
            {message && <p className="text-success">{message}</p>}
            <div className="form-group d-flex gap-2">
                <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} value={title} className="form-control" type="text" />
                <input placeholder="Description" onChange={(e) => setDescription(e.target.value)} value={description} className="form-control" type="text" />
                <button className="btn btn-dark" onClick={handleSubmit}>Submit</button>
            </div>
            {error && <p className="text-danger">{error}</p>}
        </div>

        <div className="row mt-3">
            <h3>Tasks</h3>
            <div className="col-md-6">
                <ul className="list-group">
                    {todos.map(item =>
                        <li key={item._id} className="list-group-item bg-info d-flex justify-content-between align-items-center my-2 ">
                            <div className="d-flex flex-column me-2">
                                {editId !== item._id ? <>
                                    <span className="fw-bold">{item.title}</span>
                                    <span>{item.description}</span>
                                </> : <>
                                    <div className="form-group d-flex gap-2">
                                        <input placeholder="Title" onChange={(e) => setEditTitle(e.target.value)} value={editTitle} className="form-control" type="text" />
                                        <input placeholder="Description" onChange={(e) => setEditDescription(e.target.value)} value={editDescription} className="form-control" type="text" />
                                    </div>
                                </>}
                            </div>

                            <div className="d-flex gap-2">
                                {editId !== item._id ? <button className="btn btn-warning" onClick={() => handleEdit(item)}>Edit</button> : <button className="btn btn-warning" onClick={handleUpdate}>Update</button>}
                                {editId === -1 ? <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button> :
                                    <button className="btn btn-danger" onClick={handleEditCancel}>Cancel</button>}
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    </>
}
