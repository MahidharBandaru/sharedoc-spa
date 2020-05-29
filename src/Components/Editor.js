import React, { Component, useContext } from "react";
import { render } from "react-dom";
import AceEditor from "react-ace";
import { firestore } from "./firebase"
import { UserContext } from "../Providers/UserProvider";
import "ace-builds/src-noconflict/mode-jsx";
import {navigate} from "@reach/router"
import Collaborators from "./Collaborators"
import {Feature} from "./Collaborators"

import {
  Input,
  Stack,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,

} from "@chakra-ui/core";

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/core";


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

  async function haveAccess(docId, Id) {
      const docref = firestore.ref('doc/' + docId + '/collaborators/' + Id);
      let snapshot = await docref.once('value');
      const val = snapshot.val();
      if(!val) return false;
      return true;
}
  async function addCollaborator(docId, uid) {
    const docref = await firestore.ref('doc/' + docId + '/collaborators/' + uid);
    let snapshot = await docref.once('value');
    let ans;
    const val = snapshot.val();
    ans = true;
    if(!val) ans = false;
    if(ans === true) return "Collaborator already exists";
    await firestore.ref('doc/' + docId + '/collaborators/' + uid).set({
      creator: false,
    });
    await firestore.ref('users/' + uid + '/otherDocs/' + docId).set({
      docId
    });


  }



  async function getEmailNameFromUid(uid) {
    // console.log(uid);
    let displayName = "";
    displayName = await firestore.ref(`users/${uid}/displayName`).once('value');
    displayName = displayName.val();
    let email = await firestore.ref(`users/${uid}/email`).once('value');
    email = email.val();
    // let email = await firestore.ref('users/' + uid + '/email').once('value');
    return {displayName, email};
  }

  async function getCreatorDoc(docId) {
    let uid = await firestore.ref('doc/' + docId + '/createdBy').once('value');
    return uid.val();
  }
  async function createNewDoc(uid, title = "") {
    const  docRef = await firestore.ref('doc/');
    const newRef = await docRef.push();
    const docId = newRef.key;


    await newRef.once('value').then(function(snapshot) {
        // // console.log(snapshot.val());
        if(snapshot.val()) {
          return;
        }

          newRef.set({
            title: title,
            text: defaultValue,
            lastChanged: "",
            createdBy: uid,
          });
          firestore.ref('doc/' + docId + '/collaborators/' + uid).set({
            creator: true,
          })
          firestore.ref('users/' + uid + '/myDocs/' + docId).set({
            docId
          });
          // console.log("new doc created");


    });
    // // console.log(docId);
    return docId;
  }

  async function getCollaborators(docId) {
    const docref = await firestore.ref('doc/' + docId + '/collaborators');
    let snapshot = await docref.once('value');
    snapshot = snapshot.val();
    // console.log(snapshot);
    let uid;
    let ans = [];
    for(uid in snapshot) {
      // console.log(uid);
      let user = await firestore.ref('users/' + uid).once('value');
      // console.log(user.val());
      ans.push(user);
    }
    return ans;
  }

class Editor extends Component {
    static contextType = UserContext;
    onLoad() {
        // console.log("i've loaded");
    }
    onChange(newValue) {
        // console.log("change", newValue);
        this.setState({
            value: newValue
        });
        if(this.state.deltas) return;
        const docRef = firestore.ref('doc/' + this.props.docId);
        let updates = {};
        updates['/text'] = newValue;
        updates['/lastChanged'] = this.state.user;
        return docRef.update(updates);

    }

    onSelectionChange(newValue, event) {
        // // console.log("select-change", newValue);
        // // console.log("select-change-event", event);
    }

    onCursorChange(newValue, event) {
        // // console.log("cursor-change", newValue);
        // // console.log("cursor-change-event", event);
    }

