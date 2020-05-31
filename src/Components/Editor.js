import React, { Component, useContext } from "react";
import { render } from "react-dom";
import AceEditor from "react-ace";
import { firestore } from "./firebase"
import { UserContext } from "../Providers/UserProvider";
import "ace-builds/src-noconflict/mode-jsx";
import {navigate} from "@reach/router"
import Collaborators from "./Collaborators"
import {Feature} from "./Collaborators"
import Footer from "./Footer"
import Browser, {FileLink} from "./Browser"

import {
  Box,
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
  Flex,
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


async function haveAccess(projectId, Id) {
  console.log(projectId, Id);
    const docref = firestore.ref('project/' + projectId + '/collaborators/' + Id);
    let snapshot = await docref.once('value');
    const val = snapshot.val();
    console.log(val);
    if(!val) return false;
    return true;
}
async function addCollaborator(projectId, uid) {
  const docref = await firestore.ref('project/' + projectId + '/collaborators/' + uid);
  let snapshot = await docref.once('value');
  let ans;
  const val = snapshot.val();
  ans = true;
  if(!val) ans = false;
  if(ans === true) return "Collaborator already exists";
  await firestore.ref('project/' + projectId + '/collaborators/' + uid).set({
    creator: false,
  });
  await firestore.ref('users/' + uid + '/otherProjects/' + projectId).set({
    projectId
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

  async function getCreatorProject(projectId) {
    let uid = await firestore.ref('project/' + projectId + '/createdBy').once('value');
    return uid.val();
  }

  async function getCollaborators(projectId) {
    const docref = await firestore.ref('project/' + projectId + '/collaborators');
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
        console.log(newValue, this.state.user);
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
      console.log("title change");
      this.setState({title: event.target.value});
      console.log(event.target.value);
      const  docRef = firestore.ref('project/' + this.props.projectId);
      let updates = {};
      updates['/title'] = event.target.value;
      return docRef.update(updates);
    };
    handleFileNameChange = event => {
      console.log("filename change");

      this.setState({fileName: event.target.value});
      console.log(event.target.value);
      const  docRef = firestore.ref('doc/' + this.props.docId);
      let updates = {};
      updates['/title'] = event.target.value;
      return docRef.update(updates);
    };
    onRedirect = async  event => {
      await navigate(`/`);

    }
    onNewFile = async event => {
      navigate(`/editor/${this.props.projectId}/new`);
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
            fileName: "",
            access: false,
            errorMessage: "",
            loading: true,
            collaborators: [],
            users: [],
            docsData: [],

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
        this.handleFileNameChange = this.handleFileNameChange.bind(this);
        this.onRedirect = this.onRedirect.bind(this);
        this.onNewFile = this.onNewFile.bind(this);
    }
    componentDidMount = async () => {
      // if(this.props.docId === 'new') {
      //   // console.log("not going further");
      //   const docId = await createNewDoc(this.state.user, "");
      //   await navigate(`${docId}`, { replace: true });
      //
      //   return;
      // }
      // console.log("out of the if");
      console.log(this.props.docId);
      const  projectRef = firestore.ref('project/' + this.props.projectId);
      let that = this;
      let uid = this.state.user;
      let projectId = this.props.projectId;
      const snapshot = await projectRef.once('value');
      console.log(snapshot.val());
      let access = true;
      if(!snapshot.val()) {

        // this.setState({access: false});
        this.setState({errorMessage: 'Project does not exist. Please create a new one or access one that exists.'});
        access = false;
      }
      if(access) {
        access = await haveAccess(projectId, uid);
        if(!access) {
          let createdBy = await getCreatorProject(projectId);
          let emailName = await getEmailNameFromUid(createdBy);
          console.log(`You dont have access to this Project. Please ask ${emailName.displayName} for access. Email id is ${emailName.email}`);
          this.setState({errorMessage: `You dont have access to this Project. Please ask ${emailName.displayName} for access. Email id is ${emailName.email}`});
        }
      }
      // console.log(this.state.access);



      // this.setState({loading: false});
      console.log("debug", this.props.docId);
      if(this.props.docId) {
        const  docRef = firestore.ref('doc/' + this.props.docId);
        let that = this;
        let uid = this.state.user;
        let docId = this.props.docId;
        const snapshot = await docRef.once('value');
        console.log(snapshot.val());
        that.setState({deltas: true});
        that.setState({value: (snapshot.val() ? snapshot.val().text : "")});
        that.setState({fileName: snapshot.val() ? snapshot.val().title : ""});
        that.setState({deltas: false});
        // const editor = this.editorref.current.editor;

      }

      this.setState({loading: false});

      if(access === false) {
        console.log("returning");
        return;
      }
      this.setState({access: true});









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
        projectRef.on('value', async data => {

            // // console.log(data.val());
            const val = data.val();
            if(!val) {
              return;
            }
            access = await haveAccess(this.props.projectId, this.state.user);
            if(!access) {
              let createdBy = await getCreatorProject(projectId);
              let emailName = await getEmailNameFromUid(createdBy);
              console.log(`You dont have access to this Project. Please ask ${emailName.displayName} for access. Email id is ${emailName.email}`);
              this.setState({errorMessage: `You dont have access to this Project. Please ask ${emailName.displayName} for access. Email id is ${emailName.email}`});
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
            snapshot = val.docs;
            let docId;
            let docsData = [];
            for(docId in snapshot) {
              let doc = await firestore.ref('doc/' + docId).once('value');
              doc = doc.val();
              doc.url = (docId);
              docsData.push(doc);
            }
            let creator = val.createdBy;
            console.log("creator", creator);
            this.setState({creator: creator});
            that.setState({title: val.title ? val.title : ""});
            // console.log(ans);
            this.setState({collaborators: ans});
            this.setState({docsData: docsData});
        });
        let usersRef = firestore.ref('users/');
        usersRef.on('value', async data => {
          const val = data.val();
          // console.log(val);
          this.setState({users: val});
          // // console.log(val);

        })

        if(this.props.docId) {
          const  docRef = firestore.ref('doc/' + this.props.docId);
          docRef.on('value', async data => {

              // // console.log(data.val());
              const val = data.val();
              if(!val) {
                return;
              }
              let docCreator = val.createdBy;
              console.log("docCreator", docCreator);
              this.setState({docCreator});
              // let docId = this.props.docId;
              // let docData = this.state.docData;
              // docData.docId.title =  val.title;
              if(val.title) {
                this.setState({fileName: val.title});
                // this.setState(docData);
              }

              let newText = val.text;
              console.log(newText);

              if(val.lastChanged === this.state.user) return;

              that.setState({deltas: true});

              that.setState({ value: newText, title: val.title});


              that.setState({deltas: false});
          });
        }

    }
    render() {
      console.log(this.props.docId, this.props.projectId);
      return (this.state.loading) ? (<Stack isInline spacing={4}>
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
    </div>) : (<div>
      <Box bg="black" w="100%" p={4} color="white">
      <Flex bg="white" w="20%">
      </Flex>
      <Stack>
        <Input
          value={this.state.title}
          onChange={this.handleTitleChange}
          placeholder="Enter Project Name Here"
          size="lg"
          width="100"
          bg="black"
        />
        {(this.props.docId) ? <Input
          value={this.state.fileName}
          onChange={this.handleFileNameChange}
          placeholder="Enter File Name here"
          size="lg"
          width="100"
          bg="black"
        /> : <div></div>}

        </Stack>
        <Collaborators users={this.state.users} docId={this.props.docId} projectId={this.props.projectId}>
        <Stack spacing={1}>
        {this.state.collaborators.map((collaborator, key) => {
          // console.log(this.state.creator === this.state.user, collaborator.uid !== this.state.user)
          console.log(this.props.projectId);
          return (<Feature showRemove={(this.state.creator === this.state.user) && (collaborator.uid !== this.state.user)} projectId={this.props.projectId} docId={this.props.docId} uid={collaborator.uid} key={key} displayName={collaborator.displayName} email={collaborator.email} profilePic={collaborator.profilePic} />)
        })}
    </Stack>
        </ Collaborators>
        <Button variantColor="teal" onClick={this.onNewFile}>New File</Button>
        <Browser>
          {this.state.docsData.map((doc) => (<FileLink link={`/editor/${this.props.projectId}/${doc.url}/`}>{doc.title.length !== 0 ? doc.title : doc.url}</FileLink>))}
        </Browser>

        {
          ((this.props.docId) ? (<div>
        <AceEditor
        width="100%"
        // height="1000%"
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

    </div>) : (<div>  </div>))}

  </Box>
    </div>) ) ;
    }
  }

export default Editor;
