import React, { useContext, Component } from "react";
import { UserContext, UserProvider } from "../Providers/UserProvider";
import { firestore } from "./firebase";
// import '../tailwind.generated.css';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
class Note extends Component {
    constructor() {
        super()
        this.state = {
            notes: ['hey'],
            newTodo: "",
            todoId: 0,

        }
    }
    componentDidMount = () => {
        // var starCountRef = firestore.database().ref('todos/');
        const todosRef = firestore.ref('todos/');
        todosRef.on('child_added', data => {
            console.log(data.val());
            this.setState({
                notes: this.state.notes.concat(data.val()),
            });
            console.log(this.state.notes);
        });
    }
    componentWillUnmount = () => {
        const todosRef = firestore.ref('todos/');
        todosRef.off(); 
    }
    onChangeHandler = (event) => {
        const { name, value } = event.currentTarget;

        if (name === 'newTodo') {
            this.setState({ newTodo: value });
        }
    };

    writeUserData() {
        const todosRef = firestore.ref('todos/');
        var newPostRef = todosRef.push();
        newPostRef.set(this.state.newTodo);

    }

    onSubmitHandle = (event) => {
        this.writeUserData();

    };

    render() {
        return (
            <div>
                <form className="">
                    <label htmlFor="userEmail" className="block">
                        Email:
                    </label>
                    <input
                        type="email"
                        className="my-1 p-1 w-full"
                        name="newTodo"
                        value={this.state.newTodo}
                        placeholder="E.g: faruq123@gmail.com"
                        id="userEmail"
                        onChange={(event) => this.onChangeHandler(event)}
                    />
                    <button className="bg-green-400 hover:bg-green-500 w-full py-2 text-white" onClick={(event) => { this.onSubmitHandle(event) }}>
                        Sign in
                    </button>
                </form>
                <ol>
                    {this.state.notes.map((note, index) => (<li key={index}>{note}</li>))}
                </ol>
            </div>
        )
    }
}
export default Note;