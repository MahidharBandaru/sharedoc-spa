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
    await firestore.ref('users/' + uid + '/otherDocs/' + projectId).set({
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

  async function getCreatorDoc(projectId) {
    let uid = await firestore.ref('project/' + projectId + '/createdBy').once('value');
    return uid.val();
  }
  async function createNewDoc(projectId, uid, title = "") {
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

          const projectRef = await firestore.ref('project/' + projectId + '/doc' + docId).set({ docId });

          // firestore.ref('doc/' + projectId + '/collaborators/' + uid).set({
          //   creator: true,
          // })
          // firestore.ref('users/' + uid + '/myDocs/' + projectId).set({
          //   projectId
          // });
          // console.log("new doc created");


    });
    // // console.log(projectId);
    return projectId;
  }
  async function createNewProject()

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
    onChange(newValue) {
        // console.log("change", newValue);
        this.setState({
            value: newValue
        });
        if(this.state.deltas) return;
        const docRef = firestore.ref('project/' + this.props.projectId);
        let updates = {};
        console.log(newValue, this.state.user);
        updates['/text'] = newValue;
        updates['/lastChanged'] = this.state.user;
        return docRef.update(updates);

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

    handleTitleChange = event => {
      this.setState({title: event.target.value});
      const  docRef = firestore.ref('project/' + this.props.projectId);
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
        this.setTheme = this.setTheme.bind(this);
        this.setMode = this.setMode.bind(this);
        this.onChange = this.onChange.bind(this);
        this.editorref = React.createRef();
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.onRedirect = this.onRedirect.bind(this);
    }
    componentDidMount = async () => {
      console.log(this.props.projectId);
        const  docRef = firestore.ref('project/' + this.props.projectId);
        let that = this;
        let uid = this.state.user;
        let projectId = this.props.projectId;
        const snapshot = await docRef.once('value');
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
            let createdBy = await getCreatorDoc(projectId);
            let emailName = await getEmailNameFromUid(createdBy);
            this.setState({errorMessage: `You dont have access to this Project. Please ask ${emailName.displayName} for access. Email id is ${emailName.email}`});
          }
        }

        this.setState({loading: false});

        // console.log(this.state.access);
        if(access === false) {
          return;
        }
        this.setState({access: true});



        docRef.on('value', async data => {

            // // console.log(data.val());
            const val = data.val();
            if(!val) {
              return;
            }
            let access = await haveAccess(this.props.projectId, this.state.user);
            // console.log(access);
            if(!access) {
              let createdBy = await getCreatorDoc(projectId);
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
            let creator = val.createdBy;
            console.log("creator", creator);
            this.setState({creator: creator});
            // console.log(ans);
            this.setState({collaborators: ans});
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

      {if(this.props.children) ? <Input
        value={this.state.title}
        onChange={this.handleTitleChange}
        placeholder="Enter filename here"
        size="lg"
        width="100"
        bg="black"
      /> : <div />}
      <Browser projectId={this.props.projectId} />
        <Collaborators users={this.state.users} projectId={this.props.projectId}>
        <Stack spacing={1}>
        {this.state.collaborators.map((collaborator, key) => {
          // console.log(this.state.creator === this.state.user, collaborator.uid !== this.state.user)
          return (<Feature showRemove={(this.state.creator === this.state.user) && (collaborator.uid !== this.state.user)} projectId={this.props.projectId} uid={collaborator.uid} key={key} displayName={collaborator.displayName} email={collaborator.email} profilePic={collaborator.profilePic} />)
        })}
    </Stack>
        </ Collaborators>
        <div>
        {this.props.children}

    <Footer />

    </div>
  </Box>
    </div>) ) ;
    }
  }

export default Editor;