    onValidate(annotations) {
        // // console.log("onValidate", annotations);
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
    handleTitleChange = event => {
      this.setState({title: event.target.value});
      const  docRef = firestore.ref('doc/' + this.props.docId);
      let updates = {};
      updates['/title'] = event.target.value;
      return docRef.update(updates);
    };
    onRedirect = async  event => {
      await navigate(`../`);

    }



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
            access: false,
            errorMessage: "",
            loading: true,
            collaborators: [],
            users: [],
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
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.onRedirect = this.onRedirect.bind(this);
    }
    componentDidMount = async () => {
      if(this.props.docId === 'new') {
        // console.log("not going further");
        const docId = await createNewDoc(this.state.user, "");
        await navigate(`${docId}`, { replace: true });

        // return;
      }
      // console.log("out of the if");

        const  docRef = firestore.ref('doc/' + this.props.docId);
        let that = this;
        let uid = this.state.user;
        let docId = this.props.docId;
        const snapshot = await docRef.once('value');
        let access = true;
        if(!snapshot.val()) {

          // this.setState({access: false});
          this.setState({errorMessage: 'File does not exist. Please create a new one or access one that exists.'});
          access = false;
        }
        if(access) {
          access = await haveAccess(docId, uid);
          if(!access) {
            let createdBy = await getCreatorDoc(docId);
            let emailName = await getEmailNameFromUid(createdBy);
            this.setState({errorMessage: `You dont have access to this file. Please ask ${emailName.displayName} for access. Email id is ${emailName.email}`});
          }
        }

        this.setState({loading: false});

        that.setState({deltas: true});
        that.setState({value: (snapshot.val() ? snapshot.val().text : "")});
        that.setState({deltas: false});

        // console.log(this.state.access);
        if(access === false) {
          return;
        }
        this.setState({access: true});


        const editor = this.editorref.current.editor;

        // push changes
        // var deltas = false;
        // editor.on('change', function (obj) {
        //     if(deltas) return;
        //     // console.log(roughSizeOfObject(obj));
        //     const todosRef = firestore.ref('doc/');
        //     var newPostRef = todosRef.push();
        //     newPostRef.set({obj:obj, uid: that.state.user});
        //
        // });

        // pull changes
        // console.log('pull change callback init');



        docRef.on('value', async data => {

            // // console.log(data.val());
            const val = data.val();
            if(!val) {
              return;
            }
            let access = await haveAccess(this.props.docId, this.state.user);
            // console.log(access);
            if(!access) {
              let createdBy = await getCreatorDoc(docId);
              let emailName = await getEmailNameFromUid(createdBy);
              this.setState({errorMessage: `You dont have access to this file. Please ask ${emailName.displayName} for access. Email id is ${emailName.email}`});
              this.setState({access: false});
            }
            let snapshot = val.collaborators;
            // console.log(snapshot);
            let uid;
            let ans = [];
            for(uid in snapshot) {
              // // console.log(uid);
              let user = await firestore.ref('users/' + uid).once('value');
              // // console.log(user.val());
              ans.push(user.val());
            }
            // console.log(ans);
            this.setState({collaborators: ans});



            if(val.lastChanged === this.state.user) return;

            that.setState({deltas: true});
            let newText = val.text;
            that.setState({ value: newText, title: val.title});


            that.setState({deltas: false});
        });
        let usersRef = firestore.ref('users/');
        usersRef.on('value', async data => {
          const val = data.val();
          // console.log(val);
          this.setState({users: val});
          // // console.log(val);

        })
    }
    render() {
      return (this.props.docId === 'new' || this.state.loading) ? (<Stack isInline spacing={4}>
      <Spinner size="xl" />
    </Stack>) : ( (!this.state.access) ? (<div>

      <AlertDialog
        isOpen={true}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Bad Access
          </AlertDialogHeader>

          <AlertDialogBody>
            {this.state.errorMessage}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button variantColor="red" onClick={this.onRedirect} ml={3}>
              Okay
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>) : (<div style={{
        backgroundColor: 'blue',
        width: '100px',
        height: '100px'
      }}>
        <Input
          value={this.state.title}
          onChange={this.handleTitleChange}
          placeholder="Enter filename here"
          size="sm"
        />
        <Collaborators users={this.state.users} docId={this.props.docId}>
        <Stack spacing={1}>
        {this.state.collaborators.map((collaborator, key) => {
          return (<Feature docId={this.props.docId} uid={collaborator.uid} key={key} displayName={collaborator.displayName} email={collaborator.email} profilePic={collaborator.profilePic} />)
        })}
    </Stack>
        </ Collaborators>
        <div>
        <AceEditor
        mode={this.state.mode}
        theme={this.state.theme}
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
    </div>) ) ;
    }
  }

export default Editor;
