import React, { Component, useContext } from "react";
import { render } from "react-dom";
import AceEditor from "react-ace";
import { firestore } from "./firebase"
import { UserContext } from "../Providers/UserProvider";
import "ace-builds/src-noconflict/mode-jsx";
const Automerge = require('automerge');

const languages = [
    "javascript",
    "java",
    "python",
    "xml",
    "ruby",
    "sass",
    "markdown",
    "mysql",
    "json",
    "html",
    "handlebars",
    "golang",
    "csharp",
    "elixir",
    "typescript",
    "css"
];

const themes = [
    "monokai",
    "github",
    "tomorrow",
    "kuroir",
    "twilight",
    "xcode",
    "textmate",
    "solarized_dark",
    "solarized_light",
    "terminal"
];

languages.forEach(lang => {
    require(`ace-builds/src-noconflict/mode-${lang}`);
    require(`ace-builds/src-noconflict/snippets/${lang}`);
});

themes.forEach(theme => require(`ace-builds/src-noconflict/theme-${theme}`));
/*eslint-disable no-alert, no-console */
require("ace-builds/src-min-noconflict/ext-searchbox");
require("ace-builds/src-min-noconflict/ext-language_tools");

const defaultValue = `function onLoad(editor) {
  console.log("i've loaded");
}`;

function roughSizeOfObject(object) {

    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
        var value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        }
        else if (typeof value === 'string') {
            bytes += value.length * 2;
        }
        else if (typeof value === 'number') {
            bytes += 8;
        }
        else if
            (
            typeof value === 'object'
            && objectList.indexOf(value) === -1
        ) {
            objectList.push(value);

            for (var i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}

const applyDelta = (obj, editor) => {
    // let obj = JSON.parse (event.data);
    if (obj.action === 'insert') {
        let pos = editor.getCursorPosition ();
        // silent = true;
        if (obj.lines[0] === '') obj.lines[0] = '\n';
        editor.session.insert (obj.start, obj.lines[0]);
        editor.selection.moveToPosition (pos)
        // silent = false;
    } else if (obj.action === 'remove') {
        let pos = editor.getCursorPosition ();
        // silent = true;
        editor.session.doc.remove ({start : obj.start, end : obj.end})
        // silent = false;
        editor.selection.moveToPosition (pos);
    }
}


function getMethods(obj) {
    var result = [];
    for (var id in obj) {
      try {
        if (typeof(obj[id]) == "function") {
          result.push(id + ": " + obj[id].toString());
        }
      } catch (err) {
        result.push(id + ": inaccessible");
      }
    }
    return result;
  }

class Editor extends Component {
    static contextType = UserContext;
    onLoad() {
        console.log("i've loaded");
    }
    onChange(newValue) {
        console.log("change", newValue);
        this.setState({
            value: newValue
        });
        // let doc = Automerge.change(this.state.doc, `change by ${this.state.user}`, (currDoc) => {
        //     currDoc.text = new Automerge.Text(newValue);
        // });
        // this.setState({ 
        //     doc: doc
        // });

    }

    onSelectionChange(newValue, event) {
        // console.log("select-change", newValue);
        // console.log("select-change-event", event);
    }

    onCursorChange(newValue, event) {
        // console.log("cursor-change", newValue);
        // console.log("cursor-change-event", event);
    }

    onValidate(annotations) {
        // console.log("onValidate", annotations);
    }

    setPlaceholder(e) {
        this.setState({
            placeholder: e.target.value
        });
    }
    setTheme(e) {
        this.setState({
            theme: e.target.value
        });
    }
    setMode(e) {
        this.setState({
            mode: e.target.value
        });
    }
    setBoolean(name, value) {
        this.setState({
            [name]: value
        });
    }
    setFontSize(e) {
        this.setState({
            fontSize: parseInt(e.target.value, 10)
        });
    }
    
    onChangeHandler = (event) => {
        const { name, value } = event.currentTarget;

        if (name === 'newTodo') {
            this.setState({ newTodo: value });
        }
    };
    constructor(props) {
        super(props);
        console.log(props.user);
        this.state = {
            value: defaultValue,
            placeholder: "Placeholder Text",
            theme: "monokai",
            mode: "javascript",
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            fontSize: 14,
            showGutter: true,
            showPrintMargin: true,
            highlightActiveLine: true,
            enableSnippets: false,
            showLineNumbers: true,
            newTodo: "",
            user: props.user,
            initialRender: false,
            // doc:
        };
        this.setPlaceholder = this.setPlaceholder.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.setMode = this.setMode.bind(this);
        this.onChange = this.onChange.bind(this);
        this.setFontSize = this.setFontSize.bind(this);
        this.setBoolean = this.setBoolean.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.editorref = React.createRef();
    }
    componentDidMount = () => {
        const  changesRef = firestore.ref('changes/');
        let that = this;        
        changesRef.once('value').then(function(snapshot) {
            console.log(snapshot.val());
            that.setState({initialRender: true});

        });

        const editor = this.editorref.current.editor;

        // push changes
        var deltas = false;
        editor.on('change', function (obj) {
            if(deltas) return;
            console.log(roughSizeOfObject(obj));
            const todosRef = firestore.ref('changes/');
            var newPostRef = todosRef.push();
            newPostRef.set({obj:obj, uid: that.state.user});

        });

        // pull changes
        
        changesRef.on('child_added', data => {
            
            // console.log(data.val());
            const val = data.val();
            if(val.uid === this.state.user) return;

            deltas = true;
            let obj = val.obj;
            editor.getSession().getDocument().applyDeltas([val.obj]);
            deltas = false;


        });
    }
    render() {
        return (
            <div>
                
                <AceEditor
                mode="java"
                theme="github"
                onChange={this.onChange}
                value={this.state.value}
                ref={this.editorref}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true
                }}
            />
            </div>
            
        );

    }
}

export default Editor;