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

const defaultValue = ""

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

// routing
// db rules
// flow
// editor remodel
// chat
// todos


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

  async function getUidFromEmail(email) {
    let userref = firestore.ref('users/' + email);
    let ans = userref.once('value').then(function(snapshot) {
      const val = userref.val();
      if(!val) {
        console.log("user doesn't exist");
        return false;
      }
      return val.uid;
    });
    return ans;
  }
  async function haveAccess(docId, Id, email = false) {
    if(email === false) {
      const docref = firestore.ref('doc/' + docId + '/collaborators/' + Id);
      let ans = docref.once('value').then(function(snapshot) {
        const val = snapshot.val();
        if(!val) return false;
        return true;
      });
      return ans;
    }
    let uid = getUidFromEmail(Id);
    if(uid === false) return false;
    const docref = firestore.ref('doc/' + docId + '/collaborators/' + uid);
    let ans = docref.once('value').then(function(snapshot) {
      const val = snapshot.val();
      if(!val) return false;
      return true;
    });
    return ans;
}
  async function addCollaborator(docId, uid) {
    const docref = firestore.ref('doc/' + docId + '/collaborators/' + uid);
    let ans = docref.once('value').then(function(snapshot) {
      const val = snapshot.val();
      if(!val) return false;
      return true;
    });
    if(ans === true) return;
    firestore.ref('doc/' + docId + '/collaborators/' + uid).set({
      creator: false,
    });
    firestore.ref('users/' + uid + '/otherDocs').set({
      docId
    });


  }

  async function createNewDoc(docId, uid, title = "") {
    const  docRef = firestore.ref('doc/' + docId);

    docRef.once('value').then(function(snapshot) {
        // console.log(snapshot.val());
        if(snapshot.val()) {
          return;
        }

          docRef.set({
            title: title,
            text: defaultValue,
            lastChanged: "",
            createdBy: uid,
          });
          firestore.ref('doc/' + docId + '/collaborators/' + uid).set({
            creator: true,
          })
          firestore.ref('users/' + uid + '/myDocs').set({
            docId
          });
          console.log("new doc created");


    });
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
        if(this.state.deltas) return;
        const docRef = firestore.ref('doc/' + this.props.docId);
        let updates = {};
        updates['/text'] = newValue;
        updates['/lastChanged'] = this.state.user;
        // docRef.set({text: newValue, lastChanged: this.state.user});
        return docRef.update(updates);

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
            deltas: false,
            title: "",
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
        const  docRef = firestore.ref('doc/' + this.props.docId);
        let that = this;
        let uid = this.state.user;
        let docId = this.props.docId;
        docRef.once('value').then(function(snapshot) {
            // console.log(snapshot.val());
            if(!snapshot.val()) {

              docRef.set({
                title: "",
                text: defaultValue,
                lastChanged: "",
                createdBy: that.state.user,
              });
              firestore.ref('doc/' + that.props.docId + '/collaborators/' + uid).set({
                creator: true,
              })
              firestore.ref('users/' + uid + '/myDocs').set({
                docId
              });
              console.log("new doc created");
              return;
            }
            that.setState({deltas: true});
            that.setState({value: (snapshot.val() ? snapshot.val().text : "")});
            that.setState({deltas: false});


        });

        const editor = this.editorref.current.editor;

        // push changes
        // var deltas = false;
        // editor.on('change', function (obj) {
        //     if(deltas) return;
        //     console.log(roughSizeOfObject(obj));
        //     const todosRef = firestore.ref('doc/');
        //     var newPostRef = todosRef.push();
        //     newPostRef.set({obj:obj, uid: that.state.user});
        //
        // });

        // pull changes

        docRef.on('value', data => {

            // console.log(data.val());
            const val = data.val();
            if(!val) {
              return;
            }
            if(val.lastChanged === this.state.user) return;

            that.setState({deltas: true});
            let newText = val.text;
            that.setState({ value: newText});
            that.setState({deltas: false});



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
